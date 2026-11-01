package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

// IncidentRecoveryMiddleware menangkap panic tak terduga dan menyimpannya otomatis ke SystemIncidentLog
func IncidentRecoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				stack := string(debug.Stack())
				errTitle := fmt.Sprintf("HTTP Panic Recovery: %v", r)
				errMessage := fmt.Sprintf("Path: %s %s, Client IP: %s, Error: %v", c.Request.Method, c.Request.URL.Path, c.ClientIP(), r)

				// Simpan ke log gangguan sistem persisten
				_, _ = services.GlobalIncidentService.RecordIncident("system_runtime", "critical", errTitle, errMessage, stack)

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"status":  "error",
					"message": "Terjadi gangguan sistem internal. Insiden telah otomatis dicatat ke telemetry log pemeliharaan.",
				})
			}
		}()
		c.Next()
	}
}

