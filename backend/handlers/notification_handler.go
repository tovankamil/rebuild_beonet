package handlers

import (
	"net/http"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct{}

func NewNotificationHandler() *NotificationHandler {
	return &NotificationHandler{}
}

// Helper untuk membuat notifikasi transaksional / chat secara programatis
func CreateNotification(userID string, title string, message string, notifType string, link string) error {
	db := config.DB
	if db == nil {
		return nil
	}

	notif := models.Notification{
		ID:      uuid.New().String(),
		UserID:  userID,
		Title:   title,
		Message: message,
		Type:    notifType,
		Link:    link,
		IsRead:  false,
	}
	return db.Create(&notif).Error
}

// NotifyRole mengirim notifikasi ke seluruh user dengan role tertentu (cth: 'admin', 'keuangan', 'cs')
func NotifyRole(role string, title string, message string, notifType string, link string) {
	db := config.DB
	if db == nil {
		return
	}
	var users []models.User
	db.Where("role = ?", role).Find(&users)
	for _, u := range users {
		_ = CreateNotification(u.ID, title, message, notifType, link)
	}
}

// NotifyAdminsAndFinance mengirim notifikasi ke admin dan tim keuangan
func NotifyAdminsAndFinance(title string, message string, notifType string, link string) {
	db := config.DB
	if db == nil {
		return
	}
	var users []models.User
	db.Where("role IN ('admin', 'keuangan')").Find(&users)
	for _, u := range users {
		_ = CreateNotification(u.ID, title, message, notifType, link)
	}
}

// GetNotifications mengambil daftar notifikasi pengguna
func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	db := config.DB
	var notifs []models.Notification
	if err := db.Where("user_id = ?", userID).Order("created_at DESC").Limit(40).Find(&notifs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat notifikasi"})
		return
	}

	var unreadCount int64
	db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"notifications": notifs,
			"unread_count":  unreadCount,
		},
	})
}

// MarkAsRead menandai satu notifikasi telah dibaca
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	notifID := c.Param("id")

	db := config.DB
	if err := db.Model(&models.Notification{}).Where("id = ? AND user_id = ?", notifID, userID).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui notifikasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Notifikasi ditandai dibaca"})
}

// MarkAllAsRead menandai seluruh notifikasi pengguna telah dibaca
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	db := config.DB
	if err := db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui notifikasi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Semua notifikasi ditandai telah dibaca"})
}

// GetUnreadCount mengembalikan total notifikasi belum dibaca
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var count int64
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count)

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": gin.H{"unread_count": count}})
}
