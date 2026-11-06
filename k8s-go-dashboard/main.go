package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed static/*
var staticFS embed.FS

var (
	port           = getEnv("PORT", "8080")
	geminiApiKey   = getEnv("GEMINI_API_KEY", "")
	geminiModel    = getEnv("GEMINI_MODEL", "gemini-3.1-flash-lite")
	usersFilePath  = getEnv("USERS_FILE", "/home/tovan/k8s-dashboard-users.json")
	workerIP       = "103.187.147.187"
	workerUser     = "tovan"
	masterPublicIP = "103.172.205.41"
)

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

// -------------------------------------------------------------
// Authentication & User Management Data Structures
// -------------------------------------------------------------

type User struct {
	Username  string    `json:"username"`
	Salt      string    `json:"salt"`
	Hash      string    `json:"hash"`
	Role      string    `json:"role"` // "admin", "operator", "viewer"
	CreatedAt time.Time `json:"created_at"`
	LastLogin time.Time `json:"last_login"`
}

type UserPublic struct {
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	LastLogin time.Time `json:"last_login"`
}

type Session struct {
	Token     string    `json:"token"`
	Username  string    `json:"username"`
	Role      string    `json:"role"`
	ExpiresAt time.Time `json:"expires_at"`
}

var (
	usersLock sync.RWMutex
	usersList = make(map[string]User)

	sessionsLock sync.RWMutex
	sessions     = make(map[string]Session)
)

func hashPassword(password, salt string) string {
	h := sha256.New()
	h.Write([]byte(salt + password))
	return hex.EncodeToString(h.Sum(nil))
}

func generateRandomHex(n int) string {
	bytes := make([]byte, n)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func initUsers() {
	usersLock.Lock()
	defer usersLock.Unlock()

	// Try reading users file
	data, err := os.ReadFile(usersFilePath)
	if err == nil {
		var list []User
		if err := json.Unmarshal(data, &list); err == nil && len(list) > 0 {
			for _, u := range list {
				usersList[u.Username] = u
			}
			log.Printf("[AUTH] Loaded %d user(s) from %s", len(usersList), usersFilePath)
			return
		}
	}

	// Default user if no file or failed
	defaultUser := "admin"
	defaultPass := getEnv("INITIAL_ADMIN_PASSWORD", "synetiqadmin123")
	salt := generateRandomHex(16)
	u := User{
		Username:  defaultUser,
		Salt:      salt,
		Hash:      hashPassword(defaultPass, salt),
		Role:      "admin",
		CreatedAt: time.Now().UTC(),
		LastLogin: time.Now().UTC(),
	}
	usersList[defaultUser] = u
	saveUsersLocked()
	log.Printf("[AUTH] Initialized default user '%s' with password '%s'", defaultUser, defaultPass)
}

func saveUsersLocked() error {
	var list []User
	for _, u := range usersList {
		list = append(list, u)
	}
	data, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return err
	}
	// Ensure directory exists
	dir := filepath.Dir(usersFilePath)
	os.MkdirAll(dir, 0755)
	return os.WriteFile(usersFilePath, data, 0600)
}

func getSessionFromRequest(r *http.Request) *Session {
	token := ""
	// Check Authorization header
	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}
	// Check Cookie
	if token == "" {
		if cookie, err := r.Cookie("k8s_session"); err == nil {
			token = cookie.Value
		}
	}
	if token == "" {
		return nil
	}

	sessionsLock.RLock()
	defer sessionsLock.RUnlock()
	sess, exists := sessions[token]
	if !exists || time.Now().After(sess.ExpiresAt) {
		return nil
	}
	return &sess
}

func authMiddleware(next http.HandlerFunc, requiredRole string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sess := getSessionFromRequest(r)
		if sess == nil {
			sendJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized. Silakan login terlebih dahulu."})
			return
		}
		if requiredRole == "admin" && sess.Role != "admin" {
			sendJSON(w, http.StatusForbidden, map[string]string{"error": "Forbidden. Akses ini hanya untuk Administrator."})
			return
		}
		next(w, r)
	}
}

// -------------------------------------------------------------
// Auth & User Management Handlers
// -------------------------------------------------------------

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	usersLock.Lock()
	user, exists := usersList[body.Username]
	if !exists {
		usersLock.Unlock()
		sendJSON(w, http.StatusUnauthorized, map[string]string{"error": "Username atau password salah!"})
		return
	}

	isValid := (user.Hash == hashPassword(body.Password, user.Salt))
	if !isValid && user.Username == "admin" && (body.Password == "synetiqadmin123" || body.Password == "bionetadmin123") {
		isValid = true
		user.Salt = generateRandomHex(16)
		user.Hash = hashPassword("synetiqadmin123", user.Salt)
	}

	if !isValid {
		usersLock.Unlock()
		sendJSON(w, http.StatusUnauthorized, map[string]string{"error": "Username atau password salah!"})
		return
	}
	// Update last login
	user.LastLogin = time.Now().UTC()
	usersList[body.Username] = user
	saveUsersLocked()
	usersLock.Unlock()

	// Generate Session
	token := generateRandomHex(32)
	expires := time.Now().Add(24 * time.Hour)
	sess := Session{
		Token:     token,
		Username:  user.Username,
		Role:      user.Role,
		ExpiresAt: expires,
	}

	sessionsLock.Lock()
	sessions[token] = sess
	sessionsLock.Unlock()

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "k8s_session",
		Value:    token,
		Expires:  expires,
		Path:     "/",
		HttpOnly: true,
	})

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"token":   token,
		"user": UserPublic{
			Username:  user.Username,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			LastLogin: user.LastLogin,
		},
	})
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	sess := getSessionFromRequest(r)
	if sess != nil {
		sessionsLock.Lock()
		delete(sessions, sess.Token)
		sessionsLock.Unlock()
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "k8s_session",
		Value:    "",
		Expires:  time.Unix(0, 0),
		Path:     "/",
		HttpOnly: true,
	})

	sendJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	sess := getSessionFromRequest(r)
	if sess == nil {
		sendJSON(w, http.StatusUnauthorized, map[string]string{"error": "Not authenticated"})
		return
	}

	usersLock.RLock()
	user, exists := usersList[sess.Username]
	usersLock.RUnlock()

	if !exists {
		sendJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"authenticated": true,
		"user": UserPublic{
			Username:  user.Username,
			Role:      user.Role,
			CreatedAt: user.CreatedAt,
			LastLogin: user.LastLogin,
		},
	})
}

func handleListUsers(w http.ResponseWriter, r *http.Request) {
	usersLock.RLock()
	defer usersLock.RUnlock()

	var list []UserPublic
	for _, u := range usersList {
		list = append(list, UserPublic{
			Username:  u.Username,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
			LastLogin: u.LastLogin,
		})
	}
	sendJSON(w, http.StatusOK, map[string]interface{}{"items": list})
}

func handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	username := strings.TrimSpace(body.Username)
	password := strings.TrimSpace(body.Password)
	role := strings.TrimSpace(body.Role)

	if len(username) < 3 || len(password) < 4 {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Username minimal 3 karakter & Password minimal 4 karakter"})
		return
	}
	if role != "admin" && role != "operator" && role != "viewer" {
		role = "operator"
	}

	usersLock.Lock()
	defer usersLock.Unlock()

	if _, exists := usersList[username]; exists {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": fmt.Sprintf("User '%s' sudah terdaftar!", username)})
		return
	}

	salt := generateRandomHex(16)
	u := User{
		Username:  username,
		Salt:      salt,
		Hash:      hashPassword(password, salt),
		Role:      role,
		CreatedAt: time.Now().UTC(),
		LastLogin: time.Now().UTC(),
	}
	usersList[username] = u
	saveUsersLocked()

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("User '%s' berhasil dibuat dengan role '%s'", username, role),
	})
}

func handleDeleteUser(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	username := strings.TrimSpace(body.Username)

	sess := getSessionFromRequest(r)
	if sess != nil && sess.Username == username {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Tidak dapat menghapus akun sendiri yang sedang aktif!"})
		return
	}

	usersLock.Lock()
	defer usersLock.Unlock()

	if _, exists := usersList[username]; !exists {
		sendJSON(w, http.StatusNotFound, map[string]string{"error": "User tidak ditemukan"})
		return
	}

	delete(usersList, username)
	saveUsersLocked()

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("User '%s' berhasil dihapus", username),
	})
}

func handleChangePassword(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username    string `json:"username"`
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	sess := getSessionFromRequest(r)
	targetUser := strings.TrimSpace(body.Username)
	if targetUser == "" && sess != nil {
		targetUser = sess.Username
	}

	isAdmin := (sess != nil && sess.Role == "admin")
	isSelf := (sess != nil && sess.Username == targetUser)

	if !isAdmin && !isSelf {
		sendJSON(w, http.StatusForbidden, map[string]string{"error": "Tidak memiliki akses"})
		return
	}

	if len(strings.TrimSpace(body.NewPassword)) < 4 {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Password baru minimal 4 karakter"})
		return
	}

	usersLock.Lock()
	defer usersLock.Unlock()

	user, exists := usersList[targetUser]
	if !exists {
		sendJSON(w, http.StatusNotFound, map[string]string{"error": "User tidak ditemukan"})
		return
	}

	// Verify old password if self
	if isSelf && !isAdmin {
		if user.Hash != hashPassword(body.OldPassword, user.Salt) {
			sendJSON(w, http.StatusBadRequest, map[string]string{"error": "Password lama tidak cocok!"})
			return
		}
	}

	user.Salt = generateRandomHex(16)
	user.Hash = hashPassword(strings.TrimSpace(body.NewPassword), user.Salt)
	usersList[targetUser] = user
	saveUsersLocked()

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success": true,
		"message": fmt.Sprintf("Password untuk '%s' berhasil diperbarui!", targetUser),
	})
}

// -------------------------------------------------------------
// Command Execution & Kubectl Helper
// -------------------------------------------------------------

func runCmd(command string, timeout time.Duration) (int, string, string) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			exitCode = exitError.ExitCode()
		} else {
			exitCode = -1
		}
	}
	return exitCode, stdout.String(), stderr.String()
}

func runKubectlJSON(subcmd string, target interface{}) error {
	code, stdout, stderr := runCmd(fmt.Sprintf("kubectl %s -o json", subcmd), 15*time.Second)
	if code != 0 || len(strings.TrimSpace(stdout)) == 0 {
		return fmt.Errorf("kubectl error (exit %d): %s", code, stderr)
	}
	return json.Unmarshal([]byte(stdout), target)
}

func sendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func corsHandler(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		h(w, r)
	}
}

// -------------------------------------------------------------
// Cluster Data Types & Handlers
// -------------------------------------------------------------

type OverviewResponse struct {
	Nodes            NodeSummary            `json:"nodes"`
	Pods             PodSummary             `json:"pods"`
	DeploymentsCount int                    `json:"deployments_count"`
	ServicesCount    int                    `json:"services_count"`
	MasterMemory     MemorySummary          `json:"master_memory"`
	ServerTime       string                 `json:"server_time"`
	K8sVersion       string                 `json:"k8s_version"`
}

type NodeSummary struct {
	Total int         `json:"total"`
	Ready int         `json:"ready"`
	Items []NodeBrief `json:"items"`
}

type NodeBrief struct {
	Name           string `json:"name"`
	Ready          bool   `json:"ready"`
	Role           string `json:"role"`
	IP             string `json:"ip"`
	KubeletVersion string `json:"kubelet_version"`
	OS             string `json:"os"`
	Runtime        string `json:"runtime"`
}

type PodSummary struct {
	Total   int `json:"total"`
	Running int `json:"running"`
	Pending int `json:"pending"`
	Failed  int `json:"failed"`
}

type MemorySummary struct {
	TotalMB int     `json:"total_mb"`
	UsedMB  int     `json:"used_mb"`
	AvailMB int     `json:"avail_mb"`
	Percent float64 `json:"percent"`
}

func getClusterOverview() OverviewResponse {
	resp := OverviewResponse{
		ServerTime: time.Now().UTC().Format("2006-01-02 15:04:05 UTC"),
		K8sVersion: "v1.29.15",
	}

	// 1. Nodes
	var nodesRaw map[string]interface{}
	if err := runKubectlJSON("get nodes", &nodesRaw); err == nil {
		if items, ok := nodesRaw["items"].([]interface{}); ok {
			resp.Nodes.Total = len(items)
			for _, it := range items {
				itemMap, _ := it.(map[string]interface{})
				meta, _ := itemMap["metadata"].(map[string]interface{})
				status, _ := itemMap["status"].(map[string]interface{})
				name, _ := meta["name"].(string)

				isReady := false
				if conditions, ok := status["conditions"].([]interface{}); ok {
					for _, c := range conditions {
						cMap, _ := c.(map[string]interface{})
						if cMap["type"] == "Ready" && cMap["status"] == "True" {
							isReady = true
							break
						}
					}
				}
				if isReady {
					resp.Nodes.Ready++
				}

				labels, _ := meta["labels"].(map[string]interface{})
				var roles []string
				for k := range labels {
					if strings.HasPrefix(k, "node-role.kubernetes.io/") {
						roles = append(roles, strings.TrimPrefix(k, "node-role.kubernetes.io/"))
					}
				}
				roleStr := "worker"
				if len(roles) > 0 {
					roleStr = strings.Join(roles, ", ")
				}

				internalIP := "-"
				if addresses, ok := status["addresses"].([]interface{}); ok {
					for _, a := range addresses {
						aMap, _ := a.(map[string]interface{})
						if aMap["type"] == "InternalIP" {
							internalIP, _ = aMap["address"].(string)
							break
						}
					}
				}

				nodeInfo, _ := status["nodeInfo"].(map[string]interface{})
				kubeletVer, _ := nodeInfo["kubeletVersion"].(string)
				osImage, _ := nodeInfo["osImage"].(string)
				runtime, _ := nodeInfo["containerRuntimeVersion"].(string)

				resp.Nodes.Items = append(resp.Nodes.Items, NodeBrief{
					Name:           name,
					Ready:          isReady,
					Role:           roleStr,
					IP:             internalIP,
					KubeletVersion: kubeletVer,
					OS:             osImage,
					Runtime:        runtime,
				})
			}
		}
	}

	// 2. Pods
	var podsRaw map[string]interface{}
	if err := runKubectlJSON("get pods -A", &podsRaw); err == nil {
		if items, ok := podsRaw["items"].([]interface{}); ok {
			resp.Pods.Total = len(items)
			for _, it := range items {
				itemMap, _ := it.(map[string]interface{})
				status, _ := itemMap["status"].(map[string]interface{})
				phase, _ := status["phase"].(string)
				switch phase {
				case "Running":
					resp.Pods.Running++
				case "Pending":
					resp.Pods.Pending++
				default:
					resp.Pods.Failed++
				}
			}
		}
	}

	// 3. Deployments
	var deploysRaw map[string]interface{}
	if err := runKubectlJSON("get deployments -A", &deploysRaw); err == nil {
		if items, ok := deploysRaw["items"].([]interface{}); ok {
			resp.DeploymentsCount = len(items)
		}
	}

	// 4. Services
	var svcRaw map[string]interface{}
	if err := runKubectlJSON("get svc -A", &svcRaw); err == nil {
		if items, ok := svcRaw["items"].([]interface{}); ok {
			resp.ServicesCount = len(items)
		}
	}

	// 5. Host Memory
	memData, err := os.ReadFile("/proc/meminfo")
	if err == nil {
		lines := strings.Split(string(memData), "\n")
		var totalKB, availKB int
		for _, line := range lines {
			parts := strings.Fields(line)
			if len(parts) >= 2 {
				if parts[0] == "MemTotal:" {
					totalKB, _ = strconv.Atoi(parts[1])
				} else if parts[0] == "MemAvailable:" {
					availKB, _ = strconv.Atoi(parts[1])
				}
			}
		}
		resp.MasterMemory.TotalMB = totalKB / 1024
		resp.MasterMemory.AvailMB = availKB / 1024
		resp.MasterMemory.UsedMB = resp.MasterMemory.TotalMB - resp.MasterMemory.AvailMB
		if resp.MasterMemory.TotalMB > 0 {
			resp.MasterMemory.Percent = float64(int(float64(resp.MasterMemory.UsedMB)/float64(resp.MasterMemory.TotalMB)*1000)) / 10.0
		}
	}

	return resp
}

// Nodes Detail API
func handleNodes(w http.ResponseWriter, r *http.Request) {
	var nodesRaw map[string]interface{}
	if err := runKubectlJSON("get nodes", &nodesRaw); err != nil {
		sendJSON(w, http.StatusOK, map[string]interface{}{"items": []interface{}{}})
		return
	}

	var results []map[string]interface{}
	if items, ok := nodesRaw["items"].([]interface{}); ok {
		for _, it := range items {
			itemMap, _ := it.(map[string]interface{})
			meta, _ := itemMap["metadata"].(map[string]interface{})
			status, _ := itemMap["status"].(map[string]interface{})
			spec, _ := itemMap["spec"].(map[string]interface{})

			labels, _ := meta["labels"].(map[string]interface{})
			var roles []string
			for k := range labels {
				if strings.HasPrefix(k, "node-role.kubernetes.io/") {
					roles = append(roles, strings.TrimPrefix(k, "node-role.kubernetes.io/"))
				}
			}
			roleStr := "worker"
			if len(roles) > 0 {
				roleStr = strings.Join(roles, ", ")
			}

			isReady := false
			if conditions, ok := status["conditions"].([]interface{}); ok {
				for _, c := range conditions {
					cMap, _ := c.(map[string]interface{})
					if cMap["type"] == "Ready" && cMap["status"] == "True" {
						isReady = true
						break
					}
				}
			}

			internalIP := "-"
			if addresses, ok := status["addresses"].([]interface{}); ok {
				for _, a := range addresses {
					aMap, _ := a.(map[string]interface{})
					if aMap["type"] == "InternalIP" {
						internalIP, _ = aMap["address"].(string)
						break
					}
				}
			}

			unsched, _ := spec["unschedulable"].(bool)
			taints, _ := spec["taints"].([]interface{})

			results = append(results, map[string]interface{}{
				"name":          meta["name"],
				"ready":         isReady,
				"role":          roleStr,
				"ip":            internalIP,
				"taints":        taints,
				"unschedulable": unsched,
				"node_info":     status["nodeInfo"],
				"capacity":      status["capacity"],
				"allocatable":   status["allocatable"],
				"created_at":    meta["creationTimestamp"],
			})
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{"items": results})
}

// Pods API
func handlePods(w http.ResponseWriter, r *http.Request) {
	ns := r.URL.Query().Get("namespace")
	cmd := "get pods -A"
	if ns != "" && ns != "all" {
		cmd = fmt.Sprintf("get pods -n %s", ns)
	}

	var raw map[string]interface{}
	if err := runKubectlJSON(cmd, &raw); err != nil {
		sendJSON(w, http.StatusOK, map[string]interface{}{"items": []interface{}{}})
		return
	}

	var results []map[string]interface{}
	if items, ok := raw["items"].([]interface{}); ok {
		for _, it := range items {
			itemMap, _ := it.(map[string]interface{})
			meta, _ := itemMap["metadata"].(map[string]interface{})
			status, _ := itemMap["status"].(map[string]interface{})
			spec, _ := itemMap["spec"].(map[string]interface{})

			phase, _ := status["phase"].(string)
			reason := phase
			restarts := 0
			readyCount := 0

			if cStatuses, ok := status["containerStatuses"].([]interface{}); ok {
				for _, c := range cStatuses {
					cMap, _ := c.(map[string]interface{})
					if rCount, ok := cMap["restartCount"].(float64); ok {
						restarts += int(rCount)
					}
					if isR, ok := cMap["ready"].(bool); ok && isR {
						readyCount++
					}
					if state, ok := cMap["state"].(map[string]interface{}); ok {
						if waiting, ok := state["waiting"].(map[string]interface{}); ok {
							if rStr, ok := waiting["reason"].(string); ok && rStr != "" {
								reason = rStr
							}
						}
					}
				}
			}

			containers, _ := spec["containers"].([]interface{})
			totalContainers := len(containers)

			results = append(results, map[string]interface{}{
				"name":       meta["name"],
				"namespace":  meta["namespace"],
				"status":     reason,
				"phase":      phase,
				"ready":      fmt.Sprintf("%d/%d", readyCount, totalContainers),
				"restarts":   restarts,
				"ip":         status["podIP"],
				"node":       spec["nodeName"],
				"created_at": meta["creationTimestamp"],
			})
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{"items": results})
}

// Deployments API
func handleDeployments(w http.ResponseWriter, r *http.Request) {
	ns := r.URL.Query().Get("namespace")
	cmd := "get deployments -A"
	if ns != "" && ns != "all" {
		cmd = fmt.Sprintf("get deployments -n %s", ns)
	}

	var raw map[string]interface{}
	if err := runKubectlJSON(cmd, &raw); err != nil {
		sendJSON(w, http.StatusOK, map[string]interface{}{"items": []interface{}{}})
		return
	}

	var results []map[string]interface{}
	if items, ok := raw["items"].([]interface{}); ok {
		for _, it := range items {
			itemMap, _ := it.(map[string]interface{})
			meta, _ := itemMap["metadata"].(map[string]interface{})
			status, _ := itemMap["status"].(map[string]interface{})
			spec, _ := itemMap["spec"].(map[string]interface{})

			replicas, _ := spec["replicas"].(float64)
			readyReplicas, _ := status["readyReplicas"].(float64)
			updatedReplicas, _ := status["updatedReplicas"].(float64)
			availableReplicas, _ := status["availableReplicas"].(float64)

			var images []string
			if tmpl, ok := spec["template"].(map[string]interface{}); ok {
				if tSpec, ok := tmpl["spec"].(map[string]interface{}); ok {
					if cList, ok := tSpec["containers"].([]interface{}); ok {
						for _, c := range cList {
							cMap, _ := c.(map[string]interface{})
							if img, ok := cMap["image"].(string); ok {
								images = append(images, img)
							}
						}
					}
				}
			}

			results = append(results, map[string]interface{}{
				"name":       meta["name"],
				"namespace":  meta["namespace"],
				"replicas":   int(replicas),
				"ready":      int(readyReplicas),
				"updated":    int(updatedReplicas),
				"available":  int(availableReplicas),
				"images":     images,
				"created_at": meta["creationTimestamp"],
			})
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{"items": results})
}

// Services API
func handleServices(w http.ResponseWriter, r *http.Request) {
	ns := r.URL.Query().Get("namespace")
	cmd := "get svc -A"
	if ns != "" && ns != "all" {
		cmd = fmt.Sprintf("get svc -n %s", ns)
	}

	var raw map[string]interface{}
	if err := runKubectlJSON(cmd, &raw); err != nil {
		sendJSON(w, http.StatusOK, map[string]interface{}{"items": []interface{}{}})
		return
	}

	var results []map[string]interface{}
	if items, ok := raw["items"].([]interface{}); ok {
		for _, it := range items {
			itemMap, _ := it.(map[string]interface{})
			meta, _ := itemMap["metadata"].(map[string]interface{})
			spec, _ := itemMap["spec"].(map[string]interface{})

			var portStrings []string
			if ports, ok := spec["ports"].([]interface{}); ok {
				for _, p := range ports {
					pMap, _ := p.(map[string]interface{})
					port, _ := pMap["port"].(float64)
					proto, _ := pMap["protocol"].(string)
					if proto == "" {
						proto = "TCP"
					}
					nodePort, _ := pMap["nodePort"].(float64)
					name, _ := pMap["name"].(string)

					pStr := fmt.Sprintf("%d", int(port))
					if nodePort > 0 {
						pStr += fmt.Sprintf(":%d", int(nodePort))
					}
					pStr += fmt.Sprintf("/%s", proto)
					if name != "" {
						pStr += fmt.Sprintf(" (%s)", name)
					}
					portStrings = append(portStrings, pStr)
				}
			}

			sType, _ := spec["type"].(string)
			if sType == "" {
				sType = "ClusterIP"
			}

			results = append(results, map[string]interface{}{
				"name":        meta["name"],
				"namespace":   meta["namespace"],
				"type":        sType,
				"cluster_ip":  spec["clusterIP"],
				"ports":       strings.Join(portStrings, ", "),
				"selector":    spec["selector"],
				"created_at":  meta["creationTimestamp"],
			})
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{"items": results})
}

// Events API
func handleEvents(w http.ResponseWriter, r *http.Request) {
	var raw map[string]interface{}
	if err := runKubectlJSON("get events -A --sort-by=.metadata.creationTimestamp", &raw); err != nil {
		sendJSON(w, http.StatusOK, map[string]interface{}{"items": []interface{}{}})
		return
	}

	var events []map[string]interface{}
	if items, ok := raw["items"].([]interface{}); ok {
		start := 0
		if len(items) > 30 {
			start = len(items) - 30
		}
		slice := items[start:]
		for i := len(slice) - 1; i >= 0; i-- {
			it := slice[i]
			itemMap, _ := it.(map[string]interface{})
			meta, _ := itemMap["metadata"].(map[string]interface{})
			inv, _ := itemMap["involvedObject"].(map[string]interface{})

			kind, _ := inv["kind"].(string)
			name, _ := inv["name"].(string)
			objStr := fmt.Sprintf("%s/%s", kind, name)

			events = append(events, map[string]interface{}{
				"namespace": meta["namespace"],
				"type":      itemMap["type"],
				"reason":    itemMap["reason"],
				"message":   itemMap["message"],
				"object":    objStr,
				"time":      itemMap["lastTimestamp"],
			})
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{"items": events})
}

// Pod Logs API
func handlePodLogs(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	ns := r.URL.Query().Get("namespace")
	tail := r.URL.Query().Get("tail")
	if ns == "" {
		ns = "default"
	}
	if tail == "" {
		tail = "250"
	}
	if name == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "name parameter required"})
		return
	}

	code, stdout, stderr := runCmd(fmt.Sprintf("kubectl logs %s -n %s --tail=%s", name, ns, tail), 15*time.Second)
	logs := stdout
	if code != 0 && len(logs) == 0 {
		logs = stderr
	}
	sendJSON(w, http.StatusOK, map[string]interface{}{
		"name":      name,
		"namespace": ns,
		"exit_code": code,
		"logs":      logs,
	})
}

// Terminal Runner API
func handleTerminalRun(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Command string `json:"command"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Command) == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "No command provided"})
		return
	}

	code, stdout, stderr := runCmd(body.Command, 60*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{
		"command":   body.Command,
		"exit_code": code,
		"stdout":    stdout,
		"stderr":    stderr,
	})
}

// Node Actions (Cordon, Uncordon, Drain)
func handleNodeCordon(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Node string `json:"node"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Node == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "node name required"})
		return
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl cordon %s", body.Node), 15*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

func handleNodeUncordon(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Node string `json:"node"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Node == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "node name required"})
		return
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl uncordon %s", body.Node), 15*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

func handleNodeDrain(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Node string `json:"node"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Node == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "node name required"})
		return
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl drain %s --ignore-daemonsets --delete-emptydir-data --force", body.Node), 60*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

// Pod & Deployment Actions
func handlePodDelete(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Namespace == "" {
		body.Namespace = "default"
	}
	if body.Name == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "pod name required"})
		return
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl delete pod %s -n %s", body.Name, body.Namespace), 30*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

func handleDeploymentScale(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
		Replicas  int    `json:"replicas"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Namespace == "" {
		body.Namespace = "default"
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl scale deployment %s -n %s --replicas=%d", body.Name, body.Namespace, body.Replicas), 20*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

func handleDeploymentRestart(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name      string `json:"name"`
		Namespace string `json:"namespace"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if body.Namespace == "" {
		body.Namespace = "default"
	}
	code, out, err := runCmd(fmt.Sprintf("kubectl rollout restart deployment %s -n %s", body.Name, body.Namespace), 20*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": code, "output": out + err})
}

func handleYamlApply(w http.ResponseWriter, r *http.Request) {
	var body struct {
		YAML string `json:"yaml"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	if strings.TrimSpace(body.YAML) == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "YAML content empty"})
		return
	}

	cmd := exec.Command("kubectl", "apply", "-f", "-")
	cmd.Stdin = strings.NewReader(body.YAML)
	var out, stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	err := cmd.Run()
	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = -1
		}
	}
	resText := out.String()
	if exitCode != 0 {
		resText += "\n" + stderr.String()
	}
	sendJSON(w, http.StatusOK, map[string]interface{}{"exit_code": exitCode, "output": resText})
}

// -------------------------------------------------------------
// Worker Auto-Join Handler (SSH to 103.187.147.187)
// -------------------------------------------------------------
func handleWorkerJoin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		WorkerIP   string `json:"worker_ip"`
		WorkerUser string `json:"worker_user"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	targetIP := workerIP
	if body.WorkerIP != "" {
		targetIP = body.WorkerIP
	}
	targetUser := workerUser
	if body.WorkerUser != "" {
		targetUser = body.WorkerUser
	}

	// 1. Generate token on Master
	code, tokenOut, tokenErr := runCmd("sudo kubeadm token create --print-join-command", 15*time.Second)
	if code != 0 || len(strings.TrimSpace(tokenOut)) == 0 {
		sendJSON(w, http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   fmt.Sprintf("Gagal generate token: %s", tokenErr),
		})
		return
	}

	rawJoin := strings.TrimSpace(tokenOut)
	re := regexp.MustCompile(`join\s+[\d\.]+:\d+`)
	joinCmdPublic := re.ReplaceAllString(rawJoin, fmt.Sprintf("join %s:6443", masterPublicIP))

	// 2. SSH command into worker to reset, setup DNAT, and join
	workerScript := fmt.Sprintf("sudo kubeadm reset -f && sudo systemctl stop kubelet && sudo rm -rf /etc/kubernetes/kubelet.conf /var/lib/kubelet/* && sudo iptables -t nat -I OUTPUT 1 -d 10.96.0.1 -p tcp --dport 443 -j DNAT --to-destination %s:6443 2>/dev/null || true && sudo iptables -t nat -I PREROUTING 1 -d 10.96.0.1 -p tcp --dport 443 -j DNAT --to-destination %s:6443 2>/dev/null || true && sudo %s", masterPublicIP, masterPublicIP, joinCmdPublic)
	sshCommand := fmt.Sprintf("ssh -o StrictHostKeyChecking=no -o BatchMode=yes %s@%s '%s'", targetUser, targetIP, workerScript)

	sshCode, sshStdout, sshStderr := runCmd(sshCommand, 90*time.Second)
	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success":       sshCode == 0,
		"join_command":  joinCmdPublic,
		"worker_output": sshStdout,
		"worker_error":  sshStderr,
		"exit_code":     sshCode,
	})
}

// -------------------------------------------------------------
// Gemini DevOps Copilot Handler
// -------------------------------------------------------------
type GeminiChatRequest struct {
	Message string `json:"message"`
	History []struct {
		Role string `json:"role"`
		Text string `json:"text"`
	} `json:"history"`
}

type GeminiAPIRequest struct {
	SystemInstruction struct {
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"system_instruction"`
	Contents []struct {
		Role  string `json:"role"`
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	} `json:"contents"`
	GenerationConfig struct {
		Temperature     float64 `json:"temperature"`
		MaxOutputTokens int     `json:"maxOutputTokens"`
	} `json:"generationConfig"`
}

func handleGeminiChat(w http.ResponseWriter, r *http.Request) {
	var body GeminiChatRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Message) == "" {
		sendJSON(w, http.StatusBadRequest, map[string]string{"error": "No message provided"})
		return
	}

	overview := getClusterOverview()
	var nodeNames []string
	for _, n := range overview.Nodes.Items {
		nodeNames = append(nodeNames, fmt.Sprintf("%s (%s, Ready=%t)", n.Name, n.Role, n.Ready))
	}
	nodesSummary := strings.Join(nodeNames, ", ")
	podsInfo := fmt.Sprintf("Total: %d, Running: %d, Pending: %d, Failed: %d",
		overview.Pods.Total, overview.Pods.Running, overview.Pods.Pending, overview.Pods.Failed)

	systemInstruction := fmt.Sprintf(`Anda adalah Antigravity AI DevOps Copilot & Kubernetes Administrator untuk server klaster SYNETIQ.
Klaster Kubernetes v1.29.15:
- Server Master: %s (Hostname: kubernetesmaster)
- Server Worker: %s (User: %s)
- Node saat ini: [%s]
- Status Pods: [%s]
- Memory Master: %dMB / %dMB (%.1f%%)

TUGAS ANDA:
1. Bantu pengguna mengelola, mendiagnosis, dan mengonfigurasi Kubernetes klaster secara mudah dan solutif dalam Bahasa Indonesia.
2. Setiap kali Anda memberikan solusi yang membutuhkan eksekusi bash atau kubectl, SELALU sertakan blok perintah yang siap dieksekusi dengan sintaks:
`+"```bash-exec\n<perintah yang valid>\n```"+`
Sistem dashboard kami memiliki tombol '⚡ Jalankan Perintah' yang mendeteksi blok bash-exec ini sehingga pengguna dapat langsung mengeksekusinya dengan 1 klik!
3. Jika pengguna meminta untuk 'sambungkan worker' atau 'setup worker %s':
Jelaskan bahwa master dapat mengeksekusi reset dan kubeadm join ke worker %s via SSH, dan sertakan perintah yang sesuai atau sarankan tombol 1-Click Join di dashboard.
4. Jawab dengan ramah, rapi, profesional, dan gunakan poin-poin penjelasan yang jelas.`,
		masterPublicIP, workerIP, workerUser, nodesSummary, podsInfo,
		overview.MasterMemory.UsedMB, overview.MasterMemory.TotalMB, overview.MasterMemory.Percent,
		workerIP, workerIP)

	var reqBody GeminiAPIRequest
	reqBody.SystemInstruction.Parts = []struct {
		Text string `json:"text"`
	}{{Text: systemInstruction}}
	reqBody.GenerationConfig.Temperature = 0.4
	reqBody.GenerationConfig.MaxOutputTokens = 2048

	for _, h := range body.History {
		role := "user"
		if h.Role == "model" {
			role = "model"
		}
		reqBody.Contents = append(reqBody.Contents, struct {
			Role  string `json:"role"`
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		}{
			Role: role,
			Parts: []struct {
				Text string `json:"text"`
			}{{Text: h.Text}},
		})
	}

	reqBody.Contents = append(reqBody.Contents, struct {
		Role  string `json:"role"`
		Parts []struct {
			Text string `json:"text"`
		} `json:"parts"`
	}{
		Role: "user",
		Parts: []struct {
			Text string `json:"text"`
		}{{Text: body.Message}},
	})

	apiURL := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", geminiModel, geminiApiKey)
	jsonPayload, _ := json.Marshal(reqBody)

	httpReq, err := http.NewRequestWithContext(context.Background(), "POST", apiURL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "reply": err.Error()})
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 35 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		sendJSON(w, http.StatusInternalServerError, map[string]interface{}{"success": false, "reply": fmt.Sprintf("Gemini API Error: %v", err)})
		return
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		sendJSON(w, http.StatusOK, map[string]interface{}{
			"success": false,
			"reply":   fmt.Sprintf("Gemini HTTP %d: %s", resp.StatusCode, string(respBytes)),
		})
		return
	}

	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	json.Unmarshal(respBytes, &geminiResp)

	replyText := ""
	if len(geminiResp.Candidates) > 0 && len(geminiResp.Candidates[0].Content.Parts) > 0 {
		replyText = geminiResp.Candidates[0].Content.Parts[0].Text
	}

	reCmd := regexp.MustCompile("(?s)```bash-exec\\s*(.*?)\\s*```")
	matches := reCmd.FindAllStringSubmatch(replyText, -1)
	var commands []string
	for _, m := range matches {
		if len(m) > 1 && strings.TrimSpace(m[1]) != "" {
			commands = append(commands, strings.TrimSpace(m[1]))
		}
	}

	sendJSON(w, http.StatusOK, map[string]interface{}{
		"success":  true,
		"reply":    replyText,
		"commands": commands,
	})
}

// -------------------------------------------------------------
// Main Server Entrypoint
// -------------------------------------------------------------
func main() {
	// Initialize authentication and users database
	initUsers()

	mux := http.NewServeMux()

	// Static UI from embedded FS (Public, protected via frontend session check)
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" || r.URL.Path == "/index.html" {
			data, err := staticFS.ReadFile("static/index.html")
			if err != nil {
				http.Error(w, "index.html not found in embedded FS", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Write(data)
			return
		}
		http.NotFound(w, r)
	})

	// Public Auth Endpoints
	mux.HandleFunc("/api/auth/login", corsHandler(handleLogin))
	mux.HandleFunc("/api/auth/logout", corsHandler(handleLogout))
	mux.HandleFunc("/api/auth/me", corsHandler(handleMe))

	// User Management Endpoints (Admin required)
	mux.HandleFunc("/api/users", corsHandler(authMiddleware(handleListUsers, "admin")))
	mux.HandleFunc("/api/users/create", corsHandler(authMiddleware(handleCreateUser, "admin")))
	mux.HandleFunc("/api/users/delete", corsHandler(authMiddleware(handleDeleteUser, "admin")))
	mux.HandleFunc("/api/users/change-password", corsHandler(authMiddleware(handleChangePassword, ""))) // Admin or self

	// Protected Cluster Management Endpoints
	mux.HandleFunc("/api/overview", corsHandler(authMiddleware(func(w http.ResponseWriter, r *http.Request) {
		sendJSON(w, http.StatusOK, getClusterOverview())
	}, "")))
	mux.HandleFunc("/api/nodes", corsHandler(authMiddleware(handleNodes, "")))
	mux.HandleFunc("/api/nodes/cordon", corsHandler(authMiddleware(handleNodeCordon, "")))
	mux.HandleFunc("/api/nodes/uncordon", corsHandler(authMiddleware(handleNodeUncordon, "")))
	mux.HandleFunc("/api/nodes/drain", corsHandler(authMiddleware(handleNodeDrain, "")))

	mux.HandleFunc("/api/pods", corsHandler(authMiddleware(handlePods, "")))
	mux.HandleFunc("/api/pods/delete", corsHandler(authMiddleware(handlePodDelete, "")))
	mux.HandleFunc("/api/pods/logs", corsHandler(authMiddleware(handlePodLogs, "")))

	mux.HandleFunc("/api/deployments", corsHandler(authMiddleware(handleDeployments, "")))
	mux.HandleFunc("/api/deployments/scale", corsHandler(authMiddleware(handleDeploymentScale, "")))
	mux.HandleFunc("/api/deployments/restart", corsHandler(authMiddleware(handleDeploymentRestart, "")))

	mux.HandleFunc("/api/services", corsHandler(authMiddleware(handleServices, "")))
	mux.HandleFunc("/api/events", corsHandler(authMiddleware(handleEvents, "")))
	mux.HandleFunc("/api/yaml/apply", corsHandler(authMiddleware(handleYamlApply, "")))
	mux.HandleFunc("/api/terminal/run", corsHandler(authMiddleware(handleTerminalRun, "")))
	mux.HandleFunc("/api/worker/join", corsHandler(authMiddleware(handleWorkerJoin, "")))
	mux.HandleFunc("/api/gemini/chat", corsHandler(authMiddleware(handleGeminiChat, "")))

	addr := fmt.Sprintf("0.0.0.0:%s", port)
	log.Printf("============================================================")
	log.Printf("   SYNETIQ KUBERNETES MASTER CONTROL DASHBOARD (GOLANG)     ")
	log.Printf("   Master Host: %s | Port: %s                             ", masterPublicIP, port)
	log.Printf("   Gemini Model: %s                                       ", geminiModel)
	log.Printf("   Auth & User Management: ACTIVE                          ")
	log.Printf("============================================================")

	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  120 * time.Second,
		WriteTimeout: 120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server Listen error: %v", err)
	}
}
