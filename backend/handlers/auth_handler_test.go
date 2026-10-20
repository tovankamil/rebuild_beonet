package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"bionet-backend/models"

	"github.com/gin-gonic/gin"
)

type mockAuthService struct {
	loginFunc func(req models.LoginRequest) (*models.LoginResponse, error)
}

func (m *mockAuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	if m.loginFunc != nil {
		return m.loginFunc(req)
	}
	return nil, errors.New("not implemented")
}

type mockAuthRepoForHandler struct {
	findFunc func(username string) (*models.User, error)
}

func (m *mockAuthRepoForHandler) FindByUsername(username string) (*models.User, error) {
	if m.findFunc != nil {
		return m.findFunc(username)
	}
	return nil, errors.New("user not found")
}

func (m *mockAuthRepoForHandler) CreateUser(user *models.User) error {
	return nil
}

func TestAuthHandler_Login_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockAuthService{
		loginFunc: func(req models.LoginRequest) (*models.LoginResponse, error) {
			return &models.LoginResponse{
				Token: "jwt-test-token-valid",
				User: models.User{
					ID:       "uuid-1",
					Username: req.Username,
					FullName: "Mitra Juara",
					Role:     "member",
				},
			}, nil
		},
	}
	mockRepo := &mockAuthRepoForHandler{}

	handler := NewAuthHandler(mockService, mockRepo)

	r := gin.New()
	r.POST("/api/auth/login", handler.Login)

	body, _ := json.Marshal(models.LoginRequest{
		Username: "mitra01",
		Password: "bionet123",
	})

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d. Body: %s", w.Code, w.Body.String())
	}

	var res map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &res)

	if res["status"] != "success" {
		t.Errorf("Expected status 'success', got %v", res["status"])
	}
}

func TestAuthHandler_Login_BadRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handler := NewAuthHandler(&mockAuthService{}, &mockAuthRepoForHandler{})

	r := gin.New()
	r.POST("/api/auth/login", handler.Login)

	// Incomplete json (missing required password)
	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer([]byte(`{"username": "test"}`)))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 Bad Request, got %d", w.Code)
	}
}

func TestAuthHandler_Login_InvalidCredentials(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mockAuthService{
		loginFunc: func(req models.LoginRequest) (*models.LoginResponse, error) {
			return nil, errors.New("username atau password salah")
		},
	}

	handler := NewAuthHandler(mockService, &mockAuthRepoForHandler{})

	r := gin.New()
	r.POST("/api/auth/login", handler.Login)

	body, _ := json.Marshal(models.LoginRequest{
		Username: "wrong_user",
		Password: "wrong_password",
	})

	req, _ := http.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("Expected status 401 Unauthorized, got %d", w.Code)
	}
}

func TestAuthHandler_GetMe_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockRepo := &mockAuthRepoForHandler{
		findFunc: func(username string) (*models.User, error) {
			return &models.User{
				ID:       "uuid-me",
				Username: username,
				FullName: "Mitra Sukses",
			}, nil
		},
	}

	handler := NewAuthHandler(&mockAuthService{}, mockRepo)

	r := gin.New()
	// Simulate auth middleware setting username in context
	r.GET("/api/auth/me", func(c *gin.Context) {
		c.Set("username", "mitra01")
		handler.GetMe(c)
	})

	req, _ := http.NewRequest(http.MethodGet, "/api/auth/me", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var res map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &res)

	data := res["data"].(map[string]interface{})
	if data["username"] != "mitra01" {
		t.Errorf("Expected username 'mitra01', got %v", data["username"])
	}
}
