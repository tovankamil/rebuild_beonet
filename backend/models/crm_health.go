package models

import (
	"time"
)

// CustomerHealthRecord represents a customer's herbal health journey tracker (3-7-14-25 day cycle)
type CustomerHealthRecord struct {
	ID                 string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	LeadID             string    `gorm:"type:varchar(36);index" json:"lead_id"`
	UserID             string    `gorm:"type:varchar(36);index;not null" json:"user_id"` // Owner Mitra ID
	CustomerName       string    `gorm:"type:varchar(150);not null" json:"customer_name"`
	Phone              string    `gorm:"type:varchar(30);index" json:"phone"`
	Age                int       `gorm:"type:int;default:0" json:"age"`
	City               string    `gorm:"type:varchar(100)" json:"city"`
	ChiefComplaint     string    `gorm:"type:varchar(100);not null" json:"chief_complaint"` // e.g. "Asam Urat", "Diabetes", "Kolesterol", "Lambung / Maag", "Vitalitas Pria", "Stamina / Imun"
	DosageInstructions string    `gorm:"type:varchar(150);default:'3 x 5 tetes/hari'" json:"dosage_instructions"`
	Product            string    `gorm:"type:varchar(150);default:'Bio-Propolis Trigona'" json:"product"`
	StartDate          time.Time `json:"start_date"`
	DaysElapsed        int       `gorm:"-" json:"days_elapsed"`
	CurrentMilestone   string    `gorm:"type:varchar(50);default:'day_3'" json:"current_milestone"` // "day_3", "day_7", "day_14", "day_25", "completed"
	HealthNotes        string    `gorm:"type:text" json:"health_notes"`
	Status             string    `gorm:"type:varchar(50);default:'active'" json:"status"` // "active", "improved", "recovered"
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Optional relations
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Lead *Lead `gorm:"foreignKey:LeadID" json:"lead,omitempty"`
}
