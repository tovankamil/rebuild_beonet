package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LeaderboardEntry represents a ranked performer in Bionet ecosystem
type LeaderboardEntry struct {
	Rank       int     `json:"rank"`
	UserID     string  `json:"user_id"`
	Username   string  `json:"username"`
	FullName   string  `json:"full_name"`
	Avatar     string  `json:"avatar"`
	City       string  `json:"city"`
	Score      float64 `json:"score"`
	ScoreLabel string  `json:"score_label"`
	Badge      string  `json:"badge"`
	Type       string  `json:"type"`   // 'sponsor', 'omset', 'pairing'
	Period     string  `json:"period"` // 'daily', 'monthly'
}

// RewardItem represents a milestone goal in Bionet Reward Race
type RewardItem struct {
	ID                 string  `json:"id"`
	Name               string  `json:"name"`
	RequiredLeft       float64 `json:"required_left"`
	RequiredRight      float64 `json:"required_right"`
	CurrentLeft        float64 `json:"current_left"`
	CurrentRight       float64 `json:"current_right"`
	ProgressPercentage float64 `json:"progress_percentage"`
	IsAchieved         bool    `json:"is_achieved"`
	IsClaimed          bool    `json:"is_claimed"`
	Icon               string  `json:"icon"`
	ImageURL           string  `json:"image_url"`
	ValueDescription   string  `json:"value_description"`
	Tier               int     `json:"tier"`
}

// AcademyQuizQuestion represents an evaluation question in an academy module
type AcademyQuizQuestion struct {
	ID          int      `json:"id"`
	Question    string   `json:"question"`
	Options     []string `json:"options"`
	AnswerIndex int      `json:"answer_index"`
	Explanation string   `json:"explanation"`
}

// AcademyModule represents one of the 7 core training modules for Bionet distributors
type AcademyModule struct {
	ID          string                `json:"id"`
	Order       int                   `json:"order"`
	Title       string                `json:"title"`
	Category    string                `json:"category"`
	Duration    string                `json:"duration"`
	Summary     string                `json:"summary"`
	Content     string                `json:"content"`
	VideoURL    string                `json:"video_url"`
	BadgeName   string                `json:"badge_name"`
	BadgeIcon   string                `json:"badge_icon"`
	Questions   []AcademyQuizQuestion `json:"questions"`
	IsCompleted bool                  `json:"is_completed"`
	CompletedAt *time.Time            `json:"completed_at,omitempty"`
}

// AcademyCompletion tracks user completion and certification of modules
type AcademyCompletion struct {
	ID           string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID       string    `gorm:"type:varchar(36);index;not null" json:"user_id"`
	ModuleID     string    `gorm:"type:varchar(50);index;not null" json:"module_id"`
	Score        int       `gorm:"type:int;default:100" json:"score"`
	Passed       bool      `gorm:"default:true" json:"passed"`
	BadgeAwarded string    `gorm:"type:varchar(100)" json:"badge_awarded"`
	CompletedAt  time.Time `gorm:"autoCreateTime" json:"completed_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (ac *AcademyCompletion) BeforeCreate(tx *gorm.DB) (err error) {
	if ac.ID == "" {
		ac.ID = uuid.New().String()
	}
	return
}

// InactivityAlert represents an inactive downline that needs coaching
type InactivityAlert struct {
	DownlineID            string `json:"downline_id"`
	Username              string `json:"username"`
	FullName              string `json:"full_name"`
	Phone                 string `json:"phone"`
	City                  string `json:"city"`
	DaysInactive          int    `json:"days_inactive"`
	LegPosition           string `json:"leg_position"` // 'left' or 'right'
	LastActivity          string `json:"last_activity"`
	SuggestedWhatsAppText string `json:"suggested_whatsapp_text"`
}
