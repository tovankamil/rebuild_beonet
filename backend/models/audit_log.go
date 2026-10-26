package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuditLog struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);index" json:"user_id"`
	Action    string    `gorm:"type:varchar(20);not null;index" json:"action"` // CREATE, UPDATE, DELETE, SOFT_DELETE
	TableName string    `gorm:"type:varchar(50);not null;index" json:"table_name"`
	RecordID  string    `gorm:"type:varchar(100);not null;index" json:"record_id"`
	OldValues string    `gorm:"type:text" json:"old_values,omitempty"`
	NewValues string    `gorm:"type:text" json:"new_values,omitempty"`
	IPAddress string    `gorm:"type:varchar(50)" json:"ip_address,omitempty"`
	UserAgent string    `gorm:"type:varchar(255)" json:"user_agent,omitempty"`
	CreatedAt time.Time `gorm:"autoCreateTime;index" json:"created_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"user,omitempty"`
}

func (al *AuditLog) BeforeCreate(tx *gorm.DB) (err error) {
	if al.ID == "" {
		al.ID = uuid.New().String()
	}
	return
}
