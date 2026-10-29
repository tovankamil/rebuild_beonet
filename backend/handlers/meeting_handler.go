package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MeetingHandler struct{}

func NewMeetingHandler() *MeetingHandler {
	return &MeetingHandler{}
}

// Helper to extract user identity & role from gin context
func getUserInfo(c *gin.Context) (userID string, username string, role string) {
	if v, ok := c.Get("user_id"); ok && v != nil {
		userID = fmt.Sprintf("%v", v)
	} else if v, ok := c.Get("userID"); ok && v != nil {
		userID = fmt.Sprintf("%v", v)
	}
	if v, ok := c.Get("username"); ok && v != nil {
		username = fmt.Sprintf("%v", v)
	}
	if v, ok := c.Get("role"); ok && v != nil {
		role = fmt.Sprintf("%v", v)
	}
	return
}

// Helper to parse dates in various standard formats
func parseScheduledTime(val string) (time.Time, error) {
	formats := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04:05",
		"2006-01-02T15:04",
		"2006-01-02 15:04:05",
		"2006-01-02 15:04",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, val); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("format waktu tidak valid: %s", val)
}

// SeedInitialMeetings populates default webinars if empty
func (h *MeetingHandler) SeedInitialMeetings() {
	var count int64
	config.DB.Model(&models.Meeting{}).Count(&count)
	if count == 0 {
		now := time.Now()
		// 1. National BOP Webinar
		config.DB.Create(&models.Meeting{
			ID:              uuid.New().String(),
			RoomID:          "bionet-bop-nasional",
			Title:           "Webinar Akbar BOP Nasional Bionet: Peluang Bisnis Abad 21",
			Description:     "Presentasi resmi Marketing Plan Bionet, demo produk herbal tetes dan strategi mencetak omset jutaan rupiah per minggu bersama Top Leader Nasional.",
			Category:        "bop",
			HostID:          "admin-system",
			HostName:        "Direktur Edukasi & Marketing Bionet",
			ScheduledAt:     now.Add(2 * time.Hour),
			Status:          "live",
			MaxParticipants: 500,
			RecordingStatus: "none",
			CreatedAt:       now,
			UpdatedAt:       now,
		})

		// 2. Video KYC Anti-Fraud Call
		config.DB.Create(&models.Meeting{
			ID:              uuid.New().String(),
			RoomID:          "kyc-verif-reward",
			Title:           "Sesi Video Call KYC: Validasi Reward Mobil & Rumah Mewah",
			Description:     "Ruang verifikasi tatap muka resmi antara Tim Audit Kepatuhan & CS Bionet dengan mitra calon penerima reward mobil/rumah.",
			Category:        "kyc",
			HostID:          "admin-system",
			HostName:        "Tim Kepatuhan & Anti-Fraud",
			ScheduledAt:     now.Add(24 * time.Hour),
			Status:          "scheduled",
			MaxParticipants: 5,
			RecordingStatus: "none",
			CreatedAt:       now,
			UpdatedAt:       now,
		})

		// 3. Herbal Health Consultation Q&A
		config.DB.Create(&models.Meeting{
			ID:              uuid.New().String(),
			RoomID:          "konsultasi-herbal-dr",
			Title:           "Klinik Herbal Bionet: Konsultasi Dosis & Terapi Alami",
			Description:     "Sesi tanya jawab live seputar manfaat Propolis Trigona, dosis Bio-Herbal Drops untuk hipertensi, diabetes, dan pemulihan stamina.",
			Category:        "herbal",
			HostID:          "admin-system",
			HostName:        "Konsultan Herbalis Resmi Bionet",
			ScheduledAt:     now.Add(48 * time.Hour),
			Status:          "scheduled",
			MaxParticipants: 100,
			RecordingStatus: "none",
			CreatedAt:       now,
			UpdatedAt:       now,
		})
	}
}

// GetMeetings returns list of active & scheduled video conference rooms
func (h *MeetingHandler) GetMeetings(c *gin.Context) {
	h.SeedInitialMeetings()

	var meetings []models.Meeting
	category := c.Query("category")

	query := config.DB.Order("created_at DESC")
	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	if err := query.Find(&meetings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load meetings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   meetings,
	})
}

// CreateMeeting creates a new video conference room
func (h *MeetingHandler) CreateMeeting(c *gin.Context) {
	var input struct {
		Title           string `json:"title" binding:"required"`
		Description     string `json:"description"`
		Category        string `json:"category"`
		Password        string `json:"password"`
		ScheduledAt     string `json:"scheduled_at"`
		MaxParticipants int    `json:"max_participants"`
		Capacity        int    `json:"capacity"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, username, _ := getUserInfo(c)

	hostIDStr := "system"
	if userID != "" {
		hostIDStr = userID
	}

	hostNameStr := "Mitra Host"
	if username != "" {
		hostNameStr = username
	}

	// Generate clean slug room ID
	cleanTitle := strings.ToLower(input.Title)
	cleanTitle = strings.ReplaceAll(cleanTitle, " ", "-")
	cleanTitle = strings.ReplaceAll(cleanTitle, ":", "")
	if len(cleanTitle) > 30 {
		cleanTitle = cleanTitle[:30]
	}
	roomID := fmt.Sprintf("room-%s-%d", cleanTitle, time.Now().Unix()%100000)

	scheduledTime := time.Now()
	if input.ScheduledAt != "" {
		if parsed, err := parseScheduledTime(input.ScheduledAt); err == nil {
			scheduledTime = parsed
		}
	}

	maxP := 100
	if input.Capacity > 0 {
		maxP = input.Capacity
	} else if input.MaxParticipants > 0 {
		maxP = input.MaxParticipants
	}

	category := "bop"
	if input.Category != "" {
		category = input.Category
	}

	meeting := models.Meeting{
		ID:              uuid.New().String(),
		RoomID:          roomID,
		Title:           input.Title,
		Description:     input.Description,
		Category:        category,
		HostID:          hostIDStr,
		HostName:        hostNameStr,
		Password:        input.Password,
		ScheduledAt:     scheduledTime,
		Status:          "live", // Created meetings default to live immediately
		MaxParticipants: maxP,
		RecordingStatus: "none",
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := config.DB.Create(&meeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create meeting room"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Ruang video conference berhasil dibuat dan live!",
		"data":    meeting,
	})
}

// GetMeetingByRoom gets meeting info by room_id
func (h *MeetingHandler) GetMeetingByRoom(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meeting room not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   meeting,
	})
}

// UpdateMeetingInput defines allowable fields to update a meeting
type UpdateMeetingInput struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	Category        string `json:"category"`
	Capacity        *int   `json:"capacity"`
	MaxParticipants *int   `json:"max_participants"`
	ScheduledAt     string `json:"scheduled_at"`
	Status          string `json:"status"`
}

// UpdateMeeting updates an existing video conference room
func (h *MeetingHandler) UpdateMeeting(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Meeting room tidak ditemukan",
		})
		return
	}

	userID, _, role := getUserInfo(c)
	isAdmin := role == "admin" || role == "superadmin"
	isHost := userID != "" && meeting.HostID == userID

	if !isAdmin && !isHost {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akses ditolak: Hanya host atau admin yang memiliki hak mengubah ruang meeting ini",
		})
		return
	}

	var input UpdateMeetingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format data tidak valid: " + err.Error(),
		})
		return
	}

	// Validate and apply fields
	if strings.TrimSpace(input.Title) != "" {
		meeting.Title = strings.TrimSpace(input.Title)
	}
	if input.Description != "" {
		meeting.Description = input.Description
	}
	if input.Category != "" {
		meeting.Category = input.Category
	}
	if input.Capacity != nil && *input.Capacity > 0 {
		meeting.MaxParticipants = *input.Capacity
	} else if input.MaxParticipants != nil && *input.MaxParticipants > 0 {
		meeting.MaxParticipants = *input.MaxParticipants
	}
	if input.ScheduledAt != "" {
		parsedTime, err := parseScheduledTime(input.ScheduledAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Format scheduled_at tidak valid. Gunakan format ISO 8601 / RFC3339",
			})
			return
		}
		meeting.ScheduledAt = parsedTime
	}
	if input.Status != "" {
		validStatuses := map[string]bool{"scheduled": true, "live": true, "ended": true}
		if !validStatuses[input.Status] {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Status tidak valid. Nilai yang diperbolehkan: 'scheduled', 'live', atau 'ended'",
			})
			return
		}
		meeting.Status = input.Status
	}

	meeting.UpdatedAt = time.Now()

	if err := config.DB.Save(&meeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan perubahan meeting room",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Meeting room berhasil diperbarui",
		"data":    meeting,
	})
}

// DeleteMeeting deletes or soft-deletes a meeting room
func (h *MeetingHandler) DeleteMeeting(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Meeting room tidak ditemukan",
		})
		return
	}

	userID, _, role := getUserInfo(c)
	isAdmin := role == "admin" || role == "superadmin"
	isHost := userID != "" && meeting.HostID == userID

	if !isAdmin && !isHost {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akses ditolak: Hanya host atau admin yang dapat menghapus ruang meeting ini",
		})
		return
	}

	if err := config.DB.Delete(&meeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus meeting room: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Meeting room berhasil dihapus",
	})
}

// UploadRecording handles recording file upload or recording metadata update
func (h *MeetingHandler) UploadRecording(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Meeting room tidak ditemukan",
		})
		return
	}

	userID, _, role := getUserInfo(c)
	isAdmin := role == "admin" || role == "superadmin"
	isHost := userID != "" && meeting.HostID == userID

	if !isAdmin && !isHost {
		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": "Akses ditolak: Hanya host atau admin yang dapat mengunggah atau memperbarui rekaman meeting ini",
		})
		return
	}

	uploadDir := "./uploads/recordings"
	var recordingURL string
	var recordingStatus string = "ready"
	fileProcessed := false

	// Try checking if a file was uploaded
	file, err := c.FormFile("recording")
	if err != nil {
		file, err = c.FormFile("file")
	}

	if err == nil && file != nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		allowedExts := map[string]bool{
			".mp4": true, ".webm": true, ".mkv": true,
			".mov": true, ".avi": true, ".mp3": true,
			".wav": true, ".m4a": true, ".ogg": true,
		}
		if !allowedExts[ext] {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": "Format file tidak didukung. Format yang diizinkan: MP4, WEBM, MKV, MOV, MP3, WAV, dsb",
			})
			return
		}

		if err := os.MkdirAll(uploadDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Gagal membuat direktori upload rekaman di server",
			})
			return
		}

		uniqueFilename := fmt.Sprintf("%s_%s%s", roomID, uuid.New().String()[:8], ext)
		savePath := filepath.Join(uploadDir, uniqueFilename)

		if err := c.SaveUploadedFile(file, savePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Gagal menyimpan berkas rekaman ke server: " + err.Error(),
			})
			return
		}

		recordingURL = "/uploads/recordings/" + uniqueFilename
		fileProcessed = true

		if customStatus := c.PostForm("recording_status"); customStatus != "" {
			recordingStatus = customStatus
		} else if customStatus := c.PostForm("status"); customStatus != "" {
			recordingStatus = customStatus
		}
	} else {
		// No file attached: check for JSON or form data metadata
		contentType := c.ContentType()
		if strings.Contains(contentType, "application/json") {
			var payload struct {
				RecordingURL    string `json:"recording_url"`
				RecordingStatus string `json:"recording_status"`
				Status          string `json:"status"`
			}
			if err := c.ShouldBindJSON(&payload); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{
					"status":  "error",
					"message": "Format data JSON tidak valid: " + err.Error(),
				})
				return
			}
			recordingURL = payload.RecordingURL
			if payload.RecordingStatus != "" {
				recordingStatus = payload.RecordingStatus
			} else if payload.Status != "" {
				recordingStatus = payload.Status
			}
		} else {
			recordingURL = c.PostForm("recording_url")
			if customStatus := c.PostForm("recording_status"); customStatus != "" {
				recordingStatus = customStatus
			} else if customStatus := c.PostForm("status"); customStatus != "" {
				recordingStatus = customStatus
			}
		}
	}

	if !fileProcessed && recordingURL == "" && recordingStatus == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "File rekaman atau recording_url wajib disertakan",
		})
		return
	}

	if recordingURL != "" {
		meeting.RecordingURL = recordingURL
	}
	if recordingStatus != "" {
		meeting.RecordingStatus = recordingStatus
	}
	meeting.UpdatedAt = time.Now()

	if err := config.DB.Save(&meeting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui status rekaman meeting: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Rekaman meeting berhasil disimpan",
		"data":    meeting,
	})
}

// EndMeeting updates meeting status to 'ended'
func (h *MeetingHandler) EndMeeting(c *gin.Context) {
	roomID := c.Param("room_id")
	if err := config.DB.Model(&models.Meeting{}).Where("room_id = ?", roomID).Update("status", "ended").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to end meeting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Meeting room telah ditutup",
	})
}

// GetPublicMeeting retrieves meeting info for public visitors without auth
func (h *MeetingHandler) GetPublicMeeting(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Room meeting atau webinar tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"id":               meeting.ID,
			"room_id":          meeting.RoomID,
			"title":            meeting.Title,
			"description":      meeting.Description,
			"category":         meeting.Category,
			"host_name":        meeting.HostName,
			"scheduled_at":     meeting.ScheduledAt,
			"status":           meeting.Status,
			"max_participants": meeting.MaxParticipants,
		},
	})
}

// RegisterPublicAttendee registers a public guest attendee with full name, email, phone, address
func (h *MeetingHandler) RegisterPublicAttendee(c *gin.Context) {
	roomID := c.Param("room_id")
	var meeting models.Meeting

	if err := config.DB.Where("room_id = ?", roomID).First(&meeting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Room meeting tidak ditemukan",
		})
		return
	}

	if meeting.Status == "ended" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Maaf, sesi pertemuan ini sudah berakhir dan ditutup oleh host.",
		})
		return
	}

	var input struct {
		FullName string `json:"full_name" binding:"required"`
		Email    string `json:"email" binding:"required"`
		Phone    string `json:"phone" binding:"required"`
		Address  string `json:"address" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Semua field pendaftaran tamu wajib diisi: Nama Lengkap, Email, No. HP / WhatsApp, dan Alamat Domisili.",
		})
		return
	}

	attendee := models.MeetingAttendee{
		ID:        uuid.New().String(),
		RoomID:    roomID,
		FullName:  input.FullName,
		Email:     input.Email,
		Phone:     input.Phone,
		Address:   input.Address,
		Role:      "guest",
		JoinedAt:  time.Now(),
		CreatedAt: time.Now(),
	}

	if err := config.DB.Create(&attendee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan data pendaftaran tamu: " + err.Error(),
		})
		return
	}

	// Trigger WhatsApp welcome notification if phone provided
	go func() {
		defer func() {
			if r := recover(); r != nil {
				fmt.Println("Recovered in WhatsApp notification:", r)
			}
		}()
		wa := services.InitWhatsAppService()
		if wa != nil {
			msg := fmt.Sprintf("Halo Bapak/Ibu %s,\n\nTerima kasih telah mendaftar di Webinar Bionet: *%s*.\n\nRoom ID: %s\nHost: %s\nStatus: LIVE\n\nSelamat mengikuti presentasi bisnis dan konsultasi!",
				input.FullName, meeting.Title, meeting.RoomID, meeting.HostName)
			wa.SendCustomMessage(input.Phone, input.FullName, msg)
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"message":  "Pendaftaran berhasil! Selamat datang di ruang pertemuan Bionet.",
		"attendee": attendee,
		"meeting":  meeting,
	})
}

// GetMeetingAttendees returns the list of registered attendees for a room
func (h *MeetingHandler) GetMeetingAttendees(c *gin.Context) {
	roomID := c.Param("room_id")
	var attendees []models.MeetingAttendee
	config.DB.Where("room_id = ?", roomID).Order("created_at desc").Find(&attendees)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   attendees,
	})
}

// JoinMeetingRoom records or updates a participant joining a meeting room
func (h *MeetingHandler) JoinMeetingRoom(c *gin.Context) {
	roomID := c.Param("room_id")
	userID, _ := c.Get("user_id")
	userName, _ := c.Get("username")
	role, _ := c.Get("role")

	var input struct {
		IsCameraOn bool `json:"is_camera_on"`
		IsMicOn    bool `json:"is_mic_on"`
	}
	_ = c.ShouldBindJSON(&input)

	uID := fmt.Sprintf("%v", userID)
	uName := fmt.Sprintf("%v", userName)
	uRole := fmt.Sprintf("%v", role)
	if uID == "" || uID == "<nil>" {
		uID = uuid.New().String()
	}

	fullName := uName
	var user models.User
	if err := config.DB.Where("id = ?", uID).First(&user).Error; err == nil && user.FullName != "" {
		fullName = user.FullName
	}

	var participant models.MeetingParticipant
	err := config.DB.Where("room_id = ? AND user_id = ?", roomID, uID).First(&participant).Error
	now := time.Now()
	if err != nil {
		participant = models.MeetingParticipant{
			ID:         uuid.New().String(),
			RoomID:     roomID,
			UserID:     uID,
			Username:   uName,
			FullName:   fullName,
			Role:       uRole,
			IsCameraOn: input.IsCameraOn,
			IsMicOn:    input.IsMicOn,
			LastSeenAt: now,
			JoinedAt:   now,
		}
		config.DB.Create(&participant)
	} else {
		participant.IsCameraOn = input.IsCameraOn
		participant.IsMicOn = input.IsMicOn
		participant.LastSeenAt = now
		participant.FullName = fullName
		config.DB.Save(&participant)
	}

	var active []models.MeetingParticipant
	activeThreshold := now.Add(-45 * time.Second)
	config.DB.Where("room_id = ? AND last_seen_at >= ?", roomID, activeThreshold).Order("joined_at asc").Find(&active)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   active,
	})
}

// LeaveMeetingRoom removes a participant from the room
func (h *MeetingHandler) LeaveMeetingRoom(c *gin.Context) {
	roomID := c.Param("room_id")
	userID, _ := c.Get("user_id")
	uID := fmt.Sprintf("%v", userID)

	config.DB.Where("room_id = ? AND user_id = ?", roomID, uID).Delete(&models.MeetingParticipant{})

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// HeartbeatMeeting updates a participant's presence timestamp and audio/video state
func (h *MeetingHandler) HeartbeatMeeting(c *gin.Context) {
	roomID := c.Param("room_id")
	userID, _ := c.Get("user_id")
	uID := fmt.Sprintf("%v", userID)

	var input struct {
		IsCameraOn *bool `json:"is_camera_on"`
		IsMicOn    *bool `json:"is_mic_on"`
		IsHandUp   *bool `json:"is_hand_up"`
	}
	_ = c.ShouldBindJSON(&input)

	now := time.Now()
	updates := map[string]interface{}{
		"last_seen_at": now,
	}
	if input.IsCameraOn != nil {
		updates["is_camera_on"] = *input.IsCameraOn
	}
	if input.IsMicOn != nil {
		updates["is_mic_on"] = *input.IsMicOn
	}
	if input.IsHandUp != nil {
		updates["is_hand_up"] = *input.IsHandUp
	}

	config.DB.Model(&models.MeetingParticipant{}).Where("room_id = ? AND user_id = ?", roomID, uID).Updates(updates)

	// Clean up stale participants (> 45s)
	activeThreshold := now.Add(-45 * time.Second)
	config.DB.Where("room_id = ? AND last_seen_at < ?", roomID, activeThreshold).Delete(&models.MeetingParticipant{})

	var active []models.MeetingParticipant
	config.DB.Where("room_id = ? AND last_seen_at >= ?", roomID, activeThreshold).Order("joined_at asc").Find(&active)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   active,
	})
}

// GetMeetingParticipants returns all currently active participants in a room
func (h *MeetingHandler) GetMeetingParticipants(c *gin.Context) {
	roomID := c.Param("room_id")
	now := time.Now()
	activeThreshold := now.Add(-45 * time.Second)

	var active []models.MeetingParticipant
	config.DB.Where("room_id = ? AND last_seen_at >= ?", roomID, activeThreshold).Order("joined_at asc").Find(&active)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   active,
	})
}
