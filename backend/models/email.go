package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EmailConfig struct {
	ID             string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID         string    `gorm:"type:char(36);not null;index" json:"user_id"`
	Provider       string    `gorm:"type:varchar(50);default:'custom'" json:"provider"` // 'gmail', 'custom'
	EmailAddress   string    `gorm:"type:varchar(150);not null" json:"email_address"`
	SenderName     string    `gorm:"type:varchar(100);default:'Bionet Official'" json:"sender_name"`
	SMTPHost       string    `gorm:"type:varchar(150);not null" json:"smtp_host"`
	SMTPPort       int       `gorm:"default:587" json:"smtp_port"`
	SMTPUsername   string    `gorm:"type:varchar(150);not null" json:"smtp_username"`
	SMTPPassword   string    `gorm:"type:varchar(255);not null" json:"smtp_password"`
	SMTPEncryption string    `gorm:"type:varchar(20);default:'tls'" json:"smtp_encryption"` // 'tls', 'ssl', 'none'
	IMAPHost       string    `gorm:"type:varchar(150);not null" json:"imap_host"`
	IMAPPort       int       `gorm:"default:993" json:"imap_port"`
	IMAPUsername   string    `gorm:"type:varchar(150);not null" json:"imap_username"`
	IMAPPassword   string    `gorm:"type:varchar(255);not null" json:"imap_password"`
	IMAPEncryption string    `gorm:"type:varchar(20);default:'ssl'" json:"imap_encryption"` // 'ssl', 'none'
	IsActive       bool      `gorm:"default:true" json:"is_active"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (ec *EmailConfig) BeforeCreate(tx *gorm.DB) (err error) {
	if ec.ID == "" {
		ec.ID = uuid.New().String()
	}
	return
}

type EmailSummary struct {
	SeqNum    uint32    `json:"seq_num"`
	UID       uint32    `json:"uid"`
	MessageID string    `json:"message_id"`
	From      string    `json:"from"`
	To        string    `json:"to"`
	Subject   string    `json:"subject"`
	Date      time.Time `json:"date"`
	Snippet   string    `json:"snippet"`
	IsSeen    bool      `json:"is_seen"`
}

type EmailDetail struct {
	SeqNum    uint32    `json:"seq_num"`
	UID       uint32    `json:"uid"`
	MessageID string    `json:"message_id"`
	From      string    `json:"from"`
	To        string    `json:"to"`
	Subject   string    `json:"subject"`
	Date      time.Time `json:"date"`
	BodyText  string    `json:"body_text"`
	BodyHTML  string    `json:"body_html"`
	InReplyTo string    `json:"in_reply_to"`
}

type SendEmailPayload struct {
	To          string            `json:"to" binding:"required"`
	Subject     string            `json:"subject" binding:"required"`
	Body        string            `json:"body" binding:"required"`
	InReplyTo   string            `json:"in_reply_to"`
	Attachments []EmailAttachment `json:"attachments"`
}

type EmailAttachment struct {
	Filename    string `json:"filename"`
	ContentType string `json:"content_type"`
	Data        string `json:"data"` // base64 string
	Size        int64  `json:"size"`
}

