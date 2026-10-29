package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           string         `gorm:"type:char(36);primaryKey" json:"id"`
	Username     string         `gorm:"type:varchar(50);unique;not null" json:"username"`
	FullName     string         `gorm:"type:varchar(150);not null" json:"full_name"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Role         string         `gorm:"type:varchar(30);default:'member'" json:"role"`
	Phone        *string        `gorm:"type:varchar(20)" json:"phone"`
	KTP          string         `gorm:"type:varchar(30)" json:"ktp"`
	NPWP         string         `gorm:"type:varchar(30)" json:"npwp"`
	Avatar       string         `gorm:"type:varchar(255)" json:"avatar"`
	Status       string         `gorm:"type:enum('active','suspended','pending');default:'active'" json:"status"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return
}
