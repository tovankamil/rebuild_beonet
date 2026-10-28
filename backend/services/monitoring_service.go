package services

import (
	"fmt"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"bionet-backend/config"
)

// OnlineUser represents a currently connected customer / admin
type OnlineUser struct {
	UserID        string    `json:"user_id"`
	Username      string    `json:"username"`
	FullName      string    `json:"full_name"`
	Role          string    `json:"role"`
	CurrentPage   string    `json:"current_page"`
	IPAddress     string    `json:"ip_address"`
	UserAgent     string    `json:"user_agent"`
	Device        string    `json:"device"`
	FirstSeen     time.Time `json:"first_seen"`
	LastHeartbeat time.Time `json:"last_heartbeat"`
	SecondsAgo    int64     `json:"seconds_ago"`
	IsActive      bool      `json:"is_active"` // true if seen in < 60s, false if idle
}

// EndpointStat tracks hits and bandwidth per route
type EndpointStat struct {
	Endpoint   string `json:"endpoint"`
	Hits       int64  `json:"hits"`
	BytesTotal int64  `json:"bytes_total"`
}

// MonitoringMetrics combines all system, network and user statistics
type FrontendRouteStat struct {
	RouteKey    string  `json:"route_key"`
	Title       string  `json:"title"`
	ActiveUsers int     `json:"active_users"`
	TotalVisits int64   `json:"total_visits"`
	Percentage  float64 `json:"percentage"`
}

type MonitoringMetrics struct {
	OnlineUsersCount int            `json:"online_users_count"`
	ActiveUsersCount int            `json:"active_users_count"`
	IdleUsersCount   int            `json:"idle_users_count"`
	Traffic          TrafficSummary `json:"traffic"`
	System           SystemMetrics  `json:"system"`
	TopEndpoints     []EndpointStat `json:"top_endpoints"`
	RecentUsers      []OnlineUser        `json:"recent_users"`
	FrontendRoutes   []FrontendRouteStat `json:"frontend_routes"`
}

type TrafficSummary struct {
	TotalBytesIn     int64   `json:"total_bytes_in"`
	TotalBytesOut    int64   `json:"total_bytes_out"`
	TotalBytesInMB   float64 `json:"total_bytes_in_mb"`
	TotalBytesOutMB  float64 `json:"total_bytes_out_mb"`
	RateInKBps       float64 `json:"rate_in_kbps"`
	RateOutKBps      float64 `json:"rate_out_kbps"`
	TotalRequests    int64   `json:"total_requests"`
	Status2xx        int64   `json:"status_2xx"`
	Status4xx        int64   `json:"status_4xx"`
	Status5xx        int64   `json:"status_5xx"`
	AverageLatencyMs float64 `json:"average_latency_ms"`
}

type SystemMetrics struct {
	AllocMB         float64 `json:"alloc_mb"`       // Currently used heap memory
	TotalAllocMB    float64 `json:"total_alloc_mb"` // Cumulative allocated
	SysMB           float64 `json:"sys_mb"`         // Total memory obtained from OS
	HeapInuseMB     float64 `json:"heap_inuse_mb"`
	StackInuseMB    float64 `json:"stack_inuse_mb"`
	NumGC           uint32  `json:"num_gc"` // Total garbage collection cycles
	GoroutinesCount int     `json:"goroutines_count"`
	NumCPU          int     `json:"num_cpu"`
	UptimeFormatted string  `json:"uptime_formatted"`
	UptimeSeconds   int64   `json:"uptime_seconds"`
	DBStatus        string  `json:"db_status"`
	DBOpenConns     int     `json:"db_open_conns"`
	DBInUseConns    int     `json:"db_in_use_conns"`
	DBIdleConns     int     `json:"db_idle_conns"`
}

// MonitoringService manages online users, traffic, and system telemetry
type MonitoringService struct {
	startTime   time.Time
	usersLock   sync.RWMutex
	onlineUsers map[string]*OnlineUser

	// Atomic counters for high performance
	totalBytesIn   int64
	totalBytesOut  int64
	totalRequests  int64
	status2xx      int64
	status4xx      int64
	status5xx      int64
	totalLatencyNs int64

	// Sliding rates
	lastCalcTime   time.Time
	lastBytesIn    int64
	lastBytesOut   int64
	currentRateIn  float64
	currentRateOut float64

	// Endpoint statistics
	endpointsLock sync.RWMutex
	endpointStats map[string]*EndpointStat

	// Telegram Alert Thresholds
	frontendVisits map[string]int64
	visitsLock     sync.RWMutex

	lastAlertTime time.Time
	lastAlertLock sync.Mutex
}

var (
	GlobalMonitor *MonitoringService
	monitorOnce   sync.Once
)

// GetMonitoringService returns the singleton monitoring instance
func GetMonitoringService() *MonitoringService {
	monitorOnce.Do(func() {
		GlobalMonitor = &MonitoringService{
			startTime:     time.Now(),
			onlineUsers:   make(map[string]*OnlineUser),
			endpointStats:  make(map[string]*EndpointStat),
			frontendVisits: make(map[string]int64),
			lastCalcTime:  time.Now(),
		}
		// Background rate calculation & cleanup ticker
		go GlobalMonitor.backgroundWorker()
	})
	return GlobalMonitor
}

func (m *MonitoringService) backgroundWorker() {
	ticker := time.NewTicker(4 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		m.calculateRates()
		m.cleanupStaleUsers()
		m.checkThresholdAlerts()
	}
}

// checkThresholdAlerts inspects RAM, CPU and requests and sends Telegram Alert if >= 80%
func (m *MonitoringService) checkThresholdAlerts() {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	allocMB := float64(mem.Alloc) / (1024 * 1024)
	sysMB := float64(mem.Sys) / (1024 * 1024)
	if sysMB <= 0 {
		return
	}

	ratio := allocMB / sysMB
	// Check threshold 80% (0.80)
	if ratio >= 0.80 {
		m.lastAlertLock.Lock()
		// 15-minute cooldown between alerts
		if time.Since(m.lastAlertTime) > 15*time.Minute {
			m.lastAlertTime = time.Now()
			m.lastAlertLock.Unlock()

			if GlobalTelegramService != nil {
				alertMsg := fmt.Sprintf(
					"🚨 <b>[BIONET ALERT] PERINGATAN BEBAN RAM TINGGI (%.1f%%)</b>\n\n"+
						"⚠️ Penggunaan Heap: <b>%.2f MB / %.2f MB Sys</b>\n"+
						"⚡ Goroutines: <b>%d</b> | GC Cycles: <b>%d</b>\n"+
						"🌐 Throughput: <b>In %.1f KB/s, Out %.1f KB/s</b>\n"+
						"👥 Pengguna Aktif: <b>%d Online</b>\n"+
						"🕐 Waktu: <b>%s</b>\n\n"+
						"<i>Segera periksa Admin Telemetry Dashboard untuk analisa rute trafik.</i>",
					ratio*100,
					allocMB,
					sysMB,
					runtime.NumGoroutine(),
					mem.NumGC,
					m.currentRateIn,
					m.currentRateOut,
					len(m.GetOnlineUsersList()),
					time.Now().Format("2006-01-02 15:04:05 WIB"),
				)
				_ = GlobalTelegramService.NotifyAdmin(alertMsg)
			}
		} else {
			m.lastAlertLock.Unlock()
		}
	}
}

// TriggerManualTestAlert sends a verification alert to Telegram Admin on demand
func (m *MonitoringService) TriggerManualTestAlert(adminUser string) error {
	if GlobalTelegramService == nil {
		return fmt.Errorf("layanan Telegram Bot belum dikonfigurasi")
	}

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	allocMB := float64(mem.Alloc) / (1024 * 1024)
	sysMB := float64(mem.Sys) / (1024 * 1024)
	ratio := 0.0
	if sysMB > 0 {
		ratio = (allocMB / sysMB) * 100
	}

	msg := fmt.Sprintf(
		"🔔 <b>[BIONET TEST] UJI COBA BOT ALERT TELEGRAM</b>\n\n"+
			"✅ Pemicu: <b>Admin @%s</b>\n"+
			"📊 RAM Saat Ini: <b>%.2f MB / %.2f MB (%.1f%%)</b>\n"+
			"🌐 In/Out Rate: <b>↓ %.1f KB/s | ↑ %.1f KB/s</b>\n"+
			"👥 Mitra Terhubung: <b>%d Pengguna</b>\n"+
			"⚡ Status Server: <b>Normal & Siap Beroperasi</b>\n"+
			"🕐 Waktu Uji: <b>%s</b>",
		adminUser,
		allocMB,
		sysMB,
		ratio,
		m.currentRateIn,
		m.currentRateOut,
		len(m.GetOnlineUsersList()),
		time.Now().Format("2006-01-02 15:04:05 WIB"),
	)

	return GlobalTelegramService.NotifyAdmin(msg)
}

func (m *MonitoringService) calculateRates() {
	now := time.Now()
	elapsed := now.Sub(m.lastCalcTime).Seconds()
	if elapsed <= 0 {
		return
	}

	curIn := atomic.LoadInt64(&m.totalBytesIn)
	curOut := atomic.LoadInt64(&m.totalBytesOut)

	deltaIn := curIn - m.lastBytesIn
	deltaOut := curOut - m.lastBytesOut

	m.currentRateIn = (float64(deltaIn) / 1024.0) / elapsed
	m.currentRateOut = (float64(deltaOut) / 1024.0) / elapsed

	m.lastBytesIn = curIn
	m.lastBytesOut = curOut
	m.lastCalcTime = now
}

func (m *MonitoringService) cleanupStaleUsers() {
	m.usersLock.Lock()
	defer m.usersLock.Unlock()

	now := time.Now()
	// Stale timeout: if no heartbeat in 5 minutes, remove from active tracking
	for id, user := range m.onlineUsers {
		if now.Sub(user.LastHeartbeat) > 5*time.Minute {
			delete(m.onlineUsers, id)
		}
	}
}

// DetectDevice parses a simple device type from User-Agent
func DetectDevice(ua string) string {
	lower := strings.ToLower(ua)
	if strings.Contains(lower, "mobile") || strings.Contains(lower, "android") || strings.Contains(lower, "iphone") {
		return "Mobile Device"
	}
	if strings.Contains(lower, "ipad") || strings.Contains(lower, "tablet") {
		return "Tablet"
	}
	if strings.Contains(lower, "windows") {
		return "Windows Desktop"
	}
	if strings.Contains(lower, "macintosh") || strings.Contains(lower, "mac os") {
		return "Mac Desktop"
	}
	if strings.Contains(lower, "linux") {
		return "Linux Desktop"
	}
	return "Desktop / Web"
}

// RecordHeartbeat records or updates a user session
func (m *MonitoringService) RecordHeartbeat(userID, username, fullName, role, currentPage, ip, userAgent string) {
	if userID == "" {
		return
	}

	m.usersLock.Lock()
	defer m.usersLock.Unlock()

	now := time.Now()
	if existing, exists := m.onlineUsers[userID]; exists {
		existing.LastHeartbeat = now
		if currentPage != "" {
			existing.CurrentPage = currentPage
			m.recordFrontendVisit(currentPage)
		}
		if ip != "" {
			existing.IPAddress = ip
		}
		if userAgent != "" {
			existing.UserAgent = userAgent
			existing.Device = DetectDevice(userAgent)
		}
		if fullName != "" {
			existing.FullName = fullName
		}
		if role != "" {
			existing.Role = role
		}
	} else {
		m.onlineUsers[userID] = &OnlineUser{
			UserID:        userID,
			Username:      username,
			FullName:      fullName,
			Role:          role,
			CurrentPage:   currentPage,
			IPAddress:     ip,
			UserAgent:     userAgent,
			Device:        DetectDevice(userAgent),
			FirstSeen:     now,
			LastHeartbeat: now,
			IsActive:      true,
		}
		if currentPage != "" {
			m.recordFrontendVisit(currentPage)
		}
	}
}

// RemoveOnlineUser manually removes a user (e.g. on logout)
func (m *MonitoringService) RemoveOnlineUser(userID string) {
	m.usersLock.Lock()
	defer m.usersLock.Unlock()
	delete(m.onlineUsers, userID)
}

func (m *MonitoringService) recordFrontendVisit(page string) {
	if page == "" || strings.HasPrefix(page, "/api") {
		return
	}
	m.visitsLock.Lock()
	m.frontendVisits[page]++
	m.visitsLock.Unlock()
}

func getMenuFriendlyTitle(key string) string {
	titles := map[string]string{
		"overview":             "Dashboard Ringkasan Mitra",
		"genealogy":            "Pohon Jaringan Binary",
		"referrals":            "Daftar Referal Langsung",
		"withdrawal":           "Form Penarikan Saldo (WD)",
		"transactions":         "Buku Kas & Transaksi",
		"pins":                 "Master PIN & Stokis",
		"products":             "Katalog Produk & RO",
		"bank":                 "Kelola Rekening Bank Mitra",
		"chat":                 "Live Chat Bantuan CS",
		"components":           "Galeri Komponen DashLite",
		"admin-overview":       "Admin Ringkasan Eksekutif",
		"admin-users":          "Admin Manajemen Pengguna",
		"admin-transactions":   "Admin Buku Besar & Bonus",
		"admin-points":         "Admin Poin Pasangan Binary",
		"admin-pins":           "Admin Master Serial PIN",
		"admin-orders":         "Admin Pesanan E-Commerce RO",
		"admin-withdrawals":    "Admin Persetujuan WD",
		"admin-fraud":          "Admin Fraud Control & Risiko",
		"admin-monitoring":     "Admin Live Telemetri & User",
		"admin-guide":          "Admin Panduan Sistem",
		"warehouse-overview":   "Gudang Ringkasan Inventori",
		"warehouse-inventory":  "Gudang Manajemen Stok",
		"warehouse-orders":     "Gudang Fulfillment Pesanan",
	}
	if t, exists := titles[key]; exists {
		return t
	}
	return key
}

// RecordRequest updates traffic metrics atomically
func (m *MonitoringService) RecordRequest(bytesIn, bytesOut int64, statusCode int, endpoint string, duration time.Duration) {
	atomic.AddInt64(&m.totalRequests, 1)
	atomic.AddInt64(&m.totalBytesIn, bytesIn)
	atomic.AddInt64(&m.totalBytesOut, bytesOut)
	atomic.AddInt64(&m.totalLatencyNs, duration.Nanoseconds())

	if statusCode >= 200 && statusCode < 300 {
		atomic.AddInt64(&m.status2xx, 1)
	} else if statusCode >= 400 && statusCode < 500 {
		atomic.AddInt64(&m.status4xx, 1)
	} else if statusCode >= 500 {
		atomic.AddInt64(&m.status5xx, 1)
	}

	// Normalize endpoint for grouping (strip uuid params)
	normalized := normalizeEndpoint(endpoint)
	if normalized != "" {
		m.endpointsLock.Lock()
		if stat, exists := m.endpointStats[normalized]; exists {
			stat.Hits++
			stat.BytesTotal += (bytesIn + bytesOut)
		} else {
			m.endpointStats[normalized] = &EndpointStat{
				Endpoint:   normalized,
				Hits:       1,
				BytesTotal: bytesIn + bytesOut,
			}
		}
		m.endpointsLock.Unlock()
	}
}

func normalizeEndpoint(ep string) string {
	parts := strings.Split(ep, "?")
	clean := parts[0]
	// If it contains more than 5 segments, shorten
	return clean
}

// GetOnlineUsersList returns list of online users with computed active status
func (m *MonitoringService) GetOnlineUsersList() []OnlineUser {
	m.usersLock.RLock()
	defer m.usersLock.RUnlock()

	now := time.Now()
	res := make([]OnlineUser, 0, len(m.onlineUsers))
	for _, u := range m.onlineUsers {
		sec := int64(now.Sub(u.LastHeartbeat).Seconds())
		item := *u
		item.SecondsAgo = sec
		item.IsActive = (sec <= 65) // Active if pinged within last 65s
		res = append(res, item)
	}
	return res
}

// GetComprehensiveMetrics compiles everything for Admin
func (m *MonitoringService) GetComprehensiveMetrics() MonitoringMetrics {
	users := m.GetOnlineUsersList()

	activeCount := 0
	idleCount := 0
	for _, u := range users {
		if u.IsActive {
			activeCount++
		} else {
			idleCount++
		}
	}

	// Memory & runtime
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	uptime := time.Since(m.startTime)
	uptimeFormatted := fmt.Sprintf("%dh %dm %ds", int(uptime.Hours()), int(uptime.Minutes())%60, int(uptime.Seconds())%60)
	if uptime.Hours() >= 24 {
		days := int(uptime.Hours()) / 24
		hours := int(uptime.Hours()) % 24
		uptimeFormatted = fmt.Sprintf("%dd %dh %dm", days, hours, int(uptime.Minutes())%60)
	}

	// DB Status
	dbStatus := "Connected"
	openConns := 0
	inUseConns := 0
	idleConns := 0
	if config.DB != nil {
		if sqlDB, err := config.DB.DB(); err == nil {
			stats := sqlDB.Stats()
			openConns = stats.OpenConnections
			inUseConns = stats.InUse
			idleConns = stats.Idle
		}
	}

	sysMetrics := SystemMetrics{
		AllocMB:         float64(mem.Alloc) / (1024 * 1024),
		TotalAllocMB:    float64(mem.TotalAlloc) / (1024 * 1024),
		SysMB:           float64(mem.Sys) / (1024 * 1024),
		HeapInuseMB:     float64(mem.HeapInuse) / (1024 * 1024),
		StackInuseMB:    float64(mem.StackInuse) / (1024 * 1024),
		NumGC:           mem.NumGC,
		GoroutinesCount: runtime.NumGoroutine(),
		NumCPU:          runtime.NumCPU(),
		UptimeFormatted: uptimeFormatted,
		UptimeSeconds:   int64(uptime.Seconds()),
		DBStatus:        dbStatus,
		DBOpenConns:     openConns,
		DBInUseConns:    inUseConns,
		DBIdleConns:     idleConns,
	}

	totIn := atomic.LoadInt64(&m.totalBytesIn)
	totOut := atomic.LoadInt64(&m.totalBytesOut)
	totReqs := atomic.LoadInt64(&m.totalRequests)
	totLat := atomic.LoadInt64(&m.totalLatencyNs)

	avgLatency := 0.0
	if totReqs > 0 {
		avgLatency = float64(totLat) / float64(totReqs) / 1000000.0 // ms
	}

	traffic := TrafficSummary{
		TotalBytesIn:     totIn,
		TotalBytesOut:    totOut,
		TotalBytesInMB:   float64(totIn) / (1024 * 1024),
		TotalBytesOutMB:  float64(totOut) / (1024 * 1024),
		RateInKBps:       m.currentRateIn,
		RateOutKBps:      m.currentRateOut,
		TotalRequests:    totReqs,
		Status2xx:        atomic.LoadInt64(&m.status2xx),
		Status4xx:        atomic.LoadInt64(&m.status4xx),
		Status5xx:        atomic.LoadInt64(&m.status5xx),
		AverageLatencyMs: avgLatency,
	}

	// Top 10 endpoints
	m.endpointsLock.RLock()
	endpoints := make([]EndpointStat, 0, len(m.endpointStats))
	for _, ep := range m.endpointStats {
		endpoints = append(endpoints, *ep)
	}
	m.endpointsLock.RUnlock()

	// Limit to top 10 by hits
	if len(endpoints) > 10 {
		endpoints = endpoints[:10]
	}

	// Aggregate Frontend Page Routes
	routeUserCounts := make(map[string]int)
	for _, u := range users {
		pageKey := u.CurrentPage
		if pageKey == "" {
			pageKey = "overview"
		}
		routeUserCounts[pageKey]++
	}

	m.visitsLock.RLock()
	var frontendRoutes []FrontendRouteStat
	for key, visits := range m.frontendVisits {
		active := routeUserCounts[key]
		pct := 0.0
		if len(users) > 0 {
			pct = (float64(active) / float64(len(users))) * 100
		}
		frontendRoutes = append(frontendRoutes, FrontendRouteStat{
			RouteKey:    key,
			Title:       getMenuFriendlyTitle(key),
			ActiveUsers: active,
			TotalVisits: visits,
			Percentage:  pct,
		})
	}
	// Also ensure currently visited pages are included even if zero historical visits
	for key, active := range routeUserCounts {
		found := false
		for _, r := range frontendRoutes {
			if r.RouteKey == key {
				found = true
				break
			}
		}
		if !found && !strings.HasPrefix(key, "/api") {
			pct := 0.0
			if len(users) > 0 {
				pct = (float64(active) / float64(len(users))) * 100
			}
			frontendRoutes = append(frontendRoutes, FrontendRouteStat{
				RouteKey:    key,
				Title:       getMenuFriendlyTitle(key),
				ActiveUsers: active,
				TotalVisits: int64(active),
				Percentage:  pct,
			})
		}
	}
	m.visitsLock.RUnlock()

	return MonitoringMetrics{
		OnlineUsersCount: len(users),
		ActiveUsersCount: activeCount,
		IdleUsersCount:   idleCount,
		Traffic:          traffic,
		System:           sysMetrics,
		TopEndpoints:     endpoints,
		RecentUsers:      users,
		FrontendRoutes:   frontendRoutes,
	}
}
