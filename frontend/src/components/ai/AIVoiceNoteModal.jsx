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
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const VOICE_PERSONAS = [
  {
    id: 'dr_farhan',
    name: 'dr. Farhan (Konsultan Herbal Medis)',
    tone: 'Berwibawa, Edukatif, Santun & Ramah',
    pitch: 0.95,
    rate: 0.98,
    avatar: '👨‍⚕️',
  },
  {
    id: 'bunda_dewi',
    name: 'Bunda Dewi (Mentor Hangat)',
    tone: 'Keibuan, Penuh Perhatian, Menyejukkan',
    pitch: 1.15,
    rate: 1.0,
    avatar: '🧕',
  },
  {
    id: 'coach_ryan',
    name: 'Coach Ryan (Top Leader Muda)',
    tone: 'Energik, Percaya Diri, Menginspirasi',
    pitch: 1.05,
    rate: 1.08,
    avatar: '🚀',
  },
];

const GREETING_TEMPLATES = [
  {
    id: 'prospek_biolink',
    title: 'Sapaan Ramah Prospek Baru Bio-Link',
    tag: 'Prospek Baru',
    rawScript:
      'Halo {nama}, salam kenal ya! Saya {sponsor}. Terima kasih banyak sudah berkunjung ke halaman resmi kami. Saya perhatikan {nama} tertarik mencari solusi herbal resmi BPOM ya? Santai aja, jangan sungkan kalau mau tanya-tanya seputar aturan pakai atau keluhan kesehatan. Boleh saya tahu keluhan apa yang sedang dirasakan {nama} saat ini?',
  },
  {
    id: 'followup_ragu',
    title: 'Follow-Up Calon Pembeli Masih Ragu',
    tag: 'Follow-Up Closing',
    rawScript:
      'Halo {nama}, apa kabar hari ini? Semoga selalu sehat dan berkah rezekinya ya. Kemarin saya sempat ingat {nama} masih mempertimbangkan paket Bio-Propolis Bionet. Cuma mau mengabarkan kalau seluruh produk kita sudah lolos uji ketat BPOM dan halal MUI. Jadi insyaAllah sangat aman untuk ikhtiar kesehatan jangka panjang tanpa efek samping ke ginjal. Mau saya bantu siapkan paketnya hari ini dengan promo gratis ongkir?',
  },
  {
    id: 'edukasi_propolis',
    title: 'Edukasi Khasiat Bio-Propolis Pasca Sakit',
    tag: 'Edukasi Produk',
    rawScript:
      'Salam sehat {nama}! Gimana kondisi fisiknya hari ini? Semoga sudah jauh lebih segar ya. Untuk hasil terapi yang optimal, jangan lupa teteskan 7 tetes Bio-Propolis Trigona ke air hangat kuku 3 kali sehari 30 menit sebelum makan. Kalau ada reaksi awal seperti badan terasa hangat atau sering berkeringat, itu proses detoksifikasi alami ya {nama}. Tetap jaga hidrasi dan istirahat yang cukup!',
  },
  {
    id: 'welcome_mitra',
    title: 'Ucapan Selamat Bergabung Mitra Baru',
    tag: 'Mitra Baru',
    rawScript:
      'Assalamu’alaikum {nama}, selamat datang di keluarga besar Bionet Herbal Network! Saya {sponsor} bangga sekali bisa bermitra dengan {nama}. Di sini kita akan bertumbuh bersama, saling dukung, dan saya siap dampingi {nama} langkah demi langkah sampai berhasil mencairkan bonus pasangan pertama. Nanti malam kita agendakan ngobrol santai 10 menit ya {nama}!',
  },
  {
    id: 'reminder_ro',
    title: 'Pengingat Repeat Order Habis Pakai',
    tag: 'Repeat Order',
    rawScript:
      'Halo {nama}, salam hangat! Sekadar menyapa, sudah hampir 3 minggu sejak botol herbal Bionet terakhir diterima. Pasti isinya sudah mulai menipis ya? Agar proses pemulihan dan regenerasi sel tidak terputus, ada baiknya restock sebelum benar-benar habis. Kebetulan hari ini gudang lagi ada subsidi ongkir khusus konsumen setia kami. Kabari ya kalau mau dikirimkan hari ini!',
  },
];

export default function AIVoiceNoteModal({ isOpen, onClose, currentUser }) {
  const [selectedPersona, setSelectedPersona] = useState('dr_farhan');
  const [selectedTemplateId, setSelectedTemplateId] = useState('prospek_biolink');
  const [prospectName, setProspectName] = useState('Ibu Maryam');
  const [prospectPhone, setProspectPhone] = useState('');
  const [customScript, setCustomScript] = useState('');

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(25);
  const [copied, setCopied] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const synthRef = useRef(null);
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
      if (window.speechSynthesis) {
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
    utterance.rate = activePersonaObj.rate;
    utterance.pitch = activePersonaObj.pitch;

    // Estimate duration (~150 words per minute)
    const words = customScript.split(/\s+/).length;
    const estDuration = Math.max(10, Math.round((words / 2.5)));
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
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSendToWhatsApp = () => {
    const rawNumber = prospectPhone.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;

    let text = `🎙️ *[PESAN SUARA / VOICE NOTE DARI ${currentUser?.full_name || 'KONSULTAN BIONET'}]*\n\n`;
    text += `${customScript}\n\n`;
    text += `_Pesan suara ini telah disintesis dengan teknologi AI Audio Studio Bionet Herbal._`;

    const msg = encodeURIComponent(text);
    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
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

  // Generate 28 dynamic equalizer bars
  const eqBars = Array.from({ length: 24 }).map((_, i) => {
    // Generate pseudorandom height pattern
    const baseHeight = [35, 60, 90, 45, 80, 100, 70, 50, 85, 95, 65, 40, 75, 90, 55, 80, 100, 60, 45, 70, 85, 50, 65, 30][i % 24];
    return baseHeight;
  });

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
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800"
      >
        {/* DashLite Luxury Emerald Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
              <Mic size={20} className="text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Voice Synthesis Studio
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <Radio size={12} className="mr-1 text-emerald-300" /> WhatsApp Audio Note
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Studio AI Voice Note WhatsApp
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Prospect & Voice Persona Select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Kontak Prospek / Mitra
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="Contoh: Ibu Maryam"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nomor WhatsApp Prospek
              </label>
              <input
                type="text"
                value={prospectPhone}
                onChange={(e) => setProspectPhone(e.target.value)}
                placeholder="Nomor WhatsApp prospek (contoh: 628...)"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Voice Persona Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
              <User size={13} className="mr-1 text-emerald-600" />
              Pilih Karakter &amp; Nada Suara AI:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {VOICE_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`p-3 rounded-xl border text-left transition flex items-start space-x-2.5 ${
                    selectedPersona === persona.id
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xl">{persona.avatar}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {persona.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                      {persona.tone}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Template Selection Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
              <FileAudio size={13} className="mr-1 text-emerald-600" />
              Pilih Template Naskah Sapaan:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GREETING_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold border transition ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Script Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Naskah Pesan Suara (Bisa Diedit Bebas):
              </label>
              <button
                type="button"
                onClick={handleCopyScript}
                className="text-[11px] text-emerald-700 font-bold hover:underline flex items-center space-x-1"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Tersalin' : 'Salin Naskah'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
            />
          </div>

          {/* Dynamic Audio Waveform Visualizer Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-emerald-300">
                  {isPlaying ? 'Memutar Audio AI...' : 'Audio Siap Diputar'}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                00:{String(currentTime).padStart(2, '0')} / 00:{String(duration).padStart(2, '0')}
              </div>
            </div>

            {/* Waveform Equalizer Display */}
            <div className="h-16 flex items-center justify-between gap-1 px-2 bg-slate-950/60 rounded-xl border border-emerald-500/15 overflow-hidden">
              {eqBars.map((height, idx) => (
                <div
                  key={idx}
                  className="w-full bg-gradient-to-t from-emerald-600 via-teal-400 to-emerald-300 rounded-full transition-all duration-150"
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (Math.sin((currentTime * 3) + idx) + 1.2)) / 2)}%` : '15%',
                    opacity: isPlaying ? 0.95 : 0.35,
                  }}
                />
              ))}
            </div>

            {/* Playback Controls & Send Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-emerald-500/30 flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
                >
                  {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                  <span>{isPlaying ? 'Pause Audio' : 'Putar Suara AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                  title="Reset Audio"
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-teal-500/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
              >
                <Send size={15} />
                <span>Kirim ke WhatsApp Prospek</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
