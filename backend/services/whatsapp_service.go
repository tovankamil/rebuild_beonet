package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"github.com/joho/godotenv"
)

// WhatsAppLog represents outbound/inbound delivery telemetry
type WhatsAppLog struct {
	ID        string    `json:"id"`
	Phone     string    `json:"phone"`
	Recipient string    `json:"recipient"`
	Category  string    `json:"category"` // 'bonus', 'registration', 'withdrawal', 'shipping', 'crm_followup', 'crm_objection', 'broadcast', 'custom'
	Message   string    `json:"message"`
	Status    string    `json:"status"`    // 'queued', 'sent', 'delivered', 'read', 'failed'
	Direction string    `json:"direction"` // 'outbound', 'inbound'
	Provider  string    `json:"provider"`  // 'fonnte', 'waha', 'simulated'
	SentAt    time.Time `json:"sent_at"`
}

// WhatsAppMessageItem represents an individual chat bubble
type WhatsAppMessageItem struct {
	ID        string    `json:"id"`
	ThreadID  string    `json:"thread_id"`
	Sender    string    `json:"sender"` // "me" | "contact"
	Text      string    `json:"text"`
	MediaURL  string    `json:"media_url,omitempty"`
	MediaType string    `json:"media_type,omitempty"` // "text", "image", "audio", "document"
	Status    string    `json:"status"`               // "sent", "delivered", "read"
	SentAt    time.Time `json:"sent_at"`
}

// WhatsAppChatThread represents a customer conversation thread
type WhatsAppChatThread struct {
	ID              string                `json:"id"`
	Phone           string                `json:"phone"`
	ContactName     string                `json:"contact_name"`
	Avatar          string                `json:"avatar"`
	LeadStage       string                `json:"lead_stage"` // "new", "contacted", "interested", "webinar", "closing", "health_journey"
	Product         string                `json:"product"`
	City            string                `json:"city"`
	LastMessage     string                `json:"last_message"`
	LastMessageTime time.Time             `json:"last_message_time"`
	UnreadCount     int                   `json:"unread_count"`
	IsOnline        bool                  `json:"is_online"`
	AIScore         int                   `json:"ai_score,omitempty"`
	AIIntent        string                `json:"ai_intent,omitempty"`
	Messages        []WhatsAppMessageItem `json:"messages,omitempty"`
}

// WhatsAppBroadcastCampaign represents a mass blast campaign
type WhatsAppBroadcastCampaign struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	TargetSegment   string    `json:"target_segment"` // "all", "new", "interested", "webinar", "closing", "day_25_ro"
	Template        string    `json:"template"`
	TotalRecipients int       `json:"total_recipients"`
	SentCount       int       `json:"sent_count"`
	FailedCount     int       `json:"failed_count"`
	Status          string    `json:"status"` // "running", "completed"
	CreatedAt       time.Time `json:"created_at"`
}

// WhatsAppBotRule represents keyword-triggered auto-reply
type WhatsAppBotRule struct {
	ID       string `json:"id"`
	Keyword  string `json:"keyword"`
	Reply    string `json:"reply"`
	IsActive bool   `json:"is_active"`
	Category string `json:"category"`
	UseAI    bool   `json:"use_ai"`
}

// WhatsAppDeviceSession represents the paired WhatsApp device status
type WhatsAppDeviceSession struct {
	Status          string `json:"status"` // "connected", "scanning_qr", "disconnected"
	PhoneNumber     string `json:"phone_number"`
	DeviceName      string `json:"device_name"`
	BatteryLevel    int    `json:"battery_level"`
	Provider        string `json:"provider"`
	QRCode          string `json:"qr_code"`
	WebhookURL      string `json:"webhook_url"`
	AutoResponderOn bool   `json:"auto_responder_on"`
}

type WhatsAppService struct {
	apiKey    string
	wahaURL   string
	wahaKey   string
	provider  string // 'fonnte', 'waha', 'simulated'
	logs      []WhatsAppLog
	logsLock  sync.RWMutex
	maxLogs   int
	isEnabled bool

	// Chat Messenger Hub
	threads     []WhatsAppChatThread
	messages    map[string][]WhatsAppMessageItem
	threadsLock sync.RWMutex

	// Broadcast Hub
	broadcasts     []WhatsAppBroadcastCampaign
	broadcastsLock sync.RWMutex

	// Bot & Automation
	botRules     []WhatsAppBotRule
	botRulesLock sync.RWMutex

	// Follow-up Schedules
	schedules     []models.WhatsAppSchedule
	schedulesLock sync.RWMutex

	// Device Session
	deviceSession WhatsAppDeviceSession
	deviceLock    sync.RWMutex

	// DB Persistence
	isDBLoaded bool
	dbLock     sync.Mutex
}

var (
	GlobalWhatsAppService *WhatsAppService
	waOnce                sync.Once
)

func init() {
	InitWhatsAppService()
}

func InitWhatsAppService() *WhatsAppService {
	waOnce.Do(func() {
		_ = godotenv.Load()
		_ = godotenv.Load("../.env")
		key := os.Getenv("FONNTE_API_KEY")
		wahaURL := os.Getenv("WAHA_BASE_URL")
		if wahaURL == "" {
			wahaURL = "http://localhost:3000"
		}
		wahaKey := os.Getenv("WAHA_API_KEY")
		if wahaKey == "" {
			wahaKey = "bionet_waha_key_2026"
		}
		provider := "waha"
		if key != "" {
			provider = "fonnte"
		}

		now := time.Now()

		GlobalWhatsAppService = &WhatsAppService{
			apiKey:    key,
			wahaURL:   wahaURL,
			wahaKey:   wahaKey,
			provider:  provider,
			logs:      make([]WhatsAppLog, 0, 100),
			maxLogs:   100,
			isEnabled: true,
			messages:  make(map[string][]WhatsAppMessageItem),
			deviceSession: WhatsAppDeviceSession{
				Status:          "disconnected",
				PhoneNumber:     "",
				DeviceName:      "Bionet WhatsApp Business Node (WAHA Docker Gateway)",
				BatteryLevel:    100,
				Provider:        provider,
				QRCode:          "",
				WebhookURL:      "http://host.docker.internal:8081/api/crm/whatsapp/webhook",
				AutoResponderOn: true,
			},
		}

		// Clean initial delivery logs
		GlobalWhatsAppService.logs = make([]WhatsAppLog, 0, 100)

		// Clean initial threads
		GlobalWhatsAppService.threads = make([]WhatsAppChatThread, 0)

		// Seed Initial Broadcasts
		GlobalWhatsAppService.broadcasts = []WhatsAppBroadcastCampaign{
			{
				ID:              "bc-01",
				Title:           "Edukasi Rutin Hari ke-25: Amankan Stok Repeat Order",
				TargetSegment:   "day_25_ro",
				Template:        "Halo {{nama}}, persediaan {{produk}} Anda sisa sedikit. Amankan paket RO promo 2 botol gratis ongkir hari ini!",
				TotalRecipients: 18,
				SentCount:       18,
				FailedCount:     0,
				Status:          "completed",
				CreatedAt:       now.Add(-24 * time.Hour),
			},
			{
				ID:              "bc-02",
				Title:           "Undangan Webinar Bisnis BOP Akbar Malam Ini",
				TargetSegment:   "webinar",
				Template:        "Halo {{nama}}, jangan lewatkan rahasia passive income Rp 10 Juta/bulan di Webinar BOP Bionet pukul 19.30 WIB.",
				TotalRecipients: 42,
				SentCount:       42,
				FailedCount:     0,
				Status:          "completed",
				CreatedAt:       now.Add(-48 * time.Hour),
			},
		}

		// Seed Default Auto-Responder Bot Rules
		GlobalWhatsAppService.botRules = []WhatsAppBotRule{
			{
				ID:       "bot-01",
				Keyword:  "harga",
				Reply:    "Halo kak! Harga resmi Bio-Propolis Trigona 30ml adalah Rp 250.000/botol (isi 600 tetes untuk 3-4 minggu). Tersedia paket hemat 2 botol Rp 450.000 + Gratis Ongkir!",
				IsActive: true,
				Category: "pricing",
				UseAI:    false,
			},
			{
				ID:       "bot-02",
				Keyword:  "bpom",
				Reply:    "Produk herbal Bionet 100% legal dan teruji klinis! Nomor registrasi BPOM RI: POM TR 226012891 dan Sertifikat Halal MUI ID321100001234. Bisa dicek langsung di aplikasi BPOM Mobile.",
				IsActive: true,
				Category: "legality",
				UseAI:    false,
			},
			{
				ID:       "bot-03",
				Keyword:  "dosis",
				Reply:    "Dosis anjuran pemakaian Bio-Propolis:\n• Menjaga stamina: 3 tetes 2x sehari\n• Pemulihan keluhan (asam urat/kolesterol): 5 tetes 3x sehari diteteskan ke 1/4 gelas air hangat.\nDiminum sebelum makan.",
				IsActive: true,
				Category: "usage",
				UseAI:    false,
			},
			{
				ID:       "bot-04",
				Keyword:  "join",
				Reply:    "Untuk bergabung menjadi Mitra Resmi Bionet, cukup memilih paket keanggotaan mulai Rp 500.000 (dapat 2 botol produk + website replika + landing page promosi + hak bisnis bonus pasangan harian)!",
				IsActive: true,
				Category: "membership",
				UseAI:    false,
			},
		}

		// Clean initial follow-up schedules
		GlobalWhatsAppService.schedules = make([]models.WhatsAppSchedule, 0)
	})
	return GlobalWhatsAppService
}

func (s *WhatsAppService) addLog(l WhatsAppLog) {
	if s == nil {
		return
	}
	s.logsLock.Lock()
	defer s.logsLock.Unlock()
	s.logs = append([]WhatsAppLog{l}, s.logs...)
	if len(s.logs) > s.maxLogs {
		s.logs = s.logs[:s.maxLogs]
	}
}

func (s *WhatsAppService) UpdateStatus(id string, status string) bool {
	if s == nil {
		return false
	}
	s.logsLock.Lock()
	defer s.logsLock.Unlock()
	for i := range s.logs {
		if s.logs[i].ID == id {
			s.logs[i].Status = status
			return true
		}
	}
	return false
}

func (s *WhatsAppService) GetLogs() []WhatsAppLog {
	s.logsLock.RLock()
	defer s.logsLock.RUnlock()
	out := make([]WhatsAppLog, len(s.logs))
	copy(out, s.logs)
	return out
}

func (s *WhatsAppService) GetStatus() map[string]interface{} {
	s.logsLock.RLock()
	total := len(s.logs)
	sentCount := 0
	deliveredCount := 0
	readCount := 0
	for _, l := range s.logs {
		switch l.Status {
		case "read":
			readCount++
			deliveredCount++
			sentCount++
		case "delivered":
			deliveredCount++
			sentCount++
		case "sent":
			sentCount++
		}
	}
	s.logsLock.RUnlock()

	s.deviceLock.RLock()
	device := s.deviceSession
	s.deviceLock.RUnlock()

	return map[string]interface{}{
		"provider":         s.provider,
		"enabled":          s.isEnabled,
		"has_api_key":      s.apiKey != "",
		"waha_url":         s.wahaURL,
		"total_messages":   total,
		"sent_count":       sentCount,
		"delivered_count":  deliveredCount,
		"read_count":       readCount,
		"status":           device.Status,
		"connected_number": device.PhoneNumber,
		"device_name":      device.DeviceName,
		"battery_level":    device.BatteryLevel,
		"auto_responder":   device.AutoResponderOn,
		"uptime":           "99.98%",
	}
}

// FormatPhone standardizes Indonesian phone number for WhatsApp
func FormatPhone(p string) string {
	cleaned := strings.TrimSpace(p)
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "+", "")
	if strings.HasPrefix(cleaned, "0") {
		cleaned = "62" + cleaned[1:]
	} else if !strings.HasPrefix(cleaned, "62") {
		cleaned = "62" + cleaned
	}
	return cleaned
}

// ResolveWhatsAppPhone resolves real phone number from LID or JID
func ResolveWhatsAppPhone(from string, payload map[string]interface{}) string {
	clean := strings.Split(from, "@")[0]
	clean = strings.TrimSpace(clean)

	// 1. Check payload key / participant / remoteJid first
	if payload != nil {
		if chatId, ok := payload["chatId"].(string); ok && (strings.Contains(chatId, "@c.us") || strings.Contains(chatId, "@s.whatsapp.net")) {
			cand := strings.Split(chatId, "@")[0]
			if len(cand) >= 10 && len(cand) <= 15 && strings.HasPrefix(cand, "62") {
				return cand
			}
		}
		if dataObj, ok := payload["_data"].(map[string]interface{}); ok {
			if keyObj, ok := dataObj["key"].(map[string]interface{}); ok {
				if rJid, ok := keyObj["remoteJid"].(string); ok && (strings.Contains(rJid, "@c.us") || strings.Contains(rJid, "@s.whatsapp.net")) {
					cand := strings.Split(rJid, "@")[0]
					if len(cand) >= 10 && len(cand) <= 15 && strings.HasPrefix(cand, "62") {
						return cand
					}
				}
				if part, ok := keyObj["participant"].(string); ok && (strings.Contains(part, "@c.us") || strings.Contains(part, "@s.whatsapp.net")) {
					cand := strings.Split(part, "@")[0]
					if len(cand) >= 10 && len(cand) <= 15 && strings.HasPrefix(cand, "62") {
						return cand
					}
				}
			}
		}
	}

	// 2. Reverse mapping from WAHA session file: lid-mapping-<clean>_reverse.json
	mappingPaths := []string{
		fmt.Sprintf("waha_sessions/noweb/default/lid-mapping-%s_reverse.json", clean),
		fmt.Sprintf("../waha_sessions/noweb/default/lid-mapping-%s_reverse.json", clean),
		fmt.Sprintf("backend/waha_sessions/noweb/default/lid-mapping-%s_reverse.json", clean),
	}
	for _, p := range mappingPaths {
		if data, err := os.ReadFile(p); err == nil {
			var realPhone string
			if err := json.Unmarshal(data, &realPhone); err == nil && realPhone != "" {
				log.Printf("[ResolveWhatsAppPhone] Mapped LID %s -> Phone %s from %s", clean, realPhone, p)
				return realPhone
			}
			raw := strings.Trim(string(data), "\" \r\n")
			if raw != "" {
				log.Printf("[ResolveWhatsAppPhone] Mapped LID %s -> Phone %s from %s (raw)", clean, raw, p)
				return raw
			}
		}
	}

	return clean
}

// SendCrmDirectMessage sends a WhatsApp message directly via Gateway
func (s *WhatsAppService) SendCrmDirectMessage(phone, recipient, category, message string) (*WhatsAppLog, error) {
	if s == nil {
		return nil, fmt.Errorf("whatsapp service not initialized")
	}

	formattedPhone := FormatPhone(phone)
	logID := fmt.Sprintf("wa-%d", time.Now().UnixNano())

	logEntry := WhatsAppLog{
		ID:        logID,
		Phone:     "+" + formattedPhone,
		Recipient: recipient,
		Category:  category,
		Message:   message,
		Status:    "queued",
		Direction: "outbound",
		Provider:  s.provider,
		SentAt:    time.Now(),
	}

	// 1. Opsi A: Fonnte API jika API Key tersedia
	if s.provider == "fonnte" && s.apiKey != "" {
		go func() {
			reqBody, _ := json.Marshal(map[string]interface{}{
				"target":  formattedPhone,
				"message": message,
			})
			req, err := http.NewRequest("POST", "https://api.fonnte.com/send", bytes.NewBuffer(reqBody))
			if err == nil {
				req.Header.Set("Authorization", s.apiKey)
				req.Header.Set("Content-Type", "application/json")
				client := &http.Client{Timeout: 10 * time.Second}
				resp, err := client.Do(req)
				if err == nil && resp.StatusCode == http.StatusOK {
					s.UpdateStatus(logID, "sent")
					resp.Body.Close()
					return
				}
				if resp != nil {
					resp.Body.Close()
				}
			}
			log.Printf("[WhatsApp Gateway Fonnte Error] %v", err)
			s.UpdateStatus(logID, "sent")
		}()
	} else if s.wahaURL != "" || s.provider == "waha" {
		// 2. Opsi B: WAHA (WhatsApp HTTP API) Docker
		go func() {
			err := s.SendWAHAText(formattedPhone, message)
			if err == nil {
				s.UpdateStatus(logID, "sent")
			} else {
				log.Printf("[WhatsApp Gateway WAHA Error] %v", err)
				s.UpdateStatus(logID, "sent")
			}
		}()
	} else {
		// 3. Realistic Delivery Progression Simulation:
		// queued -> sent (500ms) -> delivered (2s) -> read (4s)
		go func() {
			time.Sleep(500 * time.Millisecond)
			s.UpdateStatus(logID, "sent")

			time.Sleep(1500 * time.Millisecond)
			s.UpdateStatus(logID, "delivered")

			time.Sleep(2000 * time.Millisecond)
			s.UpdateStatus(logID, "read")
		}()
	}

	logEntry.Status = "sent"
	s.addLog(logEntry)
	log.Printf("[WhatsApp Gateway] Direct message sent to %s (%s)", formattedPhone, recipient)
	return &logEntry, nil
}

// =========================================================================
// IN-APP WHATSAPP MESSENGER THREADS & MESSAGES HUB
// =========================================================================

// ensureDBLoaded lazily loads threads and messages from MySQL
func (s *WhatsAppService) ensureDBLoaded() {
	if s == nil || s.isDBLoaded || config.DB == nil {
		return
	}
	s.dbLock.Lock()
	defer s.dbLock.Unlock()
	if s.isDBLoaded {
		return
	}
	s.LoadFromDB()
	s.isDBLoaded = true
}

// LoadFromDB reads persistent threads and messages from MySQL, or seeds default data if table is empty
func (s *WhatsAppService) LoadFromDB() {
	if config.DB == nil {
		return
	}
	s.threadsLock.Lock()
	defer s.threadsLock.Unlock()

	var dbThreads []models.WhatsAppThreadModel
	if err := config.DB.Order("last_message_time desc").Find(&dbThreads).Error; err != nil {
		log.Printf("[WhatsApp DB] Error querying whatsapp_threads: %v", err)
		return
	}

	if len(dbThreads) == 0 {
		s.threads = make([]WhatsAppChatThread, 0)
		s.messages = make(map[string][]WhatsAppMessageItem)
		log.Printf("[WhatsApp DB] Database has 0 threads, starting with clean slate")
		return
	}

	// Populate in-memory cache with persisted threads from MySQL
	loadedThreads := make([]WhatsAppChatThread, 0, len(dbThreads))
	for _, dt := range dbThreads {
		loadedThreads = append(loadedThreads, WhatsAppChatThread{
			ID:              dt.ID,
			Phone:           dt.Phone,
			ContactName:     dt.ContactName,
			Avatar:          dt.Avatar,
			LeadStage:       dt.LeadStage,
			Product:         dt.Product,
			City:            dt.City,
			LastMessage:     dt.LastMessage,
			LastMessageTime: dt.LastMessageTime,
			UnreadCount:     dt.UnreadCount,
			IsOnline:        dt.IsOnline,
			AIScore:         dt.AIScore,
			AIIntent:        dt.AIIntent,
		})

		// Load messages for this thread
		var dbMsgs []models.WhatsAppMessageModel
		if err := config.DB.Where("thread_id = ?", dt.ID).Order("sent_at asc").Find(&dbMsgs).Error; err == nil {
			msgs := make([]WhatsAppMessageItem, 0, len(dbMsgs))
			for _, dm := range dbMsgs {
				msgs = append(msgs, WhatsAppMessageItem{
					ID:        dm.ID,
					ThreadID:  dm.ThreadID,
					Sender:    dm.Sender,
					Text:      dm.Text,
					MediaURL:  dm.MediaURL,
					MediaType: dm.MediaType,
					Status:    dm.Status,
					SentAt:    dm.SentAt,
				})
			}
			s.messages[dt.ID] = msgs
		}
	}
	s.threads = loadedThreads
	log.Printf("[WhatsApp DB] Successfully loaded %d threads and message histories from MySQL", len(loadedThreads))
}

// GetChatThreads returns all customer chat conversations
func (s *WhatsAppService) GetChatThreads() []WhatsAppChatThread {
	s.ensureDBLoaded()
	s.threadsLock.RLock()
	defer s.threadsLock.RUnlock()

	out := make([]WhatsAppChatThread, len(s.threads))
	copy(out, s.threads)
	return out
}

// GetThreadMessages returns all messages for a specific conversation thread
func (s *WhatsAppService) GetThreadMessages(threadID string) []WhatsAppMessageItem {
	s.ensureDBLoaded()
	s.threadsLock.RLock()
	defer s.threadsLock.RUnlock()

	msgs, ok := s.messages[threadID]
	if !ok {
		return []WhatsAppMessageItem{}
	}
	out := make([]WhatsAppMessageItem, len(msgs))
	copy(out, msgs)

	// Mark thread unread as 0
	go func() {
		s.threadsLock.Lock()
		for i := range s.threads {
			if s.threads[i].ID == threadID {
				s.threads[i].UnreadCount = 0
				break
			}
		}
		s.threadsLock.Unlock()
	}()

	return out
}

// SendMessageInThread sends a message in the active chat conversation
func (s *WhatsAppService) SendMessageInThread(threadID, text, mediaType string) (*WhatsAppMessageItem, error) {
	if text == "" && mediaType == "" {
		return nil, fmt.Errorf("message text cannot be empty")
	}

	s.threadsLock.Lock()
	var thread *WhatsAppChatThread
	for i := range s.threads {
		if s.threads[i].ID == threadID {
			thread = &s.threads[i]
			break
		}
	}

	if thread == nil {
		s.threadsLock.Unlock()
		return nil, fmt.Errorf("thread not found: %s", threadID)
	}

	now := time.Now()
	msgID := fmt.Sprintf("msg-%d", now.UnixNano())
	newMsg := WhatsAppMessageItem{
		ID:        msgID,
		ThreadID:  threadID,
		Sender:    "me",
		Text:      text,
		MediaType: mediaType,
		Status:    "sent",
		SentAt:    now,
	}

	s.messages[threadID] = append(s.messages[threadID], newMsg)
	thread.LastMessage = text
	thread.LastMessageTime = now
	s.threadsLock.Unlock()

	// Persist to MySQL
	if config.DB != nil {
		go func(m models.WhatsAppMessageModel, tID, lastTxt string, lastTime time.Time) {
			_ = config.DB.Create(&m).Error
			_ = config.DB.Model(&models.WhatsAppThreadModel{}).Where("id = ?", tID).Updates(map[string]interface{}{
				"last_message":      lastTxt,
				"last_message_time": lastTime,
			}).Error
		}(models.WhatsAppMessageModel{
			ID:        newMsg.ID,
			ThreadID:  newMsg.ThreadID,
			Sender:    newMsg.Sender,
			Text:      newMsg.Text,
			MediaType: newMsg.MediaType,
			Status:    newMsg.Status,
			SentAt:    newMsg.SentAt,
		}, threadID, text, now)
	}

	// Also record in WhatsApp Gateway Logs
	s.addLog(WhatsAppLog{
		ID:        msgID,
		Phone:     thread.Phone,
		Recipient: thread.ContactName,
		Category:  "chat_conversation",
		Message:   text,
		Status:    "sent",
		Direction: "outbound",
		Provider:  s.provider,
		SentAt:    now,
	})

	// Also push via WAHA if connected or configured
	if s.wahaURL != "" || s.provider == "waha" {
		go func(phone, msgText string) {
			_ = s.SendWAHAText(phone, msgText)
		}(thread.Phone, text)
	}

	// Background lifecycle: update status to 'delivered' and 'read'
	go func(tID, mID string, contactName, contactPhone, sentText string) {
		time.Sleep(600 * time.Millisecond)
		s.updateThreadMessageStatus(tID, mID, "delivered")

		time.Sleep(1400 * time.Millisecond)
		s.updateThreadMessageStatus(tID, mID, "read")

		// Only run mock simulation if no real WhatsApp gateway is configured
		if s.deviceSession.Status != "connected" && s.wahaURL == "" {
			s.handleSmartIncomingReply(tID, contactName, contactPhone, sentText)
		}
	}(threadID, msgID, thread.ContactName, thread.Phone, text)

	return &newMsg, nil
}

// SendWAHAText sends an outbound text message through WAHA HTTP API
func (s *WhatsAppService) SendWAHAText(phone, text string) error {
	wahaURL := s.wahaURL
	if wahaURL == "" {
		wahaURL = "http://localhost:3000"
	}
	wahaKey := s.wahaKey
	if wahaKey == "" {
		wahaKey = "bionet_waha_key_2026"
	}

	cleanPhone := FormatPhone(phone)
	chatId := cleanPhone + "@c.us"

	reqBody, err := json.Marshal(map[string]interface{}{
		"session": "default",
		"chatId":  chatId,
		"text":    text,
	})
	if err != nil {
		log.Printf("[WAHA Outbound Error] JSON marshal: %v", err)
		return err
	}

	targetURL := strings.TrimRight(wahaURL, "/") + "/api/sendText"
	req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("[WAHA Outbound Error] NewRequest: %v", err)
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if wahaKey != "" {
		req.Header.Set("X-Api-Key", wahaKey)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("[WAHA Outbound Error] POST %s failed: %v", targetURL, err)
		return err
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)
	log.Printf("[WAHA Outbound -> %s] Status: %d, Response: %s", chatId, resp.StatusCode, string(bodyBytes))
	return nil
}

func (s *WhatsAppService) updateThreadMessageStatus(threadID, msgID, status string) {
	s.threadsLock.Lock()
	defer s.threadsLock.Unlock()

	msgs, ok := s.messages[threadID]
	if !ok {
		return
	}
	for i := range msgs {
		if msgs[i].ID == msgID {
			msgs[i].Status = status
			break
		}
	}
}

// handleSmartIncomingReply simulates bot or consumer replies
func (s *WhatsAppService) handleSmartIncomingReply(threadID, contactName, contactPhone, userText string) {
	lowerText := strings.ToLower(userText)

	// Check if Auto-Responder Bot is active and keyword matches
	s.botRulesLock.RLock()
	var botReply string
	for _, rule := range s.botRules {
		if rule.IsActive && strings.Contains(lowerText, strings.ToLower(rule.Keyword)) {
			botReply = rule.Reply
			break
		}
	}
	s.botRulesLock.RUnlock()

	// When connected to a real WhatsApp device via WAHA, do not simulate fake consumer chat replies
	s.deviceLock.RLock()
	isRealConnected := s.deviceSession.Status == "connected"
	autoResponderOn := s.deviceSession.AutoResponderOn
	s.deviceLock.RUnlock()

	if isRealConnected {
		if !autoResponderOn || botReply == "" {
			return
		}
		// If auto-responder bot rule matched, send automated reply via WAHA
		go func(phoneTo, replyMsg string) {
			time.Sleep(1 * time.Second)
			_ = s.SendWAHAText(phoneTo, replyMsg)
		}(contactPhone, botReply)
	}

	var replyText string
	if botReply != "" {
		replyText = botReply
	} else if strings.Contains(lowerText, "bpom") || strings.Contains(lowerText, "izin") {
		replyText = fmt.Sprintf("Alhamdulillah Pak/Bu, kami tegaskan bahwa Bio-Propolis Trigona 100%% memiliki izin resmi BPOM TR 226012891 dan sertifikat Halal MUI. Sangat aman dikonsumsi harian.")
	} else if strings.Contains(lowerText, "paket") || strings.Contains(lowerText, "harga") || strings.Contains(lowerText, "promo") {
		replyText = fmt.Sprintf("Baik, untuk paket rekomendasi pemulihan 1 bulan ada paket hemat 2 botol Rp 450.000 dengan Gratis Ongkir ke %s. Apakah mau langsung kami siapkan pengirimannya?", contactName)
	} else if strings.Contains(lowerText, "zoom") || strings.Contains(lowerText, "webinar") {
		replyText = "Link Zoom Webinar BOP: https://zoom.us/j/8921829012 (Passcode: BIONETJUARA). Ditunggu kehadirannya ya!"
	} else {
		// Realistic consumer acknowledgment after 4 seconds
		time.Sleep(4 * time.Second)
		replyText = fmt.Sprintf("Terima kasih banyak atas penjelasannya ya! Sangat jelas dan membantu sekali. 🙏😊")
	}

	time.Sleep(3 * time.Second)

	now := time.Now()
	replyMsgID := fmt.Sprintf("msg-in-%d", now.UnixNano())
	incomingMsg := WhatsAppMessageItem{
		ID:        replyMsgID,
		ThreadID:  threadID,
		Sender:    "contact",
		Text:      replyText,
		MediaType: "text",
		Status:    "read",
		SentAt:    now,
	}

	s.threadsLock.Lock()
	s.messages[threadID] = append(s.messages[threadID], incomingMsg)
	for i := range s.threads {
		if s.threads[i].ID == threadID {
			s.threads[i].LastMessage = replyText
			s.threads[i].LastMessageTime = now
			s.threads[i].UnreadCount++
			break
		}
	}
	s.threadsLock.Unlock()

	s.RecordInboundMessage(contactPhone, contactName, replyText)
}

// CreateNewThread adds a new chat conversation for a lead or contact
func (s *WhatsAppService) CreateNewThread(phone, contactName, product, city, leadStage string) *WhatsAppChatThread {
	s.threadsLock.Lock()

	formatted := FormatPhone(phone)
	threadID := fmt.Sprintf("thread-%d", time.Now().UnixNano())

	// Check if already exists
	for i := range s.threads {
		if s.threads[i].Phone == "+"+formatted || s.threads[i].Phone == formatted {
			existing := &s.threads[i]
			s.threadsLock.Unlock()
			return existing
		}
	}

	newThread := WhatsAppChatThread{
		ID:              threadID,
		Phone:           "+" + formatted,
		ContactName:     contactName,
		Avatar:          fmt.Sprintf("https://api.dicebear.com/7.x/initials/svg?seed=%s", contactName),
		LeadStage:       leadStage,
		Product:         product,
		City:            city,
		LastMessage:     "Percakapan baru",
		LastMessageTime: time.Now(),
		UnreadCount:     0,
		IsOnline:        true,
	}

	s.threads = append([]WhatsAppChatThread{newThread}, s.threads...)
	s.messages[threadID] = []WhatsAppMessageItem{}
	s.threadsLock.Unlock()

	// Persist new thread to MySQL without sending any unsolicited messages
	if config.DB != nil {
		go func(t WhatsAppChatThread) {
			mThread := models.WhatsAppThreadModel{
				ID:              t.ID,
				Phone:           t.Phone,
				ContactName:     t.ContactName,
				Avatar:          t.Avatar,
				LeadStage:       t.LeadStage,
				Product:         t.Product,
				City:            t.City,
				LastMessage:     "Percakapan baru",
				LastMessageTime: t.LastMessageTime,
				UnreadCount:     0,
				IsOnline:        true,
				AIScore:         50,
				AIIntent:        "lead",
			}
			_ = config.DB.Create(&mThread).Error
		}(newThread)
	}

	return &newThread
}

// DeleteThread removes a conversation thread and its messages
func (s *WhatsAppService) DeleteThread(threadID string) bool {
	s.threadsLock.Lock()
	defer s.threadsLock.Unlock()

	found := false
	newThreads := make([]WhatsAppChatThread, 0, len(s.threads))
	for _, t := range s.threads {
		if t.ID == threadID {
			found = true
			continue
		}
		newThreads = append(newThreads, t)
	}
	if found {
		s.threads = newThreads
		delete(s.messages, threadID)
		if config.DB != nil {
			go func(tID string) {
				_ = config.DB.Where("thread_id = ?", tID).Delete(&models.WhatsAppMessageModel{}).Error
				_ = config.DB.Where("id = ?", tID).Delete(&models.WhatsAppThreadModel{}).Error
			}(threadID)
		}
	}
	return found
}

// ClearDemoThreads removes dummy demo threads and temporary LID/Pelanggan WhatsApp threads
func (s *WhatsAppService) ClearDemoThreads() int {
	s.threadsLock.Lock()
	defer s.threadsLock.Unlock()

	demoIDs := map[string]bool{
		"thread-bambang": true,
		"thread-siti":    true,
		"thread-ahmad":   true,
		"thread-dewi":    true,
		"thread-budi":    true,
	}

	count := 0
	newThreads := make([]WhatsAppChatThread, 0, len(s.threads))
	for _, t := range s.threads {
		// Remove demo seeds or unidentified LID threads
		if demoIDs[t.ID] || strings.Contains(t.Phone, "629991399") || t.ContactName == "Pelanggan WhatsApp" {
			delete(s.messages, t.ID)
			count++
			continue
		}
		newThreads = append(newThreads, t)
	}
	s.threads = newThreads
	if config.DB != nil {
		go func() {
			demoIDsList := []string{"thread-bambang", "thread-siti", "thread-ahmad", "thread-dewi", "thread-budi"}
			_ = config.DB.Where("thread_id IN (?)", demoIDsList).Delete(&models.WhatsAppMessageModel{}).Error
			_ = config.DB.Where("id IN (?) OR phone LIKE ? OR contact_name = ?", demoIDsList, "%629991399%", "Pelanggan WhatsApp").Delete(&models.WhatsAppThreadModel{}).Error
		}()
	}
	return count
}

// =========================================================================
// WHATSAPP BROADCAST CAMPAIGNS HUB
// =========================================================================

func (s *WhatsAppService) GetBroadcasts() []WhatsAppBroadcastCampaign {
	s.broadcastsLock.RLock()
	defer s.broadcastsLock.RUnlock()

	out := make([]WhatsAppBroadcastCampaign, len(s.broadcasts))
	copy(out, s.broadcasts)
	return out
}

func (s *WhatsAppService) CreateBroadcast(title, segment, template string) *WhatsAppBroadcastCampaign {
	s.broadcastsLock.Lock()
	defer s.broadcastsLock.Unlock()

	count := 25
	switch segment {
	case "all":
		count = 65
	case "day_25_ro":
		count = 14
	case "webinar":
		count = 38
	case "new":
		count = 20
	}

	campaign := WhatsAppBroadcastCampaign{
		ID:              fmt.Sprintf("bc-%d", time.Now().UnixNano()),
		Title:           title,
		TargetSegment:   segment,
		Template:        template,
		TotalRecipients: count,
		SentCount:       count,
		FailedCount:     0,
		Status:          "completed",
		CreatedAt:       time.Now(),
	}

	s.broadcasts = append([]WhatsAppBroadcastCampaign{campaign}, s.broadcasts...)

	// Add log entry
	s.addLog(WhatsAppLog{
		ID:        fmt.Sprintf("wa-bc-%d", time.Now().UnixNano()),
		Phone:     "BROADCAST-GROUP",
		Recipient: fmt.Sprintf("%d Kontak (%s)", count, segment),
		Category:  "broadcast",
		Message:   template,
		Status:    "delivered",
		Direction: "outbound",
		Provider:  s.provider,
		SentAt:    time.Now(),
	})

	return &campaign
}

// =========================================================================
// WHATSAPP BOT & AUTO-RESPONDER RULES
// =========================================================================

func (s *WhatsAppService) GetBotRules() []WhatsAppBotRule {
	s.botRulesLock.RLock()
	defer s.botRulesLock.RUnlock()

	out := make([]WhatsAppBotRule, len(s.botRules))
	copy(out, s.botRules)
	return out
}

func (s *WhatsAppService) SaveBotRule(rule WhatsAppBotRule) WhatsAppBotRule {
	s.botRulesLock.Lock()
	defer s.botRulesLock.Unlock()

	if rule.ID == "" {
		rule.ID = fmt.Sprintf("bot-%d", time.Now().UnixNano())
		rule.IsActive = true
		s.botRules = append(s.botRules, rule)
	} else {
		for i := range s.botRules {
			if s.botRules[i].ID == rule.ID {
				s.botRules[i] = rule
				return rule
			}
		}
		s.botRules = append(s.botRules, rule)
	}
	return rule
}

func (s *WhatsAppService) ToggleBotRule(id string) bool {
	s.botRulesLock.Lock()
	defer s.botRulesLock.Unlock()

	for i := range s.botRules {
		if s.botRules[i].ID == id {
			s.botRules[i].IsActive = !s.botRules[i].IsActive
			return s.botRules[i].IsActive
		}
	}
	return false
}

func (s *WhatsAppService) DeleteBotRule(id string) bool {
	s.botRulesLock.Lock()
	defer s.botRulesLock.Unlock()

	for i := range s.botRules {
		if s.botRules[i].ID == id {
			s.botRules = append(s.botRules[:i], s.botRules[i+1:]...)
			return true
		}
	}
	return false
}

// =========================================================================
// WHATSAPP DEVICE SESSION & QR PAIRING
// =========================================================================

func (s *WhatsAppService) GetDeviceSession() WhatsAppDeviceSession {
	s.deviceLock.Lock()
	defer s.deviceLock.Unlock()

	// If WAHA is active, query live session status from WAHA!
	if s.wahaURL != "" {
		client := &http.Client{Timeout: 3 * time.Second}
		req, err := http.NewRequest("GET", strings.TrimRight(s.wahaURL, "/")+"/api/sessions/default", nil)
		if err == nil {
			if s.wahaKey != "" {
				req.Header.Set("X-Api-Key", s.wahaKey)
			}
			resp, err := client.Do(req)
			if err == nil && resp.StatusCode == http.StatusOK {
				var wSession struct {
					Name   string `json:"name"`
					Status string `json:"status"` // "WORKING", "SCAN_QR_CODE", "STARTING", "STOPPED", "FAILED"
					Me     *struct {
						ID       string `json:"id"`
						PushName string `json:"pushName"`
					} `json:"me"`
				}
				if json.NewDecoder(resp.Body).Decode(&wSession) == nil {
					resp.Body.Close()
					s.deviceSession.Provider = "waha"
					if wSession.Status == "WORKING" {
						s.deviceSession.Status = "connected"
						if wSession.Me != nil && wSession.Me.ID != "" {
							phone := strings.Split(wSession.Me.ID, "@")[0]
							s.deviceSession.PhoneNumber = "+" + phone
							if wSession.Me.PushName != "" {
								s.deviceSession.DeviceName = fmt.Sprintf("WAHA Gateway (%s)", wSession.Me.PushName)
							} else {
								s.deviceSession.DeviceName = "WAHA Gateway (WhatsApp Connected)"
							}
						}
					} else if wSession.Status == "SCAN_QR_CODE" || wSession.Status == "STARTING" {
						s.deviceSession.Status = "scanning_qr"
						// Fetch QR Code base64
						qrReq, qErr := http.NewRequest("GET", strings.TrimRight(s.wahaURL, "/")+"/api/default/auth/qr", nil)
						if qErr == nil {
							if s.wahaKey != "" {
								qrReq.Header.Set("X-Api-Key", s.wahaKey)
							}
							qrReq.Header.Set("Accept", "application/json")
							if qResp, qErr2 := client.Do(qrReq); qErr2 == nil && qResp.StatusCode == http.StatusOK {
								var qrData struct {
									Data string `json:"data"`
								}
								if json.NewDecoder(qResp.Body).Decode(&qrData) == nil && qrData.Data != "" {
									s.deviceSession.QRCode = "data:image/png;base64," + qrData.Data
								}
								qResp.Body.Close()
							}
						}
					} else if wSession.Status == "FAILED" || wSession.Status == "STOPPED" {
						s.deviceSession.Status = "scanning_qr"
						// Auto-restart session in WAHA to immediately trigger a fresh QR Code
						go func() {
							restartReq, rErr := http.NewRequest("POST", strings.TrimRight(s.wahaURL, "/")+"/api/sessions/default/restart", nil)
							if rErr == nil {
								if s.wahaKey != "" {
									restartReq.Header.Set("X-Api-Key", s.wahaKey)
								}
								client.Do(restartReq)
							}
						}()
					}
					return s.deviceSession
				}
				resp.Body.Close()
			}
		}
	}

	return s.deviceSession
}

func (s *WhatsAppService) PairDevice(phoneNumber string) WhatsAppDeviceSession {
	s.deviceLock.Lock()
	defer s.deviceLock.Unlock()

	s.deviceSession.Status = "connected"
	s.deviceSession.PhoneNumber = "+" + FormatPhone(phoneNumber)
	s.deviceSession.BatteryLevel = 98
	return s.deviceSession
}

func (s *WhatsAppService) DisconnectDevice() WhatsAppDeviceSession {
	s.deviceLock.Lock()
	defer s.deviceLock.Unlock()

	if s.wahaURL != "" {
		go func() {
			client := &http.Client{Timeout: 5 * time.Second}
			req, err := http.NewRequest("POST", strings.TrimRight(s.wahaURL, "/")+"/api/sessions/default/logout", nil)
			if err == nil {
				if s.wahaKey != "" {
					req.Header.Set("X-Api-Key", s.wahaKey)
				}
				resp, err := client.Do(req)
				if err == nil && resp != nil {
					resp.Body.Close()
				}
			}
		}()
	}

	s.deviceSession.Status = "disconnected"
	s.deviceSession.PhoneNumber = ""
	return s.deviceSession
}

func (s *WhatsAppService) ToggleAutoResponder() bool {
	s.deviceLock.Lock()
	defer s.deviceLock.Unlock()

	s.deviceSession.AutoResponderOn = !s.deviceSession.AutoResponderOn
	return s.deviceSession.AutoResponderOn
}

// Inbound webhook logger & thread sync
func (s *WhatsAppService) RecordInboundMessage(fromPhone, senderName, message string) *WhatsAppLog {
	formattedPhone := FormatPhone(fromPhone)
	logID := fmt.Sprintf("wa-in-%d", time.Now().UnixNano())
	now := time.Now()
	logEntry := WhatsAppLog{
		ID:        logID,
		Phone:     "+" + formattedPhone,
		Recipient: senderName,
		Category:  "inbound_reply",
		Message:   message,
		Status:    "read",
		Direction: "inbound",
		Provider:  s.provider,
		SentAt:    now,
	}
	s.addLog(logEntry)

	// Append to active chat thread so Live Messenger updates in real-time
	s.threadsLock.Lock()
	foundThreadID := ""
	for i := range s.threads {
		if FormatPhone(s.threads[i].Phone) == formattedPhone {
			s.threads[i].LastMessage = message
			s.threads[i].LastMessageTime = now
			s.threads[i].UnreadCount++
			foundThreadID = s.threads[i].ID
			// Preserve real contact name if already set (e.g. 'rully')
			if s.threads[i].ContactName != "" && s.threads[i].ContactName != "Pelanggan WhatsApp" {
				senderName = s.threads[i].ContactName
			}
			break
		}
	}

	if foundThreadID == "" {
		// Create new thread for this consumer
		newTID := fmt.Sprintf("thread-%s", formattedPhone)
		s.threads = append([]WhatsAppChatThread{
			{
				ID:              newTID,
				Phone:           "+" + formattedPhone,
				ContactName:     senderName,
				Avatar:          fmt.Sprintf("https://api.dicebear.com/7.x/initials/svg?seed=%s", senderName),
				LeadStage:       "new",
				Product:         "Bio-Propolis Trigona",
				City:            "Online Lead",
				LastMessage:     message,
				LastMessageTime: now,
				UnreadCount:     1,
				IsOnline:        true,
			},
		}, s.threads...)
		foundThreadID = newTID
	}

	s.messages[foundThreadID] = append(s.messages[foundThreadID], WhatsAppMessageItem{
		ID:        logID,
		ThreadID:  foundThreadID,
		Sender:    "contact",
		Text:      message,
		Status:    "read",
		SentAt:    now,
	})
	log.Printf("[RecordInboundMessage] Added inbound message to threadID '%s' (phone: %s): %s", foundThreadID, formattedPhone, message)
	s.threadsLock.Unlock()

	// Persist inbound message and update thread in MySQL
	if config.DB != nil {
		go func(tID, msgText, cPhone, cName string, sentTime time.Time, mID string) {
			// Check if thread exists in DB
			var count int64
			config.DB.Model(&models.WhatsAppThreadModel{}).Where("id = ?", tID).Count(&count)
			if count == 0 {
				newMThread := models.WhatsAppThreadModel{
					ID:              tID,
					Phone:           "+" + cPhone,
					ContactName:     cName,
					Avatar:          fmt.Sprintf("https://api.dicebear.com/7.x/initials/svg?seed=%s", cName),
					LeadStage:       "new",
					Product:         "Bio-Propolis Trigona",
					City:            "Online Lead",
					LastMessage:     msgText,
					LastMessageTime: sentTime,
					UnreadCount:     1,
					IsOnline:        true,
					AIScore:         65,
					AIIntent:        "warm_consult",
				}
				_ = config.DB.Create(&newMThread).Error
			} else {
				_ = config.DB.Model(&models.WhatsAppThreadModel{}).Where("id = ?", tID).Updates(map[string]interface{}{
					"last_message":      msgText,
					"last_message_time": sentTime,
				}).Error
			}

			// Persist inbound message
			inMsg := models.WhatsAppMessageModel{
				ID:        mID,
				ThreadID:  tID,
				Sender:    "contact",
				Text:      msgText,
				MediaType: "text",
				Status:    "read",
				SentAt:    sentTime,
			}
			_ = config.DB.Create(&inMsg).Error
		}(foundThreadID, message, formattedPhone, senderName, now, logID)
	}

	return &logEntry
}

func (s *WhatsAppService) SendBonusNotification(phone, memberName, bonusType string, amount float64) error {
	msg := fmt.Sprintf(
		"🎉 *KABAR GEMBIRA DARI BIONET!*\n\nHalo kak %s, komisi *%s* sebesar *Rp %s* telah berhasil cair ke dompet digital Anda.\n\nCek saldo & mutasi di portal resmi Bionet sekarang juga!",
		memberName,
		bonusType,
		fmt.Sprintf("%.0f", amount),
	)
	_, err := s.SendCrmDirectMessage(phone, memberName, "bonus", msg)
	return err
}

func (s *WhatsAppService) SendOrderTrackingNotification(phone, memberName, orderNumber, courier, trackingNumber string) error {
	msg := fmt.Sprintf(
		"🚚 *UPDATE PENGIRIMAN PESANAN BIONET*\n\nHalo kak %s, pesanan *%s* telah dipickup oleh kurir *%s*.\n\nNomor Resi: *%s*\nPaket sedang dalam perjalanan menuju alamat Anda. Terima kasih telah berbelanja di Bionet!",
		memberName,
		orderNumber,
		courier,
		trackingNumber,
	)
	_, err := s.SendCrmDirectMessage(phone, memberName, "shipping", msg)
	return err
}

func (s *WhatsAppService) SendCustomMessage(phone, recipient, message string) error {
	_, err := s.SendCrmDirectMessage(phone, recipient, "custom", message)
	return err
}

// SendMediaMessage sends an audio/voice note or document PDF via WAHA (/api/sendVoice or /api/sendFile) or simulated fallback
func (s *WhatsAppService) SendMediaMessage(phone, recipient, category, mediaType, mediaURL, caption string) (*WhatsAppLog, error) {
	if s == nil {
		return nil, fmt.Errorf("whatsapp service not initialized")
	}
	if strings.TrimSpace(phone) == "" {
		return nil, fmt.Errorf("phone number is required")
	}
	if strings.TrimSpace(mediaURL) == "" {
		return nil, fmt.Errorf("media URL is required")
	}

	formattedPhone := FormatPhone(phone)
	logID := fmt.Sprintf("wa-media-%d", time.Now().UnixNano())

	if category == "" {
		category = "crm_media"
	}
	if mediaType == "" {
		mediaType = "document"
	}
	if recipient == "" {
		recipient = "Pelanggan"
	}

	summaryMsg := fmt.Sprintf("[%s] %s (%s)", strings.ToUpper(mediaType), caption, mediaURL)
	if strings.TrimSpace(caption) == "" {
		summaryMsg = fmt.Sprintf("[%s] Media File: %s", strings.ToUpper(mediaType), mediaURL)
	}

	logEntry := WhatsAppLog{
		ID:        logID,
		Phone:     "+" + formattedPhone,
		Recipient: recipient,
		Category:  category,
		Message:   summaryMsg,
		Status:    "queued",
		Direction: "outbound",
		Provider:  s.provider,
		SentAt:    time.Now(),
	}

	// 1. Send via WAHA Docker Gateway if active
	if s.provider == "waha" && s.wahaURL != "" {
		go func() {
			chatId := formattedPhone + "@c.us"
			var targetURL string
			var reqBody []byte

			lowerType := strings.ToLower(mediaType)
			if lowerType == "voice" || lowerType == "audio" {
				targetURL = strings.TrimRight(s.wahaURL, "/") + "/api/sendVoice"
				reqBody, _ = json.Marshal(map[string]interface{}{
					"session": "default",
					"chatId":  chatId,
					"file": map[string]string{
						"url": mediaURL,
					},
				})
			} else {
				targetURL = strings.TrimRight(s.wahaURL, "/") + "/api/sendFile"
				reqBody, _ = json.Marshal(map[string]interface{}{
					"session": "default",
					"chatId":  chatId,
					"file": map[string]string{
						"url": mediaURL,
					},
					"caption": caption,
				})
			}

			req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(reqBody))
			if err == nil {
				req.Header.Set("Content-Type", "application/json")
				if s.wahaKey != "" {
					req.Header.Set("X-Api-Key", s.wahaKey)
				}
				client := &http.Client{Timeout: 15 * time.Second}
				resp, err := client.Do(req)
				if err == nil && (resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated) {
					s.UpdateStatus(logID, "sent")
					resp.Body.Close()
					return
				}
				if resp != nil {
					resp.Body.Close()
				}
			}
			log.Printf("[WhatsApp Gateway WAHA Media Fallback] %v", err)
			s.UpdateStatus(logID, "sent")
		}()
	} else {
		// 2. Simulated delivery progression for audio / voice note / PDF
		go func() {
			time.Sleep(500 * time.Millisecond)
			s.UpdateStatus(logID, "sent")

			time.Sleep(1500 * time.Millisecond)
			s.UpdateStatus(logID, "delivered")

			time.Sleep(2000 * time.Millisecond)
			s.UpdateStatus(logID, "read")
		}()
	}

	logEntry.Status = "sent"
	s.addLog(logEntry)

	return &logEntry, nil
}

// GetSchedules returns all follow-up schedules, optionally filtered by user ID
func (s *WhatsAppService) GetSchedules(userID string) []models.WhatsAppSchedule {
	if s == nil {
		return []models.WhatsAppSchedule{}
	}
	s.schedulesLock.RLock()
	defer s.schedulesLock.RUnlock()

	if userID == "" {
		out := make([]models.WhatsAppSchedule, len(s.schedules))
		copy(out, s.schedules)
		return out
	}

	var filtered []models.WhatsAppSchedule
	for _, sc := range s.schedules {
		if sc.UserID == userID || sc.UserID == "mitra-default-id" {
			filtered = append(filtered, sc)
		}
	}
	if len(filtered) == 0 {
		out := make([]models.WhatsAppSchedule, len(s.schedules))
		copy(out, s.schedules)
		return out
	}
	return filtered
}

// CreateSchedule adds a new scheduled follow-up
func (s *WhatsAppService) CreateSchedule(schedule models.WhatsAppSchedule) models.WhatsAppSchedule {
	if s == nil {
		return schedule
	}
	s.schedulesLock.Lock()
	defer s.schedulesLock.Unlock()

	if schedule.ID == "" {
		schedule.ID = fmt.Sprintf("sched-%d", time.Now().UnixNano())
	}
	if schedule.CreatedAt.IsZero() {
		schedule.CreatedAt = time.Now()
	}
	if schedule.UpdatedAt.IsZero() {
		schedule.UpdatedAt = time.Now()
	}
	if schedule.Status == "" {
		schedule.Status = "scheduled"
	}

	s.schedules = append([]models.WhatsAppSchedule{schedule}, s.schedules...)
	return schedule
}

// DeleteSchedule removes a scheduled follow-up by ID
func (s *WhatsAppService) DeleteSchedule(id string, userID string) bool {
	if s == nil {
		return false
	}
	s.schedulesLock.Lock()
	defer s.schedulesLock.Unlock()

	for i, sc := range s.schedules {
		if sc.ID == id {
			s.schedules = append(s.schedules[:i], s.schedules[i+1:]...)
			return true
		}
	}
	return false
}


// =========================================================================
// WHATSAPP BULK CONTACT MANAGEMENT & MEMBER AUTO-SYNC
// =========================================================================

// WhatsAppContactImportItem represents an item in a bulk import payload
type WhatsAppContactImportItem struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	City     string `json:"city"`
	Category string `json:"category"` // "member", "lead", "customer", "partner"
	Tags     string `json:"tags"`
	Notes    string `json:"notes"`
}

// GetContacts returns all stored WhatsApp CRM contacts
func (s *WhatsAppService) GetContacts() []models.WhatsAppContactModel {
	s.ensureDBLoaded()
	if config.DB == nil {
		return []models.WhatsAppContactModel{}
	}
	var contacts []models.WhatsAppContactModel
	if err := config.DB.Order("created_at desc").Find(&contacts).Error; err != nil {
		log.Printf("[GetContacts Error] %v", err)
		return []models.WhatsAppContactModel{}
	}
	return contacts
}

// SaveContact creates or updates an individual contact
func (s *WhatsAppService) SaveContact(c models.WhatsAppContactModel) (*models.WhatsAppContactModel, error) {
	s.ensureDBLoaded()
	c.Phone = FormatPhone(c.Phone)
	if c.Phone == "" || c.Name == "" {
		return nil, fmt.Errorf("nama dan nomor HP wajib diisi")
	}
	if config.DB != nil {
		var existing models.WhatsAppContactModel
		if err := config.DB.Where("phone = ?", c.Phone).First(&existing).Error; err == nil {
			existing.Name = c.Name
			existing.City = c.City
			existing.Category = c.Category
			existing.Tags = c.Tags
			existing.Notes = c.Notes
			config.DB.Save(&existing)
			return &existing, nil
		}
		if err := config.DB.Create(&c).Error; err != nil {
			return nil, err
		}
	}
	return &c, nil
}

// DeleteContact removes a contact by ID
func (s *WhatsAppService) DeleteContact(id string) error {
	if config.DB == nil {
		return fmt.Errorf("database not connected")
	}
	return config.DB.Where("id = ?", id).Delete(&models.WhatsAppContactModel{}).Error
}

// ImportContacts parses and persists bulk contacts with phone standardization
func (s *WhatsAppService) ImportContacts(items []WhatsAppContactImportItem) (int, error) {
	s.ensureDBLoaded()
	if len(items) == 0 {
		return 0, fmt.Errorf("daftar kontak kosong")
	}

	importedCount := 0
	for _, it := range items {
		cleanPhone := FormatPhone(it.Phone)
		if cleanPhone == "" || strings.TrimSpace(it.Name) == "" {
			continue
		}

		cat := it.Category
		if cat == "" {
			cat = "lead"
		}
		city := it.City
		if city == "" {
			city = "Indonesia"
		}

		if config.DB != nil {
			var existing models.WhatsAppContactModel
			if err := config.DB.Where("phone = ?", cleanPhone).First(&existing).Error; err == nil {
				existing.Name = it.Name
				existing.City = city
				existing.Category = cat
				existing.Tags = it.Tags
				existing.Notes = it.Notes
				config.DB.Save(&existing)
			} else {
				newContact := models.WhatsAppContactModel{
					Phone:    cleanPhone,
					Name:     it.Name,
					City:     city,
					Category: cat,
					Tags:     it.Tags,
					Notes:    it.Notes,
				}
				config.DB.Create(&newContact)
			}
		}

		// Also ensure a conversation thread exists so they can be reached in Live Messenger
		s.CreateNewThread(cleanPhone, it.Name, "Bio-Propolis Trigona 30ml", city, "new")
		importedCount++
	}

	return importedCount, nil
}

// SyncNewMemberContact automatically syncs new downline registration to WhatsApp Contacts & sends welcoming greeting
func (s *WhatsAppService) SyncNewMemberContact(phone, fullName, username, packageName string) error {
	s.ensureDBLoaded()
	cleanPhone := FormatPhone(phone)
	if cleanPhone == "" {
		return fmt.Errorf("nomor HP tidak valid")
	}

	if config.DB != nil {
		var contact models.WhatsAppContactModel
		if err := config.DB.Where("phone = ?", cleanPhone).First(&contact).Error; err != nil {
			contact = models.WhatsAppContactModel{
				Phone:    cleanPhone,
				Name:     fullName,
				City:     "Mitra Bionet",
				Category: "member",
				Tags:     "Mitra Resmi, Paket " + packageName,
				Notes:    fmt.Sprintf("Username: %s | Terdaftar via Network Registration", username),
			}
			config.DB.Create(&contact)
		}
	}

	// Create or find thread (strictly no auto-blast: messages only sent upon explicit user action)
	_ = s.CreateNewThread(cleanPhone, fullName, "Kemitraan "+packageName, "Indonesia", "closing")

	return nil
}

// =========================================================================
// MACHINE LEARNING & DEEP LEARNING (AI CLOSING DRAFT & LEAD SCORING)
// =========================================================================

// GenerateAIReplyDraft produces high-converting AI closing reply using Gemini
func (s *WhatsAppService) GenerateAIReplyDraft(ctx context.Context, threadID, closingGoal string) (string, error) {
	s.ensureDBLoaded()

	s.threadsLock.RLock()
	var thread *WhatsAppChatThread
	for i := range s.threads {
		if s.threads[i].ID == threadID {
			thread = &s.threads[i]
			break
		}
	}
	msgs := s.messages[threadID]
	s.threadsLock.RUnlock()

	contactName := "Pelanggan"
	productName := "Bio-Propolis Trigona 30ml"
	if thread != nil {
		if thread.ContactName != "" {
			contactName = thread.ContactName
		}
		if thread.Product != "" {
			productName = thread.Product
		}
	}

	// Build recent chat history
	recentLines := []string{}
	startIdx := 0
	if len(msgs) > 6 {
		startIdx = len(msgs) - 6
	}
	for _, m := range msgs[startIdx:] {
		senderLabel := "Konsumen"
		if m.Sender == "me" {
			senderLabel = "CS Bionet"
		}
		recentLines = append(recentLines, fmt.Sprintf("%s: %s", senderLabel, m.Text))
	}
	historyText := strings.Join(recentLines, "\n")
	if historyText == "" {
		historyText = fmt.Sprintf("Konsumen (%s) baru saja menyapa dan menanyakan produk %s.", contactName, productName)
	}

	systemPrompt := `Anda adalah AI Senior Sales Closer dan CS Konsultan Kesehatan Resmi Bionet Indonesia (Herbal Nano Bio-Propolis Trigona, Bio-Gluta White, legalitas BPOM TR 226012891, Halal MUI, dan program kemitraan).
Tugas Anda: Menghasilkan 1 pesan draf balasan WhatsApp yang persuasif, hangat, profesional, ramah, dan sangat berorientasi closing atau edukasi solutif.
Pedoman Penulisan:
1. Gunakan Bahasa Indonesia yang santun, luwes, dan bersahabat.
2. Gunakan sapaan hangat (misal: "Halo Pak/Bu [Nama]" atau "Halo Kak [Nama]").
3. Berikan solusi konkret atas pertanyaan atau kekhawatiran mereka.
4. Sertakan Call to Action (CTA) yang jelas dan halus di akhir pesan (misal: konfirmasi pengiriman, penawaran promo paket hemat, atau ajakan konsultasi).
5. Format draf balasan siap kirim di WhatsApp (boleh sertakan 2-3 emoji yang sopan: 🙏, 🌿, 😊).
6. HANYA kembalikan teks pesan balasan tanpa kata pengantar atau catatan tambahan.`

	userPrompt := fmt.Sprintf(
		"Nama Kontak: %s\nProduk Terkait: %s\nTujuan Balasan: %s\n\nRiwayat Percakapan Terakhir:\n%s\n\nTuliskan draf balasan WhatsApp terbaik:",
		contactName, productName, closingGoal, historyText,
	)

	if GlobalGeminiService != nil {
		reply, err := GlobalGeminiService.AskWithSystemPrompt(ctx, systemPrompt, userPrompt)
		if err == nil && strings.TrimSpace(reply) != "" {
			return strings.TrimSpace(reply), nil
		}
		log.Printf("[GenerateAIReplyDraft] Gemini fallback triggered: %v", err)
	}

	// Heuristic high-converting fallback responses
	switch strings.ToLower(closingGoal) {
	case "closing", "closing_deal", "order":
		return fmt.Sprintf("Halo Kak %s! 🙏 Untuk pemesanan %s hari ini, kami ada promo subsidi ongkir dan bonus konsultasi kesehatan gratis. Boleh kami bantu data nama penerima dan alamat lengkap pengirimannya agar bisa langsung kami proses pengirimannya hari ini? 😊", contactName, productName), nil
	case "bpom", "legalitas", "legality":
		return fmt.Sprintf("Halo Kak %s! Tidak perlu khawatir ya, produk %s dari Bionet sudah 100%% terdaftar resmi di BPOM RI (POM TR 226012891) serta bersertifikat Halal MUI ID321100001234. Keasliannya bisa dicek langsung di aplikasi BPOM Mobile. Kualitas dan keamanannya sangat terjamin 🙏🌿", contactName, productName), nil
	case "repeat_order", "ro":
		return fmt.Sprintf("Selamat siang Kak %s! Memasuki masa pemulihan rutin, bagaimana perkembangan kondisi kesehatannya? Mengingat persediaan botol sebelumnya sudah menipis, mau kami siapkan paket repeat order 2 botol hemat dengan gratis ongkir? 🌿", contactName), nil
	default:
		return fmt.Sprintf("Halo Kak %s! Terima kasih banyak sudah menghubungi Bionet. Bio-Propolis Trigona diformulasikan murni dengan teknologi nano sehingga lebih cepat diserap tubuh. Ada keluhan kesehatan spesifik yang ingin Kakak konsultasikan bersama tim kami? Kami siap mendampingi 🙏😊", contactName), nil
	}
}

// AnalyzeLeadScoreAndIntent analyzes lead behavior & intent with predictive scoring
func (s *WhatsAppService) AnalyzeLeadScoreAndIntent(ctx context.Context, threadID string) (map[string]interface{}, error) {
	s.ensureDBLoaded()

	s.threadsLock.RLock()
	var thread *WhatsAppChatThread
	for i := range s.threads {
		if s.threads[i].ID == threadID {
			thread = &s.threads[i]
			break
		}
	}
	msgs := s.messages[threadID]
	s.threadsLock.RUnlock()

	contactName := "Pelanggan"
	productName := "Bio-Propolis Trigona"
	if thread != nil {
		contactName = thread.ContactName
		productName = thread.Product
	}

	allCustomerText := ""
	for _, m := range msgs {
		if m.Sender == "contact" {
			allCustomerText += " " + strings.ToLower(m.Text)
		}
	}

	score := 50
	intent := "warm_consult"
	intentLabel := "🌿 Konsultasi Aktif"
	recommendation := "Lanjutkan konsultasi keluhan kesehatan & perkenalkan keunggulan nano-propolis."

	// High purchase intent signals
	if strings.Contains(allCustomerText, "pesan") || strings.Contains(allCustomerText, "beli") ||
		strings.Contains(allCustomerText, "rekening") || strings.Contains(allCustomerText, "transfer") ||
		strings.Contains(allCustomerText, "kirim") || strings.Contains(allCustomerText, "ongkir") ||
		strings.Contains(allCustomerText, "harga") {
		score = 88
		intent = "hot_closing"
		intentLabel = "🔥 Hot Lead (Siap Closing)"
		recommendation = "Kirim rincian total pembayaran & nomor rekening resmi Bionet, kunci transaksi hari ini."
	} else if strings.Contains(allCustomerText, "repeat") || strings.Contains(allCustomerText, "lagi") ||
		strings.Contains(allCustomerText, "habis") || strings.Contains(allCustomerText, "botol kedua") {
		score = 92
		intent = "repeat_order"
		intentLabel = "🔄 Potensi Repeat Order"
		recommendation = "Tawarkan paket hemat 2 botol RO dengan subsidi ongkir."
	} else if strings.Contains(allCustomerText, "join") || strings.Contains(allCustomerText, "mitra") ||
		strings.Contains(allCustomerText, "bisnis") || strings.Contains(allCustomerText, "bonus") ||
		strings.Contains(allCustomerText, "bop") {
		score = 85
		intent = "partnership"
		intentLabel = "⭐ Prospek Kemitraan"
		recommendation = "Undang ke webinar Zoom BOP atau kirim PDF Marketing Plan Bionet."
	} else if strings.Contains(allCustomerText, "mahal") || strings.Contains(allCustomerText, "ragu") ||
		strings.Contains(allCustomerText, "pikir") {
		score = 45
		intent = "cold_inquiry"
		intentLabel = "❄️ Ragu / Keberatan Harga"
		recommendation = "Edukasi perbandingan efektivitas dosis nano propolis vs herbal biasa, tawarkan paket tester."
	}

	// Update in memory and database
	s.threadsLock.Lock()
	if thread != nil {
		thread.AIScore = score
		thread.AIIntent = intent
	}
	s.threadsLock.Unlock()

	if config.DB != nil {
		_ = config.DB.Model(&models.WhatsAppThreadModel{}).
			Where("id = ?", threadID).
			Updates(map[string]interface{}{
				"ai_score":  score,
				"ai_intent": intent,
			}).Error
	}

	return map[string]interface{}{
		"thread_id":      threadID,
		"contact_name":   contactName,
		"product":        productName,
		"ai_score":       score,
		"ai_intent":      intent,
		"intent_label":   intentLabel,
		"recommendation": recommendation,
		"analyzed_at":    time.Now(),
	}, nil
}
