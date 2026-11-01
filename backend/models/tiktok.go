package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TikTokConfig struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID       string    `gorm:"type:char(36);not null;index" json:"user_id"`
	AccountName  string    `gorm:"type:varchar(100);not null" json:"account_name"`
	ClientKey    string    `gorm:"type:varchar(150)" json:"client_key"`
	ClientSecret string    `gorm:"type:varchar(150)" json:"client_secret"`
	AccessToken  string    `gorm:"type:text" json:"access_token"`
	OpenID       string    `gorm:"type:varchar(100)" json:"open_id"`
	IsConnected  bool      `gorm:"default:true" json:"is_connected"`
	FollowerCount int      `gorm:"default:0" json:"follower_count"`
	TotalLikes   int       `gorm:"default:0" json:"total_likes"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (tc *TikTokConfig) BeforeCreate(tx *gorm.DB) (err error) {
	if tc.ID == "" {
		tc.ID = uuid.New().String()
	}
	return
}

type TikTokVideo struct {
	ID             string    `gorm:"type:char(36);primaryKey" json:"id"`
	VideoID        string    `gorm:"type:varchar(100);not null;uniqueIndex" json:"video_id"`
	Title          string    `gorm:"type:text;not null" json:"title"`
	CoverImageURL  string    `gorm:"type:varchar(255)" json:"cover_image_url"`
	VideoURL       string    `gorm:"type:varchar(255)" json:"video_url"`
	ViewCount      int64     `gorm:"default:0" json:"view_count"`
	LikeCount      int64     `gorm:"default:0" json:"like_count"`
	CommentCount   int64     `gorm:"default:0" json:"comment_count"`
	ShareCount     int64     `gorm:"default:0" json:"share_count"`
	DurationSecond int       `gorm:"default:0" json:"duration_second"`
	PublishedAt    time.Time `json:"published_at"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (tv *TikTokVideo) BeforeCreate(tx *gorm.DB) (err error) {
	if tv.ID == "" {
		tv.ID = uuid.New().String()
	}
	return
}

type TikTokComment struct {
	ID              string    `gorm:"type:char(36);primaryKey" json:"id"`
	CommentID       string    `gorm:"type:varchar(100);not null;uniqueIndex" json:"comment_id"`
	VideoID         string    `gorm:"type:varchar(100);not null;index" json:"video_id"`
	AuthorUsername  string    `gorm:"type:varchar(100);not null" json:"author_username"`
	AuthorNickname  string    `gorm:"type:varchar(150)" json:"author_nickname"`
	AuthorAvatar    string    `gorm:"type:varchar(255)" json:"author_avatar"`
	Text            string    `gorm:"type:text;not null" json:"text"`
	LikeCount       int       `gorm:"default:0" json:"like_count"`
	ReplyCount      int       `gorm:"default:0" json:"reply_count"`
	IsConvertedLead bool      `gorm:"default:false" json:"is_converted_lead"`
	ConvertedLeadID *string   `gorm:"type:char(36)" json:"converted_lead_id,omitempty"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (tc *TikTokComment) BeforeCreate(tx *gorm.DB) (err error) {
	if tc.ID == "" {
		tc.ID = uuid.New().String()
	}
	return
}

type TikTokOverviewKPI struct {
	TotalViews       int64   `json:"total_views"`
	TotalLikes       int64   `json:"total_likes"`
	TotalComments    int64   `json:"total_comments"`
	TotalShares      int64   `json:"total_shares"`
	EngagementRate   float64 `json:"engagement_rate"`
	ConvertedLeads   int64   `json:"converted_leads"`
	IsAccountLinked  bool    `json:"is_account_linked"`
	ConnectedAccount string  `json:"connected_account"`
}

