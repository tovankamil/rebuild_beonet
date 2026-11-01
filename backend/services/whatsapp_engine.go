package services

import (
	"context"
	"fmt"
	"log"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
)

// WhatsAppJob merepresentasikan antrean pesan WhatsApp yang diproses konkuren oleh Go Routines
type WhatsAppJob struct {
	ID        string    `json:"id"`
	Session   string    `json:"session"`
	Phone     string    `json:"phone"`
	Text      string    `json:"text"`
	MediaURL  string    `json:"media_url,omitempty"`
	MediaType string    `json:"media_type,omitempty"` // 'image', 'audio', 'document'
	Retry     int       `json:"retry"`
	CreatedAt time.Time `json:"created_at"`
}

type WhatsAppEngineStats struct {
	ActiveWorkers int    `json:"active_workers"`
	QueueCapacity int    `json:"queue_capacity"`
	PendingJobs   int    `json:"pending_jobs"`
	ProcessedJobs uint64 `json:"processed_jobs"`
	FailedJobs    uint64 `json:"failed_jobs"`
	UptimeSeconds int64  `json:"uptime_seconds"`
	EngineStatus  string `json:"engine_status"` // 'running', 'paused', 'degraded'
}

type GoWAHAEngine struct {
	jobQueue       chan *WhatsAppJob
	workersCount   int
	processedCount uint64
	failedCount    uint64
	startTime      time.Time
	mu             sync.RWMutex
	sessions       map[string]map[string]interface{}
	ctx            context.Context
	cancel         context.CancelFunc
}

var GlobalGoWAHAEngine = NewGoWAHAEngine(15, 10000) // 15 worker goroutine konkuren, buffer antrean hingga 10.000 pesan

func NewGoWAHAEngine(workers int, queueCapacity int) *GoWAHAEngine {
	ctx, cancel := context.WithCancel(context.Background())
	engine := &GoWAHAEngine{
		jobQueue:     make(chan *WhatsAppJob, queueCapacity),
		workersCount: workers,
		startTime:    time.Now(),
		sessions:     make(map[string]map[string]interface{}),
		ctx:          ctx,
		cancel:       cancel,
	}

	// Inisialisasi default sessions
	engine.sessions["default"] = map[string]interface{}{
		"name":       "default",
		"status":     "WORKING",
		"me":         map[string]string{"id": "628123456789@c.us", "pushName": "Bionet High-Concurrency Gateway"},
		"created_at": time.Now(),
	}

	engine.startWorkerPool()
	return engine
}

// startWorkerPool menyalakan goroutines worker untuk memproses ribuan pesan secara paralel
func (e *GoWAHAEngine) startWorkerPool() {
	for i := 1; i <= e.workersCount; i++ {
		workerID := i
		go func(id int) {
			log.Printf("[Go-WAHA Engine] Goroutine Worker #%d aktif & siap menerima antrean...", id)
			for {
				select {
				case <-e.ctx.Done():
					log.Printf("[Go-WAHA Engine] Goroutine Worker #%d berhenti.", id)
					return
				case job, ok := <-e.jobQueue:
					if !ok {
						return
					}
					e.processJob(id, job)
				}
			}
		}(workerID)
	}
}

// processJob mengeksekusi pengiriman pesan per worker
func (e *GoWAHAEngine) processJob(workerID int, job *WhatsAppJob) {
	defer func() {
		if r := recover(); r != nil {
			atomic.AddUint64(&e.failedCount, 1)
			errStr := fmt.Sprintf("Panic tertangkap pada worker #%d saat memproses pesan ke %s: %v", workerID, job.Phone, r)
			log.Printf("[Go-WAHA Critical Alert] %s", errStr)
			_, _ = GlobalIncidentService.RecordIncident("whatsapp_engine", "critical", "WhatsApp Goroutine Worker Panic", errStr, "")
		}
	}()

	var err error
	if job.MediaURL != "" {
		_, err = GlobalWhatsAppService.SendMediaMessage(job.Phone, "Pelanggan", "broadcast", job.MediaType, job.MediaURL, job.Text)
	} else {
		err = GlobalWhatsAppService.SendCustomMessage(job.Phone, "Pelanggan", job.Text)
	}

	if err != nil {
		if job.Retry < 3 {
			job.Retry++
			log.Printf("[Go-WAHA Worker #%d] Retry pengiriman (%d/3) untuk %s karena: %v", workerID, job.Retry, job.Phone, err)
			time.Sleep(time.Duration(job.Retry*500) * time.Millisecond) // Exponential jitter backoff
			e.jobQueue <- job
			return
		}

		atomic.AddUint64(&e.failedCount, 1)
		errMsg := fmt.Sprintf("Gagal mengirim WhatsApp ke %s setelah 3x percobaan: %v", job.Phone, err)
		log.Printf("[Go-WAHA Worker #%d] %s", workerID, errMsg)
		_, _ = GlobalIncidentService.RecordIncident("whatsapp_engine", "error", "Kegagalan Antrean Pesan WhatsApp", errMsg, fmt.Sprintf("Job ID: %s, Text Snippet: %.40s", job.ID, job.Text))
		return
	}

	atomic.AddUint64(&e.processedCount, 1)
}

// EnqueueJob menambahkan pesan ke antrean goroutine berkapasitas tinggi
func (e *GoWAHAEngine) EnqueueJob(phone, text, mediaURL, mediaType, session string) (*WhatsAppJob, error) {
	if session == "" {
		session = "default"
	}

	job := &WhatsAppJob{
		ID:        uuid.New().String(),
		Session:   session,
		Phone:     phone,
		Text:      text,
		MediaURL:  mediaURL,
		MediaType: mediaType,
		Retry:     0,
		CreatedAt: time.Now(),
	}

	select {
	case e.jobQueue <- job:
		return job, nil
	default:
		errMsg := "Antrean WhatsApp Goroutine penuh (buffer overload). Harap tunggu beberapa saat."
		_, _ = GlobalIncidentService.RecordIncident("whatsapp_engine", "warning", "WhatsApp Queue Buffer Full", errMsg, "")
		return nil, fmt.Errorf("%s", errMsg)
	}
}

// BroadcastBulk membagi target broadcast ke dalam chunk goroutine paralel
func (e *GoWAHAEngine) BroadcastBulk(phones []string, text string, mediaURL, mediaType string) int {
	queued := 0
	for _, phone := range phones {
		if phone != "" {
			_, err := e.EnqueueJob(phone, text, mediaURL, mediaType, "default")
			if err == nil {
				queued++
			}
		}
	}
	return queued
}

// GetStats mengembalikan metrik engine konkuren
func (e *GoWAHAEngine) GetStats() WhatsAppEngineStats {
	return WhatsAppEngineStats{
		ActiveWorkers: e.workersCount,
		QueueCapacity: cap(e.jobQueue),
		PendingJobs:   len(e.jobQueue),
		ProcessedJobs: atomic.LoadUint64(&e.processedCount),
		FailedJobs:    atomic.LoadUint64(&e.failedCount),
		UptimeSeconds: int64(time.Since(e.startTime).Seconds()),
		EngineStatus:  "running",
	}
}

// GetSessions mengembalikan daftar sesi aktif
func (e *GoWAHAEngine) GetSessions() []map[string]interface{} {
	e.mu.RLock()
	defer e.mu.RUnlock()

	var list []map[string]interface{}
	for _, s := range e.sessions {
		list = append(list, s)
	}
	return list
}
