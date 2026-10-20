package repositories

import (
	"errors"
	"fmt"
	"time"

	"bionet-backend/interfaces"
	"bionet-backend/models"

	"github.com/google/uuid"
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

	node := &models.BinaryNode{
		ID:         user.ID,
		Username:   user.Username,
		FullName:   user.FullName,
		Position:   position,
		Status:     user.Status,
		PointLeft:  ptLeft,
		PointRight: ptRight,
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

func (r *dashboardRepositoryImpl) GetGenealogy(userID string) (*models.BinaryNode, error) {
	tree := r.buildTreeNode(userID, "root", 1, 3)
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
