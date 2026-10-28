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
)

type TelegramService struct {
	botToken    string
	adminChatID string
	httpClient  *http.Client
	stopChan    chan struct{}
	mu          sync.Mutex
	isRunning   bool
}

var GlobalTelegramService *TelegramService

type telegramUpdateResponse struct {
	Ok     bool             `json:"ok"`
	Result []telegramUpdate `json:"result"`
}

type telegramUpdate struct {
	UpdateID int              `json:"update_id"`
	Message  *telegramMessage `json:"message"`
}

type telegramMessage struct {
	MessageID int           `json:"message_id"`
	Chat      telegramChat  `json:"chat"`
	From      *telegramUser `json:"from"`
	Text      string        `json:"text"`
	Date      int64         `json:"date"`
}

type telegramChat struct {
	ID        int64  `json:"id"`
	Type      string `json:"type"`
	Title     string `json:"title"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
}

type telegramUser struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	Username  string `json:"username"`
}

// NewTelegramService initializes the Telegram bot client
func NewTelegramService() *TelegramService {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	adminChat := os.Getenv("TELEGRAM_ADMIN_CHAT_ID")

	svc := &TelegramService{
		botToken:    token,
		adminChatID: adminChat,
		httpClient: &http.Client{
			Timeout: 40 * time.Second,
		},
		stopChan: make(chan struct{}),
	}
	GlobalTelegramService = svc

	if token == "" {
		log.Println("[TelegramService] TELEGRAM_BOT_TOKEN is empty. Telegram bot listener is inactive.")
		return svc
	}

	log.Println("[TelegramService] Telegram service configured with active token.")
	return svc
}

// SendMessage sends a text message to a specific chat ID
func (s *TelegramService) SendMessage(chatID interface{}, text string) error {
	if s.botToken == "" {
		return fmt.Errorf("telegram bot token is not configured")
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.botToken)
	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "Markdown",
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	resp, err := s.httpClient.Post(apiURL, "application/json", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return fmt.Errorf("failed to send telegram request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		// If Markdown formatting failed, retry sending as plain text
		payloadNoMd := map[string]interface{}{
			"chat_id": chatID,
			"text":    text,
		}
		bodyBytesNoMd, _ := json.Marshal(payloadNoMd)
		respNoMd, errNoMd := s.httpClient.Post(apiURL, "application/json", bytes.NewBuffer(bodyBytesNoMd))
		if errNoMd == nil {
			defer respNoMd.Body.Close()
			if respNoMd.StatusCode < 400 {
				return nil
			}
		}
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram api error: status %d, body: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// NotifyAdmin sends a high-priority system alert to the admin chat ID
func (s *TelegramService) NotifyAdmin(text string) error {
	if s.adminChatID == "" {
		return fmt.Errorf("TELEGRAM_ADMIN_CHAT_ID is not configured")
	}
	return s.SendMessage(s.adminChatID, text)
}

// StartBotListener starts a non-blocking background polling worker
func (s *TelegramService) StartBotListener(ctx context.Context) {
	if s.botToken == "" {
		return
	}

	s.mu.Lock()
	if s.isRunning {
		s.mu.Unlock()
		return
	}
	s.isRunning = true
	s.mu.Unlock()

	go s.pollUpdates(ctx)
}

func (s *TelegramService) pollUpdates(ctx context.Context) {
	log.Println("[TelegramService] Starting Telegram long polling listener...")
	offset := 0

	for {
		select {
		case <-ctx.Done():
			log.Println("[TelegramService] Stopping polling listener due to context cancellation.")
			return
		case <-s.stopChan:
			log.Println("[TelegramService] Telegram polling stopped.")
			return
		default:
			url := fmt.Sprintf("https://api.telegram.org/bot%s/getUpdates?offset=%d&timeout=25", s.botToken, offset)
			resp, err := s.httpClient.Get(url)
			if err != nil {
				time.Sleep(5 * time.Second)
				continue
			}

			var updateResp telegramUpdateResponse
			if err := json.NewDecoder(resp.Body).Decode(&updateResp); err != nil {
				resp.Body.Close()
				time.Sleep(3 * time.Second)
				continue
			}
			resp.Body.Close()

			if !updateResp.Ok {
				time.Sleep(5 * time.Second)
				continue
			}

			for _, up := range updateResp.Result {
				if up.UpdateID >= offset {
					offset = up.UpdateID + 1
				}
				if up.Message != nil {
					go s.handleIncomingMessage(up.Message)
				}
			}
		}
	}
}

func (s *TelegramService) handleIncomingMessage(msg *telegramMessage) {
	text := strings.TrimSpace(msg.Text)
	chatID := msg.Chat.ID
	username := msg.From.Username
	if username == "" {
		username = msg.From.FirstName
	}

	if text == "" {
		return
	}

	log.Printf("[TelegramService] Incoming message from @%s (chat_id: %d): %s", username, chatID, text)

	switch {
	case strings.HasPrefix(text, "/start"):
		welcome := fmt.Sprintf("🌟 *Selamat Datang di Bionet Assistant Bot, @%s!*\n\n"+
			"Bot ini terintegrasi langsung dengan core sistem Bionet & didukung oleh Google Gemini AI.\n\n"+
			"📌 *Daftar Perintah Cepat:*\n"+
			"• `/status` - Ringkasan operasional sistem saat ini\n"+
			"• `/pending` atau `/pending_wd` - Cek antrean permohonan penarikan dana (WD)\n"+
			"• `/produk` - Cek katalog produk aktif & stok\n"+
			"• `/myid` - Menampilkan ID Chat Telegram Anda\n"+
			"• Atau *kirim pertanyaan bebas*, AI kami siap menjawab seputar Bionet!", username)
		_ = s.SendMessage(chatID, welcome)

	case strings.HasPrefix(text, "/myid"):
		_ = s.SendMessage(chatID, fmt.Sprintf("🔑 ID Chat Telegram Anda: `%d`\n\nSimpan ID ini di `backend/.env` pada `TELEGRAM_ADMIN_CHAT_ID` jika Anda adalah Administrator.", chatID))

	case strings.HasPrefix(text, "/status"), strings.HasPrefix(text, "/overview"):
		var userCount, pendingWDCount, orderCount int64
		config.DB.Model(&models.User{}).Count(&userCount)
		config.DB.Model(&models.Withdrawal{}).Where("status = ?", "pending").Count(&pendingWDCount)
		config.DB.Model(&models.Order{}).Where("status = ?", "processing").Count(&orderCount)

		summary := fmt.Sprintf("📊 *Ringkasan Sistem Bionet:*\n\n"+
			"👥 Total Pengguna: *%d akun*\n"+
			"⏳ Pending Payout (WD): *%d permohonan*\n"+
			"📦 Pesanan RO Diproses: *%d pesanan*\n"+
			"🕒 Waktu Server: `%s`",
			userCount, pendingWDCount, orderCount, time.Now().Format("02 Jan 2006 15:04:05"))
		_ = s.SendMessage(chatID, summary)

	case strings.HasPrefix(text, "/pending"), strings.HasPrefix(text, "/pending_wd"), strings.HasPrefix(text, "/wd"):
		var withdrawals []models.Withdrawal
		config.DB.Preload("Bank").Where("status = ?", "pending").Order("created_at desc").Limit(5).Find(&withdrawals)
		if len(withdrawals) == 0 {
			_ = s.SendMessage(chatID, "✅ *Tidak ada antrean withdrawal pending saat ini.*")
			return
		}

		var sb strings.Builder
		sb.WriteString("💳 *Daftar 5 Withdrawal Pending Terbaru:*\n\n")
		for i, wd := range withdrawals {
			bankInfo := "-"
			if wd.Bank != nil {
				bankInfo = fmt.Sprintf("%s (%s)", wd.Bank.BankName, wd.Bank.AccountNumber)
			}
			sb.WriteString(fmt.Sprintf("%d. *Rp %.0f* (Bank: %s)\nID: `%s`\n\n",
				i+1, wd.Amount, bankInfo, wd.ID))
		}
		_ = s.SendMessage(chatID, sb.String())

	case strings.HasPrefix(text, "/produk"), strings.HasPrefix(text, "/product"), strings.HasPrefix(text, "/products"):
		var products []models.Product
		config.DB.Where("is_active = ?", true).Limit(5).Find(&products)
		var sb strings.Builder
		sb.WriteString("🌿 *Katalog Produk Herbal Bionet:*\n\n")
		for _, p := range products {
			sb.WriteString(fmt.Sprintf("• *%s*\nHarga: Rp %.0f | Stok: %d\n\n", p.Name, p.Price, p.Stock))
		}
		_ = s.SendMessage(chatID, sb.String())

	default:
		// Natural Language AI Assistance via Gemini
		if GlobalGeminiService != nil {
			_ = s.SendMessage(chatID, "🤖 _Bionet AI sedang menganalisa pertanyaan Anda..._")

			// Gather quick live context from DB
			var userCount, pendingWDCount int64
			config.DB.Model(&models.User{}).Count(&userCount)
			config.DB.Model(&models.Withdrawal{}).Where("status = ?", "pending").Count(&pendingWDCount)
			liveContext := fmt.Sprintf("Total member terdaftar: %d, Antrean pencairan dana pending: %d", userCount, pendingWDCount)

			ctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
			defer cancel()

			aiReply, err := GlobalGeminiService.ProcessBionetAssistant(ctx, "Telegram User", username, text, liveContext)
			if err != nil {
				_ = s.SendMessage(chatID, "⚠️ Maaf, AI saat ini sedang sibuk. Silakan coba sesaat lagi.")
				log.Printf("[TelegramService] Gemini query error: %v", err)
			} else {
				if errSend := s.SendMessage(chatID, aiReply); errSend != nil {
					log.Printf("[TelegramService] Failed to send AI reply: %v", errSend)
				}
			}
		} else {
			_ = s.SendMessage(chatID, "💡 Perintah tidak dikenali. Ketik `/start` untuk melihat menu bantuan.")
		}
	}
}
