package interfaces

import "bionet-backend/models"

type AuthRepository interface {
	FindByUsername(username string) (*models.User, error)
	CreateUser(user *models.User) error
}

type AuthService interface {
	Login(req models.LoginRequest) (*models.LoginResponse, error)
}
