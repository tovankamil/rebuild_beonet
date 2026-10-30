package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

// SecurityGuardMiddleware memproteksi aplikasi Bionet dari serangan siber, flooding, SQLi, XSS, Path Traversal, dan brute-force
func SecurityGuardMiddleware() gin.HandlerFunc {
	securityService := services.GetSecurityService()
	geoService := services.GetGeoIPService()

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if clientIP == "" {
			clientIP = "127.0.0.1"
		}
		path := c.Request.URL.Path

		// Baca body request dengan aman (clone buffer agar downstream handler tetap dapat membaca)
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// 1. Brute Force Login Lockout Check (Kembalikan HTTP 429 jika akun/IP terkunci)
		var loginUsername string
		if path == "/api/auth/login" {
			var loginData struct {
				Username string `json:"username"`
			}
			_ = json.Unmarshal(bodyBytes, &loginData)
			loginUsername = strings.TrimSpace(loginData.Username)

			if securityService.IsBruteForceLocked(clientIP, loginUsername) {
				c.JSON(http.StatusTooManyRequests, gin.H{
					"status":  "error",
					"message": "Akun atau IP Anda terkunci sementara karena terdeteksi >5 kegagalan login berturut-turut. Silakan tunggu beberapa saat.",
				})
				c.Abort()
				return
			}
		}

		// 2. Periksa apakah IP sudah terdaftar dalam daftar blokir aktif (Blacklist)
		if isBlocked, reason := securityService.IsIPBlocked(clientIP); isBlocked {
			c.JSON(http.StatusForbidden, gin.H{
				"status":  "error",
				"message": fmt.Sprintf("Akses ditolak: IP Anda (%s) terblokir oleh Bionet Security Shield. Alasan: %s", clientIP, reason),
			})
			c.Abort()
			return
		}

		// 3. Flooding / DDoS Detection (Rate-limiting per IP)
		// warning > 60 req/min, blocking otomatis > 120 req/min dengan HTTP 429
		isRateBlocked, isRateWarning, reqCount := securityService.CheckRateLimit(clientIP)
		if isRateBlocked {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"status":        "error",
				"message":       "Terlalu banyak permintaan (Flooding / DDoS Attack Protection). Akses IP Anda diblokir sementara.",
				"request_count": reqCount,
			})
			c.Abort()
			return
		}
		if isRateWarning {
			c.Header("X-RateLimit-Warning", fmt.Sprintf("High request rate: %d reqs/min", reqCount))
		}

		// 4. Hack Attempt Detection (SQL Injection, XSS, Path Traversal, Sensitive URL Probes)
		// Bypass testing route agar admin bisa menguji coba simulator alert dengan payload contoh
		isAdminTestRoute := strings.HasPrefix(path, "/api/admin/security/test-alert")
		if !isAdminTestRoute {
			threat, detected := securityService.CheckAttackPayload(
				clientIP,
				c.Request.Method,
				path,
				c.Request.URL.RawQuery,
				string(bodyBytes),
				c.Request.UserAgent(),
			)

			if detected && threat != nil {
				c.JSON(http.StatusForbidden, gin.H{
					"status":      "error",
					"message":     fmt.Sprintf("Akses ditolak: Terdeteksi upaya serangan keamanan siber (%s). Kejadian ini telah dicatat dan dilaporkan ke Administrator.", threat.ThreatType),
					"threat_type": threat.ThreatType,
					"severity":    threat.Severity,
				})
				c.Abort()
				return
			}
		}

		// Teruskan ke handler berikutnya
		c.Next()

		// 5. Evaluasi Hasil Request Pasca-Eksekusi:
		// A. Catat Login Sukses / Gagal untuk Brute Force Protection
		if path == "/api/auth/login" {
			status := c.Writer.Status()
			if status >= 400 {
				isLocked, failCount := securityService.RecordLoginFailure(clientIP, loginUsername, c.Request.UserAgent(), path)
				if isLocked {
					// Jika baru saja terkunci, set header pemberitahuan
					c.Header("X-Security-Lock", fmt.Sprintf("Locked after %d consecutive failures", failCount))
				}
			} else if status == http.StatusOK {
				securityService.RecordLoginSuccess(clientIP, loginUsername)
			}
		}

		// B. Geo-IP Location Tracking
		// Lewatkan tracking untuk endpoint polling frekuensi tinggi agar tidak membebani memori
		if path == "/api/user/heartbeat" || path == "/api/ping" || strings.HasPrefix(path, "/uploads") {
			return
		}

		// Catat daerah asal setiap customer/mitra saat login, transaksi, atau kunjungan publik
		var userIDStr, usernameStr string
		if uid, exists := c.Get("user_id"); exists && uid != nil {
			userIDStr = fmt.Sprintf("%v", uid)
		}
		if uname, exists := c.Get("username"); exists && uname != nil {
			usernameStr = fmt.Sprintf("%v", uname)
		}

		var accessType string
		if strings.HasPrefix(path, "/api/auth/login") {
			accessType = "login"
		} else if strings.Contains(path, "withdraw") || strings.Contains(path, "transfer") || strings.Contains(path, "order") || strings.Contains(path, "bank") {
			accessType = "transaction"
		} else if strings.HasPrefix(path, "/api/bio") || strings.HasPrefix(path, "/api/marketing") || strings.HasPrefix(path, "/api/public") {
			accessType = "public_visit"
		} else {
			accessType = "api"
		}

		geoService.RecordAccess(clientIP, accessType, userIDStr, usernameStr, path)
	}
}
