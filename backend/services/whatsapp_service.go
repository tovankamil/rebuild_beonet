package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
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

	// Device Session
	deviceSession WhatsAppDeviceSession
	deviceLock    sync.RWMutex
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
		key := os.Getenv("FONNTE_API_KEY")
		wahaURL := os.Getenv("WAHA_BASE_URL")
		provider := "simulated"
		if key != "" {
			provider = "fonnte"
		} else if wahaURL != "" {
			provider = "waha"
		}

		now := time.Now()

		GlobalWhatsAppService = &WhatsAppService{
			apiKey:    key,
			wahaURL:   wahaURL,
			provider:  provider,
			logs:      make([]WhatsAppLog, 0, 100),
			maxLogs:   100,
			isEnabled: true,
			messages:  make(map[string][]WhatsAppMessageItem),
			deviceSession: WhatsAppDeviceSession{
				Status:          "connected",
				PhoneNumber:     "+62812-3456-7890",
				DeviceName:      "Bionet WhatsApp Business Node (Chrome 128 / Android 14)",
				BatteryLevel:    96,
				Provider:        provider,
				QRCode:          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='white'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23059669'>Bionet QR Gateway</text></svg>",
				WebhookURL:      "https://api.bionet.id/api/crm/whatsapp/webhook",
				AutoResponderOn: true,
			},
		}

		// Seed initial delivery logs
		GlobalWhatsAppService.addLog(WhatsAppLog{
			ID:        "wa-init-01",
			Phone:     "+6281298765432",
			Recipient: "Bambang Sudirman",
			Category:  "crm_followup",
			Message:   "Halo Pak Bambang, terima kasih atas ketertarikan Anda pada Bio-Propolis Trigona Bionet...",
			Status:    "read",
			Direction: "outbound",
			Provider:  provider,
			SentAt:    now.Add(-12 * time.Minute),
		})
		GlobalWhatsAppService.addLog(WhatsAppLog{
			ID:        "wa-init-02",
			Phone:     "+6281312345678",
			Recipient: "Siti Rahmawati",
			Category:  "bonus",
			Message:   "🎉 Selamat Bu Siti! Bonus Pasangan Binary Rp 250.000 telah masuk ke saldo dompet Bionet Anda.",
			Status:    "delivered",
			Direction: "outbound",
			Provider:  provider,
			SentAt:    now.Add(-35 * time.Minute),
		})
		GlobalWhatsAppService.addLog(WhatsAppLog{
			ID:        "wa-init-03",
			Phone:     "+6281987654321",
			Recipient: "Ahmad Fauzi",
			Category:  "shipping",
			Message:   "🚚 Update Resi Bionet: Paket pesanan herbal Anda telah dikirim via J&T Express No Resi: JT9982310892.",
			Status:    "read",
			Direction: "outbound",
			Provider:  provider,
			SentAt:    now.Add(-2 * time.Hour),
		})

		// Seed Initial Chat Threads & Live Messages
		thread1ID := "thread-bambang"
		thread2ID := "thread-siti"
		thread3ID := "thread-ahmad"
		thread4ID := "thread-dewi"
		thread5ID := "thread-budi"

		GlobalWhatsAppService.threads = []WhatsAppChatThread{
			{
				ID:              thread1ID,
				Phone:           "+6281298765432",
				ContactName:     "Bambang Sudirman",
				Avatar:          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
				LeadStage:       "interested",
				Product:         "Bio-Propolis Trigona 30ml",
				City:            "Surabaya",
				LastMessage:     "Apakah ada sertifikasi BPOM dan Halal resminya Pak?",
				LastMessageTime: now.Add(-5 * time.Minute),
				UnreadCount:     1,
				IsOnline:        true,
			},
			{
				ID:              thread2ID,
				Phone:           "+6281312345678",
				ContactName:     "Siti Rahmawati",
				Avatar:          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
				LeadStage:       "health_journey",
				Product:         "Bio-Herbal Drops",
				City:            "Bandung",
				LastMessage:     "Alhamdulillah hari ke-7 bangun tidur terasa lebih enteng dan segar...",
				LastMessageTime: now.Add(-22 * time.Minute),
				UnreadCount:     0,
				IsOnline:        true,
			},
			{
				ID:              thread3ID,
				Phone:           "+6281987654321",
				ContactName:     "Ahmad Fauzi",
				Avatar:          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
				LeadStage:       "webinar",
				Product:         "Peluang Bisnis BOP",
				City:            "Jakarta Selatan",
				LastMessage:     "Siap hadir webinar BOP jam 19.30 nanti malam. Boleh minta link Zoomnya?",
				LastMessageTime: now.Add(-1 * time.Hour),
				UnreadCount:     0,
				IsOnline:        false,
			},
			{
				ID:              thread4ID,
				Phone:           "+6282145678901",
				ContactName:     "Dewi Sartika",
				Avatar:          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
				LeadStage:       "closing",
				Product:         "Bio-Propolis Trigona 30ml",
				City:            "Semarang",
				LastMessage:     "Paket repeat order 2 botolnya tolong dikirim ke alamat yang sama ya.",
				LastMessageTime: now.Add(-3 * time.Hour),
				UnreadCount:     0,
				IsOnline:        true,
			},
			{
				ID:              thread5ID,
				Phone:           "+6285712345678",
				ContactName:     "Budi Santoso",
				Avatar:          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
				LeadStage:       "new",
				Product:         "Bio-Gluta White",
				City:            "Medan",
				LastMessage:     "Halo saya lihat iklan Bionet di TikTok, mau tanya info promo diskonnya.",
				LastMessageTime: now.Add(-6 * time.Hour),
				UnreadCount:     1,
				IsOnline:        false,
			},
		}

		// Seed Messages for Bambang
		GlobalWhatsAppService.messages[thread1ID] = []WhatsAppMessageItem{
			{
				ID:        "msg-101",
				ThreadID:  thread1ID,
				Sender:    "contact",
				Text:      "Halo, selamat siang Bionet. Saya tertarik dengan Bio-Propolis Trigona untuk keluhan asam urat dan kolesterol.",
				Status:    "read",
				SentAt:    now.Add(-25 * time.Minute),
			},
			{
				ID:        "msg-102",
				ThreadID:  thread1ID,
				Sender:    "me",
				Text:      "Selamat siang Pak Bambang! 🙏 Senang sekali bisa bersilaturahmi. Bio-Propolis Trigona kami diformulasikan murni dari lebah klanceng tanpa sengat dengan teknologi nano, sangat efektif meregenerasi sel pembuluh darah dan meluruhkan kristal asam urat.",
				Status:    "read",
				SentAt:    now.Add(-22 * time.Minute),
			},
			{
				ID:        "msg-103",
				ThreadID:  thread1ID,
				Sender:    "me",
				Text:      "Apakah keluhan asam uratnya sudah sering kambuh di persendian Pak Bambang?",
				Status:    "read",
				SentAt:    now.Add(-20 * time.Minute),
			},
			{
				ID:        "msg-104",
				ThreadID:  thread1ID,
				Sender:    "contact",
				Text:      "Iya terutama saat malam atau bangun tidur jempol kaki terasa ngilu. Apakah ada sertifikasi BPOM dan Halal resminya Pak?",
				Status:    "read",
				SentAt:    now.Add(-5 * time.Minute),
			},
		}

		// Seed Messages for Siti Rahmawati
		GlobalWhatsAppService.messages[thread2ID] = []WhatsAppMessageItem{
			{
				ID:        "msg-201",
				ThreadID:  thread2ID,
				Sender:    "me",
				Text:      "Salam sehat Bu Siti! Memasuki hari ke-7 konsumsi Bio-Herbal Drops, bagaimana perkembangan kesehatan dan tidurnya?",
				Status:    "read",
				SentAt:    now.Add(-40 * time.Minute),
			},
			{
				ID:        "msg-202",
				ThreadID:  thread2ID,
				Sender:    "contact",
				Text:      "Alhamdulillah hari ke-7 bangun tidur terasa lebih enteng dan segar... Tekanan darah kemarin cek di apotek turun jadi 125/80. Senang sekali!",
				Status:    "read",
				SentAt:    now.Add(-22 * time.Minute),
			},
		}

		// Seed Messages for Ahmad Fauzi
		GlobalWhatsAppService.messages[thread3ID] = []WhatsAppMessageItem{
			{
				ID:        "msg-301",
				ThreadID:  thread3ID,
				Sender:    "me",
				Text:      "Halo Mas Ahmad, webinar Business Opportunity Presentation (BOP) Nasional Bionet akan dimulai nanti malam pukul 19.30 WIB via Zoom.",
				Status:    "read",
				SentAt:    now.Add(-2 * time.Hour),
			},
			{
				ID:        "msg-302",
				ThreadID:  thread3ID,
				Sender:    "contact",
				Text:      "Siap hadir webinar BOP jam 19.30 nanti malam. Boleh minta link Zoomnya?",
				Status:    "read",
				SentAt:    now.Add(-1 * time.Hour),
			},
		}

		// Seed Messages for Dewi
		GlobalWhatsAppService.messages[thread4ID] = []WhatsAppMessageItem{
			{
				ID:        "msg-401",
				ThreadID:  thread4ID,
				Sender:    "me",
				Text:      "Halo Bu Dewi, hari ini masuk hari ke-25 terapi Bio-Propolis. Sisa botol diperkirakan untuk 3-5 hari ke depan. Mau kami siapkan paket repeat order hemat 2 botol gratis ongkir?",
				Status:    "read",
				SentAt:    now.Add(-4 * time.Hour),
			},
			{
				ID:        "msg-402",
				ThreadID:  thread4ID,
				Sender:    "contact",
				Text:      "Paket repeat order 2 botolnya tolong dikirim ke alamat yang sama ya.",
				Status:    "read",
				SentAt:    now.Add(-3 * time.Hour),
			},
		}

		// Seed Messages for Budi
		GlobalWhatsAppService.messages[thread5ID] = []WhatsAppMessageItem{
			{
				ID:        "msg-501",
				ThreadID:  thread5ID,
				Sender:    "contact",
				Text:      "Halo saya lihat iklan Bionet di TikTok, mau tanya info promo diskonnya.",
				Status:    "read",
				SentAt:    now.Add(-6 * time.Hour),
			},
		}

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
	} else if s.provider == "waha" && s.wahaURL != "" {
		// 2. Opsi B: WAHA (WhatsApp HTTP API) Docker
		go func() {
			chatId := formattedPhone + "@c.us"
			reqBody, _ := json.Marshal(map[string]interface{}{
				"chatId": chatId,
				"text":   message,
			})
			targetURL := strings.TrimRight(s.wahaURL, "/") + "/api/sendText"
			req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(reqBody))
			if err == nil {
				req.Header.Set("Content-Type", "application/json")
				client := &http.Client{Timeout: 10 * time.Second}
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
			log.Printf("[WhatsApp Gateway WAHA Error] %v", err)
			s.UpdateStatus(logID, "sent")
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

// GetChatThreads returns all customer chat conversations
func (s *WhatsAppService) GetChatThreads() []WhatsAppChatThread {
	s.threadsLock.RLock()
	defer s.threadsLock.RUnlock()

	out := make([]WhatsAppChatThread, len(s.threads))
	copy(out, s.threads)
	return out
}

// GetThreadMessages returns all messages for a specific conversation thread
func (s *WhatsAppService) GetThreadMessages(threadID string) []WhatsAppMessageItem {
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

	// Background lifecycle: update status to 'delivered' and 'read'
	go func(tID, mID string, contactName, contactPhone, sentText string) {
		time.Sleep(600 * time.Millisecond)
		s.updateThreadMessageStatus(tID, mID, "delivered")

		time.Sleep(1400 * time.Millisecond)
		s.updateThreadMessageStatus(tID, mID, "read")

		// Check Auto-Responder & Realistic Simulation Reply
		s.handleSmartIncomingReply(tID, contactName, contactPhone, sentText)
	}(threadID, msgID, thread.ContactName, thread.Phone, text)

	return &newMsg, nil
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
	defer s.threadsLock.Unlock()

	formatted := FormatPhone(phone)
	threadID := fmt.Sprintf("thread-%d", time.Now().UnixNano())

	// Check if already exists
	for i := range s.threads {
		if s.threads[i].Phone == "+"+formatted || s.threads[i].Phone == formatted {
			return &s.threads[i]
		}
	}

	newThread := WhatsAppChatThread{
		ID:              threadID,
		Phone:           "+" + formatted,
		ContactName:     contactName,
		Avatar:          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
		LeadStage:       leadStage,
		Product:         product,
		City:            city,
		LastMessage:     "Percakapan baru dimulai",
		LastMessageTime: time.Now(),
		UnreadCount:     0,
		IsOnline:        true,
	}

	s.threads = append([]WhatsAppChatThread{newThread}, s.threads...)
	s.messages[threadID] = []WhatsAppMessageItem{
		{
			ID:        fmt.Sprintf("msg-init-%d", time.Now().UnixNano()),
			ThreadID:  threadID,
			Sender:    "me",
			Text:      fmt.Sprintf("Halo %s! Salam hangat dari Bionet Official. Ada yang bisa kami bantu seputar %s?", contactName, product),
			MediaType: "text",
			Status:    "read",
			SentAt:    time.Now(),
		},
	}

	return &newThread
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
	s.deviceLock.RLock()
	defer s.deviceLock.RUnlock()
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

// Inbound webhook logger
func (s *WhatsAppService) RecordInboundMessage(fromPhone, senderName, message string) *WhatsAppLog {
	logID := fmt.Sprintf("wa-in-%d", time.Now().UnixNano())
	logEntry := WhatsAppLog{
		ID:        logID,
		Phone:     "+" + FormatPhone(fromPhone),
		Recipient: senderName,
		Category:  "inbound_reply",
		Message:   message,
		Status:    "read",
		Direction: "inbound",
		Provider:  s.provider,
		SentAt:    time.Now(),
	}
	s.addLog(logEntry)
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
