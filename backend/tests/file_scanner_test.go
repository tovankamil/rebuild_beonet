package tests

import (
	"bytes"
	"encoding/base64"
	"mime/multipart"
	"net/textproto"
	"testing"

	"bionet-backend/services"
)

func createMockFileHeader(filename string, content []byte) *multipart.FileHeader {
	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	h := make(textproto.MIMEHeader)
	h.Set("Content-Disposition", `form-data; name="file"; filename="`+filename+`"`)
	part, _ := writer.CreatePart(h)
	part.Write(content)
	writer.Close()

	reader := multipart.NewReader(body, writer.Boundary())
	form, _ := reader.ReadForm(10 * 1024 * 1024)
	return form.File["file"][0]
}

func TestFileScanner_DangerousExtensions(t *testing.T) {
	scanner := services.GetFileSecurityScanner()

	dangerousFiles := []string{
		"shell.php", "backdoor.phtml", "hack.exe", "trojan.bat",
		"script.sh", "exploit.py", "malware.dll", "payload.jsp",
	}

	for _, fname := range dangerousFiles {
		header := createMockFileHeader(fname, []byte("plain text sample"))
		res, err := scanner.ScanUploadedFile(header, "127.0.0.1", []services.FileCategory{services.CategoryImages, services.CategoryDocuments})
		if err != nil {
			t.Fatalf("Unexpected scan error: %v", err)
		}
		if res.IsValid {
			t.Fatalf("Expected file %s to be blocked, but was marked valid", fname)
		}
	}
}

func TestFileScanner_DoubleExtension_WebShell(t *testing.T) {
	scanner := services.GetFileSecurityScanner()

	doubleExtFiles := []string{
		"image.php.jpg", "document.exe.png", "avatar.sh.webp", "report.asp.pdf",
	}

	for _, fname := range doubleExtFiles {
		header := createMockFileHeader(fname, []byte("innocent content"))
		res, err := scanner.ScanUploadedFile(header, "127.0.0.1", []services.FileCategory{services.CategoryImages, services.CategoryDocuments})
		if err != nil {
			t.Fatalf("Unexpected scan error: %v", err)
		}
		if res.IsValid {
			t.Fatalf("Expected double extension %s to be blocked", fname)
		}
	}
}

func TestFileScanner_BinaryExecutableSignatures(t *testing.T) {
	scanner := services.GetFileSecurityScanner()

	// 1. Windows PE (MZ) disguised as .jpg
	mzContent := []byte{0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00}
	headerMZ := createMockFileHeader("photo.jpg", mzContent)
	resMZ, err := scanner.ScanUploadedFile(headerMZ, "127.0.0.1", []services.FileCategory{services.CategoryImages})
	if err != nil || resMZ.IsValid {
		t.Fatalf("Expected MZ executable disguised as jpg to be blocked")
	}

	// 2. Linux ELF binary disguised as .png
	elfContent := []byte{0x7F, 'E', 'L', 'F', 0x02, 0x01, 0x01, 0x00}
	headerELF := createMockFileHeader("icon.png", elfContent)
	resELF, err := scanner.ScanUploadedFile(headerELF, "127.0.0.1", []services.FileCategory{services.CategoryImages})
	if err != nil || resELF.IsValid {
		t.Fatalf("Expected ELF binary disguised as png to be blocked")
	}
}

func TestFileScanner_WebShellContentDetection(t *testing.T) {
	scanner := services.GetFileSecurityScanner()

	// Base64 encoded test pattern: PD9waHAgZXZhbCgkX1BPU1RbJ2NtZCddKTsgPz4=
	decoded, _ := base64.StdEncoding.DecodeString("PD9waHAgZXZhbCgkX1BPU1RbJ2NtZCddKTsgPz4=")
	maliciousJpg := []byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F'}
	maliciousJpg = append(maliciousJpg, decoded...)

	header := createMockFileHeader("clean_image.jpg", maliciousJpg)
	res, err := scanner.ScanUploadedFile(header, "127.0.0.1", []services.FileCategory{services.CategoryImages})
	if err != nil {
		t.Fatalf("Unexpected scan error: %v", err)
	}
	if res.IsValid {
		t.Fatalf("Expected image with embedded web shell pattern to be blocked")
	}
}

func TestFileScanner_ValidPNG_Allowed(t *testing.T) {
	scanner := services.GetFileSecurityScanner()

	validPng := []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 'I', 'H', 'D', 'R'}
	header := createMockFileHeader("logo.png", validPng)
	res, err := scanner.ScanUploadedFile(header, "127.0.0.1", []services.FileCategory{services.CategoryImages})
	if err != nil {
		t.Fatalf("Unexpected scan error: %v", err)
	}
	if !res.IsValid {
		t.Fatalf("Expected valid PNG to pass scanner, got reason: %s", res.Reason)
	}
	if res.CleanExt != ".png" || res.CleanName == "" {
		t.Fatalf("Expected valid CleanExt and CleanName, got %s and %s", res.CleanExt, res.CleanName)
	}
}

