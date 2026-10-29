package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Certificate represents an official digital certificate or award awarded to a member
type Certificate struct {
	ID            string    `gorm:"type:char(36);primaryKey" json:"id"`
	CertNo        string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"cert_no"`
	UserID        string    `gorm:"type:char(36);index" json:"user_id"`
	RecipientName string    `gorm:"type:varchar(150);not null" json:"recipient_name"`
	AwardTitle    string    `gorm:"type:varchar(200);not null" json:"award_title"`
	IssueDate     time.Time `json:"issue_date"`
	Status        string    `gorm:"type:varchar(30);default:'verified'" json:"status"`
	Issuer        string    `gorm:"type:varchar(150);default:'PT Bionet Herbal Indonesia'" json:"issuer"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user,omitempty"`
}

func (c *Certificate) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return
}
