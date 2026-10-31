package tests

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"bionet-backend/models"
	"bionet-backend/services"
	"bionet-backend/utils"
)

func TestAPI_Branding_PublicAndAdminFlow(t *testing.T) {
	router := setupTestServer()

	// 1. GET /api/public/branding without auth
	req, _ := http.NewRequest(http.MethodGet, "/api/public/branding", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK from public branding, got %d", w.Code)
	}

	var pubResp struct {
		Status string             `json:"status"`
		Data   models.AppBranding `json:"data"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &pubResp); err != nil {
		t.Fatalf("Failed to decode public branding JSON: %v", err)
	}
	if pubResp.Data.PrimaryColor == "" {
		t.Errorf("Expected primary color to have default value, got empty")
	}

	// 2. Admin Login to get token
	token, err := utils.GenerateToken("admin-uuid", "superadmin", "admin")
	if err != nil {
		t.Fatalf("Failed to generate admin JWT: %v", err)
	}

	// 3. PUT /api/admin/branding to update colors
	updatePayload := models.UpdateBrandingRequest{
		AppName:        "BIONET ENTERPRISE",
		AppTagline:     "Solusi Bisnis Herbal & Jaringan Digital",
		PrimaryColor:   "#2563eb", // Sapphire Blue
		SecondaryColor: "#0ea5e9", // Sky Blue
		AccentColor:    "#f59e0b",
		LogoURL:        "/uploads/branding/test_logo.png",
	}
	bodyBytes, _ := json.Marshal(updatePayload)
	putReq, _ := http.NewRequest(http.MethodPut, "/api/admin/branding", bytes.NewBuffer(bodyBytes))
	putReq.Header.Set("Authorization", "Bearer "+token)
	putReq.Header.Set("Content-Type", "application/json")

	putW := httptest.NewRecorder()
	router.ServeHTTP(putW, putReq)

	if putW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK updating branding, got %d. Body: %s", putW.Code, putW.Body.String())
	}

	var putResp struct {
		Status string             `json:"status"`
		Data   models.AppBranding `json:"data"`
	}
	json.Unmarshal(putW.Body.Bytes(), &putResp)
	if putResp.Data.PrimaryColor != "#2563eb" {
		t.Errorf("Expected primary color '#2563eb', got '%s'", putResp.Data.PrimaryColor)
	}
	if putResp.Data.SecondaryColor != "#0ea5e9" {
		t.Errorf("Expected secondary color '#0ea5e9', got '%s'", putResp.Data.SecondaryColor)
	}
	if putResp.Data.AppName != "BIONET ENTERPRISE" {
		t.Errorf("Expected app name 'BIONET ENTERPRISE', got '%s'", putResp.Data.AppName)
	}

	// 4. Test Upload Logo multipart form
	var b bytes.Buffer
	writer := multipart.NewWriter(&b)
	part, err := writer.CreateFormFile("logo", "brand_logo.png")
	if err != nil {
		t.Fatalf("Failed to create form file: %v", err)
	}
	part.Write([]byte("fake-png-content-stream-for-logo-test"))
	writer.Close()

	uploadReq, _ := http.NewRequest(http.MethodPost, "/api/admin/branding/upload-logo", &b)
	uploadReq.Header.Set("Authorization", "Bearer "+token)
	uploadReq.Header.Set("Content-Type", writer.FormDataContentType())

	uploadW := httptest.NewRecorder()
	router.ServeHTTP(uploadW, uploadReq)

	if uploadW.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK uploading logo, got %d. Body: %s", uploadW.Code, uploadW.Body.String())
	}

	var uploadResp struct {
		Status  string `json:"status"`
		LogoURL string `json:"logo_url"`
	}
	json.Unmarshal(uploadW.Body.Bytes(), &uploadResp)
	if uploadResp.LogoURL == "" {
		t.Errorf("Expected logo_url to be returned, got empty")
	}
}

func TestWhatsApp_SendRegistrationWelcomeMessages(t *testing.T) {
	waService := services.InitWhatsAppService()

	sponsorPhone := "081298765432"
	sponsor := models.User{
		ID:        "sponsor-uuid-test",
		Username:  "sponsor_bionet",
		FullName:  "Budi Santoso",
		Phone:     &sponsorPhone,
		Role:      "member",
		CreatedAt: time.Now(),
	}

	memberPhone := "081311223344"
	newMember := models.User{
		ID:        "new-mitra-uuid-test",
		Username:  "mitra_baru99",
		FullName:  "Rina Wulandari",
		Phone:     &memberPhone,
		Role:      "member",
		CreatedAt: time.Now(),
	}

	err := waService.SendRegistrationWelcomeMessages(sponsor, newMember, "Platinum", "kiri", "upline_top", 150000)
	if err != nil {
		t.Fatalf("SendRegistrationWelcomeMessages failed: %v", err)
	}

	// Check that logs contain outbound registration entries
	logs := waService.GetLogs()
	foundMemberMsg := false
	foundSponsorMsg := false

	for _, l := range logs {
		if l.Category == "registration" && l.Recipient == newMember.FullName {
			foundMemberMsg = true
		}
		if l.Category == "registration" && l.Recipient == sponsor.FullName {
			foundSponsorMsg = true
		}
	}

	if !foundMemberMsg {
		t.Errorf("Expected outbound welcome registration log for new member '%s'", newMember.FullName)
	}
	if !foundSponsorMsg {
		t.Errorf("Expected outbound notification registration log for sponsor '%s'", sponsor.FullName)
	}
}
