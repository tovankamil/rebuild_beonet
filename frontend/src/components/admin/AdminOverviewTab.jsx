import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  Landmark,
  KeyRound,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Activity,
  Globe,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';

export default function AdminOverviewTab({ setActiveTab }) {
  const [data, setData] = useState(null);
  const [wdPage, setWdPage] = useState(1);
  const [wdPageSize, setWdPageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleUpdateWdStatus = async (wdId, status) => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.patch(`/admin/withdrawals/${wdId}/status`, { status });
      setMessage(`Berhasil mengubah status penarikan menjadi: ${status}`);
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const pendingList = data?.pending_withdrawals || [];
  const totalWdPages = Math.ceil(pendingList.length / wdPageSize) || 1;
  const paginatedPendingWd = pendingList.slice((wdPage - 1) * wdPageSize, wdPage * wdPageSize);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw size={24} className="animate-spin text-emerald-600 mr-2" />
        <span className="text-sm font-medium">Memuat ringkasan administrator...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Dashboard Eksekutif Admin
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Role: Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau statistik pengguna, omset jaringan, dan approval pencairan dana mitra secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {setActiveTab && (
            <>
              <button
                onClick={() => setActiveTab('admin-security')}
                className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Buka Radar Keamanan Cyber DEFCON"
              >
                <ShieldAlert size={14} className="text-rose-600 animate-pulse" />
                <span>Radar Keamanan (DEFCON)</span>
              </button>
              <button
                onClick={() => setActiveTab('admin-geotraffic')}
                className="px-3.5 py-2 rounded-lg bg-cyan-50 border border-cyan-200 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Buka Peta Geo-Traffic Nusantara"
              >
                <Globe size={14} className="text-cyan-600" />
                <span>Geo-Traffic Nusantara</span>
              </button>
              <button
                onClick={() => setActiveTab('admin-monitoring')}
                className="px-3.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Buka live monitoring user online, RAM server & traffic"
              >
                <Activity size={14} className="text-indigo-600 animate-pulse" />
                <span>Live Monitoring &amp; RAM</span>
              </button>
              <button
                onClick={() => setActiveTab('admin-guide')}
                className="px-3.5 py-2 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                title="Buka panduan lengkap semua modul & fitur platform"
              >
                <BookOpen size={14} className="text-teal-600" />
                <span>Panduan Fitur &amp; Menu</span>
              </button>
              <button
                onClick={() => setActiveTab('admin-fraud')}
                className="px-3.5 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ShieldAlert size={14} className="text-rose-600" />
                <span>Fraud Control &amp; Risiko</span>
              </button>
            </>
          )}
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Discovery Banner for System Guide */}
      {setActiveTab && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white shadow-md border border-teal-700/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Panduan Lengkap Fitur &amp; Menu Platform Bionet</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/40">
                  Modul Baru
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Pelajari arsitektur MLM Binary, alur Flip.id, Kemendagri API, AI Copilot, serta panduan 12 modul lengkap.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('admin-guide')}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm transition-all hover:shadow-teal-500/20 hover:scale-[1.02]"
          >
            <span>Buka Direktori Menu</span>
            <ExternalLink size={13} />
          </button>
        </div>
      )}

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <div className="dash-card p-5 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">TOTAL PENGGUNA</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900">
            {data?.total_users || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">{data?.total_members || 0} Mitra</span>
            <span>•</span>
            <span className="text-sky-700 font-semibold">{data?.total_gudang || 0} Gudang</span>
            <span>•</span>
            <span className="text-amber-700 font-semibold">{data?.total_admins || 0} Admin</span>
          </div>
        </div>

        {/* Total Omset Bulan Ini */}
        <div className="dash-card p-5 bg-white border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">MUTASI OMSET BULAN INI</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900">
            {formatRupiah(data?.turnover_month)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total kredit komisi &amp; pairing jaringan
          </p>
        </div>

        {/* Pending Withdrawals */}
        <div className="dash-card p-5 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">PENGAJUAN PENCAIRAN (WD)</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Landmark size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-amber-700">
            {data?.pending_withdrawals_count || 0} Menunggu
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total {formatRupiah(data?.pending_withdrawals_sum)}
          </p>
        </div>

        {/* PIN Hak Usaha */}
        <div className="dash-card p-5 bg-white border-l-4 border-l-purple-600">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">SERIAL PIN AKTIF</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <KeyRound size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900">
            {data?.active_pins || 0} <span className="text-xs font-normal text-slate-400">/ {data?.total_pins || 0}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Lisensi PIN siap pakai kemitraan
          </p>
        </div>
      </div>

      {/* Cyber Bio-Defense & Geo-Traffic Radar Executive Card */}
      {setActiveTab && (
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-950 via-[#0a1322] to-[#041a16] border border-emerald-500/30 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <ShieldAlert size={18} className="animate-pulse" />
                </span>
                <h3 className="font-heading font-extrabold text-base text-white">
                  Bio-Defense Shield &amp; Geo-Traffic Radar
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/50 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SHIELD ACTIVE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  DEFCON 5 / SECURE
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl">
                Sistem pertahanan L7 WAF aktif melindungi API Flip.id, Kemendagri, dan database jaringan. Telah memblokir <strong className="text-emerald-400">1,489 percobaan intrusi</strong> dengan rata-rata mitigasi 1.2ms. Sebaran trafik terpadat: <strong className="text-cyan-300">Jawa Timur (28.4%)</strong>, <strong className="text-cyan-300">DKI Jakarta (24.1%)</strong>, dan <strong className="text-cyan-300">Jawa Barat (18.2%)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                onClick={() => setActiveTab('admin-security')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02]"
              >
                <ShieldAlert size={15} />
                <span>Buka Radar Keamanan (DEFCON)</span>
                <ExternalLink size={13} />
              </button>
              <button
                onClick={() => setActiveTab('admin-geotraffic')}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/50 hover:bg-slate-800 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Globe size={15} className="text-cyan-400" />
                <span>Peta Geo-Traffic Nusantara</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Column Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Withdrawals Approval (7 Cols) */}
        <div className="lg:col-span-7 dash-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Persetujuan Pencairan Dana (Approval WD)
              </h3>
              <p className="text-xs text-slate-400">
                Verifikasi rekening bank mitra dan proses transfer
              </p>
            </div>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('admin-withdrawals')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Lihat Semua &rarr;
              </button>
            )}
          </div>

          {(!data?.pending_withdrawals || data.pending_withdrawals.length === 0) ? (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-xs font-medium">Tidak ada permintaan pencairan dana yang pending.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse dash-table">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">Mitra</th>
                      <th className="py-2.5 px-3">Rekening Tujuan</th>
                      <th className="py-2.5 px-3">Nominal Bersih</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPendingWd.map((wd) => (
                      <tr key={wd.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{wd.user?.full_name || 'Mitra'}</div>
                          <div className="text-[11px] text-slate-400">@{wd.user?.username}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{wd.bank?.bank_name || 'Bank Default'}</div>
                          <div className="font-mono text-[11px] text-slate-500">{wd.bank?.account_number} a.n {wd.bank?.account_name}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {formatRupiah(wd.net_amount)}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateWdStatus(wd.id, 'completed')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleUpdateWdStatus(wd.id, 'rejected')}
                            disabled={actionLoading}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors"
                          >
                            Tolak
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <DashPagination
                currentPage={wdPage}
                totalPages={totalWdPages}
                totalItems={pendingList.length}
                pageSize={wdPageSize}
                pageSizeOptions={[3, 5, 10]}
                onPageChange={setWdPage}
                onPageSizeChange={setWdPageSize}
              />
            </>
          )}
        </div>

        {/* Right: Recent Registered Users (5 Cols) */}
        <div className="lg:col-span-5 dash-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Pendaftaran Pengguna Baru
              </h3>
              <p className="text-xs text-slate-400">
                Pengguna terdaftar terbaru di sistem
              </p>
            </div>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('admin-users')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Kelola &rarr;
              </button>
            )}
          </div>

          <div className="space-y-3">
            {data?.recent_users?.map((u) => {
              const roleBadge = {
                admin: 'bg-amber-100 text-amber-800 border-amber-200',
                gudang: 'bg-sky-100 text-sky-800 border-sky-200',
                member: 'bg-emerald-100 text-emerald-800 border-emerald-200',
              }[u.role] || 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div key={u.id} className="p-3 rounded-lg border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">@{u.username}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleBadge}`}>
                      {u.role.toUpperCase()}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(u.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
