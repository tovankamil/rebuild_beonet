package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GamificationHandler serves leaderboard, reward race, academy modules, and downline coaching alerts
type GamificationHandler struct {
	modulesLock     sync.RWMutex
	modules         []models.AcademyModule
	completionsLock sync.RWMutex
	completions     map[string]map[string]models.AcademyCompletion // userID -> moduleID -> completion
}

// NewGamificationHandler initializes gamification, reward thresholds, and 7 academy modules
func NewGamificationHandler() *GamificationHandler {
	modules := []models.AcademyModule{
		{
			ID:        "mod-01",
			Order:     1,
			Title:     "Orientasi & Filosofi Bionet Syariah",
			Category:  "Fondasi Bisnis",
			Duration:  "15 Menit",
			Summary:   "Mengenal visi besar Bionet Indonesia, prinsip bagi hasil muamalah syariah tanpa unsur riba, gharar, atau maysir.",
			Content:   "Bionet didirikan dengan prinsip transparansi dan keadilan kemitraan. Sistem bina kanan dan bina kiri dirancang murni berdasarkan omset riil produk herbal tanpa kewajiban tutup poin bulanan.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-orientasi",
			BadgeName: "Bionet Pioneer",
			BadgeIcon: "🌱",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Apa prinsip utama dari sistem kemitraan syariah Bionet?",
					Options:     []string{"Wajib tutup poin belanja tiap bulan", "Bagi hasil berbasis omset riil dan penjualan produk berkhasiat", "Hanya mengandalkan rekrutmen tanpa produk", "Bonus dipotong sepihak"},
					AnswerIndex: 1,
					Explanation: "Bionet mengutamakan muamalah halal dengan perputaran produk riil tanpa paksaan tutup poin.",
				},
				{
					ID:          2,
					Question:    "Berapa leg utama yang dibina oleh setiap mitra distributor Bionet?",
					Options:     []string{"1 Leg Monoleg", "2 Leg (Kiri dan Kanan)", "5 Leg Matahari", "10 Leg Bebas"},
					AnswerIndex: 1,
					Explanation: "Sistem binary Bionet membina dua jalur: Tim Kiri dan Tim Kanan untuk saling mendukung.",
				},
			},
		},
		{
			ID:        "mod-02",
			Order:     2,
			Title:     "Product Knowledge Bio-Propolis Trigona & Khasiat Herbal",
			Category:  "Produk & Khasiat",
			Duration:  "25 Menit",
			Summary:   "Memahami keunggulan ekstrak lebah klanceng tanpa alkohol, senyawa bioflavonoid, dan testimoni klinis kesembuhan.",
			Content:   "Bio-Propolis Trigona dipanen dari lebah tanpa sengat (Trigona sp.) nusantara. Mengandung asam fenolat, flavonoid, dan artepillin-C yang bekerja meregenerasi sel pankreas, menetralkan purin asam urat, serta memperkuat imunitas.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-propolis-science",
			BadgeName: "Propolis Specialist",
			BadgeIcon: "🍯",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Apa keunggulan utama Bio-Propolis Trigona dibandingkan propolis lebah madu biasa?",
					Options:     []string{"Kandungan bioflavonoid hingga 3x lipat dan bebas alkohol", "Lebih manis karena ditambah pemanis buatan", "Warna lebih pekat karena pewarna kimia", "Tidak memiliki izin BPOM"},
					AnswerIndex: 0,
					Explanation: "Propolis lebah klanceng memiliki partikel nano alami yang sangat cepat diserap oleh pembuluh darah seluler.",
				},
				{
					ID:          2,
					Question:    "Berapa takaran standar pemakaian harian untuk pemulihan keluhan asam urat/kolesterol?",
					Options:     []string{"1 tetes seminggu sekali", "3 x 5 tetes per hari dicampur 1/4 gelas air hangat", "1 botol sekali teguk", "Hanya dioles di kulit luar"},
					AnswerIndex: 1,
					Explanation: "Dosis optimal adalah 3 x 5 tetes sebelum makan untuk memaksimalkan absorpsi lambung.",
				},
			},
		},
		{
			ID:        "mod-03",
			Order:     3,
			Title:     "Marketing Plan & Simulasi Finansial Multi-Tier",
			Category:  "Rencana Bisnis",
			Duration:  "30 Menit",
			Summary:   "Bedah tuntas potensi bonus sponsor, bonus pasangan harian, reward race, dan percepatan omset tim.",
			Content:   "Pelajari perhitungan matematis komisi pasangan (pairing bonus). Setiap terjadi keseimbangan poin PV di kaki kiri dan kanan, sistem otomatis mengkreditkan bonus ke dompet digital mitra tanpa penundaan.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-marketing-plan",
			BadgeName: "Binary Architect",
			BadgeIcon: "📈",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Kapan bonus pasangan (pairing bonus) Bionet dicairkan ke saldo dompet mitra?",
					Options:     []string{"Tunggu 6 bulan kemudian", "Setiap akhir tahun", "Cair harian secara otomatis saat syarat pairing terpenuhi", "Hanya jika merekrut 100 orang"},
					AnswerIndex: 2,
					Explanation: "Komisi pasangan dihitung per hari dan langsung masuk saldo dompet siap ditarik (withdrawal).",
				},
			},
		},
		{
			ID:        "mod-04",
			Order:     4,
			Title:     "90 Hari Menuju Diamond - Siklus Sukses Membangun Jaringan",
			Category:  "Roadmap Kepemimpinan",
			Duration:  "20 Menit",
			Summary:   "Langkah demi langkah dalam 90 hari pertama: daftar nama, konsultasi upline, home sharing, dan webinar BOP.",
			Content:   "90 hari pertama menentukan keberhasilan distributor. Fokuskan 30 hari pertama untuk meluluskan 10 mitra jalur sponsor langsung, hari 31-60 memandu mereka menduplikasi, dan hari 61-90 memperkuat kepemimpinan.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-90-days",
			BadgeName: "Diamond Pathfinder",
			BadgeIcon: "💎",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Apa fokus utama di 30 hari pertama bagi mitra baru Bionet?",
					Options:     []string{"Duduk diam menunggu limpahan spillover", "Kuasai product knowledge, miliki testimoni pribadi, dan undang ke webinar BOP", "Berhenti jika ditolak sekali", "Mengubah sistem marketing plan"},
					AnswerIndex: 1,
					Explanation: "Pengalaman produk pribadi dan mengundang prospek ke BOP terbukti menghasilkan duplikasi tercepat.",
				},
			},
		},
		{
			ID:        "mod-05",
			Order:     5,
			Title:     "Digital Prospecting & Bio-Link Funnel Mastery",
			Category:  "Pemasaran Digital",
			Duration:  "25 Menit",
			Summary:   "Menggunakan landing page Bio-Link replika, promosi media sosial TikTok/IG, dan traffic funneling.",
			Content:   "Maksimalkan fitur Bio-Link Builder Bionet. Tempelkan link bio personal Anda di profil Instagram, bio TikTok, dan status WhatsApp untuk menangkap calon prospek otomatis ke dalam CRM.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-biolink-mastery",
			BadgeName: "Funnel Master",
			BadgeIcon: "🚀",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Ke mana prospek yang mengisi formulir di halaman Bio-Link mitra akan diarahkan?",
					Options:     []string{"Hilang begitu saja", "Tersimpan otomatis ke database CRM Mitra dalam stage 'new'", "Masuk ke database kompetitor", "Hanya dikirim email spam"},
					AnswerIndex: 1,
					Explanation: "Setiap submission di Bio-Link langsung tercatat di CRM mitra pemilik halaman untuk segera di-follow-up.",
				},
			},
		},
		{
			ID:        "mod-06",
			Order:     6,
			Title:     "Handling Objection & Teknik Closing Konsultatif",
			Category:  "Teknik Penjualan",
			Duration:  "20 Menit",
			Summary:   "Menjawab keraguan konsumen soal harga, legalitas BPOM, rasa propolis, dan keraguan bisnis MLM konvensional.",
			Content:   "Jangan mendebat calon konsumen. Gunakan metode 'Feel, Felt, Found': pahami kekhawatiran mereka, bagikan pengalaman konsumen lain, dan berikan bukti sertifikasi BPOM serta garansi kualitas Bionet.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-closing-secrets",
			BadgeName: "Master Closer",
			BadgeIcon: "🎯",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Bagaimana respon terbaik jika calon prospek berkata: 'Harganya mahal ya?'",
					Options:     []string{"Langsung marah dan blokir nomornya", "Tunjukkan perbandingan hematnya (1 botol 600 tetes untuk 1 bulan terapi) dibanding biaya berobat medis", "Turunkan harga di bawah harga resmi perusahaan", "Katakan produk lain lebih jelek"},
					AnswerIndex: 1,
					Explanation: "Edukasi nilai investasi kesehatan jangka panjang dan efisiensi per tetes Bio-Propolis.",
				},
			},
		},
		{
			ID:        "mod-07",
			Order:     7,
			Title:     "Duplikasi & Kepemimpinan Tim Juara",
			Category:  "Pengembangan Tim",
			Duration:  "35 Menit",
			Summary:   "Cara melahirkan leader baru di jaringan, coaching downline pasif, dan menjaga ritme reward race.",
			Content:   "Bisnis networking adalah bisnis transfer antusiasme dan duplikasi sistem. Jadilah teladan bagi tim Anda, lakukan coaching rutin mingguan, dan dampingi downline dalam meraih reward pertama mereka.",
			VideoURL:  "https://www.youtube.com/watch?v=bionet-leadership-duplication",
			BadgeName: "Crown Mentor",
			BadgeIcon: "👑",
			Questions: []models.AcademyQuizQuestion{
				{
					ID:          1,
					Question:    "Apa yang harus dilakukan upline saat mendeteksi downline pasif lebih dari 14 hari?",
					Options:     []string{"Memarahi downline di grup WhatsApp", "Menghapus nomor kontaknya", "Melakukan pendekatan ramah dengan naskah coaching empatik untuk mendengarkan kendalanya", "Membiarkannya tanpa tindak lanjut"},
					AnswerIndex: 2,
					Explanation: "Coaching yang empatik dan suportif seringkali membangkitkan kembali semangat mitra yang sempat ragu.",
				},
			},
		},
	}

	return &GamificationHandler{
		modules:     modules,
		completions: make(map[string]map[string]models.AcademyCompletion),
	}
}

// GetLeaderboard returns rankings for Top Sponsor, Top Omset, and Top Pairing
// Protected/Public GET /api/gamification/leaderboard
func (h *GamificationHandler) GetLeaderboard(c *gin.Context) {
	rankType := strings.ToLower(strings.TrimSpace(c.DefaultQuery("type", "sponsor")))
	period := strings.ToLower(strings.TrimSpace(c.DefaultQuery("period", "monthly")))

	if rankType != "sponsor" && rankType != "omset" && rankType != "pairing" {
		rankType = "sponsor"
	}
	if period != "daily" && period != "monthly" {
		period = "monthly"
	}

	var entries []models.LeaderboardEntry

	switch rankType {
	case "omset":
		scoreLabel := "PV Omset"
		entries = []models.LeaderboardEntry{
			{Rank: 1, UserID: "u-101", Username: "hendra_diamond", FullName: "Hendra Wijaya, S.E.", City: "Surabaya", Score: 48500, ScoreLabel: scoreLabel, Badge: "Crown Ambassador", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"},
			{Rank: 2, UserID: "u-102", Username: "dr_rahmat_herbal", FullName: "dr. H. Rahmat Hidayat", City: "Jakarta Selatan", Score: 39200, ScoreLabel: scoreLabel, Badge: "Diamond Leader", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80"},
			{Rank: 3, UserID: "u-103", Username: "ratna_propolis", FullName: "Ratna Kusumaningrum", City: "Bandung", Score: 32750, ScoreLabel: scoreLabel, Badge: "Sapphire Director", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"},
			{Rank: 4, UserID: "u-104", Username: "agus_medan_bionet", FullName: "Agus Salim Batubara", City: "Medan", Score: 24100, ScoreLabel: scoreLabel, Badge: "Ruby Manager", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80"},
			{Rank: 5, UserID: "u-105", Username: "budi_makassar", FullName: "Budi Santoso", City: "Makassar", Score: 18900, ScoreLabel: scoreLabel, Badge: "Emerald Pioneer", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"},
		}
	case "pairing":
		scoreLabel := "Pasangan"
		entries = []models.LeaderboardEntry{
			{Rank: 1, UserID: "u-101", Username: "hendra_diamond", FullName: "Hendra Wijaya, S.E.", City: "Surabaya", Score: 245, ScoreLabel: scoreLabel, Badge: "Crown Ambassador", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"},
			{Rank: 2, UserID: "u-103", Username: "ratna_propolis", FullName: "Ratna Kusumaningrum", City: "Bandung", Score: 198, ScoreLabel: scoreLabel, Badge: "Sapphire Director", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"},
			{Rank: 3, UserID: "u-102", Username: "dr_rahmat_herbal", FullName: "dr. H. Rahmat Hidayat", City: "Jakarta Selatan", Score: 164, ScoreLabel: scoreLabel, Badge: "Diamond Leader", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80"},
			{Rank: 4, UserID: "u-106", Username: "dewi_yogyakarta", FullName: "Dewi Sekar Kedaton", City: "Yogyakarta", Score: 112, ScoreLabel: scoreLabel, Badge: "Ruby Manager", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80"},
			{Rank: 5, UserID: "u-107", Username: "wahyu_bali", FullName: "I Wayan Wahyu", City: "Denpasar", Score: 87, ScoreLabel: scoreLabel, Badge: "Top Leader", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80"},
		}
	default: // sponsor
		scoreLabel := "Mitra Baru"
		entries = []models.LeaderboardEntry{
			{Rank: 1, UserID: "u-108", Username: "mitra_sukses_solo", FullName: "Siti Rahmawati", City: "Surakarta", Score: 38, ScoreLabel: scoreLabel, Badge: "Top Recruiter", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"},
			{Rank: 2, UserID: "u-101", Username: "hendra_diamond", FullName: "Hendra Wijaya, S.E.", City: "Surabaya", Score: 31, ScoreLabel: scoreLabel, Badge: "Crown Ambassador", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"},
			{Rank: 3, UserID: "u-109", Username: "rizky_palembang", FullName: "Rizky Firmansyah", City: "Palembang", Score: 27, ScoreLabel: scoreLabel, Badge: "Rising Star", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"},
			{Rank: 4, UserID: "u-103", Username: "ratna_propolis", FullName: "Ratna Kusumaningrum", City: "Bandung", Score: 22, ScoreLabel: scoreLabel, Badge: "Sapphire Director", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"},
			{Rank: 5, UserID: "u-110", Username: "teuku_aceh", FullName: "Teuku Iskandar", City: "Banda Aceh", Score: 19, ScoreLabel: scoreLabel, Badge: "Regional Star", Type: rankType, Period: period, Avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80"},
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"type":   rankType,
		"period": period,
		"data":   entries,
	})
}

// GetRewardProgress returns PV accumulation and progress towards dream rewards
// Protected GET /api/gamification/reward-progress
func (h *GamificationHandler) GetRewardProgress(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "mitra-default-id"
	}

	currentLeft := 620.0
	currentRight := 540.0

	db := config.DB
	if db != nil {
		var pb models.PointBalance
		if err := db.Where("user_id = ?", userID).First(&pb).Error; err == nil {
			currentLeft = pb.PointLeft
			currentRight = pb.PointRight
		}
	}

	rewards := []models.RewardItem{
		{
			ID:                 "rew-01",
			Name:               "Smartwatch Sport Bionet Exclusive",
			RequiredLeft:       100,
			RequiredRight:      100,
			CurrentLeft:        currentLeft,
			CurrentRight:       currentRight,
			ProgressPercentage: calcProgress(currentLeft, currentRight, 100, 100),
			IsAchieved:         currentLeft >= 100 && currentRight >= 100,
			IsClaimed:          true,
			Icon:               "⌚",
			ImageURL:           "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
			ValueDescription:   "Estimasi Senilai Rp 2.500.000",
			Tier:               1,
		},
		{
			ID:                 "rew-02",
			Name:               "Paket Wisata Ibadah Umroh / Holyland 9 Hari",
			RequiredLeft:       500,
			RequiredRight:      500,
			CurrentLeft:        currentLeft,
			CurrentRight:       currentRight,
			ProgressPercentage: calcProgress(currentLeft, currentRight, 500, 500),
			IsAchieved:         currentLeft >= 500 && currentRight >= 500,
			IsClaimed:          false,
			Icon:               "✈️",
			ImageURL:           "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&auto=format&fit=crop&q=80",
			ValueDescription:   "Paket Bintang 5 Senilai Rp 35.000.000",
			Tier:               2,
		},
		{
			ID:                 "rew-03",
			Name:               "Mobil Keluarga All New Honda Mobilio",
			RequiredLeft:       2500,
			RequiredRight:      2500,
			CurrentLeft:        currentLeft,
			CurrentRight:       currentRight,
			ProgressPercentage: calcProgress(currentLeft, currentRight, 2500, 2500),
			IsAchieved:         currentLeft >= 2500 && currentRight >= 2500,
			IsClaimed:          false,
			Icon:               "🚗",
			ImageURL:           "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
			ValueDescription:   "Unit Baru BPKB Atas Nama Sendiri Rp 250.000.000",
			Tier:               3,
		},
		{
			ID:                 "rew-04",
			Name:               "SUV Gagah All New Mitsubishi Pajero Sport",
			RequiredLeft:       10000,
			RequiredRight:      10000,
			CurrentLeft:        currentLeft,
			CurrentRight:       currentRight,
			ProgressPercentage: calcProgress(currentLeft, currentRight, 10000, 10000),
			IsAchieved:         currentLeft >= 10000 && currentRight >= 10000,
			IsClaimed:          false,
			Icon:               "🚙",
			ImageURL:           "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
			ValueDescription:   "SUV Dakar Ultimate Senilai Rp 600.000.000",
			Tier:               4,
		},
		{
			ID:                 "rew-05",
			Name:               "Rumah Mewah Bionet Luxury Villa",
			RequiredLeft:       30000,
			RequiredRight:      30000,
			CurrentLeft:        currentLeft,
			CurrentRight:       currentRight,
			ProgressPercentage: calcProgress(currentLeft, currentRight, 30000, 30000),
			IsAchieved:         currentLeft >= 30000 && currentRight >= 30000,
			IsClaimed:          false,
			Icon:               "🏰",
			ImageURL:           "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
			ValueDescription:   "Properti Impian Sertifikat Hak Milik Rp 1.500.000.000",
			Tier:               5,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_pv_left":      currentLeft,
			"total_pv_right":     currentRight,
			"next_target_reward": "Paket Wisata Ibadah Umroh / Holyland 9 Hari",
			"rewards":            rewards,
		},
	})
}

func calcProgress(curL, curR, reqL, reqR float64) float64 {
	ratioL := curL / reqL
	ratioR := curR / reqR
	minRatio := ratioL
	if ratioR < minRatio {
		minRatio = ratioR
	}
	pct := minRatio * 100.0
	if pct > 100.0 {
		return 100.0
	}
	if pct < 0.0 {
		return 0.0
	}
	return float64(int(pct*10)) / 10.0 // 1 decimal place
}

// GetAcademyModules returns all 7 modules with personal completion status
// Protected GET /api/academy/modules
func (h *GamificationHandler) GetAcademyModules(c *gin.Context) {
	userID := c.GetString("user_id")

	h.modulesLock.RLock()
	defer h.modulesLock.RUnlock()

	modulesList := make([]models.AcademyModule, len(h.modules))
	copy(modulesList, h.modules)

	h.completionsLock.RLock()
	userComps := h.completions[userID]
	h.completionsLock.RUnlock()

	db := config.DB
	for i := range modulesList {
		modID := modulesList[i].ID
		// Check in DB if available
		if db != nil && userID != "" {
			var comp models.AcademyCompletion
			if err := db.Where("user_id = ? AND module_id = ?", userID, modID).First(&comp).Error; err == nil {
				modulesList[i].IsCompleted = true
				modulesList[i].CompletedAt = &comp.CompletedAt
				continue
			}
		}

		// Check in-memory
		if userComps != nil {
			if comp, exists := userComps[modID]; exists {
				modulesList[i].IsCompleted = true
				modulesList[i].CompletedAt = &comp.CompletedAt
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   modulesList,
	})
}

// CompleteModuleRequest payload when submitting module evaluation
type CompleteModuleRequest struct {
	ModuleID string `json:"module_id" binding:"required"`
	Score    int    `json:"score"`
	Answers  []int  `json:"answers"`
}

// CompleteAcademyModule records graduation of a module and awards a digital badge
// Protected POST /api/academy/complete
func (h *GamificationHandler) CompleteAcademyModule(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "mitra-default-id"
	}

	var req CompleteModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Module ID wajib disertakan",
		})
		return
	}

	h.modulesLock.RLock()
	var targetMod *models.AcademyModule
	for i := range h.modules {
		if h.modules[i].ID == req.ModuleID {
			targetMod = &h.modules[i]
			break
		}
	}
	h.modulesLock.RUnlock()

	if targetMod == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Modul akademi tidak ditemukan",
		})
		return
	}

	now := time.Now()
	score := req.Score
	if score <= 0 {
		score = 100
	}

	comp := models.AcademyCompletion{
		ID:           uuid.New().String(),
		UserID:       userID,
		ModuleID:     targetMod.ID,
		Score:        score,
		Passed:       true,
		BadgeAwarded: targetMod.BadgeName,
		CompletedAt:  now,
	}

	db := config.DB
	if db != nil {
		db.Create(&comp)
	}

	h.completionsLock.Lock()
	if h.completions[userID] == nil {
		h.completions[userID] = make(map[string]models.AcademyCompletion)
	}
	h.completions[userID][targetMod.ID] = comp
	h.completionsLock.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      fmt.Sprintf("Selamat! Anda berhasil menyelesaikan '%s' dan meraih badge digital %s", targetMod.Title, targetMod.BadgeName),
		"badge":        targetMod.BadgeName,
		"badge_icon":   targetMod.BadgeIcon,
		"module_title": targetMod.Title,
		"data":         comp,
	})
}

// GetInactivityAlerts detects downlines inactive for 14+ days with WhatsApp coaching scripts
// Protected GET /api/gamification/inactivity-alerts
func (h *GamificationHandler) GetInactivityAlerts(c *gin.Context) {
	alerts := []models.InactivityAlert{
		{
			DownlineID:   "down-001",
			Username:     "bambang_cirebon",
			FullName:     "Bambang Sudarsono",
			Phone:        "6281233445566",
			City:         "Cirebon",
			DaysInactive: 18,
			LegPosition:  "left",
			LastActivity: "Order terakhir 18 hari lalu (Paket Starter Bio-Propolis)",
			SuggestedWhatsAppText: `Halo Mas Bambang, apa kabar? Semoga sehat sekeluarga ya. 

Saya perhatikan Mas Bambang belum sempat aktif di grup Bionet minggu ini. Ada kendala saat edukasi konsumen Bio-Propolis di Cirebon? 

Kebetulan malam ini jam 19.30 ada Webinar BOP Nasional bareng dr. Rahmat. Mas Bambang bisa undang 2-3 kenalan, nanti biar dokter & mentor yang bantu jelaskan khasiatnya. 

Saya siap bantu dampingi ya Mas. Semangat selalu! 🙏`,
		},
		{
			DownlineID:   "down-002",
			Username:     "siti_sukabumi",
			FullName:     "Siti Nurjanah",
			Phone:        "6281987654321",
			City:         "Sukabumi",
			DaysInactive: 24,
			LegPosition:  "right",
			LastActivity: "Login portal 24 hari lalu",
			SuggestedWhatsAppText: `Assalamu'alaikum Bu Siti, salam silaturahmi. 

Bagaimana kabar di Sukabumi Bu? Semoga rezeki dan kesehatan selalu dilancarkan Allah SWT. 

Sekadar menyapa, saat ini di Bionet ada modul baru 'Digital Prospecting & Bio-Link Builder' yang bisa bantu dapat prospek otomatis dari WhatsApp & TikTok tanpa perlu door-to-door. 

Kalau Bu Siti ada waktu luang 15 menit, yuk kita ngobrol santai atau zoom berdua, biar saya bantu settingkan halaman Bio-Link gratis untuk Ibu. Ditunggu ya Bu! 😊`,
		},
		{
			DownlineID:   "down-003",
			Username:     "hendra_kediri",
			FullName:     "Hendra Pratama",
			Phone:        "6285211223344",
			City:         "Kediri",
			DaysInactive: 15,
			LegPosition:  "left",
			LastActivity: "Input prospek terakhir 15 hari lalu",
			SuggestedWhatsAppText: `Halo Bro Hendra, apa kabar Kediri? 

Keren kemarin sempat closing beberapa botol Bio-Propolis. Sayang banget nih tinggal sedikit lagi bro bisa capai akumulasi PV buat kualifikasi Reward Smartwatch Sport Bionet. 

Kalau butuh materi copywriting promosi terbaru atau bahan testimoni asam urat/diabetes yang lagi viral, kabari ya, langsung saya kirimkan via WhatsApp. Sukses terus Bro Hendra! 🚀`,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"total":  len(alerts),
		"data":   alerts,
	})
}
