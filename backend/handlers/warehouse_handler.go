package handlers

import (
	"fmt"
	"net/http"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WarehouseHandler struct{}

func NewWarehouseHandler() *WarehouseHandler {
	return &WarehouseHandler{}
}

// GetOverview mengembalikan ringkasan operasional logistik & stok gudang
func (h *WarehouseHandler) GetOverview(c *gin.Context) {
	db := config.DB

	var totalProducts int64
	db.Model(&models.Product{}).Count(&totalProducts)

	var totalStock int64
	db.Model(&models.Product{}).Select("COALESCE(SUM(stock), 0)").Scan(&totalStock)

	var lowStockCount int64
	db.Model(&models.Product{}).Where("stock <= ?", 20).Count(&lowStockCount)

	var pendingOrders int64
	db.Model(&models.Order{}).Where("status IN ('pending', 'paid', 'processing')").Count(&pendingOrders)

	var shippedOrders int64
	db.Model(&models.Order{}).Where("status = ?", "shipped").Count(&shippedOrders)

	var products []models.Product
	db.Order("stock ASC").Find(&products)

	var recentOrders []models.Order
	db.Preload("User").Preload("Items.Product").Order("created_at DESC").Limit(5).Find(&recentOrders)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": gin.H{
			"total_products":       totalProducts,
			"total_stock":          totalStock,
			"low_stock_count":      lowStockCount,
			"pending_orders_count": pendingOrders,
			"shipped_orders_count": shippedOrders,
			"products":             products,
			"recent_orders":        recentOrders,
		},
	})
}

// GetInventory mengambil katalog inventori lengkap
func (h *WarehouseHandler) GetInventory(c *gin.Context) {
	var products []models.Product
	if err := config.DB.Order("name ASC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat inventori gudang"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": products})
}

// UpdateStock menambah atau mengurangi stok barang
func (h *WarehouseHandler) UpdateStock(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Adjustment int    `json:"adjustment" binding:"required"` // e.g. +50 or -10
		Notes      string `json:"notes"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Nominal penyesuaian stok tidak valid"})
		return
	}

	var product models.Product
	if err := config.DB.Where("id = ?", id).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "Produk tidak ditemukan"})
		return
	}

	newStock := product.Stock + req.Adjustment
	if newStock < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Stok tidak boleh kurang dari 0"})
		return
	}

	if err := config.DB.Model(&product).Update("stock", newStock).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui stok"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Stok %s berhasil diperbarui menjadi %d pcs", product.Name, newStock),
		"data": gin.H{
			"product_id": product.ID,
			"new_stock":  newStock,
		},
	})
}

// GetOrders mengambil daftar pesanan belanja RO untuk pemenuhan pengiriman
func (h *WarehouseHandler) GetOrders(c *gin.Context) {
	status := c.Query("status")
	query := config.DB.Preload("User").Preload("Items.Product")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var orders []models.Order
	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat pesanan", "error": err.Error()})
		return
	}

	// Jika belum ada pesanan sama sekali, seed contoh dummy order agar gudang bisa langsung diuji
	if len(orders) == 0 {
		var demoUser models.User
		if err := config.DB.Where("role = ?", "member").First(&demoUser).Error; err == nil {
			var product models.Product
			if err := config.DB.First(&product).Error; err == nil {
				demoOrder := models.Order{
					ID:          uuid.New().String(),
					UserID:      demoUser.ID,
					OrderNumber: fmt.Sprintf("RO-BIO-%d", time.Now().Unix()),
					TotalAmount: product.Price * 2,
					Status:      "processing",
				}
				config.DB.Create(&demoOrder)
				config.DB.Create(&models.OrderItem{
					ID:          uuid.New().String(),
					OrderID:     demoOrder.ID,
					ProductID:   product.ID,
					Quantity:    2,
					PriceAtTime: product.Price,
				})

				config.DB.Preload("User").Preload("Items.Product").Where("id = ?", demoOrder.ID).Find(&orders)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "data": orders})
}

// UpdateOrderStatus memperbarui status pengiriman (misal: shipped)
func (h *WarehouseHandler) UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"` // 'shipped', 'completed', 'processing'
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Status pesanan tidak valid"})
		return
	}

	if err := config.DB.Model(&models.Order{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui status pesanan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Status pesanan berhasil diperbarui ke " + req.Status})
}
