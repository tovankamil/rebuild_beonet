package services

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

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
// ============================================================================
// AGENTIC AI WORKFLOWS & MULTI-STEP REASONING (LangChain / Agentic Capabilities)
// ============================================================================

// AgenticStep defines a structured step in an autonomous multi-step reasoning workflow.
type AgenticStep struct {
	AgentName   string `json:"agent_name"`
	Task        string `json:"task"`
	ToolUsed    string `json:"tool_used"`
	Observation string `json:"observation"`
	Thought     string `json:"thought"`
}

// RunAgenticWorkflow executes a multi-agent autonomous reasoning chain (simulating LangChain/LangGraph AgentExecutor).
func (s *GeminiService) RunAgenticWorkflow(ctx context.Context, goal string, contextData string) ([]AgenticStep, string, error) {
	if s == nil || s.client == nil {
		return nil, "", fmt.Errorf("gemini service is not initialized")
	}

	var steps []AgenticStep

	plannerPrompt := fmt.Sprintf(`Anda adalah Master Agent / Planner AI dari sistem Bionet Agentic Framework.
Tujuan Utama (Goal): %s
Konteks Data Operasional: %s

Pecah tujuan di atas menjadi 3 langkah agentic berurutan:
1. Data Analyst Agent (Menganalisa data & mengidentifikasi pola)
2. Business Strategist Agent (Menyusun strategi pertumbuhan & rekomendasi)
3. Action Executor Agent (Menyiapkan draf eksekusi/pesan intervensi nyata)

Berikan respon dalam format persis seperti ini untuk setiap langkah (pisahkan dengan "--- STEP ---"):
[AGENT: NamaAgent]
TASK: Deskripsi tugas
THOUGHT: Proses berpikir analitis
OBSERVATION: Hasil temuan atau kesimpulan sementara
`, goal, contextData)

	planResult, err := s.AskWithSystemPrompt(ctx, "Anda adalah Autonomous Agent Planner yang bekerja dengan presisi tinggi dan terstruktur.", plannerPrompt)
	if err != nil {
		return nil, "", fmt.Errorf("agentic planner error: %w", err)
	}

	rawSteps := strings.Split(planResult, "--- STEP ---")
	for i, rs := range rawSteps {
		if strings.TrimSpace(rs) == "" {
			continue
		}
		agentName := fmt.Sprintf("Bionet-SubAgent-%d", i+1)
		taskDesc := "Analisis Otonom Multi-Langkah"
		thoughtDesc := "Mengevaluasi kondisi jaringan dan data operasional"
		obsDesc := strings.TrimSpace(rs)

		if strings.Contains(rs, "[AGENT:") {
			parts := strings.SplitN(rs, "]", 2)
			agentName = strings.TrimPrefix(parts[0], "[AGENT:")
			if len(parts) > 1 {
				obsDesc = strings.TrimSpace(parts[1])
			}
		}

		steps = append(steps, AgenticStep{
			AgentName:   strings.TrimSpace(agentName),
			Task:        taskDesc,
			ToolUsed:    "Gemini-Native-Tool-Executor",
			Observation: obsDesc,
			Thought:     thoughtDesc,
		})
	}

	if len(steps) == 0 {
		steps = append(steps, AgenticStep{
			AgentName:   "Bionet-Master-Agent",
			Task:        goal,
			ToolUsed:    "VectorDB & Database State Engine",
			Observation: planResult,
			Thought:     "Menjalankan penalaran rantai otonom berbasis data Bionet",
		})
	}

	synthesisPrompt := fmt.Sprintf(`Berdasarkan hasil eksekusi langkah-langkah Agentic di atas untuk tujuan: "%s", 
buatkan ringkasan eksekutif akhir yang sangat tajam, solutif, profesional, dan siap digunakan oleh Admin/Mitra Bionet.`, goal)

	finalSynthesis, err := s.AskWithSystemPrompt(ctx, "Anda adalah Chief AI Officer Bionet yang merangkum hasil kerja multi-agent.", synthesisPrompt)
	if err != nil {
		finalSynthesis = planResult
	}

	return steps, strings.TrimSpace(finalSynthesis), nil
}


// RunAgenticWorkflow is a package-level wrapper that delegates to GlobalGeminiService
func RunAgenticWorkflow(ctx context.Context, goal string, contextData string) ([]AgenticStep, string, error) {
	if GlobalGeminiService == nil {
		return nil, "", fmt.Errorf("gemini service is not initialized")
	}
	return GlobalGeminiService.RunAgenticWorkflow(ctx, goal, contextData)
}

// RunAgenticAssistant is a package-level wrapper that delegates to GlobalGeminiService.ProcessBionetAssistant
func RunAgenticAssistant(ctx context.Context, query, userRole, username, systemContext string) (string, error) {
	if GlobalGeminiService == nil {
		return "", fmt.Errorf("gemini service is not initialized")
	}
	return GlobalGeminiService.ProcessBionetAssistant(ctx, userRole, username, query, systemContext)
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
