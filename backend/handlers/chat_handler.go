package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ChatHandler struct{}

func NewChatHandler() *ChatHandler {
	return &ChatHandler{}
}

type SendMessageRequest struct {
	ReceiverID     string `json:"receiver_id"`
	Room           string `json:"room"`
	Message        string `json:"message"`
	AttachmentURL  string `json:"attachment_url"`
	AttachmentType string `json:"attachment_type"`
	AttachmentName string `json:"attachment_name"`
	AttachmentSize int64  `json:"attachment_size"`
}

// UploadAttachment mengunggah gambar atau dokumen untuk chat (Maksimum 5MB)
func (h *ChatHandler) UploadAttachment(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	// Batas ukuran 5MB
	const MaxFileSize = 5 * 1024 * 1024
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Gagal membaca berkas lampiran: " + err.Error()})
		return
	}
	defer file.Close()

	if header.Size > MaxFileSize {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Ukuran berkas melebihi batas maksimum 5MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]string{
		".jpg":  "image",
		".jpeg": "image",
		".png":  "image",
		".webp": "image",
		".gif":  "image",
		".pdf":  "document",
		".doc":  "document",
		".docx": "document",
		".xls":  "document",
		".xlsx": "document",
		".txt":  "document",
	}

	fileType, allowed := allowedExts[ext]
	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format berkas tidak didukung. Format yang diizinkan: JPG, PNG, WEBP, GIF, PDF, DOC/DOCX, XLS/XLSX, TXT"})
		return
	}

	uploadDir := "./uploads/chat"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal membuat direktori upload"})
		return
	}

	uniqueFilename := fmt.Sprintf("%s_%s%s", uuid.New().String()[:8], strings.ReplaceAll(header.Filename, " ", "_"), "")
	savePath := filepath.Join(uploadDir, uniqueFilename)

	if err := c.SaveUploadedFile(header, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan berkas ke server: " + err.Error()})
		return
	}

	fileURL := "/uploads/chat/" + uniqueFilename
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"url":  fileURL,
			"name": header.Filename,
			"size": header.Size,
			"type": fileType,
		},
	})
}

// GetMessages mengambil riwayat pesan
func (h *ChatHandler) GetMessages(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	currentUserRole := c.GetString("role")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	db := config.DB
	withUserID := c.Query("with_user_id")
	room := c.Query("room")

	var messages []models.ChatMessage
	query := db.Preload("Sender").Preload("Receiver").Order("created_at ASC")

	if withUserID != "" {
		// Specific peer-to-peer / support conversation
		query = query.Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			currentUserID, withUserID, withUserID, currentUserID,
		)
	} else if room != "" {
		query = query.Where("room = ?", room)
	} else {
		// Default behavior:
		// If member, show messages involving them
		if currentUserRole == "member" {
			query = query.Where("sender_id = ? OR receiver_id = ? OR room = ?", currentUserID, currentUserID, "support-"+currentUserID)
		} else {
			// If admin/cs, show latest 100 messages
			query = query.Limit(100)
		}
	}

	if err := query.Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat pesan chat"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   messages,
	})
}

// SendMessage mengirim pesan baru
func (h *ChatHandler) SendMessage(c *gin.Context) {
	senderID := c.GetString("user_id")
	senderRole := c.GetString("role")
	if senderID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format pesan tidak valid"})
		return
	}

	if strings.TrimSpace(req.Message) == "" && req.AttachmentURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Pesan atau berkas lampiran wajib diisi"})
		return
	}

	db := config.DB

	// Get sender info
	var sender models.User
	db.Where("id = ?", senderID).First(&sender)

	receiverID := req.ReceiverID
	room := req.Room

	// If member sends message and no specific receiver, route to support
	if senderRole == "member" && receiverID == "" {
		// Find a CS or Admin user if any
		var csUser models.User
		if err := db.Where("role IN ('cs', 'admin')").First(&csUser).Error; err == nil {
			receiverID = csUser.ID
		}
		if room == "" {
			room = "support-" + senderID
		}
	} else if room == "" && receiverID != "" {
		room = "support-" + receiverID
	}

	msgText := req.Message
	if msgText == "" && req.AttachmentURL != "" {
		if req.AttachmentType == "image" {
			msgText = "[Foto]"
		} else {
			msgText = "[Dokumen: " + req.AttachmentName + "]"
		}
	}

	msg := models.ChatMessage{
		ID:             uuid.New().String(),
		SenderID:       senderID,
		ReceiverID:     receiverID,
		Room:           room,
		Message:        msgText,
		AttachmentURL:  req.AttachmentURL,
		AttachmentType: req.AttachmentType,
		AttachmentName: req.AttachmentName,
		AttachmentSize: req.AttachmentSize,
		IsRead:         false,
	}

	if err := db.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengirim pesan"})
		return
	}

	// Preload sender
	db.Preload("Sender").Preload("Receiver").First(&msg, "id = ?", msg.ID)

	// Create real-time notification for recipient
	if senderRole == "member" {
		title := fmt.Sprintf("Pesan Baru dari Mitra @%s", sender.Username)
		snippet := msgText
		if len(snippet) > 80 {
			snippet = snippet[:80] + "..."
		}
		NotifyRole("cs", title, snippet, "chat", "/chat")
		NotifyRole("admin", title, snippet, "chat", "/chat")
	} else {
		if receiverID != "" && receiverID != senderID {
			title := fmt.Sprintf("Pesan Baru dari %s (@%s)", sender.FullName, sender.Username)
			if senderRole == "cs" {
				title = "Balasan dari Layanan Pelanggan (CS)"
			}
			snippet := msgText
			if len(snippet) > 80 {
				snippet = snippet[:80] + "..."
			}
			_ = CreateNotification(receiverID, title, snippet, "chat", "/chat")
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Pesan berhasil terkirim",
		"data":    msg,
	})
}

// GetConversations mengembalikan daftar percakapan aktif untuk CS / Admin
func (h *ChatHandler) GetConversations(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	currentUserRole := c.GetString("role")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	db := config.DB

	// For CS / Admin, find all distinct members who sent or received messages
	type ConvSummary struct {
		UserID        string `json:"user_id"`
		Username      string `json:"username"`
		FullName      string `json:"full_name"`
		Role          string `json:"role"`
		LastMessage   string `json:"last_message"`
		LastMessageAt string `json:"last_message_at"`
		UnreadCount   int    `json:"unread_count"`
	}

	// Fetch recent distinct senders/receivers
	var users []models.User
	if currentUserRole == "member" {
		// Member sees CS / Admin representatives
		db.Where("role IN ('admin', 'cs')").Find(&users)
	} else {
		// CS / Admin sees all members who have messages
		db.Raw(`
			SELECT DISTINCT u.* FROM users u
			INNER JOIN chat_messages m ON m.sender_id = u.id OR m.receiver_id = u.id
			WHERE u.id != ?
			ORDER BY u.created_at DESC
		`, currentUserID).Scan(&users)

		// Fallback: if no active messages yet, show first 5 members
		if len(users) == 0 {
			db.Where("role = 'member'").Limit(5).Find(&users)
		}
	}

	var results []ConvSummary
	for _, u := range users {
		var lastMsg models.ChatMessage
		db.Where(
			"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
			currentUserID, u.ID, u.ID, currentUserID,
		).Order("created_at DESC").First(&lastMsg)

		var unread int64
		db.Model(&models.ChatMessage{}).Where(
			"sender_id = ? AND receiver_id = ? AND is_read = ?",
			u.ID, currentUserID, false,
		).Count(&unread)

		snippet := "Mulai percakapan baru..."
		timeStr := ""
		if lastMsg.ID != "" {
			snippet = lastMsg.Message
			timeStr = lastMsg.CreatedAt.Format("15:04")
		}

		results = append(results, ConvSummary{
			UserID:        u.ID,
			Username:      u.Username,
			FullName:      u.FullName,
			Role:          u.Role,
			LastMessage:   snippet,
			LastMessageAt: timeStr,
			UnreadCount:   int(unread),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}

// MarkRead menandai pesan dari user tertentu telah dibaca
func (h *ChatHandler) MarkRead(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	currentUserRole := c.GetString("role")
	withUserID := c.Query("with_user_id")

	db := config.DB
	if withUserID != "" {
		db.Model(&models.ChatMessage{}).Where(
			"sender_id = ? AND (receiver_id = ? OR room = ?) AND is_read = ?",
			withUserID, currentUserID, "support-"+withUserID, false,
		).Update("is_read", true)
	} else if currentUserRole == "cs" || currentUserRole == "admin" {
		db.Model(&models.ChatMessage{}).Where(
			"sender_id != ? AND is_read = ?",
			currentUserID, false,
		).Update("is_read", true)
	} else {
		db.Model(&models.ChatMessage{}).Where(
			"(receiver_id = ? OR room = ?) AND sender_id != ? AND is_read = ?",
			currentUserID, "support-"+currentUserID, currentUserID, false,
		).Update("is_read", true)
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Pesan ditandai telah dibaca"})
}

// GetUnreadCount mengembalikan total pesan chat belum dibaca
func (h *ChatHandler) GetUnreadCount(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	currentUserRole := c.GetString("role")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var count int64
	db := config.DB
	if currentUserRole == "cs" || currentUserRole == "admin" {
		// Hitung pesan unread dari seluruh mitra yang membutuhkan penanganan CS/Admin
		db.Model(&models.ChatMessage{}).
			Joins("JOIN users ON users.id = chat_messages.sender_id").
			Where("users.role = ? AND chat_messages.is_read = ?", "member", false).
			Count(&count)
	} else {
		// Hitung pesan unread untuk mitra bersangkutan
		db.Model(&models.ChatMessage{}).Where(
			"(receiver_id = ? OR (room = ? AND sender_id != ?)) AND is_read = ?",
			currentUserID, "support-"+currentUserID, currentUserID, false,
		).Count(&count)
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": gin.H{"unread_count": count}})
}
