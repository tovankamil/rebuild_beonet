import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coins,
  Layers,
  Phone,
  User,
  CreditCard,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import api from '../services/api';

export default function RegisterDownlineModal({
  isOpen,
  onClose,
  upline,
  position, // 'kiri' or 'kanan'
  preselectedPinId = '',
  onSuccess,
}) {
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('bionet_user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const [activePosition, setActivePosition] = useState(position || 'kiri');
  const activeUpline = upline || currentUser;

  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(true);
  const [selectedPinId, setSelectedPinId] = useState(preselectedPinId);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [ktp, setKtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  // ESC key listener for modal accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessData(null);
      setUsername('');
      setFullName('');
      setPassword('');
      setPhone('');
      setKtp('');
      setCopied(false);
      setActivePosition(position || 'kiri');
      fetchPins();
    }
  }, [isOpen, position]);

  const fetchPins = async () => {
    setLoadingPins(true);
    try {
      const res = await api.get('/pins/my-pins');
      if (res.data?.data) {
        const activePins = res.data.data.filter((p) => p.status === 'active');
        setPins(activePins);
        if (preselectedPinId && activePins.some((p) => p.id === preselectedPinId)) {
          setSelectedPinId(preselectedPinId);
        } else if (activePins.length > 0) {
          setSelectedPinId(activePins[0].id);
        } else {
          setSelectedPinId('');
        }
      }
    } catch (err) {
      console.error('Failed to load pins:', err);
      setErrorMsg('Gagal memuat inventori PIN lisensi Anda.');
    } finally {
      setLoadingPins(false);
    }
  };

  const selectedPin = pins.find((p) => p.id === selectedPinId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPinId) {
      setErrorMsg('Silakan pilih salah satu serial PIN aktivasi yang aktif.');
      return;
    }
    if (!activeUpline?.id) {
      setErrorMsg('Upline penempatan tidak valid.');
      return;
    }
    if (!username || username.trim().length < 4) {
      setErrorMsg('Username minimal 4 karakter tanpa spasi.');
      return;
    }
    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg('Nama lengkap calon mitra harus diisi.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Kata sandi pendaftaran minimal 6 karakter.');
      return;
    }
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Nomor WhatsApp calon mitra wajib diisi (minimal 8 digit).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/pins/register-downline', {
        pin_id: selectedPinId,
        upline_id: activeUpline.id,
        position: activePosition,
        username: username.trim().toLowerCase(),
        full_name: fullName.trim(),
        password: password,
        phone: phone.trim(),
        ktp: ktp.trim(),
      });

      if (res.data?.data) {
        setSuccessData(res.data.data);
        if (onSuccess) {
          onSuccess(res.data.data);
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Gagal mendaftarkan mitra downline baru.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successData) return;
    const text = `Selamat datang di Bionet!\nAkun Anda telah diaktifkan:\nUsername: ${successData.user?.username}\nPassword: ${password}\nLogin: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-downline-title"
      className="fixed inset-0 z-[120] w-screen h-screen min-h-screen min-h-dvh !m-0 bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-xl w-full max-h-[92vh] max-h-[92dvh] overflow-hidden flex flex-col my-auto transition-all animate-in zoom-in-95 duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - DashLite Clean Style (Fixed at top) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
              <UserPlus size={19} />
            </div>
            <div>
              <h3
                id="register-downline-title"
                className="font-heading font-extrabold text-base tracking-tight text-slate-900"
              >
                Pendaftaran Mitra Baru
              </h3>
              <p className="text-xs text-slate-500">
                Aktivasi hak usaha downline via Serial PIN lisensi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog pendaftaran"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        {successData ? (
          <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in duration-200">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Pendaftaran Berhasil!
                </h4>
                <p className="text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Mitra <strong className="text-slate-800">@{successData.user?.username}</strong> ({successData.user?.full_name}) resmi terdaftar di struktur biner{' '}
                  <span className="font-bold text-emerald-700 uppercase">Kaki {successData.position}</span> di bawah upline @{successData.upline?.username}.
                </p>
              </div>

              {/* Bonus & Points Receipt Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-600" />
                    Bonus Sponsor Dikreditkan:
                  </span>
                  <span className="font-heading font-extrabold text-sm text-emerald-700 tabular-nums">
                    +{formatRupiah(successData.sponsor_bonus)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <Layers size={14} className="text-cyan-600" />
                    Omset Poin Binary (PV):
                  </span>
                  <span className="font-heading font-extrabold text-sm text-cyan-700 tabular-nums">
                    +{successData.points_awarded || 1} PV
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500">Serial PIN Terpakai:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {successData.pin?.serial_code || successData.pin?.id}
                  </span>
                </div>
              </div>

              {/* WhatsApp Automated Delivery Status */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-left flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={14} />
                </div>
                <div className="text-[11px] leading-relaxed text-emerald-950 flex-1">
                  <span className="font-bold block text-emerald-800">
                    Pesan Otomatis WhatsApp Terkirim
                  </span>
                  <span>
                    Pesan sambutan resmi telah dikirim ke nomor WhatsApp mitra baru{' '}
                    <strong>({phone})</strong> dan pesan notifikasi registrasi ke sponsor Anda.
                  </span>
                  {phone && (
                    <a
                      href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${fullName}, selamat bergabung di keluarga besar Bionet!`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition-colors"
                    >
                      <Phone size={11} />
                      <span>Buka Chat WhatsApp Mitra</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Copy Credentials Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Kredensial Tersalin!' : 'Salin Detail Akun untuk Mitra'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-[0.98]"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </div>
          </div>
          ) : (
            /* ================= REGISTRATION FORM ================= */
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Placement Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    POSISI PENEMPATAN BINER
                  </span>
                  <div className="font-heading font-bold text-slate-800 text-sm flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-500 font-normal">Upline:</span>
                    <span className="text-emerald-700 font-bold">@{activeUpline?.username || 'Akun Anda'}</span>
                    <span className="text-slate-400 text-xs font-normal">
                      ({activeUpline?.full_name || 'Mitra Bionet'})
                    </span>
                  </div>
                </div>

                {position ? (
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-heading font-bold text-xs uppercase tracking-wide shadow-2xs self-start sm:self-auto flex-shrink-0 ${
                      position === 'kiri'
                        ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {position === 'kiri' ? <ArrowLeft size={13} /> : null}
                    <span>Slot Kaki {position === 'kiri' ? 'Kiri (Left)' : 'Kanan (Right)'}</span>
                    {position === 'kanan' ? <ArrowRight size={13} /> : null}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg self-start sm:self-auto flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setActivePosition('kiri')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                        activePosition === 'kiri'
                          ? 'bg-cyan-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ArrowLeft size={12} />
                      <span>Kaki Kiri</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePosition('kanan')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                        activePosition === 'kanan'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Kaki Kanan</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Serial PIN Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound size={13} className="text-emerald-600" />
                    Pilih Serial PIN Lisensi
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    Stok: {pins.length} PIN Aktif
                  </span>
                </label>

                {loadingPins ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-400 text-xs">
                    Memuat inventori PIN Anda...
                  </div>
                ) : pins.length === 0 ? (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle size={14} className="text-amber-600" />
                      Tidak Ada PIN Aktif Tersedia
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Anda belum memiliki serial PIN aktivasi. Dapatkan serial PIN lisensi terlebih dahulu melalui menu Stokis atau hubungi Administrator.
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedPinId}
                    onChange={(e) => setSelectedPinId(e.target.value)}
                    className="dash-input text-xs cursor-pointer font-medium"
                    required
                  >
                    {pins.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.serial_code || p.pin_code} — {p.package?.name || 'Paket Standar'} (Bonus: {formatRupiah(p.package?.sponsor_bonus)}, +{p.package?.points || 1} PV)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Selected PIN Incentives Preview - Structured Responsive Grid */}
              {selectedPin && selectedPin.package && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-center">
                  <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-white border border-slate-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Paket Hak Usaha
                    </span>
                    <span className="font-bold text-slate-800 text-xs truncate block mt-0.5">
                      {selectedPin.package.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatRupiah(selectedPin.package.price)}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-700 block uppercase">
                      Bonus Sponsor
                    </span>
                    <span className="font-heading font-extrabold text-xs text-emerald-700 tabular-nums block mt-0.5">
                      +{formatRupiah(selectedPin.package.sponsor_bonus)}
                    </span>
                    <span className="text-[10px] text-emerald-600/80 font-medium">
                      Kredit Langsung
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-cyan-50/60 border border-cyan-100/80 shadow-2xs">
                    <span className="text-[10px] font-bold text-cyan-700 block uppercase">
                      Omset Masuk
                    </span>
                    <span className="font-heading font-extrabold text-xs text-cyan-700 tabular-nums block mt-0.5">
                      +{selectedPin.package.points} PV
                    </span>
                    <span className="text-[10px] text-cyan-600/80 font-medium">
                      Kaki {activePosition}
                    </span>
                  </div>
                </div>
              )}

              {/* Divider: Data Kredensial */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Kredensial Akun Baru
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Username Baru <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 4 karakter</span>
                    </label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-emerald-600 transition-colors">
                        @
                      </span>
                      <input
                        type="text"
                        placeholder="username_baru"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="dash-input pl-8 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Kata Sandi <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">Min. 6 karakter</span>
                    </label>
                    <div className="relative group">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="dash-input pl-9 pr-9 text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider: Data Diri & Kontak */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Data Diri &amp; Kontak Calon Mitra
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        placeholder="Nama sesuai KTP"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="dash-input pl-9 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>No. WhatsApp Calon Mitra <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-emerald-600 font-medium">Otomatis kirim sambutan</span>
                    </label>
                    <div className="relative group">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="tel"
                        placeholder="Contoh: 08123456789 atau 628123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                        className="dash-input pl-9 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Nomor NIK KTP (16 Digit)</span>
                      <span className="text-[10px] text-slate-400 font-normal">KYC &amp; Verifikasi Bank</span>
                    </label>
                    <div className="relative group">
                      <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="Contoh: 3201xxxxxxxxxxxx"
                        value={ktp}
                        onChange={(e) => setKtp(e.target.value.replace(/\D/g, ''))}
                        className="dash-input pl-9 text-xs font-mono tracking-wider"
                      />
                    </div>
                  </div>
                </div>
              </div>

              </div>

              {/* Action Buttons Sticky Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2 sm:gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white hover:border-slate-300 active:scale-[0.98] transition-all min-h-[42px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || pins.length === 0}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 min-h-[42px]"
                >
                  <UserPlus size={15} />
                  <span>{submitting ? 'Memproses...' : 'Aktivasi Downline'}</span>
                </button>
              </div>
            </form>
          )}
      </div>
    </div>,
    document.body
  );
}
