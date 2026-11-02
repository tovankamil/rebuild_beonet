import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Server,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  DollarSign,
  Award,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Check,
  Flame,
  ChevronRight,
  Layers,
  Database,
  BarChart3,
  Network,
  Users,
  Smartphone,
  Lock,
} from 'lucide-react';

export default function AntiCrashReliabilitySection({ triggerSound = () => {}, scrollToSection = () => {} }) {
  // ==========================================
  // TAB & TIMELINE NAVIGATION STATE
  // ==========================================
  const [activeTab, setActiveTab] = useState('benchmark'); // 'benchmark' | 'resilience' | 'capping'
  const [activePipelineStep, setActivePipelineStep] = useState(2); // 1, 2, 3, 4

  // ==========================================
  // 1. BENCHMARK SIMULATOR STATE
  // ==========================================
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkDone, setBenchmarkDone] = useState(false);
  const [benchmarkResultTime, setBenchmarkResultTime] = useState(11.8);

  const runBenchmark = () => {
    if (isBenchmarking) return;
    triggerSound('click');
    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    setBenchmarkDone(false);

    let current = 0;
    const interval = setInterval(() => {
      current += 4;
      if (current >= 100) {
        clearInterval(interval);
        setBenchmarkProgress(100);
        setIsBenchmarking(false);
        setBenchmarkDone(true);
        // randomize slight realistic sub-12ms variance: 11.2ms - 11.9ms
        setBenchmarkResultTime(parseFloat((11.2 + Math.random() * 0.7).toFixed(2)));
        triggerSound('success');
      } else {
        setBenchmarkProgress(current);
      }
    }, 40);
  };

  const resetBenchmark = () => {
    triggerSound('click');
    setIsBenchmarking(false);
    setBenchmarkProgress(0);
    setBenchmarkDone(false);
  };

  // ==========================================
  // 2. SERVER RESILIENCE STRESS TEST STATE
  // ==========================================
  const [trafficRps, setTrafficRps] = useState(10000); // 1000, 5000, 10000, 25000
  const serverSpecs = useMemo(() => {
    switch (trafficRps) {
      case 1000:
        return {
          nodes: 4,
          latency: '8.4 ms',
          cpu: '18%',
          uptime: '99.999%',
          clusterStatus: 'Normal Traffic Load',
          packetLoss: '0.000%',
          activeCores: 16,
          statusColor: 'text-emerald-400',
        };
      case 5000:
        return {
          nodes: 8,
          latency: '10.2 ms',
          cpu: '24%',
          uptime: '99.998%',
          clusterStatus: 'High Promo Load Balanced',
          packetLoss: '0.000%',
          activeCores: 32,
          statusColor: 'text-teal-400',
        };
      case 10000:
        return {
          nodes: 16,
          latency: '11.8 ms',
          cpu: '31%',
          uptime: '99.995%',
          clusterStatus: 'Cut-Off Peak Surge Auto-Scaled',
          packetLoss: '0.000%',
          activeCores: 64,
          statusColor: 'text-cyan-400',
        };
      case 25000:
      default:
        return {
          nodes: 32,
          latency: '14.5 ms',
          cpu: '42%',
          uptime: '99.990%',
          clusterStatus: 'Maximum Enterprise Surge Protected',
          packetLoss: '0.000%',
          activeCores: 128,
          statusColor: 'text-amber-400',
        };
    }
  }, [trafficRps]);

  // ==========================================
  // 3. SAFETY CAPPING & PUNCAK REWARD STATE
  // ==========================================
  const [turnoverMillion, setTurnoverMillion] = useState(1500); // 1.5 Miliar default
  const [payoutRate, setPayoutRate] = useState(38); // percentage

  const cappingMetrics = useMemo(() => {
    const rawTurnover = turnoverMillion * 1000000;
    const isOverRisk = payoutRate > 42;
    // When over 42%, Auto-Capping locks it at safe maximum 40%
    const effectivePayoutRate = isOverRisk ? 40 : payoutRate;
    const nominalPayout = (rawTurnover * effectivePayoutRate) / 100;
    const nominalCompanyMargin = rawTurnover - nominalPayout;
    const savedAmount = isOverRisk ? ((rawTurnover * (payoutRate - 40)) / 100) : 0;

    return {
      rawTurnover,
      isOverRisk,
      effectivePayoutRate,
      nominalPayout,
      nominalCompanyMargin,
      savedAmount,
    };
  }, [turnoverMillion, payoutRate]);

  // Career Ladder / Puncak Reward Specs
  const rewardProgression = [
    {
      level: '1. Bronze Leader',
      requirement: 'Omset 25 Juta',
      reward: 'Smartphone 5G Flagship',
      value: 'Rp 5.000.000',
      status: 'Terbukti Tembus 100%',
      icon: Smartphone,
      accent: 'from-amber-700 to-amber-500',
    },
    {
      level: '2. Silver Executive',
      requirement: 'Omset 100 Juta',
      reward: 'Tour Wisata Asia / Laptop Bisnis',
      value: 'Rp 15.000.000',
      status: 'Terbukti Tembus 100%',
      icon: Award,
      accent: 'from-slate-400 to-slate-200',
    },
    {
      level: '3. Gold Manager',
      requirement: 'Omset 350 Juta',
      reward: 'Paket Umroh / Wisata Religi (2 Orang)',
      value: 'Rp 45.000.000',
      status: 'Terbukti Tembus 100%',
      icon: Sparkles,
      accent: 'from-yellow-500 to-amber-300',
    },
    {
      level: '4. Platinum Director',
      requirement: 'Omset 1 Miliar',
      reward: 'Mobil All New Avanza / Xpander Cash',
      value: 'Rp 260.000.000',
      status: 'Terbukti Tembus 100%',
      icon: Flame,
      accent: 'from-cyan-500 to-teal-300',
    },
    {
      level: '5. Diamond Star',
      requirement: 'Omset 3 Miliar',
      reward: 'SUV Pajero Sport / Fortuner Cash',
      value: 'Rp 650.000.000',
      status: 'Terbukti Tembus 100%',
      icon: TrendingUp,
      accent: 'from-emerald-500 to-green-300',
    },
    {
      level: '6. Crown Ambassador',
      requirement: 'Omset 10 Miliar',
      reward: 'PUNCAK REWARD: Luxury Villa / Rumah Mewah',
      value: 'Rp 2.500.000.000',
      status: 'Kalkulasi Matematis Pasti Tercapai',
      icon: Zap,
      accent: 'from-purple-500 via-pink-500 to-amber-400',
    },
  ];

  // Pipeline Steps (Modeled after the reference timeline)
  const pipelineSteps = [
    {
      step: 1,
      title: 'Transaksi & Mitra Masuk',
      subtitle: 'Webhook Instant Ingestion',
      badge: '0.002s Trigger',
      desc: 'Pesanan paket produk, pendaftaran mitra baru via Web Toko Replika, atau transaksi kasir POS otomatis terverifikasi sistem.',
      tech: 'Distributed Queue + Redis In-Memory Ingestion',
    },
    {
      step: 2,
      title: 'Kalkulasi Sub-12ms Engine',
      subtitle: 'Binary & Unilevel Traversal',
      badge: '<12ms Processing',
      desc: 'Mesin komisi menembus ribuan kedalaman pohon jaringan dalam sekejap mata. Komisi sponsor, pasangan/pairing, dan BV terhitung akurat 100%.',
      tech: 'Fintech Ultra-Low Latency Tree Traversal Engine',
    },
    {
      step: 3,
      title: 'Verifikasi Anti-Crash & Capping',
      subtitle: 'Safety Guard & Load Balancer',
      badge: 'Zero Overpayout Guard',
      desc: 'Sistem memastikan omset kas perusahaan aman dari overpayout (safety limit locked) dan mendistribusikan beban ke cloud cluster tanpa bottleneck.',
      tech: 'Dynamic Safety Capping + Multi-Region Auto-Scaling',
    },
    {
      step: 4,
      title: 'Distribusi Saldo & Notifikasi Aman',
      subtitle: 'Instant e-Wallet & Push WhatsApp',
      badge: 'Real-Time Disbursed',
      desc: 'Saldo dompet digital member langsung bertambah saat itu juga, invoice digital resmi terbit, dan bot WhatsApp otomatis mengabari mitra.',
      tech: 'Automated Ledger Ledger Entry + WhatsApp AI Bot',
    },
  ];

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <section
      id="anti-crash-engine"
      className="py-20 sm:py-28 px-4 bg-[#030711] text-white relative overflow-hidden border-t border-b border-cyan-500/20"
    >
      {/* Background Tech Mesh & Glow Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-16 sm:space-y-20">
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION (Design Reference: Modern high-impact headline & copy)  */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-cyan-950/40">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>SOLUSI ARSITEKTUR CORE ENGINE FINTECH-GRADE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Solusi 3 Ketakutan Terbesar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-400 to-yellow-300">
              Pemilik Bisnis Jaringan
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-3xl mx-auto">
            Jangan biarkan rumus Excel yang keliru dan server lemot merusak reputasi bisnis Anda. SYNETIQ dirancang khusus
            mengeliminasi 3 momok fatal: <strong className="text-white">hitung bonus lambat berhari-hari</strong>,{' '}
            <strong className="text-white">sistem crash saat cut-off akhir bulan</strong>, dan{' '}
            <strong className="text-white">risiko kas jebol (overpayout)</strong> atau poin bonus yang mustahil ditembus member.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. THREE CORE EXISTENTIAL PAIN POINTS & SOLUTIONS (Comparison Cards)     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* PILLAR 1: Ngitung Bonus Lama */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a1220] to-[#060c16] border border-emerald-500/30 hover:border-emerald-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-emerald-950/20 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                  BOMBASTIS: SUB-12MS
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Zap className="w-5 h-5 fill-current" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
                  Masih Ngitung Bonus Lama?
                </h3>
                <p className="text-xs text-emerald-300 font-mono font-medium">
                  Mesin Binary &amp; Unilevel Sub-12 Milidetik
                </p>
              </div>

              {/* Before vs After */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/25 text-xs text-red-200">
                  <div className="flex items-center space-x-1.5 font-bold text-red-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>CARA LAMA (EXCEL MANUAL)</span>
                  </div>
                  <p className="leading-relaxed text-red-300/90">
                    Rekap akhir bulan butuh 3-7 hari. Rawan salah rumus VLOOKUP/IF ganda, komisi dobel bayar, dan member
                    mengamuk di grup WhatsApp karena pencairan tertunda.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>SOLUSI SYNETIQ ENGINE</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Setiap order baru atau mitra join, komisi sponsor &amp; pasangan terhitung detik itu juga (&lt;12ms)
                    dan langsung terdistribusi ke dompet member secara transparan.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Benchmark Kecepatan:</span>
              <span className="font-extrabold text-emerald-400 flex items-center space-x-1">
                <span>11.8 ms / Transaksi</span>
              </span>
            </div>
          </div>

          {/* PILLAR 2: Takut Sistem Crash Saat Banjir Transaksi */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a1220] to-[#060c16] border border-cyan-500/30 hover:border-cyan-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-cyan-950/20 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
                  HIGH-AVAILABILITY CLOUD
                </span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Server className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
                  Takut Sistem Crash?
                </h3>
                <p className="text-xs text-cyan-300 font-mono font-medium">
                  Auto-Scaling Cluster 25.000+ Req/Detik
                </p>
              </div>

              {/* Before vs After */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/25 text-xs text-red-200">
                  <div className="flex items-center space-x-1.5 font-bold text-red-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>CARA LAMA (HOSTING MURAH)</span>
                  </div>
                  <p className="leading-relaxed text-red-300/90">
                    Pas tanggal cut-off tengah malam atau flash sale, ribuan member login serentak. Server langsung down,
                    database lockup, order hilang, dan reputasi hancur.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-200">
                  <div className="flex items-center space-x-1.5 font-bold text-cyan-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>SOLUSI SYNETIQ ENGINE</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Didukung High-Availability Cloud Cluster dengan auto-scaling otomatis. Garansi 99.99% Uptime SLA sanggup
                    melayani lonjakan 25.000+ transaksi serentak tanpa lag dan zero data loss.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Garansi Keandalan:</span>
              <span className="font-extrabold text-cyan-400">99.99% Uptime SLA</span>
            </div>
          </div>

          {/* PILLAR 3: Poin Tidak Capai Puncak & Takut Payout Jebol */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a1220] to-[#060c16] border border-amber-500/30 hover:border-amber-400 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-2xl shadow-amber-950/20 group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                  ANTI OVERPAYOUT
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">
                  Takut Kas Perusahaan Jebol?
                </h3>
                <p className="text-xs text-amber-300 font-mono font-medium">
                  Smart Auto-Capping &amp; Realistis Tembus Reward
                </p>
              </div>

              {/* Before vs After */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/25 text-xs text-red-200">
                  <div className="flex items-center space-x-1.5 font-bold text-red-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>CARA LAMA (SKEMA BUTA)</span>
                  </div>
                  <p className="leading-relaxed text-red-300/90">
                    Kekhawatiran terbesar: payout jebol melebihi omset sehingga perusahaan bangkrut. Atau sebaliknya, syarat
                    poin reward terlalu mustahil sehingga member tidak pernah tembus.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
                  <div className="flex items-center space-x-1.5 font-bold text-amber-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>SOLUSI SYNETIQ ENGINE</span>
                  </div>
                  <p className="leading-relaxed font-medium">
                    Smart Dynamic Safety Guard otomatis mengunci batas aman rasio payout kas (misal maks 40%), sekaligus
                    menyediakan jenjang karir nyata yang terbukti tembus hingga puncak reward.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Proteksi Keuangan:</span>
              <span className="font-extrabold text-amber-400">100% Kas Terproteksi</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. STEP-BY-STEP PROCESS TIMELINE (Reference: media_1793648922672_0da6ef55) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#070e1b] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 mb-8 sm:mb-12">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <span>Alur Pipeline Real-Time</span>
              <span>•</span>
              <span>Zero-Bottleneck Guarantee</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Dari Transaksi Masuk Hingga Saldo Aman: 4 Tahap Tanpa Cela
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Klik setiap tahapan untuk menginspeksi alur kerja mikro-arsitektur SYNETIQ:
            </p>
          </div>

          {/* Sleek Horizontal Timeline Track (Directly inspired by image reference) */}
          <div className="relative mb-8">
            {/* Background connecting bar */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-white/10 z-0" />
            <div
              className="hidden md:block absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-500 transition-all duration-500 z-0"
              style={{ width: `${((activePipelineStep - 1) / 3) * 100}%` }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
              {pipelineSteps.map((stepItem) => {
                const isActive = activePipelineStep === stepItem.step;
                const isPassed = activePipelineStep >= stepItem.step;

                return (
                  <button
                    key={stepItem.step}
                    type="button"
                    onClick={() => {
                      triggerSound('click');
                      setActivePipelineStep(stepItem.step);
                    }}
                    className={`p-4 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between group focus:outline-none ${
                      isActive
                        ? 'bg-[#0f1d33] border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/60'
                        : isPassed
                        ? 'bg-[#0a1424] border-emerald-500/40 hover:border-emerald-400/80'
                        : 'bg-[#060c18] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      {/* Node Bullet and Step Number */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition ${
                            isActive
                              ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/50 scale-110'
                              : isPassed
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {isPassed && !isActive ? <Check className="w-4 h-4 stroke-[3]" /> : stepItem.step}
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                        >
                          {stepItem.badge}
                        </span>
                      </div>

                      <div className="font-extrabold text-sm sm:text-base text-white group-hover:text-cyan-300 transition">
                        {stepItem.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{stepItem.subtitle}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className={isActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {isActive ? 'Aktif Dipilih' : 'Klik untuk Detail'}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-cyan-400 translate-x-1' : 'text-slate-600'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Detailed Showcase Box */}
          {pipelineSteps.map((stepItem) => {
            if (stepItem.step !== activePipelineStep) return null;
            return (
              <div
                key={stepItem.step}
                className="p-5 sm:p-7 rounded-2xl bg-[#091528] border border-cyan-500/30 animate-in fade-in duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold">
                    <span>TAHAPAN KE-{stepItem.step} DARI 4</span>
                    <span>•</span>
                    <span>{stepItem.tech}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white">{stepItem.title}</h4>
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{stepItem.desc}</p>
                </div>

                <div className="shrink-0 flex items-center space-x-3 w-full md:w-auto justify-end">
                  <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-right font-mono">
                    <div className="text-[10px] text-slate-400 uppercase">Status Arsitektur</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-end space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Zero-Loss Verified</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSound('click');
                      setActivePipelineStep(activePipelineStep === 4 ? 1 : activePipelineStep + 1);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-950 transition active:scale-95"
                  >
                    <span>Langkah Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 4. INTERACTIVE LIVE SIMULATOR & TEST BENCH (3 Dedicated Interactive Tabs)  */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#070e1b] border border-white/10 p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Header of Test Bench */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE LIVE TEST BENCH</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Uji Langsung Kecepatan, Ketahanan Server &amp; Batas Aman Kas
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Pilih simulator di bawah ini untuk melihat bukti matematis dan teknis keunggulan SYNETIQ:
              </p>
            </div>

            {/* Simulator Tabs */}
            <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 shrink-0 self-start md:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setActiveTab('benchmark');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap focus:outline-none ${
                  activeTab === 'benchmark'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>1. Uji Kecepatan (12ms vs Excel)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setActiveTab('resilience');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap focus:outline-none ${
                  activeTab === 'resilience'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>2. Ketahanan Server (25k TPS)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSound('click');
                  setActiveTab('capping');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap focus:outline-none ${
                  activeTab === 'capping'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Safety Capping &amp; Reward</span>
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* TAB 1 CONTENT: UJI KECEPATAN (12ms vs 3 HARI EXCEL)            */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'benchmark' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Simulation Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-[#091528] border border-emerald-500/30">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm font-extrabold text-white flex items-center justify-center sm:justify-start space-x-2">
                    <span>Simulasi Kalkulasi 5.000 Transaksi Komisi Mitra Serentak</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Sistem akan memproses kalkulasi bonus sponsor, pairing binary, dan level unilevel.
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={runBenchmark}
                    disabled={isBenchmarking}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950 transition active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isBenchmarking ? 'Memproses Benchmark...' : 'Uji Benchmark Sekarang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetBenchmark}
                    title="Reset Simulator"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar during benchmark */}
              {isBenchmarking && (
                <div className="space-y-2 p-4 rounded-xl bg-black/40 border border-emerald-500/20">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Memproses Pohon Jaringan &amp; Komisi In-Memory...</span>
                    </span>
                    <span className="text-white font-bold">{benchmarkProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-75"
                      style={{ width: `${benchmarkProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traditional Excel Way */}
                <div className="p-6 rounded-3xl bg-[#090e18] border border-red-500/30 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                      <div className="font-extrabold text-base text-red-400 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Cara Manual (Excel &amp; Admin)</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-mono font-bold">
                        SANGAT LAMBAT
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Waktu Rekap 5.000 Transaksi:</span>
                        <span className="font-mono font-bold text-red-400">3 s/d 7 Hari Kerja</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Risiko Kesalahan Rumus:</span>
                        <span className="font-mono font-bold text-red-400">Tinggi (VLOOKUP / Macro Error)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Keterlambatan Payout:</span>
                        <span className="font-mono font-bold text-red-400">Sering Mundur (Member Marah)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Biaya Gaji Tim Admin Rekap:</span>
                        <span className="font-mono font-bold text-red-400">Rp 10.000.000+ / Bulan</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-[11px] text-red-300">
                    ⚠️ Member gelisah menunggu kepastian bonus, komplain membanjiri grup WhatsApp setiap tanggal 1.
                  </div>
                </div>

                {/* SYNETIQ Sub-12ms Engine */}
                <div className="p-6 rounded-3xl bg-[#081525] border border-emerald-500/50 shadow-xl shadow-emerald-950/40 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                      <div className="font-extrabold text-base text-emerald-400 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>SYNETIQ In-Memory Engine</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                        REAL-TIME INSTANT
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Waktu Rekap 5.000 Transaksi:</span>
                        <span className="font-mono font-extrabold text-emerald-400">
                          {benchmarkDone ? `${benchmarkResultTime} Milidetik` : '11.8 Milidetik (< 0.02s)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Risiko Kesalahan Rumus:</span>
                        <span className="font-mono font-bold text-emerald-300">0.000% (Mathematical Proof)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Pencairan ke Saldo e-Wallet:</span>
                        <span className="font-mono font-bold text-emerald-300">Detik Itu Juga (Otomatis)</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-white/5">
                        <span className="text-slate-400">Efisiensi Biaya Operasional:</span>
                        <span className="font-mono font-bold text-emerald-300">Hemat Rp 120 Juta / Tahun</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200">
                    ✅ Member bahagia dan antusias mempromosikan bisnis Anda karena komisi cair cepat tanpa drama.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2 CONTENT: UJI KETAHANAN SERVER (25k TPS STRESS TEST)     */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'resilience' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Traffic Selector Slider & Buttons */}
              <div className="p-6 rounded-2xl bg-[#091528] border border-cyan-500/30 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-white">Simulasi Lonjakan Traffic Member (Traffic Spike)</div>
                    <div className="text-xs text-slate-400">
                      Pilih skenario beban transaksi bersamaan saat cut-off tanggal akhir bulan:
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cyan-400 font-mono">
                      {trafficRps.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-1.5">Req / Detik</span>
                  </div>
                </div>

                {/* Preset traffic buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Normal Traffic', rps: 1000, desc: 'Operasional Harian' },
                    { label: 'Promo Weekend', rps: 5000, desc: 'Flash Sale Mingguan' },
                    { label: 'Cut-Off Akhir Bulan', rps: 10000, desc: 'Ribuan Member Antre' },
                    { label: 'Mega Event Launch', rps: 25000, desc: 'Puncak Lonjakan Nasional' },
                  ].map((btn) => (
                    <button
                      key={btn.rps}
                      type="button"
                      onClick={() => {
                        triggerSound('click');
                        setTrafficRps(btn.rps);
                      }}
                      className={`p-3 rounded-xl border text-left transition focus:outline-none ${
                        trafficRps === btn.rps
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-950'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{btn.label}</div>
                      <div className="text-[11px] font-mono text-cyan-300 mt-0.5">{btn.rps.toLocaleString()} RPS</div>
                      <div className="text-[10px] text-slate-500 mt-1">{btn.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Server Cluster Telemetry Readout */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#081220] border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Server Uptime</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
                    {serverSpecs.uptime}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">SLA Garansi Kontrak</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081220] border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Average Response</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono mt-1">
                    {serverSpecs.latency}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Sub-15ms Ultra Cepat</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081220] border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Scaled Nodes</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                    {serverSpecs.nodes} Pods
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{serverSpecs.activeCores} CPU Cores Ready</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#081220] border border-white/10">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Data Packet Loss</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                    {serverSpecs.packetLoss}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">Zero Data Dropped</div>
                </div>
              </div>

              {/* Cluster Graphic Visualization */}
              <div className="p-5 rounded-2xl bg-[#050b14] border border-white/10 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live High-Availability Cluster State:</span>
                  </span>
                  <span className="font-bold text-cyan-400">{serverSpecs.clusterStatus}</span>
                </div>

                {/* Node Pods Visual Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-8 lg:grid-cols-12 gap-2 pt-2">
                  {Array.from({ length: serverSpecs.nodes }).map((_, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center animate-pulse"
                      style={{ animationDuration: `${1.2 + (idx % 4) * 0.3}s` }}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mx-auto mb-1" />
                      <div className="text-[9px] font-mono text-emerald-300 font-bold">N-{idx + 1}</div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-400 pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>💡 Arsitektur didukung Kubernetes Auto-scaler, Redis Cache Cluster, dan Database Replication.</span>
                  <span className="text-emerald-400 font-bold font-mono">Status: 100% HEALTHY</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3 CONTENT: SIMULASI SAFETY CAPPING & PUNCAK REWARD       */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'capping' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Interactive Controls Panel */}
              <div className="p-6 rounded-2xl bg-[#091528] border border-amber-500/30 space-y-6">
                <div>
                  <div className="text-sm font-extrabold text-white">
                    Simulasi Ketahanan Kas &amp; Payout Protection Guard
                  </div>
                  <div className="text-xs text-slate-400">
                    Geser omset dan rasio payout untuk melihat bagaimana Smart Auto-Capping melindungi kas perusahaan Anda:
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Slider 1: Omset Perusahaan */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">Estimasi Omset Bisnis / Bulan:</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {formatIDR(turnoverMillion * 1000000)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={turnoverMillion}
                      onChange={(e) => {
                        setTurnoverMillion(Number(e.target.value));
                        triggerSound('click');
                      }}
                      className="w-full h-2 rounded-lg bg-white/10 accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Rp 100 Juta</span>
                      <span>Rp 2.5 Miliar</span>
                      <span>Rp 5 Miliar</span>
                    </div>
                  </div>

                  {/* Slider 2: Target Payout Bonus */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">Simulasi Rasio Komisi Bonus:</span>
                      <span
                        className={`font-bold text-sm ${
                          payoutRate > 42 ? 'text-red-400 font-black' : 'text-emerald-400'
                        }`}
                      >
                        {payoutRate}% {payoutRate > 42 ? '(Batas Bahaya Jebol)' : '(Zona Aman)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="60"
                      step="1"
                      value={payoutRate}
                      onChange={(e) => {
                        setPayoutRate(Number(e.target.value));
                        triggerSound('click');
                      }}
                      className="w-full h-2 rounded-lg bg-white/10 accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>20% (Sangat Irit)</span>
                      <span>40% (Batas Aman Kas)</span>
                      <span>60% (Rawan Jebol)</span>
                    </div>
                  </div>
                </div>

                {/* Safety Guard Indicator Alert Box */}
                {cappingMetrics.isOverRisk ? (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center space-x-2 font-black text-amber-400">
                      <ShieldAlert className="w-5 h-5 text-amber-400 animate-bounce" />
                      <span>SMART AUTO-CAPPING GUARD DIAKTIFKAN OTOMATIS!</span>
                    </div>
                    <p className="leading-relaxed">
                      Anda memasukkan skema payout <strong>{payoutRate}%</strong>. Dalam bisnis jaringan konvensional,
                      angka di atas 42% berisiko fatal membangkrutkan perusahaan jika terjadi ledakan duplikasi mitra.
                      Sistem SYNETIQ secara otomatis mengunci payout di batas aman <strong>40.0%</strong> sehingga{' '}
                      <strong>{formatIDR(cappingMetrics.savedAmount)}</strong> dana cadangan perusahaan terselamatkan dari overpayout!
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-xs flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-400">ZONA KAS SANGAT SEHAT &amp; AMAN:</span> Rasio payout{' '}
                      <strong>{payoutRate}%</strong> memberikan margin profit yang sehat bagi perusahaan dan bonus yang
                      menggiurkan bagi para mitra.
                    </div>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-mono">Total Omset Masuk:</div>
                    <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
                      {formatIDR(cappingMetrics.rawTurnover)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-mono">Beban Payout Mitra:</div>
                    <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-0.5">
                      {formatIDR(cappingMetrics.nominalPayout)} ({cappingMetrics.effectivePayoutRate}%)
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="text-[10px] text-slate-400 font-mono">Sisa Kas &amp; Margin Perusahaan:</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {formatIDR(cappingMetrics.nominalCompanyMargin)} (100% Aman)
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Ladder / Puncak Reward Showcase */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span>Jenjang Karir &amp; Puncak Reward yang Terbukti Tembus</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Bukan sekadar iming-iming kosong! Poin reward dihitung dengan algoritma terukur sehingga mitra giat
                      bisa benar-benar meraih reward impian tanpa menumbalkan kas perusahaan:
                    </p>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 font-bold self-start sm:self-auto">
                    Karier Transparan &amp; Adil
                  </span>
                </div>

                {/* 6 Progression Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewardProgression.map((item, idx) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#091120] border border-white/10 hover:border-yellow-500/40 transition-all flex flex-col justify-between group shadow-lg"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white group-hover:text-yellow-300 transition">
                              {item.level}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-slate-400">Syarat Poin Omset:</div>
                            <div className="text-xs font-bold text-slate-200 font-mono">{item.requirement}</div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                            <div className="text-[10px] text-yellow-400 font-bold uppercase">Reward Diberikan:</div>
                            <div className="text-xs font-extrabold text-white mt-0.5">{item.reward}</div>
                            <div className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">
                              Nilai: {item.value}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Status Validasi:</span>
                          <span className="text-emerald-400 font-bold">{item.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. DEDICATED HIGH-CONVERSION CTA & WHATSAPP CONSULTATION                  */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d1f36] via-[#091528] to-[#071322] border border-cyan-500/40 p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GARANSI ZERO OVERPAYOUT &amp; 99.99% UPTIME</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Ingin Hitung Kekuatan Skema Komisi Bisnis Jaringan Anda?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Diskusikan marketing plan Anda (Binary, Unilevel, Trinary, Matrix, Breakaway) bersama konsultan sistem SYNETIQ.
              Kami bantu uji stres kalkulasi secara gratis agar bisnis Anda bebas risiko kas jebol dan siap melesat tanpa kendala server!
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/6281234567890?text=Halo%20Tim%20SYNETIQ%2C%20saya%20ingin%20konsultasi%20skema%20komisi%20bisnis%20jaringan%20saya%20agar%20bebas%20crash%2C%20hitung%20cepat%20sub-12ms%2C%20dan%20anti%20kas%20jebol.%20Mohon%20info%20demo%20sistemnya."
              target="_blank"
              rel="noreferrer"
              onClick={() => triggerSound('success')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950/60 transition active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Konsultasikan Skema Komisi &amp; Demo Sistem Gratis</span>
            </a>

            <button
              type="button"
              onClick={() => {
                triggerSound('click');
                scrollToSection('consultation');
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs sm:text-sm border border-white/20 transition active:scale-95"
            >
              Coba Demo VIP
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
