import React, { useState, useRef } from 'react';
import ModalPortal from '../common/ModalPortal';
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
} from 'lucide-react';

const PROMO_FLYERS = [
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

export default function MarketingKitModal({ user, onClose }) {
  const partnerName = user?.full_name || 'Mitra Bionet Juara';
  const partnerPhone = user?.phone || '6281234567890';
  const referralCode = user?.username || 'mitra01';
  const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');

  const [selectedFlyerId, setSelectedFlyerId] = useState(PROMO_FLYERS[0].id);
  const [copiedText, setCopiedText] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const flyerPreviewRef = useRef(null);

  const currentFlyer = PROMO_FLYERS.find((f) => f.id === selectedFlyerId) || PROMO_FLYERS[0];

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
    // WhatsApp direct link or story share prompt
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(preparedCopywriting)}`;
    window.open(shareUrl, '_blank');
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownloadFlyer = () => {
    setDownloading(true);
    // Generate high resolution canvas flyer with partner stamp
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // Instagram Portrait 4:5
    const ctx = canvas.getContext('2d');

    // 1. Dark Luxurious Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#022C22');
    bgGrad.addColorStop(0.5, '#064E3B');
    bgGrad.addColorStop(1, '#021A15');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Decorative circle glows
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.arc(900, 250, 400, 0, Math.PI * 2);
    ctx.fill();

    // 2. Official Brand Bar at Top
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.roundRect(60, 60, 960, 100, 20);
    ctx.fill();

    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('PT BIONET HERBAL INDONESIA', 100, 122);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('RESMI & BERIZIN BPOM RI', 980, 120);
    ctx.textAlign = 'left';

    // 3. Category Tag
    ctx.fillStyle = '#F59E0B';
    ctx.roundRect(60, 200, 320, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(currentFlyer.category.toUpperCase(), 85, 233);

    // 4. Headline
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px sans-serif';
    const words = currentFlyer.headline.split(' ');
    let line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
    let line2 = words.slice(Math.ceil(words.length / 2)).join(' ');
    ctx.fillText(line1, 60, 320);
    if (line2) ctx.fillText(line2, 60, 385);

    // 5. Subheadline
    ctx.fillStyle = '#A7F3D0';
    ctx.font = '500 28px sans-serif';
    ctx.fillText(currentFlyer.subheadline, 60, 460);

    // 6. Central Illustration / Graphic Box
    ctx.fillStyle = 'rgba(6, 78, 59, 0.5)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.lineWidth = 4;
    ctx.roundRect(60, 520, 960, 460, 24);
    ctx.fill();
    ctx.stroke();

    // Box Inner Text
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(currentFlyer.title, 110, 620);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '28px sans-serif';
    ctx.fillText('• 100% Herbal Alami Berkhasiat Tinggi', 110, 710);
    ctx.fillText('• Bersertifikat BPOM RI & Halal MUI Indonesia', 110, 770);
    ctx.fillText('• Dipercaya Ribuan Keluarga di Seluruh Nusantara', 110, 830);
    ctx.fillText('• Konsultasi Kesehatan Terbuka & Ramah', 110, 890);

    // 7. PARTNER AUTOMATIC STAMP (AT BOTTOM)
    ctx.fillStyle = '#042F24';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.roundRect(60, 1020, 960, 260, 24);
    ctx.fill();
    ctx.stroke();

    // Gold verified seal in stamp
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('★ KONSULTAN & MITRA DISTRIBUSI RESMI BIONET ★', 100, 1070);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 38px sans-serif';
    ctx.fillText(partnerName, 100, 1130);

    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`WhatsApp: ${partnerPhone}`, 100, 1180);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`ID Mitra / Referral: ${referralCode.toUpperCase()}`, 100, 1230);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#A7F3D0';
    ctx.font = '22px sans-serif';
    ctx.fillText('Scan / Hubungi Sekarang', 970, 1200);
    ctx.fillText('bionet.id', 970, 1235);
    ctx.textAlign = 'left';

    // Trigger download
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `Flyer_Bionet_${currentFlyer.id}_${referralCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloading(false);
    }, 500);
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
              </div>
              <p className="text-xs text-emerald-200/80">
                Materi promosi harian resolusi tinggi dengan stempel identitas dan naskah copywriting siap sebar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
          {/* Left Column: Flyer Selector & Interactive Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-slate-200">
            {/* Category / Flyer Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                Pilih Tema Materi Promosi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROMO_FLYERS.map((f) => {
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

            {/* Flyer Live Visual Preview Card */}
            <div
              ref={flyerPreviewRef}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${currentFlyer.bgGradient} text-white shadow-xl border border-white/10 overflow-hidden`}
            >
              {/* Header inside flyer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                    B
                  </div>
                  <div>
                    <span className="font-black text-xs tracking-tight block">
                      PT BIONET HERBAL INDONESIA
                    </span>
                    <span className="text-[10px] text-emerald-300">Resmi Terdaftar BPOM RI</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {currentFlyer.tag}
                </span>
              </div>

              {/* Flyer Center Content */}
              <div className="py-6 space-y-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-block uppercase tracking-wider">
                  {currentFlyer.badge}
                </span>
                <h4 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight leading-snug">
                  {currentFlyer.headline}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                  {currentFlyer.subheadline}
                </p>

                {/* Key Points inside flyer */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 space-y-1.5">
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
              <div className="mt-2 p-3.5 rounded-xl bg-emerald-950/80 border-2 border-amber-400/80 shadow-lg flex items-center justify-between">
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
                  <span className="text-[10px] text-slate-400 block">Kode Referral</span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-xs font-mono">
                    {referralCode.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Flyer Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Format: 1080 × 1350 px (Instagram & WA Story)
              </span>

              <button
                type="button"
                onClick={handleDownloadFlyer}
                disabled={downloading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition disabled:opacity-50"
              >
                <Download size={15} />
                <span>{downloading ? 'Memproses HD...' : 'Unduh Gambar Flyer HD'}</span>
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
      </div>
    </ModalPortal>
  );
}
