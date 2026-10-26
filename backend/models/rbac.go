package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AppMenu merepresentasikan master daftar menu sistem
type AppMenu struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	MenuKey     string    `gorm:"type:varchar(60);not null;uniqueIndex" json:"menu_key"`
	Title       string    `gorm:"type:varchar(100);not null" json:"title"`
	Description string    `gorm:"type:varchar(255)" json:"description"`
	Category    string    `gorm:"type:varchar(50);not null" json:"category"` // Core, Finansial, Jaringan, Logistik, Master
	IconName    string    `gorm:"type:varchar(50);not null" json:"icon_name"`
	OrderIndex  int       `gorm:"default:0" json:"order_index"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (m *AppMenu) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return
}

// RoleMenuPermission mendefinisikan relasi izin daftar menu per role (RBAC dinamis)
type RoleMenuPermission struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	Role      string    `gorm:"type:varchar(30);not null;index:idx_role_menu" json:"role"` // admin, gudang, member
	MenuKey   string    `gorm:"type:varchar(60);not null;index:idx_role_menu" json:"menu_key"`
	IsEnabled bool      `gorm:"default:true" json:"is_enabled"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (rm *RoleMenuPermission) BeforeCreate(tx *gorm.DB) (err error) {
	if rm.ID == "" {
		rm.ID = uuid.New().String()
	}
	return
}
