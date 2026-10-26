package services

import (
	"encoding/json"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// RecordAudit mencatat riwayat perubahan data (UPDATE, DELETE, CREATE) ke tabel audit_logs
func RecordAudit(c *gin.Context, userID string, action string, tableName string, recordID string, oldVal interface{}, newVal interface{}) {
	db := config.DB
	if db == nil {
		return
	}

	ip := ""
	ua := ""
	if c != nil {
		ip = c.ClientIP()
		ua = c.Request.UserAgent()
		if userID == "" {
			userID = c.GetString("user_id")
		}
	}

	var oldStr, newStr string
	if oldVal != nil {
		if b, err := json.Marshal(oldVal); err == nil {
			oldStr = string(b)
		}
	}
	if newVal != nil {
		if b, err := json.Marshal(newVal); err == nil {
			newStr = string(b)
		}
	}

	logEntry := models.AuditLog{
		ID:        uuid.New().String(),
		UserID:    userID,
		Action:    action,
		TableName: tableName,
		RecordID:  recordID,
		OldValues: oldStr,
		NewValues: newStr,
		IPAddress: ip,
		UserAgent: ua,
	}

	_ = db.Create(&logEntry).Error
}
