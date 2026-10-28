import React from 'react';
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Crown,
  Leaf,
  Atom,
  Smartphone,
  Award,
  Zap,
  Activity,
  Star,
  Check,
  Copy,
  LogIn,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Send,
} from 'lucide-react';
import { getTemplateById } from './storeTemplates';

export default function StorefrontRenderer({
  templateId = 'emerald',
  shopName,
  whatsappNumber,
  customMarkup = 50000,
  products = [],
  onSelectProduct,
  onDirectWa,
  onCopyLink,
  copied = false,
  onGoToLogin,
  isPreview = false,
}) {
  const currentTemplate = getTemplateById(templateId);

  const getRetailPrice = (memberPrice) => {
    return memberPrice + customMarkup;
  };

  // ==========================================
  // TEMPLATE 1: MODERN EMERALD (Official Biotech)
  // ==========================================
  if (templateId === 'emerald') {
    return (
      <div className="bg-slate-50 font-sans text-slate-800 transition-colors duration-300">
        {/* Top Navbar */}
        {!isPreview && (
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  B
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm md:text-base leading-tight">
                    {shopName}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Distributor Resmi Terverifikasi Bionet</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onCopyLink && (
                  <button
                    onClick={onCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan Toko'}</span>
                  </button>
                )}
                {onGoToLogin && (
                  <button
                    onClick={onGoToLogin}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Portal Member</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Hero Banner */}
        <section className={`bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white ${isPreview ? 'p-5 md:p-6 rounded-2xl' : 'py-12 md:py-16 px-4'} relative overflow-hidden shadow-sm`}>
          <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Garansi 100% Produk Herbal Asli Langsung Dari Pabrik</span>
            </div>

            <h1 className={`${isPreview ? 'text-lg md:text-2xl' : 'text-2xl sm:text-4xl md:text-5xl'} font-black text-white tracking-tight leading-tight max-w-3xl mx-auto`}>
              Solusi Herbal Alami Bersertifikasi BPOM untuk Vitalitas &amp; Imunitas Prima
            </h1>

            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
              Selamat datang di toko resmi {shopName}. Produk kesehatan herbal ekstrak alami dengan bioteknologi tinggi dan konsultasi gratis.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs md:text-sm shadow-xl flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Konsultasi via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'my-4' : '-mt-6 relative z-20'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">BPOM &amp; Halal Resmi</div>
                <div className="text-[10px] text-slate-500">Registrasi resmi &amp; legalitas lengkap</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Pengiriman Cepat 3PL</div>
                <div className="text-[10px] text-slate-500">JNE, J&amp;T, SiCepat resi tercatat</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Konsultasi Dosis Gratis</div>
                <div className="text-[10px] text-slate-500">Pendampingan pemakaian tuntas</div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'py-4' : 'py-10'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-900">Katalog Produk Herbal Unggulan</h2>
              <p className="text-xs text-slate-500">Klik tombol &ldquo;Beli Cepat WA&rdquo; untuk langsung memesan ke CS resmi</p>
            </div>
            {isPreview && (
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Margin: +Rp {customMarkup.toLocaleString('id-ID')} / botol
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {products.map((p) => {
              const retailPrice = getRetailPrice(p.memberPrice || p.basePrice || 150000);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 sm:h-52 bg-slate-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                      <div className="absolute top-2.5 left-2.5 bg-emerald-600/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        {p.bpom}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        4.9/5 (Ulasan Resmi)
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug">{p.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 line-through">
                          Rp {(retailPrice + 45000).toLocaleString('id-ID')}
                        </div>
                        <div className="text-lg font-black text-emerald-700 font-mono">
                          Rp {retailPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Form</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDirectWa(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Pesan via WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!isPreview && (
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
            <p>© 2026 {shopName}. Didukung oleh Platform Resmi Bionet Indonesia.</p>
          </footer>
        )}
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: ROYAL OBSIDIAN & GOLD (Luxury VIP)
  // ==========================================
  if (templateId === 'luxury') {
    return (
      <div className="bg-[#0b0d11] font-sans text-stone-200 min-h-full transition-colors duration-300">
        {/* Top Navbar Luxury */}
        {!isPreview && (
          <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-amber-500/20">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center font-black text-lg shadow-lg shadow-amber-950/80">
                  <Crown className="w-5 h-5 text-stone-950" />
                </div>
                <div>
                  <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 text-sm md:text-base leading-tight tracking-wide">
                    {shopName}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-amber-400/80 font-bold uppercase tracking-widest">
                    <span>Royal Reserve Exclusive</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onCopyLink && (
                  <button
                    onClick={onCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
                  </button>
                )}
                {onGoToLogin && (
                  <button
                    onClick={onGoToLogin}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 text-xs font-black flex items-center space-x-1.5 shadow-md shadow-amber-950/60 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Portal VIP</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Hero Banner Luxury */}
        <section className={`bg-gradient-to-b from-stone-950 via-[#11141c] to-[#0b0d11] border-b border-amber-500/20 text-stone-100 ${isPreview ? 'p-5 md:p-6 rounded-2xl' : 'py-12 md:py-16 px-4'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Prestige Edition &bull; Royal Herbal Reserve</span>
            </div>

            <h1 className={`${isPreview ? 'text-lg md:text-2xl' : 'text-2xl sm:text-4xl md:text-5xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 tracking-tight leading-tight max-w-3xl mx-auto`}>
              Kemewahan Ekstrak Murni Berkualitas Tinggi untuk Kesehatan Paripurna
            </h1>

            <p className="text-xs md:text-sm text-stone-300 max-w-2xl mx-auto leading-relaxed">
              Diformulasikan khusus dari propolis trigona murni dan konsentrat herbal antioksidan pilihan untuk regenerasi sel dan stamina eksklusif.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs md:text-sm shadow-xl shadow-amber-950/80 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-stone-950" />
                <span>Konsultasi Eksklusif via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* Value Props Luxury */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'my-4' : '-mt-5 relative z-20'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-900/90 p-3.5 rounded-2xl border border-amber-500/25 shadow-lg flex items-center space-x-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-200 text-xs">Grade A+ Lab Extract</div>
                <div className="text-[10px] text-stone-400">Standar kemurnian tertinggi BPOM</div>
              </div>
            </div>

            <div className="bg-stone-900/90 p-3.5 rounded-2xl border border-amber-500/25 shadow-lg flex items-center space-x-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-200 text-xs">Kemasan VIP Protected</div>
                <div className="text-[10px] text-stone-400">Garansi segel asli &amp; asuransi kirim</div>
              </div>
            </div>

            <div className="bg-stone-900/90 p-3.5 rounded-2xl border border-amber-500/25 shadow-lg flex items-center space-x-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-200 text-xs">Personal Konsultan VIP</div>
                <div className="text-[10px] text-stone-400">Panduan dosis eksklusif 24/7</div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Luxury */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'py-4' : 'py-10'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-200">Koleksi Royal Herbal Reserve</h2>
              <p className="text-xs text-stone-400">Pemesanan prioritas langsung terhubung ke WhatsApp Owner Toko</p>
            </div>
            {isPreview && (
              <span className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                Margin: +Rp {customMarkup.toLocaleString('id-ID')} / botol
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {products.map((p) => {
              const retailPrice = getRetailPrice(p.memberPrice || p.basePrice || 150000);
              return (
                <div
                  key={p.id}
                  className="bg-stone-900/90 rounded-2xl border border-amber-500/30 hover:border-amber-400/80 shadow-xl shadow-black/60 transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 sm:h-52 bg-stone-950 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-500 opacity-90" />
                      <div className="absolute top-2.5 left-2.5 bg-amber-500/90 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                        {p.bpom}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-stone-950/80 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                        VIP Grade &bull; 5.0/5
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-extrabold text-amber-100 text-sm md:text-base leading-snug">{p.name}</h3>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-stone-500 line-through">
                          Rp {(retailPrice + 55000).toLocaleString('id-ID')}
                        </div>
                        <div className="text-lg font-black text-amber-400 font-mono">
                          Rp {retailPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Form</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDirectWa(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-amber-950/80"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Pesan VIP via WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!isPreview && (
          <footer className="border-t border-amber-500/20 bg-stone-950 py-6 text-center text-xs text-stone-500">
            <p>© 2026 {shopName}. Private Royal Reserve Partner &bull; Bionet Indonesia.</p>
          </footer>
        )}
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: FRESH BOTANICAL MINT (Organic Nature)
  // ==========================================
  if (templateId === 'organic') {
    return (
      <div className="bg-[#f2f8f4] font-sans text-emerald-950 min-h-full transition-colors duration-300">
        {/* Top Navbar Organic */}
        {!isPreview && (
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-lg shadow-sm">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-950 text-sm md:text-base leading-tight">
                    {shopName}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px] text-teal-700 font-semibold">
                    <span>Herbal Alami Ramah Keluarga</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onCopyLink && (
                  <button
                    onClick={onCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-emerald-100/60 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Bagikan'}</span>
                  </button>
                )}
                {onGoToLogin && (
                  <button
                    onClick={onGoToLogin}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Member</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Hero Banner Organic */}
        <section className={`bg-gradient-to-br from-teal-900 via-emerald-800 to-green-900 text-white ${isPreview ? 'p-5 md:p-6 rounded-3xl' : 'py-12 md:py-16 px-4'} relative overflow-hidden`}>
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/30 text-emerald-100 text-xs font-bold">
              <Leaf className="w-3.5 h-3.5 text-lime-300" />
              <span>100% Ekstrak Nabati Murni Tanpa Bahan Kimia</span>
            </div>

            <h1 className={`${isPreview ? 'text-lg md:text-2xl' : 'text-2xl sm:text-4xl md:text-5xl'} font-black text-white tracking-tight leading-tight max-w-3xl mx-auto`}>
              Kembalikan Vitalitas &amp; Imunitas Alami untuk Keluarga Tercinta
            </h1>

            <p className="text-xs md:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              Herbal tetes berkualitas tinggi dengan ekstrak tanaman obat pilihan, aman dikonsumsi harian tanpa efek samping dan ramah di lambung.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-emerald-950 font-black text-xs md:text-sm shadow-xl flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-950" />
                <span>Konsultasi Herbal Keluarga</span>
              </a>
            </div>
          </div>
        </section>

        {/* Value Props Organic */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'my-4' : '-mt-5 relative z-20'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-xs">100% Ekstrak Nabati</div>
                <div className="text-[10px] text-emerald-700/80">Bebas pengawet kimia berbahaya</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-xs">Aman untuk Lambung</div>
                <div className="text-[10px] text-emerald-700/80">Cocok untuk usia muda hingga lansia</div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-sm flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-lime-50 text-lime-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-xs">BPOM Halal Terdaftar</div>
                <div className="text-[10px] text-emerald-700/80">Sertifikasi uji laboratorium resmi</div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Organic */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'py-4' : 'py-10'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-emerald-950">Pilihan Herbal Alami Pilihan</h2>
              <p className="text-xs text-emerald-700">Pemesanan aman dan langsung dibimbing aturan pakainya</p>
            </div>
            {isPreview && (
              <span className="text-xs text-teal-800 font-bold bg-teal-100/80 border border-teal-200 px-3 py-1 rounded-full">
                Margin: +Rp {customMarkup.toLocaleString('id-ID')} / botol
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {products.map((p) => {
              const retailPrice = getRetailPrice(p.memberPrice || p.basePrice || 150000);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 sm:h-52 bg-emerald-50 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                      <div className="absolute top-2.5 left-2.5 bg-teal-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {p.bpom}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-xs">
                        Alami &amp; Organik
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-extrabold text-emerald-950 text-sm md:text-base leading-snug">{p.name}</h3>
                      <p className="text-xs text-emerald-800/80 line-clamp-2 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-emerald-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-600/70 line-through">
                          Rp {(retailPrice + 40000).toLocaleString('id-ID')}
                        </div>
                        <div className="text-lg font-black text-teal-800 font-mono">
                          Rp {retailPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Form</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDirectWa(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Pesan Herbal WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!isPreview && (
          <footer className="border-t border-emerald-100 bg-white py-6 text-center text-xs text-emerald-700/60">
            <p>© 2026 {shopName}. Sahabat Herbal Keluarga &bull; Bionet Indonesia.</p>
          </footer>
        )}
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 4: FUTURISTIC CYBER CLINICAL (Biotech Nano)
  // ==========================================
  if (templateId === 'biotech') {
    return (
      <div className="bg-[#070b13] font-sans text-cyan-50 min-h-full transition-colors duration-300">
        {/* Top Navbar Cyber Biotech */}
        {!isPreview && (
          <header className="sticky top-0 z-40 bg-[#090e1a]/90 backdrop-blur-md border-b border-cyan-500/30">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-950">
                  <Atom className="w-5 h-5 text-cyan-300 animate-spin-slow" />
                </div>
                <div>
                  <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 text-sm md:text-base leading-tight font-mono tracking-tight">
                    {shopName}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-cyan-400/90 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>BIO-LAB CERTIFIED 99.8%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {onCopyLink && (
                  <button
                    onClick={onCopyLink}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? 'COPIED' : 'SHARE'}</span>
                  </button>
                )}
                {onGoToLogin && (
                  <button
                    onClick={onGoToLogin}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-cyan-900/50 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>LAB PORTAL</span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* Hero Banner Cyber Biotech */}
        <section className={`bg-gradient-to-b from-[#060a12] via-[#091122] to-[#070b13] border-b border-cyan-500/30 text-white ${isPreview ? 'p-5 md:p-6 rounded-2xl' : 'py-12 md:py-16 px-4'} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>CELLULAR NANO-EXTRACTION TECHNOLOGY 4.0</span>
            </div>

            <h1 className={`${isPreview ? 'text-lg md:text-2xl' : 'text-2xl sm:text-4xl md:text-5xl'} font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-sky-200 to-blue-400 tracking-tight leading-tight max-w-3xl mx-auto`}>
              Bio-Aktivasi Seluler Berstandar Sains Modern untuk Regenerasi Optimal
            </h1>

            <p className="text-xs md:text-sm text-cyan-100/80 max-w-2xl mx-auto leading-relaxed">
              Memaksimalkan penyerapan mikro-nutrisi hingga tingkat selular dengan formula bioteknologi presisi tinggi dan teruji laboratorium.
            </p>

            {/* Metrics Counter Bar */}
            <div className="pt-2 max-w-xl mx-auto grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="text-sm md:text-base font-black text-cyan-400">99.8%</div>
                <div className="text-[9px] text-cyan-200/70 uppercase">Bioavailability</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="text-sm md:text-base font-black text-cyan-400">&lt;0.01s</div>
                <div className="text-[9px] text-cyan-200/70 uppercase">Cell Absorption</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="text-sm md:text-base font-black text-cyan-400">0% Toxin</div>
                <div className="text-[9px] text-cyan-200/70 uppercase">Purity Certified</div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs md:text-sm shadow-xl shadow-cyan-900/60 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-slate-950" />
                <span>Konsultasi Sains via WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* Value Props Cyber Biotech */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'my-4' : '-mt-5 relative z-20'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 text-xs font-mono">Nano Cold-Press Process</div>
                <div className="text-[10px] text-cyan-400/60">Molekul partikel aktif mikro</div>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 text-xs font-mono">Cellular Regeneration</div>
                <div className="text-[10px] text-cyan-400/60">Peningkatan metabolisme seluler</div>
              </div>
            </div>

            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-cyan-500/30 shadow-lg flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-cyan-200 text-xs font-mono">Verified Lab Protocol</div>
                <div className="text-[10px] text-cyan-400/60">Standar BPOM &amp; Uji Klinis</div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Cyber Biotech */}
        <section className={`max-w-5xl mx-auto px-4 ${isPreview ? 'py-4' : 'py-10'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-black text-cyan-200 font-mono">Katalog Formula Bioteknologi</h2>
              <p className="text-xs text-cyan-400/70">Pemesanan resmi langsung terhubung ke WhatsApp CS Resmi</p>
            </div>
            {isPreview && (
              <span className="text-xs text-cyan-300 font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                Margin: +Rp {customMarkup.toLocaleString('id-ID')} / botol
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {products.map((p) => {
              const retailPrice = getRetailPrice(p.memberPrice || p.basePrice || 150000);
              return (
                <div
                  key={p.id}
                  className="bg-slate-900/90 rounded-2xl border border-cyan-500/30 hover:border-cyan-400 shadow-xl shadow-cyan-950/40 transition overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 sm:h-52 bg-slate-950 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition duration-500 opacity-90" />
                      <div className="absolute top-2.5 left-2.5 bg-cyan-500 text-slate-950 text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {p.bpom}
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-lg">
                        BIO-NANO 4.0
                      </div>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-extrabold text-cyan-100 text-sm md:text-base leading-snug">{p.name}</h3>
                      <p className="text-xs text-cyan-200/70 line-clamp-2 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-cyan-400/50 line-through font-mono">
                          Rp {(retailPrice + 45000).toLocaleString('id-ID')}
                        </div>
                        <div className="text-lg font-black text-cyan-400 font-mono">
                          Rp {retailPrice.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(p)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-200 border border-cyan-500/30 text-xs font-bold transition flex items-center space-x-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Form</span>
                          </button>
                        )}
                        <button
                          onClick={() => onDirectWa(p)}
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition flex items-center space-x-1.5 shadow-lg shadow-cyan-900/50"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Pesan via WA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {!isPreview && (
          <footer className="border-t border-cyan-500/20 bg-[#090e1a] py-6 text-center text-xs text-cyan-400/60 font-mono">
            <p>© 2026 {shopName}. Advanced Cellular Biotech Protocol &bull; Bionet Indonesia.</p>
          </footer>
        )}
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 5: SOCIAL BIO-LINK (TikTok & IG Style)
  // ==========================================
  // Layout compact vertical card stack, mobile-first, linktree feel!
  return (
    <div className="bg-gradient-to-b from-slate-100 via-purple-50/30 to-slate-200 font-sans text-slate-800 min-h-full transition-colors duration-300">
      <div className={`max-w-md mx-auto ${isPreview ? 'p-2' : 'p-4 py-8'} space-y-4`}>
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600" />

          <div className="relative pt-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-900 shadow-lg overflow-hidden flex items-center justify-center text-white text-2xl font-black mb-2">
              <span className="bg-gradient-to-tr from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                {shopName.charAt(0) || 'B'}
              </span>
            </div>

            <div className="flex items-center space-x-1">
              <h1 className="font-black text-slate-900 text-base md:text-lg">{shopName}</h1>
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            </div>

            <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
              Official Partner Bionet &bull; Solusi Herbal Alami Bersertifikasi BPOM &bull; 1,400+ Konsumen Puas
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Original BPOM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Pengiriman 3PL Cepat
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Konsultasi Gratis
              </span>
            </div>

            {/* Main WA Link Button */}
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center space-x-2 transition transform active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Customer Service</span>
            </a>
          </div>
        </div>

        {/* Catalog List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">Pilihan Produk Resmi:</h2>
            {isPreview && (
              <span className="text-[11px] font-bold text-emerald-700">
                +Rp {customMarkup.toLocaleString('id-ID')} Margin
              </span>
            )}
          </div>

          {products.map((p) => {
            const retailPrice = getRetailPrice(p.memberPrice || p.basePrice || 150000);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-2.5"
              >
                <div className="flex space-x-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {p.bpom}
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" /> 5.0
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate">{p.name}</h3>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <span className="text-sm font-black text-emerald-700 font-mono">
                        Rp {retailPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        Rp {(retailPrice + 40000).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {onSelectProduct ? (
                    <button
                      onClick={() => onSelectProduct(p)}
                      className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Form Pesan</span>
                    </button>
                  ) : null}
                  <button
                    onClick={() => onDirectWa(p)}
                    className={`${onSelectProduct ? '' : 'col-span-2'} py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pesan via WA</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share & Login Links */}
        {!isPreview && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 px-2">
            {onCopyLink && (
              <button
                onClick={onCopyLink}
                className="hover:text-emerald-700 font-medium flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Toko Tersalin' : 'Bagikan Toko'}</span>
              </button>
            )}
            {onGoToLogin && (
              <button onClick={onGoToLogin} className="hover:text-slate-800 font-bold flex items-center space-x-1">
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Member</span>
              </button>
            )}
          </div>
        )}

        {!isPreview && (
          <footer className="text-center py-4 text-[11px] text-slate-400">
            <p>© 2026 {shopName} &bull; Bionet Indonesia</p>
          </footer>
        )}
      </div>
    </div>
  );
}

