package services

import (
	"errors"
	"os"
	"testing"

	"bionet-backend/models"

	"golang.org/x/crypto/bcrypt"
)

type mockAuthRepository struct {
	users map[string]*models.User
}

func (m *mockAuthRepository) FindByUsername(username string) (*models.User, error) {
	user, exists := m.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (m *mockAuthRepository) CreateUser(user *models.User) error {
	m.users[user.Username] = user
	return nil
}

func TestAuthService_Login_Success_Bcrypt(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_jwt_secret")

	plainPassword := "bionet123"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("Failed to hash password: %v", err)
	}

	repo := &mockAuthRepository{
		users: map[string]*models.User{
			"mitra01": {
				ID:           "uuid-1",
				Username:     "mitra01",
				FullName:     "Mitra Bionet",
				PasswordHash: string(hashedPassword),
				Role:         "member",
				Status:       "active",
			},
		},
	}

	service := NewAuthService(repo)

	resp, err := service.Login(models.LoginRequest{
		Username: "mitra01",
		Password: plainPassword,
	})

	if err != nil {
		t.Fatalf("Expected login to succeed, got error: %v", err)
	}

	if resp.Token == "" {
		t.Errorf("Expected token to be returned")
	}

	if resp.User.Username != "mitra01" {
		t.Errorf("Expected username mitra01, got %s", resp.User.Username)
	}
}

func TestAuthService_Login_Success_PlainTextFallback(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_jwt_secret")

	repo := &mockAuthRepository{
		users: map[string]*models.User{
			"mitra02": {
				ID:           "uuid-2",
				Username:     "mitra02",
				FullName:     "Mitra Dua",
				PasswordHash: "plainpassword123", // data lama sebelum di-hash
				Role:         "member",
				Status:       "active",
			},
		},
	}

	service := NewAuthService(repo)

	resp, err := service.Login(models.LoginRequest{
		Username: "mitra02",
		Password: "plainpassword123",
	})

	if err != nil {
		t.Fatalf("Expected login with fallback plain text to succeed, got: %v", err)
	}

	if resp.Token == "" {
		t.Errorf("Expected token to be generated")
	}
}

func TestAuthService_Login_WrongPassword(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("correctpassword"), bcrypt.DefaultCost)

	repo := &mockAuthRepository{
		users: map[string]*models.User{
			"mitra01": {
				ID:           "uuid-1",
				Username:     "mitra01",
				PasswordHash: string(hashedPassword),
				Role:         "member",
				Status:       "active",
			},
		},
	}

	service := NewAuthService(repo)

	_, err := service.Login(models.LoginRequest{
		Username: "mitra01",
		Password: "wrongpassword",
	})

	if err == nil {
		t.Fatalf("Expected login to fail with wrong password, but got no error")
	}

	if err.Error() != "username atau password salah" {
		t.Errorf("Expected error message 'username atau password salah', got: %v", err)
	}
}

func TestAuthService_Login_UserNotFound(t *testing.T) {
	repo := &mockAuthRepository{
		users: map[string]*models.User{},
	}

	service := NewAuthService(repo)

	_, err := service.Login(models.LoginRequest{
		Username: "nonexistent",
		Password: "password",
	})

	if err == nil {
		t.Fatalf("Expected error for non-existent user, got nil")
	}

	if err.Error() != "username atau password salah" {
		t.Errorf("Expected error 'username atau password salah', got: %v", err)
	}
}

func TestAuthService_Login_UserSuspended(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	repo := &mockAuthRepository{
		users: map[string]*models.User{
			"suspended_user": {
				ID:           "uuid-suspended",
				Username:     "suspended_user",
				PasswordHash: string(hashedPassword),
				Role:         "member",
				Status:       "suspended", // Non-active
			},
		},
	}

	service := NewAuthService(repo)

	_, err := service.Login(models.LoginRequest{
		Username: "suspended_user",
		Password: "password123",
	})

	if err == nil {
		t.Fatalf("Expected error for suspended account, got nil")
	}

	if err.Error() != "akun anda sedang tidak aktif atau disuspend" {
		t.Errorf("Expected suspended error message, got: %v", err)
	}
}
