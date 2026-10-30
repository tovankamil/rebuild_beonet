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
)

// MarketingKit represents a ready-to-use promotional asset and copywriting package
type MarketingKit struct {
	ID                     string   `json:"id"`
	Title                  string   `json:"title"`
	Category               string   `json:"category"` // 'promo_propolis', 'peluang_bisnis', 'bpom_legalitas', 'testimoni_kesehatan'
	CategoryLabel          string   `json:"category_label"`
	Headline               string   `json:"headline"`
	Copywriting            string   `json:"copywriting"`
	WhatsAppShareText      string   `json:"whatsapp_share_text"`
	InstagramStoryTemplate string   `json:"instagram_story_template"`
	ImageURLs              []string `json:"image_urls"`
	Tags                   []string `json:"tags"`
	DownloadAssetsURL      string   `json:"download_assets_url"`
}

// WebinarSchedule represents a weekly Business Opportunity Presentation (BOP) webinar
type WebinarSchedule struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Speaker         string    `json:"speaker"`
	SpeakerTitle    string    `json:"speaker_title"`
	DateDay         string    `json:"date_day"` // e.g. "Rabu, 5 November 2026"
	TimeWIB         string    `json:"time_wib"` // "19:30 - 21:00 WIB"
	NextSession     time.Time `json:"next_session"`
	ZoomMeetingID   string    `json:"zoom_meeting_id"`
	ZoomPasscode    string    `json:"zoom_passcode"`
	ZoomLink        string    `json:"zoom_link"`
	Description     string    `json:"description"`
	PosterURL       string    `json:"poster_url"`
	QuotaSeats      int       `json:"quota_seats"`
	RegisteredSeats int       `json:"registered_seats"`
	IsActive        bool      `json:"is_active"`
}

// MarketingHandler serves promotional kits and BOP webinar management
type MarketingHandler struct {
	webinarsLock sync.RWMutex
	webinars     []WebinarSchedule
	kits         []MarketingKit
}

// NewMarketingHandler initializes default promotional kits and webinar schedules
func NewMarketingHandler() *MarketingHandler {
	now := time.Now()
	nextWed := now.AddDate(0, 0, (3-int(now.Weekday())+7)%7)
	if nextWed.Before(now) {
		nextWed = nextWed.AddDate(0, 0, 7)
	}
	nextSat := now.AddDate(0, 0, (6-int(now.Weekday())+7)%7)
	if nextSat.Before(now) {
		nextSat = nextSat.AddDate(0, 0, 7)
	}

	kits := []MarketingKit{
		{
			ID:            "kit-01",
			Title:         "Promo Spesial Bio-Propolis Trigona: Sehat Alami Bebas Asam Urat",
			Category:      "promo_propolis",
			CategoryLabel: "Promo Bio-Propolis",
			Headline:      "Atasi Nyeri Sendi & Asam Urat Tanpa Bahan Kimia Berbahaya!",
			Copywriting: `🌿 *SOLUSI NYATA NYERI SENDI & ASAM URAT DARI ALAM NUSANTARA*

Sering terganggu jempol kaki bengkak, tumit sakit saat bangun tidur, atau kolesterol tinggi yang bikin tengkuk kaku?

Saatnya beralih ke *Bio-Propolis Trigona Bionet*!
✅ 100% Ekstrak Propolis Lebah Klanceng Liar tanpa alkohol
✅ Kaya Bioflavonoid & Artepillin-C anti-radang alami
✅ Resmi BPOM RI: POM TR 226012891 & Halal MUI

🎁 *PROMO HARI INI:* Beli 2 Botol GRATIS Ongkir Se-Indonesia + Konsultasi Dokter Herbal Gratis!

📲 Pesan sekarang melalui distributor resmi: {{mitra_link}}`,
			WhatsAppShareText:      "Halo kak, mau info promo Bio-Propolis Trigona resmi BPOM untuk pemulihan asam urat & stamina. Cek link resmi saya di sini ya: {{mitra_link}}",
			InstagramStoryTemplate: "Geser ke atas / klik link bio untuk dapatkan Promo Bio-Propolis Trigona BPOM hari ini!",
			ImageURLs: []string{
				"https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
				"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80",
			},
			Tags:              []string{"propolis", "asam_urat", "herbal_alami", "promo"},
			DownloadAssetsURL: "https://bionet.id/assets/promo/kit-propolis.zip",
		},
		{
			ID:            "kit-02",
			Title:         "Peluang Bisnis Syariah: Passive Income Harian Tanpa Beban Tutup Poin",
			Category:      "peluang_bisnis",
			CategoryLabel: "Peluang Bisnis Halal",
			Headline:      "Membangun Aset Digital & Finansial Mandiri Bersama Komunitas Bionet",
			Copywriting: `💼 *SIAP MILIKI PENGHASILAN TAMBAHAN RP 500RB - 2 JUTA SETIAP HARI?*

Bosan dengan bisnis network konvensional yang wajib belanja bulanan (tutup poin) dan sistem zalim?

Di *BIONET INDONESIA*, Anda mendapatkan:
💎 Sistem Bagi Hasil Syariah Transparan (Bina Kiri - Bina Kanan)
💎 Bonus Sponsor & Bonus Pasangan Cair Harian Otomatis
💎 Disediakan Website Funnel Replikasi & Bot WhatsApp Cerdas
💎 Produk herbal repeat order tinggi dan dibutuhkan jutaan keluarga

Mulai kemitraan Anda sekarang dan dapatkan bimbingan 1-on-1 bersama tim Leader Bionet!`,
			WhatsAppShareText:      "Mau punya bisnis herbal modal terjangkau dengan omset harian dan sistem syariah tanpa tutup poin? Pelajari selengkapnya di: {{mitra_link}}",
			InstagramStoryTemplate: "Bisnis syariah modal mulai 500rb, bonus harian masuk rekening. Cek profil link!",
			ImageURLs: []string{
				"https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80",
				"https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80",
			},
			Tags:              []string{"bisnis_syariah", "peluang_usaha", "reseller", "passive_income"},
			DownloadAssetsURL: "https://bionet.id/assets/promo/kit-bisnis.zip",
		},
		{
			ID:            "kit-03",
			Title:         "Bukti Legalitas & Sertifikasi Resmi BPOM TR serta Halal MUI",
			Category:      "bpom_legalitas",
			CategoryLabel: "BPOM Legalitas",
			Headline:      "Keamanan Konsumen Adalah Prioritas Utama Bionet",
			Copywriting: `🛡️ *JANGAN AMBIL RISIKO DENGAN PRODUK KESEHATAN TANPA IZIN EDAR RESMI!*

Seluruh produk Bionet diproduksi di fasilitas bersertifikat CPOTB (Cara Pembuatan Obat Tradisional yang Baik) dan telah melalui uji laboratorium berkala.

📌 *LEGALITAS RESMI TERDAFTAR:*
• Izin Edar BPOM RI: *POM TR 226012891* (Cek via aplikasi BPOM Mobile)
• Sertifikat Halal MUI: *ID32110000123451022*
• Legalitas Perusahaan: SIUPL & Asosiasi Penjualan Langsung Indonesia (APLI)

Konsumsi aman tanpa was-was, bisnis berkah penuh manfaat untuk umat.`,
			WhatsAppShareText:      "Produk herbal Bionet 100% legal dan terdaftar resmi di BPOM RI & Halal MUI. Cek verifikasi izin edar di: {{mitra_link}}",
			InstagramStoryTemplate: "100% Resmi BPOM & Halal MUI. Aman untuk konsumsi harian keluarga Anda.",
			ImageURLs: []string{
				"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
			},
			Tags:              []string{"legalitas", "bpom", "halal_mui", "keamanan"},
			DownloadAssetsURL: "https://bionet.id/assets/promo/kit-legalitas.zip",
		},
		{
			ID:            "kit-04",
			Title:         "Kumpulan Kisah Nyata & Testimoni Kesembuhan Konsumen Bionet",
			Category:      "testimoni_kesehatan",
			CategoryLabel: "Testimoni Kesehatan",
			Headline:      "Kisah Kesembuhan Nyata Asam Urat, Diabetes & Masalah Vitalitas",
			Copywriting: `⭐ *BUKTI BUKAN SEKADAR JANJI: APA KATA MEREKA SETELAH RUTIN BIONET?*

"Bapak Hendro (52 th, Surabaya): 3 tahun menderita asam urat hingga susah sholat. Setelah rutin minum Bio-Propolis 3x5 tetes, hari ke-10 bengkak jempol kaki kempis total dan bisa beraktivitas kembali tanpa nyeri."

"Ibu Warsito (48 th, Semarang): Gula darah puasa turun stabil dari 230 mg/dL ke 145 mg/dL dalam 2 minggu. Tubuh tidak lagi lemas dan tidur jauh lebih nyenyak."

Baca puluhan kisah testimoni terverifikasi lainnya di portal mitra resmi: {{mitra_link}}`,
			WhatsAppShareText:      "Simak kisah nyata konsumen yang terbantu pulih dari keluhan asam urat & diabetes berkat Bio-Propolis Bionet di: {{mitra_link}}",
			InstagramStoryTemplate: "Real testimonial! Kesembuhan nyata konsumen Bionet dari berbagai kota.",
			ImageURLs: []string{
				"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
			},
			Tags:              []string{"testimoni", "kesembuhan", "diabetes", "asam_urat"},
			DownloadAssetsURL: "https://bionet.id/assets/promo/kit-testimoni.zip",
		},
	}

	webinars := []WebinarSchedule{
		{
			ID:              "webinar-bop-wed",
			Title:           "Webinar BOP Akbar Bionet: Rahasia Percepatan Finansial & Bisnis Syariah 2026",
			Speaker:         "dr. H. Rahmat Hidayat & Ir. Bambang Prakoso",
			SpeakerTitle:    "Konsultan Kesehatan Holistik & Top Crown Ambassador Bionet",
			DateDay:         fmt.Sprintf("Rabu Malam, %s", nextWed.Format("02 Jan 2006")),
			TimeWIB:         "19:30 - 21:00 WIB",
			NextSession:     nextWed,
			ZoomMeetingID:   "892 4110 9988",
			ZoomPasscode:    "BIONET2026",
			ZoomLink:        "https://zoom.us/j/89241109988?pwd=BIONET2026_WEBINAR",
			Description:     "Kupas tuntas strategi mendapatkan penghasilan harian Rp 1 - 5 juta dari rumah dengan mendistribusikan produk herbal legal BPOM bersertifikat Halal MUI.",
			PosterURL:       "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80",
			QuotaSeats:      500,
			RegisteredSeats: 384,
			IsActive:        true,
		},
		{
			ID:              "webinar-bop-sat",
			Title:           "Digital Prospecting Masterclass: Menghasilkan 20+ Leads/Hari via Bio-Link Funnel",
			Speaker:         "Rian Pratama, S.Kom & Tim Digital Growth Bionet",
			SpeakerTitle:    "Head of Digital Growth & Master Trainer Bionet Academy",
			DateDay:         fmt.Sprintf("Sabtu Malam, %s", nextSat.Format("02 Jan 2006")),
			TimeWIB:         "20:00 - 21:30 WIB",
			NextSession:     nextSat,
			ZoomMeetingID:   "877 6554 1122",
			ZoomPasscode:    "GROWTH2026",
			ZoomLink:        "https://zoom.us/j/87765541122?pwd=GROWTH2026_WEBINAR",
			Description:     "Pelatihan khusus mitra baru dan prospek untuk menguasai strategi closing otomatis menggunakan Sales Funnel, WhatsApp Automation, dan AI Copywriting.",
			PosterURL:       "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
			QuotaSeats:      300,
			RegisteredSeats: 215,
			IsActive:        true,
		},
	}

	return &MarketingHandler{
		webinars: webinars,
		kits:     kits,
	}
}

// GetMarketingKits returns promotional kits filtered by category
// GET /api/marketing/kits
func (h *MarketingHandler) GetMarketingKits(c *gin.Context) {
	category := strings.TrimSpace(c.Query("category"))
	if category == "" {
		c.JSON(http.StatusOK, gin.H{
			"status": "success",
			"data":   h.kits,
		})
		return
	}

	var filtered []MarketingKit
	for _, kit := range h.kits {
		if strings.EqualFold(kit.Category, category) {
			filtered = append(filtered, kit)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   filtered,
	})
}

// GetWebinars returns the schedule of upcoming BOP Zoom webinars
// GET /api/marketing/webinars
func (h *MarketingHandler) GetWebinars(c *gin.Context) {
	h.webinarsLock.RLock()
	defer h.webinarsLock.RUnlock()

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   h.webinars,
	})
}

// RegisterWebinarRequest payload when prospective member registers for a webinar
type RegisterWebinarRequest struct {
	WebinarID       string `json:"webinar_id"`
	SponsorUsername string `json:"sponsor_username"`
	StoreUsername   string `json:"store_username"`
	Name            string `json:"name" binding:"required"`
	Phone           string `json:"phone" binding:"required"`
	Email           string `json:"email"`
	City            string `json:"city"`
	Notes           string `json:"notes"`
}

// RegisterWebinar registers a participant for a BOP webinar and records into CRM as stage 'webinar'
// POST /api/marketing/webinars/register
func (h *MarketingHandler) RegisterWebinar(c *gin.Context) {
	var req RegisterWebinarRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Nama dan nomor WhatsApp wajib diisi",
		})
		return
	}

	targetSponsor := strings.TrimSpace(req.SponsorUsername)
	if targetSponsor == "" {
		targetSponsor = strings.TrimSpace(req.StoreUsername)
	}
	if targetSponsor == "" {
		targetSponsor = "bionet_official"
	}

	cleanPhone := strings.TrimSpace(req.Phone)
	cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")
	if strings.HasPrefix(cleanPhone, "08") {
		cleanPhone = "628" + cleanPhone[2:]
	} else if strings.HasPrefix(cleanPhone, "+62") {
		cleanPhone = cleanPhone[1:]
	}

	h.webinarsLock.Lock()
	var selectedWebinar WebinarSchedule
	webinarFound := false
	for i := range h.webinars {
		if h.webinars[i].ID == req.WebinarID || req.WebinarID == "" {
			h.webinars[i].RegisteredSeats++
			selectedWebinar = h.webinars[i]
			webinarFound = true
			break
		}
	}
	if !webinarFound && len(h.webinars) > 0 {
		selectedWebinar = h.webinars[0]
	}
	h.webinarsLock.Unlock()

	now := time.Now()
	ticketCode := fmt.Sprintf("BOP-%d", now.Unix()%1000000)
	ownerUserID := "user-" + targetSponsor
	db := config.DB

	sanitizedName := html.EscapeString(strings.TrimSpace(req.Name))
	sanitizedEmail := html.EscapeString(strings.TrimSpace(req.Email))
	sanitizedCity := html.EscapeString(strings.TrimSpace(req.City))
	sanitizedNotes := html.EscapeString(strings.TrimSpace(req.Notes))

	if db != nil {
		var user models.User
		if err := db.Where("username = ?", targetSponsor).First(&user).Error; err == nil {
			ownerUserID = user.ID
		}

		// Save into CRM Leads with stage 'webinar'
		lead := models.Lead{
			ID:              uuid.New().String(),
			UserID:          ownerUserID,
			Name:            sanitizedName,
			Phone:           cleanPhone,
			Email:           sanitizedEmail,
			City:            sanitizedCity,
			Source:          "webinar_bop",
			ProductInterest: "Peluang Bisnis BOP & Bio-Propolis",
			Status:          "webinar",
			Notes:           fmt.Sprintf("[Tiket: %s] Terdaftar Webinar BOP: %s. %s", ticketCode, selectedWebinar.Title, sanitizedNotes),
			CreatedAt:       now,
			UpdatedAt:       now,
		}

		db.Create(&lead)

		// Audit log
		audit := models.AuditLog{
			ID:        uuid.New().String(),
			UserID:    ownerUserID,
			Action:    "WEBINAR_REGISTRATION",
			TableName: "leads",
			RecordID:  lead.ID,
			NewValues: fmt.Sprintf(`{"ticket":"%s","name":"%s","webinar":"%s"}`, ticketCode, lead.Name, selectedWebinar.Title),
			CreatedAt: now,
		}
		db.Create(&audit)

		c.JSON(http.StatusCreated, gin.H{
			"status":  "success",
			"message": "Pendaftaran webinar BOP berhasil! Tautan Zoom dan reminder telah disiapkan.",
			"data": gin.H{
				"ticket_code":   ticketCode,
				"name":          lead.Name,
				"webinar_title": selectedWebinar.Title,
				"speaker":       selectedWebinar.Speaker,
				"date_day":      selectedWebinar.DateDay,
				"time_wib":      selectedWebinar.TimeWIB,
				"zoom_link":     selectedWebinar.ZoomLink,
				"zoom_id":       selectedWebinar.ZoomMeetingID,
				"zoom_passcode": selectedWebinar.ZoomPasscode,
				"lead_id":       lead.ID,
				"stage":         lead.Status,
			},
		})
		return
	}

	// In-memory mock response
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Pendaftaran webinar BOP berhasil! Tautan Zoom dan reminder telah disiapkan.",
		"data": gin.H{
			"ticket_code":   ticketCode,
			"name":          sanitizedName,
			"webinar_title": selectedWebinar.Title,
			"speaker":       selectedWebinar.Speaker,
			"date_day":      selectedWebinar.DateDay,
			"time_wib":      selectedWebinar.TimeWIB,
			"zoom_link":     selectedWebinar.ZoomLink,
			"zoom_id":       selectedWebinar.ZoomMeetingID,
			"zoom_passcode": selectedWebinar.ZoomPasscode,
			"lead_id":       "mock-lead-webinar",
			"stage":         "webinar",
		},
	})
}
