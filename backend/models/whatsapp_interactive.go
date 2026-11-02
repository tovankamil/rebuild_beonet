package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WhatsAppStoreCategory mendefinisikan tombol menu interaktif pada katalog bot WhatsApp
type WhatsAppStoreCategory struct {
	ID          string `json:"id"`
	Icon        string `json:"icon"`        // misal: 📦, 🌿, 💰, 📋, 👤, 🔙
	Title       string `json:"title"`       // misal: Apps Premium, Paket Kemitraan, Produk Herbal
	Subtitle    string `json:"subtitle"`    // misal: 3/3 produk ready, BPOM Resmi
	ActionType  string `json:"action_type"` // 'package_list', 'product_list', 'bonus_info', 'legality', 'contact_cs', 'home'
	ReplyText   string `json:"reply_text"`
	IsActive    bool   `json:"is_active"`
	SortOrder   int    `json:"sort_order"`
}

// WhatsAppInteractiveStoreConfig menyimpan konfigurasi pesan pembuka katalog interaktif bot WhatsApp
type WhatsAppInteractiveStoreConfig struct {
	ID           string                  `gorm:"type:char(36);primaryKey" json:"id"`
	StoreName    string                  `gorm:"type:varchar(150);default:'🌸 BIONET OFFICIAL HERBAL & STORE 🌸'" json:"store_name"`
	GreetingText string                  `gorm:"type:text" json:"greeting_text"`
	FooterText   string                  `gorm:"type:varchar(255);default:'⚡ Proses Otomatis 24/7 • 🛡️ Transaksi Aman & BPOM Resmi'" json:"footer_text"`
	IsActive     bool                    `gorm:"default:true" json:"is_active"`
	AutoReplyOn  bool                    `gorm:"default:true" json:"auto_reply_on"` // Balas otomatis saat ada keyword 'menu', 'store', 'toko', 'produk', 'paket'
	Categories   []WhatsAppStoreCategory `gorm:"-" json:"categories"`
	RawJSON      string                  `gorm:"type:longtext" json:"-"`
	CreatedAt    time.Time               `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time               `gorm:"autoUpdateTime" json:"updated_at"`
}

func (w *WhatsAppInteractiveStoreConfig) BeforeCreate(tx *gorm.DB) (err error) {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return
}

