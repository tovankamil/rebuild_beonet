package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

// PaymentHandler handles Midtrans Snap token generation, webhooks, payment configs, and Iris payouts
type PaymentHandler struct {
	midtransService *services.MidtransService
}

// NewPaymentHandler instantiates a new PaymentHandler
func NewPaymentHandler(ms *services.MidtransService) *PaymentHandler {
	return &PaymentHandler{
		midtransService: ms,
	}
}

// CreateSnapTokenRequest represents payload to generate a Midtrans Snap transaction token
type CreateSnapTokenRequest struct {
	OrderID   string  `json:"order_id"`
	Type      string  `json:"type"`       // 'repeat_order', 'pin_purchase', 'membership'
	PackageID string  `json:"package_id"` // for pin_purchase / membership
	PinCount  int     `json:"pin_count"`  // count of pins, defaults to 1
	ProductID string  `json:"product_id"` // for repeat_order
	Quantity  int     `json:"quantity"`   // for repeat_order, defaults to 1
	Amount    float64 `json:"amount"`     // optional explicit amount
	ItemName  string  `json:"item_name"`  // optional item description
}

// CreateSnapToken generates a Midtrans Snap Token for authenticated users
func (h *PaymentHandler) CreateSnapToken(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Autentikasi diperlukan"})
		return
	}

	var req CreateSnapTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format data tidak valid"})
		return
	}

	customerName := "Bionet Member"
	email := "member@bionet.id"
	phone := "08123456789"

	// Fetch customer details from database if DB connected
	if config.DB != nil {
		var user models.User
		if err := config.DB.Where("id = ?", userID).First(&user).Error; err == nil {
			if strings.TrimSpace(user.FullName) != "" {
				customerName = user.FullName
			} else if strings.TrimSpace(user.Username) != "" {
				customerName = user.Username
			}
			if strings.TrimSpace(user.Email) != "" {
				email = user.Email
			}
			if user.Phone != nil && strings.TrimSpace(*user.Phone) != "" {
				phone = *user.Phone
			}
		}
	}

	var grossAmount int64
	var orderID string
	var itemName string
	txType := req.Type

	if req.OrderID != "" {
		// Existing Order reference
		var order models.Order
		if err := config.DB.Where("order_number = ? OR id = ?", req.OrderID, req.OrderID).First(&order).Error; err == nil {
			orderID = order.OrderNumber
			grossAmount = int64(order.TotalAmount)
			itemName = fmt.Sprintf("Pesanan %s", order.OrderNumber)
			txType = "order"
		} else if req.Amount > 0 {
			orderID = req.OrderID
			grossAmount = int64(req.Amount)
			itemName = req.ItemName
			if itemName == "" {
				itemName = "Transaksi " + orderID
			}
			if txType == "" {
				txType = "custom"
			}
		} else {
			c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Pesanan tidak ditemukan"})
			return
		}
	} else {
		// Generate by Type
		switch req.Type {
		case "pin_purchase", "membership":
			pinCount := req.PinCount
			if pinCount <= 0 {
				pinCount = 1
			}

			var pkg models.PinPackage
			if req.PackageID != "" {
				if err := config.DB.Where("id = ?", req.PackageID).First(&pkg).Error; err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Paket PIN tidak ditemukan"})
					return
				}
			} else {
				if err := config.DB.Where("is_active = true").Order("price ASC").First(&pkg).Error; err != nil {
					pkg = models.PinPackage{Name: "Paket Silver Bionet", Price: 250000}
				}
			}

			grossAmount = int64(pkg.Price) * int64(pinCount)
			if req.Amount > 0 {
				grossAmount = int64(req.Amount)
			}

			prefix := "PIN"
			if req.Type == "membership" {
				prefix = "MEM"
			}
			orderID = fmt.Sprintf("%s-%s-%d", prefix, strings.ToUpper(uuid.New().String()[:6]), time.Now().Unix()%100000)
			itemName = fmt.Sprintf("Pembelian %d x %s", pinCount, pkg.Name)
			if req.ItemName != "" {
				itemName = req.ItemName
			}

			// Track in orders table
			newOrder := models.Order{
				ID:          uuid.New().String(),
				UserID:      userID,
				OrderNumber: orderID,
				TotalAmount: float64(grossAmount),
				Status:      "pending",
			}
			_ = config.DB.Create(&newOrder).Error

		case "repeat_order":
			qty := req.Quantity
			if qty <= 0 {
				qty = 1
			}

			if req.ProductID != "" {
				var prod models.Product
				if err := config.DB.Where("id = ?", req.ProductID).First(&prod).Error; err == nil {
					grossAmount = int64(prod.Price) * int64(qty)
					itemName = fmt.Sprintf("RO %d x %s", qty, prod.Name)
				}
			}

			if grossAmount == 0 && req.Amount > 0 {
				grossAmount = int64(req.Amount)
			}
			if grossAmount == 0 {
				grossAmount = 150000 // default RO unit price
			}
			if itemName == "" {
				itemName = "Repeat Order Produk Bionet"
			}

			orderID = fmt.Sprintf("RO-%s-%d", strings.ToUpper(uuid.New().String()[:6]), time.Now().Unix()%100000)

			newOrder := models.Order{
				ID:          uuid.New().String(),
				UserID:      userID,
				OrderNumber: orderID,
				TotalAmount: float64(grossAmount),
				Status:      "pending",
			}
			_ = config.DB.Create(&newOrder).Error

		default:
			if req.Amount <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter pembayaran tidak lengkap"})
				return
			}
			grossAmount = int64(req.Amount)
			orderID = fmt.Sprintf("PAY-%s-%d", strings.ToUpper(uuid.New().String()[:6]), time.Now().Unix()%100000)
			itemName = req.ItemName
			if itemName == "" {
				itemName = "Pembayaran Layanan Bionet"
			}
			txType = "payment"

			newOrder := models.Order{
				ID:          uuid.New().String(),
				UserID:      userID,
				OrderNumber: orderID,
				TotalAmount: float64(grossAmount),
				Status:      "pending",
			}
			_ = config.DB.Create(&newOrder).Error
		}
	}

	snapToken, redirectURL, err := h.midtransService.CreateSnapTransaction(orderID, grossAmount, customerName, email, phone, itemName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal membuat transaksi Midtrans: " + err.Error()})
		return
	}

	// Record payment transaction
	paymentRec := models.PaymentTransaction{
		ID:                uuid.New().String(),
		OrderID:           orderID,
		UserID:            userID,
		TransactionType:   txType,
		GrossAmount:       grossAmount,
		TransactionStatus: "pending",
		SnapToken:         snapToken,
		RedirectURL:       redirectURL,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}
	_ = config.DB.Create(&paymentRec).Error

	// Audit trail
	services.RecordAudit(c, userID, "CREATE", "payment_transactions", orderID, nil, paymentRec)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"snap_token":   snapToken,
			"redirect_url": redirectURL,
			"client_key":   h.midtransService.GetClientKey(),
			"order_id":     orderID,
			"gross_amount": grossAmount,
		},
	})
}

// MidtransWebhookPayload defines the JSON structure sent by Midtrans notifications
type MidtransWebhookPayload struct {
	TransactionTime   string `json:"transaction_time"`
	TransactionStatus string `json:"transaction_status"`
	TransactionID     string `json:"transaction_id"`
	StatusMessage     string `json:"status_message"`
	StatusCode        string `json:"status_code"`
	SignatureKey      string `json:"signature_key"`
	PaymentType       string `json:"payment_type"`
	OrderID           string `json:"order_id"`
	GrossAmount       string `json:"gross_amount"`
	FraudStatus       string `json:"fraud_status"`
	Currency          string `json:"currency"`
	ApprovalCode      string `json:"approval_code"`
	MerchantID        string `json:"merchant_id"`
}

// HandleMidtransWebhook processes asynchronous status updates from Midtrans
func (h *PaymentHandler) HandleMidtransWebhook(c *gin.Context) {
	var payload MidtransWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid webhook payload"})
		return
	}

	// Verify SHA512 signature
	if !h.midtransService.VerifyWebhookSignature(payload.OrderID, payload.StatusCode, payload.GrossAmount, payload.SignatureKey) {
		log.Printf("[Midtrans Webhook Warning] Signature mismatch for Order: %s, Status: %s, Amount: %s",
			payload.OrderID, payload.StatusCode, payload.GrossAmount)
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Invalid signature key"})
		return
	}

	txStatus := payload.TransactionStatus
	fraudStatus := payload.FraudStatus

	var newOrderStatus string
	isSettled := false

	switch txStatus {
	case "settlement":
		newOrderStatus = "paid"
		isSettled = true
	case "capture":
		if fraudStatus == "accept" {
			newOrderStatus = "paid"
			isSettled = true
		} else if fraudStatus == "challenge" {
			newOrderStatus = "pending"
		} else {
			newOrderStatus = "cancelled"
		}
	case "pending":
		newOrderStatus = "pending"
	case "deny", "cancel":
		newOrderStatus = "cancelled"
	case "expire":
		newOrderStatus = "cancelled"
	case "refund", "partial_refund":
		newOrderStatus = "cancelled"
	default:
		newOrderStatus = txStatus
	}

	now := time.Now()

	if config.DB == nil {
		log.Printf("[Midtrans Webhook] Processed Order %s in mock mode (config.DB is nil)", payload.OrderID)
		c.JSON(http.StatusOK, gin.H{
			"status":       "success",
			"message":      "Webhook processed successfully",
			"order_status": newOrderStatus,
		})
		return
	}

	// Update Orders table
	var order models.Order
	orderFound := false
	if err := config.DB.Where("order_number = ? OR id = ?", payload.OrderID, payload.OrderID).First(&order).Error; err == nil {
		orderFound = true
		oldStatus := order.Status
		order.Status = newOrderStatus
		order.UpdatedAt = now
		config.DB.Save(&order)

		// Record audit
		services.RecordAudit(c, order.UserID, "UPDATE", "orders", order.ID,
			map[string]interface{}{"status": oldStatus},
			map[string]interface{}{"status": newOrderStatus, "midtrans_status": txStatus, "payment_type": payload.PaymentType},
		)

		// Handle automated fulfillment if settled
		if isSettled && oldStatus != "paid" {
			// If PIN or Membership order, generate active serial PINs
			if strings.HasPrefix(order.OrderNumber, "PIN-") || strings.HasPrefix(order.OrderNumber, "MEM-") {
				var pkg models.PinPackage
				if err := config.DB.Where("is_active = true").Order("price ASC").First(&pkg).Error; err == nil {
					newPin := models.Pin{
						ID:         uuid.New().String(),
						SerialCode: fmt.Sprintf("PIN-%s-%d", strings.ToUpper(uuid.New().String()[:8]), time.Now().Unix()%10000),
						PackageID:  pkg.ID,
						OwnerID:    order.UserID,
						Status:     "active",
						CreatedAt:  now,
					}
					_ = config.DB.Create(&newPin).Error
					log.Printf("[Midtrans Fulfillment] PIN %s created for User %s", newPin.SerialCode, order.UserID)
				}
			}

			// Send transactional notification
			notif := models.Notification{
				ID:        uuid.New().String(),
				UserID:    order.UserID,
				Title:     "Pembayaran Berhasil Dikonfirmasi",
				Message:   fmt.Sprintf("Pembayaran Anda untuk pesanan %s senilai Rp %s telah berhasil diverifikasi via Midtrans (%s).", payload.OrderID, payload.GrossAmount, payload.PaymentType),
				Type:      "transaction",
				Link:      "/dashboard/orders",
				CreatedAt: now,
			}
			_ = config.DB.Create(&notif).Error
		}
	}

	// Update PaymentTransaction record
	var pRecord models.PaymentTransaction
	if err := config.DB.Where("order_id = ?", payload.OrderID).First(&pRecord).Error; err == nil {
		pRecord.TransactionStatus = txStatus
		pRecord.PaymentType = payload.PaymentType
		pRecord.FraudStatus = fraudStatus
		if isSettled {
			pRecord.SettlementTime = &now
		}
		pRecord.UpdatedAt = now
		config.DB.Save(&pRecord)
	} else {
		var amt int64
		fmt.Sscanf(payload.GrossAmount, "%d", &amt)
		newRec := models.PaymentTransaction{
			ID:                uuid.New().String(),
			OrderID:           payload.OrderID,
			GrossAmount:       amt,
			PaymentType:       payload.PaymentType,
			TransactionStatus: txStatus,
			FraudStatus:       fraudStatus,
			CreatedAt:         now,
			UpdatedAt:         now,
		}
		if isSettled {
			newRec.SettlementTime = &now
		}
		if orderFound {
			newRec.UserID = order.UserID
		}
		_ = config.DB.Create(&newRec).Error
	}

	log.Printf("[Midtrans Webhook] Processed Order %s: Status=%s (Order mapped to %s)", payload.OrderID, txStatus, newOrderStatus)

	c.JSON(http.StatusOK, gin.H{
		"status":       "success",
		"message":      "Webhook processed successfully",
		"order_status": newOrderStatus,
	})
}

// GetPaymentConfig returns public Midtrans client keys and active environment
func (h *PaymentHandler) GetPaymentConfig(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"client_key":    h.midtransService.GetClientKey(),
			"environment":   h.midtransService.GetEnvironment(),
			"snap_url":      h.midtransService.GetSnapJsURL(),
			"is_production": h.midtransService.IsProduction(),
		},
	})
}

// ProcessAutoDisbursement processes an automated payout for a withdrawal request
func (h *PaymentHandler) ProcessAutoDisbursement(c *gin.Context) {
	withdrawalID := c.Param("id")
	adminID := c.GetString("user_id")

	var wd models.Withdrawal

	// 1. Atomic state check & transition to 'processing' with Pessimistic Row Lock (FOR UPDATE)
	tx := config.DB.Begin()
	if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Preload("Bank").Preload("User").Where("id = ?", withdrawalID).First(&wd).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Data penarikan dana tidak ditemukan"})
		return
	}

	if wd.Status == "completed" {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Penarikan dana sudah berhasil dicairkan sebelumnya"})
		return
	}

	if wd.Status == "processing" {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "Penarikan dana sedang dalam proses pencairan Midtrans Iris"})
		return
	}

	oldStatus := wd.Status
	wd.Status = "processing"
	if err := tx.Save(&wd).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengunci status penarikan dana"})
		return
	}
	tx.Commit()

	bankName := ""
	accountNumber := ""
	recipientName := ""

	if wd.Bank != nil {
		bankName = wd.Bank.BankName
		accountNumber = wd.Bank.AccountNumber
		recipientName = wd.Bank.AccountName
	} else {
		var userBank models.UserBank
		if err := config.DB.Where("user_id = ? AND is_primary = true", wd.UserID).First(&userBank).Error; err == nil {
			bankName = userBank.BankName
			accountNumber = userBank.AccountNumber
			recipientName = userBank.AccountName
		} else if err := config.DB.Where("user_id = ?", wd.UserID).First(&userBank).Error; err == nil {
			bankName = userBank.BankName
			accountNumber = userBank.AccountNumber
			recipientName = userBank.AccountName
		}
	}

	if recipientName == "" && wd.User != nil {
		recipientName = wd.User.FullName
	}

	if bankName == "" || accountNumber == "" {
		config.DB.Model(&wd).Update("status", oldStatus)
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Informasi rekening bank tujuan belum lengkap"})
		return
	}

	disbAmount := int64(wd.NetAmount)
	if disbAmount <= 0 {
		disbAmount = int64(wd.Amount - wd.AdminFee)
		if disbAmount <= 0 {
			disbAmount = int64(wd.Amount)
		}
	}

	// 2. Call Midtrans Iris Payout API with Idempotency Key = wd.ID
	payoutID, payoutStatus, err := h.midtransService.CreatePayout(wd.ID, disbAmount, bankName, accountNumber, recipientName)
	if err != nil {
		config.DB.Model(&wd).Update("status", "failed")
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memproses pencairan Midtrans Iris: " + err.Error()})
		return
	}

	wd.Status = "completed"
	wd.FlipTransactionID = &payoutID
	config.DB.Save(&wd)

	// Audit trail
	services.RecordAudit(c, adminID, "UPDATE", "withdrawals", wd.ID,
		map[string]interface{}{"status": oldStatus},
		map[string]interface{}{"status": "completed", "payout_id": payoutID, "channel": "midtrans_iris", "amount": disbAmount},
	)

	// Send transactional notification to member
	notif := models.Notification{
		ID:        uuid.New().String(),
		UserID:    wd.UserID,
		Title:     "Pencairan Dana Berhasil",
		Message:   fmt.Sprintf("Pencairan dana sebesar Rp %d ke rekening %s (%s - %s) telah berhasil dikirim melalui Midtrans Iris. ID: %s", disbAmount, bankName, accountNumber, recipientName, payoutID),
		Type:      "withdrawal",
		Link:      "/dashboard/withdrawals",
		CreatedAt: time.Now(),
	}
	_ = config.DB.Create(&notif).Error

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Pencairan dana berhasil diproses secara otomatis via Midtrans Iris",
		"data": gin.H{
			"withdrawal_id":  wd.ID,
			"payout_id":      payoutID,
			"payout_status":  payoutStatus,
			"amount":         disbAmount,
			"bank_name":      bankName,
			"account_number": accountNumber,
			"recipient_name": recipientName,
		},
	})
}
