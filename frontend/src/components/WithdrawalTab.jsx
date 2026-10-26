import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import api from '../services/api';
import DashPagination from './dashlite/DashPagination';
import ExportButtons from './dashlite/ExportButtons';
import { formatExportDate } from '../utils/exportUtils';

export default function WithdrawalTab({ walletBalance, onWithdrawalSuccess, bank }) {
  const [amount, setAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchWithdrawals = async () => {
    setFetching(true);
    try {
      const res = await api.get('/dashboard/withdrawals');
      if (res.data && res.data.data) {
        setWithdrawals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 50000) {
      setErrorMsg('Minimal penarikan saldo adalah Rp 50.000');
      return;
    }

    if (numAmount > (walletBalance || 0)) {
      setErrorMsg('Saldo dompet tidak mencukupi untuk melakukan penarikan ini.');
      return;
    }

    if (!bank) {
      setErrorMsg('Silakan lengkapi data rekening bank tujuan di menu Rekening Bank terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/dashboard/withdrawals', { amount: numAmount });
      if (res.data && res.data.data) {
        setSuccessMsg('Pengajuan penarikan dana berhasil dikirim! Gateway Flip.id akan memproses transfer secara otomatis.');
        setAmount('');
        fetchWithdrawals();
        if (onWithdrawalSuccess) onWithdrawalSuccess();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengajukan penarikan dana.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAccount = (accNo) => {
    if (!accNo) return;
    navigator.clipboard.writeText(accNo.replace(/[^0-9]/g, ''));
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const adminFee = 5000;
  const numAmount = parseFloat(amount) || 0;
  const netEstimate = numAmount > adminFee ? numAmount - adminFee : 0;
  const quickNominals = [100000, 250000, 500000, 1000000];

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return w.status === 'pending';
    if (filterStatus === 'completed') return w.status === 'completed' || w.status === 'approved';
    if (filterStatus === 'rejected') return w.status === 'rejected';
    return true;
  });

  const totalWdPages = Math.ceil(filteredWithdrawals.length / pageSize) || 1;
  const paginatedWithdrawals = filteredWithdrawals.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark size={24} className="text-emerald-600" />
            <span>Pencairan Dana (Withdrawal via Flip.id)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Penarikan komisi bonus harian langsung ke rekening bank mitra secara aman dan cepat
          </p>
        </div>
        <button
          onClick={fetchWithdrawals}
          disabled={fetching}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Segarkan Riwayat"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-emerald-600' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Panel (Col 7) */}
        <div className="lg:col-span-7 dash-card p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-800">
                Formulir Pengajuan Penarikan Saldo
              </h4>
              <p className="text-xs text-slate-400">Pilih nominal atau masukkan jumlah yang ingin ditarik</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Saldo Dompet</span>
              <div className="font-heading font-extrabold text-lg text-emerald-600">
                {formatRupiah(walletBalance)}
              </div>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominal Penarikan (IDR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="Contoh: 500000"
                  min="50000"
                  step="10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="dash-input pl-11 text-base font-bold text-slate-900"
                  required
                />
              </div>

              {/* Fast Nominal Chips */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {quickNominals.map((nom) => {
                  const isSelected = amount === nom.toString();
                  return (
                    <button
                      key={nom}
                      type="button"
                      onClick={() => setAmount(nom.toString())}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                          : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-700'
                      }`}
                    >
                      Rp {(nom / 1000).toLocaleString('id-ID')}rb
                    </button>
                  );
                })}
                {walletBalance > 50000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(walletBalance.toString())}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition-colors"
                  >
                    Tarik Maksimal
                  </button>
                )}
              </div>
            </div>

            {/* Live Fee Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Nominal Pengajuan:</span>
                <span className="font-semibold text-slate-700">{formatRupiah(numAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Admin Gateway (Flip.id):</span>
                <span className="font-semibold text-rose-600">- {formatRupiah(numAmount > 0 ? adminFee : 0)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-800">
                <span>Estimasi Bersih Diterima di Rekening:</span>
                <span className="text-emerald-600 font-heading text-base font-extrabold">
                  {formatRupiah(netEstimate)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !amount || numAmount < 50000}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm"
            >
              <Landmark size={18} />
              <span>{loading ? 'Memproses Pengajuan...' : 'Ajukan Pencairan Sekarang'}</span>
            </button>
          </form>
        </div>

        {/* Right Info: Bank Destination & Payout Terms (Col 5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bank Destination Card */}
          <div className="dash-card p-5 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" />
                <h5 className="font-heading font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Rekening Tujuan Transfer
                </h5>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nama Bank</span>
                <div className="font-bold text-sm text-slate-800">
                  {bank?.bank_name || 'BCA (Bank Central Asia)'}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nomor Rekening</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-slate-900 tracking-wider">
                    {bank?.account_number || '8271928371'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(bank?.account_number || '8271928371')}
                    className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
                    title="Salin Nomor Rekening"
                  >
                    {copiedAccount ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nama Pemilik Rekening</span>
                <div className="font-bold text-xs text-slate-700 uppercase">
                  {bank?.account_name || 'MITRA BIONET JUARA'}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-100 text-[11px] text-cyan-800 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-cyan-600" />
                <span>Ketentuan Gateway Flip.id:</span>
              </div>
              <p className="leading-relaxed">
                Transfer diproses ke rekening tujuan dalam hitungan menit (24/7 realtime settlement). Minimal saldo Rp 50.000.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800">
              Riwayat Pencairan Dana
            </h4>
            <p className="text-xs text-slate-400">Daftar transaksi penarikan saldo dompet ke rekening bank</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <ExportButtons
              filename="Riwayat_Pencairan_Bionet"
              title="RIWAYAT PENCAIRAN DANA (WITHDRAWAL)"
              subtitle="Rekapitulasi riwayat penarikan saldo mitra Bionet ke rekening bank"
              headers={['ID REF', 'TANGGAL', 'BANK TUJUAN', 'NO. REKENING', 'PEMILIK', 'NOMINAL KOTOR', 'BIAYA ADMIN', 'NOMINAL BERSIH', 'STATUS']}
              rows={filteredWithdrawals.map((w) => [
                w.id ? w.id.slice(0, 8).toUpperCase() : '-',
                formatExportDate(w.created_at || w.updated_at),
                w.bank?.bank_name || 'BCA',
                w.bank?.account_number || '-',
                w.bank?.account_name || '-',
                formatRupiah(w.amount),
                formatRupiah(w.admin_fee),
                formatRupiah(w.net_amount),
                w.status === 'completed' || w.status === 'approved' ? 'SELESAI' : w.status === 'rejected' ? 'DITOLAK' : 'PROSES',
              ])}
            />

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  setFilterStatus('pending');
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterStatus === 'pending'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Sedang Diproses
              </button>
              <button
                onClick={() => {
                  setFilterStatus('completed');
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Berhasil
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ID Penarikan (UUID)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nominal Ditarik
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Biaya Admin
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status Transfer
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal Pengajuan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Belum ada riwayat penarikan dana pada kategori ini.
                  </td>
                </tr>
              ) : (
                paginatedWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>#{w.id.substring(0, 8)}...</span>
                        <button
                          onClick={() => handleCopyId(w.id)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          title="Salin UUID Lengkap"
                        >
                          {copiedId === w.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 font-heading">
                      {formatRupiah(w.amount)}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {formatRupiah(w.admin_fee || 5000)}
                    </td>
                    <td className="py-3.5 px-5">
                      {w.status === 'approved' || w.status === 'completed' ? (
                        <span className="badge-dot badge-dot-success text-[11px] text-emerald-700 font-semibold">
                          Berhasil Ditransfer
                        </span>
                      ) : w.status === 'rejected' ? (
                        <span className="badge-dot badge-dot-danger text-[11px] text-rose-700 font-semibold">
                          Ditolak
                        </span>
                      ) : (
                        <span className="badge-dot badge-dot-warning text-[11px] text-amber-700 font-semibold">
                          Sedang Diproses
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      {w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : 'Hari ini'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <DashPagination
          currentPage={page}
          totalPages={totalWdPages}
          totalItems={filteredWithdrawals.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
