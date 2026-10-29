package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"bionet-backend/utils"
)

// ============================================================================
// MODULE 5: DIGITAL ID & CERTIFICATE VERIFICATION TESTS
// ============================================================================

func TestModule5_VerifyMember_Success(t *testing.T) {
	router := setupTestServer()

	// Uji verifikasi publik member dengan username/ID
	req, _ := http.NewRequest(http.MethodGet, "/api/public/verify/member/mitra01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200 for verify member, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string `json:"status"`
		Data   struct {
			ID                    string `json:"id"`
			Username              string `json:"username"`
			FullName              string `json:"full_name"`
			Role                  string `json:"role"`
			Status                string `json:"status"`
			MemberSince           any    `json:"member_since"`
			IsOfficialDistributor bool   `json:"is_official_distributor"`
		} `json:"data"`
	}

	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse response JSON: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.Data.Username == "" {
		t.Errorf("Expected non-empty username")
	}
	if resp.Data.FullName == "" {
		t.Errorf("Expected non-empty full_name")
	}
	if !resp.Data.IsOfficialDistributor {
		t.Errorf("Expected is_official_distributor to be true for active member")
	}
}

func TestModule5_VerifyMember_NotFound(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodGet, "/api/public/verify/member/user-notfound-9999", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Fatalf("Expected status 404 for unknown member, got %d", w.Code)
	}

	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Status != "error" {
		t.Errorf("Expected status 'error', got '%s'", resp.Status)
	}
}

func TestModule5_VerifyCertificate_ValidFormat(t *testing.T) {
	router := setupTestServer()

	testCerts := []struct {
		certNo        string
		expectedTitle string
	}{
		{"BIO-CERT-PLATINUM-mitra01", "Platinum"},
		{"BIO-CERT-GOLD-leader02", "Gold"},
		{"BIO-CERT-SILVER-member03", "Silver"},
		{"BIO-CERT-LEADER-achiever", "Leader"},
		{"BIO-CERT-RO-CHAMPION-991", "Repeat Order"},
		{"BIO-CERT-2026-DISTRIBUTOR-001", "Distribusi Resmi"},
	}

	for _, tc := range testCerts {
		t.Run("Verify_"+tc.certNo, func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, "/api/public/verify/certificate/"+tc.certNo, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusOK {
				t.Fatalf("Expected status 200 for cert %s, got %d. Body: %s", tc.certNo, w.Code, w.Body.String())
			}

			var resp struct {
				Status string `json:"status"`
				Data   struct {
					CertNo        string `json:"cert_no"`
					RecipientName string `json:"recipient_name"`
					AwardTitle    string `json:"award_title"`
					IssueDate     string `json:"issue_date"`
					Status        string `json:"status"`
					Issuer        string `json:"issuer"`
				} `json:"data"`
			}

			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("Failed to decode cert JSON: %v", err)
			}

			if resp.Status != "success" {
				t.Errorf("Expected status 'success', got '%s'", resp.Status)
			}
			if resp.Data.CertNo != tc.certNo {
				t.Errorf("Expected cert_no '%s', got '%s'", tc.certNo, resp.Data.CertNo)
			}
			if resp.Data.RecipientName == "" {
				t.Errorf("Expected recipient_name to be present")
			}
			if !strings.Contains(resp.Data.AwardTitle, tc.expectedTitle) {
				t.Errorf("Expected award_title to contain '%s', got '%s'", tc.expectedTitle, resp.Data.AwardTitle)
			}
			if resp.Data.Issuer != "PT Bionet Herbal Indonesia" {
				t.Errorf("Expected issuer 'PT Bionet Herbal Indonesia', got '%s'", resp.Data.Issuer)
			}
			if resp.Data.Status != "verified" && resp.Data.Status != "valid" {
				t.Errorf("Expected status 'verified' or 'valid', got '%s'", resp.Data.Status)
			}
		})
	}
}

func TestModule5_VerifyCertificate_InvalidFormat(t *testing.T) {
	router := setupTestServer()

	invalidCerts := []string{
		"INVALID-CERT-12345",
		"CERT-BIONET-999",
		"XYZ-123",
	}

	for _, cert := range invalidCerts {
		t.Run("Invalid_"+cert, func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, "/api/public/verify/certificate/"+cert, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusBadRequest {
				t.Errorf("Expected 400 Bad Request for invalid cert format %s, got %d", cert, w.Code)
			}
		})
	}
}

// ============================================================================
// MODULE 6: SMART RO REMINDER & CUSTOMER CRM TESTS
// ============================================================================

func TestModule6_ROReminders_AccessControl(t *testing.T) {
	router := setupTestServer()

	// Unauthorized request -> 401
	req, _ := http.NewRequest(http.MethodGet, "/api/crm/ro-reminders", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized without token, got %d", w.Code)
	}
}

func TestModule6_ROReminders_Authenticated(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	req, _ := http.NewRequest(http.MethodGet, "/api/crm/ro-reminders", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for authorized RO reminders, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string `json:"status"`
		Data   struct {
			Customers []struct {
				ID                     string `json:"id"`
				Name                   string `json:"name"`
				Phone                  string `json:"phone"`
				DaysSinceContact       int    `json:"days_since_contact"`
				EstimatedRemainingDays int    `json:"estimated_remaining_days"`
				Urgency                string `json:"urgency"`
				UrgencyLabel           string `json:"urgency_label"`
			} `json:"customers"`
			DormantDownlines []struct {
				ID           string `json:"id"`
				Username     string `json:"username"`
				FullName     string `json:"full_name"`
				DaysInactive int    `json:"days_inactive"`
				Status       string `json:"status"`
			} `json:"dormant_downlines"`
		} `json:"data"`
	}

	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to decode RO Reminders response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}

	// Verifikasi customers jika ada
	for _, c := range resp.Data.Customers {
		if c.DaysSinceContact >= 25 {
			if c.Urgency != "urgent" {
				t.Errorf("Customer with %d days since contact should be urgent, got %s", c.DaysSinceContact, c.Urgency)
			}
		} else if c.DaysSinceContact >= 18 {
			if c.Urgency != "warning" {
				t.Errorf("Customer with %d days since contact should be warning, got %s", c.DaysSinceContact, c.Urgency)
			}
		} else {
			if c.Urgency != "good" {
				t.Errorf("Customer with %d days since contact should be good, got %s", c.DaysSinceContact, c.Urgency)
			}
		}
		if c.EstimatedRemainingDays != (30 - c.DaysSinceContact) {
			t.Errorf("EstimatedRemainingDays should be 30 - %d, got %d", c.DaysSinceContact, c.EstimatedRemainingDays)
		}
	}

	// Verifikasi dormant downlines jika ada
	for _, d := range resp.Data.DormantDownlines {
		if d.Status != "dormant" {
			t.Errorf("Expected dormant downline status 'dormant', got '%s'", d.Status)
		}
		if d.DaysInactive < 45 {
			t.Errorf("Dormant downline should have days_inactive >= 45, got %d", d.DaysInactive)
		}
	}
}

func TestModule6_LogFollowUp(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Unauthorized
	reqUnauth, _ := http.NewRequest(http.MethodPost, "/api/crm/ro-reminders/log", bytes.NewBuffer([]byte(`{}`)))
	wUnauth := httptest.NewRecorder()
	router.ServeHTTP(wUnauth, reqUnauth)
	if wUnauth.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthenticated log follow up, got %d", wUnauth.Code)
	}

	// 2. Bad Request: missing target_id & type
	reqBad, _ := http.NewRequest(http.MethodPost, "/api/crm/ro-reminders/log", bytes.NewBuffer([]byte(`{"notes":"test"}`)))
	reqBad.Header.Set("Authorization", "Bearer "+token)
	reqBad.Header.Set("Content-Type", "application/json")
	wBad := httptest.NewRecorder()
	router.ServeHTTP(wBad, reqBad)
	if wBad.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for missing target_id, got %d", wBad.Code)
	}

	// 3. Customer follow-up logging success
	custPayload, _ := json.Marshal(map[string]string{
		"target_id": "cust-lead-123",
		"type":      "customer",
		"method":    "whatsapp",
		"notes":     "Customer memesan 2 botol Bio-Propolis Trigona untuk persediaan bulan depan.",
	})
	reqCust, _ := http.NewRequest(http.MethodPost, "/api/crm/ro-reminders/log", bytes.NewBuffer(custPayload))
	reqCust.Header.Set("Authorization", "Bearer "+token)
	reqCust.Header.Set("Content-Type", "application/json")
	wCust := httptest.NewRecorder()
	router.ServeHTTP(wCust, reqCust)

	if wCust.Code != http.StatusOK {
		t.Fatalf("Expected 200 for customer follow-up, got %d. Body: %s", wCust.Code, wCust.Body.String())
	}

	var respCust struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			TargetID string `json:"target_id"`
			Type     string `json:"type"`
			Method   string `json:"method"`
			Notes    string `json:"notes"`
		} `json:"data"`
	}
	json.Unmarshal(wCust.Body.Bytes(), &respCust)

	if respCust.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", respCust.Status)
	}
	if respCust.Data.TargetID != "cust-lead-123" {
		t.Errorf("Expected target_id 'cust-lead-123', got '%s'", respCust.Data.TargetID)
	}
	if respCust.Data.Method != "whatsapp" {
		t.Errorf("Expected method 'whatsapp', got '%s'", respCust.Data.Method)
	}

	// 4. Downline follow-up logging success
	downlinePayload, _ := json.Marshal(map[string]string{
		"target_id": "downline-mitra-456",
		"type":      "downline",
		"method":    "whatsapp",
		"notes":     "Follow up re-aktivasi kemitraan dan penawaran promo paket RO diskon 15%.",
	})
	reqDl, _ := http.NewRequest(http.MethodPost, "/api/crm/ro-reminders/log", bytes.NewBuffer(downlinePayload))
	reqDl.Header.Set("Authorization", "Bearer "+token)
	reqDl.Header.Set("Content-Type", "application/json")
	wDl := httptest.NewRecorder()
	router.ServeHTTP(wDl, reqDl)

	if wDl.Code != http.StatusOK {
		t.Fatalf("Expected 200 for downline follow-up, got %d", wDl.Code)
	}
}

// ============================================================================
// MODULE 4: PROSPECTING SIMULATION TESTS
// ============================================================================

func TestModule4_Simulate_InvalidPackage(t *testing.T) {
	router := setupTestServer()

	payload, _ := json.Marshal(map[string]any{
		"package_type":       "diamond",
		"duplication_factor": 2,
		"months":             3,
	})
	req, _ := http.NewRequest(http.MethodPost, "/api/prospecting/simulate", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for invalid package 'diamond', got %d", w.Code)
	}
}

func TestModule4_Simulate_PackagesAndCalculations(t *testing.T) {
	router := setupTestServer()

	scenarios := []struct {
		pkgType           string
		duplicationFactor int
		months            int
		expectedMinPoints float64
	}{
		{"silver", 2, 3, 14.0},   // Month 1: 2, M2: 4, M3: 8 -> 14 downlines * 1 pt = 14 pts
		{"gold", 2, 6, 378.0},    // 126 downlines * 3 pts = 378 pts
		{"platinum", 3, 3, 273.0}, // M1: 3, M2: 9, M3: 27 -> 39 downlines * 7 pts = 273 pts
	}

	for _, sc := range scenarios {
		t.Run("Simulate_"+sc.pkgType, func(t *testing.T) {
			payload, _ := json.Marshal(map[string]any{
				"package_type":       sc.pkgType,
				"duplication_factor": sc.duplicationFactor,
				"months":             sc.months,
			})

			req, _ := http.NewRequest(http.MethodPost, "/api/prospecting/simulate", bytes.NewBuffer(payload))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusOK {
				t.Fatalf("Expected 200 OK for %s simulation, got %d. Body: %s", sc.pkgType, w.Code, w.Body.String())
			}

			var resp struct {
				Status string `json:"status"`
				Data   struct {
					PackageType          string  `json:"package_type"`
					PackageName          string  `json:"package_name"`
					TotalDownlines       int64   `json:"total_downlines"`
					LeftDownlines        int64   `json:"left_downlines"`
					RightDownlines       int64   `json:"right_downlines"`
					PointsLeft           float64 `json:"points_left"`
					PointsRight          float64 `json:"points_right"`
					TotalPoints          float64 `json:"total_points"`
					TotalPairs           int64   `json:"total_pairs"`
					TotalSponsorBonus    float64 `json:"total_sponsor_bonus"`
					TotalPairingBonus    float64 `json:"total_pairing_bonus"`
					TotalEstimatedIncome float64 `json:"total_estimated_income"`
					AchievedRewardTiers  []struct {
						Tier           int     `json:"tier"`
						RewardName     string  `json:"reward_name"`
						PointsRequired float64 `json:"points_required"`
						IsAchieved     bool    `json:"is_achieved"`
						ProgressPct    float64 `json:"progress_pct"`
					} `json:"achieved_reward_tiers"`
					MonthlyBreakdown []struct {
						Month          int   `json:"month"`
						NewDownlines   int64 `json:"new_downlines"`
						TotalDownlines int64 `json:"total_downlines"`
					} `json:"monthly_breakdown"`
				} `json:"data"`
			}

			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("Failed to parse simulation JSON: %v", err)
			}

			if resp.Status != "success" {
				t.Errorf("Expected status 'success', got '%s'", resp.Status)
			}
			if resp.Data.PackageType != sc.pkgType {
				t.Errorf("Expected package_type '%s', got '%s'", sc.pkgType, resp.Data.PackageType)
			}
			if resp.Data.TotalPoints != sc.expectedMinPoints {
				t.Errorf("Expected total_points %.1f, got %.1f", sc.expectedMinPoints, resp.Data.TotalPoints)
			}
			if resp.Data.LeftDownlines+resp.Data.RightDownlines != resp.Data.TotalDownlines {
				t.Errorf("Left + Right should equal TotalDownlines")
			}
			if resp.Data.TotalSponsorBonus <= 0 {
				t.Errorf("Expected positive sponsor bonus, got %.2f", resp.Data.TotalSponsorBonus)
			}
			if resp.Data.TotalPairingBonus <= 0 {
				t.Errorf("Expected positive pairing bonus, got %.2f", resp.Data.TotalPairingBonus)
			}
			if resp.Data.TotalEstimatedIncome != (resp.Data.TotalSponsorBonus + resp.Data.TotalPairingBonus) {
				t.Errorf("Expected total estimated income = sponsor + pairing bonus")
			}
			if len(resp.Data.AchievedRewardTiers) != 5 {
				t.Errorf("Expected 5 master reward tiers, got %d", len(resp.Data.AchievedRewardTiers))
			}
			if len(resp.Data.MonthlyBreakdown) != sc.months {
				t.Errorf("Expected %d months in breakdown, got %d", sc.months, len(resp.Data.MonthlyBreakdown))
			}
		})
	}
}

// ============================================================================
// MODULE 7: PWA WEB PUSH NOTIFICATION TESTS
// ============================================================================

func TestModule7_PushPublicKey(t *testing.T) {
	router := setupTestServer()

	// 1. Test Public Key endpoint via GET /api/public/push/public-key
	reqPub, _ := http.NewRequest(http.MethodGet, "/api/public/push/public-key", nil)
	wPub := httptest.NewRecorder()
	router.ServeHTTP(wPub, reqPub)

	if wPub.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for public push key, got %d", wPub.Code)
	}

	var respPub struct {
		Status string `json:"status"`
		Data   struct {
			PublicKey string `json:"public_key"`
		} `json:"data"`
	}
	json.Unmarshal(wPub.Body.Bytes(), &respPub)

	if respPub.Data.PublicKey == "" {
		t.Errorf("Expected non-empty public_key")
	}

	// 2. Test Protected push key endpoint
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")
	reqProt, _ := http.NewRequest(http.MethodGet, "/api/notifications/push-public-key", nil)
	reqProt.Header.Set("Authorization", "Bearer "+token)
	wProt := httptest.NewRecorder()
	router.ServeHTTP(wProt, reqProt)

	if wProt.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for notifications push key, got %d", wProt.Code)
	}
}

func TestModule7_PushSubscribe(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Unauthorized -> 401
	subPayload, _ := json.Marshal(map[string]any{
		"endpoint": "https://fcm.googleapis.com/fcm/send/sample-token-12345",
		"keys": map[string]string{
			"p256dh": "BM_sample_p256dh_key",
			"auth":   "sample_auth_secret",
		},
	})
	reqUnauth, _ := http.NewRequest(http.MethodPost, "/api/notifications/push-subscribe", bytes.NewBuffer(subPayload))
	wUnauth := httptest.NewRecorder()
	router.ServeHTTP(wUnauth, reqUnauth)

	if wUnauth.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 for unauthenticated push subscribe, got %d", wUnauth.Code)
	}

	// 2. Authenticated success
	reqAuth, _ := http.NewRequest(http.MethodPost, "/api/notifications/push-subscribe", bytes.NewBuffer(subPayload))
	reqAuth.Header.Set("Authorization", "Bearer "+token)
	reqAuth.Header.Set("Content-Type", "application/json")
	wAuth := httptest.NewRecorder()
	router.ServeHTTP(wAuth, reqAuth)

	if wAuth.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for push subscribe, got %d. Body: %s", wAuth.Code, wAuth.Body.String())
	}

	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	json.Unmarshal(wAuth.Body.Bytes(), &resp)

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
}

func TestModule7_PushTest(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	testPayload, _ := json.Marshal(map[string]string{
		"title":   "Uji Coba Push Notification Bionet",
		"message": "Bonus pasangan Rp 200.000 telah masuk ke dompet Anda!",
	})
	req, _ := http.NewRequest(http.MethodPost, "/api/notifications/push-test", bytes.NewBuffer(testPayload))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for push test, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
}
