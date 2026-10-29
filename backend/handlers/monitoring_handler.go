package handlers

import (
	"net/http"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type MonitoringHandler struct {
	monitorService *services.MonitoringService
}

func NewMonitoringHandler() *MonitoringHandler {
	return &MonitoringHandler{
		monitorService: services.GetMonitoringService(),
	}
}

type HeartbeatRequest struct {
	CurrentPage string `json:"current_page"`
	FullName    string `json:"full_name"`
}

// UserHeartbeat receives periodic pings from logged-in clients
func (h *MonitoringHandler) UserHeartbeat(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")

	uidStr, ok := userID.(string)
	if !ok || uidStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req HeartbeatRequest
	_ = c.ShouldBindJSON(&req)

	unameStr, _ := username.(string)
	roleStr, _ := role.(string)

	h.monitorService.RecordHeartbeat(
		uidStr,
		unameStr,
		req.FullName,
		roleStr,
		req.CurrentPage,
		c.ClientIP(),
		c.Request.UserAgent(),
	)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Heartbeat updated",
	})
}

// UserLogoutPing immediately clears user from active list
func (h *MonitoringHandler) UserLogoutPing(c *gin.Context) {
	userID, _ := c.Get("user_id")
	if uidStr, ok := userID.(string); ok && uidStr != "" {
		h.monitorService.RemoveOnlineUser(uidStr)
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetMonitoringOverview returns comprehensive system, bandwidth, and online users telemetry
func (h *MonitoringHandler) GetMonitoringOverview(c *gin.Context) {
	metrics := h.monitorService.GetComprehensiveMetrics()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   metrics,
	})
}

// GetOnlineUsers returns list of currently connected users
func (h *MonitoringHandler) GetOnlineUsers(c *gin.Context) {
	users := h.monitorService.GetOnlineUsersList()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   users,
	})
}

// ForceDisconnectUser allows Admin to disconnect an active user session
func (h *MonitoringHandler) ForceDisconnectUser(c *gin.Context) {
	targetUserID := c.Param("id")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "ID Pengguna tidak valid"})
		return
	}

	h.monitorService.RemoveOnlineUser(targetUserID)
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Sesi pengguna berhasil diputuskan dari daftar aktif",
	})
}

// TestTelegramAlert allows admin to trigger a test alert to verify the Telegram bot channel
func (h *MonitoringHandler) TestTelegramAlert(c *gin.Context) {
	username, _ := c.Get("username")
	unameStr, _ := username.(string)

	err := h.monitorService.TriggerManualTestAlert(unameStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal mengirim alert ke Telegram: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Pesan alert uji coba berhasil dikirimkan ke Telegram Admin!",
	})
}

// GetWhatsAppStatus returns WhatsApp gateway operational metrics
func (h *MonitoringHandler) GetWhatsAppStatus(c *gin.Context) {
	waService := services.InitWhatsAppService()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   waService.GetStatus(),
	})
}

// GetWhatsAppLogs returns WhatsApp message delivery logs
func (h *MonitoringHandler) GetWhatsAppLogs(c *gin.Context) {
	waService := services.InitWhatsAppService()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   waService.GetLogs(),
	})
}

// SendWhatsAppTest sends a test notification via WhatsApp Gateway
func (h *MonitoringHandler) SendWhatsAppTest(c *gin.Context) {
	var req struct {
		Phone     string  `json:"phone" binding:"required"`
		Recipient string  `json:"recipient"`
		Category  string  `json:"category"` // 'bonus', 'shipping', 'custom'
		Amount    float64 `json:"amount"`
		Message   string  `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	waService := services.InitWhatsAppService()
	recipientName := req.Recipient
	if recipientName == "" {
		recipientName = "Mitra Bionet"
	}

	switch req.Category {
	case "bonus":
		amt := req.Amount
		if amt <= 0 {
			amt = 350000
		}
		_ = waService.SendBonusNotification(req.Phone, recipientName, "Bonus Pasangan (Pairing)", amt)
	case "shipping":
		_ = waService.SendOrderTrackingNotification(req.Phone, recipientName, "RO-BIO-9921", "J&T Express EZ", "JP882910293")
	default:
		msg := req.Message
		if msg == "" {
			msg = "Halo Mitra Bionet, ini adalah pesan uji coba dari sistem WhatsApp Gateway Bionet v6."
		}
		_ = waService.SendCustomMessage(req.Phone, recipientName, msg)
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Notifikasi WhatsApp berhasil diproses dan dicatat dalam antrean gateway!",
	})
}
