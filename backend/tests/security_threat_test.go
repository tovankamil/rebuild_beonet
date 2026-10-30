package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/models"
	"bionet-backend/services"
	"bionet-backend/utils"
)

// ============================================================================
// PILAR 1: GEO-IP LOCATION TRACKER TESTS (INDONESIAN IP RESOLUTION)
// ============================================================================

func TestGeoIPService_OfflineResolutions(t *testing.T) {
	geoSvc := services.GetGeoIPService()

	// 1. Loopback / Localhost
	locLoopback := geoSvc.ResolveIP("127.0.0.1")
	if locLoopback.Country != "Indonesia" {
		t.Errorf("Expected country 'Indonesia', got '%s'", locLoopback.Country)
	}
	if locLoopback.City != "Jakarta Pusat" {
		t.Errorf("Expected city 'Jakarta Pusat', got '%s'", locLoopback.City)
	}

	// 2. Telkomsel Range (114.120.x.x -> Jakarta Selatan)
	locTelkomsel := geoSvc.ResolveIP("114.120.88.22")
	if locTelkomsel.City != "Jakarta Selatan" || locTelkomsel.Province != "DKI Jakarta" {
		t.Errorf("Expected Jakarta Selatan, got %s, %s", locTelkomsel.City, locTelkomsel.Province)
	}
	if locTelkomsel.ISP != "Telkomsel Mobile" {
		t.Errorf("Expected Telkomsel Mobile ISP, got %s", locTelkomsel.ISP)
	}

	// 3. Telkom / IndiHome Surabaya Range (36.80.x.x -> Surabaya)
	locSurabaya := geoSvc.ResolveIP("36.80.50.12")
	if locSurabaya.City != "Surabaya" || locSurabaya.Province != "Jawa Timur" {
		t.Errorf("Expected Surabaya, Jawa Timur, got %s, %s", locSurabaya.City, locSurabaya.Province)
	}

	// 4. Indosat Tangerang Range (114.4.x.x -> Tangerang)
	locTangerang := geoSvc.ResolveIP("114.4.12.8")
	if locTangerang.City != "Tangerang" || locTangerang.Province != "Banten" {
		t.Errorf("Expected Tangerang, Banten, got %s, %s", locTangerang.City, locTangerang.Province)
	}

	// 5. Deterministic fallback for unknown public IP
	locFallback := geoSvc.ResolveIP("198.51.100.77")
	if locFallback.Country != "Indonesia" {
		t.Errorf("Expected fallback country 'Indonesia', got %s", locFallback.Country)
	}
	if locFallback.City == "" || locFallback.Latitude == 0 || locFallback.Longitude == 0 {
		t.Errorf("Expected valid city and coordinates for fallback IP, got %+v", locFallback)
	}
}

func TestGeoIPService_TrafficRecordingAndSummary(t *testing.T) {
	geoSvc := services.GetGeoIPService()

	// Record explicit access
	testIP := "114.120.99.1"
	logEntry := geoSvc.RecordAccess(testIP, "login", "user-uuid-1", "mitra_test", "/api/auth/login")
	if logEntry.IPAddress != testIP {
		t.Errorf("Expected IP %s, got %s", testIP, logEntry.IPAddress)
	}
	if logEntry.City != "Jakarta Selatan" {
		t.Errorf("Expected city 'Jakarta Selatan', got '%s'", logEntry.City)
	}

	summary := geoSvc.GetGeoTrafficSummary()
	if summary.TotalVisits <= 0 {
		t.Errorf("Expected TotalVisits > 0, got %d", summary.TotalVisits)
	}
	if len(summary.TopCities) == 0 {
		t.Errorf("Expected TopCities to be populated")
	}
	if len(summary.RecentAccessLogs) == 0 {
		t.Errorf("Expected RecentAccessLogs to be populated")
	}
}

// ============================================================================
// PILAR 2: DETEKSI SERANGAN CYBER (SQLi, XSS, Path Traversal, Sensitive Probes)
// ============================================================================

func TestSecurity_HackAttemptDetection_SQLInjection(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	// 1. SQL Injection via Query Parameter
	sqliURL := "/api/products?query=' UNION SELECT null, username, password FROM users--"
	req, _ := http.NewRequest(http.MethodGet, sqliURL, nil)
	req.RemoteAddr = "192.0.2.10:4521"
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden for SQL Injection query, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		Status     string `json:"status"`
		ThreatType string `json:"threat_type"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.Status != "error" || resp.ThreatType != "sql_injection" {
		t.Errorf("Expected status 'error' and threat_type 'sql_injection', got %+v", resp)
	}

	// Verify attacker IP is automatically blocked
	isBlocked, _ := secSvc.IsIPBlocked("192.0.2.10")
	if !isBlocked {
		t.Errorf("Expected attacker IP 192.0.2.10 to be automatically blocked")
	}
}

func TestSecurity_HackAttemptDetection_XSS(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	// 2. XSS Payload in JSON Request Body
	xssPayload := map[string]interface{}{
		"name":    "Attacker",
		"comment": "<script>alert('XSS-ATTACK');document.cookie</script>",
	}
	bodyBytes, _ := json.Marshal(xssPayload)

	req, _ := http.NewRequest(http.MethodPost, "/api/bio/lead", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.RemoteAddr = "192.0.2.20:4522"
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden for XSS payload, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		ThreatType string `json:"threat_type"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.ThreatType != "xss_payload" {
		t.Errorf("Expected threat_type 'xss_payload', got '%s'", resp.ThreatType)
	}
}

func TestSecurity_HackAttemptDetection_PathTraversal(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	// 3. Path Traversal attack in URL
	req, _ := http.NewRequest(http.MethodGet, "/uploads/../../../etc/passwd", nil)
	req.RemoteAddr = "192.0.2.30:4523"
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Fatalf("Expected 403 Forbidden for Path Traversal, got %d. Body: %s", w.Code, w.Body.String())
	}

	var resp struct {
		ThreatType string `json:"threat_type"`
	}
	json.Unmarshal(w.Body.Bytes(), &resp)
	if resp.ThreatType != "path_traversal" {
		t.Errorf("Expected threat_type 'path_traversal', got '%s'", resp.ThreatType)
	}
}

func TestSecurity_HackAttemptDetection_SensitiveProbes(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	// 4. Sensitive URL probe (e.g. .env or wp-admin)
	probePaths := []string{"/.env", "/wp-admin", "/phpmyadmin"}
	for idx, path := range probePaths {
		ip := fmt.Sprintf("192.0.2.%d", 40+idx)
		req, _ := http.NewRequest(http.MethodGet, path, nil)
		req.RemoteAddr = fmt.Sprintf("%s:5432", ip)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusForbidden {
			t.Errorf("Expected 403 Forbidden for probe %s, got %d", path, w.Code)
		}

		var resp struct {
			ThreatType string `json:"threat_type"`
		}
		json.Unmarshal(w.Body.Bytes(), &resp)
		if resp.ThreatType != "sensitive_probe" {
			t.Errorf("Expected threat_type 'sensitive_probe' for %s, got '%s'", path, resp.ThreatType)
		}
	}
}

// ============================================================================
// PILAR 3: FLOODING / DDOS RATE-LIMITING PROTECTION
// ============================================================================

func TestSecurity_FloodingRateLimit_AutoBlock(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	floodIP := "198.51.100.99"

	// Send 65 normal requests -> should get X-RateLimit-Warning
	var lastCode int
	var hasWarningHeader bool
	for i := 1; i <= 65; i++ {
		req, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
		req.RemoteAddr = fmt.Sprintf("%s:1234", floodIP)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		lastCode = w.Code
		if w.Header().Get("X-RateLimit-Warning") != "" {
			hasWarningHeader = true
		}
	}

	if lastCode != http.StatusOK {
		t.Errorf("Expected 200 OK before limit reached, got %d", lastCode)
	}
	if !hasWarningHeader {
		t.Errorf("Expected X-RateLimit-Warning header after >60 requests")
	}

	// Flood up to 125 requests -> should trigger 429 Too Many Requests and auto-block
	var blockedCode int
	for i := 66; i <= 125; i++ {
		req, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
		req.RemoteAddr = fmt.Sprintf("%s:1234", floodIP)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		blockedCode = w.Code
		if blockedCode == http.StatusTooManyRequests {
			break
		}
	}

	if blockedCode != http.StatusTooManyRequests {
		t.Fatalf("Expected 429 Too Many Requests when flooding >120 req/min, got %d", blockedCode)
	}

	// Verify the IP is now blocked (subsequent request returns 403 Forbidden)
	reqAfter, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
	reqAfter.RemoteAddr = fmt.Sprintf("%s:1234", floodIP)
	wAfter := httptest.NewRecorder()
	router.ServeHTTP(wAfter, reqAfter)

	if wAfter.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden after auto-blocking, got %d", wAfter.Code)
	}
}

// ============================================================================
// PILAR 4: BRUTE FORCE LOGIN PROTECTION
// ============================================================================

func TestSecurity_BruteForceLogin_Lockout(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	attackerIP := "203.0.113.88"
	targetUser := "victim_user"

	// Simulate 5 failed login attempts
	for i := 1; i <= 5; i++ {
		loginPayload := map[string]string{
			"username": targetUser,
			"password": fmt.Sprintf("wrong_password_%d", i),
		}
		bodyBytes, _ := json.Marshal(loginPayload)

		req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.RemoteAddr = fmt.Sprintf("%s:4321", attackerIP)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("Attempt %d: expected 401 Unauthorized, got %d", i, w.Code)
		}
	}

	// 6th attempt should be blocked and locked out (>5 consecutive failures)
	loginPayload := map[string]string{
		"username": targetUser,
		"password": "wrong_password_6",
	}
	bodyBytes, _ := json.Marshal(loginPayload)
	req6, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(bodyBytes))
	req6.Header.Set("Content-Type", "application/json")
	req6.RemoteAddr = fmt.Sprintf("%s:4321", attackerIP)
	w6 := httptest.NewRecorder()
	router.ServeHTTP(w6, req6)

	// Should be 429 Too Many Requests or 403 Forbidden
	if w6.Code != http.StatusTooManyRequests && w6.Code != http.StatusForbidden {
		t.Fatalf("Expected 429 Too Many Requests on 6th failed attempt, got %d. Body: %s", w6.Code, w6.Body.String())
	}
}

// ============================================================================
// PILAR 5: ADMIN-ONLY REST API (STRICT RequireRole("admin"))
// ============================================================================

func TestSecurity_AdminAPI_RBAC_And_Endpoints(t *testing.T) {
	router := setupTestServer()
	secSvc := services.GetSecurityService()
	secSvc.ResetAll()

	adminToken, err := utils.GenerateToken("admin-uuid", "admin01", "admin")
	if err != nil {
		t.Fatalf("Failed to generate admin token: %v", err)
	}

	memberToken, err := utils.GenerateToken("member-uuid", "mitra01", "member")
	if err != nil {
		t.Fatalf("Failed to generate member token: %v", err)
	}

	// 1. GET /api/admin/security/threats
	// A. Unauthorized (no token) -> 401
	unauthReq, _ := http.NewRequest(http.MethodGet, "/api/admin/security/threats", nil)
	unauthW := httptest.NewRecorder()
	router.ServeHTTP(unauthW, unauthReq)
	if unauthW.Code != http.StatusUnauthorized {
		t.Errorf("Expected 401 Unauthorized without token, got %d", unauthW.Code)
	}

	// B. Forbidden (role member) -> 403
	memberReq, _ := http.NewRequest(http.MethodGet, "/api/admin/security/threats", nil)
	memberReq.Header.Set("Authorization", "Bearer "+memberToken)
	memberW := httptest.NewRecorder()
	router.ServeHTTP(memberW, memberReq)
	if memberW.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for member role on /api/admin/security/threats, got %d", memberW.Code)
	}

	// C. Success (role admin) -> 200
	adminReq, _ := http.NewRequest(http.MethodGet, "/api/admin/security/threats", nil)
	adminReq.Header.Set("Authorization", "Bearer "+adminToken)
	adminW := httptest.NewRecorder()
	router.ServeHTTP(adminW, adminReq)
	if adminW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for admin on /api/admin/security/threats, got %d. Body: %s", adminW.Code, adminW.Body.String())
	}

	var threatsResp struct {
		Status string                  `json:"status"`
		Data   models.ThreatSummaryDTO `json:"data"`
	}
	json.Unmarshal(adminW.Body.Bytes(), &threatsResp)
	if threatsResp.Status != "success" {
		t.Errorf("Expected status 'success', got '%s'", threatsResp.Status)
	}

	// 2. GET /api/admin/security/geo-traffic
	// Forbidden for member
	geoMemberReq, _ := http.NewRequest(http.MethodGet, "/api/admin/security/geo-traffic", nil)
	geoMemberReq.Header.Set("Authorization", "Bearer "+memberToken)
	geoMemberW := httptest.NewRecorder()
	router.ServeHTTP(geoMemberW, geoMemberReq)
	if geoMemberW.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for member on /api/admin/security/geo-traffic, got %d", geoMemberW.Code)
	}

	// Success for admin
	geoAdminReq, _ := http.NewRequest(http.MethodGet, "/api/admin/security/geo-traffic", nil)
	geoAdminReq.Header.Set("Authorization", "Bearer "+adminToken)
	geoAdminW := httptest.NewRecorder()
	router.ServeHTTP(geoAdminW, geoAdminReq)
	if geoAdminW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for admin on /api/admin/security/geo-traffic, got %d", geoAdminW.Code)
	}

	var geoResp struct {
		Status string               `json:"status"`
		Data   models.GeoTrafficDTO `json:"data"`
	}
	json.Unmarshal(geoAdminW.Body.Bytes(), &geoResp)
	if geoResp.Status != "success" || geoResp.Data.TotalVisits <= 0 {
		t.Errorf("Expected successful geo-traffic data, got %+v", geoResp)
	}

	// 3. POST /api/admin/security/block-ip
	blockPayload := map[string]string{
		"ip_address": "203.0.113.55",
		"reason":     "Suspicious reconnaissance scan",
	}
	blockBytes, _ := json.Marshal(blockPayload)

	// Member cannot block IP -> 403
	blockMemberReq, _ := http.NewRequest(http.MethodPost, "/api/admin/security/block-ip", bytes.NewBuffer(blockBytes))
	blockMemberReq.Header.Set("Authorization", "Bearer "+memberToken)
	blockMemberW := httptest.NewRecorder()
	router.ServeHTTP(blockMemberW, blockMemberReq)
	if blockMemberW.Code != http.StatusForbidden {
		t.Errorf("Expected 403 for member on block-ip, got %d", blockMemberW.Code)
	}

	// Admin blocks IP -> 200
	blockAdminReq, _ := http.NewRequest(http.MethodPost, "/api/admin/security/block-ip", bytes.NewBuffer(blockBytes))
	blockAdminReq.Header.Set("Authorization", "Bearer "+adminToken)
	blockAdminW := httptest.NewRecorder()
	router.ServeHTTP(blockAdminW, blockAdminReq)
	if blockAdminW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for admin on block-ip, got %d. Body: %s", blockAdminW.Code, blockAdminW.Body.String())
	}

	// Verify blocked IP cannot access any route -> 403
	testBlockedReq, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
	testBlockedReq.RemoteAddr = "203.0.113.55:9999"
	testBlockedW := httptest.NewRecorder()
	router.ServeHTTP(testBlockedW, testBlockedReq)
	if testBlockedW.Code != http.StatusForbidden {
		t.Errorf("Expected 403 Forbidden for blocked IP, got %d", testBlockedW.Code)
	}

	// 4. POST /api/admin/security/unblock-ip
	unblockPayload := map[string]string{
		"ip_address": "203.0.113.55",
	}
	unblockBytes, _ := json.Marshal(unblockPayload)
	unblockAdminReq, _ := http.NewRequest(http.MethodPost, "/api/admin/security/unblock-ip", bytes.NewBuffer(unblockBytes))
	unblockAdminReq.Header.Set("Authorization", "Bearer "+adminToken)
	unblockAdminW := httptest.NewRecorder()
	router.ServeHTTP(unblockAdminW, unblockAdminReq)
	if unblockAdminW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for unblock-ip, got %d", unblockAdminW.Code)
	}

	// Verify IP is unblocked and can access /api/ping -> 200
	testUnblockedReq, _ := http.NewRequest(http.MethodGet, "/api/ping", nil)
	testUnblockedReq.RemoteAddr = "203.0.113.55:9999"
	testUnblockedW := httptest.NewRecorder()
	router.ServeHTTP(testUnblockedW, testUnblockedReq)
	if testUnblockedW.Code != http.StatusOK {
		t.Errorf("Expected 200 OK after unblocking IP, got %d", testUnblockedW.Code)
	}

	// 5. POST /api/admin/security/test-alert (Simulation)
	alertPayload := map[string]string{
		"threat_type": "sql_injection",
		"ip_address":  "180.244.12.34",
		"city":        "Surabaya",
		"payload":     "' UNION SELECT null, username, password FROM users--",
	}
	alertBytes, _ := json.Marshal(alertPayload)
	alertReq, _ := http.NewRequest(http.MethodPost, "/api/admin/security/test-alert", bytes.NewBuffer(alertBytes))
	alertReq.Header.Set("Authorization", "Bearer "+adminToken)
	alertW := httptest.NewRecorder()
	router.ServeHTTP(alertW, alertReq)

	if alertW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for test-alert simulation, got %d. Body: %s", alertW.Code, alertW.Body.String())
	}

	var alertResp struct {
		Status  string                   `json:"status"`
		Message string                   `json:"message"`
		Data    models.SecurityThreatLog `json:"data"`
	}
	json.Unmarshal(alertW.Body.Bytes(), &alertResp)
	if alertResp.Status != "success" || alertResp.Data.ThreatType != "sql_injection" {
		t.Errorf("Expected success simulation with threat_type sql_injection, got %+v", alertResp)
	}
}
