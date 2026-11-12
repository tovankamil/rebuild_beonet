package services

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"bionet-backend/models"

	"github.com/google/uuid"
)

// FileCategory mendefinisikan kategori berkas yang diizinkan
type FileCategory string

const (
	CategoryImages    FileCategory = "image"
	CategoryDocuments FileCategory = "document"
	CategoryAudio     FileCategory = "audio"
	CategoryVideo     FileCategory = "video"
)

// FileScanResult menyimpan hasil audit keamanan file
type FileScanResult struct {
	IsValid      bool
	DetectedMIME string
	Reason       string
	CleanExt     string
	CleanName    string
	ThreatType   string
	Severity     string
}

// DangerousExtensions daftar ekstensi terlarang yang berpotensi menjadi web shell, script, atau executable
var dangerousExtensions = map[string]bool{
	".php": true, ".phtml": true, ".php3": true, ".php4": true, ".php5": true, ".phps": true, ".phar": true, ".inc": true,
	".asp": true, ".aspx": true, ".cer": true, ".asa": true, ".asax": true,
	".jsp": true, ".jspx": true, ".jsw": true, ".jsv": true, ".jspf": true,
	".exe": true, ".bat": true, ".cmd": true, ".sh": true, ".bash": true, ".zsh": true, ".ksh": true, ".csh": true,
	".dll": true, ".so": true, ".bin": true, ".elf": true, ".msi": true, ".scr": true, ".com": true, ".hta": true,
	".pl": true, ".py": true, ".pyc": true, ".rb": true, ".cgi": true, ".war": true, ".jar": true,
	".vbs": true, ".vbe": true, ".js": true, ".jse": true, ".ws": true, ".wsf": true, ".wsc": true, ".wsh": true,
	".ps1": true, ".ps1xml": true, ".ps2": true, ".psc1": true, ".psc2": true,
	".htaccess": true, ".htpasswd": true, ".ini": true, ".config": true, ".env": true, ".git": true,
}

// MaliciousRegexPattern pola web shell, command execution, and code injection
var maliciousRegexPatterns = []*regexp.Regexp{
	regexp.MustCompile(`(?i)<\?php`),
	regexp.MustCompile(`(?i)<\?=`),
	regexp.MustCompile(`(?i)<%`),
	regexp.MustCompile(`(?i)<script[\s>]`),
	regexp.MustCompile(`(?i)(eval|base64_decode|gzinflate|str_rot13|assert)\s*\(`),
	regexp.MustCompile(`(?i)(system|exec|passthru|shell_exec|proc_open|popen)\s*\(`),
	regexp.MustCompile(`(?i)(cmd\.exe|/bin/sh|/bin/bash|powershell)`),
	regexp.MustCompile(`(?i)(c99shell|r57shell|b374k|wso\s+shell|alfa\s+team|weevely)`),
	regexp.MustCompile(`(?i)(document\.cookie|javascript:|vbscript:|onload\s*=|onerror\s*=)`),
}

// FileSecurityScanner struct
type FileSecurityScanner struct {
	securityService *SecurityService
}

var globalFileScanner *FileSecurityScanner

// GetFileSecurityScanner mengembalikan singleton FileSecurityScanner
func GetFileSecurityScanner() *FileSecurityScanner {
	if globalFileScanner == nil {
		globalFileScanner = &FileSecurityScanner{
			securityService: GetSecurityService(),
		}
	}
	return globalFileScanner
}

// ScanUploadedFile memindai berkas multipart dari berbagai vektor serangan:
// 1. Double extension & dangerous extension blacklist
// 2. Path traversal & null byte poisoning
// 3. Magic byte signature verification vs MIME
// 4. Executable / ELF / PE / Java / Shell binary detection (Anti-Crack/Hack)
// 5. Deep content inspection untuk web shell & XSS polyglot
func (s *FileSecurityScanner) ScanUploadedFile(header *multipart.FileHeader, clientIP string, allowedCategories []FileCategory) (*FileScanResult, error) {
	filename := header.Filename
	lowerFilename := strings.ToLower(filename)

	// 1. Path Traversal & Null Byte Check
	if strings.Contains(filename, "..") || strings.Contains(filename, "/") || strings.Contains(filename, "\\") || strings.Contains(filename, "\x00") {
		s.logThreat(clientIP, "path_traversal", "critical", filename, "Percobaan Path Traversal atau Null Byte Poisoning pada nama file unggahan")
		return &FileScanResult{
			IsValid:    false,
			Reason:     "Nama file mengandung karakter berbahaya atau percobaan path traversal",
			ThreatType: "path_traversal",
			Severity:   "critical",
		}, nil
	}

	// 2. Double Extension & Dangerous Extension Detection
	parts := strings.Split(lowerFilename, ".")
	if len(parts) > 1 {
		// Periksa setiap segmen ekstensi (misal: payload.php.jpg)
		for i := 1; i < len(parts); i++ {
			subExt := "." + parts[i]
			if dangerousExtensions[subExt] {
				s.logThreat(clientIP, "malicious_upload", "critical", filename, fmt.Sprintf("Percobaan unggah file berbahaya / web shell dengan ekstensi: %s", subExt))
				return &FileScanResult{
					IsValid:    false,
					Reason:     fmt.Sprintf("Ekstensi berkas '%s' diblokir oleh sistem keamanan karena berpotensi mengeksekusi kode berbahaya", subExt),
					ThreatType: "malicious_upload",
					Severity:   "critical",
				}, nil
			}
		}
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if dangerousExtensions[ext] {
		s.logThreat(clientIP, "malicious_upload", "critical", filename, fmt.Sprintf("Percobaan unggah file berbahaya: %s", ext))
		return &FileScanResult{
			IsValid:    false,
			Reason:     fmt.Sprintf("Ekstensi '%s' tidak diizinkan demi keamanan server", ext),
			ThreatType: "malicious_upload",
			Severity:   "critical",
		}, nil
	}

	// 3. Kategori Ekstensi yang Diizinkan
	allowedExts := make(map[string]FileCategory)
	for _, cat := range allowedCategories {
		switch cat {
		case CategoryImages:
			allowedExts[".jpg"] = CategoryImages
			allowedExts[".jpeg"] = CategoryImages
			allowedExts[".png"] = CategoryImages
			allowedExts[".webp"] = CategoryImages
			allowedExts[".gif"] = CategoryImages
			allowedExts[".svg"] = CategoryImages
			allowedExts[".ico"] = CategoryImages
		case CategoryDocuments:
			allowedExts[".pdf"] = CategoryDocuments
			allowedExts[".doc"] = CategoryDocuments
			allowedExts[".docx"] = CategoryDocuments
			allowedExts[".xls"] = CategoryDocuments
			allowedExts[".xlsx"] = CategoryDocuments
			allowedExts[".txt"] = CategoryDocuments
			allowedExts[".csv"] = CategoryDocuments
			allowedExts[".vcf"] = CategoryDocuments
		case CategoryAudio:
			allowedExts[".mp3"] = CategoryAudio
			allowedExts[".ogg"] = CategoryAudio
			allowedExts[".wav"] = CategoryAudio
			allowedExts[".m4a"] = CategoryAudio
		case CategoryVideo:
			allowedExts[".mp4"] = CategoryVideo
			allowedExts[".webm"] = CategoryVideo
			allowedExts[".mov"] = CategoryVideo
		}
	}

	cat, ok := allowedExts[ext]
	if !ok {
		return &FileScanResult{
			IsValid: false,
			Reason:  fmt.Sprintf("Format berkas '%s' tidak diizinkan untuk kategori ini", ext),
		}, nil
	}

	// 4. Buka Berkas untuk Memeriksa Magic Bytes & Konten
	file, err := header.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	// Baca hingga 512KB untuk inspeksi deep content
	maxRead := int64(512 * 1024)
	if header.Size < maxRead {
		maxRead = header.Size
	}
	buffer := make([]byte, maxRead)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return nil, err
	}
	content := buffer[:n]

	// 5. Binary Executable Header Signatures (Anti-Hack / Anti-Crack)
	// Check MZ (Windows PE Executable / DLL)
	if len(content) >= 2 && content[0] == 0x4D && content[1] == 0x5A {
		s.logThreat(clientIP, "malicious_binary", "critical", filename, "Terdeteksi Windows Executable (MZ / PE) tersembunyi dalam berkas")
		return &FileScanResult{
			IsValid:    false,
			Reason:     "Berkas executable Windows (.exe / .dll) terdeteksi dan diblokir",
			ThreatType: "malicious_binary",
			Severity:   "critical",
		}, nil
	}
	// Check ELF (Linux Executable)
	if len(content) >= 4 && content[0] == 0x7F && content[1] == 'E' && content[2] == 'L' && content[3] == 'F' {
		s.logThreat(clientIP, "malicious_binary", "critical", filename, "Terdeteksi Linux ELF binary tersembunyi dalam berkas")
		return &FileScanResult{
			IsValid:    false,
			Reason:     "Berkas binary Linux ELF terdeteksi dan diblokir",
			ThreatType: "malicious_binary",
			Severity:   "critical",
		}, nil
	}
	// Check Java Bytecode
	if len(content) >= 4 && content[0] == 0xCA && content[1] == 0xFE && content[2] == 0xBA && content[3] == 0xBE {
		s.logThreat(clientIP, "malicious_binary", "high", filename, "Terdeteksi Java bytecode tersembunyi dalam berkas")
		return &FileScanResult{
			IsValid:    false,
			Reason:     "Berkas bytecode Java terdeteksi dan diblokir",
			ThreatType: "malicious_binary",
			Severity:   "high",
		}, nil
	}

	// 6. Magic Bytes Verification untuk Gambar & Dokumen
	detectedMIME := http.DetectContentType(content)
	if cat == CategoryImages {
		if ext == ".jpg" || ext == ".jpeg" {
			if len(content) < 3 || content[0] != 0xFF || content[1] != 0xD8 || content[2] != 0xFF {
				return &FileScanResult{
					IsValid: false,
					Reason:  "Header berkas tidak valid untuk format JPEG/JPG (Spoofed extension)",
				}, nil
			}
		} else if ext == ".png" {
			pngSig := []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
			if len(content) < 8 || !bytes.HasPrefix(content, pngSig) {
				return &FileScanResult{
					IsValid: false,
					Reason:  "Header berkas tidak valid untuk format PNG (Spoofed extension)",
				}, nil
			}
		} else if ext == ".gif" {
			if len(content) < 6 || (!bytes.HasPrefix(content, []byte("GIF87a")) && !bytes.HasPrefix(content, []byte("GIF89a"))) {
				return &FileScanResult{
					IsValid: false,
					Reason:  "Header berkas tidak valid untuk format GIF",
				}, nil
			}
		} else if ext == ".webp" {
			if len(content) < 12 || !bytes.HasPrefix(content, []byte("RIFF")) || !bytes.Equal(content[8:12], []byte("WEBP")) {
				return &FileScanResult{
					IsValid: false,
					Reason:  "Header berkas tidak valid untuk format WebP",
				}, nil
			}
		}
	} else if cat == CategoryDocuments && ext == ".pdf" {
		if len(content) < 4 || !bytes.HasPrefix(content, []byte("%PDF")) {
			return &FileScanResult{
				IsValid: false,
				Reason:  "Header berkas tidak valid untuk format dokumen PDF",
			}, nil
		}
	}

	// 7. Deep Web Shell & Script Injection Inspection
	for _, pattern := range maliciousRegexPatterns {
		if pattern.Match(content) {
			matchBytes := pattern.Find(content)
			s.logThreat(clientIP, "web_shell_injection", "critical", filename, fmt.Sprintf("Terdeteksi payload web shell/script berbahaya (%s) dalam konten file", string(matchBytes)))
			return &FileScanResult{
				IsValid:    false,
				Reason:     "Konten berkas terdeteksi mengandung script atau web shell yang berpotensi merusak server",
				ThreatType: "web_shell_injection",
				Severity:   "critical",
			}, nil
		}
	}

	// 8. Generate Nama File Bersih dan Terlindungi
	safeUUID := uuid.New().String()
	cleanName := fmt.Sprintf("%d_%s%s", time.Now().Unix(), safeUUID[:12], ext)

	return &FileScanResult{
		IsValid:      true,
		DetectedMIME: detectedMIME,
		CleanExt:     ext,
		CleanName:    cleanName,
	}, nil
}

// logThreat mencatat pelanggaran file ke Security Threat Log
func (s *FileSecurityScanner) logThreat(ip, threatType, severity, filename, reason string) {
	if s.securityService != nil {
		s.securityService.RecordThreat(models.SecurityThreatLog{
			IPAddress:    ip,
			ThreatType:   threatType,
			Severity:     severity,
			Payload:      fmt.Sprintf("File: %s | %s", filename, reason),
			Endpoint:     "/api/upload",
			Method:       "POST",
			UserAgent:    "Upload Security Guard",
			Blocked:      true,
			ActionTaken:  "blocked_malicious_upload",
			RequestCount: 1,
			CreatedAt:    time.Now(),
		})
	}
}
