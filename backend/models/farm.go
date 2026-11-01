package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UserFarmPlot represents an active crop bed in the user's herbal garden
type UserFarmPlot struct {
	ID                 string     `gorm:"type:char(36);primaryKey" json:"id"`
	UserID             string     `gorm:"type:char(36);not null;index" json:"user_id"`
	PlantType          string     `gorm:"type:varchar(50)" json:"plant_type"` // 'propolis_flower', 'red_ginger', 'bio_sirsak', 'royal_trigona'
	PlantName          string     `gorm:"type:varchar(100)" json:"plant_name"`
	CurrentWater       int        `gorm:"type:int;default:0" json:"current_water"`
	TargetWater        int        `gorm:"type:int;default:100" json:"target_water"`
	Stage              string     `gorm:"type:varchar(30);default:'seed'" json:"stage"` // 'seed', 'sprout', 'growing', 'bloom', 'harvest_ready', 'empty'
	Health             int        `gorm:"type:int;default:100" json:"health"`
	PlantedAt          time.Time  `gorm:"autoCreateTime" json:"planted_at"`
	LastWateredAt      *time.Time `json:"last_watered_at,omitempty"`
	HarvestRewardType  string     `gorm:"type:varchar(50)" json:"harvest_reward_type"` // 'voucher', 'wallet_cash', 'propolis_product'
	HarvestRewardValue float64    `gorm:"type:decimal(15,2);default:0.00" json:"harvest_reward_value"`
	HarvestRewardTitle string     `gorm:"type:varchar(200)" json:"harvest_reward_title"`

	// Frontend compatibility aliases
	RewardTitle string  `gorm:"-" json:"reward_title,omitempty"`
	RewardType  string  `gorm:"-" json:"reward_type,omitempty"`
	RewardValue float64 `gorm:"-" json:"reward_value,omitempty"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (p *UserFarmPlot) BeforeCreate(tx *gorm.DB) (err error) {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return
}

func (p *UserFarmPlot) AfterFind(tx *gorm.DB) (err error) {
	p.RewardTitle = p.HarvestRewardTitle
	p.RewardType = p.HarvestRewardType
	p.RewardValue = p.HarvestRewardValue
	return
}

// FarmPet represents the companion animal guarding the farm (e.g. Trigona bee, mascot cat, bird)
type FarmPet struct {
	ID                string     `gorm:"type:char(36);primaryKey" json:"id"`
	UserID            string     `gorm:"type:char(36);not null;index" json:"user_id"`
	PetType           string     `gorm:"type:varchar(50);default:'trigona_bee'" json:"pet_type"` // 'trigona_bee', 'cat', 'bird'
	PetName           string     `gorm:"type:varchar(100);default:'Lebah Trigona Bionet'" json:"pet_name"`
	Happiness         int        `gorm:"type:int;default:100" json:"happiness"` // 0 - 100
	Level             int        `gorm:"type:int;default:1" json:"level"`       // 1 - 10
	LastFedAt         *time.Time `json:"last_fed_at,omitempty"`
	BonusWaterPerHour int        `gorm:"type:int;default:2" json:"bonus_water_per_hour"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (fp *FarmPet) BeforeCreate(tx *gorm.DB) (err error) {
	if fp.ID == "" {
		fp.ID = uuid.New().String()
	}
	return
}

// FarmWaterTank tracks user droplets inventory and regeneration cycle
type FarmWaterTank struct {
	UserID           string     `gorm:"type:char(36);primaryKey" json:"user_id"`
	WaterDroplets    int        `gorm:"type:int;default:100" json:"water_droplets"` // max 100
	LastRegenAt      time.Time  `gorm:"autoCreateTime" json:"last_regen_at"`
	TotalWaterGiven  int        `gorm:"type:int;default:0" json:"total_water_given"`
	TotalHarvests    int        `gorm:"type:int;default:0" json:"total_harvests"`
	LastDailyBonusAt *time.Time `json:"last_daily_bonus_at,omitempty"`

	// Frontend compatibility
	MaxCapacity int `gorm:"-" json:"max_capacity"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (wt *FarmWaterTank) AfterFind(tx *gorm.DB) (err error) {
	wt.MaxCapacity = 100
	return
}

// FarmFriendVisit records friend assistance watering anti-spam
type FarmFriendVisit struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	HelperUserID string    `gorm:"type:char(36);not null;index" json:"helper_user_id"`
	TargetUserID string    `gorm:"type:char(36);not null;index" json:"target_user_id"`
	ActionDate   string    `gorm:"type:varchar(10);not null;index" json:"action_date"` // YYYY-MM-DD
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`

	HelperUser *User `gorm:"foreignKey:HelperUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"helper_user,omitempty"`
	TargetUser *User `gorm:"foreignKey:TargetUserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"target_user,omitempty"`
}

func (v *FarmFriendVisit) BeforeCreate(tx *gorm.DB) (err error) {
	if v.ID == "" {
		v.ID = uuid.New().String()
	}
	return
}

// FarmHarvestLog records completed plant harvests and claimed rewards
type FarmHarvestLog struct {
	ID          string    `gorm:"type:char(36);primaryKey" json:"id"`
	UserID      string    `gorm:"type:char(36);not null;index" json:"user_id"`
	PlantType   string    `gorm:"type:varchar(50);not null" json:"plant_type"`
	RewardTitle string    `gorm:"type:varchar(200);not null" json:"reward_title"`
	VoucherCode string    `gorm:"type:varchar(100)" json:"voucher_code,omitempty"`
	WalletBonus float64   `gorm:"type:decimal(15,2);default:0.00" json:"wallet_bonus"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`

	// Frontend compatibility
	PlantName string `gorm:"-" json:"plant_name,omitempty"`
	Reward    string `gorm:"-" json:"reward,omitempty"`
	Date      string `gorm:"-" json:"date,omitempty"`

	User *User `gorm:"foreignKey:UserID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user,omitempty"`
}

func (hl *FarmHarvestLog) BeforeCreate(tx *gorm.DB) (err error) {
	if hl.ID == "" {
		hl.ID = uuid.New().String()
	}
	return
}

func (hl *FarmHarvestLog) AfterFind(tx *gorm.DB) (err error) {
	hl.Reward = hl.RewardTitle
	if !hl.CreatedAt.IsZero() {
		hl.Date = hl.CreatedAt.Format("02 Jan 2006")
	}
	return
}

// SeedCatalogItem describes a plantable seed with growth costs & panen yields
type SeedCatalogItem struct {
	PlantType           string  `json:"plant_type"`
	PlantName           string  `json:"plant_name"`
	Description         string  `json:"description"`
	TargetWater         int     `json:"target_water"`
	RewardType          string  `json:"reward_type"` // 'voucher', 'wallet_cash', 'propolis_product'
	RewardValue         float64 `json:"reward_value"`
	RewardTitle         string  `json:"reward_title"`
	EstimatedGrowthDays string  `json:"estimated_growth_days"`
	Icon                string  `json:"icon"`
	Badge               string  `json:"badge"`
}

// FarmFriendInfo holds friend details and their current farm status
type FarmFriendInfo struct {
	ID              string        `json:"id"`
	UserID          string        `json:"user_id"`
	Username        string        `json:"username"`
	FullName        string        `json:"full_name"`
	Avatar          string        `json:"avatar"`
	Relationship    string        `json:"relationship"` // 'upline', 'downline', 'mitra'
	PlantName       string        `json:"plant_name,omitempty"`
	Stage           string        `json:"stage,omitempty"`
	CurrentPlant    *UserFarmPlot `json:"current_plant,omitempty"`
	HasWateredToday bool          `json:"has_watered_today"`
	HelpedToday     bool          `json:"helped_today"`
	CanWater        bool          `json:"can_water"`
}

// FarmStateResponse provides the complete interactive dashboard state
type FarmStateResponse struct {
	Plot           *UserFarmPlot     `json:"plot"`
	Pet            *FarmPet          `json:"pet"`
	WaterTank      *FarmWaterTank    `json:"water_tank"`
	AvailableSeeds []SeedCatalogItem `json:"available_seeds"`
	RecentHarvests []FarmHarvestLog  `json:"recent_harvests"`
	HarvestHistory []FarmHarvestLog  `json:"harvest_history"`
	Friends        []FarmFriendInfo  `json:"friends"`
	CanClaimBonus  bool              `json:"can_claim_bonus"`
}

// WaterPlantResult returns the outcome of watering a plant
type WaterPlantResult struct {
	Plot         *UserFarmPlot  `json:"plot"`
	WaterTank    *FarmWaterTank `json:"water_tank"`
	Pet          *FarmPet       `json:"pet"`
	WaterAdded   int            `json:"water_added"`
	StageChanged bool           `json:"stage_changed"`
	NewStage     string         `json:"new_stage"`
	Message      string         `json:"message"`
}

// HelpWaterResult returns the result of watering a teammate's garden
type HelpWaterResult struct {
	Success         bool   `json:"success"`
	WaterGiven      int    `json:"water_given"`
	DropletsAwarded int    `json:"droplets_awarded"`
	Message         string `json:"message"`
	FriendUsername  string `json:"friend_username"`
}
