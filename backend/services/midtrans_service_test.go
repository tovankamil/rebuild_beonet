package services

import (
	"crypto/sha512"
	"encoding/hex"
	"testing"
)

func TestMidtransSignatureVerification(t *testing.T) {
	svc := NewMidtransService()

	orderID := "ORDER-TEST-001"
	statusCode := "200"
	grossAmount := "250000.00"

	// Compute expected signature
	raw := orderID + statusCode + grossAmount + svc.GetServerKey()
	hasher := sha512.New()
	hasher.Write([]byte(raw))
	validSignature := hex.EncodeToString(hasher.Sum(nil))

	// Test valid signature
	if !svc.VerifyWebhookSignature(orderID, statusCode, grossAmount, validSignature) {
		t.Errorf("Expected valid signature to verify successfully")
	}

	// Test invalid signature
	invalidSignature := "abcdef1234567890"
	if svc.VerifyWebhookSignature(orderID, statusCode, grossAmount, invalidSignature) {
		t.Errorf("Expected invalid signature to fail verification")
	}

	// Test altered amount
	if svc.VerifyWebhookSignature(orderID, statusCode, "100000.00", validSignature) {
		t.Errorf("Expected signature with altered amount to fail verification")
	}
}

func TestSanitizeBankCode(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"BCA", "bca"},
		{"Bank Central Asia (BCA)", "bca"},
		{"Bank Mandiri", "mandiri"},
		{"BRI", "bri"},
		{"BNI", "bni"},
		{"CIMB Niaga", "cimb"},
		{"Bank Permata", "permata"},
		{"Bank Syariah Indonesia", "bsi"},
	}

	for _, tt := range tests {
		result := SanitizeBankCode(tt.input)
		if result != tt.expected {
			t.Errorf("SanitizeBankCode(%q) = %q; want %q", tt.input, result, tt.expected)
		}
	}
}

func TestCreateSnapTransactionSimulation(t *testing.T) {
	svc := NewMidtransService()

	token, redirectURL, err := svc.CreateSnapTransaction("TEST-ORD-999", 500000, "Budi Santoso", "budi@example.com", "081234567890", "Paket Kemitraan")
	if err != nil {
		t.Fatalf("CreateSnapTransaction returned error: %v", err)
	}

	if token == "" {
		t.Errorf("Expected non-empty snap token")
	}

	if redirectURL == "" {
		t.Errorf("Expected non-empty redirect URL")
	}
}

func TestCreatePayoutSimulation(t *testing.T) {
	svc := NewMidtransService()

	payoutID, status, err := svc.CreatePayout("WD-TEST-001", 150000, "BCA", "1234567890", "Budi Santoso")
	if err != nil {
		t.Fatalf("CreatePayout returned error: %v", err)
	}

	if payoutID == "" {
		t.Errorf("Expected non-empty payout ID")
	}

	if status == "" {
		t.Errorf("Expected non-empty status")
	}
}
