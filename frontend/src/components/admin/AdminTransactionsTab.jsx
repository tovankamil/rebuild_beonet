import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  Zap,
  Users,
  Landmark,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';

export default function AdminTransactionsTab() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metrics, setMetrics] = useState({
    total_credit: 0,
    total_debit: 0,
    total_pairing_bonus: 0,
    total_sponsor_bonus: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all'); // all, pairing, sponsor, withdrawal, credit, debit
  const [txType, setTxType] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;
      if (txType) params.type = txType;

      const res = await api.get('/admin/transactions', { params });
      if (res.data?.data) {
        setTransactions(res.data.data);
      }
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTransactions();
  }, [category, txType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const paginatedTransactions = transactions.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Buku Besar Transaksi &amp; Bonus Pasangan
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Audit Global
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit seluruh mutasi dompet mitra, rincian pembayaran bonus pasangan (pairing), komisi sponsor, dan penarikan dana harian
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Mutasi</span>
        </button>
      </div>

      {/* 2. KPI Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Credit */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Kredit (Bonus Masuk)</span>
            <ArrowDownLeft size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-heading font-extrabold text-slate-900">
            Rp {(metrics.total_credit || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Seluruh komisi &amp; inflow sistem</div>
        </div>

        {/* Bonus Pasangan (Pairing) - Highlighted */}
        <div className="dash-card p-4 bg-gradient-to-br from-emerald-50/50 to-white border-2 border-emerald-500 shadow-sm relative overflow-hidden">
          <div className="absolute -right-3 -top-3 w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Zap size={20} className="text-emerald-600 opacity-60" />
          </div>
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1">
              <Zap size={13} className="text-emerald-600" />
              Bonus Pasangan (Pairing)
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-600 text-white">
              Utama
            </span>
          </div>
          <div className="text-xl font-heading font-extrabold text-emerald-900">
            Rp {(metrics.total_pairing_bonus || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Matching volume kaki binary</div>
        </div>

        {/* Bonus Sponsor */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Bonus Sponsor</span>
            <Users size={16} className="text-sky-600" />
          </div>
          <div className="text-xl font-heading font-extrabold text-slate-900">
            Rp {(metrics.total_sponsor_bonus || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pendaftaran member binaan</div>
        </div>

        {/* Total Debit / Withdrawal */}
        <div className="dash-card p-4 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Penarikan (WD)</span>
            <ArrowUpRight size={16} className="text-rose-600" />
          </div>
          <div className="text-xl font-heading font-extrabold text-slate-900">
            Rp {(metrics.total_debit || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Payout Flip.id &amp; pemotongan saldo</div>
        </div>
      </div>

      {/* 3. Filter Category Pills & Search */}
      <div className="dash-card p-4 bg-white space-y-3">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter size={13} />
            Filter Kategori:
          </span>

          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              category === 'all'
                ? 'bg-[#0d3b2e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Transaksi
          </button>

          <button
            onClick={() => setCategory('pairing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              category === 'pairing'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Zap size={12} />
            <span>Bonus Pasangan (Pairing)</span>
          </button>

          <button
            onClick={() => setCategory('sponsor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              category === 'sponsor'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Users size={12} />
            <span>Bonus Sponsor</span>
          </button>

          <button
            onClick={() => setCategory('withdrawal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              category === 'withdrawal'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Landmark size={12} />
            <span>Penarikan Dana (WD)</span>
          </button>

          <button
            onClick={() => setCategory('credit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              category === 'credit'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kredit Lainnya
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi, username, atau nama mitra..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dash-input pl-10 text-xs py-2 w-full"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons
              filename="Buku_Besar_Bionet"
              title="BUKU BESAR MUTASI & AUDIT BONUS PASANGAN"
              subtitle="Laporan mutasi kredit/debit dompet, komisi sponsor, dan bonus pairing binary"
              headers={['WAKTU', 'USERNAME', 'NAMA MITRA', 'TIPE', 'NOMINAL (RP)', 'SALDO AKHIR (RP)', 'DESKRIPSI']}
              rows={transactions.map((t) => [
                formatExportDate(t.transaction_date || t.created_at),
                t.user?.username || '-',
                t.user?.full_name || '-',
                t.type?.toUpperCase(),
                t.amount,
                t.balance_after,
                t.description,
              ])}
            />
            <div className="text-xs text-slate-500 font-medium">
              Total <strong className="text-slate-800">{transactions.length}</strong> transaksi
            </div>
          </div>
        </div>
      </div>

      {/* 4. Transactions Table */}
      <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Waktu &amp; Tanggal</th>
                <th className="py-3 px-4">Mitra Penerima</th>
                <th className="py-3 px-4">Tipe &amp; Kategori</th>
                <th className="py-3 px-4">Keterangan Mutasi</th>
                <th className="py-3 px-4 text-right">Nominal</th>
                <th className="py-3 px-4 text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Memuat buku besar transaksi...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-400">
                    Tidak ditemukan mutasi transaksi yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => {
                  const isCredit = t.type === 'credit';
                  const isPairing =
                    t.description?.toLowerCase().includes('pasangan') ||
                    t.description?.toLowerCase().includes('pairing');
                  const isSponsor = t.description?.toLowerCase().includes('sponsor');
                  const isWD =
                    t.description?.toLowerCase().includes('penarikan') ||
                    t.description?.toLowerCase().includes('withdrawal') ||
                    t.description?.toLowerCase().includes('pencairan');

                  return (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="font-semibold text-slate-700">
                          {new Date(t.transaction_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(t.transaction_date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0d3b2e] text-emerald-300 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                            {t.user?.username?.charAt(0).toUpperCase() || 'M'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{t.user?.full_name || 'Mitra Bionet'}</div>
                            <div className="text-[10px] text-slate-400">@{t.user?.username || '-'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type & Category Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCredit
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {isCredit ? 'KREDIT' : 'DEBIT'}
                          </span>

                          {isPairing && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-0.5 shadow-xs">
                              <Zap size={9} />
                              Pasangan
                            </span>
                          )}

                          {isSponsor && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-0.5">
                              <Users size={9} />
                              Sponsor
                            </span>
                          )}

                          {isWD && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                              <Landmark size={9} />
                              Payout WD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={t.description}>
                        {t.description}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isCredit ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCredit ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="py-3 px-4 text-right whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        Rp {t.balance_after.toLocaleString('id-ID')}
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
          totalItems={transactions.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
}
