package handlers

import (
	"net/http"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RBACOverviewDTO struct {
	Role        string   `json:"role"`
	RoleTitle   string   `json:"role_title"`
	Description string   `json:"description"`
	ActiveMenus []string `json:"active_menus"`
	TotalMenus  int      `json:"total_menus"`
}

type RBACHandler struct{}

func NewRBACHandler() *RBACHandler {
	return &RBACHandler{}
}

// GetMatrix mengembalikan matriks lengkap daftar menu untuk masing-masing role
func (h *RBACHandler) GetMatrix(c *gin.Context) {
	db := config.DB

	var menus []models.AppMenu
	if err := db.Order("order_index ASC").Find(&menus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat master menu"})
		return
	}

	var permissions []models.RoleMenuPermission
	db.Find(&permissions)

	// Map permissions: [role][menu_key] -> bool
	permMap := make(map[string]map[string]bool)
	for _, p := range permissions {
		if permMap[p.Role] == nil {
			permMap[p.Role] = make(map[string]bool)
		}
		permMap[p.Role][p.MenuKey] = p.IsEnabled
	}

	roles := []gin.H{
		{
			"role":        "admin",
			"title":       "Administrator Pusat",
			"description": "Akses kontrol penuh ke seluruh modul audit, finansial, stokis, dan konfigurasi sistem",
			"color":       "amber",
		},
		{
			"role":        "keuangan",
			"title":       "Tim Finansial & Pembukuan",
			"description": "Akses audit transaksi, validasi withdraw komisi, rekonsiliasi transfer bank, dan laporan keuangan",
			"color":       "purple",
		},
		{
			"role":        "cs",
			"title":       "Customer Service & Helpdesk",
			"description": "Akses live chat bantuan mitra, tiket keluhan, panduan pendaftaran, dan audit direktori member",
			"color":       "indigo",
		},
		{
			"role":        "gudang",
			"title":       "Tim Gudang & Logistik",
			"description": "Akses inventori produk herbal, stok opname, dan pemenuhan ekspedisi pesanan RO",
			"color":       "sky",
		},
		{
			"role":        "member",
			"title":       "Mitra / Member Jaringan",
			"description": "Akses portal kemitraan mandiri: pohon binary, bonus sponsor/pasangan, dompet, dan stokis PIN",
			"color":       "emerald",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"roles":       roles,
			"menus":       menus,
			"permissions": permMap,
		},
	})
}

// TogglePermission mengaktifkan atau menonaktifkan hak akses menu untuk role tertentu
func (h *RBACHandler) TogglePermission(c *gin.Context) {
	var req struct {
		Role      string `json:"role" binding:"required"`
		MenuKey   string `json:"menu_key" binding:"required"`
		IsEnabled bool   `json:"is_enabled"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter tidak valid"})
		return
	}

	db := config.DB
	var perm models.RoleMenuPermission
	err := db.Where("role = ? AND menu_key = ?", req.Role, req.MenuKey).First(&perm).Error
	if err != nil {
		// Buat baru jika belum ada
		perm = models.RoleMenuPermission{
			ID:        uuid.New().String(),
			Role:      req.Role,
			MenuKey:   req.MenuKey,
			IsEnabled: req.IsEnabled,
		}
		db.Create(&perm)
	} else {
		perm.IsEnabled = req.IsEnabled
		perm.UpdatedAt = time.Now()
		db.Save(&perm)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Hak akses menu berhasil diperbarui",
		"data":    perm,
	})
}

// GetMyMenus mengambil daftar menu yang aktif khusus untuk role user yang sedang login
func (h *RBACHandler) GetMyMenus(c *gin.Context) {
	roleVal, exists := c.Get("role")
	role := "member"
	if exists && roleVal != nil {
		role = roleVal.(string)
	}

	db := config.DB
	var menus []models.AppMenu
	db.Order("order_index ASC").Find(&menus)

	var permissions []models.RoleMenuPermission
	db.Where("role = ?", role).Find(&permissions)

	permMap := make(map[string]bool)
	for _, p := range permissions {
		permMap[p.MenuKey] = p.IsEnabled
	}

	var allowedMenus []models.AppMenu
	for _, m := range menus {
		// Jika ada izin eksplisit, gunakan is_enabled; jika belum ada record, gunakan default
		if isEnabled, ok := permMap[m.MenuKey]; ok {
			if isEnabled {
				allowedMenus = append(allowedMenus, m)
			}
		} else {
			// Fallback default permissions
			if role == "admin" && (m.Category == "Admin" || m.Category == "Core" || m.MenuKey == "chat") {
				allowedMenus = append(allowedMenus, m)
			} else if role == "keuangan" && (m.MenuKey == "admin-transactions" || m.MenuKey == "admin-withdrawals" || m.MenuKey == "admin-overview" || m.MenuKey == "admin-fraud" || m.MenuKey == "admin-monitoring" || m.MenuKey == "leads" || m.MenuKey == "meetings" || m.MenuKey == "overview" || m.MenuKey == "chat") {
				allowedMenus = append(allowedMenus, m)
			} else if role == "cs" && (m.MenuKey == "admin-users" || m.MenuKey == "chat" || m.MenuKey == "admin-overview" || m.MenuKey == "leads" || m.MenuKey == "meetings" || m.MenuKey == "overview") {
				allowedMenus = append(allowedMenus, m)
			} else if role == "gudang" && (m.Category == "Logistik" || m.MenuKey == "products") {
				allowedMenus = append(allowedMenus, m)
			} else if role == "member" && (m.Category == "Member" || m.Category == "Core" || m.Category == "Jaringan" || m.Category == "Finansial" || m.MenuKey == "chat") {
				allowedMenus = append(allowedMenus, m)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"role":   role,
		"data":   allowedMenus,
	})
}
