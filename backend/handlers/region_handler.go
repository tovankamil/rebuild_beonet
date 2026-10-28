package handlers

import (
	"net/http"
	"strings"

	"bionet-backend/config"
	"github.com/gin-gonic/gin"
)

type RegionHandler struct{}

func NewRegionHandler() *RegionHandler {
	return &RegionHandler{}
}

// GetProvinces mengembalikan daftar seluruh 34 provinsi unik di Indonesia
func (h *RegionHandler) GetProvinces(c *gin.Context) {
	db := config.DB
	var provinces []string

	err := db.Table("indonesia_kode").
		Where("provinsi IS NOT NULL AND provinsi != ''").
		Distinct("provinsi").
		Order("provinsi ASC").
		Pluck("provinsi", &provinces).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat data provinsi", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   provinces,
	})
}

// GetRegencies mengembalikan daftar kabupaten/kota berdasarkan nama provinsi
func (h *RegionHandler) GetRegencies(c *gin.Context) {
	db := config.DB
	provinsi := strings.TrimSpace(c.Query("province"))
	if provinsi == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter province wajib diisi"})
		return
	}

	var regencies []string
	err := db.Table("indonesia_kode").
		Where("LOWER(provinsi) = LOWER(?)", provinsi).
		Distinct("kabupaten").
		Order("kabupaten ASC").
		Pluck("kabupaten", &regencies).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat data kabupaten/kota", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   regencies,
	})
}

// GetDistricts mengembalikan daftar kecamatan berdasarkan provinsi & kabupaten
func (h *RegionHandler) GetDistricts(c *gin.Context) {
	db := config.DB
	provinsi := strings.TrimSpace(c.Query("province"))
	kabupaten := strings.TrimSpace(c.Query("regency"))
	if kabupaten == "" {
		kabupaten = strings.TrimSpace(c.Query("city"))
	}

	if kabupaten == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Parameter regency/city wajib diisi"})
		return
	}

	query := db.Table("indonesia_kode").Where("LOWER(kabupaten) = LOWER(?)", kabupaten)
	if provinsi != "" {
		query = query.Where("LOWER(provinsi) = LOWER(?)", provinsi)
	}

	var districts []string
	err := query.Distinct("kecamatan").Order("kecamatan ASC").Pluck("kecamatan", &districts).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat data kecamatan", "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   districts,
	})
}

type RegionSearchResult struct {
	Provinsi  string `json:"provinsi"`
	Kabupaten string `json:"kabupaten"`
	Kecamatan string `json:"kecamatan"`
	Label     string `json:"label"`
}

// SearchRegions mencari kecamatan / kabupaten / provinsi berdasarkan keyword pencarian
func (h *RegionHandler) SearchRegions(c *gin.Context) {
	db := config.DB
	q := strings.TrimSpace(c.Query("q"))
	if len(q) < 2 {
		c.JSON(http.StatusOK, gin.H{"status": "success", "data": []RegionSearchResult{}})
		return
	}

	var rawResults []struct {
		Provinsi  string `json:"provinsi"`
		Kabupaten string `json:"kabupaten"`
		Kecamatan string `json:"kecamatan"`
	}

	likeQ := "%" + q + "%"
	err := db.Table("indonesia_kode").
		Select("DISTINCT provinsi, kabupaten, kecamatan").
		Where("kecamatan LIKE ? OR kabupaten LIKE ? OR provinsi LIKE ?", likeQ, likeQ, likeQ).
		Order("kecamatan ASC").
		Limit(25).
		Scan(&rawResults).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Pencarian wilayah gagal", "error": err.Error()})
		return
	}

	results := make([]RegionSearchResult, len(rawResults))
	for i, r := range rawResults {
		results[i] = RegionSearchResult{
			Provinsi:  r.Provinsi,
			Kabupaten: r.Kabupaten,
			Kecamatan: r.Kecamatan,
			Label:     r.Kecamatan + ", " + r.Kabupaten + ", " + r.Provinsi,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   results,
	})
}
