package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/interfaces"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type DashboardHandler struct {
	dashboardService interfaces.DashboardService
}

func NewDashboardHandler(dashboardService interfaces.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	stats, err := h.dashboardService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil data statistik", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": stats})
}

func (h *DashboardHandler) GetGenealogy(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	target := c.Query("username")
	if target == "" {
		target = c.Query("user_id")
	}

	tree, err := h.dashboardService.GetGenealogy(userID, target)
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(err.Error(), "akses ditolak") {
			status = http.StatusForbidden
		} else if strings.Contains(err.Error(), "tidak ditemukan") {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": tree})
}

func (h *DashboardHandler) GetDirectReferrals(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	referrals, err := h.dashboardService.GetDirectReferrals(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil daftar sponsor", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": referrals})
}

func (h *DashboardHandler) GetWalletTransactions(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	txs, err := h.dashboardService.GetWalletTransactions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil mutasi wallet", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": txs})
}

func (h *DashboardHandler) GetUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	bank, err := h.dashboardService.GetUserBank(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "success", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": bank})
}

func (h *DashboardHandler) SaveUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.UserBank
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format data rekening tidak valid", "error": err.Error()})
		return
	}

	bank, err := h.dashboardService.SaveUserBank(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan data rekening", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Data rekening berhasil disimpan", "data": bank})
}

// GetUserBanks mengambil seluruh daftar rekening bank mitra (multi-bank)
func (h *DashboardHandler) GetUserBanks(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var banks []models.UserBank
	if err := config.DB.Where("user_id = ?", userID).Order("is_primary DESC, created_at DESC").Find(&banks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat daftar rekening"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": banks})
}

// AddUserBank menambahkan rekening bank baru
func (h *DashboardHandler) AddUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.UserBank
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format data rekening tidak valid"})
		return
	}

	var count int64
	config.DB.Model(&models.UserBank{}).Where("user_id = ?", userID).Count(&count)
	if count == 0 {
		req.IsPrimary = true
	} else if req.IsPrimary {
		config.DB.Model(&models.UserBank{}).Where("user_id = ?", userID).Update("is_primary", false)
	}

	req.ID = uuid.New().String()
	req.UserID = userID

	if err := config.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menambahkan rekening baru"})
		return
	}

	_ = CreateNotification(
		userID,
		"Rekening Bank Baru Ditambahkan",
		fmt.Sprintf("Rekening %s (%s a.n %s) berhasil tersimpan di profil Anda.", req.BankName, req.AccountNumber, req.AccountName),
		"bank",
		"/bank",
	)

	// Record Audit Log
	services.RecordAudit(c, userID, "CREATE", "user_banks", req.ID, nil, req)

	c.JSON(http.StatusCreated, gin.H{"status": "success", "message": "Rekening bank berhasil ditambahkan", "data": req})
}

// SetDefaultBank menjadikan rekening terpilih sebagai rekening utama (default)
func (h *DashboardHandler) SetDefaultBank(c *gin.Context) {
	userID := c.GetString("user_id")
	bankID := c.Param("id")
	if userID == "" || bankID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter tidak valid"})
		return
	}

	var bank models.UserBank
	if err := config.DB.Where("id = ? AND user_id = ?", bankID, userID).First(&bank).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Rekening tidak ditemukan"})
		return
	}

	// Unset primary for all other banks of this user
	config.DB.Model(&models.UserBank{}).Where("user_id = ?", userID).Update("is_primary", false)

	// Set target as default
	if err := config.DB.Model(&models.UserBank{}).Where("id = ?", bankID).Update("is_primary", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menjadikan rekening default"})
		return
	}

	_ = CreateNotification(
		userID,
		"Rekening Utama Payout Diperbarui",
		fmt.Sprintf("Rekening %s (%s a.n %s) telah diset sebagai rekening utama untuk transfer bonus & penarikan dana.", bank.BankName, bank.AccountNumber, bank.AccountName),
		"bank",
		"/bank",
	)

	// Record Audit Log
	services.RecordAudit(c, userID, "UPDATE", "user_banks", bankID, map[string]bool{"is_primary": false}, map[string]bool{"is_primary": true})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Rekening berhasil dijadikan rekening utama (default)"})
}

// DeleteUserBank menghapus rekening bank mitra (Soft Delete)
func (h *DashboardHandler) DeleteUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	bankID := c.Param("id")

	var bank models.UserBank
	if err := config.DB.Where("id = ? AND user_id = ?", bankID, userID).First(&bank).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Rekening tidak ditemukan"})
		return
	}

	wasPrimary := bank.IsPrimary
	if err := config.DB.Delete(&bank).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menghapus rekening"})
		return
	}

	// Record Audit Log for Soft Delete
	services.RecordAudit(c, userID, "DELETE", "user_banks", bankID, bank, nil)

	if wasPrimary {
		var nextBank models.UserBank
		if err := config.DB.Where("user_id = ?", userID).First(&nextBank).Error; err == nil {
			config.DB.Model(&models.UserBank{}).Where("id = ?", nextBank.ID).Update("is_primary", true)
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Rekening berhasil dihapus"})
}

// ----------------------------------------------------
// WITHDRAWALS
// ----------------------------------------------------

func (h *DashboardHandler) RequestWithdrawal(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.WithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Nominal penarikan tidak valid", "error": err.Error()})
		return
	}

	wd, err := h.dashboardService.RequestWithdrawal(userID, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// 1. Notifikasi untuk member pengaju
	_ = CreateNotification(
		userID,
		"Pengajuan Penarikan Saldo Berhasil",
		fmt.Sprintf("Pengajuan penarikan dana sebesar Rp %.0f telah diterima dan menunggu verifikasi.", req.Amount),
		"transaction",
		"/withdrawal",
	)

	// 2. Notifikasi untuk Tim Admin & Keuangan
	var user models.User
	if config.DB != nil {
		config.DB.Where("id = ?", userID).First(&user)
	}
	NotifyAdminsAndFinance(
		"Pengajuan Withdrawal Baru",
		fmt.Sprintf("Mitra @%s mengajukan penarikan dana sebesar Rp %.0f", user.Username, req.Amount),
		"transaction",
		"/admin-withdrawals",
	)

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Permintaan penarikan dana berhasil diajukan", "data": wd})
}

func (h *DashboardHandler) GetWithdrawals(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	wds, err := h.dashboardService.GetWithdrawals(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil riwayat penarikan dana", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": wds})
}

// ----------------------------------------------------
// PINS & STOKIS
// ----------------------------------------------------

func (h *DashboardHandler) GetMyPins(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	pins, err := h.dashboardService.GetMyPins(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat inventori PIN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": pins})
}

func (h *DashboardHandler) GetPinPackages(c *gin.Context) {
	packages, err := h.dashboardService.GetPinPackages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat katalog paket PIN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": packages})
}

func (h *DashboardHandler) TransferPin(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.TransferPinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Data transfer PIN tidak valid", "error": err.Error()})
		return
	}

	err := h.dashboardService.TransferPin(userID, req.PinID, req.TargetUsername)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// Notifikasi untuk pengirim & penerima
	var sender models.User
	var targetUser models.User
	if config.DB != nil {
		config.DB.Where("id = ?", userID).First(&sender)
		config.DB.Where("username = ?", req.TargetUsername).First(&targetUser)
	}

	_ = CreateNotification(
		userID,
		"Transfer PIN Berhasil",
		fmt.Sprintf("Serial PIN berhasil dikirimkan ke mitra @%s", req.TargetUsername),
		"pin",
		"/pins",
	)
	if targetUser.ID != "" {
		_ = CreateNotification(
			targetUser.ID,
			"Penerimaan Serial PIN Baru",
			fmt.Sprintf("Anda menerima transfer Serial PIN dari mitra @%s", sender.Username),
			"pin",
			"/pins",
		)
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "PIN berhasil ditransfer ke mitra tujuan"})
}

func (h *DashboardHandler) RegisterDownline(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.RegisterDownlineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Data pendaftaran mitra tidak lengkap", "error": err.Error()})
		return
	}

	resp, err := h.dashboardService.RegisterDownline(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// 1. Audit Log
	services.RecordAudit(c, userID, "REGISTER_DOWNLINE", "users", resp.User.ID, nil, gin.H{
		"username":      resp.User.Username,
		"upline":        resp.Upline.Username,
		"position":      resp.Position,
		"pin_code":      resp.Pin.SerialCode,
		"sponsor_bonus": resp.SponsorBonus,
		"points":        resp.PointsAwarded,
	})

	// 2. Notifikasi Transaksional untuk Sponsor
	_ = CreateNotification(
		userID,
		"Pendaftaran Downline Berhasil!",
		fmt.Sprintf("Selamat! Mitra baru @%s berhasil didaftarkan di slot kaki %s upline @%s. Bonus sponsor sebesar Rp %.0f telah masuk ke dompet Anda.", resp.User.Username, resp.Position, resp.Upline.Username, resp.SponsorBonus),
		"network",
		"/genealogy",
	)

	// 3. Notifikasi jika upline berbeda dengan sponsor
	if resp.Upline.ID != userID {
		_ = CreateNotification(
			resp.Upline.ID,
			"Downline Baru Ditempatkan!",
			fmt.Sprintf("Mitra baru @%s telah ditempatkan pada kaki %s jaringan binary Anda.", resp.User.Username, resp.Position),
			"network",
			"/genealogy",
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Mitra baru @%s berhasil didaftarkan dan ditempatkan pada pohon jaringan!", resp.User.Username),
		"data":    resp,
	})
}


// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------

func (h *DashboardHandler) GetProducts(c *gin.Context) {
	products, err := h.dashboardService.GetProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat katalog produk", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": products})
}

// ----------------------------------------------------
// PROFILE MANAGEMENT (NPWP, KTP, Avatar)
// ----------------------------------------------------

type UpdateProfileRequest struct {
	FullName string  `json:"full_name" binding:"required"`
	Phone    *string `json:"phone"`
	KTP      string  `json:"ktp"`
	NPWP     string  `json:"npwp"`
	Avatar   string  `json:"avatar"`
}

// UpdateProfile memperbarui profil pribadi user (Nama, Phone, KTP, NPWP, Avatar)
func (h *DashboardHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Input tidak valid", "error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User tidak ditemukan"})
		return
	}

	oldData := user
	updates := map[string]interface{}{
		"full_name": req.FullName,
		"phone":     req.Phone,
		"ktp":       req.KTP,
		"npwp":      req.NPWP,
		"avatar":    req.Avatar,
	}

	if err := config.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan perubahan profil"})
		return
	}

	// Audit Log
	services.RecordAudit(c, userID, "UPDATE", "users", userID, oldData, updates)

	_ = CreateNotification(userID, "Profil Berhasil Diperbarui", "Data identitas (KTP, NPWP, Avatar) profil Anda berhasil disimpan.", "info", "/overview")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Profil berhasil diperbarui",
		"data":    user,
	})
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6"`
}

// UpdatePassword memperbarui kata sandi mandiri oleh customer/mitra yang telah login
func (h *DashboardHandler) UpdatePassword(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req UpdatePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Kata sandi baru minimal 6 karakter", "error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User tidak ditemukan"})
		return
	}

	// Verifikasi kata sandi lama
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Kata sandi saat ini tidak sesuai"})
		return
	}

	// Enkripsi kata sandi baru
	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengenkripsi kata sandi baru"})
		return
	}

	if err := config.DB.Model(&user).Update("password_hash", string(newHash)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui kata sandi"})
		return
	}

	// Audit Log
	services.RecordAudit(c, userID, "UPDATE_PASSWORD", "users", userID, nil, map[string]interface{}{"status": "self_password_changed"})

	_ = CreateNotification(userID, "Kata Sandi Berhasil Diperbarui", "Kata sandi akun Anda baru saja diperbarui. Jaga kerahasiaan akun Anda.", "info", "/overview")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kata sandi Anda berhasil diperbarui!",
	})
}

// ----------------------------------------------------
// RECENTLY JOINED MEMBERS (WITH DOWNLINE LABEL)
// ----------------------------------------------------

type RecentMemberDTO struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	FullName      string    `json:"full_name"`
	Avatar        string    `json:"avatar"`
	Role          string    `json:"role"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	PackageName   string    `json:"package_name"`
	IsDownline    bool      `json:"is_downline"`
	DownlineType  string    `json:"downline_type"` // "downline_binary", "direct_referral", "community"
	DownlineLabel string    `json:"downline_label"`
	BinarySide    string    `json:"binary_side,omitempty"` // "kiri", "kanan", or ""
}

// GetRecentMembers mengembalikan 10 mitra terbaru yang bergabung dengan penanda apakah berada di jalur downline user
func (h *DashboardHandler) GetRecentMembers(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	db := config.DB

	// 1. Ambil 10 member terbaru yang bukan diri sendiri
	var recentUsers []models.User
	if err := db.Where("role = ? AND id != ?", "member", currentUserID).
		Order("created_at DESC").
		Limit(10).
		Find(&recentUsers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat mitra terbaru"})
		return
	}

	// 2. Kumpulkan seluruh descendant ID di pohon binary (upline_paths)
	var binaryDownlineIDs []string
	db.Table("upline_paths").Where("ancestor_id = ?", currentUserID).Pluck("descendant_id", &binaryDownlineIDs)
	binaryDownlineMap := make(map[string]bool)
	for _, id := range binaryDownlineIDs {
		binaryDownlineMap[id] = true
	}

	// 3. Kumpulkan direct sponsor downline
	var directReferralIDs []string
	db.Table("sponsors").Where("sponsor_id = ?", currentUserID).Pluck("user_id", &directReferralIDs)
	directReferralMap := make(map[string]bool)
	for _, id := range directReferralIDs {
		directReferralMap[id] = true
	}

	// 4. Ambil posisi network binary untuk yang ada di binary tree
	var positions []models.NetworkPosition
	if len(binaryDownlineIDs) > 0 {
		db.Where("user_id IN (?)", binaryDownlineIDs).Find(&positions)
	}
	posMap := make(map[string]string)
	for _, p := range positions {
		posMap[p.UserID] = p.Position
	}

	// 5. Build DTO
	results := make([]RecentMemberDTO, 0, len(recentUsers))
	for _, u := range recentUsers {
		isDownline := false
		dType := "community"
		dLabel := "Mitra Komunitas Platform"
		side := ""

		if directReferralMap[u.ID] {
			isDownline = true
			dType = "direct_referral"
			dLabel = "Sponsor Langsung Anda"
		} else if binaryDownlineMap[u.ID] {
			isDownline = true
			dType = "downline_binary"
			dLabel = "Downline Jaringan Binary Anda"
			side = posMap[u.ID]
		}

		// Cari paket PIN
		pkgName := "Paket Kemitraan Gold"
		var pin models.Pin
		if err := db.Preload("Package").Where("owner_id = ? OR used_by_id = ?", u.ID, u.ID).First(&pin).Error; err == nil && pin.Package != nil {
			pkgName = pin.Package.Name
		}

		avatarUrl := u.Avatar
		if avatarUrl == "" {
			avatarUrl = fmt.Sprintf("https://api.dicebear.com/7.x/bottts/svg?seed=%s", u.Username)
		}

		results = append(results, RecentMemberDTO{
			ID:            u.ID,
			Username:      u.Username,
			FullName:      u.FullName,
			Avatar:        avatarUrl,
			Role:          u.Role,
			Status:        u.Status,
			CreatedAt:     u.CreatedAt,
			PackageName:   pkgName,
			IsDownline:    isDownline,
			DownlineType:  dType,
			DownlineLabel: dLabel,
			BinarySide:    side,
		})
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": results})
}

// UserAddressRequest struct untuk update data alamat pengguna/mitra
type UserAddressRequest struct {
	RecipientName string `json:"recipient_name" binding:"required"`
	Phone         string `json:"phone" binding:"required"`
	Address       string `json:"address" binding:"required"`
	Province      string `json:"province" binding:"required"`
	City          string `json:"city" binding:"required"`
	District      string `json:"district" binding:"required"`
	PostalCode    string `json:"postal_code" binding:"required"`
}

// GetUserAddress mengambil alamat primer pengguna saat ini
func (h *DashboardHandler) GetUserAddress(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var addr models.UserAddress
	if err := config.DB.Where("user_id = ? AND is_primary = true", userID).First(&addr).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "success", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": addr})
}

// UpdateUserAddress memperbarui atau membuat alamat pengiriman primer pengguna
func (h *DashboardHandler) UpdateUserAddress(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req UserAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Lengkapi semua data alamat pengiriman", "error": err.Error()})
		return
	}

	var addr models.UserAddress
	if err := config.DB.Where("user_id = ? AND is_primary = true", userID).First(&addr).Error; err != nil {
		// Buat baru
		addr = models.UserAddress{
			ID:            uuid.New().String(),
			UserID:        userID,
			RecipientName: req.RecipientName,
			Phone:         req.Phone,
			Address:       req.Address,
			Province:      req.Province,
			City:          req.City,
			District:      req.District,
			PostalCode:    req.PostalCode,
			IsPrimary:     true,
		}
		if err := config.DB.Create(&addr).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan alamat", "error": err.Error()})
			return
		}
	} else {
		// Update
		updates := map[string]interface{}{
			"recipient_name": req.RecipientName,
			"phone":          req.Phone,
			"address":        req.Address,
			"province":       req.Province,
			"city":           req.City,
			"district":       req.District,
			"postal_code":    req.PostalCode,
		}
		if err := config.DB.Model(&addr).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui alamat", "error": err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Alamat pengiriman berhasil disimpan", "data": addr})
}
