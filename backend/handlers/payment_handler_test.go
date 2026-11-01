package handlers

import (
	"bytes"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

func TestPaymentHandler_GetPaymentConfig(t *testing.T) {
	gin.SetMode(gin.TestMode)

	midtransSvc := services.NewMidtransService()
	paymentHandler := NewPaymentHandler(midtransSvc)

	r := gin.New()
	r.GET("/api/public/payment/config", paymentHandler.GetPaymentConfig)

	req, _ := http.NewRequest("GET", "/api/public/payment/config", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}

	var resp struct {
		Status string `json:"status"`
		Data   struct {
			ClientKey   string `json:"client_key"`
			Environment string `json:"environment"`
			SnapURL     string `json:"snap_url"`
		} `json:"data"`
	}

	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp.Status != "success" {
		t.Errorf("Expected status 'success', got %q", resp.Status)
	}

	if resp.Data.ClientKey == "" {
		t.Errorf("Expected non-empty client_key")
	}

	if resp.Data.Environment != "sandbox" && resp.Data.Environment != "production" {
		t.Errorf("Unexpected environment: %q", resp.Data.Environment)
	}
}

func TestPaymentHandler_HandleWebhook_InvalidSignature(t *testing.T) {
	gin.SetMode(gin.TestMode)

	midtransSvc := services.NewMidtransService()
	paymentHandler := NewPaymentHandler(midtransSvc)

	r := gin.New()
	r.POST("/api/public/midtrans/webhook", paymentHandler.HandleMidtransWebhook)

	payload := map[string]interface{}{
		"order_id":           "ORD-TEST-404",
		"status_code":        "200",
		"gross_amount":       "100000.00",
		"signature_key":      "invalid-signature-hash",
		"transaction_status": "settlement",
	}

	b, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/public/midtrans/webhook", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid signature, got %d", w.Code)
	}
}

func TestPaymentHandler_HandleWebhook_ValidSignature(t *testing.T) {
	gin.SetMode(gin.TestMode)

	midtransSvc := services.NewMidtransService()
	paymentHandler := NewPaymentHandler(midtransSvc)

	r := gin.New()
	r.POST("/api/public/midtrans/webhook", paymentHandler.HandleMidtransWebhook)

	orderID := "ORD-WEBHOOK-TEST"
	statusCode := "200"
	grossAmount := "150000.00"

	// Compute valid signature
	raw := orderID + statusCode + grossAmount + midtransSvc.GetServerKey()
	hasher := sha512.New()
	hasher.Write([]byte(raw))
	validSig := hex.EncodeToString(hasher.Sum(nil))

	payload := map[string]interface{}{
		"order_id":           orderID,
		"status_code":        statusCode,
		"gross_amount":       grossAmount,
		"signature_key":      validSig,
		"transaction_status": "settlement",
		"payment_type":       "bank_transfer",
	}

	b, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "/api/public/midtrans/webhook", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200 for valid webhook, got %d. Body: %s", w.Code, w.Body.String())
	}
}
