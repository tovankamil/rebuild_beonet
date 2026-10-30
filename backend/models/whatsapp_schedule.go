package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WhatsAppSchedule represents a scheduled automated follow-up message via WhatsApp
type WhatsAppSchedule struct {
	ID          string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID      string    `gorm:"type:varchar(36);index;not null" json:"user_id"`
	LeadID      string    `gorm:"type:varchar(36);index" json:"lead_id"`
	Recipient   string    `gorm:"type:varchar(150);not null" json:"recipient"`
	Phone       string    `gorm:"type:varchar(30);index;not null" json:"phone"`
	Message     string    `gorm:"type:text;not null" json:"message"`
	Category    string    `gorm:"type:varchar(50);default:'crm_followup'" json:"category"`
	ScheduledAt time.Time `gorm:"index;not null" json:"scheduled_at"`
	Status      string    `gorm:"type:varchar(30);default:'scheduled'" json:"status"` // 'scheduled', 'sent', 'cancelled'
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	// Optional relations
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Lead *Lead `gorm:"foreignKey:LeadID" json:"lead,omitempty"`
}

func (ws *WhatsAppSchedule) BeforeCreate(tx *gorm.DB) (err error) {
	if ws.ID == "" {
		ws.ID = uuid.New().String()
	}
	return
}
