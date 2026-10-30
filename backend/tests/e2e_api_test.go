package tests

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"bionet-backend/handlers"
	"bionet-backend/middleware"
	"bionet-backend/models"
	"bionet-backend/utils"

	"github.com/gin-gonic/gin"
)

type fullMockAuthService struct{}

func (s *fullMockAuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	if strings.HasPrefix(req.Password, "wrong") || req.Password == "invalid" {
		return nil, errors.New("username atau password salah")
	}
	token, _ := utils.GenerateToken("user-test-uuid", req.Username, "member")
	return &models.LoginResponse{
		Token: token,
		User: models.User{
			ID:       "user-test-uuid",
			Username: req.Username,
			FullName: "Mitra Test E2E",
			Role:     "member",
			Status:   "active",
		},
	}, nil
}

type fullMockAuthRepo struct{}

func (r *fullMockAuthRepo) FindByUsername(username string) (*models.User, error) {
	return &models.User{
		ID:       "user-test-uuid",
		Username: username,
		FullName: "Mitra Test E2E",
		Role:     "member",
	}, nil
}

func (r *fullMockAuthRepo) CreateUser(user *models.User) error {
	return nil
}

type fullMockDashboardService struct {
	bank *models.UserBank
}

func (s *fullMockDashboardService) GetStats(userID string) (*models.DashboardStatsResponse, error) {
	return &models.DashboardStatsResponse{
		WalletBalance:        5000000.0,
		PointLeft:            150.0,
		PointRight:           120.0,
		TotalBonusMonth:      800000.0,
		DirectReferralsCount: 7,
		TotalNetworkCount:    32,
		Bank:                 s.bank,
	}, nil
}

func (s *fullMockDashboardService) GetGenealogy(userID string, targetIdentifier string) (*models.BinaryNode, error) {
	return &models.BinaryNode{
		ID:         userID,
		Username:   "mitra01",
		Position:   "root",
		PointLeft:  150.0,
		PointRight: 120.0,
	}, nil
}

func (s *fullMockDashboardService) GetDirectReferrals(userID string) ([]models.ReferralItem, error) {
	return []models.ReferralItem{
		{
			ID:        "ref-1",
			Username:  "downline01",
			FullName:  "Downline Satu",
			Phone:     "08123456789",
			Status:    "active",
			CreatedAt: "2026-10-21 00:00:00",
		},
	}, nil
}

func (s *fullMockDashboardService) GetWalletTransactions(userID string) ([]models.WalletTransaction, error) {
	return []models.WalletTransaction{
		{
			ID:           "tx-1",
			UserID:       userID,
			Type:         "credit",
			Amount:       250000.0,
			BalanceAfter: 5000000.0,
			Description:  "Bonus Sponsor",
		},
	}, nil
}

func (s *fullMockDashboardService) GetUserBank(userID string) (*models.UserBank, error) {
	return s.bank, nil
}

func (s *fullMockDashboardService) SaveUserBank(userID string, bank models.UserBank) (*models.UserBank, error) {
	bank.UserID = userID
	s.bank = &bank
	return &bank, nil
}

func (s *fullMockDashboardService) RequestWithdrawal(userID string, amount float64) (*models.Withdrawal, error) {
	return &models.Withdrawal{
		ID:        "wd-uuid-1",
		UserID:    userID,
		Amount:    amount,
		NetAmount: amount - 5000,
		Status:    "pending",
	}, nil
}

func (s *fullMockDashboardService) GetWithdrawals(userID string) ([]models.Withdrawal, error) {
	return []models.Withdrawal{}, nil
}

func (s *fullMockDashboardService) GetMyPins(userID string) ([]models.Pin, error) {
	return []models.Pin{}, nil
}

func (s *fullMockDashboardService) GetPinPackages() ([]models.PinPackage, error) {
	return []models.PinPackage{}, nil
}

func (s *fullMockDashboardService) TransferPin(fromUserID string, pinID string, targetUsername string) error {
	return nil
}

func (s *fullMockDashboardService) RegisterDownline(sponsorUserID string, req models.RegisterDownlineRequest) (*models.RegisterDownlineResponse, error) {
	return &models.RegisterDownlineResponse{
		User: models.User{
			ID:       "new-downline-uuid",
			Username: req.Username,
			FullName: req.FullName,
			Role:     "member",
			Status:   "active",
		},
		Position:      req.Position,
		SponsorBonus:  50000,
		PointsAwarded: 1,
	}, nil
}

func (s *fullMockDashboardService) GetProducts() ([]models.Product, error) {
	return []models.Product{}, nil
}

func setupTestServer() *gin.Engine {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_SECRET", "super_secret_test_key_e2e")

	authHandler := handlers.NewAuthHandler(&fullMockAuthService{}, &fullMockAuthRepo{})
	dashboardHandler := handlers.NewDashboardHandler(&fullMockDashboardService{})
	verificationHandler := handlers.NewVerificationHandler()
	crmHandler := handlers.NewCRMHandler()
	prospectingHandler := handlers.NewProspectingHandler()
	bioLinkHandler := handlers.NewBioLinkHandler()
	marketingHandler := handlers.NewMarketingHandler()
	gamificationHandler := handlers.NewGamificationHandler()
	aiHandler := handlers.NewAIHandler()
	securityHandler := handlers.NewSecurityHandler()

	r := gin.New()
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.SecurityGuardMiddleware())

	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "success", "message": "pong"})
		})

		api.POST("/auth/login", authHandler.Login)

		// Public Routes (Module 4, 5, 7)
		api.GET("/public/verify/member/:id", verificationHandler.VerifyMember)
		api.GET("/public/verify/certificate/:cert_no", verificationHandler.VerifyCertificate)
		api.POST("/prospecting/simulate", prospectingHandler.Simulate)
		api.GET("/public/push/public-key", prospectingHandler.GetVapidPublicKey)
		api.POST("/public/leads/webhook", crmHandler.PublicLeadWebhook)
		api.POST("/crm/whatsapp/webhook", crmHandler.WhatsAppWebhookListener)

		// Pilar 1 & 2: Public
		api.GET("/bio/:username", bioLinkHandler.GetPublicBioPage)
		api.POST("/bio/lead", bioLinkHandler.SubmitBioLead)
		api.GET("/marketing/kits", marketingHandler.GetMarketingKits)
		api.GET("/marketing/webinars", marketingHandler.GetWebinars)
		api.POST("/marketing/webinars/register", marketingHandler.RegisterWebinar)
		api.GET("/gamification/leaderboard", gamificationHandler.GetLeaderboard)

		// Bionet AI Suite (Public / Direct API)
		api.POST("/ai/health-consult", aiHandler.HealthConsult)
		api.POST("/ai/objection-handler", aiHandler.ObjectionHandler)
		api.GET("/ai/binary-advisor", aiHandler.BinaryAdvisor)
		api.POST("/ai/generate-copywriting", aiHandler.GenerateCopywriting)
		api.GET("/ai/churn-radar", aiHandler.ChurnRadar)
		api.POST("/ai/voice-note", aiHandler.VoiceNoteScript)
		api.POST("/ai/fraud-scan", aiHandler.FraudScan)
		api.GET("/ai/ro-retention", aiHandler.RORetention)

		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/me", authHandler.GetMe)
			protected.GET("/dashboard/stats", dashboardHandler.GetStats)
			protected.GET("/dashboard/genealogy", dashboardHandler.GetGenealogy)
			protected.GET("/dashboard/referrals", dashboardHandler.GetDirectReferrals)
			protected.GET("/dashboard/transactions", dashboardHandler.GetWalletTransactions)
			protected.GET("/dashboard/bank", dashboardHandler.GetUserBank)
			protected.POST("/dashboard/bank", dashboardHandler.SaveUserBank)

			// Withdrawals
			protected.POST("/dashboard/withdrawals", dashboardHandler.RequestWithdrawal)
			protected.GET("/dashboard/withdrawals", dashboardHandler.GetWithdrawals)

			// PINs
			protected.GET("/pins/my-pins", dashboardHandler.GetMyPins)
			protected.GET("/pins/packages", dashboardHandler.GetPinPackages)
			protected.POST("/pins/transfer", dashboardHandler.TransferPin)
			protected.POST("/pins/register-downline", dashboardHandler.RegisterDownline)

			// Products
			protected.GET("/products", dashboardHandler.GetProducts)

			// Module 6: CRM & RO Reminders & Expanded CRM
			protected.GET("/crm/ro-reminders", crmHandler.GetROReminders)
			protected.POST("/crm/ro-reminders/log", crmHandler.LogFollowUp)
			protected.GET("/crm/health-records", crmHandler.GetHealthRecords)
			protected.POST("/crm/health-records", crmHandler.SaveHealthRecord)
			protected.PUT("/crm/health-records/:id/milestone", crmHandler.UpdateHealthMilestone)
			protected.POST("/crm/ai/objection-handler", crmHandler.HandleObjectionAI)
			protected.PUT("/crm/leads/:id/status", crmHandler.UpdateLeadStatus)
			protected.GET("/crm/testimonials", crmHandler.GetTestimonials)

			// Module 7: PWA Web Push
			protected.POST("/notifications/push-subscribe", prospectingHandler.SubscribePush)
			protected.GET("/notifications/push-public-key", prospectingHandler.GetVapidPublicKey)
			protected.POST("/notifications/push-test", prospectingHandler.TestPushNotification)

			// WhatsApp In-App Suite & Gateway
			protected.GET("/crm/whatsapp/status", crmHandler.GetWhatsAppGatewayStatus)
			protected.GET("/crm/whatsapp/logs", crmHandler.GetWhatsAppGatewayLogs)
			protected.POST("/crm/whatsapp/send-direct", crmHandler.SendDirectWhatsApp)
			protected.GET("/crm/whatsapp/threads", crmHandler.GetWhatsAppThreads)
			protected.GET("/crm/whatsapp/threads/:id/messages", crmHandler.GetWhatsAppThreadMessages)
			protected.POST("/crm/whatsapp/threads/:id/messages", crmHandler.SendWhatsAppThreadMessage)
			protected.POST("/crm/whatsapp/threads", crmHandler.CreateWhatsAppThread)
			protected.GET("/crm/whatsapp/broadcasts", crmHandler.GetWhatsAppBroadcasts)
			protected.POST("/crm/whatsapp/broadcasts", crmHandler.CreateWhatsAppBroadcast)
			protected.GET("/crm/whatsapp/bot-rules", crmHandler.GetWhatsAppBotRules)
			protected.POST("/crm/whatsapp/bot-rules", crmHandler.SaveWhatsAppBotRule)
			protected.PATCH("/crm/whatsapp/bot-rules/:id/toggle", crmHandler.ToggleWhatsAppBotRule)
			protected.DELETE("/crm/whatsapp/bot-rules/:id", crmHandler.DeleteWhatsAppBotRule)
			protected.GET("/crm/whatsapp/device", crmHandler.GetWhatsAppDeviceSession)
			protected.POST("/crm/whatsapp/device/pair", crmHandler.PairWhatsAppDevice)
			protected.POST("/crm/whatsapp/device/disconnect", crmHandler.DisconnectWhatsAppDevice)
			protected.POST("/crm/whatsapp/device/toggle-bot", crmHandler.ToggleWhatsAppAutoResponder)

			// Pilar 3: WhatsApp CRM Lanjutan
			protected.POST("/crm/whatsapp/send-media", crmHandler.SendWhatsAppMedia)
			protected.GET("/crm/whatsapp/schedules", crmHandler.GetWhatsAppSchedules)
			protected.POST("/crm/whatsapp/schedules", crmHandler.CreateWhatsAppSchedule)
			protected.DELETE("/crm/whatsapp/schedules/:id", crmHandler.DeleteWhatsAppSchedule)

			// Pilar 1: Bio-Link Protected
			protected.GET("/bio/my-page", bioLinkHandler.GetMyBioPage)
			protected.PUT("/bio/my-page", bioLinkHandler.UpdateMyBioPage)

			// Pilar 2: Gamifikasi Protected
			protected.GET("/gamification/reward-progress", gamificationHandler.GetRewardProgress)
			protected.GET("/academy/modules", gamificationHandler.GetAcademyModules)
			protected.POST("/academy/complete", gamificationHandler.CompleteAcademyModule)
			protected.GET("/gamification/inactivity-alerts", gamificationHandler.GetInactivityAlerts)

			// Admin Enterprise Security Routes (STRICT RequireRole("admin"))
			adminGroup := protected.Group("/admin")
			adminGroup.Use(middleware.RequireRole("admin"))
			{
				securityGroup := adminGroup.Group("/security")
				{
					securityGroup.GET("/threats", securityHandler.GetThreatLogs)
					securityGroup.GET("/geo-traffic", securityHandler.GetGeoTraffic)
					securityGroup.POST("/block-ip", securityHandler.BlockIP)
					securityGroup.POST("/unblock-ip", securityHandler.UnblockIP)
					securityGroup.POST("/test-alert", securityHandler.TestSecurityAlert)
				}
			}
		}
	}

	return r
}

func TestE2E_FullFlow(t *testing.T) {
	router := setupTestServer()

	// 1. Test Ping Endpoint
	pingReq, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
	pingW := httptest.NewRecorder()
	router.ServeHTTP(pingW, pingReq)

	if pingW.Code != http.StatusOK {
		t.Fatalf("Ping failed with code %d", pingW.Code)
	}

	// 2. Test Login flow
	loginBody, _ := json.Marshal(models.LoginRequest{
		Username: "mitra01",
		Password: "bionet123",
	})
	loginReq, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")
	loginW := httptest.NewRecorder()
	router.ServeHTTP(loginW, loginReq)

	if loginW.Code != http.StatusOK {
		t.Fatalf("Login failed with status %d. Body: %s", loginW.Code, loginW.Body.String())
	}

	var loginResp struct {
		Status string `json:"status"`
		Data   struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	json.Unmarshal(loginW.Body.Bytes(), &loginResp)
	token := loginResp.Data.Token

	if token == "" {
		t.Fatalf("Expected token to be returned from login")
	}

	// 3. Test Protected /api/dashboard/stats with Bearer Token
	statsReq, _ := http.NewRequest(http.MethodGet, "/api/dashboard/stats", nil)
	statsReq.Header.Set("Authorization", "Bearer "+token)
	statsW := httptest.NewRecorder()
	router.ServeHTTP(statsW, statsReq)

	if statsW.Code != http.StatusOK {
		t.Fatalf("Dashboard stats failed with status %d. Body: %s", statsW.Code, statsW.Body.String())
	}

	// 4. Test Protected /api/dashboard/withdrawals
	wdBody, _ := json.Marshal(models.WithdrawalRequest{Amount: 100000})
	wdReq, _ := http.NewRequest(http.MethodPost, "/api/dashboard/withdrawals", bytes.NewBuffer(wdBody))
	wdReq.Header.Set("Authorization", "Bearer "+token)
	wdReq.Header.Set("Content-Type", "application/json")
	wdW := httptest.NewRecorder()
	router.ServeHTTP(wdW, wdReq)

	if wdW.Code != http.StatusOK {
		t.Fatalf("Withdrawal failed with status %d. Body: %s", wdW.Code, wdW.Body.String())
	}

	// 5. Verify Unauthenticated Request is Blocked (401)
	unauthReq, _ := http.NewRequest(http.MethodGet, "/api/dashboard/stats", nil)
	unauthW := httptest.NewRecorder()
	router.ServeHTTP(unauthW, unauthReq)

	if unauthW.Code != http.StatusUnauthorized {
		t.Errorf("Expected unauthenticated request to return 401, got %d", unauthW.Code)
	}
}
