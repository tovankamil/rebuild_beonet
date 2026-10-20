package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserAddress struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID        string    `gorm:"type:char(36);not null;index" json:"user_id"`
	RecipientName string    `gorm:"type:varchar(150);not null" json:"recipient_name"`
	Phone         string    `gorm:"type:varchar(20);not null" json:"phone"`
	Address       string    `gorm:"type:text;not null" json:"address"`
	Province      string    `gorm:"type:varchar(100);not null" json:"province"`
	City          string    `gorm:"type:varchar(100);not null" json:"city"`
	District      string    `gorm:"type:varchar(100);not null" json:"district"`
	PostalCode    string    `gorm:"type:varchar(10);not null" json:"postal_code"`
	IsPrimary     bool      `gorm:"default:true" json:"is_primary"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (ua *UserAddress) BeforeCreate(tx *gorm.DB) (err error) {
	if ua.ID == "" {
		ua.ID = uuid.New().String()
	}
	return
}
