package handlers

import (
	"net/http"
	"strconv"

	"bionet-backend/services"

	"github.com/gin-gonic/gin"
)

type IncidentHandler struct{}

var GlobalIncidentHandler = &IncidentHandler{}

// GetIncidents mengambil riwayat log gangguan sistem
func (h *IncidentHandler) GetIncidents(c *gin.Context) {
	component := c.Query("component")
	level := c.Query("level")
	unresolvedOnly := c.Query("unresolved_only") == "true"
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	logs, total, err := services.GlobalIncidentService.GetIncidents(component, level, unresolvedOnly, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat log gangguan: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   logs,
		"total":  total,
	})
}

// ResolveIncident menandai gangguan sebagai telah diselesaikan
func (h *IncidentHandler) ResolveIncident(c *gin.Context) {
	id := c.Param("id")
	username := c.GetString("username")
	if username == "" {
		username = "admin"
	}

	if err := services.GlobalIncidentService.ResolveIncident(id, username); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memperbarui status gangguan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Insiden berhasil ditandai selesai/resolved",
	})
}

// GetStats mengambil matriks kesehatan sistem & uptime
func (h *IncidentHandler) GetStats(c *gin.Context) {
	stats, err := services.GlobalIncidentService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal memuat metrik sistem"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   stats,
	})
}

// ReportIncident endpoint manual jika frontend atau worker mendeteksi error
func (h *IncidentHandler) ReportIncident(c *gin.Context) {
	var req struct {
		Component string `json:"component" binding:"required"`
		Level     string `json:"level" binding:"required"`
		Title     string `json:"title" binding:"required"`
		Message   string `json:"message" binding:"required"`
		Payload   string `json:"payload"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "Data insiden tidak lengkap"})
		return
	}

	inc, err := services.GlobalIncidentService.RecordIncident(req.Component, req.Level, req.Title, req.Message, req.Payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "Gagal mencatat insiden"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Insiden berhasil dicatat",
		"data":    inc,
	})
}

