package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bionet-backend/handlers"
	"bionet-backend/models"
	"bionet-backend/utils"
)

// ============================================================================
// PILAR 1: PEMASARAN & AI GROWTH ENGINE TESTS
// ============================================================================

func TestBioLink_GetPublicBioPage_SuccessAndIncrementViews(t *testing.T) {
	router := setupTestServer()

	// Initial fetch
	req, _ := http.NewRequest(http.MethodGet, "/api/bio/mitra01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string         `json:"status"`
		Data   models.BioPage `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.Data.Username != "mitra01" {
		t.Errorf("Expected username 'mitra01', got '%s'", resp.Data.Username)
	}
	if len(resp.Data.FeaturedProducts) == 0 {
		t.Errorf("Expected FeaturedProducts to be populated")
	}
	if len(resp.Data.Testimonials) == 0 {
		t.Errorf("Expected Testimonials to be populated")
	}

	initialViews := resp.Data.TotalViews

	// Second fetch should increment views
	req2, _ := http.NewRequest(http.MethodGet, "/api/bio/mitra01", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	var resp2 struct {
		Data models.BioPage `json:"data"`
	}
	json.Unmarshal(w2.Body.Bytes(), &resp2)

	if resp2.Data.TotalViews < initialViews {
		t.Errorf("Expected TotalViews to increment, initial: %d, after: %d", initialViews, resp2.Data.TotalViews)
	}
}

func TestBioLink_GetMyBioPage_Protected(t *testing.T) {
	router := setupTestServer()

	// 1. Without Token -> 401
	unauthReq, _ := http.NewRequest(http.MethodGet, "/api/bio/my-page", nil)
	unauthW := httptest.NewRecorder()
	router.ServeHTTP(unauthW, unauthReq)
	if unauthW.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized, got %d", unauthW.Code)
	}

	// 2. With Token -> 200
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")
	req, _ := http.NewRequest(http.MethodGet, "/api/bio/my-page", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string         `json:"status"`
		Data   models.BioPage `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON: %v", err)
	}
	if resp.Data.Theme == "" {
		t.Errorf("Expected non-empty Theme")
	}
}

func TestBioLink_UpdateMyBioPage_Success(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	updatePayload := map[string]interface{}{
		"title":           "Official Distributor Bionet Gold - Ahmad Fauzi",
		"bio":             "Konsultan herbal profesional Bionet Indonesia. Khusus terapi asam urat & diabetes.",
		"theme":           "gold",
		"whatsapp_number": "6281299887766",
		"cta_button_text": "Konsultasi Asam Urat Sekarang",
		"cta_button_url":  "https://wa.me/6281299887766",
	}
	payloadBytes, _ := json.Marshal(updatePayload)

	req, _ := http.NewRequest(http.MethodPut, "/api/bio/my-page", bytes.NewBuffer(payloadBytes))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string         `json:"status"`
		Data   models.BioPage `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.Data.Theme != "gold" {
		t.Errorf("Expected theme 'gold', got '%s'", resp.Data.Theme)
	}
	if resp.Data.Title != "Official Distributor Bionet Gold - Ahmad Fauzi" {
		t.Errorf("Expected updated title, got '%s'", resp.Data.Title)
	}
}

func TestBioLink_SubmitLead_ValidationAndSuccess(t *testing.T) {
	router := setupTestServer()

	// 1. Validation Fail: Missing Name and Phone
	invalidPayload, _ := json.Marshal(map[string]string{
		"username": "mitra01",
	})
	badReq, _ := http.NewRequest(http.MethodPost, "/api/bio/lead", bytes.NewBuffer(invalidPayload))
	badReq.Header.Set("Content-Type", "application/json")
	badW := httptest.NewRecorder()
	router.ServeHTTP(badW, badReq)

	if badW.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request, got %d", badW.Code)
	}

	// 2. Valid Submission
	validPayload, _ := json.Marshal(map[string]interface{}{
		"username":         "mitra01",
		"name":             "Ir. H. Gunawan Susanto",
		"phone":            "0813-8899-0011",
		"email":            "gunawan@gmail.com",
		"city":             "Bandung",
		"product_interest": "Bio-Propolis Trigona",
		"notes":            "Mau coba 2 botol paket hemat promo untuk asam urat",
		"estimated_value":  450000,
	})
	goodReq, _ := http.NewRequest(http.MethodPost, "/api/bio/lead", bytes.NewBuffer(validPayload))
	goodReq.Header.Set("Content-Type", "application/json")
	goodW := httptest.NewRecorder()
	router.ServeHTTP(goodW, goodReq)

	if goodW.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d. Body: %s", goodW.Code, goodW.Body.String())
	}

	var leadResp struct {
		Status string      `json:"status"`
		Data   models.Lead `json:"data"`
	}
	json.Unmarshal(goodW.Body.Bytes(), &leadResp)

	if leadResp.Data.Status != "new" {
		t.Errorf("Expected lead status 'new', got '%s'", leadResp.Data.Status)
	}
	if leadResp.Data.Source != "bio_link" {
		t.Errorf("Expected lead source 'bio_link', got '%s'", leadResp.Data.Source)
	}
	if leadResp.Data.Phone != "6281388990011" {
		t.Errorf("Expected cleaned phone '6281388990011', got '%s'", leadResp.Data.Phone)
	}
}

func TestMarketing_GetKitsAndFilter(t *testing.T) {
	router := setupTestServer()

	// 1. Get All Kits
	req, _ := http.NewRequest(http.MethodGet, "/api/marketing/kits", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp struct {
		Status string                  `json:"status"`
		Data   []handlers.MarketingKit `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Data) < 4 {
		t.Errorf("Expected at least 4 marketing kits, got %d", len(resp.Data))
	}

	// 2. Filter by category 'promo_propolis'
	filterReq, _ := http.NewRequest(http.MethodGet, "/api/marketing/kits?category=promo_propolis", nil)
	filterW := httptest.NewRecorder()
	router.ServeHTTP(filterW, filterReq)

	var filterResp struct {
		Data []handlers.MarketingKit `json:"data"`
	}
	json.Unmarshal(filterW.Body.Bytes(), &filterResp)

	for _, k := range filterResp.Data {
		if k.Category != "promo_propolis" {
			t.Errorf("Expected category 'promo_propolis', got '%s'", k.Category)
		}
	}
}

func TestMarketing_GetWebinarsAndRegister(t *testing.T) {
	router := setupTestServer()

	// 1. Get Webinars
	req, _ := http.NewRequest(http.MethodGet, "/api/marketing/webinars", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp struct {
		Status string                    `json:"status"`
		Data   []handlers.WebinarSchedule `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Data) == 0 {
		t.Fatalf("Expected weekly BOP webinars list to not be empty")
	}

	webinarID := resp.Data[0].ID

	// 2. Register for Webinar
	regPayload, _ := json.Marshal(map[string]string{
		"webinar_id":       webinarID,
		"sponsor_username": "mitra01",
		"name":             "Dewi Lestari",
		"phone":            "081223344556",
		"email":            "dewi@gmail.com",
		"city":             "Surabaya",
	})
	regReq, _ := http.NewRequest(http.MethodPost, "/api/marketing/webinars/register", bytes.NewBuffer(regPayload))
	regReq.Header.Set("Content-Type", "application/json")
	regW := httptest.NewRecorder()
	router.ServeHTTP(regW, regReq)

	if regW.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d. Body: %s", regW.Code, regW.Body.String())
	}

	var regResp struct {
		Status string `json:"status"`
		Data   struct {
			TicketCode string `json:"ticket_code"`
			ZoomLink   string `json:"zoom_link"`
			Stage      string `json:"stage"`
		} `json:"data"`
	}
	json.Unmarshal(regW.Body.Bytes(), &regResp)

	if regResp.Data.TicketCode == "" {
		t.Errorf("Expected non-empty TicketCode")
	}
	if regResp.Data.Stage != "webinar" {
		t.Errorf("Expected stage 'webinar', got '%s'", regResp.Data.Stage)
	}
	if regResp.Data.ZoomLink == "" {
		t.Errorf("Expected ZoomLink to be present in registration ticket")
	}
}

// ============================================================================
// PILAR 2: GAMIFIKASI, MOTIVASI & DUPLIKASI JARINGAN TESTS
// ============================================================================

func TestGamification_Leaderboard_AllTypes(t *testing.T) {
	router := setupTestServer()

	types := []string{"sponsor", "omset", "pairing"}

	for _, rankType := range types {
		url := fmt.Sprintf("/api/gamification/leaderboard?type=%s&period=monthly", rankType)
		req, _ := http.NewRequest(http.MethodGet, url, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Failed to fetch leaderboard for type %s: got %d", rankType, w.Code)
		}

		var resp struct {
			Status string                    `json:"status"`
			Type   string                    `json:"type"`
			Data   []models.LeaderboardEntry `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)

		if resp.Type != rankType {
			t.Errorf("Expected response type '%s', got '%s'", rankType, resp.Type)
		}
		if len(resp.Data) == 0 {
			t.Errorf("Expected leaderboard entries for type %s", rankType)
		}
		if resp.Data[0].Rank != 1 {
			t.Errorf("Expected top performer rank to be 1")
		}
		if resp.Data[0].Score <= 0 {
			t.Errorf("Expected top performer score > 0")
		}
	}
}

func TestGamification_RewardProgress(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	req, _ := http.NewRequest(http.MethodGet, "/api/gamification/reward-progress", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string `json:"status"`
		Data   struct {
			TotalPVLeft  float64             `json:"total_pv_left"`
			TotalPVRight float64             `json:"total_pv_right"`
			Rewards      []models.RewardItem `json:"rewards"`
		} `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Data.Rewards) < 5 {
		t.Fatalf("Expected 5 dream reward tiers (Smartwatch, Umroh, Mobilio, Pajero, Rumah), got %d", len(resp.Data.Rewards))
	}

	foundSmartwatch := false
	foundUmroh := false
	foundMobilio := false
	foundPajero := false
	foundRumah := false

	for _, rew := range resp.Data.Rewards {
		if rew.ID == "rew-01" {
			foundSmartwatch = true
		}
		if rew.ID == "rew-02" {
			foundUmroh = true
		}
		if rew.ID == "rew-03" {
			foundMobilio = true
		}
		if rew.ID == "rew-04" {
			foundPajero = true
		}
		if rew.ID == "rew-05" {
			foundRumah = true
		}
		if rew.ProgressPercentage < 0 || rew.ProgressPercentage > 100 {
			t.Errorf("Progress percentage out of bounds [0, 100]: %f", rew.ProgressPercentage)
		}
	}

	if !foundSmartwatch || !foundUmroh || !foundMobilio || !foundPajero || !foundRumah {
		t.Errorf("Expected all 5 dream rewards to be listed in race progress")
	}
}

func TestGamification_Academy_ModulesAndCompletion(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Get 7 Modules
	req, _ := http.NewRequest(http.MethodGet, "/api/academy/modules", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp struct {
		Status string                 `json:"status"`
		Data   []models.AcademyModule `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Data) != 7 {
		t.Fatalf("Expected exactly 7 core academy curriculum modules, got %d", len(resp.Data))
	}

	// 2. Complete Module 1
	compPayload, _ := json.Marshal(map[string]interface{}{
		"module_id": "mod-01",
		"score":     100,
		"answers":   []int{1, 1},
	})
	compReq, _ := http.NewRequest(http.MethodPost, "/api/academy/complete", bytes.NewBuffer(compPayload))
	compReq.Header.Set("Authorization", "Bearer "+token)
	compReq.Header.Set("Content-Type", "application/json")
	compW := httptest.NewRecorder()
	router.ServeHTTP(compW, compReq)

	if compW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", compW.Code, compW.Body.String())
	}

	var compResp struct {
		Status string `json:"status"`
		Badge  string `json:"badge"`
	}
	json.Unmarshal(compW.Body.Bytes(), &compResp)

	if compResp.Badge != "Bionet Pioneer" {
		t.Errorf("Expected badge 'Bionet Pioneer', got '%s'", compResp.Badge)
	}

	// 3. Re-query modules to verify completion status
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req)
	var resp2 struct {
		Data []models.AcademyModule `json:"data"`
	}
	json.Unmarshal(w2.Body.Bytes(), &resp2)

	if !resp2.Data[0].IsCompleted {
		t.Errorf("Expected Module 1 to be marked as completed")
	}
}

func TestGamification_InactivityAlerts(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	req, _ := http.NewRequest(http.MethodGet, "/api/gamification/inactivity-alerts", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp struct {
		Status string                   `json:"status"`
		Data   []models.InactivityAlert `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)

	if len(resp.Data) == 0 {
		t.Fatalf("Expected inactivity alerts list to not be empty")
	}

	for _, alert := range resp.Data {
		if alert.DaysInactive < 14 {
			t.Errorf("Expected downlines inactive for 14+ days, got %d", alert.DaysInactive)
		}
		if alert.SuggestedWhatsAppText == "" {
			t.Errorf("Expected suggested WhatsApp coaching script")
		}
	}
}

// ============================================================================
// PILAR 3: WHATSAPP CRM LANJUTAN (WAHA DOCKER EXPANSION) TESTS
// ============================================================================

func TestWhatsApp_SendMedia(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Missing required fields -> 400
	badPayload, _ := json.Marshal(map[string]string{
		"phone": "081234567890",
	})
	badReq, _ := http.NewRequest(http.MethodPost, "/api/crm/whatsapp/send-media", bytes.NewBuffer(badPayload))
	badReq.Header.Set("Authorization", "Bearer "+token)
	badReq.Header.Set("Content-Type", "application/json")
	badW := httptest.NewRecorder()
	router.ServeHTTP(badW, badReq)

	if badW.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request, got %d", badW.Code)
	}

	// 2. Send Voice / Audio Note
	voicePayload, _ := json.Marshal(map[string]string{
		"phone":      "081234567890",
		"recipient":  "Bpk. Santoso",
		"media_type": "voice",
		"media_url":  "https://bionet.id/assets/audio/penjelasan-propolis.mp3",
		"caption":    "Voice Note: Cara Minum Propolis Trigona",
		"category":   "crm_consultation",
	})
	voiceReq, _ := http.NewRequest(http.MethodPost, "/api/crm/whatsapp/send-media", bytes.NewBuffer(voicePayload))
	voiceReq.Header.Set("Authorization", "Bearer "+token)
	voiceReq.Header.Set("Content-Type", "application/json")
	voiceW := httptest.NewRecorder()
	router.ServeHTTP(voiceW, voiceReq)

	if voiceW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for voice media send, got %d. Body: %s", voiceW.Code, voiceW.Body.String())
	}

	// 3. Send Document / PDF
	docPayload, _ := json.Marshal(map[string]string{
		"phone":      "081298765432",
		"recipient":  "Ibu Sri Rahayu",
		"media_type": "document",
		"media_url":  "https://bionet.id/assets/legal/bpom-certificate.pdf",
		"caption":    "Sertifikat Izin Edar BPOM RI TR 226012891.pdf",
		"category":   "crm_legality",
	})
	docReq, _ := http.NewRequest(http.MethodPost, "/api/crm/whatsapp/send-media", bytes.NewBuffer(docPayload))
	docReq.Header.Set("Authorization", "Bearer "+token)
	docReq.Header.Set("Content-Type", "application/json")
	docW := httptest.NewRecorder()
	router.ServeHTTP(docW, docReq)

	if docW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for document media send, got %d. Body: %s", docW.Code, docW.Body.String())
	}
}

func TestWhatsApp_Schedules_CRUD(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Get Schedules
	getReq, _ := http.NewRequest(http.MethodGet, "/api/crm/whatsapp/schedules", nil)
	getReq.Header.Set("Authorization", "Bearer "+token)
	getW := httptest.NewRecorder()
	router.ServeHTTP(getW, getReq)

	if getW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", getW.Code)
	}

	var getResp struct {
		Status string                    `json:"status"`
		Data   []models.WhatsAppSchedule `json:"data"`
	}
	json.Unmarshal(getW.Body.Bytes(), &getResp)

	// Schedules list returned successfully
	if getResp.Status != "success" {
		t.Errorf("Expected status success, got %s", getResp.Status)
	}

	// 2. Create New Schedule
	createPayload, _ := json.Marshal(map[string]interface{}{
		"recipient":   "Bpk. Joko Anwar",
		"phone":       "081233445566",
		"message":     "Halo Pak Joko, kami ingin mengingatkan jadwal konsultasi herbal lanjutan besok pagi pukul 10.00 WIB.",
		"category":    "crm_followup",
		"delay_hours": 24,
	})
	createReq, _ := http.NewRequest(http.MethodPost, "/api/crm/whatsapp/schedules", bytes.NewBuffer(createPayload))
	createReq.Header.Set("Authorization", "Bearer "+token)
	createReq.Header.Set("Content-Type", "application/json")
	createW := httptest.NewRecorder()
	router.ServeHTTP(createW, createReq)

	if createW.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created, got %d. Body: %s", createW.Code, createW.Body.String())
	}

	var createResp struct {
		Status string                  `json:"status"`
		Data   models.WhatsAppSchedule `json:"data"`
	}
	json.Unmarshal(createW.Body.Bytes(), &createResp)

	newID := createResp.Data.ID
	if newID == "" {
		t.Fatalf("Expected created schedule to have an ID")
	}
	if createResp.Data.Phone != "6281233445566" {
		t.Errorf("Expected formatted phone '6281233445566', got '%s'", createResp.Data.Phone)
	}
	if createResp.Data.ScheduledAt.Before(time.Now()) {
		t.Errorf("Expected ScheduledAt in future")
	}

	// 3. Delete Schedule
	delReq, _ := http.NewRequest(http.MethodDelete, "/api/crm/whatsapp/schedules/"+newID, nil)
	delReq.Header.Set("Authorization", "Bearer "+token)
	delW := httptest.NewRecorder()
	router.ServeHTTP(delW, delReq)

	if delW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for delete schedule, got %d", delW.Code)
	}
}
