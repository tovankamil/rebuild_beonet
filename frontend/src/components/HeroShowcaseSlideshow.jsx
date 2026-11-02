import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

export default function HeroShowcaseSlideshow({
  audioEnabled = true,
  triggerSound = () => {},
  heroMitraCount = 14,
  setHeroMitraCount = () => {},
  heroWalletBalance = 4850000,
  setHeroWalletBalance = () => {},
}) {
  // Slideshow Navigation & Timer State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  // Slide 1: Cyber Radar SOC State
  const [threatCount, setThreatCount] = useState(983);
  const [isAttacking, setIsAttacking] = useState(false);
  const [radarLog, setRadarLog] = useState('[17:28:44] DEFCON-1 > 983 sources scrubbed globally');
  const [radarToast, setRadarToast] = useState(null);

  // Slide 2: WhatsApp Bot State
  const [waSelected, setWaSelected] = useState('catalog');
  const [waStatusPing, setWaStatusPing] = useState('Active');

  // Slide 3: Binary Tree State
  const [treePairingPulse, setTreePairingPulse] = useState(false);
  const [treeToast, setTreeToast] = useState(null);

  // Slide 4: QRIS Fintech State
  const [qrisNmid, setQrisNmid] = useState('ID102008492019');
  const [qrisToast, setQrisToast] = useState(null);
  const [qrisFlashed, setQrisFlashed] = useState(false);

  // Slide 5: Bee Farm State
  const [honeyLiters, setHoneyLiters] = useState(14.8);
  const [harvestToast, setHarvestToast] = useState(null);
  const [harvestSparkle, setHarvestSparkle] = useState(false);

  // 5 Slide Metadata
  const slides = [
    {
      id: 'soc',
      tabTitle: 'SOC Radar',
      route: 'soc.synetiq.internal/radar-defcon1',
      badge: 'DEFCON 1 ACTIVE',
      icon: ShieldAlert,
      accent: 'emerald',
    },
    {
      id: 'waha',
      tabTitle: 'WhatsApp Bot',
      route: 'waha.synetiq.internal/bot-engine',
      badge: 'WAHA DOCKER LIVE',
      icon: MessageSquare,
      accent: 'teal',
    },
    {
      id: 'binary',
      tabTitle: 'Binary Tree',
      route: 'engine.synetiq.internal/binary-tree',
      badge: 'SUB-12MS PAIRING',
      icon: Users,
      accent: 'cyan',
    },
    {
      id: 'fintech',
      tabTitle: 'QRIS E-Wallet',
      route: 'fintech.synetiq.internal/qris-ledger',
      badge: 'DOUBLE-ENTRY ZERO DIFF',
      icon: QrCode,
      accent: 'emerald',
    },
    {
      id: 'beefarm',
      tabTitle: 'Bee Farm',
      route: 'game.synetiq.internal/honey-staking',
      badge: 'NECTAR YIELD 2.4X',
      icon: Sparkles,
      accent: 'amber',
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
  // SLIDE 1: Interactive Actions (SOC Radar)
  // -------------------------------------------------------------
  const handleSimulateAttack = () => {
    triggerSound('success');
    setIsAttacking(true);
    setThreatCount((prev) => prev + 1);
    const mockIPs = ['185.220.101.4', '45.154.255.89', '194.26.29.112', '198.51.100.24'];
    const randomIP = mockIPs[Math.floor(Math.random() * mockIPs.length)];
    const time = new Date().toLocaleTimeString('id-ID');
    setRadarLog(`[${time}] SOC-DEFCON 1 > BLOCKED L7 DDoS attack from ${randomIP} (Threat Quarantined in 0.3ms)`);
    setRadarToast(`🛡️ Serangan ${randomIP} Berhasil Dinetralisir WAF!`);

    setTimeout(() => setIsAttacking(false), 900);
    setTimeout(() => setRadarToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 2: Interactive Actions (WhatsApp Bot)
  // -------------------------------------------------------------
  const handleSelectWaMenu = (menuKey) => {
    triggerSound('click');
    setWaSelected(menuKey);
    setWaStatusPing('Dispatched in 0.4s');
    setTimeout(() => setWaStatusPing('Active'), 2000);
  };

  // -------------------------------------------------------------
  // SLIDE 3: Interactive Actions (Binary Tree)
  // -------------------------------------------------------------
  const handleAddSpillover = () => {
    triggerSound('success');
    setTreePairingPulse(true);
    setHeroMitraCount((prev) => prev + 1);
    setHeroWalletBalance((prev) => prev + 350000);
    setTreeToast('+Rp 350.000 Bonus Pasangan Baru Dikreditkan!');

    setTimeout(() => setTreePairingPulse(false), 800);
    setTimeout(() => setTreeToast(null), 3500);
  };

  // -------------------------------------------------------------
  // SLIDE 4: Interactive Actions (Fintech QRIS)
  // -------------------------------------------------------------
  const handleSimulateQrisPayment = () => {
    triggerSound('success');
    setQrisFlashed(true);
    setHeroWalletBalance((prev) => prev + 250000);
    setQrisToast('💳 Pembayaran QRIS Rp 250.000 Berhasil Masuk ke Kas!');

    setTimeout(() => setQrisFlashed(false), 800);
    setTimeout(() => setQrisToast(null), 3500);
  };

  const handleRegenerateQris = () => {
    triggerSound('click');
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000);
    setQrisNmid(`ID${randomCode}`);
    setQrisToast('🔄 QRIS Dynamic Code Diperbarui');
    setTimeout(() => setQrisToast(null), 2500);
  };

  // -------------------------------------------------------------
  // SLIDE 5: Interactive Actions (Bee Farm)
  // -------------------------------------------------------------
  const handleHarvestHoney = () => {
    triggerSound('success');
    setHarvestSparkle(true);
    setHoneyLiters((prev) => Number((prev + 2.5).toFixed(1)));
    setHeroWalletBalance((prev) => prev + 87500);
    setHarvestToast('🍯 Panen Berhasil! +2.5L Royal Nectar (+Rp 87.500 Cair ke Dompet)');

    setTimeout(() => setHarvestSparkle(false), 1200);
    setTimeout(() => setHarvestToast(null), 3800);
  };

  // Emil Kowalski animation variants (starts at scale 0.98, spring damp 30)
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 24 : -24,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 32 },
        opacity: { duration: 0.22, ease: 'easeOut' },
        scale: { duration: 0.22, ease: 'easeOut' },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -24 : 24,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 320, damping: 32 },
        opacity: { duration: 0.18, ease: 'easeIn' },
      },
    }),
  };

  return (
    <div className="relative w-full max-w-full">
      {/* ========================================================================= */}
      {/* FLOATING BADGES (Desktop/Tablet) - Apple-style subtle float & aura        */}
      {/* ========================================================================= */}
      {/* Top Left: SOC Defense Badge */}
      <div className="hidden md:flex absolute -top-5 -left-4 items-center space-x-2.5 px-3 py-2 rounded-2xl bg-[#0e1726]/90 backdrop-blur-xl border border-emerald-500/30 text-xs shadow-2xl shadow-emerald-950/60 animate-float-slow z-30 pointer-events-none">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        <div>
          <div className="font-extrabold text-white text-[11px] leading-tight flex items-center space-x-1">
            <span>SOC DEFCON 1</span>
            <span className="text-emerald-400 font-mono">ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">{threatCount} Threats Neutralized</div>
        </div>
      </div>

      {/* Top Right: Binary Speed Badge */}
      <div className="hidden md:flex absolute -top-5 -right-4 items-center space-x-2.5 px-3 py-2 rounded-2xl bg-[#0e1726]/90 backdrop-blur-xl border border-cyan-500/30 text-xs shadow-2xl shadow-cyan-950/60 animate-float-reverse z-30 pointer-events-none">
        <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
        <div>
          <div className="font-extrabold text-white text-[11px] leading-tight flex items-center space-x-1">
            <span>12ms Pairing</span>
            <span className="text-cyan-400 font-mono">LIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Auto Spillover Placement</div>
        </div>
      </div>

      {/* Bottom Left: WhatsApp AI Bot Badge */}
      <div className="hidden lg:flex absolute -bottom-5 -left-4 items-center space-x-2.5 px-3 py-2 rounded-2xl bg-[#0e1726]/90 backdrop-blur-xl border border-teal-500/30 text-xs shadow-2xl shadow-teal-950/60 animate-float-reverse z-30 pointer-events-none">
        <Bot className="w-4 h-4 text-teal-400" />
        <div>
          <div className="font-extrabold text-white text-[11px] leading-tight">WAHA AI Closer</div>
          <div className="text-[10px] text-slate-400 font-mono">24/7 Multi-Session Bot</div>
        </div>
      </div>

      {/* Bottom Right: QRIS Fintech Settlement Badge */}
      <div className="hidden lg:flex absolute -bottom-5 -right-4 items-center space-x-2.5 px-3 py-2 rounded-2xl bg-[#0e1726]/90 backdrop-blur-xl border border-amber-500/30 text-xs shadow-2xl shadow-amber-950/60 animate-float-slow z-30 pointer-events-none">
        <QrCode className="w-4 h-4 text-amber-400" />
        <div>
          <div className="font-extrabold text-white text-[11px] leading-tight">QRIS Instant Rail</div>
          <div className="text-[10px] text-slate-400 font-mono">Double-Entry Ledger Matched</div>
        </div>
      </div>

      {/* Ambient Multi-Stop Light Halo */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20 rounded-[32px] blur-2xl opacity-60 pointer-events-none -z-10" />

      {/* ========================================================================= */}
      {/* MACBOOK / ULTRA-WIDESCREEN DASHBOARD GLASSMORPHIC FRAME                   */}
      {/* ========================================================================= */}
      <div
        className="relative rounded-[26px] sm:rounded-[30px] border border-white/15 bg-[#0a101d]/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.12)] overflow-hidden transition-all duration-300"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Specular Edge Highlight */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-40" />

        {/* ----------------------------------------------------------------------- */}
        {/* CHROME HEADER: Traffic Lights, URL Capsule, Nav Chevrons, Auto Indicator */}
        {/* ----------------------------------------------------------------------- */}
        <div className="px-3.5 sm:px-5 py-3 bg-[#080d17]/95 border-b border-white/10 flex items-center justify-between select-none">
          {/* Left: macOS Traffic Lights */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
            <div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="hidden sm:inline-block ml-2.5 text-[11px] font-mono text-slate-400 tracking-tight">
              SYNETIQ OS V3.2
            </span>
          </div>

          {/* Center: URL Route Capsule */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] sm:text-[11px] font-mono text-slate-300 max-w-[210px] sm:max-w-none truncate">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-semibold truncate">{slides[currentSlide].route}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold">60 FPS</span>
            </span>
          </div>

          {/* Right: Previous / Next & Pause Indicator */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrevSlide}
              title="Slide Sebelumnya"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextSlide}
              title="Slide Selanjutnya"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                triggerSound('click');
                setIsPaused(!isPaused);
              }}
              title={isPaused ? 'Lanjutkan Auto-Play' : 'Jeda Auto-Play (Hover)'}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition flex items-center space-x-1 active:scale-95 ${
                isPaused
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
            >
              {isPaused ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 fill-current" />}
              <span className="hidden sm:inline">{isPaused ? 'PAUSED' : 'AUTO 5S'}</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SMOOTH COUNTDOWN PROGRESS BAR (5s Interval, Pauses on Hover)            */}
        {/* ----------------------------------------------------------------------- */}
        <div className="h-[2.5px] w-full bg-white/5 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 origin-left transition-[width] duration-75 ease-linear"
            style={{ width: `${slideProgress}%` }}
          />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SLIDE VIEWPORT CONTAINER                                                */}
        {/* ----------------------------------------------------------------------- */}
        <div className="p-4 sm:p-5 md:p-6 min-h-[460px] sm:min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* =================================================================== */}
            {/* SLIDE 1: CYBER THREAT RADAR SOC DEFCON 1                            */}
            {/* =================================================================== */}
            {currentSlide === 0 && (
              <motion.div
                key="slide-soc"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-4"
              >
                {/* Header Module Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>SOC CYBER THREAT RADAR</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                          DEFCON 1
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">GeoIP Worldwide Defense Matrix</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-emerald-400">{threatCount} BLOCKED</div>
                    <div className="text-[9px] text-slate-400 font-mono">0 SECURITY BREACHES</div>
                  </div>
                </div>

                {/* Radar Stage Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Left: Tactical Radar Canvas Simulation */}
                  <div className="sm:col-span-6 flex justify-center py-2">
                    <div
                      className={`relative w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-emerald-500/40 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                        isAttacking
                          ? 'bg-red-950/40 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.5)]'
                          : 'bg-[#030910]/90 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                      }`}
                    >
                      {/* Radar Range Rings (Concentric Circles) */}
                      <div className="absolute inset-2 rounded-full border border-emerald-500/20 border-dashed" />
                      <div className="absolute inset-8 rounded-full border border-emerald-500/25" />
                      <div className="absolute inset-16 rounded-full border border-emerald-500/30" />

                      {/* Radar Crosshairs */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-emerald-500/20" />
                      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-500/20" />

                      {/* Rotating Radar Scanner Beam */}
                      <div
                        className="absolute inset-0 origin-center animate-spin pointer-events-none"
                        style={{ animationDuration: '3.6s' }}
                      >
                        <div className="w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-emerald-500/40 via-teal-500/10 to-transparent [clip-path:polygon(0_100%,100%_0,100%_100%)]" />
                      </div>

                      {/* Center SOC Core Icon */}
                      <div className="relative z-10 w-9 h-9 rounded-full bg-emerald-950 border border-emerald-400/80 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      </div>

                      {/* Tactical Blips on Radar */}
                      {/* Blip 1: Jakarta Core (Safe) */}
                      <div className="absolute top-10 right-10 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-[8px] font-mono font-bold text-emerald-300">JKT Hub</span>
                      </div>
                      {/* Blip 2: Frankfurt (Blocked) */}
                      <div className="absolute bottom-12 left-8 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold text-red-300">TOR Probe</span>
                      </div>
                      {/* Blip 3: Singapore CDN */}
                      <div className="absolute top-14 left-10 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span className="text-[8px] font-mono font-bold text-cyan-300">SG CDN</span>
                      </div>
                      {/* Blip 4: Tokyo Edge */}
                      <div className="absolute bottom-9 right-11 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[8px] font-mono font-bold text-amber-300">Tokyo API</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: SOC Metrics & WAF telemetry */}
                  <div className="sm:col-span-6 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">WAF Filter Latency</div>
                        <div className="text-sm font-mono font-black text-emerald-400">0.8 ms</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">Scrubbing Bandwidth</div>
                        <div className="text-sm font-mono font-black text-cyan-400">48.2 Gbps</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">Active Threat Sources</div>
                        <div className="text-sm font-mono font-black text-red-400">{threatCount} IP</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-[10px] text-slate-400">SLA Availability</div>
                        <div className="text-sm font-mono font-black text-amber-400">99.999%</div>
                      </div>
                    </div>

                    {/* Live Ticker Log Feed */}
                    <div className="p-2.5 rounded-xl bg-[#03070d] border border-white/10 font-mono text-[10px] text-emerald-300/90 truncate flex items-center space-x-1.5">
                      <Radio className="w-3 h-3 text-emerald-400 shrink-0 animate-pulse" />
                      <span className="truncate">{radarLog}</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Attack Simulation Trigger */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400 text-center sm:text-left">
                    {radarToast ? (
                      <span className="text-emerald-300 font-bold">{radarToast}</span>
                    ) : (
                      'Uji ketangguhan mitigasi WAF secara langsung di browser Anda.'
                    )}
                  </div>
                  <button
                    onClick={handleSimulateAttack}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg shadow-red-950/40"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>⚡ Uji Serangan Siber (Test WAF Mitigation)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* SLIDE 2: WHATSAPP INTERACTIVE STORE BOT                             */}
            {/* =================================================================== */}
            {currentSlide === 1 && (
              <motion.div
                key="slide-waha"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3.5"
              >
                {/* Header Module Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>WHATSAPP INTERACTIVE STORE BOT</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                          WAHA DOCKER
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Nested Buttons &amp; Automated AI Closing</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-teal-400">LATENCY 42ms</div>
                    <div className="text-[9px] text-slate-400 font-mono">24/7 AUTO-RESPONDER</div>
                  </div>
                </div>

                {/* Smartphone Style Chat Screen */}
                <div className="rounded-2xl bg-[#0b141a] border border-white/10 p-3 sm:p-4 space-y-2.5 shadow-inner">
                  {/* WA Header Profile */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-[11px] shadow-sm">
                        SY
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center space-x-1 text-[11px]">
                          <span>SYNETIQ Sales Agent (Official)</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                        </div>
                        <div className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Online • {waStatusPing}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      META CLOUD READY
                    </span>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-2 text-xs">
                    {/* User Inbound message */}
                    <div className="flex justify-end">
                      <div className="bg-[#005c4b] text-white px-3 py-1.5 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[75%] shadow-sm">
                        <p className="text-[11px] leading-relaxed">
                          Halo min, mau tanya info paket kemitraan &amp; stok herbal BIONET hari ini?
                        </p>
                        <div className="text-[8px] text-emerald-200/80 text-right mt-0.5 font-mono">10:42 ✓✓</div>
                      </div>
                    </div>

                    {/* Bot Outbound message with nested quick reply buttons */}
                    <div className="flex justify-start">
                      <div className="bg-[#202c33] text-slate-100 p-3 rounded-2xl rounded-tl-none max-w-[94%] sm:max-w-[85%] space-y-2 shadow-sm border border-white/5">
                        <p className="text-[11px] leading-relaxed">
                          Halo Kak! 👋 Selamat datang di <strong>SYNETIQ Smart Commerce</strong>. Transaksi &amp;
                          kemitraan diproses otonom 24/7. Silakan pilih menu interaktif:
                        </p>

                        {/* Interactive WhatsApp Buttons Grid */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => handleSelectWaMenu('catalog')}
                            className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition active:scale-95 ${
                              waSelected === 'catalog'
                                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            📦 Katalog Produk
                          </button>
                          <button
                            onClick={() => handleSelectWaMenu('balance')}
                            className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition active:scale-95 ${
                              waSelected === 'balance'
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            💰 Cek Saldo Komisi
                          </button>
                          <button
                            onClick={() => handleSelectWaMenu('beefarm')}
                            className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition active:scale-95 ${
                              waSelected === 'beefarm'
                                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            🐝 Panen Bee Farm
                          </button>
                          <button
                            onClick={() => handleSelectWaMenu('register')}
                            className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition active:scale-95 ${
                              waSelected === 'register'
                                ? 'bg-teal-500/30 border-teal-400 text-teal-300'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            ⚡ Daftar Kemitraan
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bot Dynamic Nested Reply Bubble */}
                    <div className="flex justify-start">
                      <div className="bg-[#182229] border border-emerald-500/30 text-slate-200 px-3 py-2 rounded-2xl max-w-[94%] sm:max-w-[85%] text-[10px] sm:text-[11px] leading-relaxed shadow-sm">
                        {waSelected === 'catalog' && (
                          <div>
                            <span className="text-emerald-400 font-bold">🌿 BIO-HERBAL PLATINUM:</span> BPOM TR.21390192
                            • Stok Siap: <strong>4.820 box</strong> • Harga Mitra: Rp 250.000. Klik checkout untuk link
                            QRIS instan!
                          </div>
                        )}
                        {waSelected === 'balance' && (
                          <div>
                            <span className="text-cyan-400 font-bold">💳 SALDO DOMPET ANDA:</span> Rp{' '}
                            <strong>{heroWalletBalance.toLocaleString('id-ID')}</strong> (Bisa ditarik detik ini via
                            QRIS / Multi-VA BCA otonom).
                          </div>
                        )}
                        {waSelected === 'beefarm' && (
                          <div>
                            <span className="text-amber-400 font-bold">🍯 SARANG BEE FARM:</span> 14.8 Liter madu siap
                            dipanen hari ini (+Rp 518.000). Nectar multiplier 2.4x aktif!
                          </div>
                        )}
                        {waSelected === 'register' && (
                          <div>
                            <span className="text-teal-400 font-bold">🚀 1-CLICK ONBOARDING:</span> Formulir instan
                            langsung terhubung ke Pohon Binary otonom dengan auto-spillover placement.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Meta Bar */}
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Klik tombol di atas untuk mengetes respon bot otonom.</span>
                  <span className="text-emerald-400 font-bold">Konversi Closing: 68.4%</span>
                </div>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* SLIDE 3: AUTONOMOUS BINARY TREE ENGINE                              */}
            {/* =================================================================== */}
            {currentSlide === 2 && (
              <motion.div
                key="slide-binary"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3.5"
              >
                {/* Header Module Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <Users className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>AUTONOMOUS BINARY TREE ENGINE</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                          SUB-12MS
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Auto Spillover Placement &amp; Pairing Matrix</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-cyan-400">BALANCE 96.2%</div>
                    <div className="text-[9px] text-slate-400 font-mono">INSTANT PAYOUT</div>
                  </div>
                </div>

                {/* Tree Visual Topology */}
                <div className="p-3 sm:p-4 rounded-2xl bg-[#03070e]/90 border border-white/10 space-y-3 relative overflow-hidden">
                  {/* Root Node: Anda (Top Leader) */}
                  <div className="flex justify-center">
                    <div
                      className={`px-4 py-2 rounded-xl border flex items-center space-x-2 transition-all duration-300 ${
                        treePairingPulse
                          ? 'bg-emerald-600 text-white border-emerald-300 scale-105 shadow-lg shadow-emerald-500/50'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/30'
                      }`}
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <div className="text-left">
                        <div className="text-xs font-extrabold leading-tight">Anda (Top Leader Mahkota)</div>
                        <div className="text-[9px] text-emerald-100 font-mono">
                          Saldo Rp {heroWalletBalance.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG Branch Lines */}
                  <div className="h-6 flex justify-center items-center">
                    <svg className="w-64 h-6">
                      <line
                        x1="128"
                        y1="0"
                        x2="48"
                        y2="24"
                        stroke={treePairingPulse ? '#10b981' : 'rgba(16,185,129,0.5)'}
                        strokeWidth={treePairingPulse ? '3' : '2'}
                      />
                      <line
                        x1="128"
                        y1="0"
                        x2="208"
                        y2="24"
                        stroke={treePairingPulse ? '#06b6d4' : 'rgba(6,182,212,0.5)'}
                        strokeWidth={treePairingPulse ? '3' : '2'}
                      />
                    </svg>
                  </div>

                  {/* Left & Right Child Nodes */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left Node */}
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                      <div className="text-[10px] font-bold text-emerald-400">Kaki Kiri (Power Leg)</div>
                      <div className="text-sm font-mono font-black text-white mt-0.5">128.400 BV</div>
                      <div className="text-[9px] text-slate-400">48 Mitra Aktif (+15 BV/jam)</div>
                    </div>

                    {/* Right Node */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                        treePairingPulse
                          ? 'bg-cyan-950/80 border-cyan-400 scale-[1.02]'
                          : 'bg-cyan-950/40 border-cyan-500/30'
                      }`}
                    >
                      <div className="text-[10px] font-bold text-cyan-400">Kaki Kanan (Spillover Leg)</div>
                      <div className="text-sm font-mono font-black text-white mt-0.5">
                        {(122900 + (heroMitraCount - 14) * 1500).toLocaleString('id-ID')} BV
                      </div>
                      <div className="text-[9px] text-slate-400">{heroMitraCount} Mitra Aktif (Auto-Placed)</div>
                    </div>
                  </div>

                  {/* BV Parity Balance Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Equilibrium Pairing Ratio: 96.2%</span>
                      <span className="text-emerald-400 font-bold">+Rp 350.000 / Pasang</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[96.2%] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Interactive Action: Test Auto Spillover & Pairing */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400 text-center sm:text-left">
                    {treeToast ? (
                      <span className="text-emerald-400 font-bold">{treeToast}</span>
                    ) : (
                      'Simulasikan penambahan mitra spillover di kaki lemah.'
                    )}
                  </div>
                  <button
                    onClick={handleAddSpillover}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 hover:text-white text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-950/40"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+ Simulasi Spillover Mitra (Trigger Pairing)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* SLIDE 4: FINTECH DOUBLE-ENTRY E-WALLET & QRIS                       */}
            {/* =================================================================== */}
            {currentSlide === 3 && (
              <motion.div
                key="slide-fintech"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3.5"
              >
                {/* Header Module Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>FINTECH DOUBLE-ENTRY &amp; MULTI-PAYMENT QRIS</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          ASPI / BI VERIFIED
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Zero-Imbalance Real-Time Settlement</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-emerald-400">AES-256 GCM</div>
                    <div className="text-[9px] text-slate-400 font-mono">REAL-TIME LEDGER</div>
                  </div>
                </div>

                {/* Dual Grid: Dynamic QRIS + Live Double-Entry Ledger */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
                  {/* Left: Dynamic QRIS Card */}
                  <div className="sm:col-span-5 p-3 rounded-2xl bg-[#050b14] border border-white/10 flex flex-col justify-between text-center relative overflow-hidden">
                    {/* Scanner line animation */}
                    <div className="absolute inset-x-0 h-[2px] bg-emerald-400/80 shadow-[0_0_10px_#10b981] animate-pulse pointer-events-none top-1/2" />

                    <div>
                      <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-white">QRIS STANDAR</span>
                        <span className="text-emerald-400">NMID READY</span>
                      </div>

                      {/* QR Code SVG Visualizer */}
                      <div className="w-28 h-28 mx-auto p-2 bg-white rounded-xl shadow-lg flex items-center justify-center my-1">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="5" y="5" width="30" height="30" rx="3" fill="#0f172a" />
                          <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
                          <rect x="14" y="14" width="12" height="12" rx="1" fill="#059669" />

                          <rect x="65" y="5" width="30" height="30" rx="3" fill="#0f172a" />
                          <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
                          <rect x="74" y="14" width="12" height="12" rx="1" fill="#059669" />

                          <rect x="5" y="65" width="30" height="30" rx="3" fill="#0f172a" />
                          <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
                          <rect x="14" y="74" width="12" height="12" rx="1" fill="#059669" />

                          {/* Data points */}
                          <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
                          <rect x="52" y="18" width="6" height="6" fill="#0f172a" />
                          <rect x="42" y="28" width="8" height="6" fill="#0f172a" />
                          <rect x="42" y="42" width="16" height="16" rx="2" fill="#059669" />
                          <rect x="65" y="45" width="6" height="10" fill="#0f172a" />
                          <rect x="78" y="55" width="12" height="6" fill="#0f172a" />
                          <rect x="42" y="65" width="8" height="8" fill="#0f172a" />
                          <rect x="55" y="75" width="15" height="6" fill="#0f172a" />
                          <rect x="75" y="75" width="15" height="15" rx="1" fill="#0f172a" />
                        </svg>
                      </div>

                      <div className="text-[9px] font-mono text-slate-400 mt-1">{qrisNmid}</div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                      <span>BCA • BRI • Mandiri • GoPay</span>
                      <button
                        onClick={handleRegenerateQris}
                        className="text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Right: Balance & Ledger History */}
                  <div className="sm:col-span-7 space-y-2 flex flex-col justify-between">
                    {/* Wallet Cash Balance */}
                    <div
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        qrisFlashed
                          ? 'bg-emerald-950/80 border-emerald-400 shadow-md shadow-emerald-500/30'
                          : 'bg-[#03070f] border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Saldo Kas E-Wallet (Mitra Mahkota)</span>
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
                        Rp {heroWalletBalance.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[9px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span>Mutasi instant tanpa delay perbankan</span>
                      </div>
                    </div>

                    {/* Instant Double-Entry Ledger Preview */}
                    <div className="p-2.5 rounded-xl bg-[#03070f] border border-white/10 space-y-1.5 text-[10px] font-mono">
                      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                        Buku Kas Berpasangan (Double-Entry)
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-emerald-400">[CR] +Rp 350.000</span>
                        <span className="truncate max-w-[130px]">Pairing Binary #P-984</span>
                        <span className="text-slate-500">Instant</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-emerald-400">[CR] +Rp 1.000.000</span>
                        <span className="truncate max-w-[130px]">Sponsor Gold Hendra</span>
                        <span className="text-slate-500">Settled</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-red-400">[DB] -Rp 500.000</span>
                        <span className="truncate max-w-[130px]">Auto WD BCA ****8921</span>
                        <span className="text-slate-500">Success</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Action: Simulate QRIS payment */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400 text-center sm:text-left">
                    {qrisToast ? (
                      <span className="text-emerald-400 font-bold">{qrisToast}</span>
                    ) : (
                      'Simulasikan transaksi QRIS instan masuk ke rekening.'
                    )}
                  </div>
                  <button
                    onClick={handleSimulateQrisPayment}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-950/40"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>⚡ Simulasi QRIS Masuk (+Rp 250.000)</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* =================================================================== */}
            {/* SLIDE 5: GAMIFIKASI BEE FARM (HONEYCOMB STAKING)                   */}
            {/* =================================================================== */}
            {currentSlide === 4 && (
              <motion.div
                key="slide-beefarm"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-3.5"
              >
                {/* Header Module Meta */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                        <span>GAMIFIKASI BEE FARM &amp; HONEYCOMB STAKING</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          ANTI-CHURN
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Hexagonal Staking Hive &amp; Wake-Up Automation</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-amber-400">2.4X YIELD</div>
                    <div className="text-[9px] text-slate-400 font-mono">DAILY HARVEST</div>
                  </div>
                </div>

                {/* Honeycomb Staking Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  {/* Left: Hexagonal Hive Cluster Visualization */}
                  <div className="sm:col-span-6 flex justify-center py-1">
                    <div
                      className={`relative p-3 rounded-2xl border transition-all duration-300 ${
                        harvestSparkle
                          ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
                          : 'bg-[#060a12]/90 border-amber-500/20 shadow-lg'
                      }`}
                    >
                      {/* Hex Cluster Simulated with Stylized Hexagon Badges */}
                      <div className="flex flex-col items-center space-y-1.5">
                        {/* Top row */}
                        <div className="flex space-x-2">
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                            <span>🐝 1,000 BV</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                            <span>🐝 2,500 BV</span>
                          </div>
                        </div>

                        {/* Center Queen Hive */}
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center space-x-1.5 animate-pulse">
                          <span>👑</span>
                          <span>ROYAL QUEEN HIVE (LVL 5)</span>
                        </div>

                        {/* Bottom row */}
                        <div className="flex space-x-2">
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                            <span>🍯 Multiplier 2.4x</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                            <span>⚡ Auto-Harvest</span>
                          </div>
                        </div>
                      </div>

                      {/* Anti-churn wake up pulse */}
                      <div className="mt-2.5 pt-2 border-t border-white/10 text-center">
                        <div className="text-[9px] font-mono text-emerald-400 font-bold flex items-center justify-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Wake-Up Alert: 3 Mitra Inaktif Diping via WhatsApp</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Daily Harvest Yield Stats */}
                  <div className="sm:col-span-6 space-y-2.5">
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                      <div className="flex items-center justify-between text-[11px] text-amber-200/90 mb-0.5">
                        <span>Total Madu Siap Panen Hari Ini</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                        {honeyLiters} Liter Madu
                      </div>
                      <div className="text-[10px] text-slate-300 mt-1 font-mono">
                        ≈ Rp {Math.round(honeyLiters * 35000).toLocaleString('id-ID')} Saldo Nilai Tunai
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tingkat Retensi Mitra:</span>
                        <span className="text-emerald-400 font-mono font-bold">98.4% (Anti-Churn Active)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bonus Nectar Mingguan:</span>
                        <span className="text-cyan-400 font-mono font-bold">+Rp 1.450.000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Action: Claim Honey Harvest */}
                <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-400 text-center sm:text-left">
                    {harvestToast ? (
                      <span className="text-amber-400 font-bold">{harvestToast}</span>
                    ) : (
                      'Klaim panen madu harian Anda untuk mengisi saldo kas dompet.'
                    )}
                  </div>
                  <button
                    onClick={handleHarvestHoney}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1.5 shadow-lg shadow-amber-950/40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>🍯 Panen Madu Hari Ini (+2.5 Liter Royalty)</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* QUICK TAB PILLS: Jump to any slide directly                             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="px-3 sm:px-4 py-3 bg-[#080d17]/95 border-t border-white/10 flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
          {slides.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentSlide === idx;
            return (
              <button
                key={s.id}
                onClick={() => handleJumpToSlide(idx)}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs transition active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">{s.tabTitle}</span>
                <span className="sm:hidden text-[10px] font-bold">0{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
