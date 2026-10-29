import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Hand,
  Volume2,
  Users,
  MessageSquare,
  Send,
  Sparkles,
  PhoneOff,
  ShieldCheck,
  Flame,
  HeartHandshake,
  UserCheck,
  MapPin,
  Mail,
  Phone,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  SwitchCamera,
  AlertTriangle,
  X,
  Share2,
  Check,
} from 'lucide-react';
import axios from 'axios';
import LocalVideoStream from './LocalVideoStream';
import RemoteVideoStream from './RemoteVideoStream';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export default function PublicMeetingPage({ roomId, onGoHome }) {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guest Registration State
  const [registeredAttendee, setRegisteredAttendee] = useState(() => {
    try {
      const saved = localStorage.getItem(`bionet_guest_${roomId}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // In-Meeting Stage State
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) | 'environment' (back)
  const [pipSwapped, setPipSwapped] = useState(false); // Mobile tap to swap active speaker & PiP
  const [mobileDrawer, setMobileDrawer] = useState(null); // 'chat' | 'participants' | null
  const [activeSidebarTab, setActiveSidebarTab] = useState('chat'); // 'chat' | 'participants'
  const [meetingChat, setMeetingChat] = useState([
    {
      sender: 'Host Moderator',
      time: 'Sistem',
      message: 'Selamat datang di ruang Video Conference Bionet! Mohon perhatikan materi yang disampaikan.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeParticipants, setActiveParticipants] = useState([]);

  // WebRTC Native Multi-User State
  const [remoteStreams, setRemoteStreams] = useState({}); // { [peerId]: MediaStream }
  const [remotePeers, setRemotePeers] = useState({}); // { [peerId]: PeerUser }

  const wsRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const pendingCandidatesRef = useRef({});

  // Responsive screen size tracking
  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Poll room participants every 3s
  useEffect(() => {
    if (!roomId) return;
    const fetchParticipants = () => {
      axios.get(`/api/public/meetings/${roomId}/participants`)
        .then(res => {
          if (res.data?.data) setActiveParticipants(res.data.data);
        })
        .catch(() => {});
    };
    fetchParticipants();
    const interval = setInterval(fetchParticipants, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Check Secure Context for Mobile Camera WebRTC
  const isSecureContext =
    typeof window !== 'undefined'
      ? window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      : true;

  // Media Stream Ref
  const localStreamRef = useRef(null);

  // Fetch Public Meeting details
  const fetchMeetingInfo = async () => {
    try {
      const res = await axios.get(`/api/public/meetings/${roomId}`);
      if (res.data?.data) {
        setMeeting(res.data.data);
        if (res.data.data.status === 'ended') {
          setIsEnded(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Room pertemuan tidak ditemukan atau tautan salah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingInfo();
  }, [roomId]);

  // Handle local camera & mic media stream with resilient fallbacks & facingMode
  const initCameraStream = async (targetFacing = facingMode) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser tidak mendukung akses kamera/WebRTC di mode ini. Pastikan membuka via HTTPS (bukan HTTP biasa).');
      return;
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

      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) vTrack.enabled = isCameraOn;
      const aTrack = stream.getAudioTracks()[0];
      if (aTrack) aTrack.enabled = isMicOn;
    } catch (err) {
      console.warn('Camera access notice:', err);
      setCameraError(err.message || 'Izin kamera ditolak atau sedang digunakan aplikasi lain.');
    }
  };

  useEffect(() => {
    if (!registeredAttendee || isEnded) return;

    initCameraStream(facingMode);

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      setLocalStream(null);
    };
  }, [registeredAttendee, isEnded]);

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        return;
      }
    }
    setIsCameraOn((v) => !v);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        return;
      }
    }
    setIsMicOn((v) => !v);
  };

  // Flip Camera Front <-> Back on Mobile
  const handleFlipCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    await initCameraStream(nextFacing);
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert('Mohon lengkapi semua data pendaftaran (Nama, Email, WhatsApp, dan Alamat).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`/api/public/meetings/${roomId}/register`, {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });

      if (res.data?.attendee) {
        setRegisteredAttendee(res.data.attendee);
        localStorage.setItem(`bionet_guest_${roomId}`, JSON.stringify(res.data.attendee));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mendaftar ke pertemuan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const nowTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setMeetingChat((prev) => [
      ...prev,
      {
        sender: registeredAttendee?.full_name || 'Tamu',
        time: nowTime,
        message: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  const handleLeave = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  // Sub-view: Host / Moderator Spotlight Tile
  const renderHostTile = (isSmall = false) => (
    <div
      className={`bg-slate-900 rounded-3xl border border-indigo-500/30 relative overflow-hidden flex flex-col items-center justify-center shadow-xl ring-2 ring-indigo-500/20 transition-all duration-300 ${
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
            {meeting?.host_name || 'Presenter Utama Bionet'}
          </h4>
          <p className="text-xs text-indigo-300 font-medium">Host Webinar &bull; Membagikan Suara &amp; Materi BOP</p>

          {/* Equalizer Audio Wave */}
          <div className="flex items-center justify-center space-x-1 pt-2">
            <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-8 bg-emerald-400 rounded-full animate-pulse delay-75" />
            <span className="w-1.5 h-10 bg-emerald-400 rounded-full animate-pulse delay-150" />
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-pulse delay-100" />
            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center space-x-1.5 border border-slate-800">
        <span className="text-indigo-400">Moderator Bionet (Host)</span>
      </div>
    </div>
  );

  // Sub-view: Local Guest Camera Tile
  const renderLocalTile = (isSmall = false) => (
    <div
      className={`bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-2xl transition-all duration-300 ${
        isSmall ? 'w-full h-full' : 'w-full h-full min-h-[220px]'
      }`}
    >
      {isCameraOn && localStream ? (
        <LocalVideoStream
          stream={localStream}
          isMirrored={facingMode === 'user'}
          isMuted={true}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center space-y-2 p-2">
          <div
            className={`rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white font-black shadow-inner ${
              isSmall ? 'w-10 h-10 text-sm' : 'w-20 h-20 text-2xl'
            }`}
          >
            {registeredAttendee?.full_name?.charAt(0) || 'T'}
          </div>
          {!isSmall && (
            <span className="text-xs text-slate-400 font-semibold">
              {isCameraOn ? 'Menghubungkan Kamera...' : 'Kamera Dinonaktifkan'}
            </span>
          )}
        </div>
      )}

      {/* Name Tag & Mic indicator */}
      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center space-x-1.5 border border-slate-800">
        <span className="truncate max-w-[90px]">{registeredAttendee?.full_name} (Anda)</span>
        {isMicOn ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        ) : (
          <MicOff className="w-3 h-3 text-red-400" />
        )}
      </div>

      {isHandRaised && (
        <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center space-x-1 shadow-lg animate-bounce">
          <Hand className="w-3 h-3 fill-slate-950" />
          <span>Angkat Tangan</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Menghubungkan ke Ruang Pertemuan Bionet...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Pertemuan Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'Tautan room meeting yang Anda buka sudah tidak aktif atau salah.'}
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-950"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // SCREEN: Sesi Selesai / Ditutup oleh Host
  if (isEnded) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              Sesi Pertemuan Selesai
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{meeting.title}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ruang pertemuan ini telah disudahi oleh Host (<strong>{meeting.host_name}</strong>). Terima kasih atas partisipasi dan kehadiran Anda!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Tertarik Bergabung Menjadi Mitra Resmi Bionet?</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dapatkan potensi penghasilan harian dari bonus pasangan, reward mobil, dan akses toko herbal mandiri sekarang.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => (window.location.href = '/')}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
            >
              <span>Daftar Kemitraan Bionet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 1: FORM PENDAFTARAN TAMU (Belum terdaftar)
  if (!registeredAttendee) {
    return (
      <div className="min-h-screen bg-[#070b14] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* HTTPS Warning Banner if accessed on insecure mobile HTTP */}
        {!isSecureContext && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-3 py-1.5 text-[11px] text-amber-200 flex items-center justify-between z-30 flex-shrink-0 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-4">
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

        {/* Background Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-800/80 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/40">
              B
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white">BIONET LIVE WEBINAR</h1>
              <p className="text-[11px] text-slate-400">Portal Video Conference &amp; Presentasi Bisnis Resmi</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE SEKARANG</span>
            </span>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          {/* Left Column: Meeting Info & Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Webinar Eksklusif Bionet v6</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {meeting.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {meeting.description ||
                  'Ikuti pemaparan peluang bisnis resmi Bionet, strategi mencetak omset jutaan rupiah per minggu, serta sesi tanya jawab live.'}
              </p>
            </div>

            {/* Room Details Card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Presenter / Host:</span>
                <span className="font-bold text-white text-xs">{meeting.host_name || 'Admin Pusat'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Kapasitas Sesi:</span>
                <span className="font-bold text-white text-xs">{meeting.max_participants || 500} Peserta</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Akses Masuk:</span>
                <span className="font-bold text-emerald-400 text-xs">100% Gratis &amp; Live</span>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-2.5 pt-2">
              {[
                'Interaksi video tatap muka & tanya jawab langsung dengan Top Leader',
                'Simulasi kalkulator bonus pasangan dan reward kepemilikan mobil/rumah',
                'Sertifikat presensi dan peluang konsultasi kesehatan herbal terpercaya',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Registration Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4" />
                  <span>Presensi &amp; Pendaftaran Tamu</span>
                </div>
                <h3 className="text-lg font-black text-white">Isi Data untuk Masuk Room</h3>
                <p className="text-[11px] text-slate-400">
                  Data ini digunakan oleh moderator room untuk presensi dan verifikasi peserta webinar.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nama Lengkap:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nomor WhatsApp / HP Aktif:</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alamat Email:</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: budi@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Alamat Lengkap / Kota Domisili:</span>
                  </label>
                  <textarea
                    rows="2"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Contoh: Jl. Merdeka No. 10, Kota Bandung, Jawa Barat"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition shadow-xl shadow-indigo-950 flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
                >
                  <Video className="w-4 h-4" />
                  <span>{submitting ? 'Memproses Pendaftaran...' : 'Masuk Ruang Pertemuan Sekarang'}</span>
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto w-full text-center text-[11px] text-slate-500 pt-6 border-t border-slate-900 z-10">
          &copy; {new Date().getFullYear()} Bionet Network System &bull; Ruang Video Conference Terintegrasi
        </footer>
      </div>
    );
  }

  // SCREEN 2: LIVE MEETING STAGE FOR GUEST (Sudah Terdaftar)
  return (
    <div className="fixed inset-0 z-[200] bg-[#050811] text-white flex flex-col h-[100dvh] overflow-hidden select-none animate-in fade-in duration-200">
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
                {meeting.title}
              </h2>
              <span className="inline-flex px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-black items-center space-x-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>LIVE</span>
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 truncate flex items-center space-x-1.5">
              <span>Host: <strong className="text-white">{meeting.host_name || 'Admin Pusat'}</strong></span>
              <span>&bull;</span>
              <span>Tamu: <strong className="text-emerald-400">{registeredAttendee.full_name}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          {/* Flip Camera Quick Action */}
          <button
            onClick={handleFlipCamera}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 border border-slate-700"
            title="Balik Kamera Depan / Belakang"
          >
            <SwitchCamera className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Balik Kamera</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 border border-slate-700"
            title="Salin Tautan Room"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden md:inline">{copiedLink ? 'Tersalin' : 'Bagikan'}</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-md shadow-red-950"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Video Canvas & Desktop Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Main Stage */}
        <div className="flex-1 bg-[#050811] p-2 sm:p-4 flex flex-col justify-between overflow-hidden relative">
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
            {!isMobileScreen ? (
              /* 1. DESKTOP VIEW: 2-Grid Side-by-Side (Single Active Video Element) */
              <div className="grid grid-cols-2 gap-4 w-full h-full max-h-[75vh]">
                {renderHostTile(false)}
                {renderLocalTile(false)}
              </div>
            ) : (
              /* 2. MOBILE VIEW: Full-Screen Dominant Host + Floating PiP (Single Active Video Element) */
              <div className="w-full h-full relative overflow-hidden flex items-center justify-center rounded-2xl">
                <div className="w-full h-full">
                  {pipSwapped ? renderLocalTile(false) : renderHostTile(false)}
                </div>

                <div
                  onClick={() => setPipSwapped((prev) => !prev)}
                  className="absolute bottom-20 right-3 w-28 h-40 sm:w-36 sm:h-48 rounded-2xl border-2 border-indigo-500/80 shadow-2xl z-30 overflow-hidden cursor-pointer active:scale-95 transition-transform bg-slate-950"
                  title="Ketuk untuk menukar tampilan layar"
                >
                  {pipSwapped ? renderHostTile(true) : renderLocalTile(true)}
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-900/80 text-[8px] font-black text-indigo-300 pointer-events-none">
                    Ketuk Tukar
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP SIDEBAR (hidden on mobile, permanent on desktop) */}
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
              <span>Peserta (2)</span>
            </button>
          </div>

          {activeSidebarTab === 'chat' ? (
            <div className="flex-1 flex flex-col justify-between overflow-hidden p-3">
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
                  placeholder="Kirim pertanyaan..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
              {/* Host */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[11px] text-white">
                    B
                  </div>
                  <div>
                    <div className="font-bold text-white leading-tight">{meeting.host_name || 'Presenter Bionet'}</div>
                    <div className="text-[10px] text-indigo-400">Host (Moderator)</div>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-emerald-400" />
              </div>

              {/* Guest Self */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[11px] text-white">
                    {registeredAttendee.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white leading-tight">{registeredAttendee.full_name} (Anda)</div>
                    <div className="text-[10px] text-slate-400">Peserta Tamu</div>
                  </div>
                </div>
                {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
              </div>

              {/* Other Active Room Members */}
              {activeParticipants.map(p => (
                <div key={p.id || p.user_id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] text-white ${
                      p.role === 'admin' ? 'bg-indigo-600' : 'bg-teal-600'
                    }`}>
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
                    {p.is_hand_up && <Hand className="w-3.5 h-3.5 text-amber-400" />}
                    {p.is_mic_on ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SLIDE-UP BOTTOM SHEET (Zoom Style: Chat & Peserta) */}
      {mobileDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          <div
            onClick={() => setMobileDrawer(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
          />
          <div className="relative z-10 bg-slate-900 border-t border-slate-700/80 rounded-t-3xl max-h-[75dvh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Swipe handle */}
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

            {/* Drawer Header Tabs */}
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
                  Peserta (2)
                </button>
              </div>
              <button
                onClick={() => setMobileDrawer(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
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
                      placeholder="Kirim pertanyaan..."
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
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-[11px]">
                        B
                      </div>
                      <div>
                        <div className="font-bold text-white">{meeting.host_name || 'Presenter Bionet'}</div>
                        <div className="text-[10px] text-indigo-400">Host (Moderator)</div>
                      </div>
                    </div>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[11px]">
                        {registeredAttendee.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{registeredAttendee.full_name}</div>
                        <div className="text-[10px] text-slate-400">Peserta Tamu (Anda)</div>
                      </div>
                    </div>
                    {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-400" />}
                  </div>
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

        {/* 4. Chat Toggle (Opens Bottom Sheet on Mobile) */}
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

        {/* 5. Peserta Toggle (Opens Bottom Sheet on Mobile) */}
        <button
          onClick={() => setMobileDrawer((prev) => (prev === 'participants' ? null : 'participants'))}
          className="flex flex-col items-center justify-center p-2 rounded-2xl text-slate-300 hover:text-white transition active:scale-90 relative"
        >
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shadow-md ${
              mobileDrawer === 'participants'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-1">Peserta</span>
          <span className="absolute top-1 right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-black flex items-center justify-center">
            2
          </span>
        </button>

        {/* 6. Raise Hand */}
        <button
          onClick={() => setIsHandRaised((v) => !v)}
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

        {/* 7. Leave Button */}
        <button
          onClick={handleLeave}
          className="px-3.5 sm:px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition flex items-center space-x-1.5 shadow-lg shadow-red-950 ml-1"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </footer>
    </div>
  );
}
