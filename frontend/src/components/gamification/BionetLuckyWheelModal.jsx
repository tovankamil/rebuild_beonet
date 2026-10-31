import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Gift,
  RotateCw,
  Trophy,
  CheckCircle2,
  Clock,
  Lock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import ModalPortal from '../common/ModalPortal';
import api from '../../services/api';

const WHEEL_PRIZES = [
  {
    id: 1,
    title: 'Diskon 15% Bio-Propolis',
    code: 'PROPOLIS15',
    color: '#059669', // Emerald
    textColor: '#ffffff',
    icon: '🍯',
    quote: 'Madu & Propolis menjaga daya tahan tubuh dan kelenturan persendian.',
  },
  {
    id: 2,
    title: '50 Poin Kemitraan',
    code: 'POIN50',
    color: '#d97706', // Amber Gold
    textColor: '#ffffff',
    icon: '⭐',
    quote: 'Langkah kecil setiap hari membawa keberkahan keluarga.',
  },
  {
    id: 3,
    title: 'Gratis Ongkir RO',
    code: 'FREEONGKIR',
    color: '#0284c7', // Sky Blue
    textColor: '#ffffff',
    icon: '📦',
    quote: 'Kesehatan yang prima adalah investasi masa tua yang paling berharga.',
  },
  {
    id: 4,
    title: 'Voucher Belanja Rp 10rb',
    code: 'HEMAT10RB',
    color: '#7c3aed', // Purple
    textColor: '#ffffff',
    icon: '🪙',
    quote: 'Senyum hangat dan pikiran tenang memperlancar peredaran darah.',
  },
  {
    id: 5,
    title: 'Tips Sehat Awet Muda',
    code: 'SEHATBUGAR',
    color: '#e11d48', // Rose
    textColor: '#ffffff',
    icon: '🌿',
    quote: 'Jalan santai 20 menit pagi hari memicu hormon bahagia alami.',
  },
  {
    id: 6,
    title: 'Doa Berkah & Coba Lagi',
    code: 'BERKAHHARIAN',
    color: '#0d9488', // Teal
    textColor: '#ffffff',
    icon: '🤲',
    quote: 'Semoga hari ini penuh rezeki lancar dan kesehatan sekeluarga.',
  },
];

export default function BionetLuckyWheelModal({ isOpen, onClose, currentUser }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [secondsUntilMidnight, setSecondsUntilMidnight] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync daily status from backend and localStorage
  const syncDailyStatus = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const userKey = currentUser?.id || currentUser?.username || 'guest';
    const localDate = localStorage.getItem(`bionet_wheel_date_${userKey}`);

    // If local storage says already played today
    if (localDate === today) {
      setHasPlayedToday(true);
      const lastPrize = localStorage.getItem(`bionet_wheel_prize_${userKey}`);
      if (lastPrize) {
        try {
          setSelectedPrize(JSON.parse(lastPrize));
        } catch {}
      }
    }

    // Also check server-side for airtight validation
    try {
      const res = await api.get('/gamification/wheel/status');
      if (res.data?.status === 'success') {
        if (res.data.has_played) {
          setHasPlayedToday(true);
          if (res.data.last_prize) {
            const serverPrize = WHEEL_PRIZES.find((p) => p.id === res.data.last_prize.prize_id) || {
              id: res.data.last_prize.prize_id,
              title: res.data.last_prize.prize_name,
              code: res.data.last_prize.prize_code,
              icon: '🎁',
              quote: 'Voucher telah tersimpan dan siap digunakan untuk repeat order.',
            };
            setSelectedPrize(serverPrize);
            localStorage.setItem(`bionet_wheel_date_${userKey}`, today);
            localStorage.setItem(`bionet_wheel_prize_${userKey}`, JSON.stringify(serverPrize));
          }
        }
        if (res.data.seconds_until_reset) {
          setSecondsUntilMidnight(res.data.seconds_until_reset);
        }
      }
    } catch (e) {
      // Fallback calculation for countdown
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setSecondsUntilMidnight(Math.floor((midnight - now) / 1000));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      syncDailyStatus();
    }
  }, [isOpen, currentUser]);

  // Live countdown timer ticking every second
  useEffect(() => {
    if (!hasPlayedToday && secondsUntilMidnight <= 0) return;
    const interval = setInterval(() => {
      setSecondsUntilMidnight((prev) => {
        if (prev <= 1) {
          // Reset reached! Allow playing again
          setHasPlayedToday(false);
          setSelectedPrize(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasPlayedToday]);

  const formatCountdown = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}j : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}d`;
  };

  const handleSpin = async () => {
    // STRICT SECURITY: If currently spinning or already played today, reject immediately!
    if (spinning || hasPlayedToday) return;

    setSpinning(true);
    setErrorMsg('');

    // Pre-determine prize index
    const prizeIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const targetPrize = WHEEL_PRIZES[prizeIdx];
    const sliceAngle = 360 / WHEEL_PRIZES.length; // 60 deg

    // Physical deceleration physics
    const extraTurns = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = extraTurns + (360 - (prizeIdx * sliceAngle + sliceAngle / 2));
    setRotation(targetAngle);

    try {
      // Send to server to lock in database
      await api.post('/gamification/wheel/spin', {
        prize_id: targetPrize.id,
        prize_name: targetPrize.title,
        prize_code: targetPrize.code,
      });
    } catch (err) {
      console.warn('Backend wheel sync:', err.response?.data?.message || err.message);
    }

    // Complete spin after deceleration animation (4.2 seconds)
    setTimeout(() => {
      setSpinning(false);
      setSelectedPrize(targetPrize);
      setHasPlayedToday(true);

      const today = new Date().toISOString().slice(0, 10);
      const userKey = currentUser?.id || currentUser?.username || 'guest';
      try {
        localStorage.setItem(`bionet_wheel_date_${userKey}`, today);
        localStorage.setItem(`bionet_wheel_prize_${userKey}`, JSON.stringify(targetPrize));
      } catch {}

      // Calculate countdown until midnight
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      setSecondsUntilMidnight(Math.floor((midnight - now) / 1000));
    }, 4200);
  };

  const handleCopyCode = () => {
    if (!selectedPrize?.code) return;
    navigator.clipboard.writeText(selectedPrize.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="Roda Berkah Bionet">
      <div
        className="bg-white rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 relative text-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Title & Description */}
        <div className="text-center pt-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-emerald-600 animate-spin" />
            <span>Intermezo Santai Mitra Bionet</span>
          </div>
          <h3 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            🎡 Roda Keberuntungan Harian
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto">
            Putar roda santai setiap hari, dapatkan voucher belanja, tips bugar, dan hadiah kejutan!
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative flex items-center justify-center py-2">
          {/* Top Pointer Arrow */}
          <div className="absolute top-0 z-20 flex flex-col items-center">
            <div
              className="w-6 h-7 bg-amber-500 border-2 border-white shadow-lg"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', transform: 'rotate(180deg)' }}
            />
          </div>

          {/* Glowing Aura Ring */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-500 shadow-xl relative flex items-center justify-center">
            {/* Rotating SVG Wheel */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: spinning ? '4200ms' : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.12, 0.9, 0.24, 1.0)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {WHEEL_PRIZES.map((prize, idx) => {
                  const sliceAngle = 360 / WHEEL_PRIZES.length;
                  const startAngle = idx * sliceAngle;
                  const endAngle = (idx + 1) * sliceAngle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const textAngle = startAngle + sliceAngle / 2;
                  const textX = 50 + 32 * Math.cos((Math.PI * textAngle) / 180);
                  const textY = 50 + 32 * Math.sin((Math.PI * textAngle) / 180);

                  return (
                    <g key={prize.id}>
                      <path
                        d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                        fill={prize.color}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize="6"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                      >
                        {prize.icon}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Hub Button */}
            <button
              type="button"
              disabled={spinning || hasPlayedToday}
              onClick={handleSpin}
              className={`absolute w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 shadow-2xl flex flex-col items-center justify-center z-10 transition ${
                hasPlayedToday
                  ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-amber-400 text-slate-900 active:scale-95 hover:scale-105 cursor-pointer'
              }`}
              title={hasPlayedToday ? 'Kesempatan hari ini sudah digunakan (1x/hari)' : 'Klik untuk memutar roda'}
            >
              {hasPlayedToday ? (
                <>
                  <Lock size={18} className="text-slate-400" />
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider mt-0.5">
                    SELESAI
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl leading-none">✨</span>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-700 tracking-wider">
                    {spinning ? 'PUTAR...' : 'PUTAR'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prize Notification Box */}
        <AnimatePresence>
          {selectedPrize && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-amber-50/50 to-teal-50 border border-emerald-200 text-center relative"
            >
              <div className="text-3xl mb-1">{selectedPrize.icon}</div>
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">
                {hasPlayedToday ? 'Hadiah Keberuntungan Anda Hari Ini:' : 'Selamat! Anda Mendapatkan:'}
              </div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                {selectedPrize.title}
              </div>
              <p className="text-xs text-slate-600 italic mt-1 max-w-sm mx-auto">
                "{selectedPrize.quote}"
              </p>

              <div className="mt-2.5 flex items-center justify-center gap-2">
                <span className="bg-white px-3 py-1 rounded-lg border border-slate-200 text-xs font-mono font-bold text-emerald-700 shadow-2xs">
                  Kode: {selectedPrize.code}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition"
                >
                  {copiedCode ? <Check size={13} /> : null}
                  <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions & Strict Lock Countdown */}
        <div className="mt-4 space-y-2.5">
          {!hasPlayedToday ? (
            <button
              type="button"
              disabled={spinning}
              onClick={handleSpin}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-heading font-black text-sm shadow-lg shadow-emerald-600/30 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCw size={17} className={spinning ? 'animate-spin' : ''} />
              <span>{spinning ? 'Roda Sedang Berputar...' : 'Putar Roda Keberuntungan (1x Gratis)'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              {/* Live Countdown Card */}
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Kesempatan Reset Dalam:</span>
                </div>
                <span className="font-mono font-black text-amber-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                  {formatCountdown(secondsUntilMidnight)}
                </span>
              </div>

              {/* Only 1 Completion Button (No Re-spin!) */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Selesai &amp; Simpan Hadiah</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
            <span>Sistem Terkunci: Maksimal 1x putaran per hari per akun mitra.</span>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
