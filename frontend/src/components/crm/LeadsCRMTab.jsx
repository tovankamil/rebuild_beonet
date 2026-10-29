import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Send,
  HelpCircle,
  ShoppingBag,
  Briefcase,
  Layers,
  ChevronDown,
  RefreshCw,
  X,
} from 'lucide-react';
import api from '../../services/api';

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
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'table'

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // AI Follow-up Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTone, setAiTone] = useState('ramah dan bersahabat');
  const [aiGoal, setAiGoal] = useState('sapaan_awal');
  const [aiCustomNotes, setAiCustomNotes] = useState('');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [aiWhatsAppUrl, setAiWhatsAppUrl] = useState('');
  const [copiedAiText, setCopiedAiText] = useState(false);

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

  // Quick Status Change
  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error('Quick status update failed:', err);
    }
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

  // Pipeline columns definition
  const pipelineStages = [
    { key: 'new', title: 'Prospek Baru', color: 'border-t-red-500', bg: 'bg-red-50/50' },
    { key: 'contacted', title: 'Sudah Dihubungi', color: 'border-t-amber-500', bg: 'bg-amber-50/50' },
    { key: 'interested', title: 'Berminat Produk', color: 'border-t-blue-500', bg: 'bg-blue-50/50' },
    { key: 'webinar', title: 'Ikut Seminar BOP', color: 'border-t-purple-500', bg: 'bg-purple-50/50' },
    { key: 'closing', title: 'Closing / Jadi Member', color: 'border-t-emerald-500', bg: 'bg-emerald-50/50' },
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
              <span>CRM &amp; Manajemen Prospek Calon Mitra Terintegrasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Pusat Leads &amp; Pipeline Konversi Mitra
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Pantau calon pembeli produk herbal dari Toko Afiliasi dan peserta Webinar BOP. Dapatkan pesan follow-up otomatis berbasis AI untuk meningkatkan angka penjualan dan perekrutan downline.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
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

      {/* Stats Cards */}
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

      {/* Control Bar: Filters, Search, and View Mode Toggle */}
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

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => setViewMode('pipeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'pipeline' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Papan Pipeline</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Daftar Tabel</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: KANBAN PIPELINE COLUMNS */}
      {viewMode === 'pipeline' ? (
        <div className="flex xl:grid xl:grid-cols-5 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory xl:snap-none -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);
            return (
              <div
                key={stage.key}
                className={`flex-shrink-0 w-[280px] sm:w-[300px] xl:w-auto snap-start bg-slate-100/70 rounded-2xl p-3 border-t-4 ${stage.color} border-slate-200 flex flex-col min-h-[450px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <h3 className="font-extrabold text-xs text-slate-800">{stage.title}</h3>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      Tidak ada prospek di tahap ini
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-2.5"
                      >
                        {/* Top: Name & Quick Actions */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs leading-snug">{lead.name}</h4>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono">{lead.phone}</span>
                            </div>
                          </div>
                          {getSourceBadge(lead.source)}
                        </div>

                        {/* Product & City */}
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                          {lead.product_interest && (
                            <div className="flex items-center space-x-1 text-indigo-700 font-semibold truncate">
                              <ShoppingBag className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{lead.product_interest}</span>
                            </div>
                          )}
                          {lead.city && (
                            <div className="flex items-center space-x-1 text-slate-500 truncate text-[10px]">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{lead.city}</span>
                            </div>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 italic line-clamp-2 bg-amber-50/50 p-1.5 rounded border border-amber-100">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* Bottom Actions: AI WhatsApp Follow-up & Status Shift */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleOpenAiFollowUp(lead)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition"
                            title="Generate Pesan WhatsApp dengan AI"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Follow-up AI</span>
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleOpenEdit(lead)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition"
                              title="Edit Data Prospek"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 transition"
                              title="Hapus Prospek"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quick Move Dropdown */}
                        <select
                          value={lead.status}
                          onChange={(e) => handleQuickStatusChange(lead.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-700"
                        >
                          <option value="new">Tahap: Prospek Baru</option>
                          <option value="contacted">Tahap: Sudah Dihubungi</option>
                          <option value="interested">Tahap: Berminat Produk</option>
                          <option value="webinar">Tahap: Ikut Seminar BOP</option>
                          <option value="closing">Tahap: Closing / Member</option>
                          <option value="lost">Tahap: Batal / Tidak Aktif</option>
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: DATA TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
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
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 italic">
                      Belum ada data prospek yang sesuai dengan filter.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition">
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
                        {lead.estimated_value ? `Rp ${lead.estimated_value.toLocaleString('id-ID')}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenAiFollowUp(lead)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition"
                            title="Follow-up WhatsApp dengan AI"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>AI Chat</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(lead)}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(lead.id, lead.name)}
                            className="p-1 rounded-md text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH PROSPEK MANUAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
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
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
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
        </div>
      )}

      {/* MODAL 2: EDIT DATA PROSPEK */}
      {editModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
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
        </div>
      )}

      {/* MODAL 3: AI WHATSAPP FOLLOW-UP ASSISTANT */}
      {aiModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4">
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

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <a
                href={aiWhatsAppUrl || `https://wa.me/${selectedLead.phone}?text=${encodeURIComponent(aiGeneratedText)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => handleQuickStatusChange(selectedLead.id, 'contacted')}
                className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Buka &amp; Kirim via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyAiText}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
              >
                {copiedAiText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAiText ? 'Tersalin!' : 'Salin Pesan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

