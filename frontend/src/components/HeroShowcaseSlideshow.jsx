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
} from 'lucide-react';

export default function HeroShowcaseSlideshow({
  audioEnabled = true,
  triggerSound = () => {},
  heroMitraCount = 1420,
  setHeroMitraCount = () => {},
  heroWalletBalance = 4850000,
  setHeroWalletBalance = () => {},
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
      id: 'overview',
      tabTitle: 'Ringkasan Bisnis',
      shortTitle: 'Ringkasan Bisnis',
      route: 'app.synetiq.id/dashboard/overview',
      badge: 'OMSET REAL-TIME',
      icon: TrendingUp,
      accent: 'emerald',
      desc: 'Pantau omset harian, pertumbuhan mitra, dan mutasi saldo kas secara real-time dari satu layar tablet.',
    },
    {
      id: 'binary',
      tabTitle: 'Pohon Jaringan',
      shortTitle: 'Pohon Jaringan',
      route: 'app.synetiq.id/network/binary-tree',
      badge: 'HITUNG BONUS 1 DETIK',
      icon: Users,
      accent: 'cyan',
      desc: 'Visualisasi pohon jaringan otomatis, hitung pasangan/pairing instan. Kompetitor butuh cut-off 24 jam.',
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
      id: 'storefront',
      tabTitle: 'Toko Replika',
      shortTitle: 'Toko Replika',
      route: 'app.synetiq.id/store/budi-santoso',
      badge: 'WEBSITE MEMBER INSTAN',
      icon: Globe,
      accent: 'indigo',
      desc: 'Setiap member langsung punya website toko online pribadi dengan nama mereka sendiri untuk promosi.',
    },
    {
      id: 'security',
      tabTitle: 'Keamanan Data',
      shortTitle: 'Anti-Kecurangan',
      route: 'app.synetiq.id/security/soc-defcon1',
      badge: 'PROTEKSI MILITER',
      icon: ShieldCheck,
      accent: 'rose',
      desc: 'Melindungi saldo kas dan data member dari manipulasi, kecurangan sistem, dan serangan hacker.',
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
                className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-mono font-bold border transition flex items-center space-x-1 ${
                  isPaused
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

          {/* ACTIVE SCREEN CONTENT (Optimized to fill tablet screen without blank space) */}
          <div className="flex-1 p-3 sm:p-5 overflow-hidden relative flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              {/* =============================================================== */}
              {/* SLIDE 0: RINGKASAN BISNIS & OMSET (Overview Dashboard)          */}
              {/* =============================================================== */}
              {currentSlide === 0 && (
                <motion.div
                  key="slide-overview"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2.5 sm:space-y-3.5"
                >
                  {/* Top Header: Headline & Growth Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm sm:text-lg font-black text-white">
                          Ringkasan Bisnis &amp; Omset
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span>+{growthPercent}% Pertumbuhan</span>
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        Laporan otomatis real-time: transaksi, omset, dan pertumbuhan mitra.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-base font-mono font-black text-emerald-400">
                        Rp {Number(omsetHarian || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400 font-mono">Omset Hari Ini</div>
                    </div>
                  </div>

                  {/* 4 Metric Cards Grid (Fills Tablet Screen Width) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Mitra Aktif</div>
                      <div className="text-sm sm:text-xl font-black text-white font-mono mt-0.5">
                        {Number(heroMitraCount || 1420).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-emerald-400 font-medium">+42 Baru Hari Ini</div>
                    </div>

                    <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Kas &amp; Saldo E-Wallet</div>
                      <div className="text-sm sm:text-xl font-black text-cyan-400 font-mono mt-0.5">
                        Rp {Number(heroWalletBalance || 4850000).toLocaleString('id-ID')}
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-cyan-300 font-medium">Siap Cair 1-Klik</div>
                    </div>

                    <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Komisi Hari Ini</div>
                      <div className="text-sm sm:text-xl font-black text-amber-400 font-mono mt-0.5">
                        Rp 18.450.000
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-amber-300 font-medium">Terdistribusi Otomatis</div>
                    </div>

                    <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Status Server</div>
                      <div className="text-sm sm:text-xl font-black text-emerald-400 mt-0.5 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>99.99%</span>
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-slate-400 font-medium">Zero Error Database</div>
                    </div>
                  </div>

                  {/* Visual Sales Growth Curve + Feed */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-stretch">
                    {/* Mini Weekly Bar Chart */}
                    <div className="sm:col-span-6 p-2.5 sm:p-3 rounded-2xl bg-[#030712] border border-white/10 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[9px] sm:text-xs text-slate-300 font-bold mb-2">
                        <span className="flex items-center space-x-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tren Omset 7 Hari Terakhir</span>
                        </span>
                        <span className="text-emerald-400 font-mono">+68% Minggu Ini</span>
                      </div>

                      {/* 7 Bars */}
                      <div className="flex items-end justify-between h-14 sm:h-20 gap-1.5 pt-2">
                        {[40, 52, 60, 48, 75, 88, 100].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t-md transition-all duration-300"
                              style={{ height: `${h}%` }}
                            />
                            <span className="text-[7px] sm:text-[9px] text-slate-400 font-mono">
                              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][i]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Feed Ticker */}
                    <div className="sm:col-span-6 p-2.5 sm:p-3 rounded-2xl bg-[#030712] border border-white/10 flex flex-col justify-between">
                      <div className="text-[9px] sm:text-xs font-mono text-slate-300 flex items-center justify-between mb-1.5 font-bold">
                        <span>FEED TRANSAKSI REAL-TIME</span>
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Live</span>
                        </span>
                      </div>
                      <div className="space-y-1">
                        {txFeed.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between text-[8px] sm:text-[10px] text-slate-300 font-mono py-1 border-b border-white/5 last:border-0"
                          >
                            <span className="truncate max-w-[140px] sm:max-w-[180px]">
                              🟢 <strong>{tx.user}</strong> — {tx.action}
                            </span>
                            <span className="text-emerald-400 font-bold shrink-0">{tx.bonus}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Trigger Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      {overviewToast || 'Klik tombol di samping untuk uji coba transaksi masuk:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateTransaction}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] sm:text-xs transition shadow-md shadow-emerald-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Simulasi Transaksi (+Rp 2.5 Jt)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 1: POHON JARINGAN & BONUS OTOMATIS (Binary Tree)          */}
              {/* =============================================================== */}
              {currentSlide === 1 && (
                <motion.div
                  key="slide-binary"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2.5 sm:space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <div className="text-sm sm:text-lg font-black text-white flex items-center space-x-2">
                        <span>Pohon Jaringan &amp; Bonus Pasangan</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] sm:text-xs font-mono font-bold">
                          Hitung Otomatis 1 Detik
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        Bonus sponsor &amp; pasangan langsung terhitung otomatis — bukan tunda 24 jam seperti sistem kompetitor.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-base font-mono font-black text-cyan-400">
                        {leftBV} BV | {rightBV} BV
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400">Volume Kaki Kiri &amp; Kanan</div>
                    </div>
                  </div>

                  {/* Visual Binary Tree 3-Tier Diagram */}
                  <div className="py-2 flex flex-col items-center justify-center space-y-2">
                    {/* Root Leader Node */}
                    <div className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-300" />
                      <span>Top Leader (Anda) — Level 1</span>
                    </div>

                    {/* Connecting Branch Line */}
                    <div className="w-36 sm:w-56 h-[2px] bg-cyan-500/50 relative">
                      <div className="absolute top-0 left-0 w-2 h-2 -translate-y-1/2 rounded-full bg-cyan-400" />
                      <div className="absolute top-0 right-0 w-2 h-2 -translate-y-1/2 rounded-full bg-cyan-400" />
                    </div>

                    {/* Left & Right Child Nodes */}
                    <div className="flex items-center space-x-6 sm:space-x-16">
                      <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-center min-w-[90px] sm:min-w-[130px]">
                        <div className="text-[9px] sm:text-xs text-slate-300 font-bold">Kaki Kiri (Tim A)</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-cyan-400 mt-0.5">
                          {leftBV} BV (Seimbang)
                        </div>
                      </div>

                      <div
                        className={`p-2 sm:p-2.5 rounded-xl border text-center min-w-[90px] sm:min-w-[130px] transition-all ${
                          treePairingPulse
                            ? 'bg-emerald-950 border-emerald-400 scale-105 shadow-lg shadow-emerald-500/50'
                            : 'bg-teal-950/80 border-teal-500/40'
                        }`}
                      >
                        <div className="text-[9px] sm:text-xs text-slate-300 font-bold">Kaki Kanan (Tim B)</div>
                        <div className="text-xs sm:text-sm font-mono font-black text-teal-400 mt-0.5">
                          {rightBV} BV (Seimbang)
                        </div>
                      </div>
                    </div>

                    {/* Formula Calculation Banner */}
                    <div className="w-full max-w-md p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-[9px] sm:text-xs font-mono text-cyan-200">
                      <span className="flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{pairsCount} Pasangan Terhitung = Rp {Number((pairsCount || 0) * 350000).toLocaleString('id-ID')}</span>
                      </span>
                      <span className="text-emerald-400 font-bold">Otomatis Masuk Dompet</span>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      {treeToast || 'Klik tombol di samping untuk tambah mitra baru & hitung bonus live:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleAddSpillover}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] sm:text-xs transition shadow-md shadow-cyan-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <Users className="w-3.5 h-3.5 text-cyan-200" />
                      <span>+ Tambah Mitra Spillover (+Rp 350k)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 2: ROBOT WHATSAPP 24 JAM NONSTOP (AI Closer)             */}
              {/* =============================================================== */}
              {currentSlide === 2 && (
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
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px]">
                        SY
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
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${
                              waSelected === 'catalog'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            📦 Lihat Paket Usaha
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectWaMenu('qris')}
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${
                              waSelected === 'qris'
                                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            💳 Bayar via QRIS
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectWaMenu('bonus')}
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${
                              waSelected === 'bonus'
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            💰 Cek Saldo Bonus
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectWaMenu('owner')}
                            className={`p-1.5 rounded-lg text-[9px] sm:text-[11px] font-bold text-center border transition ${
                              waSelected === 'owner'
                                ? 'bg-teal-500/30 border-teal-400 text-teal-300'
                                : 'bg-white/5 border-white/10 text-slate-300'
                            }`}
                          >
                            💬 Hubungi Pemilik
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Menu Response Text */}
                  <div className="p-2 rounded-xl bg-[#182229] border border-emerald-500/30 text-[9px] sm:text-xs text-slate-200">
                    {waSelected === 'catalog' && (
                      <span>
                        <strong className="text-emerald-400">📦 Paket Usaha:</strong> Paket Gold Rp 4.500.000 (Bonus
                        Sponsor Rp 1.000.000 + Hak Usaha). Klik untuk bayar otomatis!
                      </span>
                    )}
                    {waSelected === 'qris' && (
                      <span>
                        <strong className="text-amber-400">💳 QRIS Instan:</strong> Kode QRIS resmi Bank Indonesia
                        langsung terbit. Bayar dari BCA, Mandiri, GoPay, OVO seketika lunas!
                      </span>
                    )}
                    {waSelected === 'bonus' && (
                      <span>
                        <strong className="text-cyan-400">💰 Saldo Dompet:</strong> Rp{' '}
                        {Number(heroWalletBalance || 4850000).toLocaleString('id-ID')} siap dicairkan ke rekening bank Anda.
                      </span>
                    )}
                    {waSelected === 'owner' && (
                      <span>
                        <strong className="text-teal-400">💬 Hubungi Pemilik:</strong> Menghubungkan langsung ke nomor
                        WhatsApp pribadi admin/pemilik bisnis Anda.
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 3: KAS & PEMBAYARAN QRIS OTOMATIS (Fintech E-Wallet)      */}
              {/* =============================================================== */}
              {currentSlide === 3 && (
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
                        100% Otomatis
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400">Nol Selisih Pembukuan</div>
                    </div>
                  </div>

                  {/* 2-Column Grid: Left QRIS Card + Right FinTech Live Ledger */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 items-center">
                    {/* Left: QRIS Visual Card */}
                    <div className="md:col-span-7 p-3 sm:p-4 rounded-2xl bg-[#050a12] border border-amber-500/30 flex flex-col justify-between space-y-2">
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 rounded-2xl bg-white p-2 flex items-center justify-center shrink-0 transition-all ${
                            qrisFlashed ? 'ring-4 ring-emerald-400 scale-105 shadow-lg shadow-emerald-500/50' : ''
                          }`}
                        >
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

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                        <span className="text-[10px] text-slate-400">Nominal Simulasi:</span>
                        <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">Rp 250.000</span>
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

              {/* =============================================================== */}
              {/* SLIDE 4: TOKO REPLIKA MEMBER (Storefront)                       */}
              {/* =============================================================== */}
              {currentSlide === 4 && (
                <motion.div
                  key="slide-storefront"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2.5 sm:space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <div className="text-sm sm:text-lg font-black text-white flex items-center space-x-2">
                        <span>Website Toko Replika Member</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-xs font-mono font-bold">
                          Otomatis Siap Pakai
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        Setiap member dapat link website toko online pribadi. Order otomatis terdata ke sponsor.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-base font-mono font-black text-indigo-400">
                        {replikaVisitors} Pengunjung
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400">Traffic Toko Member</div>
                    </div>
                  </div>

                  {/* Member Store Card Preview */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-[#070b16] border border-indigo-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 sm:w-14 h-10 sm:h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        BS
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center space-x-1.5">
                          <span>Toko Resmi Budi Santoso</span>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Mitra Resmi
                          </span>
                        </div>
                        <div className="text-[9px] sm:text-xs text-indigo-300 font-mono">
                          synetiq.id/mitra/budi-santoso
                        </div>
                        <div className="text-[8px] sm:text-[10px] text-slate-400 mt-0.5">
                          Referral Terkunci: Pembeli otomatis masuk downline Budi
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateVisitor}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] sm:text-xs transition shrink-0"
                    >
                      Buka Toko
                    </button>
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      {replikaToast || 'Member cukup sebar link ini ke medsos tanpa perlu bikin website manual.'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateVisitor}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] sm:text-xs transition shadow-md shadow-indigo-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <Share2 className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Simulasi Kunjungan (+1 Pengunjung)</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* =============================================================== */}
              {/* SLIDE 5: PUSAT KEAMANAN DATA & ANTI-KECURANGAN (SOC DEFCON 1)   */}
              {/* =============================================================== */}
              {currentSlide === 5 && (
                <motion.div
                  key="slide-security"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="h-full flex flex-col justify-between space-y-2.5 sm:space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div>
                      <div className="text-sm sm:text-lg font-black text-white flex items-center space-x-2">
                        <span>Pusat Keamanan &amp; Anti-Kecurangan Saldo</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] sm:text-xs font-mono font-bold">
                          SOC DEFCON 1
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        Proteksi saldo kas dari manipulasi dan serangan hacker dengan enkripsi standar perbankan.
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs sm:text-base font-mono font-black text-rose-400">
                        {threatCount} Dinetralisir
                      </div>
                      <div className="text-[9px] sm:text-[11px] text-slate-400">0 Kasus Kebocoran Data</div>
                    </div>
                  </div>

                  {/* Security Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Proteksi Saldo Kas</div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">
                        Double-Entry Ledger
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-slate-400">Nol Selisih Pembukuan</div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Anti Multi-Akun Ilegal</div>
                      <div className="text-xs sm:text-sm font-bold text-cyan-400 mt-0.5">
                        Validasi NIK &amp; WA
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-slate-400">Deteksi Kecurangan</div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                      <div className="text-[9px] sm:text-xs text-slate-400">Kesiapan Server</div>
                      <div className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5">
                        99.99% Uptime
                      </div>
                      <div className="text-[8px] sm:text-[10px] text-slate-400">Tahan Ribuan Order</div>
                    </div>
                  </div>

                  {/* Live Security Log */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#03060d] border border-white/10 text-[9px] sm:text-xs font-mono text-emerald-300 truncate">
                    <span className="text-rose-400 font-bold">[SOC DEFCON 1]</span> {radarLog}
                  </div>

                  {/* Interactive Button */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[9px] sm:text-xs text-slate-300 truncate">
                      {radarToast || 'Uji ketangguhan sistem keamanan data bisnis Anda:'}
                    </span>
                    <button
                      type="button"
                      onClick={handleSimulateAttack}
                      className="px-3 sm:px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] sm:text-xs transition shadow-md shadow-rose-950 flex items-center space-x-1.5 active:scale-95 shrink-0"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-200" />
                      <span>Uji Pertahanan Siber</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5 mt-6 sm:mt-8">
        {slides.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === currentSlide;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleJumpToSlide(idx)}
              className={`p-3 sm:p-3.5 rounded-2xl text-left border-2 transition-all duration-200 flex flex-col justify-between group active:scale-95 shadow-xl ${
                isActive
                  ? 'bg-black border-slate-950 ring-4 ring-black/25 text-white scale-[1.03] shadow-2xl'
                  : 'bg-[#090f1d] border-black/25 hover:border-black hover:bg-[#0f172a] text-white hover:shadow-2xl hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-xl flex items-center justify-center transition ${
                    isActive
                      ? 'bg-[#fed324] text-slate-950 shadow-md font-bold'
                      : 'bg-white/10 text-amber-300 group-hover:bg-[#fed324] group-hover:text-slate-950'
                  }`}
                >
                  <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>
                {isActive && <span className="w-2.5 h-2.5 rounded-full bg-[#fed324] animate-ping" />}
              </div>

              <div>
                <div className="text-[11px] sm:text-xs font-black text-white leading-tight">
                  {s.shortTitle}
                </div>
                <div className="text-[9px] sm:text-[10px] text-[#fed324] font-mono font-bold mt-1 line-clamp-1">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8 p-5 sm:p-7 rounded-3xl bg-[#090f1d] border-2 border-black/30 shadow-2xl shadow-black/40">
        <div className="text-center">
          <div className="text-2xl sm:text-4xl font-black text-[#fed324] font-mono tracking-tight">1.420+</div>
          <div className="text-xs sm:text-sm font-extrabold text-white mt-1">Mitra Aktif</div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Jaringan Tumbuh Otomatis</div>
        </div>

        <div className="text-center border-l md:border-x border-white/15">
          <div className="text-2xl sm:text-4xl font-black text-cyan-400 font-mono tracking-tight">1 Detik</div>
          <div className="text-xs sm:text-sm font-extrabold text-white mt-1">Hitung Bonus Instan</div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Kompetitor Butuh 24 Jam+</div>
        </div>

        <div className="text-center">
          <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">24 Jam</div>
          <div className="text-xs sm:text-sm font-extrabold text-white mt-1">Robot WhatsApp Siaga</div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Balas Prospek &amp; Closing Nonstop</div>
        </div>

        <div className="text-center border-l border-white/15">
          <div className="text-2xl sm:text-4xl font-black text-amber-300 font-mono tracking-tight">99.9%</div>
          <div className="text-xs sm:text-sm font-extrabold text-white mt-1">Waktu Aktif Sistem</div>
          <div className="text-[10px] sm:text-[11px] text-slate-300 font-medium mt-0.5">Stabil Tanpa Gangguan Server</div>
        </div>
      </div>
    </div>
  );
}
