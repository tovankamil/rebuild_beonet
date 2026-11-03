import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Bot,
  MessageSquare,
  Users,
  Wallet,
  QrCode,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Lock,
  Pause,
  Play,
  Zap,
  TrendingUp,
  Activity,
  CheckCircle2,
  Server,
  Radio,
  ArrowRight,
  Send,
  Award,
  Layers,
  Coins,
  RefreshCw,
  Clock,
  Check,
  Globe,
  Smartphone,
  ExternalLink,
  Sliders,
  DollarSign,
  Share2,
  BarChart3,
  CreditCard,
  UserCheck,
  LayoutDashboard,
} from 'lucide-react';

export default function HeroShowcaseSlideshow({
  audioEnabled = true,
  triggerSound = () => { },
  heroMitraCount = 1420,
  setHeroMitraCount = () => { },
  heroWalletBalance = 4850000,
  setHeroWalletBalance = () => { },
}) {
  // Slideshow Navigation & Timer State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  // Slide 0: Dashboard Overview State
  const [omsetHarian, setOmsetHarian] = useState(128500000);
  const [growthPercent, setGrowthPercent] = useState(68);
  const [overviewToast, setOverviewToast] = useState(null);
  const [txFeed, setTxFeed] = useState([
    { id: 1, user: 'Budi Santoso (Surabaya)', action: 'Daftar Paket Bisnis', bonus: '+Rp 350.000', time: '1 mnt lalu' },
    { id: 2, user: 'Dewi Lestari (Bandung)', action: 'Repeat Order 4 Box', bonus: '+Rp 140.000', time: '3 mnt lalu' },
    { id: 3, user: 'Agus Setiawan (Medan)', action: 'Bonus Pasangan Cair', bonus: '+Rp 350.000', time: '5 mnt lalu' },
  ]);

  // Slide 1: Binary Tree State
  const [treePairingPulse, setTreePairingPulse] = useState(false);
  const [treeToast, setTreeToast] = useState(null);
  const [leftBV, setLeftBV] = useState(850);
  const [rightBV, setRightBV] = useState(850);
  const [pairsCount, setPairsCount] = useState(14);

  // Slide 2: WhatsApp Bot State
  const [waSelected, setWaSelected] = useState('catalog');
  const [waStatusPing, setWaStatusPing] = useState('Online');
  const [waTyping, setWaTyping] = useState(false);

  // Slide 3: QRIS Fintech State
  const [qrisNmid, setQrisNmid] = useState('ID102008492019');
  const [qrisToast, setQrisToast] = useState(null);
  const [qrisFlashed, setQrisFlashed] = useState(false);

  // Slide 4: BioLink / Replika Storefront State
  const [replikaVisitors, setReplikaVisitors] = useState(148);
  const [replikaToast, setReplikaToast] = useState(null);

  // Slide 5: Cyber Radar SOC State
  const [threatCount, setThreatCount] = useState(983);
  const [isAttacking, setIsAttacking] = useState(false);
  const [radarLog, setRadarLog] = useState('[17:28:44] DEFCON-1 > 983 serangan siber berhasil diblokir');
  const [radarToast, setRadarToast] = useState(null);

  // 6 Slide Metadata (Dashboard Features)
  const slides = [
    {
      id: 'admin_leads',
      tabTitle: 'Portal Admin & Leads',
      shortTitle: 'Admin & Leads CRM',
      route: 'app.synetiq.id/admin/leads',
      badge: 'KANBAN LEADS OTOMATIS',
      icon: LayoutDashboard,
      accent: 'emerald',
      realImage: '/assets/tablet_admin_leads_real.png',
      desc: 'Tampilan live Portal Administrasi Pusat: manajemen leads iklan Meta/TikTok, pipeline kanban, dan automasi closing.',
    },
    {
      id: 'overview',
      tabTitle: 'Ringkasan Bisnis',
      shortTitle: 'Ringkasan Bisnis',
      route: 'app.synetiq.id/dashboard/overview',
      badge: 'OMSET REAL-TIME',
      icon: TrendingUp,
      accent: 'cyan',
      realImage: '/assets/tablet_overview_real.png',
      desc: 'Pantau omset harian, pertumbuhan mitra, dan mutasi saldo kas secara real-time dari satu layar tablet.',
    },
    {
      id: 'binary',
      tabTitle: 'Pohon Jaringan',
      shortTitle: 'Pohon Jaringan',
      route: 'app.synetiq.id/network/binary-tree',
      badge: 'HITUNG BONUS 1 DETIK',
      icon: Users,
      accent: 'emerald',
      realImage: '/assets/tablet_binary_real.png',
      desc: 'Visualisasi pohon jaringan otomatis, hitung pasangan/pairing instan tanpa tunda 24 jam seperti kompetitor.',
    },
    {
      id: 'whatsapp',
      tabTitle: 'Robot WhatsApp',
      shortTitle: 'WhatsApp 24 Jam',
      route: 'app.synetiq.id/bot/whatsapp-closer',
      badge: 'BALAS OTOMATIS 24 JAM',
      icon: MessageSquare,
      accent: 'teal',
      desc: 'Robot WhatsApp yang melayani prospek 24/7, kirim katalog bertombol, hingga follow-up otomatis.',
    },
    {
      id: 'fintech',
      tabTitle: 'Kas & QRIS',
      shortTitle: 'Kas & QRIS',
      route: 'app.synetiq.id/finance/qris-ledger',
      badge: 'QRIS BANK INDONESIA',
      icon: QrCode,
      accent: 'amber',
      desc: 'Uang masuk otomatis dari semua bank & e-wallet tanpa repot cek mutasi atau minta bukti transfer.',
    },
    {
      id: 'security',
      tabTitle: 'Keamanan Data',
      shortTitle: 'Pusat Keamanan',
      route: 'app.synetiq.id/admin/monitoring',
      badge: 'DEFCON 1 AKTIF',
      icon: ShieldCheck,
      accent: 'rose',
      realImage: '/assets/tablet_monitoring_real.png',
      desc: 'Proteksi saldo kas dari manipulasi dan serangan hacker dengan enkripsi standar perbankan.',
    },
  ];

  // Auto-play timer (5 seconds duration, 50ms tick)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setDirection(1);
          setCurrentSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + 1; // 1% every 50ms = 5000ms (5 seconds)
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  // Slide change handlers
  const handleNextSlide = () => {
    triggerSound('click');
    setDirection(1);
    setSlideProgress(0);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    triggerSound('click');
    setDirection(-1);
    setSlideProgress(0);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleJumpToSlide = (idx) => {
    if (idx === currentSlide) return;
    triggerSound('click');
    setDirection(idx > currentSlide ? 1 : -1);
    setSlideProgress(0);
    setCurrentSlide(idx);
  };

  // -------------------------------------------------------------
  // SLIDE 0: Overview Simulation
  // -------------------------------------------------------------
  const handleSimulateTransaction = () => {
    triggerSound('success');
    const tambah = 2500000;
    setOmsetHarian((prev) => prev + tambah);
    setHeroMitraCount((prev) => prev + 1);
    setHeroWalletBalance((prev) => prev + 350000);
    const newTx = {
      id: Date.now(),
      user: 'Rian Pratama (Jakarta)',
      action: 'Aktivasi Paket Gold',
      bonus: '+Rp 350.000',
      time: 'Baru saja',
    };
    setTxFeed((prev) => [newTx, ...prev.slice(0, 2)]);
    setOverviewToast('⚡ Transaksi Baru Masuk! Omset +Rp 2.500.000 & Komisi Upline Cair Otomatis');
    setTimeout(() => setOverviewToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 1: Binary Tree Spillover Action
  // -------------------------------------------------------------
  const handleAddSpillover = () => {
    triggerSound('success');
    setTreePairingPulse(true);
    setHeroMitraCount((prev) => prev + 1);
    setHeroWalletBalance((prev) => prev + 350000);
    setLeftBV((prev) => prev + 100);
    setRightBV((prev) => prev + 100);
    setPairsCount((prev) => prev + 1);
    setTreeToast('🎉 +1 Pasangan Baru Terhitung! Bonus Rp 350.000 Otomatis Cair ke Dompet');

    setTimeout(() => setTreePairingPulse(false), 800);
    setTimeout(() => setTreeToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 2: WhatsApp Bot Interaction
  // -------------------------------------------------------------
  const handleSelectWaMenu = (menuKey) => {
    triggerSound('click');
    setWaSelected(menuKey);
    setWaTyping(true);
    setWaStatusPing('Mengetik balasan...');
    setTimeout(() => {
      setWaTyping(false);
      setWaStatusPing('Online');
      triggerSound('success');
    }, 500);
  };

  // -------------------------------------------------------------
  // SLIDE 3: Fintech QRIS Action
  // -------------------------------------------------------------
  const handleSimulateQrisPayment = () => {
    triggerSound('success');
    setQrisFlashed(true);
    setHeroWalletBalance((prev) => prev + 250000);
    setQrisToast('💳 Pembayaran QRIS Rp 250.000 Sukses! Uang Langsung Masuk Kas Perusahaan');

    setTimeout(() => setQrisFlashed(false), 800);
    setTimeout(() => setQrisToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 4: Storefront Action
  // -------------------------------------------------------------
  const handleSimulateVisitor = () => {
    triggerSound('success');
    setReplikaVisitors((prev) => prev + 1);
    setReplikaToast('🛒 Pengunjung Mengklik Order di Website Toko Replika Mitra! Komisi Sponsor Terkunci');
    setTimeout(() => setReplikaToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 5: Cyber Security Radar Action
  // -------------------------------------------------------------
  const handleSimulateAttack = () => {
    triggerSound('success');
    setIsAttacking(true);
    setThreatCount((prev) => prev + 1);
    const mockIPs = ['185.220.101.4', '45.154.255.89', '194.26.29.112'];
    const randomIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    const time = new Date().toLocaleTimeString('id-ID');
    setRadarLog(`[${time}] Proteksi Aktif > Percobaan akses ilegal dari ${randomIP} berhasil diblokir`);
    setRadarToast(`🛡️ Percobaan Manipulasi Saldo ${randomIP} Dinetralisir 100%!`);

    setTimeout(() => setIsAttacking(false), 900);
    setTimeout(() => setRadarToast(null), 3500);
  };

  // Smooth animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 18 : -18,
      opacity: 0,
      scale: 0.985,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.22, ease: 'easeOut' },
        scale: { duration: 0.22, ease: 'easeOut' },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -18 : 18,
      opacity: 0,
      scale: 0.985,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 30 },
        opacity: { duration: 0.18, ease: 'easeIn' },
      },
    }),
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* ========================================================================= */}
      {/* APPLE iPAD PRO TABLET ENCLOSURE (Aspect Ratio: 980 / 642 = 1.526)          */}
      {/* ========================================================================= */}
      <div
        className="relative w-full aspect-[980/642] select-none shadow-2xl shadow-black/80 rounded-[24px] sm:rounded-[36px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* INNER SCREEN DISPLAY (Under Tablet Bezel Overlay) */}
        {/* Exact calculated percentage bounds: left: 3.06%, top: 4.67%, width: 93.88%, height: 90.65% */}
        <div
          className="absolute overflow-hidden rounded-[16px] sm:rounded-[22px] bg-[#070d18] z-10 flex flex-col justify-between"
          style={{
            left: '3.06%',
            top: '4.67%',
            width: '93.88%',
            height: '90.65%',
          }}
        >
          {/* Tablet Browser / OS Top Navigation Bar */}
          <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#091120] border-b border-white/10 flex items-center justify-between shrink-0">
            {/* Tablet Traffic Lights & OS Name */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="hidden sm:inline-block ml-2 text-[11px] font-mono text-slate-300 font-bold">
                SYNETIQ TABLET OS
              </span>
            </div>

            {/* URL Route Capsule */}
            <div className="flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] sm:text-xs font-mono text-slate-300 max-w-[200px] sm:max-w-none truncate">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-emerald-400 font-semibold truncate">{slides[currentSlide].route}</span>
            </div>

            {/* Slide Navigation Controls & Auto-play Toggle */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={handlePrevSlide}
                title="Slide Sebelumnya"
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextSlide}
                title="Slide Selanjutnya"
                className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setIsPaused(!isPaused);
                }}
                className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold border transition flex items-center space-x-1 ${isPaused
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
              >
                {isPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                <span className="hidden sm:inline">{isPaused ? 'PAUSED' : 'AUTO 5S'}</span>
              </button>
            </div>
          </div>

          {/* Smooth Countdown Progress Bar */}
          <div className="h-[2px] w-full bg-white/5 relative overflow-hidden shrink-0">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 origin-left transition-[width] duration-75 ease-linear"
              style={{ width: `${slideProgress}%` }}
            />
          </div>

          {/* ACTIVE SCREEN CONTENT (Edge-to-edge for real authentic captures, padded for interactive simulations) */}
          <div className={`flex-1 overflow-hidden relative ${slides[currentSlide]?.realImage ? 'p-0' : 'p-3 sm:p-5 flex flex-col justify-between'}`}>
            <AnimatePresence mode="wait" custom={direction}>
              {/* =============================================================== */}
              {/* REAL APPLICATION RETINA SCREEN (Slide 0: Admin CRM from Image 3, Slide 1: Overview, Slide 2: Binary, Slide 5: Security) */}
              {/* =============================================================== */}
              {slides[currentSlide]?.realImage && (
                <motion.div
                  key={`slide-real-${slides[currentSlide].id}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full h-full relative overflow-hidden bg-[#030712] select-none flex flex-col group/screen"
                >
                  <img
                    src={slides[currentSlide].realImage}
                    alt={slides[currentSlide].tabTitle}
                    className="w-full h-full object-cover object-top select-none pointer-events-none"
                    loading="eager"
                  />

                  {/* Floating Subtitle Bar on Screen (Bottom) */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3.5 sm:left-3.5 sm:right-3.5 z-30 pointer-events-none">
                    <div className="px-3.5 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 text-white text-[10px] sm:text-xs flex items-center justify-between shadow-2xl">
                      <span className="font-semibold text-slate-200 truncate">
                        {slides[currentSlide].desc}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-mono text-[#fed324] font-bold px-2 py-0.5 rounded-lg bg-white/10 ml-2 shrink-0 border border-[#fed324]/30">
                        {slides[currentSlide].badge}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 3: ROBOT WHATSAPP 24 JAM NONSTOP (AI Closer Interactive)  */}
              {/* =============================================================== */}
              {!slides[currentSlide]?.realImage && slides[currentSlide]?.id === 'whatsapp' && (
                <motion.div
                  key="slide-whatsapp"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center space-x-1">
                          <span>Robot WhatsApp SYNETIQ (Official)</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                        </div>
                        <div className="text-[9px] text-emerald-400 font-mono">
                          {waTyping ? 'Mengetik balasan...' : 'Aktif 24/7 Nonstop • Respon 0.4 Detik'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      AUTO-CLOSING LIVE
                    </span>
                  </div>

                  {/* Chat Mockup */}
                  <div className="p-3 rounded-2xl bg-[#0c1317] border border-white/10 space-y-2 text-[10px] sm:text-xs">
                    {/* User Inbound message */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white px-3 py-1.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
                        <p>Halo min, mau tanya info paket usaha dan cara daftarnya gimana ya?</p>
                        <div className="text-[8px] text-emerald-200/80 text-right mt-0.5 font-mono">10:42 ✓✓</div>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-slate-100 p-2.5 sm:p-3 rounded-2xl rounded-tl-none max-w-[92%] space-y-2 shadow-sm border border-white/5">
                        <p>
                          Halo Kak! 👋 Pendaftaran &amp; pemilihan paket usaha diproses otomatis 24 jam. Silakan pilih
                          menu interaktif di bawah:
                        </p>

                        {/* Interactive WhatsApp Buttons Grid */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectWaMenu('catalog')}
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${waSelected === 'catalog'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                          >
                            📦 Lihat Paket Usaha
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectWaMenu('register')}
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${waSelected === 'register'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                              }`}
                          >
                            📝 Form Daftar Otomatis
                          </button>
                        </div>

                        {waSelected === 'catalog' && (
                          <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[9px] text-emerald-200 animate-fadeIn">
                            ✓ Menampilkan 4 Paket Kemitraan: Silver, Gold, Platinum, VIP Crown.
                          </div>
                        )}
                        {waSelected === 'register' && (
                          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[9px] text-cyan-200 animate-fadeIn">
                            ✓ Membuka form registrasi kilat via Web Toko Replika Sponsor.
                          </div>
                        )}

                        <div className="text-[8px] text-slate-400 text-right font-mono">10:42 • Bot Respon 0.4s</div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      Coba klik tombol menu di dalam chat untuk simulasi respon bot:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectWaMenu(waSelected === 'catalog' ? 'register' : 'catalog')}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs transition shadow-md shadow-emerald-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <Bot className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Tes Kirim Pesan Bot</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 4: KAS & PEMBAYARAN QRIS OTOMATIS (Fintech Interactive)   */}
              {/* =============================================================== */}
              {!slides[currentSlide]?.realImage && slides[currentSlide]?.id === 'fintech' && (
                <motion.div
                  key="slide-fintech"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2 sm:space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <div className="text-sm sm:text-lg font-black text-white flex items-center space-x-2">
                        <span>Pembayaran QRIS &amp; Kas Otomatis</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] sm:text-xs font-mono font-bold">
                          NMID Resmi Bank Indonesia
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        Terima pembayaran dari semua bank dan e-wallet. Uang langsung masuk kas tanpa upload bukti transfer manual.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-base font-mono font-black text-amber-400">
                        Rp {Number(heroWalletBalance || 4850000).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400">Total Kas Terverifikasi</div>
                    </div>
                  </div>

                  {/* QRIS Graphic & Ledger Verification */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-4 items-stretch">
                    {/* Left: Interactive Simulated QR Code */}
                    <div
                      className={`md:col-span-7 p-3 rounded-2xl border transition-all flex items-center space-x-3 sm:space-x-4 ${qrisFlashed
                          ? 'bg-amber-950/60 border-amber-400 scale-[1.02] shadow-xl shadow-amber-500/30'
                          : 'bg-[#080d1a] border-white/10'
                        }`}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                        <QrCode className="w-full h-full text-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">QRIS Standar Nasional</div>
                        <div className="text-[9px] sm:text-xs text-amber-300 font-mono">NMID: {qrisNmid}</div>
                        <div className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5 leading-tight">
                          BCA • Mandiri • BRI • BNI • GoPay • OVO • Dana • ShopeePay
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-emerald-400 font-bold mt-1">
                          ✓ Konfirmasi 0.8 Detik • Saldo Kas Langsung Masuk
                        </div>
                      </div>
                    </div>

                    {/* Right: Real-time Double-Entry Ledger Card */}
                    <div className="md:col-span-5 p-3 rounded-2xl bg-[#030710] border border-white/10 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1.5 border-b border-white/10">
                        <span className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Buku Kas Double-Entry</span>
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/20">
                          MATCHED
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[9px] sm:text-[10px] font-mono">
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="truncate">TX-8921 • BCA VA</span>
                          <span className="text-emerald-400 font-bold">+Rp 250.000</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="truncate">TX-8920 • GoPay QRIS</span>
                          <span className="text-emerald-400 font-bold">+Rp 150.000</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span className="truncate">TX-8919 • Mandiri Instant</span>
                          <span className="text-emerald-400 font-bold">+Rp 500.000</span>
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-white/10 flex justify-between text-[10px]">
                        <span className="text-slate-400">Total Kas Terverifikasi:</span>
                        <span className="text-amber-400 font-bold font-mono">
                          Rp {Number(heroWalletBalance || 4850000).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      {qrisToast || 'Coba bayar via QRIS simulasi dan saksikan uang langsung masuk:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateQrisPayment}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold text-[10px] sm:text-xs transition shadow-md shadow-amber-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <QrCode className="w-3.5 h-3.5 text-slate-950" />
                      <span>Simulasi Bayar QRIS</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* APPLE iPAD PRO TABLET METALLIC FRAME & BEZEL OVERLAY */}
        <img
          src="/assets/tablet_bezel_overlay.png"
          alt="Apple iPad Pro SYNETIQ OS"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
        />
      </div>

      {/* ========================================================================= */}
      {/* 6 FLOATING FEATURE CARDS BELOW TABLET (Gambar 2: Color Matched to Yellow)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 mt-8 sm:mt-10 lg:mt-14">
        {slides.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleJumpToSlide(idx)}
              className={`p-3.5 sm:p-4 lg:p-5 rounded-2xl text-left border-2 transition-all duration-200 flex flex-col justify-between group active:scale-95 shadow-xl ${isActive
                  ? 'bg-black border-slate-950 ring-4 ring-black/25 text-white scale-[1.03] shadow-2xl'
                  : 'bg-[#090f1d] border-black/25 hover:border-black hover:bg-[#0f172a] text-white hover:shadow-2xl hover:scale-[1.01]'
                }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-8 sm:w-9 h-8 sm:h-9 rounded-xl flex items-center justify-center transition ${isActive
                      ? 'bg-[#fed324] text-slate-950 shadow-md font-bold'
                      : 'bg-white/10 text-amber-300 group-hover:bg-[#fed324] group-hover:text-slate-950'
                    }`}
                >
                  <Icon className="w-4 sm:w-4.5 h-4 sm:h-4.5" />
                </div>
                {isActive && <span className="w-2.5 h-2.5 rounded-full bg-[#fed324] animate-ping" />}
              </div>

              <div>
                  <div className="text-xs sm:text-sm font-black text-white leading-tight min-h-[32px] flex items-center">
                    {s.shortTitle}
                  </div>
                    <div className="text-[8.5px] sm:text-[9.5px] text-[#fed324] font-mono font-bold mt-1 leading-snug line-clamp-2">
                      {s.badge}
                    </div>
                  </div>
                </button>
                );
        })}
              </div>

              {/* ========================================================================= */}
              {/* KEY STATS COUNTER BAR (Gambar 2: Color Matched to Yellow Background)       */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-10 lg:mt-14 p-6 sm:p-8 lg:p-10 rounded-3xl bg-[#090f1d] border-2 border-black/30 shadow-2xl shadow-black/40">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#fed324] font-mono tracking-tight">1.420+</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1.5">Mitra Aktif</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Jaringan Tumbuh Otomatis</div>
                </div>

                <div className="text-center border-l md:border-x border-white/15">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-cyan-400 font-mono tracking-tight">1 Detik</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1.5">Hitung Bonus Instan</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Kompetitor Butuh 24 Jam+</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-400 font-mono tracking-tight">24 Jam</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1.5">Robot WhatsApp Siaga</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Balas Prospek &amp; Closing Nonstop</div>
                </div>

                <div className="text-center border-l border-white/15">
                  <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-amber-300 font-mono tracking-tight">99.9%</div>
                  <div className="text-xs sm:text-sm font-extrabold text-white mt-1.5">Waktu Aktif Sistem</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Stabil Tanpa Gangguan Server</div>
                </div>
              </div>
            </div>
          );
        }
