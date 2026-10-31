import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Download,
  Image as ImageIcon,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Share2,
  ExternalLink,
  ChevronDown,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import api from '../../services/api';

const PRESETS = [
  {
    id: 'propolis_luxury',
    title: '🍯 Bio-Propolis Trigona Luxury',
    category: 'Produk Herbal',
    prompt: 'Botol kaca penetes Bio-Propolis Trigona mewah di atas sarang lebah keemasan dengan tetesan madu murni kental dan pencahayaan studio komersial',
    style: 'Luxury Glow',
    ratio: '3:4',
    previewUrl: '/marketing/bio_propolis_trigona_poster.jpg',
  },
  {
    id: 'herbal_drops_dew',
    title: '🌿 Bio-Herbal Drops Segar',
    category: 'Produk Herbal',
    prompt: 'Botol tetes herbal Bionet di tengah dedaunan mint segar dan daun kelor tropis dengan bulir-bulir embun jernih, pencahayaan alami pagi hari',
    style: 'Fotorealistik Komersial',
    ratio: '3:4',
    previewUrl: '/marketing/bio_herbal_drops_poster.jpg',
  },
  {
    id: 'business_leader',
    title: '💼 Wirausaha Sukses Bionet',
    category: 'Peluang Bisnis',
    prompt: 'Pebisnis muda Indonesia pria/wanita tersenyum percaya diri di kantor modern minimalis, memegang paket produk herbal Bionet, aura kesuksesan',
    style: 'Fotorealistik Komersial',
    ratio: '3:4',
    previewUrl: '/marketing/bionet_binary_business_poster.jpg',
  },
  {
    id: 'trigona_farm',
    title: '🐝 Panen Lebah Trigona Asri',
    category: 'Kebun Trigona Organik',
    prompt: 'Peternakan lebah klanceng Trigona alami di hutan tropis asri Nusantara, kayu lebah tradisional dengan madu murni menetes keemasan',
    style: 'Dokumenter Alami',
    ratio: '3:4',
    previewUrl: '/marketing/bio_propolis_trigona_poster.jpg',
  },
  {
    id: 'healthy_family',
    title: '👨‍👩‍👧‍👦 Keluarga Sehat & Lansia Bugar',
    category: 'Testimoni & Gaya Hidup',
    prompt: 'Keluarga bahagia Indonesia dengan kakek nenek yang tampak bugar dan ceria tertawa di teras taman asri, suasana hangat penuh syukur',
    style: 'Fotorealistik Komersial',
    ratio: '3:4',
    previewUrl: '/marketing/bionet_binary_business_poster.jpg',
  },
  {
    id: 'science_lab',
    title: '🔬 Ekstraksi Sains & BPOM',
    category: 'Laboratorium & Medis',
    prompt: 'Peralatan ekstraksi herbal laboratorium fitofarmaka modern berstandar CPOTB dengan tabung kaca kristal, daun herbal dan tetesan ekstrak murni',
    style: 'Sains & Biotech',
    ratio: '3:4',
    previewUrl: '/marketing/bionet_biotech_poster.jpg',
  },
];

const ASPECT_RATIOS = [
  { id: '3:4', label: '3:4 (Flyer & Story WA)', desc: '1080 × 1350 px', icon: '📱' },
  { id: '1:1', label: '1:1 (Feed Persegi)', desc: '1080 × 1080 px', icon: '⬜' },
  { id: '16:9', label: '16:9 (Banner Landscape)', desc: '1920 × 1080 px', icon: '🖥️' },
  { id: '9:16', label: '9:16 (Reels & TikTok Full)', desc: '1080 × 1920 px', icon: '📲' },
];

const CATEGORIES = [
  'Produk Herbal',
  'Peluang Bisnis',
  'Laboratorium & Medis',
  'Testimoni & Gaya Hidup',
  'Kebun Trigona Organik',
];

const STYLES = [
  'Fotorealistik Komersial',
  'Luxury Glow',
  'Sains & Biotech',
  'Dokumenter Alami',
];

const INITIAL_GALLERY = [
  {
    imageUrl: '/marketing/bio_propolis_trigona_poster.jpg',
    prompt: 'Botol kaca Bio-Propolis Trigona dengan sarang lebah emas dan tetesan madu kristal',
    category: 'Produk Herbal',
    aspectRatio: '3:4',
  },
  {
    imageUrl: '/marketing/bionet_biotech_poster.jpg',
    prompt: 'Peralatan ekstraksi laboratorium fitofarmaka modern berstandar CPOTB dan tabung kaca kristal',
    category: 'Laboratorium & Medis',
    aspectRatio: '3:4',
  },
  {
    imageUrl: '/marketing/bio_herbal_drops_poster.jpg',
    prompt: 'Botol tetes Bio-Herbal Drops di tengah dedaunan mint segar dan embun pagi',
    category: 'Produk Herbal',
    aspectRatio: '3:4',
  },
  {
    imageUrl: '/marketing/bionet_binary_business_poster.jpg',
    prompt: 'Peluang Kemitraan Bisnis Bionet Binary, passive income, kesuksesan modern',
    category: 'Peluang Bisnis',
    aspectRatio: '3:4',
  },
];

export default function AIImageGeneratorModal({ isOpen, onClose, currentUser, onSelectForMarketing }) {
  const [prompt, setPrompt] = useState(PRESETS[0].prompt);
  const [aspectRatio, setAspectRatio] = useState('3:4');
  const [category, setCategory] = useState(PRESETS[0].category);
  const [style, setStyle] = useState(PRESETS[0].style);
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState('');
  const [generatedResult, setGeneratedResult] = useState(INITIAL_GALLERY[0]);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEnhancedPrompt, setShowEnhancedPrompt] = useState(false);

  // Load saved generations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bionet_ai_generated_images');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGallery((prev) => {
            const merged = [...parsed, ...prev.filter((p) => !parsed.some((x) => x.imageUrl === p.imageUrl))];
            return merged.slice(0, 12);
          });
          setGeneratedResult(parsed[0]);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleApplyPreset = (preset) => {
    setPrompt(preset.prompt);
    setCategory(preset.category);
    setStyle(preset.style);
    setAspectRatio(preset.ratio);
    if (preset.previewUrl) {
      setGeneratedResult({
        imageUrl: preset.previewUrl,
        prompt: preset.prompt,
        category: preset.category,
        aspectRatio: preset.ratio,
        enhancedPrompt: preset.prompt,
        createdAt: 'Preset Desain Studio',
      });
    }
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setLoadingStep(1);

    // Simulate smart progressive steps while request is in flight
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 1200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 3200);

    try {
      const res = await api.post('/ai/generate-image', {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        category: category,
        style: style,
      });

      if (res.data?.image_url) {
        const newImg = {
          imageUrl: res.data.image_url,
          prompt: prompt.trim(),
          enhancedPrompt: res.data.enhanced_prompt || '',
          category: category,
          aspectRatio: aspectRatio,
          width: res.data.width,
          height: res.data.height,
          createdAt: new Date().toLocaleTimeString('id-ID'),
        };

        setGeneratedResult(newImg);
        setGallery((prev) => {
          const updated = [newImg, ...prev.filter((p) => p.imageUrl !== newImg.imageUrl)].slice(0, 12);
          try {
            localStorage.setItem('bionet_ai_generated_images', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      } else {
        throw new Error('URL gambar tidak diterima dari server');
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      setError(err.response?.data?.message || err.message || 'Gagal menghasilkan gambar AI. Silakan coba kembali.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep(1);
    }
  };

  const handleDownloadRawImage = async () => {
    if (!generatedResult?.imageUrl) return;
    try {
      const link = document.createElement('a');
      link.href = generatedResult.imageUrl;
      link.download = `Bionet_AI_${Date.now()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyLink = () => {
    if (!generatedResult?.imageUrl) return;
    const fullUrl = window.location.origin + generatedResult.imageUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApplyToMarketingKit = () => {
    if (!generatedResult?.imageUrl) return;
    
    const customFlyer = {
      id: `flyer_custom_${Date.now()}`,
      category: category,
      title: prompt.slice(0, 36) + '...',
      tag: 'Kreasi Studio AI Bionet',
      headline: prompt.toUpperCase().slice(0, 48),
      subheadline: `Solusi Sehat & Sukses Bersama Mitra Resmi Bionet`,
      badge: 'Visual 8K Gemini + FLUX',
      bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
      accentColor: '#10B981',
      imageUrl: generatedResult.imageUrl,
      copywriting: `🌿 *${prompt.toUpperCase()}* 🌿\n\nHadirkan kebaikan alami herbal berstandar BPOM untuk kesehatan optimal keluarga.\n\n👉 Konsultasi & Pemesanan:\nWhatsApp: {{wa_link}}\nMitra Resmi: {{partner_name}} (Kode: {{referral_code}})`,
    };

    if (onSelectForMarketing) {
      onSelectForMarketing(customFlyer);
    } else {
      window.dispatchEvent(
        new CustomEvent('bionet:open-marketing-kit', {
          detail: { customFlyer },
        })
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col h-[92vh] max-h-[880px] font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-emerald-900/40">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/20">
                <Sparkles size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-heading font-black text-base sm:text-lg text-white tracking-tight">
                    Studio Generator Gambar AI
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Flame size={11} />
                    <span>Gemini + FLUX 8K</span>
                  </span>
                </div>
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Render visual produk komersial, promosi herbal &amp; materi kemitraan fotorealistik dalam hitungan detik
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: 2 Columns with min-h-0 and independent smooth scrolling */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 bg-slate-50 overflow-hidden">
            {/* Left Column: Form Controls (7 cols) - Independent Scroll */}
            <div className="lg:col-span-7 p-5 sm:p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white overflow-y-auto">
              {/* Inspiration Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 size={13} className="text-amber-500" />
                    <span>Pilih Inspirasi Visual (1-Klik):</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Preset Siap Pakai</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/50 text-left transition group active:scale-[0.98]"
                    >
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-1">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {p.category}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deskripsi / Prompt Gambar AI:
                  </label>
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tuliskan ide gambar... contoh: Botol Bio-Propolis Trigona mewah di atas batu marmer hitam dengan tetesan madu dan pencahayaan studio komersial"
                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs leading-relaxed font-sans resize-none shadow-inner selection:bg-emerald-200 selection:text-slate-900"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      caretColor: '#059669',
                    }}
                  />
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>*Bisa menggunakan Bahasa Indonesia (Gemini otomatis menerjemahkan &amp; memperkaya kualitas 8K)</span>
                    <span className="font-mono text-[10px]">{prompt.length} karakter</span>
                  </div>
                </div>

                {/* Aspect Ratio & Style */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Rasio Ukuran Gambar:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ASPECT_RATIOS.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setAspectRatio(r.id)}
                          className={`p-2 rounded-xl text-left border text-xs transition ${
                            aspectRatio === r.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-[11px] font-bold truncate">
                            {r.icon} {r.id}
                          </span>
                          <span className="block text-[9px] text-slate-500 truncate">
                            {r.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Gaya Visual Estetika:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {STYLES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStyle(s)}
                          className={`p-2 rounded-xl text-center border text-[11px] font-semibold transition truncate ${
                            style === s
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kategori Tema:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          category === cat
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center space-x-2 transition disabled:opacity-50 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={17} className="animate-spin" />
                      <span>
                        {loadingStep === 1 && '1/3: Gemini AI Mengoptimalkan Prompt 8K...'}
                        {loadingStep === 2 && '2/3: FLUX.1 Engine Me-render Visual Komersial...'}
                        {loadingStep === 3 && '3/3: Mengunduh & Menyimpan ke Server...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} className="text-amber-300" />
                      <span>Generate Gambar AI Sekarang</span>
                    </>
                  )}
                </button>
              </form>

              {/* History Gallery */}
              <div className="pt-2 pb-8 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Galeri Visual Hasil Generate Terbaru:
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin">
                  {gallery.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGeneratedResult(item)}
                      className={`relative w-18 h-22 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        generatedResult?.imageUrl === item.imageUrl
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                          : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview & 1-Click Marketing Kit Action (5 cols) - Independent Scroll */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-900 text-white flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon size={18} className="text-amber-400" />
                    <h4 className="font-heading font-black text-sm text-white">
                      Pratinjau Hasil Gambar AI
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Resolusi Tinggi (HD)
                  </span>
                </div>

                {/* Main Preview Container */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-xl flex items-center justify-center min-h-[220px] max-h-[280px] sm:max-h-[310px]">
                  {loading ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="font-bold text-xs sm:text-sm text-white">
                          Sedang Memproses Gambar AI...
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Gemini AI menyusun pencahayaan &amp; tekstur fotografi, kemudian mesin FLUX.1 merender piksel ultra tajam.
                        </p>
                      </div>
                    </div>
                  ) : generatedResult?.imageUrl ? (
                    <div className="relative w-full h-full group flex items-center justify-center bg-black">
                      <img
                        src={generatedResult.imageUrl}
                        alt="AI Generation"
                        className="w-full h-auto max-h-[280px] sm:max-h-[310px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-white/10">
                        {generatedResult.aspectRatio || '3:4'} • FLUX.1 HD
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 p-6 space-y-2">
                      <ImageIcon size={32} className="mx-auto opacity-50" />
                      <p className="text-xs">Belum ada gambar yang dipilih</p>
                    </div>
                  )}
                </div>

                {/* Gemini AI Enhanced Prompt Accordion */}
                {generatedResult?.enhancedPrompt && (
                  <div className="rounded-xl bg-slate-800/80 border border-white/10 p-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowEnhancedPrompt(!showEnhancedPrompt)}
                      className="w-full flex items-center justify-between text-left font-bold text-slate-300 hover:text-white"
                    >
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <Sparkles size={12} className="text-amber-400" />
                        <span>Prompt yang Diperkaya Gemini Art Director</span>
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${showEnhancedPrompt ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showEnhancedPrompt && (
                      <p className="text-[11px] text-slate-300 mt-2 font-mono leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 select-all">
                        {generatedResult.enhancedPrompt}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={handleApplyToMarketingKit}
                  disabled={loading || !generatedResult?.imageUrl}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.98] cursor-pointer"
                >
                  <ShieldCheck size={18} />
                  <span>Jadikan Background Flyer Marketing Kit (Beri Stempel)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadRawImage}
                    disabled={loading || !generatedResult?.imageUrl}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Unduh Gambar Mentah</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={loading || !generatedResult?.imageUrl}
                    className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-emerald-300">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

