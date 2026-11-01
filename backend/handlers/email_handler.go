package handlers

import (
	"net/http"
	"strconv"

	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type EmailHandler struct{}

var GlobalEmailHandler = &EmailHandler{}

// GetConfig mengambil pengaturan email yang aktif
func (h *EmailHandler) GetConfig(c *gin.Context) {
	userID := c.GetString("user_id")
	cfg, err := services.GlobalEmailService.GetActiveConfig(userID)
	if err != nil {
		// Kembalikan konfigurasi default kosong
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data": gin.H{
				"provider":        "gmail",
				"email_address":   "",
				"sender_name":     "Bionet Official",
				"smtp_host":       "smtp.gmail.com",
				"smtp_port":       587,
				"smtp_username":   "",
				"smtp_encryption": "tls",
				"imap_host":       "imap.gmail.com",
				"imap_port":       993,
				"imap_username":   "",
				"imap_encryption": "ssl",
				"is_active":       false,
			},
		})
		return
	}

	// Jangan bocorkan password asli ke frontend
	maskedSMTPPass := ""
	if cfg.SMTPPassword != "" {
		maskedSMTPPass = "********"
	}
	maskedIMAPPass := ""
	if cfg.IMAPPassword != "" {
		maskedIMAPPass = "********"
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"id":              cfg.ID,
			"provider":        cfg.Provider,
			"email_address":   cfg.EmailAddress,
			"sender_name":     cfg.SenderName,
			"smtp_host":       cfg.SMTPHost,
			"smtp_port":       cfg.SMTPPort,
			"smtp_username":   cfg.SMTPUsername,
			"smtp_password":   maskedSMTPPass,
			"smtp_encryption": cfg.SMTPEncryption,
			"imap_host":       cfg.IMAPHost,
			"imap_port":       cfg.IMAPPort,
			"imap_username":   cfg.IMAPUsername,
			"imap_password":   maskedIMAPPass,
			"imap_encryption": cfg.IMAPEncryption,
			"is_active":       cfg.IsActive,
		},
	})
}

// SaveConfig menyimpan pengaturan email
func (h *EmailHandler) SaveConfig(c *gin.Context) {
	userID := c.GetString("user_id")

	var req models.EmailConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Input pengaturan email tidak valid"})
		return
	}

	req.UserID = userID
	req.IsActive = true

	// Jika password baru berupa bintang-bintang / kosong, jangan timpa password lama
	existing, err := services.GlobalEmailService.GetActiveConfig(userID)
	if err == nil && existing != nil {
		if req.SMTPPassword == "" || req.SMTPPassword == "********" {
			req.SMTPPassword = existing.SMTPPassword
		}
		if req.IMAPPassword == "" || req.IMAPPassword == "********" {
			req.IMAPPassword = existing.IMAPPassword
		}
	}

	if err := services.GlobalEmailService.SaveConfig(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan konfigurasi email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Pengaturan email akun berhasil disimpan!"})
}

// FetchInbox mengambil daftar email masuk
func (h *EmailHandler) FetchInbox(c *gin.Context) {
	userID := c.GetString("user_id")
	limitStr := c.DefaultQuery("limit", "20")
	limit, _ := strconv.Atoi(limitStr)

	list, err := services.GlobalEmailService.FetchInbox(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal membaca kotak masuk: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   list,
		"count":  len(list),
	})
}

// GetEmailDetail membaca detail pesan email tertentu
func (h *EmailHandler) GetEmailDetail(c *gin.Context) {
	userID := c.GetString("user_id")
	seqStr := c.Param("seq")
	seqNum, err := strconv.ParseUint(seqStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Sequence number email tidak valid"})
		return
	}

	detail, err := services.GlobalEmailService.GetEmailDetail(userID, uint32(seqNum))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   detail,
	})
}

// SendEmail mengirim atau membalas pesan email
func (h *EmailHandler) SendEmail(c *gin.Context) {
	userID := c.GetString("user_id")

	var req models.SendEmailPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Penerima, subjek, dan isi email wajib diisi"})
		return
	}

	// Format text dan html body
	textBody := req.Body
	htmlBody := `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;">` +
		stringsReplaceNewlines(req.Body) +
		`</div>`

	err := services.GlobalEmailService.SendEmail(userID, req.To, req.Subject, htmlBody, textBody, req.InReplyTo, req.Attachments)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengirim email: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Email berhasil terkirim ke " + req.To,
	})
}

func stringsReplaceNewlines(s string) string {
	var result string
	for _, line := range splitLines(s) {
		result += "<p style='margin: 0 0 10px;'>" + line + "</p>"
	}
	return result
}

func splitLines(s string) []string {
	var lines []string
	curr := ""
	for _, r := range s {
		if r == '\n' {
			lines = append(lines, curr)
			curr = ""
		} else if r != '\r' {
			curr += string(r)
		}
	}
	if curr != "" {
		lines = append(lines, curr)
	}
	return lines
}

