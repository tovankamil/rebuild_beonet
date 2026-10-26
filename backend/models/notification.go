package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Notification struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;index" json:"user_id"`
	Title     string    `gorm:"type:varchar(200);not null" json:"title"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	Type      string    `gorm:"type:varchar(50);default:'transaction';index" json:"type"` // transaction, chat, withdrawal, pin, system
	Link      string    `gorm:"type:varchar(255)" json:"link"`
	IsRead    bool      `gorm:"default:false;index" json:"is_read"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (n *Notification) BeforeCreate(tx *gorm.DB) (err error) {
	if n.ID == "" {
		n.ID = uuid.New().String()
	}
	return
}
