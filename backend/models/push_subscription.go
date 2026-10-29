package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PushSubscription stores browser web push subscriptions for PWA notifications
type PushSubscription struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;index" json:"user_id"`
	Endpoint  string    `gorm:"type:text;not null" json:"endpoint"`
	P256dh    string    `gorm:"type:varchar(255);not null" json:"p256dh"`
	Auth      string    `gorm:"type:varchar(255);not null" json:"auth"`
	UserAgent string    `gorm:"type:varchar(255)" json:"user_agent"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (ps *PushSubscription) BeforeCreate(tx *gorm.DB) (err error) {
	if ps.ID == "" {
		ps.ID = uuid.New().String()
	}
	return
}
