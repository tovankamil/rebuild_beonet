package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SystemIncidentLog struct {
	ID         string     `gorm:"type:char(36);primaryKey" json:"id"`
	Component  string     `gorm:"type:varchar(50);not null;index" json:"component"` // 'whatsapp_engine', 'database', 'email_smtp', 'tiktok_api', 'gemini_ai', 'system_runtime'
	Level      string     `gorm:"type:varchar(20);not null;index" json:"level"`     // 'critical', 'error', 'warning', 'info'
	Title      string     `gorm:"type:varchar(200);not null" json:"title"`
	Message    string     `gorm:"type:text;not null" json:"message"`
	Payload    string     `gorm:"type:text" json:"payload,omitempty"`
	IsResolved bool       `gorm:"default:false;index" json:"is_resolved"`
	ResolvedAt *time.Time `json:"resolved_at,omitempty"`
	ResolvedBy string     `gorm:"type:varchar(100)" json:"resolved_by,omitempty"`
	CreatedAt  time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (sil *SystemIncidentLog) BeforeCreate(tx *gorm.DB) (err error) {
	if sil.ID == "" {
		sil.ID = uuid.New().String()
	}
	return
}

type IncidentStats struct {
	TotalIncidents    int64            `json:"total_incidents"`
	ActiveIncidents   int64            `json:"active_incidents"`
	CriticalIncidents int64            `json:"critical_incidents"`
	ResolvedIncidents int64            `json:"resolved_incidents"`
	SystemHealthRate  float64          `json:"system_health_rate"` // e.g. 99.8%
	ComponentStatus   map[string]string `json:"component_status"`  // 'operational', 'degraded', 'down'
}

