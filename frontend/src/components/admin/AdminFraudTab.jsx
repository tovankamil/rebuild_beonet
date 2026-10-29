import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  UserX,
  UserCheck,
  RefreshCw,
  Search,
  Filter,
  Clock,
  ArrowRight,
  Lock,
  ShieldCheck,
  Eye,
  Coins,
  Building2,
  X,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';
import ModalPortal from '../common/ModalPortal';

export default function AdminFraudTab({ onNavigateToAudit }) {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [overview, setOverview] = useState({
    total_cases: 0,
    high_risk_count: 0,
    medium_risk_count: 0,
    low_risk_count: 0,
    open_cases_count: 0,
    resolved_count: 0,
    frozen_users_count: 0,
    cases: [],
  });

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('open'); // default open
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Freeze Modal State
  const [freezeModalCase, setFreezeModalCase] = useState(null);
  const [freezing, setFreezing] = useState(false);

  // Resolve Modal State
  const [resolveModalCase, setResolveModalCase] = useState(null);
  const [actionTaken, setActionTaken] = useState('CLEARED');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const [notification, setNotification] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (riskFilter) params.risk_level = riskFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/fraud/overview', { params });
      if (res.data?.data) {
        setOverview(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load fraud overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [search, riskFilter, statusFilter]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await api.post('/admin/fraud/scan');
      setNotification('Pemindaian indikasi kecurangan selesai diperbarui.');
      setTimeout(() => setNotification(''), 4000);
      fetchOverview();
    } catch (err) {
      console.error('Failed to run scan:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmFreeze = async () => {
    if (!freezeModalCase) return;
    setFreezing(true);
    try {
      const res = await api.post(`/admin/fraud/cases/${freezeModalCase.id}/freeze`);
      setNotification(res.data?.message || 'Akun berhasil dibekukan sementara.');
      setTimeout(() => setNotification(''), 4000);
      setFreezeModalCase(null);
      fetchOverview();
    } catch (err) {
      console.error('Failed to freeze account:', err);
    } finally {
      setFreezing(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!resolveModalCase) return;
    setResolving(true);
    try {
      const res = await api.post(`/admin/fraud/cases/${resolveModalCase.id}/resolve`, {
        action_taken: actionTaken,
        notes: adminNotes,
      });
      setNotification(res.data?.message || 'Kasus fraud telah ditandai terselesaikan.');
      setTimeout(() => setNotification(''), 4000);
      setResolveModalCase(null);
      setAdminNotes('');
      fetchOverview();
    } catch (err) {
      console.error('Failed to resolve case:', err);
    } finally {
      setResolving(false);
    }
  };

  const casesList = overview.cases || [];
  const totalPages = Math.ceil(casesList.length / pageSize) || 1;
  const paginatedCases = casesList.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert size={26} className="text-rose-600" />
            <span>Fraud Control & Deteksi Risiko Sistem</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pusat analitik kepatuhan mendeteksi duplikasi rekening, manipulasi NIK KTP, spike penarikan dana, dan anomali jaringan biner
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center gap-2"
          >
            <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
            <span>{scanning ? 'Memindai Anomali...' : 'Pindai Ulang Anomali'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="dash-card p-5 border-l-4 border-l-rose-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Peringatan Terbuka (Open)
            </span>
            <div className="font-heading font-extrabold text-2xl text-slate-900">
              {overview.open_cases_count}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Dari total {overview.total_cases} kasus terdeteksi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="dash-card p-5 border-l-4 border-l-red-600 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Tingkat Risiko Tinggi
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-ping" />
            </div>
            <div className="font-heading font-extrabold text-2xl text-red-700">
              {overview.high_risk_count}
            </div>
            <span className="text-[11px] text-red-500 mt-0.5 block">
              Butuh tindakan verifikasi segera
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Medium Risk */}
        <div className="dash-card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Risiko Sedang / Monitor
            </span>
            <div className="font-heading font-extrabold text-2xl text-slate-900">
              {overview.medium_risk_count}
            </div>
            <span className="text-[11px] text-amber-600 mt-0.5 block">
              Duplikasi sekunder & frekuensi transaksi
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>

        {/* Frozen Accounts */}
        <div className="dash-card p-5 border-l-4 border-l-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Akun Dibekukan (Suspended)
            </span>
            <div className="font-heading font-extrabold text-2xl text-slate-900">
              {overview.frozen_users_count}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Akses login & penarikan dinonaktifkan
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <UserX size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="dash-card overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari anomali, username, atau keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="dash-input pl-8 py-1.5 text-xs w-64"
              />
            </div>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="dash-input py-1.5 text-xs w-36"
            >
              <option value="">Semua Tingkat</option>
              <option value="high">🔴 Risiko Tinggi</option>
              <option value="medium">🟡 Risiko Sedang</option>
              <option value="low">🔵 Risiko Rendah</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dash-input py-1.5 text-xs w-36"
            >
              <option value="">Semua Status</option>
              <option value="open">⏳ Terbuka (Open)</option>
              <option value="investigating">🔍 Sedang Ditindak</option>
              <option value="resolved">✅ Selesai (Resolved)</option>
            </select>
          </div>

          <ExportButtons
            filename="Laporan_Fraud_Control_Bionet"
            title="LAPORAN AUDIT & DETEKSI FRAUD BIONET"
            subtitle="Daftar kasus kecurangan dan anomali akun terdeteksi sistem"
            headers={['TINGKAT RISIKO', 'ATURAN KECURANGAN', 'JUDUL INDIKASI', 'PENGGUNA TERKAIT', 'STATUS', 'TANGGAL DETEKSI']}
            rows={casesList.map((c) => [
              c.risk_level.toUpperCase(),
              c.rule_key,
              c.title,
              c.user ? `@${c.user.username} (${c.user.full_name})` : 'Multi-Account',
              c.status.toUpperCase(),
              formatExportDate(c.created_at, { includeTime: true }),
            ])}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tingkat Risiko
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Indikasi & Aturan Kecurangan
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mitra Terkait
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Waktu Deteksi
                </th>
                <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                  Tindakan Kontrol
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-rose-600 mx-auto mb-2" />
                    <span>Memindai data anomali sistem...</span>
                  </td>
                </tr>
              ) : casesList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <ShieldCheck size={36} className="text-emerald-500 mx-auto mb-2 opacity-80" />
                    <div className="font-heading font-bold text-slate-700 text-sm">
                      Sistem Aman & Bersih
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Tidak ada indikasi duplikasi rekening, penyalahgunaan KTP, atau spike penarikan yang mencurigakan.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedCases.map((fc) => (
                  <tr key={fc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Risk Badge */}
                    <td className="py-3.5 px-4 align-top">
                      {fc.risk_level === 'high' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          <span>HIGH RISK</span>
                        </span>
                      ) : fc.risk_level === 'medium' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>MEDIUM</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>LOW RISK</span>
                        </span>
                      )}
                    </td>

                    {/* Rule & Description */}
                    <td className="py-3.5 px-4 align-top max-w-sm">
                      <div className="font-heading font-bold text-slate-900 text-xs mb-1">
                        {fc.title}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {fc.description}
                      </p>
                      <div className="mt-1.5">
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          {fc.rule_key}
                        </span>
                      </div>
                    </td>

                    {/* Associated User */}
                    <td className="py-3.5 px-4 align-top">
                      {fc.user ? (
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800">
                            @{fc.user.username}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                            {fc.user.full_name}
                          </div>
                          <div>
                            {fc.user.status === 'suspended' ? (
                              <span className="badge-dot badge-dot-danger text-[10px] text-red-700 font-bold">
                                Dibekukan
                              </span>
                            ) : (
                              <span className="badge-dot badge-dot-success text-[10px] text-emerald-700">
                                Aktif
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Multiple Users</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 align-top">
                      {fc.status === 'open' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase">
                          Open
                        </span>
                      ) : fc.status === 'investigating' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase">
                          Investigating
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                          Resolved ({fc.action_taken})
                        </span>
                      )}
                    </td>

                    {/* Detected At */}
                    <td className="py-3.5 px-4 align-top text-slate-500 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        <span>{formatExportDate(fc.created_at, { includeTime: true })}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {fc.user && fc.user.status !== 'suspended' && (
                          <button
                            onClick={() => setFreezeModalCase(fc)}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                            title="Bekukan Akun Sementara"
                          >
                            <UserX size={12} />
                            <span>Bekukan</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setResolveModalCase(fc);
                            setActionTaken(fc.action_taken === 'FROZEN' ? 'WARNED' : 'CLEARED');
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] transition-colors"
                          title="Tandai Status Kasus"
                        >
                          <span>Tindak Lanjut</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <DashPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={casesList.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Freeze Account Confirmation Modal */}
      {freezeModalCase && (
        <ModalPortal isOpen={!!freezeModalCase} onClose={() => setFreezeModalCase(null)} ariaLabel="Bekukan Akun Pengguna">
          <div
            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX size={20} />
                <h4 className="font-heading font-extrabold text-base">
                  Bekukan Akun Pengguna
                </h4>
              </div>
              <button
                onClick={() => setFreezeModalCase(null)}
                className="text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 leading-relaxed">
                Anda akan membekukan akun <strong>@{freezeModalCase.user?.username}</strong> ({freezeModalCase.user?.full_name}) terkait indikasi:{' '}
                <strong>{freezeModalCase.title}</strong>.
              </div>

              <p className="text-slate-600">
                Pengguna yang dibekukan (*Suspended*) tidak akan dapat login, melakukan penarikan saldo, maupun mentransfer PIN lisensi hingga investigasi selesai.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFreezeModalCase(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFreeze}
                  disabled={freezing}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <UserX size={14} />
                  <span>{freezing ? 'Membekukan...' : 'Ya, Bekukan Akun'}</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Resolve Case Modal */}
      {resolveModalCase && (
        <ModalPortal isOpen={!!resolveModalCase} onClose={() => setResolveModalCase(null)} ariaLabel="Penyelesaian Kasus Fraud">
          <div
            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-slate-800">
                    Penyelesaian Kasus Fraud
                  </h4>
                  <p className="text-[11px] text-slate-400">Verifikasi kepatuhan dan audit investigasi</p>
                </div>
              </div>
              <button
                onClick={() => setResolveModalCase(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keputusan Verifikasi
                </label>
                <select
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="dash-input text-xs"
                >
                  <option value="CLEARED">✅ Dinyatakan Aman / Valid (Cleared)</option>
                  <option value="WARNED">⚠️ Diberi Peringatan Kepatuhan (Warned)</option>
                  <option value="DISMISSED">❌ Abaikan Peringatan (Dismissed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Investigasi Admin
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Dokumen rekening bank telah dikonfirmasi sah atas nama keluarga mitra..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="dash-input text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalCase(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResolve}
                  disabled={resolving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{resolving ? 'Menyimpan...' : 'Simpan Status Kasus'}</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
