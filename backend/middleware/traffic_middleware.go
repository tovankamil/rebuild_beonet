package middleware

import (
	"time"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type responseWriterWrapper struct {
	gin.ResponseWriter
	bodyBytes int64
}

func (w *responseWriterWrapper) Write(b []byte) (int, error) {
	n, err := w.ResponseWriter.Write(b)
	w.bodyBytes += int64(n)
	return n, err
}

func (w *responseWriterWrapper) WriteString(s string) (int, error) {
	n, err := w.ResponseWriter.WriteString(s)
	w.bodyBytes += int64(n)
	return n, err
}

// TrafficMonitorMiddleware records network bandwidth, latency, and active user requests
func TrafficMonitorMiddleware() gin.HandlerFunc {
	monitor := services.GetMonitoringService()

	return func(c *gin.Context) {
		start := time.Now()

		// Estimate incoming bytes: Content-Length header or URL + header estimates
		var bytesIn int64 = c.Request.ContentLength
		if bytesIn < 0 {
			bytesIn = 0
		}
		// Add estimated header and URL size
		bytesIn += int64(len(c.Request.URL.String()) + 150)

		wrapper := &responseWriterWrapper{
			ResponseWriter: c.Writer,
			bodyBytes:      0,
		}
		c.Writer = wrapper

		c.Next()

		duration := time.Since(start)
		bytesOut := wrapper.bodyBytes
		if bytesOut <= 0 {
			bytesOut = int64(wrapper.ResponseWriter.Size())
			if bytesOut < 0 {
				bytesOut = 0
			}
		}

		// Record request metrics
		statusCode := wrapper.Status()
		endpoint := c.FullPath()
		if endpoint == "" {
			endpoint = c.Request.URL.Path
		}

		monitor.RecordRequest(bytesIn, bytesOut, statusCode, endpoint, duration)

		// If user is authenticated, refresh active heartbeat
		if userID, exists := c.Get("user_id"); exists && userID != nil {
			uidStr, ok := userID.(string)
			if ok && uidStr != "" {
				username, _ := c.Get("username")
				role, _ := c.Get("role")
				unameStr, _ := username.(string)
				roleStr, _ := role.(string)

				monitor.RecordHeartbeat(
					uidStr,
					unameStr,
					"",
					roleStr,
					endpoint,
					c.ClientIP(),
					c.Request.UserAgent(),
				)
			}
		}
	}
}

