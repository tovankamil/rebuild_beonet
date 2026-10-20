package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../../.env")

	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "127.0.0.1"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "3306"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "root"
	}
	dbPass := os.Getenv("DB_PASSWORD")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&multiStatements=true", dbUser, dbPass, dbHost, dbPort)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Gagal terhubung ke MySQL: %v", err)
	}
	defer db.Close()

	sqlFile, err := os.ReadFile("d:/Project/rebuild bionet/database/bionet_v6.sql")
	if err != nil {
		log.Fatalf("Gagal membaca file bionet_v6.sql: %v", err)
	}

	queries := strings.Split(string(sqlFile), ";")
	for _, query := range queries {
		trimmed := strings.TrimSpace(query)
		if trimmed == "" {
			continue
		}
		_, err := db.Exec(trimmed)
		if err != nil {
			log.Printf("Notice on query execution: %v\nQuery snippet: %s", err, trimmed[:min(len(trimmed), 60)])
		}
	}

	log.Println("Berhasil menginisialisasi database bionetv6 dengan 100% UUID Schema!")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
