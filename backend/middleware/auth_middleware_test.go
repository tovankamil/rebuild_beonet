package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"bionet-backend/utils"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	r := gin.New()
	r.Use(AuthMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"msg": "success"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidFormat(t *testing.T) {
	r := gin.New()
	r.Use(AuthMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"msg": "success"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "InvalidFormatToken")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	r := gin.New()
	r.Use(AuthMiddleware())
	r.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"msg": "success"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid.fake.token")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_ValidToken_ContextSet(t *testing.T) {
	os.Setenv("JWT_SECRET", "super_secret_test_key")

	token, err := utils.GenerateToken("user-uuid-99", "mitra_test", "admin")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	r := gin.New()
	r.Use(AuthMiddleware())

	var capturedUserID, capturedUsername, capturedRole string
	r.GET("/protected", func(c *gin.Context) {
		capturedUserID = c.GetString("user_id")
		capturedUsername = c.GetString("username")
		capturedRole = c.GetString("role")
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	req, _ := http.NewRequest(http.MethodGet, "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	if capturedUserID != "user-uuid-99" {
		t.Errorf("Expected user_id 'user-uuid-99', got %s", capturedUserID)
	}

	if capturedUsername != "mitra_test" {
		t.Errorf("Expected username 'mitra_test', got %s", capturedUsername)
	}

	if capturedRole != "admin" {
		t.Errorf("Expected role 'admin', got %s", capturedRole)
	}
}
