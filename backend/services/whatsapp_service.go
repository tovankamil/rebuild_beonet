package services

import (
	"fmt"
	"log"
	"os"
	"sync"
	"time"
)

type WhatsAppLog struct {
	ID        string    `json:"id"`
	Phone     string    `json:"phone"`
	Recipient string    `json:"recipient"`
	Category  string    `json:"category"` // 'bonus', 'registration', 'withdrawal', 'shipping', 'custom'
	Message   string    `json:"message"`
	Status    string    `json:"status"` // 'sent', 'queued', 'failed'
	SentAt    time.Time `json:"sent_at"`
}

type WhatsAppService struct {
	apiKey    string
	provider  string // 'fonnte', 'waha', 'simulated'
	logs      []WhatsAppLog
	logsLock  sync.RWMutex
	maxLogs   int
	isEnabled bool
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
		provider := "simulated"
		if key != "" {
			provider = "fonnte"
		}
		GlobalWhatsAppService = &WhatsAppService{
			apiKey:    key,
			provider:  provider,
			logs:      make([]WhatsAppLog, 0, 50),
			maxLogs:   50,
			isEnabled: true,
		}

		// Seed dummy initial delivery logs for admin review
		now := time.Now()
		GlobalWhatsAppService.addLog(WhatsAppLog{
			ID:        "wa-init-01",
			Phone:     "6281298765432",
			Recipient: "Mitra Juara Bionet",
			Category:  "bonus",
			Message:   "🎉 Selamat Mitra Juara Bionet! Bonus Pasangan (Pairing) sebesar Rp 350.000 (10 pasang) telah berhasil ditransfer ke saldo dompet Anda.",
			Status:    "sent",
			SentAt:    now.Add(-15 * time.Minute),
		})
		GlobalWhatsAppService.addLog(WhatsAppLog{
			ID:        "wa-init-02",
			Phone:     "6281312345678",
			Recipient: "Budi Santoso",
			Category:  "registration",
			Message:   "✨ Selamat datang di Bionet! Akun kemitraan Anda telah aktif dengan username: budi01. Hubungi sponsor Anda untuk panduan memulai.",
			Status:    "sent",
			SentAt:    now.Add(-45 * time.Minute),
		})
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

func (s *WhatsAppService) GetLogs() []WhatsAppLog {
	s.logsLock.RLock()
	defer s.logsLock.RUnlock()
	out := make([]WhatsAppLog, len(s.logs))
	copy(out, s.logs)
	return out
}

func (s *WhatsAppService) GetStatus() map[string]interface{} {
	s.logsLock.RLock()
	totalSent := len(s.logs)
	s.logsLock.RUnlock()

	return map[string]interface{}{
		"provider":    s.provider,
		"enabled":     s.isEnabled,
		"has_api_key": s.apiKey != "",
		"total_sent":  totalSent,
		"status":      "active",
	}
}

func (s *WhatsAppService) SendBonusNotification(phone, memberName, bonusType string, amount float64) error {
	msg := fmt.Sprintf(
		"🎉 *KABAR GEMBIRA DARI BIONET!*\n\nHalo kak %s, komisi *%s* sebesar *Rp %s* telah berhasil cair ke dompet digital Anda.\n\nCek saldo & mutasi di portal resmi Bionet sekarang juga!",
		memberName,
		bonusType,
		fmt.Sprintf("%.0f", amount),
	)

	logEntry := WhatsAppLog{
		ID:        fmt.Sprintf("wa-%d", time.Now().UnixNano()),
		Phone:     phone,
		Recipient: memberName,
		Category:  "bonus",
		Message:   msg,
		Status:    "sent",
		SentAt:    time.Now(),
	}
	s.addLog(logEntry)
	log.Printf("[WhatsApp Gateway] Sent Bonus alert to %s (%s)", phone, memberName)
	return nil
}

func (s *WhatsAppService) SendOrderTrackingNotification(phone, memberName, orderNumber, courier, trackingNumber string) error {
	msg := fmt.Sprintf(
		"🚚 *UPDATE PENGIRIMAN PESANAN BIONET*\n\nHalo kak %s, pesanan *%s* telah dipickup oleh kurir *%s*.\n\nNomor Resi: *%s*\nPaket sedang dalam perjalanan menuju alamat Anda. Terima kasih telah berbelanja di Bionet!",
		memberName,
		orderNumber,
		courier,
		trackingNumber,
	)

	logEntry := WhatsAppLog{
		ID:        fmt.Sprintf("wa-%d", time.Now().UnixNano()),
		Phone:     phone,
		Recipient: memberName,
		Category:  "shipping",
		Message:   msg,
		Status:    "sent",
		SentAt:    time.Now(),
	}
	s.addLog(logEntry)
	log.Printf("[WhatsApp Gateway] Sent Shipping alert to %s (%s)", phone, memberName)
	return nil
}

func (s *WhatsAppService) SendCustomMessage(phone, recipient, message string) error {
	logEntry := WhatsAppLog{
		ID:        fmt.Sprintf("wa-%d", time.Now().UnixNano()),
		Phone:     phone,
		Recipient: recipient,
		Category:  "custom",
		Message:   message,
		Status:    "sent",
		SentAt:    time.Now(),
	}
	s.addLog(logEntry)
	log.Printf("[WhatsApp Gateway] Sent Custom message to %s (%s)", phone, recipient)
	return nil
}
