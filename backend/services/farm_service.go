package services

import (
	"fmt"
	"math/rand"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FarmService struct {
	db *gorm.DB
	mu sync.RWMutex
}

var (
	GlobalFarmService *FarmService
	farmOnce          sync.Once
)

var StandardSeeds = []models.SeedCatalogItem{
	{
		PlantType:           "propolis_flower",
		PlantName:           "Bunga Nektar Propolis",
		Description:         "Bunga kaya nektar bio-aktif untuk koloni lebah Trigona. Pertumbuhan cepat dan ramah pemula.",
		TargetWater:         100,
		RewardType:          "voucher",
		RewardValue:         25000,
		RewardTitle:         "Voucher Diskon Rp 25.000 Belanja Herbal",
		EstimatedGrowthDays: "1-2 Hari",
		Icon:                "🌸",
		Badge:               "Pemula",
	},
	{
		PlantType:           "red_ginger",
		PlantName:           "Jahe Merah Bio-Aktif",
		Description:         "Rimpang jahe merah herbal untuk daya tahan tubuh, kehangatan seluler, dan stamina prima.",
		TargetWater:         150,
		RewardType:          "wallet_cash",
		RewardValue:         50000,
		RewardTitle:         "Saldo Dompet Tunai Rp 50.000",
		EstimatedGrowthDays: "2-3 Hari",
		Icon:                "🫚",
		Badge:               "Populer",
	},
	{
		PlantType:           "bio_sirsak",
		PlantName:           "Sirsak Antioksidan Bionet",
		Description:         "Pohon daun sirsak kaya senyawa acetogenin murni untuk detoksifikasi dan peremajaan seluler.",
		TargetWater:         200,
		RewardType:          "voucher",
		RewardValue:         75000,
		RewardTitle:         "Voucher Produk Spesial Rp 75.000",
		EstimatedGrowthDays: "3-4 Hari",
		Icon:                "🍃",
		Badge:               "Spesial",
	},
	{
		PlantType:           "royal_trigona",
		PlantName:           "Sarang Lebah Royal Trigona",
		Description:         "Budidaya sarang klanceng murni penghasil propolis emas dan madu murni berkualitas tinggi.",
		TargetWater:         300,
		RewardType:          "wallet_cash",
		RewardValue:         100000,
		RewardTitle:         "Saldo Dompet Panen Raya Rp 100.000",
		EstimatedGrowthDays: "4-5 Hari",
		Icon:                "🐝",
		Badge:               "Legendaris",
	},
}

func GetSeedByType(plantType string) *models.SeedCatalogItem {
	for _, s := range StandardSeeds {
		if s.PlantType == plantType {
			item := s
			return &item
		}
	}
	return nil
}

func NewFarmService(db *gorm.DB) *FarmService {
	if db == nil {
		db = config.DB
	}
	return &FarmService{db: db}
}

func GetFarmService() *FarmService {
	farmOnce.Do(func() {
		GlobalFarmService = NewFarmService(config.DB)
	})
	return GlobalFarmService
}

func (s *FarmService) getDB() *gorm.DB {
	if s.db != nil {
		return s.db
	}
	return config.DB
}

// CalculateStage evaluates the plant growth phase based on water progress
func CalculateStage(currentWater, targetWater int) string {
	if targetWater <= 0 {
		return "seed"
	}
	progress := float64(currentWater) / float64(targetWater)
	if progress >= 1.0 {
		return "harvest_ready"
	} else if progress >= 0.75 {
		return "bloom"
	} else if progress >= 0.50 {
		return "growing"
	} else if progress >= 0.25 {
		return "sprout"
	}
	return "seed"
}

// RegenerateWater recalculates droplet accumulation (+1 drop every 2 minutes since LastRegenAt, max 100)
func (s *FarmService) RegenerateWater(tank *models.FarmWaterTank) {
	if tank == nil {
		return
	}
	now := time.Now()
	if tank.WaterDroplets >= 100 {
		tank.WaterDroplets = 100
		tank.LastRegenAt = now
		return
	}

	elapsed := now.Sub(tank.LastRegenAt)
	minutes := int(elapsed.Minutes())
	if minutes < 2 {
		return
	}

	dropsToAdd := minutes / 2
	if dropsToAdd <= 0 {
		return
	}

	tank.WaterDroplets += dropsToAdd
	if tank.WaterDroplets >= 100 {
		tank.WaterDroplets = 100
		tank.LastRegenAt = now
	} else {
		tank.LastRegenAt = tank.LastRegenAt.Add(time.Duration(dropsToAdd*2) * time.Minute)
	}
}

// GetFarmState returns the complete farm dashboard, auto-initializing records if not present
func (s *FarmService) GetFarmState(userID string) (*models.FarmStateResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	// 1. Get or create FarmWaterTank
	var tank models.FarmWaterTank
	if err := db.Where("user_id = ?", userID).First(&tank).Error; err != nil {
		tank = models.FarmWaterTank{
			UserID:          userID,
			WaterDroplets:   100,
			LastRegenAt:     time.Now(),
			TotalWaterGiven: 0,
			TotalHarvests:   0,
		}
		if err := db.Create(&tank).Error; err != nil {
			return nil, fmt.Errorf("failed to initialize water tank: %w", err)
		}
	} else {
		// Regenerate droplets
		s.RegenerateWater(&tank)
		db.Save(&tank)
	}

	// 2. Get or create FarmPet
	var pet models.FarmPet
	if err := db.Where("user_id = ?", userID).First(&pet).Error; err != nil {
		now := time.Now()
		pet = models.FarmPet{
			ID:                uuid.New().String(),
			UserID:            userID,
			PetType:           "trigona_bee",
			PetName:           "Lebah Trigona Bionet",
			Happiness:         100,
			Level:             1,
			LastFedAt:         &now,
			BonusWaterPerHour: 2,
		}
		if err := db.Create(&pet).Error; err != nil {
			return nil, fmt.Errorf("failed to initialize farm pet: %w", err)
		}
	}

	// 3. Get or create UserFarmPlot
	var plot models.UserFarmPlot
	if err := db.Where("user_id = ?", userID).First(&plot).Error; err != nil {
		defaultSeed := StandardSeeds[0] // Propolis Flower as first starter crop
		plot = models.UserFarmPlot{
			ID:                 uuid.New().String(),
			UserID:             userID,
			PlantType:          defaultSeed.PlantType,
			PlantName:          defaultSeed.PlantName,
			CurrentWater:       0,
			TargetWater:        defaultSeed.TargetWater,
			Stage:              "seed",
			Health:             100,
			PlantedAt:          time.Now(),
			HarvestRewardType:  defaultSeed.RewardType,
			HarvestRewardValue: defaultSeed.RewardValue,
			HarvestRewardTitle: defaultSeed.RewardTitle,
		}
		if err := db.Create(&plot).Error; err != nil {
			return nil, fmt.Errorf("failed to initialize farm plot: %w", err)
		}
	}

	// 4. Fetch recent harvest logs
	var recentHarvests []models.FarmHarvestLog
	db.Where("user_id = ?", userID).Order("created_at desc").Limit(10).Find(&recentHarvests)

	// 5. Check if daily bonus can be claimed
	todayStr := time.Now().Format("2006-01-02")
	canClaimBonus := true
	if tank.LastDailyBonusAt != nil && tank.LastDailyBonusAt.Format("2006-01-02") == todayStr {
		canClaimBonus = false
	}

	// 6. Fetch friends for unified farm state
	friends, _ := s.getFarmFriendsInternal(userID)

	return &models.FarmStateResponse{
		Plot:           &plot,
		Pet:            &pet,
		WaterTank:      &tank,
		AvailableSeeds: StandardSeeds,
		RecentHarvests: recentHarvests,
		HarvestHistory: recentHarvests,
		Friends:        friends,
		CanClaimBonus:  canClaimBonus,
	}, nil
}

// PlantSeed plants a new seed on the user's plot
func (s *FarmService) PlantSeed(userID, plantType string) (*models.UserFarmPlot, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	seed := GetSeedByType(plantType)
	if seed == nil {
		return nil, fmt.Errorf("jenis bibit '%s' tidak valid", plantType)
	}

	var plot models.UserFarmPlot
	if err := db.Where("user_id = ?", userID).First(&plot).Error; err != nil {
		plot = models.UserFarmPlot{
			ID:                 uuid.New().String(),
			UserID:             userID,
			PlantType:          seed.PlantType,
			PlantName:          seed.PlantName,
			CurrentWater:       0,
			TargetWater:        seed.TargetWater,
			Stage:              "seed",
			Health:             100,
			PlantedAt:          time.Now(),
			HarvestRewardType:  seed.RewardType,
			HarvestRewardValue: seed.RewardValue,
			HarvestRewardTitle: seed.RewardTitle,
		}
		if err := db.Create(&plot).Error; err != nil {
			return nil, fmt.Errorf("gagal menanam bibit: %w", err)
		}
		return &plot, nil
	}

	// If there is an active plant that is not harvested or empty
	if plot.PlantType != "" && plot.Stage != "empty" {
		if plot.Stage == "harvest_ready" {
			return nil, fmt.Errorf("tanaman '%s' Anda sudah siap dipanen! Panen terlebih dahulu sebelum menanam bibit baru", plot.PlantName)
		}
		return nil, fmt.Errorf("lahan Anda sedang ditanami '%s' (fase %s). Panen terlebih dahulu sebelum menanam bibit baru", plot.PlantName, plot.Stage)
	}

	// Update plot with new seed
	plot.PlantType = seed.PlantType
	plot.PlantName = seed.PlantName
	plot.CurrentWater = 0
	plot.TargetWater = seed.TargetWater
	plot.Stage = "seed"
	plot.Health = 100
	plot.PlantedAt = time.Now()
	plot.LastWateredAt = nil
	plot.HarvestRewardType = seed.RewardType
	plot.HarvestRewardValue = seed.RewardValue
	plot.HarvestRewardTitle = seed.RewardTitle

	if err := db.Save(&plot).Error; err != nil {
		return nil, fmt.Errorf("gagal memperbarui lahan tanam: %w", err)
	}

	return &plot, nil
}

// WaterPlant consumes 10 droplets from water tank, adds 10 water to plant, recalculates stage and pet happiness
func (s *FarmService) WaterPlant(userID string) (*models.WaterPlantResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	// 1. Fetch tank and regenerate droplets
	var tank models.FarmWaterTank
	if err := db.Where("user_id = ?", userID).First(&tank).Error; err != nil {
		return nil, fmt.Errorf("tangki air belum tersedia")
	}
	s.RegenerateWater(&tank)

	const waterCost = 10
	if tank.WaterDroplets < waterCost {
		return nil, fmt.Errorf("tetesan air tidak cukup (sisa %d tetes). Minimal butuh %d tetes untuk menyiram. Tunggu regenerasi air atau minta bantuan sahabat!", tank.WaterDroplets, waterCost)
	}

	// 2. Fetch plot
	var plot models.UserFarmPlot
	if err := db.Where("user_id = ?", userID).First(&plot).Error; err != nil {
		return nil, fmt.Errorf("lahan tanaman belum tersedia")
	}

	if plot.PlantType == "" || plot.Stage == "empty" {
		return nil, fmt.Errorf("belum ada bibit yang ditanam. Pilih bibit herbal terlebih dahulu!")
	}

	if plot.Stage == "harvest_ready" {
		return nil, fmt.Errorf("tanaman sudah mekar sempurna dan siap dipanen! Silakan klik tombol Panen")
	}

	// 3. Deduct water from tank
	tank.WaterDroplets -= waterCost
	tank.TotalWaterGiven += waterCost

	// 4. Add water to plot
	plot.CurrentWater += waterCost
	if plot.CurrentWater > plot.TargetWater {
		plot.CurrentWater = plot.TargetWater
	}

	oldStage := plot.Stage
	plot.Stage = CalculateStage(plot.CurrentWater, plot.TargetWater)
	stageChanged := (oldStage != plot.Stage)
	now := time.Now()
	plot.LastWateredAt = &now

	// 5. Update pet happiness
	var pet models.FarmPet
	if err := db.Where("user_id = ?", userID).First(&pet).Error; err == nil {
		pet.Happiness += 5
		if pet.Happiness > 100 {
			pet.Happiness = 100
		}
		db.Save(&pet)
	}

	// 6. Save in transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&tank).Error; err != nil {
			return err
		}
		if err := tx.Save(&plot).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("gagal memproses penyiraman tanaman: %w", err)
	}

	msg := fmt.Sprintf("Berhasil menyiram tanaman (+%d tetes). Progres: %d/%d tetes.", waterCost, plot.CurrentWater, plot.TargetWater)
	if plot.Stage == "harvest_ready" {
		msg = "Hore! Tanaman telah matang sempurna dan siap dipanen! 🎉🍯"
	} else if stageChanged {
		msg = fmt.Sprintf("Selamat! Tanaman Anda berkembang ke fase '%s'! 🌱✨", plot.Stage)
	}

	return &models.WaterPlantResult{
		Plot:         &plot,
		WaterTank:    &tank,
		Pet:          &pet,
		WaterAdded:   waterCost,
		StageChanged: stageChanged,
		NewStage:     plot.Stage,
		Message:      msg,
	}, nil
}

// HarvestPlant verifies harvest_ready, gives reward via ACID transaction, logs harvest, and resets plot
func (s *FarmService) HarvestPlant(userID string) (*models.FarmHarvestLog, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	var plot models.UserFarmPlot
	if err := db.Where("user_id = ?", userID).First(&plot).Error; err != nil {
		return nil, fmt.Errorf("lahan tanaman tidak ditemukan")
	}

	if plot.Stage != "harvest_ready" {
		return nil, fmt.Errorf("tanaman belum siap panen (fase: %s, progres: %d/%d tetes)", plot.Stage, plot.CurrentWater, plot.TargetWater)
	}

	var harvestLog models.FarmHarvestLog
	var voucherCode string
	var walletBonus float64

	// Execute ACID Transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		now := time.Now()

		if plot.HarvestRewardType == "wallet_cash" {
			walletBonus = plot.HarvestRewardValue

			// Credit user wallet
			var wallet models.Wallet
			if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
				wallet = models.Wallet{
					ID:      uuid.New().String(),
					UserID:  userID,
					Balance: 0,
				}
				if err := tx.Create(&wallet).Error; err != nil {
					return fmt.Errorf("failed to create wallet: %w", err)
				}
			}

			wallet.Balance += walletBonus
			if err := tx.Save(&wallet).Error; err != nil {
				return fmt.Errorf("failed to credit wallet balance: %w", err)
			}

			// Record wallet transaction ledger
			wt := models.WalletTransaction{
				ID:              uuid.New().String(),
				UserID:          userID,
				Type:            "credit",
				Amount:          walletBonus,
				BalanceAfter:    wallet.Balance,
				Description:     fmt.Sprintf("Bonus Panen Kebun Herbal: %s", plot.HarvestRewardTitle),
				TransactionDate: now,
				CreatedAt:       now,
			}
			if err := tx.Create(&wt).Error; err != nil {
				return fmt.Errorf("failed to record wallet transaction: %w", err)
			}
		} else {
			// Generate promotional voucher code
			prefix := strings.ToUpper(strings.ReplaceAll(plot.PlantType, "_", "-"))
			randomToken := fmt.Sprintf("%04d", rand.Intn(10000))
			voucherCode = fmt.Sprintf("PANEN-%s-%s", prefix, randomToken)
		}

		// Create Harvest Log
		harvestLog = models.FarmHarvestLog{
			ID:          uuid.New().String(),
			UserID:      userID,
			PlantType:   plot.PlantType,
			RewardTitle: plot.HarvestRewardTitle,
			VoucherCode: voucherCode,
			WalletBonus: walletBonus,
			CreatedAt:   now,
		}
		if err := tx.Create(&harvestLog).Error; err != nil {
			return fmt.Errorf("failed to create harvest log: %w", err)
		}

		// Update total harvests counter in tank
		tx.Model(&models.FarmWaterTank{}).Where("user_id = ?", userID).Update("total_harvests", gorm.Expr("total_harvests + 1"))

		// Reset plot to empty
		plot.PlantType = ""
		plot.PlantName = ""
		plot.CurrentWater = 0
		plot.TargetWater = 0
		plot.Stage = "empty"
		plot.Health = 100
		plot.HarvestRewardType = ""
		plot.HarvestRewardValue = 0
		plot.HarvestRewardTitle = ""
		plot.PlantedAt = time.Time{}
		plot.LastWateredAt = nil

		if err := tx.Save(&plot).Error; err != nil {
			return fmt.Errorf("failed to reset plant plot: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("proses panen gagal: %w", err)
	}

	// Dispatch notification to user
	notifMsg := fmt.Sprintf("Selamat! Anda berhasil memanen %s dan memperoleh hadiah: %s", harvestLog.PlantType, harvestLog.RewardTitle)
	if voucherCode != "" {
		notifMsg = fmt.Sprintf("Kode voucher belanja Anda: %s (Gunakan saat checkout e-commerce)", voucherCode)
	}
	sendNotification(db, userID, "Panen Raya Kebun Herbal Berhasil! 🍯🌾", notifMsg, "farm", "/farm")

	return &harvestLog, nil
}

// FeedPet increases pet happiness to 100, grants +15 bonus water droplets
func (s *FarmService) FeedPet(userID string) (*models.FarmPet, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	var pet models.FarmPet
	if err := db.Where("user_id = ?", userID).First(&pet).Error; err != nil {
		return nil, fmt.Errorf("hewan peliharaan belum tersedia")
	}

	// Cooldown safety: if happiness is 100 and fed less than 15 minutes ago
	if pet.Happiness >= 100 && pet.LastFedAt != nil && time.Since(*pet.LastFedAt) < 15*time.Minute {
		return nil, fmt.Errorf("lebah Trigona Anda masih kenyang dan bahagia! Beri makan lagi dalam beberapa saat")
	}

	now := time.Now()
	pet.Happiness = 100
	pet.LastFedAt = &now
	if pet.Level < 10 && rand.Float32() < 0.25 {
		pet.Level += 1
	}

	// Award +15 water droplets to water tank
	var tank models.FarmWaterTank
	if err := db.Where("user_id = ?", userID).First(&tank).Error; err == nil {
		s.RegenerateWater(&tank)
		tank.WaterDroplets += 15
		if tank.WaterDroplets > 100 {
			tank.WaterDroplets = 100
		}
		db.Save(&tank)
	}

	if err := db.Save(&pet).Error; err != nil {
		return nil, fmt.Errorf("gagal memberi makan peliharaan: %w", err)
	}

	return &pet, nil
}

// GetFarmFriends returns downline and upline users with their current farm crop and watering status
func (s *FarmService) GetFarmFriends(userID string) ([]models.FarmFriendInfo, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.getFarmFriendsInternal(userID)
}

func (s *FarmService) getFarmFriendsInternal(userID string) ([]models.FarmFriendInfo, error) {
	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	todayStr := time.Now().Format("2006-01-02")
	friendMap := make(map[string]string) // friendID -> relationship

	// 1. Check uplines (sponsor / network upline)
	var sponsor models.Sponsor
	if err := db.Where("user_id = ?", userID).First(&sponsor).Error; err == nil && sponsor.SponsorID != "" && sponsor.SponsorID != userID {
		friendMap[sponsor.SponsorID] = "Upline Sponsor"
	}

	var netPos models.NetworkPosition
	if err := db.Where("user_id = ?", userID).First(&netPos).Error; err == nil && netPos.UplineID != "" && netPos.UplineID != userID {
		friendMap[netPos.UplineID] = "Upline Binary"
	}

	// 2. Check downlines (sponsor / network downlines)
	var downSponsors []models.Sponsor
	db.Where("sponsor_id = ?", userID).Limit(15).Find(&downSponsors)
	for _, ds := range downSponsors {
		if ds.UserID != "" && ds.UserID != userID {
			friendMap[ds.UserID] = "Mitra Downline"
		}
	}

	var downNets []models.NetworkPosition
	db.Where("upline_id = ?", userID).Limit(15).Find(&downNets)
	for _, dn := range downNets {
		if dn.UserID != "" && dn.UserID != userID {
			friendMap[dn.UserID] = "Mitra Downline"
		}
	}

	// 3. Fallback: if user has fewer than 5 friends, add other active members for lively community
	if len(friendMap) < 5 {
		var activeUsers []models.User
		db.Where("status = ? AND id != ?", "active", userID).Order("created_at desc").Limit(8).Find(&activeUsers)
		for _, u := range activeUsers {
			if _, exists := friendMap[u.ID]; !exists {
				friendMap[u.ID] = "Rekan Komunitas Bionet"
			}
		}
	}

	// 4. Assemble friends details
	var result []models.FarmFriendInfo
	for friendID, rel := range friendMap {
		var user models.User
		if err := db.Where("id = ?", friendID).First(&user).Error; err != nil {
			continue
		}

		var friendPlot models.UserFarmPlot
		hasPlot := false
		if err := db.Where("user_id = ?", friendID).First(&friendPlot).Error; err == nil {
			hasPlot = true
		}

		// Check if helper has watered this friend today
		var visitCount int64
		db.Model(&models.FarmFriendVisit{}).
			Where("helper_user_id = ? AND target_user_id = ? AND action_date = ?", userID, friendID, todayStr).
			Count(&visitCount)

		hasWatered := visitCount > 0
		canWater := !hasWatered && hasPlot && friendPlot.PlantType != "" && friendPlot.Stage != "empty" && friendPlot.Stage != "harvest_ready"

		var plotPtr *models.UserFarmPlot
		plantName := ""
		stage := ""
		if hasPlot {
			plotPtr = &friendPlot
			plantName = friendPlot.PlantName
			stage = friendPlot.Stage
		}

		result = append(result, models.FarmFriendInfo{
			ID:              user.ID,
			UserID:          user.ID,
			Username:        user.Username,
			FullName:        user.FullName,
			Avatar:          user.Avatar,
			Relationship:    rel,
			PlantName:       plantName,
			Stage:           stage,
			CurrentPlant:    plotPtr,
			HasWateredToday: hasWatered,
			HelpedToday:     hasWatered,
			CanWater:        canWater,
		})
	}

	return result, nil
}

// HelpWaterFriend assists a friend's herbal garden once per day, giving friend +10 water & helper +15 droplets
func (s *FarmService) HelpWaterFriend(helperID, targetID string) (*models.HelpWaterResult, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	if helperID == targetID {
		return nil, fmt.Errorf("anda tidak dapat menyiram kebun Anda sendiri lewat menu bantuan teman")
	}

	todayStr := time.Now().Format("2006-01-02")

	// 1. Anti-spam check: max 1x per target friend per day
	var existingVisit models.FarmFriendVisit
	if err := db.Where("helper_user_id = ? AND target_user_id = ? AND action_date = ?", helperID, targetID, todayStr).First(&existingVisit).Error; err == nil {
		return nil, fmt.Errorf("anda sudah menyiram kebun sahabat ini hari ini. Coba lagi besok!")
	}

	// 2. Fetch target friend's plot
	var targetPlot models.UserFarmPlot
	if err := db.Where("user_id = ?", targetID).First(&targetPlot).Error; err != nil {
		return nil, fmt.Errorf("sahabat Anda belum memiliki kebun herbal aktif")
	}

	if targetPlot.PlantType == "" || targetPlot.Stage == "empty" {
		return nil, fmt.Errorf("sahabat Anda belum menanam bibit herbal di kebunnya")
	}

	if targetPlot.Stage == "harvest_ready" {
		return nil, fmt.Errorf("tanaman sahabat Anda sudah mekar sempurna dan siap dipanen")
	}

	// 3. Water the friend's plot (+10 water)
	const friendWaterBonus = 10
	targetPlot.CurrentWater += friendWaterBonus
	if targetPlot.CurrentWater > targetPlot.TargetWater {
		targetPlot.CurrentWater = targetPlot.TargetWater
	}
	targetPlot.Stage = CalculateStage(targetPlot.CurrentWater, targetPlot.TargetWater)
	now := time.Now()
	targetPlot.LastWateredAt = &now

	// 4. Award helper +15 water droplets
	const helperDropletReward = 15
	var helperTank models.FarmWaterTank
	if err := db.Where("user_id = ?", helperID).First(&helperTank).Error; err == nil {
		s.RegenerateWater(&helperTank)
		helperTank.WaterDroplets += helperDropletReward
		if helperTank.WaterDroplets > 100 {
			helperTank.WaterDroplets = 100
		}
	}

	// 5. Save visit and updates in transaction
	err := db.Transaction(func(tx *gorm.DB) error {
		visit := models.FarmFriendVisit{
			ID:           uuid.New().String(),
			HelperUserID: helperID,
			TargetUserID: targetID,
			ActionDate:   todayStr,
			CreatedAt:    now,
		}
		if err := tx.Create(&visit).Error; err != nil {
			return err
		}
		if err := tx.Save(&targetPlot).Error; err != nil {
			return err
		}
		if helperTank.UserID != "" {
			if err := tx.Save(&helperTank).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("gagal membantu menyiram kebun sahabat: %w", err)
	}

	// 6. Send notification to target friend
	var helperUser models.User
	db.Where("id = ?", helperID).First(&helperUser)
	helperName := helperUser.FullName
	if helperName == "" {
		helperName = helperUser.Username
	}

	var targetUser models.User
	db.Where("id = ?", targetID).First(&targetUser)

	notifTitle := "Kebun Herbal Disiram Sahabat! 💧🌸"
	notifMsg := fmt.Sprintf("Sahabat Anda %s telah menyiram kebun herbal Anda (+%d tetes air)! Tanaman Anda tumbuh semakin subur.", helperName, friendWaterBonus)
	sendNotification(db, targetID, notifTitle, notifMsg, "farm", "/farm")

	return &models.HelpWaterResult{
		Success:         true,
		WaterGiven:      friendWaterBonus,
		DropletsAwarded: helperDropletReward,
		Message:         fmt.Sprintf("Berhasil menyiram tanaman sahabat %s! Anda memperoleh bonus +%d tetes air.", targetUser.Username, helperDropletReward),
		FriendUsername:  targetUser.Username,
	}, nil
}

// ClaimDailyWaterBonus grants +30 water droplets once per day
func (s *FarmService) ClaimDailyWaterBonus(userID string) (*models.FarmWaterTank, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	db := s.getDB()
	if db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	var tank models.FarmWaterTank
	if err := db.Where("user_id = ?", userID).First(&tank).Error; err != nil {
		tank = models.FarmWaterTank{
			UserID:        userID,
			WaterDroplets: 100,
			LastRegenAt:   time.Now(),
		}
		if err := db.Create(&tank).Error; err != nil {
			return nil, fmt.Errorf("gagal membuat tangki air: %w", err)
		}
	} else {
		s.RegenerateWater(&tank)
	}

	todayStr := time.Now().Format("2006-01-02")
	if tank.LastDailyBonusAt != nil && tank.LastDailyBonusAt.Format("2006-01-02") == todayStr {
		return nil, fmt.Errorf("bonus tetesan air harian sudah Anda klaim hari ini. Silakan kembali lagi besok!")
	}

	const bonusDroplets = 30
	tank.WaterDroplets += bonusDroplets
	if tank.WaterDroplets > 100 {
		tank.WaterDroplets = 100
	}
	now := time.Now()
	tank.LastDailyBonusAt = &now

	if err := db.Save(&tank).Error; err != nil {
		return nil, fmt.Errorf("gagal mengklaim bonus harian: %w", err)
	}

	return &tank, nil
}

func sendNotification(db *gorm.DB, userID, title, message, notifType, link string) {
	if db == nil || userID == "" {
		return
	}
	notif := models.Notification{
		ID:        uuid.New().String(),
		UserID:    userID,
		Title:     title,
		Message:   message,
		Type:      notifType,
		Link:      link,
		IsRead:    false,
		CreatedAt: time.Now(),
	}
	_ = db.Create(&notif)
}
