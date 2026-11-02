import React, { useState, useEffect, useMemo } from 'react';
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
  Flame,
  HeartHandshake,
  PackageCheck,
  PhoneCall,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';
import api from '../services/api';
import HeroShowcaseSlideshow from '../components/HeroShowcaseSlideshow';

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

  // Smooth Scroll handler without modifying window.location.hash away from '#/landing'
  const scrollToSection = (sectionId) => {
    triggerSound('click');
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Handle auto-scroll if initial hash contains a target section
  useEffect(() => {
    try {
      const rawHash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
      if (rawHash && rawHash !== 'landing') {
        setTimeout(() => {
          const elem = document.getElementById(rawHash);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    } catch (e) {
      // Ignore hash read errors
    }
  }, []);

  // =========================================================================
  // HERO SHOWCASE STATE (Synchronized with HeroShowcaseSlideshow)
  // =========================================================================
  const [heroMitraCount, setHeroMitraCount] = useState(14);
  const [heroWalletBalance, setHeroWalletBalance] = useState(4850000);

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
            'Namun software SaaS SYNETIQ adalah produk digital all-in-one: Anda langsung mendapatkan Bot WhatsApp AI auto-closing 24/7, mesin pohon binary sub-12ms, dan ledger QRIS otomatis tanpa perlu sewa programmer atau bayar tim admin puluhan juta. Dengan aktivasi instan detik ini, nol biaya ongkir, dan ROI tinggi dari komisi otomatis, investasi software ini bahkan bisa balik modal dalam hitungan hari.',
          ctaButtons: [
            { id: 1, label: '⚡ Cek Fitur Lisensi Digital & Demo', reply: 'Akses SaaS Instan: Serial PIN otomatis terbit, bot WhatsApp aktif 24/7, dan dashboard cloud siap pakai detik ini.' },
            { id: 2, label: '🎁 Klaim Promo Lisensi Diskon 30%', reply: 'Selamat! Kupon diskon lisensi 30% terpasang: Akses Cloud SaaS lengkap langsung aktif tanpa biaya ongkir. Ketik 1 untuk bayar QRIS.' },
            { id: 3, label: '🤖 Coba Interaksi Bot WhatsApp Live', reply: 'Menghubungkan ke Bot WhatsApp AI SYNETIQ. Bot siap menjawab prospek dan closing 24 jam non-stop!' },
          ],
        };
      } else if (selectedObjection === 'mlm' || objectionText.toLowerCase().includes('mlm')) {
        script = {
          empathy: 'Saya sangat mengerti kekhawatiran Kakak, apalagi marak skema piramida bodong tanpa produk atau nilai riil.',
          reframe:
            'Di SYNETIQ, apa yang Anda beli dan pasarkan adalah 100% Produk Digital & Lisensi Software Cloud SaaS nyata berteknologi tinggi. Anda mendapatkan tools otomatisasi bisnis berstandar enterprise: Bot WhatsApp AI Closer, Double-Entry Ledger FinTech, dan sistem pohon biner otonom. Tidak ada biaya hangus, tidak ada barang numpuk di gudang, dan komisi cair instan sub-12ms ke rekening bank Anda.',
          ctaButtons: [
            { id: 1, label: '💻 Lihat Paket Lisensi Digital Cloud', reply: 'Katalog Lisensi: Core Binary SaaS, Bot WhatsApp AI Closer, dan SOC DEFCON 1 Enterprise Cyber Defense.' },
            { id: 2, label: '🛡️ Audit Keamanan & Kepatuhan FinTech', reply: 'Sistem cloud bersertifikasi ISO-27001 standard, enkripsi AES-256 GCM, dan kepatuhan pembayaran QRIS Bank Indonesia.' },
          ],
        };
      } else {
        script = {
          empathy: 'Kekhawatiran yang sangat masuk akal, dan 80% Top Leader kami awalnya juga memulai dengan kendala yang persis sama.',
          reframe:
            'Kelebihan utama ekosistem produk digital SYNETIQ adalah sistemnya SUDAH JADI dan CLOUD NATIVE. Anda tidak perlu install server rumit atau coding. Kami menyediakan Bot WhatsApp AI 24/7 yang menyapa calon pembeli, menjelaskan lisensi software, dan menerbitkan QRIS otomatis tanpa menyita waktu Anda.',
          ctaButtons: [
            { id: 1, label: '🤖 Lihat Cara Kerja Robot WhatsApp', reply: 'Robot WhatsApp aktif 24 jam. Setiap ada pesan masuk, bot langsung mengirimkan katalog lisensi bertombol rapi.' },
            { id: 2, label: '⚡ Coba Mulai Akun Percobaan Gratis', reply: 'Akun demo VIP siap diuji coba. Silakan klik link pendaftaran untuk mencoba dashboard cloud otonom.' },
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

  // Tab 3: Interactive Workflow Simulator State (Infographic Business Cards)
  const [activeWorkflowNode, setActiveWorkflowNode] = useState(1);
  const [simulatedWaToast, setSimulatedWaToast] = useState(null);

  const workflowSteps = [
    {
      id: 1,
      title: 'Lead Masuk',
      subtitle: 'TikTok Ads / Biolink',
      desc: 'Prospek mengisi formulir pendaftaran dari video TikTok atau biolink replikasi mitra secara otonom.',
      businessData: {
        prospectName: 'Budi Santoso',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'Menunggu Pemilihan Paket SaaS',
        commissionValue: 'Potensi Rp 1.350.000',
        digitalDelivery: 'Lisensi Digital Cloud: Siap Aktivasi Instan',
        stepHighlight: 'Nomor WhatsApp berhasil divalidasi ke database AI WhatsApp dalam 0.3 detik',
        statusColor: 'emerald',
        badge: 'LEAD CAPTURED',
        details: 'Data prospek langsung tersinkronisasi ke CRM Pipeline tanpa input admin manual.',
      },
    },
    {
      id: 2,
      title: 'WhatsApp Store Bot',
      subtitle: 'Katalog Tombol Otonom',
      desc: 'Bot WhatsApp AI langsung mengirim menu lisensi digital bertingkat otomatis dalam 1.2 detik tanpa jeda.',
      businessData: {
        prospectName: 'Budi Santoso',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'Katalog Terkirim (Pilihan Paket Gold SaaS)',
        commissionValue: 'Estimasi Rp 1.350.000 (Sponsor + Pasangan)',
        digitalDelivery: 'Paket Terpilih: Lisensi Digital Core SaaS + AI Bot',
        stepHighlight: 'Bot mengirimkan pesan interaktif dengan tombol pilihan paket lisensi software instan',
        statusColor: 'teal',
        badge: 'WHATSAPP AI ACTIVE',
        details: 'Calon pembeli cukup menekan tombol pada WhatsApp untuk memilih paket lisensi software digital SYNETIQ.',
      },
    },
    {
      id: 3,
      title: 'QRIS Checkout',
      subtitle: 'Dynamic Virtual QR',
      desc: 'Pelanggan memilih paket, QRIS Bank Indonesia terbit seketika dengan kode unik anti-salah.',
      businessData: {
        prospectName: 'Budi Santoso',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'QRIS Menunggu Scan (NMID: ID102008492019)',
        commissionValue: 'Terkunci Sistem (Invoice INV-2026-9921)',
        digitalDelivery: 'Metode Pengiriman: 100% Cloud Native (Nol Biaya Ongkir)',
        stepHighlight: 'QRIS Dinamis resmi Bank Indonesia berlaku 15 menit dengan nominal presisi Rp 4.500.000',
        statusColor: 'amber',
        badge: 'QRIS GENERATED',
        details: 'Dapat dibayar dari BCA Mobile, Livin Mandiri, BRImo, BNI, GoPay, OVO, atau ShopeePay.',
      },
    },
    {
      id: 4,
      title: 'Webhook Callback',
      subtitle: 'HTTP 200 Settled',
      desc: 'Server payment gateway menembak webhook real-time ke Golang backend secara instan.',
      businessData: {
        prospectName: 'Budi Santoso',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'LUNAS TERVERIFIKASI (HTTP 200 Settled)',
        commissionValue: 'Siap Didistribusikan ke Saldo Upline',
        digitalDelivery: 'Serial PIN & Kunci Lisensi Digital Terbit Otomatis',
        stepHighlight: 'Pembayaran Rp 4.500.000 sukses diterima, rekonsiliasi kas 0.8 detik tanpa selisih 1 rupiah pun',
        statusColor: 'emerald',
        badge: 'PAYMENT VERIFIED',
        details: 'Idempotency ledger memastikan tidak ada pembayaran ganda atau saldo tertelan.',
      },
    },
    {
      id: 5,
      title: 'Binary & E-Wallet',
      subtitle: 'Komisi Langsung Cair',
      desc: 'Ledger membagi bonus sponsor Rp 1.000.000 & matching pairing 12ms ke dompet upline.',
      businessData: {
        prospectName: 'Budi Santoso (Mitra Baru Aktif)',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'Double-Entry Ledger Berimbang 100%',
        commissionValue: '+Rp 1.000.000 (Sponsor) & +Rp 350.000 (Pairing 12ms)',
        digitalDelivery: 'Akses SaaS Aktif: Hak Usaha & Lisensi Siap Pakai',
        stepHighlight: 'Saldo e-wallet upline langsung bertambah real-time dan notifikasi WA otomatis terkirim',
        statusColor: 'cyan',
        badge: 'COMMISSION CREDITED',
        details: 'Perhitungan pohon binary diselesaikan dalam 12 milidetik dengan auto-placement rapi.',
      },
    },
    {
      id: 6,
      title: 'Aktivasi Instan',
      subtitle: 'Akun SaaS Langsung Aktif',
      desc: 'Serial PIN digital terbit otomatis, akun SaaS langsung aktif detik ini juga tanpa kurir fisik.',
      businessData: {
        prospectName: 'Budi Santoso (Member SaaS Aktif)',
        phone: '0812-8899-2211',
        adSource: 'TikTok Ads (Biolink Replikasi)',
        gatewayStatus: 'Transaksi Selesai Sempurna (100% Cloud)',
        commissionValue: 'Komisi Telah Masuk Saldo E-Wallet Upline',
        digitalDelivery: 'Serial PIN: SYN-2026-CLOUD-9921 (Akses Cloud Aktif)',
        stepHighlight: 'Serial PIN lisensi digital diterbitkan otomatis via WhatsApp & dashboard langsung aktif seketika',
        statusColor: 'emerald',
        badge: 'INSTANT ACTIVATION',
        details: 'Aktivasi produk digital 100% instan: pengguna langsung dapat login ke dashboard SaaS dan menikmati seluruh modul otonom.',
      },
    },
  ];

  const handleNextWorkflowNode = () => {
    triggerSound('click');
    setActiveWorkflowNode((prev) => (prev < 6 ? prev + 1 : 1));
  };

  const handleResetWorkflow = () => {
    triggerSound('click');
    setActiveWorkflowNode(1);
  };

  const handleSimulateWaPush = () => {
    triggerSound('success');
    const currentNode = workflowSteps[activeWorkflowNode - 1];
    setSimulatedWaToast(
      `📲 [WhatsApp AI Bot] Notifikasi terkirim ke 0812-8899-2211: "${currentNode.title} berhasil diproses dalam 0.4s!"`
    );
    setTimeout(() => setSimulatedWaToast(null), 4000);
  };

  // =========================================================================
  // BEE FARM INTERACTIVE HARVEST WIDGET STATE
  // =========================================================================
  const [beeHoneyLiters, setBeeHoneyLiters] = useState(14.8);
  const [beeHarvestToast, setBeeHarvestToast] = useState(null);

  const handleHarvestBeeHoney = () => {
    triggerSound('success');
    setBeeHoneyLiters((prev) => Number((prev + 2.5).toFixed(1)));
    setHeroWalletBalance((prev) => prev + 87500);
    setBeeHarvestToast('🍯 Klaim Berhasil! +2.5k Digital Nectar (+Rp 87.500 Cair ke Saldo E-Wallet)');
    setTimeout(() => setBeeHarvestToast(null), 3800);
  };

  // =========================================================================
  // LEAD REGISTRATION & CONSULTATION FORM STATE (Simplified per instruction 2)
  // =========================================================================
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultInterest, setConsultInterest] = useState('mitra-leader'); // 'mitra-leader' | 'demo-vip'
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
      await api.post('/crm/leads', {
        name: consultName,
        phone: consultPhone,
        email: consultEmail || `${consultPhone.replace(/\D/g, '')}@lead.synetiq.ai`,
        category: consultInterest === 'mitra-leader' ? 'Mitra / Top Leader Jaringan' : 'Akses Demo VIP & Konsultasi',
        city: 'Online Registration',
        notes: `Mendaftar dari Landing Page SYNETIQ. Peminatan: ${consultInterest === 'mitra-leader' ? 'Bergabung Jadi Mitra / Top Leader Jaringan' : 'Akses Demo VIP & Konsultasi'}.`,
      });
    } catch (err) {
      console.warn('Fallback lead recording:', err);
    } finally {
      setConsultSubmitting(false);
      setConsultSuccess(true);
      triggerSound('success');
    }
  };

  const activeNodeData = workflowSteps[activeWorkflowNode - 1];

  return (
    <div className="min-h-screen bg-[#03060a] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black overflow-x-clip">
      {/* ========================================================================= */}
      {/* 01: DYNAMIC ISLAND FLOATING NAVBAR (Buttons without URL hash changes)     */}
      {/* ========================================================================= */}
      <nav className="fixed top-3.5 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
        <div className="bg-[#0e1726]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-4 sm:px-6 py-2.5 shadow-2xl shadow-emerald-950/40 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection('hero')}
              className="flex items-center space-x-2.5 group text-left focus:outline-none"
            >
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
            </button>
          </div>

          {/* Nav Links (Desktop) - Smooth Scroll via scrollToSection with crisp single-line layout */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-7 text-[13px] font-medium text-slate-300 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => scrollToSection('brainstorming')}
              className="whitespace-nowrap hover:text-emerald-400 transition focus:outline-none shrink-0"
            >
              Studio Brainstorming
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="whitespace-nowrap hover:text-emerald-400 transition focus:outline-none shrink-0"
            >
              8 Sistem Utama
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('security')}
              className="whitespace-nowrap hover:text-rose-400 transition focus:outline-none flex items-center space-x-1.5 shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>SOC DEFCON 1</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('beefarm')}
              className="whitespace-nowrap hover:text-amber-400 transition focus:outline-none flex items-center space-x-1.5 shrink-0"
            >
              <span>🍯</span>
              <span>Gamifikasi Lebah</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('digital-products')}
              className="whitespace-nowrap hover:text-emerald-400 transition focus:outline-none flex items-center space-x-1.5 shrink-0"
            >
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Produk Digital</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="whitespace-nowrap hover:text-cyan-400 transition focus:outline-none shrink-0"
            >
              Konsultasi &amp; Demo
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                triggerSound('click');
              }}
              title={audioEnabled ? 'Matikan Suara Haptic' : 'Nyalakan Suara Haptic'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition focus:outline-none"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Login Link */}
            <button
              type="button"
              onClick={() => {
                triggerSound('click');
                if (onGoToLogin) onGoToLogin();
                else window.location.hash = '#/overview';
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition focus:outline-none"
            >
              Masuk
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/60 transition flex items-center space-x-1.5 focus:outline-none"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Coba Demo VIP</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 02: HERO SECTION - CENTERED HERO WITH FULL-WIDTH SLIDESHOW (Theme: Deep Obsidian) */}
      {/* ========================================================================= */}
      <section
        id="hero"
        className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden bg-[#03060a]"
      >
        {/* Emerald Aurora Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[360px] h-[360px] bg-cyan-500/10 blur-[110px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[360px] h-[360px] bg-emerald-600/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center px-4">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-950/50 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SYNETIQ ENTERPRISE NETWORK OS • V3.2 LIVE</span>
          </div>

          {/* Centered Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto mb-6">
            Otomasi Jaringan.{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Cerdas Menjual.
            </span>{' '}
            Closing Instan 24/7.
          </h1>

          {/* Centered Subheadline */}
          <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Platform sistem operasi bisnis jaringan pertama yang mengintegrasikan{' '}
            <strong className="text-white font-semibold">Pohon Binary Otonom</strong>,{' '}
            <strong className="text-white font-semibold">Bot WhatsApp Bertombol Interaktif</strong>, asisten cerdas AI Gemini, dan{' '}
            <strong className="text-white font-semibold">Pertahanan Cyber SOC DEFCON 1</strong>. Ubah obrolan biasa menjadi omzet tanpa henti.
          </p>

          {/* Centered CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm md:text-base shadow-xl shadow-emerald-950/80 hover:shadow-emerald-700/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2.5 group"
            >
              <Zap className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>⚡ Mulai Coba Gratis / Akses Demo VIP</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('brainstorming')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold text-sm md:text-base hover:text-white hover:border-emerald-500/40 transition-all duration-200 flex items-center justify-center space-x-2.5 group"
            >
              <Sparkles className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>💡 Buka Brainstorming Studio</span>
            </button>
          </div>

          {/* Centered Proof Metrics (3-column) */}
          <div className="grid grid-cols-3 gap-4 sm:gap-10 py-4 sm:py-5 px-6 sm:px-10 rounded-2xl bg-white/[0.03] border border-white/10 max-w-2xl mx-auto shadow-inner">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">100%</div>
              <div className="text-xs text-slate-300 font-bold mt-0.5">Produk Digital</div>
              <div className="text-[10px] text-slate-400 font-medium">Aktivasi Instan • Nol Ongkir</div>
            </div>
            <div className="text-center border-x border-white/10 px-3 sm:px-6">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">12 ms</div>
              <div className="text-xs text-slate-300 font-bold mt-0.5">Pairing Binary Engine</div>
              <div className="text-[10px] text-slate-400 font-medium">Auto Placement Spillover</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">24 / 7</div>
              <div className="text-xs text-slate-300 font-bold mt-0.5">WhatsApp Bot Closing</div>
              <div className="text-[10px] text-slate-400 font-medium">Multi-Session Cloud Bot</div>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH SHOWCASE SLIDESHOW (w-full max-w-[96vw] xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-2 sm:px-4) */}
        <div className="w-full max-w-[96vw] xl:max-w-[1400px] 2xl:max-w-[1560px] mx-auto px-2 sm:px-4 mt-12 sm:mt-16 relative z-10">
          <HeroShowcaseSlideshow
            audioEnabled={audioEnabled}
            triggerSound={triggerSound}
            heroMitraCount={heroMitraCount}
            setHeroMitraCount={setHeroMitraCount}
            heroWalletBalance={heroWalletBalance}
            setHeroWalletBalance={setHeroWalletBalance}
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03: LIVE ARCHITECTURE TELEMETRY BAR (Theme: Cyber Carbon #080d16)        */}
      {/* ========================================================================= */}
      <section className="border-y border-white/10 bg-[#080d16] py-3.5 px-4 overflow-x-auto">
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
            <span>WHATSAPP AI BOT: 24/7 AUTO-RESPONDER READY</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AES-256 DOUBLE-ENTRY FINTECH ENCRYPTED</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04: STUDIO BRAINSTORMING (Theme: Deep Tech Navy / Sapphire #06111f via #091b33) */}
      {/* ========================================================================= */}
      <section
        id="brainstorming"
        className="py-24 px-4 bg-gradient-to-b from-[#06111f] via-[#091b33] to-[#06111f] border-t border-cyan-500/20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STUDIO KECERDASAN ANALITIK OTONOM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Interactive Brainstorming &amp; Smart Closing Studio
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Jelajahi kalkulasi potensi cuan, simulasi cara bot AI menangani penolakan konsumen, dan saksikan bagaimana alur
              otomasi 6-node mengubah pengunjung menjadi mitra aktif.
            </p>

            {/* Studio Navigation Tabs */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#030812]/80 border border-white/10 backdrop-blur-md shadow-xl mt-4">
              <button
                type="button"
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
                <Sliders className="w-4 h-4 text-emerald-300" />
                <span>1. Kalkulator Bonus &amp; Cashflow</span>
              </button>

              <button
                type="button"
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
                <span>2. AI Smart Closing Simulator</span>
              </button>

              <button
                type="button"
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

          {/* --------------------------------------------------------------------- */}
          {/* STUDIO TAB 1: INTERACTIVE CASHFLOW CALCULATOR                          */}
          {/* --------------------------------------------------------------------- */}
          {activeStudioTab === 'calculator' && (
            <div className="bg-[#0b1626]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Controls (Cols 7) */}
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Sliders className="w-5 h-5 text-emerald-400" />
                      <span>Simulasikan Skala Jaringan Anda</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Geser parameter di bawah untuk melihat proyeksi bonus sponsor, pasangan binary sub-12ms, dan staking nektar lebah.
                    </p>
                  </div>

                  {/* Slider 1: Jumlah Mitra Direct Downline */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Target Mitra Direct (Bina Kaki Kiri &amp; Kanan):</span>
                      <span className="text-emerald-400 font-mono text-sm">{downlines} Mitra</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      step="2"
                      value={downlines}
                      onChange={(e) => {
                        setDownlines(Number(e.target.value));
                        triggerSound('click');
                      }}
                      className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2 Mitra (Minimal Keseimbangan)</span>
                      <span>50 Mitra</span>
                      <span>100 Mitra (Master Leader)</span>
                    </div>
                  </div>

                  {/* Selector: Paket Pilihan Produk Join */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Paket Produk &amp; Lisensi Digital SYNETIQ:</label>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.keys(packageSpecs).map((key) => {
                        const pkg = packageSpecs[key];
                        const isSelected = packageTier === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setPackageTier(key);
                              triggerSound('click');
                            }}
                            className={`p-3 rounded-2xl border text-left transition ${
                              isSelected
                                ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-950/60'
                                : 'bg-white/5 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="text-xs font-extrabold text-white">{pkg.name}</div>
                            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                              Rp {(pkg.price / 1000).toLocaleString('id-ID')}k
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Bonus: Rp {(pkg.sponsorBonus / 1000)}k</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Slider 2: Estimasi Repeat Order Lisensi Digital */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Repeat Order / Add-On Lisensi Cloud (Paket/Bln):</span>
                      <span className="text-amber-400 font-mono text-sm">{roPerMonth} Paket</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={roPerMonth}
                      onChange={(e) => {
                        setRoPerMonth(Number(e.target.value));
                        triggerSound('click');
                      }}
                      className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Output Dashboard (Cols 5) */}
                <div className="lg:col-span-5 bg-gradient-to-b from-[#030914] to-[#081224] p-6 rounded-3xl border border-emerald-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                      <span>PROYEKSI CASHFLOW BULANAN</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px]">SUB-12MS REAL-TIME</span>
                    </div>

                    {/* Big Glowing Total */}
                    <div className="my-6">
                      <div className="text-xs text-slate-400">Total Estimasi Penghasilan:</div>
                      <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono tracking-tight mt-1">
                        Rp {calculatedFinances.totalCashflow.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        *Otomatis cair ke saldo e-wallet tanpa potongan admin tersembunyi.
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-3 border-t border-white/10 pt-4 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">1. Bonus Sponsor Langsung:</span>
                        <span className="font-mono font-bold text-white">
                          Rp {calculatedFinances.sponsorTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">
                          2. Bonus Pasangan Binary ({calculatedFinances.pairs} Pasang):
                        </span>
                        <span className="font-mono font-bold text-cyan-400">
                          Rp {calculatedFinances.pairingBonus.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">3. Digital Staking (Reward Poin Nektar):</span>
                        <span className="font-mono font-bold text-amber-300">
                          Rp {calculatedFinances.beeFarmStaking.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => scrollToSection('consultation')}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Kunci Posisi Jaringan &amp; Mulai Sekarang</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STUDIO TAB 2: LIVE AI SMART CLOSING OBJECTION SIMULATOR               */}
          {/* --------------------------------------------------------------------- */}
          {activeStudioTab === 'ai-closing' && (
            <div className="bg-[#0b1626]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Objection Picker (Cols 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      <span>Pilih Penolakan Prospek yang Sering Dihadapi</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Saksikan bagaimana AI Copilot membedah keraguan prospek dan mengubahnya menjadi closing otomatis.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {Object.keys(predefinedObjections).map((key) => {
                      const isSelected = selectedObjection === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedObjection(key);
                            setCustomObjectionInput('');
                            triggerSound('click');
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left transition text-xs ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/60'
                              : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <div className="font-bold text-cyan-300 capitalize flex items-center space-x-1.5 mb-1">
                            <span>{key === 'mahal' && '💰'}</span>
                            <span>{key === 'gaptek' && '📱'}</span>
                            <span>{key === 'mlm' && '⚠️'}</span>
                            <span>{key === 'waktu' && '⏰'}</span>
                            <span>Objection: {key.toUpperCase()}</span>
                          </div>
                          <div className="text-[11px] text-slate-300 italic">"{predefinedObjections[key]}"</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isGeneratingAI}
                      onClick={handleSimulateAIClosing}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 transition"
                    >
                      {isGeneratingAI ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI Sedang Meracik Reframe Psikologis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-200" />
                          <span>Generate Reframe &amp; Tombol Interaktif WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right: Simulated WhatsApp Smart Closer Viewport (Cols 7) */}
                <div className="lg:col-span-7 bg-[#050b14] rounded-3xl border border-white/10 p-4 sm:p-5 shadow-2xl">
                  {/* WhatsApp Header Bar */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>SYNETIQ AI DIGITAL ASSISTANT</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Powered by WhatsApp Cloud AI Engine • Sub-1.2s Response
                      </div>
                    </div>
                  </div>

                  {/* Chat Message Thread */}
                  <div className="py-4 space-y-3 min-h-[300px] flex flex-col justify-end">
                    {botChatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                        <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                        <div className="text-xs font-medium">Klik tombol "Generate Reframe" di sebelah kiri</div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          Simulasi balasan bot WhatsApp AI beserta tombol pilihan interaktif akan tampil di sini.
                        </div>
                      </div>
                    ) : (
                      botChatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-emerald-700/80 text-white rounded-tr-none'
                                : 'bg-[#111c2e] border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-line'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {/* Interactive Buttons sent by Bot */}
                          {msg.buttons && (
                            <div className="flex flex-wrap gap-1.5 mt-1 max-w-[85%]">
                              {msg.buttons.map((btn) => (
                                <button
                                  key={btn.id}
                                  type="button"
                                  onClick={() => handleBotButtonClick(btn)}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-emerald-600/30 border border-emerald-500/30 hover:border-emerald-400 text-[11px] font-bold text-emerald-300 hover:text-white transition flex items-center space-x-1"
                                >
                                  <span>{btn.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* STUDIO TAB 3: 6-NODE WORKFLOW INFOGRAPHIC BUSINESS CARD (No raw JSON)  */}
          {/* --------------------------------------------------------------------- */}
          {activeStudioTab === 'workflow' && (
            <div className="bg-[#0b1626]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
              <div className="space-y-8">
                {/* Header & Subtitle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                      <Layers className="w-5 h-5 text-amber-400" />
                      <span>Alur Otomasi 6-Node: Dari Iklan Masuk Hingga Uang Cair ke Dompet</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Klik setiap node di bawah ini untuk melihat bagaimana data bisnis dan uang mengalir secara otonom tanpa sentuhan manual.
                    </p>
                  </div>

                  {/* Quick Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleResetWorkflow}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition flex items-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Alur</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextWorkflowNode}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md transition flex items-center space-x-1.5"
                    >
                      <span>Langkah Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 6 Node Cards Carousel */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {workflowSteps.map((node) => {
                    const isSelected = activeWorkflowNode === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkflowNode(node.id);
                          triggerSound('click');
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition relative ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-400 shadow-lg shadow-amber-950/60 scale-[1.02]'
                            : 'bg-[#030812]/70 border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 mb-1">
                          <span>Node 0{node.id}</span>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                        </div>
                        <div className="text-xs font-bold text-white leading-tight">{node.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">{node.subtitle}</div>
                      </button>
                    );
                  })}
                </div>

                {/* VISUAL INFOGRAPHIC BUSINESS CARD (Replacing raw JSON) */}
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#060e1d] via-[#09152b] to-[#040914] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  {/* Glowing aura background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header Status & Progress Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                          NODE 0{activeNodeData.id} OF 06
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                          {activeNodeData.businessData.badge}
                        </span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-black text-white mt-2">
                        {activeNodeData.title} — {activeNodeData.subtitle}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                        {activeNodeData.desc}
                      </p>
                    </div>

                    {/* Progress Badge */}
                    <div className="sm:text-right shrink-0">
                      <div className="text-[11px] font-mono text-slate-400">STATUS PROSES OTONOM</div>
                      <div className="text-sm font-bold text-emerald-400 flex items-center sm:justify-end space-x-1 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>100% REAL-TIME LIVE</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="my-6">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                      <span>Perjalanan Prospek Hingga Komisi &amp; Aktivasi Lisensi</span>
                      <span className="text-amber-400 font-bold">{Math.round((activeWorkflowNode / 6) * 100)}% Selesai</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 transition-all duration-300"
                        style={{ width: `${(activeWorkflowNode / 6) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* 6 Key Business Infographic Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 1. Nama Prospek */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Nama Prospek (Calon Mitra):</span>
                      </div>
                      <div className="text-base font-extrabold text-white mt-1">
                        {activeNodeData.businessData.prospectName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Domisili: Surabaya Gubeng</div>
                    </div>

                    {/* 2. Nomor WA */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-teal-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <Smartphone className="w-4 h-4 text-teal-400" />
                        <span>Nomor WhatsApp Aktif:</span>
                      </div>
                      <div className="text-base font-mono font-extrabold text-teal-300 mt-1">
                        {activeNodeData.businessData.phone}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Terhubung ke Multi-Session Cloud</div>
                    </div>

                    {/* 3. Sumber Iklan */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span>Sumber Akuisisi Iklan:</span>
                      </div>
                      <div className="text-base font-extrabold text-cyan-300 mt-1">
                        {activeNodeData.businessData.adSource}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Referral Code: TOPLEADER01</div>
                    </div>

                    {/* 4. Status Gateway */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Status Gateway Pembayaran:</span>
                      </div>
                      <div className="text-base font-extrabold text-amber-300 mt-1">
                        {activeNodeData.businessData.gatewayStatus}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Kanal: QRIS / Bank Transfer Interoperable</div>
                    </div>

                    {/* 5. Nilai Komisi Cair */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span>Nilai Komisi Cair ke Dompet:</span>
                      </div>
                      <div className="text-base font-mono font-black text-emerald-400 mt-1">
                        {activeNodeData.businessData.commissionValue}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Langsung Bisa Ditarik ke Rekening Bank</div>
                    </div>

                    {/* 6. Pengiriman & Aktivasi Digital */}
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-indigo-500/40 transition">
                      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                        <PackageCheck className="w-4 h-4 text-indigo-400" />
                        <span>Pengiriman &amp; Aktivasi Digital:</span>
                      </div>
                      <div className="text-base font-extrabold text-indigo-300 mt-1">
                        {activeNodeData.businessData.digitalDelivery}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">100% Digital SaaS • Nol Biaya Ongkir • Akses 24/7</div>
                    </div>
                  </div>

                  {/* Highlight Banner & Details */}
                  <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-300">
                          {activeNodeData.businessData.stepHighlight}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {activeNodeData.businessData.details}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSimulateWaPush}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Simulasi Notifikasi WA</span>
                      </button>
                    </div>
                  </div>

                  {/* Toast Alert */}
                  {simulatedWaToast && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 font-mono flex items-center space-x-2 animate-in fade-in duration-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>{simulatedWaToast}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 05: THE 8 FLAGSHIP SYSTEMS BENTO GRID (Theme: Deep Midnight Slate #0b101b via #0e1626) */}
      {/* ========================================================================= */}
      <section
        id="features"
        className="py-24 px-4 bg-gradient-to-b from-[#0b101b] via-[#0e1626] to-[#0b101b] border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>ARSITEKTUR LENGKAP PLATFORM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              8 Sistem Unggulan Tanpa Celah dalam Satu Layar
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Seluruh modul telah dibangun dan saling terhubung secara native: tidak ada plugin pihak ketiga tambal sulam yang mudah rusak.
            </p>
          </div>

          {/* 8 Bento Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Binary Tree Sub-12ms */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pohon Binary Sub-12ms</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Algoritma penempatan auto-spillover kilat dengan perhitungan flush out, matching leg, dan komisi tanpa lag database.
              </p>
            </div>

            {/* Card 2: WhatsApp Cloud Bot */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">WhatsApp Store Bot Otonom</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Robot WhatsApp multi-session otonom yang melayani prospek 24/7 dengan katalog bertombol dan QRIS instan.
              </p>
            </div>

            {/* Card 3: QRIS & Double-Entry Ledger */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-teal-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">QRIS &amp; Double-Entry Ledger</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standar akuntansi perbankan internasional: setiap rupiah pembayaran diimbangi debet-kredit otomatis tanpa selisih.
              </p>
            </div>

            {/* Card 4: CRM Pipeline & vCard Importer */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">CRM Pipeline &amp; vCard Importer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pelacakan prospek dari Cold Lead hingga Closing, lengkap dengan fitur import massal kontak CSV atau Google/Apple vCard.
              </p>
            </div>

            {/* Card 5: Webmail IMAP/SMTP */}
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
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-rose-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Cyber Threat Radar SOC DEFCON 1</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pusat komando pertahanan militer: GeoIP threat mapping, honeypot telemetri, sirene audio taktis, dan proteksi anti-DDoS.
              </p>
            </div>

            {/* Card 7: Gamifikasi Digital Staking & Reward Poin */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Gamifikasi Staking &amp; Reward Poin</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mekanisme staking nektar digital yang dapat ditukar saldo tunai e-wallet, membangkitkan downline pasif dan menekan angka churn 70%.
              </p>
            </div>

            {/* Card 8: Paket Lisensi Digital & Serial PIN Generator */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Katalog Produk &amp; Lisensi Digital</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manajemen paket produk SaaS (Silver/Gold/Platinum) dengan auto-generated Serial PIN digital terikat langsung ke sistem lisensi otonom.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06: SOC THREAT RADAR DEFCON 1 (Theme: Dark Ruby / Crimson Charcoal #120609)*/}
      {/* ========================================================================= */}
      <section
        id="security"
        className="py-24 px-4 bg-gradient-to-b from-[#120609] via-[#1c0a0f] to-[#120609] border-t border-rose-500/40 relative overflow-hidden"
      >
        {/* Ruby Ambient Lights */}
        <div className="absolute top-1/2 left-10 w-96 h-96 bg-rose-600/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-[#0d0406]/90 border border-rose-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Military Defense Explanation */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-400 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  <span>KEAMANAN FINANSIAL TINGKAT MILITER • ZERO COMPROMISE</span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Cyber Threat Radar SOC DEFCON 1: Saldo &amp; Data Anda Aman 100%
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Salah satu momok terbesar pemilik bisnis jaringan adalah saldo e-wallet dibobol peretas atau sistem down di saat closing
                  akhir bulan. SYNETIQ dilengkapi dashboard pemantauan ancaman siber real-time dengan penangkal DDoS, honeypot otomatis,
                  dan enkripsi perbankan ISO-27001 standard.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-slate-400">Status Kesiapan Siber:</div>
                    <div className="text-emerald-400 font-bold mt-1 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>DEFCON 1 (Siaga Penuh)</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-slate-400">Proteksi Transaksi Saldo:</div>
                    <div className="text-cyan-400 font-bold mt-1 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Idempotency Double-Entry</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Telemetry Terminal */}
              <div className="lg:col-span-6 bg-[#040102] border border-rose-500/30 rounded-2xl p-5 text-xs font-mono shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-rose-400" />
                    <span>TERMINAL TELEMETRI PERTAHANAN REAL-TIME</span>
                  </span>
                  <span className="text-emerald-400 font-bold">ONLINE 60 FPS</span>
                </div>

                <div className="space-y-2 mt-4 text-slate-300 text-[11px] leading-relaxed">
                  <div className="text-emerald-400">[00:14:02] GeoIP tracing Frankfurt Hub: 0 malicious anomalies detected.</div>
                  <div className="text-cyan-300">[00:14:05] Rate limiter WAF: 4,812 requests/min processed normally.</div>
                  <div className="text-amber-300">[00:14:09] Honeypot telemetry: Inbound brute-force payload auto-blacklisted.</div>
                  <div className="text-slate-200">[00:14:12] Double-entry reconciliation: Ledger debits/credits match perfectly.</div>
                  <div className="text-rose-400 font-bold">[00:14:15] Threat Mitigation: 983 attack vectors neutralized globally.</div>
                  <div className="pt-2 text-emerald-400 font-bold border-t border-white/10 flex items-center justify-between">
                    <span>[OK] Core System Status: 100% HEALTHY</span>
                    <span className="text-[10px] text-slate-500">AES-256 GCM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07: GAMIFIKASI BEE FARM (Theme: Honeycomb Amber / Golden Obsidian #140c03) */}
      {/* ========================================================================= */}
      <section
        id="beefarm"
        className="py-24 px-4 bg-gradient-to-b from-[#140c03] via-[#221605] to-[#140c03] border-t border-amber-500/30 relative overflow-hidden"
      >
        {/* Golden Ambient Lights */}
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-bold">
              <span>🍯</span>
              <span>DIGITAL STAKING &amp; GAMIFIKASI REWARD POIN</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Gamifikasi Digital Bee Farm: Staking Poin &amp; Anti-Churn Otomatis
            </h2>
            <p className="text-amber-200/80 text-sm sm:text-base leading-relaxed">
              Inovasi retensi jaringan modern: Digital Staking poin nektar dari setiap transaksi lisensi software dan repeat order yang
              menghasilkan reward cuan harian, terbukti menekan angka churn anggota hingga 70%.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Honey Staking Interactive Card */}
            <div className="lg:col-span-7 bg-[#0b0601] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg">
                    🐝
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Royal Nectar Digital Staking Engine</h4>
                    <p className="text-[11px] text-amber-300 font-mono">Tingkat Retensi Downline 98.4%</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  MULTIPLIER 2.4X
                </span>
              </div>

              {/* Honey Hive Stats Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[11px] text-amber-200/80">Stok Poin Nektar Siap Klaim:</div>
                  <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                    {beeHoneyLiters}k Poin
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    ≈ Rp {Math.round(beeHoneyLiters * 35000).toLocaleString('id-ID')} Nilai Saldo E-Wallet
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[11px] text-amber-200/80">Status Koloni Staking:</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">👑 Royal Queen Hive</div>
                  <div className="text-[10px] text-slate-400 mt-1">Level 5 (Maksimal Koloni)</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <div className="text-[11px] text-amber-200/80">Notifikasi Wake-Up Bot:</div>
                  <div className="text-base font-bold text-cyan-400 mt-1">Otomatis Aktif</div>
                  <div className="text-[10px] text-slate-400 mt-1">Ping WhatsApp Downline Inaktif</div>
                </div>
              </div>

              {/* Interactive Harvest Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-amber-500/20">
                <div className="text-xs text-amber-200/90 text-center sm:text-left">
                  {beeHarvestToast ? (
                    <span className="text-amber-400 font-bold">{beeHarvestToast}</span>
                  ) : (
                    'Klik klaim untuk mencairkan royalti reward poin nektar harian Anda langsung ke saldo kas e-wallet.'
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleHarvestBeeHoney}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950 flex items-center justify-center space-x-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>🍯 Klaim Poin Nektar Hari Ini (+2.5k Poin / +Rp 87.500)</span>
                </button>
              </div>
            </div>

            {/* Right: Bee Farm Feature List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20">
                <h5 className="text-sm font-bold text-amber-300 flex items-center space-x-2 mb-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>1. Anti-Churn Inactive Downline Radar</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Jika ada anggota tim yang tidak aktif selama 7 hari, bot WhatsApp otomatis mengirimkan notifikasi klaim reward poin nektar
                  agar mereka kembali membuka aplikasi dan login.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20">
                <h5 className="text-sm font-bold text-amber-300 flex items-center space-x-2 mb-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>2. Konversi Riil ke Kas E-Wallet</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bukan koin bodong tanpa nilai. Hasil klaim poin nektar digital dihitung dari alokasi margin riil ekosistem software
                  dan dapat ditarik tunai ke e-wallet kapan saja.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20">
                <h5 className="text-sm font-bold text-amber-300 flex items-center space-x-2 mb-1.5">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>3. Edukasi Sistem &amp; Bisnis Digital</span>
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Setiap siklus klaim poin menyajikan tips optimasi bisnis SaaS, strategi closing WhatsApp, dan tips skalabilitas jaringan secara konsisten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08: KATALOG PRODUK & PAKET LISENSI DIGITAL SYNETIQ                        */}
      {/* ========================================================================= */}
      <section
        id="digital-products"
        className="py-24 px-4 bg-gradient-to-b from-[#04140e] via-[#072418] to-[#04140e] border-t border-emerald-500/30 relative overflow-hidden"
      >
        {/* Jade Ambient Lights */}
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>100% PRODUK DIGITAL &amp; LISENSI SOFTWARE CLOUD SAAS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Katalog Produk &amp; Paket Lisensi Digital SYNETIQ
            </h2>
            <div className="inline-flex flex-wrap items-center justify-center gap-2 py-1.5 px-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shadow-md">
              <span>⚡ Aktivasi Instan Detik Ini</span>
              <span>•</span>
              <span>🌐 100% Digital Cloud</span>
              <span>•</span>
              <span>📦 Nol Biaya Ongkir</span>
              <span>•</span>
              <span>⏰ Akses 24/7</span>
            </div>
            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mt-2">
              Bisnis modern tanpa ribet packing gudang dan tanpa risiko stok basi.
              Seluruh produk SYNETIQ merupakan software berbasis cloud native berkinerja tinggi yang siap aktif seketika setelah pembayaran terverifikasi.
            </p>
          </div>

          {/* 3 Digital Product Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Paket 01: Core Binary Engine & E-Wallet Cloud */}
            <div className="bg-[#020b07] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-950/60 transition group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    PAKET 01 • CLOUD SAAS
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                    SUB-12MS ENGINE
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Core Binary Engine &amp; E-Wallet Cloud</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Akses SaaS sistem pohon biner &amp; pembayaran QRIS otomatis. Penempatan auto-spillover kilat dengan perhitungan komisi pairing, bonus sponsor, dan mutasi e-wallet berimbang 100% tanpa lag database.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-emerald-200">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akses Dashboard Cloud Instan &amp; Serial PIN</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pohon Binary Otonom &amp; Auto-Spillover</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>QRIS Dinamis &amp; Double-Entry Ledger FinTech</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400 font-bold">
                  Aktivasi Instan Detik Ini • Nol Ongkir
                </div>
              </div>
            </div>

            {/* Paket 02: WhatsApp AI Closer & Bot Multisesi */}
            <div className="bg-[#020b07] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-950/60 transition group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    PAKET 02 • WHATSAPP AI CLOSER
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                    AI CLOSING 24/7
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">WhatsApp AI Closer &amp; Bot Multisesi</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Mesin closing 24/7 otomatis tanpa admin. Robot WhatsApp AI melayani prospek otonom, menjawab keberatan konsumen, menyajikan tombol menu paket, dan menerbitkan link pembayaran otomatis.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-emerald-200">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Session WhatsApp Cloud Engine</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Smart Objection Reframe Psikologis</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Katalog Bertombol Interaktif &amp; Auto Follow-Up</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-teal-400 font-bold">
                  Mesin Closing Otonom • Konversi 68.4%
                </div>
              </div>
            </div>

            {/* Paket 03: SOC DEFCON 1 Enterprise Cyber Defense */}
            <div className="bg-[#020b07] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-950/60 transition group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    PAKET 03 • DEFCON 1
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                    MILITARY DEFENSE
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white mb-2">SOC DEFCON 1 Enterprise Cyber Defense</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Perlindungan anti-fraud, rate-limiting &amp; WAF tingkat militer. Menjaga integritas saldo e-wallet dan database jaringan dari ancaman SQL Injection, brute-force, serta serangan siber L7 DDoS.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-emerald-200">
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>GeoIP Worldwide Threat Radar Matrix</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WAF Rate-Limiter &amp; Honeypot Telemetri</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Enkripsi AES-256 GCM &amp; Idempotency Ledger</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-cyan-400 font-bold">
                  Zero Security Breaches • 99.999% SLA
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09: NEW HIGH-CONVERTING CALL TO ACTION (CTA) SECTION (Theme: Royal Violet)*/}
      {/* ========================================================================= */}
      <section
        id="cta"
        className="py-24 px-4 bg-gradient-to-b from-[#080415] via-[#0f0926] to-[#080415] border-t border-purple-500/30 relative overflow-hidden text-center"
      >
        {/* Electric Emerald Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/20 via-emerald-500/15 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-400/40 text-purple-200 text-xs font-bold shadow-lg shadow-purple-950/50">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>PENAWARAN KEMITRAAN EKSLUSIF TAHUN INI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Siap Meledakkan Omzet Bisnis Jaringan Anda Menjadi{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Mesin Penghasil Cuan Otonom 24/7?
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Tinggalkan cara manual lama yang melelahkan. Dapatkan mesin closing WhatsApp otomatis, pohon biner sub-12ms,
            gamifikasi reward poin berdaya pikat tinggi, serta 100% produk digital lisensi cloud SaaS dalam satu ekosistem lengkap.
          </p>

          {/* 4 Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-semibold text-slate-200">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Digital SaaS Ready</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>12ms Binary Engine</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <Bot className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Bot WA Closing 24/7</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>SOC DEFCON 1 Aman</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-emerald-950/80 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2.5"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Mulai Sekarang — Dapatkan Akses VIP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('brainstorming')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm hover:border-emerald-500/40 transition flex items-center justify-center space-x-2"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Hitung Potensi Cuan Pribadi</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10: LEAD REGISTRATION & VIP CONSULTATION FORM (Theme: Deep Slate #0c1424) */}
      {/* ========================================================================= */}
      <section
        id="consultation"
        className="py-24 px-4 bg-gradient-to-b from-[#0c1424] to-[#080e1a] border-t border-white/10"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0e1726]/90 border border-white/15 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                <Users className="w-3.5 h-3.5" />
                <span>FORMULIR KEMITRAAN &amp; DEMO VIP</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Jadwalkan Demo VIP &amp; Bergabung Bersama Tim SYNETIQ
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Isi data di bawah ini. Bot cerdas kami akan langsung mengirimkan undangan demo dan akses dashboard percobaan ke WhatsApp Anda.
              </p>
            </div>

            {consultSuccess ? (
              <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Terima Kasih, Permintaan Terkirim!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Pesan sambutan dan link akses demo telah dikirimkan ke nomor WhatsApp{' '}
                  <strong className="text-emerald-400 font-mono">{consultPhone}</strong>. Silakan periksa notifikasi WhatsApp Anda sekarang!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConsultSuccess(false);
                      setConsultName('');
                      setConsultPhone('');
                      setConsultEmail('');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-slate-200 font-bold transition"
                  >
                    Kirim Form Baru
                  </button>
                </div>
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
                      className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
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
                      className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition"
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
                      className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Peminatan Anda:</label>
                    <select
                      value={consultInterest}
                      onChange={(e) => setConsultInterest(e.target.value)}
                      className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      <option value="mitra-leader">Bergabung Jadi Mitra / Top Leader Jaringan</option>
                      <option value="demo-vip">Akses Demo VIP &amp; Konsultasi</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={consultSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-emerald-950 transition flex items-center justify-center space-x-2"
                  >
                    {consultSubmitting ? (
                      <span>Menghubungkan ke WhatsApp Bot...</span>
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11: FOOTER (Theme: Deep Onyx Black #020407)                              */}
      {/* ========================================================================= */}
      <footer id="footer" className="border-t border-white/10 bg-[#020407] py-12 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm">SYNETIQ</span>
            <span>— Autonomous Intelligence for Modern Networks.</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="hover:text-emerald-400 transition cursor-pointer" onClick={() => scrollToSection('digital-products')}>
              100% Digital SaaS Ready
            </span>
            <span className="hover:text-cyan-400 transition cursor-pointer" onClick={() => scrollToSection('features')}>
              Fintech-Grade Ledger
            </span>
            <span className="hover:text-rose-400 transition cursor-pointer" onClick={() => scrollToSection('security')}>
              SOC DEFCON 1 Protected
            </span>
          </div>
          <div className="text-center md:text-right">
            &copy; {new Date().getFullYear()} SYNETIQ Enterprise Ecosystem. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 12: STICKY FLOATING BOTTOM ACTION BAR                                    */}
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
              <button
                type="button"
                onClick={() => scrollToSection('brainstorming')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 focus:outline-none"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Studio</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('consultation')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-md shadow-emerald-950 transition flex items-center space-x-1.5 focus:outline-none"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Mulai Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
