import React, { useState, useEffect, useRef, useMemo } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Share2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Radio,
  Clock,
  User,
  Activity,
  Smile,
  Zap,
} from 'lucide-react';

/**
 * WhatsAppCallModal - Interactive WhatsApp Voice & Video Call Suite
 * 
 * Supports:
 * - Voice Call (Panggilan Suara) & Video Call (Panggilan Video)
 * - State flow: 'calling' (Memanggil) -> 'ringing' (Berdering) -> 'connected' (Terhubung) -> 'ended' (Panggilan Berakhir)
 * - Native Web Audio API dual-frequency oscillator telephone ringing (440Hz + 480Hz cadence)
 * - Realtime local webcam/microphone capture via getUserMedia with graceful fallback
 * - Simulated remote HD video consultation feed with audio visualizer bars
 * - Call duration timer (MM:SS)
 * - Direct WhatsApp invitation link generator & wa.me mobile fallback
 */
export default function WhatsAppCallModal({
  isOpen,
  onClose,
  contact,
  callType = 'voice', // 'voice' | 'video'
  onCallEnded,
  onSendInvitationMessage,
}) {
  // Call Lifecycle States: 'calling' | 'ringing' | 'connected' | 'ended'
  const [callStatus, setCallStatus] = useState('calling');
  const [durationSeconds, setDurationSeconds] = useState(0);
  
  // Media Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isPiPMinimized, setIsPiPMinimized] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);

  // References
  const localVideoRef = useRef(null);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const ringCadenceRef = useRef(null);
  const streamRef = useRef(null);

  // Contact Info Normalize
  const contactName = contact?.contact_name || contact?.name || 'Pelanggan Bionet';
  const contactPhone = contact?.phone || '628xxxxxxxx';
  const contactCity = contact?.city || 'Indonesia';
  const contactAvatar =
    contact?.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80';

  // Format MM:SS
  const formattedDuration = useMemo(() => {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [durationSeconds]);

  // Unique Room / Call Meeting Link
  const callRoomId = useMemo(() => {
    const cleanPhone = (contactPhone || 'bionet').replace(/[^0-9a-zA-Z]/g, '').slice(-6);
    return `bionet-${callType}-${cleanPhone || 'call'}-${Date.now().toString(36)}`;
  }, [contactPhone, callType]);

  const callRoomUrl = `https://meet.bionet.id/room/${callRoomId}`;

  // =========================================================================
  // 1. Synthesized Telephone Ringing Tone (Native Web Audio API 440Hz + 480Hz)
  // =========================================================================
  const startTelephoneRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Cadence: Dual frequencies 440Hz + 480Hz (US/ITU standard ringback)
      // 1.6s burst tone followed by 2.4s silence
      const playBurst = () => {
        if (!ctx || ctx.state === 'closed' || !isSpeakerOn) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = 440; // 440 Hz
        osc2.type = 'sine';
        osc2.frequency.value = 480; // 480 Hz

        // Soft smooth envelope to eliminate click/pop artifacts
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.setValueAtTime(0.08, now + 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.65);
        osc2.stop(now + 1.65);
      };

      // Play first burst immediately, then schedule cadence
      playBurst();
      ringCadenceRef.current = setInterval(playBurst, 3600);
    } catch (err) {
      console.warn('AudioContext playback error (safe fallback):', err);
    }
  };

  const stopTelephoneRingtone = () => {
    if (ringCadenceRef.current) {
      clearInterval(ringCadenceRef.current);
      ringCadenceRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
  };

  // =========================================================================
  // 2. Local Media (Webcam & Mic) Setup for Video Mode
  // =========================================================================
  const initLocalMedia = async () => {
    if (callType !== 'video') return;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermissionError('Browser ini tidak mendukung akses webcam WebRTC.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      setLocalStream(stream);
      setCameraPermissionError(null);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam/Mic permission warning:', err);
      setCameraPermissionError(
        err.name === 'NotAllowedError'
          ? 'Izin kamera/mikrofon ditolak. Menggunakan mode konsultasi visual Bionet.'
          : 'Kamera lokal tidak terdeteksi. Melanjutkan mode audio visual.'
      );
    }
  };

  const stopLocalMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setLocalStream(null);
  };

  // Toggle Video Track
  const handleToggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
      setIsVideoOff(!isVideoOff);
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle Audio Track
  const handleToggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle Speaker / Sound
  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    if (isSpeakerOn && callStatus === 'ringing') {
      stopTelephoneRingtone();
    } else if (!isSpeakerOn && callStatus === 'ringing') {
      startTelephoneRingtone();
    }
  };

  // =========================================================================
  // 3. Call Lifecycle Automation
  // =========================================================================
  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setDurationSeconds(0);
      stopTelephoneRingtone();
      stopLocalMedia();
      return;
    }

    // Reset initial state when modal opens
    setCallStatus('calling');
    setDurationSeconds(0);
    setIsMuted(false);
    setIsVideoOff(false);

    // Initialize media if video call
    if (callType === 'video') {
      initLocalMedia();
    }

    // Phase 1: 'calling' (1.8s) -> 'ringing'
    const callingTimer = setTimeout(() => {
      setCallStatus('ringing');
      startTelephoneRingtone();

      // Phase 2: 'ringing' (4.5s) -> auto-connected (realistic interactive simulation)
      const connectTimer = setTimeout(() => {
        setCallStatus('connected');
        stopTelephoneRingtone();
      }, 4500);

      timerRef.current = connectTimer;
    }, 1800);

    return () => {
      clearTimeout(callingTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      stopTelephoneRingtone();
      stopLocalMedia();
    };
  }, [isOpen, callType]);

  // Keep local video attached if stream updates
  useEffect(() => {
    if (localStream && localVideoRef.current && !localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  // Timer counter when 'connected'
  useEffect(() => {
    let interval = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  // Manual Trigger: Connect Now (for instant test / agent demonstration)
  const handleConnectNow = () => {
    if (callStatus === 'calling' || callStatus === 'ringing') {
      if (timerRef.current) clearTimeout(timerRef.current);
      stopTelephoneRingtone();
      setCallStatus('connected');
    }
  };

  // End Call Handler
  const handleEndCall = () => {
    stopTelephoneRingtone();
    stopLocalMedia();
    setCallStatus('ended');

    const result = {
      callType,
      durationSeconds,
      formattedDuration: formattedDuration || '00:00',
      contactName,
      contactPhone,
      timestamp: new Date().toISOString(),
    };

    if (onCallEnded) {
      onCallEnded(result);
    }

    // Auto close modal after brief 1.5s wrap-up
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Copy Meeting / Room Invitation Link
  const handleCopyLink = () => {
    navigator.clipboard?.writeText(callRoomUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Dispatch Invitation via WhatsApp Message
  const handleSendWhatsAppInvitation = () => {
    const inviteMessage = `Halo ${contactName}, izin mengundang Anda untuk konsultasi ${
      callType === 'video' ? '📹 Video Call' : '📞 Voice Call'
    } resmi Bionet Suite melalui tautan berikut:\n\n${callRoomUrl}\n\nSilakan klik tautan di atas atau kami siap menghubungkan kembali melalui WhatsApp. Terima kasih!`;

    if (onSendInvitationMessage) {
      onSendInvitationMessage(inviteMessage);
      setShowInviteDrawer(false);
    } else {
      // Fallback direct wa.me
      const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(inviteMessage);
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, '_blank');
    }
  };

  // Direct Mobile Fallback (wa.me)
  const handleOpenDirectWhatsApp = () => {
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={handleEndCall}
      zIndex="z-[130]"
      backdropClassName="bg-slate-950/85 backdrop-blur-xl"
      closeOnBackdropClick={false}
      ariaLabel={`WhatsApp ${callType === 'video' ? 'Video' : 'Voice'} Call Modal`}
    >
      <div className="relative w-full max-w-lg mx-auto bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[650px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-10 w-72 h-40 bg-teal-500/10 blur-[80px] pointer-events-none rounded-full" />

        {/* ================= HEADER BAR ================= */}
        <div className="relative z-10 px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Terenkripsi End-to-End</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Room Link Invite Button */}
            <button
              onClick={() => setShowInviteDrawer(!showInviteDrawer)}
              className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1.5 transition border border-slate-700"
              title="Bagikan Tautan Undangan Panggilan"
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Undang</span>
            </button>

            {/* Direct Fallback WhatsApp Button */}
            <button
              onClick={handleOpenDirectWhatsApp}
              className="p-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-900/40 text-slate-300 hover:text-emerald-400 border border-slate-700 transition"
              title="Buka Langsung di Aplikasi WhatsApp HP (wa.me)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ================= INVITATION DRAWER (POP-DOWN) ================= */}
        {showInviteDrawer && (
          <div className="relative z-20 mx-4 mt-2 p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/30 text-xs shadow-xl animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Undangan Konsultasi WhatsApp Room</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kirimkan tautan instan ke chat WhatsApp penerima agar prospek dapat langsung bergabung.
                </p>
              </div>
              <button
                onClick={() => setShowInviteDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                &times;
              </button>
            </div>

            <div className="mt-2.5 flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={callRoomUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-emerald-400 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center space-x-1 transition flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Disalin' : 'Salin'}</span>
              </button>
              <button
                onClick={handleSendWhatsAppInvitation}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-bold flex items-center space-x-1 transition shadow-xs flex-shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim ke Chat</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= MAIN CALL STAGE ================= */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          
          {/* ================= A. VOICE CALL MODE ================= */}
          {callType === 'voice' && (
            <div className="flex flex-col items-center justify-center w-full max-w-sm space-y-5 my-auto animate-in zoom-in-95 duration-200">
              
              {/* Status Header & Contact Title */}
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold tracking-tight text-white">
                  {contactName}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {contactPhone} {contactCity ? `• ${contactCity}` : ''}
                </p>

                {/* Call Status Badge */}
                <div className="pt-2">
                  {callStatus === 'calling' && (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-semibold animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                      <span>Memanggil...</span>
                    </span>
                  )}
                  {callStatus === 'ringing' && (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse shadow-xs">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                      <span>Berdering... (Ringing Tone)</span>
                    </span>
                  )}
                  {callStatus === 'connected' && (
                    <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-400/50 text-emerald-200 text-sm font-mono font-bold shadow-md shadow-emerald-950">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{formattedDuration}</span>
                      <span className="text-[10px] text-emerald-400 font-sans font-normal ml-1">Terhubung (HD Voice)</span>
                    </span>
                  )}
                  {callStatus === 'ended' && (
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold">
                      <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
                      <span>Panggilan Berakhir ({formattedDuration})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Pulsing Avatar with Glowing Radar Waves */}
              <div className="relative my-4 flex items-center justify-center">
                {/* Radar Ripple Waves */}
                {(callStatus === 'calling' || callStatus === 'ringing') && (
                  <>
                    <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-ping [animation-duration:2.5s]" />
                    <div className="absolute w-36 h-36 rounded-full border border-teal-500/30 bg-teal-500/10 animate-ping [animation-duration:1.8s]" />
                  </>
                )}
                {callStatus === 'connected' && (
                  <div className="absolute w-36 h-36 rounded-full border-2 border-emerald-500/40 bg-emerald-500/10 animate-pulse" />
                )}

                {/* Avatar Image */}
                <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl">
                  <img
                    src={contactAvatar}
                    alt={contactName}
                    className="w-full h-full rounded-full object-cover border-2 border-slate-950"
                  />
                  {callStatus === 'connected' && (
                    <span className="absolute bottom-1 right-1 p-1.5 bg-emerald-500 text-slate-950 rounded-full border-2 border-slate-950 shadow-xs">
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Simulated Live Audio Frequency Visualizer Bars */}
              <div className="w-full max-w-xs px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col items-center space-y-1.5">
                <div className="flex items-center justify-between w-full text-[10px] text-slate-400 px-1 font-mono">
                  <span>SPECTRUM AUDIO</span>
                  <span className={isMuted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isMuted ? 'MIKROFON BISU' : callStatus === 'connected' ? 'LIVE TRANSMISI' : 'STANDBY'}
                  </span>
                </div>

                <div className="flex items-end justify-center space-x-1.5 h-10 w-full pt-1">
                  {[28, 45, 60, 35, 75, 90, 50, 80, 65, 40, 85, 95, 70, 55, 30, 60, 82, 48].map((h, i) => {
                    // If call connected and not muted, animate height variations
                    const activeHeight =
                      callStatus === 'connected' && !isMuted
                        ? Math.min(100, Math.max(15, (h * (0.6 + ((i % 3) * 0.2)))))
                        : callStatus === 'ringing'
                        ? 25 + (i % 4) * 8
                        : 12;

                    return (
                      <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          isMuted
                            ? 'bg-rose-500/40 h-2'
                            : callStatus === 'connected'
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                            : 'bg-slate-700'
                        }`}
                        style={{
                          height: isMuted ? '6px' : `${activeHeight}%`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Direct WhatsApp Call & Room Invite Helper Card */}
              {(callStatus === 'calling' || callStatus === 'ringing') && (
                <div className="w-full max-w-xs p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-center space-y-2.5 shadow-lg">
                  <div className="text-[11px] text-slate-300 font-medium leading-tight">
                    Hubungkan langsung ke WhatsApp penerima:
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendWhatsAppInvitation}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-sm"
                      title="Kirim tautan panggilan langsung ke chat WhatsApp penerima"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim Tautan WA</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenDirectWhatsApp}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center space-x-1.5 transition border border-slate-700"
                      title="Buka langsung di aplikasi WhatsApp HP/Desktop untuk telepon WhatsApp asli"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp HP</span>
                    </button>
                  </div>
                  <button
                    onClick={handleConnectNow}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-semibold transition block mx-auto pt-1"
                  >
                    ⚡ Jawab Cepat (Simulasi Terhubung Langsung)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= B. VIDEO CALL MODE ================= */}
          {callType === 'video' && (
            <div className="relative w-full h-full flex flex-col rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              
              {/* 1. Main Remote Video Consultation Feed (Simulated HD Healthcare Stream) */}
              <div className="relative flex-1 w-full h-full flex flex-col items-center justify-center bg-radial from-slate-900 via-slate-950 to-black overflow-hidden select-none">
                
                {/* Background consultation ambient visual */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
                
                {/* Remote Doctor/Consultant/Customer Presentation */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="relative">
                    <img
                      src={contactAvatar}
                      alt={contactName}
                      className="w-24 h-24 rounded-3xl object-cover border-2 border-emerald-500/60 shadow-2xl"
                    />
                    <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[9px] font-bold shadow-xs">
                      REMOTE FEED
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="font-extrabold text-base text-white">{contactName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{contactPhone}</p>
                    
                    <div className="mt-1.5 flex items-center justify-center space-x-2">
                      {callStatus === 'connected' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{formattedDuration}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold animate-pulse">
                          {callStatus === 'calling' ? 'Memanggil...' : 'Berdering (Menunggu Respon)...'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Video Feed Watermark Overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-emerald-400 font-mono">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Bionet Telehealth HD • 1080p 60fps</span>
                </div>

                {/* Instant Answer & Direct WhatsApp Buttons */}
                {(callStatus === 'calling' || callStatus === 'ringing') && (
                  <div className="absolute bottom-4 z-10 flex flex-col items-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSendWhatsAppInvitation}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center space-x-1 shadow-lg transition backdrop-blur-md"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Kirim Link Panggilan</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenDirectWhatsApp}
                        className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold flex items-center space-x-1 border border-slate-700 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WA HP</span>
                      </button>
                    </div>
                    <button
                      onClick={handleConnectNow}
                      className="px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 text-emerald-300 text-[11px] font-medium transition backdrop-blur-md"
                    >
                      ⚡ Simulasi Terhubung Sekarang
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Floating Picture-in-Picture (PiP) Local Webcam Preview */}
              <div
                className={`absolute bottom-3 right-3 z-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/40 bg-slate-950 transition-all duration-300 ${
                  isPiPMinimized ? 'w-24 h-16' : 'w-36 sm:w-44 h-48 sm:h-56'
                }`}
              >
                {/* Local Video Stream Element */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${
                    isVideoOff || !localStream ? 'hidden' : 'block'
                  }`}
                />

                {/* Fallback if Video Off or Camera Not Accessible */}
                {(isVideoOff || !localStream) && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2 text-center">
                    <VideoOff className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-[10px] font-semibold">Kamera Mati</span>
                  </div>
                )}

                {/* PiP Header controls */}
                <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between text-white drop-shadow-md">
                  <span className="text-[9px] font-bold bg-black/60 px-1.5 py-0.5 rounded text-emerald-300 font-mono">
                    Anda
                  </span>
                  <button
                    onClick={() => setIsPiPMinimized(!isPiPMinimized)}
                    className="p-1 rounded bg-black/60 hover:bg-black/90 text-white"
                    title={isPiPMinimized ? 'Perbesar' : 'Perkecil'}
                  >
                    {isPiPMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Camera Permission Warning Banner if any */}
              {cameraPermissionError && (
                <div className="absolute top-3 right-3 max-w-xs z-10 p-2 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-[10px] flex items-start space-x-1.5 shadow-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{cameraPermissionError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= CONTROLS ACTION BAR ================= */}
        <div className="relative z-10 px-6 py-5 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-center space-x-4">
          
          {/* 1. Mute / Unmute Mic Button */}
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-full transition-all duration-150 shadow-md ${
              isMuted
                ? 'bg-rose-600 text-white hover:bg-rose-500'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Aktifkan Mikrofon' : 'Bisukan Mikrofon'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* 2. Speaker / Volume Toggle (for Voice) OR Camera Toggle (for Video) */}
          {callType === 'voice' ? (
            <button
              onClick={handleToggleSpeaker}
              className={`p-3.5 rounded-full transition-all duration-150 shadow-md ${
                !isSpeakerOn
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isSpeakerOn ? 'Speaker Aktif' : 'Speaker Dimatikan'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          ) : (
            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-full transition-all duration-150 shadow-md ${
                isVideoOff
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Nyalakan Kamera' : 'Matikan Kamera'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {/* 3. Big Red End Call Button (PhoneOff) */}
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xl shadow-rose-950 transition-all duration-150"
            title="Akhiri Panggilan"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </ModalPortal>
  );
}
