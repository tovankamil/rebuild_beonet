package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/models"
)

// Suite Pengujian Komprehensif API Endpoints & CORS
func TestAPI_CORS_Preflight(t *testing.T) {
	router := setupTestServer()

	req, _ := http.NewRequest(http.MethodOptions, "/api/auth/login", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	req.Header.Set("Access-Control-Request-Method", "POST")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusNoContent {
		t.Errorf("Expected CORS preflight status 204 No Content, got %d", w.Code)
	}

	allowOrigin := w.Header().Get("Access-Control-Allow-Origin")
	if allowOrigin != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin '*', got %s", allowOrigin)
	}

	allowMethods := w.Header().Get("Access-Control-Allow-Methods")
	if allowMethods == "" {
		t.Errorf("Expected Access-Control-Allow-Methods header to be set")
	}
}

func TestAPI_Auth_Login_Scenarios(t *testing.T) {
	router := setupTestServer()

	// Scenario 1: Malformed JSON Body -> 400
	req1, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer([]byte(`{invalid-json`)))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	if w1.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for malformed JSON, got %d", w1.Code)
	}

	// Scenario 2: Missing username -> 400
	req2, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer([]byte(`{"password":"123"}`)))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	if w2.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for missing username, got %d", w2.Code)
	}

	// Scenario 3: Missing password -> 400
	req3, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer([]byte(`{"username":"user"}`)))
	req3.Header.Set("Content-Type", "application/json")
	w3 := httptest.NewRecorder()
	router.ServeHTTP(w3, req3)
	if w3.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for missing password, got %d", w3.Code)
	}
}

func TestAPI_ProtectedRoutes_AccessControl(t *testing.T) {
	router := setupTestServer()

	endpoints := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/api/auth/me"},
		{http.MethodGet, "/api/dashboard/stats"},
		{http.MethodGet, "/api/dashboard/genealogy"},
		{http.MethodGet, "/api/dashboard/referrals"},
		{http.MethodGet, "/api/dashboard/transactions"},
		{http.MethodGet, "/api/dashboard/bank"},
		{http.MethodPost, "/api/dashboard/bank"},
	}

	for _, ep := range endpoints {
		t.Run("Unauthorized_"+ep.method+"_"+ep.path, func(t *testing.T) {
			req, _ := http.NewRequest(ep.method, ep.path, nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if w.Code != http.StatusUnauthorized {
				t.Errorf("Expected endpoint %s %s to reject unauthorized request with 401, got %d", ep.method, ep.path, w.Code)
			}
		})
	}
}

func TestAPI_ProtectedRoutes_WithValidToken(t *testing.T) {
	router := setupTestServer()

	// 1. Dapatkan Token
	loginBody, _ := json.Marshal(models.LoginRequest{
		Username: "mitra01",
		Password: "bionet123",
	})
	loginReq, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(loginBody))
	loginReq.Header.Set("Content-Type", "application/json")
	loginW := httptest.NewRecorder()
	router.ServeHTTP(loginW, loginReq)

	var loginResp struct {
		Data struct {
			Token string `json:"token"`
		} `json:"data"`
	}
	json.Unmarshal(loginW.Body.Bytes(), &loginResp)
	token := loginResp.Data.Token

	// 2. Uji GET /api/auth/me
	t.Run("GET /api/auth/me", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/auth/me", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})

	// 3. Uji GET /api/dashboard/genealogy
	t.Run("GET /api/dashboard/genealogy", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/dashboard/genealogy", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}

		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp["status"] != "success" {
			t.Errorf("Expected status 'success'")
		}
	})

	// 4. Uji GET /api/dashboard/referrals
	t.Run("GET /api/dashboard/referrals", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/dashboard/referrals", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}

		var resp struct {
			Data []models.ReferralItem `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp.Data) == 0 {
			t.Errorf("Expected referral items to be returned")
		}
	})

	// 5. Uji GET /api/dashboard/transactions
	t.Run("GET /api/dashboard/transactions", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/dashboard/transactions", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}

		var resp struct {
			Data []models.WalletTransaction `json:"data"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if len(resp.Data) == 0 {
			t.Errorf("Expected wallet transactions to be returned")
		}
	})

	// 6. Uji POST & GET /api/dashboard/bank
	t.Run("POST_and_GET /api/dashboard/bank", func(t *testing.T) {
		bankPayload, _ := json.Marshal(models.UserBank{
			BankName:      "BSI (Bank Syariah Indonesia)",
			AccountNumber: "7182930491",
			AccountName:   "Mitra Bionet Juara",
		})
		postReq, _ := http.NewRequest(http.MethodPost, "/api/dashboard/bank", bytes.NewBuffer(bankPayload))
		postReq.Header.Set("Authorization", "Bearer "+token)
		postReq.Header.Set("Content-Type", "application/json")
		postW := httptest.NewRecorder()
		router.ServeHTTP(postW, postReq)

		if postW.Code != http.StatusOK {
			t.Errorf("Expected 200 on saving bank, got %d", postW.Code)
		}

		// Verify retrieval
		getReq, _ := http.NewRequest(http.MethodGet, "/api/dashboard/bank", nil)
		getReq.Header.Set("Authorization", "Bearer "+token)
		getW := httptest.NewRecorder()
		router.ServeHTTP(getW, getReq)

		if getW.Code != http.StatusOK {
			t.Errorf("Expected 200 on fetching bank, got %d", getW.Code)
		}

		var getResp struct {
			Data models.UserBank `json:"data"`
		}
		json.Unmarshal(getW.Body.Bytes(), &getResp)
		if getResp.Data.BankName != "BSI (Bank Syariah Indonesia)" {
			t.Errorf("Expected BankName 'BSI (Bank Syariah Indonesia)', got %s", getResp.Data.BankName)
		}
	})
}
