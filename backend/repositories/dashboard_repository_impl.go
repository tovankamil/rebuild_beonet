package repositories

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"bionet-backend/interfaces"
	"bionet-backend/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type dashboardRepositoryImpl struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) interfaces.DashboardRepository {
	return &dashboardRepositoryImpl{db: db}
}

func (r *dashboardRepositoryImpl) GetStats(userID string) (*models.DashboardStatsResponse, error) {
	var user models.User
	if err := r.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}

	// 1. Wallet Balance
	var wallet models.Wallet
	var balance float64 = 0.0
	if err := r.db.Where("user_id = ?", userID).First(&wallet).Error; err == nil {
		balance = wallet.Balance
	}

	// 2. Point Balance
	var point models.PointBalance
	var pointLeft, pointRight float64 = 0.0, 0.0
	if err := r.db.Where("user_id = ?", userID).First(&point).Error; err == nil {
		pointLeft = point.PointLeft
		pointRight = point.PointRight
	}

	// 3. Total Bonus This Month
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	var totalBonusMonth float64 = 0.0
	r.db.Model(&models.WalletTransaction{}).
		Where("user_id = ? AND type = ? AND transaction_date >= ?", userID, "credit", startOfMonth).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalBonusMonth)

	// 4. Direct Referrals Count
	var directCount int64 = 0
	r.db.Model(&models.Sponsor{}).Where("sponsor_id = ?", userID).Count(&directCount)

	// 5. Total Network Count (from upline_paths)
	var networkCount int64 = 0
	r.db.Model(&models.UplinePath{}).Where("ancestor_id = ? AND level > 0", userID).Count(&networkCount)

	// 6. Recent Transactions (last 5)
	var recentTransactions []models.WalletTransaction
	r.db.Where("user_id = ?", userID).Order("transaction_date DESC").Limit(5).Find(&recentTransactions)

	// 7. Bank Info
	var bank models.UserBank
	var bankPtr *models.UserBank
	if err := r.db.Where("user_id = ?", userID).Order("is_primary DESC").First(&bank).Error; err == nil {
		bankPtr = &bank
	}

	return &models.DashboardStatsResponse{
		User:                 user,
		WalletBalance:        balance,
		PointLeft:            pointLeft,
		PointRight:           pointRight,
		TotalBonusMonth:      totalBonusMonth,
		DirectReferralsCount: directCount,
		TotalNetworkCount:    networkCount,
		RecentTransactions:   recentTransactions,
		Bank:                 bankPtr,
	}, nil
}

func (r *dashboardRepositoryImpl) buildTreeNode(userID string, position string, currentDepth int, maxDepth int) *models.BinaryNode {
	if currentDepth > maxDepth || userID == "" {
		return nil
	}

	var user models.User
	if err := r.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil
	}

	var pt models.PointBalance
	var ptLeft, ptRight float64 = 0.0, 0.0
	if err := r.db.Where("user_id = ?", userID).First(&pt).Error; err == nil {
		ptLeft = pt.PointLeft
		ptRight = pt.PointRight
	}

	var np models.NetworkPosition
	var uplineIDPtr, uplineUserPtr *string
	if err := r.db.Where("user_id = ?", userID).Preload("UplineUser").First(&np).Error; err == nil {
		uplineIDPtr = &np.UplineID
		if np.UplineUser != nil {
			uplineUserPtr = &np.UplineUser.Username
		}
	}

	node := &models.BinaryNode{
		ID:             user.ID,
		Username:       user.Username,
		FullName:       user.FullName,
		Position:       position,
		Status:         user.Status,
		PointLeft:      ptLeft,
		PointRight:     ptRight,
		UplineID:       uplineIDPtr,
		UplineUsername: uplineUserPtr,
	}

	if currentDepth < maxDepth {
		var leftPos models.NetworkPosition
		if err := r.db.Where("upline_id = ? AND position = ?", userID, "kiri").First(&leftPos).Error; err == nil {
			node.LeftNode = r.buildTreeNode(leftPos.UserID, "kiri", currentDepth+1, maxDepth)
		}

		var rightPos models.NetworkPosition
		if err := r.db.Where("upline_id = ? AND position = ?", userID, "kanan").First(&rightPos).Error; err == nil {
			node.RightNode = r.buildTreeNode(rightPos.UserID, "kanan", currentDepth+1, maxDepth)
		}
	}

	return node
}

func (r *dashboardRepositoryImpl) GetGenealogy(userID string, targetIdentifier string) (*models.BinaryNode, error) {
	rootID := userID

	if targetIdentifier != "" && targetIdentifier != userID {
		var targetUser models.User
		if err := r.db.Where("id = ? OR username = ?", targetIdentifier, targetIdentifier).First(&targetUser).Error; err != nil {
			return nil, errors.New("member target tidak ditemukan")
		}

		if targetUser.ID != userID {
			var loggedInUser models.User
			if err := r.db.Where("id = ?", userID).First(&loggedInUser).Error; err != nil {
				return nil, errors.New("user autentikasi tidak valid")
			}

			// Admin berhak melihat seluruh jaringan; member hanya berhak melihat dirinya & downline-nya
			if loggedInUser.Role != "admin" {
				var count int64
				r.db.Model(&models.UplinePath{}).
					Where("ancestor_id = ? AND descendant_id = ?", userID, targetUser.ID).
					Count(&count)
				if count == 0 {
					return nil, errors.New("akses ditolak: Anda hanya berhak melihat struktur jaringan diri sendiri dan member downline Anda")
				}
			}

			rootID = targetUser.ID
		}
	}

	tree := r.buildTreeNode(rootID, "root", 1, 3)
	return tree, nil
}

func (r *dashboardRepositoryImpl) GetDirectReferrals(userID string) ([]models.ReferralItem, error) {
	type Result struct {
		ID        string
		Username  string
		FullName  string
		Phone     *string
		Status    string
		CreatedAt time.Time
	}

	var rawResults []Result
	err := r.db.Table("sponsors").
		Select("users.id, users.username, users.full_name, users.phone, users.status, users.created_at").
		Joins("JOIN users ON users.id = sponsors.user_id").
		Where("sponsors.sponsor_id = ?", userID).
		Order("users.created_at DESC").
		Scan(&rawResults).Error

	if err != nil {
		return nil, err
	}

	referrals := make([]models.ReferralItem, 0, len(rawResults))
	for _, res := range rawResults {
		phone := ""
		if res.Phone != nil {
			phone = *res.Phone
		}
		referrals = append(referrals, models.ReferralItem{
			ID:        res.ID,
			Username:  res.Username,
			FullName:  res.FullName,
			Phone:     phone,
			Status:    res.Status,
			CreatedAt: res.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	return referrals, nil
}

func (r *dashboardRepositoryImpl) GetWalletTransactions(userID string) ([]models.WalletTransaction, error) {
	var list []models.WalletTransaction
	err := r.db.Where("user_id = ?", userID).Order("transaction_date DESC").Limit(50).Find(&list).Error
	return list, err
}

func (r *dashboardRepositoryImpl) GetUserBank(userID string) (*models.UserBank, error) {
	var bank models.UserBank
	err := r.db.Where("user_id = ?", userID).Order("is_primary DESC").First(&bank).Error
	if err != nil {
		return nil, err
	}
	return &bank, nil
}

func (r *dashboardRepositoryImpl) SaveUserBank(bank *models.UserBank) error {
	var existing models.UserBank
	if err := r.db.Where("user_id = ?", bank.UserID).First(&existing).Error; err == nil {
		existing.BankName = bank.BankName
		existing.AccountNumber = bank.AccountNumber
		existing.AccountName = bank.AccountName
		existing.IsPrimary = true
		return r.db.Save(&existing).Error
	}
	return r.db.Create(bank).Error
}

// ----------------------------------------------------
// WITHDRAWALS IMPLEMENTATION
// ----------------------------------------------------

func (r *dashboardRepositoryImpl) RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error) {
	if amount < 50000 {
		return nil, errors.New("minimal penarikan dana adalah Rp 50.000")
	}

	var wd *models.Withdrawal

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Cek Rekening Bank
		var bank models.UserBank
		if err := tx.Where("user_id = ?", userID).Order("is_primary DESC").First(&bank).Error; err != nil {
			return errors.New("silakan lengkapi rekening bank tujuan pencairan terlebih dahulu")
		}

		// 2. Cek Saldo Dompet
		var wallet models.Wallet
		if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil || wallet.Balance < amount {
			return errors.New("saldo dompet tidak mencukupi untuk melakukan penarikan ini")
		}

		adminFee := 5000.0 // Biaya admin penarikan standar
		netAmount := amount - adminFee
		if netAmount <= 0 {
			return errors.New("nominal penarikan setelah biaya admin tidak valid")
		}

		// 3. Potong Saldo
		newBalance := wallet.Balance - amount
		if err := tx.Model(&wallet).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// 4. Catat Mutasi Debit
		txLog := models.WalletTransaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Type:         "debit",
			Amount:       amount,
			BalanceAfter: newBalance,
			Description:  fmt.Sprintf("Penarikan Saldo (Withdrawal ke %s - %s)", bank.BankName, bank.AccountNumber),
		}
		if err := tx.Create(&txLog).Error; err != nil {
			return err
		}

		// 5. Catat Permintaan Withdrawal
		withdrawalRecord := models.Withdrawal{
			ID:        uuid.New().String(),
			UserID:    userID,
			BankID:    &bank.ID,
			Amount:    amount,
			AdminFee:  adminFee,
			NetAmount: netAmount,
			Status:    "pending",
		}
		if err := tx.Create(&withdrawalRecord).Error; err != nil {
			return err
		}

		withdrawalRecord.Bank = &bank
		wd = &withdrawalRecord
		return nil
	})

	return wd, err
}

func (r *dashboardRepositoryImpl) GetWithdrawals(userID string) ([]models.Withdrawal, error) {
	var list []models.Withdrawal
	err := r.db.Preload("Bank").Where("user_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

// ----------------------------------------------------
// PINS IMPLEMENTATION
// ----------------------------------------------------

func (r *dashboardRepositoryImpl) GetMyPins(userID string) ([]models.Pin, error) {
	var list []models.Pin
	err := r.db.Preload("Package").Where("owner_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *dashboardRepositoryImpl) GetPinPackages() ([]models.PinPackage, error) {
	var list []models.PinPackage
	err := r.db.Where("is_active = ?", true).Order("price ASC").Find(&list).Error
	return list, err
}

func (r *dashboardRepositoryImpl) TransferPin(fromUserID string, pinID string, targetUsername string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var pin models.Pin
		if err := tx.Where("id = ? AND owner_id = ? AND status = 'active'", pinID, fromUserID).First(&pin).Error; err != nil {
			return errors.New("PIN tidak ditemukan atau sudah tidak aktif")
		}

		var targetUser models.User
		if err := tx.Where("username = ?", targetUsername).First(&targetUser).Error; err != nil {
			return errors.New("username tujuan transfer tidak ditemukan")
		}

		if targetUser.ID == fromUserID {
			return errors.New("tidak dapat mentransfer PIN ke akun sendiri")
		}

		// Transfer
		if err := tx.Model(&pin).Update("owner_id", targetUser.ID).Error; err != nil {
			return err
		}

		transferRecord := models.PinTransfer{
			ID:         uuid.New().String(),
			PinID:      pin.ID,
			FromUserID: fromUserID,
			ToUserID:   targetUser.ID,
		}
		return tx.Create(&transferRecord).Error
	})
}

// ----------------------------------------------------
// PRODUCTS IMPLEMENTATION
// ----------------------------------------------------

func (r *dashboardRepositoryImpl) GetProducts() ([]models.Product, error) {
	var list []models.Product
	err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&list).Error
	return list, err
}

func addPointBalance(tx *gorm.DB, userID string, points float64, position string) error {
	if points <= 0 {
		return nil
	}
	var pb models.PointBalance
	if err := tx.Where("user_id = ?", userID).First(&pb).Error; err != nil {
		pb = models.PointBalance{
			ID:         uuid.New().String(),
			UserID:     userID,
			PointLeft:  0,
			PointRight: 0,
		}
		if position == "kiri" {
			pb.PointLeft = points
		} else {
			pb.PointRight = points
		}
		return tx.Create(&pb).Error
	}
	if position == "kiri" {
		return tx.Model(&pb).Update("point_left", pb.PointLeft+points).Error
	}
	return tx.Model(&pb).Update("point_right", pb.PointRight+points).Error
}

func (r *dashboardRepositoryImpl) RegisterDownline(sponsorUserID string, req models.RegisterDownlineRequest) (*models.RegisterDownlineResponse, error) {
	req.Position = strings.ToLower(strings.TrimSpace(req.Position))
	if req.Position != "kiri" && req.Position != "kanan" {
		return nil, errors.New("posisi binary tidak valid, harus 'kiri' atau 'kanan'")
	}

	username := strings.ToLower(strings.TrimSpace(req.Username))
	if len(username) < 4 {
		return nil, errors.New("username minimal 4 karakter")
	}

	fullName := strings.TrimSpace(req.FullName)
	if fullName == "" {
		return nil, errors.New("nama lengkap tidak boleh kosong")
	}

	if len(req.Password) < 6 {
		return nil, errors.New("kata sandi minimal 6 karakter")
	}

	var response *models.RegisterDownlineResponse

	err := r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Validasi Serial PIN milik sponsor
		var pin models.Pin
		if err := tx.Preload("Package").Where("id = ? AND owner_id = ? AND status = 'active'", req.PinID, sponsorUserID).First(&pin).Error; err != nil {
			return errors.New("serial PIN tidak valid, sudah digunakan, atau bukan milik Anda")
		}
		if pin.Package == nil {
			return errors.New("data paket PIN aktivasi tidak ditemukan")
		}

		// 2. Validasi Upline
		var upline models.User
		if err := tx.Where("id = ? AND status = 'active'", req.UplineID).First(&upline).Error; err != nil {
			return errors.New("upline tidak ditemukan atau akun sedang tidak aktif")
		}

		// Security Check: Upline harus sponsor itu sendiri atau berada di bawah pohon binary sponsor
		if upline.ID != sponsorUserID {
			var uplineCheck int64
			tx.Model(&models.UplinePath{}).Where("ancestor_id = ? AND descendant_id = ?", sponsorUserID, upline.ID).Count(&uplineCheck)
			if uplineCheck == 0 {
				return errors.New("upline yang dipilih berada di luar jaringan binary Anda")
			}
		}

		// 3. Validasi Slot Posisi Upline (apakah slot kiri/kanan sudah terisi)
		var existingSlot models.NetworkPosition
		if err := tx.Where("upline_id = ? AND position = ?", req.UplineID, req.Position).First(&existingSlot).Error; err == nil {
			return fmt.Errorf("slot kaki %s di bawah upline @%s sudah terisi oleh mitra lain", req.Position, upline.Username)
		}

		// 4. Validasi Username Unik
		var existingUser models.User
		if err := tx.Where("username = ?", username).First(&existingUser).Error; err == nil {
			return fmt.Errorf("username '@%s' sudah digunakan, silakan pilih username lain", username)
		}

		// 5. Enkripsi Password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return errors.New("gagal memproses enkripsi kata sandi")
		}

		// 6. Buat Akun User Baru
		now := time.Now()
		newUserID := uuid.New().String()
		newUser := models.User{
			ID:           newUserID,
			Username:     username,
			FullName:     fullName,
			PasswordHash: string(hashedPassword),
			Role:         "member",
			Status:       "active",
			KTP:          strings.TrimSpace(req.KTP),
			CreatedAt:    now,
			UpdatedAt:    now,
		}
		if req.Phone != "" {
			phoneClean := strings.TrimSpace(req.Phone)
			newUser.Phone = &phoneClean
		}
		if err := tx.Create(&newUser).Error; err != nil {
			return err
		}

		// 7. Buat Wallet Baru
		newWallet := models.Wallet{
			ID:      uuid.New().String(),
			UserID:  newUserID,
			Balance: 0.00,
		}
		if err := tx.Create(&newWallet).Error; err != nil {
			return err
		}

		// 8. Buat PointBalance Baru
		newPoint := models.PointBalance{
			ID:         uuid.New().String(),
			UserID:     newUserID,
			PointLeft:  0.00,
			PointRight: 0.00,
		}
		if err := tx.Create(&newPoint).Error; err != nil {
			return err
		}

		// 9. Kaitkan Direct Sponsor & Sponsor Paths (Closure Table)
		directSponsor := models.Sponsor{
			ID:        uuid.New().String(),
			UserID:    newUserID,
			SponsorID: sponsorUserID,
		}
		if err := tx.Create(&directSponsor).Error; err != nil {
			return err
		}

		// Self path sponsor
		if err := tx.Create(&models.SponsorPath{
			ID:           uuid.New().String(),
			AncestorID:   newUserID,
			DescendantID: newUserID,
			Level:        0,
		}).Error; err != nil {
			return err
		}

		// Direct sponsor path (Level 1)
		if err := tx.Create(&models.SponsorPath{
			ID:           uuid.New().String(),
			AncestorID:   sponsorUserID,
			DescendantID: newUserID,
			Level:        1,
		}).Error; err != nil {
			return err
		}

		// Copy higher ancestors from sponsor
		var sponsorAncestors []models.SponsorPath
		tx.Where("descendant_id = ? AND level > 0", sponsorUserID).Find(&sponsorAncestors)
		for _, sa := range sponsorAncestors {
			tx.Create(&models.SponsorPath{
				ID:           uuid.New().String(),
				AncestorID:   sa.AncestorID,
				DescendantID: newUserID,
				Level:        sa.Level + 1,
			})
		}

		// 10. Kaitkan NetworkPosition (Direct Upline & Placement)
		netPos := models.NetworkPosition{
			ID:       uuid.New().String(),
			UserID:   newUserID,
			UplineID: upline.ID,
			Position: req.Position,
		}
		if err := tx.Create(&netPos).Error; err != nil {
			return err
		}

		// 11. Kaitkan UplinePath (Closure Table for Binary Hierarchy)
		// Self path
		if err := tx.Create(&models.UplinePath{
			ID:           uuid.New().String(),
			AncestorID:   newUserID,
			DescendantID: newUserID,
			Level:        0,
			PathPosition: nil,
		}).Error; err != nil {
			return err
		}

		// Direct upline path (Level 1)
		directPos := req.Position
		if err := tx.Create(&models.UplinePath{
			ID:           uuid.New().String(),
			AncestorID:   upline.ID,
			DescendantID: newUserID,
			Level:        1,
			PathPosition: &directPos,
		}).Error; err != nil {
			return err
		}

		// Copy higher ancestors from upline
		var uplineAncestors []models.UplinePath
		tx.Where("descendant_id = ? AND level > 0", upline.ID).Find(&uplineAncestors)
		for _, ua := range uplineAncestors {
			tx.Create(&models.UplinePath{
				ID:           uuid.New().String(),
				AncestorID:   ua.AncestorID,
				DescendantID: newUserID,
				Level:        ua.Level + 1,
				PathPosition: ua.PathPosition, // Inherits root branch direction
			})
		}

		// 12. Propagate Binary Volume Points to all ancestors!
		pointsToAdd := pin.Package.Points
		if pointsToAdd > 0 {
			// Update direct upline
			if err := addPointBalance(tx, upline.ID, pointsToAdd, req.Position); err != nil {
				return err
			}

			// Update all higher ancestors
			for _, ua := range uplineAncestors {
				if ua.PathPosition != nil {
					if err := addPointBalance(tx, ua.AncestorID, pointsToAdd, *ua.PathPosition); err != nil {
						return err
					}
				}
			}
		}

		// 13. Credit Sponsor Commission Bonus to Sponsor Wallet
		sponsorBonus := pin.Package.SponsorBonus
		var updatedSponsorBalance float64 = 0.0
		var sponsorWallet models.Wallet
		if err := tx.Where("user_id = ?", sponsorUserID).First(&sponsorWallet).Error; err != nil {
			sponsorWallet = models.Wallet{
				ID:      uuid.New().String(),
				UserID:  sponsorUserID,
				Balance: 0.00,
			}
			tx.Create(&sponsorWallet)
		}

		if sponsorBonus > 0 {
			newBal := sponsorWallet.Balance + sponsorBonus
			if err := tx.Model(&sponsorWallet).Update("balance", newBal).Error; err != nil {
				return err
			}
			updatedSponsorBalance = newBal

			// Log Wallet Transaction
			txLog := models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       sponsorUserID,
				Type:         "credit",
				Amount:       sponsorBonus,
				BalanceAfter: newBal,
				Description:  fmt.Sprintf("Bonus Sponsor Pendaftaran Mitra Baru @%s (%s)", username, pin.Package.Name),
			}
			if err := tx.Create(&txLog).Error; err != nil {
				return err
			}
		} else {
			updatedSponsorBalance = sponsorWallet.Balance
		}

		// 14. Update Status PIN to 'used'
		if err := tx.Model(&pin).Updates(map[string]interface{}{
			"status":     "used",
			"used_by_id": newUserID,
			"used_at":    now,
		}).Error; err != nil {
			return err
		}

		response = &models.RegisterDownlineResponse{
			User:          newUser,
			Pin:           pin,
			Position:      req.Position,
			Upline:        upline,
			SponsorBonus:  sponsorBonus,
			PointsAwarded: pointsToAdd,
			WalletBalance: updatedSponsorBalance,
		}

		return nil
	})

	return response, err
}
