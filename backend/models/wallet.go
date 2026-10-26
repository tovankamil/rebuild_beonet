package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Wallet struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;uniqueIndex" json:"user_id"`
	Balance   float64   `gorm:"type:decimal(15,2);default:0.00" json:"balance"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (w *Wallet) BeforeCreate(tx *gorm.DB) (err error) {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return
}

type WalletTransaction struct {
	ID              string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID          string    `gorm:"type:char(36);not null;index:idx_user_date" json:"user_id"`
	Type            string    `gorm:"type:enum('debit','credit');not null" json:"type"`
	Amount          float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	BalanceAfter    float64   `gorm:"type:decimal(15,2);not null" json:"balance_after"`
	Description     string    `gorm:"type:varchar(255);not null" json:"description"`
	TransactionDate time.Time `gorm:"autoCreateTime;index:idx_user_date" json:"transaction_date"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (wt *WalletTransaction) BeforeCreate(tx *gorm.DB) (err error) {
	if wt.ID == "" {
		wt.ID = uuid.New().String()
	}
	if wt.TransactionDate.IsZero() {
		wt.TransactionDate = time.Now()
	}
	if wt.CreatedAt.IsZero() {
		wt.CreatedAt = wt.TransactionDate
	}
	return
}

type PointBalance struct {
	ID         string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID     string    `gorm:"type:char(36);not null;uniqueIndex" json:"user_id"`
	PointLeft  float64   `gorm:"type:decimal(15,2);default:0.00" json:"point_left"`
	PointRight float64   `gorm:"type:decimal(15,2);default:0.00" json:"point_right"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (pb *PointBalance) BeforeCreate(tx *gorm.DB) (err error) {
	if pb.ID == "" {
		pb.ID = uuid.New().String()
	}
	return
}
