package handlers

import (
	"fmt"
	"net/http"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetOverview mengembalikan statistik global platform untuk Administrator
func (h *AdminHandler) GetOverview(c *gin.Context) {
	db := config.DB

	var totalUsers int64
	var totalMembers int64
	var totalGudang int64
	var totalAdmins int64

	db.Model(&models.User{}).Count(&totalUsers)
	db.Model(&models.User{}).Where("role = ?", "member").Count(&totalMembers)
	db.Model(&models.User{}).Where("role = ?", "gudang").Count(&totalGudang)
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&totalAdmins)

	var totalPins int64
	var activePins int64
	db.Model(&models.Pin{}).Count(&totalPins)
	db.Model(&models.Pin{}).Where("status = ?", "active").Count(&activePins)

	var totalPendingWD int64
	var totalPendingWDAmount float64
	db.Model(&models.Withdrawal{}).Where("status = ?", "pending").Count(&totalPendingWD)
	db.Model(&models.Withdrawal{}).Where("status = ?", "pending").Select("COALESCE(SUM(amount), 0)").Scan(&totalPendingWDAmount)

	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	var totalTurnoverMonth float64
	db.Model(&models.WalletTransaction{}).
		Where("type = ? AND transaction_date >= ?", "credit", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").Scan(&totalTurnoverMonth)

	var totalProducts int64
	db.Model(&models.Product{}).Count(&totalProducts)

	// User terbaru (5)
	var recentUsers []models.User
	db.Order("created_at DESC").Limit(5).Find(&recentUsers)

	// Penarikan terbaru yang pending (5)
	var pendingWithdrawals []models.Withdrawal
	db.Preload("User").Preload("Bank").Where("status = ?", "pending").Order("created_at DESC").Limit(5).Find(&pendingWithdrawals)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_users":               totalUsers,
			"total_members":             totalMembers,
			"total_gudang":              totalGudang,
			"total_admins":              totalAdmins,
			"total_pins":                totalPins,
			"active_pins":               activePins,
			"pending_withdrawals_count": totalPendingWD,
			"pending_withdrawals_sum":   totalPendingWDAmount,
			"turnover_month":            totalTurnoverMonth,
			"total_products":            totalProducts,
			"recent_users":              recentUsers,
			"pending_withdrawals":       pendingWithdrawals,
		},
	})
}

// UserWithFinancesDTO representasi data pengguna dengan saldo, poin, identitas (KTP/NPWP), avatar, dan alamat
type UserWithFinancesDTO struct {
	ID            string    `json:"id"`
	Username      string    `json:"username"`
	FullName      string    `json:"full_name"`
	Role          string    `json:"role"`
	Phone         *string   `json:"phone"`
	KTP           string    `json:"ktp"`
	NPWP          string    `json:"npwp"`
	Avatar        string    `json:"avatar"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	Balance       float64   `json:"balance"`
	PointLeft     float64   `json:"point_left"`
	PointRight    float64   `json:"point_right"`
	RecipientName string    `json:"recipient_name"`
	Address       string    `json:"address"`
	Province      string    `json:"province"`
	City          string    `json:"city"`
	District      string    `json:"district"`
	PostalCode    string    `json:"postal_code"`
}

// GetUsers mengambil daftar seluruh pengguna dengan saldo dompet, poin binary, dan alamat primer
func (h *AdminHandler) GetUsers(c *gin.Context) {
	db := config.DB
	search := c.Query("search")
	roleFilter := c.Query("role")
	statusFilter := c.Query("status")

	query := db.Table("users").
		Select("users.id, users.username, users.full_name, users.role, users.phone, COALESCE(users.ktp, '') as ktp, COALESCE(users.npwp, '') as npwp, COALESCE(users.avatar, '') as avatar, users.status, users.created_at, COALESCE(wallets.balance, 0) as balance, COALESCE(point_balances.point_left, 0) as point_left, COALESCE(point_balances.point_right, 0) as point_right, COALESCE(user_addresses.recipient_name, '') as recipient_name, COALESCE(user_addresses.address, '') as address, COALESCE(user_addresses.province, '') as province, COALESCE(user_addresses.city, '') as city, COALESCE(user_addresses.district, '') as district, COALESCE(user_addresses.postal_code, '') as postal_code").
		Joins("LEFT JOIN wallets ON wallets.user_id = users.id").
		Joins("LEFT JOIN point_balances ON point_balances.user_id = users.id").
		Joins("LEFT JOIN user_addresses ON user_addresses.user_id = users.id AND user_addresses.is_primary = true").
		Where("users.deleted_at IS NULL")

	if search != "" {
		query = query.Where("users.username LIKE ? OR users.full_name LIKE ? OR users.ktp LIKE ? OR users.npwp LIKE ? OR user_addresses.address LIKE ? OR user_addresses.city LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}
	if roleFilter != "" {
		query = query.Where("users.role = ?", roleFilter)
	}
	if statusFilter != "" {
		query = query.Where("users.status = ?", statusFilter)
	}

	var results []UserWithFinancesDTO
	if err := query.Order("users.created_at DESC").Scan(&results).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat pengguna", "error": err.Error()})
		return
	}

	// Hitung global stats untuk KPI summary cards dashboard
	var stats struct {
		TotalUsers     int64 `json:"total_users"`
		TotalMembers   int64 `json:"total_members"`
		TotalGudang    int64 `json:"total_gudang"`
		TotalAdmins    int64 `json:"total_admins"`
		ActiveUsers    int64 `json:"active_users"`
		SuspendedUsers int64 `json:"suspended_users"`
	}
	db.Model(&models.User{}).Where("deleted_at IS NULL").Count(&stats.TotalUsers)
	db.Model(&models.User{}).Where("deleted_at IS NULL AND role = ?", "member").Count(&stats.TotalMembers)
	db.Model(&models.User{}).Where("deleted_at IS NULL AND role = ?", "gudang").Count(&stats.TotalGudang)
	db.Model(&models.User{}).Where("deleted_at IS NULL AND role = ?", "admin").Count(&stats.TotalAdmins)
	db.Model(&models.User{}).Where("deleted_at IS NULL AND status = ?", "active").Count(&stats.ActiveUsers)
	db.Model(&models.User{}).Where("deleted_at IS NULL AND status = ?", "suspended").Count(&stats.SuspendedUsers)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
		"stats":  stats,
	})
}

// UpdateUserRequest struct untuk update data user & alamat oleh Admin / CS
type UpdateUserRequest struct {
	FullName      string  `json:"full_name" binding:"required"`
	Phone         *string `json:"phone"`
	KTP           string  `json:"ktp"`
	NPWP          string  `json:"npwp"`
	Avatar        string  `json:"avatar"`
	Role          string  `json:"role"`
	Status        string  `json:"status"`
	RecipientName string  `json:"recipient_name"`
	Address       string  `json:"address"`
	Province      string  `json:"province"`
	City          string  `json:"city"`
	District      string  `json:"district"`
	PostalCode    string  `json:"postal_code"`
}

// UpdateUser mengubah data profil, KTP, NPWP, Avatar, status, atau role pengguna
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")
	adminRole := c.GetString("role")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format data pengguna tidak valid", "error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pengguna tidak ditemukan"})
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

	// Hanya Admin yang berhak mengubah role dan status akun
	if adminRole == "admin" {
		if req.Role != "" {
			updates["role"] = req.Role
		}
		if req.Status != "" {
			updates["status"] = req.Status
		}
	}

	if err := config.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui data user"})
		return
	}

	// Update / Create Primary Address jika ada data alamat yang diisi
	if req.Address != "" || req.Province != "" || req.City != "" || req.District != "" || req.PostalCode != "" {
		var userAddr models.UserAddress
		if err := config.DB.Where("user_id = ? AND is_primary = true", user.ID).First(&userAddr).Error; err != nil {
			recipient := req.RecipientName
			if recipient == "" {
				recipient = req.FullName
			}
			phone := ""
			if req.Phone != nil {
				phone = *req.Phone
			}
			userAddr = models.UserAddress{
				ID:            uuid.New().String(),
				UserID:        user.ID,
				RecipientName: recipient,
				Phone:         phone,
				Address:       req.Address,
				Province:      req.Province,
				City:          req.City,
				District:      req.District,
				PostalCode:    req.PostalCode,
				IsPrimary:     true,
			}
			_ = config.DB.Create(&userAddr).Error
		} else {
			addrUpdates := map[string]interface{}{
				"address":     req.Address,
				"province":    req.Province,
				"city":        req.City,
				"district":    req.District,
				"postal_code": req.PostalCode,
			}
			if req.RecipientName != "" {
				addrUpdates["recipient_name"] = req.RecipientName
			}
			if req.Phone != nil && *req.Phone != "" {
				addrUpdates["phone"] = *req.Phone
			}
			_ = config.DB.Model(&userAddr).Updates(addrUpdates).Error
		}
	}

	// Record Audit Log
	services.RecordAudit(c, adminID, "UPDATE", "users", id, oldData, updates)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data pengguna & alamat berhasil diperbarui",
		"data":    user,
	})
}

// AdminResetPasswordRequest struct untuk reset/update password oleh admin
type AdminResetPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// UpdateUserPassword mengubah password customer/pengguna langsung oleh Administrator
func (h *AdminHandler) UpdateUserPassword(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")

	var req AdminResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Password baru minimal 6 karakter", "error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pengguna tidak ditemukan"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengenkripsi kata sandi baru"})
		return
	}

	if err := config.DB.Model(&user).Update("password_hash", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui kata sandi pengguna"})
		return
	}

	// Audit log
	services.RecordAudit(c, adminID, "ADMIN_RESET_PASSWORD", "users", id, nil, map[string]interface{}{"username": user.Username})

	_ = CreateNotification(user.ID, "Kata Sandi Diperbarui oleh Admin", "Kata sandi akun Anda telah diperbarui oleh Administrator sistem.", "info", "/overview")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Kata sandi pengguna @" + user.Username + " berhasil diperbarui",
	})
}

// DeleteUser melakukan soft delete akun pengguna (Soft Delete)
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pengguna tidak ditemukan"})
		return
	}

	// Jangan izinkan admin menghapus akunnya sendiri
	if user.ID == adminID {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Tidak dapat menghapus akun Anda sendiri"})
		return
	}

	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menghapus user"})
		return
	}

	// Record Audit Log for Soft Delete
	services.RecordAudit(c, adminID, "DELETE", "users", id, user, nil)

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Pengguna berhasil dinonaktifkan (Soft Delete)"})
}

// UpdateUserRole mengubah role pengguna (admin, keuangan, cs, gudang, member)
func (h *AdminHandler) UpdateUserRole(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")
	var req struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Role tidak valid"})
		return
	}

	validRoles := map[string]bool{"admin": true, "keuangan": true, "cs": true, "gudang": true, "member": true}
	if !validRoles[req.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Role harus salah satu dari: admin, keuangan, cs, gudang, member"})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User tidak ditemukan"})
		return
	}
	oldRole := user.Role

	if err := config.DB.Model(&models.User{}).Where("id = ?", id).Update("role", req.Role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui role user"})
		return
	}

	// Record Audit Log
	services.RecordAudit(c, adminID, "UPDATE", "users", id, map[string]string{"role": oldRole}, map[string]string{"role": req.Role})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Role pengguna berhasil diubah menjadi " + req.Role})
}

// UpdateUserStatus mengubah status user (active / suspended)
func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format status tidak valid"})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", id).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "User tidak ditemukan"})
		return
	}
	oldStatus := user.Status

	if err := config.DB.Model(&models.User{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui status user"})
		return
	}

	// Record Audit Log
	services.RecordAudit(c, adminID, "UPDATE", "users", id, map[string]string{"status": oldStatus}, map[string]string{"status": req.Status})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Status user berhasil diperbarui"})
}

// GetTransactions mengambil buku besar transaksi wallet platform dengan filter
func (h *AdminHandler) GetTransactions(c *gin.Context) {
	db := config.DB
	search := c.Query("search")
	txType := c.Query("type")       // credit, debit
	category := c.Query("category") // pairing, sponsor, withdrawal, credit, debit

	query := db.Model(&models.WalletTransaction{}).Preload("User")

	if txType != "" {
		query = query.Where("type = ?", txType)
	}

	if category == "pairing" {
		query = query.Where("description LIKE ? OR description LIKE ?", "%Pasangan%", "%Pairing%")
	} else if category == "sponsor" {
		query = query.Where("description LIKE ?", "%Sponsor%")
	} else if category == "withdrawal" {
		query = query.Where("type = 'debit' AND (description LIKE ? OR description LIKE ? OR description LIKE ?)", "%Penarikan%", "%Withdrawal%", "%Pencairan%")
	} else if category == "credit" {
		query = query.Where("type = ?", "credit")
	} else if category == "debit" {
		query = query.Where("type = ?", "debit")
	}

	if search != "" {
		query = query.Joins("LEFT JOIN users ON users.id = wallet_transactions.user_id").
			Where("wallet_transactions.description LIKE ? OR users.username LIKE ? OR users.full_name LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var list []models.WalletTransaction
	if err := query.Order("wallet_transactions.transaction_date DESC").Limit(200).Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat transaksi", "error": err.Error()})
		return
	}

	// Hitung KPI Aggregat Platform
	var totalCredit float64
	var totalDebit float64
	var totalPairing float64
	var totalSponsor float64

	db.Model(&models.WalletTransaction{}).Where("type = ?", "credit").Select("COALESCE(SUM(amount), 0)").Scan(&totalCredit)
	db.Model(&models.WalletTransaction{}).Where("type = ?", "debit").Select("COALESCE(SUM(amount), 0)").Scan(&totalDebit)
	db.Model(&models.WalletTransaction{}).Where("description LIKE ? OR description LIKE ?", "%Pasangan%", "%Pairing%").Select("COALESCE(SUM(amount), 0)").Scan(&totalPairing)
	db.Model(&models.WalletTransaction{}).Where("description LIKE ?", "%Sponsor%").Select("COALESCE(SUM(amount), 0)").Scan(&totalSponsor)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   list,
		"metrics": gin.H{
			"total_credit":        totalCredit,
			"total_debit":         totalDebit,
			"total_pairing_bonus": totalPairing,
			"total_sponsor_bonus": totalSponsor,
		},
	})
}

// GetPointBalances mengambil data seluruh point_balances binary mitra
func (h *AdminHandler) GetPointBalances(c *gin.Context) {
	db := config.DB
	search := c.Query("search")

	query := db.Model(&models.PointBalance{}).Preload("User")
	if search != "" {
		query = query.Joins("LEFT JOIN users ON users.id = point_balances.user_id").
			Where("users.username LIKE ? OR users.full_name LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var list []models.PointBalance
	if err := query.Order("updated_at DESC").Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat poin", "error": err.Error()})
		return
	}

	var sumLeft float64
	var sumRight float64
	db.Model(&models.PointBalance{}).Select("COALESCE(SUM(point_left), 0)").Scan(&sumLeft)
	db.Model(&models.PointBalance{}).Select("COALESCE(SUM(point_right), 0)").Scan(&sumRight)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   list,
		"metrics": gin.H{
			"total_point_left":  sumLeft,
			"total_point_right": sumRight,
		},
	})
}

// AdjustPoints memungkinkan admin menambah/mengurangi poin binary mitra
func (h *AdminHandler) AdjustPoints(c *gin.Context) {
	var req struct {
		UserID     string  `json:"user_id" binding:"required"`
		PointLeft  float64 `json:"point_left"`
		PointRight float64 `json:"point_right"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter tidak valid"})
		return
	}

	var pb models.PointBalance
	err := config.DB.Where("user_id = ?", req.UserID).First(&pb).Error
	adminID := c.GetString("user_id")
	if err != nil {
		pb = models.PointBalance{
			ID:         uuid.New().String(),
			UserID:     req.UserID,
			PointLeft:  req.PointLeft,
			PointRight: req.PointRight,
		}
		config.DB.Create(&pb)
		services.RecordAudit(c, adminID, "CREATE", "point_balances", pb.ID, nil, pb)
	} else {
		oldPb := pb
		pb.PointLeft = req.PointLeft
		pb.PointRight = req.PointRight
		pb.UpdatedAt = time.Now()
		config.DB.Save(&pb)
		services.RecordAudit(c, adminID, "UPDATE", "point_balances", pb.ID, oldPb, pb)
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Poin binary berhasil diperbarui", "data": pb})
}

// GetPins mengambil seluruh serial PIN di sistem
func (h *AdminHandler) GetPins(c *gin.Context) {
	db := config.DB
	status := c.Query("status")
	search := c.Query("search")

	query := db.Model(&models.Pin{}).Preload("Package").Preload("Owner").Preload("UsedBy")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Joins("LEFT JOIN users ON users.id = pins.owner_id").
			Where("pins.serial_code LIKE ? OR users.username LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var pins []models.Pin
	if err := query.Order("created_at DESC").Find(&pins).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat PIN", "error": err.Error()})
		return
	}

	var totalCount int64
	var activeCount int64
	var usedCount int64
	db.Model(&models.Pin{}).Count(&totalCount)
	db.Model(&models.Pin{}).Where("status = ?", "active").Count(&activeCount)
	db.Model(&models.Pin{}).Where("status = ?", "used").Count(&usedCount)

	var packages []models.PinPackage
	db.Find(&packages)

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"data":     pins,
		"packages": packages,
		"metrics": gin.H{
			"total_pins":  totalCount,
			"active_pins": activeCount,
			"used_pins":   usedCount,
		},
	})
}

// GetPinTransfers mengambil log mutasi transfer PIN antar mitra
func (h *AdminHandler) GetPinTransfers(c *gin.Context) {
	var transfers []models.PinTransfer
	if err := config.DB.Preload("Pin").Preload("Pin.Package").Preload("FromUser").Preload("ToUser").
		Order("transferred_at DESC").Find(&transfers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat riwayat transfer PIN"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "data": transfers})
}

// GeneratePins men-generate serial PIN baru
func (h *AdminHandler) GeneratePins(c *gin.Context) {
	var req struct {
		PackageID string `json:"package_id" binding:"required"`
		OwnerID   string `json:"owner_id" binding:"required"`
		Count     int    `json:"count" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Input tidak valid"})
		return
	}

	if req.Count <= 0 || req.Count > 50 {
		req.Count = 1
	}

	var createdPins []models.Pin
	for i := 0; i < req.Count; i++ {
		code := fmt.Sprintf("PIN-BIO-%d-%s", time.Now().Unix(), uuid.New().String()[:6])
		pin := models.Pin{
			ID:         uuid.New().String(),
			SerialCode: code,
			PackageID:  req.PackageID,
			OwnerID:    req.OwnerID,
			Status:     "active",
		}
		config.DB.Create(&pin)
		createdPins = append(createdPins, pin)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("%d Serial PIN berhasil digenerate", req.Count),
		"data":    createdPins,
	})
}

// GetOrders mengambil seluruh pesanan RO platform
func (h *AdminHandler) GetOrders(c *gin.Context) {
	db := config.DB
	status := c.Query("status")
	search := c.Query("search")

	query := db.Model(&models.Order{}).Preload("User").Preload("Items.Product")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Joins("LEFT JOIN users ON users.id = orders.user_id").
			Where("orders.order_number LIKE ? OR users.username LIKE ? OR users.full_name LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var orders []models.Order
	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat pesanan", "error": err.Error()})
		return
	}

	var totalRevenue float64
	db.Model(&models.Order{}).Where("status != ?", "cancelled").Select("COALESCE(SUM(total_amount), 0)").Scan(&totalRevenue)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   orders,
		"metrics": gin.H{
			"total_orders":  len(orders),
			"total_revenue": totalRevenue,
		},
	})
}

// UpdateOrderStatus memperbarui status order e-commerce oleh admin
func (h *AdminHandler) UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Status tidak valid"})
		return
	}

	var order models.Order
	if err := config.DB.Where("id = ?", id).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pesanan tidak ditemukan"})
		return
	}
	oldStatus := order.Status

	if err := config.DB.Model(&order).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui status order"})
		return
	}

	// Record Audit Log
	services.RecordAudit(c, adminID, "UPDATE", "orders", id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": req.Status})

	// Trigger notifikasi transaksional untuk pemesan
	title := fmt.Sprintf("Status Pesanan #%s Diperbarui", order.OrderNumber)
	msg := fmt.Sprintf("Pesanan produk Anda kini berstatus '%s'. Silakan periksa detailnya.", req.Status)
	_ = CreateNotification(order.UserID, title, msg, "order", "/products")

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Status pesanan berhasil diperbarui ke " + req.Status})
}

// GetWithdrawals mengambil seluruh riwayat penarikan dana mitra untuk approval
func (h *AdminHandler) GetWithdrawals(c *gin.Context) {
	status := c.Query("status")
	query := config.DB.Preload("User").Preload("Bank")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var list []models.Withdrawal
	if err := query.Order("created_at DESC").Find(&list).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat penarikan dana", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": list})
}

// UpdateWithdrawalStatus menyetujui, menyelesaikan, atau menolak penarikan dana
func (h *AdminHandler) UpdateWithdrawalStatus(c *gin.Context) {
	id := c.Param("id")
	adminID := c.GetString("user_id")

	var req struct {
		Status string `json:"status" binding:"required"` // 'completed', 'rejected'
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Status baru tidak valid"})
		return
	}

	var wd models.Withdrawal
	if err := config.DB.Where("id = ?", id).First(&wd).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Data penarikan dana tidak ditemukan"})
		return
	}

	oldStatus := wd.Status
	if err := config.DB.Model(&models.Withdrawal{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui status penarikan"})
		return
	}

	// Record Audit Log
	services.RecordAudit(c, adminID, "UPDATE", "withdrawals", id, map[string]interface{}{"status": oldStatus}, map[string]interface{}{"status": req.Status})

	// Jika penarikan ditolak dan sebelumnya bukan rejected, kembalikan saldo ke dompet mitra
	if req.Status == "rejected" && oldStatus != "rejected" {
		var wallet models.Wallet
		if err := config.DB.Where("user_id = ?", wd.UserID).First(&wallet).Error; err == nil {
			newBal := wallet.Balance + wd.Amount
			config.DB.Model(&wallet).Update("balance", newBal)

			txLog := models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       wd.UserID,
				Type:         "credit",
				Amount:       wd.Amount,
				BalanceAfter: newBal,
				Description:  fmt.Sprintf("Pengembalian Dana Penarikan Ditolak (Rp %.0f)", wd.Amount),
			}
			config.DB.Create(&txLog)
		}
	}

	// Kirim notifikasi transaksional ke mitra bersangkutan
	title := "Pembaruan Penarikan Dana (WD)"
	msg := fmt.Sprintf("Status pengajuan penarikan dana Anda sebesar Rp %.0f kini: %s", wd.Amount, req.Status)
	if req.Status == "completed" {
		msg = fmt.Sprintf("Pencairan dana sebesar Rp %.0f telah disetujui & berhasil diproses via Flip.id ke rekening Anda.", wd.Amount)
	} else if req.Status == "rejected" {
		msg = fmt.Sprintf("Pengajuan penarikan dana sebesar Rp %.0f ditolak. Saldo telah dikembalikan ke dompet Anda.", wd.Amount)
	}
	_ = CreateNotification(wd.UserID, title, msg, "transaction", "/withdrawal")

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Status penarikan berhasil diperbarui ke " + req.Status})
}

// GetAuditLogs mengambil seluruh riwayat audit log aktivitas platform
func (h *AdminHandler) GetAuditLogs(c *gin.Context) {
	db := config.DB
	action := c.Query("action")
	tableName := c.Query("table_name")
	search := c.Query("search")

	query := db.Model(&models.AuditLog{}).Preload("User")
	if action != "" {
		query = query.Where("action = ?", action)
	}
	if tableName != "" {
		query = query.Where("table_name = ?", tableName)
	}
	if search != "" {
		query = query.Where("table_name LIKE ? OR action LIKE ? OR record_id LIKE ?", "%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var logs []models.AuditLog
	if err := query.Order("created_at DESC").Limit(100).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat log audit", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   logs,
		"total":  total,
	})
}
