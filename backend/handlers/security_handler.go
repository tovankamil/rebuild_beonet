package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type SecurityHandler struct {
	securityService *services.SecurityService
	geoService      *services.GeoIPService
}

func NewSecurityHandler() *SecurityHandler {
	return &SecurityHandler{
		securityService: services.GetSecurityService(),
		geoService:      services.GetGeoIPService(),
	}
}

// GetThreatLogs mengembalikan ringkasan statistik keamanan, daftar log serangan, dan IP terblokir
// GET /api/admin/security/threats
func (h *SecurityHandler) GetThreatLogs(c *gin.Context) {
	summary := h.securityService.GetThreatSummary()

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Daftar log ancaman dan status pertahanan keamanan berhasil diambil",
		"data":    summary,
	})
}

// GetGeoTraffic mengembalikan data sebaran trafik dan daerah/kota akses pengguna di seluruh Indonesia
// GET /api/admin/security/geo-traffic
func (h *SecurityHandler) GetGeoTraffic(c *gin.Context) {
	summary := h.geoService.GetGeoTrafficSummary()

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data sebaran trafik dan lokasi akses pengguna se-Indonesia berhasil diambil",
		"data":    summary,
	})
}

// BlockIP memblokir IP secara manual oleh administrator
// POST /api/admin/security/block-ip
func (h *SecurityHandler) BlockIP(c *gin.Context) {
	var req models.BlockIPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format request tidak valid. 'ip_address' wajib diisi.",
			"error":   err.Error(),
		})
		return
	}

	req.IPAddress = strings.TrimSpace(req.IPAddress)
	if req.IPAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Alamat IP tidak boleh kosong",
		})
		return
	}

	adminUser := "admin"
	if u, exists := c.Get("username"); exists && u != nil {
		adminUser = fmt.Sprintf("%v", u)
	}

	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		reason = fmt.Sprintf("Pemblokiran manual oleh admin '%s'", adminUser)
	}

	block := h.securityService.BlockIP(req.IPAddress, reason, "manual_block", adminUser, 0)

	// Record threat log for auditing
	loc := h.geoService.ResolveIP(req.IPAddress)
	threatLog := models.SecurityThreatLog{
		IPAddress:    req.IPAddress,
		ThreatType:   "manual_block",
		Severity:     "high",
		Payload:      reason,
		Endpoint:     "/api/admin/security/block-ip",
		Method:       "POST",
		UserAgent:    "Admin Console",
		Country:      loc.Country,
		Province:     loc.Province,
		City:         loc.City,
		ISP:          loc.ISP,
		Latitude:     loc.Latitude,
		Longitude:    loc.Longitude,
		Blocked:      true,
		ActionTaken:  "blocked",
		RequestCount: 1,
		CreatedAt:    time.Now(),
	}
	h.securityService.RecordThreat(threatLog)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("IP %s berhasil dimasukkan ke daftar blokir", req.IPAddress),
		"data":    block,
	})
}

// UnblockIP membuka blokir IP secara manual
// POST /api/admin/security/unblock-ip
func (h *SecurityHandler) UnblockIP(c *gin.Context) {
	var req models.UnblockIPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format request tidak valid. 'ip_address' wajib diisi.",
			"error":   err.Error(),
		})
		return
	}

	req.IPAddress = strings.TrimSpace(req.IPAddress)
	if req.IPAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Alamat IP tidak boleh kosong",
		})
		return
	}

	h.securityService.UnblockIP(req.IPAddress)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("IP %s berhasil dibuka dari daftar blokir", req.IPAddress),
	})
}

// TestSecurityAlert mensimulasikan ancaman keamanan dan memicu notifikasi real-time ke Telegram & WhatsApp
// POST /api/admin/security/test-alert
func (h *SecurityHandler) TestSecurityAlert(c *gin.Context) {
	var req models.TestAlertRequest
	_ = c.ShouldBindJSON(&req)

	if req.ThreatType == "" {
		req.ThreatType = "sql_injection"
	}
	if req.IPAddress == "" {
		req.IPAddress = "180.244.12.34"
	}
	if req.Payload == "" {
		req.Payload = "' UNION SELECT null, username, password_hash FROM users WHERE '1'='1"
	}

	loc := h.geoService.ResolveIP(req.IPAddress)
	city := loc.City
	if req.City != "" {
		city = req.City
	}

	threat := models.SecurityThreatLog{
		IPAddress:    req.IPAddress,
		ThreatType:   req.ThreatType,
		Severity:     "critical",
		Payload:      req.Payload,
		Endpoint:     "/api/products/search",
		Method:       "GET",
		UserAgent:    "Mozilla/5.0 (Enterprise Security Test Runner)",
		Country:      loc.Country,
		Province:     loc.Province,
		City:         city,
		ISP:          loc.ISP,
		Latitude:     loc.Latitude,
		Longitude:    loc.Longitude,
		Blocked:      true,
		ActionTaken:  "blocked",
		RequestCount: 1,
		CreatedAt:    time.Now(),
	}

	h.securityService.RecordThreat(threat)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Simulasi alert keamanan berhasil dikirimkan ke Admin Telegram Bot dan WhatsApp Gateway",
		"data":    threat,
	})
}
