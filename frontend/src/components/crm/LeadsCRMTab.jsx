import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  MessageSquare,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Trash2,
  Edit2,
  Copy,
  Check,
  Send,
  Layers,
  RefreshCw,
  X,
  Droplets,
  HeartHandshake,
  Zap,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import api from '../../services/api';
import ModalPortal from '../common/ModalPortal';
import SmartROReminderCard from './SmartROReminderCard';
import CrmKanbanBoard from './CrmKanbanBoard';
import CustomerHealthJourneyView from './CustomerHealthJourneyView';
import AIObjectionHandlerModal from './AIObjectionHandlerModal';
import TestimonialVaultView from './TestimonialVaultView';
import CrmWebhookView from './CrmWebhookView';
import WhatsAppMessengerSuite from './WhatsAppMessengerSuite';
import { downloadVCardContact, downloadBatchVCard } from '../../utils/vCardGenerator';

export default function LeadsCRMTab({ user }) {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    webinar: 0,
    closing: 0,
    conversion_rate: '0.0',
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [tablePage, setTablePage] = useState(1);
  const [tablePerPage, setTablePerPage] = useState(15);

  const totalTablePages = Math.ceil(leads.length / tablePerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (tablePage - 1) * tablePerPage;
    return leads.slice(start, start + tablePerPage);
  }, [leads, tablePage, tablePerPage]);
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('bionet_crm_view') || 'kanban';
    } catch {
      return 'kanban';
    }
  });

  useEffect(() => {
    const handleCrmView = (e) => {
      if (e.detail?.view) {
        setViewMode(e.detail.view);
      }
    };
    window.addEventListener('bionet:crm-view', handleCrmView);
    return () => window.removeEventListener('bionet:crm-view', handleCrmView);
  }, []);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // AI Objection Handler Modal State
  const [objectionModalOpen, setObjectionModalOpen] = useState(false);
  const [objectionLead, setObjectionLead] = useState(null);

  // AI Follow-up Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTone, setAiTone] = useState('ramah dan bersahabat');
  const [aiGoal, setAiGoal] = useState('sapaan_awal');
  const [aiCustomNotes, setAiCustomNotes] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiWhatsAppUrl, setAiWhatsAppUrl] = useState('');
  const [copiedAiText, setCopiedAiText] = useState(false);
  const [aiDirectSending, setAiDirectSending] = useState(false);
  const [aiDirectSendAlert, setAiDirectSendAlert] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formSource, setFormSource] = useState('manual');
  const [formProduct, setFormProduct] = useState('Bio-Propolis Trigona');
  const [formStatus, setFormStatus] = useState('new');
  const [formNotes, setFormNotes] = useState('');
  const [formValue, setFormValue] = useState(250000);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: {
          q: searchQuery,
          status: statusFilter,
          source: sourceFilter,
        },
      });
      if (res.data) {
        setLeads(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [searchQuery, statusFilter, sourceFilter]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCity('');
    setFormSource('manual');
    setFormProduct('Bio-Propolis Trigona');
    setFormStatus('new');
    setFormNotes('');
    setFormValue(250000);
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/leads', {
        name: formName,
        phone: formPhone,
        email: formEmail,
        city: formCity,
        source: formSource,
        product_interest: formProduct,
        status: formStatus,
        notes: formNotes,
        estimated_value: Number(formValue) || 0,
      });
      if (res.data?.status === 'success') {
        alert('Prospek berhasil ditambahkan!');
        setCreateModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      alert('Gagal menambah prospek: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleOpenEdit = (lead) => {
    setSelectedLead(lead);
    setFormName(lead.name);
    setFormPhone(lead.phone);
    setFormEmail(lead.email || '');
    setFormCity(lead.city || '');
    setFormSource(lead.source || 'manual');
    setFormProduct(lead.product_interest || '');
    setFormStatus(lead.status || 'new');
    setFormNotes(lead.notes || '');
    setFormValue(lead.estimated_value || 0);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      const res = await api.put(`/leads/${selectedLead.id}`, {
        name: formName,
        phone: formPhone,
        email: formEmail,
        city: formCity,
        source: formSource,
        product_interest: formProduct,
        status: formStatus,
        notes: formNotes,
        estimated_value: Number(formValue) || 0,
      });
      if (res.data?.status === 'success') {
        alert('Data prospek berhasil diperbarui!');
        setEditModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      alert('Gagal memperbarui prospek: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteLead = async (id, name) => {
    if (!window.confirm(`Hapus prospek "${name}" dari daftar CRM?`)) return;
    try {
      await api.delete(`/leads/${id}`);
      alert('Prospek berhasil dihapus');
      fetchLeads();
    } catch (err) {
      alert('Gagal menghapus: ' + (err.response?.data?.error || err.message));
    }
  };

  // Quick Status Change with backend fallback
  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/crm/leads/${leadId}/status`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      try {
        await api.put(`/leads/${leadId}`, { status: newStatus });
        fetchLeads();
      } catch (e) {
        console.error('Quick status update failed:', e);
      }
    }
  };

  // Open Objection Handler Modal
  const handleOpenObjectionModal = (lead = null) => {
    setObjectionLead(lead);
    setObjectionModalOpen(true);
  };

  // AI WhatsApp Follow-up Generator
  const handleOpenAiFollowUp = async (lead) => {
    setSelectedLead(lead);
    setAiGeneratedText('');
    setAiWhatsAppUrl('');
    setAiModalOpen(true);
    generateAiMessage(lead, aiTone, aiGoal, aiCustomNotes);
  };

  const generateAiMessage = async (lead, tone, goal, customNotes) => {
    setAiGenerating(true);
    try {
      const res = await api.post(`/leads/${lead.id}/ai-followup`, {
        tone,
        goal,
        custom_notes: customNotes,
      });
      if (res.data?.message_text) {
        setAiGeneratedText(res.data.message_text);
        setAiWhatsAppUrl(res.data.whatsapp_url);
      }
    } catch (err) {
      alert('Gagal menghasilkan pesan AI: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopyAiText = () => {
    if (!aiGeneratedText) return;
    navigator.clipboard.writeText(aiGeneratedText);
    setCopiedAiText(true);
    setTimeout(() => setCopiedAiText(false), 2000);
  };

  const handleSendAiDirect = async () => {
    if (!selectedLead?.phone || !aiGeneratedText) return;
    setAiDirectSending(true);
    setAiDirectSendAlert('');
    try {
      await api.post('/crm/whatsapp/send-direct', {
        lead_id: selectedLead.id,
        phone: selectedLead.phone,
        recipient: selectedLead.name,
        category: 'crm_followup',
        message: aiGeneratedText,
      });
      setAiDirectSendAlert('Pesan terkirim via WhatsApp Gateway!');
      handleQuickStatusChange(selectedLead.id, 'contacted');
      setTimeout(() => setAiDirectSendAlert(''), 4500);
    } catch (err) {
      alert('Gagal mengirim langsung via server: ' + (err.response?.data?.message || err.message));
    } finally {
      setAiDirectSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 border border-red-500/20 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Prospek Baru</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Dihubungi</span>
          </span>
        );
      case 'interested':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span>Berminat</span>
          </span>
        );
      case 'webinar':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20 flex items-center space-x-1">
            <Flame className="w-3 h-3 text-purple-500" />
            <span>Ikut BOP Webinar</span>
          </span>
        );
      case 'closing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Closing / Member</span>
          </span>
        );
      case 'lost':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Batal / Tidak Aktif
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'store_affiliate':
        return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Toko Afiliasi</span>;
      case 'webinar_bop':
      case 'webinar_guest':
        return <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">Tamu Webinar BOP</span>;
      case 'referral_link':
        return <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Link Referral</span>;
      case 'instagram':
        return <span className="text-[10px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">Instagram</span>;
      case 'tiktok':
        return <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300">TikTok</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">Offline / Manual</span>;
    }
  };

  // Modern CRM Tabs Navigation Definition
  const CRM_TABS = [
    {
      key: 'whatsapp-suite',
      label: 'WhatsApp Live & Gateway Suite',
      icon: MessageCircle,
      badge: 'Live',
    },
    {
      key: 'kanban',
      label: 'Papan Kanban',
      icon: Layers,
      badge: leads.length,
    },
    {
      key: 'table',
      label: 'Daftar Tabel Prospek',
      icon: Filter,
      badge: null,
    },
    {
      key: 'health-journey',
      label: 'Customer Health Journey (3-25 Hari)',
      icon: HeartHandshake,
      badge: 'Siklus',
    },
    {
      key: 'testimonials',
      label: 'Bank Testimoni',
      icon: MessageSquare,
      badge: 'BPOM',
    },
    {
      key: 'webhook',
      label: 'Integrasi Webhook Iklan',
      icon: Zap,
      badge: 'Meta/TikTok',
    },
    {
      key: 'ro-reminders',
      label: 'Smart RO Reminder',
      icon: Droplets,
      badge: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Sistem CRM &amp; Pipeline Konversi Mitra Terintegrasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Pusat Leads, Health Journey &amp; Otomasi Penjualan
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Pantau prospek dari Meta &amp; TikTok Ads, gerakkan kartu Kanban secara visual, dampingi konsumen herbal dalam siklus 3-7-14-25 hari, dan atasi keraguan pembeli dengan Asisten AI Penjual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            {/* Header Action: Buka WhatsApp Suite */}
            <button
              onClick={() => setViewMode('whatsapp-suite')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/40 flex items-center space-x-2 animate-in fade-in"
              title="Buka WhatsApp Web Messenger, Broadcast & Bot Gateway"
            >
              <MessageCircle className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>WhatsApp Suite</span>
            </button>

            {/* Header Action: Ekspor Kontak HP (.vcf) */}
            <button
              onClick={() => downloadBatchVCard(leads, 'semua-prospek-bionet-crm')}
              disabled={leads.length === 0}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center space-x-1.5"
              title="Download semua kontak prospek dalam file .vcf untuk disimpan ke buku telepon HP"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Simpan Kontak (.vcf)</span>
            </button>

            {/* Header Action: Asisten AI Penjual (Objection Handler) */}
            <button
              onClick={() => handleOpenObjectionModal(null)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/40 flex items-center space-x-2 animate-in fade-in"
              title="Buka Asisten Penjawab Keraguan Konsumen"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Asisten AI Penjual</span>
            </button>

            {/* Header Action: Tambah Prospek Manual */}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-950 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Prospek</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards (Overview Pipeline) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Semua prospek masuk</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs bg-gradient-to-b from-white to-red-50/20">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center justify-between">
            <span>Prospek Baru</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-red-700 mt-1">{stats.new}</div>
          <div className="text-[10px] text-red-500/80 mt-0.5">Belum dihubungi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs bg-gradient-to-b from-white to-amber-50/20">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Dihubungi</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{stats.contacted}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Sedang follow-up</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs bg-gradient-to-b from-white to-blue-50/20">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Berminat</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{stats.interested}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Tanya dosis &amp; harga</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs bg-gradient-to-b from-white to-purple-50/20">
          <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Ikut Webinar</div>
          <div className="text-2xl font-black text-purple-700 mt-1">{stats.webinar}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Sesi BOP Nasional</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-b from-white to-emerald-50/30">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center justify-between">
            <span>Closing Member</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.closing}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Konversi: {stats.conversion_rate}%</div>
        </div>
      </div>

      {/* Top Modern Tab Switcher Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto">
        <div className="flex items-center space-x-1.5 min-w-max">
          {CRM_TABS.map((tab) => {
            const isActive = viewMode === tab.key;
            const IconComp = tab.icon;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setViewMode(tab.key); try { localStorage.setItem('bionet_crm_view', tab.key); } catch {} }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Filters & Search (Only displayed on Kanban & Table views) */}
      {(viewMode === 'kanban' || viewMode === 'table') && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, WhatsApp, kota, produk..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Status</option>
              <option value="new">🔴 Prospek Baru</option>
              <option value="contacted">🟡 Dihubungi</option>
              <option value="interested">🔵 Berminat</option>
              <option value="webinar">🟣 Ikut Webinar</option>
              <option value="closing">🟢 Closing / Member</option>
              <option value="lost">⚪ Tidak Aktif</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Sumber</option>
              <option value="store_affiliate">Toko Afiliasi</option>
              <option value="webinar_bop">Tamu Webinar BOP</option>
              <option value="referral_link">Link Referral</option>
              <option value="manual">Manual / Offline</option>
            </select>
          </div>

          <button
            onClick={fetchLeads}
            className="px-3 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 text-xs font-bold transition flex items-center space-x-1.5 self-end md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      )}

      {/* VIEW 0: WHATSAPP LIVE & GATEWAY SUITE */}
      {viewMode === 'whatsapp-suite' && (
        <WhatsAppMessengerSuite
          user={user}
          onOpenObjectionModal={handleOpenObjectionModal}
        />
      )}

      {/* VIEW 1: PAPAN VISUAL KANBAN CRM */}
      {viewMode === 'kanban' && (
        <CrmKanbanBoard
          leads={leads}
          onStatusChange={handleQuickStatusChange}
          onOpenAiFollowUp={handleOpenAiFollowUp}
          onOpenObjectionHandler={handleOpenObjectionModal}
          onOpenEdit={handleOpenEdit}
          onDeleteLead={handleDeleteLead}
          onOpenCreate={handleOpenCreate}
        />
      )}

      {/* VIEW 2: DAFTAR TABEL PROSPEK */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No.</th>
                  <th className="py-3 px-4">Nama Prospek</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4">Kota</th>
                  <th className="py-3 px-4">Minat Produk / Topik</th>
                  <th className="py-3 px-4">Sumber</th>
                  <th className="py-3 px-4">Status Pipeline</th>
                  <th className="py-3 px-4">Estimasi Nilai</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      Belum ada data prospek yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead, index) => {
                    const rowNumber = (tablePage - 1) * tablePerPage + index + 1;
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center font-mono text-[11px] font-bold text-slate-400">
                          {rowNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{lead.name}</div>
                          {lead.email && <div className="text-[10px] text-slate-400">{lead.email}</div>}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                          <a
                            href={`https://wa.me/${lead.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-emerald-600 flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{lead.phone}</span>
                          </a>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{lead.city || '-'}</td>
                        <td className="py-3 px-4 font-medium text-indigo-700">{lead.product_interest || '-'}</td>
                        <td className="py-3 px-4">{getSourceBadge(lead.source)}</td>
                        <td className="py-3 px-4">{getStatusBadge(lead.status)}</td>
                        <td className="py-3 px-4 font-mono text-slate-800">
                          {lead.estimated_value ? `Rp ${Number(lead.estimated_value).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-1.5">
                            {/* Simpan Kontak .vcf */}
                            <button
                              onClick={() =>
                                downloadVCardContact({
                                  name: lead.name,
                                  phone: lead.phone,
                                  city: lead.city,
                                  notes: `Prospek: ${lead.product_interest || ''}`,
                                })
                              }
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center space-x-1 border border-indigo-200 transition"
                              title="Simpan Kontak ke HP (.vcf)"
                            >
                              <Smartphone className="w-3 h-3 text-indigo-600" />
                              <span>.vcf</span>
                            </button>

                            {/* Bantu AI Button */}
                            <button
                              onClick={() => handleOpenObjectionModal(lead)}
                              className="px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition"
                              title="Bantu Jawab AI Keraguan Konsumen"
                            >
                              <Sparkles className="w-3 h-3 text-amber-200" />
                              <span>Bantu AI</span>
                            </button>

                            {/* AI Chat Follow-up */}
                            <button
                              onClick={() => handleOpenAiFollowUp(lead)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition"
                              title="Follow-up WhatsApp dengan AI"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-100" />
                              <span>WA</span>
                            </button>

                            <button
                              onClick={() => handleOpenEdit(lead)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600"
                              title="Edit Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600"
                              title="Hapus Prospek"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Controls */}
          {leads.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div>
                  Menampilkan{' '}
                  <span className="font-bold text-slate-900">
                    {((tablePage - 1) * tablePerPage + 1).toLocaleString('id-ID')}
                  </span>{' '}
                  -{' '}
                  <span className="font-bold text-slate-900">
                    {Math.min(tablePage * tablePerPage, leads.length).toLocaleString('id-ID')}
                  </span>{' '}
                  dari <span className="font-bold text-emerald-700">{leads.length.toLocaleString('id-ID')}</span> prospek
                </div>
                <div className="flex items-center space-x-1 text-xs">
                  <span>Baris:</span>
                  <select
                    value={tablePerPage}
                    onChange={(e) => {
                      setTablePerPage(Number(e.target.value));
                      setTablePage(1);
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setTablePage(1)}
                  disabled={tablePage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                  disabled={tablePage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 py-1 font-bold text-xs text-slate-700 bg-white border border-slate-200 rounded-lg">
                  Halaman {tablePage} dari {totalTablePages}
                </span>

                <button
                  onClick={() => setTablePage((p) => Math.min(totalTablePages, p + 1))}
                  disabled={tablePage === totalTablePages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Halaman Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTablePage(totalTablePages)}
                  disabled={tablePage === totalTablePages}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CUSTOMER HEALTH JOURNEY (3-25 HARI) */}
      {viewMode === 'health-journey' && <CustomerHealthJourneyView user={user} />}

      {/* VIEW 4: BANK TESTIMONI & BUKTI KLINIS */}
      {viewMode === 'testimonials' && <TestimonialVaultView />}

      {/* VIEW 5: INTEGRASI IKLAN & WEBHOOK */}
      {viewMode === 'webhook' && <CrmWebhookView user={user} onLeadAdded={fetchLeads} />}

      {/* VIEW 6: SMART RO REMINDER CARD */}
      {viewMode === 'ro-reminders' && <SmartROReminderCard user={user} />}

      {/* ============================================================== */}
      {/* MODAL 1: TAMBAH PROSPEK MANUAL */}
      {/* ============================================================== */}
      {createModalOpen && (
        <ModalPortal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">Tambah Calon Prospek Baru</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Calon Prospek *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Pak Budi Santoso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota / Domisili</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Contoh: Surabaya"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sumber Prospek</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="manual">Offline / Teman</option>
                    <option value="store_affiliate">Toko Afiliasi</option>
                    <option value="webinar_bop">Webinar BOP</option>
                    <option value="referral_link">Link Referral</option>
                    <option value="instagram">Instagram Ads</option>
                    <option value="tiktok">TikTok Ads</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Minat Produk / Paket</label>
                <select
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="Bio-Propolis Trigona">Bio-Propolis Trigona (Kolesterol &amp; Imunitas)</option>
                  <option value="Bio-Herbal Drops">Bio-Herbal Drops (Hipertensi &amp; Diabetes)</option>
                  <option value="Bio-Gluta White">Bio-Gluta White (Kulit &amp; Antioksidan)</option>
                  <option value="Bio-Energy Tea">Bio-Energy Tea (Stamina &amp; Detox)</option>
                  <option value="Peluang Bisnis BOP">Peluang Bisnis Kemitraan BOP (Paket Gold/Silver)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Follow-up</label>
                <textarea
                  rows="2"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Mengeluhkan asam urat kambuh, ingin coba 2 botol dulu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-950"
                >
                  Simpan Prospek
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT DATA PROSPEK */}
      {/* ============================================================== */}
      {editModalOpen && selectedLead && (
        <ModalPortal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">Edit Data Prospek</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Prospek</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Pipeline</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="new">🔴 Prospek Baru</option>
                    <option value="contacted">🟡 Dihubungi</option>
                    <option value="interested">🔵 Berminat</option>
                    <option value="webinar">🟣 Ikut Webinar BOP</option>
                    <option value="closing">🟢 Closing / Member</option>
                    <option value="lost">⚪ Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota Asal</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Catatan Riwayat Pembicaraan</label>
                <textarea
                  rows="3"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-950"
                >
                  Perbarui Data
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: AI WHATSAPP FOLLOW-UP ASSISTANT */}
      {/* ============================================================== */}
      {aiModalOpen && selectedLead && (
        <ModalPortal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    AI Follow-up WhatsApp untuk {selectedLead.name}
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Target: {selectedLead.product_interest || 'Produk Herbal'} &bull; {selectedLead.city || 'Indonesia'}
                  </div>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customization Options */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Tujuan Pesan:</label>
                <select
                  value={aiGoal}
                  onChange={(e) => {
                    setAiGoal(e.target.value);
                    generateAiMessage(selectedLead, aiTone, e.target.value, aiCustomNotes);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="sapaan_awal">Sapaan Awal &amp; Tanya Ketertarikan</option>
                  <option value="edukasi_manfaat">Edukasi Khasiat Herbal Spesifik</option>
                  <option value="ajak_webinar_bop">Ajak Hadir ke Webinar BOP</option>
                  <option value="closing_promo">Penawaran Promo Terbatas (Closing)</option>
                  <option value="tanya_kabar">Tanya Kabar / Re-engage</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Gaya Bahasa (Tone):</label>
                <select
                  value={aiTone}
                  onChange={(e) => {
                    setAiTone(e.target.value);
                    generateAiMessage(selectedLead, e.target.value, aiGoal, aiCustomNotes);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="ramah dan bersahabat">Ramah, Akrab &amp; Sopan</option>
                  <option value="profesional dan berwibawa">Profesional &amp; Konsultatif</option>
                  <option value="edukatif dan ilmiah">Edukatif Medis &amp; Herbal</option>
                  <option value="mendesak promo terbatas">Mendesak (Urgensi Diskon)</option>
                </select>
              </div>
            </div>

            {/* AI Generated Text Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center space-x-1">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Draf Pesan WhatsApp yang Dihasilkan AI:</span>
                </span>
                <button
                  onClick={() => generateAiMessage(selectedLead, aiTone, aiGoal, aiCustomNotes)}
                  disabled={aiGenerating}
                  className="text-indigo-600 hover:text-indigo-500 text-[11px] font-bold flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${aiGenerating ? 'animate-spin' : ''}`} />
                  <span>Buat Ulang</span>
                </button>
              </div>

              {aiGenerating ? (
                <div className="h-40 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <Sparkles className="w-6 h-6 text-emerald-500 animate-spin" />
                  <span className="text-xs font-semibold">Gemini AI sedang merangkai kata...</span>
                </div>
              ) : (
                <textarea
                  rows="6"
                  value={aiGeneratedText}
                  onChange={(e) => setAiGeneratedText(e.target.value)}
                  className="w-full bg-emerald-50/30 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            {/* Success Alert */}
            {aiDirectSendAlert && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{aiDirectSendAlert}</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              {/* Direct Server Send Button */}
              <button
                type="button"
                onClick={handleSendAiDirect}
                disabled={aiDirectSending || !aiGeneratedText}
                className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{aiDirectSending ? 'Mengirim ke Server...' : 'Kirim Langsung via Gateway'}</span>
              </button>

              {/* Save vCard Contact */}
              <button
                type="button"
                onClick={() =>
                  downloadVCardContact({
                    name: selectedLead.name,
                    phone: selectedLead.phone,
                    city: selectedLead.city,
                    notes: `Minat: ${selectedLead.product_interest || ''}`,
                  })
                }
                className="w-full sm:w-auto px-3.5 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
                title="Download file .vcf untuk membuka dialog simpan kontak di HP"
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <span>Simpan (.vcf)</span>
              </button>

              {/* External wa.me link */}
              <a
                href={aiWhatsAppUrl || `https://wa.me/${selectedLead.phone}?text=${encodeURIComponent(aiGeneratedText)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleQuickStatusChange(selectedLead.id, 'contacted')}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4 text-emerald-600" />
                <span>wa.me</span>
              </a>

              <button
                type="button"
                onClick={handleCopyAiText}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                {copiedAiText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAiText ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: AI OBJECTION HANDLING ASSISTANT (ASISTEN PENJUAL) */}
      {/* ============================================================== */}
      <AIObjectionHandlerModal
        isOpen={objectionModalOpen}
        onClose={() => {
          setObjectionModalOpen(false);
          setObjectionLead(null);
        }}
        lead={objectionLead}
        user={user}
      />
    </div>
  );
}
