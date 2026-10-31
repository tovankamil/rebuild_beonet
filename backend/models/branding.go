package models

import (
	"time"
)

// AppBranding defines dynamic enterprise appearance, logo, and theme colors
type AppBranding struct {
	ID             string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	AppName        string    `gorm:"type:varchar(100);default:'BIONET'" json:"app_name"`
	AppTagline     string    `gorm:"type:varchar(200);default:'Mitra Enterprise Hub'" json:"app_tagline"`
	LogoURL        string    `gorm:"type:text" json:"logo_url"`
	FaviconURL     string    `gorm:"type:text" json:"favicon_url"`
	PrimaryColor   string    `gorm:"type:varchar(32);default:'#059669'" json:"primary_color"`   // Default Emerald Herbal
	SecondaryColor string    `gorm:"type:varchar(32);default:'#06b6d4'" json:"secondary_color"` // Default Cyan Accent
	AccentColor    string    `gorm:"type:varchar(32);default:'#f59e0b'" json:"accent_color"`    // Default Gold
	UpdatedAt      time.Time `json:"updated_at"`
}

// UpdateBrandingRequest DTO for updating branding settings
type UpdateBrandingRequest struct {
	AppName        string `json:"app_name"`
	AppTagline     string `json:"app_tagline"`
	LogoURL        string `json:"logo_url"`
	FaviconURL     string `json:"favicon_url"`
	PrimaryColor   string `json:"primary_color"`
	SecondaryColor string `json:"secondary_color"`
	AccentColor    string `json:"accent_color"`
}

