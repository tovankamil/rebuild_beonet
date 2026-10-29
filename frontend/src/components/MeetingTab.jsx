import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Hand,
  Copy,
  Check,
  Plus,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  Share2,
  Volume2,
  Maximize2,
  Users,
  MessageSquare,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  Flame,
  UserCheck,
  HeartHandshake,
  Info,
  Pencil,
  Trash2,
  Pause,
  Play,
  Square,
  Download,
  Power,
  LayoutGrid,
  Maximize,
  MapPin,
  Mail,
  Phone,
  Radio,
  FileVideo,
  SwitchCamera,
  AlertTriangle,
  RotateCcw,
  Wifi,
} from 'lucide-react';
import api from '../services/api';
import LocalVideoStream from './meeting/LocalVideoStream';
import RemoteVideoStream from './meeting/RemoteVideoStream';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export default function MeetingTab({ user, setActiveTab }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [copiedRoom, setCopiedRoom] = useState(null);

  // In-Meeting Stage States
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (back)
  const [pipSwapped, setPipSwapped] = useState(false); // Mobile tap to swap active speaker & PiP
  const [mobileDrawer, setMobileDrawer] = useState(null); // 'chat' | 'participants' | 'attendees' | null
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat'); // For Desktop sidebar
  const [stageLayout, setStageLayout] = useState('gallery'); // 'gallery' | 'spotlight'
  const [meetingChat, setMeetingChat] = useState([
    {
      sender: 'Host Moderator',
      time: 'Sistem',
      message: 'Selamat datang di ruang Video Conference Bionet! Fitur Tatap Muka 2 Arah & Suara WebRTC aktif langsung.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [registeredAttendees, setRegisteredAttendees] = useState([]);
  const [cameraError, setCameraError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'

  // WebRTC Native Multi-User State
  const [remoteStreams, setRemoteStreams] = useState({}); // { [peerId]: MediaStream }
  const [remotePeers, setRemotePeers] = useState({}); // { [peerId]: { id, username, full_name, role, state } }

  // Refs for WebRTC & WebSocket
  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({}); // { [peerId]: RTCPeerConnection }
  const pendingCandidatesRef = useRef({}); // { [peerId]: [candidate] }
  const localStreamRef = useRef(null);

  // Check Secure Context for Mobile Camera API
  const isSecureContext =
    typeof window !== 'undefined'
      ? window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : true;

  // Responsive screen size tracking
  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recording State (MediaRecorder API)
  const [recordingStatus, setRecordingStatus] = useState('idle'); // 'idle' | 'recording' | 'paused'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Local media stream state
  const [localStream, setLocalStream] = useState(null);

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('bop');
  const [newDate, setNewDate] = useState('');
  const [newMaxP, setNewMaxP] = useState(100);

  // Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('bop');
  const [editDate, setEditDate] = useState('');
  const [editMaxP, setEditMaxP] = useState(100);
  const [editStatus, setEditStatus] = useState('scheduled');

  const isAdminOrHost =
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    (activeMeeting && (activeMeeting.host_id === user?.id || activeMeeting.host_name === user?.username));

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/meetings', {
        params: { category: categoryFilter },
      });
      if (res.data && res.data.data) {
        setMeetings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [categoryFilter]);

  const fetchAttendees = async (roomId) => {
    if (!roomId) return;
    try {
      const res = await api.get(`/meetings/${roomId}/attendees`);
      if (res.data?.data) {
        setRegisteredAttendees(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load attendees:', err.message);
    }
  };

  useEffect(() => {
    if (activeMeeting?.room_id) {
      fetchAttendees(activeMeeting.room_id);
    }
  }, [activeMeeting?.room_id]);

  // ==========================================
  // WEBRTC NATIVE ENGINE (2-Way & Multi-User)
  // ==========================================

  // 1. Resilient Camera Acquisition
  const initCameraStream = async (targetFacing = facingMode) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser tidak mendukung akses kamera di mode ini. Pastikan membuka via HTTPS (bukan HTTP biasa).');
      return null;
    }

    try {
      setCameraError(null);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      let stream = null;
      let lastErr = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch (e1) {
        lastErr = e1;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: targetFacing },
            audio: true,
          });
        } catch (e2) {
          lastErr = e2;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          } catch (e3) {
            lastErr = e3;
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            } catch (e4) {
              throw lastErr || e4;
            }
          }
        }
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Sync track states
      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) vTrack.enabled = isCameraOn;
      const aTrack = stream.getAudioTracks()[0];
      if (aTrack) aTrack.enabled = isMicOn;

      return stream;
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError(err.message || 'Izin kamera ditolak atau sedang digunakan aplikasi lain.');
      return null;
    }
  };

  // Helper: Get or Create RTCPeerConnection for a remote peer
  const getOrCreatePC = (peerId) => {
    if (peerConnectionsRef.current[peerId]) {
      return peerConnectionsRef.current[peerId];
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[peerId] = pc;

    // Attach local stream tracks to PC
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle remote media track arriving
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Received remote stream track from peer: ${peerId}`);
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [peerId]: event.streams[0],
        }));
      }
    };

    // Handle ICE Candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'candidate',
            to_id: peerId,
            payload: event.candidate,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        // Can retry or keep waiting for ICE restart
      }
    };

    return pc;
  };

  // Helper: Initiate Offer to peer
  const initiatePeerConnection = async (peerId) => {
    const pc = getOrCreatePC(peerId);
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'offer',
            to_id: peerId,
            payload: pc.localDescription,
          })
        );
      }
    } catch (err) {
      console.error(`[WebRTC] Failed to create offer for ${peerId}:`, err);
    }
  };

  // Helper: Handle incoming Offer
  const handleReceiveOffer = async (peerId, offer) => {
    const pc = getOrCreatePC(peerId);
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      // Flush pending ICE candidates
      if (pendingCandidatesRef.current[peerId]) {
        for (const cand of pendingCandidatesRef.current[peerId]) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        delete pendingCandidatesRef.current[peerId];
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'answer',
            to_id: peerId,
            payload: pc.localDescription,
          })
        );
      }
    } catch (err) {
      console.error(`[WebRTC] Failed to handle offer from ${peerId}:`, err);
    }
  };

  // Helper: Handle incoming Answer
  const handleReceiveAnswer = async (peerId, answer) => {
    const pc = peerConnectionsRef.current[peerId];
    if (!pc) return;
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      if (pendingCandidatesRef.current[peerId]) {
        for (const cand of pendingCandidatesRef.current[peerId]) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        }
        delete pendingCandidatesRef.current[peerId];
      }
    } catch (err) {
      console.error(`[WebRTC] Failed to handle answer from ${peerId}:`, err);
    }
  };

  // Helper: Handle incoming Candidate
  const handleReceiveCandidate = async (peerId, candidate) => {
    const pc = peerConnectionsRef.current[peerId];
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn(`[WebRTC] Error adding ICE candidate:`, err);
      }
    } else {
      if (!pendingCandidatesRef.current[peerId]) {
        pendingCandidatesRef.current[peerId] = [];
      }
      pendingCandidatesRef.current[peerId].push(candidate);
    }
  };

  // Helper: Close peer connection
  const closePeerConnection = (peerId) => {
    if (peerConnectionsRef.current[peerId]) {
      try {
        peerConnectionsRef.current[peerId].close();
      } catch (e) {}
      delete peerConnectionsRef.current[peerId];
    }
    delete pendingCandidatesRef.current[peerId];
  };

  // Connect to WebSocket Signaling Hub when in Active Meeting
  useEffect(() => {
    if (!activeMeeting?.room_id) {
      // Cleanup when exiting meeting
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {}
        wsRef.current = null;
      }
      Object.keys(peerConnectionsRef.current).forEach((peerId) => closePeerConnection(peerId));
      setRemoteStreams({});
      setRemotePeers({});
      setConnectionStatus('disconnected');
      return;
    }

    let isMounted = true;
    setConnectionStatus('connecting');

    // 1. Initialize local camera
    initCameraStream(facingMode).then((stream) => {
      if (!isMounted) return;

      // 2. Connect WebSocket
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const myId = user?.id || `user_${Math.random().toString(36).substring(2, 8)}`;
      const myUsername = user?.username || 'mitra';
      const myFullName = user?.full_name || user?.username || 'Mitra Bionet';
      const myRole = user?.role || 'member';

      const wsUrl = `${wsProtocol}//${window.location.host}/ws/meetings/${activeMeeting.room_id}?user_id=${myId}&username=${encodeURIComponent(
        myUsername
      )}&full_name=${encodeURIComponent(myFullName)}&role=${myRole}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnectionStatus('connected');
        console.log('[WebRTC Hub] Connected to room:', activeMeeting.room_id);
      };

      ws.onmessage = async (event) => {
        if (!isMounted) return;
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'room-users': {
              const users = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
              const peersObj = {};
              users.forEach((u) => {
                peersObj[u.id] = u;
              });
              setRemotePeers(peersObj);

              // Initiate peer connections to existing users
              users.forEach((u) => {
                initiatePeerConnection(u.id);
              });
              break;
            }

            case 'user-joined': {
              const newUser = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
              setRemotePeers((prev) => ({
                ...prev,
                [newUser.id]: newUser,
              }));
              break;
            }

            case 'offer': {
              await handleReceiveOffer(msg.from_id, msg.payload);
              break;
            }

            case 'answer': {
              await handleReceiveAnswer(msg.from_id, msg.payload);
              break;
            }

            case 'candidate': {
              await handleReceiveCandidate(msg.from_id, msg.payload);
              break;
            }

            case 'media-state': {
              const peerId = msg.from_id;
              if (msg.state) {
                setRemotePeers((prev) => {
                  if (!prev[peerId]) return prev;
                  return {
                    ...prev,
                    [peerId]: {
                      ...prev[peerId],
                      state: { ...prev[peerId].state, ...msg.state },
                    },
                  };
                });
              }
              break;
            }

            case 'chat': {
              const chatPayload = typeof msg.payload === 'string' ? JSON.parse(msg.payload) : msg.payload;
              setMeetingChat((prev) => [
                ...prev,
                {
                  sender: msg.sender || chatPayload.sender || 'Peserta',
                  time: chatPayload.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  message: chatPayload.message,
                },
              ]);
              break;
            }

            case 'user-left': {
              const peerId = msg.from_id;
              closePeerConnection(peerId);
              setRemotePeers((prev) => {
                const next = { ...prev };
                delete next[peerId];
                return next;
              });
              setRemoteStreams((prev) => {
                const next = { ...prev };
                delete next[peerId];
                return next;
              });
              break;
            }

            case 'end-meeting': {
              alert('Ruang pertemuan telah disudahi dan ditutup oleh Host.');
              handleLeaveMeeting();
              break;
            }
          }
        } catch (err) {
          console.error('[WebRTC Message Parse Error]:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WebRTC WebSocket Error]:', err);
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnectionStatus('disconnected');
      };
    });

    return () => {
      isMounted = false;
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (e) {}
        wsRef.current = null;
      }
      Object.keys(peerConnectionsRef.current).forEach((peerId) => closePeerConnection(peerId));
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
    };
  }, [activeMeeting?.room_id]);

  // Media Controls (Toggling mic/camera/hand with WebRTC broadcast)
  const toggleCamera = () => {
    const nextState = !isCameraOn;
    setIsCameraOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'media-state',
          state: { is_camera_on: nextState, is_mic_on: isMicOn, is_hand_up: isHandRaised },
        })
      );
    }
  };

  const toggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'media-state',
          state: { is_camera_on: isCameraOn, is_mic_on: nextState, is_hand_up: isHandRaised },
        })
      );
    }
  };

  const toggleHand = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'media-state',
          state: { is_camera_on: isCameraOn, is_mic_on: isMicOn, is_hand_up: nextState },
        })
      );
    }
  };

  // Flip Camera Front ⇄ Back on Mobile with live WebRTC replaceTrack
  const handleFlipCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    const newStream = await initCameraStream(nextFacing);
    if (newStream) {
      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack) {
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });
      }
    }
  };

  // Screen Sharing with WebRTC replaceTrack
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      const camStream = await initCameraStream(facingMode);
      if (camStream) {
        const camVideoTrack = camStream.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && camVideoTrack) sender.replaceTrack(camVideoTrack);
        });
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const displayVideoTrack = displayStream.getVideoTracks()[0];
        localStreamRef.current = displayStream;
        setLocalStream(displayStream);
        setIsScreenSharing(true);

        Object.values(peerConnectionsRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
          if (sender && displayVideoTrack) {
            sender.replaceTrack(displayVideoTrack);
          }
        });

        displayVideoTrack.onended = () => {
          setIsScreenSharing(false);
          initCameraStream(facingMode).then((camStream) => {
            if (camStream) {
              const camVideoTrack = camStream.getVideoTracks()[0];
              Object.values(peerConnectionsRef.current).forEach((pc) => {
                const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                if (sender && camVideoTrack) sender.replaceTrack(camVideoTrack);
              });
            }
          });
        };
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  // Recording Controls (MediaRecorder API)
  const startRecording = () => {
    try {
      const stream = localStreamRef.current;
      if (!stream || stream.getTracks().length === 0) {
        alert('Tidak ada audio/video stream aktif untuk direkam.');
        return;
      }

      recordedChunksRef.current = [];
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMime || 'video/webm' });
        const cleanTitle = (activeMeeting?.title || 'Bionet_Meeting').replace(/[^a-zA-Z0-9_-]/g, '_');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const fileName = `${cleanTitle}_${timestamp}.webm`;

        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        uploadRecordingToServer(blob, fileName);
      };

      recorder.start(1000);
      setRecordingStatus('recording');
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Gagal memulai perekaman: ' + err.message);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingStatus('paused');
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingStatus('recording');
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecordingStatus('idle');
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const uploadRecordingToServer = async (blob, fileName) => {
    if (!activeMeeting?.room_id) return;
    try {
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('recording_status', 'ready');

      await api.post(`/meetings/${activeMeeting.room_id}/recordings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.warn('Upload recording notice:', err.message);
    }
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleJoinMeeting = (meeting) => {
    setActiveMeeting(meeting);
    setIsCameraOn(true);
    setIsMicOn(true);
    setIsHandRaised(false);
    setRecordingStatus('idle');
    setRecordingSeconds(0);
    setMobileDrawer(null);
    setPipSwapped(false);
  };

  const handleLeaveMeeting = () => {
    if (recordingStatus !== 'idle') {
      stopRecording();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setActiveMeeting(null);
  };

  const handleEndMeetingForAll = async () => {
    if (!activeMeeting) return;
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin mengakhiri dan menutup room "${activeMeeting.title}" untuk SEMUA peserta?`
    );
    if (!confirmed) return;

    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end-meeting' }));
      }
      if (recordingStatus !== 'idle') {
        stopRecording();
      }
      await api.post(`/meetings/${activeMeeting.room_id}/end`);
      alert('Pertemuan telah resmi disudahi dan ditutup.');
      handleLeaveMeeting();
      fetchMeetings();
    } catch (err) {
      alert('Gagal menyudahi pertemuan: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCopyLink = (m) => {
    const inviteUrl = `${window.location.origin}/?meeting=${m.room_id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedRoom(m.room_id);
    setTimeout(() => setCopiedRoom(null), 3000);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const msgObj = {
      sender: user?.full_name || user?.username || 'Saya',
      time: nowTime,
      message: chatInput.trim(),
    };
    setMeetingChat((prev) => [...prev, msgObj]);

    // Send across WebRTC WebSocket hub
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'chat',
          payload: msgObj,
        })
      );
    }
    setChatInput('');
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/meetings', {
        title: newTitle,
        description: newDesc,
        category: newCategory,
        scheduled_at: newDate ? new Date(newDate).toISOString() : new Date().toISOString(),
        max_participants: Number(newMaxP) || 100,
      });
      if (res.data && res.data.data) {
        setMeetings((prev) => [res.data.data, ...prev]);
        setCreateModalOpen(false);
        handleJoinMeeting(res.data.data);
      }
    } catch (err) {
      alert('Gagal membuat room meeting: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenEdit = (m) => {
    setEditingMeeting(m);
    setEditTitle(m.title || '');
    setEditDesc(m.description || '');
    setEditCategory(m.category || 'bop');
    setEditDate(m.scheduled_at ? new Date(m.scheduled_at).toISOString().slice(0, 16) : '');
    setEditMaxP(m.max_participants || 100);
    setEditStatus(m.status || 'scheduled');
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      const res = await api.put(`/meetings/${editingMeeting.room_id}`, {
        title: editTitle,
        description: editDesc,
        category: editCategory,
        scheduled_at: editDate ? new Date(editDate).toISOString() : new Date().toISOString(),
        max_participants: Number(editMaxP) || 100,
        status: editStatus,
      });
      if (res.data?.data) {
        setMeetings((prev) =>
          prev.map((item) => (item.room_id === editingMeeting.room_id ? res.data.data : item))
        );
        if (activeMeeting?.room_id === editingMeeting.room_id) {
          setActiveMeeting(res.data.data);
        }
        setEditModalOpen(false);
        alert('Data room berhasil diperbarui!');
      }
    } catch (err) {
      alert('Gagal memperbarui room: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteMeeting = async (m) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus room "${m.title}"?`);
    if (!confirmed) return;
    try {
      await api.delete(`/meetings/${m.room_id}`);
      setMeetings((prev) => prev.filter((item) => item.room_id !== m.room_id));
      alert('Room berhasil dihapus.');
    } catch (err) {
      alert('Gagal menghapus room: ' + (err.response?.data?.error || err.message));
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'bop':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 flex items-center space-x-1">
            <Flame className="w-3 h-3 text-indigo-600" />
            <span>Webinar BOP Nasional</span>
          </span>
        );
      case 'kyc':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-700 border border-purple-500/20 flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>Video KYC Anti-Fraud</span>
          </span>
        );
      case 'herbal':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center space-x-1">
            <HeartHandshake className="w-3 h-3 text-emerald-600" />
            <span>Klinik &amp; Konsultasi Herbal</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            Training &amp; Edukasi
          </span>
        );
    }
  };

  // ==========================================
  // VIEW: 100% NATIVE WEBRTC LIVE ROOM
  // ==========================================
  if (activeMeeting) {
    const peersList = Object.values(remotePeers);
    const dominantPeer = peersList.length > 0 ? peersList[0] : null;

    // Sub-view: Host Spotlight Placeholder Tile (when no peer has joined yet)
    const renderHostTile = (isSmall = false) => (
      <div
        className={`bg-slate-900 rounded-3xl border border-indigo-500/30 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ${
          isSmall ? 'w-full h-full' : 'w-full h-full min-h-[220px]'
        }`}
      >
        <div
          className={`rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black shadow-2xl relative ${
            isSmall ? 'w-12 h-12 text-lg' : 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl'
          }`}
        >
          <span>B</span>
          <span className="absolute -bottom-1 -right-1 p-1 bg-indigo-500 rounded-full border-2 border-slate-900 text-white">
            <Volume2 className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 animate-pulse'} />
          </span>
        </div>

        {!isSmall && (
          <div className="mt-4 text-center space-y-1 px-4">
            <h4 className="font-extrabold text-white text-base sm:text-lg">
              {activeMeeting.host_name || 'Presenter Utama Bionet'}
            </h4>
            <p className="text-xs text-indigo-300 font-medium">Menunggu mitra lain bergabung...</p>

            <div className="flex items-center justify-center space-x-1 pt-2">
              <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-pulse" />
              <span className="w-1.5 h-6 bg-indigo-400 rounded-full animate-pulse delay-75" />
              <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 border border-slate-800">
          <span className="text-indigo-400">Host (Moderator)</span>
        </div>
      </div>
    );

    // Sub-view: Remote Peer Tile with LIVE 2-WAY Video Stream
    const renderRemotePeerTile = (peer, isSmall = false) => {
      const peerStream = remoteStreams[peer.id];
      const isVideoActive = peerStream && peer.state?.is_camera_on;
      const isMicActive = peer.state?.is_mic_on;

      return (
        <div
          key={peer.id}
          className={`bg-slate-900 rounded-3xl border border-indigo-500/40 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-300 ring-1 ring-indigo-500/20 ${
            isSmall ? 'w-full h-full' : 'w-full h-full min-h-[220px]'
          }`}
        >
          {isVideoActive ? (
            <RemoteVideoStream
              stream={peerStream}
              isMuted={false}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 p-4">
              <div
                className={`rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white font-black shadow-2xl relative ${
                  isSmall ? 'w-12 h-12 text-lg' : 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl'
                }`}
              >
                <span>{(peer.full_name || peer.username || 'M').charAt(0).toUpperCase()}</span>
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-slate-900 text-white">
                  <Volume2 className={isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 animate-pulse'} />
                </span>
              </div>

              {!isSmall && (
                <div className="text-center space-y-1 px-4">
                  <h4 className="font-extrabold text-white text-base sm:text-lg">
                    {peer.full_name || peer.username}
                  </h4>
                  <p className="text-xs text-emerald-300 font-medium">
                    {peer.role === 'admin' ? 'Administrator' : 'Mitra Peserta (Online)'} &bull; Terhubung Live (P2P)
                  </p>

                  {isMicActive && (
                    <div className="flex items-center justify-center space-x-1 pt-2">
                      <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse delay-100" />
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Name Tag & Mic Indicator */}
          <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1.5 border border-slate-800 z-10">
            <span className="truncate max-w-[120px] text-white">{peer.full_name || peer.username}</span>
            {isMicActive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <MicOff className="w-3 h-3 text-red-400" />
            )}
          </div>

          {peer.state?.is_hand_up && (
            <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center space-x-1 shadow-lg animate-bounce z-10">
              <Hand className="w-3 h-3 fill-slate-950" />
              <span>Angkat Tangan</span>
            </div>
          )}
        </div>
      );
    };

    // Sub-view: Local User Camera Tile
    const renderLocalUserTile = (isSmall = false) => (
      <div
        className={`bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isSmall ? 'w-full h-full' : 'w-full h-full min-h-[220px]'
        }`}
      >
        {isCameraOn && localStream ? (
          <LocalVideoStream
            stream={localStream}
            isMirrored={facingMode === 'user'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center space-y-2 p-2">
            <div
              className={`rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-black shadow-inner ${
                isSmall ? 'w-10 h-10 text-sm' : 'w-20 h-20 text-2xl'
              }`}
            >
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            {!isSmall && (
              <span className="text-xs text-slate-400 font-semibold">
                {isCameraOn ? 'Menghubungkan Kamera...' : 'Kamera Dinonaktifkan'}
              </span>
            )}
          </div>
        )}

        {/* Tag & Mic Indicator */}
        <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 border border-slate-800 z-10">
          <span className="truncate max-w-[90px]">{user?.full_name || 'Anda'}</span>
          {isMicOn ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ) : (
            <MicOff className="w-3 h-3 text-red-400" />
          )}
        </div>

        {isHandRaised && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center space-x-1 shadow-lg animate-bounce z-10">
            <Hand className="w-3 h-3 fill-slate-950" />
            <span>Angkat Tangan</span>
          </div>
        )}
      </div>
    );

    return (
      <div className="fixed inset-0 z-[150] bg-[#050811] text-white flex flex-col h-[100dvh] overflow-hidden select-none">
        {/* HTTPS Warning Banner if accessed on insecure mobile HTTP */}
        {!isSecureContext && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-200 flex items-center justify-between z-30 flex-shrink-0">
            <div className="flex items-center space-x-1.5 truncate min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">
                Kamera HP memerlukan HTTPS. Buka via <strong>https://{typeof window !== 'undefined' ? window.location.hostname : ''}:{typeof window !== 'undefined' ? (window.location.port || '5173') : '5173'}</strong>
              </span>
            </div>
            <a
              href={typeof window !== 'undefined' ? window.location.href.replace(/^http:/, 'https:') : '#'}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] ml-2 flex-shrink-0 transition shadow-sm"
            >
              Buka HTTPS
            </a>
          </div>
        )}

        {/* Camera Permission / Device Error Banner */}
        {cameraError && (
          <div className="bg-red-500/20 border-b border-red-500/30 px-3 py-1.5 text-[11px] text-red-200 flex items-center justify-between z-30 flex-shrink-0">
            <div className="flex items-center space-x-1.5 truncate min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="truncate">{cameraError}</span>
            </div>
            <button
              onClick={() => initCameraStream(facingMode)}
              className="px-2.5 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] ml-2 flex-shrink-0 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Top Header Command Bar */}
        <header className="h-14 sm:h-16 px-3 sm:px-6 bg-slate-900/95 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs sm:text-base font-black text-white truncate max-w-[160px] sm:max-w-md">
                  {activeMeeting.title}
                </h2>
                <span className="inline-flex px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black items-center space-x-1 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE NATIVE</span>
                </span>
                {recordingStatus === 'recording' && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black items-center space-x-1 shadow-md shadow-red-950 animate-pulse">
                    <span>REC {formatTimer(recordingSeconds)}</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center space-x-1.5">
                <span>Room: <strong className="text-cyan-400 font-mono">{activeMeeting.room_id}</strong></span>
                <span>&bull;</span>
                <span>Host: <strong className="text-white">{activeMeeting.host_name || 'Admin'}</strong></span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{1 + peersList.length} Peserta Live</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Flip Camera (HP Mobile Quick Action) */}
            <button
              onClick={handleFlipCamera}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 border border-slate-700"
              title="Balik Kamera Depan / Belakang"
            >
              <SwitchCamera className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Balik Kamera</span>
            </button>

            {/* Screen Share (Desktop) */}
            <button
              onClick={toggleScreenShare}
              className={`hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                isScreenSharing
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Bagi Layar Presentasi"
            >
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span>{isScreenSharing ? 'Stop Berbagi' : 'Bagi Layar'}</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => handleCopyLink(activeMeeting)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 border border-slate-700"
              title="Salin Link Publik"
            >
              {copiedRoom === activeMeeting.room_id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{copiedRoom === activeMeeting.room_id ? 'Tersalin' : 'Undang'}</span>
            </button>

            {/* End Room (Admin/Host) or Leave */}
            {isAdminOrHost ? (
              <button
                onClick={handleEndMeetingForAll}
                className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-black transition flex items-center space-x-1 shadow-md shadow-red-950"
                title="Akhiri Pertemuan untuk Semua"
              >
                <Power className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sudahi</span>
              </button>
            ) : (
              <button
                onClick={handleLeaveMeeting}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-red-950"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        </header>

        {/* Video Canvas Stage & Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          <div className="flex-1 bg-[#050811] p-2 sm:p-4 flex flex-col justify-between overflow-hidden relative">
            {/* ZOOM / GMEET 100% NATIVE WEBRTC MULTI-USER STAGE */}
            <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
              {!isMobileScreen ? (
                /* 1. DESKTOP VIEW: Multi-User Grid with Real Live 2-Way Video */
                <div
                  className={`grid gap-4 w-full h-full max-h-[75vh] ${
                    peersList.length >= 2 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'
                  }`}
                >
                  {renderLocalUserTile(false)}
                  {peersList.length > 0 ? (
                    peersList.map((p) => renderRemotePeerTile(p, false))
                  ) : (
                    renderHostTile(false)
                  )}
                </div>
              ) : (
                /* 2. MOBILE VIEW: Full-Screen Dominant Active Speaker + Floating PiP */
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-2xl">
                  {/* Dominant Main Video */}
                  <div className="w-full h-full">
                    {pipSwapped
                      ? renderLocalUserTile(false)
                      : dominantPeer
                      ? renderRemotePeerTile(dominantPeer, false)
                      : renderHostTile(false)}
                  </div>

                  {/* Floating PiP (Picture-in-Picture) Camera Card (Tap to swap!) */}
                  <div
                    onClick={() => setPipSwapped((prev) => !prev)}
                    className="absolute bottom-20 right-3 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl border-2 border-indigo-500/80 shadow-2xl z-30 overflow-hidden cursor-pointer active:scale-95 transition-transform bg-slate-950"
                    title="Ketuk untuk menukar tampilan layar"
                  >
                    {pipSwapped
                      ? dominantPeer
                        ? renderRemotePeerTile(dominantPeer, true)
                        : renderHostTile(true)
                      : renderLocalUserTile(true)}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-[8px] font-black text-indigo-300 pointer-events-none">
                      Ketuk Tukar
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP SIDEBAR (md:flex) */}
          <div className="hidden md:flex w-80 bg-slate-900 border-l border-slate-800 flex-col h-full flex-shrink-0">
            <div className="flex items-center border-b border-slate-800 p-2 space-x-1">
              <button
                onClick={() => setActiveSidebarTab('chat')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  activeSidebarTab === 'chat' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat ({meetingChat.length})</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('participants')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  activeSidebarTab === 'participants' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Peserta ({1 + peersList.length})</span>
              </button>
              <button
                onClick={() => setActiveSidebarTab('attendees')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  activeSidebarTab === 'attendees' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tamu ({registeredAttendees.length})</span>
              </button>
            </div>

            {/* Desktop Sidebar Content */}
            <div className="flex-1 overflow-hidden p-3 flex flex-col justify-between">
              {activeSidebarTab === 'chat' ? (
                <>
                  <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-xs">
                    {meetingChat.map((m, idx) => (
                      <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-indigo-300">{m.sender}</span>
                          <span>{m.time}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="pt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Tulis pesan..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : activeSidebarTab === 'participants' ? (
                <div className="space-y-2 overflow-y-auto flex-1 text-xs">
                  {/* Local User Self */}
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[11px] text-white">
                        {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white leading-tight">
                          {user?.full_name || user?.username} (Anda)
                        </div>
                        <div className="text-[10px] text-slate-400">Mitra Peserta</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400" />}
                      {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>

                  {/* Remote Peers Connected Live */}
                  {peersList.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white ${
                            p.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                          }`}
                        >
                          {(p.full_name || p.username || 'M').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">{p.full_name || p.username}</div>
                          <div className="text-[10px] text-emerald-400">
                            {p.role === 'admin' ? 'Administrator' : 'Mitra Peserta (Online)'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {p.state?.is_hand_up && <Hand className="w-3.5 h-3.5 text-amber-400" />}
                        {p.state?.is_mic_on ? (
                          <Mic className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <MicOff className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto flex-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                    <span>Presensi Tamu Publik</span>
                    <button
                      onClick={() => fetchAttendees(activeMeeting.room_id)}
                      className="text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      Refresh
                    </button>
                  </div>
                  {registeredAttendees.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      Belum ada tamu publik yang mendaftar.
                    </div>
                  ) : (
                    registeredAttendees.map((att) => (
                      <div key={att.id} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                        <strong className="text-white text-xs block">{att.full_name}</strong>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span>{att.phone}</span>
                          <span>&bull;</span>
                          <span className="truncate">{att.address}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SLIDE-UP BOTTOM SHEET (Zoom Style: Chat, Peserta, Tamu) */}
        {mobileDrawer && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
            <div
              onClick={() => setMobileDrawer(null)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <div className="relative z-10 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl max-h-[75dvh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMobileDrawer('chat')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      mobileDrawer === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Chat ({meetingChat.length})
                  </button>
                  <button
                    onClick={() => setMobileDrawer('participants')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      mobileDrawer === 'participants' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Peserta ({1 + peersList.length})
                  </button>
                  <button
                    onClick={() => setMobileDrawer('attendees')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      mobileDrawer === 'attendees' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tamu ({registeredAttendees.length})
                  </button>
                </div>
                <button
                  onClick={() => setMobileDrawer(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 min-h-[220px]">
                {mobileDrawer === 'chat' ? (
                  <div className="flex flex-col h-full justify-between space-y-3">
                    <div className="space-y-2 overflow-y-auto max-h-[45dvh] pr-1">
                      {meetingChat.map((m, idx) => (
                        <div key={idx} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="font-bold text-indigo-300">{m.sender}</span>
                            <span>{m.time}</span>
                          </div>
                          <p className="text-slate-200 text-xs leading-relaxed">{m.message}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Tulis pesan..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="p-2 rounded-xl bg-indigo-600 text-white flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ) : mobileDrawer === 'participants' ? (
                  <div className="space-y-2 text-xs">
                    {/* Local User */}
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center font-bold text-[11px] text-white">
                          {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user?.full_name || user?.username} (Anda)</div>
                          <div className="text-[10px] text-slate-400">Mitra Peserta</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {isHandRaised && <Hand className="w-3.5 h-3.5 text-amber-400" />}
                        {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                      </div>
                    </div>

                    {/* Remote Peers */}
                    {peersList.map((p) => (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white ${
                              p.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                            }`}
                          >
                            {(p.full_name || p.username || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{p.full_name || p.username}</div>
                            <div className="text-[10px] text-emerald-400">
                              {p.role === 'admin' ? 'Administrator' : 'Mitra Peserta (Online)'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {p.state?.is_hand_up && <Hand className="w-3.5 h-3.5 text-amber-400" />}
                          {p.state?.is_mic_on ? (
                            <Mic className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <MicOff className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {registeredAttendees.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        Belum ada tamu publik yang mengisi presensi.
                      </div>
                    ) : (
                      registeredAttendees.map((att) => (
                        <div key={att.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <strong className="text-white text-xs block">{att.full_name}</strong>
                          <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                            <span>{att.phone}</span>
                            <span>&bull;</span>
                            <span className="truncate">{att.address}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM FLOATING DOCK (Zoom / Google Meet Mobile Ergo) */}
        <footer className="h-20 px-2 sm:px-4 bg-slate-900/95 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-around sm:justify-center sm:space-x-3 flex-shrink-0 py-2.5 z-40 safe-bottom">
          {/* 1. Mic */}
          <button
            onClick={toggleMic}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-90 ${
              isMicOn ? 'text-white' : 'text-red-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isMicOn ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' : 'bg-red-600 text-white ring-2 ring-red-400'
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5 text-emerald-400" /> : <MicOff className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold mt-1">{isMicOn ? 'Bicara' : 'Mute'}</span>
          </button>

          {/* 2. Video */}
          <button
            onClick={toggleCamera}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-90 ${
              isCameraOn ? 'text-white' : 'text-red-400'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isCameraOn ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' : 'bg-red-600 text-white ring-2 ring-red-400'
              }`}
            >
              {isCameraOn ? <Video className="w-5 h-5 text-indigo-400" /> : <VideoOff className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-bold mt-1">{isCameraOn ? 'Kamera' : 'Mati'}</span>
          </button>

          {/* 3. Flip Camera (Mobile Special) */}
          <button
            onClick={handleFlipCamera}
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white transition active:scale-90"
            title="Balik Kamera Depan / Belakang"
          >
            <div className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center shadow-md">
              <SwitchCamera className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold mt-1">Balik</span>
          </button>

          {/* 4. Chat Toggle */}
          <button
            onClick={() => setMobileDrawer((prev) => (prev === 'chat' ? null : 'chat'))}
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white transition active:scale-90 relative"
          >
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-md ${
                mobileDrawer === 'chat'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-1">Chat</span>
            {meetingChat.length > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-indigo-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {meetingChat.length}
              </span>
            )}
          </button>

          {/* 5. Peserta Toggle */}
          <button
            onClick={() => setMobileDrawer((prev) => (prev === 'participants' ? null : 'participants'))}
            className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white transition active:scale-90 relative"
          >
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-md ${
                mobileDrawer === 'participants' || mobileDrawer === 'attendees'
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-1">Peserta</span>
            {(1 + peersList.length) > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                {1 + peersList.length}
              </span>
            )}
          </button>

          {/* 6. Record Controls (Khusus Admin / Host) */}
          {isAdminOrHost && (
            <div className="hidden sm:flex items-center space-x-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
              {recordingStatus === 'idle' ? (
                <button
                  onClick={startRecording}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-red-950"
                  title="Mulai Rekam Sesi Meeting"
                >
                  <Radio className="w-4 h-4 text-white" />
                  <span>Rekam</span>
                </button>
              ) : (
                <>
                  {recordingStatus === 'recording' ? (
                    <button
                      onClick={pauseRecording}
                      className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={stopRecording}
                    className="px-2.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center space-x-1"
                  >
                    <Square className="w-3 h-3 fill-white" />
                    <span>Stop</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* 7. Raise Hand */}
          <button
            onClick={toggleHand}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition active:scale-90 ${
              isHandRaised ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                isHandRaised
                  ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}
            >
              <Hand className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold mt-1">Angkat</span>
          </button>

          {/* 8. End Call / Leave Button */}
          {isAdminOrHost ? (
            <button
              onClick={handleEndMeetingForAll}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white font-black text-xs transition flex items-center space-x-1.5 shadow-lg shadow-red-950 border border-red-600/40"
              title="Akhiri Pertemuan untuk Semua"
            >
              <Power className="w-4 h-4" />
              <span className="hidden sm:inline">Sudahi</span>
            </button>
          ) : (
            <button
              onClick={handleLeaveMeeting}
              className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition flex items-center space-x-1.5 shadow-lg shadow-red-950"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          )}
        </footer>
      </div>
    );
  }

  // VIEW: LOBBY & SCHEDULE OF MEETINGS
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Video Conference, BOP Webinar &amp; Video KYC Anti-Fraud</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Ruang Pertemuan Digital Bionet v6
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Ikuti Webinar Akbar BOP Nasional, sesi verifikasi tatap muka Video KYC Anti-Fraud, serta konsultasi kesehatan live bersama dokter dan herbalis resmi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-950 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Room Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Semua Ruang' },
          { id: 'bop', label: 'Webinar BOP' },
          { id: 'kyc', label: 'Video KYC Anti-Fraud' },
          { id: 'herbal', label: 'Konsultasi Herbal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              categoryFilter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meeting Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-semibold">
          Memuat jadwal room video conference...
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Belum Ada Room Pertemuan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol &ldquo;Buat Room Baru&rdquo; untuk memulai sesi video conference BOP atau konsultasi kemitraan Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => {
            const isLive = m.status === 'live';
            const isFinished = m.status === 'ended';
            const canManage = user?.role === 'admin' || user?.role === 'superadmin' || m.host_id === user?.id;

            return (
              <div
                key={m.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(m.category)}
                    {isLive ? (
                      <span className="flex items-center space-x-1 text-[10px] font-black uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        <span>LIVE NOW</span>
                      </span>
                    ) : isFinished ? (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                        Terjadwal
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {m.description || 'Tidak ada deskripsi agenda.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Host:</span>
                      <span className="font-bold text-slate-800">{m.host_name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Kapasitas:</span>
                      <span className="font-mono font-semibold">{m.max_participants || 100} Peserta</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Jadwal:</span>
                      <span className="font-semibold text-indigo-700">
                        {new Date(m.scheduled_at || m.created_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyLink(m)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center"
                    title="Salin Link Undangan Publik"
                  >
                    {copiedRoom === m.room_id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {canManage && (
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center"
                      title="Edit Detail Room"
                    >
                      <Pencil className="w-4 h-4 text-indigo-600" />
                    </button>
                  )}

                  {canManage && (
                    <button
                      onClick={() => handleDeleteMeeting(m)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-bold transition flex items-center justify-center"
                      title="Hapus / Tutup Room"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleJoinMeeting(m)}
                    disabled={isFinished}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-2 ${
                      isFinished
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>{isFinished ? 'Sesi Selesai' : 'Masuk Room'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[160] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Buat Room Video Conference Baru</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Topik Pertemuan:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Webinar Peluang Sukses Kemitraan Bionet"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Agenda:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bop">Webinar BOP Nasional (Presentasi Bisnis)</option>
                  <option value="kyc">Video KYC Anti-Fraud (Validasi Reward &amp; Akun)</option>
                  <option value="herbal">Klinik Herbal &amp; Konsultasi Kesehatan</option>
                  <option value="training">Training Leadership &amp; Marketing Plan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Agenda Pembahasan:</label>
                <textarea
                  rows="2"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Rincian topik yang akan dibahas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Waktu Pelaksanaan:</label>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kapasitas Maksimal:</label>
                  <input
                    type="number"
                    min="2"
                    max="500"
                    value={newMaxP}
                    onChange={(e) => setNewMaxP(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center space-x-1.5"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Mulai Pertemuan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEETING MODAL (Admin & Host) */}
      {editModalOpen && editingMeeting && (
        <div className="fixed inset-0 z-[160] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Edit Room Video Conference</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Judul / Topik Pertemuan:</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Agenda:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bop">Webinar BOP Nasional</option>
                    <option value="kyc">Video KYC Anti-Fraud</option>
                    <option value="herbal">Klinik Herbal &amp; Konsultasi</option>
                    <option value="training">Training Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status Room:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="live">🔴 Live Sekarang</option>
                    <option value="scheduled">📅 Terjadwal</option>
                    <option value="ended">⏹ Selesai / Ditutup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi / Agenda Pembahasan:</label>
                <textarea
                  rows="2"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Waktu Pelaksanaan:</label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kapasitas Maksimal:</label>
                  <input
                    type="number"
                    min="2"
                    max="500"
                    value={editMaxP}
                    onChange={(e) => setEditMaxP(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
