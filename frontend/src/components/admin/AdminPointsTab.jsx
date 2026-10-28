import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Search,
  RefreshCw,
  Zap,
  TrendingUp,
  Scale,
  Edit3,
  X,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';

export default function AdminPointsTab() {
  const [points, setPoints] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metrics, setMetrics] = useState({ total_point_left: 0, total_point_right: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Modal State for Manual Adjustment
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjLeft, setAdjLeft] = useState(0);
  const [adjRight, setAdjRight] = useState(0);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;

      const res = await api.get('/admin/points', { params });
      if (res.data?.data) {
        setPoints(res.data.data);
      }
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load points:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPoints();
  };

  const totalPages = Math.ceil(points.length / pageSize) || 1;
  const paginatedPoints = points.slice((page - 1) * pageSize, page * pageSize);

  const openAdjust = (pb) => {
    setAdjustModal(pb);
    setAdjLeft(pb.point_left || 0);
    setAdjRight(pb.point_right || 0);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustModal) return;
    setActionLoading(true);
    try {
      await api.post('/admin/points/adjust', {
        user_id: adjustModal.user_id,
        point_left: parseFloat(adjLeft) || 0,
        point_right: parseFloat(adjRight) || 0,
      });
      setNotification(`Poin binary untuk @${adjustModal.user?.username || 'user'} berhasil disesuaikan!`);
      setAdjustModal(null);
      fetchPoints();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan penyesuaian poin');
    } finally {
      setActionLoading(false);
    }
  };

  // Platform calculations
  const totalPairingPotentials = points.reduce((acc, p) => {
    return acc + Math.min(p.point_left || 0, p.point_right || 0);
  }, 0);

  const totalEstPairingAmount = totalPairingPotentials * 20000;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Poin Pasangan &amp; Keseimbangan Binary
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Kaki Kiri / Kanan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring akumulasi volume omset jaringan binary, rasio kaki kiri vs kanan, dan simulasi potensi flush-out bonus pasangan
          </p>
        </div>

        <button
          onClick={fetchPoints}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* 2. KPI Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Left */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Poin Kiri (Left)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {metrics.total_point_left.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-400">PV</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Akumulasi seluruh jalur kiri mitra</div>
        </div>

        {/* Total Right */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Poin Kanan (Right)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {metrics.total_point_right.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-400">PV</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Akumulasi seluruh jalur kanan mitra</div>
        </div>

        {/* Potensi Pasangan Terkunci */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Potensi Pasangan</span>
            <Zap size={15} className="text-amber-500" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {totalPairingPotentials.toLocaleString('id-ID')} <span className="text-xs font-medium text-slate-400">Pasang</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Matching volume 1:1 terkunci</div>
        </div>

        {/* Estimasi Nilai Pairing */}
        <div className="dash-card p-4 bg-gradient-to-br from-emerald-50/50 to-white border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Estimasi Nilai Pairing</span>
            <Scale size={15} className="text-emerald-600" />
          </div>
          <div className="text-xl font-heading font-extrabold text-emerald-900">
            Rp {totalEstPairingAmount.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">@ Rp 20.000 / pasang</div>
        </div>
      </div>

      {/* 3. Search & Count Bar */}
      <div className="dash-card p-4 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama lengkap atau username mitra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dash-input pl-10 text-xs py-2 w-full"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <ExportButtons
            filename="Poin_Binary_Bionet"
            title="REKAPITULASI POIN PASANGAN BINARY MITRA"
            subtitle="Volume omset kaki kiri/kanan, potensi pairing matching, dan estimasi nilai bonus"
            headers={['USERNAME', 'NAMA MITRA', 'POIN KIRI (PV)', 'POIN KANAN (PV)', 'POTENSI PASANG', 'STATUS KAKI', 'TERAKHIR UPDATE']}
            rows={points.map((pb) => {
              const left = pb.point_left || 0;
              const right = pb.point_right || 0;
              const pair = Math.min(left, right);
              const status = left === right ? 'SEIMBANG' : left > right ? 'LEBIH KIRI' : 'LEBIH KANAN';
              return [
                pb.user?.username || '-',
                pb.user?.full_name || '-',
                left,
                right,
                pair,
                status,
                formatExportDate(pb.updated_at || pb.created_at),
              ];
            })}
          />
          <div className="text-xs text-slate-500 font-medium">
            Total <strong className="text-slate-800">{points.length}</strong> mitra
          </div>
        </div>
      </div>

      {/* 4. Points Table */}
      <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Mitra Bionet</th>
                <th className="py-3 px-4 text-center">Poin Kiri (Left)</th>
                <th className="py-3 px-4 text-center">Poin Kanan (Right)</th>
                <th className="py-3 px-4 text-center">Potensi Pasangan</th>
                <th className="py-3 px-4">Keseimbangan Kaki</th>
                <th className="py-3 px-4">Terakhir Diperbarui</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && points.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Memuat neraca poin binary...</span>
                  </td>
                </tr>
              ) : points.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Tidak ditemukan data poin binary yang sesuai.
                  </td>
                </tr>
              ) : (
                paginatedPoints.map((pb) => {
                  const left = pb.point_left || 0;
                  const right = pb.point_right || 0;
                  const potential = Math.min(left, right);
                  const estBonus = potential * 20000;

                  let statusText = 'Seimbang';
                  let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (left > right * 1.5) {
                    statusText = 'Dominan Kiri';
                    statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (right > left * 1.5) {
                    statusText = 'Dominan Kanan';
                    statusBadge = 'bg-sky-50 text-sky-700 border-sky-200';
                  }

                  return (
                    <tr key={pb.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0d3b2e] text-emerald-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {pb.user?.username?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{pb.user?.full_name || 'Mitra Bionet'}</div>
                            <div className="text-[10px] text-slate-400">@{pb.user?.username || '-'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Point Left */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block min-w-[50px]">
                          {left} PV
                        </span>
                      </td>

                      {/* Point Right */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200 inline-block min-w-[50px]">
                          {right} PV
                        </span>
                      </td>

                      {/* Potensi Pasangan */}
                      <td className="py-3 px-4 text-center">
                        <div>
                          <span className="font-heading font-extrabold text-slate-800 text-xs">
                            {potential} Pasang
                          </span>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            &asymp; Rp {estBonus.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </td>

                      {/* Status Kaki */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${statusBadge}`}>
                          {statusText}
                        </span>
                      </td>

                      {/* Updated At */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(pb.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openAdjust(pb)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Edit3 size={12} />
                          <span>Adjust Poin</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <DashPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={points.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Adjust Point Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveAdjust}
            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 ease-out"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GitFork size={18} className="text-emerald-700" />
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Penyesuaian Poin Binary (Admin)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0d3b2e] text-emerald-300 font-bold flex items-center justify-center">
                {adjustModal.user?.username?.charAt(0).toUpperCase() || 'M'}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{adjustModal.user?.full_name}</div>
                <div className="text-xs text-slate-400">@{adjustModal.user?.username}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Poin Kiri (Left PV):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjLeft}
                  onChange={(e) => setAdjLeft(e.target.value)}
                  className="dash-input text-xs font-mono font-bold w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Poin Kanan (Right PV):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={adjRight}
                  onChange={(e) => setAdjRight(e.target.value)}
                  className="dash-input text-xs font-mono font-bold w-full"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Perubahan nilai poin akan langsung mempengaruhi rasio pasangan binary (matching) dan omset turnover kemitraan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustModal(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {actionLoading && <RefreshCw size={12} className="animate-spin" />}
                <span>Simpan Nilai Poin</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
