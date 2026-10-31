import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  MapPin,
  Volume2,
  Camera,
  Upload,
} from 'lucide-react';
import api from '../services/api';
import IndonesianRegionSelect from './common/IndonesianRegionSelect';
import { playCoinChime } from '../utils/soundNotification';

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

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'profile',
  onProfileUpdated,
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'password'

  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    ktp: '',
    npwp: '',
    avatar: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [chimeTested, setChimeTested] = useState(false);
  const [ktpFileName, setKtpFileName] = useState('');
  const ktpFileInputRef = useRef(null);

  const handleKtpUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Ukuran foto e-KTP maksimal 5MB');
        return;
      }
      setKtpFileName(file.name);
      setProfileSuccess(`Foto e-KTP "${file.name}" berhasil dilampirkan untuk verifikasi.`);
      setTimeout(() => setProfileSuccess(''), 3500);
    }
  };

  // Shipping Address Form State
  const [addressData, setAddressData] = useState({
    recipient_name: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [addressJustSaved, setAddressJustSaved] = useState(false);
  const addressFormRef = useRef(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Body Scroll Lock & ESC Key Listener
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        ktp: currentUser.ktp || '',
        npwp: currentUser.npwp || '',
        avatar: currentUser.avatar || AVATAR_PRESETS[0],
      });
      setProfileError('');
      setProfileSuccess('');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setPasswordError('');
      setPasswordSuccess('');
      fetchUserAddress();
    }
  }, [currentUser, isOpen]);

  const fetchUserAddress = async () => {
    try {
      const res = await api.get('/dashboard/address');
      if (res.data?.data) {
        const a = res.data.data;
        setAddressData({
          recipient_name: a.recipient_name || '',
          phone: a.phone || '',
          address: a.address || '',
          province: a.province || '',
          city: a.city || '',
          district: a.district || '',
          postal_code: a.postal_code || '',
        });
      } else if (currentUser) {
        setAddressData((prev) => ({
          ...prev,
          recipient_name: prev.recipient_name || currentUser.full_name || '',
          phone: prev.phone || currentUser.phone || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load user address:', err);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    setAddressSuccess('');
    setAddressLoading(true);
    try {
      await api.put('/dashboard/address', addressData);
      const prov = addressData.province || 'Domisili';
      const city = addressData.city ? `(${addressData.city})` : '';
      setAddressSuccess(`Alamat pengiriman & wilayah provinsi ${prov} ${city} berhasil tersimpan ke database!`);
      setAddressJustSaved(true);
      setTimeout(() => setAddressJustSaved(false), 4000);
      setTimeout(() => setAddressSuccess(''), 6000);

      // Pastikan auto-scroll ke atas agar pengguna langsung melihat banner konfirmasi
      if (addressFormRef.current) {
        addressFormRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Re-fetch dari database untuk memverifikasi data terbaru
      await fetchUserAddress();
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Gagal menyimpan alamat pengiriman.');
      if (addressFormRef.current) {
        addressFormRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validasi KTP: jika diisi, harus 16 digit angka
    if (formData.ktp && !/^\d{16}$/.test(formData.ktp.trim())) {
      setProfileError('Nomor KTP (NIK) harus terdiri dari 16 digit angka sesuai standar Dukcapil');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/dashboard/profile', {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        ktp: formData.ktp.trim(),
        npwp: formData.npwp.trim(),
        avatar: formData.avatar.trim(),
      });

      setProfileSuccess('Profil dan data identitas berhasil diperbarui!');
      if (onProfileUpdated) {
        onProfileUpdated(res.data.data);
      }
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Gagal menyimpan perubahan profil');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.current_password) {
      setPasswordError('Harap masukkan kata sandi saat ini');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/dashboard/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setPasswordSuccess('Kata sandi Anda berhasil diperbarui! Silakan gunakan sandi baru untuk login berikutnya.');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal memperbarui kata sandi. Periksa kembali sandi saat ini.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] w-screen h-screen min-h-screen min-h-dvh flex items-center justify-center p-3.5 sm:p-4 !m-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 w-screen h-screen min-h-screen min-h-dvh bg-slate-950/65 backdrop-blur-md !m-0"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="bg-white rounded-2xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] border border-slate-200 ring-1 ring-slate-900/5 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              {activeTab === 'profile' ? <User size={20} /> : activeTab === 'address' ? <MapPin size={20} /> : <KeyRound size={20} />}
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-slate-800 text-base">
                {activeTab === 'profile' ? 'Pengaturan Profil Akun' : activeTab === 'address' ? 'Alamat Pengiriman & Domisili' : 'Keamanan & Kata Sandi'}
              </h3>
              <p className="text-xs text-slate-400">
                @{currentUser?.username || 'user'} • Kelola data identitas dan alamat
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

        {/* Tab Selection Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 sm:px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={14} />
            <span>Data Profil &amp; KYC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'address'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin size={14} />
            <span>Alamat Pengiriman</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'password'
                ? 'border-emerald-600 text-emerald-700 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock size={14} />
            <span>Ganti Kata Sandi</span>
          </button>
        </div>

        {/* TAB 1: DATA PROFIL & KYC */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
                <Check size={15} className="flex-shrink-0 text-emerald-600" />
                <span>{profileSuccess}</span>
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
                  Pilih salah satu karakter resmi Bionet di bawah atau tempel URL avatar kustom Anda.
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
                  Diperlukan untuk kepatuhan KYC &amp; pencairan dana
                </span>
                <input
                  type="file"
                  ref={ktpFileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleKtpUpload}
                  className="hidden"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => ktpFileInputRef.current?.click()}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Camera size={13} className="text-emerald-600" />
                    <span>{ktpFileName ? 'Ganti Foto e-KTP' : 'Unggah Foto e-KTP'}</span>
                  </button>
                  {ktpFileName && (
                    <span className="text-[10px] text-emerald-700 font-bold truncate max-w-[130px]">
                      ✓ {ktpFileName}
                    </span>
                  )}
                </div>
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

            {/* Audio Notifikasi Chime Test */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <Volume2 size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Notifikasi Audio Komisi Masuk
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sintesis Web Audio API (efek koin emas berdering, 100% offline)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playCoinChime();
                  setChimeTested(true);
                  setTimeout(() => setChimeTested(false), 2000);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  chimeTested
                    ? 'bg-amber-200 text-amber-900 border-amber-400 scale-95'
                    : 'bg-white hover:bg-amber-100/50 text-amber-900 border-amber-300 shadow-xs'
                }`}
              >
                <Volume2 size={13} className={chimeTested ? 'animate-bounce text-amber-700' : ''} />
                <span>{chimeTested ? 'Kring! Berdering' : 'Uji Suara Komisi'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-500">
              <Shield size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                Perubahan profil dicatat otomatis dalam sistem audit platform untuk perlindungan keamanan data akun Anda.
              </span>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={profileLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <Save size={14} />
                <span>{profileLoading ? 'Menyimpan...' : 'Simpan Profil'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: ALAMAT PENGIRIMAN & DOMISILI */}
        {activeTab === 'address' && (
          <form ref={addressFormRef} onSubmit={handleAddressSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[72vh] relative">
            {addressError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                <span>{addressError}</span>
              </div>
            )}

            {addressSuccess && (
              <div className="sticky -top-1 z-30 p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs flex items-center justify-between shadow-lg shadow-emerald-950/20 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2.5 font-bold">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Check size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">
                      Tersimpan ke Database (Kemendagri)
                    </div>
                    <div>{addressSuccess}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressSuccess('')}
                  className="p-1 hover:bg-white/20 rounded-md transition-colors text-white"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-800">
              <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Alamat ini digunakan oleh tim logistik gudang untuk pengiriman produk herbal saat Anda melakukan Repeat Order (RO).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penerima Paket <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addressData.recipient_name}
                onChange={(e) => setAddressData({ ...addressData, recipient_name: e.target.value })}
                placeholder="Nama lengkap penerima"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Handphone Penerima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addressData.phone}
                onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                placeholder="0812xxxxxxxx"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap (Jalan, No Rumah, RT/RW) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={addressData.address}
                onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                placeholder="Jl. Merdeka No. 12, RT 02/RW 05, Kelurahan..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 resize-none"
              />
            </div>

            {/* Indonesian Region Cascading & Auto-Suggest Component */}
            <IndonesianRegionSelect
              province={addressData.province}
              city={addressData.city}
              district={addressData.district}
              postalCode={addressData.postal_code}
              onChange={({ province, city, district, postalCode }) => {
                setAddressData((prev) => ({
                  ...prev,
                  province,
                  city,
                  district,
                  postal_code: postalCode,
                }));
              }}
              disabled={addressLoading}
            />

            {/* Modal Footer */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                {addressJustSaved ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                    <Check size={14} className="text-emerald-600" />
                    <span>Tersimpan di tabel user_addresses!</span>
                  </span>
                ) : (
                  <span>Status: Alamat Primer Logistik</span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={addressLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-sm ${
                    addressJustSaved
                      ? 'bg-emerald-700 ring-2 ring-emerald-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  } disabled:opacity-50`}
                >
                  {addressJustSaved ? (
                    <>
                      <Check size={15} className="text-emerald-200" />
                      <span>Tersimpan di Database!</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>{addressLoading ? 'Menyimpan...' : 'Simpan Alamat'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: GANTI KATA SANDI */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-600" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
                <Check size={15} className="flex-shrink-0 text-emerald-600" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
              <Shield size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                Pastikan kata sandi baru Anda minimal 6 karakter. Gunakan kombinasi huruf dan angka agar akun tidak mudah disusupi.
              </span>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={15} />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  placeholder="Masukkan kata sandi lama Anda"
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={15} />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={15} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  placeholder="Ulangi kata sandi baru"
                  className={`w-full text-xs pl-9 pr-10 py-2.5 rounded-lg border focus:outline-hidden focus:ring-2 font-medium text-slate-800 ${
                    passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                <span className="text-[10px] text-rose-500 mt-1 block">
                  Konfirmasi kata sandi belum cocok dengan kata sandi baru
                </span>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={passwordLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                <KeyRound size={14} />
                <span>{passwordLoading ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
              </button>
            </div>
          </form>
        )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>,
  document.body
  );
}
