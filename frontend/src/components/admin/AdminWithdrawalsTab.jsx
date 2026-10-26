import React, { useState, useEffect } from 'react';
import { Landmark, CheckCircle2, XCircle, Clock, RefreshCw, Filter } from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';

export default function AdminWithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/withdrawals', {
        params: statusFilter ? { status: statusFilter } : {},
      });
      if (res.data?.data) {
        setWithdrawals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchWithdrawals();
  }, [statusFilter]);

  const totalPages = Math.ceil(withdrawals.length / pageSize) || 1;
  const paginatedWithdrawals = withdrawals.slice((page - 1) * pageSize, page * pageSize);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.patch(`/admin/withdrawals/${id}/status`, { status });
      setMessage(`Status penarikan dana berhasil diperbarui menjadi ${status}`);
      fetchWithdrawals();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Persetujuan Pencairan Dana (Withdrawal)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola dan setujui permintaan transfer payout saldo mitra ke rekening bank
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ExportButtons
            filename="Approval_Pencairan_Bionet"
            title="DAFTAR PENGAJUAN PENCAIRAN DANA (WITHDRAWAL)"
            subtitle="Persetujuan transfer dana komisi mitra melalui Flip.id"
            headers={['WAKTU', 'USERNAME', 'NAMA MITRA', 'BANK TUJUAN', 'NO. REKENING', 'PEMILIK', 'NOMINAL (RP)', 'ADMIN (RP)', 'NET (RP)', 'STATUS']}
            rows={withdrawals.map((w) => [
              formatExportDate(w.created_at || w.updated_at),
              w.user?.username || '-',
              w.user?.full_name || '-',
              w.bank?.bank_name || 'BCA',
              w.bank?.account_number || '-',
              w.bank?.account_name || '-',
              w.amount,
              w.admin_fee,
              w.net_amount,
              w.status?.toUpperCase(),
            ])}
          />
          <button
            onClick={fetchWithdrawals}
            disabled={loading}
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
          <Filter size={13} /> Filter:
        </span>
        {[
          { label: 'Semua Status', val: '' },
          { label: 'Pending (Menunggu)', val: 'pending' },
          { label: 'Selesai (Completed)', val: 'completed' },
          { label: 'Ditolak (Rejected)', val: 'rejected' },
        ].map((f) => (
          <button
            key={f.val}
            onClick={() => setStatusFilter(f.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === f.val
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Mitra Pengaju</th>
                <th className="py-3 px-4">Rekening Tujuan</th>
                <th className="py-3 px-4">Nominal Pengajuan</th>
                <th className="py-3 px-4">Biaya Admin</th>
                <th className="py-3 px-4">Nominal Diterima</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi Approval</th>
              </tr>
            </thead>
            <tbody>
              {loading && withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Memuat permintaan penarikan...</span>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Tidak ada catatan penarikan dana pada kategori ini.
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((wd) => {
                  const statusConfig = {
                    pending: { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Menunggu' },
                    completed: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Selesai' },
                    rejected: { bg: 'bg-rose-100 text-rose-800 border-rose-300', text: 'Ditolak' },
                  }[wd.status] || { bg: 'bg-slate-100 text-slate-800', text: wd.status };

                  return (
                    <tr key={wd.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{wd.user?.full_name || 'Mitra'}</div>
                        <div className="text-[11px] text-slate-400">@{wd.user?.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{wd.bank?.bank_name || '-'}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {wd.bank?.account_number} a.n {wd.bank?.account_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {formatRupiah(wd.amount)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatRupiah(wd.admin_fee)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatRupiah(wd.net_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${statusConfig.bg}`}>
                          {statusConfig.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {wd.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(wd.id, 'completed')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                            >
                              Setujui (Transfer)
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(wd.id, 'rejected')}
                              disabled={actionLoading}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 text-[11px] transition-colors"
                            >
                              Tolak
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Sudah Diproses</span>
                        )}
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
          totalItems={withdrawals.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
