package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

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
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "bionetv6"
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True", dbUser, dbPass, dbHost, dbPort, dbName)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}

	log.Println("Memulai pembersihan data bonus dan relasi MLM...")

	// Nonaktifkan foreign key checks sementara untuk pembersihan aman
	if _, err := db.Exec("SET FOREIGN_KEY_CHECKS = 0;"); err != nil {
		log.Fatalf("Gagal menonaktifkan FK checks: %v", err)
	}

	tablesToTruncate := []string{
		"wallet_transactions",
		"withdrawals",
		"sponsors",
		"sponsor_paths",
		"network_positions",
		"upline_paths",
		"pin_transfers",
		"pins",
	}

	for _, table := range tablesToTruncate {
		_, err := db.Exec(fmt.Sprintf("TRUNCATE TABLE %s;", table))
		if err != nil {
			log.Printf("Peringatan saat truncate %s: %v", table, err)
		} else {
			log.Printf("Berhasil mengosongkan tabel %s", table)
		}
	}

	// Reset seluruh wallet dan point balance ke 0
	_, _ = db.Exec("UPDATE wallets SET balance = 0.00;")
	_, _ = db.Exec("UPDATE point_balances SET point_left = 0.00, point_right = 0.00;")
	log.Println("Berhasil mereset saldo dompet dan saldo poin pairing ke 0.00.")

	// Hapus dummy users pengujian masa lalu (kecuali user utama)
	coreUsers := "'admin01', 'gudang01', 'finance01', 'cs01', 'mitra01'"
	deleteQuery := fmt.Sprintf("DELETE FROM users WHERE username NOT IN (%s) AND (username LIKE 'downline_%%' OR username LIKE 'slot_contest_%%' OR username LIKE 'mitra_test%%');", coreUsers)
	res, err := db.Exec(deleteQuery)
	if err == nil {
		affected, _ := res.RowsAffected()
		log.Printf("Berhasil membersihkan %d user dummy sisa testing terdahulu.", affected)
	}

	// Aktifkan kembali foreign key checks
	if _, err := db.Exec("SET FOREIGN_KEY_CHECKS = 1;"); err != nil {
		log.Printf("Peringatan mengaktifkan kembali FK checks: %v", err)
	}

	log.Println("Pembersihan data bonus & MLM selesai dengan sempurna!")
}

