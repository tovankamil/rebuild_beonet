package interfaces

import "bionet-backend/models"

type DashboardRepository interface {
	GetStats(userID string) (*models.DashboardStatsResponse, error)
	GetGenealogy(userID string) (*models.BinaryNode, error)
	GetDirectReferrals(userID string) ([]models.ReferralItem, error)
	GetWalletTransactions(userID string) ([]models.WalletTransaction, error)
	GetUserBank(userID string) (*models.UserBank, error)
	SaveUserBank(bank *models.UserBank) error

	// Withdrawals
	RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error)
	GetWithdrawals(userID string) ([]models.Withdrawal, error)

	// PINs & Stokis
	GetMyPins(userID string) ([]models.Pin, error)
	GetPinPackages() ([]models.PinPackage, error)
	TransferPin(fromUserID string, pinID string, targetUsername string) error

	// Products
	GetProducts() ([]models.Product, error)
}

type DashboardService interface {
	GetStats(userID string) (*models.DashboardStatsResponse, error)
	GetGenealogy(userID string) (*models.BinaryNode, error)
	GetDirectReferrals(userID string) ([]models.ReferralItem, error)
	GetWalletTransactions(userID string) ([]models.WalletTransaction, error)
	GetUserBank(userID string) (*models.UserBank, error)
	SaveUserBank(userID string, bank models.UserBank) (*models.UserBank, error)

	// Withdrawals
	RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error)
	GetWithdrawals(userID string) ([]models.Withdrawal, error)

	// PINs & Stokis
	GetMyPins(userID string) ([]models.Pin, error)
	GetPinPackages() ([]models.PinPackage, error)
	TransferPin(fromUserID string, pinID string, targetUsername string) error

	// Products
	GetProducts() ([]models.Product, error)
}
