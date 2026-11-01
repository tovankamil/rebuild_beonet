package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProductHandler struct {
	uploadDir string
}

func NewProductHandler(uploadDir string) *ProductHandler {
	if uploadDir == "" {
		uploadDir = "./uploads"
	}
	return &ProductHandler{uploadDir: uploadDir}
}

// GetAdminProducts mengambil katalog lengkap produk herbal untuk Administrator
func (h *ProductHandler) GetAdminProducts(c *gin.Context) {
	db := config.DB
	search := strings.TrimSpace(c.Query("q"))
	if search == "" {
		search = strings.TrimSpace(c.Query("search"))
	}
	category := strings.TrimSpace(c.Query("category"))
	status := strings.TrimSpace(c.Query("status"))

	query := db.Model(&models.Product{})

	if search != "" {
		likeTerm := "%" + search + "%"
		query = query.Where("name LIKE ? OR description LIKE ? OR bpom_number LIKE ? OR category LIKE ?", likeTerm, likeTerm, likeTerm, likeTerm)
	}

	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	if status == "active" {
		query = query.Where("is_active = ?", true)
	} else if status == "inactive" {
		query = query.Where("is_active = ?", false)
	}

	var products []models.Product
	if err := query.Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memuat daftar produk herbal",
			"error":   err.Error(),
		})
		return
	}

	// Calculate summary metrics
	var totalCount int64
	var activeCount int64
	var lowStockCount int64
	var outOfStockCount int64

	db.Model(&models.Product{}).Count(&totalCount)
	db.Model(&models.Product{}).Where("is_active = ?", true).Count(&activeCount)
	db.Model(&models.Product{}).Where("stock > 0 AND stock < 10").Count(&lowStockCount)
	db.Model(&models.Product{}).Where("stock <= 0").Count(&outOfStockCount)

	// Distinct categories
	var categories []string
	db.Model(&models.Product{}).Where("category != ''").Distinct("category").Pluck("category", &categories)

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   products,
		"summary": gin.H{
			"total_products": totalCount,
			"active_products": activeCount,
			"low_stock":      lowStockCount,
			"out_of_stock":   outOfStockCount,
			"categories":     categories,
		},
	})
}

// CreateProductInput input payload pembuatan produk herbal
type CreateProductInput struct {
	Name        string  `json:"name" binding:"required"`
	Category    string  `json:"category"`
	BPOMNumber  string  `json:"bpom_number"`
	WeightGram  int     `json:"weight_gram"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
	Cogs        float64 `json:"cogs"`
	Stock       int     `json:"stock"`
	ImageURL    string  `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

// CreateProduct menambahkan produk herbal baru
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input CreateProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data input produk tidak valid",
			"error":   err.Error(),
		})
		return
	}

	if input.Category == "" {
		input.Category = "Herbal"
	}
	if input.WeightGram <= 0 {
		input.WeightGram = 250
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	product := models.Product{
		ID:          uuid.New().String(),
		Name:        strings.TrimSpace(input.Name),
		Category:    strings.TrimSpace(input.Category),
		BPOMNumber:  strings.TrimSpace(input.BPOMNumber),
		WeightGram:  input.WeightGram,
		Description: strings.TrimSpace(input.Description),
		Price:       input.Price,
		Cogs:        input.Cogs,
		Stock:       input.Stock,
		ImageURL:    strings.TrimSpace(input.ImageURL),
		IsActive:    isActive,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := config.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan produk herbal ke database",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Produk herbal '%s' berhasil ditambahkan", product.Name),
		"data":    product,
	})
}

// UpdateProduct memperbarui produk herbal
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	var product models.Product
	if err := config.DB.Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Produk herbal tidak ditemukan",
		})
		return
	}

	var input CreateProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data input tidak valid",
			"error":   err.Error(),
		})
		return
	}

	updates := map[string]interface{}{
		"name":        strings.TrimSpace(input.Name),
		"category":    strings.TrimSpace(input.Category),
		"bpom_number": strings.TrimSpace(input.BPOMNumber),
		"weight_gram": input.WeightGram,
		"description": strings.TrimSpace(input.Description),
		"price":       input.Price,
		"cogs":        input.Cogs,
		"stock":       input.Stock,
		"image_url":   strings.TrimSpace(input.ImageURL),
		"updated_at":  time.Now(),
	}

	if input.IsActive != nil {
		updates["is_active"] = *input.IsActive
	}

	if err := config.DB.Model(&product).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal memperbarui produk herbal",
			"error":   err.Error(),
		})
		return
	}

	config.DB.Where("id = ?", productID).First(&product)

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Produk herbal '%s' berhasil diperbarui", product.Name),
		"data":    product,
	})
}

// DeleteProduct menghapus atau menonaktifkan produk herbal
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	var product models.Product
	if err := config.DB.Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Produk herbal tidak ditemukan",
		})
		return
	}

	// Check if referenced in order_items or join_package_product_items
	var orderCount int64
	config.DB.Model(&models.OrderItem{}).Where("product_id = ?", productID).Count(&orderCount)

	var pkgItemCount int64
	config.DB.Model(&models.JoinPackageProductItem{}).Where("product_id = ?", productID).Count(&pkgItemCount)

	if orderCount > 0 || pkgItemCount > 0 {
		// Soft deactivate
		config.DB.Model(&product).Update("is_active", false)
		c.JSON(http.StatusOK, gin.H{
			"status":  "success",
			"message": "Produk herbal dinonaktifkan (diarsipkan) karena memiliki riwayat transaksi atau paket join",
			"data":    product,
		})
		return
	}

	// Permanent delete if completely unreferenced
	if err := config.DB.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menghapus produk herbal",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Produk herbal berhasil dihapus permanen",
	})
}

// UploadProductImage menangani unggah gambar produk herbal
func (h *ProductHandler) UploadProductImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		file, err = c.FormFile("file")
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "File gambar tidak ditemukan dalam formulir unggah",
			"error":   err.Error(),
		})
		return
	}

	// Validasi ekstensi
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
		".svg":  true,
	}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Format file tidak didukung. Harap gunakan format JPG, PNG, WEBP, atau SVG",
		})
		return
	}

	// Buat direktori jika belum ada
	targetDir := filepath.Join(h.uploadDir, "products")
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyiapkan direktori penyimpanan gambar",
			"error":   err.Error(),
		})
		return
	}

	newFileName := fmt.Sprintf("prod-%d-%s%s", time.Now().Unix(), uuid.New().String()[:8], ext)
	dst := filepath.Join(targetDir, newFileName)

	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Gagal menyimpan file gambar ke server",
			"error":   err.Error(),
		})
		return
	}

	publicURL := fmt.Sprintf("/uploads/products/%s", newFileName)

	c.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"message":   "Gambar produk herbal berhasil diunggah",
		"url":       publicURL,
		"file_name": newFileName,
	})
}
