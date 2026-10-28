import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Users,
  Cpu,
  HardDrive,
  Wifi,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Database,
  Layers,
  Sparkles,
  Bot,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  UserX,
  Play,
  Pause,
  Zap,
  Send,
  BarChart3,
  LineChart,
  Compass,
  TrendingUp,
  Eye,
  Lock,
} from 'lucide-react';
import api from '../../services/api';

export default function AdminMonitoringTab({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(4); // seconds
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users' | 'frontend-routes' | 'traffic' | 'rag'
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  // WhatsApp Gateway Live State
  const [waStatus, setWaStatus] = useState(null);
  const [waLogs, setWaLogs] = useState([]);
  const [waPhone, setWaPhone] = useState('081234567890');
  const [waRecipient, setWaRecipient] = useState('Mitra Bionet');
  const [waCategory, setWaCategory] = useState('bonus');
  const [waAmount, setWaAmount] = useState(350000);
  const [waCustomMsg, setWaCustomMsg] = useState('');
  const [waSending, setWaSending] = useState(false);

  const fetchWaData = async () => {
    try {
      const [resStatus, resLogs] = await Promise.all([
        api.get('/admin/whatsapp/status'),
        api.get('/admin/whatsapp/logs'),
      ]);
      if (resStatus.data) setWaStatus(resStatus.data.data);
      if (resLogs.data) setWaLogs(resLogs.data.data);
    } catch (err) {
      console.warn('Failed to load WhatsApp data:', err);
    }
  };

  const handleSendWaTest = async (e) => {
    e.preventDefault();
    setWaSending(true);
    try {
      const res = await api.post('/admin/whatsapp/send-test', {
        phone: waPhone,
        recipient: waRecipient,
        category: waCategory,
        amount: Number(waAmount),
        message: waCustomMsg,
      });
      setToastMessage(res.data?.message || 'Pesan WhatsApp berhasil diproses!');
      setTimeout(() => setToastMessage(null), 4000);
      fetchWaData();
    } catch (err) {
      alert('Gagal mengirim WhatsApp: ' + (err.response?.data?.message || err.message));
    } finally {
      setWaSending(false);
    }
  };

  // Live Chart Time-Series State (Sliding Window up to 30 data points)
  const [chartMode, setChartMode] = useState('bandwidth'); // 'bandwidth' | 'ram'
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [chartHistory, setChartHistory] = useState([
    { time: '17:06:40', rateIn: 0.12, rateOut: 0.25, ramAlloc: 2.8 },
    { time: '17:06:44', rateIn: 0.18, rateOut: 0.35, ramAlloc: 2.85 },
    { time: '17:06:48', rateIn: 0.22, rateOut: 0.50, ramAlloc: 2.9 },
    { time: '17:06:52', rateIn: 0.45, rateOut: 1.10, ramAlloc: 2.95 },
    { time: '17:06:56', rateIn: 0.38, rateOut: 0.85, ramAlloc: 3.0 },
    { time: '17:07:00', rateIn: 0.20, rateOut: 0.45, ramAlloc: 3.05 },
    { time: '17:07:04', rateIn: 0.15, rateOut: 0.30, ramAlloc: 3.1 },
    { time: '17:07:08', rateIn: 0.28, rateOut: 0.65, ramAlloc: 3.12 },
    { time: '17:07:12', rateIn: 0.55, rateOut: 1.40, ramAlloc: 3.15 },
    { time: '17:07:16', rateIn: 0.32, rateOut: 0.75, ramAlloc: 3.18 },
    { time: '17:07:20', rateIn: 0.18, rateOut: 0.42, ramAlloc: 3.2 },
    { time: '17:07:24', rateIn: 0.25, rateOut: 0.60, ramAlloc: 3.2 },
  ]);

  const timerRef = useRef(null);

  const fetchMetrics = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await api.get('/admin/monitoring/overview');
      if (res.data && res.data.data) {
        const d = res.data.data;
        setMetrics(d);

        // Update live chart history
        const nowStr = new Date().toLocaleTimeString('id-ID', {
          hour12: false,
          minute: '2-digit',
          second: '2-digit',
        });
        const newPoint = {
          time: nowStr,
          rateIn: Math.max(d.traffic?.rate_in_kbps || 0, 0.05),
          rateOut: Math.max(d.traffic?.rate_out_kbps || 0, 0.1),
          ramAlloc: Number((d.system?.alloc_mb || 2.5).toFixed(2)),
        };

        setChartHistory((prev) => [...prev.slice(-29), newPoint]);
      }
    } catch (err) {
      console.error('Failed to load monitoring metrics:', err);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(true);
  }, []);

  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      fetchMetrics(false);
    }, refreshInterval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    if (activeSubTab === 'whatsapp') {
      fetchWaData();
    }
  }, [activeSubTab]);

  const handleForceDisconnect = async (user) => {
    if (!window.confirm(`Apakah Anda yakin ingin memutus sesi pengguna ${user.username} (${user.full_name || 'Mitra'})?`)) {
      return;
    }
    setDisconnectingId(user.user_id);
    try {
      await api.post(`/admin/monitoring/force-disconnect/${user.user_id}`);
      setToastMessage(`Sesi ${user.username} berhasil diputus.`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchMetrics(false);
    } catch (err) {
      alert('Gagal memutus sesi: ' + (err.response?.data?.message || err.message));
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleTestTelegramAlert = async () => {
    setAlertLoading(true);
    try {
      const res = await api.post('/admin/monitoring/test-alert');
      setToastMessage(res.data?.message || 'Uji coba alert terkirim ke Telegram!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert('Gagal mengirim alert ke Telegram: ' + (err.response?.data?.message || err.message));
    } finally {
      setAlertLoading(false);
    }
  };

  // Filter online users
  const filteredUsers = (metrics?.recent_users || []).filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.ip_address && u.ip_address.includes(searchTerm));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getDeviceIcon = (deviceStr) => {
    const d = (deviceStr || '').toLowerCase();
    if (d.includes('mobile')) return <Smartphone className="w-4 h-4 text-emerald-600" />;
    if (d.includes('tablet')) return <Tablet className="w-4 h-4 text-sky-600" />;
    return <Laptop className="w-4 h-4 text-indigo-600" />;
  };

  const getPageTitle = (page) => {
    const map = {
      overview: 'Dashboard Ringkasan Mitra',
      genealogy: 'Pohon Jaringan Binary',
      referrals: 'Daftar Referal Langsung',
      withdrawal: 'Form Penarikan Saldo (WD)',
      transactions: 'Buku Kas & Riwayat Transaksi',
      pins: 'Manajemen Serial PIN & Stokis',
      products: 'Katalog Produk & RO',
      bank: 'Kelola Rekening Bank Mitra',
      chat: 'Live Chat Bantuan CS',
      meetings: 'Ruang Video Conference & BOP',
      components: 'Galeri Komponen DashLite',
      'admin-overview': 'Admin Ringkasan Eksekutif',
      'admin-users': 'Admin Manajemen Pengguna',
      'admin-transactions': 'Admin Buku Besar & Bonus',
      'admin-points': 'Admin Poin Pasangan Binary',
      'admin-pins': 'Admin Master PIN Stokis',
      'admin-orders': 'Admin Pesanan E-Commerce RO',
      'admin-withdrawals': 'Admin Persetujuan WD',
      'admin-fraud': 'Admin Fraud & Risk Control',
      'admin-monitoring': 'Admin Live Traffic & Online Users',
      'admin-guide': 'Admin Panduan Sistem',
      'warehouse-overview': 'Gudang Ringkasan Inventori',
      'warehouse-inventory': 'Gudang Manajemen Stok',
      'warehouse-orders': 'Gudang Fulfillment Pesanan',
    };
    return map[page] || page || 'Menjelajahi Aplikasi';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">Administrator</span>;
      case 'keuangan':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">Keuangan</span>;
      case 'cs':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">Customer Service</span>;
      case 'gudang':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">Gudang &amp; Logistik</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">Mitra Bionet</span>;
    }
  };

  // Memory Usage %
  const memAlloc = metrics?.system?.alloc_mb || 0;
  const memSys = metrics?.system?.sys_mb || 1;
  const memPercent = Math.min(Math.round((memAlloc / memSys) * 100), 100);

  // SVG High-Res Chart Calculations (Expanded Width & Height)
  const chartW = 1000;
  const chartH = 260;
  const padLeft = 70;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;
  const pts = chartHistory.length;

  // Max value for scaling with safety headroom
  const peakRate = Math.max(...chartHistory.map((h) => Math.max(h.rateIn, h.rateOut)), 0.1);
  const maxRate = Math.max(Math.ceil(peakRate * 1.3 * 10) / 10, 1.5);
  const peakRam = Math.max(...chartHistory.map((h) => h.ramAlloc), 1);
  const maxRam = Math.max(Math.ceil(peakRam * 1.3), 8);

  const getX = (i) => padLeft + (pts > 1 ? (i / (pts - 1)) * plotW : plotW / 2);
  const getY = (val, maxVal) => chartH - padBottom - (Math.min(val, maxVal) / (maxVal || 1)) * plotH;

  // Cubic Bezier Spline Smooth Curve Generator
  const createCurvedPath = (points) => {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 5;
      const cp1y = p1.y + (p2.y - p0.y) / 5;
      const cp2x = p2.x - (p3.x - p1.x) / 5;
      const cp2y = p2.y - (p3.y - p1.y) / 5;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const baselineY = chartH - padBottom;
  const createCurvedArea = (points) => {
    if (!points || points.length === 0) return '';
    const curve = createCurvedPath(points);
    return `${curve} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`;
  };

  const pointsIn = chartHistory.map((h, i) => ({ x: getX(i), y: getY(h.rateIn, maxRate) }));
  const pointsOut = chartHistory.map((h, i) => ({ x: getX(i), y: getY(h.rateOut, maxRate) }));
  const pointsRam = chartHistory.map((h, i) => ({ x: getX(i), y: getY(h.ramAlloc, maxRam) }));

  const inArea = createCurvedArea(pointsIn);
  const inPath = createCurvedPath(pointsIn);
  const outArea = createCurvedArea(pointsOut);
  const outPath = createCurvedPath(pointsOut);
  const ramArea = createCurvedArea(pointsRam);
  const ramPath = createCurvedPath(pointsRam);

  const handleChartMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const svgX = (mouseX / svgRect.width) * chartW;

    if (svgX < padLeft || svgX > chartW - padRight) {
      setHoveredIndex(null);
      return;
    }

    const idx = Math.min(
      Math.max(0, Math.round(((svgX - padLeft) / plotW) * (pts - 1))),
      pts - 1
    );
    setHoveredIndex(idx);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section with Live Status & Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                    Live Telemetry &amp; User Monitoring
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5" />
                    Real-time Active
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Pantau customer &amp; mitra online, rute halaman menu yang sedang diakses, konsumsi RAM, dan trafik jaringan
                </p>
              </div>
            </div>
          </div>

          {/* Refresh Controls & Telegram Alert Button */}
          <div className="flex items-center space-x-2 self-start md:self-auto bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex-wrap">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                autoRefresh
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              title={autoRefresh ? 'Jeda Auto-Refresh' : 'Aktifkan Auto-Refresh'}
            >
              {autoRefresh ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Auto ({refreshInterval}s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              )}
            </button>

            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="bg-white text-xs text-slate-700 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="2">2 detik</option>
              <option value="4">4 detik</option>
              <option value="8">8 detik</option>
              <option value="15">15 detik</option>
            </select>

            <button
              onClick={() => fetchMetrics(true)}
              disabled={loading}
              className="p-1.5 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
              title="Refresh Data Sekarang"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={handleTestTelegramAlert}
              disabled={alertLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              title="Kirim pesan uji coba ke Telegram Bot Admin"
            >
              <Send className={`w-3.5 h-3.5 ${alertLoading ? 'animate-spin' : ''}`} />
              <span>Test Bot Telegram</span>
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* Card 1: Online Users */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl p-4 border border-emerald-100 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Mitra Sedang Online</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {metrics?.online_users_count || 0}
              </span>
              <span className="text-xs text-emerald-700 font-semibold">Pengguna</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-emerald-100">
              <span className="flex items-center text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                {metrics?.active_users_count || 0} Aktif &lt;60s
              </span>
              <span className="flex items-center text-amber-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                {metrics?.idle_users_count || 0} Idle
              </span>
            </div>
          </div>

          {/* Card 2: Server RAM (Alloc & Sys) */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/40 rounded-xl p-4 border border-indigo-100 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Penggunaan RAM Server</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {memAlloc.toFixed(1)} <span className="text-lg font-bold text-slate-500">MB</span>
              </span>
              <span className="text-xs text-indigo-600 font-medium">/ {memSys.toFixed(1)} MB Sys</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${memPercent}%` }}
                />
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Heap In-Use: {metrics?.system?.heap_inuse_mb?.toFixed(1) || 0} MB</span>
              <span className="font-semibold text-indigo-700">GC: {metrics?.system?.num_gc || 0}x</span>
            </div>
          </div>

          {/* Card 3: Bandwidth Traffic */}
          <div className="bg-gradient-to-br from-sky-50/70 to-cyan-50/40 rounded-xl p-4 border border-sky-100 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">Bandwidth &amp; Throughput</span>
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                <Wifi className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-3">
              <div className="flex items-center text-xs font-bold text-sky-700">
                <ArrowDownCircle className="w-4 h-4 text-emerald-500 mr-1" />
                {metrics?.traffic?.rate_in_kbps?.toFixed(1) || '0.0'} KB/s
              </div>
              <div className="flex items-center text-xs font-bold text-indigo-700">
                <ArrowUpCircle className="w-4 h-4 text-indigo-500 mr-1" />
                {metrics?.traffic?.rate_out_kbps?.toFixed(1) || '0.0'} KB/s
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-sky-100">
              <span>Total Transfer:</span>
              <span className="font-bold text-slate-800">
                {((metrics?.traffic?.total_bytes_in_mb || 0) + (metrics?.traffic?.total_bytes_out_mb || 0)).toFixed(2)} MB
              </span>
            </div>
          </div>

          {/* Card 4: Go Runtime Health & DB Pool */}
          <div className="bg-gradient-to-br from-purple-50/70 to-pink-50/40 rounded-xl p-4 border border-purple-100 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Kesehatan Server &amp; Pool</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-xl font-bold text-slate-800">
                {metrics?.system?.uptime_formatted || '0m'}
              </span>
              <span className="text-xs text-purple-700 font-medium">Uptime</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-purple-100">
              <span className="flex items-center text-slate-700">
                <Zap className="w-3.5 h-3.5 text-amber-500 mr-1" />
                {metrics?.system?.goroutines_count || 0} Goroutines
              </span>
              <span className="flex items-center text-emerald-700 font-semibold">
                <Database className="w-3.5 h-3.5 mr-1" />
                MySQL Active
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FITUR BARU: LIVE TELEMETRY INTERACTIVE TREND CHART */}
        {/* ============================================================== */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          {/* Card Outer with Cyberpunk/OLED Deep Command Center Theme */}
          <div className="bg-gradient-to-br from-[#060a14] via-[#0c1427] to-[#070c18] rounded-3xl p-5 md:p-6 text-white relative overflow-hidden border border-slate-700/60 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35 pointer-events-none" />

            {/* Header Controls & Mode Switcher */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <h3 className="font-extrabold text-white text-base sm:text-lg font-mono tracking-tight flex items-center space-x-2">
                    <span>Live Ingestion Telemetry Stream</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Real-Time
                    </span>
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Sliding window telemetry fluktuasi server setiap {refreshInterval} detik &bull; Buffer memori {pts} titik aktif
                </p>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80 shadow-inner self-start md:self-auto">
                <button
                  onClick={() => setChartMode('bandwidth')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    chartMode === 'bandwidth'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Throughput Bandwidth (KB/s)</span>
                </button>

                <button
                  onClick={() => setChartMode('ram')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                    chartMode === 'ram'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Konsumsi RAM Heap (MB)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar on top of Chart */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Rate Inbound</div>
                <div className="text-sm font-mono font-extrabold text-emerald-400 flex items-center space-x-1 mt-0.5">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{metrics?.traffic?.rate_in_kbps?.toFixed(2) || '0.00'} KB/s</span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Rate Outbound</div>
                <div className="text-sm font-mono font-extrabold text-cyan-400 flex items-center space-x-1 mt-0.5">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{metrics?.traffic?.rate_out_kbps?.toFixed(2) || '0.00'} KB/s</span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Peak Window Rate</div>
                <div className="text-sm font-mono font-extrabold text-amber-400 flex items-center space-x-1 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>{peakRate.toFixed(2)} KB/s</span>
                </div>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Heap Alloc In-Use</div>
                <div className="text-sm font-mono font-extrabold text-purple-400 flex items-center space-x-1 mt-0.5">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>{memAlloc.toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            {/* Enlarged & Majestic SVG Chart Canvas */}
            <div className="w-full h-72 sm:h-80 md:h-[340px] relative select-none">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-full overflow-visible"
                onMouseMove={handleChartMouseMove}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  {/* Neon Glow Filter */}
                  <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradient Inbound */}
                  <linearGradient id="inGradSmooth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient Outbound */}
                  <linearGradient id="outGradSmooth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.40" />
                    <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Gradient RAM */}
                  <linearGradient id="ramGradSmooth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#a855f7" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Grid Lines & Scale Markers */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = chartH - padBottom - ratio * plotH;
                  const labelVal =
                    chartMode === 'bandwidth'
                      ? (maxRate * ratio).toFixed(1) + ' KB/s'
                      : (maxRam * ratio).toFixed(1) + ' MB';

                  return (
                    <g key={idx}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartW - padRight}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray={ratio === 0 ? 'none' : '4 4'}
                        strokeWidth={ratio === 0 ? '1.5' : '1'}
                      />
                      <text
                        x={padLeft - 12}
                        y={y + 3.5}
                        textAnchor="end"
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Area and Smooth Curves */}
                {chartMode === 'bandwidth' ? (
                  <>
                    {/* Inbound Area & Smooth Spline */}
                    <path d={inArea} fill="url(#inGradSmooth)" />
                    <path
                      d={inPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neonGlow)"
                    />

                    {/* Outbound Area & Smooth Spline */}
                    <path d={outArea} fill="url(#outGradSmooth)" />
                    <path
                      d={outPath}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="5 3"
                    />
                  </>
                ) : (
                  <>
                    {/* RAM Heap Area & Smooth Spline */}
                    <path d={ramArea} fill="url(#ramGradSmooth)" />
                    <path
                      d={ramPath}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#neonGlow)"
                    />
                  </>
                )}

                {/* Active Latest Node Marker (Rightmost) */}
                {pts > 0 && (
                  <g>
                    <circle
                      cx={getX(pts - 1)}
                      cy={
                        chartMode === 'bandwidth'
                          ? getY(chartHistory[pts - 1].rateIn, maxRate)
                          : getY(chartHistory[pts - 1].ramAlloc, maxRam)
                      }
                      r="6"
                      fill={chartMode === 'bandwidth' ? '#10b981' : '#c084fc'}
                      className="animate-ping"
                      opacity="0.6"
                    />
                    <circle
                      cx={getX(pts - 1)}
                      cy={
                        chartMode === 'bandwidth'
                          ? getY(chartHistory[pts - 1].rateIn, maxRate)
                          : getY(chartHistory[pts - 1].ramAlloc, maxRam)
                      }
                      r="4"
                      fill="#ffffff"
                      stroke={chartMode === 'bandwidth' ? '#10b981' : '#c084fc'}
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Interactive Crosshair & Tooltip on Hover */}
                {hoveredIndex !== null && chartHistory[hoveredIndex] && (
                  <g>
                    {/* Vertical Tracker Guide Line */}
                    <line
                      x1={getX(hoveredIndex)}
                      y1={padTop}
                      x2={getX(hoveredIndex)}
                      y2={chartH - padBottom}
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      opacity="0.8"
                    />

                    {/* Point highlight circle */}
                    {chartMode === 'bandwidth' ? (
                      <>
                        <circle
                          cx={getX(hoveredIndex)}
                          cy={getY(chartHistory[hoveredIndex].rateIn, maxRate)}
                          r="5"
                          fill="#10b981"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <circle
                          cx={getX(hoveredIndex)}
                          cy={getY(chartHistory[hoveredIndex].rateOut, maxRate)}
                          r="5"
                          fill="#06b6d4"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <circle
                        cx={getX(hoveredIndex)}
                        cy={getY(chartHistory[hoveredIndex].ramAlloc, maxRam)}
                        r="5"
                        fill="#c084fc"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                )}
              </svg>

              {/* Floating Tooltip Card when Hovering */}
              {hoveredIndex !== null && chartHistory[hoveredIndex] && (
                <div
                  className="absolute z-20 pointer-events-none bg-slate-900/95 border border-cyan-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-xs font-mono transition-transform duration-75"
                  style={{
                    left: `${Math.min(Math.max((hoveredIndex / (pts - 1)) * 100, 15), 85)}%`,
                    top: '15px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between space-x-3">
                    <span>Waktu: {chartHistory[hoveredIndex].time}</span>
                    <span className="text-cyan-400">Index #{hoveredIndex + 1}</span>
                  </div>
                  {chartMode === 'bandwidth' ? (
                    <div className="space-y-0.5 pt-1 text-[11px]">
                      <div className="text-emerald-400 flex justify-between space-x-3">
                        <span>Inbound:</span>
                        <span className="font-bold">{chartHistory[hoveredIndex].rateIn.toFixed(2)} KB/s</span>
                      </div>
                      <div className="text-cyan-400 flex justify-between space-x-3">
                        <span>Outbound:</span>
                        <span className="font-bold">{chartHistory[hoveredIndex].rateOut.toFixed(2)} KB/s</span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1 text-[11px] text-purple-300 flex justify-between space-x-3">
                      <span>RAM Heap:</span>
                      <span className="font-bold">{chartHistory[hoveredIndex].ramAlloc.toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* X-Axis Timeline Footprint */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80 px-2">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span>{chartHistory[0]?.time || '00:00:00'} (Mulai)</span>
              </span>
              <span>{chartHistory[Math.floor(pts * 0.25)]?.time || ''}</span>
              <span>{chartHistory[Math.floor(pts * 0.5)]?.time || ''}</span>
              <span>{chartHistory[Math.floor(pts * 0.75)]?.time || ''}</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{chartHistory[pts - 1]?.time || 'Sekarang'} (Live)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Users vs Menu Frontend vs Traffic vs RAG) */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengguna Sedang Online ({metrics?.online_users_count || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('frontend-routes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'frontend-routes'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Menu Frontend Yang Diakses ({metrics?.frontend_routes?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('traffic')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'traffic'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Analisis Bandwidth &amp; API</span>
          </button>

          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Gateway &amp; Notifikasi</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rag')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'rag'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-200'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>RAG AI Architecture &amp; Roadmap</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 2: MONITORING MENU / HALAMAN FRONTEND YANG DIAKSES USER */}
      {/* ============================================================== */}
      {activeSubTab === 'frontend-routes' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Rute Menu Terbuka
              </span>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.frontend_routes?.length || 0} Halaman
              </div>
              <p className="text-xs text-slate-500 mt-1">Dipantau real-time dari heartbeat frontend</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Menu Terpadat Saat Ini
              </span>
              <div className="text-lg font-bold text-emerald-700 truncate">
                {metrics?.frontend_routes && metrics.frontend_routes.length > 0
                  ? metrics.frontend_routes[0].title
                  : 'Dashboard Mitra'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Berdasarkan konsentrasi user terbanyak</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Status Keamanan Sesi Frontend
              </span>
              <div className="text-lg font-bold text-indigo-700 flex items-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-1.5" />
                <span>Aman (Token Valid &amp; Signed)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">JWT SHA256 &amp; Route Guard Aktif</p>
            </div>
          </div>

          {/* Frontend Routes Table & Progress Distribution */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm md:text-base">
                  Distribusi Pengguna Berdasarkan Menu Frontend yang Sedang Diakses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mengetahui secara tepat menu apa yang sedang dibuka oleh para mitra di antarmuka web
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Pulse Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Nama Halaman / Menu Frontend</th>
                    <th className="py-3 px-4">Identifier Tab</th>
                    <th className="py-3 px-4">Pengguna Aktif Sekarang</th>
                    <th className="py-3 px-4">Persentase Pengunjung</th>
                    <th className="py-3 px-4">Total Kunjungan Sesi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(!metrics?.frontend_routes || metrics.frontend_routes.length === 0) ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400">
                        <Compass className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">Belum ada rekaman aktivitas rute menu</p>
                        <p className="text-xs text-slate-400 mt-1">Sinyal detak rute diperbarui setiap kali mitra membuka menu baru</p>
                      </td>
                    </tr>
                  ) : (
                    metrics.frontend_routes.map((rt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{rt.title}</div>
                              <div className="text-[10px] text-slate-400">Modul Antarmuka Bionet v6</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700">
                          {rt.route_key}
                        </td>

                        <td className="py-3.5 px-4">
                          {rt.active_users > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                              {rt.active_users} Pengguna Aktif
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">0 pengguna</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-xs">
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                              <span>{rt.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-600 h-1.5 rounded-full"
                                style={{ width: `${Math.max(rt.percentage, 5)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {rt.total_visits} hits
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: ONLINE USERS DIRECTORY */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari username, nama mitra, atau IP address..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Semua Role Pengguna</option>
                <option value="member">Mitra Bionet</option>
                <option value="admin">Administrator</option>
                <option value="keuangan">Tim Keuangan</option>
                <option value="cs">Customer Service</option>
                <option value="gudang">Gudang &amp; Logistik</option>
              </select>
            </div>
          </div>

          {/* Online Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Pengguna / Mitra</th>
                  <th className="py-3 px-4">Role Akun</th>
                  <th className="py-3 px-4">Halaman Yang Diakses</th>
                  <th className="py-3 px-4">Status &amp; Waktu</th>
                  <th className="py-3 px-4">IP &amp; Perangkat</th>
                  <th className="py-3 px-4 text-right">Tindakan Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada pengguna online yang sesuai filter</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Sistem merekam pengguna yang aktif mengirimkan request / heartbeat dalam 5 menit terakhir
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                            {u.username.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.full_name || u.username}</div>
                            <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getRoleBadge(u.role)}</td>

                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{getPageTitle(u.current_page)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {u.is_active ? (
                            <span className="inline-flex items-center text-emerald-700 font-bold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                              Aktif Sekarang
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-amber-600 font-medium text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                              Idle ({u.seconds_ago}s lalu)
                            </span>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Ping {u.seconds_ago} detik lalu
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-600">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>{u.ip_address || '127.0.0.1'}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                            {getDeviceIcon(u.device)}
                            <span>{u.device || 'Web Browser'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleForceDisconnect(u)}
                          disabled={disconnectingId === u.user_id}
                          className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition disabled:opacity-50"
                          title="Putus sesi login pengguna ini"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Putus Sesi</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NETWORK TRAFFIC & API ENDPOINT ANALYTICS */}
      {activeSubTab === 'traffic' && (
        <div className="space-y-6">
          {/* Traffic Breakdown Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Permintaan HTTP</h3>
              <div className="text-2xl font-black text-slate-800">
                {metrics?.traffic?.total_requests?.toLocaleString('id-ID') || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">Rata-rata Latensi: {metrics?.traffic?.average_latency_ms?.toFixed(2) || 0} ms</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Distribusi Status HTTP</h3>
              <div className="flex items-center space-x-3 mt-1">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                  2xx Sukses: {metrics?.traffic?.status_2xx || 0}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                  4xx Client: {metrics?.traffic?.status_4xx || 0}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                  5xx Server: {metrics?.traffic?.status_5xx || 0}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">MySQL Pool Status</h3>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Koneksi Terbuka:</span>
                  <span className="font-bold text-slate-800">{metrics?.system?.db_open_conns || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Koneksi Aktif (In-Use):</span>
                  <span className="font-bold text-emerald-600">{metrics?.system?.db_in_use_conns || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Koneksi Idle Siap Pakai:</span>
                  <span className="font-bold text-indigo-600">{metrics?.system?.db_idle_conns || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Endpoints Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">Top 10 Rute API Paling Banyak Diakses</h3>
                <p className="text-xs text-slate-500">Memonitor beban trafik &amp; konsumsi data per endpoint</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Live Interceptor
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Endpoint Route</th>
                    <th className="py-3 px-4">Total Hits</th>
                    <th className="py-3 px-4">Total Data Ditransfer</th>
                    <th className="py-3 px-4">Rata-rata Ukuran/Hit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(metrics?.top_endpoints || []).length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        Belum ada data rekaman rute API
                      </td>
                    </tr>
                  ) : (
                    metrics.top_endpoints.map((ep, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                          {ep.endpoint}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {ep.hits.toLocaleString('id-ID')} req
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {(ep.bytes_total / 1024).toFixed(1)} KB
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {ep.hits > 0 ? (ep.bytes_total / ep.hits / 1024).toFixed(2) : 0} KB
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3.5: WHATSAPP GATEWAY & AUTOMATED NOTIFICATIONS */}
      {activeSubTab === 'whatsapp' && (
        <div className="space-y-6">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                  <span>WhatsApp Gateway Engine v6 Active</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Otomatisasi Notifikasi WhatsApp Bionet
                </h2>
                <p className="text-xs text-emerald-200/80 max-w-xl leading-relaxed">
                  Pemberitahuan otomatis instan ke HP mitra saat bonus pasangan cair, approval penarikan saldo, serta pengiriman nomor resi ekspedisi 3PL.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-xs space-y-1 self-start sm:self-auto min-w-[200px]">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Provider:</span>
                  <span className="font-bold uppercase font-mono text-white">{waStatus?.provider || 'SIMULATED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Total Terkirim:</span>
                  <span className="font-bold text-white">{waStatus?.total_sent || waLogs.length} pesan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Status Gateway:</span>
                  <span className="font-bold text-emerald-300">Siap Operasional</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Uji Kirim */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Uji Kirim Notifikasi WhatsApp
                </h3>
              </div>

              <form onSubmit={handleSendWaTest} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp Tujuan:</label>
                  <input
                    type="tel"
                    required
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Penerima:</label>
                  <input
                    type="text"
                    required
                    value={waRecipient}
                    onChange={(e) => setWaRecipient(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Notifikasi:</label>
                  <select
                    value={waCategory}
                    onChange={(e) => setWaCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bonus">Bonus Pasangan Cair (Pairing)</option>
                    <option value="shipping">Update Pengiriman Resi Kurir (3PL)</option>
                    <option value="custom">Pesan Bebas / Broadcast Khusus</option>
                  </select>
                </div>

                {waCategory === 'bonus' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Nominal Bonus (Rp):</label>
                    <input
                      type="number"
                      value={waAmount}
                      onChange={(e) => setWaAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {waCategory === 'custom' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Isi Pesan Kustom:</label>
                    <textarea
                      rows="3"
                      value={waCustomMsg}
                      onChange={(e) => setWaCustomMsg(e.target.value)}
                      placeholder="Ketik isi pesan WhatsApp di sini..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={waSending}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{waSending ? 'Memproses...' : 'Kirim via Gateway'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tabel Log Pengiriman */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Log Pengiriman WhatsApp Gateway Real-Time
                  </h3>
                </div>
                <button
                  onClick={fetchWaData}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Penerima &amp; No. HP</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Cuplikan Pesan</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {waLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          Belum ada catatan log pengiriman WhatsApp
                        </td>
                      </tr>
                    ) : (
                      waLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                            {new Date(log.sent_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-800 text-xs">{log.recipient}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{log.phone}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {log.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate" title={log.message}>
                            {log.message}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sent</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: RAG AI EXPLAINER */}
      {activeSubTab === 'rag' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Next-Gen Enterprise AI Architecture</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                Apa Itu RAG (Retrieval-Augmented Generation)?
              </h2>
              <p className="text-sm md:text-base text-purple-100/90 leading-relaxed">
                RAG menggabungkan <strong>pencarian data internal akurat (Retrieval)</strong> dengan <strong>kecerdasan model bahasa besar / LLM (Generation)</strong>. Alih-alih membiarkan AI menebak atau berhalusinasi, RAG terlebih dahulu mencari data riil dari database/dokumen Bionet, lalu memberikannya sebagai konteks faktual sebelum model menjawab.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Retrieval (Pencarian Data)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Saat pengguna bertanya, sistem mencari potongan informasi paling relevan dari database Bionet (Marketing Plan, FAQ produk, mutasi bonus) secara semantik.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Augmentation (Pengayaan Konteks)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Data resmi yang ditemukan digabungkan ke dalam prompt sistem sebagai fakta valid (*ground truth*) sebelum dikirim ke Google Gemini AI.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Generation (Jawaban Akurat)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Model LLM (Gemini 3.1 Flash) merangkai jawaban ramah, persuasif, dan 100% tepat aturan perusahaan tanpa kesalahan angka bonus.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
