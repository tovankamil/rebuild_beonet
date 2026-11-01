package services

import (
	"fmt"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RankService struct {
	mu sync.RWMutex
}

var (
	GlobalRankService *RankService
	rankOnce          sync.Once
)

var StandardRanks = []models.RankDefinition{
	{
		ID:              "rank-bronze",
		Code:            "BRONZE",
		Name:            "Bronze Leader",
		RequiredLeftPV:  50,
		RequiredRightPV: 50,
		RewardTitle:     "Smartphone Android Bisnis / Uang Tunai",
		RewardValue:     2500000,
		BadgeColor:      "#cd7f32", // Bronze
		IconEmoji:       "🥉",
		OrderLevel:      1,
	},
	{
		ID:              "rank-silver",
		Code:            "SILVER",
		Name:            "Silver Leader",
		RequiredLeftPV:  250,
		RequiredRightPV: 250,
		RewardTitle:     "Laptop Bisnis & Presentasi / Uang Tunai",
		RewardValue:     7500000,
		BadgeColor:      "#94a3b8", // Silver
		IconEmoji:       "🥈",
		OrderLevel:      2,
	},
	{
		ID:              "rank-gold",
		Code:            "GOLD",
		Name:            "Gold Director",
		RequiredLeftPV:  1000,
		RequiredRightPV: 1000,
		RewardTitle:     "Sepeda Motor Honda PCX Baru / Uang Tunai",
		RewardValue:     35000000,
		BadgeColor:      "#d97706", // Gold
		IconEmoji:       "🥇",
		OrderLevel:      3,
	},
	{
		ID:              "rank-emerald",
		Code:            "EMERALD",
		Name:            "Emerald Executive",
		RequiredLeftPV:  5000,
		RequiredRightPV: 5000,
		RewardTitle:     "Wisata Religi / Umroh VIP Bintang 5 / Uang Tunai",
		RewardValue:     75000000,
		BadgeColor:      "#059669", // Emerald
		IconEmoji:       "💎",
		OrderLevel:      4,
	},
	{
		ID:              "rank-crown",
		Code:            "CROWN",
		Name:            "Crown Diamond",
		RequiredLeftPV:  20000,
		RequiredRightPV: 20000,
		RewardTitle:     "Mobil Keluarga Mewah / Uang Tunai",
		RewardValue:     300000000,
		BadgeColor:      "#7c3aed", // Royal Crown Purple
		IconEmoji:       "👑",
		OrderLevel:      5,
	},
}

func GetRankService() *RankService {
	rankOnce.Do(func() {
		GlobalRankService = &RankService{}
	})
	return GlobalRankService
}

type UserRankProgressDTO struct {
	CurrentRank       string                  `json:"current_rank"`
	CurrentRankCode   string                  `json:"current_rank_code"`
	CurrentBadgeColor string                  `json:"current_badge_color"`
	CurrentIconEmoji  string                  `json:"current_icon_emoji"`
	LeftPV            int64                   `json:"left_pv"`
	RightPV           int64                   `json:"right_pv"`
	NextRank          *models.RankDefinition  `json:"next_rank,omitempty"`
	ProgressPercent   float64                 `json:"progress_percent"`
	RemainingLeftPV   int64                   `json:"remaining_left_pv"`
	RemainingRightPV  int64                   `json:"remaining_right_pv"`
	AllRanks          []RankDetailItem        `json:"all_ranks"`
	TotalClaimedValue int64                   `json:"total_claimed_value"`
	RecentClaims      []models.RankRewardClaim `json:"recent_claims"`
}

type RankDetailItem struct {
	models.RankDefinition
	IsAchieved       bool   `json:"is_achieved"`
	IsClaimed        bool   `json:"is_claimed"`
	AchievedDate     string `json:"achieved_date,omitempty"`
	CanClaim         bool   `json:"can_claim"`
	ProgressToTarget float64 `json:"progress_to_target"`
}

func (s *RankService) GetUserRankProgress(userID string) (*UserRankProgressDTO, error) {
	db := config.DB
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	// 1. Ambil poin kaki kiri dan kanan mitra
	var pointBal models.PointBalance
	if err := db.Where("user_id = ?", userID).First(&pointBal).Error; err != nil {
		pointBal = models.PointBalance{
			PointLeft:  0,
			PointRight: 0,
		}
	}

	leftPV := int64(pointBal.PointLeft)
	rightPV := int64(pointBal.PointRight)
	balancedPV := leftPV
	if rightPV < balancedPV {
		balancedPV = rightPV
	}

	// 2. Ambil perolehan reward yang sudah pernah diklaim
	var claims []models.RankRewardClaim
	db.Where("user_id = ?", userID).Order("created_at DESC").Find(&claims)

	claimedMap := make(map[string]bool)
	var totalClaimed int64 = 0
	for _, c := range claims {
		claimedMap[c.RankCode] = true
		totalClaimed += c.RewardValue
	}

	// 3. Evaluasi setiap level jenjang karir
	var currentRank models.RankDefinition
	var nextRank *models.RankDefinition
	var rankItems []RankDetailItem

	hasCurrent := false
	for i, r := range StandardRanks {
		isAchieved := leftPV >= r.RequiredLeftPV && rightPV >= r.RequiredRightPV
		isClaimed := claimedMap[r.Code]
		canClaim := isAchieved && !isClaimed

		var pct float64 = 0
		reqMin := r.RequiredLeftPV
		if r.RequiredRightPV < reqMin {
			reqMin = r.RequiredRightPV
		}
		if reqMin > 0 {
			pct = (float64(balancedPV) / float64(reqMin)) * 100.0
			if pct > 100.0 {
				pct = 100.0
			}
		}

		if isAchieved {
			currentRank = r
			hasCurrent = true
		} else if nextRank == nil {
			nR := r
			nextRank = &nR
		}

		rankItems = append(rankItems, RankDetailItem{
			RankDefinition:   r,
			IsAchieved:       isAchieved,
			IsClaimed:        isClaimed,
			CanClaim:         canClaim,
			ProgressToTarget: pct,
		})
		_ = i
	}

	currentTitle := "Mitra Aktif"
	currentCode := "MEMBER"
	currentColor := "#059669"
	currentEmoji := "🌱"
	if hasCurrent {
		currentTitle = currentRank.Name
		currentCode = currentRank.Code
		currentColor = currentRank.BadgeColor
		currentEmoji = currentRank.IconEmoji
	}

	var progressPct float64 = 100.0
	var remLeft int64 = 0
	var remRight int64 = 0
	if nextRank != nil {
		if leftPV < nextRank.RequiredLeftPV {
			remLeft = nextRank.RequiredLeftPV - leftPV
		}
		if rightPV < nextRank.RequiredRightPV {
			remRight = nextRank.RequiredRightPV - rightPV
		}
		targetRequired := nextRank.RequiredLeftPV
		if targetRequired > 0 {
			progressPct = (float64(balancedPV) / float64(targetRequired)) * 100.0
			if progressPct > 100.0 {
				progressPct = 100.0
			}
		}
	}

	dto := &UserRankProgressDTO{
		CurrentRank:       currentTitle,
		CurrentRankCode:   currentCode,
		CurrentBadgeColor: currentColor,
		CurrentIconEmoji:  currentEmoji,
		LeftPV:            leftPV,
		RightPV:           rightPV,
		NextRank:          nextRank,
		ProgressPercent:   progressPct,
		RemainingLeftPV:   remLeft,
		RemainingRightPV:  remRight,
		AllRanks:          rankItems,
		TotalClaimedValue: totalClaimed,
		RecentClaims:      claims,
	}

	return dto, nil
}

// ClaimReward memproses pencairan atau klaim hadiah peringkat ke dompet mitra
func (s *RankService) ClaimReward(userID, rankCode, claimType, notes string) (*models.RankRewardClaim, error) {
	db := config.DB
	if db == nil {
		return nil, fmt.Errorf("database unavailable")
	}

	// 1. Temukan definisi rank
	var targetRank *models.RankDefinition
	for _, r := range StandardRanks {
		if r.Code == rankCode {
			targetRank = &r
			break
		}
	}
	if targetRank == nil {
		return nil, fmt.Errorf("peringkat '%s' tidak ditemukan", rankCode)
	}

	// 2. Cek apakah sudah pernah diklaim
	var existing models.RankRewardClaim
	if err := db.Where("user_id = ? AND rank_code = ?", userID, rankCode).First(&existing).Error; err == nil {
		return nil, fmt.Errorf("reward untuk peringkat %s sudah pernah diklaim sebelumnya", targetRank.Name)
	}

	// 3. Verifikasi poin PV saat ini
	var pointBal models.PointBalance
	if err := db.Where("user_id = ?", userID).First(&pointBal).Error; err != nil {
		return nil, fmt.Errorf("data poin kemitraan tidak ditemukan")
	}

	if int64(pointBal.PointLeft) < targetRank.RequiredLeftPV || int64(pointBal.PointRight) < targetRank.RequiredRightPV {
		return nil, fmt.Errorf("kualifikasi belum tercapai: membutuhkan %d PV Kiri & %d PV Kanan (saat ini: %d Kiri, %d Kanan)",
			targetRank.RequiredLeftPV, targetRank.RequiredRightPV, int64(pointBal.PointLeft), int64(pointBal.PointRight))
	}

	// 4. Eksekusi klaim via Database ACID Transaction
	claimID := uuid.New().String()
	claimRecord := models.RankRewardClaim{
		ID:          claimID,
		UserID:      userID,
		RankCode:    targetRank.Code,
		RewardTitle: targetRank.RewardTitle,
		RewardValue: targetRank.RewardValue,
		ClaimType:   claimType,
		Status:      "completed",
		Notes:       notes,
		CreatedAt:   time.Now(),
	}

	err := db.Transaction(func(tx *gorm.DB) error {
		// Simpan riwayat klaim reward
		if err := tx.Create(&claimRecord).Error; err != nil {
			return err
		}

		// Jika tipe cash (uang tunai), langsung tambahkan saldo ke dompet mitra
		if claimType == "cash" {
			var wallet models.Wallet
			if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
				return fmt.Errorf("dompet mitra tidak ditemukan: %v", err)
			}

			newBalance := wallet.Balance + float64(targetRank.RewardValue)
			if err := tx.Model(&wallet).Update("balance", newBalance).Error; err != nil {
				return err
			}

			txRecord := models.WalletTransaction{
				ID:              uuid.New().String(),
				UserID:          userID,
				Type:            "credit",
				Amount:          float64(targetRank.RewardValue),
				BalanceAfter:    newBalance,
				Description:     fmt.Sprintf("Klaim Reward Kemitraan: %s (%s)", targetRank.Name, targetRank.RewardTitle),
				TransactionDate: time.Now(),
				CreatedAt:       time.Now(),
			}
			if err := tx.Create(&txRecord).Error; err != nil {
				return err
			}
		}

		// Catat UserRank
		userRank := models.UserRank{
			ID:              uuid.New().String(),
			UserID:          userID,
			RankCode:        targetRank.Code,
			RankName:        targetRank.Name,
			LeftPV:          int64(pointBal.PointLeft),
			RightPV:         int64(pointBal.PointRight),
			AchievedAt:      time.Now(),
			IsRewardClaimed: true,
			ClaimedAt:       &claimRecord.CreatedAt,
		}
		if err := tx.Create(&userRank).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("gagal memproses klaim reward: %v", err)
	}

	return &claimRecord, nil
}
