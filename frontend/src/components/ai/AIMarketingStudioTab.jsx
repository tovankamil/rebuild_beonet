import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Share2,
  Download,
  RefreshCw,
  MessageCircle,
  Instagram,
  Video,
  Layers,
  Flame,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Tag,
  CheckCircle2,
  Sliders,
  FileText,
  Clock,
  Target,
  Users,
  Smile,
  Zap,
} from 'lucide-react';
import api from '../../services/api';
import TikTokVideoModal from './TikTokVideoModal';

export default function AIMarketingStudioTab({ user }) {
  const [platform, setPlatform] = useState('whatsapp');
  const [product, setProduct] = useState('Bio-Herbal Drops 30ml');
  const [audience, setAudience] = useState('diabetes_kolesterol');
  const [tone, setTone] = useState('persuasif');
  const [highlightInfo, setHighlightInfo] = useState('Promo Free Ongkir + Izin Resmi BPOM & Halal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const outputBoxRef = useRef(null);

  // Auto-scroll output container to top when new copy is generated or loaded
  useEffect(() => {
    if (result && outputBoxRef.current) {
      outputBoxRef.current.scrollTop = 0;
    }
  }, [result]);
  const [history, setHistory] = useState([
    {
      id: 1,
      platform: 'whatsapp',
      product: 'Bio-Herbal Drops 30ml',
      tone: 'persuasif',
      title: 'Broadcast Edukasi Kolesterol & Gula Darah',
      copy: `🌿 *IKHTIAR HERBAL KELUARGA SEHAT: BIO-HERBAL DROPS BPOM* 🌿\n\nAssalamu'alaikum & Salam Sejahtera Bapak/Ibu,\n\nSering merasa leher kaku, cepat lelah, atau kadar gula darah & kolesterol naik turun? Jangan dibiarkan berlarut-larut!\n\nKini hadir *Bio-Herbal Drops 30ml*, formula tetes konsentrat herbal alami nusantara bersertifikat resmi *BPOM RI (POM TR 226019881)* & Halal MUI.\n\n✨ *Keunggulan Utama Bio-Herbal Drops:*\n✅ Praktis tinggal tetes di air hangat setiap pagi & malam\n✅ Membantu melancarkan peredaran darah & metabolisme sel\n✅ Alami tanpa zat kimia sintetis berbahaya\n\n🎁 *PROMO KHUSUS HARI INI:*\nGratis Ongkir ke seluruh Indonesia + Garansi 100% Produk Original dari Toko Resmi Mitra Bionet!\n\n👉 Info selengkapnya & Pemesanan langsung:\nhttps://bionet.id/?store=${user?.username || 'mitra'}\n\nAtau balas pesan ini untuk konsultasi kesehatan gratis. Semoga sehat selalu! 🙏`,
      createdAt: 'Kemarin, 14:20',
    },
    {
      id: 2,
      platform: 'tiktok',
      product: 'Peluang Bisnis BOP Bionet',
      tone: 'urgensi_promo',
      title: 'Script TikTok/Reels Bisnis Tambahan 10 Juta/Bulan',
      copy: `[0-3 DETIK - HOOK VISUAL & KATA]\n(Kamera menatap tajam ke layar, memegang buku rekening/HP)\n"Pernah nggak sih mikir, gimana caranya punya penghasilan tambahan tanpa harus ninggalin jam kerja utama?"\n\n[3-15 DETIK - MASALAH]\nBanyak orang pengen mulai jualan online, tapi kepentok modal ratusan juta, stok numpuk di kamar, dan bingung cara pengiriman.\n\n[15-30 DETIK - SOLUSI BIONET]\nDi Bionet, semua mitra dapet Toko Afiliasi online gratis, materi promosi disiapin sama AI, dan produk herbalnya udah izin BPOM resmi. Plus bonus pairing harian langsung masuk rekening!\n\n[30-45 DETIK - CALL TO ACTION]\nSlot webinar mentoring minggu ini sisa 5 orang lagi. Klik link di bio akun saya sekarang sebelum kuota ditutup!`,
      createdAt: '2 Hari lalu',
    },
  ]);

  const affiliateLink = `https://bionet.id/?store=${user?.username || 'mitra'}`;

  const platformOptions = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Broadcast',
      icon: MessageCircle,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeColor: 'border-emerald-500 bg-emerald-950/30',
      desc: 'Pesan siaran broadcast ramah dengan emoji, poin manfaat, dan link order.',
    },
    {
      id: 'instagram',
      name: 'Instagram Feed Caption',
      icon: Instagram,
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      activeColor: 'border-pink-500 bg-pink-950/30',
      desc: 'Hook pemikat, storytelling mendalam, ajakan klik bio, & 15 hashtag SEO.',
    },
    {
      id: 'tiktok',
      name: 'Naskah Video TikTok / Reels',
      icon: Video,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      activeColor: 'border-indigo-500 bg-indigo-950/30',
      desc: 'Naskah 30-45 detik: Hook, Problem, Solusi, dan Call to Action.',
    },
    {
      id: 'story',
      name: 'Slide Teks Story WA / IG',
      icon: Layers,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      activeColor: 'border-amber-500 bg-amber-950/30',
      desc: '3 slide teks berurutan yang memancing kepenasaran pemirsa story.',
    },
    {
      id: 'closing',
      name: 'Closing Script Pamungkas',
      icon: Flame,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      activeColor: 'border-rose-500 bg-rose-950/30',
      desc: 'Menjawab keraguan prospek soal harga dan mendesak transfer hari ini.',
    },
  ];

  const productList = [
    { name: 'Bio-Herbal Drops 30ml', category: 'Herbal Metabolisme & Gula Darah', bpom: 'POM TR 226019881' },
    { name: 'Royal Propolis Elixir 15ml', category: 'Imunitas & Regenerasi Sel', bpom: 'POM TR 236021102' },
    { name: 'Bio-Gluta White Collagen', category: 'Kecantikan & Anti-Aging Alami', bpom: 'POM TR 228031201' },
    { name: 'Bio-Energy Tea Herbal', category: 'Stamina, Detoks & Vitalitas Pagi', bpom: 'P-IRT Resmi' },
    { name: 'Peluang Bisnis BOP Kemitraan', category: 'Peluang Usaha Network Marketing Modern', bpom: 'Izin Usaha Lengkap' },
  ];

  const audienceOptions = [
    { id: 'diabetes_kolesterol', label: 'Penderita Diabetes, Kolesterol & Asam Urat' },
    { id: 'ibu_rumah_tangga', label: 'Ibu Rumah Tangga (Keluarga Sehat & Tambahan Uang Belanja)' },
    { id: 'karyawan', label: 'Karyawan & Pekerja (Peluang Kerja Sampingan Bebas Macet)' },
    { id: 'reseller', label: 'Reseller & Pemula Bisnis Online (Ingin Langsung Jualan)' },
    { id: 'umum', label: 'Masyarakat Umum / Penggemar Gaya Hidup Sehat Alami' },
  ];

  const toneOptions = [
    { id: 'persuasif', label: 'Persuasif & Ramah', desc: 'Menyentuh empati dan menawarkan solusi' },
    { id: 'edukatif', label: 'Edukatif & Berbasis Fakta', desc: 'Fokus sertifikasi BPOM dan khasiat klinis' },
    { id: 'santai', label: 'Santai & Bersahabat', desc: 'Gaya mengobrol dengan kawan lama' },
    { id: 'urgensi_promo', label: 'Urgensi & Promo Terbatas', desc: 'Fokus batas waktu diskon & kuota habis' },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/ai/marketing/generate', {
        product,
        platform,
        audience,
        tone,
        highlight_info: highlightInfo,
      });

      if (res.data && res.data.copy_text) {
        setResult(res.data.copy_text);
        // Add to history
        setHistory((prev) => [
          {
            id: Date.now(),
            platform,
            product,
            tone,
            title: `Promosi ${product} (${platform.toUpperCase()})`,
            copy: res.data.copy_text,
            createdAt: 'Baru saja',
          },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (err) {
      console.error('Failed to generate copy:', err);
      // Fallback generator if offline
      const fallback = `🔥 *PROMO SPESIAL HARI INI: ${product.toUpperCase()}* 🔥\n\nHalo kak! Mau info menarik buat yang lagi cari solusi herbal alami berizin BPOM resmi.\n\nSekarang belanja ${product} di Toko Resmi Bionet lagi ada *${highlightInfo}* lho!\n\nYuk langsung amankan pesanan sekarang sebelum promo ditutup:\n👉 ${affiliateLink}\n\nTerima kasih, salam sehat selalu dari ${user?.full_name || 'Mitra Bionet'}!`;
      setResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToWhatsApp = (text) => {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = (title, text) => {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>Didukung Google Gemini 3.1 AI Copilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Studio Konten & Copywriting AI Penjualan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hasilkan materi promosi WhatsApp, Instagram Caption, dan Naskah Video TikTok dalam hitungan detik. 
              Otomatis disematkan link toko afiliasi resmi Anda untuk langsung closing!
            </p>
          </div>

          {/* Quick Affiliate Link Card */}
          <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl border border-indigo-500/30 p-4 min-w-[260px] flex flex-col justify-between shadow-xl">
            <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center justify-between">
              <span>Link Toko Afiliasi Anda:</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Aktif</span>
            </div>
            <div className="font-mono text-xs text-indigo-300 truncate py-1 mb-2">
              {affiliateLink}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyText(affiliateLink)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-950"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
              <a
                href={affiliateLink}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                title="Buka Toko Afiliasi"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                1. Pilih Format & Platform
              </h2>
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-1 gap-2.5">
              {platformOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = platform === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPlatform(opt.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? `${opt.activeColor} border-2 shadow-lg`
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl flex-shrink-0 mt-0.5 border ${opt.badgeColor}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {opt.name}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Product Selector */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>2. Produk atau Topik Promosi:</span>
                <span className="text-[10px] text-indigo-400 font-semibold">Resmi BPOM</span>
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {productList.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                3. Target Segmen Pembaca:
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {audienceOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone of Voice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                4. Gaya Bahasa (Tone):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`py-2 px-2.5 rounded-xl border text-left transition ${
                      tone === t.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Highlight / Special Offer Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>5. Poin Penting & Promo Khusus:</span>
                <span className="text-[10px] text-slate-500">Opsional</span>
              </label>
              <input
                type="text"
                value={highlightInfo}
                onChange={(e) => setHighlightInfo(e.target.value)}
                placeholder="Contoh: Diskon 20%, Free Ongkir, Bonus Shaker..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition shadow-xl shadow-indigo-950 flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini AI Sedang Menulis Naskah...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Buat Materi Promosi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output & History (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Hasil Teks Promosi AI
                </h2>
              </div>

              {result && (
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setShowTikTokModal(true)}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-xs font-black transition flex items-center space-x-1.5 shadow-md shadow-rose-950"
                    title="Render Video TikTok 9:16 Siap Upload"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>🎬 Render Video TikTok</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(result)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center space-x-1 border border-slate-700"
                    title="Salin Naskah"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>

                  <button
                    onClick={() => handleShareToWhatsApp(result)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                    title="Buka & Kirim via WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleDownloadTxt(`Promosi_${product}_${platform}`, result)}
                    className="p-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                    title="Unduh Teks (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Body */}
            {result ? (
              <div className="flex-1 flex flex-col justify-between">
                {/* TikTok Video Render Banner */}
                <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/70 via-purple-950/70 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <span>Konten Video TikTok Siap Dibuat</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold">9:16 Vertikal</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Render naskah ini menjadi video animasi kinetik BPOM & soundtrack langsung di aplikasi
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTikTokModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs transition shadow-md shadow-rose-950 flex items-center justify-center space-x-1.5 shrink-0 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Buka Studio Render Video</span>
                  </button>
                </div>

                <div
                  ref={outputBoxRef}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[360px] select-text shadow-inner"
                >
                  {result}
                </div>

                <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 mt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link toko otomatis tersambung ke profil @{user?.username}</span>
                  </div>
                  <button
                    onClick={handleGenerate}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Ulang Variasi Lain</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 my-auto">
                <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Belum Ada Teks Dihasilkan</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Pilih format platform di panel kiri, tentukan produk & poin promo yang diinginkan, lalu klik <strong>"Buat Materi Promosi Sekarang"</strong>.
                  </p>
                </div>
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-950"
                >
                  Coba Generate Contoh Sekarang
                </button>
              </div>
            )}
          </div>

          {/* History / Recent Generated List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Riwayat & Bank Naskah Tersimpan
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">{history.length} Naskah</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3 hover:border-slate-700 transition flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-black text-indigo-300 uppercase">
                        {item.platform}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-mono">
                      {item.copy.substring(0, 80)}...
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        setResult(item.copy);
                        setPlatform(item.platform);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold transition border border-indigo-500/30"
                    >
                      Buka
                    </button>
                    <button
                      onClick={() => handleCopyText(item.copy)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition border border-slate-700"
                      title="Salin Naskah"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleShareToWhatsApp(item.copy)}
                      className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 transition border border-emerald-500/30"
                      title="Kirim ke WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* In-App TikTok 9:16 Video Motion Generator Modal */}
      <TikTokVideoModal
        isOpen={showTikTokModal}
        onClose={() => setShowTikTokModal(false)}
        scriptText={result}
        productName={product}
        mitraUsername={user?.username || 'mitra01'}
      />
    </div>
  );
}
