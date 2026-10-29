package handlers

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type LeadHandler struct{}

func NewLeadHandler() *LeadHandler {
	return &LeadHandler{}
}

// GetLeads returns leads belonging to the current user (or all leads if admin)
func (h *LeadHandler) GetLeads(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	uID := fmt.Sprintf("%v", userID)
	uRole := fmt.Sprintf("%v", role)

	statusFilter := c.Query("status")
	sourceFilter := c.Query("source")
	searchQuery := c.Query("q")

	query := config.DB.Model(&models.Lead{})

	// Non-admin can only see their own leads
	if uRole != "admin" && uRole != "superadmin" {
		query = query.Where("user_id = ?", uID)
	} else {
		// If admin specifies a user_id filter
		if targetUser := c.Query("user_id"); targetUser != "" {
			query = query.Where("user_id = ?", targetUser)
		}
	}

	if statusFilter != "" && statusFilter != "all" {
		query = query.Where("status = ?", statusFilter)
	}

	if sourceFilter != "" && sourceFilter != "all" {
		query = query.Where("source = ?", sourceFilter)
	}

	if searchQuery != "" {
		likeTerm := "%" + searchQuery + "%"
		query = query.Where("name LIKE ? OR phone LIKE ? OR city LIKE ? OR product_interest LIKE ?", likeTerm, likeTerm, likeTerm, likeTerm)
	}

	var leads []models.Lead
	if err := query.Order("created_at desc").Find(&leads).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data leads: " + err.Error()})
		return
	}

	// Compute summary statistics
	var total, newCount, contactedCount, interestedCount, webinarCount, closingCount int64
	statQuery := config.DB.Model(&models.Lead{})
	if uRole != "admin" && uRole != "superadmin" {
		statQuery = statQuery.Where("user_id = ?", uID)
	}

	statQuery.Count(&total)
	statQuery.Where("status = ?", "new").Count(&newCount)
	statQuery.Where("status = ?", "contacted").Count(&contactedCount)
	statQuery.Where("status = ?", "interested").Count(&interestedCount)
	statQuery.Where("status = ?", "webinar").Count(&webinarCount)
	statQuery.Where("status = ?", "closing").Count(&closingCount)

	conversionRate := 0.0
	if total > 0 {
		conversionRate = (float64(closingCount) / float64(total)) * 100.0
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   leads,
		"stats": gin.H{
			"total":           total,
			"new":             newCount,
			"contacted":       contactedCount,
			"interested":      interestedCount,
			"webinar":         webinarCount,
			"closing":         closingCount,
			"conversion_rate": fmt.Sprintf("%.1f", conversionRate),
		},
	})
}

// CreateLead adds a lead manually
func (h *LeadHandler) CreateLead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uID := fmt.Sprintf("%v", userID)

	var input struct {
		Name            string  `json:"name" binding:"required"`
		Phone           string  `json:"phone" binding:"required"`
		Email           string  `json:"email"`
		City            string  `json:"city"`
		Source          string  `json:"source"`
		ProductInterest string  `json:"product_interest"`
		Status          string  `json:"status"`
		Notes           string  `json:"notes"`
		EstimatedValue  float64 `json:"estimated_value"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama dan Nomor WhatsApp/HP wajib diisi"})
		return
	}

	cleanPhone := strings.TrimSpace(input.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	}

	source := input.Source
	if source == "" {
		source = "manual"
	}
	status := input.Status
	if status == "" {
		status = "new"
	}

	lead := models.Lead{
		ID:              uuid.New().String(),
		UserID:          uID,
		Name:            strings.TrimSpace(input.Name),
		Phone:           cleanPhone,
		Email:           strings.TrimSpace(input.Email),
		City:            strings.TrimSpace(input.City),
		Source:          source,
		ProductInterest: strings.TrimSpace(input.ProductInterest),
		Status:          status,
		Notes:           strings.TrimSpace(input.Notes),
		EstimatedValue:  input.EstimatedValue,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := config.DB.Create(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan prospek: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Prospek baru berhasil ditambahkan",
		"data":    lead,
	})
}

// UpdateLead updates an existing lead's status, notes, or details
func (h *LeadHandler) UpdateLead(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	uID := fmt.Sprintf("%v", userID)
	uRole := fmt.Sprintf("%v", role)

	var lead models.Lead
	if err := config.DB.Where("id = ?", id).First(&lead).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prospek tidak ditemukan"})
		return
	}

	if uRole != "admin" && uRole != "superadmin" && lead.UserID != uID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki akses ke data prospek ini"})
		return
	}

	var input struct {
		Name            *string  `json:"name"`
		Phone           *string  `json:"phone"`
		Email           *string  `json:"email"`
		City            *string  `json:"city"`
		Source          *string  `json:"source"`
		ProductInterest *string  `json:"product_interest"`
		Status          *string  `json:"status"`
		Notes           *string  `json:"notes"`
		EstimatedValue  *float64 `json:"estimated_value"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data tidak valid"})
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	if input.Name != nil {
		updates["name"] = strings.TrimSpace(*input.Name)
	}
	if input.Phone != nil {
		p := strings.TrimSpace(*input.Phone)
		if strings.HasPrefix(p, "08") {
			p = "628" + p[2:]
		}
		updates["phone"] = p
	}
	if input.Email != nil {
		updates["email"] = strings.TrimSpace(*input.Email)
	}
	if input.City != nil {
		updates["city"] = strings.TrimSpace(*input.City)
	}
	if input.Source != nil {
		updates["source"] = *input.Source
	}
	if input.ProductInterest != nil {
		updates["product_interest"] = strings.TrimSpace(*input.ProductInterest)
	}
	if input.Status != nil {
		updates["status"] = *input.Status
		if *input.Status == "contacted" || *input.Status == "interested" {
			now := time.Now()
			updates["last_contacted_at"] = &now
		}
	}
	if input.Notes != nil {
		updates["notes"] = strings.TrimSpace(*input.Notes)
	}
	if input.EstimatedValue != nil {
		updates["estimated_value"] = *input.EstimatedValue
	}

	if err := config.DB.Model(&lead).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui prospek: " + err.Error()})
		return
	}

	config.DB.Where("id = ?", id).First(&lead)
	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data prospek berhasil diperbarui",
		"data":    lead,
	})
}

// DeleteLead removes a lead
func (h *LeadHandler) DeleteLead(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	role, _ := c.Get("role")
	uID := fmt.Sprintf("%v", userID)
	uRole := fmt.Sprintf("%v", role)

	var lead models.Lead
	if err := config.DB.Where("id = ?", id).First(&lead).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prospek tidak ditemukan"})
		return
	}

	if uRole != "admin" && uRole != "superadmin" && lead.UserID != uID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak"})
		return
	}

	if err := config.DB.Delete(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus prospek"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Prospek berhasil dihapus",
	})
}

// PublicCaptureLead captures a lead from a replicated storefront or referral landing page
func (h *LeadHandler) PublicCaptureLead(c *gin.Context) {
	var input struct {
		StoreUsername   string  `json:"store_username" binding:"required"`
		Name            string  `json:"name" binding:"required"`
		Phone           string  `json:"phone" binding:"required"`
		Email           string  `json:"email"`
		City            string  `json:"city"`
		Source          string  `json:"source"` // 'store_affiliate', 'webinar_guest', etc.
		ProductInterest string  `json:"product_interest"`
		Notes           string  `json:"notes"`
		EstimatedValue  float64 `json:"estimated_value"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Store username, nama, dan no WhatsApp wajib diisi"})
		return
	}

	// Find the owning user
	var owner models.User
	if err := config.DB.Where("username = ?", input.StoreUsername).First(&owner).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Toko mitra atau referral tidak ditemukan"})
		return
	}

	cleanPhone := strings.TrimSpace(input.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	}

	source := input.Source
	if source == "" {
		source = "store_affiliate"
	}

	// Check if this lead already exists for this mitra
	var existing models.Lead
	now := time.Now()
	if err := config.DB.Where("user_id = ? AND phone = ?", owner.ID, cleanPhone).First(&existing).Error; err == nil {
		// Update existing lead notes and updated timestamp
		existing.Name = strings.TrimSpace(input.Name)
		if input.Email != "" {
			existing.Email = input.Email
		}
		if input.City != "" {
			existing.City = input.City
		}
		if input.ProductInterest != "" {
			existing.ProductInterest = input.ProductInterest
		}
		if input.EstimatedValue > 0 {
			existing.EstimatedValue = input.EstimatedValue
		}
		existing.Notes = fmt.Sprintf("%s\n[%s] Pengunjung kembali via Toko Afiliasi (%s)", existing.Notes, now.Format("02/01 15:04"), input.ProductInterest)
		existing.UpdatedAt = now
		config.DB.Save(&existing)

		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Data prospek diperbarui",
			"data":    existing,
		})
		return
	}

	// Create new lead
	lead := models.Lead{
		ID:              uuid.New().String(),
		UserID:          owner.ID,
		Name:            strings.TrimSpace(input.Name),
		Phone:           cleanPhone,
		Email:           strings.TrimSpace(input.Email),
		City:            strings.TrimSpace(input.City),
		Source:          source,
		ProductInterest: strings.TrimSpace(input.ProductInterest),
		Status:          "new",
		Notes:           strings.TrimSpace(input.Notes),
		EstimatedValue:  input.EstimatedValue,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if err := config.DB.Create(&lead).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan prospek: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Prospek baru berhasil dicatat",
		"data":    lead,
	})
}

// GenerateLeadFollowUpAI generates a personalized WhatsApp message for a specific lead using Gemini AI
func (h *LeadHandler) GenerateLeadFollowUpAI(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	uID := fmt.Sprintf("%v", userID)

	var lead models.Lead
	if err := config.DB.Where("id = ?", id).First(&lead).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prospek tidak ditemukan"})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", uID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}
	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Studio Konten AI & Generator Video hanya dapat diakses oleh Administrator"})
		return
	}
	mitraName := user.FullName
	if mitraName == "" {
		mitraName = user.Username
	}

	var input struct {
		Tone        string `json:"tone"`         // 'ramah', 'profesional', 'edukatif', 'mendesak_promo'
		Goal        string `json:"goal"`         // 'sapaan_awal', 'tawarkan_webinar', 'closing_order', 'tanya_kabar'
		CustomNotes string `json:"custom_notes"` // Additional instructions from user
	}
	_ = c.ShouldBindJSON(&input)

	if input.Tone == "" {
		input.Tone = "ramah dan bersahabat"
	}
	if input.Goal == "" {
		input.Goal = "sapaan awal ramah dan tindak lanjut ketertarikan produk"
	}

	// Use Google Gemini Service
	if services.GlobalGeminiService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Layanan Gemini AI belum aktif di server"})
		return
	}

	prompt := fmt.Sprintf(`Tolong buatkan 1 naskah pesan WhatsApp follow-up yang sangat alami, sopan, persuasif, dan tidak terkesan spam.
Nama Pengirim (Mitra Bionet): %s
Nama Calon Prospek (Lead): %s
Nomor Kontak Lead: %s
Kota Asal Lead: %s
Sumber Prospek: %s
Produk/Topik yang Diminati: %s
Status Prospek Saat Ini: %s
Catatan Tambahan Prospek: %s

Tujuan Pesan: %s
Gaya Bahasa / Tone: %s
Instruksi Khusus Mitra: %s

Pedoman Pembuatan Pesan:
1. Sapa nama calon prospek dengan sopan (contoh: "Halo Bapak/Ibu %s" atau "Halo Kak %s").
2. Hubungkan secara halus dengan ketertarikan mereka pada produk atau bisnis Bionet.
3. Berikan penawaran bantuan atau solusi kesehatan alami, bukan memaksa membeli.
4. Akhiri dengan pertanyaan terbuka yang mudah dijawab (Call to Action lembut).
5. Berikan format teks WhatsApp yang rapi, gunakan emoji secukupnya agar menarik.
6. Berikan HANYA teks pesan WhatsApp siap kirim tanpa penjelasan tambahan.`,
		mitraName, lead.Name, lead.Phone, lead.City, lead.Source, lead.ProductInterest,
		lead.Status, lead.Notes, input.Goal, input.Tone, input.CustomNotes,
		lead.Name, lead.Name)

	reply, err := services.GlobalGeminiService.GenerateText(context.Background(), prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan pesan AI: " + err.Error()})
		return
	}

	cleanReply := strings.TrimSpace(reply)
	waURL := fmt.Sprintf("https://wa.me/%s?text=%s", lead.Phone, url.QueryEscape(cleanReply))

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message_text": cleanReply,
		"whatsapp_url": waURL,
		"lead_name":    lead.Name,
		"lead_phone":   lead.Phone,
	})
}

// GenerateMarketingCopyAI generates high-converting sales & promotion copy across platforms
func (h *LeadHandler) GenerateMarketingCopyAI(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uID := fmt.Sprintf("%v", userID)

	var user models.User
	if err := config.DB.Where("id = ?", uID).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pengguna tidak ditemukan"})
		return
	}
	if user.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Akses ditolak: Studio Konten AI & Generator Video hanya dapat diakses oleh Administrator"})
		return
	}
	mitraName := user.FullName
	if mitraName == "" {
		mitraName = user.Username
	}

	var input struct {
		Product       string `json:"product" binding:"required"`  // e.g. 'Bio-Propolis Trigona', 'Bio-Herbal Drops', 'Peluang Bisnis BOP'
		Platform      string `json:"platform" binding:"required"` // 'whatsapp', 'instagram', 'tiktok', 'story', 'closing'
		Audience      string `json:"audience"`                    // 'ibu_rumah_tangga', 'karyawan', 'diabetes_kolesterol', 'umum'
		Tone          string `json:"tone"`                        // 'persuasif', 'edukatif', 'santai', 'urgensi_promo'
		HighlightInfo string `json:"highlight_info"`              // e.g. 'Promo Diskon 20%', 'Free Ongkir', 'BPOM Resmi'
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Produk dan Platform wajib dipilih"})
		return
	}

	if services.GlobalGeminiService == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Layanan Gemini AI belum aktif di server"})
		return
	}

	affiliateLink := fmt.Sprintf("https://bionet.id/?store=%s", user.Username)

	prompt := fmt.Sprintf(`Anda adalah Copywriter Kelas Dunia spesialis Industri Herbal Kesehatan BPOM dan Network Marketing Modern (Bionet).
Tolong buatkan materi copywriting promosi dengan spesifikasi berikut:

- Nama Produk / Peluang: %s
- Platform Tujuan: %s
- Target Segmen Pembaca: %s
- Gaya Bahasa (Tone): %s
- Poin Penting / Promo Khusus: %s
- Nama Mitra Pengirim: %s
- Link Toko Afiliasi Resmi: %s

Aturan Format Berdasarkan Platform:
1. Jika "whatsapp": Buat pesan siaran (broadcast) WhatsApp dengan headline memikat, poin-poin manfaat herbal/bisnis, bukti keaslian BPOM, call-to-action langsung ke link toko atau balas WA, dan emoji yang estetis.
2. Jika "instagram": Buat caption Instagram Feed lengkap dengan hook kalimat pertama pemikat mata, cerita mikro (storytelling), edukasi manfaat, ajakan komentar/klik link di bio, dan 10-15 hashtag potensial (#HerbalBPOM, #BisnisBionet, dll).
3. Jika "tiktok": Buat naskah video pendek (Script 30-45 detik) dengan format:
   - [0-3s HOOK VISUAL & KATA]
   - [3-15s MASALAH / PROBLEM]
   - [15-30s SOLUSI BIONET]
   - [30-45s CALL TO ACTION / KERANJANG/BIO]
4. Jika "story": Buat 3 slide teks ringkas untuk WhatsApp Story / Instagram Story yang padat dan membuat orang penasaran.
5. Jika "closing": Buat pesan pamungkas menjawab keraguan harga dan meyakinkan calon konsumen/mitra untuk segera memutuskan hari ini.

Tuliskan materi promosi dalam Bahasa Indonesia yang sangat persuasif, legal, etis, dan siap pakai langsung!`,
		input.Product, input.Platform, input.Audience, input.Tone, input.HighlightInfo, mitraName, affiliateLink)

	reply, err := services.GlobalGeminiService.GenerateText(context.Background(), prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghasilkan materi promosi: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":         "success",
		"copy_text":      strings.TrimSpace(reply),
		"platform":       input.Platform,
		"product":        input.Product,
		"affiliate_link": affiliateLink,
		"mitra_name":     mitraName,
	})
}
