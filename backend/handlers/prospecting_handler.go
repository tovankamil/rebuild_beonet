package handlers

import (
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ProspectingHandler mengelola simulasi kalkulator prospek MLM (Module 4) & Web Push PWA (Module 7)
type ProspectingHandler struct{}

func NewProspectingHandler() *ProspectingHandler {
	return &ProspectingHandler{}
}

// SimulationRequest payload untuk simulasi kalkulator prospek
type SimulationRequest struct {
	PackageType       string `json:"package_type" binding:"required"` // "silver", "gold", "platinum"
	DuplicationFactor int    `json:"duplication_factor"`             // default 2 (misal merekrut 2 atau 3 mitra per bulan)
	Months            int    `json:"months"`                         // durasi proyeksi (3, 6, 12 bulan)
}

// RewardTierInfo rincian tingkatan hadiah MLM Bionet
type RewardTierInfo struct {
	Tier           int     `json:"tier"`
	RewardName     string  `json:"reward_name"`
	PointsRequired float64 `json:"points_required"`
	EstimatedValue float64 `json:"estimated_value"`
	IsAchieved     bool    `json:"is_achieved"`
	ProgressPct    float64 `json:"progress_pct"`
}

// MonthlyProjection rincian pertumbuhan jaringan per bulan
type MonthlyProjection struct {
	Month             int     `json:"month"`
	NewDownlines      int64   `json:"new_downlines"`
	TotalDownlines    int64   `json:"total_downlines"`
	LeftDownlines     int64   `json:"left_downlines"`
	RightDownlines    int64   `json:"right_downlines"`
	PointsLeft        float64 `json:"points_left"`
	PointsRight       float64 `json:"points_right"`
	CumulativePairing float64 `json:"cumulative_pairing"`
	TotalBonus        float64 `json:"total_bonus"`
}

// Simulate menghitung proyeksi duplikasi jaringan binary, bonus sponsor, bonus pasangan, dan reward
// Endpoint: POST /api/prospecting/simulate
func (h *ProspectingHandler) Simulate(c *gin.Context) {
	var req SimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Payload tidak valid: package_type ('silver', 'gold', 'platinum') wajib diisi",
		})
		return
	}

	pkgType := strings.ToLower(strings.TrimSpace(req.PackageType))
	var packageName string
	var price float64
	var sponsorBonus float64
	var pairingBonus float64
	var pointsPerPkg float64

	switch pkgType {
	case "silver":
		packageName = "Paket Silver (1 HU)"
		price = 250000.0
		sponsorBonus = 50000.0
		pairingBonus = 20000.0
		pointsPerPkg = 1.0
	case "gold":
		packageName = "Paket Gold (3 HU)"
		price = 750000.0
		sponsorBonus = 150000.0
		pairingBonus = 60000.0
		pointsPerPkg = 3.0
	case "platinum":
		packageName = "Paket Platinum (7 HU)"
		price = 1750000.0
		sponsorBonus = 350000.0
		pairingBonus = 140000.0
		pointsPerPkg = 7.0
	default:
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Paket tidak valid. Pilihan paket: 'silver', 'gold', atau 'platinum'",
		})
		return
	}

	d := req.DuplicationFactor
	if d <= 0 {
		d = 2
	}
	months := req.Months
	if months <= 0 {
		months = 3
	}
	if months > 24 {
		months = 24
	}

	// Hitung pertumbuhan kumulatif setiap bulan
	monthlyList := make([]MonthlyProjection, 0, months)
	var totalDownlines int64 = 0

	// Bonus sponsor dihitung dari duplikasi langsung generasi 1
	directSponsorBonus := float64(d) * sponsorBonus

	for m := 1; m <= months; m++ {
		newMembers := int64(math.Pow(float64(d), float64(m)))
		totalDownlines += newMembers

		left := totalDownlines / 2
		right := totalDownlines - left

		ptsLeft := float64(left) * pointsPerPkg
		ptsRight := float64(right) * pointsPerPkg

		pairs := left
		if right < pairs {
			pairs = right
		}

		cumPairing := float64(pairs) * pairingBonus
		totalBonus := directSponsorBonus + cumPairing

		monthlyList = append(monthlyList, MonthlyProjection{
			Month:             m,
			NewDownlines:      newMembers,
			TotalDownlines:    totalDownlines,
			LeftDownlines:     left,
			RightDownlines:    right,
			PointsLeft:        ptsLeft,
			PointsRight:       ptsRight,
			CumulativePairing: cumPairing,
			TotalBonus:        totalBonus,
		})
	}

	finalLeft := totalDownlines / 2
	finalRight := totalDownlines - finalLeft
	finalPtsLeft := float64(finalLeft) * pointsPerPkg
	finalPtsRight := float64(finalRight) * pointsPerPkg

	finalPairs := finalLeft
	if finalRight < finalPairs {
		finalPairs = finalRight
	}
	totalPairingBonus := float64(finalPairs) * pairingBonus
	totalEstimatedIncome := directSponsorBonus + totalPairingBonus

	// Evaluasi Reward Tiers MLM Bionet berdasarkan omset poin kaki lemah (binary weak leg)
	weakLegPoints := finalPtsLeft
	if finalPtsRight < weakLegPoints {
		weakLegPoints = finalPtsRight
	}

	tiersMaster := []struct {
		Tier           int
		Name           string
		PointsRequired float64
		EstimatedValue float64
	}{
		{1, "Smartphone Android / Logam Mulia 5gr", 50, 2500000},
		{2, "Sepeda Motor Honda Beat", 250, 18000000},
		{3, "Paket Umroh / Wisata Religi", 750, 35000000},
		{4, "Mobil Keluarga (Mitsubishi Xpander)", 2500, 200000000},
		{5, "Rumah Idaman Mewah / Mitsubishi Pajero", 10000, 750000000},
	}

	achievedTiers := make([]RewardTierInfo, 0, len(tiersMaster))
	for _, tm := range tiersMaster {
		achieved := weakLegPoints >= tm.PointsRequired
		pct := (weakLegPoints / tm.PointsRequired) * 100.0
		if pct > 100.0 {
			pct = 100.0
		}
		achievedTiers = append(achievedTiers, RewardTierInfo{
			Tier:           tm.Tier,
			RewardName:     tm.Name,
			PointsRequired: tm.PointsRequired,
			EstimatedValue: tm.EstimatedValue,
			IsAchieved:     achieved,
			ProgressPct:    math.Round(pct*100) / 100,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"package_type":           pkgType,
			"package_name":           packageName,
			"package_price":          price,
			"duplication_factor":     d,
			"months":                 months,
			"total_downlines":        totalDownlines,
			"left_downlines":         finalLeft,
			"right_downlines":        finalRight,
			"points_left":            finalPtsLeft,
			"points_right":           finalPtsRight,
			"total_points":           finalPtsLeft + finalPtsRight,
			"total_pairs":            finalPairs,
			"total_sponsor_bonus":    directSponsorBonus,
			"total_pairing_bonus":    totalPairingBonus,
			"total_estimated_income": totalEstimatedIncome,
			"achieved_reward_tiers":  achievedTiers,
			"monthly_breakdown":      monthlyList,
		},
	})
}

// SubscribePush menyimpan pendaftaran Web Push notification PWA browser
// Endpoint: POST /api/notifications/push-subscribe
func (h *ProspectingHandler) SubscribePush(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized",
		})
		return
	}

	var req struct {
		Endpoint string `json:"endpoint" binding:"required"`
		Keys     struct {
			P256dh string `json:"p256dh"`
			Auth   string `json:"auth"`
		} `json:"keys"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid push subscription payload",
		})
		return
	}

	db := config.DB
	if db != nil {
		var existing models.PushSubscription
		if err := db.Where("user_id = ? AND endpoint = ?", userID, req.Endpoint).First(&existing).Error; err == nil {
			existing.P256dh = req.Keys.P256dh
			existing.Auth = req.Keys.Auth
			existing.UserAgent = c.GetHeader("User-Agent")
			existing.UpdatedAt = time.Now()
			_ = db.Save(&existing).Error
		} else {
			newSub := models.PushSubscription{
				ID:        uuid.New().String(),
				UserID:    userID,
				Endpoint:  req.Endpoint,
				P256dh:    req.Keys.P256dh,
				Auth:      req.Keys.Auth,
				UserAgent: c.GetHeader("User-Agent"),
			}
			_ = db.Create(&newSub).Error
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "PWA Web Push subscription registered successfully",
	})
}

// GetVapidPublicKey mengembalikan public key VAPID untuk registrasi service worker PWA
// Endpoint: GET /api/notifications/push-public-key & GET /api/public/push/public-key
func (h *ProspectingHandler) GetVapidPublicKey(c *gin.Context) {
	vapidKey := os.Getenv("VAPID_PUBLIC_KEY")
	if vapidKey == "" {
		vapidKey = "BN8c_yW0jE4QZzR9vL1kM8pT5xY7wA2sD4fG6hJ0kL2mN4pQ6rS8tU0vW2xY4zA6bC8dE0fG2hJ4kL6mN8pQ"
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"public_key": vapidKey,
		},
	})
}

// TestPushNotification mengirimkan simulasi pesan push notification ke perangkat mitra
// Endpoint: POST /api/notifications/push-test
func (h *ProspectingHandler) TestPushNotification(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Unauthorized",
		})
		return
	}

	var req struct {
		Title   string `json:"title"`
		Message string `json:"message"`
	}
	_ = c.ShouldBindJSON(&req)

	if req.Title == "" {
		req.Title = "Bionet PWA Push Notification"
	}
	if req.Message == "" {
		req.Message = "Halo Mitra Juara! Notifikasi Web Push PWA Anda telah aktif dan siap menerima update komisi real-time."
	}

	_ = CreateNotification(userID, req.Title, req.Message, "system", "/member/dashboard")

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Simulasi push notification berhasil dikirim",
		"data": gin.H{
			"title":     req.Title,
			"message":   req.Message,
			"timestamp": time.Now(),
		},
	})
}
