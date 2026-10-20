import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  AlertCircle,
  Filter,
} from 'lucide-react';
import api from '../services/api';

export default function TransactionsTab({ walletBalance }) {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/transactions');
      if (res.data && res.data.data) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      setError('Gagal memuat mutasi transaksi wallet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filtered = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet size={24} className="text-emerald-600" />
            <span>Buku Besar Mutasi Dompet (Wallet Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Audit trail seluruh mutasi debit dan kredit secara transparan & real-time
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Segarkan Transaksi"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="dash-card p-5">
          <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Saldo Dompet Saat Ini
          </span>
          <div className="font-heading font-extrabold text-2xl text-emerald-600 mt-1">
            {formatRupiah(walletBalance)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tersedia untuk dicairkan</span>
        </div>

        <div className="dash-card p-5">
          <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Dana Masuk (Kredit)
          </span>
          <div className="font-heading font-extrabold text-2xl text-emerald-600 mt-1 flex items-center gap-1">
            <ArrowDownLeft size={20} />
            <span>{formatRupiah(totalCredit)}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Akumulasi bonus yang diperoleh</span>
        </div>

        <div className="dash-card p-5">
          <span className="overline-title text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Total Dana Keluar (Debit)
          </span>
          <div className="font-heading font-extrabold text-2xl text-rose-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={20} />
            <span>{formatRupiah(totalDebit)}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Akumulasi penarikan dana</span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Ledger Table */}
      <div className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800">
              Riwayat Mutasi Saldo
            </h4>
            <p className="text-xs text-slate-400">Menampilkan {filtered.length} transaksi</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                filterType === 'credit'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Kredit (+)
            </button>
            <button
              onClick={() => setFilterType('debit')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                filterType === 'debit'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Debit (-)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ID Transaksi (UUID)
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Nominal
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Keterangan Transaksi
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin text-emerald-600 mx-auto mb-2" />
                    <span>Memuat buku besar transaksi...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    Tidak ada transaksi pada kategori ini.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                      #{item.id.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-5">
                      {item.type === 'credit' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          <ArrowDownLeft size={12} /> Kredit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                          <ArrowUpRight size={12} /> Debit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-heading font-extrabold text-sm">
                      <span
                        className={
                          item.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                        }
                      >
                        {item.type === 'credit' ? '+' : '-'} {formatRupiah(item.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-700">
                      {item.description || 'Mutasi saldo sistem kemitraan'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString('id-ID')
                        : 'Hari ini'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
