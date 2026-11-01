package models

import (
	"time"
)

// RankDefinition mendefinisikan tingkatan jenjang karir dan kualifikasi reward Bionet
type RankDefinition struct {
	ID              string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Code            string    `gorm:"type:varchar(30);uniqueIndex;not null" json:"code"` // BRONZE, SILVER, GOLD, EMERALD, CROWN
	Name            string    `gorm:"type:varchar(100);not null" json:"name"`
	RequiredLeftPV  int64     `gorm:"not null" json:"required_left_pv"`
	RequiredRightPV int64     `gorm:"not null" json:"required_right_pv"`
	RewardTitle     string    `gorm:"type:varchar(150);not null" json:"reward_title"`
	RewardValue     int64     `gorm:"not null" json:"reward_value"` // Nilai ekuivalen Rupiah
	RewardImage     string    `gorm:"type:varchar(255)" json:"reward_image"`
	BadgeColor      string    `gorm:"type:varchar(30)" json:"badge_color"`
	IconEmoji       string    `gorm:"type:varchar(20)" json:"icon_emoji"`
	OrderLevel      int       `gorm:"not null;default:1" json:"order_level"`
	CreatedAt       time.Time `json:"created_at"`
}

// UserRank mencatat perolehan peringkat seorang mitra
type UserRank struct {
	ID              string     `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID          string     `gorm:"type:varchar(36);index;not null" json:"user_id"`
	RankCode        string     `gorm:"type:varchar(30);not null" json:"rank_code"`
	RankName        string     `gorm:"type:varchar(100);not null" json:"rank_name"`
	LeftPV          int64      `gorm:"not null;default:0" json:"left_pv"`
	RightPV         int64      `gorm:"not null;default:0" json:"right_pv"`
	AchievedAt      time.Time  `json:"achieved_at"`
	IsRewardClaimed bool       `gorm:"default:false" json:"is_reward_claimed"`
	ClaimedAt       *time.Time `json:"claimed_at,omitempty"`
	User            *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// RankRewardClaim mencatat klaim reward yang diajukan atau otomatis dicairkan
type RankRewardClaim struct {
	ID          string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID      string    `gorm:"type:varchar(36);index;not null" json:"user_id"`
	RankCode    string    `gorm:"type:varchar(30);not null" json:"rank_code"`
	RewardTitle string    `gorm:"type:varchar(150);not null" json:"reward_title"`
	RewardValue int64     `gorm:"not null" json:"reward_value"`
	ClaimType   string    `gorm:"type:varchar(30);default:'cash'" json:"claim_type"` // 'cash' (auto-kredit ke dompet) atau 'physical'
	Status      string    `gorm:"type:varchar(30);default:'completed'" json:"status"` // 'completed', 'pending_shipping'
	Notes       string    `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	User        *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
