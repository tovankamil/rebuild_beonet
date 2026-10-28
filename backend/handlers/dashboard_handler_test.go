package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/models"

	"github.com/gin-gonic/gin"
)

type mockDashboardServiceForHandler struct {
	stats     *models.DashboardStatsResponse
	genealogy *models.BinaryNode
	referrals []models.ReferralItem
	txs       []models.WalletTransaction
	bank      *models.UserBank
	wds       []models.Withdrawal
	pins      []models.Pin
	packages  []models.PinPackage
	products  []models.Product
}

func (m *mockDashboardServiceForHandler) GetStats(userID string) (*models.DashboardStatsResponse, error) {
	return m.stats, nil
}

func (m *mockDashboardServiceForHandler) GetGenealogy(userID string, targetIdentifier string) (*models.BinaryNode, error) {
	return m.genealogy, nil
}

func (m *mockDashboardServiceForHandler) GetDirectReferrals(userID string) ([]models.ReferralItem, error) {
	return m.referrals, nil
}

func (m *mockDashboardServiceForHandler) GetWalletTransactions(userID string) ([]models.WalletTransaction, error) {
	return m.txs, nil
}

func (m *mockDashboardServiceForHandler) GetUserBank(userID string) (*models.UserBank, error) {
	return m.bank, nil
}

func (m *mockDashboardServiceForHandler) SaveUserBank(userID string, bank models.UserBank) (*models.UserBank, error) {
	bank.UserID = userID
	m.bank = &bank
	return &bank, nil
}

func (m *mockDashboardServiceForHandler) RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error) {
	return &models.Withdrawal{UserID: userID, Amount: amount, NetAmount: amount - 5000, Status: "pending"}, nil
}

func (m *mockDashboardServiceForHandler) GetWithdrawals(userID string) ([]models.Withdrawal, error) {
	return m.wds, nil
}

func (m *mockDashboardServiceForHandler) GetMyPins(userID string) ([]models.Pin, error) {
	return m.pins, nil
}

func (m *mockDashboardServiceForHandler) GetPinPackages() ([]models.PinPackage, error) {
	return m.packages, nil
}

func (m *mockDashboardServiceForHandler) TransferPin(fromUserID string, pinID string, targetUsername string) error {
	return nil
}

func (m *mockDashboardServiceForHandler) RegisterDownline(sponsorUserID string, req models.RegisterDownlineRequest) (*models.RegisterDownlineResponse, error) {
	return &models.RegisterDownlineResponse{
		User: models.User{
			ID:       "mock-new-user-id",
			Username: req.Username,
			FullName: req.FullName,
		},
		Position:      req.Position,
		SponsorBonus:  50000,
		PointsAwarded: 1,
	}, nil
}

func (m *mockDashboardServiceForHandler) GetProducts() ([]models.Product, error) {
	return m.products, nil
}

func TestDashboardHandler_GetStats_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockSvc := &mockDashboardServiceForHandler{
		stats: &models.DashboardStatsResponse{
			WalletBalance:        2500000.0,
			PointLeft:            100.0,
			PointRight:           80.0,
			TotalBonusMonth:      500000.0,
			DirectReferralsCount: 4,
			TotalNetworkCount:    12,
		},
	}

	handler := NewDashboardHandler(mockSvc)

	r := gin.New()
	r.GET("/api/dashboard/stats", func(c *gin.Context) {
		c.Set("user_id", "user-uuid-1")
		handler.GetStats(c)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/dashboard/stats", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var res map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &res)

	data := res["data"].(map[string]interface{})
	if data["wallet_balance"].(float64) != 2500000.0 {
		t.Errorf("Expected wallet_balance 2500000, got %v", data["wallet_balance"])
	}
}

func TestDashboardHandler_GetStats_UnauthorizedWithoutUserID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewDashboardHandler(&mockDashboardServiceForHandler{})

	r := gin.New()
	r.GET("/api/dashboard/stats", handler.GetStats) // No user_id in context

	req, _ := http.NewRequest(http.MethodGet, "/api/dashboard/stats", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized, got %d", w.Code)
	}
}

func TestDashboardHandler_SaveUserBank_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockSvc := &mockDashboardServiceForHandler{}
	handler := NewDashboardHandler(mockSvc)

	r := gin.New()
	r.POST("/api/dashboard/bank", func(c *gin.Context) {
		c.Set("user_id", "user-uuid-1")
		handler.SaveUserBank(c)
	})

	bankPayload := models.UserBank{
		BankName:      "Bank Mandiri",
		AccountNumber: "140001928371",
		AccountName:   "Mitra Bionet",
	}

	body, _ := json.Marshal(bankPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/dashboard/bank", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	if mockSvc.bank == nil || mockSvc.bank.BankName != "Bank Mandiri" {
		t.Errorf("Expected bank to be saved as Bank Mandiri")
	}
}

func TestDashboardHandler_RequestWithdrawal_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockSvc := &mockDashboardServiceForHandler{}
	handler := NewDashboardHandler(mockSvc)

	r := gin.New()
	r.POST("/api/dashboard/withdrawals", func(c *gin.Context) {
		c.Set("user_id", "user-uuid-1")
		handler.RequestWithdrawal(c)
	})

	wdReq := models.WithdrawalRequest{Amount: 150000}
	body, _ := json.Marshal(wdReq)
	req, _ := http.NewRequest(http.MethodPost, "/api/dashboard/withdrawals", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200 on withdrawal, got %d", w.Code)
	}
}
