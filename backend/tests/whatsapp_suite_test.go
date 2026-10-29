package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

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
	threads := wa.GetChatThreads()
	if len(threads) == 0 {
		t.Fatal("Expected pre-seeded chat threads, got 0")
	}

	firstThread := threads[0]
	tID := firstThread.ID
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

	// 2. GET /threads
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

	body, _ := json.Marshal(map[string]interface{}{
		"text":       "Pesan API test kirim ke obrolan!",
		"media_type": "text",
	})
	req, _ := http.NewRequest("POST", "/api/crm/whatsapp/threads/thread-bambang/messages", bytes.NewBuffer(body))
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
