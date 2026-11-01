package handlers

import (
	"net/http"
	"strconv"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type TikTokHandler struct{}

var GlobalTikTokHandler = &TikTokHandler{}

// GetOverview mengambil ringkasan views, likes, comments, shares TikTok
func (h *TikTokHandler) GetOverview(c *gin.Context) {
	userID := c.GetString("user_id")

	overview, err := services.GlobalTikTokService.GetOverview(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat overview TikTok: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   overview,
	})
}

// GetVideos mengambil daftar video TikTok beserta views & comments
func (h *TikTokHandler) GetVideos(c *gin.Context) {
	userID := c.GetString("user_id")
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)

	videos, err := services.GlobalTikTokService.GetVideos(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat video TikTok: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   videos,
	})
}

// GetComments mengambil komentar audiens pada video tertentu
func (h *TikTokHandler) GetComments(c *gin.Context) {
	videoID := c.Query("video_id")

	comments, err := services.GlobalTikTokService.GetComments(videoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat komentar TikTok: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   comments,
	})
}

// ConvertToLead mengonversi komentar TikTok menjadi prospek CRM
func (h *TikTokHandler) ConvertToLead(c *gin.Context) {
	userID := c.GetString("user_id")
	commentID := c.Param("id")

	lead, err := services.GlobalTikTokService.ConvertCommentToLead(commentID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal konversi lead: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Audien komentar TikTok berhasil dikonversi menjadi Prospek CRM!",
		"data":    lead,
	})
}

// ReplyComment mengirim balasan komentar TikTok
func (h *TikTokHandler) ReplyComment(c *gin.Context) {
	commentID := c.Param("id")

	var req struct {
		Text string `json:"text" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Isi balasan wajib diisi"})
		return
	}

	if err := services.GlobalTikTokService.ReplyComment(commentID, req.Text); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal membalas komentar: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Balasan berhasil dikirimkan ke komentar TikTok",
	})
}

