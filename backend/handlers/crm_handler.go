package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CRMHandler mengelola fitur Smart RO Reminder & Customer Relationship Management
type CRMHandler struct{}

func NewCRMHandler() *CRMHandler {
	return &CRMHandler{}
}

// LogFollowUpRequest payload untuk pencatatan follow up CRM
type LogFollowUpRequest struct {
	TargetID string `json:"target_id" binding:"required"`
	Type     string `json:"type" binding:"required"` // "customer" atau "downline"
	Method   string `json:"method"`                 // "whatsapp", "phone", "meeting"
	Notes    string `json:"notes"`
}

// GetROReminders menganalisis siklus konsumsi produk pelanggan (30 hari) & downline tidak aktif (> 45 hari)
// Endpoint: GET /api/crm/ro-reminders
func (h *CRMHandler) GetROReminders(c *gin.Context) {
	userID := c.GetString("user_id")
	role := c.GetString("role")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Silakan login terlebih dahulu",
		})
		return
	}

	db := config.DB
	if db == nil {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data": gin.H{
				"customers": []gin.H{
					{
						"id":                       "demo-cust-1",
						"name":                     "Budi Santoso",
						"phone":                    "081234567890",
						"city":                     "Surabaya",
						"product_interest":         "Bio-Propolis Trigona",
						"days_since_contact":       27,
						"estimated_remaining_days": 3,
						"urgency":                  "urgent",
						"urgency_label":            "Stok Kritis Segera Follow-Up",
						"status":                   "interested",
					},
					{
						"id":                       "demo-cust-2",
						"name":                     "Siti Aminah",
						"phone":                    "081298765432",
						"city":                     "Jakarta",
						"product_interest":         "Bio-Herbal Drops",
						"days_since_contact":       20,
						"estimated_remaining_days": 10,
						"urgency":                  "warning",
						"urgency_label":            "Stok Menipis (25-40%)",
						"status":                   "contacted",
					},
					{
						"id":                       "demo-cust-3",
						"name":                     "Ahmad Dani",
						"phone":                    "081345678901",
						"city":                     "Bandung",
						"product_interest":         "Bio-Propolis Trigona",
						"days_since_contact":       5,
						"estimated_remaining_days": 25,
						"urgency":                  "good",
						"urgency_label":            "Stok Masih Aman",
						"status":                   "new",
					},
				},
				"dormant_downlines": []gin.H{
					{
						"id":                 "downline-dormant-1",
						"username":           "mitra_pasif01",
						"full_name":          "Doni Pratama",
						"phone":              "081234567899",
						"days_inactive":      55,
						"status":             "dormant",
						"recommended_action": "Kirim pesan WA re-aktivasi & info promo produk terbaru",
					},
				},
			},
		})
		return
	}

	// 1. Ambil data leads / pelanggan
	query := db.Model(&models.Lead{})
	if role != "admin" || (c.Query("all") != "true" && c.Query("all") != "1") {
		query = query.Where("user_id = ?", userID)
	}

	var leads []models.Lead
	if err := query.Order("created_at DESC").Find(&leads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memuat data pelanggan CRM",
		})
		return
	}

	// Fallback untuk admin jika admin belum punya lead pribadi
	if role == "admin" && len(leads) == 0 {
		_ = db.Model(&models.Lead{}).Order("created_at DESC").Limit(25).Find(&leads).Error
	}

	customers := make([]gin.H, 0)
	now := time.Now()

	for _, lead := range leads {
		refDate := lead.CreatedAt
		if lead.LastContactedAt != nil {
			refDate = *lead.LastContactedAt
		}

		daysSince := int(now.Sub(refDate).Hours() / 24)
		if daysSince < 0 {
			daysSince = 0
		}

		// Standar siklus konsumsi produk herbal: 30 hari
		remainingDays := 30 - daysSince

		urgency := "good"
		urgencyLabel := "Stok Masih Aman"
		if daysSince >= 25 {
			urgency = "urgent"
			urgencyLabel = "Stok Kritis Segera Follow-Up"
		} else if daysSince >= 18 {
			urgency = "warning"
			urgencyLabel = "Stok Menipis (25-40%)"
		}

		customers = append(customers, gin.H{
			"id":                       lead.ID,
			"name":                     lead.Name,
			"phone":                    lead.Phone,
			"city":                     lead.City,
			"product_interest":         lead.ProductInterest,
			"source":                   lead.Source,
			"status":                   lead.Status,
			"last_contacted_at":        lead.LastContactedAt,
			"days_since_contact":       daysSince,
			"estimated_remaining_days": remainingDays,
			"urgency":                  urgency,
			"urgency_label":            urgencyLabel,
			"notes":                    lead.Notes,
		})
	}

	// 2. Ambil data downline dari tabel sponsors
	var sponsors []models.Sponsor
	if role == "admin" && (c.Query("all") == "true" || c.Query("all") == "1") {
		_ = db.Preload("User").Limit(50).Find(&sponsors).Error
	} else {
		_ = db.Where("sponsor_id = ?", userID).Preload("User").Find(&sponsors).Error
	}

	// Fallback untuk admin jika admin belum punya downline sponsor langsung
	if role == "admin" && len(sponsors) == 0 {
		_ = db.Preload("User").Limit(25).Find(&sponsors).Error
	}

	dormantDownlines := make([]gin.H, 0)

	for _, sp := range sponsors {
		if sp.User == nil {
			continue
		}

		// Cari order terakhir downline
		var lastOrder models.Order
		lastActivity := sp.User.CreatedAt
		if err := db.Where("user_id = ? AND status IN ('paid', 'processing', 'shipped', 'completed')", sp.UserID).Order("created_at DESC").First(&lastOrder).Error; err == nil {
			lastActivity = lastOrder.CreatedAt
		}

		daysInactive := int(now.Sub(lastActivity).Hours() / 24)
		if daysInactive < 0 {
			daysInactive = 0
		}

		// Ambang batas dormant: tidak ada Repeat Order (RO) > 45 hari
		if daysInactive >= 45 {
			var phoneStr string
			if sp.User.Phone != nil {
				phoneStr = *sp.User.Phone
			}

			dormantDownlines = append(dormantDownlines, gin.H{
				"id":                 sp.UserID,
				"username":           sp.User.Username,
				"full_name":          sp.User.FullName,
				"phone":              phoneStr,
				"last_activity_date": lastActivity,
				"days_inactive":      daysInactive,
				"status":             "dormant",
				"recommended_action": "Kirim pesan WA re-aktivasi & info promo produk terbaru",
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"customers":         customers,
			"dormant_downlines": dormantDownlines,
		},
	})
}

// LogFollowUp mencatat riwayat komunikasi follow-up ke pelanggan atau downline
// Endpoint: POST /api/crm/ro-reminders/log
func (h *CRMHandler) LogFollowUp(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized",
		})
		return
	}

	var req LogFollowUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Payload tidak valid: target_id dan type wajib diisi",
		})
		return
	}

	if req.Method == "" {
		req.Method = "whatsapp"
	}

	db := config.DB
	if db == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Follow-up berhasil dicatat",
			"data": gin.H{
				"target_id": req.TargetID,
				"type":      req.Type,
				"method":    req.Method,
				"notes":     req.Notes,
				"logged_at": time.Now(),
			},
		})
		return
	}

	now := time.Now()

	// Jika target bertipe customer, perbarui last_contacted_at pada tabel leads
	if strings.ToLower(req.Type) == "customer" {
		var lead models.Lead
		if err := db.Where("id = ?", req.TargetID).First(&lead).Error; err == nil {
			lead.LastContactedAt = &now
			if req.Notes != "" {
				if lead.Notes != "" {
					lead.Notes = lead.Notes + "\n[" + now.Format("2006-01-02 15:04") + " via " + req.Method + "]: " + req.Notes
				} else {
					lead.Notes = "[" + now.Format("2006-01-02 15:04") + " via " + req.Method + "]: " + req.Notes
				}
			}
			_ = db.Save(&lead).Error
		}
	}

	// Catat ke AuditLog agar memiliki jejak audit transaksi CRM yang permanen
	audit := models.AuditLog{
		ID:        uuid.New().String(),
		UserID:    userID,
		Action:    "FOLLOWUP",
		TableName: "crm_ro_followup",
		RecordID:  req.TargetID,
		NewValues: fmt.Sprintf(`{"type":"%s","method":"%s","notes":"%s"}`, req.Type, req.Method, req.Notes),
		CreatedAt: now,
	}
	_ = db.Create(&audit).Error

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Follow-up berhasil dicatat",
		"data": gin.H{
			"target_id": req.TargetID,
			"type":      req.Type,
			"method":    req.Method,
			"notes":     req.Notes,
			"logged_at": now,
		},
	})
}

// ============================================================================
// EXPANDED BIONET CRM: HEALTH JOURNEY TRACKER (3-7-14-25 DAYS)
// ============================================================================

// SaveHealthRecordRequest payload untuk membuat atau memperbarui catatan kesehatan herbal konsumen
type SaveHealthRecordRequest struct {
	ID                 string `json:"id"`
	LeadID             string `json:"lead_id"`
	CustomerName       string `json:"customer_name" binding:"required"`
	Phone              string `json:"phone"`
	ChiefComplaint     string `json:"chief_complaint" binding:"required"` // Asam Urat, Diabetes, Kolesterol, Lambung, Vitalitas
	DosageInstructions string `json:"dosage_instructions"`
	StartDate          string `json:"start_date"`
	CurrentMilestone   string `json:"current_milestone"` // day_3, day_7, day_14, day_25, completed
	HealthNotes        string `json:"health_notes"`
	Status             string `json:"status"` // active, improved, recovered
}

// UpdateMilestoneRequest payload untuk memperbarui fase milestone kesehatan herbal
type UpdateMilestoneRequest struct {
	Milestone   string `json:"milestone" binding:"required"` // day_3, day_7, day_14, day_25, completed
	HealthNotes string `json:"health_notes"`
	Status      string `json:"status"` // active, improved, recovered
}

// GetHealthRecords mengambil riwayat pemantauan kesehatan konsumen siklus 3-7-14-25 hari
// Endpoint: GET /api/crm/health-records
func (h *CRMHandler) GetHealthRecords(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Silakan login terlebih dahulu",
		})
		return
	}
	role := c.GetString("role")
	db := config.DB

	now := time.Now()
	sampleRecords := []models.CustomerHealthRecord{
		{
			ID:                 "sample-health-1",
			UserID:             userID,
			CustomerName:       "Bpk. Hendro Subagio",
			Phone:              "6281234567891",
			ChiefComplaint:     "Asam Urat",
			DosageInstructions: "3 x 5 tetes/hari sesudah makan",
			StartDate:          now.AddDate(0, 0, -7),
			CurrentMilestone:   "day_7",
			HealthNotes:        "Hari ke-3: Ada sensasi hangat di persendian. Hari ke-7: Bengkak jempol kaki kempis signifikan dan bisa sholat tanpa nyeri.",
			Status:             "improved",
			CreatedAt:          now.AddDate(0, 0, -7),
			UpdatedAt:          now,
		},
		{
			ID:                 "sample-health-2",
			UserID:             userID,
			CustomerName:       "Ibu Warsito Ningsih",
			Phone:              "6281298765432",
			ChiefComplaint:     "Diabetes",
			DosageInstructions: "3 x 7 tetes/hari",
			StartDate:          now.AddDate(0, 0, -14),
			CurrentMilestone:   "day_14",
			HealthNotes:        "Hari ke-7: Bangun tidur lebih segar. Hari ke-14: Gula darah puasa turun dari 240 mg/dL ke 165 mg/dL.",
			Status:             "active",
			CreatedAt:          now.AddDate(0, 0, -14),
			UpdatedAt:          now,
		},
		{
			ID:                 "sample-health-3",
			UserID:             userID,
			CustomerName:       "Bpk. Bambang Sutrisno",
			Phone:              "6281345678903",
			ChiefComplaint:     "Lambung / Maag",
			DosageInstructions: "3 x 5 tetes/hari campur air hangat sesudah makan",
			StartDate:          now.AddDate(0, 0, -3),
			CurrentMilestone:   "day_3",
			HealthNotes:        "Hari ke-3: Perut perih dan begah kembung mulai berkurang setelah minum air hangat campur herbal.",
			Status:             "active",
			CreatedAt:          now.AddDate(0, 0, -3),
			UpdatedAt:          now,
		},
		{
			ID:                 "sample-health-4",
			UserID:             userID,
			CustomerName:       "Hj. Siti Aminah",
			Phone:              "6281122334455",
			ChiefComplaint:     "Kolesterol",
			DosageInstructions: "3 x 5 tetes/hari",
			StartDate:          now.AddDate(0, 0, -25),
			CurrentMilestone:   "day_25",
			HealthNotes:        "Hari ke-14: Tengkuk enteng tidak kaku lagi. Hari ke-25: Tes lab kolesterol total turun dari 265 ke 188. Siap repeat order.",
			Status:             "recovered",
			CreatedAt:          now.AddDate(0, 0, -25),
			UpdatedAt:          now,
		},
	}

	if db == nil {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   sampleRecords,
		})
		return
	}

	var records []models.CustomerHealthRecord
	query := db.Model(&models.CustomerHealthRecord{})
	if role != "admin" || (c.Query("all") != "true" && c.Query("all") != "1") {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Order("created_at DESC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memuat catatan kesehatan: " + err.Error(),
		})
		return
	}

	// Otomatis isi sampel awal jika data masih kosong agar UI dapat langsung mendemokan siklus 3-7-14-25 hari
	if len(records) == 0 {
		for i := range sampleRecords {
			sampleRecords[i].ID = uuid.New().String()
			sampleRecords[i].UserID = userID
			_ = db.Create(&sampleRecords[i]).Error
		}
		records = sampleRecords
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   records,
	})
}

// SaveHealthRecord membuat atau memperbarui catatan perkembangan kesehatan herbal
// Endpoint: POST /api/crm/health-records
func (h *CRMHandler) SaveHealthRecord(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Silakan login terlebih dahulu",
		})
		return
	}

	var req SaveHealthRecordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Nama pelanggan dan keluhan utama (chief_complaint) wajib diisi",
		})
		return
	}

	cleanPhone := strings.TrimSpace(req.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	}

	dosage := strings.TrimSpace(req.DosageInstructions)
	if dosage == "" {
		dosage = "3 x 5 tetes/hari"
	}

	milestone := strings.TrimSpace(req.CurrentMilestone)
	if milestone == "" {
		milestone = "day_3"
	}

	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = "active"
	}

	startDate := time.Now()
	if req.StartDate != "" {
		if t, err := time.Parse(time.RFC3339, req.StartDate); err == nil {
			startDate = t
		} else if t, err := time.Parse("2006-01-02", req.StartDate); err == nil {
			startDate = t
		}
	}

	db := config.DB
	now := time.Now()

	if db == nil {
		recID := req.ID
		if recID == "" {
			recID = uuid.New().String()
		}
		mockRec := models.CustomerHealthRecord{
			ID:                 recID,
		LeadID:             req.LeadID,
			UserID:             userID,
			CustomerName:       strings.TrimSpace(req.CustomerName),
			Phone:              cleanPhone,
			ChiefComplaint:     strings.TrimSpace(req.ChiefComplaint),
			DosageInstructions: dosage,
			StartDate:          startDate,
			CurrentMilestone:   milestone,
			HealthNotes:        strings.TrimSpace(req.HealthNotes),
			Status:             status,
			CreatedAt:          now,
			UpdatedAt:          now,
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Catatan perjalanan kesehatan herbal berhasil disimpan",
			"data":    mockRec,
		})
		return
	}

	var record models.CustomerHealthRecord
	if req.ID != "" {
		if err := db.Where("id = ?", req.ID).First(&record).Error; err == nil {
			record.CustomerName = strings.TrimSpace(req.CustomerName)
			if cleanPhone != "" {
				record.Phone = cleanPhone
			}
			if req.LeadID != "" {
				record.LeadID = req.LeadID
			}
			record.ChiefComplaint = strings.TrimSpace(req.ChiefComplaint)
			record.DosageInstructions = dosage
			record.StartDate = startDate
			record.CurrentMilestone = milestone
			record.HealthNotes = strings.TrimSpace(req.HealthNotes)
			record.Status = status
			record.UpdatedAt = now
			if err := db.Save(&record).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui catatan: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"status":  "success",
				"message": "Catatan kesehatan berhasil diperbarui",
				"data":    record,
			})
			return
		}
	}

	leadID := strings.TrimSpace(req.LeadID)
	if leadID == "" {
		var existingLead models.Lead
		if cleanPhone != "" && db.Where("user_id = ? AND phone = ?", userID, cleanPhone).First(&existingLead).Error == nil {
			leadID = existingLead.ID
		} else {
			newLead := models.Lead{
				ID:              uuid.New().String(),
				UserID:          userID,
				Name:            strings.TrimSpace(req.CustomerName),
				Phone:           cleanPhone,
				ProductInterest: strings.TrimSpace(req.ChiefComplaint),
				Status:          "interested",
				Source:          "manual",
				CreatedAt:       now,
				UpdatedAt:       now,
			}
			if err := db.Create(&newLead).Error; err == nil {
				leadID = newLead.ID
			}
		}
	}

	record = models.CustomerHealthRecord{
		ID:                 uuid.New().String(),
		LeadID:             leadID,
		UserID:             userID,
		CustomerName:       strings.TrimSpace(req.CustomerName),
		Phone:              cleanPhone,
		ChiefComplaint:     strings.TrimSpace(req.ChiefComplaint),
		DosageInstructions: dosage,
		StartDate:          startDate,
		CurrentMilestone:   milestone,
		HealthNotes:        strings.TrimSpace(req.HealthNotes),
		Status:             status,
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	if err := db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan catatan kesehatan: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Catatan perjalanan kesehatan herbal berhasil ditambahkan",
		"data":    record,
	})
}

// UpdateHealthMilestone memperbarui progres fase evaluasi siklus kesehatan (day_3, day_7, day_14, day_25, completed)
// Endpoint: PUT /api/crm/health-records/:id/milestone
func (h *CRMHandler) UpdateHealthMilestone(c *gin.Context) {
	recordID := c.Param("id")
	userID := c.GetString("user_id")
	role := c.GetString("role")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Silakan login terlebih dahulu",
		})
		return
	}

	var req UpdateMilestoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Milestone wajib diisi ('day_3', 'day_7', 'day_14', 'day_25', 'completed')",
		})
		return
	}

	validMilestones := map[string]bool{
		"day_3":     true,
		"day_7":     true,
		"day_14":    true,
		"day_25":    true,
		"completed": true,
	}
	if !validMilestones[req.Milestone] {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Nilai milestone tidak valid. Pilihan: day_3, day_7, day_14, day_25, completed",
		})
		return
	}

	db := config.DB
	now := time.Now()

	if db == nil {
		status := req.Status
		if status == "" {
			if req.Milestone == "completed" {
				status = "recovered"
			} else if req.Milestone == "day_7" || req.Milestone == "day_14" {
				status = "improved"
			} else {
				status = "active"
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Milestone progres kesehatan berhasil diperbarui",
			"data": gin.H{
				"id":                recordID,
				"current_milestone": req.Milestone,
				"status":            status,
				"health_notes":      req.HealthNotes,
				"updated_at":        now,
			},
		})
		return
	}

	var record models.CustomerHealthRecord
	if err := db.Where("id = ?", recordID).First(&record).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Catatan kesehatan tidak ditemukan",
		})
		return
	}

	if role != "admin" && record.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Anda tidak memiliki izin mengubah data kesehatan ini",
		})
		return
	}

	record.CurrentMilestone = req.Milestone
	if req.Status != "" {
		record.Status = req.Status
	} else if req.Milestone == "completed" {
		record.Status = "recovered"
	} else if req.Milestone == "day_7" || req.Milestone == "day_14" {
		if record.Status == "active" {
			record.Status = "improved"
		}
	}

	if req.HealthNotes != "" {
		noteEntry := fmt.Sprintf("[%s %s]: %s", now.Format("2006-01-02"), req.Milestone, req.HealthNotes)
		if record.HealthNotes != "" {
			record.HealthNotes = record.HealthNotes + "\n" + noteEntry
		} else {
			record.HealthNotes = noteEntry
		}
	}
	record.UpdatedAt = now

	if err := db.Save(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui milestone: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Milestone progres kesehatan berhasil diperbarui",
		"data":    record,
	})
}

// ============================================================================
// AI OBJECTION HANDLER & PERSUASIVE CLOSING ENGINE
// ============================================================================

// ObjectionHandlerRequest payload untuk konsultasi penanganan keberatan konsumen
type ObjectionHandlerRequest struct {
	ObjectionType string `json:"objection_type" binding:"required"` // mahal, efek_samping, obat_dokter, ragu_khasiat, bukan_mlm
	CustomerName  string `json:"customer_name"`
	ProductName   string `json:"product_name"`
}

// HandleObjectionAI menghasilkan respon empatik, persuasif dan patuh BPOM untuk menjawab keraguan konsumen
// Endpoint: POST /api/crm/ai/objection-handler
func (h *CRMHandler) HandleObjectionAI(c *gin.Context) {
	var req ObjectionHandlerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Parameter objection_type wajib diisi ('mahal', 'efek_samping', 'obat_dokter', 'ragu_khasiat', 'bukan_mlm')",
		})
		return
	}

	custName := strings.TrimSpace(req.CustomerName)
	if custName == "" {
		custName = "Bapak/Ibu"
	}

	prodName := strings.TrimSpace(req.ProductName)
	if prodName == "" {
		prodName = "Bio-Propolis Trigona Bionet"
	}

	objType := strings.ToLower(strings.TrimSpace(req.ObjectionType))
	if objType == "harga_mahal" {
		objType = "mahal"
	} else if objType == "bpom_halal" {
		objType = "ragu_khasiat"
	} else if objType == "mlm_piramida" {
		objType = "bukan_mlm"
	}

	type objectionData struct {
		Framework string
		Tip       string
		Template  string
	}

	responses := map[string]objectionData{
		"mahal": {
			Framework: "Feel - Felt - Found & Value Per Day Breakdown",
			Tip:       "Pecah nominal harga menjadi investasi harian (hanya Rp 8.000-an/hari) dan bandingkan dengan biaya rawat jalan atau kehilangan produktivitas saat sakit.",
			Template: fmt.Sprintf("Halo %s, saya sangat memahami pertimbangan mengenai biaya. Banyak pelanggan kami sebelumnya juga sempat merasa demikian di awal.\n\nNamun setelah mereka mencoba dan merasakan khasiat %s, mereka menyadari bahwa 1 botol ini bisa untuk konsumsi 3-4 minggu. Jika dihitung, investasinya hanya sekitar Rp 8.000-an per hariâ€”jauh lebih terjangkau daripada biaya obat kimia atau rumah sakit saat sakit kambuh.\n\nSelain itu, produk ini sudah berizin resmi BPOM dan Halal MUI, jadi setiap rupiah yang %s keluarkan memberikan kepastian mutu dan keamanan nyata. Apakah berkenan kami kirimkan paket promo hemat hari ini ke alamat %s?", custName, prodName, custName, custName),
		},
		"efek_samping": {
			Framework: "BPOM Safety & Natural Detoksifikasi Education",
			Tip:       "Edukasi perbedaan antara efek samping kimia berbahaya dengan proses alami penyesuaian tubuh (detoksifikasi / cleansing reaction).",
			Template: fmt.Sprintf("Halo %s, pertanyaan yang sangat bijak dan penting!\n\n%s diformulasikan dari 100%% bahan aktif ekstrak alami murni terstandar BPOM, tanpa BKO (Bahan Kimia Obat), sehingga aman untuk ginjal dan hati walau dikonsumsi rutin.\n\nDi beberapa hari pertama, sebagian orang mungkin merasakan proses adaptasi alami (cleansing reaction) seperti buang air kecil lebih lancar atau rasa hangat di tubuhâ€”ini justru pertanda sirkulasi darah mulai lancar dan toksin mulai dikeluarkan. Cukup imbangi dengan minum air putih hangat 2 liter per hari.\n\nKami juga akan memandu dosis bertahap (mulai 3 tetes) agar tubuh %s beradaptasi dengan sangat nyaman. Apakah %s ingin mencoba mulai dengan dosis awal yang ringan?", custName, prodName, custName, custName),
		},
		"obat_dokter": {
			Framework: "Complementary Health Integration (Jeda Waktu 1-2 Jam)",
			Tip:       "Jangan menyuruh pelanggan menghentikan obat resep. Tampilkan herbal sebagai pendamping komplementer sinergis dengan jeda waktu.",
			Template: fmt.Sprintf("Halo %s, kami sangat menghormati pengobatan dari dokter %s.\n\nKabar baiknya, %s bersifat komplementer (pendamping alami) yang aman dikonsumsi beriringan dengan obat resep, cukup beri jeda waktu 1 hingga 2 jam antara obat dokter dan herbal kami.\n\nObat dokter bekerja meredakan keluhan secara cepat, sedangkan herbal Bionet bekerja meregenerasi sel dan memperbaiki metabolisme organ dari akarnya. Banyak pelanggan kami yang setelah beberapa minggu rutin, kondisi tubuhnya membaik sehingga dosis obat kimia mereka bisa diturunkan secara bertahap oleh dokter yang merawat. Boleh tahu obat resep apa yang sedang rutin dikonsumsi %s saat ini?", custName, custName, prodName, custName),
		},
		"ragu_khasiat": {
			Framework: "Evidence-Based Social Proof & Lab Verification",
			Tip:       "Tunjukkan nomor registrasi BPOM yang dapat diverifikasi di aplikasi BPOM Mobile beserta bukti hasil uji lab klinis nyata.",
			Template: fmt.Sprintf("Halo %s, wajar sekali bila ada keraguan sebelum membuktikannya sendiri.\n\n%s telah teruji klinis serta memiliki nomor izin edar resmi BPOM RI dan sertifikasi Halal MUI yang bisa langsung dicek keasliannya melalui aplikasi BPOM Mobile.\n\nSelain legalitas resmi, kami memiliki ratusan testimoni laboratorium klinis pelanggan yang membuktikan penurunan angka asam urat, gula darah, dan kolesterol dalam 7 hingga 14 hari konsumsi konsisten. Ditambah lagi, kami akan mendampingi perjalanan kesehatan %s pada siklus evaluasi hari ke-3, ke-7, dan ke-14. Apakah %s ingin melihat foto bukti hasil tes lab pelanggan kami yang memiliki keluhan serupa?", custName, prodName, custName, custName),
		},
		"bukan_mlm": {
			Framework: "Direct Consumer Value & Freedom of Choice",
			Tip:       "Tegaskan bahwa konsumen tidak memiliki kewajiban merekrut atau berbisnis; fokus sepenuhnya pada ikhtiar kesembuhan mereka.",
			Template: fmt.Sprintf("Halo %s, terima kasih atas keterbukaannya. %s tidak perlu khawatir sama sekali!\n\nDi Bionet, fokus utama kami adalah mutu khasiat produk untuk kesembuhan konsumen. %s murni membeli sebagai pelanggan tercinta, tanpa kewajiban jualan, rekrut member, atau target apapun. %s berhak mendapatkan produk asli bergaransi dengan harga resmi terbaik langsung dari mitra resmi kami.\n\nKesehatan dan kenyamanan %s adalah prioritas kami. Boleh kami tahu keluhan apa yang saat ini paling ingin %s pulihkan?", custName, custName, custName, custName, custName, custName),
		},
	}

	data, exists := responses[objType]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Jenis objection tidak dikenali. Pilihan yang valid: mahal, efek_samping, obat_dokter, ragu_khasiat, bukan_mlm",
		})
		return
	}

	responseText := data.Template

	// Jika layanan Gemini AI aktif, tingkatkan personalisasi respon
	if services.GlobalGeminiService != nil {
		prompt := fmt.Sprintf(`Anda adalah Pakar Komunikasi dan Closing Penjualan Herbal Kesehatan BPOM Indonesia.
Tolong buatkan 1 respon pesan WhatsApp untuk mengatasi keberatan calon konsumen dengan rincian:
- Nama Konsumen: %s
- Produk: %s
- Jenis Keberatan: %s
- Kerangka Kerja (Framework): %s
- Panduan Kepatuhan: Tetap patuhi aturan BPOM (klaim tidak berlebihan), santun, sangat empati, dan diakhiri pertanyaan penutup (soft-close question).
Berikan HANYA teks pesan WhatsApp siap kirim tanpa penjelasan tambahan.`,
			custName, prodName, objType, data.Framework)

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if aiReply, err := services.GlobalGeminiService.GenerateText(ctx, prompt); err == nil && strings.TrimSpace(aiReply) != "" {
			responseText = strings.TrimSpace(aiReply)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":                  "success",
		"objection_type":          objType,
		"customer_name":           custName,
		"product_name":            prodName,
		"framework":               data.Framework,
		"recommended_closing_tip": data.Tip,
		"response_text":           responseText,
		"whatsapp_ready_text":     responseText,
		"script":                  responseText,
		"data": gin.H{
			"script":                  responseText,
			"response_text":           responseText,
			"whatsapp_ready_text":     responseText,
			"framework":               data.Framework,
			"recommended_closing_tip": data.Tip,
		},
	})
}

// ============================================================================
// KANBAN STAGE PIPELINE CONTROLLER
// ============================================================================

// UpdateLeadStatusRequest payload untuk menggeser kartu Kanban lead prospek
type UpdateLeadStatusRequest struct {
	Status string `json:"status" binding:"required"` // new, contacted, interested, webinar, closing, lost
	Notes  string `json:"notes"`
}

// UpdateLeadStatus memperbarui tahapan Kanban lead prospek
// Endpoint: PUT /api/crm/leads/:id/status
func (h *CRMHandler) UpdateLeadStatus(c *gin.Context) {
	leadID := c.Param("id")
	userID := c.GetString("user_id")
	role := c.GetString("role")

	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized: Silakan login terlebih dahulu",
		})
		return
	}

	var req UpdateLeadStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Status tahap Kanban wajib diisi ('new', 'contacted', 'interested', 'webinar', 'closing', 'lost')",
		})
		return
	}

	validStages := map[string]bool{
		"new":        true,
		"contacted":  true,
		"interested": true,
		"webinar":    true,
		"closing":    true,
		"lost":       true,
	}
	stage := strings.ToLower(strings.TrimSpace(req.Status))
	if !validStages[stage] {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Status tidak valid. Pilihan tahap Kanban: new, contacted, interested, webinar, closing, lost",
		})
		return
	}

	db := config.DB
	now := time.Now()

	if db == nil {
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Status tahap prospek berhasil diperbarui",
			"data": gin.H{
				"id":         leadID,
				"status":     stage,
				"notes":      req.Notes,
				"updated_at": now,
			},
		})
		return
	}

	var lead models.Lead
	if err := db.Where("id = ?", leadID).First(&lead).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Prospek lead tidak ditemukan",
		})
		return
	}

	if role != "admin" && lead.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akses ditolak: Anda tidak memiliki izin mengelola prospek ini",
		})
		return
	}

	lead.Status = stage
	if stage == "contacted" || stage == "interested" || stage == "closing" {
		lead.LastContactedAt = &now
	}

	if req.Notes != "" {
		noteEntry := fmt.Sprintf("[%s Tahap -> %s]: %s", now.Format("2006-01-02 15:04"), stage, req.Notes)
		if lead.Notes != "" {
			lead.Notes = lead.Notes + "\n" + noteEntry
		} else {
			lead.Notes = noteEntry
		}
	}
	lead.UpdatedAt = now

	if err := db.Save(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui status: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Status tahap prospek berhasil diperbarui",
		"data":    lead,
	})
}

// ============================================================================
// VERIFIED HERBAL TESTIMONIAL REPOSITORY
// ============================================================================

func defaultSeededTestimonials() []models.TestimonialItem {
	now := time.Now()
	return []models.TestimonialItem{
		{
			ID:           "testi-asam-urat-1",
			Category:     "asam_urat",
			CustomerName: "Pak Hendro Subagio (54 th)",
			City:         "Solo",
			Headline:     "Asam Urat 9.2 Turun ke 5.8 mg/dL dalam 14 Hari Konsumsi Teratur",
			Story:        "Sudah 2 tahun merasakan nyeri hebat di persendian jempol kaki tiap bangun pagi. Setelah teratur minum Bio-Propolis 3x5 tetes, di hari ke-7 bengkak kempis dan di hari ke-14 tes darah asam urat normal 5.8 mg/dL.",
			ProofType:    "clinical_lab",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -10),
			UpdatedAt:    now,
		},
		{
			ID:           "testi-diabetes-1",
			Category:     "diabetes",
			CustomerName: "Ibu Warsito Ningsih (49 th)",
			City:         "Surabaya",
			Headline:     "Gula Darah Puasa Stabil 135 mg/dL & Badan Jauh Lebih Bugar",
			Story:        "Sebelumnya gula darah puasa sering di atas 240 mg/dL dan badan cepat lemas mengantuk. Setelah 3 minggu pendampingan Bio-Herbal Drops teratur, gula darah puasa stabil 135 mg/dL dan luka gores cepat kering.",
			ProofType:    "whatsapp_chat",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -8),
			UpdatedAt:    now,
		},
		{
			ID:           "testi-kolesterol-1",
			Category:     "kolesterol",
			CustomerName: "Pak Rudi Hartono (45 th)",
			City:         "Bandung",
			Headline:     "Tengkuk Kaku & Kolesterol Total 280 Turun Drastis Menjadi 190",
			Story:        "Sering pusing dan tengkuk kaku setelah makan berlemak. Hasil cek darah kolesterol 280. Konsumsi Bio-Propolis Trigona 2 botol, cek lab ulang turun jadi 190 mg/dL. Kepala dan tengkuk terasa sangat enteng.",
			ProofType:    "clinical_lab",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -6),
			UpdatedAt:    now,
		},
		{
			ID:           "testi-lambung-1",
			Category:     "lambung",
			CustomerName: "Ibu Ratna Kumalasari (36 th)",
			City:         "Semarang",
			Headline:     "GERD & Asam Lambung Kronis 3 Tahun Akhirnya Bebas Perih & Mual",
			Story:        "Tiap telat makan perut begah dan asam lambung naik ke kerongkongan. Mengikuti panduan minum air hangat campur Bio-Herbal 3x sehari sesudah makan, dalam 10 hari perut sudah sangat nyaman dan nafsu makan normal.",
			ProofType:    "before_after",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -5),
			UpdatedAt:    now,
		},
		{
			ID:           "testi-vitalitas-1",
			Category:     "vitalitas",
			CustomerName: "Pak Hendri Kurniawan (42 th)",
			City:         "Jakarta",
			Headline:     "Stamina Bugar Sepanjang Hari Tanpa Drop Walau Lembur Kerja Lapangan",
			Story:        "Kerja lapangan sering pulang larut malam dan gampang letih. Sejak rutin minum Bio-Propolis tiap pagi dan malam sebelum tidur, daya tahan tubuh prima, tidak gampang masuk angin, dan stamina fit.",
			ProofType:    "whatsapp_chat",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -4),
			UpdatedAt:    now,
		},
		{
			ID:           "testi-bisnis-1",
			Category:     "bisnis",
			CustomerName: "Mas Reza Firmansyah (29 th)",
			City:         "Medan",
			Headline:     "Dari Konsumen Cocok Herbal, Kini Punya Penghasilan Puluhan Juta Per Bulan",
			Story:        "Awalnya beli untuk ibu yang menderita komplikasi diabetes. Karena hasilnya sangat nyata, tetangga dan relasi ikut pesan. Saya memutuskan ambil Paket Gold Bionet, kini dalam 4 bulan sudah meraih reward dan bonus harian rutin.",
			ProofType:    "whatsapp_chat",
			BpomVerified: true,
			CreatedAt:    now.AddDate(0, 0, -2),
			UpdatedAt:    now,
		},
	}
}

// GetTestimonials menyajikan katalog testimoni resmi terverifikasi BPOM
// Endpoint: GET /api/crm/testimonials
func (h *CRMHandler) GetTestimonials(c *gin.Context) {
	category := strings.ToLower(strings.TrimSpace(c.Query("category")))
	proofType := strings.ToLower(strings.TrimSpace(c.Query("proof_type")))

	defaults := defaultSeededTestimonials()
	db := config.DB

	if db == nil {
		filtered := make([]models.TestimonialItem, 0)
		for _, item := range defaults {
			if category != "" && category != "all" && item.Category != category {
				continue
			}
			if proofType != "" && proofType != "all" && item.ProofType != proofType {
				continue
			}
			filtered = append(filtered, item)
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   filtered,
			"total":  len(filtered),
		})
		return
	}

	// Otomatis preload testimoni awal jika tabel masih kosong
	var count int64
	db.Model(&models.TestimonialItem{}).Count(&count)
	if count == 0 {
		for i := range defaults {
			defaults[i].ID = uuid.New().String()
			_ = db.Create(&defaults[i]).Error
		}
	}

	var testimonials []models.TestimonialItem
	query := db.Model(&models.TestimonialItem{})
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}
	if proofType != "" && proofType != "all" {
		query = query.Where("proof_type = ?", proofType)
	}

	if err := query.Order("created_at DESC").Find(&testimonials).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memuat testimoni: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   testimonials,
		"total":  len(testimonials),
	})
}

// ============================================================================
// PUBLIC ADS LEAD CAPTURE WEBHOOK
// ============================================================================

// PublicWebhookLeadRequest payload penerimaan webhook prospek iklan (Meta Ads, TikTok Ads, LP)
type PublicWebhookLeadRequest struct {
	Key             string  `json:"key"`
	SponsorUsername string  `json:"sponsor_username"`
	Name            string  `json:"name" binding:"required"`
	Phone           string  `json:"phone" binding:"required"`
	City            string  `json:"city"`
	ProductInterest string  `json:"product_interest"`
	Source          string  `json:"source"` // Meta Ads, TikTok Ads, Landing Page, dsb.
	Notes           string  `json:"notes"`
	EstimatedValue  float64 `json:"estimated_value"`
}

// PublicLeadWebhook menerima lead dari webhook pihak ketiga (Meta Leads Ads, TikTok Lead Gen, Form LP)
// Endpoint: POST /api/public/leads/webhook
func (h *CRMHandler) PublicLeadWebhook(c *gin.Context) {
	var req PublicWebhookLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Nama dan Nomor WhatsApp/HP wajib diisi",
		})
		return
	}

	targetKey := strings.TrimSpace(req.Key)
	if targetKey == "" {
		targetKey = strings.TrimSpace(req.SponsorUsername)
	}
	if targetKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Parameter 'key' atau 'sponsor_username' wajib disertakan untuk menghubungkan prospek ke mitra penerima",
		})
		return
	}

	cleanPhone := strings.TrimSpace(req.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	}

	source := strings.TrimSpace(req.Source)
	if source == "" {
		source = "Meta Ads"
	}

	productInterest := strings.TrimSpace(req.ProductInterest)
	if productInterest == "" {
		productInterest = "Bio-Propolis Trigona"
	}

	db := config.DB
	now := time.Now()

	if db == nil {
		mockLead := models.Lead{
			ID:              uuid.New().String(),
			UserID:          "user-sponsor-" + targetKey,
			Name:            strings.TrimSpace(req.Name),
			Phone:           cleanPhone,
			City:            strings.TrimSpace(req.City),
			Source:          source,
			ProductInterest: productInterest,
			Status:          "new",
			Notes:           strings.TrimSpace(req.Notes),
			EstimatedValue:  req.EstimatedValue,
			CreatedAt:       now,
			UpdatedAt:       now,
		}
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Lead prospek webhook berhasil dicatat",
			"data":    mockLead,
		})
		return
	}

	// Temukan user mitra pemilik webhook berdasarkan username atau ID
	var sponsorUser models.User
	if err := db.Where("LOWER(username) = ? OR id = ?", strings.ToLower(targetKey), targetKey).First(&sponsorUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Sponsor atau mitra pemilik webhook tidak ditemukan",
		})
		return
	}

	// Cek apakah lead dengan nomor telepon ini sudah ada untuk sponsor ini
	var existing models.Lead
	if err := db.Where("user_id = ? AND phone = ?", sponsorUser.ID, cleanPhone).First(&existing).Error; err == nil {
		existing.Name = strings.TrimSpace(req.Name)
		if req.City != "" {
			existing.City = strings.TrimSpace(req.City)
		}
		existing.ProductInterest = productInterest
		existing.Source = source
		if req.EstimatedValue > 0 {
			existing.EstimatedValue = req.EstimatedValue
		}
		webhookNote := fmt.Sprintf("[%s Webhook %s]: Prospek kembali mengirimkan formulir (%s)", now.Format("2006-01-02 15:04"), source, productInterest)
		if existing.Notes != "" {
			existing.Notes = existing.Notes + "\n" + webhookNote
		} else {
			existing.Notes = webhookNote
		}
		existing.UpdatedAt = now
		_ = db.Save(&existing).Error

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Data prospek webhook berhasil diperbarui",
			"data":    existing,
		})
		return
	}

	// Buat prospek lead baru
	lead := models.Lead{
		ID:              uuid.New().String(),
		UserID:          sponsorUser.ID,
		Name:            strings.TrimSpace(req.Name),
		Phone:           cleanPhone,
		City:            strings.TrimSpace(req.City),
		Source:          source,
		ProductInterest: productInterest,
		Status:          "new",
		Notes:           strings.TrimSpace(req.Notes),
		EstimatedValue:  req.EstimatedValue,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := db.Create(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan prospek dari webhook: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Lead prospek webhook berhasil dicatat",
		"data":    lead,
	})
}

