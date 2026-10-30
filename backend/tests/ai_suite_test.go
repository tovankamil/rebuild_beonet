package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"bionet-backend/models"
)

// ============================================================================
// 1. AI HERBAL DOCTOR & SMART HEALTH CONSULTATION TESTS
// ============================================================================

func TestAISuite_HealthConsult_AsamUrat_Success(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.HealthConsultRequest{
		CustomerName:       "Bapak Sugeng",
		Age:                52,
		Gender:             "Pria",
		Complaint:          "Nyeri sendi kaki dan lutut akibat asam urat tinggi",
		HasGastricUlcer:    false,
		Allergies:          "Tidak ada",
		CurrentMedications: "Allopurinol",
		Phone:              "081234567890",
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/health-consult", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.HealthConsultResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.CustomerName != "Bapak Sugeng" {
		t.Errorf("Expected customer_name 'Bapak Sugeng', got '%s'", resp.CustomerName)
	}
	if len(resp.Products) == 0 {
		t.Errorf("Expected recommended products, got empty list")
	}
	// Check warm water guide
	if !strings.Contains(strings.ToLower(resp.WarmWaterGuide), "air hangat") {
		t.Errorf("Expected warm water guide to mention 'air hangat', got '%s'", resp.WarmWaterGuide)
	}
	// Check dietary restrictions
	if len(resp.Restrictions) == 0 {
		t.Errorf("Expected restrictions list for asam urat, got empty")
	}
	// Check medical disclaimer
	if !strings.Contains(resp.MedicalDisclaimer, "DISCLAIMER MEDIS") {
		t.Errorf("Expected medical disclaimer, got '%s'", resp.MedicalDisclaimer)
	}
	// Check WA order text & URL
	if !strings.Contains(resp.WhatsAppOrderURL, "https://wa.me/") {
		t.Errorf("Expected valid WA order URL, got '%s'", resp.WhatsAppOrderURL)
	}
}

func TestAISuite_HealthConsult_GastricUlcer_WarmWaterInstruction(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.HealthConsultRequest{
		CustomerName:    "Ibu Maya",
		Age:             38,
		Gender:          "Wanita",
		Complaint:       "Perut perih maag kronis dan mual asam lambung",
		HasGastricUlcer: true, // Has history of gastric ulcer / maag
		Phone:           "081987654321",
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/health-consult", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.HealthConsultResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	// Must instruct to drink AFTER meal due to gastric ulcer
	if !strings.Contains(strings.ToLower(resp.WarmWaterGuide), "setelah makan") {
		t.Errorf("Expected warm water guide to instruct taking herbal after meals for ulcer patients, got: %s", resp.WarmWaterGuide)
	}
}

func TestAISuite_HealthConsult_ValidationError(t *testing.T) {
	router := setupTestServer()

	// Missing required field 'complaint'
	reqPayload := map[string]interface{}{
		"customer_name": "Pak Budi",
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/health-consult", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request on missing complaint, got %d", w.Code)
	}
}

// ============================================================================
// 2. AI DYNAMIC OBJECTION HANDLER TESTS
// ============================================================================

func TestAISuite_ObjectionHandler_AllSupportedTypes(t *testing.T) {
	router := setupTestServer()

	objectionTypes := []string{"mahal", "trauma_mlm", "efek_samping", "izin_bpom", "ragu_khasiat", "obat_dokter"}

	for _, objType := range objectionTypes {
		reqPayload := models.ObjectionRequest{
			ObjectionType: objType,
			ProspectName:  "Ibu Anisa",
			ProductName:   "Bionet Bio-Propolis Trigona",
			MitraName:     "Mitra Bionet Juara",
		}

		body, _ := json.Marshal(reqPayload)
		req, _ := http.NewRequest(http.MethodPost, "/api/ai/objection-handler", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("[%s] Expected 200 OK, got %d. Body: %s", objType, w.Code, w.Body.String())
		}

		var resp models.ObjectionResponse
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("[%s] Failed to parse JSON response: %v", objType, err)
		}

		if resp.Status != "success" {
			t.Errorf("[%s] Expected status 'success', got '%s'", objType, resp.Status)
		}
		if resp.ObjectionType != objType {
			t.Errorf("[%s] Expected objection_type '%s', got '%s'", objType, objType, resp.ObjectionType)
		}
		if resp.Framework == "" {
			t.Errorf("[%s] Expected framework to be populated", objType)
		}
		if !strings.Contains(resp.ClosingScript, "Ibu Anisa") {
			t.Errorf("[%s] Expected script to mention prospect name 'Ibu Anisa'", objType)
		}
		if resp.ClosingTip == "" {
			t.Errorf("[%s] Expected closing tip to be populated", objType)
		}
		if len(resp.AlternativeHooks) == 0 {
			t.Errorf("[%s] Expected alternative hooks list", objType)
		}
	}
}

func TestAISuite_ObjectionHandler_MissingType_BadRequest(t *testing.T) {
	router := setupTestServer()

	reqPayload := map[string]string{
		"prospect_name": "Pak Joko",
	}
	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/objection-handler", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request, got %d", w.Code)
	}
}

// ============================================================================
// 3. AI BINARY PLACEMENT & SPILLOVER STRATEGIST TESTS
// ============================================================================

func TestAISuite_BinaryAdvisor_Success(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodGet, "/api/ai/binary-advisor?user_id=mitra01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.BinaryAdvisorResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.StrongLeg == "" || resp.WeakLeg == "" {
		t.Errorf("Expected strong and weak legs to be identified")
	}
	if resp.PairBonusValue != 25000.0 {
		t.Errorf("Expected PairBonusValue = 25000, got %.2f", resp.PairBonusValue)
	}
	expectedBonus := float64(resp.PotentialUnearnedPairs) * 25000.0
	if resp.PotentialUnearnedBonus != expectedBonus {
		t.Errorf("Expected unearned bonus %.2f, got %.2f", expectedBonus, resp.PotentialUnearnedBonus)
	}
	if resp.RecommendedPlacementLeg != resp.WeakLeg {
		t.Errorf("Expected recommended placement leg '%s' to match weak leg '%s'", resp.RecommendedPlacementLeg, resp.WeakLeg)
	}
	if resp.StrategyInsight == "" {
		t.Errorf("Expected strategy insight to be populated")
	}
	if len(resp.ActionPlan) == 0 {
		t.Errorf("Expected action plan items")
	}
}

// ============================================================================
// 4. AI 1-CLICK COPYWRITING STUDIO TESTS
// ============================================================================

func TestAISuite_Copywriting_ChannelsAndTones(t *testing.T) {
	router := setupTestServer()

	testMatrix := []struct {
		Channel string
		Tone    string
		MustContain string
	}{
		{"wa_story", "berkah", "BERKAH"},
		{"tiktok_script", "medis", "[00:00 - 00:03]"},
		{"ig_caption", "medis", "BPOM"},
		{"fb_ad", "hard_selling", "wa.me"},
	}

	for _, tc := range testMatrix {
		reqPayload := models.CopywritingRequest{
			Channel:        tc.Channel,
			Tone:           tc.Tone,
			ProductName:    "Bionet Bio-Propolis Trigona",
			MitraName:      "Ahmad Fauzi",
			WhatsAppNumber: "081234567890",
			ReferralCode:   "FAUZI88",
		}

		body, _ := json.Marshal(reqPayload)
		req, _ := http.NewRequest(http.MethodPost, "/api/ai/generate-copywriting", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("[%s-%s] Expected 200 OK, got %d. Body: %s", tc.Channel, tc.Tone, w.Code, w.Body.String())
		}

		var resp models.CopywritingResponse
		if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
			t.Fatalf("[%s-%s] Failed to parse JSON response: %v", tc.Channel, tc.Tone, err)
		}

		if resp.Status != "success" {
			t.Errorf("[%s-%s] Expected status 'success', got '%s'", tc.Channel, tc.Tone, resp.Status)
		}
		if !strings.Contains(resp.GeneratedCopy, tc.MustContain) {
			t.Errorf("[%s-%s] Expected generated copy to contain '%s'", tc.Channel, tc.Tone, tc.MustContain)
		}
		if !strings.Contains(resp.WhatsAppShareURL, "wa.me/6281234567890") {
			t.Errorf("[%s-%s] Expected share URL with phone number, got: %s", tc.Channel, tc.Tone, resp.WhatsAppShareURL)
		}
		if len(resp.Hashtags) == 0 {
			t.Errorf("[%s-%s] Expected hashtags", tc.Channel, tc.Tone)
		}
	}
}

func TestAISuite_Copywriting_InvalidChannel_BadRequest(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.CopywritingRequest{
		Channel: "billboard_led",
	}
	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/generate-copywriting", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request, got %d", w.Code)
	}
}

// ============================================================================
// 5. AI DOWNLINE CHURN PREDICTOR & INACTIVITY RADAR TESTS
// ============================================================================

func TestAISuite_ChurnRadar_Success(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodGet, "/api/ai/churn-radar?upline_id=mitra01", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.ChurnRadarResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.TotalMonitored == 0 {
		t.Errorf("Expected total monitored > 0")
	}
	if resp.AtRiskCount == 0 || len(resp.Downlines) == 0 {
		t.Errorf("Expected at least one inactive downline detected")
	}

	firstDL := resp.Downlines[0]
	if firstDL.DaysInactive < 14 {
		t.Errorf("Expected inactive downline days >= 14, got %d", firstDL.DaysInactive)
	}
	if firstDL.ChurnRiskScore < 0 || firstDL.ChurnRiskScore > 100 {
		t.Errorf("Expected churn risk score between 0 and 100, got %d", firstDL.ChurnRiskScore)
	}
	if firstDL.MotivationDraft == "" {
		t.Errorf("Expected motivation draft to be generated")
	}
	if !strings.Contains(firstDL.WhatsAppDirectURL, "https://wa.me/") {
		t.Errorf("Expected WhatsApp direct link, got '%s'", firstDL.WhatsAppDirectURL)
	}
}

// ============================================================================
// 6. AI VOICE NOTE SCRIPT & DISPATCHER TESTS
// ============================================================================

func TestAISuite_VoiceNote_ScriptGeneration(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.VoiceNoteRequest{
		ProspectName:  "Ibu Ratna",
		ProspectPhone: "08123456789",
		Topic:         "follow_up_herbal",
		Tone:          "warm_friendly",
		SendToWAHA:    false,
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/voice-note", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.VoiceNoteResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if !strings.Contains(resp.ScriptText, "Ibu Ratna") {
		t.Errorf("Expected script to mention prospect name, got: %s", resp.ScriptText)
	}
	if resp.EstimatedDurationSeconds <= 0 {
		t.Errorf("Expected estimated duration > 0, got %d", resp.EstimatedDurationSeconds)
	}
	if resp.WAHADispatchStatus != "script_ready_for_recording" {
		t.Errorf("Expected status 'script_ready_for_recording', got '%s'", resp.WAHADispatchStatus)
	}
}

func TestAISuite_VoiceNote_WithWAHADispatch(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.VoiceNoteRequest{
		ProspectName:  "Pak Hendra",
		ProspectPhone: "081399887766",
		Topic:         "closing_promo",
		SendToWAHA:    true,
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/voice-note", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp models.VoiceNoteResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.WAHADispatchStatus != "dispatched_to_waha_queue" {
		t.Errorf("Expected WAHA dispatch status 'dispatched_to_waha_queue', got '%s'", resp.WAHADispatchStatus)
	}
	if resp.WAHAPayload == nil {
		t.Errorf("Expected WAHAPayload object to be present")
	}
}

// ============================================================================
// 7. AI OCR & ANTI-FRAUD SCANNER TESTS
// ============================================================================

func TestAISuite_FraudScan_ValidDocument_AutoApproved(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.FraudScanRequest{
		DocumentType:      "ktp",
		NIK:               "3201011506880002", // Valid 16-digit numeric Jawa Barat
		FullName:          "Budi Santoso",
		BankAccountName:   "Budi Santoso",
		BankAccountNumber: "8271928371",
		TransferAmount:    250000.0,
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/fraud-scan", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.FraudScanResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if !resp.IsAuthentic {
		t.Errorf("Expected authentic = true for clean document")
	}
	if !resp.NIKValidation.Valid {
		t.Errorf("Expected NIK to be valid, reason: %s", resp.NIKValidation.Reason)
	}
	if resp.NameMatchScore != 1.0 {
		t.Errorf("Expected perfect name match 1.0, got %.2f", resp.NameMatchScore)
	}
	if resp.RiskLevel != "Low" {
		t.Errorf("Expected Low risk, got '%s'", resp.RiskLevel)
	}
	if resp.Recommendation != "Auto-Approve" {
		t.Errorf("Expected 'Auto-Approve', got '%s'", resp.Recommendation)
	}
}

func TestAISuite_FraudScan_Anomalies_HighRisk(t *testing.T) {
	router := setupTestServer()

	reqPayload := models.FraudScanRequest{
		DocumentType:      "ktp",
		NIK:               "3201ABC99", // Invalid: non-numeric and length != 16
		FullName:          "Budi Santoso",
		BankAccountName:   "Ahmad Dahlan", // Name mismatch
		BankAccountNumber: "1122334455",
		TransferAmount:    -10000.0, // Negative transfer anomaly
	}

	body, _ := json.Marshal(reqPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/ai/fraud-scan", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d", w.Code)
	}

	var resp models.FraudScanResponse
	json.Unmarshal(w.Body.Bytes(), &resp)

	if resp.IsAuthentic {
		t.Errorf("Expected is_authentic = false for fraudulent document")
	}
	if resp.NIKValidation.Valid {
		t.Errorf("Expected NIK validation to fail")
	}
	if len(resp.DetectedAnomalies) < 2 {
		t.Errorf("Expected multiple anomalies detected, got %d", len(resp.DetectedAnomalies))
	}
	if resp.FraudRiskScore < 50 {
		t.Errorf("Expected fraud risk score >= 50, got %d", resp.FraudRiskScore)
	}
}

// ============================================================================
// 8. AI REPEAT ORDER (RO) RETENTION SCHEDULER TESTS
// ============================================================================

func TestAISuite_RORetention_Success(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodGet, "/api/ai/ro-retention", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp models.RORetentionResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.TotalDueCount == 0 || len(resp.Customers) == 0 {
		t.Errorf("Expected customers due for RO retention, got 0")
	}

	firstCust := resp.Customers[0]
	if firstCust.DaysElapsed < 20 {
		t.Errorf("Expected days elapsed >= 20, got %d", firstCust.DaysElapsed)
	}
	if firstCust.PersonalizedMessage == "" {
		t.Errorf("Expected personalized RO message")
	}
	if !strings.Contains(firstCust.WhatsAppURL, "https://wa.me/") {
		t.Errorf("Expected valid WhatsApp direct URL, got '%s'", firstCust.WhatsAppURL)
	}
	if resp.AIStrategyNote == "" {
		t.Errorf("Expected AI strategy note")
	}
}
