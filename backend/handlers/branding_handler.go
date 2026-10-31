package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"github.com/gin-gonic/gin"
)

type BrandingHandler struct {
	mu            sync.RWMutex
	cached        *models.AppBranding
	uploadBaseDir string
}

func NewBrandingHandler(uploadBaseDir string) *BrandingHandler {
	return &BrandingHandler{
		uploadBaseDir: uploadBaseDir,
	}
}

func (h *BrandingHandler) getDefaultBranding() models.AppBranding {
	return models.AppBranding{
		ID:             "default",
		AppName:        "BIONET",
		AppTagline:     "Mitra Enterprise Hub",
		LogoURL:        "",
		FaviconURL:     "",
		PrimaryColor:   "#059669",
		SecondaryColor: "#06b6d4",
		AccentColor:    "#f59e0b",
		UpdatedAt:      time.Now(),
	}
}

func (h *BrandingHandler) GetBranding(c *gin.Context) {
	h.mu.RLock()
	if h.cached != nil {
		cachedCopy := *h.cached
		h.mu.RUnlock()
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   cachedCopy,
		})
		return
	}
	h.mu.RUnlock()

	var branding models.AppBranding
	if config.DB != nil {
		if err := config.DB.Where("id = ?", "default").First(&branding).Error; err == nil {
			h.mu.Lock()
			h.cached = &branding
			h.mu.Unlock()
			c.JSON(http.StatusOK, gin.H{
				"status": "success",
				"data":   branding,
			})
			return
		}
	}

	def := h.getDefaultBranding()
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   def,
	})
}

func (h *BrandingHandler) UpdateBranding(c *gin.Context) {
	var req models.UpdateBrandingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format data branding tidak valid",
			"error":   err.Error(),
		})
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	current := h.getDefaultBranding()
	if config.DB != nil {
		_ = config.DB.Where("id = ?", "default").First(&current).Error
	}

	if req.AppName != "" {
		current.AppName = strings.TrimSpace(req.AppName)
	}
	if req.AppTagline != "" {
		current.AppTagline = strings.TrimSpace(req.AppTagline)
	}
	// Allow setting or clearing LogoURL
	current.LogoURL = strings.TrimSpace(req.LogoURL)

	if req.FaviconURL != "" {
		current.FaviconURL = strings.TrimSpace(req.FaviconURL)
	}
	if req.PrimaryColor != "" {
		current.PrimaryColor = strings.TrimSpace(req.PrimaryColor)
	}
	if req.SecondaryColor != "" {
		current.SecondaryColor = strings.TrimSpace(req.SecondaryColor)
	}
	if req.AccentColor != "" {
		current.AccentColor = strings.TrimSpace(req.AccentColor)
	}
	current.UpdatedAt = time.Now()

	if config.DB != nil {
		if err := config.DB.Save(&current).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Gagal menyimpan konfigurasi branding ke database",
			})
			return
		}
	}

	h.cached = &current

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Pengaturan tampilan branding dan tema warna berhasil diperbarui",
		"data":    current,
	})
}

func (h *BrandingHandler) UploadLogo(c *gin.Context) {
	file, header, err := c.Request.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "File logo tidak ditemukan dalam request (field 'logo')",
		})
		return
	}
	defer file.Close()

	// Max 5MB
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Ukuran file logo maksimal 5MB",
		})
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".svg":  true,
		".webp": true,
		".ico":  true,
	}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format file tidak didukung. Harap upload PNG, JPG, SVG, WebP, atau ICO",
		})
		return
	}

	targetDir := filepath.Join(h.uploadBaseDir, "branding")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyiapkan direktori upload branding",
		})
		return
	}

	fileName := fmt.Sprintf("logo_%d%s", time.Now().UnixNano(), ext)
	dstPath := filepath.Join(targetDir, fileName)

	out, err := os.Create(dstPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan file logo",
		})
		return
	}
	defer out.Close()

	if _, err := io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menulis isi file logo",
		})
		return
	}

	logoURL := fmt.Sprintf("/uploads/branding/%s", fileName)

	// Automatically update current branding with new LogoURL
	h.mu.Lock()
	current := h.getDefaultBranding()
	if config.DB != nil {
		_ = config.DB.Where("id = ?", "default").First(&current).Error
	}
	current.LogoURL = logoURL
	current.UpdatedAt = time.Now()
	if config.DB != nil {
		_ = config.DB.Save(&current).Error
	}
	h.cached = &current
	h.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"message":  "Logo aplikasi berhasil diunggah",
		"logo_url": logoURL,
		"data":     current,
	})
}

