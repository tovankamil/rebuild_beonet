import React, { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle2, AlertCircle, Info, ShieldCheck, CreditCard } from 'lucide-react';
import api from '../services/api';

export default function BankTab({ onBankUpdated }) {
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
  ];

  const fetchBank = async () => {
    setFetching(true);
    try {
      const res = await api.get('/dashboard/bank');
      if (res.data && res.data.data) {
        setBankName(res.data.data.bank_name || '');
        setAccountNumber(res.data.data.account_number || '');
        setAccountName(res.data.data.account_name || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBank();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/dashboard/bank', {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
      });

      if (res.data && res.data.data) {
        setSuccessMsg('Data rekening bank berhasil disimpan dan diperbarui!');
        if (onBankUpdated) onBankUpdated(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan data rekening bank.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Title */}
      <div className="pb-2 border-b border-slate-200">
        <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 size={24} className="text-emerald-600" />
          <span>Pengaturan Rekening Bank Mitra</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Rekening tujuan transfer komisi bonus harian dan penarikan dana melalui gateway Flip.id
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Form Panel (Col 7) */}
        <div className="md:col-span-7 dash-card p-6">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h4 className="font-heading font-bold text-base text-slate-800">
              Formulir Data Rekening
            </h4>
            <p className="text-xs text-slate-400">Pastikan nomor rekening aktif dan sesuai identitas Anda</p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Bank
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
                Nomor Rekening
              </label>
              <input
                type="text"
                placeholder="Contoh: 8830192848"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="dash-input font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pemilik Rekening (Sesuai Buku Tabungan)
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
                Harus sama persis dengan nama di rekening untuk verifikasi Flip.id otomatis.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Save size={15} />
              <span>{loading ? 'Menyimpan Data...' : 'Simpan Perubahan Rekening'}</span>
            </button>
          </form>
        </div>

        {/* Live ATM Card Preview Mockup (Col 5) */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#07241b] via-[#0b3629] to-[#041611] text-white shadow-xl border border-emerald-500/30 relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between">
            {/* Background Aura */}
            <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

            {/* Top row: Brand & EMV Chip */}
            <div className="flex items-center justify-between relative z-10">
              <span className="font-heading font-extrabold text-sm tracking-wider text-emerald-400">
                BIONET PAYOUT
              </span>
              <div className="w-10 h-7 rounded bg-gradient-to-tr from-amber-300 to-yellow-600 border border-yellow-200/40 shadow-inner flex items-center justify-center" />
            </div>

            {/* Middle: Masked Account Number */}
            <div className="relative z-10 my-2">
              <div className="font-mono text-base tracking-widest text-slate-200 font-bold">
                {accountNumber
                  ? accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                  : '•••• •••• •••• 4820'}
              </div>
              <div className="text-[10px] text-emerald-300 font-bold mt-0.5">
                {bankName || 'BANK CENTRAL ASIA (BCA)'}
              </div>
            </div>

            {/* Bottom: Cardholder Name */}
            <div className="flex items-end justify-between relative z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                  Cardholder
                </span>
                <span className="font-heading font-bold text-xs uppercase tracking-wide text-white">
                  {accountName || 'MITRA BIONET MANDIRI'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                FLIP VERIFIED
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-100 text-xs text-cyan-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-cyan-600" />
              <span>Verifikasi Rekening Real-time</span>
            </div>
            <p className="text-[11px] text-cyan-700 leading-relaxed">
              Sistem akan memvalidasi nomor rekening Anda langsung ke server bank tujuan saat melakukan penarikan dana agar dana terkirim tepat sasaran.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
