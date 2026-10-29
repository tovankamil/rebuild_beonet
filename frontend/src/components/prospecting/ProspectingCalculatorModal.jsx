import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  Calculator,
  TrendingUp,
  Award,
  Users,
  Wallet,
  Zap,
  Printer,
  Share2,
  X,
  ChevronRight,
  Shield,
  Sparkles,
  CheckCircle2,
  Info,
  Gift,
  ArrowRight,
  Target,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';
import { QrCodeSvg } from '../../utils/qrCodeGenerator';

export default function ProspectingCalculatorModal({
  isOpen,
  onClose,
  currentUser,
}) {
  // State sliders & configurations
  const [selectedPackage, setSelectedPackage] = useState('silver'); // 'silver' | 'gold' | 'platinum'
  const [duplication, setDuplication] = useState(2); // 2, 3, 4
  const [months, setMonths] = useState(6); // 3, 6, 12
  const [activeChartPoint, setActiveChartPoint] = useState(null);
  const [prospectName, setProspectName] = useState('');

  // Packages configuration
  const packages = {
    silver: {
      name: 'Silver',
      hu: 1,
      price: 250000,
      pv: 1,
      sponsorBonus: 50000,
      pairingLimitPerDay: 20, // max 20 pasang per hari = Rp 500rb/hari
      color: 'from-slate-600 to-slate-800',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    gold: {
      name: 'Gold',
      hu: 3,
      price: 750000,
      pv: 3,
      sponsorBonus: 150000,
      pairingLimitPerDay: 60, // max 60 pasang per hari = Rp 1.5jt/hari
      color: 'from-amber-500 to-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    platinum: {
      name: 'Platinum',
      hu: 7,
      price: 1750000,
      pv: 7,
      sponsorBonus: 350000,
      pairingLimitPerDay: 200, // max 200 pasang per hari = Rp 5jt/hari
      color: 'from-emerald-600 to-teal-800',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
  };

  const currentPkg = packages[selectedPackage];

  // Dynamic binary calculations
  const calculations = useMemo(() => {
    const monthlyData = [];
    let cumulativeMembers = 0;
    let cumulativeSponsor = 0;
    let cumulativePairing = 0;
    let cumulativePV = 0;

    // Cycle by cycle calculation
    for (let m = 1; m <= months; m++) {
      // New members recruited in this cycle = duplication^m
      const newMembersInCycle = Math.pow(duplication, m);
      cumulativeMembers += newMembersInCycle;

      // In Cycle 1, user sponsors directly (sponsor bonus)
      if (m === 1) {
        cumulativeSponsor = duplication * currentPkg.sponsorBonus;
      }

      // Total HU distributed evenly in binary 1:1
      const totalHuAccum = cumulativeMembers * currentPkg.hu;
      const leftHu = Math.floor(totalHuAccum / 2);
      const rightHu = Math.ceil(totalHuAccum / 2);
      const pairedHu = Math.min(leftHu, rightHu);

      // Pairing bonus: Rp 25.000 per pasang
      // We also respect flush out cap per 30 days
      const maxMonthlyPairs = currentPkg.pairingLimitPerDay * 30;
      const effectivePairs = Math.min(pairedHu, maxMonthlyPairs * (m / 2));
      const pairingTotal = Math.round(effectivePairs * 25000);

      cumulativePairing = pairingTotal;
      cumulativePV = cumulativeMembers * currentPkg.pv;

      monthlyData.push({
        month: m,
        newMembers: newMembersInCycle,
        totalMembers: cumulativeMembers,
        leftHu,
        rightHu,
        pairs: pairedHu,
        incomeTotal: cumulativeSponsor + cumulativePairing,
        pairingBonus: cumulativePairing,
        sponsorBonus: cumulativeSponsor,
      });
    }

    const last = monthlyData[monthlyData.length - 1];
    const totalMembers = last ? last.totalMembers : 0;
    const leftMembers = Math.floor(totalMembers / 2);
    const rightMembers = Math.ceil(totalMembers / 2);
    const totalSponsor = last ? last.sponsorBonus : 0;
    const totalPairing = last ? last.pairingBonus : 0;
    const totalIncome = totalSponsor + totalPairing;
    const totalPV = totalMembers * currentPkg.pv;

    // Reward Tiers:
    const rewardTiers = [
      {
        threshold: 50,
        badge: 'Bronze Leader',
        reward: 'Smartwatch Sport & Tour Wisata Lokal',
        icon: Gift,
        color: 'text-amber-700 bg-amber-50 border-amber-200',
      },
      {
        threshold: 250,
        badge: 'Silver Director',
        reward: 'Tiket Wisata Halal Asia / Paket Umroh',
        icon: Award,
        color: 'text-sky-700 bg-sky-50 border-sky-200',
      },
      {
        threshold: 750,
        badge: 'Gold Executive',
        reward: 'Sepeda Motor Yamaha NMAX Baru OTR',
        icon: Sparkles,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      },
      {
        threshold: 2500,
        badge: 'Diamond Crown',
        reward: 'Mobil Honda All New HR-V / Brio',
        icon: Target,
        color: 'text-purple-700 bg-purple-50 border-purple-200',
      },
      {
        threshold: 10000,
        badge: 'Royal Crown Ambassador',
        reward: 'Mobil Mewah Pajero Sport & Rumah Impian Rp 1 Miliar',
        icon: Award,
        color: 'text-rose-700 bg-rose-50 border-rose-200',
      },
    ];

    const achievedTier = [...rewardTiers].reverse().find((t) => totalPV >= t.threshold) || null;
    const nextTier = rewardTiers.find((t) => totalPV < t.threshold) || rewardTiers[rewardTiers.length - 1];
    const prevThreshold = achievedTier ? achievedTier.threshold : 0;
    const progressToNext = nextTier && nextTier !== achievedTier
      ? Math.min(100, Math.round(((totalPV - prevThreshold) / (nextTier.threshold - prevThreshold)) * 100))
      : 100;

    return {
      monthlyData,
      totalMembers,
      leftMembers,
      rightMembers,
      totalSponsor,
      totalPairing,
      totalIncome,
      totalPV,
      achievedTier,
      nextTier,
      progressToNext,
    };
  }, [selectedPackage, duplication, months, currentPkg]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handlePrintBrochure = () => {
    playCoinChime();
    window.print();
  };

  const handleShareWhatsApp = () => {
    playCoinChime();
    const refCode = currentUser?.username || 'mitra';
    const regUrl = `${window.location.origin}/register?ref=${refCode}`;
    const greeting = prospectName ? `Halo Kak *${prospectName}*, salam kenal!` : `Halo Sahabat Mitra Bionet,`;

    const message = 
`${greeting}

Berikut adalah *Simulasi Potensi Income Kemitraan Herbal Bionet*:

*1. Pilihan Paket Kemitraan:*
- Paket: *${currentPkg.name.toUpperCase()}* (${currentPkg.hu} Hak Usaha)
- Modal Registrasi: *${formatRupiah(currentPkg.price)}*

*2. Proyeksi Pertumbuhan Jaringan:*
- Pola Duplikasi: *${duplication} Mitra Baru / Siklus*
- Periode Proyeksi: *${months} Bulan*
- Estimasi Total Jaringan: *${calculations.totalMembers.toLocaleString('id-ID')} Mitra* (${calculations.leftMembers.toLocaleString('id-ID')} Kiri : ${calculations.rightMembers.toLocaleString('id-ID')} Kanan)

*3. Estimasi Potensi Penghasilan:*
- Potensi Bonus Sponsor: *${formatRupiah(calculations.totalSponsor)}*
- Potensi Bonus Pasangan: *${formatRupiah(calculations.totalPairing)}*
- *TOTAL POTENSI INCOME: ${formatRupiah(calculations.totalIncome)}*

*4. Total Poin Reward:*
- Poin Volume: *${calculations.totalPV.toLocaleString('id-ID')} PV*
- Lencana Tercapai: *${calculations.achievedTier ? calculations.achievedTier.badge : 'Bronze Aspirant'}*
${calculations.achievedTier ? `- Hadiah: *${calculations.achievedTier.reward}*` : ''}

Gabung bersama kami & raih kebebasan finansial melalui industri kesehatan herbal terpercaya berizin BPOM RI!
Daftar kemitraan resmi melalui tautan ini:
${regUrl}

_Dibuat via Bionet Prospecting Engine_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  // SVG Chart Dimensions & Path Generation
  const chartWidth = 520;
  const chartHeight = 160;
  const padding = 24;
  const chartData = calculations.monthlyData;
  const maxIncome = Math.max(...chartData.map((d) => d.incomeTotal), 1000000);

  const getX = (idx) => padding + (idx / Math.max(chartData.length - 1, 1)) * (chartWidth - padding * 2);
  const getY = (val) => chartHeight - padding - (val / maxIncome) * (chartHeight - padding * 2);

  const points = chartData.map((d, i) => `${getX(i)},${getY(d.incomeTotal)}`).join(' ');
  const areaPath = `M ${getX(0)},${chartHeight - padding} L ${points} L ${getX(chartData.length - 1)},${chartHeight - padding} Z`;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="Kalkulator Simulasi Bonus & Prospek">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="printable-area relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#071e17] to-[#0d3b2f] text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Calculator size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Kalkulator Simulasi Bonus &amp; Prospek
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  Prospecting Tool
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Visualisasikan kekuatan duplikasi binary &amp; potensi passive income Bionet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Official Header (Shown only during printing) */}
        <div className="hidden print:block p-6 border-b border-slate-200 text-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-emerald-800 tracking-tight">
                BIONET INDONESIA
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Proposal Simulasi Potensi Income &amp; Kemitraan Herbal Resmi
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Konsultan: <strong>{currentUser?.full_name || currentUser?.username}</strong></div>
              <div>ID Mitra: <strong>BIO-{currentUser?.id?.slice(0, 8)?.toUpperCase()}</strong></div>
              <div>Tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls Bar: Sliders & Selectors */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4 no-print">
            {/* Prospect Name input for personal touch */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nama Calon Prospek (Opsional)
                </label>
                <span className="text-[11px] text-slate-400">Untuk dicantumkan di naskah WA &amp; brosur</span>
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={prospectName}
                  onChange={(e) => setProspectName(e.target.value)}
                  placeholder="Contoh: Bpk. Budi Santoso / Bu Ratna"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>

            <div className="h-px bg-slate-200/80" />

            {/* Step 1: Package Selection Cards */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                1. Pilih Paket Lisensi Hak Usaha (HU):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(packages).map(([key, pkg]) => {
                  const isSelected = selectedPackage === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPackage(key)}
                      className={`relative p-3.5 rounded-xl text-left border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-sm shadow-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <CheckCircle2 size={13} />
                        </div>
                      )}
                      <div className="font-heading font-extrabold text-sm text-slate-900">
                        Paket {pkg.name}
                      </div>
                      <div className="text-emerald-700 font-bold text-base mt-0.5">
                        {formatRupiah(pkg.price)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                          {pkg.hu} Hak Usaha
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100/70 font-semibold text-emerald-800">
                          {pkg.pv} Poin PV
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 & 3: Duplication and Time Period Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Duplication Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    2. Pola Duplikasi per Siklus:
                  </label>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {duplication} Mitra Baru
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="4"
                  step="1"
                  value={duplication}
                  onChange={(e) => setDuplication(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>2 Mitra (Minimal)</span>
                  <span>3 Mitra</span>
                  <span>4 Mitra (Agresif)</span>
                </div>
              </div>

              {/* Months Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    3. Periode Waktu Prospek:
                  </label>
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                    {months} Bulan ({months} Siklus)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonths(m)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold border transition-colors ${
                        months === m
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m} Bulan
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPI Output Calculation Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Jaringan */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Estimasi Jaringan</span>
                <Users size={16} className="text-slate-600" />
              </div>
              <div className="font-heading font-black text-2xl text-slate-900">
                {calculations.totalMembers.toLocaleString('id-ID')} <span className="text-sm font-normal text-slate-500">Mitra</span>
              </div>
              <div className="mt-2 text-xs text-slate-600 flex items-center justify-between pt-2 border-t border-slate-200">
                <span>Kaki Kiri: <strong>{calculations.leftMembers.toLocaleString('id-ID')}</strong></span>
                <span>Kanan: <strong>{calculations.rightMembers.toLocaleString('id-ID')}</strong></span>
              </div>
            </div>

            {/* Card 2: Bonus Sponsor */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/60 border border-cyan-200">
              <div className="flex items-center justify-between text-cyan-800 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Bonus Sponsor</span>
                <Wallet size={16} className="text-cyan-600" />
              </div>
              <div className="font-heading font-black text-2xl text-cyan-900">
                {formatRupiah(calculations.totalSponsor)}
              </div>
              <div className="mt-2 text-xs text-cyan-700 pt-2 border-t border-cyan-200/70">
                Direct referral {duplication} mitra pertama
              </div>
            </div>

            {/* Card 3: Bonus Pasangan */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Bonus Pasangan Binary</span>
                <Zap size={16} className="text-emerald-600" />
              </div>
              <div className="font-heading font-black text-2xl text-emerald-900">
                {formatRupiah(calculations.totalPairing)}
              </div>
              <div className="mt-2 text-xs text-emerald-700 pt-2 border-t border-emerald-200/70 flex items-center justify-between">
                <span>Rp 25.000 / pasang HU</span>
              </div>
            </div>

            {/* Card 4: Total Potensi Income */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300 shadow-sm">
              <div className="flex items-center justify-between text-amber-900 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Potensi Income</span>
                <Sparkles size={16} className="text-amber-600" />
              </div>
              <div className="font-heading font-black text-2xl text-amber-950">
                {formatRupiah(calculations.totalIncome)}
              </div>
              <div className="mt-2 text-xs font-semibold text-amber-800 pt-2 border-t border-amber-300/70 flex items-center gap-1">
                <span>{months} Bulan Periode Duplikasi</span>
              </div>
            </div>
          </div>

          {/* Reward Tier & Poin PV Progress Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 via-teal-900 to-[#071e17] text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-400/20">
                  <Award size={26} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                    Pencapaian Poin Reward Bionet
                  </div>
                  <div className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
                    <span>{calculations.totalPV.toLocaleString('id-ID')} PV Terkumpul</span>
                    {calculations.achievedTier && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-400/30 text-amber-200 border border-amber-400/50">
                        {calculations.achievedTier.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {calculations.achievedTier && (
                <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 text-xs text-right">
                  <div className="text-emerald-300 font-semibold">Hadiah yang Berhak Diklaim:</div>
                  <div className="font-bold text-white mt-0.5">{calculations.achievedTier.reward}</div>
                </div>
              )}
            </div>

            {/* Reward Progress Bar */}
            <div className="mt-4 pt-3 border-t border-white/15">
              <div className="flex items-center justify-between text-xs text-emerald-200 mb-1.5">
                <span>
                  Target Reward Berikutnya: <strong>{calculations.nextTier?.badge}</strong> ({calculations.nextTier?.reward})
                </span>
                <span className="font-bold">{calculations.progressToNext}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${calculations.progressToNext}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive SVG Growth Projection Chart */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>Kurva Pertumbuhan Penghasilan Eksponensial</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Arahkan kursor pada titik grafik untuk rincian bonus per bulan
                </p>
              </div>
              {activeChartPoint && (
                <div className="text-right text-xs bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <span className="text-slate-500">Bulan ke-{activeChartPoint.month}: </span>
                  <strong className="text-emerald-800 font-bold">
                    {formatRupiah(activeChartPoint.incomeTotal)}
                  </strong>
                </div>
              )}
            </div>

            {/* SVG Canvas */}
            <div className="relative w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-44 sm:h-52 select-none"
              >
                <defs>
                  <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth="1" />

                {/* Area Fill */}
                <path d={areaPath} fill="url(#curveGradient)" />

                {/* Curved Stroke Line */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {/* Data Points */}
                {chartData.map((d, idx) => {
                  const cx = getX(idx);
                  const cy = getY(d.incomeTotal);
                  const isHovered = activeChartPoint?.month === d.month;

                  return (
                    <g key={d.month} className="cursor-pointer">
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isHovered ? 7 : 4.5}
                        fill={isHovered ? '#f59e0b' : '#ffffff'}
                        stroke="#059669"
                        strokeWidth="3"
                        onMouseEnter={() => setActiveChartPoint(d)}
                        onMouseLeave={() => setActiveChartPoint(null)}
                      />
                      {/* X-axis labels */}
                      <text
                        x={cx}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748b"
                        fontWeight="600"
                      >
                        B{d.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Disimulasikan dengan algoritma real-time Bionet Binary Engine
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrintBrochure}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              <Printer size={15} />
              <span>Cetak Brosur Prospek</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Share2 size={15} />
              <span>Bagikan ke WhatsApp</span>
            </button>
          </div>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
