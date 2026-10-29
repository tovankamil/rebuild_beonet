import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GitFork,
  ArrowRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  Users,
} from 'lucide-react';

// Pool foto potret manusia beresolusi tinggi (Unsplash Human Portraits)
// Meniru gaya foto manusia natural pada referensi gambar 1 (Quick Transfer SoFi)
const HUMAN_PORTRAITS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&h=250&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&h=250&q=80',
];

function getMemberAvatar(member, index) {
  if (member?.avatar && !member.avatar.includes('dicebear.com/7.x/bottts')) {
    return member.avatar;
  }
  // Petakan deterministik berdasarkan string ID atau Username
  const key = member?.username || member?.id || String(index);
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const portraitIdx = Math.abs(hash) % HUMAN_PORTRAITS.length;
  return HUMAN_PORTRAITS[portraitIdx];
}

export default function RecentJoinedMembersBar({
  members = [],
  loading = false,
  onRefresh,
  onOpenRegister,
  onNavigateTree,
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredMember, setHoveredMember] = useState(null);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [members]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 relative overflow-hidden transition-all duration-200">
      {/* Background Ambient Aura */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Users size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-extrabold text-sm sm:text-base text-slate-800 tracking-tight">
                Mitra yang Baru Bergabung
              </h4>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Real-Time</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Komunitas bertumbuh secara aktif. Anggota jaringan Anda ditandai dengan lingkar hijau.
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Perbarui daftar member terbaru"
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          )}

          {onNavigateTree && (
            <button
              onClick={onNavigateTree}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <GitFork size={13} />
              <span>Pohon Binary</span>
              <ArrowRight size={12} />
            </button>
          )}

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track with Left-to-Right Animated Items */}
      <div className="relative">
        {/* Left Fade Gradient Mask */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right Fade Gradient Mask */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* 1. The (+) Add / Daftarkan Mitra Button (First in track, exactly like Image 1) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer group select-none"
            onClick={onOpenRegister}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-emerald-400/90 bg-emerald-50/70 group-hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-xs">
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-200" />
            </div>
            <span className="font-heading font-bold text-xs text-slate-800 mt-2 group-hover:text-emerald-700 transition-colors">
              Daftarkan
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">
              + Mitra Baru
            </span>
          </motion.div>

          {/* 2. Member Avatars with Left-to-Right Stagger Animation */}
          {members.map((member, idx) => {
            const avatarUrl = getMemberAvatar(member, idx);
            const isDownline = member.is_downline;
            const firstName = member.full_name?.split(' ')[0] || member.username;
            const isHovered = hoveredMember?.id === member.id;

            return (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.38,
                  ease: [0.16, 1, 0.3, 1],
                  delay: (idx + 1) * 0.045, // Left-to-right cascade stagger
                }}
                onMouseEnter={() => setHoveredMember(member)}
                onMouseLeave={() => setHoveredMember(null)}
                className="flex flex-col items-center flex-shrink-0 cursor-pointer group relative select-none"
                onClick={onNavigateTree}
              >
                {/* Avatar Circle Container */}
                <div className="relative">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 group-hover:scale-105 group-active:scale-95 ${
                      isDownline
                        ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 ring-2 ring-emerald-400/30 shadow-md shadow-emerald-500/15'
                        : 'bg-slate-100 hover:ring-2 hover:ring-slate-300'
                    }`}
                  >
                    <img
                      src={avatarUrl}
                      alt={member.full_name || member.username}
                      loading="lazy"
                      className="w-full h-full rounded-full object-cover bg-slate-200"
                      onError={(e) => {
                        // Fallback jika foto gagal dimuat
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${member.username}`;
                      }}
                    />
                  </div>

                  {/* Downline Verified Star Badge */}
                  {isDownline && (
                    <span
                      title="Sponsor Langsung Anda"
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                    >
                      <Sparkles size={10} className="text-emerald-100" />
                    </span>
                  )}
                </div>

                {/* Member First Name */}
                <span className="font-heading font-semibold text-xs text-slate-800 mt-2 max-w-[76px] truncate text-center group-hover:text-emerald-700 transition-colors">
                  {firstName}
                </span>

                {/* Subtext Tag: Downline Status or Short Date */}
                {isDownline ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5 border border-emerald-200/60 leading-none">
                    Downline
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 max-w-[76px] truncate leading-none">
                    @{member.username?.substring(0, 8)}
                  </span>
                )}

                {/* Rich Hover Floating Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute -top-24 z-30 bg-slate-950 text-white text-[11px] p-2.5 rounded-xl shadow-2xl border border-slate-800 whitespace-nowrap pointer-events-none min-w-[160px]"
                    >
                      <div className="font-heading font-bold text-xs text-white">
                        {member.full_name || member.username}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        @{member.username}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                        <span className="text-emerald-400 font-semibold">
                          {member.package_name || 'Paket Silver'}
                        </span>
                        <span className="text-slate-400">
                          {member.created_at
                            ? new Date(member.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                            : 'Hari ini'}
                        </span>
                      </div>
                      {isDownline && (
                        <div className="mt-1 text-[9px] font-bold text-emerald-300">
                          ✔ Sponsor Langsung Anda
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
