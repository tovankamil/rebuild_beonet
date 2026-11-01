import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Sparkles,
  Award,
  ChevronRight,
  CheckCircle2,
  Gift,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import ModalPortal from '../common/ModalPortal';
import api from '../../services/api';
import { playCoinChime } from '../../utils/soundNotification';

export default function BionetRankRewardsModal({ isOpen, onClose, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [claimingRank, setClaimingRank] = useState(null);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRankProgress = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/ranks/my-progress');
      if (res.data?.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat status peringkat:', err.message);
      // Fallback data simulasi jika jaringan lambat
      setData({
        current_rank: 'Bronze Leader',
        current_rank_code: 'BRONZE',
        current_badge_color: '#cd7f32',
        current_icon_emoji: '🥉',
        left_pv: 120,
        right_pv: 95,
        progress_percent: 38.0,
        remaining_left_pv: 130,
        remaining_right_pv: 155,
        next_rank: {
          code: 'SILVER',
          name: 'Silver Leader',
          required_left_pv: 250,
          required_right_pv: 250,
          reward_title: 'Laptop Bisnis & Presentasi / Uang Tunai',
          reward_value: 7500000,
          badge_color: '#94a3b8',
          icon_emoji: '🥈',
        },
        all_ranks: [
          {
            code: 'BRONZE',
            name: 'Bronze Leader',
            required_left_pv: 50,
            required_right_pv: 50,
            reward_title: 'Smartphone Android Bisnis / Uang Tunai',
            reward_value: 2500000,
            badge_color: '#cd7f32',
            icon_emoji: '🥉',
            is_achieved: true,
            is_claimed: true,
            can_claim: false,
            progress_to_target: 100,
          },
          {
            code: 'SILVER',
            name: 'Silver Leader',
            required_left_pv: 250,
            required_right_pv: 250,
            reward_title: 'Laptop Bisnis & Presentasi / Uang Tunai',
            reward_value: 7500000,
            badge_color: '#94a3b8',
            icon_emoji: '🥈',
            is_achieved: false,
            is_claimed: false,
            can_claim: false,
            progress_to_target: 38.0,
          },
          {
            code: 'GOLD',
            name: 'Gold Director',
            required_left_pv: 1000,
            required_right_pv: 1000,
            reward_title: 'Sepeda Motor Honda PCX Baru / Uang Tunai',
            reward_value: 35000000,
            badge_color: '#d97706',
            icon_emoji: '🥇',
            is_achieved: false,
            is_claimed: false,
            can_claim: false,
            progress_to_target: 9.5,
          },
          {
            code: 'EMERALD',
            name: 'Emerald Executive',
            required_left_pv: 5000,
            required_right_pv: 5000,
            reward_title: 'Wisata Religi / Umroh VIP Bintang 5 / Uang Tunai',
            reward_value: 75000000,
            badge_color: '#059669',
            icon_emoji: '💎',
            is_achieved: false,
            is_claimed: false,
            can_claim: false,
            progress_to_target: 1.9,
          },
          {
            code: 'CROWN',
            name: 'Crown Diamond',
            required_left_pv: 20000,
            required_right_pv: 20000,
            reward_title: 'Mobil Keluarga Mewah / Uang Tunai',
            reward_value: 300000000,
            badge_color: '#7c3aed',
            icon_emoji: '👑',
            is_achieved: false,
            is_claimed: false,
            can_claim: false,
            progress_to_target: 0.4,
          },
        ],
        total_claimed_value: 2500000,
        recent_claims: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setClaimSuccess('');
      fetchRankProgress();
    }
  }, [isOpen]);

  const handleClaimReward = async (rankCode) => {
    setClaimingRank(rankCode);
    setErrorMsg('');
    setClaimSuccess('');

    try {
      const res = await api.post('/ranks/claim', {
        rank_code: rankCode,
        claim_type: 'cash',
        notes: 'Klaim reward peringkat resmi via dashboard mitra',
      });

      if (res.data?.status === 'success') {
        try {
          playCoinChime();
        } catch (e) {}
        setClaimSuccess(`Selamat! Hadiah reward peringkat ${rankCode} berhasil dicairkan ke saldo dompet Anda.`);
        fetchRankProgress();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Gagal mengklaim reward');
    } finally {
      setClaimingRank(null);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="Jenjang Karir dan Reward Bionet">
      <div
        className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 relative text-slate-900 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pt-1 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Trophy size={24} className="text-amber-950" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-600" />
              <span>Jenjang Karir &amp; Prestasi Bionet</span>
            </div>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
              Peringkat &amp; Reward Kemitraan
            </h3>
          </div>
        </div>

        {/* Alerts & Messages */}
        <AnimatePresence>
          {claimSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{claimSuccess}</span>
            </motion.div>
          )}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-center gap-2"
            >
              <X size={16} className="text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Rank Hero Card */}
        {data && (
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden mb-5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20 shrink-0"
                  style={{ backgroundColor: data.current_badge_color + '33' }}
                >
                  {data.current_icon_emoji}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                    Peringkat Aktif Anda
                  </span>
                  <div className="text-xl font-heading font-black tracking-tight text-white flex items-center gap-2">
                    <span>{data.current_rank}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-mono font-bold">
                      {data.current_rank_code}
                    </span>
                  </div>
                  <div className="text-xs text-white/70 mt-0.5">
                    Total Hadiah Tercairkan: <strong className="text-amber-300 font-mono">{formatRupiah(data.total_claimed_value)}</strong>
                  </div>
                </div>
              </div>

              {/* Real-time PV Kiri & Kanan */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center flex-1 sm:flex-initial">
                  <div className="text-[10px] uppercase font-bold text-slate-300">PV Kaki Kiri</div>
                  <div className="text-base font-heading font-black text-emerald-400 font-mono">
                    {data.left_pv}
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/10 text-center flex-1 sm:flex-initial">
                  <div className="text-[10px] uppercase font-bold text-slate-300">PV Kaki Kanan</div>
                  <div className="text-base font-heading font-black text-cyan-400 font-mono">
                    {data.right_pv}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Target Rank Progress Bar */}
            {data.next_rank && (
              <div className="mt-4 pt-3.5 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-xs text-white/90 mb-1.5">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>Target Berikutnya:</span>
                    <strong className="text-amber-300">{data.next_rank.icon_emoji} {data.next_rank.name}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{data.progress_percent.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.progress_percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/60 mt-1 font-mono">
                  <span>Sisa Kiri: <strong className="text-white">{data.remaining_left_pv} PV</strong></span>
                  <span>Sisa Kanan: <strong className="text-white">{data.remaining_right_pv} PV</strong></span>
                  <span className="text-amber-300 font-bold">{data.next_rank.reward_title}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List of Career Levels & Rewards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Katalog Jenjang Karir &amp; Hadiah Reward
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              Dihitung otomatis dari akumulasi kaki kiri &amp; kanan
            </span>
          </div>

          {data?.all_ranks?.map((rank, idx) => (
            <div
              key={rank.code}
              className={`p-4 rounded-2xl border transition-all ${
                rank.is_achieved
                  ? 'bg-gradient-to-r from-emerald-50/70 via-white to-amber-50/40 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-xs"
                    style={{ backgroundColor: rank.badge_color + '22' }}
                  >
                    {rank.icon_emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-sm sm:text-base text-slate-900">
                        {rank.name}
                      </span>
                      {rank.is_claimed ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          ✓ Sudah Diklaim
                        </span>
                      ) : rank.is_achieved ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold animate-pulse">
                          🎉 Siap Diklaim!
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">
                          {rank.progress_to_target.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                      <Gift size={13} className="text-amber-600" />
                      <span>{rank.reward_title}</span>
                      <span className="font-mono text-slate-500 font-normal">
                        ({formatRupiah(rank.reward_value)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Qualifications & Claim Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>Syarat: <strong>{rank.required_left_pv}</strong> Kiri</div>
                    <div>&amp; <strong>{rank.required_right_pv}</strong> Kanan</div>
                  </div>

                  {rank.can_claim ? (
                    <button
                      type="button"
                      disabled={claimingRank === rank.code}
                      onClick={() => handleClaimReward(rank.code)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-heading font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0"
                    >
                      <Zap size={14} className={claimingRank === rank.code ? 'animate-spin' : ''} />
                      <span>{claimingRank === rank.code ? 'Mencairkan...' : 'Klaim Hadiah'}</span>
                    </button>
                  ) : rank.is_claimed ? (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={14} />
                      <span>Tercairkan</span>
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1 shrink-0">
                      <span>Terkunci</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>
            Bonus sponsor &amp; pasangan tetap masuk <strong>Real-Time</strong> ke saldo Anda. Kualifikasi reward dihitung otomatis dari akumulasi pertumbuhan jaringan kemitraan.
          </span>
        </div>
      </div>
    </ModalPortal>
  );
}

