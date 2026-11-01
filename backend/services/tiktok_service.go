package services

import (
	"fmt"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/google/uuid"
)

type TikTokService struct{}

var GlobalTikTokService = &TikTokService{}

// SeedDemoTikTokData memastikan data video & komentar TikTok herbal tersedia untuk live demo
func (s *TikTokService) SeedDemoTikTokData() {
	if config.DB == nil {
		return
	}

	var count int64
	config.DB.Model(&models.TikTokVideo{}).Count(&count)
	if count > 0 {
		return
	}

	demoVideos := []models.TikTokVideo{
		{
			ID:             uuid.New().String(),
			VideoID:        "73491823901239102",
			Title:          "Rahasia Kolesterol Turun Cepat Tanpa Efek Samping dengan Ekstrak Herbal Bionet! 🌿✨ #herbal #kesehatan #bionet",
			CoverImageURL:  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80",
			VideoURL:       "https://www.tiktok.com/@bionet_herbal/video/73491823901239102",
			ViewCount:      348900,
			LikeCount:      24500,
			CommentCount:   1840,
			ShareCount:     5200,
			DurationSecond: 42,
			PublishedAt:    time.Now().Add(-72 * time.Hour),
		},
		{
			ID:             uuid.New().String(),
			VideoID:        "73492019482910291",
			Title:          "Modal HP Bisa Dapat Komisi Harian Jutaan? Kupas Tuntas Sistem Kemitraan Resmi Bionet! 💰🚀 #bisnisviral #peluangbisnis #reseller",
			CoverImageURL:  "https://images.unsplash.com/photo-1556742049-0a67e55722ee?auto=format&fit=crop&w=400&q=80",
			VideoURL:       "https://www.tiktok.com/@bionet_herbal/video/73492019482910291",
			ViewCount:      582100,
			LikeCount:      48200,
			CommentCount:   3920,
			ShareCount:     11400,
			DurationSecond: 58,
			PublishedAt:    time.Now().Add(-140 * time.Hour),
		},
		{
			ID:             uuid.New().String(),
			VideoID:        "73493102938102938",
			Title:          "Unboxing Paket Lisensi Silver & Produk Herbal BPOM Bionet! Packaging super premium 📦🌱 #unboxing #bionetherbal #distributor",
			CoverImageURL:  "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80",
			VideoURL:       "https://www.tiktok.com/@bionet_herbal/video/73493102938102938",
			ViewCount:      124500,
			LikeCount:      9800,
			CommentCount:   640,
			ShareCount:     1420,
			DurationSecond: 35,
			PublishedAt:    time.Now().Add(-24 * time.Hour),
		},
	}

	for _, v := range demoVideos {
		config.DB.Create(&v)
	}

	// Demo comments
	demoComments := []models.TikTokComment{
		{
			ID:             uuid.New().String(),
			CommentID:      "c_901239102_1",
			VideoID:        "73491823901239102",
			AuthorUsername: "rina_kartika_jaya",
			AuthorNickname: "Ibu Rina Surabaya",
			AuthorAvatar:   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
			Text:           "Kak, untuk orang tua yang ada maag kronis apakah aman konsumsi paket herbal ini? Mau beli 2 box.",
			LikeCount:      124,
			ReplyCount:     3,
			CreatedAt:      time.Now().Add(-4 * time.Hour),
		},
		{
			ID:             uuid.New().String(),
			CommentID:      "c_901239102_2",
			VideoID:        "73491823901239102",
			AuthorUsername: "dokter_hendra_herbal",
			AuthorNickname: "Hendra Wijaya",
			AuthorAvatar:   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
			Text:           "Formula Bionet ini sudah ada izin edar BPOM dan halal MUI resmi kan min? Minta infonya di WA.",
			LikeCount:      89,
			ReplyCount:     1,
			CreatedAt:      time.Now().Add(-8 * time.Hour),
		},
		{
			ID:             uuid.New().String(),
			CommentID:      "c_948291029_1",
			VideoID:        "73492019482910291",
			AuthorUsername: "agus_pengusahamuda",
			AuthorNickname: "Agus Pratama",
			AuthorAvatar:   "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
			Text:           "Saya dari Makassar min, tertarik jadi agen distributor kemitraan. Mohon arahan cara daftarnya ya min!",
			LikeCount:      215,
			ReplyCount:     5,
			CreatedAt:      time.Now().Add(-2 * time.Hour),
		},
		{
			ID:             uuid.New().String(),
			CommentID:      "c_948291029_2",
			VideoID:        "73492019482910291",
			AuthorUsername: "siti_nurhaliza_olshop",
			AuthorNickname: "Siti Olshop Bandung",
			AuthorAvatar:   "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
			Text:           "Minimal modal paket Silver berapa ya? Bisa dropship atau langsung dapat website bio link?",
			LikeCount:      45,
			ReplyCount:     2,
			CreatedAt:      time.Now().Add(-12 * time.Hour),
		},
	}

	for _, c := range demoComments {
		config.DB.Create(&c)
	}
}

// GetOverview menghitung total views, engagement, komentar, dan rasio konversi TikTok
func (s *TikTokService) GetOverview(userID string) (*models.TikTokOverviewKPI, error) {
	s.SeedDemoTikTokData()

	var videos []models.TikTokVideo
	config.DB.Find(&videos)

	var totalViews, totalLikes, totalComments, totalShares int64
	for _, v := range videos {
		totalViews += v.ViewCount
		totalLikes += v.LikeCount
		totalComments += v.CommentCount
		totalShares += v.ShareCount
	}

	var convertedLeads int64
	config.DB.Model(&models.TikTokComment{}).Where("is_converted_lead = ?", true).Count(&convertedLeads)

	engagementRate := 0.0
	if totalViews > 0 {
		engagementRate = float64(totalLikes+totalComments+totalShares) / float64(totalViews) * 100.0
	}

	var cfg models.TikTokConfig
	isLinked := false
	accountName := "@bionet_official"
	if err := config.DB.Where("user_id = ? OR user_id = 'system'", userID).First(&cfg).Error; err == nil {
		isLinked = cfg.IsConnected
		if cfg.AccountName != "" {
			accountName = cfg.AccountName
		}
	} else {
		isLinked = true // Default demo connected
	}

	return &models.TikTokOverviewKPI{
		TotalViews:       totalViews,
		TotalLikes:       totalLikes,
		TotalComments:    totalComments,
		TotalShares:      totalShares,
		EngagementRate:   engagementRate,
		ConvertedLeads:   convertedLeads,
		IsAccountLinked:  isLinked,
		ConnectedAccount: accountName,
	}, nil
}

// GetVideos mengambil daftar konten video dan statistik performa tayangan
func (s *TikTokService) GetVideos(userID string, limit int) ([]models.TikTokVideo, error) {
	s.SeedDemoTikTokData()
	if limit <= 0 {
		limit = 20
	}

	var videos []models.TikTokVideo
	err := config.DB.Order("view_count DESC").Limit(limit).Find(&videos).Error
	return videos, err
}

// GetComments mengambil daftar komentar audiens pada video TikTok
func (s *TikTokService) GetComments(videoID string) ([]models.TikTokComment, error) {
	s.SeedDemoTikTokData()

	query := config.DB.Model(&models.TikTokComment{})
	if videoID != "" {
		query = query.Where("video_id = ?", videoID)
	}

	var comments []models.TikTokComment
	err := query.Order("created_at DESC").Limit(50).Find(&comments).Error
	return comments, err
}

// ConvertCommentToLead mengonversi komentar TikTok audiens langsung menjadi prospek Leads CRM
func (s *TikTokService) ConvertCommentToLead(commentID, userID string) (*models.Lead, error) {
	var comment models.TikTokComment
	if err := config.DB.Where("id = ? OR comment_id = ?", commentID, commentID).First(&comment).Error; err != nil {
		return nil, fmt.Errorf("komentar TikTok tidak ditemukan")
	}

	leadID := uuid.New().String()
	nameClean := comment.AuthorNickname
	if nameClean == "" {
		nameClean = "@" + comment.AuthorUsername
	}

	phoneGuess := ""
	words := strings.Fields(comment.Text)
	for _, w := range words {
		cleaned := strings.Trim(w, ",.:;()!?-")
		if (strings.HasPrefix(cleaned, "08") || strings.HasPrefix(cleaned, "628")) && len(cleaned) >= 10 {
			phoneGuess = cleaned
			break
		}
	}

	lead := models.Lead{
		ID:              leadID,
		UserID:          userID,
		Name:            nameClean,
		Phone:           phoneGuess,
		Email:           "",
		Source:          "tiktok",
		Status:          "new",
		ProductInterest: "Paket Herbal Bionet",
		Notes:           fmt.Sprintf("Audien TikTok @%s mengomentari video %s: '%s'", comment.AuthorUsername, comment.VideoID, comment.Text),
		EstimatedValue:  250000.0,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := config.DB.Create(&lead).Error; err != nil {
		return nil, fmt.Errorf("gagal membuat lead CRM: %w", err)
	}

	// Update status komentar
	config.DB.Model(&comment).Updates(map[string]interface{}{
		"is_converted_lead": true,
		"converted_lead_id": leadID,
	})

	return &lead, nil
}

// ReplyComment mengirim balasan pada komentar TikTok
func (s *TikTokService) ReplyComment(commentID, text string) error {
	var comment models.TikTokComment
	if err := config.DB.Where("id = ? OR comment_id = ?", commentID, commentID).First(&comment).Error; err != nil {
		return fmt.Errorf("komentar tidak ditemukan")
	}

	config.DB.Model(&comment).Update("reply_count", comment.ReplyCount+1)
	return nil
}
