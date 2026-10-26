import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CreditCard,
  FileText,
  Phone,
  Check,
  AlertCircle,
  Save,
  Shield,
} from 'lucide-react';
import api from '../services/api';

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=mitra01',
  'https://api.dicebear.com/7.x/bottts/svg?seed=gold_leader',
  'https://api.dicebear.com/7.x/bottts/svg?seed=champion99',
  'https://api.dicebear.com/7.x/bottts/svg?seed=bionet_star',
  'https://api.dicebear.com/7.x/bottts/svg?seed=diamond_bionet',
  'https://api.dicebear.com/7.x/bottts/svg?seed=super_mitra',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bionet_man',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=bionet_woman',
];

export default function ProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    ktp: '',
    npwp: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        ktp: currentUser.ktp || '',
        npwp: currentUser.npwp || '',
        avatar: currentUser.avatar || AVATAR_PRESETS[0],
      });
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi KTP: jika diisi, harus 16 digit angka
    if (formData.ktp && !/^\d{16}$/.test(formData.ktp.trim())) {
      setErrorMsg('Nomor KTP (NIK) harus terdiri dari 16 digit angka sesuai standar Dukcapil');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/dashboard/profile', {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        ktp: formData.ktp.trim(),
        npwp: formData.npwp.trim(),
        avatar: formData.avatar.trim(),
      });

      setSuccessMsg('Profil dan data identitas berhasil diperbarui!');
      if (onProfileUpdated) {
        onProfileUpdated(res.data.data);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan perubahan profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-slate-800 text-base">
                Edit Profil & Identitas Legal
              </h3>
              <p className="text-xs text-slate-400">
                Kelola data KTP, NPWP, dan avatar resmi akun Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
              <Check size={15} className="flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Preview & Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Avatar / Foto Profil
            </label>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={formData.avatar || AVATAR_PRESETS[0]}
                alt="Avatar Preview"
                className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-400 shadow-sm p-1 object-cover"
              />
              <div className="text-xs text-slate-500">
                Pilih salah satu karakter resmi Bionet di bawah atau masukkan URL foto kustom.
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatar: preset })}
                  className={`p-1 rounded-xl border transition-all ${
                    formData.avatar === preset
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/40 shadow-xs scale-105'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx + 1}`} className="w-8 h-8 rounded-lg" />
                </button>
              ))}
            </div>

            <div className="mt-2.5">
              <input
                type="text"
                placeholder="Atau tempel URL Avatar kustom (https://...)"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={15} />
              </div>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Contoh: Ahmad Yani Juara"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor Handphone / WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone size={15} />
              </div>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 081234567890"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
              />
            </div>
          </div>

          {/* KTP & NPWP Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor KTP / NIK (16 Digit)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <CreditCard size={15} />
                </div>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.ktp}
                  onChange={(e) => setFormData({ ...formData, ktp: e.target.value.replace(/\D/g, '') })}
                  placeholder="3201xxxxxxxx0001"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Diperlukan untuk kepatuhan KYC & pencairan dana
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Pokok Wajib Pajak (NPWP)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileText size={15} />
                </div>
                <input
                  type="text"
                  maxLength={20}
                  value={formData.npwp}
                  onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                  placeholder="98.765.432.1-012.000"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-medium text-slate-800"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Opsional untuk pemotongan PPh 21 komisi
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
            <Shield size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              Perubahan profil ini dicatat secara otomatis dalam sistem audit log platform untuk perlindungan keamanan data akun Anda.
            </span>
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              <Save size={14} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
