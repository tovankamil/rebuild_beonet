import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Send,
  Copy,
  Check,
  Radio,
  User,
  Sliders,
  FileAudio,
  Share2,
  Activity,
  Flame,
  CheckCircle2,
  Gauge,
  Headphones,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const VOICE_PERSONAS = [
  {
    id: 'dr_farhan',
    name: 'dr. Farhan',
    role: 'Konsultan Herbal Medis',
    tone: 'Berwibawa, Edukatif, Santun & Ramah BPOM',
    pitch: 0.95,
    rate: 0.98,
    avatar: '👨‍⚕️',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'bunda_dewi',
    name: 'Bunda Dewi',
    role: 'Mentor Hangat & Empatik',
    tone: 'Keibuan, Penuh Doa, Menyejukkan Hati',
    pitch: 1.15,
    rate: 1.0,
    avatar: '🧕',
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    id: 'coach_ryan',
    name: 'Coach Ryan',
    role: 'Top Leader & Binary Coach',
    tone: 'Energik, Optimis, Membakar Semangat Bisnis',
    pitch: 1.05,
    rate: 1.08,
    avatar: '🚀',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

const GREETING_TEMPLATES = [
  {
    id: 'prospek_biolink',
    title: 'Sapaan Ramah Prospek Bio-Link',
    tag: 'Prospek Baru',
    rawScript:
      'Halo {nama}, salam kenal ya! Saya {sponsor}. Terima kasih banyak sudah berkunjung ke halaman resmi kami. Saya perhatikan {nama} tertarik mencari solusi herbal resmi BPOM ya? Santai aja, jangan sungkan kalau mau tanya-tanya seputar aturan pakai atau keluhan kesehatan. Boleh saya tahu keluhan apa yang sedang dirasakan {nama} saat ini?',
  },
  {
    id: 'followup_ragu',
    title: 'Follow-Up Calon Pembeli Ragu',
    tag: 'Follow-Up Closing',
    rawScript:
      'Halo {nama}, apa kabar hari ini? Semoga selalu sehat dan berkah rezekinya ya. Kemarin saya sempat ingat {nama} masih mempertimbangkan paket Bio-Propolis Bionet. Cuma mau mengabarkan kalau seluruh produk kita sudah lolos uji ketat BPOM dan halal MUI. Jadi insyaAllah sangat aman untuk ikhtiar kesehatan jangka panjang tanpa efek samping ke ginjal. Mau saya bantu siapkan paketnya hari ini dengan promo gratis ongkir?',
  },
  {
    id: 'edukasi_propolis',
    title: 'Edukasi Khasiat Pasca Sakit',
    tag: 'Edukasi Produk',
    rawScript:
      'Salam sehat {nama}! Gimana kondisi fisiknya hari ini? Semoga sudah jauh lebih segar ya. Untuk hasil terapi yang optimal, jangan lupa teteskan 7 tetes Bio-Propolis Trigona ke air hangat kuku 3 kali sehari 30 menit sebelum makan. Kalau ada reaksi awal seperti badan terasa hangat atau sering berkeringat, itu proses detoksifikasi alami ya {nama}. Tetap jaga hidrasi dan istirahat yang cukup!',
  },
  {
    id: 'welcome_mitra',
    title: 'Ucapan Selamat Mitra Baru',
    tag: 'Mitra Baru',
    rawScript:
      'Assalamu’alaikum {nama}, selamat datang di keluarga besar Bionet Herbal Network! Saya {sponsor} bangga sekali bisa bermitra dengan {nama}. Di sini kita akan bertumbuh bersama, saling dukung, dan saya siap dampingi {nama} langkah demi langkah sampai berhasil mencairkan bonus pasangan pertama. Nanti malam kita agendakan ngobrol santai 10 menit ya {nama}!',
  },
  {
    id: 'reminder_ro',
    title: 'Pengingat Repeat Order Habis',
    tag: 'Repeat Order',
    rawScript:
      'Halo {nama}, salam hangat! Sekadar menyapa, sudah hampir 3 minggu sejak botol herbal Bionet terakhir diterima. Pasti isinya sudah mulai menipis ya? Agar proses pemulihan dan regenerasi sel tidak terputus, ada baiknya restock sebelum benar-benar habis. Kebetulan hari ini gudang lagi ada subsidi ongkir khusus konsumen setia kami. Kabari ya kalau mau dikirimkan hari ini!',
  },
];

const SPEED_OPTIONS = [
  { label: '0.9x', val: 0.9 },
  { label: '1.0x', val: 1.0 },
  { label: '1.15x', val: 1.15 },
  { label: '1.25x', val: 1.25 },
];

export default function AIVoiceNoteModal({ isOpen, onClose, currentUser }) {
  const [selectedPersona, setSelectedPersona] = useState('dr_farhan');
  const [selectedTemplateId, setSelectedTemplateId] = useState('prospek_biolink');
  const [prospectName, setProspectName] = useState('Ibu Maryam');
  const [prospectPhone, setProspectPhone] = useState('');
  const [customScript, setCustomScript] = useState('');
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25);
  const [copied, setCopied] = useState(false);

  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  const activeTemplate =
    GREETING_TEMPLATES.find((t) => t.id === selectedTemplateId) || GREETING_TEMPLATES[0];
  const activePersonaObj =
    VOICE_PERSONAS.find((p) => p.id === selectedPersona) || VOICE_PERSONAS[0];

  // Sync script when template or prospect name changes
  useEffect(() => {
    const sponsorName = currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'Mitra Resmi';
    const filled = activeTemplate.rawScript
      .replace(/{nama}/g, prospectName.trim() || 'Sahabat')
      .replace(/{sponsor}/g, sponsorName);
    setCustomScript(filled);
  }, [selectedTemplateId, prospectName, currentUser]);

  // Clean up audio on unmount or modal close
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handlePlayAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      alert('Browser Anda tidak mendukung Web Speech API synthesis.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(customScript);
    utterance.lang = 'id-ID';
    utterance.rate = activePersonaObj.rate * speedMultiplier;
    utterance.pitch = activePersonaObj.pitch;

    // Estimate duration based on word count & speed
    const words = customScript.split(/\s+/).filter(Boolean).length;
    const estDuration = Math.max(8, Math.round((words / (2.6 * speedMultiplier))));
    setDuration(estDuration);
    setCurrentTime(0);

    utterance.onstart = () => {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= estDuration) {
            clearInterval(intervalRef.current);
            return estDuration;
          }
          return prev + 1;
        });
      }, 1000);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentTime(estDuration);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    window.speechSynthesis.speak(utterance);
    utteranceRef.current = utterance;
  };

  const handleStopAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSendToWhatsApp = () => {
    const rawNumber = prospectPhone.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;

    let text = `🎙️ *[PESAN SUARA / VOICE NOTE DARI ${currentUser?.full_name ? currentUser.full_name.toUpperCase() : 'MITRA BIONET'}]*\n\n`;
    text += `${customScript}\n\n`;
    text += `_Dibuat dengan Bionet AI Audio Studio - Solusi Herbal Terpercaya BPOM RI._`;

    const msg = encodeURIComponent(text);
    const targetUrl = cleanNumber ? `https://wa.me/${cleanNumber}?text=${msg}` : `https://api.whatsapp.com/send?text=${msg}`;
    window.open(targetUrl, '_blank');
    try {
      playCoinChime();
    } catch (e) {}
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(customScript);
    setCopied(true);
    try {
      playCoinChime();
    } catch (e) {}
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate 32 dynamic equalizer bars
  const eqBars = [
    25, 45, 75, 40, 60, 95, 70, 45, 85, 100, 65, 40, 80, 90, 55, 75, 95, 85, 50, 70, 90, 60, 40, 65, 80, 50, 70, 85, 55, 40, 60, 30,
  ];

  const wordCount = customScript.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(6, Math.round(wordCount / 2.6));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          handleStopAudio();
          onClose();
        }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[92vh] font-sans"
      >
        {/* DashLite Luxury Emerald Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-[#03231c] to-slate-950 text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0 border-b border-emerald-900/40">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-12 w-32 h-32 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center space-x-3.5 z-10">
            {/* Animated High-End Voice Icon */}
            <div className="relative">
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 blur-sm opacity-70 animate-pulse pointer-events-none" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-200 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Mic size={24} className="stroke-[2.5] text-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Activity size={10} className="text-emerald-400" />
                  <span>AI Voice Note WA</span>
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>Sintesis Alami</span>
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-white leading-tight mt-0.5">
                Studio AI Voice Note WhatsApp
              </h2>
              <p className="text-xs text-emerald-200/80">
                Sintesis naskah sapaan prospek menjadi pesan suara hangat &amp; meyakinkan
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 z-10 cursor-pointer"
            aria-label="Tutup"
          >
            <X size={19} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Target Prospect Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Nama Kontak Prospek / Mitra:
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="Contoh: Ibu Maryam"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Nomor WhatsApp Prospek (Opsional):
              </label>
              <input
                type="text"
                value={prospectPhone}
                onChange={(e) => setProspectPhone(e.target.value)}
                placeholder="Contoh: 081298765432"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* Voice Persona Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-emerald-600" />
                <span>Pilih Karakter &amp; Nada Suara AI:</span>
              </span>
              <span className="text-[10px] text-slate-500 normal-case font-normal">
                Web Speech Synthesizer ID
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {VOICE_PERSONAS.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/25 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                        {persona.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {persona.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0 ml-1" />
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-700 block truncate">
                          {persona.role}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
                          {persona.tone}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Template Selection Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <FileAudio size={13} className="text-emerald-600" />
              <span>Pilih Skenario Naskah Sapaan:</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {GREETING_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border transition cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Script Editor (FIXED HIGH-CONTRAST READABLE STYLING) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Naskah Pesan Suara (Bisa Diedit Bebas):</span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ⏱️ ~{estimatedSeconds} detik ({wordCount} kata)
                </span>
              </label>

              <button
                type="button"
                onClick={handleCopyScript}
                className="text-xs text-emerald-700 font-bold hover:text-emerald-800 flex items-center space-x-1 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition active:scale-95"
              >
                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Naskah Tersalin!' : 'Salin Naskah'}</span>
              </button>
            </div>

            {/* Guaranteed High-Contrast White Background & Dark Slate Text */}
            <div className="relative">
              <textarea
                rows={4}
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="Tuliskan naskah sapaan ramah di sini..."
                className="w-full text-xs sm:text-sm p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 font-normal leading-relaxed focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none shadow-inner resize-y transition selection:bg-emerald-200 selection:text-slate-900"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  caretColor: '#059669',
                }}
              />
            </div>
          </div>

          {/* Elevated Dynamic Audio Waveform Player Card */}
          <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-[#03231c] to-slate-950 text-white shadow-2xl border border-emerald-500/30 overflow-hidden space-y-4.5">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header inside Audio Player */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {isPlaying && (
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
                  )}
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Headphones size={17} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-white">
                      {activePersonaObj.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-400/30">
                      {isPlaying ? '▶ Sedang Berbicara' : '● Audio Siap'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200/70">
                    Format: WhatsApp Voice Note Simulation (16kHz Synthesis)
                  </p>
                </div>
              </div>

              {/* Speed Multiplier Pill */}
              <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSpeedMultiplier(opt.val)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                      speedMultiplier === opt.val
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High-Fidelity Waveform Equalizer Display */}
            <div className="relative z-10 p-3.5 bg-black/50 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
              <div className="h-16 flex items-center justify-between gap-1 px-1 overflow-hidden">
                {eqBars.map((baseH, idx) => {
                  const animHeight = isPlaying
                    ? Math.max(18, Math.min(100, baseH * (Math.sin(currentTime * 4 + idx * 0.4) + 1.25)))
                    : 18;

                  return (
                    <div
                      key={idx}
                      className="w-full rounded-full transition-all duration-150"
                      style={{
                        height: `${animHeight}%`,
                        background: isPlaying
                          ? 'linear-gradient(180deg, #6ee7b7 0%, #10b981 50%, #047857 100%)'
                          : 'rgba(52, 211, 153, 0.25)',
                        boxShadow: isPlaying ? '0 0 8px rgba(16, 185, 129, 0.4)' : 'none',
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Track */}
              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-emerald-300">
                <span>00:{String(currentTime).padStart(2, '0')}</span>
                <div className="flex-1 mx-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-300"
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span>00:{String(duration).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Playback Controls & Send Button */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="flex-1 sm:flex-initial py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-heading font-black text-xs shadow-lg shadow-emerald-400/30 flex items-center justify-center space-x-2 transition active:scale-[0.98] cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} className="fill-slate-950" />
                      <span>Jeda Suara</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} className="fill-slate-950" />
                      <span>Putar Suara AI</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="py-3 px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
                  title="Reset Audio"
                >
                  <RotateCcw size={15} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-heading font-black text-xs shadow-lg shadow-amber-400/25 flex items-center justify-center space-x-2 transition active:scale-[0.98] cursor-pointer"
              >
                <Send size={16} />
                <span>Kirim Naskah Voice Note ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
