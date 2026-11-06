package main

import (
	"embed"
	"io/fs"
	"mime"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

//go:embed all:dist
var embeddedFrontend embed.FS

// setupEmbeddedFrontend attaches the embedded React SPA filesystem to the Gin router.
func setupEmbeddedFrontend(r *gin.Engine) {
	distFS, err := fs.Sub(embeddedFrontend, "dist")
	if err != nil {
		return
	}

	indexHTML, err := fs.ReadFile(distFS, "index.html")
	if err != nil {
		indexHTML = []byte(`<!DOCTYPE html><html><head><title>SYNETIQ</title></head><body><h3>SYNETIQ Platform Ready.</h3></body></html>`)
	}

	fileServer := http.FileServer(http.FS(distFS))

	r.NoRoute(func(c *gin.Context) {
		reqPath := strings.TrimPrefix(c.Request.URL.Path, "/")
		if reqPath == "" {
			c.Header("Content-Type", "text/html; charset=utf-8")
			c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
			c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
			return
		}

		// Never serve SPA HTML fallback for non-existent API or WebSocket routes
		if strings.HasPrefix(reqPath, "api/") || strings.HasPrefix(reqPath, "ws/") {
			c.JSON(http.StatusNotFound, gin.H{
				"status":  "error",
				"message": "API endpoint not found",
				"path":    c.Request.URL.Path,
			})
			return
		}

		// Try to serve static file from embedded dist
		f, err := distFS.Open(reqPath)
		if err == nil {
			stat, statErr := f.Stat()
			f.Close()
			if statErr == nil && !stat.IsDir() {
				ext := filepath.Ext(reqPath)
				if mimeType := mime.TypeByExtension(ext); mimeType != "" {
					c.Header("Content-Type", mimeType)
				}
				if strings.HasPrefix(reqPath, "assets/") {
					c.Header("Cache-Control", "public, max-age=31536000, immutable")
				}
				fileServer.ServeHTTP(c.Writer, c.Request)
				return
			}
		}

		// Fallback for React SPA client-side routes (e.g. /dashboard, /login, /products, etc.)
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
	})
}

