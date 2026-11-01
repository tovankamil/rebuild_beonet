package handlers

import (
	"net/http"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type WAHAHandler struct{}

var GlobalWAHAHandler = &WAHAHandler{}

// SendText WAHA-compatible endpoint untuk pengiriman pesan teks dengan antrean Go Routine
func (h *WAHAHandler) SendText(c *gin.Context) {
	var req struct {
		Session string `json:"session"`
		ChatID  string `json:"chatId"`
		Phone   string `json:"phone"`
		Text    string `json:"text" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format pesan tidak valid"})
		return
	}

	targetPhone := req.Phone
	if targetPhone == "" && req.ChatID != "" {
		targetPhone = req.ChatID
	}

	job, err := services.GlobalGoWAHAEngine.EnqueueJob(targetPhone, req.Text, "", "", req.Session)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Pesan berhasil dimasukkan ke antrean Goroutine Worker",
		"id":      job.ID,
	})
}

// SendFile WAHA-compatible endpoint untuk pengiriman media dengan antrean Go Routine
func (h *WAHAHandler) SendFile(c *gin.Context) {
	var req struct {
		Session  string `json:"session"`
		ChatID   string `json:"chatId"`
		Phone    string `json:"phone"`
		Caption  string `json:"caption"`
		MediaURL string `json:"media_url" binding:"required"`
		Type     string `json:"type"` // 'image', 'audio', 'document'
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format media tidak valid"})
		return
	}

	targetPhone := req.Phone
	if targetPhone == "" && req.ChatID != "" {
		targetPhone = req.ChatID
	}

	job, err := services.GlobalGoWAHAEngine.EnqueueJob(targetPhone, req.Caption, req.MediaURL, req.Type, req.Session)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Media berhasil dimasukkan ke antrean Goroutine Worker",
		"id":      job.ID,
	})
}

// BroadcastBulk mengirim pesan masal paralel ke ribuan nomor menggunakan Goroutines
func (h *WAHAHandler) BroadcastBulk(c *gin.Context) {
	var req struct {
		Phones    []string `json:"phones" binding:"required"`
		Message   string   `json:"message" binding:"required"`
		MediaURL  string   `json:"media_url"`
		MediaType string   `json:"media_type"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Daftar nomor telepon dan pesan wajib diisi"})
		return
	}

	queued := services.GlobalGoWAHAEngine.BroadcastBulk(req.Phones, req.Message, req.MediaURL, req.MediaType)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Broadcast diproses secara konkuren oleh worker goroutines",
		"queued":  queued,
		"total":   len(req.Phones),
	})
}

// GetEngineStats mengembalikan metrik realtime antrean Goroutines
func (h *WAHAHandler) GetEngineStats(c *gin.Context) {
	stats := services.GlobalGoWAHAEngine.GetStats()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
	})
}

// GetSessions mengembalikan daftar sesi WAHA
func (h *WAHAHandler) GetSessions(c *gin.Context) {
	sessions := services.GlobalGoWAHAEngine.GetSessions()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   sessions,
	})
}

