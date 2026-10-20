import React, { useState } from 'react';
import {
  RefreshCw,
  Shield,
  Share2,
  Check,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Header({
  user,
  onRefresh,
  loading,
  mobileOpen,
  onToggleMobileSidebar,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/register?ref=${user?.username || 'mitra'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 lg:px-8 shadow-dashlite">
      <div className="max-w-[1380px] mx-auto h-full flex items-center justify-between">
        {/* Left: Hamburger Toggle (Mobile) + Section Header & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Hamburger Button: visible only on screens smaller than lg */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Mobile Menu"
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {mobileOpen ? (
              <X size={22} className="text-emerald-700" />
            ) : (
              <Menu size={22} />
            )}
          </button>

          <div>
            <h2 className="font-heading font-bold text-base lg:text-lg text-slate-800 leading-tight">
              Dashboard Kemitraan
            </h2>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Sistem Kemitraan & Penjualan Jaringan Herbal
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden xs:inline">Network Live</span>
          </div>
        </div>

        {/* Right: Actions & User Meta */}
        <div className="flex items-center gap-2.5">
          {/* Referral Link Fast Share */}
          <button
            onClick={handleCopy}
            title="Salin Link Referral Sponsor"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            {copied ? (
              <Check size={14} className="text-emerald-600" />
            ) : (
              <Share2 size={14} className="text-emerald-600" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {copied ? 'Tersalin!' : 'Link Referral'}
            </span>
          </button>

          {/* Membership Badge */}
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            <Shield size={14} className="text-amber-600" />
            <span>Paket Silver Mitra</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Segarkan Data Real-Time"
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-sm"
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin text-emerald-600' : ''}
            />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User Mini Profile */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#bbf7d0] text-[#065f46] flex items-center justify-center font-heading font-extrabold text-xs shadow-sm flex-shrink-0">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">
                {user?.full_name || user?.username || 'Mitra'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                @{user?.username || 'mitra'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
