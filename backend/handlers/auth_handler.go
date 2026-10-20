package handlers

import (
	"net/http"

	"bionet-backend/interfaces"
	"bionet-backend/models"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService interfaces.AuthService
	authRepo    interfaces.AuthRepository
}

func NewAuthHandler(authService interfaces.AuthService, authRepo interfaces.AuthRepository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		authRepo:    authRepo,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Data login tidak valid. Pastikan username dan password diisi.",
			"error":   err.Error(),
		})
		return
	}

	res, err := h.authService.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Login berhasil",
		"data":    res,
	})
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"status":  "error",
			"message": "Sesi tidak ditemukan atau token tidak valid",
		})
		return
	}

	user, err := h.authRepo.FindByUsername(username.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Pengguna tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Data pengguna berhasil diambil",
		"data":    user,
	})
}
