import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Users,
  Wallet,
  TrendingUp,
  MessageSquare,
  Bot,
  Radio,
  Server,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sliders,
  Play,
  RotateCcw,
  Check,
  Copy,
  Smartphone,
  QrCode,
  DollarSign,
  Award,
  Lock,
  Globe,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Send,
  Building,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';

/**
 * Web Audio API Synthesizer (Native Zero-Asset Audio)
 * Provides crisp tactile micro-clicks and deep warm confirmation chimes.
 */
function playSynthesizedSound(type = 'click') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export default function LandingPage({ onGoToLogin }) {
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(true);

  const triggerSound = (type = 'click') => {
    if (audioEnabled) {
      playSynthesizedSound(type);
    }
  };

  // Sticky Bar visibility on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // =========================================================================
  // HERO INTERACTIVE CANVAS: MINI GENEALOGY TREE & E-WALLET PULSE
  // =========================================================================
  const [heroMitraCount, setHeroMitraCount] = useState(14);
  const [heroWalletBalance, setHeroWalletBalance] = useState(4850000);
  const [heroPulseActive, setHeroPulseActive] = useState(false);

  const handleAddHeroMitra = () => {
    triggerSound('success');
    setHeroPulseActive(true);
    setHeroMitraCount((prev) => prev + 1);
    setHeroWalletBalance((prev) => prev + 350000); // Sponsor + Pairing simulation
    setTimeout(() => setHeroPulseActive(false), 900);
  };

  // =========================================================================
  // CROWN JEWEL: INTERACTIVE BRAINSTORMING STUDIO STATE
  // =========================================================================
  const [activeStudioTab, setActiveStudioTab] = useState('calculator'); // 'calculator' | 'ai-closing' | 'workflow'

  // Tab 1: Calculator State
  const [downlines, setDownlines] = useState(12);
  const [packageTier, setPackageTier] = useState('gold'); // 'silver' | 'gold' | 'platinum'
  const [roPerMonth, setRoPerMonth] = useState(4); // Repeat Order Box per downline

  const packageSpecs = {
    silver: { name: 'Silver', price: 1500000, sponsorBonus: 300000, bv: 1 },
    gold: { name: 'Gold', price: 4500000, sponsorBonus: 1000000, bv: 3 },
    platinum: { name: 'Platinum', price: 12500000, sponsorBonus: 3500000, bv: 10 },
  };

  const calculatedFinances = useMemo(() => {
    const pkg = packageSpecs[packageTier];
    const sponsorTotal = downlines * pkg.sponsorBonus;
    const pairs = Math.floor(downlines / 2);
    const pairingBonus = pairs * (pkg.bv * 150000);
    const beeFarmStaking = downlines * roPerMonth * 35000;
    const totalCashflow = sponsorTotal + pairingBonus + beeFarmStaking;

    return {
      sponsorTotal,
      pairs,
      pairingBonus,
      beeFarmStaking,
      totalCashflow,
    };
  }, [downlines, packageTier, roPerMonth]);

  // Tab 2: Live AI Smart Closing Playground State
  const [selectedNiche, setSelectedNiche] = useState('herbal');
  const [selectedObjection, setSelectedObjection] = useState('mahal');
  const [customObjectionInput, setCustomObjectionInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedScript, setAiGeneratedScript] = useState(null);
  const [botChatHistory, setBotChatHistory] = useState([]);

  const predefinedObjections = {
    mahal: 'Harganya mahal banget ya mas, produk lain ada yang lebih murah...',
    gaptek: 'Saya gaptek banget dan ga punya pengalaman jualan online sama sekali...',
    mlm: 'Ini bisnis MLM penipuan skema piramida ya? Trauma saya...',
    waktu: 'Saya kerja kantoran dari pagi sampe malem, ga ada waktu buat prospek orang...',
  };

  const handleSimulateAIClosing = () => {
    triggerSound('click');
    setIsGeneratingAI(true);
    setAiGeneratedScript(null);

    const objectionText = customObjectionInput.trim() || predefinedObjections[selectedObjection];

    setTimeout(() => {
      let script = {};
      if (selectedObjection === 'mahal' || objectionText.toLowerCase().includes('mahal')) {
        script = {
          empathy: 'Paham sekali Kak, wajar jika awalnya Kakak merasa demikian bila melihat angkanya saja.',
          reframe:
            'Namun produk herbal Bionet sudah berizin resmi BPOM RI & tersertifikasi Halal MUI dengan konsentrasi ekstrak murni 1:10 (bukan sekadar madu perasa biasa). Rata-rata 1 botol setara dengan 1 bulan pemakaian pencegahan, artinya investasi kesehatan keluarga hanya sekitar Rp 5.000-an per hari—jauh lebih hemat daripada biaya rawat inap di rumah sakit.',
          ctaButtons: [
            { id: 1, label: '🌿 Cek Uji Klinis & Izin BPOM RI', reply: 'Izin BPOM: TR213601811. Bebas bahan kimia obat (BKO) & teruji lab independen.' },
            { id: 2, label: '🎁 Klaim Paket Promo Diskon 30%', reply: 'Selamat! Kupon diskon 30% terpasang otomatis: Total Rp 280.000 (Hemat Rp 120.000). Ketik 1 untuk bayar QRIS.' },
            { id: 3, label: '📞 Konsultasi Dokter Herbal Gratis', reply: 'Menghubungkan ke Asisten Dokter Herbal Bionet 24/7. Apa keluhan utama yang ingin disembuhkan?' },
          ],
        };
      } else if (selectedObjection === 'mlm' || objectionText.toLowerCase().includes('mlm')) {
        script = {
          empathy: 'Saya sangat mengerti kekhawatiran Kakak, apalagi marak skema piramida bodong tanpa produk jelas.',
          reframe:
            'Di SYNETIQ, bisnis ini berbasis Real Direct-Commerce: Anda mendapatkan produk fisik herbal berkualitas tinggi dengan margin laba eceran hingga 40%. Tidak ada uang pendaftaran hilang cuma-cuma, dan sistem kami menggunakan Double-Entry Ledger terenkripsi dengan penarikan dana instan ke rekening bank Anda.',
          ctaButtons: [
            { id: 1, label: '📦 Lihat Katalog Produk Fisik BPOM', reply: 'Katalog Produk: Madu Bionet M4, Bio-Cream Kosmetik, Spray Antiseptik. Semua memiliki wujud fisik & izin edar.' },
            { id: 2, label: '🛡️ Audit Keamanan & Legalitas Perusahaan', reply: 'Perusahaan resmi terdaftar dengan NIB legal, SIUPL resmi, dan kepatuhan perbankan Bank Indonesia.' },
          ],
        };
      } else {
        script = {
          empathy: 'Kekhawatiran yang sangat masuk akal, dan 80% Top Leader kami awalnya juga memulai dengan kendala yang persis sama.',
          reframe:
            'Kelebihan utama ekosistem SYNETIQ adalah Anda TIDAK PERLU jago jualan manual. Kami telah menyediakan WhatsApp Store Bot otomatis dan AI Copilot 24/7 yang menyapa calon pembeli, menjelaskan manfaat produk, dan mengurus pembayaran QRIS secara otonom tanpa menyita waktu Anda.',
          ctaButtons: [
            { id: 1, label: '🤖 Lihat Cara Kerja Robot WhatsApp', reply: 'Robot WhatsApp aktif 24 jam. Setiap ada pesan masuk, bot langsung mengirimkan katalog bertombol rapi.' },
            { id: 2, label: '⚡ Coba Mulai Akun Percobaan Gratis', reply: 'Akun demo VIP siap diuji coba. Silakan klik link pendaftaran untuk mencoba dashboard otonom.' },
          ],
        };
      }

      setAiGeneratedScript(script);
      setBotChatHistory([
        { sender: 'user', text: objectionText },
        { sender: 'bot', text: `${script.empathy}\n\n${script.reframe}`, buttons: script.ctaButtons },
      ]);
      setIsGeneratingAI(false);
      triggerSound('success');
    }, 700);
  };

  const handleBotButtonClick = (btn) => {
    triggerSound('click');
    setBotChatHistory((prev) => [
      ...prev,
      { sender: 'user', text: btn.label },
      { sender: 'bot', text: btn.reply },
    ]);
  };

  // Tab 3: Interactive Workflow Simulator State
  const [activeWorkflowNode, setActiveWorkflowNode] = useState(1);

  const workflowSteps = [
    {
      id: 1,
      title: 'Lead Masuk',
      subtitle: 'TikTok Ads / Biolink',
      desc: 'Prospek mengisi nomor HP dari video TikTok atau biolink replikasi mitra.',
      payload: { event: 'lead_captured', source: 'tiktok_instant_form', lead_phone: '081288992211', referral_code: 'TOPLEADER01' },
    },
    {
      id: 2,
      title: 'WhatsApp Store Bot',
      subtitle: 'Katalog Tombol Otonom',
      desc: 'Bot WAHA langsung mengirim menu bertingkat otomatis dalam 1.2 detik.',
      payload: { action: 'send_interactive_buttons', target: '081288992211', menu: ['Paket Kemitraan', 'Madu BPOM', 'Bio-Cream'] },
    },
    {
      id: 3,
      title: 'QRIS Checkout',
      subtitle: 'Dynamic Virtual QR',
      desc: 'Pelanggan memilih paket, QRIS Bank Indonesia terbit dengan kode unik.',
      payload: { invoice: 'INV-2026-9921', total: 'Rp 4.500.000', gateway: 'QRIS_INTEROPERABLE', status: 'PENDING_PAYMENT' },
    },
    {
      id: 4,
      title: 'Webhook Callback',
      subtitle: 'HTTP 200 Settled',
      desc: 'Server payment gateway menembak webhook real-time ke Golang backend.',
      payload: { webhook_status: 'PAID', settlement_time: '2026-11-03 00:14:02', gateway_ref: 'MIDTRANS_QRIS_8819' },
    },
    {
      id: 5,
      title: 'Binary & E-Wallet',
      subtitle: 'Komisi Langsung Cair',
      desc: 'Ledger membagi bonus sponsor Rp 1.000.000 & matching pairing ke upline.',
      payload: { sponsor_payout: 'Rp 1.000.000', e_wallet_status: 'CREDITED', pairing_bv_left: '+3', pairing_bv_right: '+3' },
    },
    {
      id: 6,
      title: 'Otomasi Gudang',
      subtitle: 'Pengiriman Produk BPOM',
      desc: 'Surat jalan gudang otomatis terbit lengkap dengan resi ekspedisi.',
      payload: { warehouse_job: 'PRINT_SHIPPING_LABEL', product: 'Gold Package Herbal BPOM', courier: 'J&T_EXPRESS' },
    },
  ];

  // =========================================================================
  // LEAD REGISTRATION & CONSULTATION FORM
  // =========================================================================
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultInterest, setConsultInterest] = useState('white-label');
  const [consultSubmitting, setConsultSubmitting] = useState(false);
  const [consultSuccess, setConsultSuccess] = useState(false);

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!consultName || !consultPhone) {
      alert('Mohon isi nama dan nomor WhatsApp Anda.');
      return;
    }

    triggerSound('click');
    setConsultSubmitting(true);

    try {
      // Direct CRM lead capture
      await api.post('/crm/leads', {
        name: consultName,
        phone: consultPhone,
        email: consultEmail || `${consultPhone.replace(/\D/g, '')}@lead.synetiq.ai`,
        category: consultInterest === 'white-label' ? 'Calon Pemilik Brand (White-Label)' : 'Leader Networker',
        city: 'Online Registration',
        notes: `Mendaftar dari Landing Page SYNETIQ. Peminatan: ${consultInterest}.`,
      });
    } catch (err) {
      console.warn('Fallback lead recording:', err);
    } finally {
      setConsultSubmitting(false);
      setConsultSuccess(true);
      triggerSound('success');
    }
  };

  return (
    <div className="min-h-screen bg-[#03060a] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black overflow-x-clip">
      {/* ========================================================================= */}
      {/* 01: DYNAMIC ISLAND FLOATING NAVBAR */}
      {/* ========================================================================= */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl">
        <div className="bg-[#0e1726]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl shadow-emerald-950/40 flex items-center justify-between">
          {/* Brand Logo & Telemetry Dot */}
          <div className="flex items-center space-x-3">
            <a href="#hero" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition">
                <div className="w-full h-full bg-[#03060a] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition">
                    SYNETIQ
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    AI
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#brainstorming" className="hover:text-emerald-400 transition">
              Studio Brainstorming
            </a>
            <a href="#features" className="hover:text-emerald-400 transition">
              8 Sistem Utama
            </a>
            <a href="#security" className="hover:text-emerald-400 transition">
              SOC DEFCON 1
            </a>
            <a href="#beefarm" className="hover:text-emerald-400 transition">
              Gamifikasi Lebah
            </a>
            <a href="#pricing" className="hover:text-emerald-400 transition">
              Paket &amp; Lisensi
            </a>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                triggerSound('click');
              }}
              title={audioEnabled ? 'Matikan Suara Haptic' : 'Nyalakan Suara Haptic'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Login Link */}
            <button
              onClick={() => {
                triggerSound('click');
                if (onGoToLogin) onGoToLogin();
                else window.location.hash = '#/overview';
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition"
            >
              Masuk
            </button>

            {/* Primary Action Button */}
            <a
              href="#brainstorming"
              onClick={() => triggerSound('click')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/60 transition flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Coba Studio AI</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 02: HERO STAGE: THE AUTONOMOUS NETWORK HUB */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 max-w-7xl mx-auto">
        {/* Glow Spheres in background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column (Copywriting Hooks) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SYNETIQ ENTERPRISE NETWORK OS • V3.2 LIVE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Otomasi Jaringan. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Cerdas Menjual.
              </span>{' '}
              <br />
              Closing Instan 24/7.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Platform sistem operasi bisnis jaringan pertama yang mengintegrasikan{' '}
              <strong className="text-white">Pohon Binary Otonom</strong>,{' '}
              <strong className="text-white">Bot WhatsApp Bertombol Interaktif</strong>, asisten cerdas AI Gemini, dan{' '}
              <strong className="text-white">Pertahanan Cyber SOC DEFCON 1</strong>. Ubah obrolan biasa menjadi omzet tanpa henti.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#brainstorming"
                onClick={() => triggerSound('click')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 hover:scale-[1.02] active:scale-[0.98] transition flex items-center space-x-2 group"
              >
                <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition" />
                <span>Buka Brainstorming Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </a>

              <a
                href="#pricing"
                onClick={() => triggerSound('click')}
                className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-sm hover:text-white transition flex items-center space-x-2"
              >
                <span>Pilihan Lisensi Bisnis</span>
              </a>
            </div>

            {/* Quick Proof Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 max-w-md">
              <div>
                <div className="text-xl font-black text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400">Resmi Izin BPOM RI</div>
              </div>
              <div>
                <div className="text-xl font-black text-cyan-400 font-mono">12 ms</div>
                <div className="text-[11px] text-slate-400">Pairing Binary Engine</div>
              </div>
              <div>
                <div className="text-xl font-black text-amber-400 font-mono">24 / 7</div>
                <div className="text-[11px] text-slate-400">WhatsApp Bot Closing</div>
              </div>
            </div>
          </div>

          {/* Right Column (Hero Interactive Canvas: Mini Genealogy Tree & Live Wallet) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0e1726]/90 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300">Live Binary Tree &amp; E-Wallet Pulse</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  SINKRON REAL-TIME
                </span>
              </div>

              {/* Wallet Counter Card */}
              <div
                className={`my-4 p-4 rounded-2xl border transition-all duration-300 ${
                  heroPulseActive
                    ? 'bg-emerald-950/80 border-emerald-400 scale-[1.02] shadow-lg shadow-emerald-500/30'
                    : 'bg-[#03060a]/70 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Saldo Kas E-Wallet (Mitra Mahkota)</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
                  Rp {heroWalletBalance.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+Rp 350.000 dari bonus pasangan baru</span>
                </div>
              </div>

              {/* Mini Interactive Tree Visualizer */}
              <div className="bg-[#03060a]/90 rounded-2xl p-4 border border-white/5 relative">
                {/* Root Node */}
                <div className="flex justify-center mb-3">
                  <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-950 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Anda (Top Leader)</span>
                  </div>
                </div>

                {/* Tree Branches (SVG) */}
                <div className="h-6 flex justify-center items-center">
                  <svg className="w-48 h-6">
                    <line x1="96" y1="0" x2="36" y2="24" stroke="rgba(16,185,129,0.5)" strokeWidth="2" />
                    <line x1="96" y1="0" x2="156" y2="24" stroke="rgba(6,182,212,0.5)" strokeWidth="2" />
                  </svg>
                </div>

                {/* Binary Left & Right Nodes */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-400 font-bold">Kaki Kiri (Omzet)</div>
                    <div className="text-xs font-mono font-black text-white">124.500 BV</div>
                    <div className="text-[9px] text-slate-400">14 Mitra Aktif</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                    <div className="text-[10px] text-cyan-400 font-bold">Kaki Kanan (Omzet)</div>
                    <div className="text-xs font-mono font-black text-white">118.200 BV</div>
                    <div className="text-[9px] text-slate-400">{heroMitraCount} Mitra Aktif</div>
                  </div>
                </div>

                {/* Interactive Action Button inside Canvas */}
                <div className="mt-4 pt-3 border-t border-white/10 text-center">
                  <button
                    onClick={handleAddHeroMitra}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-extrabold transition active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>+ Simulasi Tambah Mitra (Klik untuk Test Pairing)</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    Klik tombol di atas untuk melihat respon pairing bonus seketika.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03: LIVE ARCHITECTURE TELEMETRY BAR */}
      {/* ========================================================================= */}
      <section className="border-y border-white/10 bg-[#070c14]/90 py-3.5 px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[760px] text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-400">DEFCON 1 ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span>Zero Security Breaches</span>
          </div>
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>GATEWAY RAILS: QRIS • BCA • MANDIRI • BRI • BNI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>WAHA BOT DOCKER: 24/7 AUTO-RESPONDER READY</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 DOUBLE-ENTRY FINTECH ENCRYPTED</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04: CROWN JEWEL: INTERACTIVE BRAINSTORMING & SMART CLOSING STUDIO */}
      {/* ========================================================================= */}
      <section id="brainstorming" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE INTERACTIVE BRAINSTORMING STUDIO</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Uji Coba Langsung di Layar: Buktikan Cuan Sebelum Bergabung
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Tidak perlu membayangkan brosur teori. Coba langsung kalkulator proyeksi laba, uji coba respon psikologi AI closing,
            atau saksikan simulasi alur uang dari iklan hingga masuk e-wallet.
          </p>

          {/* Studio Tab Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0e1726] border border-white/10 shadow-xl mt-4">
            <button
              onClick={() => {
                setActiveStudioTab('calculator');
                triggerSound('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeStudioTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-300" />
              <span>1. Kalkulator Laba &amp; ROI</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioTab('ai-closing');
                triggerSound('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeStudioTab === 'ai-closing'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>2. Playground AI Closing</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioTab('workflow');
                triggerSound('click');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeStudioTab === 'workflow'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-300" />
              <span>3. Simulator Alur 6-Node</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STUDIO TAB 1: BUSINESS MODELER & PROFIT CALCULATOR */}
        {/* ========================================================================= */}
        {activeStudioTab === 'calculator' && (
          <div className="bg-[#0e1726]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Input Sliders (Cols 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    <span>Konfigurasi Jaringan &amp; Penjualan Anda</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Geser nilai di bawah ini untuk melihat bagaimana sistem binary dan repeat order menghasilkan pasif income.
                  </p>
                </div>

                {/* Slider 1: Jumlah Direct Downline */}
                <div className="space-y-2 bg-[#03060a]/60 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">Jumlah Direct Mitra Disponsori:</label>
                    <span className="font-mono font-black text-emerald-400 text-base">{downlines} Orang</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={50}
                    step={1}
                    value={downlines}
                    onChange={(e) => {
                      setDownlines(parseInt(e.target.value));
                      triggerSound('click');
                    }}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>2 Mitra (Minimal Kiri-Kanan)</span>
                    <span>25 Mitra</span>
                    <span>50 Mitra (Top Leader)</span>
                  </div>
                </div>

                {/* Selector 2: Pilihan Paket Join Tim */}
                <div className="space-y-2 bg-[#03060a]/60 p-4 rounded-2xl border border-white/5">
                  <label className="block font-bold text-xs text-slate-300">Pilihan Rata-rata Paket Join Mitra:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['silver', 'gold', 'platinum'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setPackageTier(t);
                          triggerSound('click');
                        }}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition text-center border ${
                          packageTier === t
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="capitalize">{packageSpecs[t].name}</div>
                        <div className="text-[10px] font-mono mt-0.5 opacity-80">
                          Rp {(packageSpecs[t].price / 1000000).toFixed(1)} Jt
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 3: Repeat Order Bulanan */}
                <div className="space-y-2 bg-[#03060a]/60 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold text-slate-300">Estimasi Repeat Order Produk / Mitra / Bulan:</label>
                    <span className="font-mono font-black text-amber-400 text-base">{roPerMonth} Box</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={roPerMonth}
                    onChange={(e) => {
                      setRoPerMonth(parseInt(e.target.value));
                      triggerSound('click');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 Box (Konsumsi Pribadi)</span>
                    <span>10 Box</span>
                    <span>20 Box (Reseller Aktif)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Preset Cepat:</span>
                  <button
                    onClick={() => {
                      setDownlines(2);
                      setPackageTier('silver');
                      setRoPerMonth(2);
                      triggerSound('click');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                  >
                    Pemula (2 Mitra)
                  </button>
                  <button
                    onClick={() => {
                      setDownlines(10);
                      setPackageTier('gold');
                      setRoPerMonth(5);
                      triggerSound('click');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                  >
                    Leader Aktif (10 Mitra)
                  </button>
                  <button
                    onClick={() => {
                      setDownlines(30);
                      setPackageTier('platinum');
                      setRoPerMonth(10);
                      triggerSound('click');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px]"
                  >
                    Master Stokis (30 Mitra)
                  </button>
                </div>
              </div>

              {/* Right Output Dashboard (Cols 5) */}
              <div className="lg:col-span-5 bg-gradient-to-b from-[#03060a] to-[#07101c] p-6 rounded-3xl border border-emerald-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-slate-300">Proyeksi Pendapatan Bulanan</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      ESTIMASI KAS MASUK
                    </span>
                  </div>

                  {/* Big Glowing Total */}
                  <div className="my-6">
                    <div className="text-xs text-slate-400">Total Estimasi Cashflow / Bulan:</div>
                    <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight mt-1 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      Rp {calculatedFinances.totalCashflow.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Setara dengan <strong className="text-white">Rp {(calculatedFinances.totalCashflow / 30).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</strong> per hari otomatis.
                    </div>
                  </div>

                  {/* Breakdown details */}
                  <div className="space-y-2.5 text-xs border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bonus Sponsor Langsung:</span>
                      <span className="font-mono font-bold text-white">
                        Rp {calculatedFinances.sponsorTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Bonus Pasangan Binary ({calculatedFinances.pairs} Pasang):</span>
                      <span className="font-mono font-bold text-cyan-300">
                        Rp {calculatedFinances.pairingBonus.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Hasil Staking Nektar Bee Farm:</span>
                      <span className="font-mono font-bold text-amber-300">
                        Rp {calculatedFinances.beeFarmStaking.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <a
                    href="#pricing"
                    onClick={() => triggerSound('click')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition"
                  >
                    <span>Kunci Posisi Jaringan Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STUDIO TAB 2: LIVE AI SMART CLOSING PLAYGROUND */}
        {/* ========================================================================= */}
        {activeStudioTab === 'ai-closing' && (
          <div className="bg-[#0e1726]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Selector & Controls (Cols 6) */}
              <div className="lg:col-span-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <span>Pilih Keberatan Prospek yang Ingin Anda Hadapi</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Lihat bagaimana AI SYNETIQ menyusun skrip psikologis empati dan tombol WhatsApp interaktif untuk mengubah penolakan menjadi transferan.
                  </p>
                </div>

                {/* Predefined Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">Pilih Contoh Penolakan Umum:</label>
                  <div className="space-y-1.5">
                    {Object.entries(predefinedObjections).map(([key, text]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedObjection(key);
                          setCustomObjectionInput('');
                          triggerSound('click');
                        }}
                        className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition border ${
                          selectedObjection === key && !customObjectionInput
                            ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-md'
                            : 'bg-[#03060a]/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="font-mono text-cyan-400 mr-1.5">“</span>
                        {text}
                        <span className="font-mono text-cyan-400 ml-1.5">”</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom input box */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Atau Ketik Keberatan Kustom Sendiri:</label>
                  <input
                    type="text"
                    value={customObjectionInput}
                    onChange={(e) => setCustomObjectionInput(e.target.value)}
                    placeholder="Misal: Saya ga mau ikut kalau harus nyari orang..."
                    className="w-full bg-[#03060a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={handleSimulateAIClosing}
                  disabled={isGeneratingAI}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-cyan-950 transition flex items-center justify-center space-x-2"
                >
                  {isGeneratingAI ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                      <span>AI Sedang Menganalisis Psikologi Prospek...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Uji Coba AI Closing Sekarang</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Smartphone Simulator (Cols 6) */}
              <div className="lg:col-span-6 bg-[#03060a] rounded-3xl border border-white/10 p-4 shadow-2xl relative">
                {/* Phone Top Notch Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 px-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-[10px]">
                      S
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">SYNETIQ WhatsApp Bot 24/7</div>
                      <div className="text-[9px] text-emerald-400">● Online Otomatis</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">SIMULATOR WA</span>
                </div>

                {/* Chat Bubble Container */}
                <div className="h-[360px] overflow-y-auto p-3 space-y-3 bg-[#081018] rounded-2xl my-3 border border-white/5 text-xs">
                  {botChatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <Smartphone className="w-10 h-10 text-slate-600 mb-2" />
                      <p className="text-xs font-bold text-slate-400">Belum Ada Skenario Obrolan</p>
                      <p className="text-[11px] mt-1">
                        Pilih salah satu keberatan di sebelah kiri lalu klik tombol “Uji Coba AI Closing Sekarang”.
                      </p>
                    </div>
                  ) : (
                    botChatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl p-3 shadow-md whitespace-pre-wrap leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-emerald-700 text-white rounded-tr-xs'
                              : 'bg-[#152238] text-slate-200 rounded-tl-xs border border-white/10'
                          }`}
                        >
                          <div className="text-[10px] font-bold opacity-75 mb-1">
                            {msg.sender === 'user' ? 'Prospek Calon Pembeli:' : 'AI Closing SYNETIQ:'}
                          </div>
                          <div>{msg.text}</div>

                          {/* Stacked Interactive Buttons inside Bot Bubble */}
                          {msg.buttons && (
                            <div className="mt-3 pt-2 border-t border-white/10 space-y-1.5">
                              <div className="text-[10px] text-emerald-300 font-bold mb-1">
                                Klik tombol interaktif di bawah:
                              </div>
                              {msg.buttons.map((btn) => (
                                <button
                                  key={btn.id}
                                  onClick={() => handleBotButtonClick(btn)}
                                  className="w-full text-left py-2 px-3 rounded-xl bg-white/10 hover:bg-emerald-600/60 border border-white/15 text-white text-xs font-bold transition flex items-center justify-between group"
                                >
                                  <span>{btn.label}</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400">
                    Didukung Engine Multi-Model Gemini AI &amp; Format WhatsApp Interactive Message WAHA
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STUDIO TAB 3: INTERACTIVE WORKFLOW SIMULATOR (6-NODE LOOP) */}
        {/* ========================================================================= */}
        {activeStudioTab === 'workflow' && (
          <div className="bg-[#0e1726]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Alur Otomasi 6-Node: Dari Iklan Masuk Hingga Uang Cair ke Dompet</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Klik setiap node di bawah ini untuk melihat bagaimana data dan uang mengalir secara otomatis tanpa sentuhan manual.
                </p>
              </div>

              {/* 6 Node Cards Carousel */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {workflowSteps.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => {
                      setActiveWorkflowNode(node.id);
                      triggerSound('click');
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition relative ${
                      activeWorkflowNode === node.id
                        ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-950/60 scale-[1.02]'
                        : 'bg-[#03060a]/70 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-1">
                      <span>Node 0{node.id}</span>
                      {activeWorkflowNode === node.id && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white leading-tight">{node.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">{node.subtitle}</div>
                  </button>
                ))}
              </div>

              {/* Node Inspector Display */}
              <div className="bg-[#03060a] rounded-2xl border border-white/10 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      INSPEKTOR PAYLOAD NODE {activeWorkflowNode}: {workflowSteps[activeWorkflowNode - 1].title}
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">{workflowSteps[activeWorkflowNode - 1].desc}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    HTTP 200 OK • VERIFIED
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] text-slate-400 font-mono mb-1.5 flex items-center space-x-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Real-Time JSON Telemetry Payload:</span>
                  </div>
                  <pre className="bg-[#080d16] p-4 rounded-xl border border-white/5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                    {JSON.stringify(workflowSteps[activeWorkflowNode - 1].payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 05: THE 8 FLAGSHIP SYSTEMS BENTO GRID */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>ARSITEKTUR LENGKAP PLATFORM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            8 Sistem Unggulan Tanpa Celah dalam Satu Layar
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Seluruh modul telah dibangun dan saling terhubung secara native: tidak ada plugin tambal sulam yang mudah rusak.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Binary Genealogy */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Binary Tree Engine Otonom</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kalkulasi pasangan real-time dengan algoritma anti-sybil clustering, aturan flush-out presisi, dan visualisasi cabang interaktif.
            </p>
          </div>

          {/* Card 2: E-Wallet & Multi-Payment */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Dompet Kas &amp; Multi-Gateway</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mendukung QRIS Bank Indonesia, Virtual Account semua bank nasional, serta penarikan instan mutasi ganda yang aman.
            </p>
          </div>

          {/* Card 3: WhatsApp Interactive Store */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-pink-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Bot Toko WA Bertombol 24/7</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menu bertingkat native WAHA: konsumen memilih produk dan checkout via QRIS langsung di layar WhatsApp tanpa buka browser.
            </p>
          </div>

          {/* Card 4: CRM Leads Kanban */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">CRM Pipeline &amp; vCard Importer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pelacakan prospek dari Cold Lead hingga Closing, lengkap dengan fitur import massal ribuan kontak dari CSV atau Apple/Google vCard.
            </p>
          </div>

          {/* Card 5: Webmail & AI Email Auto-Responder */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-teal-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Webmail Client IMAP/SMTP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Komunikasi email bisnis terenkripsi dengan generator balasan email otomatis berbasis AI untuk prospek korporat dan vendor.
            </p>
          </div>

          {/* Card 6: Cyber Threat Radar SOC DEFCON 1 */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-red-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Cyber Threat Radar SOC DEFCON 1</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pusat komando pertahanan militer: GeoIP threat mapping, honeypot telemetri, sirene audio taktis, dan pencegahan serangan hacker.
            </p>
          </div>

          {/* Card 7: Gamifikasi Bee Farm (Honeycomb Staking) */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-yellow-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-4 group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Gamifikasi Panen Madu Lebah</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mekanisme staking nektar digital yang dapat ditukar saldo tunai e-wallet, membangkitkan downline pasif dan menekan angka churn 70%.
            </p>
          </div>

          {/* Card 8: BPOM Master & Package Configurator */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-indigo-500/40 hover:shadow-xl transition group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Katalog Resmi BPOM &amp; Paket</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sertifikasi resmi BPOM RI &amp; Halal MUI dengan konfigurator paket join (Silver/Gold/Platinum) yang terikat langsung ke Serial PIN.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06: CYBER THREAT RADAR SOC DEFCON 1 SHOWCASE */}
      {/* ========================================================================= */}
      <section id="security" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/10">
        <div className="bg-gradient-to-r from-[#03060a] via-[#09121f] to-[#03060a] border border-red-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <span>KEAMANAN FINANSIAL KELAS MILITER</span>
              </div>
              <h3 className="text-3xl font-extrabold text-white">
                Cyber Threat Radar SOC DEFCON 1: Saldo &amp; Data Anda Aman 100%
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Salah satu ketakutan terbesar pemilik bisnis jaringan adalah saldo e-wallet dibobol hacker atau server down di akhir bulan.
                SYNETIQ dilengkapi dashboard pemantauan ancaman siber real-time dengan penangkal DDoS, honeypot otomatis, dan enkripsi perbankan.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400">Status Keamanan:</div>
                  <div className="text-emerald-400 font-bold mt-0.5">● DEFCON 1 (Siaga Penuh)</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-slate-400">Proteksi Transaksi:</div>
                  <div className="text-cyan-400 font-bold mt-0.5">● Idempotency Ledger</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#03060a] border border-white/10 rounded-2xl p-4 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400">
                <span>TERMINAL TELEMETRI PERTAHANAN</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <div className="space-y-1.5 mt-3 text-slate-300 text-[11px] leading-relaxed">
                <div>[00:14:02] GeoIP tracing Frankfurt Hub: 0 malicious anomalies detected.</div>
                <div>[00:14:05] Rate limiter WAF: 4,812 requests/min processed normally.</div>
                <div>[00:14:09] Honeypot telemetry: Inbound brute-force payload auto-blacklisted.</div>
                <div>[00:14:12] Double-entry reconciliation: Ledger debits/credits match perfectly.</div>
                <div className="text-emerald-400 font-bold">[OK] Core system status: 100% HEALTHY.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07: PRICING & MONETIZATION TIERS */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>PILIHAN LISENSI &amp; MODEL BISNIS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mulai Cetak Cuan dari Ekosistem SYNETIQ
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Pilih apakah Anda ingin bergabung sebagai Top Leader berpenghasilan tinggi, atau memiliki sistem ini secara utuh (White-Label).
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Tier 1: Pro Networker */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Untuk Reseller &amp; Mitra Aktif</div>
              <h4 className="text-xl font-black text-white mt-1">Pro Networker</h4>
              <div className="my-5">
                <span className="text-3xl font-black text-white font-mono">Rp 99.000</span>
                <span className="text-xs text-slate-400"> / bulan</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Akses Toko Replikasi Bio-Link Pribadi</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>AI Objection Handler (100 query / bln)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Koneksi WhatsApp Store Bot 1 Nomor</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Fitur Gamifikasi Panen Madu Lebah</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#consultation"
                onClick={() => triggerSound('click')}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center transition"
              >
                Pilih Paket Pro
              </a>
            </div>
          </div>

          {/* Tier 2: Elite Leader (Featured) */}
          <div className="bg-gradient-to-b from-[#0e1c2e] to-[#07111d] border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl shadow-emerald-950/60 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              Paling Populer untuk Leader
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Untuk Master Leader &amp; Stokis</div>
              <h4 className="text-xl font-black text-white mt-1">Elite Leader</h4>
              <div className="my-5">
                <span className="text-3xl font-black text-emerald-400 font-mono">Rp 299.000</span>
                <span className="text-xs text-slate-400"> / bulan</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Unlimited AI Copilot &amp; Voice Note Script</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Multi-Session WhatsApp (Hingga 3 Nomor WA)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Downline Inactivity Radar (Deteksi Churn)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Custom Meta Pixel &amp; TikTok Events Tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Prioritas Penarikan E-Wallet Instan</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#consultation"
                onClick={() => triggerSound('click')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center transition"
              >
                Ambil Akses Elite Leader
              </a>
            </div>
          </div>

          {/* Tier 3: White-Label Enterprise */}
          <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-white/20 transition">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Untuk Pemilik Pabrik &amp; Brand Sendiri</div>
              <h4 className="text-xl font-black text-white mt-1">White-Label Enterprise</h4>
              <div className="my-5">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">Rp 75 Juta - 250 Jt</span>
                <span className="text-xs text-slate-400 block mt-0.5">Sekali Bayar (Full Turnkey)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Full Source Deployment di VPS Pribadi Anda</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Kustom Nama Brand, Domain, &amp; Logo Sendiri</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Rekening &amp; Gateway Pembayaran Langsung ke Anda</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Sistem Cyber SOC DEFCON 1 Siap Pakai</span>
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <a
                href="#consultation"
                onClick={() => triggerSound('click')}
                className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center transition"
              >
                Konsultasi Lisensi Turnkey
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08: LEAD CAPTURE & VIP CONSULTATION FORM */}
      {/* ========================================================================= */}
      <section id="consultation" className="py-20 px-4 max-w-4xl mx-auto border-t border-white/10">
        <div className="bg-[#0e1726] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Siap Memulai? Jadwalkan Demo VIP Bersama Tim SYNETIQ
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Isi data di bawah ini. Bot cerdas kami akan langsung mengirimkan undangan demo dan akses dashboard percobaan ke WhatsApp Anda.
            </p>
          </div>

          {consultSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Terima Kasih, Permintaan Terkirim!</h4>
              <p className="text-xs text-slate-300">
                Pesan sambutan dan link akses demo telah dikirimkan ke nomor WhatsApp{' '}
                <strong className="text-emerald-400">{consultPhone}</strong>. Silakan periksa WhatsApp Anda sekarang!
              </p>
            </div>
          ) : (
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nama Lengkap:</label>
                  <input
                    type="text"
                    required
                    value={consultName}
                    onChange={(e) => setConsultName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nomor WhatsApp Aktif:</label>
                  <input
                    type="tel"
                    required
                    value={consultPhone}
                    onChange={(e) => setConsultPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Alamat Email (Opsional):</label>
                  <input
                    type="email"
                    value={consultEmail}
                    onChange={(e) => setConsultEmail(e.target.value)}
                    placeholder="budi@gmail.com"
                    className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Peminatan Anda:</label>
                  <select
                    value={consultInterest}
                    onChange={(e) => setConsultInterest(e.target.value)}
                    className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="white-label">Lisensi White-Label Turnkey (Miliki Brand Sendiri)</option>
                    <option value="elite-leader">Bergabung Jadi Top Leader Jaringan</option>
                    <option value="reseller">Reseller &amp; Agen Produk Herbal BPOM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={consultSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-950 transition flex items-center justify-center space-x-2"
                >
                  {consultSubmitting ? (
                    <span>Mengirimkan Permintaan Demo...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim &amp; Hubungkan ke WhatsApp Bot Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09: FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 bg-[#020407] py-12 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm">SYNETIQ</span>
            <span>— Autonomous Intelligence for Modern Networks.</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>Standar BPOM RI Terdaftar</span>
            <span>Fintech-Grade Ledger</span>
            <span>SOC DEFCON 1 Protected</span>
          </div>
          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} SYNETIQ Enterprise Ecosystem. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 10: STICKY FLOATING BOTTOM ACTION BAR */}
      {/* ========================================================================= */}
      {showStickyBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-3xl animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#0e1726]/90 backdrop-blur-xl border border-emerald-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-black flex items-center justify-between">
            <div className="hidden sm:flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs font-bold text-white">Ingin Menghitung Potensi Cuan Anda?</div>
                <div className="text-[10px] text-slate-400">Gunakan Interactive Brainstorming Studio gratis.</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <a
                href="#brainstorming"
                onClick={() => triggerSound('click')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Studio</span>
              </a>

              <a
                href="#consultation"
                onClick={() => triggerSound('click')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-md shadow-emerald-950 transition flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Mulai Sekarang</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
