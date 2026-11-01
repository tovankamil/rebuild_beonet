package handlers

import (
	"net/http"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type FarmHandler struct {
	farmService *services.FarmService
}

func NewFarmHandler(farmService *services.FarmService) *FarmHandler {
	if farmService == nil {
		farmService = services.GetFarmService()
	}
	return &FarmHandler{
		farmService: farmService,
	}
}

// GetFarmState retrieves the complete gamified herbal farm state for the current member
// GET /api/farm/state
func (h *FarmHandler) GetFarmState(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	state, err := h.farmService.GetFarmState(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   state,
	})
}

// PlantSeed plants a chosen seed into the member's plot
// POST /api/farm/plant
func (h *FarmHandler) PlantSeed(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	var req struct {
		PlantType string `json:"plant_type" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Pilih bibit tanaman yang valid (plant_type required)"})
		return
	}

	plot, err := h.farmService.PlantSeed(userID, req.PlantType)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Bibit herbal berhasil ditanam di kebun Anda!",
		"data":    plot,
	})
}

// WaterPlant waters the active plant by consuming 10 water droplets
// POST /api/farm/water
func (h *FarmHandler) WaterPlant(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	result, err := h.farmService.WaterPlant(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": result.Message,
		"data":    result,
	})
}

// HarvestPlant reaps harvest rewards (cash or voucher) and resets plot
// POST /api/farm/harvest
func (h *FarmHandler) HarvestPlant(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	harvestLog, err := h.farmService.HarvestPlant(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Panen raya berhasil! Hadiah telah masuk ke akun Anda.",
		"data":    harvestLog,
	})
}

// FeedPet satisfies pet hunger, raises happiness to 100, and gives +15 water bonus
// POST /api/farm/feed-pet
func (h *FarmHandler) FeedPet(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	pet, err := h.farmService.FeedPet(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Lebah Trigona Anda kenyang dan gembira! Anda memperoleh bonus +15 tetes air.",
		"data":    pet,
	})
}

// GetFarmFriends lists uplines and downlines with their garden status
// GET /api/farm/friends
func (h *FarmHandler) GetFarmFriends(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	friends, err := h.farmService.GetFarmFriends(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   friends,
	})
}

// HelpWaterFriend assists a fellow member's herbal plant
// POST /api/farm/help-water/:friend_id
func (h *FarmHandler) HelpWaterFriend(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	friendID := c.Param("friend_id")
	if friendID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter friend_id tidak boleh kosong"})
		return
	}

	result, err := h.farmService.HelpWaterFriend(userID, friendID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": result.Message,
		"data":    result,
	})
}

// ClaimDailyWaterBonus claims the daily login droplets bonus
// POST /api/farm/daily-bonus
func (h *FarmHandler) ClaimDailyWaterBonus(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Sesi tidak valid atau telah berakhir"})
		return
	}

	tank, err := h.farmService.ClaimDailyWaterBonus(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Bonus harian +30 tetes air berhasil diklaim!",
		"data":    tank,
	})
}
