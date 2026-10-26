package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// RequireRole memeriksa apakah role pengguna yang sedang login terdapat dalam allowedRoles.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Akses ditolak: role pengguna tidak teridentifikasi pada token otorisasi",
			})
			c.Abort()
			return
		}

		roleStr, ok := userRole.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": "Akses ditolak: format role tidak valid",
			})
			c.Abort()
			return
		}

		// Cocokkan dengan allowedRoles
		for _, allowed := range allowedRoles {
			if strings.EqualFold(roleStr, allowed) {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{
			"status":  "error",
			"message": fmt.Sprintf("Akses ditolak: fitur ini memerlukan hak akses [%s]. Role Anda saat ini adalah '%s'.", strings.Join(allowedRoles, ", "), roleStr),
		})
		c.Abort()
	}
}
