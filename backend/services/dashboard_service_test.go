package services

import (
	"errors"
	"testing"

	"bionet-backend/models"
)

type mockDashboardRepository struct {
	stats       *models.DashboardStatsResponse
	genealogy   *models.BinaryNode
	referrals   []models.ReferralItem
	txs         []models.WalletTransaction
	bank        *models.UserBank
	saveBankErr error
}

func (m *mockDashboardRepository) GetStats(userID string) (*models.DashboardStatsResponse, error) {
	if m.stats == nil {
		return nil, errors.New("stats not found")
	}
	return m.stats, nil
}

func (m *mockDashboardRepository) GetGenealogy(userID string) (*models.BinaryNode, error) {
	return m.genealogy, nil
}

func (m *mockDashboardRepository) GetDirectReferrals(userID string) ([]models.ReferralItem, error) {
	return m.referrals, nil
}

func (m *mockDashboardRepository) GetWalletTransactions(userID string) ([]models.WalletTransaction, error) {
	return m.txs, nil
}

func (m *mockDashboardRepository) GetUserBank(userID string) (*models.UserBank, error) {
	return m.bank, nil
}

func (m *mockDashboardRepository) SaveUserBank(bank *models.UserBank) error {
	m.bank = bank
	return m.saveBankErr
}

func (m *mockDashboardRepository) RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error) {
	return &models.Withdrawal{UserID: userID, Amount: amount, NetAmount: amount - 5000, Status: "pending"}, nil
}

func (m *mockDashboardRepository) GetWithdrawals(userID string) ([]models.Withdrawal, error) {
	return []models.Withdrawal{}, nil
}

func (m *mockDashboardRepository) GetMyPins(userID string) ([]models.Pin, error) {
	return []models.Pin{}, nil
}

func (m *mockDashboardRepository) GetPinPackages() ([]models.PinPackage, error) {
	return []models.PinPackage{}, nil
}

func (m *mockDashboardRepository) TransferPin(fromUserID string, pinID string, targetUsername string) error {
	return nil
}

func (m *mockDashboardRepository) GetProducts() ([]models.Product, error) {
	return []models.Product{}, nil
}

func TestDashboardService_GetStats(t *testing.T) {
	mockRepo := &mockDashboardRepository{
		stats: &models.DashboardStatsResponse{
			User: models.User{
				ID:       "user-1",
				Username: "mitra01",
				FullName: "Mitra Juara",
			},
			WalletBalance:        1500000.0,
			PointLeft:            50.0,
			PointRight:           40.0,
			TotalBonusMonth:      300000.0,
			DirectReferralsCount: 5,
			TotalNetworkCount:    18,
		},
	}

	service := NewDashboardService(mockRepo)

	res, err := service.GetStats("user-1")
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if res.WalletBalance != 1500000.0 {
		t.Errorf("Expected wallet balance 1500000, got %f", res.WalletBalance)
	}

	if res.PointLeft != 50.0 || res.PointRight != 40.0 {
		t.Errorf("Expected point left 50 and right 40, got %f and %f", res.PointLeft, res.PointRight)
	}

	if res.DirectReferralsCount != 5 {
		t.Errorf("Expected 5 direct referrals, got %d", res.DirectReferralsCount)
	}
}

func TestDashboardService_SaveUserBank(t *testing.T) {
	mockRepo := &mockDashboardRepository{}
	service := NewDashboardService(mockRepo)

	bankInput := models.UserBank{
		BankName:      "BCA",
		AccountNumber: "1234567890",
		AccountName:   "Mitra Bionet",
	}

	saved, err := service.SaveUserBank("user-uuid-88", bankInput)
	if err != nil {
		t.Fatalf("Expected SaveUserBank to succeed, got: %v", err)
	}

	if saved.UserID != "user-uuid-88" {
		t.Errorf("Expected UserID to be injected as 'user-uuid-88', got %s", saved.UserID)
	}

	if mockRepo.bank.BankName != "BCA" {
		t.Errorf("Expected BankName 'BCA', got %s", mockRepo.bank.BankName)
	}
}

func TestDashboardService_GetGenealogy(t *testing.T) {
	mockRepo := &mockDashboardRepository{
		genealogy: &models.BinaryNode{
			ID:       "root-1",
			Username: "root_mitra",
			Position: "root",
			LeftNode: &models.BinaryNode{
				ID:       "left-1",
				Username: "downline_kiri",
				Position: "kiri",
			},
			RightNode: &models.BinaryNode{
				ID:       "right-1",
				Username: "downline_kanan",
				Position: "kanan",
			},
		},
	}

	service := NewDashboardService(mockRepo)

	tree, err := service.GetGenealogy("root-1")
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if tree.LeftNode == nil || tree.RightNode == nil {
		t.Errorf("Expected left and right nodes to be present in binary tree")
	}

	if tree.LeftNode.Username != "downline_kiri" {
		t.Errorf("Expected left node username 'downline_kiri', got %s", tree.LeftNode.Username)
	}
}

func TestDashboardService_RequestWithdrawal(t *testing.T) {
	mockRepo := &mockDashboardRepository{}
	service := NewDashboardService(mockRepo)

	wd, err := service.RequestWithdrawal("user-1", 100000)
	if err != nil {
		t.Fatalf("Expected withdrawal to succeed, got: %v", err)
	}

	if wd.Amount != 100000 {
		t.Errorf("Expected amount 100000, got %f", wd.Amount)
	}
}
