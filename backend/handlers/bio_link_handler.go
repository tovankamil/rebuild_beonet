package handlers

import (
	"fmt"
	"html"
	"net/http"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BioLinkHandler handles distributor Bio-Link pages, custom themes, and funnel leads
type BioLinkHandler struct {
	pagesLock sync.RWMutex
	mockPages map[string]*models.BioPage
}

// NewBioLinkHandler initializes the bio link handler
func NewBioLinkHandler() *BioLinkHandler {
	return &BioLinkHandler{
		mockPages: make(map[string]*models.BioPage),
	}
}

func defaultSeedBioPage(userID, username, fullName, phone string) models.BioPage {
	now := time.Now()
	cleanPhone := strings.TrimSpace(phone)
	title := "Distributor Resmi Bionet Herbal - " + fullName
	if fullName == "" {
		title = "Official Store & Distributor Bionet"
	}
	return models.BioPage{
		ID:             uuid.New().String(),
		UserID:         userID,
		Username:       username,
		Slug:           username,
		Title:          title,
		Bio:            "Membantu masyarakat hidup sehat alami dengan Bio-Propolis Trigona & membuka peluang kemitraan bisnis syariah modern berpenghasilan harian.",
		Theme:          "emerald",
		Avatar:         "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
		WhatsAppNumber: cleanPhone,
		InstagramURL:   "https://instagram.com/bionet.official",
		TikTokURL:      "https://tiktok.com/@bionetherbal",
		YouTubeVideoID: "dQw4w9WgXcQ",
		FeaturedProducts: []models.BioProductItem{
			{
				ID:          "prod-propolis",
				Name:        "Bio-Propolis Trigona 30ml",
				Price:       250000,
				PV:          100,
				ImageURL:    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
				Description: "Ekstrak propolis lebah Trigona murni tanpa alkohol. Kaya bioflavonoid untuk asam urat, kolesterol, daya tahan tubuh, dan regenerasi sel.",
				Badge:       "Best Seller BPOM",
				BuyLink:     "https://wa.me/" + cleanPhone + "?text=Halo%20saya%20mau%20pesan%20Bio-Propolis",
			},
			{
				ID:          "prod-drops",
				Name:        "Bio-Herbal Drops Mata & Vitalitas",
				Price:       175000,
				PV:          70,
				ImageURL:    "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&auto=format&fit=crop&q=80",
				Description: "Formula herbal tetes alami untuk meredakan mata lelah, iritasi, serta menunjang energi stamina harian.",
				Badge:       "Formula Khusus",
				BuyLink:     "https://wa.me/" + cleanPhone + "?text=Halo%20saya%20mau%20pesan%20Bio-Herbal%20Drops",
			},
			{
				ID:          "prod-paket-starter",
				Name:        "Paket Kemitraan Bisnis Starter",
				Price:       500000,
				PV:          200,
				ImageURL:    "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=500&auto=format&fit=crop&q=80",
				Description: "Dapatkan 2 botol Bio-Propolis + Hak Bisnis Distributor Resmi Bionet + Landing Page Siap Pakai + Mentoring Intensif.",
				Badge:       "Peluang Bisnis",
				BuyLink:     "https://wa.me/" + cleanPhone + "?text=Halo%20saya%20tertarik%20join%20kemitraan%20Bionet",
			},
		},
		Testimonials: []models.BioTestimonialItem{
			{
				ID:           "testi-1",
				CustomerName: "Bpk. Hendro",
				Headline:     "Asam Urat 3 Tahun Membaik dalam 2 Minggu",
				Story:        "Dulu jari kaki sering bengkak merah dan susah jalan. Rutin minum Bio-Propolis 3x5 tetes, hari ke-10 bengkak hilang dan bisa jalan normal.",
				City:         "Surabaya",
				Rating:       5,
			},
			{
				ID:           "testi-2",
				CustomerName: "Ibu Warsito",
				Headline:     "Gula Darah Stabil & Bangun Tidur Segar",
				Story:        "Kadar gula darah puasa yang tadinya 230 turun bertahap ke 145 mg/dL. Nafsu makan terjaga dan badan terasa bertenaga.",
				City:         "Semarang",
				Rating:       5,
			},
		},
		CTAButtonText: "Konsultasi Gratis via WhatsApp",
		CTAButtonURL:  "https://wa.me/" + cleanPhone + "?text=Halo%20saya%20tertarik%20konsultasi%20produk%20Bionet",
		TotalViews:    1,
		TotalLeads:    0,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}

// GetPublicBioPage returns the public bio page of a mitra and increments TotalViews
// Public GET /api/bio/:username
func (h *BioLinkHandler) GetPublicBioPage(c *gin.Context) {
	username := strings.TrimSpace(c.Param("username"))
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Username mitra wajib disertakan",
		})
		return
	}

	db := config.DB
	if db != nil {
		var page models.BioPage
		if err := db.Where("username = ? OR slug = ?", username, username).First(&page).Error; err == nil {
			// Increment view counter
			db.Model(&page).UpdateColumn("total_views", gorm.Expr("total_views + ?", 1))
			page.TotalViews++
			c.JSON(http.StatusOK, gin.H{
				"status": "success",
				"data":   page,
			})
			return
		}

		// If page doesn't exist yet, check if User exists and auto-seed default bio page
		var user models.User
		if err := db.Where("username = ?", username).First(&user).Error; err == nil {
			phone := ""
			if user.Phone != nil {
				phone = *user.Phone
			}
			newPage := defaultSeedBioPage(user.ID, user.Username, user.FullName, phone)
			db.Create(&newPage)
			c.JSON(http.StatusOK, gin.H{
				"status": "success",
				"data":   newPage,
			})
			return
		}
	}

	// Fallback to in-memory pages
	h.pagesLock.Lock()
	defer h.pagesLock.Unlock()

	if page, exists := h.mockPages[username]; exists {
		page.TotalViews++
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   page,
		})
		return
	}

	// Create and seed dynamically if not exists in memory
	newPage := defaultSeedBioPage("user-"+username, username, strings.Title(username), "")
	newPage.TotalViews = 1
	h.mockPages[username] = &newPage

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   newPage,
	})
}

// GetMyBioPage retrieves current authenticated mitra's bio page (auto-seed if not present)
// Protected GET /api/bio/my-page
func (h *BioLinkHandler) GetMyBioPage(c *gin.Context) {
	userID := c.GetString("user_id")
	username := c.GetString("username")
	if userID == "" && username == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Silakan login terlebih dahulu",
		})
		return
	}

	db := config.DB
	if db != nil {
		var page models.BioPage
		if err := db.Where("user_id = ? OR username = ?", userID, username).First(&page).Error; err == nil {
			c.JSON(http.StatusOK, gin.H{
				"status": "success",
				"data":   page,
			})
			return
		}

		// Auto-seed for this user
		var user models.User
		fullName := username
		phone := ""
		if err := db.Where("id = ? OR username = ?", userID, username).First(&user).Error; err == nil {
			fullName = user.FullName
			if user.Phone != nil && *user.Phone != "" {
				phone = *user.Phone
			}
		}
		newPage := defaultSeedBioPage(userID, username, fullName, phone)
		db.Create(&newPage)
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   newPage,
		})
		return
	}

	// Fallback in-memory
	h.pagesLock.Lock()
	defer h.pagesLock.Unlock()

	key := username
	if key == "" {
		key = userID
	}
	if page, exists := h.mockPages[key]; exists {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   page,
		})
		return
	}

	newPage := defaultSeedBioPage(userID, key, "Mitra Bionet", "")
	h.mockPages[key] = &newPage

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   newPage,
	})
}

// UpdateBioPageRequest payload for updating bio page configuration
type UpdateBioPageRequest struct {
	Slug             string                      `json:"slug"`
	Title            string                      `json:"title"`
	Bio              string                      `json:"bio"`
	Theme            string                      `json:"theme"` // 'emerald', 'gold', 'cyber', 'minimal'
	Avatar           string                      `json:"avatar"`
	WhatsAppNumber   string                      `json:"whatsapp_number"`
	InstagramURL     string                      `json:"instagram_url"`
	TikTokURL        string                      `json:"tiktok_url"`
	YouTubeVideoID   string                      `json:"youtube_video_id"`
	FeaturedProducts []models.BioProductItem     `json:"featured_products"`
	Testimonials     []models.BioTestimonialItem `json:"testimonials"`
	CTAButtonText    string                      `json:"cta_button_text"`
	CTAButtonURL     string                      `json:"cta_button_url"`
}

// UpdateMyBioPage saves configuration changes to the authenticated mitra's bio page
// Protected PUT /api/bio/my-page
func (h *BioLinkHandler) UpdateMyBioPage(c *gin.Context) {
	userID := c.GetString("user_id")
	username := c.GetString("username")
	if userID == "" && username == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Silakan login terlebih dahulu",
		})
		return
	}

	var req UpdateBioPageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format data tidak valid: " + err.Error(),
		})
		return
	}

	// Theme validation
	theme := strings.ToLower(strings.TrimSpace(req.Theme))
	if theme != "emerald" && theme != "gold" && theme != "cyber" && theme != "minimal" {
		theme = "emerald"
	}

	now := time.Now()
	db := config.DB
	if db != nil {
		var page models.BioPage
		if err := db.Where("user_id = ? OR username = ?", userID, username).First(&page).Error; err != nil {
			// Auto create
			page = defaultSeedBioPage(userID, username, username, req.WhatsAppNumber)
		}

		if req.Title != "" {
			page.Title = req.Title
		}
		if req.Bio != "" {
			page.Bio = req.Bio
		}
		page.Theme = theme
		if req.Avatar != "" {
			page.Avatar = req.Avatar
		}
		if req.WhatsAppNumber != "" {
			page.WhatsAppNumber = req.WhatsAppNumber
		}
		if req.InstagramURL != "" {
			page.InstagramURL = req.InstagramURL
		}
		if req.TikTokURL != "" {
			page.TikTokURL = req.TikTokURL
		}
		if req.YouTubeVideoID != "" {
			page.YouTubeVideoID = req.YouTubeVideoID
		}
		if req.FeaturedProducts != nil {
			page.FeaturedProducts = req.FeaturedProducts
		}
		if req.Testimonials != nil {
			page.Testimonials = req.Testimonials
		}
		if req.CTAButtonText != "" {
			page.CTAButtonText = req.CTAButtonText
		}
		if req.CTAButtonURL != "" {
			page.CTAButtonURL = req.CTAButtonURL
		}
		if req.Slug != "" {
			page.Slug = req.Slug
		}
		page.UpdatedAt = now

		if err := db.Save(&page).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Gagal menyimpan Bio-Page: " + err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Konfigurasi Bio-Page berhasil disimpan",
			"data":    page,
		})
		return
	}

	// In-memory update
	h.pagesLock.Lock()
	defer h.pagesLock.Unlock()

	key := username
	if key == "" {
		key = userID
	}
	page, exists := h.mockPages[key]
	if !exists {
		p := defaultSeedBioPage(userID, key, key, req.WhatsAppNumber)
		page = &p
		h.mockPages[key] = page
	}

	if req.Title != "" {
		page.Title = req.Title
	}
	if req.Bio != "" {
		page.Bio = req.Bio
	}
	page.Theme = theme
	if req.Avatar != "" {
		page.Avatar = req.Avatar
	}
	if req.WhatsAppNumber != "" {
		page.WhatsAppNumber = req.WhatsAppNumber
	}
	if req.InstagramURL != "" {
		page.InstagramURL = req.InstagramURL
	}
	if req.TikTokURL != "" {
		page.TikTokURL = req.TikTokURL
	}
	if req.YouTubeVideoID != "" {
		page.YouTubeVideoID = req.YouTubeVideoID
	}
	if req.FeaturedProducts != nil {
		page.FeaturedProducts = req.FeaturedProducts
	}
	if req.Testimonials != nil {
		page.Testimonials = req.Testimonials
	}
	if req.CTAButtonText != "" {
		page.CTAButtonText = req.CTAButtonText
	}
	if req.CTAButtonURL != "" {
		page.CTAButtonURL = req.CTAButtonURL
	}
	if req.Slug != "" {
		page.Slug = req.Slug
	}
	page.UpdatedAt = now

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Konfigurasi Bio-Page berhasil disimpan",
		"data":    page,
	})
}

// SubmitBioLeadRequest payload when visitor submits contact/interest form on bio page
type SubmitBioLeadRequest struct {
	Username        string  `json:"username"`
	StoreUsername   string  `json:"store_username"`
	SponsorUsername string  `json:"sponsor_username"`
	Name            string  `json:"name" binding:"required"`
	Phone           string  `json:"phone" binding:"required"`
	Email           string  `json:"email"`
	City            string  `json:"city"`
	ProductInterest string  `json:"product_interest"`
	Notes           string  `json:"notes"`
	EstimatedValue  float64 `json:"estimated_value"`
}

// SubmitBioLead records a new prospective customer/downline from public Bio-Link
// Public POST /api/bio/lead
func (h *BioLinkHandler) SubmitBioLead(c *gin.Context) {
	var req SubmitBioLeadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Nama dan nomor WhatsApp wajib diisi",
		})
		return
	}

	targetUsername := strings.TrimSpace(req.Username)
	if targetUsername == "" {
		targetUsername = strings.TrimSpace(req.StoreUsername)
	}
	if targetUsername == "" {
		targetUsername = strings.TrimSpace(req.SponsorUsername)
	}
	if targetUsername == "" {
		targetUsername = "bionet_official"
	}

	cleanPhone := strings.TrimSpace(req.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	} else if strings.HasPrefix(cleanPhone, "+62") {
		cleanPhone = cleanPhone[1:]
	}

	sanitizedName := html.EscapeString(strings.TrimSpace(req.Name))
	sanitizedEmail := html.EscapeString(strings.TrimSpace(req.Email))
	sanitizedCity := html.EscapeString(strings.TrimSpace(req.City))
	sanitizedProduct := html.EscapeString(strings.TrimSpace(req.ProductInterest))
	sanitizedNotes := html.EscapeString(strings.TrimSpace(req.Notes))

	now := time.Now()
	ownerUserID := "user-" + targetUsername
	db := config.DB

	if db != nil {
		var user models.User
		if err := db.Where("username = ?", targetUsername).First(&user).Error; err == nil {
			ownerUserID = user.ID
		}

		// Create or update Lead
		lead := models.Lead{
			ID:              uuid.New().String(),
			UserID:          ownerUserID,
			Name:            sanitizedName,
			Phone:           cleanPhone,
			Email:           sanitizedEmail,
			City:            sanitizedCity,
			Source:          "bio_link",
			ProductInterest: sanitizedProduct,
			Status:          "new",
			Notes:           fmt.Sprintf("[Bio-Link Funnel] %s", sanitizedNotes),
			EstimatedValue:  req.EstimatedValue,
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		if err := db.Create(&lead).Error; err == nil {
			// Record activity audit log
			audit := models.AuditLog{
				ID:        uuid.New().String(),
				UserID:    ownerUserID,
				Action:    "BIO_LEAD",
				TableName: "leads",
				RecordID:  lead.ID,
				NewValues: fmt.Sprintf(`{"lead_name":"%s","phone":"%s","source":"bio_link"}`, lead.Name, lead.Phone),
				CreatedAt: now,
			}
			db.Create(&audit)

			// Increment BioPage total_leads
			db.Model(&models.BioPage{}).Where("username = ?", targetUsername).UpdateColumn("total_leads", gorm.Expr("total_leads + ?", 1))
		}

		c.JSON(http.StatusCreated, gin.H{
			"status":  "success",
			"message": "Terima kasih! Data prospek berhasil dikirimkan ke mitra Bionet",
			"data":    lead,
		})
		return
	}

	// In-memory mock response
	h.pagesLock.Lock()
	if page, exists := h.mockPages[targetUsername]; exists {
		page.TotalLeads++
	}
	h.pagesLock.Unlock()

	mockLead := models.Lead{
		ID:              uuid.New().String(),
		UserID:          ownerUserID,
		Name:            sanitizedName,
		Phone:           cleanPhone,
		Email:           sanitizedEmail,
		City:            sanitizedCity,
		Source:          "bio_link",
		ProductInterest: sanitizedProduct,
		Status:          "new",
		Notes:           fmt.Sprintf("[Bio-Link Funnel] %s", sanitizedNotes),
		EstimatedValue:  req.EstimatedValue,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Terima kasih! Data prospek berhasil dikirimkan ke mitra Bionet",
		"data":    mockLead,
	})
}
