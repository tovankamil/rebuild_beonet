package models

import (
	"time"

	"gorm.io/gorm"
)

// Meeting represents a video conference / webinar room
type Meeting struct {
	ID              string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	RoomID          string         `gorm:"type:varchar(64);uniqueIndex;not null" json:"room_id"`
	Title           string         `gorm:"type:varchar(255);not null" json:"title"`
	Description     string         `gorm:"type:text" json:"description"`
	Category        string         `gorm:"type:varchar(32);default:'bop'" json:"category"` // 'bop', 'kyc', 'herbal', 'training'
	HostID          string         `gorm:"type:varchar(36);not null" json:"host_id"`
	HostName        string         `gorm:"type:varchar(128)" json:"host_name"`
	Password        string         `gorm:"type:varchar(64)" json:"password,omitempty"`
	ScheduledAt     time.Time      `json:"scheduled_at"`
	Status          string         `gorm:"type:varchar(20);default:'scheduled'" json:"status"` // 'scheduled', 'live', 'ended'
	MaxParticipants int            `gorm:"default:100" json:"max_participants"`
	RecordingURL    string         `gorm:"type:varchar(255)" json:"recording_url,omitempty"`
	RecordingStatus string         `gorm:"type:varchar(32);default:'none'" json:"recording_status,omitempty"` // 'none', 'processing', 'ready'
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

// MeetingAttendee represents a registered guest or participant for a public/private meeting
type MeetingAttendee struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	RoomID    string    `gorm:"type:varchar(64);index;not null" json:"room_id"`
	FullName  string    `gorm:"type:varchar(128);not null" json:"full_name"`
	Email     string    `gorm:"type:varchar(128);not null" json:"email"`
	Phone     string    `gorm:"type:varchar(32);not null" json:"phone"`
	Address   string    `gorm:"type:text;not null" json:"address"`
	Role      string    `gorm:"type:varchar(20);default:'guest'" json:"role"` // 'guest', 'member'
	JoinedAt  time.Time `json:"joined_at"`
	CreatedAt time.Time `json:"created_at"`
}

// MeetingParticipant represents an active live participant currently in the room
type MeetingParticipant struct {
	ID         string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	RoomID     string    `gorm:"type:varchar(64);index;not null" json:"room_id"`
	UserID     string    `gorm:"type:varchar(36);not null" json:"user_id"`
	Username   string    `gorm:"type:varchar(64);not null" json:"username"`
	FullName   string    `gorm:"type:varchar(128);not null" json:"full_name"`
	Role       string    `gorm:"type:varchar(20);default:'member'" json:"role"` // 'admin', 'host', 'member', 'guest'
	IsCameraOn bool      `gorm:"default:true" json:"is_camera_on"`
	IsMicOn    bool      `gorm:"default:true" json:"is_mic_on"`
	IsHandUp   bool      `gorm:"default:false" json:"is_hand_up"`
	LastSeenAt time.Time `gorm:"index" json:"last_seen_at"`
	JoinedAt   time.Time `json:"joined_at"`
}


