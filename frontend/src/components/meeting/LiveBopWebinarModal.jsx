import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Users,
  MessageSquare,
  Send,
  Sparkles,
  Flame,
  Radio,
  Clock,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Award,
  ChevronRight,
  TrendingUp,
  Gift,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';
import { playNotificationPing, playGoldCoinChime, playLevelUpFanfare } from '../../utils/audioChime';

const INITIAL_COMMENTS = [
  { id: 1, name: 'Budi Santoso', city: 'Surabaya', text: 'Bismillah dok, penjelasan bioflavonoid propolisnya sangat jelas!', time: '1 mnt lalu' },
  { id: 2, name: 'Hj. Mardiah', city: 'Makassar', text: 'Alhamdulillah sudah coba sendiri, asam urat turun dari 8.5 ke 5.2 🙏', time: 'Just now' },
  { id: 3, name: 'Rahmat Hidayat', city: 'Bandung', text: 'Saya mau ambil promo paket Agen malam ini juga, kuotanya masih ada min?', time: 'Just now' },
  { id: 4, name: 'drg. Cynthia Dewi', city: 'Jakarta Selatan', text: 'Kandungan polifenol dan sifat antibakteri propolis trigona memang paling tinggi 👍', time: 'Just now' },
  { id: 5, name: 'Ahmad Fauzi', city: 'Medan', text: 'Salam sukses dari tim Sumatera Utara! Siap go Platinum 🚀', time: 'Just now' },
];

export default function LiveBopWebinarModal({
  isOpen,
  onClose,
  currentUser,
  onClaimPromo,
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState(1428);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [chatInput, setChatInput] = useState('');
  const [likesCount, setLikesCount] = useState(3842);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [claimedModalOpen, setClaimedModalOpen] = useState(false);

  // 15 Minutes Countdown Timer
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 900 seconds

  const chatScrollRef = useRef(null);

  // Countdown Interval
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Viewer Count Fluctuation Interval
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.floor(Math.random() * 9) - 3; // +6 to -3
        return Math.max(1250, prev + delta);
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [comments]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newComment = {
      id: Date.now(),
      name: currentUser?.name || 'Mitra SYNETIQ',
      city: currentUser?.city || 'Indonesia',
      text: chatInput,
      time: 'Baru saja',
    };

    setComments((prev) => [...prev, newComment]);
    setChatInput('');
    playNotificationPing();
  };

  const handleLike = () => {
    setLikesCount((prev) => prev + 1);
    const newHeart = { id: Date.now(), left: Math.floor(Math.random() * 80) + 10 };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1600);
  };

  const handleClaim = () => {
    playLevelUpFanfare();
    playGoldCoinChime();
    setClaimedModalOpen(true);
    if (onClaimPromo) {
      onClaimPromo();
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header Broadcast Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[11px] tracking-wider uppercase flex items-center space-x-1 shadow-sm shadow-rose-950">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>LIVE BOP</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Grand BOP Nasional: Peluang Bisnis Herbal &amp; Kunci Sehat Mandiri
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Viewers Badge */}
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-rose-400" />
              <span className="text-white font-black">{viewerCount.toLocaleString('id-ID')}</span>
              <span className="text-slate-400 font-normal hidden sm:inline">Mitra Menonton</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Webinar Content: Two Columns (Video Stream + Live Chat) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* Main Video Player Stream (8 Cols) */}
          <div className="lg:col-span-8 bg-black flex flex-col justify-between relative min-h-[380px] lg:min-h-[520px]">
            {/* Overlay Presenter Tag */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Presenter: dr. Hendra Kurniawan, Sp.GK (Head Medical Board)
                </span>
              </div>
            </div>

            {/* Video Stage Simulation */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-6 text-center">
              {/* Dynamic Glowing Studio Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/60 via-slate-950 to-rose-950/40 pointer-events-none" />

              {/* Simulated Presentation Slide */}
              <div className="relative z-10 max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Formula Standar Nano Teknologi BPOM</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Mengapa Pasar Herbal Indonesia Tumbuh 28% Per Tahun?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Kesadaran masyarakat beralih ke pencegahan alami membuat permintaan Bio-Propolis Trigona &amp; ekstrak herbal berkualitas tinggi meledak di seluruh pelosok Nusantara.
                </p>

                {/* Live Presentation Graphic Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-left">
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Margin Retail</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">40% - 60%</div>
                    <div className="text-[9px] text-slate-500">Langsung ke Mitra</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Repeat Order</div>
                    <div className="text-lg font-black text-cyan-400 mt-0.5">82.4%</div>
                    <div className="text-[9px] text-slate-500">Tiap 25 Hari</div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400">Bonus Pasangan</div>
                    <div className="text-lg font-black text-amber-400 mt-0.5">Harian</div>
                    <div className="text-[9px] text-slate-500">Auto Transfer</div>
                  </div>
                </div>
              </div>

              {/* Floating Hearts Animation */}
              <div className="absolute bottom-16 right-8 w-32 h-64 pointer-events-none overflow-hidden z-30">
                {floatingHearts.map((h) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 1, y: 150, scale: 0.8 }}
                    animate={{ opacity: 0, y: -50, scale: 1.4 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ left: `${h.left}%` }}
                    className="absolute text-rose-500"
                  >
                    <Heart className="w-6 h-6 fill-rose-500" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Video Control Bar */}
            <div className="bg-slate-950/90 backdrop-blur-md border-t border-slate-800 px-4 py-3 flex items-center justify-between z-20">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-mono text-slate-400">1080p 60fps HD Low Latency</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center space-x-1.5 transition active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{likesCount.toLocaleString('id-ID')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Interactivity (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900/50 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between max-h-[520px]">
            {/* Chat Title */}
            <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Live Chat &amp; QnA</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Moderated Live</span>
            </div>

            {/* Chat Messages List */}
            <div ref={chatScrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
              {comments.map((c) => (
                <div key={c.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 truncate max-w-[140px]">{c.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{c.city}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tulis tanggapan atau pertanyaan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* FLOATING URGENCY CALL-TO-ACTION BAR */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950 via-rose-950 to-indigo-950 border-t border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Gift className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  Promo Spesial Live BOP:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-black animate-pulse">
                  Sisa {formattedTime}
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Diskon Registrasi Rp 500.000 + <strong>Gratis 2 Botol Bio-Propolis</strong> + Akses Web Replika VIP!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={handleClaim}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-xl shadow-amber-950/50 flex items-center justify-center space-x-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Ambil Promo Join Mitra Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Claim Modal */}
      {claimedModalOpen && (
        <ModalPortal isOpen={claimedModalOpen} onClose={() => setClaimedModalOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-slate-950 border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-lg shadow-amber-950">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Voucher Promo Berhasil Diklaim!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Slot promo diskon Rp 500.000 dan bonus 2 botol herbal telah dikunci untuk nomor Anda selama 24 jam ke depan.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between text-slate-400">
                <span>Kode Voucher:</span>
                <span className="font-mono font-bold text-amber-400">BOP-LIVE-PROMO-VIP</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status Slot:</span>
                <span className="font-bold text-emerald-400">Tersedia &amp; Terverifikasi</span>
              </div>
            </div>

            <button
              onClick={() => setClaimedModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs transition"
            >
              Lanjutkan Registrasi Mitra
            </button>
          </motion.div>
        </ModalPortal>
      )}
    </ModalPortal>
  );
}
