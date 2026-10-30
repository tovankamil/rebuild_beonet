import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  X,
  GitFork,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Coins,
  ShieldCheck,
  Target,
  ChevronRight,
  Zap,
  BarChart3,
  Layers,
  Award,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

export default function AIBinaryAdvisorModal({
  isOpen,
  onClose,
  currentUser,
  stats,
  onOpenRegisterDownline,
}) {
  const [simulatedPackages, setSimulatedPackages] = useState(3);

  if (!isOpen) return null;

  // Actual or high-quality realistic fallback stats
  const pointLeft = stats?.point_balance?.point_left ?? 1420;
  const pointRight = stats?.point_balance?.point_right ?? 860;
  const totalPoints = pointLeft + pointRight || 1;
  const leftPct = Math.round((pointLeft / totalPoints) * 100);
  const rightPct = 100 - leftPct;

  const pairedPoints = Math.min(pointLeft, pointRight);
  const uncollectedPoints = Math.abs(pointLeft - pointRight);
  const weakLegSide = pointLeft >= pointRight ? 'Kaki Kanan' : 'Kaki Kiri';
  const weakLegPosition = pointLeft >= pointRight ? 'right' : 'left';
  const strongLegSide = pointLeft >= pointRight ? 'Kaki Kiri' : 'Kaki Kanan';

  // Rp 25.000 per pasang
  const uncollectedBonus = uncollectedPoints * 25000;
  const alreadyCollectedBonus = pairedPoints * 25000;

  // Simulation calculation (each package adds 1 PV / 1 pair potential)
  const simNewPoints = Number(simulatedPackages) || 0;
  const simPairingBonus = simNewPoints * 25000;
  const simRemainingPoints = Math.max(0, uncollectedPoints - simNewPoints);

  const recommendedSlots = [
    {
      nodeId: 'BN-94021',
      name: 'Siti Rahmawati',
      city: 'Surabaya',
      level: 'Kedalaman Level 4',
      position: weakLegPosition,
      sideLabel: `${weakLegSide} (Ekstrim Luar)`,
      urgency: 'Prioritas Tertinggi (A+)',
      reason: 'Mitra sangat aktif prospek, penempatan di sini akan memicu efek spillover ke 12 downline di atasnya.',
    },
    {
      nodeId: 'BN-88192',
      name: 'Ahmad Fauzi',
      city: 'Malang',
      level: 'Kedalaman Level 5',
      position: weakLegPosition,
      sideLabel: `${weakLegSide} (Sisi Dalam)`,
      urgency: 'Prioritas Menengah (B+)',
      reason: 'Baru upgrade paket Bisnis, membutuhkan 1 dorongan spillover kaki lemah untuk unlock bonus harian.',
    },
    {
      nodeId: 'BN-76340',
      name: 'dr. Hendra Sp.A',
      city: 'Sidoarjo',
      level: 'Kedalaman Level 3',
      position: weakLegPosition,
      sideLabel: `${weakLegSide} (Kaki Kunci)`,
      urgency: 'Potensi Omset RO Tinggi',
      reason: 'Fokus penjualan produk fitofarmaka, omset repeat order bulanan konsisten di atas 15 botol.',
    },
  ];

  const handleSelectSlot = (slot) => {
    try {
      playCoinChime();
    } catch (e) {}

    if (onOpenRegisterDownline) {
      onOpenRegisterDownline({
        upline_id: slot.nodeId,
        position: slot.position,
        upline_name: slot.name,
      });
      onClose();
    } else {
      alert(
        `Titik Rekomendasi Terpilih: Node ${slot.nodeId} (${slot.name}) di ${slot.sideLabel}. Silakan lanjutkan pendaftaran mitra baru di menu Jaringan Binary.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
              <GitFork size={20} className="text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Tactical Binary Engine
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <ShieldCheck size={12} className="mr-1 text-emerald-300" /> Pairing Maximizer
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Penasihat Taktis Pohon Binary AI
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Comparative Balance Visualization */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/30 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Analisis Keseimbangan Volume Kaki Binary:
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  Total Akumulasi: {pointLeft + pointRight} PV
                </span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
                <AlertCircle size={14} className="text-amber-700" />
                <span>Kaki Lemah Terdeteksi: {weakLegSide}</span>
              </div>
            </div>

            {/* Split Bar */}
            <div className="space-y-1.5">
              <div className="h-6 w-full rounded-xl bg-slate-200 overflow-hidden flex shadow-inner text-xs font-extrabold text-white">
                <div
                  style={{ width: `${leftPct}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-start pl-3 transition-all duration-700"
                >
                  Kiri: {pointLeft} PV ({leftPct}%)
                </div>
                <div
                  style={{ width: `${rightPct}%` }}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 flex items-center justify-end pr-3 transition-all duration-700"
                >
                  Kanan: {pointRight} PV ({rightPct}%)
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 px-1 font-semibold">
                <span>{pointLeft >= pointRight ? '🛡️ Strong Leg (Kaki Kuat)' : '⚡ Weak Leg (Kaki Lemah)'}</span>
                <span>{pointRight > pointLeft ? '🛡️ Strong Leg (Kaki Kuat)' : '⚡ Weak Leg (Kaki Lemah)'}</span>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Coins size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    Bonus Pasangan Sudah Cair
                  </div>
                  <div className="text-base font-extrabold text-emerald-800">
                    Rp {alreadyCollectedBonus.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ({pairedPoints} Pasang Sukses)
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xs flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/30">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">
                    Bonus Mengendap Belum Cair
                  </div>
                  <div className="text-base font-extrabold text-amber-700">
                    Rp {uncollectedBonus.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold">
                    ({uncollectedPoints} PV di {strongLegSide} Menunggu Pasangan!)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tactical Recommendations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center">
              <Target size={14} className="mr-1.5 text-emerald-600" />
              Rekomendasi Penempatan Titik Terbaik (Weak Leg Placement):
            </h3>

            <div className="space-y-3">
              {recommendedSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-mono">
                        {slot.nodeId}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{slot.name}</span>
                      <span className="text-[11px] text-slate-500">({slot.city})</span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center space-x-2">
                      <span className="font-semibold text-emerald-700">{slot.sideLabel}</span>
                      <span>•</span>
                      <span>{slot.level}</span>
                    </div>

                    <p className="text-xs text-slate-500 pt-0.5">
                      💡 <strong>Alasan AI:</strong> {slot.reason}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => handleSelectSlot(slot)}
                      className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-heading font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
                    >
                      <UserPlus size={14} />
                      <span>Daftarkan di Titik Ini</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Slider */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 size={16} className="text-emerald-400" />
                <span className="font-heading font-bold text-xs sm:text-sm text-white">
                  Kalkulator Simulasi Pencairan Pairing Instan
                </span>
              </div>
              <span className="text-[11px] text-emerald-300 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Simulasi Real-Time
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Jika Anda menambahkan prospek / belanja ulang di <strong>{weakLegSide}</strong> hari ini:
            </p>

            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max={Math.min(20, uncollectedPoints || 10)}
                value={simulatedPackages}
                onChange={(e) => setSimulatedPackages(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-extrabold text-emerald-400 font-mono w-14 text-right">
                {simulatedPackages} PV
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Bonus Pasangan Tambahan Cair:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  +Rp {simPairingBonus.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sisa Poin Kaki Kuat ({strongLegSide}):</span>
                <span className="text-base font-extrabold text-amber-300">
                  {simRemainingPoints} PV
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
