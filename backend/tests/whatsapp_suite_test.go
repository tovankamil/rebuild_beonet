package tests

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"bionet-backend/models"
	"bionet-backend/services"
	"bionet-backend/utils"

	"github.com/gin-gonic/gin"
)

// Unit Tests for WhatsApp Service Engine
func TestWhatsAppService_InitAndStatus(t *testing.T) {
	wa := services.InitWhatsAppService()
	if wa == nil {
		t.Fatal("Expected WhatsAppService to not be nil")
	}

	status := wa.GetStatus()
	if status["uptime"] == nil {
		t.Errorf("Expected uptime in status, got nil")
	}
	if status["connected_number"] == nil {
		t.Errorf("Expected connected_number in status, got nil")
	}
}

func TestWhatsAppService_FormatPhone(t *testing.T) {
	cases := []struct {
		input    string
		expected string
	}{
		{"081234567890", "6281234567890"},
		{"+6281234567890", "6281234567890"},
		{"6281234567890", "6281234567890"},
		{"0812-3456-7890", "6281234567890"},
		{" 0812 3456 7890 ", "6281234567890"},
	}

	for _, c := range cases {
		got := services.FormatPhone(c.input)
		if got != c.expected {
			t.Errorf("FormatPhone(%q) = %q; expected %q", c.input, got, c.expected)
		}
	}
}

func TestWhatsAppService_ThreadsAndMessages(t *testing.T) {
	wa := services.InitWhatsAppService()
	th := wa.CreateNewThread("081298765432", "Unit Test Contact", "Bio-Propolis Trigona", "Jakarta", "new")
	if th == nil {
		t.Fatal("Expected thread to be created")
	}

	tID := th.ID
	msgs := wa.GetThreadMessages(tID)

	// Send new message in thread
	newMsg, err := wa.SendMessageInThread(tID, "Halo dari Unit Test WhatsApp!", "text")
	if err != nil {
		t.Fatalf("SendMessageInThread failed: %v", err)
	}
	if newMsg.Text != "Halo dari Unit Test WhatsApp!" {
		t.Errorf("Expected message text to match, got %s", newMsg.Text)
	}

	updatedMsgs := wa.GetThreadMessages(tID)
	if len(updatedMsgs) <= len(msgs) {
		t.Errorf("Expected message count to increase from %d, got %d", len(msgs), len(updatedMsgs))
	}
}

func TestWhatsAppService_BroadcastEngine(t *testing.T) {
	wa := services.InitWhatsAppService()
	bc := wa.CreateBroadcast("Test Campaign Diskon", "all", "Halo {{nama}}, promo herbal aktif!")
	if bc == nil {
		t.Fatal("Expected broadcast campaign to be created")
	}
	if bc.Title != "Test Campaign Diskon" {
		t.Errorf("Expected title 'Test Campaign Diskon', got %s", bc.Title)
	}
	if bc.TotalRecipients <= 0 {
		t.Errorf("Expected TotalRecipients > 0, got %d", bc.TotalRecipients)
	}

	allBc := wa.GetBroadcasts()
	if len(allBc) == 0 {
		t.Errorf("Expected broadcasts list to contain entries")
	}
}

func TestWhatsAppService_BotRulesEngine(t *testing.T) {
	wa := services.InitWhatsAppService()
	rule := wa.SaveBotRule(services.WhatsAppBotRule{
		Keyword:  "promo-spesial",
		Reply:    "Dapatkan cashback 25% untuk pemesanan hari ini!",
		Category: "pricing",
		IsActive: true,
	})

	if rule.ID == "" {
		t.Errorf("Expected bot rule to have an assigned ID")
	}

	// Toggle
	activeState := wa.ToggleBotRule(rule.ID)
	if activeState != false {
		t.Errorf("Expected bot rule to toggle to false, got %v", activeState)
	}

	// Delete
	deleted := wa.DeleteBotRule(rule.ID)
	if !deleted {
		t.Errorf("Expected bot rule deletion to succeed")
	}
}

func TestWhatsAppService_DeviceSession(t *testing.T) {
	wa := services.InitWhatsAppService()
	sess := wa.GetDeviceSession()
	if sess.DeviceName == "" {
		t.Errorf("Expected device name to be populated")
	}

	// Pair device
	paired := wa.PairDevice("081399887766")
	if paired.Status != "connected" {
		t.Errorf("Expected paired status 'connected', got %s", paired.Status)
	}
	if !strings.Contains(paired.PhoneNumber, "6281399887766") {
		t.Errorf("Expected phone number to contain 6281399887766, got %s", paired.PhoneNumber)
	}

	// Toggle auto-responder
	initialState := sess.AutoResponderOn
	newState := wa.ToggleAutoResponder()
	if newState == initialState {
		t.Errorf("Expected auto-responder state to toggle")
	}
}

func TestWhatsAppService_DirectSendAndLogs(t *testing.T) {
	wa := services.InitWhatsAppService()
	logEntry, err := wa.SendCrmDirectMessage("081298765432", "Unit Test User", "crm_followup", "Pesan langsung uji coba")
	if err != nil {
		t.Fatalf("SendCrmDirectMessage failed: %v", err)
	}
	if logEntry.Status != "sent" && logEntry.Status != "queued" {
		t.Errorf("Expected status sent or queued, got %s", logEntry.Status)
	}

	logs := wa.GetLogs()
	if len(logs) == 0 {
		t.Errorf("Expected logs to contain entries")
	}
}

// =========================================================================
// API ROUTE TESTS FOR WHATSAPP SUITE
// =========================================================================

func setupWhatsAppTestRouter() (*gin.Engine, string) {
	router := setupTestServer()
	token, _ := utils.GenerateToken("user-test-uuid", "mitra01", "member")
	return router, token
}

func TestAPI_WhatsApp_Status_And_Threads(t *testing.T) {
	router, token := setupWhatsAppTestRouter()

	// 1. GET /status
	req, _ := http.NewRequest("GET", "/api/crm/whatsapp/status", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}

	var resStatus map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &resStatus)
	if resStatus["status"] != "success" {
		t.Errorf("Expected status success, got %v", resStatus["status"])
	}

	// 2. GET /threads (ensure a thread exists for testing)
	waSvc := services.InitWhatsAppService()
	waSvc.CreateNewThread("08123456789", "User Test", "Bio-Propolis Trigona", "Jakarta", "new", "user-test-uuid")

	req2, _ := http.NewRequest("GET", "/api/crm/whatsapp/threads", nil)
	req2.Header.Set("Authorization", "Bearer "+token)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w2.Code)
	}

	var resThreads struct {
		Status string                        `json:"status"`
		Data   []services.WhatsAppChatThread `json:"data"`
		Total  int                           `json:"total"`
	}
	json.Unmarshal(w2.Body.Bytes(), &resThreads)
	if len(resThreads.Data) == 0 {
		t.Errorf("Expected at least 1 chat thread, got %d", len(resThreads.Data))
	}
}

func TestAPI_WhatsApp_SendThreadMessage(t *testing.T) {
	router, token := setupWhatsAppTestRouter()
	wa := services.InitWhatsAppService()
	th := wa.CreateNewThread("081298765432", "Unit Test Contact", "Bio-Propolis Trigona", "Jakarta", "new")

	body, _ := json.Marshal(map[string]interface{}{
		"text":       "Pesan API test kirim ke obrolan!",
		"media_type": "text",
	})
	req, _ := http.NewRequest("POST", "/api/crm/whatsapp/threads/"+th.ID+"/messages", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d: %s", w.Code, w.Body.String())
	}

	var res struct {
		Status  string                       `json:"status"`
		Message string                       `json:"message"`
		Data    services.WhatsAppMessageItem `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &res)
	if res.Data.Text != "Pesan API test kirim ke obrolan!" {
		t.Errorf("Expected message text to match, got %s", res.Data.Text)
	}
}

func TestAPI_WhatsApp_CreateThread(t *testing.T) {
	router, token := setupWhatsAppTestRouter()

	body, _ := json.Marshal(map[string]interface{}{
		"phone":        "081999888777",
		"contact_name": "Ibu Ratna Dewi",
		"product":      "Bio-Propolis Trigona 30ml",
		"city":         "Yogyakarta",
		"lead_stage":   "interested",
	})
	req, _ := http.NewRequest("POST", "/api/crm/whatsapp/threads", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d: %s", w.Code, w.Body.String())
	}

	var res struct {
		Status string                       `json:"status"`
		Data   services.WhatsAppChatThread `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &res)
	if res.Data.ContactName != "Ibu Ratna Dewi" {
		t.Errorf("Expected contact name 'Ibu Ratna Dewi', got %s", res.Data.ContactName)
	}
}

func TestAPI_WhatsApp_Broadcasts(t *testing.T) {
	router, token := setupWhatsAppTestRouter()

	body, _ := json.Marshal(map[string]interface{}{
		"title":          "API Test Broadcast",
		"target_segment": "new",
		"template":       "Halo {{nama}}, ini pesan API broadcast.",
	})
	req, _ := http.NewRequest("POST", "/api/crm/whatsapp/broadcasts", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d: %s", w.Code, w.Body.String())
	}

	var res struct {
		Status string                             `json:"status"`
		Data   services.WhatsAppBroadcastCampaign `json:"data"`
	}
	json.Unmarshal(w.Body.Bytes(), &res)
	if res.Data.Title != "API Test Broadcast" {
		t.Errorf("Expected title 'API Test Broadcast', got %s", res.Data.Title)
	}
}

func TestAPI_WhatsApp_WebhookListener(t *testing.T) {
	router, _ := setupWhatsAppTestRouter()

	body, _ := json.Marshal(map[string]interface{}{
		"from":    "081298765432",
		"name":    "Bambang Sudirman",
		"message": "Terima kasih infonya Bionet!",
	})
	req, _ := http.NewRequest("POST", "/api/crm/whatsapp/webhook", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d: %s", w.Code, w.Body.String())
	}
}

func TestAPI_WhatsApp_MitraIsolation_And_AdminAll(t *testing.T) {
	router := setupTestServer()
	tokenMitra1, _ := utils.GenerateToken("mitra-user-1", "mitra1", "member")
	tokenMitra2, _ := utils.GenerateToken("mitra-user-2", "mitra2", "member")
	tokenAdmin, _ := utils.GenerateToken("admin-user", "admin", "admin")

	// 1. Mitra 1 creates a contact
	bodyContact, _ := json.Marshal(map[string]interface{}{
		"phone":    "081211112222",
		"name":     "Kontak Khusus Mitra 1",
		"city":     "Bandung",
		"category": "lead",
	})
	reqC1, _ := http.NewRequest("POST", "/api/crm/whatsapp/contacts", bytes.NewBuffer(bodyContact))
	reqC1.Header.Set("Authorization", "Bearer "+tokenMitra1)
	reqC1.Header.Set("Content-Type", "application/json")
	wC1 := httptest.NewRecorder()
	router.ServeHTTP(wC1, reqC1)
	if wC1.Code != http.StatusCreated {
		t.Fatalf("Mitra 1 failed to create contact: %d %s", wC1.Code, wC1.Body.String())
	}

	// 2. Mitra 2 gets contacts -> MUST NOT see Mitra 1's contact!
	reqC2, _ := http.NewRequest("GET", "/api/crm/whatsapp/contacts", nil)
	reqC2.Header.Set("Authorization", "Bearer "+tokenMitra2)
	wC2 := httptest.NewRecorder()
	router.ServeHTTP(wC2, reqC2)
	if wC2.Code != http.StatusOK {
		t.Fatalf("Mitra 2 failed to get contacts: %d", wC2.Code)
	}
	var resC2 struct {
		Data []models.WhatsAppContactModel `json:"data"`
	}
	json.Unmarshal(wC2.Body.Bytes(), &resC2)
	for _, c := range resC2.Data {
		if c.Phone == "6281211112222" || c.Name == "Kontak Khusus Mitra 1" {
			t.Errorf("Security Violation: Mitra 2 saw Mitra 1's contact!")
		}
	}

	// 3. Admin gets contacts -> MUST see Mitra 1's contact!
	reqCAdmin, _ := http.NewRequest("GET", "/api/crm/whatsapp/contacts", nil)
	reqCAdmin.Header.Set("Authorization", "Bearer "+tokenAdmin)
	wCAdmin := httptest.NewRecorder()
	router.ServeHTTP(wCAdmin, reqCAdmin)
	var resCAdmin struct {
		Data []models.WhatsAppContactModel `json:"data"`
	}
	json.Unmarshal(wCAdmin.Body.Bytes(), &resCAdmin)
	foundAdmin := false
	for _, c := range resCAdmin.Data {
		if c.Phone == "6281211112222" {
			foundAdmin = true
			break
		}
	}
	if !foundAdmin {
		t.Errorf("Expected Admin to see all contacts including Mitra 1's contact")
	}

	// 4. Mitra 1 creates a thread
	bodyThread, _ := json.Marshal(map[string]interface{}{
		"phone":        "081233334444",
		"contact_name": "Prospek Rahasia Mitra 1",
		"product":      "Bio-Propolis Trigona 30ml",
		"city":         "Surabaya",
	})
	reqT1, _ := http.NewRequest("POST", "/api/crm/whatsapp/threads", bytes.NewBuffer(bodyThread))
	reqT1.Header.Set("Authorization", "Bearer "+tokenMitra1)
	reqT1.Header.Set("Content-Type", "application/json")
	wT1 := httptest.NewRecorder()
	router.ServeHTTP(wT1, reqT1)
	var resT1 struct {
		Data services.WhatsAppChatThread `json:"data"`
	}
	json.Unmarshal(wT1.Body.Bytes(), &resT1)
	thread1ID := resT1.Data.ID

	// 5. Mitra 2 gets threads -> MUST NOT see Mitra 1's thread!
	reqT2, _ := http.NewRequest("GET", "/api/crm/whatsapp/threads", nil)
	reqT2.Header.Set("Authorization", "Bearer "+tokenMitra2)
	wT2 := httptest.NewRecorder()
	router.ServeHTTP(wT2, reqT2)
	var resT2 struct {
		Data []services.WhatsAppChatThread `json:"data"`
	}
	json.Unmarshal(wT2.Body.Bytes(), &resT2)
	for _, th := range resT2.Data {
		if th.ID == thread1ID || th.ContactName == "Prospek Rahasia Mitra 1" {
			t.Errorf("Security Violation: Mitra 2 saw Mitra 1's thread!")
		}
	}

	// 6. Mitra 2 attempts to view messages in Mitra 1's thread -> MUST return 403 Forbidden!
	reqMsgT2, _ := http.NewRequest("GET", "/api/crm/whatsapp/threads/"+thread1ID+"/messages", nil)
	reqMsgT2.Header.Set("Authorization", "Bearer "+tokenMitra2)
	wMsgT2 := httptest.NewRecorder()
	router.ServeHTTP(wMsgT2, reqMsgT2)
	if wMsgT2.Code != http.StatusForbidden {
		t.Errorf("Expected status 403 Forbidden when Mitra 2 accesses Mitra 1's thread, got %d", wMsgT2.Code)
	}

	// 7. Admin views messages in Mitra 1's thread -> MUST succeed (200 OK)
	reqMsgAdmin, _ := http.NewRequest("GET", "/api/crm/whatsapp/threads/"+thread1ID+"/messages", nil)
	reqMsgAdmin.Header.Set("Authorization", "Bearer "+tokenAdmin)
	wMsgAdmin := httptest.NewRecorder()
	router.ServeHTTP(wMsgAdmin, reqMsgAdmin)
	if wMsgAdmin.Code != http.StatusOK {
		t.Errorf("Expected Admin to view any thread messages (200 OK), got %d", wMsgAdmin.Code)
	}
}

func TestAPI_WhatsApp_UploadAndSendMedia(t *testing.T) {
	router, token := setupWhatsAppTestRouter()

	// 1. Upload attachment
	bodyBuf := &bytes.Buffer{}
	writer := multipart.NewWriter(bodyBuf)
	part, _ := writer.CreateFormFile("file", "katalog_bioherbal.pdf")
	part.Write([]byte("%PDF-1.4 dummy pdf content for testing"))
	writer.Close()

	reqUpload, _ := http.NewRequest("POST", "/api/crm/whatsapp/upload", bodyBuf)
	reqUpload.Header.Set("Authorization", "Bearer "+token)
	reqUpload.Header.Set("Content-Type", writer.FormDataContentType())
	wUpload := httptest.NewRecorder()
	router.ServeHTTP(wUpload, reqUpload)

	if wUpload.Code != http.StatusOK {
		t.Fatalf("Upload failed with status %d: %s", wUpload.Code, wUpload.Body.String())
	}
	var resUpload struct {
		Status string `json:"status"`
		Data   struct {
			URL  string `json:"url"`
			Name string `json:"name"`
			Type string `json:"type"`
		} `json:"data"`
	}
	json.Unmarshal(wUpload.Body.Bytes(), &resUpload)
	if resUpload.Data.URL == "" {
		t.Fatalf("Expected uploaded file URL, got empty")
	}

	// 2. Create thread and send media message
	wa := services.InitWhatsAppService()
	th := wa.CreateNewThread("081299991111", "Customer Lampiran", "Bio-Propolis Trigona", "Semarang", "new", "user-test-uuid")

	bodyMsg, _ := json.Marshal(map[string]interface{}{
		"text":       "Silakan cek katalog produk Bionet terlampir ya!",
		"media_type": "document",
		"media_url":  resUpload.Data.URL,
		"file_name":  "katalog_bioherbal.pdf",
	})
	reqMsg, _ := http.NewRequest("POST", "/api/crm/whatsapp/threads/"+th.ID+"/messages", bytes.NewBuffer(bodyMsg))
	reqMsg.Header.Set("Authorization", "Bearer "+token)
	reqMsg.Header.Set("Content-Type", "application/json")
	wMsg := httptest.NewRecorder()
	router.ServeHTTP(wMsg, reqMsg)

	if wMsg.Code != http.StatusOK {
		t.Fatalf("Send media message failed: %d: %s", wMsg.Code, wMsg.Body.String())
	}

	var resMsg struct {
		Status string                       `json:"status"`
		Data   services.WhatsAppMessageItem `json:"data"`
	}
	json.Unmarshal(wMsg.Body.Bytes(), &resMsg)
	if resMsg.Data.MediaURL != resUpload.Data.URL {
		t.Errorf("Expected MediaURL to match %s, got %s", resUpload.Data.URL, resMsg.Data.MediaURL)
	}
}
