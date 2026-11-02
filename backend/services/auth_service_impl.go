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
		// Dual alias compatibility for demo seed (synetiq123 <-> bionet123)
		if (req.Password == "synetiq123" && bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("bionet123")) == nil) ||
			(req.Password == "bionet123" && bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("synetiq123")) == nil) {
			err = nil
		} else if user.PasswordHash != req.Password {
			// Fallback jika password masih plain text (data lama/testing)
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
