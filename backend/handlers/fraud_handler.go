package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FraudHandler struct{}

func NewFraudHandler() *FraudHandler {
	return &FraudHandler{}
}

func notifyFraudCaseToTelegram(fc models.FraudCase) {
	if services.GlobalTelegramService == nil {
		return
	}
	alertMsg := fmt.Sprintf(
		"🚨 <b>[FRAUD ALERT BIONET v6] INDIKASI KECURANGAN TERDETEKSI!</b>\n\n"+
			"⚠️ Aturan: <b>%s</b>\n"+
			"🔴 Tingkat Risiko: <b>%s</b>\n"+
			"📌 Judul: <b>%s</b>\n"+
			"📝 Keterangan: %s\n"+
			"🕐 Waktu: <b>%s</b>\n\n"+
			"<i>Buka Tab Admin: Fraud Control &amp; Risiko untuk tindakan mitigasi.</i>",
		fc.RuleKey,
		strings.ToUpper(fc.RiskLevel),
		fc.Title,
		fc.Description,
		time.Now().Format("2006-01-02 15:04:05 WIB"),
	)
	_ = services.GlobalTelegramService.NotifyAdmin(alertMsg)
}

// RunFraudDetectionScan memindai seluruh database untuk mendeteksi indikasi kecurangan / anomali
func runFraudDetectionScan(db *gorm.DB) {
	if db == nil {
		return
	}

	// ---------------------------------------------------------
	// ATURAN 1: Duplikasi Nomor Rekening Bank (DUPLICATE_BANK)
	// ---------------------------------------------------------
	type DuplicateBankResult struct {
		AccountNumber string
		BankName      string
		UserCount     int
	}
	var dupBanks []DuplicateBankResult
	db.Table("user_banks").
		Select("account_number, bank_name, COUNT(DISTINCT user_id) as user_count").
		Where("deleted_at IS NULL AND account_number != ''").
		Group("account_number, bank_name").
		Having("COUNT(DISTINCT user_id) > 1").
		Scan(&dupBanks)

	for _, dbank := range dupBanks {
		var banks []models.UserBank
		db.Preload("User").Where("account_number = ? AND deleted_at IS NULL", dbank.AccountNumber).Find(&banks)
		if len(banks) < 2 {
			continue
		}

		userList := ""
		primaryUserID := banks[0].UserID
		for idx, b := range banks {
			if b.User != nil {
				if idx > 0 {
					userList += ", "
				}
				userList += "@" + b.User.Username
			}
		}

		riskLevel := "medium"
		if dbank.UserCount >= 3 {
			riskLevel = "high"
		}

		title := fmt.Sprintf("Duplikasi Rekening: %s (%s)", dbank.AccountNumber, dbank.BankName)
		desc := fmt.Sprintf("Nomor rekening %s (%s) terdaftar pada %d akun berbeda: %s. Indikasi akun ganda / pencairan terpusat.", dbank.AccountNumber, dbank.BankName, dbank.UserCount, userList)

		// Cek apakah sudah ada open case untuk nomor rekening ini
		var existing models.FraudCase
		if err := db.Where("rule_key = ? AND details_json LIKE ?", "DUPLICATE_BANK", "%"+dbank.AccountNumber+"%").First(&existing).Error; err != nil {
			details, _ := json.Marshal(gin.H{
				"account_number": dbank.AccountNumber,
				"bank_name":      dbank.BankName,
				"users":          userList,
				"count":          dbank.UserCount,
			})
			newCase := models.FraudCase{
				UserID:      primaryUserID,
				RuleKey:     "DUPLICATE_BANK",
				RiskLevel:   riskLevel,
				Title:       title,
				Description: desc,
				DetailsJSON: string(details),
				Status:      "open",
			}
			db.Create(&newCase)
			notifyFraudCaseToTelegram(newCase)
		}
	}

	// ---------------------------------------------------------
	// ATURAN 2: Duplikasi NIK KTP (DUPLICATE_KTP)
	// ---------------------------------------------------------
	type DuplicateKTPResult struct {
		KTP       string
		UserCount int
	}
	var dupKTPs []DuplicateKTPResult
	db.Table("users").
		Select("ktp, COUNT(*) as user_count").
		Where("deleted_at IS NULL AND ktp IS NOT NULL AND ktp != ''").
		Group("ktp").
		Having("COUNT(*) > 1").
		Scan(&dupKTPs)

	for _, dktp := range dupKTPs {
		var users []models.User
		db.Where("ktp = ? AND deleted_at IS NULL", dktp.KTP).Find(&users)
		if len(users) < 2 {
			continue
		}

		userList := ""
		primaryUserID := users[0].ID
		for idx, u := range users {
			if idx > 0 {
				userList += ", "
			}
			userList += "@" + u.Username
		}

		riskLevel := "medium"
		if dktp.UserCount >= 3 {
			riskLevel = "high"
		}

		title := fmt.Sprintf("Duplikasi NIK KTP: %s", dktp.KTP)
		desc := fmt.Sprintf("Nomor NIK KTP %s digunakan oleh %d akun berbeda: %s. Indikasi pendaftaran massal identitas ganda.", dktp.KTP, dktp.UserCount, userList)

		var existing models.FraudCase
		if err := db.Where("rule_key = ? AND details_json LIKE ?", "DUPLICATE_KTP", "%"+dktp.KTP+"%").First(&existing).Error; err != nil {
			details, _ := json.Marshal(gin.H{
				"ktp":   dktp.KTP,
				"users": userList,
				"count": dktp.UserCount,
			})
			newCase := models.FraudCase{
				UserID:      primaryUserID,
				RuleKey:     "DUPLICATE_KTP",
				RiskLevel:   riskLevel,
				Title:       title,
				Description: desc,
				DetailsJSON: string(details),
				Status:      "open",
			}
			db.Create(&newCase)
			notifyFraudCaseToTelegram(newCase)
		}
	}

	// ---------------------------------------------------------
	// ATURAN 3: Anomali Penarikan Dana / Spike Withdrawal
	// ---------------------------------------------------------
	// 3A: Penarikan bernilai sangat besar (>= Rp 5.000.000)
	var largeWDs []models.Withdrawal
	db.Preload("User").Where("amount >= 5000000").Order("created_at DESC").Limit(20).Find(&largeWDs)
	for _, wd := range largeWDs {
		if wd.User == nil {
			continue
		}
		var existing models.FraudCase
		if err := db.Where("rule_key = ? AND details_json LIKE ?", "WITHDRAWAL_SPIKE", "%"+wd.ID+"%").First(&existing).Error; err != nil {
			details, _ := json.Marshal(gin.H{
				"withdrawal_id": wd.ID,
				"amount":        wd.Amount,
				"username":      wd.User.Username,
				"created_at":    wd.CreatedAt,
			})
			newCase := models.FraudCase{
				UserID:      wd.UserID,
				RuleKey:     "WITHDRAWAL_SPIKE",
				RiskLevel:   "high",
				Title:       fmt.Sprintf("Penarikan Dana Besar: Rp %.0f (@%s)", wd.Amount, wd.User.Username),
				Description: fmt.Sprintf("Mitra @%s mengajukan penarikan dana tunggal dalam jumlah besar senilai Rp %.0f. Periksa audit buku besar sebelum persetujuan transfer.", wd.User.Username, wd.Amount),
				DetailsJSON: string(details),
				Status:      "open",
			}
			db.Create(&newCase)
			notifyFraudCaseToTelegram(newCase)
		}
	}

	// 3B: Akun baru (< 72 jam) langsung menarik dana >= Rp 1.000.000
	threeDaysAgo := time.Now().Add(-72 * time.Hour)
	var fastWDs []models.Withdrawal
	db.Joins("JOIN users ON users.id = withdrawals.user_id").
		Preload("User").
		Where("users.created_at >= ? AND withdrawals.amount >= 1000000", threeDaysAgo).
		Find(&fastWDs)

	for _, fwd := range fastWDs {
		if fwd.User == nil {
			continue
		}
		var existing models.FraudCase
		if err := db.Where("rule_key = ? AND details_json LIKE ?", "NEW_ACCOUNT_DRAIN", "%"+fwd.ID+"%").First(&existing).Error; err != nil {
			details, _ := json.Marshal(gin.H{
				"withdrawal_id": fwd.ID,
				"amount":        fwd.Amount,
				"username":      fwd.User.Username,
				"joined_at":     fwd.User.CreatedAt,
			})
			newCase := models.FraudCase{
				UserID:      fwd.UserID,
				RuleKey:     "NEW_ACCOUNT_DRAIN",
				RiskLevel:   "high",
				Title:       fmt.Sprintf("Pencairan Cepat Akun Baru: Rp %.0f (@%s)", fwd.Amount, fwd.User.Username),
				Description: fmt.Sprintf("Akun @%s baru bergabung kurang dari 3 hari tetapi telah mengajukan pencairan dana senilai Rp %.0f. Periksa asal perolehan bonus sponsor atau mutasi saldo.", fwd.User.Username, fwd.Amount),
				DetailsJSON: string(details),
				Status:      "open",
			}
			db.Create(&newCase)
			notifyFraudCaseToTelegram(newCase)
		}
	}
}

// GetFraudOverview mengembalikan statistik dan daftar kasus indikasi fraud aktif
func (h *FraudHandler) GetFraudOverview(c *gin.Context) {
	db := config.DB

	// Jalankan pemindaian otomatis
	runFraudDetectionScan(db)

	riskFilter := c.Query("risk_level")
	statusFilter := c.Query("status")
	search := c.Query("search")

	query := db.Model(&models.FraudCase{}).Preload("User")

	if riskFilter != "" {
		query = query.Where("risk_level = ?", riskFilter)
	}
	if statusFilter != "" {
		query = query.Where("status = ?", statusFilter)
	}
	if search != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var cases []models.FraudCase
	query.Order("created_at DESC").Find(&cases)

	var totalCases int64
	var highRisk int64
	var mediumRisk int64
	var lowRisk int64
	var openCases int64
	var resolvedCount int64

	db.Model(&models.FraudCase{}).Count(&totalCases)
	db.Model(&models.FraudCase{}).Where("risk_level = ?", "high").Count(&highRisk)
	db.Model(&models.FraudCase{}).Where("risk_level = ?", "medium").Count(&mediumRisk)
	db.Model(&models.FraudCase{}).Where("risk_level = ?", "low").Count(&lowRisk)
	db.Model(&models.FraudCase{}).Where("status = ?", "open").Count(&openCases)
	db.Model(&models.FraudCase{}).Where("status = ?", "resolved").Count(&resolvedCount)

	var frozenCount int64
	db.Model(&models.User{}).Where("status = ?", "suspended").Count(&frozenCount)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": models.FraudOverviewDTO{
			TotalCases:       totalCases,
			HighRiskCount:    highRisk,
			MediumRiskCount:  mediumRisk,
			LowRiskCount:     lowRisk,
			OpenCasesCount:   openCases,
			ResolvedCount:    resolvedCount,
			FrozenUsersCount: frozenCount,
			Cases:            cases,
		},
	})
}

// RunScan menjalankan pemindaian manual atas permintaan admin
func (h *FraudHandler) RunScan(c *gin.Context) {
	db := config.DB
	runFraudDetectionScan(db)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Pemindaian indikasi fraud berhasil diselesaikan.",
	})
}

// FreezeUserCase membekukan akun user yang terkait dengan kasus fraud
func (h *FraudHandler) FreezeUserCase(c *gin.Context) {
	caseID := c.Param("id")
	adminID := c.GetString("user_id")

	db := config.DB
	var fcase models.FraudCase
	if err := db.Preload("User").Where("id = ?", caseID).First(&fcase).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kasus fraud tidak ditemukan"})
		return
	}

	if fcase.UserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Tidak ada pengguna terkait kasus ini"})
		return
	}

	var user models.User
	if err := db.Where("id = ?", fcase.UserID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pengguna tidak ditemukan"})
		return
	}

	oldStatus := user.Status
	// Freeze akun
	db.Model(&user).Update("status", "suspended")

	// Update fraud case
	now := time.Now()
	db.Model(&fcase).Updates(map[string]interface{}{
		"action_taken": "FROZEN",
		"status":       "investigating",
		"resolved_by":  adminID,
		"resolved_at":  now,
	})

	if services.GlobalTelegramService != nil {
		freezeMsg := fmt.Sprintf(
			"🔒 <b>[FRAUD MITIGATION] AKUN BERHASIL DIBEKUKAN</b>\n\n"+
				"👤 Mitra: <b>@%s (%s)</b>\n"+
				"⚖️ Terkait Kasus: <b>%s</b>\n"+
				"👮 Tindakan: <b>Pembekuan Sementara (Suspended)</b>\n"+
				"🕐 Waktu: <b>%s</b>",
			user.Username,
			user.FullName,
			fcase.Title,
			now.Format("2006-01-02 15:04:05 WIB"),
		)
		_ = services.GlobalTelegramService.NotifyAdmin(freezeMsg)
	}

	// Catat audit log
	services.RecordAudit(c, adminID, "FRAUD_FREEZE", "users", user.ID, gin.H{"status": oldStatus}, gin.H{"status": "suspended", "case_id": caseID, "rule": fcase.RuleKey})

	// Notifikasi transaksional ke user
	_ = CreateNotification(
		user.ID,
		"Akun Anda Dibekukan Sementara",
		fmt.Sprintf("Akun Anda dibekukan sementara untuk verifikasi keamanan terkait indikasi: %s. Silakan hubungi tim Customer Service resmi Bionet.", fcase.Title),
		"security",
		"/chat",
	)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Akun @%s berhasil dibekukan sementara (Status: Suspended)", user.Username),
	})
}

// ResolveCase menyelesaikan atau menandai kasus fraud sebagai aman / terselesaikan
func (h *FraudHandler) ResolveCase(c *gin.Context) {
	caseID := c.Param("id")
	adminID := c.GetString("user_id")

	var req struct {
		ActionTaken string `json:"action_taken"` // CLEARED, WARNED, DISMISSED
		Notes       string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		req.ActionTaken = "CLEARED"
	}

	db := config.DB
	var fcase models.FraudCase
	if err := db.Where("id = ?", caseID).First(&fcase).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Kasus fraud tidak ditemukan"})
		return
	}

	now := time.Now()
	action := req.ActionTaken
	if action == "" {
		action = "CLEARED"
	}

	updates := map[string]interface{}{
		"status":       "resolved",
		"action_taken": action,
		"resolved_by":  adminID,
		"resolved_at":  now,
	}
	if req.Notes != "" {
		updates["description"] = fcase.Description + " [Catatan Admin: " + req.Notes + "]"
	}

	db.Model(&fcase).Updates(updates)

	// Catat audit log
	services.RecordAudit(c, adminID, "FRAUD_RESOLVE", "fraud_cases", caseID, gin.H{"status": fcase.Status}, updates)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kasus fraud telah ditandai terselesaikan.",
	})
}
