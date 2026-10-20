package handlers

import (
	"net/http"

	"bionet-backend/interfaces"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	dashboardService interfaces.DashboardService
}

func NewDashboardHandler(dashboardService interfaces.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

func (h *DashboardHandler) GetStats(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	stats, err := h.dashboardService.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil data statistik", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": stats})
}

func (h *DashboardHandler) GetGenealogy(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	tree, err := h.dashboardService.GetGenealogy(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil pohon jaringan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": tree})
}

func (h *DashboardHandler) GetDirectReferrals(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	referrals, err := h.dashboardService.GetDirectReferrals(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil daftar sponsor", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": referrals})
}

func (h *DashboardHandler) GetWalletTransactions(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	txs, err := h.dashboardService.GetWalletTransactions(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil mutasi wallet", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": txs})
}

func (h *DashboardHandler) GetUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	bank, err := h.dashboardService.GetUserBank(userID)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"status": "success", "data": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": bank})
}

func (h *DashboardHandler) SaveUserBank(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.UserBank
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Format data rekening tidak valid", "error": err.Error()})
		return
	}

	bank, err := h.dashboardService.SaveUserBank(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal menyimpan data rekening", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Data rekening berhasil disimpan", "data": bank})
}

// ----------------------------------------------------
// WITHDRAWALS
// ----------------------------------------------------

func (h *DashboardHandler) RequestWithdrawal(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.WithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Nominal penarikan tidak valid", "error": err.Error()})
		return
	}

	wd, err := h.dashboardService.RequestWithdrawal(userID, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Permintaan penarikan dana berhasil diajukan", "data": wd})
}

func (h *DashboardHandler) GetWithdrawals(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	wds, err := h.dashboardService.GetWithdrawals(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mengambil riwayat penarikan dana", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": wds})
}

// ----------------------------------------------------
// PINS & STOKIS
// ----------------------------------------------------

func (h *DashboardHandler) GetMyPins(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	pins, err := h.dashboardService.GetMyPins(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat inventori PIN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": pins})
}

func (h *DashboardHandler) GetPinPackages(c *gin.Context) {
	packages, err := h.dashboardService.GetPinPackages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat katalog paket PIN", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": packages})
}

func (h *DashboardHandler) TransferPin(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "Unauthorized"})
		return
	}

	var req models.TransferPinRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Data transfer PIN tidak valid", "error": err.Error()})
		return
	}

	err := h.dashboardService.TransferPin(userID, req.PinID, req.TargetUsername)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "PIN berhasil ditransfer ke mitra tujuan"})
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------

func (h *DashboardHandler) GetProducts(c *gin.Context) {
	products, err := h.dashboardService.GetProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat katalog produk", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": products})
}
