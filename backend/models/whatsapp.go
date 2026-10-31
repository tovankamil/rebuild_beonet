package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WhatsAppThreadModel persists customer WhatsApp conversation metadata
type WhatsAppThreadModel struct {
	ID              string    `gorm:"type:varchar(64);primaryKey" json:"id"`
	UserID          string    `gorm:"type:varchar(36);index" json:"user_id"`
	Phone           string    `gorm:"type:varchar(30);index;not null" json:"phone"`
	ContactName     string    `gorm:"type:varchar(150);not null" json:"contact_name"`
	Avatar          string    `gorm:"type:varchar(255)" json:"avatar"`
	LeadStage       string    `gorm:"type:varchar(50);default:'new'" json:"lead_stage"`
	Product         string    `gorm:"type:varchar(100)" json:"product"`
	City            string    `gorm:"type:varchar(100)" json:"city"`
	LastMessage     string    `gorm:"type:text" json:"last_message"`
	LastMessageTime time.Time `gorm:"index" json:"last_message_time"`
	UnreadCount     int       `gorm:"default:0" json:"unread_count"`
	IsOnline        bool      `gorm:"default:false" json:"is_online"`
	AIScore         int       `gorm:"default:50" json:"ai_score"`
	AIIntent        string    `gorm:"type:varchar(50);default:'warm_consult'" json:"ai_intent"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (w *WhatsAppThreadModel) BeforeCreate(tx *gorm.DB) (err error) {
	if w.ID == "" {
		w.ID = "th-" + uuid.New().String()
	}
	if w.LastMessageTime.IsZero() {
		w.LastMessageTime = time.Now()
	}
	return
}

// WhatsAppMessageModel persists individual chat messages in a conversation
type WhatsAppMessageModel struct {
	ID        string    `gorm:"type:varchar(80);primaryKey" json:"id"`
	ThreadID  string    `gorm:"type:varchar(64);index;not null" json:"thread_id"`
	Sender    string    `gorm:"type:varchar(20);not null" json:"sender"` // "me" | "contact"
	Text      string    `gorm:"type:text;not null" json:"text"`
	MediaURL  string    `gorm:"type:varchar(500)" json:"media_url,omitempty"`
	MediaType string    `gorm:"type:varchar(50);default:'text'" json:"media_type"`
	Status    string    `gorm:"type:varchar(30);default:'sent'" json:"status"` // "sent", "delivered", "read"
	SentAt    time.Time `gorm:"index;not null" json:"sent_at"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (m *WhatsAppMessageModel) BeforeCreate(tx *gorm.DB) (err error) {
	if m.ID == "" {
		m.ID = "msg-" + uuid.New().String()
	}
	if m.SentAt.IsZero() {
		m.SentAt = time.Now()
	}
	return
}

// WhatsAppContactModel persists CRM phonebook contacts & imported lists
type WhatsAppContactModel struct {
	ID        string    `gorm:"type:varchar(64);primaryKey" json:"id"`
	UserID    string    `gorm:"type:varchar(36);index" json:"user_id"`
	Phone     string    `gorm:"type:varchar(30);index;not null" json:"phone"`
	Name      string    `gorm:"type:varchar(150);not null" json:"name"`
	City      string    `gorm:"type:varchar(100)" json:"city"`
	Category  string    `gorm:"type:varchar(50);default:'lead'" json:"category"` // "member", "lead", "customer", "partner"
	Tags      string    `gorm:"type:varchar(255)" json:"tags"`
	Notes     string    `gorm:"type:text" json:"notes"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (c *WhatsAppContactModel) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = "c-" + uuid.New().String()
	}
	return
}
