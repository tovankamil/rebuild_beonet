package utils

import (
	"os"
	"testing"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateToken_Success(t *testing.T) {
	os.Setenv("JWT_SECRET", "test_secret_key_12345")

	userID := "user-uuid-1234"
	username := "mitra01"
	role := "member"

	tokenString, err := GenerateToken(userID, username, role)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if tokenString == "" {
		t.Fatalf("Expected token string to be non-empty")
	}

	// Verify token content
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte("test_secret_key_12345"), nil
	})

	if err != nil {
		t.Fatalf("Failed to parse token: %v", err)
	}

	if !token.Valid {
		t.Fatalf("Expected token to be valid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		t.Fatalf("Expected MapClaims")
	}

	if claims["user_id"] != userID {
		t.Errorf("Expected user_id %s, got %v", userID, claims["user_id"])
	}

	if claims["username"] != username {
		t.Errorf("Expected username %s, got %v", username, claims["username"])
	}

	if claims["role"] != role {
		t.Errorf("Expected role %s, got %v", role, claims["role"])
	}
}

func TestGenerateToken_DefaultSecret(t *testing.T) {
	os.Unsetenv("JWT_SECRET")

	tokenString, err := GenerateToken("id-1", "user-1", "member")
	if err != nil {
		t.Fatalf("Expected no error when JWT_SECRET unset, got %v", err)
	}

	// Should verify with default secret "default_secret"
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte("default_secret"), nil
	})

	if err != nil || !token.Valid {
		t.Fatalf("Expected token to be valid with default secret: %v", err)
	}
}
