package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Sponsor struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;uniqueIndex" json:"user_id"`
	SponsorID string    `gorm:"type:char(36);not null;index" json:"sponsor_id"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User        *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	SponsorUser *User `gorm:"foreignKey:SponsorID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"sponsor,omitempty"`
}

func (s *Sponsor) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return
}

type NetworkPosition struct {
	ID        string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID    string    `gorm:"type:char(36);not null;uniqueIndex" json:"user_id"`
	UplineID  string    `gorm:"type:char(36);not null;uniqueIndex:uk_upline_position" json:"upline_id"`
	Position  string    `gorm:"type:enum('kiri','kanan');not null;uniqueIndex:uk_upline_position" json:"position"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`

	User       *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
	UplineUser *User `gorm:"foreignKey:UplineID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"upline,omitempty"`
}

func (np *NetworkPosition) BeforeCreate(tx *gorm.DB) (err error) {
	if np.ID == "" {
		np.ID = uuid.New().String()
	}
	return
}

type SponsorPath struct {
	ID           string `gorm:"type:char(36);primaryKey" json:"id"`
	AncestorID   string `gorm:"type:char(36);not null;uniqueIndex:uk_sponsor_path" json:"ancestor_id"`
	DescendantID string `gorm:"type:char(36);not null;uniqueIndex:uk_sponsor_path;index:idx_descendant_level" json:"descendant_id"`
	Level        int    `gorm:"default:0;index:idx_descendant_level" json:"level"`

	Ancestor   *User `gorm:"foreignKey:AncestorID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ancestor,omitempty"`
	Descendant *User `gorm:"foreignKey:DescendantID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"descendant,omitempty"`
}

func (sp *SponsorPath) BeforeCreate(tx *gorm.DB) (err error) {
	if sp.ID == "" {
		sp.ID = uuid.New().String()
	}
	return
}

type UplinePath struct {
	ID           string  `gorm:"type:char(36);primaryKey" json:"id"`
	AncestorID   string  `gorm:"type:char(36);not null;uniqueIndex:uk_upline_path" json:"ancestor_id"`
	DescendantID string  `gorm:"type:char(36);not null;uniqueIndex:uk_upline_path;index:idx_descendant_level" json:"descendant_id"`
	Level        int     `gorm:"default:0;index:idx_descendant_level" json:"level"`
	PathPosition *string `gorm:"type:enum('kiri','kanan')" json:"path_position"`

	Ancestor   *User `gorm:"foreignKey:AncestorID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"ancestor,omitempty"`
	Descendant *User `gorm:"foreignKey:DescendantID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"descendant,omitempty"`
}

func (up *UplinePath) BeforeCreate(tx *gorm.DB) (err error) {
	if up.ID == "" {
		up.ID = uuid.New().String()
	}
	return
}
