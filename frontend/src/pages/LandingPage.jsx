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
  Clock,
  Menu,
} from 'lucide-react';
import api from '../services/api';
import HeroShowcaseSlideshow from '../components/HeroShowcaseSlideshow';
import AntiCrashReliabilitySection from '../components/AntiCrashReliabilitySection';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [heroMitraCount, setHeroMitraCount] = useState(1420);
  const [heroWalletBalance, setHeroWalletBalance] = useState(4850000);

  // =========================================================================
  // CROWN JEWEL: INTERACTIVE BRAINSTORMING STUDIO STATE
  // =========================================================================
  const [activeStudioTab, setActiveStudioTab] = useState('calculator'); // 'calculator' | 'ai-closing' | 'workflow'

  // Tab 1: Calculator State
  const [downlines, setDownlines] = useState(12);
  const [packageTier, setPackageTier] = useState('gold'); // 'silver' | 'gold' | 'platinum'
  const [roPerMonth, setRoPerMonth] = useState(4); // Repeat Order Paket per downline

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
    const repeatOrderBonus = downlines * roPerMonth * 35000;
    const totalCashflow = sponsorTotal + pairingBonus + repeatOrderBonus;

    return {
      sponsorTotal,
      pairs,
      pairingBonus,
      repeatOrderBonus,
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
  // 07: TRIOLLA-GRADE IMPLEMENTATION PROCESS STATE (Inspired by triolla.io)
  // =========================================================================
  const [activeProcessStep, setActiveProcessStep] = useState(1);
  const processSteps = [
    {
      id: 1,
      badge: 'LANGKAH 01',
      title: 'Kickoff Meeting',
      subtitle: 'Diskusi Visi & Skema Bisnis',
      desc: 'Pertemuan langsung (online/offline) untuk memetakan model bisnis MLM Anda, skema reward, profil target member, dan proyeksi omset.',
      deliverables: ['Dokumen Notulensi Visi Bisnis', 'Matriks Kebutuhan Sistem & Modul', 'Timeline Pengerjaan 15-30 Hari Transparan'],
      duration: 'Hari ke-1 s/d 2',
    },
    {
      id: 2,
      badge: 'LANGKAH 02',
      title: 'Audit Marketing Plan',
      subtitle: 'Bedah Logika Komisi Anti-Jebol',
      desc: 'Simulasi mendalam atas rumus bonus sponsor, pairing binary, reward omset, dan batas payout maksimal agar sistem bisnis Anda aman jangka panjang.',
      deliverables: ['Simulasi Stres Keuangan Sistem', 'Rumus Binary & Pairing Terverifikasi', 'Aturan Flush Out & Safety Net'],
      duration: 'Hari ke-3 s/d 5',
    },
    {
      id: 3,
      badge: 'LANGKAH 03',
      title: 'User Experience & Flow',
      subtitle: 'Kemudahan Pengalaman Member',
      desc: 'Merancang perjalanan calon mitra: dari klik link iklan atau website replika, registrasi otomatis, pilih paket produk digital, hingga terima akses login.',
      deliverables: ['Wireframe Alur Prospek ke Mitra', 'Skema Auto-Spillover Binary', 'Desain Formulir Pendaftaran Singkat'],
      duration: 'Hari ke-6 s/d 8',
    },
    {
      id: 4,
      badge: 'LANGKAH 04',
      title: 'Arsitektur Sistem & Database',
      subtitle: 'Mesin Hitung Kilat (Sub-12ms)',
      desc: 'Setup infrastruktur cloud berkecepatan tinggi dengan database anti-lag, menjamin perhitungan bonus ribuan member selesai dalam 1 detik tanpa antre.',
      deliverables: ['High-Performance Go Engine', 'Double-Entry FinTech Ledger', 'Auto-Backup Database Harian'],
      duration: 'Hari ke-9 s/d 14',
    },
    {
      id: 5,
      badge: 'LANGKAH 05',
      title: 'Kustomisasi Brand & UI',
      subtitle: 'Logo & Desain Web Replika',
      desc: 'Penerapan identitas merek Anda: nama aplikasi, logo, palet warna elegan, dan website replika otomatis untuk setiap member yang bergabung.',
      deliverables: ['Domain Kustom (app.brandanda.com)', 'Template Web Replika Member Ber-nama', 'Dashboard Admin & Member Eksklusif'],
      duration: 'Hari ke-15 s/d 19',
    },
    {
      id: 6,
      badge: 'LANGKAH 06',
      title: 'Integrasi QRIS & Robot WA',
      subtitle: 'Otomasi Terima Uang & Closing 24/7',
      desc: 'Menghubungkan gerbang pembayaran QRIS dinamis seluruh bank dan dompet digital, plus robot WhatsApp AI yang melayani tanya-jawab konsumen tanpa admin.',
      deliverables: ['QRIS Standar Nasional Otomatis Masuk Kas', 'Robot WhatsApp AI Objection Handler', 'Notifikasi SMS / WA Real-Time'],
      duration: 'Hari ke-20 s/d 24',
    },
    {
      id: 7,
      badge: 'LANGKAH 07',
      title: 'Simulasi Transaksi & Uji Beban',
      subtitle: 'Pengujian Menyeluruh (Anti-Fraud)',
      desc: 'Uji coba beban sistem hingga puluhan ribu transaksi serentak, simulasi penarikan komisi e-wallet, dan verifikasi proteksi keamanan siber SOC DEFCON 1.',
      deliverables: ['Laporan Uji Beban 10.000 Transaksi', 'Audit Keamanan Data & Anti-Manipulasi', 'Verifikasi Rekonsiliasi Kas 100%'],
      duration: 'Hari ke-25 s/d 28',
    },
    {
      id: 8,
      badge: 'LANGKAH 08',
      title: 'Peluncuran Resmi & Support 24/7',
      subtitle: 'Go-Live & Pendampingan Nonstop',
      desc: 'Sistem siap diluncurkan secara resmi dalam rentang 15 hingga 30 hari kerja. Kami memberikan pelatihan lengkap kepada manajemen admin dan pendampingan teknis prioritas 24 jam setiap hari.',
      deliverables: ['Peluncuran Sistem Siap Pakai (15 - 30 Hari Kerja)', 'Video Panduan & SOP Operasional Admin', 'Garansi & Support Teknis Siaga 24/7'],
      duration: 'Hari ke-15 s/d 30 (Go-Live)',
    },
  ];

  // =========================================================================
  // LEAD REGISTRATION & CONSULTATION FORM STATE (Human-Friendly Consultation)
  // =========================================================================
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultInterest, setConsultInterest] = useState('aplikasi-baru');
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

    const interestLabels = {
      'aplikasi-baru': 'Pembuatan Aplikasi Bisnis Jaringan Baru (Brand & Logo Sendiri)',
      'upgrade-sistem': 'Migrasi dari Software Lama / Sistem Kompetitor Lambat Jadi Otomatis',
      'demo-vip': 'Akses Demo Lengkap & Coba Fitur Aplikasi',
      'konsultasi-komisi': 'Tanya Jawab Alur Bisnis & Konsultasi Sistem Komisi',
    };
    const interestLabel = interestLabels[consultInterest] || consultInterest;

    try {
      await api.post('/crm/leads', {
        name: consultName,
        phone: consultPhone,
        email: consultEmail || `${consultPhone.replace(/\D/g, '')}@lead.synetiq.ai`,
        category: interestLabel,
        city: 'Online Registration',
        notes: `Mendaftar dari Landing Page SYNETIQ. Peminatan: ${interestLabel}.`,
      });
    } catch (err) {
      console.warn('Fallback lead recording:', err);
    } finally {
      setConsultSubmitting(false);
      setConsultSuccess(true);
      triggerSound('success');

      // Auto-dispatch formatted WhatsApp chat link
      const text = `Halo Admin SYNETIQ, saya ${consultName} (${consultPhone}).\n\nSaya tertarik untuk: ${interestLabel}.\nMohon informasi lengkap dan akses demonya. Terima kasih!`;
      const waUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    }
  };

  const activeNodeData = workflowSteps[activeWorkflowNode - 1];

  // Top Floating & Mobile Drawer Navigation items (All 7 required sections)
  const navItems = useMemo(
    () => [
      {
        id: 'features',
        label: 'Fitur Unggulan',
        desc: '8 modul otomasi bisnis jaringan tanpa celah',
        icon: <Layers className="w-4 h-4" />,
        action: () => scrollToSection('features'),
      },
      {
        id: 'tablet-showcase',
        label: 'Demo di Tablet',
        desc: 'Simulasi interaktif iPad OS & antarmuka aplikasi',
        icon: <Smartphone className="w-4 h-4" />,
        action: () => scrollToSection('tablet-showcase'),
      },
      {
        id: 'mesin-hitung-komisi',
        label: 'Anti-Crash & Komisi',
        desc: 'Sub-12ms Go Engine, 25k TPS cluster, & kalkulasi bonus anti-jebol',
        icon: <Sliders className="w-4 h-4" />,
        action: () => scrollToSection('anti-crash-engine'),
      },
      {
        id: 'problem-solution',
        label: 'Solusi Masalah',
        desc: 'Tinggalkan sistem kompetitor lambat menuju sistem otonom real-time',
        icon: <Zap className="w-4 h-4" />,
        action: () => scrollToSection('problem-solution'),
      },
      {
        id: 'hitung-potensi-cuan',
        label: 'Hitung Potensi Cuan',
        desc: 'Simulasi cashflow profit & omset jaringan Anda',
        icon: <TrendingUp className="w-4 h-4" />,
        action: () => {
          setActiveStudioTab('calculator');
          scrollToSection('brainstorming');
        },
      },
      {
        id: 'process',
        label: 'Alur Kerja (15-30 Hari)',
        desc: '8 tahap implementasi kickoff hingga go-live dalam 15-30 hari kerja',
        icon: <Sparkles className="w-4 h-4" />,
        action: () => scrollToSection('process'),
      },
      {
        id: 'consultation',
        label: 'Konsultasi & Kontak',
        desc: 'Jadwalkan demo VIP & konsultasi gratis tim ahli',
        icon: <PhoneCall className="w-4 h-4" />,
        action: () => scrollToSection('consultation'),
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#03060a] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black overflow-x-hidden w-full max-w-full">
      {/* ========================================================================= */}
      {/* 01: DYNAMIC ISLAND FLOATING NAVBAR (Zero Scrollbar • Zero Overlap Layout) */}
      {/* ========================================================================= */}
      <nav className="fixed top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[98%] max-w-[1400px]">
        <div className="bg-[#0e1726]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-3 sm:px-4 lg:px-5 py-2 shadow-2xl shadow-emerald-950/40 flex items-center justify-between gap-1.5 sm:gap-2 lg:gap-3">
          {/* Brand Logo - Compact & Pristine */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                scrollToSection('hero');
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-2 group text-left focus:outline-none"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition shrink-0">
                <div className="w-full h-full bg-[#03060a] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white group-hover:text-emerald-400 transition">
                  SYNETIQ
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  AI
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Links - Smooth, No Wrapping, Zero Scrollbar, Zero Overlap */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 2xl:space-x-4 text-[11px] xl:text-xs 2xl:text-[13px] font-medium text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="px-2 py-1 rounded-lg hover:text-white hover:bg-white/5 whitespace-nowrap transition focus:outline-none shrink-0"
            >
              Fitur
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('tablet-showcase')}
              className="px-2 py-1 rounded-lg hover:text-cyan-400 hover:bg-white/5 whitespace-nowrap transition focus:outline-none flex items-center space-x-1 shrink-0"
            >
              <span>📱</span>
              <span>Demo Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('anti-crash-engine')}
              className="px-2 py-1 rounded-lg hover:text-cyan-300 hover:bg-white/5 whitespace-nowrap transition focus:outline-none shrink-0"
            >
              Anti-Crash
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('problem-solution')}
              className="hidden xl:inline-block px-2 py-1 rounded-lg hover:text-amber-400 hover:bg-white/5 whitespace-nowrap transition focus:outline-none shrink-0"
            >
              Solusi
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveStudioTab('calculator');
                scrollToSection('brainstorming');
              }}
              className="hidden 2xl:inline-block px-2 py-1 rounded-lg hover:text-teal-400 hover:bg-white/5 whitespace-nowrap transition focus:outline-none shrink-0"
            >
              Simulasi Cuan
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('process')}
              className="px-2 py-1 rounded-lg hover:text-pink-400 hover:bg-white/5 whitespace-nowrap transition focus:outline-none flex items-center space-x-1 shrink-0"
            >
              <span>⚡</span>
              <span>Alur Kerja</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="px-2 py-1 rounded-lg hover:text-emerald-400 hover:bg-white/5 whitespace-nowrap transition focus:outline-none shrink-0"
            >
              Kontak
            </button>
          </div>

          {/* Right Action Controls: Optimized for Mobile, Tablet, Laptop, and Desktop */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 xl:space-x-2 shrink-0">
            {/* Audio Toggle: Mini-icon, hidden on mobile <sm (accessible inside drawer) */}
            <button
              type="button"
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                triggerSound('click');
              }}
              title={audioEnabled ? 'Matikan Suara Haptic' : 'Nyalakan Suara Haptic'}
              className="hidden sm:flex p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition focus:outline-none shrink-0 border border-white/5"
            >
              {audioEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {/* Direct WhatsApp Action Button */}
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20tertarik%20dengan%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20konsultasi%20langsung"
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerSound('success')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs flex items-center space-x-1 sm:space-x-1.5 shadow-lg shadow-emerald-950/60 transition active:scale-95 shrink-0"
              title="Chat Langsung via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
              <span className="hidden xl:inline">WhatsApp</span>
              <span className="xl:hidden text-[11px] font-extrabold">WA</span>
            </a>

            {/* VIP Demo & Call Booking Button */}
            <button
              type="button"
              onClick={() => {
                scrollToSection('consultation');
                setMobileMenuOpen(false);
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-900/50 hover:shadow-emerald-700/60 transition flex items-center space-x-1 sm:space-x-1.5 focus:outline-none active:scale-95 shrink-0"
              title="Coba Demo VIP"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current shrink-0" />
              <span className="hidden xl:inline">Coba Demo VIP</span>
              <span className="hidden sm:inline xl:hidden">Demo VIP</span>
              <span className="sm:hidden text-[11px]">Demo</span>
            </button>

            {/* Login Link: Shown on desktop */}
            <button
              type="button"
              onClick={() => {
                triggerSound('click');
                if (onGoToLogin) onGoToLogin();
                else window.location.hash = '#/overview';
              }}
              className="hidden lg:inline-flex px-2 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 transition whitespace-nowrap focus:outline-none shrink-0"
            >
              Masuk
            </button>

            {/* Sleek Mobile Hamburger Menu Toggle (<lg: Mobile and Tablet) */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                triggerSound('click');
              }}
              aria-label={mobileMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition focus:outline-none shrink-0 border border-white/10 active:scale-95"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Drawer Sheet: Opens smoothly with all 7 items */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 rounded-2xl bg-[#0a1120]/95 backdrop-blur-2xl border border-emerald-500/30 p-3 sm:p-4 shadow-2xl shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* List of All 7 Nav Items */}
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 sm:py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition flex items-center justify-between group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3">
                    <span className="p-1.5 rounded-lg bg-white/5 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition">
                        {item.label}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>

            {/* Mobile Drawer Utilities: Audio Toggle & Quick Links */}
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              {/* Audio Toggle in Drawer */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5">
                <div className="flex items-center space-x-2 text-xs text-slate-300 font-medium">
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Efek Suara Haptic</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAudioEnabled(!audioEnabled);
                    triggerSound('click');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                    audioEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-slate-400 border border-white/10'
                  }`}
                >
                  {audioEnabled ? 'AKTIF' : 'SENYAP'}
                </button>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20tertarik%20dengan%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20konsultasi%20langsung"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    triggerSound('success');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    triggerSound('click');
                    setMobileMenuOpen(false);
                    if (onGoToLogin) onGoToLogin();
                    else window.location.hash = '#/overview';
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition active:scale-95"
                >
                  <span>Masuk Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 02: HERO SECTION - HUMAN-FRIENDLY COPYWRITING & FULL MACBOOK SHOWCASE     */}
      {/* ========================================================================= */}
      <section
        id="hero"
        className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 overflow-hidden bg-[#03060a]"
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

          {/* Centered Headline (Bahasa Manusia yang Mudah Dipahami) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl mx-auto mb-6">
            Aplikasi Bisnis Jaringan Otomatis:{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Kerja Lebih Ringan, Member Senang,
            </span>{' '}
            Cuan Mengalir 24 Jam.
          </h1>

          {/* Centered Subheadline (Menjawab Kebutuhan Pemilik Bisnis) */}
          <p className="text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 font-normal">
            Gak perlu lagi tunggu cut-off 24 jam seperti sistem kompetitor atau pusing rekap manual larut malam.
            Dari pendaftaran member baru, perhitungan bonus instan dalam hitungan detik, hingga robot WhatsApp yang
            melayani calon pembeli nonstop—semua sudah siap pakai untuk brand Anda.
          </p>

          {/* Centered Direct CTA Buttons (Triolla Style) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 w-full sm:w-auto">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20tertarik%20dengan%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20konsultasi%20langsung"
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerSound('success')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-sm md:text-base shadow-xl shadow-emerald-950/80 hover:shadow-emerald-700/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2.5 group"
            >
              <MessageSquare className="w-5 h-5 text-slate-950 fill-current group-hover:scale-110 transition-transform" />
              <span>💬 Chat WhatsApp Sekarang (Fast Response)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-bold text-sm md:text-base hover:text-white hover:border-emerald-500/40 transition-all duration-200 flex items-center justify-center space-x-2.5 group"
            >
              <Zap className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>⚡ Minta Akses Demo Langsung</span>
            </button>
          </div>

          {/* Centered Proof Metrics (3-column Benefit) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-10 py-4 sm:py-5 px-4 sm:px-10 rounded-2xl bg-white/[0.03] border border-white/10 max-w-2xl mx-auto shadow-inner">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">1 Detik</div>
              <div className="text-xs text-slate-200 font-bold mt-0.5">Hitung Bonus Instan</div>
              <div className="text-[10px] text-slate-400">Kompetitor Butuh 24 Jam+</div>
            </div>
            <div className="text-center border-x border-white/10 px-2 sm:px-6">
              <div className="text-xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight">24 Jam</div>
              <div className="text-xs text-slate-200 font-bold mt-0.5">Robot WhatsApp Aktif</div>
              <div className="text-[10px] text-slate-400">Balas Prospek &amp; Closing</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">100%</div>
              <div className="text-xs text-slate-200 font-bold mt-0.5">Otomatis Kas Masuk</div>
              <div className="text-[10px] text-slate-400">QRIS Semua Bank &amp; E-Wallet</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02: TABLET SHOWCASE SECTION (Apple iPad Pro on Vibrant Golden Yellow #fed324) */}
      {/* ========================================================================= */}
      <section
        id="tablet-showcase"
        className="relative py-16 sm:py-24 px-4 bg-[#fed324] text-slate-950 overflow-hidden border-y-4 border-[#ecd02b] shadow-2xl"
      >
        {/* Subtle geometric dot pattern for depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header with Semantic H2 for 100% SEO */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-950 text-[#fed324] text-xs sm:text-sm font-mono font-bold tracking-wide shadow-lg mb-4">
              <span className="w-2 h-2 rounded-full bg-[#fed324] animate-ping" />
              <span>DEMO INTERAKTIF TABLET IPAD PRO • LIVE EXPERIENCE</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Eksplorasi Antarmuka Aplikasi di Tablet iPad Pro
            </h2>
            
            <p className="mt-3.5 text-base sm:text-lg text-slate-900 font-semibold max-w-2xl mx-auto">
              Coba langsung fitur SYNETIQ di layar tablet: pantau pertumbuhan jaringan, hitung komisi otomatis, hingga keamanan saldo kas secara real-time.
            </p>
          </div>

          {/* FULL-WIDTH SHOWCASE SLIDESHOW (Apple iPad Pro Tablet Frame) */}
          <div className="w-full max-w-[96vw] xl:max-w-[1200px] 2xl:max-w-[1320px] mx-auto px-2 sm:px-4">
            <HeroShowcaseSlideshow
              audioEnabled={audioEnabled}
              triggerSound={triggerSound}
              heroMitraCount={heroMitraCount}
              setHeroMitraCount={setHeroMitraCount}
              heroWalletBalance={heroWalletBalance}
              setHeroWalletBalance={setHeroWalletBalance}
            />
          </div>

          {/* Direct CTA Consultation on Yellow Canvas */}
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ,%20saya%20tertarik%20dengan%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20konsultasi%20demo%20tablet"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-sm sm:text-base transition-all duration-200 shadow-2xl flex items-center justify-center space-x-2.5 active:scale-95 group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#fed324] group-hover:scale-110 transition-transform" />
              <span>Konsultasi Demo via WhatsApp</span>
            </a>
            
            <button
              type="button"
              onClick={() => {
                triggerSound('transition');
                setShowDemoModal(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/95 hover:bg-white text-slate-950 font-extrabold text-sm sm:text-base transition-all duration-200 border-2 border-black/15 shadow-lg flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Buka Demo Interaktif Penuh</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03: LIVE ARCHITECTURE TELEMETRY BAR (Theme: Cyber Carbon #080d16)        */}
      {/* ========================================================================= */}
      <section className="border-y border-white/10 bg-[#080d16] py-3.5 px-4 overflow-x-auto w-full max-w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[760px] text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-emerald-400">SISTEM AKTIF 24/7</span>
            <span className="text-slate-600">|</span>
            <span>Zero Error Komisi</span>
          </div>
          <div className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>PEMBAYARAN OTOMATIS: QRIS • BCA • MANDIRI • BRI • BNI • GOPAY</span>
          </div>
          <div className="flex items-center space-x-2">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>ROBOT WHATSAPP: 24/7 BALAS PROSPEK NONSTOP</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KEAMANAN SALDO KAS TERJAMIN 100%</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03.5: PROBLEM VS SOLUTION (Mengapa Bisnis Jaringan Butuh SYNETIQ)        */}
      {/* ========================================================================= */}
      <section
        id="problem-solution"
        className="py-20 px-4 bg-[#050b14] border-b border-white/10 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <span>⚠️</span>
              <span>KENDALA NYATA BISNIS JARINGAN MANUAL</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Apakah Bisnis Jaringan Anda Sering Mengalami Hal Ini?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Banyak pemilik bisnis jaringan kehabisan waktu dan energi bukan karena jualan, tapi karena ribet mengurus
              administrasi dan komplain member. Lihat bagaimana SYNETIQ mengatasinya secara otomatis:
            </p>
          </div>

          {/* 3 Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Rekap Bonus Manual */}
            <div className="p-6 rounded-3xl bg-[#091120] border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <div className="font-extrabold text-red-400 flex items-center space-x-1.5 mb-1">
                    <span>❌</span>
                    <span>SISTEM KOMPETITOR (TUNDA 24 JAM)</span>
                  </div>
                  <p className="leading-relaxed">
                    Sistem kompetitor butuh cut-off 24-48 jam. Rawan server crash saat traffic puncak akhir bulan, komisi lambat masuk dompet, dan member sering komplain.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs">
                  <div className="font-extrabold text-emerald-400 flex items-center space-x-1.5 mb-1">
                    <span>✅</span>
                    <span>DENGAN SYNETIQ (INSTAN &lt;12MS)</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Komisi sponsor dan pairing dihitung otomatis dalam 1 detik. Saldo dompet member langsung bertambah real-time tanpa tunda cut-off.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span>Penghematan Waktu:</span>
                <span className="font-bold">120+ Jam / Bulan</span>
              </div>
            </div>

            {/* Card 2: Chat Prospek Malam Hari */}
            <div className="p-6 rounded-3xl bg-[#091120] border border-white/10 hover:border-teal-500/40 transition-all flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <div className="font-extrabold text-red-400 flex items-center space-x-1.5 mb-1">
                    <span>❌</span>
                    <span>CARA LAMA (MANUAL)</span>
                  </div>
                  <p className="leading-relaxed">
                    Calon pembeli yang chat malam hari tidak terlayani karena admin sudah tidur. Pagi hari prospek sudah
                    dingin atau beli ke kompetitor lain.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-200 text-xs">
                  <div className="font-extrabold text-teal-400 flex items-center space-x-1.5 mb-1">
                    <span>✅</span>
                    <span>DENGAN SYNETIQ (OTOMATIS)</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Robot WhatsApp AI aktif 24 jam nonstop menjawab ramah, mengirimkan brosur produk, video presentasi,
                    hingga menerbitkan kode bayar QRIS otomatis.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-teal-400">
                <span>Konversi Closing:</span>
                <span className="font-bold">Meningkat +68.4%</span>
              </div>
            </div>

            {/* Card 3: Member Bingung Promosi */}
            <div className="p-6 rounded-3xl bg-[#091120] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-xl">
              <div className="space-y-4">
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <div className="font-extrabold text-red-400 flex items-center space-x-1.5 mb-1">
                    <span>❌</span>
                    <span>CARA LAMA (MANUAL)</span>
                  </div>
                  <p className="leading-relaxed">
                    Member baru sering bingung cara jualan, tidak punya website sendiri, dan kesulitan menjelaskan sistem
                    bisnis ke calon pembeli baru.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs">
                  <div className="font-extrabold text-cyan-400 flex items-center space-x-1.5 mb-1">
                    <span>✅</span>
                    <span>DENGAN SYNETIQ (OTOMATIS)</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Begitu mendaftar, setiap member langsung punya Website Toko Replika pribadi dengan nama mereka. Siap
                    disebar ke status WhatsApp dan TikTok 1 klik.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>Retensi Tim Mitra:</span>
                <span className="font-bold">98.4% Lebih Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03.6: CORE ENGINE & ANTI-CRASH ARCHITECTURE (Tiga Solusi Kritis Bisnis)   */}
      {/* ========================================================================= */}
      <AntiCrashReliabilitySection
        triggerSound={triggerSound}
        scrollToSection={scrollToSection}
      />

      {/* ========================================================================= */}
      {/* 04: STUDIO BRAINSTORMING (Theme: Deep Tech Navy / Sapphire #06111f via #091b33) */}
      {/* ========================================================================= */}
      <section
        id="brainstorming"
        className="py-24 px-4 bg-gradient-to-b from-[#06111f] via-[#091b33] to-[#06111f] border-t border-cyan-500/20 overflow-hidden"
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

            {/* Studio Navigation Tabs - Fully Responsive Wrapping / Pill Bar */}
            <div className="flex flex-wrap sm:inline-flex items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-[#030812]/80 border border-white/10 backdrop-blur-md shadow-xl mt-4 max-w-full gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveStudioTab('calculator');
                  triggerSound('click');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 sm:space-x-2 ${
                  activeStudioTab === 'calculator'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>1. Kalkulator Bonus <span className="hidden sm:inline">&amp; Cashflow</span></span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStudioTab('ai-closing');
                  triggerSound('click');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 sm:space-x-2 ${
                  activeStudioTab === 'ai-closing'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>2. AI Closing <span className="hidden sm:inline">Simulator</span></span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveStudioTab('workflow');
                  triggerSound('click');
                }}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 sm:space-x-2 ${
                  activeStudioTab === 'workflow'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-300 shrink-0" />
                <span>3. Alur 6-Node <span className="hidden sm:inline">Simulator</span></span>
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
                      Geser parameter di bawah untuk melihat proyeksi bonus sponsor, pasangan binary kilat, dan bonus repeat order produk digital Anda.
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
                              Rp {(((pkg?.price || 0) / 1000) || 0).toLocaleString('id-ID')}k
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">Bonus: Rp {(((pkg?.sponsorBonus || 0) / 1000) || 0)}k</div>
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
                        Rp {(calculatedFinances?.totalCashflow || 0).toLocaleString('id-ID')}
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
                          Rp {(calculatedFinances?.sponsorTotal || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">
                          2. Bonus Pasangan Binary ({calculatedFinances?.pairs || 0} Pasang):
                        </span>
                        <span className="font-mono font-bold text-cyan-400">
                          Rp {(calculatedFinances?.pairingBonus || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">3. Bonus Repeat Order &amp; Lisensi Cloud:</span>
                        <span className="font-mono font-bold text-amber-300">
                          Rp {(calculatedFinances?.repeatOrderBonus || 0).toLocaleString('id-ID')}
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
        className="py-24 px-4 bg-gradient-to-b from-[#0b101b] via-[#0e1626] to-[#0b101b] border-t border-white/10 overflow-hidden"
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

          {/* 8 Bento Grid Cards (Human-Friendly Business Benefits) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Binary Tree Sub-12ms */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-cyan-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pohon Jaringan &amp; Bonus Otomatis</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hitung bonus sponsor, komisi pasangan (pairing), dan auto-spillover dalam 1 detik. Saldo dompet member langsung bertambah tanpa tunda 24 jam seperti sistem kompetitor.
              </p>
            </div>

            {/* Card 2: WhatsApp Cloud Bot */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Robot WhatsApp 24 Jam Nonstop</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Robot WhatsApp pintar yang membalas chat prospek, kirim katalog bertombol, video penjelasan, dan follow-up calon pembeli saat Anda tidur.
              </p>
            </div>

            {/* Card 3: QRIS & Double-Entry Ledger */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-teal-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Kas &amp; Pembayaran QRIS Otomatis</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Terima pembayaran dari semua bank dan e-wallet (BCA, Mandiri, BRI, GoPay, OVO). Uang langsung masuk kas tanpa upload bukti transfer manual.
              </p>
            </div>

            {/* Card 4: Storefront Replika */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Website Toko Replika Member</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Setiap member otomatis memiliki link website toko online pribadi dengan nama mereka sendiri untuk disebar ke WhatsApp dan TikTok.
              </p>
            </div>

            {/* Card 5: Penarikan Saldo 1-Klik */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-teal-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition">
                <Wallet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Penarikan Komisi 1-Klik ke Bank</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Member bisa mencairkan bonus kapan saja langsung ke rekening bank mereka secara transparan, cepat, dan bebas drama komplain.
              </p>
            </div>

            {/* Card 6: Cyber Threat Radar SOC DEFCON 1 */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-rose-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 group-hover:scale-110 transition">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Keamanan &amp; Anti-Kecurangan Saldo</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Proteksi berlapis mencegah manipulasi bonus, akun ganda ilegal, dan serangan siber. Saldo kas dan data member terlindungi 100% aman.
              </p>
            </div>

            {/* Card 7: Gamifikasi Digital Staking & Reward Poin */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-amber-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Gamifikasi Poin &amp; Retensi Downline</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem reward poin harian dari transaksi yang memotivasi downline pasif agar kembali aktif membuka aplikasi dan mengulang order.
              </p>
            </div>

            {/* Card 8: Laporan Omset & Grafik Penjualan */}
            <div className="bg-[#0e1726]/80 border border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 hover:shadow-xl transition group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Laporan Omset &amp; Grafik Penjualan</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pantau perkembangan bisnis, omset harian, dan keaktifan tim dari satu dashboard rapi yang bisa diakses dari HP, tablet, atau komputer Anda.
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
                  akhir bulan. SYNETIQ dilengkapi dashboard pemantauan ancaman siber real-time dengan penangkal DDoS, proteksi anti-fraud otomatis,
                  dan enkripsi perbankan ISO-27001 standard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
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
                  <div className="text-amber-300">[00:14:09] Anti-BruteForce telemetry: Inbound unauthorized attempt auto-blacklisted.</div>
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
      {/* 07: OUR UNIQUE IMPLEMENTATION PROCESS (Triolla-Style High-Contrast White) */}
      {/* ========================================================================= */}
      <section
        id="process"
        className="py-24 px-4 bg-gradient-to-b from-white via-slate-50 to-white text-slate-900 border-t border-slate-200 relative overflow-hidden"
      >
        {/* Subtle decorative ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
          <div className="absolute top-12 left-10 w-96 h-96 bg-pink-100 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-100 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header (Triolla Aesthetic with Vibrant Gradient Text) */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300/80 text-slate-700 text-xs font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>TIMELINE ESTIMASI: 15 - 30 HARI KERJA HINGGA GO-LIVE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
              Alur Kerja &amp;{' '}
              <span className="bg-gradient-to-r from-[#d946ef] via-[#f97316] to-[#f59e0b] bg-clip-text text-transparent">
                Desain
              </span>{' '}
              Proses (15 - 30 Hari)
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Proses teruji kami memastikan sistem MLM Anda siap beroperasi resmi dalam rentang <strong>15 hingga 30 hari kerja</strong>. Mulai dari kickoff meeting, audit skema komisi anti-jebol, hingga peluncuran live 24/7.
            </p>
          </div>

          {/* TRIOLLA-STYLE HORIZONTAL 8-MILESTONE TIMELINE (Directly from media_1793648922672_0da6ef55.png) */}
          <div className="mb-14 relative">
            {/* Desktop Horizontal Milestone Line */}
            <div className="hidden lg:block relative py-6">
              {/* Connecting Horizontal Line */}
              <div className="absolute top-[42px] left-[5%] right-[5%] h-0.5 bg-slate-200 z-0" />
              
              <div className="grid grid-cols-8 gap-2 relative z-10">
                {processSteps.map((step) => {
                  const isCurrent = activeProcessStep === step.id;
                  const isPast = activeProcessStep > step.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => {
                        setActiveProcessStep(step.id);
                        triggerSound('click');
                      }}
                      className="group flex flex-col items-center text-center focus:outline-none transition"
                    >
                      {/* Minimalist Solid Black Milestone Dot (Exact Triolla style in media_1793648922672_0da6ef55.png) */}
                      <div className="h-9 flex items-center justify-center">
                        <div
                          className={`rounded-full transition-all duration-300 shadow-sm ${
                            isCurrent
                              ? 'w-5 h-5 bg-black ring-4 ring-pink-500/25 scale-125'
                              : 'w-3.5 h-3.5 bg-black group-hover:scale-125 group-hover:bg-slate-800'
                          }`}
                        />
                      </div>

                      {/* Step Label below dot (Triolla style) */}
                      <div className="mt-2.5 space-y-0.5">
                        <div
                          className={`text-xs font-black leading-tight transition ${
                            isCurrent
                              ? 'text-black'
                              : 'text-slate-800 group-hover:text-black'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium line-clamp-2">
                          {step.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile / Tablet Horizontal Scroll Pills */}
            <div className="lg:hidden flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
              {processSteps.map((step) => {
                const isCurrent = activeProcessStep === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setActiveProcessStep(step.id);
                      triggerSound('click');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-600 text-[10px] font-mono flex items-center justify-center font-bold">
                      {step.id}
                    </span>
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE MILESTONE DETAIL INSPECTION CARD */}
          {(() => {
            const currentStepData = processSteps.find((s) => s.id === activeProcessStep) || processSteps[0];
            return (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Detailed Step Explanation */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center space-x-2.5">
                      <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 font-mono text-xs font-bold border border-pink-500/20">
                        {currentStepData.badge}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-xs font-semibold">
                        {currentStepData.duration}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                        {currentStepData.title}
                      </h3>
                      <p className="text-sm sm:text-base font-bold text-pink-600 mt-1">
                        {currentStepData.subtitle}
                      </p>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                        {currentStepData.desc}
                      </p>
                    </div>

                    {/* Deliverables Checklist */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                        Yang Anda Terima di Tahap Ini:
                      </div>
                      <div className="space-y-2">
                        {currentStepData.deliverables.map((item, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action & Consultation Card */}
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 font-bold">
                          GARANSI KEPUASAN &amp; KELANCARAN
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Tahap {activeProcessStep} dari 8</span>
                      </div>
                      <h4 className="text-lg font-bold text-white leading-snug">
                        Ingin Memulai {currentStepData.title}?
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Tim teknis dan konsultan bisnis kami siap mendampingi Anda langsung via WhatsApp untuk diskusi tahap ini tanpa dipungut biaya.
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo Admin SYNETIQ, saya tertarik dengan alur kerja "${currentStepData.title}" (${currentStepData.subtitle}) untuk pembuatan aplikasi bisnis jaringan saya. Mohon informasi dan konsultasinya.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => triggerSound('success')}
                        className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/40 transition active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-950 fill-current" />
                        <span>Konsultasikan via WhatsApp</span>
                      </a>

                      {activeProcessStep < 8 && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveProcessStep((prev) => Math.min(8, prev + 1));
                            triggerSound('click');
                          }}
                          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
                        >
                          <span>Lihat Langkah Berikutnya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Bottom Conversion Banner Inside Process Section */}
          <div className="mt-12 rounded-3xl bg-slate-900 p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KONSULTASI GRATIS &amp; DEMO SISTEM LANGSUNG</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Siap Mengotomatiskan Bisnis Jaringan Anda Sekarang?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Ceritakan rencana bisnis dan skema reward komisi Anda. Kami bantu buatkan estimasi arsitektur dan jadwalkan sesi demo interaktif.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20ingin%20jadwalkan%20Kickoff%20Meeting%20dan%20konsultasi%20pembuatan%20aplikasi%20bisnis%20jaringan"
                target="_blank"
                rel="noreferrer"
                onClick={() => triggerSound('success')}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4 text-slate-950 fill-current" />
                <span>Jadwalkan Kickoff via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => scrollToSection('consultation')}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Coba Demo Sistem</span>
              </button>
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
                  <span>Proteksi Keamanan Siber &amp; Pemantauan Server 24/7</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sistem Anti-Hacker &amp; Blokir Serangan Jahat Otomatis</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pencatatan Keuangan Ganda &amp; Nol Selisih Saldo Kas</span>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-cyan-400 font-bold">
                  Zero Security Breaches • Garansi Server Stabil
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 09: HIGH-CONVERTING CALL TO ACTION (CTA) SECTION                          */}
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
            <span>SOLUSI BISNIS JARINGAN MODERN</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Siap Mengotomasi &amp; Melipatgandakan{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Bisnis Jaringan Anda?
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Tinggalkan cara manual lama yang melelahkan. Dapatkan aplikasi bisnis siap pakai lengkap dengan nama brand,
            logo, domain, dan aturan sistem komisi Anda sendiri.
          </p>

          {/* 4 Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-xs font-semibold text-slate-200">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Brand &amp; Logo Sendiri</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Hitung Bonus 1 Detik</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <Bot className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Robot WhatsApp 24 Jam</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Garansi Server Stabil</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20tertarik%20konsultasi%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20tanya%20info%20paketnya"
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerSound('success')}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-base shadow-2xl shadow-emerald-950/80 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2.5"
            >
              <MessageSquare className="w-5 h-5 text-slate-950 fill-current" />
              <span>💬 Konsultasi Gratis via WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => scrollToSection('consultation')}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm hover:border-emerald-500/40 transition flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>⚡ Minta Jadwal Demo VIP</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10: LEAD REGISTRATION & VIP CONSULTATION FORM                             */}
      {/* ========================================================================= */}
      <section
        id="consultation"
        className="py-24 px-4 bg-gradient-to-b from-[#0c1424] to-[#080e1a] border-t border-white/10 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0e1726]/90 border border-white/15 rounded-3xl p-5 sm:p-10 shadow-2xl relative">
            <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                <Users className="w-3.5 h-3.5" />
                <span>FORMULIR KONSULTASI &amp; DEMO VIP</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Hubungi Kami &amp; Dapatkan Akses Demo Langsung
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Isi formulir singkat di bawah ini. Tim kami akan langsung menghubungi WhatsApp Anda dan memberikan
                undangan akses demo aplikasi lengkap.
              </p>
            </div>

            {consultSuccess ? (
              <div className="p-8 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Terima Kasih, Permintaan Terkirim!</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                  Chat WhatsApp otomatis sedang dibuka untuk menghubungkan Anda ke nomor{' '}
                  <strong className="text-emerald-400 font-mono">{consultPhone}</strong>. Tim admin kami siap menjawab
                  semua pertanyaan Anda!
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
                    <label className="text-xs font-bold text-slate-300">Kebutuhan Anda:</label>
                    <select
                      value={consultInterest}
                      onChange={(e) => setConsultInterest(e.target.value)}
                      className="w-full bg-[#03060a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      <option value="aplikasi-baru">Pembuatan Aplikasi Bisnis Jaringan Baru (Brand &amp; Logo Sendiri)</option>
                      <option value="upgrade-sistem">Migrasi dari Software Lama / Sistem Kompetitor Lambat Jadi Otomatis</option>
                      <option value="demo-vip">Minta Akses Demo Lengkap &amp; Coba Fitur Aplikasi</option>
                      <option value="konsultasi-komisi">Tanya Jawab Alur Bisnis &amp; Konsultasi Sistem Komisi</option>
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
                      <span>Menghubungkan ke WhatsApp...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim &amp; Buka Chat WhatsApp Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Official Direct Contact Cards (Triolla Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20ingin%20konsultasi%20langsung"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#25D366] transition flex items-center space-x-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition">
                  <MessageSquare className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">WhatsApp Resmi:</div>
                  <div className="text-xs font-bold text-white group-hover:text-[#25D366] transition font-mono">
                    +62 812-3456-7890
                  </div>
                </div>
              </a>

              <a
                href="mailto:halo@synetiq.id"
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400 transition flex items-center space-x-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Email Tim Support:</div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition font-mono">
                    halo@synetiq.id
                  </div>
                </div>
              </a>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Jam Layanan Konsultasi:</div>
                  <div className="text-xs font-bold text-white font-mono">
                    Setiap Hari (08.00 - 22.00)
                  </div>
                </div>
              </div>
            </div>
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
            <span className="hover:text-cyan-400 transition cursor-pointer" onClick={() => scrollToSection('anti-crash-engine')}>
              Sub-12ms Engine &amp; Anti-Crash
            </span>
            <span className="hover:text-amber-400 transition cursor-pointer" onClick={() => scrollToSection('features')}>
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
      {/* 12: STICKY FLOATING BOTTOM ACTION BAR (Triolla-Style Conversion Dock)     */}
      {/* ========================================================================= */}
      {showStickyBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl animate-in slide-in-from-bottom-6 duration-300">
          <div className="bg-[#0e1726]/95 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl px-3.5 sm:px-5 py-2.5 shadow-2xl shadow-black flex items-center justify-between gap-3">
            <div className="hidden sm:flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>Konsultasi Bisnis Jaringan</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold">
                    FAST RESPONSE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">Tim kami siap membantu kebutuhan sistem Anda.</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20SYNETIQ%2C%20saya%20tertarik%20dengan%20aplikasi%20bisnis%20jaringan%20dan%20ingin%20konsultasi%20langsung"
                target="_blank"
                rel="noreferrer"
                onClick={() => triggerSound('success')}
                className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-black shadow-lg shadow-emerald-950/60 transition flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="hidden sm:inline">Chat WhatsApp</span>
                <span className="sm:hidden text-[11px] font-bold">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => scrollToSection('consultation')}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-extrabold shadow-md shadow-emerald-950 transition flex items-center justify-center space-x-1.5 focus:outline-none active:scale-95 shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Coba Demo VIP</span>
                <span className="sm:hidden text-[11px]">Demo VIP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
