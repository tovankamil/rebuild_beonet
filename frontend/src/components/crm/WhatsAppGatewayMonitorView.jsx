import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCheck,
  Check,
  AlertCircle,
  Smartphone,
  Server,
  Search,
  CheckCircle2,
  Inbox,
  ArrowDownLeft,
  Settings,
  Copy,
} from 'lucide-react';
import api from '../../services/api';

export default function WhatsAppGatewayMonitorView({ user }) {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Quick Direct Send Tool
  const [testPhone, setTestPhone] = useState('');
  const [testRecipient, setTestRecipient] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState('');
  const [sendError, setSendError] = useState('');
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStatus, resLogs] = await Promise.all([
        api.get('/crm/whatsapp/status'),
        api.get('/crm/whatsapp/logs'),
      ]);
      setStatus(resStatus.data?.data || null);
      setLogs(resLogs.data?.data || []);
    } catch (err) {
      console.error('Failed to load WhatsApp gateway data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Live poll updates every 8s
    return () => clearInterval(interval);
  }, []);

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone || !testMessage) return;

    setSending(true);
    setSendSuccess('');
    setSendError('');

    try {
      const res = await api.post('/crm/whatsapp/send-direct', {
        phone: testPhone,
        recipient: testRecipient || 'Konsumen Bionet',
        category: 'custom',
        message: testMessage,
      });

      setSendSuccess('Pesan berhasil dikirim via WhatsApp Gateway!');
      setTestMessage('');
      fetchData();
      setTimeout(() => setSendSuccess(''), 4000);
    } catch (err) {
      setSendError(err.response?.data?.message || 'Gagal mengirim pesan WhatsApp');
    } finally {
      setSending(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      (l.recipient || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.message || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || l.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const webhookUrl = `${window.location.origin}/api/public/whatsapp/webhook`;

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Live Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Connection Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status Gateway
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              {status?.status === 'online' ? 'Online Terhubung' : 'Standby'}
            </span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <span className="capitalize">{status?.provider || 'WAHA / Fonnte'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono">
            {status?.connected_number || '+62812-3456-7890'}
          </div>
        </div>

        {/* Metric 2: Total Pesan Keluar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pesan Terproses
            </span>
            <MessageSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {status?.total_messages || logs.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Uptime Server: <span className="font-semibold text-emerald-600">{status?.uptime || '99.98%'}</span>
          </div>
        </div>

        {/* Metric 3: Delivered Rate (Centang Dua) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Diterima di HP (Centang 2)
            </span>
            <CheckCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {status?.delivered_count || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Centang dua abu-abu terkonfirmasi
          </div>
        </div>

        {/* Metric 4: Read Rate (Centang Biru) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Dibaca Konsumen (Centang Biru)
            </span>
            <CheckCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 tracking-tight">
            {status?.read_count || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Pesan telah dibuka oleh prospek
          </div>
        </div>
      </div>

      {/* 2. Direct Send Tool & Webhook Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Kirim Pesan Cepat via Gateway */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                <Send size={18} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-slate-900 text-sm sm:text-base">
                  Kirim Pesan Langsung via WhatsApp Server
                </h3>
                <p className="text-xs text-slate-500">
                  Kirim tanpa perlu buka WhatsApp Web / HP. Langsung meluncur dari server gateway.
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="Muat ulang telemetri"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-emerald-600' : ''} />
            </button>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4">
            {sendSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}
            {sendError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
                <span>{sendError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Penerima <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Contoh: 081234567890 atau +62812..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Penerima (Opsional)
                </label>
                <input
                  type="text"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="Contoh: Bapak Hendra Santoso"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Naskah Pesan WhatsApp <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows="3"
                required
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Ketik pesan Anda di sini... (Dukung format bold *teks*, italic _teks_, dan emoji)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Pesan terkirim tercatat langsung dalam log telemetri di bawah.
              </span>
              <button
                type="submit"
                disabled={sending || !testPhone || !testMessage}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95"
              >
                {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{sending ? 'Mengirim...' : 'Kirim Pesan Sekarang'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan: Panduan Setup & Webhook URL */}
        <div className="bg-gradient-to-br from-[#051c14] to-[#0c3a2b] text-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <h4 className="font-heading font-extrabold text-sm text-white">
                Konfigurasi WhatsApp Gateway
              </h4>
            </div>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              Sistem Bionet telah mendukung multi-engine: <strong>Fonnte API</strong>, <strong>WAHA (WhatsApp HTTP API)</strong>, maupun mode simulasi internal.
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-800/80 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                Webhook Callback URL (Inbound & Status):
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-emerald-700/50 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-200">
                <span className="truncate">{webhookUrl}</span>
                <button
                  onClick={copyWebhook}
                  className="p-1 rounded hover:bg-emerald-800 text-emerald-300 transition-colors flex-shrink-0"
                  title="Salin Webhook URL"
                >
                  {copiedWebhook ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-emerald-300/70">
                Pasang URL ini di dasbor Fonnte / WAHA untuk menerima status centang dua dan balasan chat masuk otomatis.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300 font-semibold">
            <span>Server Provider:</span>
            <span className="font-mono bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-700/60">
              {status?.provider?.toUpperCase() || 'SIMULATED'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Live Telemetry Feed (Tabel Riwayat Pengiriman & Centang) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <CheckCheck size={18} />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                Live Delivery Feed &amp; Log WhatsApp
              </h4>
              <p className="text-xs text-slate-500">
                Pantau status pengiriman pesan, centang satu, centang dua, dan centang biru secara real-time.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari penerima / pesan..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Kategori</option>
              <option value="crm_followup">CRM Follow-up</option>
              <option value="bonus">Notifikasi Bonus</option>
              <option value="shipping">Resi Pengiriman</option>
              <option value="custom">Pesan Langsung</option>
              <option value="inbound_reply">Chat Masuk Konsumen</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Penerima &amp; No. WhatsApp</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Isi Pesan</th>
                <th className="py-3 px-4 text-center">Status Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Inbox size={32} className="mx-auto text-slate-300 mb-2" />
                    Belum ada riwayat pengiriman pesan WhatsApp.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isRead = log.status === 'read';
                  const isDelivered = log.status === 'delivered';
                  const isInbound = log.direction === 'inbound';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(log.sent_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {isInbound && (
                            <span className="p-0.5 rounded bg-emerald-100 text-emerald-700" title="Pesan Masuk">
                              <ArrowDownLeft size={12} />
                            </span>
                          )}
                          <span>{log.recipient}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {log.phone}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {log.category?.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-700 line-clamp-2 leading-relaxed">
                          {log.message}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isRead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                            <CheckCheck size={14} className="text-sky-600" />
                            <span>Dibaca (Centang Biru)</span>
                          </span>
                        ) : isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCheck size={14} className="text-emerald-600" />
                            <span>Diterima (Centang 2)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Check size={13} className="text-slate-400" />
                            <span>Terkirim (Centang 1)</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
