package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"bionet-backend/config"
	"bionet-backend/handlers"
	"bionet-backend/middleware"
	"bionet-backend/models"
	"bionet-backend/repositories"
	"bionet-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func seedDefaultData() {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("bionet123"), bcrypt.DefaultCost)

	// 1. Seed Member: mitra01
	var mitraUser models.User
	if err := config.DB.Where("username = ?", "mitra01").First(&mitraUser).Error; err != nil {
		mitraUser = models.User{
			ID:           uuid.New().String(),
			Username:     "mitra01",
			FullName:     "Mitra Bionet Juara",
			PasswordHash: string(hashedPassword),
			Role:         "member",
			Status:       "active",
		}
		if err := config.DB.Create(&mitraUser).Error; err == nil {
			log.Println("Seeded demo user: username=mitra01, password=bionet123, role=member")

			config.DB.Create(&models.Wallet{
				ID:      uuid.New().String(),
				UserID:  mitraUser.ID,
				Balance: 2750000.00,
			})
			config.DB.Create(&models.PointBalance{
				ID:         uuid.New().String(),
				UserID:     mitraUser.ID,
				PointLeft:  125.00,
				PointRight: 98.00,
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitraUser.ID,
				Type:         "credit",
				Amount:       500000.00,
				BalanceAfter: 2750000.00,
				Description:  "Bonus Pasangan (Pairing Bonus)",
			})
			config.DB.Create(&models.UserBank{
				ID:            uuid.New().String(),
				UserID:        mitraUser.ID,
				BankName:      "BCA (Bank Central Asia)",
				AccountNumber: "8271928371",
				AccountName:   "Mitra Bionet Juara",
				IsPrimary:     true,
			})
		}
	}

	// 2. Seed Admin: admin01
	var adminUser models.User
	if err := config.DB.Where("username = ?", "admin01").First(&adminUser).Error; err != nil {
		adminUser = models.User{
			ID:           uuid.New().String(),
			Username:     "admin01",
			FullName:     "Administrator Pusat Bionet",
			PasswordHash: string(hashedPassword),
			Role:         "admin",
			Status:       "active",
		}
		if err := config.DB.Create(&adminUser).Error; err == nil {
			log.Println("Seeded admin user: username=admin01, password=bionet123, role=admin")
		}
	}

	// 3. Seed Gudang: gudang01
	var gudangUser models.User
	if err := config.DB.Where("username = ?", "gudang01").First(&gudangUser).Error; err != nil {
		gudangUser = models.User{
			ID:           uuid.New().String(),
			Username:     "gudang01",
			FullName:     "Staff Gudang & Logistik",
			PasswordHash: string(hashedPassword),
			Role:         "gudang",
			Status:       "active",
		}
		if err := config.DB.Create(&gudangUser).Error; err == nil {
			log.Println("Seeded warehouse user: username=gudang01, password=bionet123, role=gudang")
		}
	}

	// 4. Seed Keuangan: finance01
	var financeUser models.User
	if err := config.DB.Where("username = ?", "finance01").First(&financeUser).Error; err != nil {
		financeUser = models.User{
			ID:           uuid.New().String(),
			Username:     "finance01",
			FullName:     "Tim Keuangan & Kasir Bionet",
			PasswordHash: string(hashedPassword),
			Role:         "keuangan",
			Status:       "active",
		}
		if err := config.DB.Create(&financeUser).Error; err == nil {
			log.Println("Seeded finance user: username=finance01, password=bionet123, role=keuangan")
		}
	}

	// 5. Seed Customer Service: cs01
	var csUser models.User
	if err := config.DB.Where("username = ?", "cs01").First(&csUser).Error; err != nil {
		csUser = models.User{
			ID:           uuid.New().String(),
			Username:     "cs01",
			FullName:     "Layanan Pelanggan & CS Bionet",
			PasswordHash: string(hashedPassword),
			Role:         "cs",
			Status:       "active",
		}
		if err := config.DB.Create(&csUser).Error; err == nil {
			log.Println("Seeded CS user: username=cs01, password=bionet123, role=cs")
		}
	}

	// Seed Member: mitra02 & mitra03
	var mitra02 models.User
	if err := config.DB.Where("username = ?", "mitra02").First(&mitra02).Error; err != nil {
		mitra02 = models.User{
			ID:           uuid.New().String(),
			Username:     "mitra02",
			FullName:     "Ahmad Yani - Leader Gold",
			PasswordHash: string(hashedPassword),
			Role:         "member",
			Status:       "active",
		}
		if err := config.DB.Create(&mitra02).Error; err == nil {
			config.DB.Create(&models.Wallet{
				ID:      uuid.New().String(),
				UserID:  mitra02.ID,
				Balance: 4250000.00,
			})
			config.DB.Create(&models.PointBalance{
				ID:         uuid.New().String(),
				UserID:     mitra02.ID,
				PointLeft:  210.00,
				PointRight: 185.00,
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitra02.ID,
				Type:         "credit",
				Amount:       300000.00,
				BalanceAfter: 4250000.00,
				Description:  "Bonus Pasangan (Pairing 15 Pasang Kaki Kiri/Kanan)",
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitra02.ID,
				Type:         "credit",
				Amount:       150000.00,
				BalanceAfter: 3950000.00,
				Description:  "Bonus Sponsor Mitra Baru Paket Gold",
			})
		}
	}

	var mitra03 models.User
	if err := config.DB.Where("username = ?", "mitra03").First(&mitra03).Error; err != nil {
		mitra03 = models.User{
			ID:           uuid.New().String(),
			Username:     "mitra03",
			FullName:     "Siti Rahmawati - Diamond Leader",
			PasswordHash: string(hashedPassword),
			Role:         "member",
			Status:       "active",
		}
		if err := config.DB.Create(&mitra03).Error; err == nil {
			config.DB.Create(&models.Wallet{
				ID:      uuid.New().String(),
				UserID:  mitra03.ID,
				Balance: 7800000.00,
			})
			config.DB.Create(&models.PointBalance{
				ID:         uuid.New().String(),
				UserID:     mitra03.ID,
				PointLeft:  450.00,
				PointRight: 490.00,
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitra03.ID,
				Type:         "credit",
				Amount:       600000.00,
				BalanceAfter: 7800000.00,
				Description:  "Bonus Pasangan Harian (30 Pasang Matching Binary)",
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitra03.ID,
				Type:         "debit",
				Amount:       1000000.00,
				BalanceAfter: 7200000.00,
				Description:  "Penarikan Dana / Payout Flip.id ke Bank BCA",
			})
		}
	}

	// Link mitra02 as direct sponsor downline & binary network of mitra01
	if mitraUser.ID != "" && mitra02.ID != "" {
		var spCount int64
		config.DB.Model(&models.Sponsor{}).Where("user_id = ?", mitra02.ID).Count(&spCount)
		if spCount == 0 {
			config.DB.Create(&models.Sponsor{
				ID:        uuid.New().String(),
				UserID:    mitra02.ID,
				SponsorID: mitraUser.ID,
			})
			config.DB.Create(&models.SponsorPath{
				ID:           uuid.New().String(),
				AncestorID:   mitraUser.ID,
				DescendantID: mitra02.ID,
				Level:        1,
			})
			config.DB.Create(&models.NetworkPosition{
				ID:       uuid.New().String(),
				UserID:   mitra02.ID,
				UplineID: mitraUser.ID,
				Position: "kiri",
			})
			config.DB.Create(&models.UplinePath{
				ID:           uuid.New().String(),
				AncestorID:   mitraUser.ID,
				DescendantID: mitra02.ID,
				Level:        1,
			})
		}
	}

	var countTx int64
	config.DB.Model(&models.WalletTransaction{}).Count(&countTx)
	if countTx <= 3 {
		if err := config.DB.Where("username = ?", "mitra01").First(&mitraUser).Error; err == nil {
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitraUser.ID,
				Type:         "credit",
				Amount:       150000.00,
				BalanceAfter: 2250000.00,
				Description:  "Bonus Sponsor Mitra Baru (Paket Gold 3 HU)",
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitraUser.ID,
				Type:         "credit",
				Amount:       350000.00,
				BalanceAfter: 2600000.00,
				Description:  "Bonus Pasangan (Pairing 10 Pasang Kiri & Kanan)",
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       mitraUser.ID,
				Type:         "debit",
				Amount:       250000.00,
				BalanceAfter: 2350000.00,
				Description:  "Penarikan Dana / Payout Flip.id ke Rekening Mitra",
			})
		}
	}

	// 4. Seed PIN Packages & Pins
	var pkgCount int64
	config.DB.Model(&models.PinPackage{}).Count(&pkgCount)
	if pkgCount == 0 {
		silverPkg := models.PinPackage{
			ID:           uuid.New().String(),
			Name:         "Paket Silver (1 HU)",
			Price:        250000.00,
			SponsorBonus: 50000.00,
			PairingBonus: 20000.00,
			Points:       1.00,
			IsActive:     true,
		}
		config.DB.Create(&silverPkg)

		goldPkg := models.PinPackage{
			ID:           uuid.New().String(),
			Name:         "Paket Gold (3 HU)",
			Price:        750000.00,
			SponsorBonus: 150000.00,
			PairingBonus: 60000.00,
			Points:       3.00,
			IsActive:     true,
		}
		config.DB.Create(&goldPkg)

		if mitraUser.ID != "" {
			config.DB.Create(&models.Pin{
				ID:         uuid.New().String(),
				SerialCode: "PIN-BIO-SILVER-88219",
				PackageID:  silverPkg.ID,
				OwnerID:    mitraUser.ID,
				Status:     "active",
			})
			config.DB.Create(&models.Pin{
				ID:         uuid.New().String(),
				SerialCode: "PIN-BIO-GOLD-99120",
				PackageID:  goldPkg.ID,
				OwnerID:    mitraUser.ID,
				Status:     "active",
			})
		}
	}

	// 5. Seed Products
	var productCount int64
	config.DB.Model(&models.Product{}).Count(&productCount)
	if productCount == 0 {
		prod1 := models.Product{
			ID:          uuid.New().String(),
			Name:        "Bionet Bio-Herbal Drops 30ml",
			Description: "Konsentrat herbal tetes kaya antioksidan dan mineral alami untuk meningkatkan daya tahan tubuh.",
			Price:       150000.00,
			Cogs:        85000.00,
			Stock:       150,
			IsActive:    true,
		}
		config.DB.Create(&prod1)

		prod2 := models.Product{
			ID:          uuid.New().String(),
			Name:        "Bionet Propolis Premium Pure",
			Description: "Ekstrak propolis murni lebah trigona tanpa alkohol untuk vitalitas dan peremajaan sel.",
			Price:       220000.00,
			Cogs:        120000.00,
			Stock:       80,
			IsActive:    true,
		}
		config.DB.Create(&prod2)

		prod3 := models.Product{
			ID:          uuid.New().String(),
			Name:        "Bionet Bio-Energy Refresh Spray 100ml",
			Description: "Spray ion energi bio-aktif untuk kesegaran kulit dan relaksasi aura kemitraan.",
			Price:       110000.00,
			Cogs:        60000.00,
			Stock:       15, // Low stock demo
			IsActive:    true,
		}
		config.DB.Create(&prod3)

		// Seed dummy order for Gudang demo
		if mitraUser.ID != "" {
			orderDemo := models.Order{
				ID:          uuid.New().String(),
				UserID:      mitraUser.ID,
				OrderNumber: fmt.Sprintf("RO-BIO-%d", time.Now().Unix()),
				TotalAmount: 370000.00,
				Status:      "processing",
			}
			config.DB.Create(&orderDemo)
			config.DB.Create(&models.OrderItem{
				ID:          uuid.New().String(),
				OrderID:     orderDemo.ID,
				ProductID:   prod1.ID,
				Quantity:    1,
				PriceAtTime: prod1.Price,
			})
			config.DB.Create(&models.OrderItem{
				ID:          uuid.New().String(),
				OrderID:     orderDemo.ID,
				ProductID:   prod2.ID,
				Quantity:    1,
				PriceAtTime: prod2.Price,
			})
		}
	}

	// 6. Seed Master Menus & Dynamic Role Permissions
	var menuCount int64
	config.DB.Model(&models.AppMenu{}).Count(&menuCount)
	if menuCount == 0 {
		initialMenus := []models.AppMenu{
			// Admin Menus
			{ID: uuid.New().String(), MenuKey: "admin-overview", Title: "Overview Admin", Description: "Ringkasan eksekutif omset & metrik global", Category: "Admin", IconName: "LayoutDashboard", OrderIndex: 1},
			{ID: uuid.New().String(), MenuKey: "admin-users", Title: "Manajemen Pengguna & RBAC", Description: "Direktori akun, alokasi role & status suspend", Category: "Admin", IconName: "Users", OrderIndex: 2},
			{ID: uuid.New().String(), MenuKey: "admin-transactions", Title: "Buku Besar & Bonus Pasangan", Description: "Audit mutasi saldo & komisi pairing global", Category: "Admin", IconName: "Wallet", OrderIndex: 3},
			{ID: uuid.New().String(), MenuKey: "admin-points", Title: "Poin Pasangan Binary", Description: "Volume poin kaki kiri/kanan & adjust poin", Category: "Admin", IconName: "GitFork", OrderIndex: 4},
			{ID: uuid.New().String(), MenuKey: "admin-pins", Title: "Stokis & Serial PIN", Description: "Master inventori PIN lisensi & log mutasi", Category: "Admin", IconName: "KeyRound", OrderIndex: 5},
			{ID: uuid.New().String(), MenuKey: "admin-orders", Title: "Pesanan RO E-Commerce", Description: "Faktur repeat order produk & override status", Category: "Admin", IconName: "ShoppingBag", OrderIndex: 6},
			{ID: uuid.New().String(), MenuKey: "admin-withdrawals", Title: "Pencairan Dana (WD)", Description: "Approval penarikan saldo Flip.id mitra", Category: "Admin", IconName: "Landmark", OrderIndex: 7},

			// Warehouse Menus
			{ID: uuid.New().String(), MenuKey: "warehouse-overview", Title: "Portal Logistik Gudang", Description: "Status fisik stok produk & antrean order", Category: "Logistik", IconName: "Building2", OrderIndex: 8},
			{ID: uuid.New().String(), MenuKey: "warehouse-inventory", Title: "Inventori & Restock", Description: "Katalog stok fisik & penambahan barang masuk", Category: "Logistik", IconName: "Layers", OrderIndex: 9},
			{ID: uuid.New().String(), MenuKey: "warehouse-orders", Title: "Pemrosesan Pesanan RO", Description: "Fulfillment packing & nomor resi ekspedisi", Category: "Logistik", IconName: "Truck", OrderIndex: 10},

			// Member Menus
			{ID: uuid.New().String(), MenuKey: "overview", Title: "Overview & Sales", Description: "KPI saldo, omset harian & rasio pairing", Category: "Member", IconName: "LayoutDashboard", OrderIndex: 11},
			{ID: uuid.New().String(), MenuKey: "genealogy", Title: "Jaringan & Pohon Binary", Description: "Visualizer pohon binary 3 generasi kemitraan", Category: "Member", IconName: "GitFork", OrderIndex: 12},
			{ID: uuid.New().String(), MenuKey: "referrals", Title: "Direct Sponsor", Description: "Daftar mitra referral binaan langsung", Category: "Member", IconName: "Users", OrderIndex: 13},
			{ID: uuid.New().String(), MenuKey: "withdrawal", Title: "Pencairan Dana (WD)", Description: "Pengajuan penarikan dana harian otomatis", Category: "Member", IconName: "Landmark", OrderIndex: 14},
			{ID: uuid.New().String(), MenuKey: "transactions", Title: "Buku Besar Mutasi", Description: "Riwayat mutasi saldo kredit & debit", Category: "Member", IconName: "Wallet", OrderIndex: 15},
			{ID: uuid.New().String(), MenuKey: "pins", Title: "Stokis & Serial PIN", Description: "Stok PIN aktif & transfer lisensi ke downline", Category: "Member", IconName: "KeyRound", OrderIndex: 16},
			{ID: uuid.New().String(), MenuKey: "products", Title: "Katalog Produk Herbal (RO)", Description: "Katalog produk herbal BPOM untuk repeat order", Category: "Member", IconName: "ShoppingBag", OrderIndex: 17},
			{ID: uuid.New().String(), MenuKey: "bank", Title: "Rekening Bank Mitra", Description: "Pengaturan rekening bank tujuan pencairan", Category: "Member", IconName: "Building2", OrderIndex: 18},
			{ID: uuid.New().String(), MenuKey: "meetings", Title: "Video Conference & BOP", Description: "Ruang webinar BOP, Video KYC & live meeting", Category: "Komunikasi", IconName: "Video", OrderIndex: 18},
			{ID: uuid.New().String(), MenuKey: "chat", Title: "Live Chat Bantuan", Description: "Pusat bantuan & komunikasi interaktif mitra, CS & admin", Category: "Komunikasi", IconName: "MessagesSquare", OrderIndex: 19},
			{ID: uuid.New().String(), MenuKey: "components", Title: "Galeri Komponen DashLite", Description: "UI Kit & dokumentasi sistem desain", Category: "Core", IconName: "Palette", OrderIndex: 20},
		}

		for _, m := range initialMenus {
			config.DB.Create(&m)
		}

		// Initial role permissions
		adminMenus := []string{"admin-overview", "admin-users", "admin-transactions", "admin-points", "admin-pins", "admin-orders", "admin-withdrawals", "overview", "chat", "components"}
		for _, k := range adminMenus {
			config.DB.Create(&models.RoleMenuPermission{
				ID: uuid.New().String(), Role: "admin", MenuKey: k, IsEnabled: true,
			})
		}

		keuanganMenus := []string{"admin-overview", "admin-transactions", "admin-withdrawals", "overview", "chat"}
		for _, k := range keuanganMenus {
			config.DB.Create(&models.RoleMenuPermission{
				ID: uuid.New().String(), Role: "keuangan", MenuKey: k, IsEnabled: true,
			})
		}

		csMenus := []string{"admin-overview", "admin-users", "chat", "overview"}
		for _, k := range csMenus {
			config.DB.Create(&models.RoleMenuPermission{
				ID: uuid.New().String(), Role: "cs", MenuKey: k, IsEnabled: true,
			})
		}

		gudangMenus := []string{"warehouse-overview", "warehouse-inventory", "warehouse-orders", "products"}
		for _, k := range gudangMenus {
			config.DB.Create(&models.RoleMenuPermission{
				ID: uuid.New().String(), Role: "gudang", MenuKey: k, IsEnabled: true,
			})
		}

		memberMenus := []string{"overview", "genealogy", "referrals", "withdrawal", "transactions", "pins", "products", "bank", "chat", "components"}
		for _, k := range memberMenus {
			config.DB.Create(&models.RoleMenuPermission{
				ID: uuid.New().String(), Role: "member", MenuKey: k, IsEnabled: true,
			})
		}
	} else {
		// Ensure chat menu exists if DB was already seeded
		var chatMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "chat").First(&chatMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "chat",
				Title:       "Live Chat Bantuan",
				Description: "Pusat bantuan & komunikasi interaktif mitra, CS & admin",
				Category:    "Komunikasi",
				IconName:    "MessagesSquare",
				OrderIndex:  19,
			})
		}

		// Ensure admin-fraud menu exists if DB was already seeded
		var fraudMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "admin-fraud").First(&fraudMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "admin-fraud",
				Title:       "Fraud Control & Risiko",
				Description: "Pusat deteksi kecurangan, duplikasi identitas/bank & spike penarikan",
				Category:    "Admin",
				IconName:    "ShieldAlert",
				OrderIndex:  7,
			})
			for _, r := range []string{"admin", "keuangan"} {
				config.DB.Create(&models.RoleMenuPermission{
					ID: uuid.New().String(), Role: r, MenuKey: "admin-fraud", IsEnabled: true,
				})
			}
		}

		// Ensure permissions for keuangan and cs
		for _, roleKey := range []struct {
			role  string
			menus []string
		}{
			{role: "keuangan", menus: []string{"admin-overview", "admin-transactions", "admin-withdrawals", "overview", "chat"}},
			{role: "cs", menus: []string{"admin-overview", "admin-users", "chat", "overview"}},
		} {
			var cnt int64
			config.DB.Model(&models.RoleMenuPermission{}).Where("role = ?", roleKey.role).Count(&cnt)
			if cnt == 0 {
				for _, m := range roleKey.menus {
					config.DB.Create(&models.RoleMenuPermission{
						ID: uuid.New().String(), Role: roleKey.role, MenuKey: m, IsEnabled: true,
					})
				}
			}
		}

		// Ensure chat permission exists for admin and member
		for _, r := range []string{"admin", "member"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "chat").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID: uuid.New().String(), Role: r, MenuKey: "chat", IsEnabled: true,
				})
			}
		}

		// Ensure meetings menu & permissions exist
		var meetingMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "meetings").First(&meetingMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "meetings",
				Title:       "Video Conference & BOP",
				Description: "Ruang webinar BOP, Video KYC & live meeting",
				Category:    "Komunikasi",
				IconName:    "Video",
				OrderIndex:  18,
			})
		}
		for _, r := range []string{"admin", "member", "cs", "keuangan"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "meetings").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID:        uuid.New().String(),
					Role:      r,
					MenuKey:   "meetings",
					IsEnabled: true,
				})
			}
		}

		// Ensure leads CRM & AI Marketing menus exist
		var leadsMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "leads").First(&leadsMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "leads",
				Title:       "Prospek & Leads (CRM)",
				Description: "Manajemen calon mitra, status follow-up & konversi",
				Category:    "Bisnis",
				IconName:    "UserCheck",
				OrderIndex:  12,
			})
		}
		for _, r := range []string{"admin", "member", "cs"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "leads").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID:        uuid.New().String(),
					Role:      r,
					MenuKey:   "leads",
					IsEnabled: true,
				})
			}
		}

		var aiMarketingMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "ai-marketing").First(&aiMarketingMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "ai-marketing",
				Title:       "Studio Konten AI",
				Description: "Generator materi promosi WhatsApp, IG & TikTok otomatis",
				Category:    "Bisnis",
				IconName:    "Sparkles",
				OrderIndex:  13,
			})
		}
		for _, r := range []string{"admin", "member", "cs"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "ai-marketing").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID:        uuid.New().String(),
					Role:      r,
					MenuKey:   "ai-marketing",
					IsEnabled: true,
				})
			}
		}

		// Ensure admin-monitoring menu & permissions exist
		var monitoringMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "admin-monitoring").First(&monitoringMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "admin-monitoring",
				Title:       "Live Telemetry & User",
				Description: "Monitoring realtime user aktif, RAM server & traffic jaringan",
				Category:    "Admin",
				IconName:    "Activity",
				OrderIndex:  8,
			})
		}
		for _, r := range []string{"admin", "keuangan"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "admin-monitoring").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID:        uuid.New().String(),
					Role:      r,
					MenuKey:   "admin-monitoring",
					IsEnabled: true,
				})
			}
		}

		// Ensure admin-guide menu & permissions exist
		var guideMenu models.AppMenu
		if err := config.DB.Where("menu_key = ?", "admin-guide").First(&guideMenu).Error; err != nil {
			config.DB.Create(&models.AppMenu{
				ID:          uuid.New().String(),
				MenuKey:     "admin-guide",
				Title:       "Panduan Fitur & Menu",
				Description: "Penjelasan semua fitur & menu aplikasi",
				Category:    "Bantuan",
				IconName:    "BookOpen",
				OrderIndex:  21,
			})
		}
		for _, r := range []string{"admin", "keuangan", "cs", "gudang", "member"} {
			var p models.RoleMenuPermission
			if err := config.DB.Where("role = ? AND menu_key = ?", r, "admin-guide").First(&p).Error; err != nil {
				config.DB.Create(&models.RoleMenuPermission{
					ID:        uuid.New().String(),
					Role:      r,
					MenuKey:   "admin-guide",
					IsEnabled: true,
				})
			}
		}
	}

	// Seed demo notifications & chats for rich first experience across roles
	var anyMitra models.User
	var anyAdmin models.User
	var anyFinance models.User
	var anyCS models.User
	config.DB.Where("username = ?", "mitra01").First(&anyMitra)
	config.DB.Where("username = ?", "admin01").First(&anyAdmin)
	config.DB.Where("username = ?", "finance01").First(&anyFinance)
	config.DB.Where("username = ?", "cs01").First(&anyCS)

	if anyMitra.ID != "" {
		var cnt int64
		config.DB.Model(&models.Notification{}).Where("user_id = ?", anyMitra.ID).Count(&cnt)
		if cnt == 0 {
			_ = handlers.CreateNotification(
				anyMitra.ID,
				"Bonus Pasangan Cair!",
				"Bonus pairing binary sebesar Rp 350.000 (10 pasang) telah berhasil ditambahkan ke saldo dompet Anda.",
				"transaction",
				"/transactions",
			)
			_ = handlers.CreateNotification(
				anyMitra.ID,
				"Bonus Sponsor Diterima",
				"Anda menerima bonus sponsor senilai Rp 150.000 atas pendaftaran mitra baru @mitra02.",
				"transaction",
				"/transactions",
			)
			_ = handlers.CreateNotification(
				anyMitra.ID,
				"Pengajuan Penarikan Saldo",
				"Pengajuan penarikan dana sebesar Rp 250.000 telah masuk antrean proses payout.",
				"transaction",
				"/withdrawal",
			)
			_ = handlers.CreateNotification(
				anyMitra.ID,
				"Pesan Baru dari Layanan Pelanggan (CS)",
				"Halo Mitra Bionet, selamat datang di layanan bantuan resmi Bionet! Silakan hubungi kami jika ada kendala.",
				"chat",
				"/chat",
			)
		}
	}

	if anyCS.ID != "" {
		var cnt int64
		config.DB.Model(&models.Notification{}).Where("user_id = ?", anyCS.ID).Count(&cnt)
		if cnt == 0 {
			_ = handlers.CreateNotification(
				anyCS.ID,
				"Pesan Bantuan Baru dari Mitra @mitra01",
				"Halo CS Bionet, bagaimana cara mengecek sisa kuota pairing harian paket saya?",
				"chat",
				"/chat",
			)
			_ = handlers.CreateNotification(
				anyCS.ID,
				"Pesan Masuk dari Mitra @mitra02",
				"Selamat pagi CS, mohon verifikasi transaksi transfer PIN aktivasi saya.",
				"chat",
				"/chat",
			)
		}
	}

	if anyAdmin.ID != "" {
		var cnt int64
		config.DB.Model(&models.Notification{}).Where("user_id = ?", anyAdmin.ID).Count(&cnt)
		if cnt == 0 {
			_ = handlers.CreateNotification(
				anyAdmin.ID,
				"Pengajuan Withdrawal Baru",
				"Mitra @mitra01 mengajukan penarikan dana sebesar Rp 250.000 ke rekening BCA.",
				"transaction",
				"/admin-withdrawals",
			)
			_ = handlers.CreateNotification(
				anyAdmin.ID,
				"Pesan Masuk Layanan Support",
				"Mitra @mitra01 mengirimkan pesan bantuan di helpdesk live chat.",
				"chat",
				"/chat",
			)
		}
	}

	if anyFinance.ID != "" {
		var cnt int64
		config.DB.Model(&models.Notification{}).Where("user_id = ?", anyFinance.ID).Count(&cnt)
		if cnt == 0 {
			_ = handlers.CreateNotification(
				anyFinance.ID,
				"Pengajuan Payout Withdrawal",
				"Mitra @mitra01 mengajukan penarikan saldo sebesar Rp 250.000 membutuhkan approval transfer Flip.id.",
				"transaction",
				"/admin-withdrawals",
			)
			_ = handlers.CreateNotification(
				anyFinance.ID,
				"Rekapitulasi Mutasi Kredit",
				"Total pencairan bonus kemitraan periode minggu ini siap direkonsiliasi.",
				"transaction",
				"/admin-transactions",
			)
		}
	}

	// Seed demo chat messages if table empty
	var chatCount int64
	config.DB.Model(&models.ChatMessage{}).Count(&chatCount)
	if chatCount == 0 && anyMitra.ID != "" && anyCS.ID != "" {
		// Message from CS to Mitra
		config.DB.Create(&models.ChatMessage{
			ID:         uuid.New().String(),
			SenderID:   anyCS.ID,
			ReceiverID: anyMitra.ID,
			Room:       "support-" + anyMitra.ID,
			Message:    "Halo Bapak/Ibu Mitra Bionet! Selamat datang di layanan bantuan resmi Bionet. Apakah ada yang bisa kami bantu seputar aktivasi PIN atau mutasi bonus?",
			IsRead:     false,
		})
		// Message from Mitra to CS
		config.DB.Create(&models.ChatMessage{
			ID:         uuid.New().String(),
			SenderID:   anyMitra.ID,
			ReceiverID: anyCS.ID,
			Room:       "support-" + anyMitra.ID,
			Message:    "Halo CS Bionet, bagaimana cara mengecek sisa kuota pairing harian paket saya?",
			IsRead:     false,
		})
	}
}

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using system environment variables")
	}

	// Initialize Database
	config.ConnectDatabase()

	// AutoMigrate all 100% UUID tables sequentially
	allModels := []interface{}{
		&models.User{},
		&models.UserBank{},
		&models.UserAddress{},
		&models.Wallet{},
		&models.WalletTransaction{},
		&models.PointBalance{},
		&models.Withdrawal{},
		&models.PinPackage{},
		&models.Pin{},
		&models.PinTransfer{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.Sponsor{},
		&models.NetworkPosition{},
		&models.UplinePath{},
		&models.SponsorPath{},
		&models.AppMenu{},
		&models.RoleMenuPermission{},
		&models.ChatMessage{},
		&models.Notification{},
		&models.AuditLog{},
		&models.FraudCase{},
		&models.Meeting{},
		&models.MeetingAttendee{},
		&models.MeetingParticipant{},
		&models.Lead{},
		&models.CustomerHealthRecord{},
		&models.TestimonialItem{},
		&models.Certificate{},
		&models.PushSubscription{},
		&models.BioPage{},
		&models.AcademyCompletion{},
		&models.WhatsAppSchedule{},
		&models.SecurityThreatLog{},
		&models.BlockedIP{},
		&models.GeoAccessLog{},
	}
	for _, m := range allModels {
		if err := config.DB.AutoMigrate(m); err != nil {
			log.Printf("AutoMigrate notice for %T: %v", m, err)
		}
	}

	// Ensure wallet_transactions has created_at column in MySQL
	var colCount int64
	config.DB.Raw("SELECT count(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'wallet_transactions' AND COLUMN_NAME = 'created_at'").Scan(&colCount)
	if colCount == 0 {
		if err := config.DB.Exec("ALTER TABLE wallet_transactions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP").Error; err != nil {
			log.Println("Notice adding created_at to wallet_transactions:", err)
		} else {
			log.Println("Successfully added missing created_at column to wallet_transactions table")
		}
	}

	// Seed demo data
	seedDefaultData()

	// Dependency Injection Setup
	authRepo := repositories.NewAuthRepository(config.DB)
	authService := services.NewAuthService(authRepo)
	authHandler := handlers.NewAuthHandler(authService, authRepo)

	dashboardRepo := repositories.NewDashboardRepository(config.DB)
	dashboardService := services.NewDashboardService(dashboardRepo)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)

	adminHandler := handlers.NewAdminHandler()
	fraudHandler := handlers.NewFraudHandler()
	warehouseHandler := handlers.NewWarehouseHandler()
	rbacHandler := handlers.NewRBACHandler()
	chatHandler := handlers.NewChatHandler()
	notificationHandler := handlers.NewNotificationHandler()

	regionHandler := handlers.NewRegionHandler()
	monitoringHandler := handlers.NewMonitoringHandler()
	meetingHandler := handlers.NewMeetingHandler()
	leadHandler := handlers.NewLeadHandler()
	verificationHandler := handlers.NewVerificationHandler()
	crmHandler := handlers.NewCRMHandler()
	prospectingHandler := handlers.NewProspectingHandler()
	bioLinkHandler := handlers.NewBioLinkHandler()
	marketingHandler := handlers.NewMarketingHandler()
	gamificationHandler := handlers.NewGamificationHandler()
	aiHandler := handlers.NewAIHandler()
	securityHandler := handlers.NewSecurityHandler()

	// Initialize Google Gemini AI Service
	if _, err := services.NewGeminiService(); err != nil {
		log.Printf("[Notice] GeminiService init: %v", err)
	}

	// Initialize Telegram Bot Service (Starts background polling if token is set)
	telegramSvc := services.NewTelegramService()
	telegramSvc.StartBotListener(context.Background())

	// Initialize Gin Router
	r := gin.Default()

	// Enable CORS
	r.Use(middleware.CORSMiddleware())

	// Real-time Traffic & Bandwidth Monitoring Middleware
	r.Use(middleware.TrafficMonitorMiddleware())

	// Enterprise Security Shield Middleware (Flooding, SQLi, XSS, Path Traversal, Brute-Force & GeoIP Tracker)
	r.Use(middleware.SecurityGuardMiddleware())

	// Static files serving for chat attachments & avatars
	r.Static("/uploads", "./uploads")

	// Native WebRTC Video Conference Signaling WebSocket Hub
	r.GET("/ws/meetings/:room_id", meetingHandler.MeetingSignalingHandler)

	// Public Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "success",
				"message": "pong from Bionet Backend API (Golang Gin - UUID Refactored & RBAC Ready)",
			})
		})

		// Wilayah Indonesia API (indonesia_kode & wilayahindonesia)
		api.GET("/regions/provinces", regionHandler.GetProvinces)
		api.GET("/regions/regencies", regionHandler.GetRegencies)
		api.GET("/regions/districts", regionHandler.GetDistricts)
		api.GET("/regions/search", regionHandler.SearchRegions)

		// Public Video Conference & Webinar Guest Access (BOP, KYC, Herbal)
		api.GET("/public/meetings/:room_id", meetingHandler.GetPublicMeeting)
		api.POST("/public/meetings/:room_id/register", meetingHandler.RegisterPublicAttendee)
		api.GET("/public/meetings/:room_id/participants", meetingHandler.GetMeetingParticipants)
		api.POST("/public/leads", leadHandler.PublicCaptureLead)
		api.POST("/public/leads/webhook", crmHandler.PublicLeadWebhook)
		api.POST("/public/whatsapp/webhook", crmHandler.WhatsAppWebhookListener)
		api.POST("/crm/whatsapp/webhook", crmHandler.WhatsAppWebhookListener)

		// Pilar 1: Pemasaran & AI Growth Engine - Public Bio-Link & Marketing
		api.GET("/bio/:username", bioLinkHandler.GetPublicBioPage)
		api.POST("/bio/lead", bioLinkHandler.SubmitBioLead)
		api.GET("/marketing/kits", marketingHandler.GetMarketingKits)
		api.GET("/marketing/webinars", marketingHandler.GetWebinars)
		api.POST("/marketing/webinars/register", marketingHandler.RegisterWebinar)

		// Pilar 2: Gamifikasi - Public Leaderboard Access
		api.GET("/gamification/leaderboard", gamificationHandler.GetLeaderboard)

		// Public Verification (Module 5: Digital ID & Certificate Verification)
		api.GET("/public/verify/member/:id", verificationHandler.VerifyMember)
		api.GET("/public/verify/certificate/:cert_no", verificationHandler.VerifyCertificate)

		// Public Prospecting Simulation (Module 4)
		api.POST("/prospecting/simulate", prospectingHandler.Simulate)

		// Public PWA Web Push Public Key (Module 7)
		api.GET("/public/push/public-key", prospectingHandler.GetVapidPublicKey)

		// Gemini AI Assistant Endpoint
		api.POST("/ai/chat", func(c *gin.Context) {
			var req struct {
				Prompt string `json:"prompt" binding:"required"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"status": "error", "message": "prompt is required"})
				return
			}
			if services.GlobalGeminiService == nil {
				c.JSON(503, gin.H{"status": "error", "message": "Gemini AI service is not initialized"})
				return
			}
			reply, err := services.GlobalGeminiService.ProcessBionetAssistant(c.Request.Context(), "Web User", "guest", req.Prompt, "Bionet Web API")
			if err != nil {
				c.JSON(500, gin.H{"status": "error", "message": err.Error()})
				return
			}
			c.JSON(200, gin.H{"status": "success", "reply": reply})
		})

		// ==============================================
		// BIONET AI SUITE: 8 Core AI Capabilities
		// ==============================================
		api.POST("/ai/health-consult", aiHandler.HealthConsult)
		api.POST("/ai/objection-handler", aiHandler.ObjectionHandler)
		api.GET("/ai/binary-advisor", aiHandler.BinaryAdvisor)
		api.POST("/ai/generate-copywriting", aiHandler.GenerateCopywriting)
		api.GET("/ai/churn-radar", aiHandler.ChurnRadar)
		api.POST("/ai/voice-note", aiHandler.VoiceNoteScript)
		api.POST("/ai/fraud-scan", aiHandler.FraudScan)
		api.GET("/ai/ro-retention", aiHandler.RORetention)

		// Auth
		api.POST("/auth/login", authHandler.Login)

		// Protected Routes (Semua user yang telah login)
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/me", authHandler.GetMe)
			protected.PUT("/dashboard/profile", dashboardHandler.UpdateProfile)
			protected.PUT("/dashboard/password", dashboardHandler.UpdatePassword)
			protected.GET("/dashboard/address", dashboardHandler.GetUserAddress)
			protected.PUT("/dashboard/address", dashboardHandler.UpdateUserAddress)
			protected.GET("/dashboard/recent-members", dashboardHandler.GetRecentMembers)
			protected.GET("/dashboard/stats", dashboardHandler.GetStats)
			protected.GET("/dashboard/genealogy", dashboardHandler.GetGenealogy)
			protected.GET("/dashboard/referrals", dashboardHandler.GetDirectReferrals)
			protected.GET("/dashboard/transactions", dashboardHandler.GetWalletTransactions)
			protected.GET("/dashboard/bank", dashboardHandler.GetUserBank)
			protected.POST("/dashboard/bank", dashboardHandler.SaveUserBank)

			// Multi-Bank Management (Tambah, List, Default, Hapus)
			protected.GET("/dashboard/banks", dashboardHandler.GetUserBanks)
			protected.POST("/dashboard/banks", dashboardHandler.AddUserBank)
			protected.PATCH("/dashboard/banks/:id/default", dashboardHandler.SetDefaultBank)
			protected.DELETE("/dashboard/banks/:id", dashboardHandler.DeleteUserBank)

			// Withdrawals
			protected.POST("/dashboard/withdrawals", dashboardHandler.RequestWithdrawal)
			protected.GET("/dashboard/withdrawals", dashboardHandler.GetWithdrawals)

			// PINs & Stokis
			protected.GET("/pins/my-pins", dashboardHandler.GetMyPins)
			protected.GET("/pins/packages", dashboardHandler.GetPinPackages)
			protected.POST("/pins/transfer", dashboardHandler.TransferPin)
			protected.POST("/pins/register-downline", dashboardHandler.RegisterDownline)

			// Products
			protected.GET("/products", dashboardHandler.GetProducts)

			// Dynamic RBAC Menu for Current User
			protected.GET("/rbac/my-menus", rbacHandler.GetMyMenus)

			// Notifications (Semua User: Mitra, Admin, CS, Keuangan)
			protected.GET("/notifications", notificationHandler.GetNotifications)
			protected.PATCH("/notifications/:id/read", notificationHandler.MarkAsRead)
			protected.PATCH("/notifications/read-all", notificationHandler.MarkAllAsRead)
			protected.GET("/notifications/unread-count", notificationHandler.GetUnreadCount)

			// Live Chat (Mitra, Admin, Customer Service)
			protected.GET("/chat/messages", chatHandler.GetMessages)
			protected.POST("/chat/messages", chatHandler.SendMessage)
			protected.POST("/chat/upload", chatHandler.UploadAttachment)
			protected.GET("/chat/conversations", chatHandler.GetConversations)
			protected.PATCH("/chat/read", chatHandler.MarkRead)
			protected.GET("/chat/unread-count", chatHandler.GetUnreadCount)

			// Heartbeat & Online Presence Tracking (Semua user)
			protected.POST("/user/heartbeat", monitoringHandler.UserHeartbeat)
			protected.POST("/user/logout-ping", monitoringHandler.UserLogoutPing)

			// Video Conference & Webinars (BOP, KYC, Herbal Consultation)
			protected.GET("/meetings", meetingHandler.GetMeetings)
			protected.POST("/meetings", meetingHandler.CreateMeeting)
			protected.GET("/meetings/:room_id", meetingHandler.GetMeetingByRoom)
			protected.PUT("/meetings/:room_id", meetingHandler.UpdateMeeting)
			protected.DELETE("/meetings/:room_id", meetingHandler.DeleteMeeting)
			protected.POST("/meetings/:room_id/end", meetingHandler.EndMeeting)
			protected.GET("/meetings/:room_id/attendees", meetingHandler.GetMeetingAttendees)
			protected.POST("/meetings/:room_id/join", meetingHandler.JoinMeetingRoom)
			protected.POST("/meetings/:room_id/leave", meetingHandler.LeaveMeetingRoom)
			protected.POST("/meetings/:room_id/heartbeat", meetingHandler.HeartbeatMeeting)
			protected.GET("/meetings/:room_id/participants", meetingHandler.GetMeetingParticipants)
			protected.POST("/meetings/:room_id/recordings", meetingHandler.UploadRecording)

			// CRM & Leads Pipeline (Poin 5 di Roadmap)
			protected.GET("/leads", leadHandler.GetLeads)
			protected.POST("/leads", leadHandler.CreateLead)
			protected.PUT("/leads/:id", leadHandler.UpdateLead)
			protected.DELETE("/leads/:id", leadHandler.DeleteLead)
			protected.POST("/leads/:id/ai-followup", leadHandler.GenerateLeadFollowUpAI)

			// AI Marketing & Sales Copywriting Studio (Poin 1 di Roadmap)
			protected.POST("/ai/marketing/generate", middleware.RequireRole("admin"), leadHandler.GenerateMarketingCopyAI)

			// Smart RO Reminder & Customer CRM (Module 6)
			protected.GET("/crm/ro-reminders", crmHandler.GetROReminders)
			protected.POST("/crm/ro-reminders/log", crmHandler.LogFollowUp)

			// Expanded CRM: Health Tracker, AI Objection Handler, Kanban, Testimonials
			protected.GET("/crm/health-records", crmHandler.GetHealthRecords)
			protected.POST("/crm/health-records", crmHandler.SaveHealthRecord)
			protected.PUT("/crm/health-records/:id/milestone", crmHandler.UpdateHealthMilestone)
			protected.POST("/crm/ai/objection-handler", crmHandler.HandleObjectionAI)
			protected.PUT("/crm/leads/:id/status", crmHandler.UpdateLeadStatus)
			protected.GET("/crm/testimonials", crmHandler.GetTestimonials)

			// WhatsApp Direct Gateway & Live Telemetry Monitoring
			protected.POST("/crm/whatsapp/send-direct", crmHandler.SendDirectWhatsApp)
			protected.GET("/crm/whatsapp/logs", crmHandler.GetWhatsAppGatewayLogs)
			protected.GET("/crm/whatsapp/status", crmHandler.GetWhatsAppGatewayStatus)
			protected.GET("/crm/whatsapp/threads", crmHandler.GetWhatsAppThreads)
			protected.GET("/crm/whatsapp/threads/:id/messages", crmHandler.GetWhatsAppThreadMessages)
			protected.POST("/crm/whatsapp/threads/:id/messages", crmHandler.SendWhatsAppThreadMessage)
			protected.POST("/crm/whatsapp/threads", crmHandler.CreateWhatsAppThread)
			protected.DELETE("/crm/whatsapp/threads/:id", crmHandler.DeleteWhatsAppThread)
			protected.POST("/crm/whatsapp/threads/clear-demo", crmHandler.ClearDemoWhatsAppThreads)
			protected.GET("/crm/whatsapp/broadcasts", crmHandler.GetWhatsAppBroadcasts)
			protected.POST("/crm/whatsapp/broadcasts", crmHandler.CreateWhatsAppBroadcast)
			protected.GET("/crm/whatsapp/bot-rules", crmHandler.GetWhatsAppBotRules)
			protected.POST("/crm/whatsapp/bot-rules", crmHandler.SaveWhatsAppBotRule)
			protected.PATCH("/crm/whatsapp/bot-rules/:id/toggle", crmHandler.ToggleWhatsAppBotRule)
			protected.DELETE("/crm/whatsapp/bot-rules/:id", crmHandler.DeleteWhatsAppBotRule)
			protected.GET("/crm/whatsapp/device", crmHandler.GetWhatsAppDeviceSession)
			protected.POST("/crm/whatsapp/device/pair", crmHandler.PairWhatsAppDevice)
			protected.POST("/crm/whatsapp/device/disconnect", crmHandler.DisconnectWhatsAppDevice)
			protected.POST("/crm/whatsapp/device/toggle-bot", crmHandler.ToggleWhatsAppAutoResponder)

			// Pilar 3: WhatsApp CRM Lanjutan (WAHA Docker Expansion)
			protected.POST("/crm/whatsapp/send-media", crmHandler.SendWhatsAppMedia)
			protected.GET("/crm/whatsapp/schedules", crmHandler.GetWhatsAppSchedules)
			protected.POST("/crm/whatsapp/schedules", crmHandler.CreateWhatsAppSchedule)
			protected.DELETE("/crm/whatsapp/schedules/:id", crmHandler.DeleteWhatsAppSchedule)

			// Pilar 1: Bio-Link & Sales Funnel Builder (Protected Mitra Management)
			protected.GET("/bio/my-page", bioLinkHandler.GetMyBioPage)
			protected.PUT("/bio/my-page", bioLinkHandler.UpdateMyBioPage)

			// Pilar 2: Gamifikasi, Motivasi & Duplikasi Jaringan
			protected.GET("/gamification/reward-progress", gamificationHandler.GetRewardProgress)
			protected.GET("/academy/modules", gamificationHandler.GetAcademyModules)
			protected.POST("/academy/complete", gamificationHandler.CompleteAcademyModule)
			protected.GET("/gamification/inactivity-alerts", gamificationHandler.GetInactivityAlerts)

			// PWA Web Push Notification (Module 7)
			protected.POST("/notifications/push-subscribe", prospectingHandler.SubscribePush)
			protected.GET("/notifications/push-public-key", prospectingHandler.GetVapidPublicKey)
			protected.POST("/notifications/push-test", prospectingHandler.TestPushNotification)

			// ==============================================
			// RBAC: ADMIN & MANAGEMENT ROUTES (Admin, Keuangan, CS)
			// ==============================================
			adminGroup := protected.Group("/admin")
			adminGroup.Use(middleware.RequireRole("admin", "keuangan", "cs"))
			{
				adminGroup.GET("/overview", adminHandler.GetOverview)

				// User Management (Admin & CS can view & edit profile data)
				adminGroup.GET("/users", adminHandler.GetUsers)
				adminGroup.PUT("/users/:id", adminHandler.UpdateUser)

				// Sensitive User actions (Admin Only)
				adminGroup.DELETE("/users/:id", middleware.RequireRole("admin"), adminHandler.DeleteUser)
				adminGroup.PATCH("/users/:id/role", middleware.RequireRole("admin"), adminHandler.UpdateUserRole)
				adminGroup.PATCH("/users/:id/status", middleware.RequireRole("admin"), adminHandler.UpdateUserStatus)
				adminGroup.PATCH("/users/:id/password", middleware.RequireRole("admin"), adminHandler.UpdateUserPassword)

				// RBAC Role-Menu Matrix & Permission Toggles (Admin only)
				adminGroup.GET("/rbac/matrix", middleware.RequireRole("admin"), rbacHandler.GetMatrix)
				adminGroup.POST("/rbac/toggle", middleware.RequireRole("admin"), rbacHandler.TogglePermission)

				// Audit Logs Platform (Admin only)
				adminGroup.GET("/audit-logs", middleware.RequireRole("admin"), adminHandler.GetAuditLogs)

				// Wallet Transactions & Bonus Pasangan Global Ledger (Admin & Keuangan)
				adminGroup.GET("/transactions", middleware.RequireRole("admin", "keuangan"), adminHandler.GetTransactions)

				// Binary Point Balances (Admin only for manual adjust)
				adminGroup.GET("/points", adminHandler.GetPointBalances)
				adminGroup.POST("/points/adjust", middleware.RequireRole("admin"), adminHandler.AdjustPoints)

				// Master Serial PIN & Transfers (Admin only for generation)
				adminGroup.GET("/pins", adminHandler.GetPins)
				adminGroup.GET("/pin-transfers", adminHandler.GetPinTransfers)
				adminGroup.POST("/pins/generate", middleware.RequireRole("admin"), adminHandler.GeneratePins)

				// E-Commerce Orders
				adminGroup.GET("/orders", adminHandler.GetOrders)
				adminGroup.PATCH("/orders/:id/status", middleware.RequireRole("admin", "gudang", "keuangan"), adminHandler.UpdateOrderStatus)

				// Withdrawals Approval (Admin & Keuangan)
				adminGroup.GET("/withdrawals", middleware.RequireRole("admin", "keuangan"), adminHandler.GetWithdrawals)
				adminGroup.PATCH("/withdrawals/:id/status", middleware.RequireRole("admin", "keuangan"), adminHandler.UpdateWithdrawalStatus)

				// Fraud Control & Risk Monitoring (Admin & Keuangan)
				adminGroup.GET("/fraud/overview", middleware.RequireRole("admin", "keuangan"), fraudHandler.GetFraudOverview)
				adminGroup.POST("/fraud/scan", middleware.RequireRole("admin", "keuangan"), fraudHandler.RunScan)
				adminGroup.POST("/fraud/cases/:id/freeze", middleware.RequireRole("admin"), fraudHandler.FreezeUserCase)
				adminGroup.POST("/fraud/cases/:id/resolve", middleware.RequireRole("admin", "keuangan"), fraudHandler.ResolveCase)

				// Live Traffic, Bandwidth & Online Users Monitoring (Admin & Keuangan)
				adminGroup.GET("/monitoring/overview", middleware.RequireRole("admin", "keuangan"), monitoringHandler.GetMonitoringOverview)
				adminGroup.GET("/monitoring/online-users", middleware.RequireRole("admin", "keuangan"), monitoringHandler.GetOnlineUsers)
				adminGroup.POST("/monitoring/force-disconnect/:id", middleware.RequireRole("admin"), monitoringHandler.ForceDisconnectUser)
				adminGroup.POST("/monitoring/test-alert", middleware.RequireRole("admin"), monitoringHandler.TestTelegramAlert)

				// WhatsApp Gateway & Automated Notifications (Admin & Keuangan)
				adminGroup.GET("/whatsapp/status", middleware.RequireRole("admin", "keuangan"), monitoringHandler.GetWhatsAppStatus)
				adminGroup.GET("/whatsapp/logs", middleware.RequireRole("admin", "keuangan"), monitoringHandler.GetWhatsAppLogs)
				adminGroup.POST("/whatsapp/send-test", middleware.RequireRole("admin"), monitoringHandler.SendWhatsAppTest)

				// Enterprise Security Guard & Cyber Threat Defense (Admin STRICT ONLY)
				securityGroup := adminGroup.Group("/security", middleware.RequireRole("admin"))
				{
					securityGroup.GET("/threats", securityHandler.GetThreatLogs)
					securityGroup.GET("/geo-traffic", securityHandler.GetGeoTraffic)
					securityGroup.POST("/block-ip", securityHandler.BlockIP)
					securityGroup.POST("/unblock-ip", securityHandler.UnblockIP)
					securityGroup.POST("/test-alert", securityHandler.TestSecurityAlert)
				}
			}

			// ==============================================
			// RBAC: GUDANG / WAREHOUSE ROUTES (Gudang & Admin)
			// ==============================================
			warehouseGroup := protected.Group("/warehouse")
			warehouseGroup.Use(middleware.RequireRole("gudang", "admin"))
			{
				warehouseGroup.GET("/overview", warehouseHandler.GetOverview)
				warehouseGroup.GET("/inventory", warehouseHandler.GetInventory)
				warehouseGroup.POST("/products/:id/stock", warehouseHandler.UpdateStock)
				warehouseGroup.GET("/orders", warehouseHandler.GetOrders)
				warehouseGroup.PATCH("/orders/:id/status", warehouseHandler.UpdateOrderStatus)
			}
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server is running on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
