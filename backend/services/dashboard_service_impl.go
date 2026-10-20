package services

import (
	"bionet-backend/interfaces"
	"bionet-backend/models"
)

type dashboardServiceImpl struct {
	repo interfaces.DashboardRepository
}

func NewDashboardService(repo interfaces.DashboardRepository) interfaces.DashboardService {
	return &dashboardServiceImpl{repo: repo}
}

func (s *dashboardServiceImpl) GetStats(userID string) (*models.DashboardStatsResponse, error) {
	return s.repo.GetStats(userID)
}

func (s *dashboardServiceImpl) GetGenealogy(userID string) (*models.BinaryNode, error) {
	return s.repo.GetGenealogy(userID)
}

func (s *dashboardServiceImpl) GetDirectReferrals(userID string) ([]models.ReferralItem, error) {
	return s.repo.GetDirectReferrals(userID)
}

func (s *dashboardServiceImpl) GetWalletTransactions(userID string) ([]models.WalletTransaction, error) {
	return s.repo.GetWalletTransactions(userID)
}

func (s *dashboardServiceImpl) GetUserBank(userID string) (*models.UserBank, error) {
	return s.repo.GetUserBank(userID)
}

func (s *dashboardServiceImpl) SaveUserBank(userID string, bank models.UserBank) (*models.UserBank, error) {
	bank.UserID = userID
	if err := s.repo.SaveUserBank(&bank); err != nil {
		return nil, err
	}
	return &bank, nil
}

func (s *dashboardServiceImpl) RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error) {
	return s.repo.RequestWithdrawal(userID, amount)
}

func (s *dashboardServiceImpl) GetWithdrawals(userID string) ([]models.Withdrawal, error) {
	return s.repo.GetWithdrawals(userID)
}

func (s *dashboardServiceImpl) GetMyPins(userID string) ([]models.Pin, error) {
	return s.repo.GetMyPins(userID)
}

func (s *dashboardServiceImpl) GetPinPackages() ([]models.PinPackage, error) {
	return s.repo.GetPinPackages()
}

func (s *dashboardServiceImpl) TransferPin(fromUserID string, pinID string, targetUsername string) error {
	return s.repo.TransferPin(fromUserID, pinID, targetUsername)
}

func (s *dashboardServiceImpl) GetProducts() ([]models.Product, error) {
	return s.repo.GetProducts()
}
