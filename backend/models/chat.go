package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatMessage struct {
	ID             string         `gorm:"type:char(36);primaryKey" json:"id"`
	SenderID       string         `gorm:"type:char(36);not null;index" json:"sender_id"`
	ReceiverID     string         `gorm:"type:char(36);index" json:"receiver_id"` // user id of recipient or empty for support
	Room           string         `gorm:"type:varchar(50);default:'support';index" json:"room"`
	Message        string         `gorm:"type:text;not null" json:"message"`
	AttachmentURL  string         `gorm:"type:varchar(255)" json:"attachment_url,omitempty"`
	AttachmentType string         `gorm:"type:varchar(50)" json:"attachment_type,omitempty"` // image, document
	AttachmentName string         `gorm:"type:varchar(150)" json:"attachment_name,omitempty"`
	AttachmentSize int64          `json:"attachment_size,omitempty"`
	IsRead         bool           `gorm:"default:false;index" json:"is_read"`
	CreatedAt      time.Time      `gorm:"autoCreateTime" json:"created_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`

	Sender   *User `gorm:"foreignKey:SenderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sender,omitempty"`
	Receiver *User `gorm:"foreignKey:ReceiverID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"receiver,omitempty"`
}

func (cm *ChatMessage) BeforeCreate(tx *gorm.DB) (err error) {
	if cm.ID == "" {
		cm.ID = uuid.New().String()
	}
	return
}
