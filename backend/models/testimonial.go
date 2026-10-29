package models

import (
	"time"
)

// TestimonialItem represents a verified customer testimonial for closing and proof repository
type TestimonialItem struct {
	ID           string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Category     string    `gorm:"type:varchar(50);index;not null" json:"category"` // "asam_urat", "diabetes", "kolesterol", "lambung", "vitalitas", "bisnis"
	CustomerName string    `gorm:"type:varchar(150);not null" json:"customer_name"`
	City         string    `gorm:"type:varchar(100)" json:"city"`
	Headline     string    `gorm:"type:varchar(255);not null" json:"headline"`
	Story        string    `gorm:"type:text;not null" json:"story"`
	ProofType    string    `gorm:"type:varchar(50);default:'whatsapp_chat'" json:"proof_type"` // "whatsapp_chat", "before_after", "clinical_lab"
	BpomVerified bool      `gorm:"default:true" json:"bpom_verified"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
