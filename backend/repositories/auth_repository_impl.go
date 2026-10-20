package repositories

import (
	"bionet-backend/interfaces"
	"bionet-backend/models"

	"gorm.io/gorm"
)

type authRepositoryImpl struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) interfaces.AuthRepository {
	return &authRepositoryImpl{db: db}
}

func (r *authRepositoryImpl) FindByUsername(username string) (*models.User, error) {
	var user models.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepositoryImpl) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}
