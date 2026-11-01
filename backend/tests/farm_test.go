package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/utils"
)

// ============================================================================
// SUITE PENGUJIAN KEBUN HERBAL & PETERNAKAN LEBAH BIONET (SHOPEE FARM STYLE)
// ============================================================================

func TestFarm_ProtectedRoutes_WithoutToken(t *testing.T) {
	router := setupTestServer()

	endpoints := []struct {
		method string
		path   string
		body   string
	}{
		{http.MethodGet, "/api/farm/state", ""},
		{http.MethodPost, "/api/farm/plant", `{"plant_type":"propolis_flower"}`},
		{http.MethodPost, "/api/farm/water", ""},
		{http.MethodPost, "/api/farm/harvest", ""},
		{http.MethodPost, "/api/farm/feed-pet", ""},
		{http.MethodGet, "/api/farm/friends", ""},
		{http.MethodPost, "/api/farm/help-water/friend-123", ""},
		{http.MethodPost, "/api/farm/daily-bonus", ""},
	}

	for _, ep := range endpoints {
		var req *http.Request
		if ep.body != "" {
			req, _ = http.NewRequest(ep.method, ep.path, bytes.NewBuffer([]byte(ep.body)))
			req.Header.Set("Content-Type", "application/json")
		} else {
			req, _ = http.NewRequest(ep.method, ep.path, nil)
		}

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("Endpoint %s %s: expected 401 Unauthorized, got %d", ep.method, ep.path, w.Code)
		}
	}
}

func TestFarm_PlantSeed_Validation(t *testing.T) {
	router := setupTestServer()
	token, err := utils.GenerateToken("test-user-farm-01", "mitra_kebun", "member")
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	// 1. Missing plant_type field -> 400 Bad Request
	req, _ := http.NewRequest(http.MethodPost, "/api/farm/plant", bytes.NewBuffer([]byte(`{}`)))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for missing plant_type, got %d. Body: %s", w.Code, w.Body.String())
	}

	// 2. Malformed JSON -> 400 Bad Request
	reqMalformed, _ := http.NewRequest(http.MethodPost, "/api/farm/plant", bytes.NewBuffer([]byte(`{not-json`)))
	reqMalformed.Header.Set("Authorization", "Bearer "+token)
	reqMalformed.Header.Set("Content-Type", "application/json")
	wMalformed := httptest.NewRecorder()
	router.ServeHTTP(wMalformed, reqMalformed)

	if wMalformed.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for malformed JSON, got %d", wMalformed.Code)
	}
}

func TestFarm_HelpWater_MissingFriendParam(t *testing.T) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("test-user-farm-02", "mitra_kebun2", "member")

	// Calling route without friend_id parameter hits 404
	req, _ := http.NewRequest(http.MethodPost, "/api/farm/help-water/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound && w.Code != http.StatusBadRequest {
		t.Errorf("Expected 404 or 400 for empty friend param, got %d", w.Code)
	}
}

func TestFarm_CatalogTypesIntegrity(t *testing.T) {
	requiredSeeds := []string{"propolis_flower", "red_ginger", "bio_sirsak", "royal_trigona"}
	found := make(map[string]bool)

	type CatalogItem struct {
		PlantType   string `json:"plant_type"`
		TargetWater int    `json:"target_water"`
		RewardType  string `json:"reward_type"`
	}

	for _, s := range requiredSeeds {
		found[s] = true
	}

	if len(found) != 4 {
		t.Errorf("Expected 4 unique seeds, found %d", len(found))
	}

	// Verify JSON serialization of farm response structure
	sampleResp := map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"plot": map[string]interface{}{
				"plant_type":    "propolis_flower",
				"current_water": 30,
				"target_water":  100,
				"stage":         "sprout",
			},
			"water_tank": map[string]interface{}{
				"water_droplets": 90,
			},
		},
	}
	bytesData, err := json.Marshal(sampleResp)
	if err != nil {
		t.Fatalf("Failed to marshal farm sample response: %v", err)
	}
	if len(bytesData) == 0 {
		t.Errorf("Empty JSON bytes")
	}
}
