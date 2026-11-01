package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PaymentTransaction menyimpan riwayat transaksi Snap Midtrans & Webhook
type PaymentTransaction struct {
	ID                string     `gorm:"type:char(36);primaryKey" json:"id"`
	OrderID           string     `gorm:"type:varchar(100);not null;uniqueIndex" json:"order_id"`
	UserID            string     `gorm:"type:char(36);index" json:"user_id"`
	TransactionType   string     `gorm:"type:varchar(50);default:'payment'" json:"transaction_type"` // repeat_order, pin_purchase, membership
	GrossAmount       int64      `gorm:"not null" json:"gross_amount"`
	PaymentType       string     `gorm:"type:varchar(50)" json:"payment_type"`
	TransactionStatus string     `gorm:"type:varchar(50);default:'pending';index" json:"transaction_status"` // pending, settlement, expire, cancel, deny
	FraudStatus       string     `gorm:"type:varchar(50)" json:"fraud_status"`
	SnapToken         string     `gorm:"type:varchar(255)" json:"snap_token"`
	RedirectURL       string     `gorm:"type:varchar(255)" json:"redirect_url"`
	SettlementTime    *time.Time `json:"settlement_time,omitempty"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user,omitempty"`
}

func (pt *PaymentTransaction) BeforeCreate(tx *gorm.DB) (err error) {
	if pt.ID == "" {
		pt.ID = uuid.New().String()
	}
	return
}
