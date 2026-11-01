package handlers

import (
	"net/http"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type RankHandler struct {
	rankService *services.RankService
}

func NewRankHandler() *RankHandler {
	return &RankHandler{
		rankService: services.GetRankService(),
	}
}

// GetMyRankProgress mengembalikan status jenjang karir, poin PV kiri & kanan, dan reward mitra saat ini
func (h *RankHandler) GetMyRankProgress(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	progress, err := h.rankService.GetUserRankProgress(currentUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   progress,
	})
}

// ClaimReward memproses klaim hadiah peringkat yang telah terkualifikasi
func (h *RankHandler) ClaimReward(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req struct {
		RankCode  string `json:"rank_code" binding:"required"`
		ClaimType string `json:"claim_type"` // 'cash' atau 'physical'
		Notes     string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data permintaan klaim tidak valid (rank_code diperlukan)",
		})
		return
	}

	if req.ClaimType == "" {
		req.ClaimType = "cash"
	}

	claim, err := h.rankService.ClaimReward(currentUserID, req.RankCode, req.ClaimType, req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Selamat! Klaim reward peringkat kemitraan berhasil dicairkan ke saldo akun Anda.",
		"data":    claim,
	})
}

// GetStandardRanks mengembalikan daftar baku seluruh peringkat dan kualifikasi hadiah Bionet
func (h *RankHandler) GetStandardRanks(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   services.StandardRanks,
	})
}
