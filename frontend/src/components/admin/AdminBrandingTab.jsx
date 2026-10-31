import React, { useState, useEffect } from 'react';
import {
  Palette,
  Upload,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  Sliders,
  Type,
  LayoutDashboard,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import { useBranding, applyThemeVariables } from '../../context/BrandingContext';

const PRIMARY_PRESETS = [
  { name: 'Emerald Herbal (Default)', hex: '#059669', bgClass: 'bg-emerald-600' },
  { name: 'Sapphire Blue', hex: '#2563eb', bgClass: 'bg-blue-600' },
  { name: 'Royal Purple', hex: '#7c3aed', bgClass: 'bg-purple-600' },
  { name: 'Crimson Ruby', hex: '#dc2626', bgClass: 'bg-rose-600' },
  { name: 'Sunset Amber', hex: '#d97706', bgClass: 'bg-amber-600' },
  { name: 'Ocean Teal', hex: '#0d9488', bgClass: 'bg-teal-600' },
  { name: 'Deep Indigo', hex: '#4f46e5', bgClass: 'bg-indigo-600' },
  { name: 'Dark Slate', hex: '#334155', bgClass: 'bg-slate-700' },
];

const SECONDARY_PRESETS = [
  { name: 'Sky Cyan (Default)', hex: '#06b6d4', bgClass: 'bg-cyan-500' },
  { name: 'Fresh Lime', hex: '#84cc16', bgClass: 'bg-lime-500' },
  { name: 'Vivid Pink', hex: '#ec4899', bgClass: 'bg-pink-500' },
  { name: 'Warm Amber', hex: '#f59e0b', bgClass: 'bg-amber-500' },
  { name: 'Soft Indigo', hex: '#6366f1', bgClass: 'bg-indigo-500' },
  { name: 'Vibrant Violet', hex: '#8b5cf6', bgClass: 'bg-violet-500' },
  { name: 'Bright Teal', hex: '#14b8a6', bgClass: 'bg-teal-500' },
  { name: 'Cool Gray', hex: '#64748b', bgClass: 'bg-slate-500' },
];

export default function AdminBrandingTab() {
  const { branding, updateBrandingState } = useBranding();

  const [appName, setAppName] = useState(branding.app_name || 'BIONET');
  const [appTagline, setAppTagline] = useState(branding.app_tagline || 'Mitra Enterprise Hub');
  const [primaryColor, setPrimaryColor] = useState(branding.primary_color || '#059669');
  const [secondaryColor, setSecondaryColor] = useState(branding.secondary_color || '#06b6d4');
  const [logoUrl, setLogoUrl] = useState(branding.logo_url || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state when branding context changes
  useEffect(() => {
    if (branding) {
      setAppName(branding.app_name || 'BIONET');
      setAppTagline(branding.app_tagline || 'Mitra Enterprise Hub');
      setPrimaryColor(branding.primary_color || '#059669');
      setSecondaryColor(branding.secondary_color || '#06b6d4');
      setLogoUrl(branding.logo_url || '');
    }
  }, [branding]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file logo maksimal 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/admin/branding/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.logo_url) {
        setLogoUrl(res.data.logo_url);
        updateBrandingState({ logo_url: res.data.logo_url });
        setSuccessMsg('Logo aplikasi berhasil diunggah dan diterapkan!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengunggah file logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    updateBrandingState({ logo_url: '' });
    setSuccessMsg('Logo diatur kembali ke ikon default Bionet.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePrimaryColorChange = (hex) => {
    setPrimaryColor(hex);
    applyThemeVariables({
      ...branding,
      primary_color: hex,
      secondary_color: secondaryColor,
      app_name: appName,
      logo_url: logoUrl,
    });
  };

  const handleSecondaryColorChange = (hex) => {
    setSecondaryColor(hex);
    applyThemeVariables({
      ...branding,
      primary_color: primaryColor,
      secondary_color: hex,
      app_name: appName,
      logo_url: logoUrl,
    });
  };

  const handleResetDefaults = () => {
    setAppName('BIONET');
    setAppTagline('Mitra Enterprise Hub');
    setPrimaryColor('#059669');
    setSecondaryColor('#06b6d4');
    setLogoUrl('');
    applyThemeVariables({
      ...branding,
      primary_color: '#059669',
      secondary_color: '#06b6d4',
      app_name: 'BIONET',
      logo_url: '',
    });
    setErrorMsg('');
    setSuccessMsg('Pengaturan direset ke default sistem (klik Simpan untuk menerapkan permanen).');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        app_name: appName.trim(),
        app_tagline: appTagline.trim(),
        primary_color: primaryColor.trim(),
        secondary_color: secondaryColor.trim(),
        logo_url: logoUrl.trim(),
      };

      const res = await api.put('/admin/branding', payload);

      if (res.data?.data) {
        updateBrandingState(res.data.data);
        setSuccessMsg('Pengaturan logo dan warna tema dashboard berhasil disimpan dan diterapkan!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan pengaturan branding.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="dash-card p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute right-32 -bottom-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: secondaryColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  Pengaturan Branding &amp; Tema Dashboard
                </h2>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Kelola identitas visual aplikasi Bionet: perbarui logo resmi serta atur warna primer dan sekunder
                dashboard secara real-time ke seluruh portal mitra.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw size={13} />
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls (Logo + Colors + Metadata) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. App Logo Customization */}
            <div className="dash-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-slate-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-800">
                    Logo Aplikasi (Application Logo)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">PNG, SVG, JPG, WebP</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Logo Display Box */}
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 relative group overflow-hidden flex-shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={appName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Layers size={28} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-bold">
                      {logoUrl ? 'Ganti Logo' : 'Belum Ada Logo'}
                    </span>
                  </div>
                </div>

                {/* Upload & Actions */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {logoUrl ? 'Logo Kustom Terpasang' : 'Menggunakan Ikon Default Bionet'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Rekomendasi rasio 1:1 (persegi) atau horizontal proporsional dengan latar transparan (PNG/SVG) untuk
                      tampilan sidebar dan navbar terbaik.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-sm">
                      <Upload size={14} />
                      <span>{uploadingLogo ? 'Mengunggah...' : 'Upload Logo Baru'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleFileUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Hapus &amp; Reset</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Color Palette Customization */}
            <div className="dash-card p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sliders size={18} className="text-slate-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-800">
                    Skema Warna Dashboard (Primary &amp; Secondary)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Hex Color Tokens</span>
              </div>

              {/* Primary Color Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                      Warna Utama (Primary Color)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Warna tombol aksi utama, header menu aktif, dan identitas brand.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white shadow-2xs"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      maxLength={7}
                      className="w-24 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 uppercase rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                </div>

                {/* Swatches Grid */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pilihan Palet Primary Populer:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRIMARY_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handlePrimaryColorChange(preset.hex)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          primaryColor.toLowerCase() === preset.hex.toLowerCase()
                            ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 shadow-2xs'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-[11px] font-semibold text-slate-700 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Secondary Color Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: secondaryColor }} />
                      Warna Sekunder (Secondary Color)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Warna highlight omset PV binary, badge status, dan aksen pelengkap.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => handleSecondaryColorChange(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 bg-white shadow-2xs"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => handleSecondaryColorChange(e.target.value)}
                      maxLength={7}
                      className="w-24 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 uppercase rounded-lg border border-slate-200 text-center"
                    />
                  </div>
                </div>

                {/* Swatches Grid */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Pilihan Palet Secondary Populer:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SECONDARY_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleSecondaryColorChange(preset.hex)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          secondaryColor.toLowerCase() === preset.hex.toLowerCase()
                            ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-800 shadow-2xs'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-2xs"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span className="text-[11px] font-semibold text-slate-700 truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Brand Text & Identity */}
            <div className="dash-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Type size={18} className="text-slate-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-800">
                    Nama Aplikasi &amp; Tagline Brand
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Header Brand</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Aplikasi (App Name)
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="BIONET"
                    className="dash-input text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tagline Aplikasi (App Tagline)
                  </label>
                  <input
                    type="text"
                    value={appTagline}
                    onChange={(e) => setAppTagline(e.target.value)}
                    placeholder="Mitra Enterprise Hub"
                    className="dash-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Interactive Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="dash-card p-5 sm:p-6 space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-slate-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-800">
                    Live Preview Tampilan Dashboard
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                  Pratinjau Nyata
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Pratinjau berikut menampilkan bagaimana logo, warna primary, dan warna secondary terlihat pada
                antarmuka dashboard mitra.
              </p>

              {/* Miniature Dashboard Mockup Window */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-xl text-white">
                {/* Mockup Titlebar */}
                <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-slate-500 truncate">bionet.id/dashboard</span>
                  </div>
                  <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Preview</span>
                </div>

                {/* Mockup Top Header */}
                <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center p-1 text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <Layers size={15} />
                      )}
                    </div>
                    <div>
                      <div className="font-heading font-extrabold text-xs text-white leading-none">
                        {appName || 'BIONET'}
                      </div>
                      <div className="text-[9px] text-slate-400 leading-tight">
                        {appTagline || 'Mitra Enterprise Hub'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white shadow-2xs"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      PV +1,250
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                      M
                    </div>
                  </div>
                </div>

                {/* Mockup Body Content */}
                <div className="p-3.5 space-y-3 bg-slate-950/60">
                  {/* Mock Card 1: Banner with dynamic gradient */}
                  <div
                    className="p-3 rounded-lg text-white relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 block">
                          Total Saldo Dompet
                        </span>
                        <div className="font-heading font-black text-sm tracking-tight mt-0.5">
                          Rp 14.850.000
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-black/20 text-white font-bold text-[9px]">
                        Bonus Harian
                      </span>
                    </div>
                  </div>

                  {/* Mock Card 2: Binary Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Kaki Kiri</span>
                      <span className="font-heading font-extrabold text-white text-xs block mt-0.5" style={{ color: primaryColor }}>
                        480 PV
                      </span>
                      <span className="text-[9px] text-slate-500">12 Mitra</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Kaki Kanan</span>
                      <span className="font-heading font-extrabold text-white text-xs block mt-0.5" style={{ color: secondaryColor }}>
                        520 PV
                      </span>
                      <span className="text-[9px] text-slate-500">14 Mitra</span>
                    </div>
                  </div>

                  {/* Mock Interactive Action Button */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 py-1.5 rounded-lg text-white font-bold text-[11px] shadow-sm transition-all"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Pendaftaran Mitra Baru
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-lg text-white font-bold text-[11px] shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Tarik Dana (WD)
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button in Card */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                <span>{saving ? 'Menyimpan Perubahan...' : 'Terapkan &amp; Simpan Konfigurasi'}</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

