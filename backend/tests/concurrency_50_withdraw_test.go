package tests

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"bionet-backend/config"
	"bionet-backend/handlers"
	"bionet-backend/models"
	"bionet-backend/repositories"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

func initRealDBForTest(t *testing.T) {
	_ = godotenv.Load("../.env")
	_ = godotenv.Load(".env")

	if os.Getenv("DB_NAME") == "" {
		os.Setenv("DB_NAME", "bionetv6")
	}
	if os.Getenv("DB_USER") == "" {
		os.Setenv("DB_USER", "root")
	}
	if os.Getenv("DB_PASSWORD") == "" {
		os.Setenv("DB_PASSWORD", "t0v4n.kamil")
	}
	if os.Getenv("DB_HOST") == "" {
		os.Setenv("DB_HOST", "127.0.0.1")
	}
	if os.Getenv("DB_PORT") == "" {
		os.Setenv("DB_PORT", "3306")
	}

	config.ConnectDatabase()
	if config.DB == nil {
		t.Fatal("Koneksi database bionetv6 tidak dapat diinisialisasi")
	}

	_ = config.DB.AutoMigrate(
		&models.User{},
		&models.UserBank{},
		&models.Wallet{},
		&models.WalletTransaction{},
		&models.Withdrawal{},
		&models.Notification{},
	)
}
func TestConcurrency_50Users_WithdrawalAndDisbursement(t *testing.T) {
	initRealDBForTest(t)
	gin.SetMode(gin.TestMode)

	db := config.DB
	const numUsers = 50
	const initialBalance = 500000.0
	const withdrawAmount = 100000.0
	const adminFee = 5000.0
	const expectedNetAmount = withdrawAmount - adminFee

	dashboardRepo := repositories.NewDashboardRepository(db)
	midtransSvc := services.NewMidtransService()
	paymentHandler := handlers.NewPaymentHandler(midtransSvc)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", "admin-concurrency-test")
		c.Next()
	})
	r.POST("/api/admin/withdrawals/:id/payout", paymentHandler.ProcessAutoDisbursement)

	userIDs := make([]string, numUsers)
	cleanupIDs := make([]string, 0, numUsers)
	defer func() {
		if len(cleanupIDs) > 0 {
			db.Where("user_id IN ?", cleanupIDs).Delete(&models.Withdrawal{})
			db.Where("user_id IN ?", cleanupIDs).Delete(&models.WalletTransaction{})
			db.Where("user_id IN ?", cleanupIDs).Delete(&models.Wallet{})
			db.Where("user_id IN ?", cleanupIDs).Delete(&models.UserBank{})
			db.Where("user_id IN ?", cleanupIDs).Delete(&models.Notification{})
			db.Where("id IN ?", cleanupIDs).Delete(&models.User{})
		}
	}()

	for i := 0; i < numUsers; i++ {
		uid := uuid.New().String()
		userIDs[i] = uid
		cleanupIDs = append(cleanupIDs, uid)
		username := fmt.Sprintf("stress_user_%02d_%d", i+1, time.Now().UnixNano()%100000)

		u := models.User{
			ID:           uid,
			Username:     username,
			FullName:     fmt.Sprintf("Mitra Juara %02d", i+1),
			PasswordHash: "secret123",
			Role:         "member",
			Status:       "active",
		}
		if err := db.Create(&u).Error; err != nil {
			t.Fatalf("Gagal membuat user test %s: %v", username, err)
		}

		b := models.UserBank{
			ID:            uuid.New().String(),
			UserID:        uid,
			BankName:      "BCA (Bank Central Asia)",
			AccountNumber: fmt.Sprintf("527%07d", i+1),
			AccountName:   u.FullName,
			IsPrimary:     true,
		}
		if err := db.Create(&b).Error; err != nil {
			t.Fatalf("Gagal membuat bank test: %v", err)
		}

		w := models.Wallet{
			ID:      uuid.New().String(),
			UserID:  uid,
			Balance: initialBalance,
		}
		if err := db.Create(&w).Error; err != nil {
			t.Fatalf("Gagal membuat dompet test: %v", err)
		}
	}

	startGate := make(chan struct{})
	var wg sync.WaitGroup
	var withdrawSuccessCount int64
	var withdrawFailCount int64
	createdWithdrawalIDs := make([]string, numUsers)

	startReqTime := time.Now()
	for i := 0; i < numUsers; i++ {
		wg.Add(1)
		go func(idx int, uid string) {
			defer wg.Done()
			<-startGate

			wd, err := dashboardRepo.RequestWithdrawal(uid, withdrawAmount)
			if err != nil {
				atomic.AddInt64(&withdrawFailCount, 1)
				t.Errorf("[User %d] Gagal withdraw: %v", idx, err)
				return
			}
			createdWithdrawalIDs[idx] = wd.ID
			atomic.AddInt64(&withdrawSuccessCount, 1)
		}(i, userIDs[i])
	}

	close(startGate)
	wg.Wait()
	durationReq := time.Since(startReqTime)

	t.Logf("Withdrawal 50 users: Berhasil=%d, Gagal=%d, Durasi=%v", withdrawSuccessCount, withdrawFailCount, durationReq)
	if withdrawSuccessCount != int64(numUsers) {
		t.Fatalf("Ekspektasi 50 withdrawal sukses, ada %d gagal", withdrawFailCount)
	}

	for i, uid := range userIDs {
		var w models.Wallet
		if err := db.Where("user_id = ?", uid).First(&w).Error; err != nil {
			t.Errorf("User %s wallet tidak ditemukan: %v", uid, err)
		}
		expectedBal := initialBalance - withdrawAmount
		if w.Balance != expectedBal {
			t.Errorf("[User %d] Saldo salah! Ekspektasi Rp %.0f, didapat Rp %.0f", i, expectedBal, w.Balance)
		}
	}

	disburseGate := make(chan struct{})
	var disburseWg sync.WaitGroup
	var disburseSuccessCount int64
	var disburseFailCount int64

	startDisbTime := time.Now()
	for i := 0; i < numUsers; i++ {
		disburseWg.Add(1)
		go func(idx int, wid string) {
			defer disburseWg.Done()
			<-disburseGate

			req, _ := http.NewRequest(http.MethodPost, fmt.Sprintf("/api/admin/withdrawals/%s/payout", wid), nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			if w.Code == http.StatusOK {
				atomic.AddInt64(&disburseSuccessCount, 1)
			} else {
				atomic.AddInt64(&disburseFailCount, 1)
				t.Errorf("[Disburse %d - WD %s] Status HTTP %d. Body: %s", idx, wid, w.Code, w.Body.String())
			}
		}(i, createdWithdrawalIDs[i])
	}

	close(disburseGate)
	disburseWg.Wait()
	durationDisb := time.Since(startDisbTime)

	t.Logf("Disbursement 50 users Midtrans: Berhasil=%d, Gagal=%d, Durasi=%v (%.1f payouts/sec)",
		disburseSuccessCount, disburseFailCount, durationDisb, float64(numUsers)/durationDisb.Seconds())

	if disburseSuccessCount != int64(numUsers) {
		t.Fatalf("Ekspektasi 50 transfer Midtrans Iris sukses, ada %d gagal", disburseFailCount)
	}

	var completedWithdrawals []models.Withdrawal
	db.Where("id IN ?", createdWithdrawalIDs).Find(&completedWithdrawals)
	if len(completedWithdrawals) != numUsers {
		t.Fatalf("Ekspektasi 50 baris withdrawal, ditemukan: %d", len(completedWithdrawals))
	}

	for idx, cw := range completedWithdrawals {
		if cw.Status != "completed" {
			t.Errorf("[WD %d] Ekspektasi status 'completed', didapat '%s'", idx, cw.Status)
		}
		if cw.FlipTransactionID == nil || *cw.FlipTransactionID == "" {
			t.Errorf("[WD %d] FlipTransactionID / PayoutID kosong!", idx)
		}
		if cw.NetAmount != expectedNetAmount {
			t.Errorf("[WD %d] NetAmount salah: ekspektasi %.0f, didapat %.0f", idx, expectedNetAmount, cw.NetAmount)
		}
	}
}
func TestConcurrency_DoubleDisbursementProtection_50ConcurrentHits(t *testing.T) {
	initRealDBForTest(t)
	gin.SetMode(gin.TestMode)

	db := config.DB
	midtransSvc := services.NewMidtransService()
	paymentHandler := handlers.NewPaymentHandler(midtransSvc)

	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("user_id", "admin-double-spend-test")
		c.Next()
	})
	r.POST("/api/admin/withdrawals/:id/payout", paymentHandler.ProcessAutoDisbursement)

	uid := uuid.New().String()
	defer func() {
		db.Where("user_id = ?", uid).Delete(&models.Withdrawal{})
		db.Where("user_id = ?", uid).Delete(&models.WalletTransaction{})
		db.Where("user_id = ?", uid).Delete(&models.Wallet{})
		db.Where("user_id = ?", uid).Delete(&models.UserBank{})
		db.Where("user_id = ?", uid).Delete(&models.Notification{})
		db.Where("id = ?", uid).Delete(&models.User{})
	}()

	_ = db.Create(&models.User{
		ID:           uid,
		Username:     "target_single_wd",
		FullName:     "Mitra Uji Double Spend",
		PasswordHash: "pass",
		Role:         "member",
		Status:       "active",
	})
	_ = db.Create(&models.UserBank{
		ID:            uuid.New().String(),
		UserID:        uid,
		BankName:      "Bank Mandiri",
		AccountNumber: "1400012345678",
		AccountName:   "Mitra Uji Double Spend",
		IsPrimary:     true,
	})

	singleWdID := uuid.New().String()
	_ = db.Create(&models.Withdrawal{
		ID:        singleWdID,
		UserID:    uid,
		Amount:    250000,
		AdminFee:  5000,
		NetAmount: 245000,
		Status:    "pending",
	})

	const numAttackers = 50
	gate := make(chan struct{})
	var wg sync.WaitGroup
	var successCount int64
	var conflictCount int64
	var badReqCount int64

	for i := 0; i < numAttackers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-gate

			req, _ := http.NewRequest(http.MethodPost, fmt.Sprintf("/api/admin/withdrawals/%s/payout", singleWdID), nil)
			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			switch w.Code {
			case http.StatusOK:
				atomic.AddInt64(&successCount, 1)
			case http.StatusConflict:
				atomic.AddInt64(&conflictCount, 1)
			case http.StatusBadRequest:
				atomic.AddInt64(&badReqCount, 1)
			default:
				t.Errorf("Unexpected HTTP status: %d", w.Code)
			}
		}()
	}

	close(gate)
	wg.Wait()

	t.Logf("Double-disbursement protection: 200 OK=%d, 409 Conflict=%d, 400 BadReq=%d", successCount, conflictCount, badReqCount)
	if successCount != 1 {
		t.Fatalf("CRITICAL BUG: Double disbursement terjadi! Berhasil: %d kali (Ekspektasi tepat 1)", successCount)
	}
	if (conflictCount + badReqCount) != (numAttackers - 1) {
		t.Fatalf("Ekspektasi 49 request ditolak, didapat Conflict: %d, BadReq: %d", conflictCount, badReqCount)
	}
}

func TestConcurrency_WalletDoubleSpending_50ConcurrentRequests(t *testing.T) {
	initRealDBForTest(t)

	db := config.DB
	dashboardRepo := repositories.NewDashboardRepository(db)

	uid := uuid.New().String()
	defer func() {
		db.Where("user_id = ?", uid).Delete(&models.Withdrawal{})
		db.Where("user_id = ?", uid).Delete(&models.WalletTransaction{})
		db.Where("user_id = ?", uid).Delete(&models.Wallet{})
		db.Where("user_id = ?", uid).Delete(&models.UserBank{})
		db.Where("id = ?", uid).Delete(&models.User{})
	}()

	_ = db.Create(&models.User{
		ID:           uid,
		Username:     "wallet_race_user",
		FullName:     "Mitra Uji Saldo Balapan",
		PasswordHash: "pass",
		Role:         "member",
		Status:       "active",
	})
	_ = db.Create(&models.UserBank{
		ID:            uuid.New().String(),
		UserID:        uid,
		BankName:      "BCA",
		AccountNumber: "0987654321",
		AccountName:   "Mitra Uji Saldo Balapan",
		IsPrimary:     true,
	})
	_ = db.Create(&models.Wallet{
		ID:      uuid.New().String(),
		UserID:  uid,
		Balance: 100000.0,
	})

	const numWithdrawThreads = 50
	gate := make(chan struct{})
	var wg sync.WaitGroup
	var successCount int64
	var failInsufficientCount int64

	for i := 0; i < numWithdrawThreads; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-gate

			_, err := dashboardRepo.RequestWithdrawal(uid, 100000.0)
			if err == nil {
				atomic.AddInt64(&successCount, 1)
			} else {
				atomic.AddInt64(&failInsufficientCount, 1)
			}
		}()
	}

	close(gate)
	wg.Wait()

	t.Logf("Wallet double spending test: Sukses=%d, Gagal Saldo Kurang=%d", successCount, failInsufficientCount)
	if successCount != 1 {
		t.Fatalf("CRITICAL BUG: Double spending terjadi! Berhasil: %d kali", successCount)
	}

	var w models.Wallet
	db.Where("user_id = ?", uid).First(&w)
	if w.Balance != 0.0 {
		t.Fatalf("Saldo akhir salah: ekspektasi 0.00, didapat: %.2f", w.Balance)
	}
}


