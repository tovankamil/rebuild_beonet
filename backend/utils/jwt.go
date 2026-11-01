package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const DefaultJWTSecret = "super_secret_bionet_key_2026"

// GetJWTSecret mengambil JWT_SECRET dari environment atau DefaultJWTSecret
func GetJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret != "" {
		return secret
	}
	return DefaultJWTSecret
}

func GenerateToken(userID string, username string, role string) (string, error) {
	secret := GetJWTSecret()

	claims := jwt.MapClaims{
		"user_id":  userID,
		"username": username,
		"role":     role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // 24 hours expiry
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
