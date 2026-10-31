import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  User,
  Lock,
  AlertCircle,
  Layers,
  Eye,
  EyeOff,
  Network,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
  PhoneCall,
  Zap,
  Activity,
} from 'lucide-react';
import api from '../services/api';
import { useBranding } from '../context/BrandingContext';
import BionetAmbientBackground from '../components/BionetAmbientBackground';
import ModalPortal from '../components/common/ModalPortal';

export default function LoginPage({ onLoginSuccess }) {
  const { branding } = useBranding();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ambientBgMode, setAmbientBgMode] = useState('luxury-biotech');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);

  // Rotating Live Headlines for dynamic storytelling
  const headlines = [
    {
      title: 'Revolusi Jaringan Bio-Herbal Modern',
      desc: 'Visualisasi binary tree tanpa batas kedalaman, automasi komisi harian Flip.id, dan asisten AI Copilot 24/7.',
    },
    {
      title: 'Automasi Pencairan Dana Flip.id Instan',
      desc: 'Setiap bonus sponsor dan pairing otomatis terkirim langsung ke rekening bank atau e-wallet Anda.',
    },
    {
      title: 'Kemitraan Terpercaya & Berkelanjutan',
      desc: 'Sistem kemitraan adil, transparan, dan terpercaya untuk seluruh keluarga besar mitra Bionet Indonesia.',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeadlineIdx((prev) => (prev + 1) % headlines.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [headlines.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data && res.data.data) {
        localStorage.setItem('bionet_token', res.data.data.token);
        localStorage.setItem('bionet_user', JSON.stringify(res.data.data.user));
        if (rememberMe) {
          localStorage.setItem('bionet_saved_username', username);
        } else {
          localStorage.removeItem('bionet_saved_username');
        }
        onLoginSuccess(res.data.data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (role = 'member') => {
    if (role === 'admin') {
      setUsername('admin01');
      setPassword('bionet123');
    } else if (role === 'gudang') {
      setUsername('gudang01');
      setPassword('bionet123');
    } else {
      setUsername('mitra01');
      setPassword('bionet123');
    }
    setError('');
  };

  return (
    <div className="relative min-h-screen min-h-dvh flex flex-col items-center justify-between p-3 sm:p-6 font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* 1. Dynamic Ambient Background: Luxury Biotech Canvas */}
      <BionetAmbientBackground
        dimmed={false}
        activeMode={ambientBgMode}
        onModeChange={setAmbientBgMode}
      />

      {/* 2. Main Showcase Split Card: Dribbble/Pinterest Luxury Glassmorphism */}
      <main className="relative z-10 w-full max-w-[1100px] my-auto py-5 transition-all duration-500">
        <div className="w-full bg-slate-950/80 sm:bg-slate-950/75 backdrop-blur-3xl rounded-[32px] sm:rounded-[38px] border border-emerald-500/20 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.85),0_0_50px_rgba(16,185,129,0.12)] p-3 sm:p-5 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">

            {/* ==============================================================
                LEFT COLUMN: Bespoke 3D Bio-Tech Visual & Holographic Badges
                ============================================================== */}
            <div className="lg:col-span-6 rounded-[26px] sm:rounded-[32px] relative overflow-hidden flex flex-col justify-between p-5 sm:p-8 min-h-[220px] sm:min-h-[380px] lg:min-h-[610px] bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 border border-white/10 shadow-inner group">

              {/* Background Bespoke 3D Planet Image with Slow Ambient Drift */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src="/assets/bionet_biotech_hero.jpg"
                  alt="Bionet 3D Biotech Planet with Binary Nodes"
                  className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-1000"
                />
                {/* Soft gradient scrims for maximum text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/30 to-slate-950/70" />
              </div>

              {/* Top Row: Pill Tag & Platform Version */}
              <div className="relative z-20 flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>Kemitraan Generasi Baru</span>
                </span>

                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                  <Activity size={11} className="text-teal-400" />
                  <span>Bionet Intelligence v6</span>
                </div>
              </div>

              {/* Floating Glassmorphic Badges (Apple/Stripe Style) */}
              <div className="relative z-20 my-auto py-8 select-none">
                {/* Floating Badge 1 (Top Right) */}
                <div className="absolute -top-4 right-1 animate-float-slow hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-emerald-500/30 shadow-lg text-[11px] text-white">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold">
                    🌿
                  </div>
                  <div>
                    <span className="font-bold block leading-tight text-emerald-300">Bio-Herbal BPOM</span>
                    <span className="text-[9px] text-slate-400">100% Alami &amp; Teruji</span>
                  </div>
                </div>

                {/* Floating Badge 2 (Middle Left) */}
                <div className="absolute top-1/2 -left-2 -translate-y-1/2 animate-float-reverse hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-teal-500/30 shadow-lg text-[11px] text-white">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-bold">
                    ⚡
                  </div>
                  <div>
                    <span className="font-bold block leading-tight text-teal-300">Flip.id Gateway</span>
                    <span className="text-[9px] text-slate-400">Transfer Komisi 24 Jam</span>
                  </div>
                </div>

                {/* Floating Badge 3 (Bottom Right) */}
                <div className="absolute -bottom-2 right-2 animate-float-slow hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-amber-500/30 shadow-lg text-[11px] text-white">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold">
                    🧬
                  </div>
                  <div>
                    <span className="font-bold block leading-tight text-amber-300">Pohon Binary</span>
                    <span className="text-[9px] text-slate-400">Anti-Sybil Closure Table</span>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Kinetic Rotating Storytelling */}
              <div className="relative z-20 pt-4">
                <div className="transition-all duration-700 ease-out">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
                    {headlines[activeHeadlineIdx].title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-normal">
                    {headlines[activeHeadlineIdx].desc}
                  </p>
                </div>

                {/* Interactive Feature Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mt-4 text-[10px] font-bold text-slate-200">
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 shadow-xs flex items-center gap-1">
                    <Zap size={11} className="text-amber-400" />
                    <span>Flush-Out 12 Pasang</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/10 shadow-xs flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-400" />
                    <span>Anti-Sybil Security</span>
                  </span>
                </div>
              </div>
            </div>


            {/* ==============================================================
                RIGHT COLUMN: Luxury Dark Authentication Form
                ============================================================== */}
            <div className="lg:col-span-6 flex flex-col justify-between p-4 sm:p-7 sm:px-8">
              <div>
                {/* Brand Logo Badge with Glowing Gradient Ring */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-13 h-13 rounded-2xl p-0.5 shadow-lg shadow-emerald-500/25"
                    style={{
                      background: `linear-gradient(135deg, ${branding?.primary_color || '#10b981'} 0%, ${branding?.secondary_color || '#06b6d4'} 100%)`,
                    }}
                  >
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center p-1.5 overflow-hidden">
                      {branding?.logo_url ? (
                        <img
                          src={branding.logo_url}
                          alt={branding.app_name || 'Logo'}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Layers size={22} className="text-emerald-400" />
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Server Live</span>
                  </span>
                </div>

                {/* Heading & Subtitle */}
                <div className="mt-5 mb-6">
                  <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                    Portal Mitra {branding?.app_name || 'Bionet'}
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Masuk untuk memantau omset tim, struktur jaringan, dan bonus harian Anda
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2" role="alert">
                    <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Authentication */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field: Username Mitra */}
                  <div>
                    <label htmlFor="login-username" className="block text-xs font-bold text-slate-300 mb-1.5">
                      Username atau Email Mitra
                    </label>
                    <div className="relative flex items-center group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <User size={18} aria-hidden="true" />
                      </span>
                      <input
                        id="login-username"
                        name="username"
                        type="text"
                        placeholder="Contoh: mitra01 atau email anda"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        spellCheck={false}
                        className="w-full rounded-2xl bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Field: Kata Sandi */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="login-password" className="block text-xs font-bold text-slate-300">
                        Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none"
                      >
                        Lupa Kata Sandi?
                      </button>
                    </div>
                    <div className="relative flex items-center group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <Lock size={18} aria-hidden="true" />
                      </span>
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full rounded-2xl bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-950 border border-slate-700/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 pl-11 pr-12 py-3.5 text-sm font-medium text-white placeholder:text-slate-500 outline-none transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-2 sm:p-2.5 rounded-lg transition-colors focus:outline-none active:scale-95 touch-manipulation"
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Checkbox: Ingat Saya */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-700 bg-slate-900"
                      />
                      <span className="text-xs text-slate-400 font-medium">Ingat saya di perangkat ini</span>
                    </label>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span>256-Bit SSL</span>
                    </div>
                  </div>

                  {/* High-Converting Shimmering Gradient CTA Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-heading font-black text-sm tracking-wide shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                    <span className="relative z-10">{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Portal Mitra'}</span>
                    <ArrowRight size={17} className="relative z-10" />
                  </button>
                </form>

                {/* Divider: Or Continue With */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <span className="relative bg-slate-950 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Atau Masuk Cepat Demo (RBAC)
                  </span>
                </div>

                {/* Quick Demo Switcher Pills */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUseDemo('member')}
                    className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-emerald-950/70 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>🌿 Mitra</span>
                    <span className="text-[9px] font-normal text-slate-500">mitra01</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseDemo('admin')}
                    className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-amber-950/70 border border-slate-800 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>👑 Admin</span>
                    <span className="text-[9px] font-normal text-slate-500">admin01</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUseDemo('gudang')}
                    className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-sky-950/70 border border-slate-800 hover:border-sky-500/50 text-slate-200 hover:text-sky-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>📦 Gudang</span>
                    <span className="text-[9px] font-normal text-slate-500">gudang01</span>
                  </button>
                </div>
              </div>

              {/* Bottom Social Proof Badge */}
              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* Overlapping User Avatars with Glowing Rings */}
                    <div className="flex -space-x-2 overflow-hidden">
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500/40 object-cover"
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                        alt="Mitra Bionet 1"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-teal-500/40 object-cover"
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                        alt="Mitra Bionet 2"
                      />
                      <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-amber-500/40 object-cover"
                        src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                        alt="Mitra Bionet 3"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>15.420+ Mitra Juara</span>
                        <CheckCircle2 size={13} className="text-emerald-400 fill-emerald-950" />
                      </div>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Tersebar di 38 Provinsi &amp; Asia Tenggara
                      </span>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 shrink-0">
                    Terverifikasi
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>

      {/* 4. Elegant Page Footer */}
      <footer className="relative z-10 text-center py-2 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>&copy; {new Date().getFullYear()} Bionet Juara Perkasa. All rights reserved.</span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="text-emerald-400">MLM Binary System &bull; Flip.id Instant Payout &bull; Kemendagri API</span>
      </footer>

      {/* ==============================================================
          MODALS: Forgot Password & Business Feature Quick Overviews
          ============================================================== */}

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <ModalPortal isOpen={forgotModalOpen} onClose={() => setForgotModalOpen(false)} ariaLabel="Bantuan Reset Sandi">
          <div
            className="bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-800 relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-4">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Bantuan Reset Sandi</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Untuk menjaga keamanan saldo dompet komisi Flip.id Anda, reset sandi akun mitra diverifikasi langsung melalui administrator stokis atau CS resmi Bionet.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2">
                <PhoneCall size={13} className="text-emerald-400" />
                <span>WhatsApp CS: <strong>0812-3456-7890</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Network size={13} className="text-teal-400" />
                <span>Atau hubungi Upline Sponsor Anda</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="w-full mt-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
