import React, { useState } from 'react';
import {
  Store,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Settings,
  Eye,
  X,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Palette,
  Crown,
  Leaf,
  Atom,
  Smartphone,
} from 'lucide-react';
import StorefrontRenderer from './StorefrontRenderer';
import { STORE_TEMPLATES, getTemplateById } from './storeTemplates';

export default function AffiliateStoreModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shopName, setShopName] = useState(
    () => localStorage.getItem('bionet_shop_name') || `Toko Herbal Berkah ${user?.full_name || user?.username}`
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    () => localStorage.getItem('bionet_shop_wa') || user?.phone || '6281234567890'
  );
  const [customMarkup, setCustomMarkup] = useState(
    () => Number(localStorage.getItem('bionet_shop_markup')) || 50000
  );
  const [selectedTemplate, setSelectedTemplate] = useState(
    () => localStorage.getItem('bionet_shop_template') || 'emerald'
  );
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'settings' | 'templates'
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Storefront URL with chosen template parameter
  const storeUrl = `${window.location.origin}/?store=${user?.username || 'mitra'}&tpl=${selectedTemplate}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('bionet_shop_template', templateId);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('bionet_shop_name', shopName);
    localStorage.setItem('bionet_shop_wa', whatsappNumber);
    localStorage.setItem('bionet_shop_markup', customMarkup.toString());
    localStorage.setItem('bionet_shop_template', selectedTemplate);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Sample herbal products
  const products = [
    {
      id: 'p1',
      name: 'Bionet Bio-Herbal Drops 30ml',
      desc: 'Konsentrat herbal tetes antioksidan tinggi untuk imunitas dan metabolisme tubuh prima.',
      memberPrice: 150000,
      image: '/assets/bionet_biotech_hero.jpg',
      bpom: 'POM TR 226019881',
      sold: '1,420+ terjual',
    },
    {
      id: 'p2',
      name: 'Bionet Royal Propolis Elixir 15ml',
      desc: 'Ekstrak propolis murni lebah trigona kualitas premium untuk pemulihan dan regenerasi sel.',
      memberPrice: 180000,
      image: '/assets/bionet_ambient_luxury.jpg',
      bpom: 'POM TR 236021102',
      sold: '890+ terjual',
    },
  ];

  const handleDirectWa = (product) => {
    const retailPrice = (product.memberPrice || 150000) + customMarkup;
    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Halo kak ${user?.full_name || user?.username}, saya tertarik pesan *${product.name}* (Rp ${retailPrice.toLocaleString('id-ID')}) lewat toko online resmi kakak. Apakah stok masih tersedia?`
    );
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  const currentTplMeta = getTemplateById(selectedTemplate);

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <Store className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white">
                  Toko Online Afiliasi Mandiri
                </h2>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Mitra Reseller Toko
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5 line-clamp-1">
                Sebarkan link toko Anda ke konsumen. Konsumen beli, selisih markup langsung jadi keuntungan Anda!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center space-x-1"
              title="Buka Toko di Tab Baru"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Buka Toko</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar & Share Link */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
          {/* Share Link Input */}
          <div className="flex items-center space-x-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-mono pr-20 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center space-x-1 transition shadow-xs"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center space-x-1 self-start md:self-auto bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Toko</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'templates'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Template ({STORE_TEMPLATES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Pengaturan &amp; Markup</span>
            </button>
          </div>
        </div>

        {/* Quick Template Picker Bar (Visible on Preview for easy 1-click swapping) */}
        {activeTab === 'preview' && (
          <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto flex-shrink-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 flex items-center space-x-1 mr-1">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ganti Tema:</span>
            </span>
            {STORE_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${tpl.previewGradient}`} />
                  <span>{tpl.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'templates' && (
            /* Tab: 5 Store Templates Selection Grid */
            <div className="space-y-5">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  Pilih Template Desain Toko Afiliasi Anda
                </h3>
                <p className="text-xs text-slate-500">
                  Tersedia 5 pilihan desain profesional dengan estetika dan strategi konversi berbeda. Pilih yang paling sesuai dengan target pasar Anda!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STORE_TEMPLATES.map((tpl, idx) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`cursor-pointer rounded-2xl border-2 transition p-4 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Top badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Template #{idx + 1}
                        </span>
                        {isSelected ? (
                          <span className="flex items-center space-x-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Aktif Digunakan</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 hover:text-slate-600">
                            Klik untuk Pilih
                          </span>
                        )}
                      </div>

                      {/* Header preview swatch */}
                      <div
                        className={`h-24 rounded-xl bg-gradient-to-r ${tpl.previewGradient} p-3 text-white flex flex-col justify-between shadow-xs relative overflow-hidden`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-[9px] font-bold">
                            {tpl.badgeText}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-black text-white leading-tight">
                            {tpl.name}
                          </div>
                          <div className="text-[10px] text-white/80 line-clamp-1">{tpl.tagline}</div>
                        </div>
                      </div>

                      {/* Description & Palette */}
                      <div className="space-y-1.5 flex-1">
                        <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1.5">
                          <span>Palet:</span>
                          <span className="font-bold text-slate-800">{tpl.paletteName}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Selection Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTemplate(tpl.id);
                        }}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Template Terpilih</span>
                          </>
                        ) : (
                          <span>Gunakan Template Ini</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition inline-flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Lihat Hasil di Pratinjau Toko</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            /* Tab: Settings & Markup */
            <form onSubmit={handleSaveSettings} className="max-w-xl mx-auto space-y-5">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan toko online dan markup keuntungan Anda berhasil disimpan!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Pilihan Template Desain Toko:
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {STORE_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} — {t.tagline}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Desain toko otomatis menyesuaikan palet warna, tipografi, dan gaya tombol sesuai template yang dipilih
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Nama Toko Online Afiliasi:
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Nama ini akan muncul di banner atas toko online Anda</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Nomor WhatsApp Pemesanan (CS Toko Anda):
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Contoh: 6281234567890"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Format awalan kode negara (62). Konsumen yang mengklik tombol beli akan langsung membuka WhatsApp Anda
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Markup Keuntungan Langsung Ritel (Rp):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={customMarkup}
                    onChange={(e) => setCustomMarkup(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="mt-2 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Harga Modal Member (dari Bionet):</span>
                    <span className="font-semibold">Rp 150.000</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Harga Jual ke Konsumen Anda:</span>
                    <span className="font-bold text-slate-900">Rp {(150000 + customMarkup).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-emerald-200">
                    <span>Keuntungan Bersih Langsung Anda:</span>
                    <span>Rp {customMarkup.toLocaleString('id-ID')} / botol</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  Simpan Pengaturan Toko
                </button>
              </div>
            </form>
          )}

          {activeTab === 'preview' && (
            /* Tab: Live Interactive Storefront Preview */
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
              <StorefrontRenderer
                templateId={selectedTemplate}
                shopName={shopName}
                whatsappNumber={whatsappNumber}
                customMarkup={customMarkup}
                products={products}
                onDirectWa={handleDirectWa}
                onCopyLink={handleCopyLink}
                copied={copied}
                isPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
