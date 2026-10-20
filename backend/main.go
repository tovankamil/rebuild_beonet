package main

import (
	"log"
	"os"

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
	var count int64
	config.DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("bionet123"), bcrypt.DefaultCost)
		demoUser := models.User{
			ID:           uuid.New().String(),
			Username:     "mitra01",
			FullName:     "Mitra Bionet Juara",
			PasswordHash: string(hashedPassword),
			Role:         "member",
			Status:       "active",
		}
		if err := config.DB.Create(&demoUser).Error; err == nil {
			log.Println("Seeded demo user: username=mitra01, password=bionet123")

			// Seed demo wallet & points
			config.DB.Create(&models.Wallet{
				ID:      uuid.New().String(),
				UserID:  demoUser.ID,
				Balance: 2750000.00,
			})
			config.DB.Create(&models.PointBalance{
				ID:         uuid.New().String(),
				UserID:     demoUser.ID,
				PointLeft:  125.00,
				PointRight: 98.00,
			})
			config.DB.Create(&models.WalletTransaction{
				ID:           uuid.New().String(),
				UserID:       demoUser.ID,
				Type:         "credit",
				Amount:       500000.00,
				BalanceAfter: 2750000.00,
				Description:  "Bonus Pasangan (Pairing Bonus)",
			})
			config.DB.Create(&models.UserBank{
				ID:            uuid.New().String(),
				UserID:        demoUser.ID,
				BankName:      "BCA (Bank Central Asia)",
				AccountNumber: "8271928371",
				AccountName:   "Mitra Bionet Juara",
				IsPrimary:     true,
			})

			// Seed PIN Package
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

			// Seed Demo PINs for user
			config.DB.Create(&models.Pin{
				ID:         uuid.New().String(),
				SerialCode: "PIN-BIO-SILVER-88219",
				PackageID:  silverPkg.ID,
				OwnerID:    demoUser.ID,
				Status:     "active",
			})
			config.DB.Create(&models.Pin{
				ID:         uuid.New().String(),
				SerialCode: "PIN-BIO-GOLD-99120",
				PackageID:  goldPkg.ID,
				OwnerID:    demoUser.ID,
				Status:     "active",
			})

			// Seed Products
			config.DB.Create(&models.Product{
				ID:          uuid.New().String(),
				Name:        "Bionet Bio-Herbal Drops 30ml",
				Description: "Konsentrat herbal tetes kaya antioksidan dan mineral alami untuk meningkatkan daya tahan tubuh.",
				Price:       150000.00,
				Cogs:        85000.00,
				Stock:       150,
				IsActive:    true,
			})
			config.DB.Create(&models.Product{
				ID:          uuid.New().String(),
				Name:        "Bionet Propolis Premium Pure",
				Description: "Ekstrak propolis murni lebah trigona tanpa alkohol untuk vitalitas dan peremajaan sel.",
				Price:       220000.00,
				Cogs:        120000.00,
				Stock:       80,
				IsActive:    true,
			})
		}
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

	// AutoMigrate all 100% UUID tables
	err = config.DB.AutoMigrate(
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
	)
	if err != nil {
		log.Println("AutoMigrate notice:", err)
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

	// Initialize Gin Router
	r := gin.Default()

	// Enable CORS
	r.Use(middleware.CORSMiddleware())

	// Public Routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":  "success",
				"message": "pong from Bionet Backend API (Golang Gin - UUID Refactored)",
			})
		})

		// Auth
		api.POST("/auth/login", authHandler.Login)

		// Protected Routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/auth/me", authHandler.GetMe)
			protected.GET("/dashboard/stats", dashboardHandler.GetStats)
			protected.GET("/dashboard/genealogy", dashboardHandler.GetGenealogy)
			protected.GET("/dashboard/referrals", dashboardHandler.GetDirectReferrals)
			protected.GET("/dashboard/transactions", dashboardHandler.GetWalletTransactions)
			protected.GET("/dashboard/bank", dashboardHandler.GetUserBank)
			protected.POST("/dashboard/bank", dashboardHandler.SaveUserBank)

			// Withdrawals
			protected.POST("/dashboard/withdrawals", dashboardHandler.RequestWithdrawal)
			protected.GET("/dashboard/withdrawals", dashboardHandler.GetWithdrawals)

			// PINs & Stokis
			protected.GET("/pins/my-pins", dashboardHandler.GetMyPins)
			protected.GET("/pins/packages", dashboardHandler.GetPinPackages)
			protected.POST("/pins/transfer", dashboardHandler.TransferPin)

			// Products
			protected.GET("/products", dashboardHandler.GetProducts)
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
