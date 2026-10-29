package models

import (
	"time"
)

// Lead represents a prospective customer or prospective downline member in Bionet CRM
type Lead struct {
	ID              string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID          string    `gorm:"type:varchar(36);index;not null" json:"user_id"` // Owner Mitra ID
	Name            string    `gorm:"type:varchar(150);not null" json:"name"`
	Phone           string    `gorm:"type:varchar(30);index;not null" json:"phone"`
	Email           string    `gorm:"type:varchar(150)" json:"email"`
	City            string    `gorm:"type:varchar(100)" json:"city"`
	Source          string    `gorm:"type:varchar(50);default:'manual'" json:"source"` // 'store_affiliate', 'webinar_bop', 'referral_link', 'manual', 'instagram', 'tiktok'
	ProductInterest string    `gorm:"type:varchar(150)" json:"product_interest"`        // e.g. 'Bio-Propolis Trigona', 'Paket Bisnis Gold'
	Status          string    `gorm:"type:varchar(30);default:'new'" json:"status"`    // 'new', 'contacted', 'interested', 'webinar', 'closing', 'lost'
	Notes           string    `gorm:"type:text" json:"notes"`
	EstimatedValue  float64   `gorm:"type:decimal(15,2);default:0" json:"estimated_value"`
	LastContactedAt *time.Time `json:"last_contacted_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Optional relations
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

