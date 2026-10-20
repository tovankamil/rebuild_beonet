import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Phone, CheckCircle2, AlertCircle, Share2, Check } from 'lucide-react';
import api from '../services/api';

export default function ReferralsTab() {
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchReferrals = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/referrals');
      if (res.data && res.data.data) {
        setReferrals(res.data.data);
      }
    } catch (err) {
      setError('Gagal memuat daftar referral sponsor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleCopyLink = () => {
    const user = JSON.parse(localStorage.getItem('bionet_user') || '{}');
    const url = `${window.location.origin}/register?ref=${user?.username || 'mitra'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = referrals.filter((item) =>
    item.username.toLowerCase().includes(search.toLowerCase()) ||
    item.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={24} className="text-emerald-600" />
            <span>Daftar Mitra Sponsor Langsung (Direct Referrals)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Data mitra yang mendaftar langsung menggunakan kode sponsor referral Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} className="text-emerald-600" />}
            <span>{copied ? 'Link Tersalin!' : 'Bagikan Link Sponsor'}</span>
          </button>
          <button
            onClick={fetchReferrals}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Segarkan Data"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Referrals Table (DashLite nk-tb-list) */}
      <div className="dash-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800">
              Mitra Terdaftar ({filtered.length})
            </h4>
            <p className="text-xs text-slate-400">Total mitra di bawah garis sponsor langsung Anda</p>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dash-input pl-9 py-1.5 text-xs w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200">
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Mitra Pengguna
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Kontak WhatsApp
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Status Akun
                </th>
                <th className="py-3 px-5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal Bergabung
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin text-emerald-600 mx-auto mb-2" />
                    <span>Memuat data referral...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    Tidak ada mitra sponsor yang ditemukan. Bagikan link referral Anda untuk mulai membangun jaringan!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {item.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.full_name}</div>
                          <div className="text-[11px] text-slate-400">@{item.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {item.phone ? (
                        <a
                          href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold"
                        >
                          <Phone size={13} />
                          <span>{item.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                        {item.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '18 Okt 2026'}
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
