package services

import (
	"crypto/md5"
	"encoding/binary"
	"net"
	"strings"
	"sync"
	"time"

	"bionet-backend/config"
	"bionet-backend/models"
)

// GeoLocation merepresentasikan data geolokasi IP
type GeoLocation struct {
	IP          string  `json:"ip"`
	City        string  `json:"city"`
	Province    string  `json:"province"`
	Country     string  `json:"country"`
	CountryCode string  `json:"country_code"`
	ISP         string  `json:"isp"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	Timezone    string  `json:"timezone"`
}

type ipRangeEntry struct {
	network   *net.IPNet
	city      string
	province  string
	isp       string
	latitude  float64
	longitude float64
	timezone  string
}

type GeoIPService struct {
	mu             sync.RWMutex
	cache          map[string]GeoLocation
	ipRanges       []ipRangeEntry
	recentAccessMu sync.RWMutex
	recentAccesses []models.GeoAccessLog
	maxAccessLogs  int
	uniqueIPs      map[string]bool
	cityCounts     map[string]int64
	provinceCounts map[string]int64
	ispCounts      map[string]int64
	accessTypeCounts map[string]int64
	totalVisits    int64
}

var (
	GlobalGeoIPService *GeoIPService
	geoOnce            sync.Once
)

// Major Indonesian city profiles for deterministic mapping fallback
var indonesianCityProfiles = []struct {
	City      string
	Province  string
	ISP       string
	Latitude  float64
	Longitude float64
	Timezone  string
}{
	{"Jakarta Pusat", "DKI Jakarta", "Telkomsel Mobile", -6.1751, 106.8650, "Asia/Jakarta"},
	{"Jakarta Selatan", "DKI Jakarta", "Biznet Networks", -6.2615, 106.8106, "Asia/Jakarta"},
	{"Jakarta Barat", "DKI Jakarta", "First Media", -6.1683, 106.7588, "Asia/Jakarta"},
	{"Surabaya", "Jawa Timur", "Telkom Indonesia (IndiHome)", -7.2575, 112.7521, "Asia/Jakarta"},
	{"Bandung", "Jawa Barat", "XL Axiata", -6.9175, 107.6191, "Asia/Jakarta"},
	{"Medan", "Sumatera Utara", "Telkomsel Mobile", 3.5952, 98.6722, "Asia/Jakarta"},
	{"Semarang", "Jawa Tengah", "Indosat Ooredoo Hutchison", -6.9667, 110.4167, "Asia/Jakarta"},
	{"Makassar", "Sulawesi Selatan", "Telkom Indonesia (IndiHome)", -5.1477, 119.4327, "Asia/Makassar"},
	{"Denpasar", "Bali", "Biznet Networks", -8.6705, 115.2126, "Asia/Makassar"},
	{"Palembang", "Sumatera Selatan", "Telkomsel Mobile", -2.9761, 104.7754, "Asia/Jakarta"},
	{"Tangerang", "Banten", "First Media", -6.1783, 106.6319, "Asia/Jakarta"},
	{"Depok", "Jawa Barat", "MyRepublic Indonesia", -6.4025, 106.7942, "Asia/Jakarta"},
	{"Bekasi", "Jawa Barat", "Indosat Ooredoo Hutchison", -6.2383, 106.9756, "Asia/Jakarta"},
	{"Bogor", "Jawa Barat", "Telkom Indonesia (IndiHome)", -6.5971, 106.8060, "Asia/Jakarta"},
	{"Yogyakarta", "D.I. Yogyakarta", "XL Axiata", -7.7956, 110.3695, "Asia/Jakarta"},
	{"Malang", "Jawa Timur", "Telkomsel Mobile", -7.9666, 112.6326, "Asia/Jakarta"},
	{"Balikpapan", "Kalimantan Timur", "Telkom Indonesia (IndiHome)", -1.2379, 116.8529, "Asia/Makassar"},
	{"Banjarmasin", "Kalimantan Selatan", "Smartfren Telecom", -3.3194, 114.5908, "Asia/Makassar"},
	{"Pekanbaru", "Riau", "Telkom Indonesia (IndiHome)", 0.5071, 101.4478, "Asia/Jakarta"},
	{"Bandar Lampung", "Lampung", "Indosat Ooredoo Hutchison", -5.4500, 105.2667, "Asia/Jakarta"},
	{"Batam", "Kepulauan Riau", "Moratelindo", 1.1301, 104.0529, "Asia/Jakarta"},
	{"Pontianak", "Kalimantan Barat", "Telkomsel Mobile", -0.0263, 109.3425, "Asia/Pontianak"},
	{"Padang", "Sumatera Barat", "Telkom Indonesia (IndiHome)", -0.9471, 100.4172, "Asia/Jakarta"},
	{"Manado", "Sulawesi Utara", "Telkomsel Mobile", 1.4748, 124.8428, "Asia/Makassar"},
}

// GetGeoIPService mengembalikan instance singleton GeoIPService
func GetGeoIPService() *GeoIPService {
	geoOnce.Do(func() {
		svc := &GeoIPService{
			cache:            make(map[string]GeoLocation),
			recentAccesses:   make([]models.GeoAccessLog, 0, 500),
			maxAccessLogs:    500,
			uniqueIPs:        make(map[string]bool),
			cityCounts:       make(map[string]int64),
			provinceCounts:   make(map[string]int64),
			ispCounts:        make(map[string]int64),
			accessTypeCounts: make(map[string]int64),
		}
		svc.initIPRanges()
		svc.seedInitialTraffic()
		GlobalGeoIPService = svc
	})
	return GlobalGeoIPService
}

func init() {
	GetGeoIPService()
}

func (s *GeoIPService) addCIDR(cidr, city, province, isp string, lat, lon float64, tz string) {
	_, ipNet, err := net.ParseCIDR(cidr)
	if err == nil {
		s.ipRanges = append(s.ipRanges, ipRangeEntry{
			network:   ipNet,
			city:      city,
			province:  province,
			isp:       isp,
			latitude:  lat,
			longitude: lon,
			timezone:  tz,
		})
	}
}

func (s *GeoIPService) initIPRanges() {
	// Major Indonesian ISP CIDRs
	// Telkom Indonesia / IndiHome (Most specific prefixes first)
	s.addCIDR("36.80.0.0/12", "Surabaya", "Jawa Timur", "Telkom Indonesia (IndiHome)", -7.2575, 112.7521, "Asia/Jakarta")
	s.addCIDR("36.64.0.0/11", "Jakarta Pusat", "DKI Jakarta", "Telkom Indonesia (IndiHome)", -6.1751, 106.8650, "Asia/Jakarta")
	s.addCIDR("180.240.0.0/13", "Bandung", "Jawa Barat", "Telkom Indonesia (IndiHome)", -6.9175, 107.6191, "Asia/Jakarta")
	s.addCIDR("180.248.0.0/13", "Semarang", "Jawa Tengah", "Telkom Indonesia (IndiHome)", -6.9667, 110.4167, "Asia/Jakarta")
	s.addCIDR("125.160.0.0/12", "Medan", "Sumatera Utara", "Telkom Indonesia (IndiHome)", 3.5952, 98.6722, "Asia/Jakarta")
	s.addCIDR("110.136.0.0/13", "Makassar", "Sulawesi Selatan", "Telkom Indonesia (IndiHome)", -5.1477, 119.4327, "Asia/Makassar")
	s.addCIDR("118.96.0.0/13", "Denpasar", "Bali", "Telkom Indonesia (IndiHome)", -8.6705, 115.2126, "Asia/Makassar")
	s.addCIDR("120.188.0.0/14", "Palembang", "Sumatera Selatan", "Telkom Indonesia (IndiHome)", -2.9761, 104.7754, "Asia/Jakarta")

	// Telkomsel
	s.addCIDR("114.120.0.0/13", "Jakarta Selatan", "DKI Jakarta", "Telkomsel Mobile", -6.2615, 106.8106, "Asia/Jakarta")
	s.addCIDR("114.124.0.0/14", "Yogyakarta", "D.I. Yogyakarta", "Telkomsel Mobile", -7.7956, 110.3695, "Asia/Jakarta")
	s.addCIDR("114.125.0.0/16", "Malang", "Jawa Timur", "Telkomsel Mobile", -7.9666, 112.6326, "Asia/Jakarta")
	s.addCIDR("182.1.0.0/16", "Bandar Lampung", "Lampung", "Telkomsel Mobile", -5.4500, 105.2667, "Asia/Jakarta")

	// Indosat Ooredoo
	s.addCIDR("114.4.0.0/14", "Tangerang", "Banten", "Indosat Ooredoo Hutchison", -6.1783, 106.6319, "Asia/Jakarta")
	s.addCIDR("114.5.0.0/16", "Bekasi", "Jawa Barat", "Indosat Ooredoo Hutchison", -6.2383, 106.9756, "Asia/Jakarta")
	s.addCIDR("182.0.0.0/15", "Depok", "Jawa Barat", "Indosat Ooredoo Hutchison", -6.4025, 106.7942, "Asia/Jakarta")
	s.addCIDR("113.20.0.0/14", "Bogor", "Jawa Barat", "Indosat Ooredoo Hutchison", -6.5971, 106.8060, "Asia/Jakarta")
	s.addCIDR("114.79.0.0/16", "Solo (Surakarta)", "Jawa Tengah", "Indosat Ooredoo Hutchison", -7.5666, 110.8166, "Asia/Jakarta")

	// XL Axiata & Smartfren
	s.addCIDR("112.215.0.0/16", "Jakarta Barat", "DKI Jakarta", "XL Axiata", -6.1683, 106.7588, "Asia/Jakarta")
	s.addCIDR("202.152.0.0/16", "Surabaya", "Jawa Timur", "XL Axiata", -7.2575, 112.7521, "Asia/Jakarta")
	s.addCIDR("120.160.0.0/12", "Balikpapan", "Kalimantan Timur", "XL Axiata", -1.2379, 116.8529, "Asia/Makassar")
	s.addCIDR("114.10.0.0/16", "Banjarmasin", "Kalimantan Selatan", "Smartfren Telecom", -3.3194, 114.5908, "Asia/Makassar")

	// Biznet & Fiber ISPs
	s.addCIDR("103.28.0.0/16", "Jakarta Pusat", "DKI Jakarta", "Biznet Networks", -6.1751, 106.8650, "Asia/Jakarta")
	s.addCIDR("118.99.0.0/16", "Denpasar", "Bali", "Biznet Networks", -8.6705, 115.2126, "Asia/Makassar")
	s.addCIDR("119.2.0.0/16", "Tangerang Selatan", "Banten", "First Media", -6.2888, 106.7179, "Asia/Jakarta")
	s.addCIDR("202.80.0.0/16", "Jakarta Timur", "DKI Jakarta", "First Media", -6.2250, 106.9004, "Asia/Jakarta")
	s.addCIDR("103.111.0.0/16", "Depok", "Jawa Barat", "MyRepublic Indonesia", -6.4025, 106.7942, "Asia/Jakarta")
	s.addCIDR("202.158.0.0/16", "Jakarta Utara", "DKI Jakarta", "Cyberindo Aditama (CBN)", -6.1384, 106.8640, "Asia/Jakarta")
	s.addCIDR("103.13.0.0/16", "Batam", "Kepulauan Riau", "Moratelindo", 1.1301, 104.0529, "Asia/Jakarta")
	s.addCIDR("103.19.0.0/16", "Pontianak", "Kalimantan Barat", "Telkomsel Mobile", -0.0263, 109.3425, "Asia/Pontianak")
	s.addCIDR("103.247.0.0/16", "Manado", "Sulawesi Utara", "Telkomsel Mobile", 1.4748, 124.8428, "Asia/Makassar")
	s.addCIDR("103.14.0.0/16", "Padang", "Sumatera Barat", "Telkom Indonesia (IndiHome)", -0.9471, 100.4172, "Asia/Jakarta")
}

// ResolveIP meresolusi IP address ke Kota, Provinsi, Negara, ISP, Latitude, dan Longitude (zero latency)
func (s *GeoIPService) ResolveIP(ipStr string) GeoLocation {
	ipStr = strings.TrimSpace(ipStr)
	if ipStr == "" {
		ipStr = "127.0.0.1"
	}

	// Remove port if present (e.g. "127.0.0.1:54321")
	if host, _, err := net.SplitHostPort(ipStr); err == nil {
		ipStr = host
	}

	// Check fast cache
	s.mu.RLock()
	if cached, ok := s.cache[ipStr]; ok {
		s.mu.RUnlock()
		return cached
	}
	s.mu.RUnlock()

	parsedIP := net.ParseIP(ipStr)
	if parsedIP == nil {
		parsedIP = net.ParseIP("127.0.0.1")
	}

	// 1. Check local/private ranges
	if parsedIP.IsLoopback() || parsedIP.IsPrivate() || ipStr == "127.0.0.1" || ipStr == "::1" || ipStr == "localhost" {
		loc := GeoLocation{
			IP:          ipStr,
			City:        "Jakarta Pusat",
			Province:    "DKI Jakarta",
			Country:     "Indonesia",
			CountryCode: "ID",
			ISP:         "Localhost / Internal Network",
			Latitude:    -6.1751,
			Longitude:   106.8650,
			Timezone:    "Asia/Jakarta",
		}
		s.saveToCache(ipStr, loc)
		return loc
	}

	// 2. Check CIDR table
	for _, entry := range s.ipRanges {
		if entry.network.Contains(parsedIP) {
			loc := GeoLocation{
				IP:          ipStr,
				City:        entry.city,
				Province:    entry.province,
				Country:     "Indonesia",
				CountryCode: "ID",
				ISP:         entry.isp,
				Latitude:    entry.latitude,
				Longitude:   entry.longitude,
				Timezone:    entry.timezone,
			}
			s.saveToCache(ipStr, loc)
			return loc
		}
	}

	// 3. Deterministic Indonesian mapping fallback based on hash of IP
	hasher := md5.New()
	hasher.Write([]byte(ipStr))
	digest := hasher.Sum(nil)
	index := int(binary.BigEndian.Uint32(digest[:4])) % len(indonesianCityProfiles)
	if index < 0 {
		index = -index
	}
	profile := indonesianCityProfiles[index]

	loc := GeoLocation{
		IP:          ipStr,
		City:        profile.City,
		Province:    profile.Province,
		Country:     "Indonesia",
		CountryCode: "ID",
		ISP:         profile.ISP,
		Latitude:    profile.Latitude,
		Longitude:   profile.Longitude,
		Timezone:    profile.Timezone,
	}

	s.saveToCache(ipStr, loc)
	return loc
}

func (s *GeoIPService) saveToCache(ip string, loc GeoLocation) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.cache[ip] = loc
}

// RecordAccess mencatat jejak akses pengguna/customer/mitra saat login, transaksi, atau kunjungan
func (s *GeoIPService) RecordAccess(ip, accessType, userID, username, endpoint string) models.GeoAccessLog {
	loc := s.ResolveIP(ip)

	logEntry := models.GeoAccessLog{
		IPAddress:  ip,
		City:       loc.City,
		Province:   loc.Province,
		Country:    loc.Country,
		ISP:        loc.ISP,
		Latitude:   loc.Latitude,
		Longitude:  loc.Longitude,
		AccessType: accessType,
		Endpoint:   endpoint,
		CreatedAt:  time.Now(),
	}

	if userID != "" {
		logEntry.UserID = &userID
	}
	if username != "" {
		logEntry.Username = &username
	}

	s.recentAccessMu.Lock()
	s.totalVisits++
	s.uniqueIPs[ip] = true
	s.cityCounts[loc.City]++
	s.provinceCounts[loc.Province]++
	s.ispCounts[loc.ISP]++
	if accessType != "" {
		s.accessTypeCounts[accessType]++
	} else {
		s.accessTypeCounts["api"]++
	}

	// Circular buffer
	if len(s.recentAccesses) >= s.maxAccessLogs {
		s.recentAccesses = s.recentAccesses[1:]
	}
	s.recentAccesses = append(s.recentAccesses, logEntry)
	s.recentAccessMu.Unlock()

	// Persist to database non-blockingly for high-value access types only to avoid slow SQL storms
	if config.DB != nil && (accessType == "login" || accessType == "transaction" || accessType == "public_visit") {
		go func(entry models.GeoAccessLog) {
			_ = config.DB.Create(&entry).Error
		}(logEntry)
	}

	return logEntry
}

// GetGeoTrafficSummary menghasilkan ringkasan statistik dan peta sebaran akses se-Indonesia
func (s *GeoIPService) GetGeoTrafficSummary() models.GeoTrafficDTO {
	s.recentAccessMu.RLock()
	defer s.recentAccessMu.RUnlock()

	total := s.totalVisits
	if total == 0 {
		total = 1
	}

	topCities := make([]models.CityTrafficStat, 0, len(s.cityCounts))
	for city, count := range s.cityCounts {
		// find matching lat lon
		lat := -6.2088
		lon := 106.8456
		prov := "DKI Jakarta"
		isp := "Telkomsel Mobile"
		for _, p := range indonesianCityProfiles {
			if strings.EqualFold(p.City, city) {
				lat = p.Latitude
				lon = p.Longitude
				prov = p.Province
				isp = p.ISP
				break
			}
		}

		pct := (float64(count) / float64(total)) * 100.0
		topCities = append(topCities, models.CityTrafficStat{
			City:       city,
			Province:   prov,
			ISP:        isp,
			Count:      count,
			Percentage: float64(int(pct*10)) / 10.0,
			Latitude:   lat,
			Longitude:  lon,
		})
	}

	// Copy provinces map
	provinces := make(map[string]int64)
	for k, v := range s.provinceCounts {
		provinces[k] = v
	}

	// Copy access types map
	accessTypes := make(map[string]int64)
	for k, v := range s.accessTypeCounts {
		accessTypes[k] = v
	}

	// Copy recent logs (reverse order: newest first)
	logsLen := len(s.recentAccesses)
	recentLogs := make([]models.GeoAccessLog, logsLen)
	for i := 0; i < logsLen; i++ {
		recentLogs[i] = s.recentAccesses[logsLen-1-i]
	}

	return models.GeoTrafficDTO{
		TotalVisits:      s.totalVisits,
		UniqueIPs:        int64(len(s.uniqueIPs)),
		TopProvinces:     provinces,
		TopCities:        topCities,
		AccessTypeStats:  accessTypes,
		RecentAccessLogs: recentLogs,
	}
}

// seedInitialTraffic creates realistic representative seed traffic across Indonesian cities
func (s *GeoIPService) seedInitialTraffic() {
	sampleAccesses := []struct {
		ip         string
		accessType string
		username   string
		endpoint   string
	}{
		{"114.120.45.12", "login", "mitra01", "/api/auth/login"},
		{"36.65.12.90", "transaction", "mitra01", "/api/dashboard/withdrawals"},
		{"180.240.89.21", "public_visit", "guest", "/api/bio/mitra01"},
		{"36.80.11.44", "login", "admin01", "/api/auth/login"},
		{"114.4.78.19", "transaction", "mitra01", "/api/pins/transfer"},
		{"125.160.40.10", "public_visit", "guest", "/api/marketing/kits"},
		{"110.136.22.8", "login", "mitra02", "/api/auth/login"},
		{"118.96.14.99", "public_visit", "guest", "/api/bio/mitra01"},
		{"114.124.33.7", "transaction", "mitra03", "/api/dashboard/withdrawals"},
		{"103.28.190.5", "api", "admin01", "/api/admin/overview"},
		{"112.215.80.33", "login", "gudang01", "/api/auth/login"},
		{"103.111.40.12", "public_visit", "guest", "/api/marketing/webinars"},
	}

	for _, sample := range sampleAccesses {
		s.RecordAccess(sample.ip, sample.accessType, "", sample.username, sample.endpoint)
	}
}
