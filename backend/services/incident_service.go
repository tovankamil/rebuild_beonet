package services

import (
	"fmt"
	"log"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/google/uuid"
)

type IncidentService struct{}

var GlobalIncidentService = &IncidentService{}

// RecordIncident menyimpan catatan insiden/gangguan sistem secara persisten ke database
func (s *IncidentService) RecordIncident(component, level, title, message, payload string) (*models.SystemIncidentLog, error) {
	incident := models.SystemIncidentLog{
		ID:         uuid.New().String(),
		Component:  component,
		Level:      level,
		Title:      title,
		Message:    message,
		Payload:    payload,
		IsResolved: false,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if config.DB != nil {
		if err := config.DB.Create(&incident).Error; err != nil {
			log.Printf("[IncidentService] Gagal menyimpan log insiden: %v", err)
			return nil, err
		}
	}

	log.Printf("[SISTEM GANGGUAN TERDETEKSI] [%s] [%s] %s: %s", level, component, title, message)
	return &incident, nil
}

// GetIncidents mengambil riwayat insiden sistem dengan filter
func (s *IncidentService) GetIncidents(component, level string, unresolvedOnly bool, limit, offset int) ([]models.SystemIncidentLog, int64, error) {
	if config.DB == nil {
		return nil, 0, fmt.Errorf("koneksi database belum diinisialisasi")
	}

	query := config.DB.Model(&models.SystemIncidentLog{})

	if component != "" {
		query = query.Where("component = ?", component)
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}
	if unresolvedOnly {
		query = query.Where("is_resolved = ?", false)
	}

	var total int64
	query.Count(&total)

	if limit <= 0 {
		limit = 50
	}

	var logs []models.SystemIncidentLog
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error
	return logs, total, err
}

// ResolveIncident menandai insiden sebagai telah ditangani
func (s *IncidentService) ResolveIncident(id, resolvedBy string) error {
	now := time.Now()
	return config.DB.Model(&models.SystemIncidentLog{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_resolved": true,
		"resolved_at": &now,
		"resolved_by": resolvedBy,
	}).Error
}

// GetStats mengembalikan matriks kesehatan sistem secara realtime
func (s *IncidentService) GetStats() (*models.IncidentStats, error) {
	stats := &models.IncidentStats{
		ComponentStatus: map[string]string{
			"whatsapp_engine": "operational",
			"database":        "operational",
			"email_smtp":      "operational",
			"tiktok_api":      "operational",
			"gemini_ai":       "operational",
			"system_runtime":  "operational",
		},
	}

	if config.DB == nil {
		return stats, nil
	}

	config.DB.Model(&models.SystemIncidentLog{}).Count(&stats.TotalIncidents)
	config.DB.Model(&models.SystemIncidentLog{}).Where("is_resolved = ?", false).Count(&stats.ActiveIncidents)
	config.DB.Model(&models.SystemIncidentLog{}).Where("is_resolved = ? AND level = 'critical'", false).Count(&stats.CriticalIncidents)
	config.DB.Model(&models.SystemIncidentLog{}).Where("is_resolved = ?", true).Count(&stats.ResolvedIncidents)

	// Cek koneksi database aktif
	sqlDB, err := config.DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		stats.ComponentStatus["database"] = "down"
	}

	// Update status komponen jika ada critical incident aktif
	var activeIncidents []models.SystemIncidentLog
	config.DB.Where("is_resolved = ?", false).Find(&activeIncidents)
	for _, inc := range activeIncidents {
		if inc.Level == "critical" {
			stats.ComponentStatus[inc.Component] = "down"
		} else if inc.Level == "error" && stats.ComponentStatus[inc.Component] != "down" {
			stats.ComponentStatus[inc.Component] = "degraded"
		}
	}

	// Hitung system health rate (99.x%)
	if stats.TotalIncidents > 0 {
		stats.SystemHealthRate = 100.0 - (float64(stats.ActiveIncidents) * 0.4)
		if stats.SystemHealthRate < 90.0 {
			stats.SystemHealthRate = 90.0
		}
	} else {
		stats.SystemHealthRate = 99.95
	}

	return stats, nil
}

