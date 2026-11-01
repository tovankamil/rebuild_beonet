package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type NodeInfo struct {
	ID       string
	Username string
	Level    int
}

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

	log.Println("Memulai Seeder MLM Kedalaman 5 Level...")

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("bionet123"), bcrypt.DefaultCost)
	pwdHashStr := string(hashedPassword)

	// Pastikan ada PinPackage Silver
	var pkgID string
	err = db.QueryRow("SELECT id FROM pin_packages WHERE is_active = 1 LIMIT 1").Scan(&pkgID)
	if err != nil {
		pkgID = uuid.New().String()
		_, _ = db.Exec("INSERT INTO pin_packages (id, name, price, sponsor_bonus, pairing_bonus, points, is_active, created_at) VALUES (?, 'Paket Silver (1 HU)', 250000.00, 50000.00, 20000.00, 1.00, 1, NOW())", pkgID)
	}

	// 1. Dapatkan atau Buat Root Leader: mitra01
	var rootID string
	err = db.QueryRow("SELECT id FROM users WHERE username = 'mitra01'").Scan(&rootID)
	if err != nil {
		rootID = uuid.New().String()
		_, err = db.Exec(`INSERT INTO users (id, username, full_name, password_hash, role, phone, email, status, created_at, updated_at) 
			VALUES (?, 'mitra01', 'Mitra Bionet Juara Perkasa', ?, 'member', '081234567890', 'mitra01@bionet.id', 'active', NOW(), NOW())`,
			rootID, pwdHashStr)
		if err != nil {
			log.Fatalf("Gagal membuat root user mitra01: %v", err)
		}
	}

	// Inisialisasi Wallet & Poin Root
	_, _ = db.Exec("INSERT IGNORE INTO wallets (id, user_id, balance, updated_at) VALUES (?, ?, 0.00, NOW())", uuid.New().String(), rootID)
	_, _ = db.Exec("INSERT IGNORE INTO point_balances (id, user_id, point_left, point_right, updated_at) VALUES (?, ?, 0.00, 0.00, NOW())", uuid.New().String(), rootID)

	// Self closure paths untuk root
	_, _ = db.Exec("INSERT IGNORE INTO sponsor_paths (id, ancestor_id, descendant_id, level) VALUES (?, ?, ?, 0)", uuid.New().String(), rootID, rootID)
	var uplineSelfCount int
	_ = db.QueryRow("SELECT COUNT(*) FROM upline_paths WHERE ancestor_id = ? AND descendant_id = ? AND level = 0", rootID, rootID).Scan(&uplineSelfCount)
	if uplineSelfCount == 0 {
		_, _ = db.Exec("INSERT INTO upline_paths (id, ancestor_id, descendant_id, level, path_position) VALUES (?, ?, ?, 0, NULL)", uuid.New().String(), rootID, rootID)
	}

	currentLevelNodes := []NodeInfo{{ID: rootID, Username: "mitra01", Level: 0}}
	totalCreated := 0

	// Loop level 1 sampai 5 (5 tingkat kedalaman di bawah root)
	for lvl := 1; lvl <= 5; lvl++ {
		var nextLevelNodes []NodeInfo
		nodeCounter := 1

		for _, parent := range currentLevelNodes {
			// Setiap parent memiliki 2 anak: "kiri" dan "kanan"
			positions := []string{"kiri", "kanan"}
			for _, pos := range positions {
				childUsername := fmt.Sprintf("mitra_l%d_%02d_%s", lvl, nodeCounter, pos)
				childFullName := fmt.Sprintf("Mitra Level %d %s #%d", lvl, pos, nodeCounter)
				childEmail := fmt.Sprintf("%s@bionet.id", childUsername)
				childPhone := fmt.Sprintf("0812%02d%02d%04d", lvl, nodeCounter, totalCreated+1)

				// Cek apakah user sudah ada
				var childID string
				err := db.QueryRow("SELECT id FROM users WHERE username = ?", childUsername).Scan(&childID)
				if err != nil {
					childID = uuid.New().String()
					_, err = db.Exec(`INSERT INTO users (id, username, full_name, password_hash, role, phone, email, status, created_at, updated_at)
						VALUES (?, ?, ?, ?, 'member', ?, ?, 'active', NOW(), NOW())`,
						childID, childUsername, childFullName, pwdHashStr, childPhone, childEmail)
					if err != nil {
						log.Printf("Gagal insert user %s: %v", childUsername, err)
						continue
					}
				}

				// Wallet & PointBalance
				_, _ = db.Exec("INSERT IGNORE INTO wallets (id, user_id, balance, updated_at) VALUES (?, ?, 0.00, NOW())", uuid.New().String(), childID)
				_, _ = db.Exec("INSERT IGNORE INTO point_balances (id, user_id, point_left, point_right, updated_at) VALUES (?, ?, 0.00, 0.00, NOW())", uuid.New().String(), childID)

				// Aktivasi PIN
				serialPin := fmt.Sprintf("PIN-L%d-%s-%04d", lvl, pos, totalCreated+1)
				pinID := uuid.New().String()
				now := time.Now()
				_, _ = db.Exec(`INSERT IGNORE INTO pins (id, serial_code, package_id, owner_id, used_by_id, status, created_at, used_at)
					VALUES (?, ?, ?, ?, ?, 'used', ?, ?)`,
					pinID, serialPin, pkgID, parent.ID, childID, now, now)

				// Direct Sponsor & Sponsor Paths
				_, _ = db.Exec("INSERT IGNORE INTO sponsors (id, user_id, sponsor_id, created_at) VALUES (?, ?, ?, NOW())", uuid.New().String(), childID, parent.ID)
				_, _ = db.Exec("INSERT IGNORE INTO sponsor_paths (id, ancestor_id, descendant_id, level) VALUES (?, ?, ?, 0)", uuid.New().String(), childID, childID)
				_, _ = db.Exec("INSERT IGNORE INTO sponsor_paths (id, ancestor_id, descendant_id, level) VALUES (?, ?, ?, 1)", uuid.New().String(), parent.ID, childID)

				// Higher ancestor sponsor paths
				sRows, err := db.Query("SELECT ancestor_id, level FROM sponsor_paths WHERE descendant_id = ? AND level > 0", parent.ID)
				if err == nil {
					for sRows.Next() {
						var ancID string
						var saLevel int
						if err := sRows.Scan(&ancID, &saLevel); err == nil {
							_, _ = db.Exec("INSERT IGNORE INTO sponsor_paths (id, ancestor_id, descendant_id, level) VALUES (?, ?, ?, ?)", uuid.New().String(), ancID, childID, saLevel+1)
						}
					}
					sRows.Close()
				}

				// Network Position (Binary Placement)
				_, _ = db.Exec("INSERT IGNORE INTO network_positions (id, user_id, upline_id, position, created_at) VALUES (?, ?, ?, ?, NOW())", uuid.New().String(), childID, parent.ID, pos)

				// Upline Paths (Closure Table)
				_, _ = db.Exec("INSERT IGNORE INTO upline_paths (id, ancestor_id, descendant_id, level, path_position) VALUES (?, ?, ?, 0, NULL)", uuid.New().String(), childID, childID)
				_, _ = db.Exec("INSERT IGNORE INTO upline_paths (id, ancestor_id, descendant_id, level, path_position) VALUES (?, ?, ?, 1, ?)", uuid.New().String(), parent.ID, childID, pos)

				// Higher ancestor upline paths
				uRows, err := db.Query("SELECT ancestor_id, level, path_position FROM upline_paths WHERE descendant_id = ? AND level > 0", parent.ID)
				if err == nil {
					for uRows.Next() {
						var ancID string
						var uaLevel int
						var pathPos sql.NullString
						if err := uRows.Scan(&ancID, &uaLevel, &pathPos); err == nil {
							var pVal *string
							if pathPos.Valid {
								pVal = &pathPos.String
							}
							_, _ = db.Exec("INSERT IGNORE INTO upline_paths (id, ancestor_id, descendant_id, level, path_position) VALUES (?, ?, ?, ?, ?)", uuid.New().String(), ancID, childID, uaLevel+1, pVal)
						}
					}
					uRows.Close()
				}

				nextLevelNodes = append(nextLevelNodes, NodeInfo{ID: childID, Username: childUsername, Level: lvl})
				totalCreated++
				nodeCounter++
			}
		}

		log.Printf("Level %d selesai: dibuat %d member baru (Total sejauh ini: %d)", lvl, len(nextLevelNodes), totalCreated)
		currentLevelNodes = nextLevelNodes
	}

	log.Printf("Sukses besar! Telah berhasil men-seed 5 level pohon binary & unilevel lengkap (Total %d member baru di bawah mitra01)", totalCreated)
}

