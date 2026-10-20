package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Withdrawal struct {
	ID                string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID            string    `gorm:"type:char(36);not null;index" json:"user_id"`
	BankID            *string   `gorm:"type:char(36);index" json:"bank_id"`
	Amount            float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	AdminFee          float64   `gorm:"type:decimal(15,2);default:0.00" json:"admin_fee"`
	NetAmount         float64   `gorm:"type:decimal(15,2);not null" json:"net_amount"`
	Status            string    `gorm:"type:enum('pending','processing','completed','failed');default:'pending'" json:"status"`
	FlipTransactionID *string   `gorm:"type:varchar(100)" json:"flip_transaction_id"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User     `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	Bank *UserBank `gorm:"foreignKey:BankID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"bank,omitempty"`
}

func (w *Withdrawal) BeforeCreate(tx *gorm.DB) (err error) {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return
}

type WithdrawalRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}
