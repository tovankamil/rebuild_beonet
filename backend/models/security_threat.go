package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SecurityThreatLog mencatat setiap upaya hacking, penyerangan DDoS/flooding, probe URL, dan brute-force
type SecurityThreatLog struct {
	ID           string    `gorm:"type:char(36);primaryKey" json:"id"`
	IPAddress    string    `gorm:"type:varchar(50);not null;index" json:"ip_address"`
	ThreatType   string    `gorm:"type:varchar(50);not null;index" json:"threat_type"` // flooding, sql_injection, xss_payload, path_traversal, sensitive_probe, brute_force, manual_block
	Severity     string    `gorm:"type:enum('low','medium','high','critical');default:'high';index" json:"severity"`
	Payload      string    `gorm:"type:text" json:"payload"`
	Endpoint     string    `gorm:"type:varchar(255)" json:"endpoint"`
	Method       string    `gorm:"type:varchar(15)" json:"method"`
	UserAgent    string    `gorm:"type:varchar(255)" json:"user_agent"`
	Country      string    `gorm:"type:varchar(100);default:'Indonesia'" json:"country"`
	Province     string    `gorm:"type:varchar(100)" json:"province"`
	City         string    `gorm:"type:varchar(100)" json:"city"`
	ISP          string    `gorm:"type:varchar(100)" json:"isp"`
	Latitude     float64   `gorm:"type:decimal(10,6)" json:"latitude"`
	Longitude    float64   `gorm:"type:decimal(10,6)" json:"longitude"`
	Blocked      bool      `gorm:"default:true;index" json:"blocked"`
	ActionTaken  string    `gorm:"type:varchar(50);default:'blocked'" json:"action_taken"` // blocked, rate_limited, warning, logged
	RequestCount int       `gorm:"default:1" json:"request_count"`
	CreatedAt    time.Time `gorm:"autoCreateTime;index" json:"created_at"`
}

func (s *SecurityThreatLog) BeforeCreate(tx *gorm.DB) (err error) {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	return
}

// BlockedIP menyimpan daftar IP yang diblokir baik otomatis oleh sistem maupun manual oleh admin
type BlockedIP struct {
	ID         string     `gorm:"type:char(36);primaryKey" json:"id"`
	IPAddress  string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"ip_address"`
	Reason     string     `gorm:"type:varchar(255);not null" json:"reason"`
	ThreatType string     `gorm:"type:varchar(50);default:'manual'" json:"threat_type"`
	BlockedBy  string     `gorm:"type:varchar(100);default:'system'" json:"blocked_by"`
	IsActive   bool       `gorm:"default:true;index" json:"is_active"`
	ExpiresAt  *time.Time `json:"expires_at,omitempty"`
	CreatedAt  time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (b *BlockedIP) BeforeCreate(tx *gorm.DB) (err error) {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return
}

// GeoAccessLog mencatat histori daerah / kota akses pengguna & customer di seluruh Indonesia
type GeoAccessLog struct {
	ID         string    `gorm:"type:char(36);primaryKey" json:"id"`
	IPAddress  string    `gorm:"type:varchar(50);not null;index" json:"ip_address"`
	City       string    `gorm:"type:varchar(100);index" json:"city"`
	Province   string    `gorm:"type:varchar(100);index" json:"province"`
	Country    string    `gorm:"type:varchar(100);default:'Indonesia'" json:"country"`
	ISP        string    `gorm:"type:varchar(100)" json:"isp"`
	Latitude   float64   `gorm:"type:decimal(10,6)" json:"latitude"`
	Longitude  float64   `gorm:"type:decimal(10,6)" json:"longitude"`
	AccessType string    `gorm:"type:varchar(50);default:'api';index" json:"access_type"` // login, transaction, public_visit, api
	UserID     *string   `gorm:"type:char(36);index" json:"user_id,omitempty"`
	Username   *string   `gorm:"type:varchar(50);index" json:"username,omitempty"`
	Endpoint   string    `gorm:"type:varchar(255)" json:"endpoint"`
	CreatedAt  time.Time `gorm:"autoCreateTime;index" json:"created_at"`
}

func (g *GeoAccessLog) BeforeCreate(tx *gorm.DB) (err error) {
	if g.ID == "" {
		g.ID = uuid.New().String()
	}
	return
}

// Request and Response DTOs
type BlockIPRequest struct {
	IPAddress string `json:"ip_address" binding:"required"`
	Reason    string `json:"reason"`
}

type UnblockIPRequest struct {
	IPAddress string `json:"ip_address" binding:"required"`
}

type TestAlertRequest struct {
	ThreatType string `json:"threat_type"`
	IPAddress  string `json:"ip_address"`
	City       string `json:"city"`
	Payload    string `json:"payload"`
}

type ThreatSummaryDTO struct {
	TotalThreats      int64               `json:"total_threats"`
	ActiveBlocksCount int64               `json:"active_blocks_count"`
	ThreatsToday      int64               `json:"threats_today"`
	HighCriticalCount int64               `json:"high_critical_count"`
	ByTypeCount       map[string]int64    `json:"by_type_count"`
	RecentThreats     []SecurityThreatLog `json:"recent_threats"`
	BlockedIPs        []BlockedIP         `json:"blocked_ips"`
}

type CityTrafficStat struct {
	City       string  `json:"city"`
	Province   string  `json:"province"`
	ISP        string  `json:"isp"`
	Count      int64   `json:"count"`
	Percentage float64 `json:"percentage"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}

type GeoTrafficDTO struct {
	TotalVisits      int64             `json:"total_visits"`
	UniqueIPs        int64             `json:"unique_ips"`
	TopProvinces     map[string]int64  `json:"top_provinces"`
	TopCities        []CityTrafficStat `json:"top_cities"`
	AccessTypeStats  map[string]int64  `json:"access_type_stats"`
	RecentAccessLogs []GeoAccessLog    `json:"recent_access_logs"`
}
