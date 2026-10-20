package services

import (
	"errors"

	"bionet-backend/interfaces"
	"bionet-backend/models"
	"bionet-backend/utils"

	"golang.org/x/crypto/bcrypt"
)

type authServiceImpl struct {
	repo interfaces.AuthRepository
}

func NewAuthService(repo interfaces.AuthRepository) interfaces.AuthService {
	return &authServiceImpl{repo: repo}
}

func (s *authServiceImpl) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	user, err := s.repo.FindByUsername(req.Username)
	if err != nil {
		return nil, errors.New("username atau password salah")
	}

	// Cek password hash
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		// Fallback jika password masih plain text (data lama/testing)
		if user.PasswordHash != req.Password {
			return nil, errors.New("username atau password salah")
		}
	}

	if user.Status != "active" {
		return nil, errors.New("akun anda sedang tidak aktif atau disuspend")
	}

	// Generate JWT Token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, errors.New("gagal membuat token autentikasi")
	}

	return &models.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}
