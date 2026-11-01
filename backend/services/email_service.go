package services

import (
	"crypto/tls"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"net/smtp"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/emersion/go-imap"
	"github.com/emersion/go-imap/client"
	"github.com/emersion/go-message/mail"
)

type EmailService struct{}

var GlobalEmailService = &EmailService{}

// GetActiveConfig mengambil konfigurasi email aktif untuk sistem / user
func (s *EmailService) GetActiveConfig(userID string) (*models.EmailConfig, error) {
	var cfg models.EmailConfig
	// Prioritaskan config milik user atau system fallback
	err := config.DB.Where("(user_id = ? OR user_id = 'system') AND is_active = ?", userID, true).
		Order("user_id DESC, updated_at DESC").First(&cfg).Error
	if err != nil {
		return nil, err
	}
	return &cfg, nil
}

// SaveConfig menyimpan atau memperbarui pengaturan email akun
func (s *EmailService) SaveConfig(cfg *models.EmailConfig) error {
	var existing models.EmailConfig
	if err := config.DB.Where("user_id = ?", cfg.UserID).First(&existing).Error; err == nil {
		cfg.ID = existing.ID
		return config.DB.Save(cfg).Error
	}
	return config.DB.Create(cfg).Error
}

// SendEmail mengirim email lewat SMTP (Mendukung Gmail Port 587/465 & Custom Domain)
func (s *EmailService) SendEmail(userID string, to, subject, htmlBody, textBody, inReplyTo string, attachments []models.EmailAttachment) error {
	cfg, err := s.GetActiveConfig(userID)
	if err != nil {
		return errors.New("pengaturan email belum dikonfigurasi. Silakan atur akun Gmail atau Custom Domain Anda terlebih dahulu")
	}

	fromHeader := fmt.Sprintf("%s <%s>", cfg.SenderName, cfg.EmailAddress)
	if cfg.SenderName == "" {
		fromHeader = cfg.EmailAddress
	}

	var msgBuilder strings.Builder
	msgBuilder.WriteString(fmt.Sprintf("From: %s\r\n", fromHeader))
	msgBuilder.WriteString(fmt.Sprintf("To: %s\r\n", to))
	msgBuilder.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msgBuilder.WriteString(fmt.Sprintf("Date: %s\r\n", time.Now().Format(time.RFC1123Z)))
	msgBuilder.WriteString("MIME-Version: 1.0\r\n")

	if inReplyTo != "" {
		msgBuilder.WriteString(fmt.Sprintf("In-Reply-To: %s\r\n", inReplyTo))
		msgBuilder.WriteString(fmt.Sprintf("References: %s\r\n", inReplyTo))
	}

	if len(attachments) == 0 {
		boundary := fmt.Sprintf("bionet_boundary_%d", time.Now().UnixNano())
		msgBuilder.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=\"%s\"\r\n\r\n", boundary))

		// Plain text part
		if textBody != "" {
			msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", boundary))
			msgBuilder.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
			msgBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
			msgBuilder.WriteString(textBody)
			msgBuilder.WriteString("\r\n\r\n")
		}

		// HTML part
		if htmlBody != "" {
			msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", boundary))
			msgBuilder.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
			msgBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
			msgBuilder.WriteString(htmlBody)
			msgBuilder.WriteString("\r\n\r\n")
		}
		msgBuilder.WriteString(fmt.Sprintf("--%s--\r\n", boundary))
	} else {
		mixedBoundary := fmt.Sprintf("bionet_mixed_%d", time.Now().UnixNano())
		altBoundary := fmt.Sprintf("bionet_alt_%d", time.Now().UnixNano())
		msgBuilder.WriteString(fmt.Sprintf("Content-Type: multipart/mixed; boundary=\"%s\"\r\n\r\n", mixedBoundary))

		// Nested multipart/alternative for body
		msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", mixedBoundary))
		msgBuilder.WriteString(fmt.Sprintf("Content-Type: multipart/alternative; boundary=\"%s\"\r\n\r\n", altBoundary))

		// Plain text part
		if textBody != "" {
			msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
			msgBuilder.WriteString("Content-Type: text/plain; charset=\"UTF-8\"\r\n")
			msgBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
			msgBuilder.WriteString(textBody)
			msgBuilder.WriteString("\r\n\r\n")
		}

		// HTML part
		if htmlBody != "" {
			msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", altBoundary))
			msgBuilder.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
			msgBuilder.WriteString("Content-Transfer-Encoding: 7bit\r\n\r\n")
			msgBuilder.WriteString(htmlBody)
			msgBuilder.WriteString("\r\n\r\n")
		}
		msgBuilder.WriteString(fmt.Sprintf("--%s--\r\n\r\n", altBoundary))

		// Attachments
		for _, att := range attachments {
			contentType := att.ContentType
			if contentType == "" {
				contentType = "application/octet-stream"
			}
			filename := att.Filename
			if filename == "" {
				filename = "attachment"
			}

			// Clean base64 data
			data := att.Data
			if idx := strings.Index(data, ","); idx != -1 {
				data = data[idx+1:]
			}
			data = strings.ReplaceAll(data, " ", "")
			data = strings.ReplaceAll(data, "\r", "")
			data = strings.ReplaceAll(data, "\n", "")

			// Wrap base64 at 76 chars
			var wrapped strings.Builder
			for i := 0; i < len(data); i += 76 {
				end := i + 76
				if end > len(data) {
					end = len(data)
				}
				wrapped.WriteString(data[i:end])
				wrapped.WriteString("\r\n")
			}

			msgBuilder.WriteString(fmt.Sprintf("--%s\r\n", mixedBoundary))
			msgBuilder.WriteString(fmt.Sprintf("Content-Type: %s; name=\"%s\"\r\n", contentType, filename))
			msgBuilder.WriteString(fmt.Sprintf("Content-Disposition: attachment; filename=\"%s\"\r\n", filename))
			msgBuilder.WriteString("Content-Transfer-Encoding: base64\r\n\r\n")
			msgBuilder.WriteString(wrapped.String())
			msgBuilder.WriteString("\r\n")
		}
		msgBuilder.WriteString(fmt.Sprintf("--%s--\r\n", mixedBoundary))
	}

	rawMsg := []byte(msgBuilder.String())
	addr := fmt.Sprintf("%s:%d", cfg.SMTPHost, cfg.SMTPPort)

	// Direct SSL (umumnya port 465)
	if cfg.SMTPPort == 465 || strings.ToLower(cfg.SMTPEncryption) == "ssl" {
		tlsConfig := &tls.Config{
			ServerName:         cfg.SMTPHost,
			InsecureSkipVerify: false,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("koneksi TLS ke SMTP gagal (%s): %w", addr, err)
		}
		defer conn.Close()

		c, err := smtp.NewClient(conn, cfg.SMTPHost)
		if err != nil {
			return fmt.Errorf("inisialisasi SMTP client gagal: %w", err)
		}
		defer c.Close()

		auth := smtp.PlainAuth("", cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPHost)
		if err = c.Auth(auth); err != nil {
			return fmt.Errorf("autentikasi SMTP SSL gagal: %w", err)
		}

		if err = c.Mail(cfg.EmailAddress); err != nil {
			return err
		}
		if err = c.Rcpt(to); err != nil {
			return err
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(rawMsg)
		if err != nil {
			return err
		}
		return w.Close()
	}

	// STARTTLS / Plain (umumnya port 587 atau 25)
	auth := smtp.PlainAuth("", cfg.SMTPUsername, cfg.SMTPPassword, cfg.SMTPHost)
	toAddresses := []string{to}

	// Coba dial dengan STARTTLS jika port 587
	host, _, _ := net.SplitHostPort(addr)
	clientConn, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("gagal dial ke SMTP host %s: %w", addr, err)
	}
	defer clientConn.Close()

	if ok, _ := clientConn.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{
			ServerName:         host,
			InsecureSkipVerify: false,
		}
		if err := clientConn.StartTLS(tlsConfig); err != nil {
			return fmt.Errorf("STARTTLS negosiasi gagal: %w", err)
		}
	}

	if err := clientConn.Auth(auth); err != nil {
		return fmt.Errorf("autentikasi SMTP STARTTLS gagal: %w", err)
	}

	if err := clientConn.Mail(cfg.EmailAddress); err != nil {
		return err
	}
	for _, rcpt := range toAddresses {
		if err := clientConn.Rcpt(rcpt); err != nil {
			return err
		}
	}
	w, err := clientConn.Data()
	if err != nil {
		return err
	}
	if _, err := w.Write(rawMsg); err != nil {
		return err
	}
	return w.Close()
}

// FetchInbox membaca kotak masuk lewat IMAP (Mendukung Gmail Port 993 & Custom Domain)
func (s *EmailService) FetchInbox(userID string, limit int) ([]models.EmailSummary, error) {
	cfg, err := s.GetActiveConfig(userID)
	if err != nil {
		// Jika belum ada konfigurasi email, kirimkan daftar pesan sambutan / petunjuk default yang ramah
		return []models.EmailSummary{
			{
				SeqNum:    1,
				UID:       101,
				MessageID: "<welcome-guide@bionet.id>",
				From:      "Bionet System <support@bionet.id>",
				To:        "mitra@bionet.id",
				Subject:   "Selamat Datang di Webmail Terintegrasi Bionet",
				Date:      time.Now(),
				Snippet:   "Fitur email siap digunakan. Anda dapat menghubungkan akun Gmail (App Password) atau domain bisnis sendiri melalui menu Pengaturan Akun Email.",
				IsSeen:    false,
			},
		}, nil
	}

	addr := fmt.Sprintf("%s:%d", cfg.IMAPHost, cfg.IMAPPort)
	tlsConfig := &tls.Config{
		ServerName:         cfg.IMAPHost,
		InsecureSkipVerify: false,
	}

	var c *client.Client
	if cfg.IMAPPort == 993 || strings.ToLower(cfg.IMAPEncryption) == "ssl" {
		c, err = client.DialTLS(addr, tlsConfig)
	} else {
		c, err = client.Dial(addr)
	}

	if err != nil {
		return nil, fmt.Errorf("gagal terhubung ke IMAP server (%s): %w", addr, err)
	}
	defer c.Logout()

	if err := c.Login(cfg.IMAPUsername, cfg.IMAPPassword); err != nil {
		return nil, fmt.Errorf("login IMAP gagal (periksa username/app password): %w", err)
	}

	mbox, err := c.Select("INBOX", false)
	if err != nil {
		return nil, fmt.Errorf("gagal membuka folder INBOX: %w", err)
	}

	if mbox.Messages == 0 {
		return []models.EmailSummary{}, nil
	}

	fromSeq := uint32(1)
	toSeq := mbox.Messages
	if limit <= 0 {
		limit = 20
	}
	if mbox.Messages > uint32(limit) {
		fromSeq = mbox.Messages - uint32(limit) + 1
	}

	seqSet := new(imap.SeqSet)
	seqSet.AddRange(fromSeq, toSeq)

	items := []imap.FetchItem{imap.FetchEnvelope, imap.FetchFlags, imap.FetchUid}
	messages := make(chan *imap.Message, limit)
	done := make(chan error, 1)

	go func() {
		done <- c.Fetch(seqSet, items, messages)
	}()

	var list []models.EmailSummary
	for msg := range messages {
		if msg.Envelope == nil {
			continue
		}

		sender := ""
		if len(msg.Envelope.From) > 0 {
			sender = fmt.Sprintf("%s <%s@%s>", msg.Envelope.From[0].PersonalName, msg.Envelope.From[0].MailboxName, msg.Envelope.From[0].HostName)
			if msg.Envelope.From[0].PersonalName == "" {
				sender = fmt.Sprintf("%s@%s", msg.Envelope.From[0].MailboxName, msg.Envelope.From[0].HostName)
			}
		}

		isSeen := false
		for _, f := range msg.Flags {
			if f == imap.SeenFlag {
				isSeen = true
				break
			}
		}

		summary := models.EmailSummary{
			SeqNum:    msg.SeqNum,
			UID:       msg.Uid,
			MessageID: msg.Envelope.MessageId,
			From:      sender,
			Subject:   msg.Envelope.Subject,
			Date:      msg.Envelope.Date,
			Snippet:   msg.Envelope.Subject,
			IsSeen:    isSeen,
		}
		list = append(list, summary)
	}

	if err := <-done; err != nil {
		return nil, err
	}

	// Urutkan email terbaru di posisi teratas
	for i, j := 0, len(list)-1; i < j; i, j = i+1, j-1 {
		list[i], list[j] = list[j], list[i]
	}

	return list, nil
}

// GetEmailDetail membaca konten detail email termasuk isi HTML/Plain Text
func (s *EmailService) GetEmailDetail(userID string, seqNum uint32) (*models.EmailDetail, error) {
	cfg, err := s.GetActiveConfig(userID)
	if err != nil {
		// Mock email fallback jika belum connect IMAP
		return &models.EmailDetail{
			SeqNum:    seqNum,
			UID:       seqNum,
			MessageID: "<welcome-guide@bionet.id>",
			From:      "Bionet Official <support@bionet.id>",
			To:        "mitra@bionet.id",
			Subject:   "Selamat Datang di Webmail Terintegrasi Bionet",
			Date:      time.Now(),
			BodyText:  "Fitur email siap digunakan.\n\nAnda dapat membaca dan membalas email masuk menggunakan akun Gmail (dengan App Password) atau akun email domain hosting Anda sendiri.\n\nSilakan klik tombol 'Konfigurasi Email' untuk menghubungkan akun.",
			BodyHTML: `
				<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; padding: 16px;">
					<h2 style="color: #0284c7; margin-bottom: 8px;">Selamat Datang di Webmail Bionet! 🚀</h2>
					<p>Fitur membaca dan membalas email telah aktif di platform Anda.</p>
					<div style="background: #f1f5f9; padding: 14px; border-radius: 8px; margin: 16px 0;">
						<strong>Panduan Koneksi:</strong>
						<ul style="margin: 8px 0 0 16px; padding: 0;">
							<li><b>Gmail:</b> Gunakan IMAP <code>imap.gmail.com:993 (SSL)</code>, SMTP <code>smtp.gmail.com:587 (TLS)</code>, dan <i>Google 16-digit App Password</i>.</li>
							<li><b>Custom Domain:</b> Gunakan hostname server mail Anda (contoh: <code>mail.domainanda.com</code>) dengan port standar 993 & 587.</li>
						</ul>
					</div>
					<p>Selamat berbisnis dan salam sukses bersama Bionet!</p>
				</div>
			`,
		}, nil
	}

	addr := fmt.Sprintf("%s:%d", cfg.IMAPHost, cfg.IMAPPort)
	tlsConfig := &tls.Config{
		ServerName:         cfg.IMAPHost,
		InsecureSkipVerify: false,
	}

	var c *client.Client
	if cfg.IMAPPort == 993 || strings.ToLower(cfg.IMAPEncryption) == "ssl" {
		c, err = client.DialTLS(addr, tlsConfig)
	} else {
		c, err = client.Dial(addr)
	}
	if err != nil {
		return nil, fmt.Errorf("koneksi IMAP gagal: %w", err)
	}
	defer c.Logout()

	if err := c.Login(cfg.IMAPUsername, cfg.IMAPPassword); err != nil {
		return nil, fmt.Errorf("login IMAP gagal: %w", err)
	}

	if _, err := c.Select("INBOX", false); err != nil {
		return nil, err
	}

	seqSet := new(imap.SeqSet)
	seqSet.AddNum(seqNum)

	section := &imap.BodySectionName{}
	items := []imap.FetchItem{section.FetchItem(), imap.FetchEnvelope, imap.FetchUid}
	messages := make(chan *imap.Message, 1)
	done := make(chan error, 1)

	go func() {
		done <- c.Fetch(seqSet, items, messages)
	}()

	msg := <-messages
	if msg == nil {
		return nil, errors.New("pesan email tidak ditemukan")
	}

	r := msg.GetBody(section)
	if r == nil {
		return nil, errors.New("gagal memuat badan pesan")
	}

	mr, err := mail.CreateReader(r)
	if err != nil {
		return nil, fmt.Errorf("gagal parsing format email: %w", err)
	}

	var bodyText, bodyHTML string
	for {
		p, err := mr.NextPart()
		if err == io.EOF {
			break
		} else if err != nil {
			break
		}

		switch h := p.Header.(type) {
		case *mail.InlineHeader:
			contentType, _, _ := h.ContentType()
			b, _ := io.ReadAll(p.Body)
			if strings.HasPrefix(contentType, "text/plain") {
				bodyText = string(b)
			} else if strings.HasPrefix(contentType, "text/html") {
				bodyHTML = string(b)
			}
		}
	}

	fromStr := ""
	if len(msg.Envelope.From) > 0 {
		fromStr = fmt.Sprintf("%s <%s@%s>", msg.Envelope.From[0].PersonalName, msg.Envelope.From[0].MailboxName, msg.Envelope.From[0].HostName)
	}

	toStr := ""
	if len(msg.Envelope.To) > 0 {
		toStr = fmt.Sprintf("%s@%s", msg.Envelope.To[0].MailboxName, msg.Envelope.To[0].HostName)
	}

	detail := &models.EmailDetail{
		SeqNum:    msg.SeqNum,
		UID:       msg.Uid,
		MessageID: msg.Envelope.MessageId,
		From:      fromStr,
		To:        toStr,
		Subject:   msg.Envelope.Subject,
		Date:      msg.Envelope.Date,
		BodyText:  bodyText,
		BodyHTML:  bodyHTML,
		InReplyTo: msg.Envelope.InReplyTo,
	}

	if err := <-done; err != nil {
		return detail, nil
	}

	return detail, nil
}

// SendWelcomeEmail mengirim email sambutan resmi pendaftaran akun baru
func (s *EmailService) SendWelcomeEmail(toEmail, username, fullName string) error {
	if toEmail == "" {
		return nil
	}

	subject := fmt.Sprintf("Selamat Bergabung di Bionet, %s! 🌟", fullName)

	htmlBody := fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>Selamat Datang di Bionet</title>
	</head>
	<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
		<div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
			<div style="background: linear-gradient(135deg, #0284c7 0%%, #0369a1 100%%); padding: 36px 32px; text-align: center; color: #ffffff;">
				<h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">BIONET OFFICIAL</h1>
				<p style="margin: 8px 0 0; font-size: 15px; opacity: 0.9;">Solusi Ekosistem Bisnis & Kemitraan Digital Terpercaya</p>
			</div>
			
			<div style="padding: 36px 32px;">
				<h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Halo Bapak/Ibu <b>%s</b>,</h2>
				<p style="font-size: 15px; line-height: 1.6; color: #475569;">
					Selamat! Akun kemitraan Bionet Anda telah berhasil didaftarkan dan aktif di sistem. Kami sangat antusias menyambut Anda di dalam keluarga besar kami.
				</p>
				
				<div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 18px; border-radius: 6px; margin: 24px 0;">
					<h3 style="margin: 0 0 10px; font-size: 15px; color: #0f172a;">Informasi Kredensial Akun Anda:</h3>
					<table style="width: 100%%; font-size: 14px; color: #334155;">
						<tr>
							<td style="padding: 4px 0; width: 120px; font-weight: 600;">Username:</td>
							<td style="padding: 4px 0; color: #0284c7; font-weight: 700;">@%s</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; font-weight: 600;">Nama Lengkap:</td>
							<td style="padding: 4px 0;">%s</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; font-weight: 600;">Email:</td>
							<td style="padding: 4px 0;">%s</td>
						</tr>
						<tr>
							<td style="padding: 4px 0; font-weight: 600;">Status:</td>
							<td style="padding: 4px 0; color: #16a34a; font-weight: 700;">Aktif & Terverifikasi</td>
						</tr>
					</table>
				</div>

				<div style="text-align: center; margin: 32px 0;">
					<a href="https://app.bionet.id" style="background: #0284c7; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 10px; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
						Masuk ke Dashboard Mitra &rarr;
					</a>
				</div>

				<p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-top: 24px;">
					<b>Tips Keamanan:</b> Jangan pernah membagikan password atau PIN keamanan Anda kepada siapa pun, termasuk staf Bionet.
				</p>
			</div>

			<div style="background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
				<p style="margin: 0;">&copy; %d Bionet Indonesia. Hak Cipta Dilindungi.</p>
				<p style="margin: 4px 0 0;">Email ini dikirim secara otomatis oleh platform resmi Bionet.</p>
			</div>
		</div>
	</body>
	</html>
	`, fullName, username, fullName, toEmail, time.Now().Year())

	textBody := fmt.Sprintf("Selamat Datang di Bionet, %s!\n\nUsername: @%s\nNama: %s\nEmail: %s\nStatus: Aktif\n\nSilakan login ke portal Bionet.", fullName, username, fullName, toEmail)

	// Kirim email asinkron lewat goroutine agar proses registrasi tetap instan
	go func() {
		err := s.SendEmail("system", toEmail, subject, htmlBody, textBody, "", nil)
		if err != nil {
			log.Printf("[EmailService] Info: Pengiriman welcome email ke %s: %v", toEmail, err)
		} else {
			log.Printf("[EmailService] Sukses mengirimkan welcome email ke %s", toEmail)
		}
	}()

	return nil
}

