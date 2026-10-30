package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BioProductItem represents a product showcased on the mitra's bio link page
type BioProductItem struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	PV          int     `json:"pv"`
	ImageURL    string  `json:"image_url"`
	Description string  `json:"description"`
	Badge       string  `json:"badge"`
	BuyLink     string  `json:"buy_link,omitempty"`
}

// BioTestimonialItem represents a social proof testimonial on the bio link page
type BioTestimonialItem struct {
	ID           string `json:"id"`
	CustomerName string `json:"customer_name"`
	Headline     string `json:"headline"`
	Story        string `json:"story"`
	City         string `json:"city"`
	Rating       int    `json:"rating"`
	Avatar       string `json:"avatar,omitempty"`
}

// BioPage represents a distributor/mitra's public Bio-Link and sales funnel landing page
type BioPage struct {
	ID               string               `gorm:"type:varchar(36);primaryKey" json:"id"`
	UserID           string               `gorm:"type:varchar(36);index;not null" json:"user_id"`
	Username         string               `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	Slug             string               `gorm:"type:varchar(100);index" json:"slug"`
	Title            string               `gorm:"type:varchar(150);not null" json:"title"`
	Bio              string               `gorm:"type:text" json:"bio"`
	Theme            string               `gorm:"type:varchar(30);default:'emerald'" json:"theme"` // 'emerald', 'gold', 'cyber', 'minimal'
	Avatar           string               `gorm:"type:varchar(255)" json:"avatar"`
	WhatsAppNumber   string               `gorm:"type:varchar(30)" json:"whatsapp_number"`
	InstagramURL     string               `gorm:"type:varchar(255)" json:"instagram_url"`
	TikTokURL        string               `gorm:"type:varchar(255)" json:"tiktok_url"`
	YouTubeVideoID   string               `gorm:"type:varchar(50)" json:"youtube_video_id"`
	FeaturedProducts []BioProductItem     `gorm:"type:text;serializer:json" json:"featured_products"`
	Testimonials     []BioTestimonialItem `gorm:"type:text;serializer:json" json:"testimonials"`
	CTAButtonText    string               `gorm:"type:varchar(100);default:'Konsultasi Herbal via WhatsApp'" json:"cta_button_text"`
	CTAButtonURL     string               `gorm:"type:varchar(255)" json:"cta_button_url"`
	TotalViews       int64                `gorm:"default:0" json:"total_views"`
	TotalLeads       int64                `gorm:"default:0" json:"total_leads"`
	CreatedAt        time.Time            `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time            `gorm:"autoUpdateTime" json:"updated_at"`

	// Optional relation
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (b *BioPage) BeforeCreate(tx *gorm.DB) (err error) {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return
}
