package models

// ============================================================================
// 1. AI Herbal Doctor & Smart Health Consultation
// ============================================================================

type HealthConsultRequest struct {
	CustomerName       string `json:"customer_name"`
	Age                int    `json:"age"`
	Gender             string `json:"gender"`
	Complaint          string `json:"complaint" binding:"required"`
	HasGastricUlcer    bool   `json:"has_gastric_ulcer"`    // Riwayat Maag / Asam Lambung
	Allergies          string `json:"allergies"`
	CurrentMedications string `json:"current_medications"` // Obat Dokter yang sedang dikonsumsi
	Phone              string `json:"phone"`
	MitraReferral      string `json:"mitra_referral"`      // Optional referral / sponsor code
}

type ProductRecommendation struct {
	ProductName      string   `json:"product_name"`
	Dosage           string   `json:"dosage"`            // Contoh: "3 x 5 tetes per hari"
	ConsumptionGuide string   `json:"consumption_guide"` // Cara konsumsi dengan air hangat suam kuku
	KeyBenefits      []string `json:"key_benefits"`
	Price            float64  `json:"price"`
	BPOMNumber       string   `json:"bpom_number"`
}

type HealthConsultResponse struct {
	Status            string                  `json:"status"`
	CustomerName      string                  `json:"customer_name"`
	Age               int                     `json:"age"`
	ChiefComplaint    string                  `json:"chief_complaint"`
	Analysis          string                  `json:"analysis"`
	Products          []ProductRecommendation `json:"products"`
	WarmWaterGuide    string                  `json:"warm_water_guide"` // Petunjuk spesifik air hangat
	Restrictions      []string                `json:"restrictions"`     // Pantangan makanan/aktivitas
	LifestyleAdvice   []string                `json:"lifestyle_advice"`
	MedicalDisclaimer string                  `json:"medical_disclaimer"`
	WhatsAppOrderText string                  `json:"whatsapp_order_text"`
	WhatsAppOrderURL  string                  `json:"whatsapp_order_url"`
}

// ============================================================================
// 2. AI Dynamic Objection Handler
// ============================================================================

type ObjectionRequest struct {
	ObjectionType  string `json:"objection_type" binding:"required"` // mahal, trauma_mlm, efek_samping, izin_bpom, ragu_khasiat, obat_dokter
	ProspectName   string `json:"prospect_name"`
	ProductName    string `json:"product_name"`
	TargetAudience string `json:"target_audience"`
	CustomNotes    string `json:"custom_notes"`
	MitraName      string `json:"mitra_name"`
}

type ObjectionResponse struct {
	Status            string   `json:"status"`
	ObjectionType     string   `json:"objection_type"`
	ProspectName      string   `json:"prospect_name"`
	ProductName       string   `json:"product_name"`
	Framework         string   `json:"framework"` // e.g. Feel-Felt-Found, Reframe Value, Empathy Bridge
	ClosingScript     string   `json:"closing_script"`
	WhatsAppReadyText string   `json:"whatsapp_ready_text"`
	ClosingTip        string   `json:"closing_tip"`
	AlternativeHooks  []string `json:"alternative_hooks"`
}

// ============================================================================
// 3. AI Binary Placement & Spillover Strategist
// ============================================================================

type BinaryAdvisorResponse struct {
	Status                    string   `json:"status"`
	UserID                    string   `json:"user_id"`
	Username                  string   `json:"username"`
	LeftPoints                float64  `json:"left_points"`
	RightPoints               float64  `json:"right_points"`
	PointDifference           float64  `json:"point_difference"`
	StrongLeg                 string   `json:"strong_leg"` // "kiri" atau "kanan"
	WeakLeg                   string   `json:"weak_leg"`   // "kiri" atau "kanan"
	PotentialUnearnedPairs    int      `json:"potential_unearned_pairs"`
	PairBonusValue            float64  `json:"pair_bonus_value"` // Rp 25.000 per pasang
	PotentialUnearnedBonus    float64  `json:"potential_unearned_bonus"`
	RecommendedPlacementLeg   string   `json:"recommended_placement_leg"` // "kiri" atau "kanan"
	RecommendedUplineID       string   `json:"recommended_upline_id"`
	RecommendedUplineUsername string   `json:"recommended_upline_username"`
	PlacementReason           string   `json:"placement_reason"`
	StrategyInsight           string   `json:"strategy_insight"`
	ActionPlan                []string `json:"action_plan"`
}

// ============================================================================
// 4. AI 1-Click Copywriting Studio
// ============================================================================

type CopywritingRequest struct {
	Channel        string `json:"channel" binding:"required"` // wa_story, ig_caption, tiktok_script, fb_ad
	Tone           string `json:"tone"`                       // berkah, medis, storytelling, hard_selling
	ProductName    string `json:"product_name"`
	KeyBenefits    string `json:"key_benefits"`
	MitraName      string `json:"mitra_name"`
	WhatsAppNumber string `json:"whatsapp_number"`
	ReferralCode   string `json:"referral_code"`
	TargetAudience string `json:"target_audience"`
}

type CopywritingResponse struct {
	Status           string   `json:"status"`
	Channel          string   `json:"channel"`
	Tone             string   `json:"tone"`
	GeneratedCopy    string   `json:"generated_copy"`
	WhatsAppShareURL string   `json:"whatsapp_share_url"`
	Hashtags         []string `json:"hashtags"`
	CallToAction     string   `json:"call_to_action"`
}

// ============================================================================
// 5. AI Downline Churn Predictor & Inactivity Radar
// ============================================================================

type DownlineChurnItem struct {
	UserID            string `json:"user_id"`
	FullName          string `json:"full_name"`
	Username          string `json:"username"`
	PhoneNumber       string `json:"phone_number"`
	LastOrderDate     string `json:"last_order_date"`
	DaysInactive      int    `json:"days_inactive"`
	TotalOrdersPast   int    `json:"total_orders_past"`
	ChurnRiskScore    int    `json:"churn_risk_score"` // 0-100%
	RiskLevel         string `json:"risk_level"`       // "Low", "Medium", "High", "Critical"
	MotivationDraft   string `json:"motivation_draft"`
	WhatsAppDirectURL string `json:"whatsapp_direct_url"`
}

type ChurnRadarResponse struct {
	Status         string              `json:"status"`
	UplineID       string              `json:"upline_id"`
	TotalMonitored int                 `json:"total_monitored"`
	AtRiskCount    int                 `json:"at_risk_count"`
	Downlines      []DownlineChurnItem `json:"downlines"`
	AIRadarSummary string              `json:"ai_radar_summary"`
}

// ============================================================================
// 6. AI Voice Note Script & Dispatcher
// ============================================================================

type VoiceNoteRequest struct {
	ProspectName  string `json:"prospect_name" binding:"required"`
	ProspectPhone string `json:"prospect_phone"`
	Topic         string `json:"topic"` // welcome_member, follow_up_herbal, closing_promo, congrats_rank, reaktivasi
	Tone          string `json:"tone"`  // warm_friendly, energetic, professional, empathetic
	CustomContext string `json:"custom_context"`
	SendToWAHA    bool   `json:"send_to_waha"`
}

type VoiceNoteResponse struct {
	Status                   string      `json:"status"`
	ProspectName             string      `json:"prospect_name"`
	ProspectPhone            string      `json:"prospect_phone"`
	Topic                    string      `json:"topic"`
	ScriptText               string      `json:"script_text"`
	EstimatedDurationSeconds int         `json:"estimated_duration_seconds"`
	ToneGuidelines           string      `json:"tone_guidelines"`
	WAHADispatchStatus       string      `json:"waha_dispatch_status"`
	WAHAPayload              interface{} `json:"waha_payload,omitempty"`
}

// ============================================================================
// 7. AI OCR & Anti-Fraud Scanner
// ============================================================================

type FraudScanRequest struct {
	DocumentType      string  `json:"document_type"` // ktp, transfer_receipt, both
	NIK               string  `json:"nik"`
	FullName          string  `json:"full_name"`
	BankAccountName   string  `json:"bank_account_name"`
	BankAccountNumber string  `json:"bank_account_number"`
	TransferAmount    float64 `json:"transfer_amount"`
	ImageURL          string  `json:"image_url"`
	ImageBase64       string  `json:"image_base64"`
	RawText           string  `json:"raw_text"`
}

type FraudAnomaly struct {
	Field    string `json:"field"`
	Issue    string `json:"issue"`
	Severity string `json:"severity"` // "low", "medium", "high"
}

type NIKValidationResult struct {
	Valid        bool   `json:"valid"`
	Length       int    `json:"length"`
	IsNumeric    bool   `json:"is_numeric"`
	ProvinceCode string `json:"province_code,omitempty"`
	Reason       string `json:"reason"`
}

type FraudScanResponse struct {
	Status            string              `json:"status"`
	IsAuthentic       bool                `json:"is_authentic"`
	AuthenticityScore int                 `json:"authenticity_score"` // 0-100%
	FraudRiskScore    int                 `json:"fraud_risk_score"`   // 0-100%
	RiskLevel         string              `json:"risk_level"`         // "Low", "Medium", "High", "Critical"
	NIKValidation     NIKValidationResult `json:"nik_validation"`
	NameMatchScore    float64             `json:"name_match_score"` // 0.0 - 1.0
	DetectedAnomalies []FraudAnomaly      `json:"detected_anomalies"`
	AIAnalysisSummary string              `json:"ai_analysis_summary"`
	Recommendation    string              `json:"recommendation"` // "Auto-Approve", "Manual-Review", "Reject"
}

// ============================================================================
// 8. AI Repeat Order (RO) Retention Scheduler
// ============================================================================

type ROCustomerItem struct {
	CustomerID             string `json:"customer_id"`
	CustomerName           string `json:"customer_name"`
	PhoneNumber            string `json:"phone_number"`
	ProductPurchased       string `json:"product_purchased"`
	OrderDate              string `json:"order_date"`
	DaysElapsed            int    `json:"days_elapsed"`
	EstimatedDepletionDays int    `json:"estimated_depletion_days"` // e.g. 25-30 days
	Status                 string `json:"status"`                   // "due_for_ro", "approaching_depletion"
	PersonalizedMessage    string `json:"personalized_message"`
	WhatsAppURL            string `json:"whatsapp_url"`
}

type RORetentionResponse struct {
	Status         string           `json:"status"`
	TotalDueCount  int              `json:"total_due_count"`
	Customers      []ROCustomerItem `json:"customers"`
	AIStrategyNote string           `json:"ai_strategy_note"`
}
