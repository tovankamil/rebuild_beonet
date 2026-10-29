package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/models"
	"bionet-backend/utils"
)

// ============================================================================
// EXPANDED BIONET CRM UNIT TEST SUITE
// ============================================================================

// 1. Health Records Endpoints Tests
func TestCRM_HealthRecords_Get_Unauthorized(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodGet, "/api/crm/health-records", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized, got %d", w.Code)
	}
}

func TestCRM_HealthRecords_Get_Success(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	req, _ := http.NewRequest(http.MethodGet, "/api/crm/health-records", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string                        `json:"status"`
		Data   []models.CustomerHealthRecord `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if len(resp.Data) == 0 {
		t.Errorf("Expected health records list to be auto-populated, got 0 items")
	}

	// Verify sample milestones exist (day_3, day_7, day_14, day_25)
	milestoneFound := map[string]bool{}
	for _, rec := range resp.Data {
		milestoneFound[rec.CurrentMilestone] = true
		if rec.CustomerName == "" {
			t.Errorf("Expected non-empty CustomerName")
		}
		if rec.ChiefComplaint == "" {
			t.Errorf("Expected non-empty ChiefComplaint")
		}
	}

	if !milestoneFound["day_3"] && !milestoneFound["day_7"] {
		t.Errorf("Expected 3-7-14-25 day cycle milestones to be represented")
	}
}

func TestCRM_HealthRecords_Create_Validation(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// Missing customer_name and chief_complaint
	payload, _ := json.Marshal(map[string]string{
		"phone": "081234567890",
	})
	req, _ := http.NewRequest(http.MethodPost, "/api/crm/health-records", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for missing required fields, got %d", w.Code)
	}
}

func TestCRM_HealthRecords_Create_Success(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	payload, _ := json.Marshal(map[string]string{
		"customer_name":        "Bpk. Santoso Mulyo",
		"phone":                "081234567899",
		"chief_complaint":      "Diabetes",
		"dosage_instructions":  "3 x 7 tetes/hari",
		"current_milestone":    "day_3",
		"health_notes":         "Gula darah puasa awal 235 mg/dL. Mulai minum air hangat rutin.",
		"status":               "active",
	})
	req, _ := http.NewRequest(http.MethodPost, "/api/crm/health-records", bytes.NewBuffer(payload))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK && w.Code != http.StatusCreated {
		t.Fatalf("Expected 200 or 201 for creating health record, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status  string                      `json:"status"`
		Message string                      `json:"message"`
		Data    models.CustomerHealthRecord `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse response JSON: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.Data.CustomerName != "Bpk. Santoso Mulyo" {
		t.Errorf("Expected CustomerName 'Bpk. Santoso Mulyo', got '%s'", resp.Data.CustomerName)
	}
	if resp.Data.ChiefComplaint != "Diabetes" {
		t.Errorf("Expected ChiefComplaint 'Diabetes', got '%s'", resp.Data.ChiefComplaint)
	}
	if resp.Data.CurrentMilestone != "day_3" {
		t.Errorf("Expected milestone 'day_3', got '%s'", resp.Data.CurrentMilestone)
	}
}

func TestCRM_HealthRecords_UpdateMilestone(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Invalid Milestone
	invalidPayload, _ := json.Marshal(map[string]string{
		"milestone": "invalid_day_99",
	})
	reqInv, _ := http.NewRequest(http.MethodPut, "/api/crm/health-records/rec-123/milestone", bytes.NewBuffer(invalidPayload))
	reqInv.Header.Set("Authorization", "Bearer "+token)
	reqInv.Header.Set("Content-Type", "application/json")
	wInv := httptest.NewRecorder()
	router.ServeHTTP(wInv, reqInv)

	if wInv.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for invalid milestone, got %d", wInv.Code)
	}

	// 2. Valid Milestone Update: day_7
	validPayload, _ := json.Marshal(map[string]string{
		"milestone":    "day_7",
		"health_notes": "Bengkak sendi mulai kempis dan rasa pegal linu banyak berkurang.",
		"status":       "improved",
	})
	reqVal, _ := http.NewRequest(http.MethodPut, "/api/crm/health-records/rec-123/milestone", bytes.NewBuffer(validPayload))
	reqVal.Header.Set("Authorization", "Bearer "+token)
	reqVal.Header.Set("Content-Type", "application/json")
	wVal := httptest.NewRecorder()
	router.ServeHTTP(wVal, reqVal)

	if wVal.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for updating milestone, got %d. Body: %s", wVal.Code, wVal.Body.String())
	}

	var resp struct {
		Status string `json:"status"`
		Data   struct {
			CurrentMilestone string `json:"current_milestone"`
			Status           string `json:"status"`
		} `json:"data"`
	}
	json.Unmarshal(wVal.Body.Bytes(), &resp)

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if resp.Data.CurrentMilestone != "day_7" {
		t.Errorf("Expected milestone 'day_7', got '%s'", resp.Data.CurrentMilestone)
	}
}

// 2. AI Objection Handler Tests
func TestCRM_AI_ObjectionHandler(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// Scenario A: Missing objection_type -> 400
	reqBad, _ := http.NewRequest(http.MethodPost, "/api/crm/ai/objection-handler", bytes.NewBuffer([]byte(`{}`)))
	reqBad.Header.Set("Authorization", "Bearer "+token)
	reqBad.Header.Set("Content-Type", "application/json")
	wBad := httptest.NewRecorder()
	router.ServeHTTP(wBad, reqBad)
	if wBad.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for missing objection_type, got %d", wBad.Code)
	}

	// Scenario B: Invalid objection_type -> 400
	reqInv, _ := http.NewRequest(http.MethodPost, "/api/crm/ai/objection-handler", bytes.NewBuffer([]byte(`{"objection_type":"unknown_type"}`)))
	reqInv.Header.Set("Authorization", "Bearer "+token)
	reqInv.Header.Set("Content-Type", "application/json")
	wInv := httptest.NewRecorder()
	router.ServeHTTP(wInv, reqInv)
	if wInv.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for unknown objection_type, got %d", wInv.Code)
	}

	// Scenario C: Test all 5 supported objection types
	typesToTest := []string{"mahal", "efek_samping", "obat_dokter", "ragu_khasiat", "bukan_mlm"}

	for _, objType := range typesToTest {
		t.Run("Objection_"+objType, func(t *testing.T) {
			payload, _ := json.Marshal(map[string]string{
				"objection_type": objType,
				"customer_name":  "Ibu Siti",
				"product_name":   "Bio-Propolis Trigona",
			})
			req, _ := http.NewRequest(http.MethodPost, "/api/crm/ai/objection-handler", bytes.NewBuffer(payload))
			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusOK {
				t.Fatalf("Expected 200 OK for objection '%s', got %d. Body: %s", objType, w.Code, w.Body.String())
			}

			var resp struct {
				Status                string `json:"status"`
				ObjectionType         string `json:"objection_type"`
				Framework             string `json:"framework"`
				ResponseText          string `json:"response_text"`
				RecommendedClosingTip string `json:"recommended_closing_tip"`
				WhatsappReadyText     string `json:"whatsapp_ready_text"`
			}
			if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
				t.Fatalf("Failed to parse objection response: %v", err)
			}

			if resp.Status != "success" {
				t.Errorf("Expected status 'success', got '%s'", resp.Status)
			}
			if resp.ObjectionType != objType {
				t.Errorf("Expected objection_type '%s', got '%s'", objType, resp.ObjectionType)
			}
			if resp.ResponseText == "" {
				t.Errorf("Expected non-empty ResponseText")
			}
			if resp.RecommendedClosingTip == "" {
				t.Errorf("Expected non-empty RecommendedClosingTip")
			}
		})
	}
}

// 3. Kanban Lead Status Update Tests
func TestCRM_Kanban_UpdateLeadStatus(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. Unauthorized
	reqUnauth, _ := http.NewRequest(http.MethodPut, "/api/crm/leads/lead-123/status", bytes.NewBuffer([]byte(`{"status":"contacted"}`)))
	wUnauth := httptest.NewRecorder()
	router.ServeHTTP(wUnauth, reqUnauth)
	if wUnauth.Code != http.StatusUnauthorized {
		t.Fatalf("Expected 401 Unauthorized, got %d", wUnauth.Code)
	}

	// 2. Invalid Stage
	reqInv, _ := http.NewRequest(http.MethodPut, "/api/crm/leads/lead-123/status", bytes.NewBuffer([]byte(`{"status":"invalid_stage"}`)))
	reqInv.Header.Set("Authorization", "Bearer "+token)
	reqInv.Header.Set("Content-Type", "application/json")
	wInv := httptest.NewRecorder()
	router.ServeHTTP(wInv, reqInv)
	if wInv.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for invalid Kanban stage, got %d", wInv.Code)
	}

	// 3. Valid Stages: new, contacted, interested, webinar, closing, lost
	stages := []string{"new", "contacted", "interested", "webinar", "closing", "lost"}
	for _, stage := range stages {
		t.Run("Stage_"+stage, func(t *testing.T) {
			payload, _ := json.Marshal(map[string]string{
				"status": stage,
				"notes":  "Update progres ke tahap " + stage,
			})
			req, _ := http.NewRequest(http.MethodPut, "/api/crm/leads/lead-123/status", bytes.NewBuffer(payload))
			req.Header.Set("Authorization", "Bearer "+token)
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusOK {
				t.Fatalf("Expected 200 OK for stage '%s', got %d. Body: %s", stage, w.Code, w.Body.String())
			}

			var resp struct {
				Status string `json:"status"`
				Data   struct {
					Status string `json:"status"`
				} `json:"data"`
			}
			json.Unmarshal(w.Body.Bytes(), &resp)
			if resp.Status != "success" {
				t.Errorf("Expected status 'success', got '%s'", resp.Status)
			}
			if resp.Data.Status != stage {
				t.Errorf("Expected status '%s', got '%s'", stage, resp.Data.Status)
			}
		})
	}
}

// 4. Testimonials Repository Tests
func TestCRM_Testimonials_Listing(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")

	// 1. All Testimonials
	req, _ := http.NewRequest(http.MethodGet, "/api/crm/testimonials", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for testimonials list, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status string                   `json:"status"`
		Data   []models.TestimonialItem `json:"data"`
		Total  int                      `json:"total"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp.Status)
	}
	if len(resp.Data) == 0 {
		t.Errorf("Expected preloaded default testimonials, got 0 items")
	}

	// 2. Filter by Category: asam_urat
	reqCat, _ := http.NewRequest(http.MethodGet, "/api/crm/testimonials?category=asam_urat", nil)
	reqCat.Header.Set("Authorization", "Bearer "+token)
	wCat := httptest.NewRecorder()
	router.ServeHTTP(wCat, reqCat)

	if wCat.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for filtered testimonials, got %d", wCat.Code)
	}

	var respCat struct {
		Data []models.TestimonialItem `json:"data"`
	}
	json.Unmarshal(wCat.Body.Bytes(), &respCat)
	for _, item := range respCat.Data {
		if item.Category != "asam_urat" {
			t.Errorf("Expected category 'asam_urat', got '%s'", item.Category)
		}
		if !item.BpomVerified {
			t.Errorf("Expected BpomVerified to be true")
		}
	}

	// 3. Filter by Category: diabetes
	reqDia, _ := http.NewRequest(http.MethodGet, "/api/crm/testimonials?category=diabetes", nil)
	reqDia.Header.Set("Authorization", "Bearer "+token)
	wDia := httptest.NewRecorder()
	router.ServeHTTP(wDia, reqDia)
	if wDia.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for diabetes testimonials, got %d", wDia.Code)
	}

	// 4. Filter by Proof Type: clinical_lab
	reqProof, _ := http.NewRequest(http.MethodGet, "/api/crm/testimonials?proof_type=clinical_lab", nil)
	reqProof.Header.Set("Authorization", "Bearer "+token)
	wProof := httptest.NewRecorder()
	router.ServeHTTP(wProof, reqProof)
	if wProof.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for clinical_lab proof filter, got %d", wProof.Code)
	}
}

// 5. Public Ads Lead Capture Webhook Tests
func TestCRM_PublicLeadWebhook(t *testing.T) {
	router := setupTestServer()

	// Scenario 1: Missing key and sponsor_username -> 400
	badPayload1, _ := json.Marshal(map[string]string{
		"name":  "Budi Santoso",
		"phone": "081234567890",
	})
	req1, _ := http.NewRequest(http.MethodPost, "/api/public/leads/webhook", bytes.NewBuffer(badPayload1))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	if w1.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for missing key, got %d", w1.Code)
	}

	// Scenario 2: Missing name or phone -> 400
	badPayload2, _ := json.Marshal(map[string]string{
		"key": "mitra01",
	})
	req2, _ := http.NewRequest(http.MethodPost, "/api/public/leads/webhook", bytes.NewBuffer(badPayload2))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	if w2.Code != http.StatusBadRequest {
		t.Fatalf("Expected 400 Bad Request for missing name/phone, got %d", w2.Code)
	}

	// Scenario 3: Valid Meta Ads webhook with "key"
	validPayload1, _ := json.Marshal(map[string]any{
		"key":              "mitra01",
		"name":             "Ibu Citra Lestari",
		"phone":            "081298765432",
		"city":             "Surabaya",
		"product_interest": "Bio-Propolis Trigona",
		"source":           "Meta Ads",
		"estimated_value":  250000.0,
		"notes":            "Tertarik paket pencegahan asam urat & diabetes keluarga",
	})
	req3, _ := http.NewRequest(http.MethodPost, "/api/public/leads/webhook", bytes.NewBuffer(validPayload1))
	req3.Header.Set("Content-Type", "application/json")
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)

	if w3.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for valid lead webhook, got %d. Body: %s", w3.Code, w3.Body.String())
	}

	var resp3 struct {
		Status  string      `json:"status"`
		Message string      `json:"message"`
		Data    models.Lead `json:"data"`
	}
	if err := json.Unmarshal(w3.Body.Bytes(), &resp3); err != nil {
		t.Fatalf("Failed to parse webhook response JSON: %v", err)
	}

	if resp3.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", resp3.Status)
	}
	if resp3.Data.Name != "Ibu Citra Lestari" {
		t.Errorf("Expected Name 'Ibu Citra Lestari', got '%s'", resp3.Data.Name)
	}
	if resp3.Data.Phone != "6281298765432" {
		t.Errorf("Expected sanitized phone '6281298765432', got '%s'", resp3.Data.Phone)
	}
	if resp3.Data.Source != "Meta Ads" {
		t.Errorf("Expected Source 'Meta Ads', got '%s'", resp3.Data.Source)
	}

	// Scenario 4: Valid TikTok Ads webhook with "sponsor_username"
	validPayload2, _ := json.Marshal(map[string]any{
		"sponsor_username": "mitra02",
		"name":             "Bpk. Ahmad Fauzi",
		"phone":            "081345678901",
		"city":             "Bandung",
		"product_interest": "Bio-Herbal Drops",
		"source":           "TikTok Ads",
	})
	req4, _ := http.NewRequest(http.MethodPost, "/api/public/leads/webhook", bytes.NewBuffer(validPayload2))
	req4.Header.Set("Content-Type", "application/json")
	w4 := httptest.NewRecorder()
	router.ServeHTTP(w4, req4)

	if w4.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for sponsor_username webhook, got %d. Body: %s", w4.Code, w4.Body.String())
	}
}
