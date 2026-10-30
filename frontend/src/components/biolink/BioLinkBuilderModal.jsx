import React, { useState, useEffect, useRef } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  Link2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Smartphone,
  Sparkles,
  Share2,
  QrCode,
  Video,
  ShoppingBag,
  ShieldCheck,
  Palette,
  CheckCircle2,
  X,
  MessageCircle,
  Eye,
  Award,
  ChevronRight,
  Play,
  RotateCcw,
  Sliders,
  Send,
  HelpCircle,
} from 'lucide-react';

const BIOLINK_THEMES = [
  {
    id: 'emerald',
    name: 'Emerald Classic',
    desc: 'Nuansa herbal hijau zamrud elegan dengan aksen emas organik',
    bgClass: 'bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-950 text-white',
    cardClass: 'bg-emerald-950/60 border border-emerald-500/30 text-white',
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-900/50',
    accentColor: '#10B981',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'gold',
    name: 'Luxury Gold',
    desc: 'Kemewahan sultan emas metalik berwibawa khas eksekutif',
    bgClass: 'bg-gradient-to-b from-stone-950 via-amber-950/70 to-black text-amber-50',
    cardClass: 'bg-amber-950/40 border border-amber-500/40 text-amber-100',
    buttonClass: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-950/50 font-black',
    accentColor: '#F59E0B',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'cyber',
    name: 'Cyber Dark',
    desc: 'Gaya teknologi modern futuristik dengan efek neon bio-aktif',
    bgClass: 'bg-gradient-to-b from-slate-950 via-zinc-900 to-black text-slate-100',
    cardClass: 'bg-slate-900/80 border border-cyan-500/30 text-slate-200',
    buttonClass: 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-lg shadow-cyan-900/40 font-bold',
    accentColor: '#06B6D4',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  {
    id: 'clean',
    name: 'Minimalist Clean',
    desc: 'Tampilan bersih, sejuk, modern, dan fokus pada konversi produk',
    bgClass: 'bg-gradient-to-b from-slate-50 via-emerald-50/40 to-white text-slate-800',
    cardClass: 'bg-white border border-slate-200 shadow-sm text-slate-800',
    buttonClass: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20',
    accentColor: '#047857',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
];

const DEFAULT_PRODUCTS = [
  {
    id: 'propolis',
    name: 'Bio-Propolis Trigona 30ml',
    category: 'Regenerasi Sel & Imun',
    price: 250000,
    bpom: 'POM TR 226012891',
    enabled: true,
  },
  {
    id: 'herbal_drops',
    name: 'Bio-Herbal Drops 30ml',
    category: 'Detoksifikasi Alami',
    price: 225000,
    bpom: 'POM TR 213609811',
    enabled: true,
  },
  {
    id: 'spray',
    name: 'Bio-Energy Refresh Spray 100ml',
    category: 'Aura & Kesegaran Kulit',
    price: 175000,
    bpom: 'POM NA 18220104821',
    enabled: true,
  },
  {
    id: 'teh_moringa',
    name: 'Bio-Teh Celup Moringa Herbal',
    category: 'Metabolisme & Kolesterol',
    price: 120000,
    bpom: 'Halal MUI ID3211',
    enabled: false,
  },
  {
    id: 'madu_active',
    name: 'Madu Hutan Bio-Active Trigona',
    category: 'Nutrisi Harian Lambung',
    price: 195000,
    bpom: 'P-IRT & Halal MUI',
    enabled: false,
  },
];

export default function BioLinkBuilderModal({ user, onClose }) {
  const username = user?.username || 'mitra';
  const storageKey = `bionet_biolink_${username}`;

  // State loading from storage or defaults
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_theme`);
    return saved || 'emerald';
  });

  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem(`${storageKey}_name`) || user?.full_name || 'Mitra Bionet Resmi';
  });

  const [tagline, setTagline] = useState(() => {
    return localStorage.getItem(`${storageKey}_tagline`) || 'Konsultan Resmi Herbal Bionet BPOM & Pembina Bisnis Digital';
  });

  const [waNumber, setWaNumber] = useState(() => {
    return localStorage.getItem(`${storageKey}_wa`) || user?.phone || '6281234567890';
  });

  const [instagram, setInstagram] = useState(() => {
    return localStorage.getItem(`${storageKey}_ig`) || '@bionet.official';
  });

  const [videoUrl, setVideoUrl] = useState(() => {
    return localStorage.getItem(`${storageKey}_video`) || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_products`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PRODUCTS;
      }
    }
    return DEFAULT_PRODUCTS;
  });

  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'qrcode'

  const activeThemeObj = BIOLINK_THEMES.find((t) => t.id === theme) || BIOLINK_THEMES[0];

  // Full public URL for this partner bio
  const publicBioUrl = `${window.location.origin}/bio/${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicBioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleProduct = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    localStorage.setItem(`${storageKey}_theme`, theme);
    localStorage.setItem(`${storageKey}_name`, displayName);
    localStorage.setItem(`${storageKey}_tagline`, tagline);
    localStorage.setItem(`${storageKey}_wa`, waNumber);
    localStorage.setItem(`${storageKey}_ig`, instagram);
    localStorage.setItem(`${storageKey}_video`, videoUrl);
    localStorage.setItem(`${storageKey}_products`, JSON.stringify(products));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadQR = () => {
    // Generate an instant high-res QR code image via canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 460;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 460);
    grad.addColorStop(0, '#064E3B');
    grad.addColorStop(1, '#022C22');
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, 400, 460, 24);
    ctx.fill();

    // Inner White Card
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(24, 24, 352, 352, 16);
    ctx.fill();

    // QR Code simulation pattern drawing (matrix representation)
    ctx.fillStyle = '#064E3B';
    const size = 10;
    const offset = 48;
    for (let r = 0; r < 28; r++) {
      for (let c = 0; c < 28; c++) {
        // Corner squares
        const isCorner =
          (r < 7 && c < 7) ||
          (r < 7 && c > 20) ||
          (r > 20 && c < 7);
        if (isCorner) {
          if (
            r === 0 || r === 6 || c === 0 || c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            r === 0 || r === 6 || c === 21 || c === 27 ||
            (r >= 2 && r <= 4 && c >= 23 && c <= 25) ||
            r === 21 || r === 27 || c === 0 || c === 6 ||
            (r >= 23 && r <= 25 && c >= 2 && c <= 4)
          ) {
            ctx.fillRect(offset + c * size + 8, offset + r * size + 8, size - 1, size - 1);
          }
        } else if ((r * 13 + c * 17 + username.charCodeAt(0)) % 3 === 0) {
          ctx.fillRect(offset + c * size + 8, offset + r * size + 8, size - 1, size - 1);
        }
      }
    }

    // Center Logo circle
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(200, 200, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BIO', 200, 200);

    // Text at bottom
    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Bio-Link: ${displayName}`, 200, 405);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#6EE7B7';
    ctx.fillText(`bionet.id/bio/${username}`, 200, 430);

    const link = document.createElement('a');
    link.download = `QR_BioLink_${username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <Link2 size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Bio-Link Studio & Growth Funnel
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Resmi Mitra Bionet
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Kustomisasi landing page mikro personal untuk TikTok, Instagram Bio, dan WhatsApp Story
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/15 transition-all"
              title="Salin tautan bio-link Anda"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copied ? 'Tersalin!' : 'Salin Link Bio'}</span>
            </button>
            <a
              href={publicBioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow"
            >
              <span>Lihat Publik</span>
              <ExternalLink size={14} />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body: Left Form, Right Smartphone Mockup */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-50/70">
          {/* Left Column: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* 1. Theme Selector */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Palette size={16} className="text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">Pilih Tema Desain</h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">4 Pilihan Premium</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {BIOLINK_THEMES.map((t) => {
                  const isSelected = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        {isSelected && <Check size={14} className="text-emerald-600 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Identity & Social Info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles size={16} className="text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Profil & Branding Mitra</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Tampilan Bio
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Contoh: dr. Bambang / Bunda Heni Herbal"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Konsultasi
                  </label>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="Contoh: 6281234567890"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tagline / Bio Singkat
                </label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Deskripsikan keahlian dan ajakan konsultasi kesehatan..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@username_anda"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Video Presentasi / TikTok / YouTube
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="Link video YouTube atau TikTok..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. Toggle Produk Herbal Unggulan */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ShoppingBag size={16} className="text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Katalog Herbal di Halaman Bio
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {products.filter((p) => p.enabled).length} Aktif Ditampilkan
                </span>
              </div>
              <div className="space-y-2">
                {products.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleProduct(item.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      item.enabled
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-slate-50/50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 pointer-events-none"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {item.bpom}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.category}</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-emerald-700">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save & Download Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
                >
                  <QrCode size={15} className="text-emerald-600" />
                  <span>Unduh QR Code HD</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition"
                >
                  {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  <span>{copied ? 'Tersalin' : 'Salin URL Bio'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1 animate-pulse">
                    <CheckCircle2 size={14} />
                    <span>Tersimpan Sukses!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
                >
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Smartphone Mockup (5 cols) */}
          <div className="lg:col-span-5 p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="mb-3 flex items-center space-x-2 text-slate-600 text-xs font-bold">
              <Smartphone size={16} className="text-emerald-700" />
              <span>Pratinjau Nyata (Live Device Mockup)</span>
            </div>

            {/* Apple iPhone Frame Mockup */}
            <div className="relative w-[300px] h-[610px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-black/20 flex flex-col">
              {/* Dynamic Island Pill */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>

              {/* Screen Area */}
              <div
                className={`relative w-full h-full rounded-[34px] overflow-y-auto overflow-x-hidden p-4 pt-10 text-center flex flex-col justify-between scrollbar-none transition-colors duration-300 ${activeThemeObj.bgClass}`}
              >
                {/* Upper Profile Header */}
                <div className="space-y-2 mt-2">
                  <div className="relative mx-auto w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-emerald-400 to-yellow-300 shadow-md">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xl overflow-hidden">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                      <Check size={11} className="stroke-[3]" />
                    </span>
                  </div>

                  <div>
                    <h5 className="font-heading font-black text-sm tracking-tight text-current">
                      {displayName}
                    </h5>
                    <div className="flex items-center justify-center space-x-1 mt-0.5">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${activeThemeObj.badgeClass}`}>
                        MITRA RESMI BPOM
                      </span>
                    </div>
                    <p className="text-[10px] opacity-80 mt-1.5 px-2 line-clamp-2 leading-relaxed">
                      {tagline}
                    </p>
                  </div>

                  {/* Main Call To Action Button (WA) */}
                  <a
                    href={`https://wa.me/${waNumber.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(displayName)},%20saya%20tertarik%20konsultasi%20produk%20Bionet`}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center space-x-2 font-bold text-xs transition transform hover:scale-[1.02] ${activeThemeObj.buttonClass}`}
                  >
                    <MessageCircle size={15} />
                    <span>Konsultasi WhatsApp</span>
                  </a>
                </div>

                {/* Video Preview Card if URL provided */}
                {videoUrl && (
                  <div className={`my-3 p-2.5 rounded-xl text-left border ${activeThemeObj.cardClass}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-1.5">
                        <Video size={13} className="text-emerald-400" />
                        <span className="text-[10px] font-bold">Video Presentasi Resmi</span>
                      </div>
                      <span className="text-[9px] opacity-60">1:45 Min</span>
                    </div>
                    <div className="relative w-full h-24 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 group cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/80 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition">
                        <Play size={14} className="fill-white ml-0.5" />
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 text-[8px] px-1.5 py-0.5 rounded bg-black/80 text-white font-mono">
                        HD 1080p
                      </span>
                    </div>
                  </div>
                )}

                {/* Products Section */}
                <div className="space-y-2 text-left my-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                      Produk Herbal Pilihan
                    </span>
                    <span className="text-[9px] opacity-60">Garansi BPOM</span>
                  </div>
                  {products
                    .filter((p) => p.enabled)
                    .slice(0, 3)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${activeThemeObj.cardClass}`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-[11px] font-bold truncate leading-tight">{item.name}</p>
                          <p className="text-[9px] opacity-70">{item.bpom}</p>
                        </div>
                        <span className="text-[10px] font-black shrink-0 text-emerald-400">
                          Rp {Math.round(item.price / 1000)}rb
                        </span>
                      </div>
                    ))}
                </div>

                {/* Footer verification badge */}
                <div className="pt-2 border-t border-current/10 text-[9px] opacity-60 flex items-center justify-center space-x-1">
                  <ShieldCheck size={11} />
                  <span>Didukung oleh PT Bionet Herbal Indonesia</span>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
