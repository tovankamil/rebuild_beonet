package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FraudCase struct {
	ID          string     `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      string     `gorm:"type:char(36);index" json:"user_id"`
	RuleKey     string     `gorm:"type:varchar(50);not null;index" json:"rule_key"` // DUPLICATE_BANK, DUPLICATE_KTP, WITHDRAWAL_SPIKE, NETWORK_STACKING
	RiskLevel   string     `gorm:"type:enum('high','medium','low');default:'medium';index" json:"risk_level"`
	Title       string     `gorm:"type:varchar(150);not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	DetailsJSON string     `gorm:"type:text" json:"details_json,omitempty"`
	Status      string     `gorm:"type:enum('open','investigating','resolved','dismissed');default:'open';index" json:"status"`
	ActionTaken string     `gorm:"type:varchar(50);default:'NONE'" json:"action_taken,omitempty"` // NONE, FROZEN, WARNED, CLEARED
	ResolvedBy  *string    `gorm:"type:char(36)" json:"resolved_by,omitempty"`
	ResolvedAt  *time.Time `json:"resolved_at,omitempty"`
	CreatedAt   time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (fc *FraudCase) BeforeCreate(tx *gorm.DB) (err error) {
	if fc.ID == "" {
		fc.ID = uuid.New().String()
	}
	return
}

type FraudOverviewDTO struct {
	TotalCases       int64       `json:"total_cases"`
	HighRiskCount    int64       `json:"high_risk_count"`
	MediumRiskCount  int64       `json:"medium_risk_count"`
	LowRiskCount     int64       `json:"low_risk_count"`
	OpenCasesCount   int64       `json:"open_cases_count"`
	ResolvedCount    int64       `json:"resolved_count"`
	FrozenUsersCount int64       `json:"frozen_users_count"`
	Cases            []FraudCase `json:"cases"`
}
