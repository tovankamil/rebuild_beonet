package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all LAN/local origins for WebRTC signaling
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// SignalMessage represents messages exchanged over WebRTC signaling
type SignalMessage struct {
	Type    string          `json:"type"` // "join", "room-users", "user-joined", "user-left", "offer", "answer", "candidate", "media-state", "chat", "end-meeting"
	RoomID  string          `json:"room_id"`
	FromID  string          `json:"from_id"`
	ToID    string          `json:"to_id,omitempty"`   // Targeted peer for offer/answer/candidate
	Sender  string          `json:"sender,omitempty"`  // Full name / display name
	Role    string          `json:"role,omitempty"`    // "admin", "host", "member", "guest"
	Payload json.RawMessage `json:"payload,omitempty"` // SDP offer/answer or ICE candidate
	State   *PeerMediaState `json:"state,omitempty"`   // Camera / Mic / Hand states
}

type PeerMediaState struct {
	IsCameraOn bool `json:"is_camera_on"`
	IsMicOn    bool `json:"is_mic_on"`
	IsHandUp   bool `json:"is_hand_up"`
}

type PeerUser struct {
	ID       string         `json:"id"`
	RoomID   string         `json:"room_id"`
	Username string         `json:"username"`
	FullName string         `json:"full_name"`
	Role     string         `json:"role"`
	State    PeerMediaState `json:"state"`
}

type PeerClient struct {
	User   PeerUser
	RoomID string
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *SignalingHub
	Done   chan struct{}
}

type SignalingHub struct {
	rooms map[string]map[string]*PeerClient // roomID -> peerID -> *PeerClient
	mu    sync.RWMutex
}

var GlobalSignalingHub = &SignalingHub{
	rooms: make(map[string]map[string]*PeerClient),
}

func (h *SignalingHub) AddClient(roomID string, client *PeerClient) []PeerUser {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[string]*PeerClient)
	}

	// Collect existing users to return to the newly joined peer
	existingUsers := make([]PeerUser, 0, len(h.rooms[roomID]))
	for _, p := range h.rooms[roomID] {
		if p.User.ID != client.User.ID {
			existingUsers = append(existingUsers, p.User)
		}
	}

	h.rooms[roomID][client.User.ID] = client
	log.Printf("[WebRTC Hub] Client joined: %s (%s) in room %s (total: %d)", client.User.FullName, client.User.ID, roomID, len(h.rooms[roomID]))
	return existingUsers
}

func (h *SignalingHub) RemoveClient(roomID string, peerID string) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[roomID]; ok {
		if client, exists := room[peerID]; exists {
			select {
			case <-client.Done:
			default:
				close(client.Done)
			}
			delete(room, peerID)
			log.Printf("[WebRTC Hub] Client left: %s from room %s (remaining: %d)", peerID, roomID, len(room))
		}
		if len(room) == 0 {
			delete(h.rooms, roomID)
		}
	}
}

func (h *SignalingHub) BroadcastToRoom(roomID string, senderID string, msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if room, ok := h.rooms[roomID]; ok {
		for id, client := range room {
			if id != senderID {
				select {
				case client.Send <- msg:
				default:
					log.Printf("[WebRTC Hub] Client %s buffer full, dropping message", id)
				}
			}
		}
	}
}

func (h *SignalingHub) SendToPeer(roomID string, targetID string, msg []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	if room, ok := h.rooms[roomID]; ok {
		if client, exists := room[targetID]; exists {
			select {
			case client.Send <- msg:
			default:
				log.Printf("[WebRTC Hub] Target %s buffer full, dropping message", targetID)
			}
		}
	}
}

func (h *SignalingHub) UpdateMediaState(roomID string, peerID string, state PeerMediaState) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, ok := h.rooms[roomID]; ok {
		if client, exists := room[peerID]; exists {
			client.User.State = state
		}
	}
}

func (c *PeerClient) ReadPump() {
	defer func() {
		c.Hub.RemoveClient(c.RoomID, c.User.ID)
		c.Conn.Close()

		// Broadcast user-left to remaining peers
		leaveMsg, _ := json.Marshal(SignalMessage{
			Type:   "user-left",
			RoomID: c.RoomID,
			FromID: c.User.ID,
			Sender: c.User.FullName,
		})
		c.Hub.BroadcastToRoom(c.RoomID, c.User.ID, leaveMsg)
	}()

	c.Conn.SetReadLimit(512 * 1024) // 512KB max message size for SDP
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, rawMsg, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebRTC Hub] WebSocket read error: %v", err)
			}
			break
		}

		var sigMsg SignalMessage
		if err := json.Unmarshal(rawMsg, &sigMsg); err != nil {
			log.Printf("[WebRTC Hub] JSON parse error: %v", err)
			continue
		}

		sigMsg.FromID = c.User.ID
		sigMsg.Sender = c.User.FullName
		sigMsg.Role = c.User.Role
		roomID := c.RoomID

		switch sigMsg.Type {
		case "offer", "answer", "candidate":
			// Targeted 1-on-1 signaling message between two peers
			if sigMsg.ToID != "" {
				sigMsg.RoomID = roomID
				forwardBytes, _ := json.Marshal(sigMsg)
				c.Hub.SendToPeer(roomID, sigMsg.ToID, forwardBytes)
			}

		case "media-state":
			// Update state and broadcast to everyone
			if sigMsg.State != nil {
				c.Hub.UpdateMediaState(roomID, c.User.ID, *sigMsg.State)
			}
			sigMsg.RoomID = roomID
			forwardBytes, _ := json.Marshal(sigMsg)
			c.Hub.BroadcastToRoom(roomID, c.User.ID, forwardBytes)

		case "chat":
			// Broadcast chat message to everyone in room
			sigMsg.RoomID = roomID
			forwardBytes, _ := json.Marshal(sigMsg)
			c.Hub.BroadcastToRoom(roomID, c.User.ID, forwardBytes)

		case "end-meeting":
			// Host ended meeting, broadcast to all
			sigMsg.RoomID = roomID
			forwardBytes, _ := json.Marshal(sigMsg)
			c.Hub.BroadcastToRoom(roomID, c.User.ID, forwardBytes)
		}
	}
}

func (c *PeerClient) WritePump() {
	ticker := time.NewTicker(25 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(msg)
			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}

		case <-c.Done:
			return
		}
	}
}

// MeetingSignalingHandler handles WebSocket upgrade and room joining
func (h *MeetingHandler) MeetingSignalingHandler(c *gin.Context) {
	roomID := c.Param("room_id")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "room_id required"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WebRTC Hub] Failed to upgrade to websocket: %v", err)
		return
	}

	// Extract query params for identity
	userID := c.Query("user_id")
	userName := c.Query("username")
	fullName := c.Query("full_name")
	role := c.Query("role")

	if userID == "" {
		userID = "user_" + time.Now().Format("150405.000")
	}
	if fullName == "" {
		if userName != "" {
			fullName = userName
		} else {
			fullName = "Peserta " + userID[:5]
		}
	}
	if role == "" {
		role = "member"
	}

	client := &PeerClient{
		User: PeerUser{
			ID:       userID,
			RoomID:   roomID,
			Username: userName,
			FullName: fullName,
			Role:     role,
			State: PeerMediaState{
				IsCameraOn: true,
				IsMicOn:    true,
				IsHandUp:   false,
			},
		},
		RoomID: roomID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    GlobalSignalingHub,
		Done:   make(chan struct{}),
	}

	// 1. Add to hub and obtain existing peers in the room
	existingUsers := GlobalSignalingHub.AddClient(roomID, client)

	// 2. Send the existing users list to the newly joined peer
	existingUsersPayload, _ := json.Marshal(existingUsers)
	initMsg, _ := json.Marshal(SignalMessage{
		Type:    "room-users",
		RoomID:  roomID,
		FromID:  userID,
		Payload: existingUsersPayload,
	})
	client.Send <- initMsg

	// 3. Broadcast to all existing peers that a new user joined
	joinPayload, _ := json.Marshal(client.User)
	userJoinedMsg, _ := json.Marshal(SignalMessage{
		Type:    "user-joined",
		RoomID:  roomID,
		FromID:  userID,
		Sender:  fullName,
		Role:    role,
		Payload: joinPayload,
	})
	GlobalSignalingHub.BroadcastToRoom(roomID, userID, userJoinedMsg)

	// Start pump goroutines
	go client.WritePump()
	client.ReadPump()
}
