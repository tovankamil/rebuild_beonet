import React, { useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Users,
  Flame,
  CheckCircle2,
  X,
  Gift,
  Target,
  Car,
  Plane,
  Watch,
  Clock,
  ArrowUpRight,
  Star,
  Zap,
} from 'lucide-react';

const TOP_SPONSORS = [
  { rank: 1, name: 'H. Bambang Sulistyo', username: 'bambang_gold', city: 'Surabaya', count: 48, pv: '12.400 PV', badge: 'Diamond Leader' },
  { rank: 2, name: 'dr. Ratna Wulandari', username: 'dr_ratna', city: 'Semarang', count: 39, pv: '9.850 PV', badge: 'Emerald Leader' },
  { rank: 3, name: 'Ir. Hendra Kusuma', username: 'hendra_k', city: 'Bandung', count: 34, pv: '8.500 PV', badge: 'Gold Leader' },
  { rank: 4, name: 'Siti Aminah, M.Pd', username: 'siti_herbal', city: 'Yogyakarta', count: 28, pv: '7.100 PV', badge: 'Silver Leader' },
  { rank: 5, name: 'Ahmad Fauzan', username: 'fauzan_bionet', city: 'Jakarta Selatan', count: 25, pv: '6.450 PV', badge: 'Silver Leader' },
  { rank: 6, name: 'Dewi Lestari', username: 'dewi_propolis', city: 'Medan', count: 22, pv: '5.800 PV', badge: 'Silver Leader' },
  { rank: 7, name: 'Budi Santoso', username: 'budi_sukses', city: 'Malang', count: 19, pv: '4.950 PV', badge: 'Bronze Star' },
  { rank: 8, name: 'Hj. Nurul Hidayati', username: 'nurul_berkah', city: 'Makassar', count: 17, pv: '4.300 PV', badge: 'Bronze Star' },
];

const TOP_OMSETS = [
  { rank: 1, name: 'dr. Ratna Wulandari', username: 'dr_ratna', city: 'Semarang', count: '142.500 PV', pv: 'Omset Tim A + B', badge: 'Diamond Leader' },
  { rank: 2, name: 'H. Bambang Sulistyo', username: 'bambang_gold', city: 'Surabaya', count: '138.200 PV', pv: 'Omset Tim A + B', badge: 'Diamond Leader' },
  { rank: 3, name: 'Ahmad Fauzan', username: 'fauzan_bionet', city: 'Jakarta Selatan', count: '98.400 PV', pv: 'Omset Tim A + B', badge: 'Emerald Leader' },
  { rank: 4, name: 'Ir. Hendra Kusuma', username: 'hendra_k', city: 'Bandung', count: '87.100 PV', pv: 'Omset Tim A + B', badge: 'Gold Leader' },
  { rank: 5, name: 'Siti Aminah, M.Pd', username: 'siti_herbal', city: 'Yogyakarta', count: '74.300 PV', pv: 'Omset Tim A + B', badge: 'Gold Leader' },
];

const TOP_PAIRINGS = [
  { rank: 1, name: 'H. Bambang Sulistyo', username: 'bambang_gold', city: 'Surabaya', count: '840 Pasang', pv: 'Bonus Rp 21.000.000', badge: 'Juara Binary' },
  { rank: 2, name: 'dr. Ratna Wulandari', username: 'dr_ratna', city: 'Semarang', count: '715 Pasang', pv: 'Bonus Rp 17.875.000', badge: 'Runner Up 1' },
  { rank: 3, name: 'Ir. Hendra Kusuma', username: 'hendra_k', city: 'Bandung', count: '590 Pasang', pv: 'Bonus Rp 14.750.000', badge: 'Runner Up 2' },
  { rank: 4, name: 'Ahmad Fauzan', username: 'fauzan_bionet', city: 'Jakarta Selatan', count: '480 Pasang', pv: 'Bonus Rp 12.000.000', badge: 'Top 5' },
];

const DREAM_REWARDS = [
  {
    id: 'reward_watch',
    title: 'Smartwatch AMOLED Premium',
    value: 'Rp 2.500.000',
    targetPair: 50,
    icon: Watch,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    desc: 'Pantau kesehatan dan notifikasi tim secara cerdas di pergelangan tangan.',
  },
  {
    id: 'reward_umroh',
    title: 'Wisata Halal / Umroh VIP 9 Hari',
    value: 'Rp 35.000.000',
    targetPair: 350,
    icon: Plane,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    desc: 'Ibadah ke tanah suci atau tour halal bintang 5 bersama pasangan tercinta.',
  },
  {
    id: 'reward_mobilio',
    title: 'Mobil Keluarga Honda Mobilio E-CVT',
    value: 'Rp 220.000.000',
    targetPair: 1500,
    icon: Car,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-300',
    desc: 'Mobil keluarga impian baru langsung atas nama Anda (tanpa cicilan).',
  },
  {
    id: 'reward_pajero',
    title: 'SUV Mewah Mitsubishi Pajero Sport Dakar',
    value: 'Rp 600.000.000',
    targetPair: 4000,
    icon: Crown,
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-300',
    desc: 'Simbol kepemimpinan tertinggi dan ketangguhan Crown Diamond Leader Bionet.',
  },
];

export default function LeaderboardModal({ user, stats, onClose }) {
  const [activeLeaderTab, setActiveLeaderTab] = useState('sponsor'); // 'sponsor' | 'omset' | 'pairing' | 'rewards'

  // User PV balance (fallback to 125 left / 98 right if not yet in stats)
  const pointLeft = stats?.point_balance?.point_left ?? 125;
  const pointRight = stats?.point_balance?.point_right ?? 98;
  const currentPair = Math.min(pointLeft, pointRight);

  let activeData = TOP_SPONSORS;
  let metricLabel = 'Mitra Baru';
  if (activeLeaderTab === 'omset') {
    activeData = TOP_OMSETS;
    metricLabel = 'Volume PV';
  } else if (activeLeaderTab === 'pairing') {
    activeData = TOP_PAIRINGS;
    metricLabel = 'Pasangan Binary';
  }

  const top1 = activeData[0];
  const top2 = activeData[1];
  const top3 = activeData[2];

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <Trophy size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Papan Peringkat Juara & Reward Impian
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Oktober 2026
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Apresiasi prestasi puncak kemitraan Bionet di seluruh Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between overflow-x-auto flex-shrink-0">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setActiveLeaderTab('sponsor')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeLeaderTab === 'sponsor'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Users size={14} />
              <span>Top Sponsor</span>
            </button>
            <button
              onClick={() => setActiveLeaderTab('omset')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeLeaderTab === 'omset'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <TrendingUp size={14} />
              <span>Top Omset Grup</span>
            </button>
            <button
              onClick={() => setActiveLeaderTab('pairing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeLeaderTab === 'pairing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <Zap size={14} />
              <span>Top Pairing Binary</span>
            </button>
            <button
              onClick={() => setActiveLeaderTab('rewards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeLeaderTab === 'rewards'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Gift size={14} />
              <span>Program Reward Impian</span>
            </button>
          </div>

          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
            Update Real-Time Tiap Jam
          </span>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
          {activeLeaderTab === 'rewards' ? (
            /* ======================================================== */
            /* PROGRAM REWARD IMPIAN BIONET */
            /* ======================================================== */
            <div className="space-y-5">
              {/* Top Banner Status */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Target size={18} className="text-amber-400" />
                    <h4 className="font-heading font-black text-base text-white">
                      Akumulasi Poin Reward Binary Anda
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-200 mt-1">
                    Poin dihitung dari keseimbangan PV kaki kiri dan kaki kanan (tanpa batas waktu).
                  </p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950/60 p-3 rounded-xl border border-white/10 shrink-0">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Kaki Kiri</span>
                    <span className="font-heading font-black text-lg text-emerald-400">{pointLeft} PV</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Kaki Kanan</span>
                    <span className="font-heading font-black text-lg text-teal-400">{pointRight} PV</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div>
                    <span className="text-[10px] text-amber-300 block font-bold">Terpasang</span>
                    <span className="font-heading font-black text-lg text-amber-400">{currentPair} Pasang</span>
                  </div>
                </div>
              </div>

              {/* 4 Dream Reward Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DREAM_REWARDS.map((rew) => {
                  const Icon = rew.icon;
                  const progressPct = Math.min(100, Math.round((currentPair / rew.targetPair) * 100));
                  const remaining = Math.max(0, rew.targetPair - currentPair);
                  const isAchieved = currentPair >= rew.targetPair;

                  return (
                    <div
                      key={rew.id}
                      className={`p-5 rounded-2xl bg-white border transition duration-300 shadow-xs flex flex-col justify-between ${
                        isAchieved
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                            <Icon size={24} className="text-emerald-700" />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                              Nilai Reward
                            </span>
                            <span className="font-heading font-black text-sm text-slate-900">
                              {rew.value}
                            </span>
                          </div>
                        </div>

                        <h5 className="font-heading font-black text-base text-slate-900">
                          {rew.title}
                        </h5>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {rew.desc}
                        </p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600">
                            Target: <strong className="text-slate-900">{rew.targetPair} Kiri : {rew.targetPair} Kanan</strong>
                          </span>
                          <span className="font-bold text-emerald-700 font-mono">
                            {progressPct}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAchieved
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          {isAchieved ? (
                            <span className="font-bold text-emerald-700 flex items-center space-x-1">
                              <CheckCircle2 size={13} />
                              <span>Syarat Terpenuhi! Siap Diklaim</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Kurang <strong className="text-slate-800 font-bold">{remaining} Pasang PV</strong> lagi
                            </span>
                          )}

                          <button
                            disabled={!isAchieved}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              isAchieved
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Klaim Hadiah
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* LEADERBOARD PODIUM 1, 2, 3 + TABLE */
            /* ======================================================== */
            <div className="space-y-6">
              {/* Podium Juara (Gold, Silver, Bronze) */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 pb-2 items-end max-w-2xl mx-auto text-center">
                {/* Juara 2: Silver */}
                <div className="flex flex-col items-center order-1">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-800 text-white font-black text-lg sm:text-xl flex items-center justify-center">
                        2
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 text-[10px] font-black shadow">
                      Silver
                    </span>
                  </div>
                  <h5 className="font-heading font-black text-xs sm:text-sm text-slate-900 truncate max-w-[120px]">
                    {top2?.name}
                  </h5>
                  <span className="text-[10px] text-slate-500 truncate">{top2?.city}</span>
                  <div className="mt-2 w-full pt-3 pb-4 rounded-t-2xl bg-gradient-to-t from-slate-200 to-slate-100 border-t-2 border-slate-300 shadow-xs">
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-800 block">
                      {top2?.count}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">{metricLabel}</span>
                  </div>
                </div>

                {/* Juara 1: Gold (Trophy Peak) */}
                <div className="flex flex-col items-center order-2 -mt-4">
                  <Crown size={28} className="text-amber-500 mb-1 fill-amber-400 animate-bounce" />
                  <div className="relative mb-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-xl shadow-amber-500/20 flex items-center justify-center ring-4 ring-amber-400/30">
                      <div className="w-full h-full rounded-full bg-amber-950 text-amber-200 font-black text-2xl flex items-center justify-center">
                        1
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md">
                      CHAMPION
                    </span>
                  </div>
                  <h5 className="font-heading font-black text-sm sm:text-base text-slate-900 truncate max-w-[150px]">
                    {top1?.name}
                  </h5>
                  <span className="text-[11px] text-emerald-700 font-bold truncate">{top1?.badge}</span>
                  <div className="mt-2 w-full pt-5 pb-6 rounded-t-2xl bg-gradient-to-t from-amber-200 to-amber-100 border-t-4 border-amber-400 shadow-md">
                    <span className="font-heading font-black text-sm sm:text-lg text-amber-950 block">
                      {top1?.count}
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold uppercase">{metricLabel}</span>
                  </div>
                </div>

                {/* Juara 3: Bronze */}
                <div className="flex flex-col items-center order-3">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-orange-300 to-amber-800 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-800 text-white font-black text-lg sm:text-xl flex items-center justify-center">
                        3
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-black shadow">
                      Bronze
                    </span>
                  </div>
                  <h5 className="font-heading font-black text-xs sm:text-sm text-slate-900 truncate max-w-[120px]">
                    {top3?.name}
                  </h5>
                  <span className="text-[10px] text-slate-500 truncate">{top3?.city}</span>
                  <div className="mt-2 w-full pt-2 pb-3 rounded-t-2xl bg-gradient-to-t from-orange-100 to-amber-50 border-t-2 border-amber-600/40 shadow-xs">
                    <span className="font-heading font-black text-xs sm:text-sm text-amber-950 block">
                      {top3?.count}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">{metricLabel}</span>
                  </div>
                </div>
              </div>

              {/* Sticky Current User Rank Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-md flex items-center justify-between border border-emerald-500/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shadow">
                    #14
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">Posisi Anda Saat Ini</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                        {user?.full_name || 'Mitra Bionet'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-200/90 mt-0.5">
                      Hanya butuh <strong>3 mitra aktif lagi</strong> untuk menembus Top 10 Besar Nasional!
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 block">Total Poin Anda</span>
                  <span className="font-heading font-black text-base text-white">{pointLeft + pointRight} PV</span>
                </div>
              </div>

              {/* Full Ranks Table (Ranks 4 - 8) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-700">Daftar Peringkat 4 - 10</span>
                  <span className="text-[11px] text-slate-500">{activeData.length} Mitra Berprestasi</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {activeData.slice(3).map((item) => (
                    <div key={item.rank} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                          #{item.rank}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                          <span className="text-[11px] text-slate-400">
                            @{item.username} • {item.city}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-heading font-black text-xs sm:text-sm text-emerald-700 block">
                          {item.count}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.pv}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
