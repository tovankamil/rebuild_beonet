import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import ModalPortal from '../common/ModalPortal';
import api from '../../services/api';
import AIImageGeneratorModal from '../ai/AIImageGeneratorModal';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ShieldCheck,
  Award,
  Flame,
  ArrowRight,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Wand2,
  RefreshCw,
  Send,
} from 'lucide-react';

const INITIAL_PROMO_FLYERS = [
  {
    id: 'flyer_propolis',
    category: 'Khasiat Produk',
    title: 'Bio-Propolis Trigona: Solusi Asam Urat & Sendi',
    tag: 'BPOM TR 226012891',
    headline: 'JEMPOL KAKI BENGKAK & ASAM URAT TINGGI?',
    subheadline: 'Redakan Nyeri Sendi & Sehatkan Ginjal dari Akarnya dengan 3 Tetes Alami',
    badge: '100% Herbal Alami',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    accentColor: '#10B981',
    imageUrl: '/marketing/bio_propolis_trigona_poster.jpg',
    copywriting: `🌿 *SOLUSI NYATA ASAM URAT & SENDI KAKU TANPA OBAT KIMIA!* 🌿

Sering merasa jempol kaki cenat-cenut, tumit ngilu tiap bangun pagi, atau asam urat naik setelah makan gurih? 

Jangan tunggu sampai sendi rusak atau ginjal terbebani! 

Kini hadir *Bio-Propolis Trigona Bionet (POM TR 226012891)*:
✅ 100% Propolis lebah Trigona tanpa lilin dan bebas alkohol
✅ Mengandung bioflavonoid dan CAPE konsentrasi tinggi
✅ Bekerja alami meregenerasi sel & meluruhkan tumpukan kristal asam urat
✅ Terbukti dengan ratusan testimoni laboratorium

Dapatkan harga promo resmi dan panduan dosis konsultasi gratis langsung dari saya:
👉 Hubungi WhatsApp: {{wa_link}}
Kode Referral Resmi: {{referral_code}}`,
  },
  {
    id: 'flyer_business',
    category: 'Peluang Bisnis',
    title: 'Formula Bonus Pasangan Rp 1.5 Juta/Hari',
    tag: 'Sistem Binary Juara',
    headline: 'BANGUN PASSIVE INCOME DARI RUMAH',
    subheadline: 'Modal Ringan, Produk Laris BPOM, & Bonus Pasangan Cair Harian!',
    badge: 'Peluang Kemitraan',
    bgGradient: 'from-amber-950 via-stone-950 to-black',
    accentColor: '#F59E0B',
    imageUrl: '/marketing/bionet_binary_business_poster.jpg',
    copywriting: `🚀 *RAHASIA MENGHASILKAN RP 1.5 JUTA/HARI DARI MODAL TERJANGKAU!* 🚀

Bosan dengan bisnis yang ribet dan produk susah dijual? Di *Bionet Herbal Indonesia*, kami memadukan kebutuhan produk kesehatan yang laris manis dengan sistem kemitraan binary yang sangat adil!

Keunggulan Kemitraan Bionet:
💰 Bonus Sponsor & Pasangan Binary cair setiap hari
🎯 Tanpa kewajiban tutup poin yang memberatkan
📱 Disediakan Website Replika, Toko Online & Bahan Promosi Siap Pakai
🏆 Kesempatan raih Reward: Smartwatch, Umroh, Mobilio hingga Pajero Sport!

Yuk amankan posisi Anda di tim percepatan kami hari ini:
📲 Hubungi Saya via WhatsApp: {{wa_link}}
Mitra Pembina: {{partner_name}} (Kode: {{referral_code}})`,
  },
  {
    id: 'flyer_testimoni',
    category: 'Testimoni Nyata',
    title: 'Kisah Kesembuhan Gula Darah & Kolesterol',
    tag: 'Hasil Cek Lab Riil',
    headline: 'DARI GULA DARAH 260 KINI STABIL 130 mg/dL',
    subheadline: 'Kembalikan Stamina & Kebugaran Tubuh Bersama Bionet',
    badge: 'Rekomendasi Medis',
    bgGradient: 'from-cyan-950 via-slate-900 to-black',
    accentColor: '#06B6D4',
    imageUrl: '/marketing/bio_propolis_trigona_poster.jpg',
    copywriting: `📊 *BUKTI BUKAN SEKADAR JANJI: GULA DARAH STABIL KEMBALI!* 📊

Bapak Rudi (48 tahun) sempat mengalami komplikasi gula darah puasa menyentuh 260 mg/dL, badan cepat lemas dan mengantuk. 

Setelah konsumsi rutin *Bio-Herbal Drops & Bio-Propolis Bionet* selama 3 minggu:
✨ Gula darah puasa stabil di angka 130 mg/dL
✨ Bangun pagi lebih segar dan penglihatan kembali jernih
✨ Hasil laboratorium terbukti membaik signifikan

Konsultasikan keluhan kesehatan keluarga Anda sekarang juga:
💬 Chat Konsultasi Ramah: {{wa_link}}
Mitra Resmi: {{partner_name}}`,
  },
  {
    id: 'flyer_promo',
    category: 'Promo Spesial',
    title: 'Paket Hemat Sehat: Subsidi Ongkir Seluruh RI',
    tag: 'Stok Terbatas',
    headline: 'PROMO SPESIAL BULAN INI!',
    subheadline: 'Beli Paket Sehat 2 Botol + Dapatkan Subsidi Ongkir Hingga Rp 30.000',
    badge: 'Promo Terbatas',
    bgGradient: 'from-emerald-950 via-emerald-900 to-teal-950',
    accentColor: '#34D399',
    imageUrl: '/marketing/bionet_binary_business_poster.jpg',
    copywriting: `🎁 *PROMO SPESIAL SEHAT: SUBSIDI GRATIS ONGKIR SELURUH INDONESIA!* 🎁

Kabar gembira untuk Anda dan keluarga! Khusus pemesanan paket kombo kesehatan hari ini:
📦 Beli 2 Botol Bio-Propolis Trigona / Bio-Herbal Drops
🚚 Dapatkan Subsidi Potongan Ongkir hingga Rp 30.000!
🛡️ Garansi 100% Produk Asli Segel BPOM langsung dari distributor resmi.

Jangan lewatkan kesempatan hemat ini, slot subsidi terbatas:
👉 Ambil Kupon Promo via WhatsApp: {{wa_link}}
Kode Promo: {{referral_code}}-HEMAT`,
  },
];

export default function MarketingKitModal({ user, onClose, initialCustomFlyer }) {
  const partnerName = user?.full_name || 'Mitra Bionet Juara';
  const partnerPhone = user?.phone || '';
  const referralCode = user?.username || 'bionet';
  const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');

  const [flyersList, setFlyersList] = useState(INITIAL_PROMO_FLYERS);
  const [selectedFlyerId, setSelectedFlyerId] = useState(INITIAL_PROMO_FLYERS[0].id);
  const [visualMode, setVisualMode] = useState('ai_photo'); // 'ai_photo' | 'graphic'
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // AI Generator Modals state
  const [showAIGenModal, setShowAIGenModal] = useState(false);
  const [showImageGenModal, setShowImageGenModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('berkah');
  const [aiCategory, setAiCategory] = useState('Khasiat Produk');
  const [generateAiImage, setGenerateAiImage] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');

  // Handle incoming flyer from Image Generator
  useEffect(() => {
    if (initialCustomFlyer && initialCustomFlyer.id) {
      setFlyersList((prev) => {
        if (prev.some((f) => f.id === initialCustomFlyer.id)) return prev;
        return [initialCustomFlyer, ...prev];
      });
      setSelectedFlyerId(initialCustomFlyer.id);
      setVisualMode('ai_photo');
    }
  }, [initialCustomFlyer]);
  
  const flyerPreviewRef = useRef(null);

  const currentFlyer = flyersList.find((f) => f.id === selectedFlyerId) || flyersList[0];

  // Prepared Copywriting with Partner Stamp
  const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(partnerName)},%20saya%20tertarik%20dengan%20promo%20Bionet`;
  const preparedCopywriting = currentFlyer.copywriting
    .replace(/{{partner_name}}/g, partnerName)
    .replace(/{{referral_code}}/g, referralCode.toUpperCase())
    .replace(/{{wa_link}}/g, waUrl);

  const handleCopyCopywriting = () => {
    navigator.clipboard.writeText(preparedCopywriting);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleCopyAndOpenWAStory = () => {
    navigator.clipboard.writeText(preparedCopywriting);
    setCopiedText(true);
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(preparedCopywriting)}`;
    window.open(shareUrl, '_blank');
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Generate new Marketing Material with Gemini AI
  const handleGenerateWithGemini = async (e) => {
    e.preventDefault();
    setGeneratingAI(true);
    setGenSuccessMsg('');

    try {
      const topicPrompt = aiTopic.trim() || 'Khasiat Bio-Propolis Trigona untuk asam urat dan kolesterol keluarga';
      const isBusiness = aiCategory === 'Peluang Bisnis' || topicPrompt.toLowerCase().includes('bonus') || topicPrompt.toLowerCase().includes('bisnis');

      // 1. Generate Copywriting via Gemini
      const copyPromise = api.post('/ai/generate-copywriting', {
        channel: 'wa_story',
        tone: aiTone,
        product_name: 'Bio-Propolis Trigona Bionet',
        key_benefits: topicPrompt,
        mitra_name: partnerName,
        whatsapp_number: partnerPhone,
        referral_code: referralCode,
      });

      // 2. If generateAiImage checked, also generate high-res visual via Gemini + FLUX
      let imgPromise = null;
      if (generateAiImage) {
        imgPromise = api.post('/ai/generate-image', {
          prompt: topicPrompt,
          aspect_ratio: '3:4',
          category: aiCategory,
          style: isBusiness ? 'Luxury Glow' : 'Fotorealistik Komersial',
        });
      }

      const [copyRes, imgRes] = await Promise.allSettled([copyPromise, imgPromise]);

      let copyResult = '';
      if (copyRes.status === 'fulfilled') {
        copyResult = copyRes.value.data?.data?.copywriting || copyRes.value.data?.copywriting || '';
      }

      let assignedImage = isBusiness 
        ? '/marketing/bionet_binary_business_poster.jpg' 
        : '/marketing/bio_propolis_trigona_poster.jpg';

      if (imgRes && imgRes.status === 'fulfilled' && imgRes.value?.data?.image_url) {
        assignedImage = imgRes.value.data.image_url;
      }

      const headlineSample = topicPrompt.toUpperCase();

      const newFlyer = {
        id: `flyer_ai_${Date.now()}`,
        category: aiCategory,
        title: `Materi AI: ${topicPrompt.slice(0, 36)}...`,
        tag: 'Dibuat dengan Gemini AI',
        headline: headlineSample.length > 40 ? headlineSample.slice(0, 40) + '?' : headlineSample,
        subheadline: `Solusi Tepat & Praktis Bersama ${partnerName} - Konsultasi Terbuka`,
        badge: 'Dioptimasi Gemini AI',
        bgGradient: isBusiness ? 'from-amber-950 via-stone-950 to-black' : 'from-emerald-950 via-teal-950 to-slate-950',
        accentColor: isBusiness ? '#F59E0B' : '#10B981',
        imageUrl: assignedImage,
        copywriting: copyResult || `🌿 *${headlineSample}* 🌿\n\nIkhtiar sehat keluarga bersama herbal resmi BPOM.\n\n👉 Konsultasi WhatsApp: {{wa_link}}\nKode Referral: {{referral_code}}`,
      };

      setFlyersList([newFlyer, ...flyersList]);
      setSelectedFlyerId(newFlyer.id);
      setVisualMode('ai_photo');
      setGenSuccessMsg('Materi visual & naskah promosi baru berhasil dibuat dengan Gemini!');
      setTimeout(() => {
        setShowAIGenModal(false);
        setGenSuccessMsg('');
      }, 1200);
    } catch (err) {
      console.warn('AI generator fallback:', err);
      // Client-side creative fallback
      const topicPrompt = aiTopic.trim() || 'Khasiat Alami Bio-Propolis Trigona BPOM';
      const isBusiness = aiCategory === 'Peluang Bisnis';
      const newFlyer = {
        id: `flyer_ai_${Date.now()}`,
        category: aiCategory,
        title: `Materi AI: ${topicPrompt.slice(0, 36)}...`,
        tag: 'Dibuat dengan Gemini AI',
        headline: topicPrompt.toUpperCase(),
        subheadline: `Rekomendasi Resmi Bersama ${partnerName} - Teruji Klinis BPOM`,
        badge: 'Dioptimasi Gemini AI',
        bgGradient: isBusiness ? 'from-amber-950 via-stone-950 to-black' : 'from-emerald-950 via-teal-950 to-slate-950',
        accentColor: isBusiness ? '#F59E0B' : '#10B981',
        imageUrl: isBusiness ? '/marketing/bionet_binary_business_poster.jpg' : '/marketing/bio_propolis_trigona_poster.jpg',
        copywriting: `🌿 *${topicPrompt.toUpperCase()}* 🌿\n\nAlhamdulillah hadir solusi sehat alami tanpa ketergantungan obat kimia!\n\n👉 Hubungi Konsultasi WhatsApp: {{wa_link}}\nMitra Resmi: {{partner_name}} (Kode: {{referral_code}})`,
      };
      setFlyersList([newFlyer, ...flyersList]);
      setSelectedFlyerId(newFlyer.id);
      setVisualMode('ai_photo');
      setShowAIGenModal(false);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleDownloadFlyer = async () => {
    if (!flyerPreviewRef.current) return;
    setDownloading(true);

    try {
      // 1. Give browser 180ms to ensure all fonts and image elements are fully stabilized
      await new Promise((resolve) => setTimeout(resolve, 180));

      const element = flyerPreviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.8, // 2.8x high DPI gives ultra-sharp crisp text & photo rendering
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#021510',
        logging: false,
        imageTimeout: 15000,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Flyer_Bionet_${currentFlyer.id}_${referralCode.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture flyer with html2canvas:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Studio Marketing Kit Mitra Bionet
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Stempel Otomatis
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Wand2 size={10} />
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Materi promosi fotorealistik AI resolusi tinggi dengan stempel identitas dan naskah copywriting siap sebar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImageGenModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>Studio Gambar AI</span>
            </button>
            <button
              onClick={() => setShowAIGenModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Wand2 size={14} />
              <span>Buat Materi via Gemini</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
          {/* Left Column: Flyer Selector & Interactive Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Category / Flyer Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Tema Materi Promosi:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageGenModal(true)}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>🎨 Generator Gambar AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAIGenModal(true)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 size={12} />
                    <span>+ Generate Naskah AI</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {flyersList.map((f) => {
                  const isSelected = f.id === selectedFlyerId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFlyerId(f.id)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block truncate">
                        {f.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {f.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Style Mode Toggle: Gemini AI Photo vs Graphic Card */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-600" />
                <span>Mode Latar Belakang Flyer:</span>
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setVisualMode('ai_photo')}
                  className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
                    visualMode === 'ai_photo'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={12} className={visualMode === 'ai_photo' ? 'text-amber-300' : ''} />
                  <span>Visual AI Gemini (Foto HD)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisualMode('graphic')}
                  className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
                    visualMode === 'graphic'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers size={12} />
                  <span>Desain Grafis</span>
                </button>
              </div>
            </div>

            {/* Flyer Live Visual Preview Card */}
            <div
              ref={flyerPreviewRef}
              className={`relative rounded-2xl p-6 text-white shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 min-h-[500px] flex flex-col justify-between ${
                visualMode === 'ai_photo' && currentFlyer.imageUrl
                  ? 'bg-slate-950'
                  : `bg-gradient-to-br ${currentFlyer.bgGradient}`
              }`}
            >
              {/* If AI Photo mode, render full-bleed photorealistic image as real DOM img */}
              {visualMode === 'ai_photo' && currentFlyer.imageUrl && (
                <>
                  <img
                    src={currentFlyer.imageUrl}
                    alt={currentFlyer.title}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021510]/95 via-[#02241b]/80 to-[#023125]/75 pointer-events-none" />
                </>
              )}

              {/* Header inside flyer */}
              <div className="flex items-center justify-between pb-3 border-b border-white/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
                    B
                  </div>
                  <div>
                    <span className="font-black text-xs tracking-tight block drop-shadow-sm">
                      PT BIONET HERBAL INDONESIA
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold drop-shadow-xs">Resmi Terdaftar BPOM RI</span>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 shadow-sm">
                  {currentFlyer.tag}
                </span>
              </div>

              {/* Flyer Center Content */}
              <div className="py-5 space-y-3 relative z-10">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 inline-block uppercase tracking-wider backdrop-blur-sm">
                  {currentFlyer.badge}
                </span>
                <h4 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight leading-snug drop-shadow-md">
                  {currentFlyer.headline}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed drop-shadow-sm">
                  {currentFlyer.subheadline}
                </p>

                {/* Key Points inside flyer */}
                <div className="p-3.5 rounded-xl bg-slate-950/45 backdrop-blur-md border border-white/15 text-xs text-slate-100 space-y-1.5 shadow-inner">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Teruji Klinis & Izin Resmi Edar BPOM RI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Pendampingan Konsultasi Dosis Terbuka</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Garansi 100% Produk Original Segel Pabrik</span>
                  </div>
                </div>
              </div>

              {/* Automatic Partner Stamp (The Gold Highlight) */}
              <div className="mt-2 p-3.5 rounded-xl bg-emerald-950/90 backdrop-blur-md border-2 border-amber-400 shadow-xl flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck size={12} />
                    <span>Stempel Mitra Resmi Terdaftar</span>
                  </span>
                  <p className="font-heading font-black text-sm text-white mt-0.5">
                    {partnerName}
                  </p>
                  <p className="text-xs text-emerald-300 font-medium">
                    WhatsApp: {partnerPhone}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-300 block">Kode Referral</span>
                  <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-xs">
                    {referralCode.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Flyer Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span>Format: 1080 × 1350 px (Instagram & WA Story)</span>
              </span>

              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={downloading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Download size={15} />
                <span>{downloading ? 'Memproses Render HD...' : 'Unduh Gambar Flyer HD (Dengan Stempel)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Ready Copywriting & 1-Click WhatsApp Share (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-4 bg-white flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText size={18} className="text-emerald-600" />
                  <h4 className="font-heading font-black text-sm text-slate-900">
                    Naskah Copywriting Siap Sebar
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Telah Dioptimasi AI
                </span>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={13}
                  value={preparedCopywriting}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed focus:outline-none resize-none selection:bg-emerald-200 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyCopywriting}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 shadow-xs transition"
                  title="Salin Naskah Saja"
                >
                  {copiedText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>💡 Tips Sukses Sebar Promosi:</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Kombinasikan postingan gambar flyer di WhatsApp Story / Instagram dengan menyematkan naskah copywriting di atas. Gunakan tombol di bawah untuk proses 1-klik instan!
                </p>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyAndOpenWAStory}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-700/25 transition active:scale-[0.98]"
              >
                <MessageCircle size={18} />
                <span>1-Klik Salin Naskah & Buka WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCopywriting}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                {copiedText ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Salin Naskah Saja</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gemini AI Custom Generator Modal Backdrop / Popup */}
        {showAIGenModal && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-sm text-slate-900">
                      Studio Generator Gemini AI
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Buat naskah viral & visual flyer baru dalam hitungan detik
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAIGenModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {genSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center text-xs font-bold animate-in fade-in">
                  ✨ {genSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleGenerateWithGemini} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kategori Materi:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Khasiat Produk', 'Peluang Bisnis', 'Testimoni Nyata', 'Promo Spesial'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAiCategory(cat)}
                          className={`p-2 rounded-lg text-xs font-semibold border text-center transition ${
                            aiCategory === cat
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Topik atau Keluhan Spesifik:
                    </label>
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Contoh: Jempol kaki bengkak asam urat, Kolesterol & leher kaku, Modal 250rb"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        'Asam Urat & Sendi',
                        'Kolesterol Tinggi',
                        'Darah Tinggi / Hipertensi',
                        'Bonus Rp 1.5jt/Hari',
                        'Subsidi Ongkir',
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setAiTopic(chip)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 border border-slate-200/80 transition cursor-pointer"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gaya Bahasa (Tone):
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="berkah">Berkah & Empatik (Menyentuh Hati)</option>
                      <option value="medis">Edukasi Medis & Uji Klinis BPOM</option>
                      <option value="hard_selling">Promo Mendesak (Flash Sale)</option>
                      <option value="storytelling">Cerita Nyata / Testimoni</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="checkbox"
                      id="genAiImageCheck"
                      checked={generateAiImage}
                      onChange={(e) => setGenerateAiImage(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer accent-emerald-600"
                    />
                    <label htmlFor="genAiImageCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      🎨 Sekaligus Buat Foto Visual AI Baru (Gemini &amp; FLUX 8K)
                    </label>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAIGenModal(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={generatingAI}
                      className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {generatingAI ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>Memproses Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          <span>Generate Materi AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Standalone AI Image Generator Studio Modal */}
        <AIImageGeneratorModal
          isOpen={showImageGenModal}
          onClose={() => setShowImageGenModal(false)}
          currentUser={user}
          onSelectForMarketing={(newFlyer) => {
            setFlyersList((prev) => [newFlyer, ...prev]);
            setSelectedFlyerId(newFlyer.id);
            setVisualMode('ai_photo');
            setShowImageGenModal(false);
          }}
        />
      </div>
    </ModalPortal>
  );
}
