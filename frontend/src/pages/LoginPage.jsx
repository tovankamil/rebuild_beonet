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
  Copy,
  Check,
  ExternalLink,
  Code2,
} from 'lucide-react';
import api from '../services/api';
import { useBranding } from '../context/BrandingContext';
import SYNETIQAmbientBackground from '../components/BionetAmbientBackground';
import ModalPortal from '../components/common/ModalPortal';
import { playGoldCoinChime } from '../utils/audioChime';

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
  const [tiktokModalOpen, setTiktokModalOpen] = useState(false);
  const [tiktokLoading, setTiktokLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);

  const TIKTOK_CLIENT_KEY = 'sbawhzed8x3yk47hhl';
  const TIKTOK_CLIENT_SECRET = 'q3Z0xEG82MWcIGEZH6alfkJ0gWbLWlX8';

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
      desc: 'Sistem kemitraan adil, transparan, dan terpercaya untuk seluruh keluarga besar mitra SYNETIQ Indonesia.',
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
        localStorage.setItem('synetiq_token', res.data.data.token);
        localStorage.setItem('bionet_token', res.data.data.token);
        localStorage.setItem('synetiq_user', JSON.stringify(res.data.data.user));
        localStorage.setItem('bionet_user', JSON.stringify(res.data.data.user));
        if (rememberMe) {
          localStorage.setItem('synetiq_saved_username', username);
          localStorage.setItem('bionet_saved_username', username);
        } else {
          localStorage.removeItem('synetiq_saved_username');
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
      setPassword('synetiq123');
    } else if (role === 'gudang') {
      setUsername('gudang01');
      setPassword('synetiq123');
    } else {
      setUsername('mitra01');
      setPassword('synetiq123');
    }
    setError('');
  };

  const handleExecuteTikTokSandboxLogin = async () => {
    setTiktokLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username: 'mitra01', password: 'synetiq123' });
      if (res.data && res.data.data) {
        localStorage.setItem('synetiq_token', res.data.data.token);
        localStorage.setItem('bionet_token', res.data.data.token);
        const userData = {
          ...res.data.data.user,
          tiktok_connected: true,
          tiktok_account: '@tovankamil.official',
          tiktok_client_key: TIKTOK_CLIENT_KEY,
        };
        localStorage.setItem('synetiq_user', JSON.stringify(userData));
        localStorage.setItem('bionet_user', JSON.stringify(userData));
        playGoldCoinChime();
        setTiktokModalOpen(false);
        onLoginSuccess(userData);
      }
    } catch (err) {
      setError('Login TikTok Sandbox gagal: ' + (err.response?.data?.message || err.message));
    } finally {
      setTiktokLoading(false);
    }
  };

  const handleOpenTikTokOAuth = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/#/auth/tiktok/callback`);
    const oauthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${redirectUri}&state=synetiq_tiktok_sandbox`;
    window.open(oauthUrl, '_blank', 'width=600,height=700');
  };

  const handleCopyTikTokProperty = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="relative min-h-screen min-h-dvh flex flex-col items-center justify-between p-3 sm:p-6 font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* 1. Dynamic Ambient Background: Luxury Curved Glass & Live Coalescing Particles */}
      <SYNETIQAmbientBackground
        dimmed={false}
        activeMode={ambientBgMode}
        onModeChange={setAmbientBgMode}
      />

      {/* 2. Main Showcase Split Card: Apple Pro / Dribbble Ultra-Glossy Modern Glassmorphism */}
      <main className="relative z-10 w-full max-w-[1100px] my-auto py-5 transition-all duration-500">
        {/* Specular Highlight Rim Frame with Subtle Gradient Sheen */}
        <div className="relative p-[1px] rounded-[34px] sm:rounded-[40px] bg-gradient-to-b from-white/30 via-emerald-500/20 to-cyan-500/10 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.85),0_0_50px_rgba(16,185,129,0.12)]">
          <div className="w-full bg-slate-950/40 backdrop-blur-3xl rounded-[33px] sm:rounded-[39px] border border-white/15 p-3 sm:p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">

              {/* ==============================================================
                  LEFT COLUMN: Crystal-Clear Frosted Glass Pane with Dynamic
                  Holographic Biometric Cluster & Floating Glass Badges
                  (Static Orb Image 3 Removed as requested)
                  ============================================================== */}
              <div className="lg:col-span-6 rounded-[26px] sm:rounded-[32px] relative overflow-hidden flex flex-col justify-between p-5 sm:p-8 min-h-[320px] sm:min-h-[440px] lg:min-h-[610px] bg-white/[0.03] sm:bg-white/[0.04] backdrop-blur-2xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_20px_50px_rgba(0,0,0,0.5)] group">

                {/* Subtle Inner Glass Gradient & Caustics to let background particles shine through */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-slate-950/40 pointer-events-none" />
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

                {/* Top Row: Pill Tag & Platform Version */}
                <div className="relative z-20 flex items-center justify-between gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                    <Sparkles size={12} className="text-emerald-400" />
                    <span>Kemitraan Generasi Baru</span>
                  </span>

                  <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 px-3 py-1 rounded-full bg-black/40 border border-white/12 backdrop-blur-md shadow-xs">
                    <Activity size={11} className="text-teal-400" />
                    <span>SYNETIQ Intelligence v6</span>
                  </div>
                </div>

                {/* Centerpiece: Generative Holographic Biotech Core (Dynamic Network Node Cluster) */}
                <div className="relative z-20 my-auto py-6 sm:py-10 flex items-center justify-center select-none">
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                    {/* Soft Ambient Caustic Core Glow */}
                    <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-violet-500/15 blur-2xl animate-pulse" />

                    {/* Concentric Biometric Pulse Waves */}
                    <div className="absolute inset-0 rounded-full border border-emerald-500/25 animate-pulse-ring" />
                    <div
                      className="absolute inset-6 rounded-full border border-cyan-400/25 animate-pulse-ring"
                      style={{ animationDelay: '1.4s' }}
                    />
                    <div
                      className="absolute inset-12 rounded-full border border-violet-400/20 animate-pulse-ring"
                      style={{ animationDelay: '2.8s' }}
                    />

                    {/* Rotating SVG Orbital Track 1 (Outer Slow Orbit) */}
                    <svg
                      className="absolute inset-0 w-full h-full animate-orbit-slow pointer-events-none"
                      viewBox="0 0 288 288"
                      fill="none"
                    >
                      <circle
                        cx="144"
                        cy="144"
                        r="128"
                        stroke="rgba(255,255,255,0.14)"
                        strokeWidth="1"
                        strokeDasharray="4 8"
                      />
                      {/* Orbital Satellite Node 1 (Emerald) */}
                      <circle cx="144" cy="16" r="4.5" fill="#10b981" />
                      <circle cx="144" cy="16" r="9" fill="#10b981" fillOpacity="0.25" />
                      {/* Orbital Satellite Node 2 (Electric Violet) */}
                      <circle cx="272" cy="144" r="3.5" fill="#8b5cf6" />
                      <circle cx="272" cy="144" r="7.5" fill="#8b5cf6" fillOpacity="0.25" />
                    </svg>

                    {/* Counter-Rotating SVG Orbital Track 2 (Inner Reverse Orbit) */}
                    <svg
                      className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-orbit-reverse pointer-events-none"
                      viewBox="0 0 256 256"
                      fill="none"
                    >
                      <circle
                        cx="128"
                        cy="128"
                        r="92"
                        stroke="rgba(6,182,212,0.25)"
                        strokeWidth="1.2"
                        strokeDasharray="8 6"
                      />
                      {/* Orbital Satellite Node 3 (Cyan) */}
                      <circle cx="128" cy="36" r="4" fill="#06b6d4" />
                      <circle cx="128" cy="36" r="8" fill="#06b6d4" fillOpacity="0.3" />
                      {/* Orbital Satellite Node 4 (Gold) */}
                      <circle cx="50" cy="180" r="3.2" fill="#f59e0b" />
                      <circle cx="50" cy="180" r="6.5" fill="#f59e0b" fillOpacity="0.25" />
                    </svg>

                    {/* Centerpiece Crystal Frosted Sphere with Floating SYNETIQ Insignia */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full backdrop-blur-2xl bg-slate-950/60 border border-white/25 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_20px_40px_rgba(0,0,0,0.7),0_0_35px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center group-hover:scale-105 transition-transform duration-700">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-cyan-400/20 pointer-events-none" />

                      <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <Layers size={24} className="text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-emerald-300 uppercase mt-1.5 drop-shadow">
                          SYNETIQ
                        </span>
                      </div>

                      {/* Top Specular Curved Highlight */}
                      <div className="absolute top-1.5 left-4 right-4 h-5 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                    </div>

                    {/* Floating Glassmorphic Badges */}
                    {/* Floating Badge 1 (Top Right) */}
                    <div className="absolute -top-3 -right-2 sm:-right-4 animate-float-slow hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_30px_rgba(0,0,0,0.6)] text-[11px] text-white">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        <ShieldCheck size={13} className="text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-bold block leading-tight text-emerald-300">Bio-Herbal BPOM</span>
                        <span className="text-[9px] text-slate-300 font-normal">100% Alami &amp; Teruji</span>
                      </div>
                    </div>

                    {/* Floating Badge 2 (Middle Left) */}
                    <div className="absolute top-1/2 -left-3 sm:-left-6 -translate-y-1/2 animate-float-reverse hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_30px_rgba(0,0,0,0.6)] text-[11px] text-white">
                      <div className="w-6 h-6 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 font-bold shrink-0">
                        <Zap size={13} className="text-teal-400" />
                      </div>
                      <div>
                        <span className="font-bold block leading-tight text-teal-300">Flip.id Gateway</span>
                        <span className="text-[9px] text-slate-300 font-normal">Transfer Komisi 24 Jam</span>
                      </div>
                    </div>

                    {/* Floating Badge 3 (Bottom Right) */}
                    <div className="absolute -bottom-2 -right-1 sm:-right-3 animate-float-slow hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-950/60 backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_30px_rgba(0,0,0,0.6)] text-[11px] text-white">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
                        <Network size={13} className="text-amber-400" />
                      </div>
                      <div>
                        <span className="font-bold block leading-tight text-amber-300">Pohon Binary</span>
                        <span className="text-[9px] text-slate-300 font-normal">Anti-Sybil Closure Table</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Kinetic Rotating Storytelling */}
                <div className="relative z-20 pt-2 mt-auto">
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 backdrop-blur-xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_15px_35px_rgba(0,0,0,0.5)]">
                    <div className="transition-all duration-700 ease-out">
                      <h3 className="font-heading font-black text-lg sm:text-xl text-white tracking-tight leading-snug">
                        {headlines[activeHeadlineIdx].title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">
                        {headlines[activeHeadlineIdx].desc}
                      </p>
                    </div>

                    {/* Interactive Feature Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-3 text-[10px] font-bold text-slate-200">
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 shadow-xs flex items-center gap-1">
                        <Zap size={11} className="text-amber-400" />
                        <span>Flush-Out 12 Pasang</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 shadow-xs flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-400" />
                        <span>Anti-Sybil Security</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>


              {/* ==============================================================
                  RIGHT COLUMN: Luxury Glossy Modern Authentication Form
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

                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/35 flex items-center gap-1.5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Server Live</span>
                    </span>
                  </div>

                  {/* Heading & Subtitle */}
                  <div className="mt-5 mb-4">
                    <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                      Portal Mitra {branding?.app_name || 'SYNETIQ'}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Masuk untuk memantau omset tim, struktur jaringan, dan bonus harian Anda
                    </p>
                  </div>

                  {/* SYNETIQ Landing Page & Brainstorming Studio Banner */}
                  <a
                    href="#/landing"
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 hover:from-emerald-600/30 hover:to-cyan-600/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center justify-between transition shadow-lg shadow-emerald-950/40 group mb-5 backdrop-blur-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition" />
                      <span>Buka Landing Page SYNETIQ &amp; Studio</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-bold uppercase">
                      <span>Lihat Cuan</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                    </div>
                  </a>

                  {/* Error Banner */}
                  {error && (
                    <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md" role="alert">
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
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
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
                          className="glass-input-frosted w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-slate-400 outline-none transition-all duration-300"
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
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none cursor-pointer"
                        >
                          Lupa Kata Sandi?
                        </button>
                      </div>
                      <div className="relative flex items-center group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-400 transition-colors">
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
                          className="glass-input-frosted w-full rounded-2xl pl-11 pr-12 py-3.5 text-sm font-medium text-white placeholder:text-slate-400 outline-none transition-all duration-300"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 sm:p-2.5 rounded-lg transition-colors focus:outline-none active:scale-95 touch-manipulation cursor-pointer"
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
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-white/20 bg-slate-900/80 cursor-pointer"
                        />
                        <span className="text-xs text-slate-300 font-medium">Ingat saya di perangkat ini</span>
                      </label>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span>256-Bit SSL</span>
                      </div>
                    </div>

                    {/* High-Converting Liquid Glass CTA Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:via-teal-300 hover:to-cyan-300 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-heading font-black text-sm tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_12px_30px_-5px_rgba(16,185,129,0.5),0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9),0_16px_36px_-5px_rgba(16,185,129,0.65),0_0_30px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
                      <span className="relative z-10">{loading ? 'Memverifikasi Kredensial...' : 'Masuk ke Portal Mitra'}</span>
                      <ArrowRight size={17} className="relative z-10" />
                    </button>
                  </form>

                  {/* TikTok Login Kit Button (Integrated with Sandbox login_mlm) */}
                  <button
                    type="button"
                    onClick={() => setTiktokModalOpen(true)}
                    className="w-full py-3.5 rounded-full bg-slate-900/90 hover:bg-black text-white font-heading font-bold text-xs tracking-wide border border-white/15 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(0,242,254,0.35),0_0_20px_rgba(238,29,82,0.35)] transition-all duration-300 flex items-center justify-center gap-2.5 mt-3 cursor-pointer relative group overflow-hidden"
                  >
                    <svg className="w-4 h-4 fill-current drop-shadow-[1px_1px_0px_#00f2fe] text-white" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                    <span>Masuk dengan TikTok (login_mlm)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-mono">Sandbox</span>
                  </button>

                  {/* Divider: Or Continue With */}
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <span className="relative bg-slate-950/80 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 rounded-full">
                      Atau Masuk Cepat Demo (RBAC)
                    </span>
                  </div>

                  {/* Quick Demo Switcher Pills with Frosted Glass Styling */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUseDemo('member')}
                      className="py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-emerald-950/60 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>🌿 Mitra</span>
                      <span className="text-[9px] font-normal text-slate-400">mitra01</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUseDemo('admin')}
                      className="py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-amber-950/60 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 text-slate-200 hover:text-amber-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>👑 Admin</span>
                      <span className="text-[9px] font-normal text-slate-400">admin01</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUseDemo('gudang')}
                      className="py-2.5 px-3 rounded-2xl bg-white/[0.04] hover:bg-sky-950/60 backdrop-blur-xl border border-white/10 hover:border-sky-500/50 text-slate-200 hover:text-sky-300 text-xs font-bold flex flex-col items-center justify-center gap-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span>📦 Gudang</span>
                      <span className="text-[9px] font-normal text-slate-400">gudang01</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Social Proof Badge */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Overlapping User Avatars with Glowing Rings */}
                      <div className="flex -space-x-2 overflow-hidden">
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500/40 object-cover"
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                          alt="Mitra SYNETIQ 1"
                        />
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-teal-500/40 object-cover"
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                          alt="Mitra SYNETIQ 2"
                        />
                        <img
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-amber-500/40 object-cover"
                          src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
                          alt="Mitra SYNETIQ 3"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1">
                          <span>15.420+ Mitra Juara</span>
                          <CheckCircle2 size={13} className="text-emerald-400 fill-emerald-950" />
                        </div>
                        <span className="text-[10px] text-slate-300 block leading-tight">
                          Tersebar di 38 Provinsi &amp; Asia Tenggara
                        </span>
                      </div>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-300 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/35 shrink-0 shadow-xs">
                      Terverifikasi
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </main>

      {/* 4. Elegant Page Footer */}
      <footer className="relative z-10 text-center py-2 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <span>&copy; {new Date().getFullYear()} SYNETIQ Enterprise Platform. All rights reserved.</span>
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
            className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-white/15 relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center mb-4">
              <HelpCircle size={24} />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Bantuan Reset Sandi</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Untuk menjaga keamanan saldo dompet komisi Flip.id Anda, reset sandi akun mitra diverifikasi langsung melalui administrator stokis atau CS resmi SYNETIQ.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 space-y-2">
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
              className="w-full mt-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-emerald-500/30"
            >
              Mengerti &amp; Tutup
            </button>
          </div>
        </ModalPortal>
      )}

      {/* TikTok Login Sandbox Modal */}
      {tiktokModalOpen && (
        <ModalPortal
          isOpen={tiktokModalOpen}
          onClose={() => setTiktokModalOpen(false)}
          zIndex="z-[130]"
          backdropClassName="bg-slate-950/80 backdrop-blur-md"
        >
          <div
            className="w-full max-w-lg mx-4 rounded-3xl bg-slate-900/95 border border-white/15 p-6 shadow-2xl relative text-left overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Glow */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setTiktokModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg shadow-black/50">
                <svg className="w-6 h-6 fill-current drop-shadow-[1px_1px_0px_#00f2fe] text-white" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-white">TikTok Sandbox: login_mlm</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">Sandbox Ready</span>
                </div>
                <p className="text-xs text-slate-400">Terhubung dengan TikTok Developer App Anda</p>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client Key:</span>
                <span className="font-mono text-cyan-300 font-bold">{TIKTOK_CLIENT_KEY}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Client Secret:</span>
                <span className="font-mono text-slate-300">q3Z0xEG82MWcIGEZH...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Scope:</span>
                <span className="font-mono text-emerald-400">user.info.basic</span>
              </div>
            </div>

            {/* Action 1: Instant Sandbox Login */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleExecuteTikTokSandboxLogin}
                disabled={tiktokLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={16} />
                <span>{tiktokLoading ? 'Mengautentikasi Sandbox...' : 'Masuk Langsung via Sandbox TikTok (@mitra01)'}</span>
              </button>

              {/* Action 2: Live OAuth Dialog */}
              <button
                type="button"
                onClick={handleOpenTikTokOAuth}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ExternalLink size={14} className="text-rose-400" />
                <span>Buka Dialog Login TikTok OAuth Resmi</span>
              </button>
            </div>

            {/* URL Properties Helper */}
            <div className="mt-5 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Code2 size={13} className="text-cyan-400" />
                  <span>Isian Tombol "URL Properties" di TikTok Sandbox Anda:</span>
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5 font-mono">
                  <div className="truncate mr-2">
                    <span className="text-slate-500">Redirect URI: </span>
                    <span className="text-cyan-300">{`${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173'}/#/auth/tiktok/callback`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTikTokProperty(`${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173'}/#/auth/tiktok/callback`, 'redirect')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'redirect' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-white/5 font-mono">
                  <div className="truncate mr-2">
                    <span className="text-slate-500">Webhook URL: </span>
                    <span className="text-emerald-300">https://synetiq.id/api/public/leads/webhook?key=tiktok_ads</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyTikTokProperty('https://synetiq.id/api/public/leads/webhook?key=tiktok_ads', 'wh')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'wh' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
