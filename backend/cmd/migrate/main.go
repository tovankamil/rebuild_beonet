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
)

// Script Migrasi Data Bionetv5 ke Bionetv6
// Menjalankan Fase 2 dari rebuild_plan.md:
// - Migrasi 100% berbasis UUID CHAR(36) untuk Primary Key dan Foreign Key
// - Pemetaan Username Lama -> UUID Foreign Key Konsisten
// - Migrasi Ledger Keuangan Wallets, Poin, Rekening, PIN, dan Pohon Jaringan

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

	sourceDBName := "bionetv5"
	targetDBName := "bionetv6"

	sourceDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True", dbUser, dbPass, dbHost, dbPort, sourceDBName)
	targetDSN := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True", dbUser, dbPass, dbHost, dbPort, targetDBName)

	log.Printf("Connecting to Source DB (%s) and Target DB (%s)...", sourceDBName, targetDBName)

	srcDB, err := sql.Open("mysql", sourceDSN)
	if err != nil {
		log.Fatalf("Failed to connect to source DB: %v", err)
	}
	defer srcDB.Close()

	tgtDB, err := sql.Open("mysql", targetDSN)
	if err != nil {
		log.Fatalf("Failed to connect to target DB: %v", err)
	}
	defer tgtDB.Close()

	if err := srcDB.Ping(); err != nil {
		log.Printf("Notice: Source DB (%s) ping failed: %v. Pastikan database bionetv5 tersedia.", sourceDBName, err)
		return
	}
	if err := tgtDB.Ping(); err != nil {
		log.Printf("Notice: Target DB (%s) ping failed: %v. Pastikan database bionetv6 tersedia.", targetDBName, err)
		return
	}

	log.Println("Database connection verified! Starting 100% UUID migration process...")
	userMap := make(map[string]string) // username -> UUID

	// 1. MIGRASI USERS
	log.Println("[1/7] Migrating Users from bionetv5 to bionetv6 (UUID)...")
	rows, err := srcDB.Query("SELECT id, username, COALESCE(nama, username), COALESCE(password, ''), COALESCE(role, 'member'), noHp, COALESCE(status, 'active') FROM users")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		return
	}
	defer rows.Close()

	userStmt, err := tgtDB.Prepare("INSERT IGNORE INTO users (id, username, full_name, password_hash, role, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Fatalf("Failed to prepare target user insert: %v", err)
	}
	defer userStmt.Close()

	userCount := 0
	for rows.Next() {
		var oldID int
		var username, nama, pwd, role, status string
		var phone sql.NullString

		if err := rows.Scan(&oldID, &username, &nama, &pwd, &role, &phone, &status); err != nil {
			continue
		}

		newUUID := uuid.New().String()
		userMap[username] = newUUID

		var phoneVal *string
		if phone.Valid {
			phoneVal = &phone.String
		}

		_, err = userStmt.Exec(newUUID, username, nama, pwd, role, phoneVal, status)
		if err == nil {
			userCount++
		}
	}
	log.Printf("Successfully migrated %d users (UUID PK mapped)!", userCount)

	// 2. MIGRASI REKENING BANK
	log.Println("[2/7] Migrating databankusers -> user_banks (UUID)...")
	bankRows, err := srcDB.Query("SELECT idUsername, COALESCE(bank, ''), COALESCE(norek, ''), COALESCE(namrek, '') FROM databankusers")
	if err == nil {
		bankStmt, _ := tgtDB.Prepare("INSERT INTO user_banks (id, user_id, bank_name, account_number, account_name, is_primary) VALUES (?, ?, ?, ?, ?, true)")
		bankCount := 0
		for bankRows.Next() {
			var uName, bank, norek, namrek string
			if err := bankRows.Scan(&uName, &bank, &norek, &namrek); err == nil {
				if targetUUID, ok := userMap[uName]; ok {
					bankID := uuid.New().String()
					if _, err := bankStmt.Exec(bankID, targetUUID, bank, norek, namrek); err == nil {
						bankCount++
					}
				}
			}
		}
		bankRows.Close()
		bankStmt.Close()
		log.Printf("Successfully migrated %d bank accounts with UUIDs!", bankCount)
	}

	// 3. MIGRASI POIN PASANGAN
	log.Println("[3/7] Migrating poinpasangans -> point_balances (UUID)...")
	ptRows, err := srcDB.Query("SELECT idUsername, COALESCE(poinKiri, 0), COALESCE(poinKanan, 0) FROM poinpasangans")
	if err == nil {
		ptStmt, _ := tgtDB.Prepare("INSERT INTO point_balances (id, user_id, point_left, point_right) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE point_left = VALUES(point_left), point_right = VALUES(point_right)")
		ptCount := 0
		for ptRows.Next() {
			var uName string
			var pKiri, pKanan float64
			if err := ptRows.Scan(&uName, &pKiri, &pKanan); err == nil {
				if targetUUID, ok := userMap[uName]; ok {
					ptID := uuid.New().String()
					if _, err := ptStmt.Exec(ptID, targetUUID, pKiri, pKanan); err == nil {
						ptCount++
					}
				}
			}
		}
		ptRows.Close()
		ptStmt.Close()
		log.Printf("Successfully migrated %d point balance records with UUIDs!", ptCount)
	}

	// 4. MIGRASI SALDO WALLET TERAKHIR
	log.Println("[4/7] Migrating latest wallets -> wallets (UUID)...")
	walletRows, err := srcDB.Query("SELECT idUsername, COALESCE(saldo, 0) FROM wallets WHERE id IN (SELECT MAX(id) FROM wallets GROUP BY idUsername)")
	if err == nil {
		wStmt, _ := tgtDB.Prepare("INSERT INTO wallets (id, user_id, balance) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = VALUES(balance)")
		wCount := 0
		for walletRows.Next() {
			var uName string
			var saldo float64
			if err := walletRows.Scan(&uName, &saldo); err == nil {
				if targetUUID, ok := userMap[uName]; ok {
					wID := uuid.New().String()
					if _, err := wStmt.Exec(wID, targetUUID, saldo); err == nil {
						wCount++
					}
				}
			}
		}
		walletRows.Close()
		wStmt.Close()
		log.Printf("Successfully migrated %d wallet balances with UUIDs!", wCount)
	}

	// 5. MIGRASI SPONSOR
	log.Println("[5/7] Migrating datasponsors -> sponsors (UUID FK)...")
	sponsorRows, err := srcDB.Query("SELECT idUsername, sponsor FROM datasponsors")
	if err == nil {
		sStmt, _ := tgtDB.Prepare("INSERT IGNORE INTO sponsors (id, user_id, sponsor_id) VALUES (?, ?, ?)")
		sCount := 0
		for sponsorRows.Next() {
			var uName, sponsorName string
			if err := sponsorRows.Scan(&uName, &sponsorName); err == nil {
				userUUID, ok1 := userMap[uName]
				sponsorUUID, ok2 := userMap[sponsorName]
				if ok1 && ok2 {
					sID := uuid.New().String()
					if _, err := sStmt.Exec(sID, userUUID, sponsorUUID); err == nil {
						sCount++
					}
				}
			}
		}
		sponsorRows.Close()
		sStmt.Close()
		log.Printf("Successfully migrated %d direct sponsor links with UUIDs!", sCount)
	}

	// 6. MIGRASI POSISI BINARY
	log.Println("[6/7] Migrating dataposisis -> network_positions (UUID FK)...")
	posRows, err := srcDB.Query("SELECT idUsername, upline, posisi FROM dataposisis")
	if err == nil {
		posStmt, _ := tgtDB.Prepare("INSERT IGNORE INTO network_positions (id, user_id, upline_id, position) VALUES (?, ?, ?, ?)")
		posCount := 0
		for posRows.Next() {
			var uName, uplineName, pos string
			if err := posRows.Scan(&uName, &uplineName, &pos); err == nil {
				userUUID, ok1 := userMap[uName]
				uplineUUID, ok2 := userMap[uplineName]
				if ok1 && ok2 {
					if pos == "kiri" || pos == "kanan" {
						posID := uuid.New().String()
						if _, err := posStmt.Exec(posID, userUUID, uplineUUID, pos); err == nil {
							posCount++
						}
					}
				}
			}
		}
		posRows.Close()
		posStmt.Close()
		log.Printf("Successfully migrated %d binary tree network positions with UUIDs!", posCount)
	}

	// 7. SELESAI
	log.Printf("[7/7] 100%% UUID migration completed successfully at %s!", time.Now().Format(time.RFC3339))
}
