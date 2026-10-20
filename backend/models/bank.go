package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserBank struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID        string    `gorm:"type:char(36);not null;index" json:"user_id"`
	BankName      string    `gorm:"type:varchar(100);not null" json:"bank_name"`
	AccountNumber string    `gorm:"type:varchar(50);not null" json:"account_number"`
	AccountName   string    `gorm:"type:varchar(150);not null" json:"account_name"`
	IsPrimary     bool      `gorm:"default:true" json:"is_primary"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (ub *UserBank) BeforeCreate(tx *gorm.DB) (err error) {
	if ub.ID == "" {
		ub.ID = uuid.New().String()
	}
	return
}
