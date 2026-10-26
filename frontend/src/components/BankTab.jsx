import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  Trash2,
  CreditCard,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';

export default function BankTab({ onBankUpdated }) {
  const [banks, setBanks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const bankOptions = [
    'BCA (Bank Central Asia)',
    'Bank Mandiri',
    'BRI (Bank Rakyat Indonesia)',
    'BNI (Bank Negara Indonesia)',
    'BSI (Bank Syariah Indonesia)',
    'CIMB Niaga',
    'Bank Danamon',
    'Bank Permata',
    'Bank Jago',
    'Seabank Indonesia',
    'Bank Tabungan Negara (BTN)',
  ];

  const fetchBanks = async () => {
    setFetching(true);
    try {
      const res = await api.get('/dashboard/banks');
      if (res.data && res.data.data) {
        setBanks(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat daftar rekening:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleSetDefault = async (bankId) => {
    setSuccessMsg('');
    setErrorMsg('');
    setLoadingAction(true);
    try {
      const res = await api.patch(`/dashboard/banks/${bankId}/default`);
      setSuccessMsg(res.data?.message || 'Rekening utama berhasil diperbarui!');
      // Optimistic update
      setBanks((prev) =>
        prev.map((b) => ({
          ...b,
          is_primary: b.id === bankId,
        }))
      );
      if (onBankUpdated) onBankUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah rekening utama');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteBank = async (bankId, bankTitle) => {
    if (!window.confirm(`Yakin ingin menghapus rekening ${bankTitle}?`)) return;
    setSuccessMsg('');
    setErrorMsg('');
    setLoadingAction(true);
    try {
      await api.delete(`/dashboard/banks/${bankId}`);
      setSuccessMsg('Rekening berhasil dihapus.');
      await fetchBanks();
      if (onBankUpdated) onBankUpdated();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus rekening');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddBank = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoadingAction(true);

    try {
      const res = await api.post('/dashboard/banks', {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        is_primary: isPrimary,
      });

      if (res.data && res.data.data) {
        setSuccessMsg('Rekening bank baru berhasil ditambahkan!');
        setBankName('');
        setAccountNumber('');
        setAccountName('');
        setIsPrimary(false);
        setShowAddModal(false);
        await fetchBanks();
        if (onBankUpdated) onBankUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menambahkan rekening bank.');
    } finally {
      setLoadingAction(false);
    }
  };

  const primaryBank = banks.find((b) => b.is_primary) || banks[0];

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 size={26} className="text-emerald-600 flex-shrink-0" />
            <span>Manajemen Rekening Bank Mitra</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kelola multiple rekening bank penerima payout. Pilih rekening default untuk transfer penarikan dana otomatis via Flip.id.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-600/20 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus size={16} />
          <span>Tambah Rekening Baru</span>
        </button>
      </div>

      {/* Alert Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Bank Cards (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" />
              <span>Daftar Rekening Terdaftar ({banks.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Klik "Jadikan Default" untuk rekening utama</span>
          </div>

          {fetching ? (
            <div className="dash-card p-12 text-center text-slate-400 text-xs animate-pulse">
              Memuat daftar rekening bank...
            </div>
          ) : banks.length === 0 ? (
            <div className="dash-card p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CreditCard size={24} />
              </div>
              <h5 className="font-bold text-slate-700 text-sm">Belum Ada Rekening Bank</h5>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Anda belum menambahkan rekening bank. Tambahkan setidaknya satu rekening untuk dapat melakukan penarikan komisi.
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
              >
                <Plus size={15} />
                <span>Tambah Rekening Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  className={`relative p-5 rounded-xl border transition-all duration-200 ${
                    bank.is_primary
                      ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/50 border-emerald-300 shadow-sm ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-slate-900">
                          {bank.bank_name}
                        </span>
                        {bank.is_primary && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                            <Star size={10} className="fill-current text-amber-300" />
                            <span>UTAMA (DEFAULT)</span>
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm tracking-wide text-slate-700 font-semibold">
                        {bank.account_number}
                      </div>
                      <div className="text-xs text-slate-500 uppercase font-medium">
                        a.n. <span className="text-slate-800 font-bold">{bank.account_name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {!bank.is_primary ? (
                        <button
                          type="button"
                          disabled={loadingAction}
                          onClick={() => handleSetDefault(bank.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs hover:border-emerald-400 transition active:scale-95 flex items-center gap-1.5"
                        >
                          <Check size={14} className="text-emerald-600" />
                          <span>Jadikan Default</span>
                        </button>
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100/60 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-emerald-700" />
                          <span>Rekening Aktif</span>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={loadingAction || bank.is_primary}
                        title={bank.is_primary ? 'Rekening utama tidak dapat dihapus langsung' : 'Hapus rekening'}
                        onClick={() => handleDeleteBank(bank.id, `${bank.bank_name} (${bank.account_number})`)}
                        className={`p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ${
                          bank.is_primary ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Ketentuan Rekening Bank Mitra</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 leading-relaxed">
              <li>Penarikan saldo otomatis ditransfer ke rekening yang bertanda <b>UTAMA (DEFAULT)</b>.</li>
              <li>Nama pemilik rekening harus sesuai identitas KTP agar verifikasi sistem Flip.id instan berhasil.</li>
              <li>Anda dapat mendaftarkan beberapa rekening bank dan berganti rekening default kapan saja.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: ATM Card Preview Mockup (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-600" />
              <span>Kartu Digital Rekening Utama</span>
            </h4>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <Sparkles size={12} />
              <span>Live Preview</span>
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#06241b] via-[#0b382c] to-[#041510] text-white shadow-xl border border-emerald-500/30 relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between transform transition duration-300 hover:scale-[1.01]">
            {/* Background Glow */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-400/15 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

            {/* Top row: Brand & EMV Chip */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-sm tracking-wider text-emerald-400">
                  BIONET PAYOUT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  PRIMARY
                </span>
              </div>
              <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-300 to-yellow-600 border border-yellow-200/40 shadow-inner flex items-center justify-center" />
            </div>

            {/* Middle: Masked Account Number */}
            <div className="relative z-10 my-2">
              <div className="font-mono text-base tracking-widest text-slate-100 font-bold drop-shadow-sm">
                {primaryBank?.account_number
                  ? primaryBank.account_number.replace(/(\d{4})/g, '$1 ').trim()
                  : '•••• •••• •••• 4820'}
              </div>
              <div className="text-[10px] text-emerald-300 font-bold mt-0.5 tracking-wide uppercase">
                {primaryBank?.bank_name || 'BANK CENTRAL ASIA (BCA)'}
              </div>
            </div>

            {/* Bottom: Cardholder Name */}
            <div className="flex items-end justify-between relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Pemilik Rekening
                </span>
                <span className="font-heading font-bold text-xs uppercase tracking-wide text-white">
                  {primaryBank?.account_name || 'MITRA BIONET JUARA'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FLIP.ID READY
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Verifikasi Rekening Terintegrasi</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Setiap nomor rekening diverifikasi secara langsung ke jaringan switching perbankan nasional melalui Flip.id guna mencegah kegagalan transfer komisi.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Tambah Rekening Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">Tambah Rekening Bank</h4>
                  <p className="text-[11px] text-slate-400">Pendaftaran rekening baru mitra</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBank} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Bank <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="dash-input text-xs"
                  required
                >
                  <option value="">-- Pilih Bank Tujuan --</option>
                  {bankOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Rekening <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 8830192848"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="dash-input font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pemilik Rekening <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: AHMAD HIDAYAT"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="dash-input uppercase text-xs"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Pastikan ejaan nama sama persis dengan yang tercetak di buku tabungan.
                </span>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Jadikan sebagai rekening utama (default)
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition flex items-center gap-1.5"
                >
                  <Plus size={15} />
                  <span>{loadingAction ? 'Menyimpan...' : 'Simpan Rekening'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
