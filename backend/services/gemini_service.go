package services

import (
	"context"
	"fmt"
	"log"
	"os"

	"google.golang.org/genai"
)

type GeminiService struct {
	client    *genai.Client
	modelName string
}

var GlobalGeminiService *GeminiService

// NewGeminiService initializes the official Google GenAI client
func NewGeminiService() (*GeminiService, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not set in environment variables")
	}

	modelName := os.Getenv("GEMINI_MODEL")
	if modelName == "" {
		modelName = "gemini-3.1-flash-lite"
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  apiKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create GenAI client: %w", err)
	}

	service := &GeminiService{
		client:    client,
		modelName: modelName,
	}
	GlobalGeminiService = service
	log.Printf("GeminiService initialized successfully with model: %s", modelName)
	return service, nil
}

// GenerateText produces a completion for a standard text prompt
func (s *GeminiService) GenerateText(ctx context.Context, prompt string) (string, error) {
	if s == nil || s.client == nil {
		return "", fmt.Errorf("gemini service is not initialized")
	}

	resp, err := s.client.Models.GenerateContent(ctx, s.modelName, genai.Text(prompt), nil)
	if err != nil {
		return "", fmt.Errorf("gemini generation error: %w", err)
	}

	return resp.Text(), nil
}

// AskWithSystemPrompt sends a query with a custom system role persona with automatic model fallback
func (s *GeminiService) AskWithSystemPrompt(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	if s == nil || s.client == nil {
		return "", fmt.Errorf("gemini service is not initialized")
	}

	config := &genai.GenerateContentConfig{
		SystemInstruction: &genai.Content{
			Parts: []*genai.Part{
				{Text: systemPrompt},
			},
		},
	}

	modelsToTry := []string{s.modelName, "gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-flash-lite"}
	var lastErr error

	for _, m := range modelsToTry {
		resp, err := s.client.Models.GenerateContent(ctx, m, genai.Text(userPrompt), config)
		if err == nil && resp != nil {
			return resp.Text(), nil
		}
		lastErr = err
	}

	return "", fmt.Errorf("gemini generation error: %w", lastErr)
}

// ProcessBionetAssistant handles queries from Mitra or Admin with Bionet domain context
func (s *GeminiService) ProcessBionetAssistant(ctx context.Context, userRole, username, query, systemContext string) (string, error) {
	systemPrompt := fmt.Sprintf(`Anda adalah asisten AI resmi platform Bionet (Sistem Network Marketing E-Commerce & Kemitraan Herbal BPOM).
Peran Pengguna Saat Ini: %s
Username Pengguna: %s

Pedoman:
1. Bersikap ramah, profesional, solutif, dan ringkas.
2. Gunakan Bahasa Indonesia yang baik dan sopan.
3. Anda memiliki akses ke data operasional Bionet:
   - Genealogi Binary (Pohon jaringan kaki kiri dan kanan)
   - Sistem Serial PIN Lisensi (Aktivasi paket kemitraan)
   - E-Wallet, Bonus Pasangan/Pairing, dan Penarikan Dana (Withdrawal via Flip.id)
   - E-Commerce Repeat Order (RO) produk herbal kesehatan BPOM
4. Jika ada data konteks sistem yang diberikan di bawah, gunakan data tersebut untuk menjawab pertanyaan pengguna dengan akurat.
5. PENTING: JANGAN PERNAH menampilkan istilah teknis developer/database (seperti Closure Table, query SELECT, index composite, latency 0.04 ms, dsb). Jelaskan selalu dalam bahasa bisnis yang ramah, keuntungan finansial mitra, transparansi bonus harian, serta manfaat produk herbal resmi BPOM.

Konteks Sistem Terkini:
%s
`, userRole, username, systemContext)

	return s.AskWithSystemPrompt(ctx, systemPrompt, query)
}
