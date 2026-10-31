package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PinPackage struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	Price        float64   `gorm:"type:decimal(15,2);not null" json:"price"`
	SponsorBonus float64   `gorm:"type:decimal(15,2);default:0.00" json:"sponsor_bonus"`
	PairingBonus float64   `gorm:"type:decimal(15,2);default:0.00" json:"pairing_bonus"`
	Points       float64   `gorm:"type:decimal(15,2);default:1.00" json:"points"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (pp *PinPackage) BeforeCreate(tx *gorm.DB) (err error) {
	if pp.ID == "" {
		pp.ID = uuid.New().String()
	}
	return
}

type Pin struct {
	ID         string     `gorm:"type:char(36);primaryKey" json:"id"`
	SerialCode string     `gorm:"type:varchar(50);not null;uniqueIndex" json:"serial_code"`
	PackageID  string     `gorm:"type:char(36);not null;index" json:"package_id"`
	OwnerID    string     `gorm:"type:char(36);not null;index:idx_pins_owner" json:"owner_id"`
	UsedByID   *string    `gorm:"type:char(36);index" json:"used_by_id"`
	Status     string     `gorm:"type:enum('active','used','transferred');default:'active';index:idx_pins_owner" json:"status"`
	CreatedAt  time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UsedAt     *time.Time `json:"used_at"`

	Package *PinPackage `gorm:"foreignKey:PackageID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"package,omitempty"`
	Owner   *User       `gorm:"foreignKey:OwnerID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"owner,omitempty"`
	UsedBy  *User       `gorm:"foreignKey:UsedByID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"used_by,omitempty"`
}

func (p *Pin) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return
}

type PinTransfer struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	PinID         string    `gorm:"type:char(36);not null;index" json:"pin_id"`
	FromUserID    string    `gorm:"type:char(36);not null;index" json:"from_user_id"`
	ToUserID      string    `gorm:"type:char(36);not null;index" json:"to_user_id"`
	TransferredAt time.Time `gorm:"autoCreateTime" json:"transferred_at"`

	Pin      *Pin  `gorm:"foreignKey:PinID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"pin,omitempty"`
	FromUser *User `gorm:"foreignKey:FromUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"from_user,omitempty"`
	ToUser   *User `gorm:"foreignKey:ToUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"to_user,omitempty"`
}

func (pt *PinTransfer) BeforeCreate(tx *gorm.DB) (err error) {
	if pt.ID == "" {
		pt.ID = uuid.New().String()
	}
	return
}

type TransferPinRequest struct {
	PinID          string `json:"pin_id" binding:"required"`
	TargetUsername string `json:"target_username" binding:"required"`
}

type RegisterDownlineRequest struct {
	PinID    string `json:"pin_id" binding:"required"`
	UplineID string `json:"upline_id" binding:"required"`
	Position string `json:"position" binding:"required"` // "kiri" atau "kanan"
	Username string `json:"username" binding:"required"`
	FullName string `json:"full_name" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone" binding:"required"`
	KTP      string `json:"ktp"`
}

type RegisterDownlineResponse struct {
	User          User    `json:"user"`
	Pin           Pin     `json:"pin"`
	Position      string  `json:"position"`
	Upline        User    `json:"upline"`
	SponsorBonus  float64 `json:"sponsor_bonus"`
	PointsAwarded float64 `json:"points_awarded"`
	WalletBalance float64 `json:"wallet_balance"`
}
