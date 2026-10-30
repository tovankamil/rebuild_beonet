import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Users,
  GitFork,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Landmark,
  UserCheck,
  UserPlus,
  Edit3,
  RefreshCw,
  Store,
  Calculator,
  CreditCard,
  Link2,
  Trophy,
  GraduationCap,
  Stethoscope,
  PenTool,
  Mic,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import DashPagination from './dashlite/DashPagination';
import api from '../services/api';
import AffiliateStoreModal from './store/AffiliateStoreModal';
import SmartROReminderCard from './crm/SmartROReminderCard';
import RecentJoinedMembersBar from './dashboard/RecentJoinedMembersBar';
import RegisterDownlineModal from './RegisterDownlineModal';
import BioLinkBuilderModal from './biolink/BioLinkBuilderModal';
import MarketingKitModal from './marketing/MarketingKitModal';
import WebinarFunnelModal from './marketing/WebinarFunnelModal';
import LeaderboardModal from './gamification/LeaderboardModal';
import BionetAcademyModal from './gamification/BionetAcademyModal';
import DownlineInactivityCard from './gamification/DownlineInactivityCard';

export default function OverviewTab({
  stats,
  setActiveTab,
  currentUser,
  onOpenProfile,
  onProfileUpdated,
  onOpenProspectCalculator,
  onOpenDigitalCard,
  onOpenCertificate,
}) {
  const [chartHoverIndex, setChartHoverIndex] = useState(null);
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(5);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [showBioLinkModal, setShowBioLinkModal] = useState(false);
  const [showMarketingKitModal, setShowMarketingKitModal] = useState(false);
  const [showWebinarModal, setShowWebinarModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAcademyModal, setShowAcademyModal] = useState(false);

  const fetchRecentMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await api.get('/dashboard/recent-members');
      setRecentMembers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load recent members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchRecentMembers();
  }, []);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const pointLeft = stats?.point_balance?.point_left || 125;
  const pointRight = stats?.point_balance?.point_right || 98;
  const totalPoints = pointLeft + pointRight || 1;
  const leftPct = Math.round((pointLeft / totalPoints) * 100);
  const rightPct = 100 - leftPct;
  const pairedPoints = Math.min(pointLeft, pointRight);
  const estPairingBonus = pairedPoints * 25000;

  // 7-day demo omset curve
  const omsetDays = [
    { day: 'Sen', omset: 1250000, points: 15 },
    { day: 'Sel', omset: 2400000, points: 28 },
    { day: 'Rab', omset: 1850000, points: 22 },
    { day: 'Kam', omset: 3100000, points: 36 },
    { day: 'Jum', omset: 2750000, points: 30 },
    { day: 'Sab', omset: 4200000, points: 52 },
    { day: 'Min', omset: 3800000, points: 45 },
  ];

  const recentTxList = (stats?.recent_transactions && stats.recent_transactions.length > 0)
    ? stats.recent_transactions
    : [
        { id: '7f9a2b8e-1', type: 'credit', amount: 500000, description: 'Bonus Sponsor Baru (Mitra @agus_bionet)', created_at: '2026-10-27T09:15:00Z', status: 'Selesai' },
        { id: '3d4c1a5b-2', type: 'credit', amount: 250000, description: 'Bonus Pasangan Binary (10 Pasang Harian)', created_at: '2026-10-26T23:59:00Z', status: 'Selesai' },
        { id: '118fae49-3', type: 'debit', amount: 1000000, description: 'Pencairan Saldo ke Rekening BCA', created_at: '2026-10-25T14:20:00Z', status: 'Berhasil Ditransfer' },
      ];

  const totalTxPages = Math.ceil(recentTxList.length / txPageSize) || 1;
  const paginatedRecentTx = recentTxList.slice((txPage - 1) * txPageSize, txPage * txPageSize);

  return (
    <div className="space-y-6">
      {/* DashLite Demo 3 Page Title Block (nk-block-head) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Sales & Overview Kemitraan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Selamat datang di panel kendali Bionet. Pantau omset, bonus pasangan, dan mutasi saldo secara real-time.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto flex-wrap">
          {onOpenProspectCalculator && (
            <button
              onClick={onOpenProspectCalculator}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-xs w-full sm:w-auto"
              title="Kalkulator Simulasi Bonus Duplikasi Binary & Presentasi Prospek"
            >
              <Calculator size={15} className="text-amber-700" />
              <span>Simulasi Prospek</span>
            </button>
          )}
          {onOpenDigitalCard && (
            <button
              onClick={onOpenDigitalCard}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-colors shadow-xs w-full sm:w-auto"
              title="Buka Kartu Tanda Anggota (KTA) Digital Resmi BPOM"
            >
              <CreditCard size={15} className="text-emerald-700" />
              <span>KTA Digital</span>
            </button>
          )}
          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs w-full sm:w-auto"
              title="Lihat & Unduh E-Sertifikat Kemitraan Resmi"
            >
              <Award size={15} className="text-amber-600" />
              <span>E-Sertifikat</span>
            </button>
          )}
          <button
            onClick={() => onOpenProfile && onOpenProfile('profile')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Edit3 size={15} className="text-emerald-600" />
            <span>Edit Profil & KYC</span>
          </button>
          <button
            onClick={() => setShowStoreModal(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors shadow-xs w-full sm:w-auto"
            title="Kelola Toko Online Afiliasi Mandiri Anda"
          >
            <Store size={15} className="text-teal-600" />
            <span>Toko Afiliasi Saya</span>
          </button>
          <button
            onClick={() => setActiveTab('genealogy')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm w-full sm:w-auto"
          >
            <GitFork size={15} className="text-emerald-600" />
            <span>Pohon Jaringan</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm shadow-emerald-600/30 w-full sm:w-auto"
          >
            <Landmark size={15} />
            <span>Tarik Saldo</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 PILAR AKSI CEPAT MITRA: BIO-LINK, MARKETING KIT, LEADERBOARD, ACADEMY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setShowBioLinkModal(true)}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-700/20 flex items-center justify-between transition group active:scale-[0.98]"
          title="Kelola & Kustomisasi Halaman Bio-Link Pribadi Anda"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Link2 size={18} />
            </div>
            <div className="text-left">
              <span className="font-heading font-black text-xs block leading-tight">Bio-Link Saya</span>
              <span className="text-[10px] text-emerald-100 opacity-90">Landing Page Mikro</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/70 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        <button
          onClick={() => setShowMarketingKitModal(true)}
          className="p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-300 text-slate-800 shadow-xs flex items-center justify-between transition group active:scale-[0.98]"
          title="Studio Flyer Promosi Berstempel & Naskah Copywriting"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-xs block leading-tight text-slate-900">Marketing Kit</span>
              <span className="text-[10px] text-slate-500">Flyer Berstempel HD</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        <button
          onClick={() => setShowLeaderboardModal(true)}
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-300 text-slate-800 shadow-xs flex items-center justify-between transition group active:scale-[0.98]"
          title="Papan Peringkat Juara Nasional & Tracker Reward Impian"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Trophy size={18} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-xs block leading-tight text-slate-900">Leaderboard &amp; Reward</span>
              <span className="text-[10px] text-slate-500">Peringkat &amp; Reward</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        <button
          onClick={() => setShowAcademyModal(true)}
          className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/90 hover:border-emerald-300 text-slate-800 shadow-xs flex items-center justify-between transition group active:scale-[0.98]"
          title="Akademi Mandiri Kurikulum 7 Hari & Kuis Bersertifikat"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-xs block leading-tight text-slate-900">Bionet Academy</span>
              <span className="text-[10px] text-slate-500">Kurikulum 7 Hari</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition shrink-0" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* PUSAT FITUR AI CERDAS BIONET (LUXURY BIO-EMERALD SUITE) */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 sm:p-5 border border-emerald-500/20 text-white shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/15 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-400/20">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-sm text-white">
                  Bionet AI Intelligence Suite
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  6 Modul Cerdas
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Otomasi resep herbal, copywriting multi-platform, penasihat binary, dan radar retensi tim.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('bionet:open-copilot'))}
            className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-[0.98]"
          >
            <Sparkles size={13} />
            <span>Tanya Asisten AI</span>
          </button>
        </div>

        {/* 6 Grid Modules */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'health' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Stethoscope size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
              Resep Herbal AI
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              Konsultasi &amp; Dosis BPOM
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'copywriting' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <PenTool size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
              Copywriting Viral
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              WA Status, IG &amp; TikTok
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'binary' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <GitFork size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-teal-300 transition">
              Penasihat Binary
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              Bonus Pairing Mengendap
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'churn' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Activity size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-rose-300 transition">
              Radar Retensi
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              Cegah Kejenuhan Tim
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'voicenote' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Mic size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
              Voice Note WA
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              Sapaan Audio Prospek
            </div>
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('bionet:open-ai-module', { detail: { module: 'fraud' } }))}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 text-left transition group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <ShieldCheck size={16} />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-blue-300 transition">
              Audit Forensik
            </div>
            <div className="text-[10px] text-slate-400 line-clamp-1">
              Verifikasi KTP &amp; Mutasi
            </div>
          </button>
        </div>
      </div>

      {/* MITRA BARU BERGABUNG (SOFI-INSPIRED CIRCULAR AVATARS STRIP) */}
      {/* Posisi strategis Above-The-Fold: langsung terlihat saat login */}
      {/* ======================================================== */}
      <RecentJoinedMembersBar
        members={recentMembers}
        loading={loadingMembers}
        onRefresh={fetchRecentMembers}
        onOpenRegister={() => setRegisterModalOpen(true)}
        onNavigateTree={() => setActiveTab('genealogy')}
      />

      {/* KPI Stat Cards Grid (DashLite Demo 3 Card Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Dompet */}
        <div className="dash-card p-5 border-t-4 border-t-emerald-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Saldo Dompet Tunai
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Siap ditarik ke rekening</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(stats?.wallet_balance)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="badge-dot badge-dot-success text-[11px] font-semibold text-emerald-700">
              Tersedia via Flip.id
            </span>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 text-[11px]"
            >
              <span>Pencairan</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Card 2: Bonus Sponsor */}
        <div className="dash-card p-5 border-t-4 border-t-cyan-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Bonus Sponsor
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Komisi referral langsung</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(stats?.total_sponsor_bonus || 1450000)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
              <ArrowUpRight size={12} /> +12.5%
            </span>
            <span>Bulan Ini</span>
          </div>
        </div>

        {/* Card 3: Bonus Pasangan */}
        <div className="dash-card p-5 border-t-4 border-t-amber-500">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Bonus Pasangan
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">{pairedPoints} Pasang Seimbang</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {formatRupiah(estPairingBonus)}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Rp 25.000 / pasang</span>
            <span className="text-amber-600 font-bold text-[11px]">Harian</span>
          </div>
        </div>

        {/* Card 4: Total Mitra Downline */}
        <div className="dash-card p-5 border-t-4 border-t-teal-600">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Total Jaringan
              </span>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Closure Table Node</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <GitFork size={20} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              {stats?.total_downlines || 223} <span className="text-sm font-medium text-slate-400">Mitra</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-teal-700 font-semibold">Aktif 100%</span>
            <button
              onClick={() => setActiveTab('referrals')}
              className="text-slate-600 hover:text-emerald-600 font-semibold text-[11px]"
            >
              Lihat Daftar
            </button>
          </div>
        </div>
      </div>

      {/* Discovery Banner: Toko Online Afiliasi Mandiri */}
      <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white shadow-md border border-teal-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Store size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm md:text-base font-bold text-white">Toko Online Afiliasi Anda Siap Digunakan!</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Reseller Store
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Sebarkan link toko kustom Anda ke konsumen. Margin keuntungan ritel langsung masuk ke dompet Anda saat terjadi pembelian.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowStoreModal(true)}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition self-start sm:self-auto flex items-center space-x-1.5 shrink-0"
        >
          <Store size={14} />
          <span>Buka &amp; Kelola Toko Saya</span>
        </button>
      </div>

      {/* Main Section: Omset Chart & Pairing Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Omset Chart (Col 8) */}
        <div className="lg:col-span-8 dash-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-800">
                Grafik Omset & Pertumbuhan Kemitraan (7 Hari Terakhir)
              </h4>
              <p className="text-xs text-slate-400">
                Pergerakan volume penjualan paket hak usaha dan Repeat Order (RO)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-600">
                <Calendar size={13} />
                <span>Minggu Ini</span>
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative pt-4 pb-2">
            <div className="h-48 w-full flex items-end justify-between gap-3 px-2">
              {omsetDays.map((item, idx) => {
                const heightPct = Math.round((item.omset / 4500000) * 100);
                const isHovered = chartHoverIndex === idx;
                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setChartHoverIndex(idx)}
                    onMouseLeave={() => setChartHoverIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{formatRupiah(item.omset)}</div>
                        <div className="text-[10px] text-emerald-400">{item.points} PV Poin</div>
                      </div>
                    )}
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-emerald-500 shadow-md shadow-emerald-500/30'
                          : 'bg-emerald-100 hover:bg-emerald-200'
                      }`}
                    />
                    {/* Day label */}
                    <span className="text-[11px] font-semibold text-slate-500 mt-2">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart Summary Stats Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Omset 7 Hari</span>
              <p className="font-heading font-bold text-base text-slate-800 mt-0.5">Rp 19.250.000</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Rata-Rata Harian</span>
              <p className="font-heading font-bold text-base text-slate-800 mt-0.5">Rp 2.750.000</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Pertumbuhan</span>
              <p className="font-heading font-bold text-base text-emerald-600 mt-0.5">+18.4%</p>
            </div>
          </div>
        </div>

        {/* Right: High-Tech Pairing Meter & Rank Qualification (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pairing Points Split Box */}
          <div className="dash-card p-6 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="font-heading font-bold text-sm text-slate-800">
                  Rasio Kaki Binary (Pairing)
                </h5>
                <p className="text-[11px] text-slate-400">Keseimbangan Omset Kiri & Kanan</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                1:1 Matching
              </span>
            </div>

            {/* Split Columns */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3.5 rounded-lg bg-cyan-50/70 border border-cyan-100 text-center">
                <span className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider">
                  ◀ Kaki Kiri (L)
                </span>
                <div className="font-heading font-extrabold text-2xl text-cyan-900 mt-1">
                  {pointLeft}
                </div>
                <span className="text-[10px] text-cyan-600 font-medium">Poin Volume</span>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Kaki Kanan (R) ▶
                </span>
                <div className="font-heading font-extrabold text-2xl text-emerald-900 mt-1">
                  {pointRight}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Poin Volume</span>
              </div>
            </div>

            {/* Progress Split Bar */}
            <div className="space-y-1.5 mt-4">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Kiri: {leftPct}%</span>
                <span>Kanan: {rightPct}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div style={{ width: `${leftPct}%` }} className="bg-cyan-500 h-full" />
                <div style={{ width: `${rightPct}%` }} className="bg-emerald-500 h-full" />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Bonus pasangan dihitung dari kaki yang lebih kecil ({pairedPoints} pasang = {formatRupiah(estPairingBonus)}). Sisa poin tersimpan (tidak hangus / Carry Forward).
              </p>
            </div>
          </div>

          {/* Bank Account Verification Card */}
          <div className="dash-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" />
                <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Rekening Pencairan Bank
                </h5>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Terverifikasi
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Nama Bank</div>
              <div className="font-bold text-sm text-slate-800">
                {stats?.bank?.bank_name || 'BCA (Bank Central Asia)'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Nomor Rekening</div>
              <div className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                {stats?.bank?.account_number || '8830-1928-4820'}
              </div>
              <div className="text-xs text-slate-500 mt-2">Atas Nama</div>
              <div className="font-semibold text-xs text-slate-700 uppercase">
                {stats?.bank?.account_name || stats?.user?.full_name || 'MITRA BIONET MANDIRI'}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('bank')}
              className="w-full mt-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
            >
              Ubah Data Rekening
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODULE 6: SMART RO REMINDER & CRM RETENSI PELANGGAN      */}
      {/* ======================================================== */}
      <SmartROReminderCard user={currentUser} />

      {/* GAMIFIKASI & DUPLIKASI: RADAR PENDAMPINGAN DOWNLINE PASIF */}
      <DownlineInactivityCard
        user={currentUser}
        onNavigateTree={() => setActiveTab('genealogy')}
      />

      {/* Bottom: Recent Activity & Quick Ledger (DashLite nk-tb-list style) */}
      <div className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800">
              Riwayat Transaksi & Mutasi Dompet Terbaru
            </h4>
            <p className="text-xs text-slate-400">
              Catatan mutasi komisi bonus masuk dan penarikan saldo secara transparan
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Buka Buku Besar</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  No. Transaksi (UUID)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tipe Mutasi
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nominal (IDR)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Keterangan
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRecentTx.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                      #{tx.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                          isCredit
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                        {isCredit ? 'Kredit' : 'Debit'}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-5 font-bold font-heading text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-slate-700 font-medium">
                      {tx.description || 'Mutasi saldo sistem'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID') : 'Hari ini'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                        {tx.status || 'Selesai'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <DashPagination
          currentPage={txPage}
          totalPages={totalTxPages}
          totalItems={recentTxList.length}
          pageSize={txPageSize}
          pageSizeOptions={[3, 5, 10, 25]}
          onPageChange={setTxPage}
          onPageSizeChange={setTxPageSize}
        />
      </div>

      {/* Affiliate Replicated Storefront Modal */}
      {showStoreModal && (
        <AffiliateStoreModal
          user={currentUser}
          onClose={() => setShowStoreModal(false)}
        />
      )}

      {/* Modals: Bio-Link, Marketing Kit, Webinar, Leaderboard, Academy */}
      {showBioLinkModal && (
        <BioLinkBuilderModal
          user={currentUser}
          onClose={() => setShowBioLinkModal(false)}
        />
      )}
      {showMarketingKitModal && (
        <MarketingKitModal
          user={currentUser}
          onClose={() => setShowMarketingKitModal(false)}
        />
      )}
      {showWebinarModal && (
        <WebinarFunnelModal
          user={currentUser}
          onClose={() => setShowWebinarModal(false)}
        />
      )}
      {showLeaderboardModal && (
        <LeaderboardModal
          user={currentUser}
          stats={stats}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}
      {showAcademyModal && (
        <BionetAcademyModal
          user={currentUser}
          onClose={() => setShowAcademyModal(false)}
        />
      )}

      {/* Modal Registrasi Mitra Baru Langsung dari Slot (+) Bar */}
      {registerModalOpen && (
        <RegisterDownlineModal
          isOpen={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          upline={currentUser}
          onSuccess={() => {
            fetchRecentMembers();
            if (onProfileUpdated) onProfileUpdated({});
          }}
        />
      )}
    </div>
  );
}
