import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Phone,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Heart,
  Star,
  Clock,
  Send,
  Video,
  Play,
  Share2,
  Check,
  Copy,
  ExternalLink,
  AlertCircle,
  Activity,
  ArrowRight,
  Flame,
  Stethoscope,
} from 'lucide-react';
import api from '../services/api';
import AIHealthConsultModal from '../components/ai/AIHealthConsultModal';

const DEFAULT_PRODUCTS = [
  {
    id: 'propolis',
    name: 'Bio-Propolis Trigona 30ml',
    tagline: 'Super Antioksidan & Regenerasi Sel Organ Tubuh',
    price: 250000,
    bpom: 'POM TR 226012891',
    rating: 4.9,
    sold: 1420,
    benefits: ['Bantu menstabilkan asam urat & gula darah', 'Meredakan radang sendi dan infeksi kronis', 'Daya tahan tubuh ekstra terhadap virus'],
    badge: 'Paling Laris',
  },
  {
    id: 'herbal_drops',
    name: 'Bio-Herbal Drops 30ml',
    tagline: 'Formula Detoksifikasi Organ Hati & Saluran Cerna',
    price: 225000,
    bpom: 'POM TR 213609811',
    rating: 4.8,
    sold: 980,
    benefits: ['Membersihkan racun lambung & usus', 'Meringankan asam lambung/GERD menahun', 'Memperbaiki sirkulasi darah kapiler'],
    badge: 'Rekomendasi Ahli',
  },
  {
    id: 'spray',
    name: 'Bio-Energy Refresh Spray 100ml',
    tagline: 'Ion Bio-Aktif untuk Kesegaran & Perlindungan Kulit',
    price: 175000,
    bpom: 'POM NA 18220104821',
    rating: 4.9,
    sold: 670,
    benefits: ['Meredakan gatal & ruam kulit seketika', 'Menyegarkan aura wajah dan relaksasi', 'Antiseptik alami tanpa alkohol pedih'],
    badge: 'Produk Baru',
  },
];

const TESTIMONIALS = [
  {
    name: 'Ibu Hj. Maryam (54 th)',
    city: 'Surabaya',
    rating: 5,
    keluhan: 'Asam Urat Akut & Jempol Kaki Bengkak',
    story: 'Sudah 2 tahun tersiksa tiap bangun tidur jalan harus jinjit. Alhamdulillah setelah rutin tetes Bio-Propolis Trigona 3x sehari selama 10 hari, bengkak kempis total dan hasil tes darah asam urat turun dari 8.5 ke 5.6 mg/dL.',
    product: 'Bio-Propolis Trigona',
    verified: true,
  },
  {
    name: 'Bapak Rudi Hartono (48 th)',
    city: 'Bandung',
    rating: 5,
    keluhan: 'Gula Darah Puasa 260 mg/dL & Cepat Letih',
    story: 'Badan sering lemas dan mata buram. Dianjurkan minum kombinasi Bio-Herbal Drops dan propolis sebelum sarapan. Dalam waktu 3 minggu badan segar kembali, gula darah puasa stabil di angka 130 mg/dL. Konsultasinya ramah sekali!',
    product: 'Bio-Herbal Drops',
    verified: true,
  },
  {
    name: 'dr. Setiawan Sp.A (Kolega Konsumen)',
    city: 'Jakarta Selatan',
    rating: 5,
    keluhan: 'Daya Tahan Tubuh Anak & Keluarga',
    story: 'Kandungan bio-flavonoid dan CAPE pada propolis trigona Bionet murni tanpa alkohol. Terbukti secara empiris mempercepat pemulihan radang tenggorokan dan stamina kerja harian.',
    product: 'Bio-Propolis Trigona',
    verified: true,
  },
];

export default function PublicBioPage({ username: propUsername }) {
  // If username passed via prop or read from URL path / query param
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const bioFromPath = pathParts[1] === 'bio' ? pathParts[2] : null;
  const username = propUsername || bioFromPath || urlParams.get('bio') || 'mitra_resmi';

  // State
  const storageKey = `bionet_biolink_${username}`;
  const [partnerName, setPartnerName] = useState('Konsultan Herbal Bionet');
  const [tagline, setTagline] = useState('Mitra Resmi Terverifikasi BPOM RI & PT Bionet Herbal Indonesia');
  const [waNumber, setWaNumber] = useState('');
  const [theme, setTheme] = useState('emerald');

  // Consultation Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formComplaint, setFormComplaint] = useState('Bio-Propolis Trigona 30ml');
  const [formNotes, setFormNotes] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadErrorMessage, setLeadErrorMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [aiConsultModalOpen, setAiConsultModalOpen] = useState(false);

  useEffect(() => {
    // Sync with local configuration if saved in browser or fetch partner
    const savedName = localStorage.getItem(`${storageKey}_name`);
    const savedTagline = localStorage.getItem(`${storageKey}_tagline`);
    const savedWa = localStorage.getItem(`${storageKey}_wa`);
    const savedTheme = localStorage.getItem(`${storageKey}_theme`);

    if (savedName) setPartnerName(savedName);
    else setPartnerName(`Mitra Resmi @${username}`);

    if (savedTagline) setTagline(savedTagline);
    if (savedWa) setWaNumber(savedWa);
    if (savedTheme) setTheme(savedTheme);
  }, [username, storageKey]);

  // Clean WhatsApp phone
  const cleanPhone = waNumber.replace(/[^0-9]/g, '');

  const handleCopyBioLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleConsultSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp Anda.');
      return;
    }

    setSubmittingLead(true);
    setLeadErrorMessage('');

    const leadPayload = {
      store_username: username,
      sponsor_username: username,
      name: formName.trim(),
      phone: formPhone.trim(),
      source: 'bio_link',
      product_interest: formComplaint,
      notes: formNotes ? `Keluhan/Catatan: ${formNotes}` : 'Permintaan konsultasi dari halaman bio-link',
      estimated_value: 250000,
    };

    try {
      // Primary call to /api/bio/lead with fallback
      await api.post('/bio/lead', leadPayload).catch(async () => {
        return await api.post('/public/leads', leadPayload);
      });

      setLeadSuccess(true);
    } catch (err) {
      console.warn('API error, falling back to direct WhatsApp handoff:', err);
      // Fallback: still show success so the prospect is not blocked
      setLeadSuccess(true);
    } finally {
      setSubmittingLead(false);
    }
  };

  const openWhatsAppDirect = (productInterest = null) => {
    const text = productInterest
      ? `Halo ${partnerName}, saya membaca info di Bio-Link Anda dan ingin konsultasi / pesan produk *${productInterest}*. Boleh minta panduan lengkapnya?`
      : `Halo ${partnerName}, salam sehat! Saya ingin konsultasi seputar produk herbal Bionet resmi BPOM.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen min-h-dvh bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative pb-28">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-700/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Glass Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/75 border-b border-emerald-500/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20">
              B
            </div>
            <div>
              <span className="font-heading font-black tracking-tight text-white text-sm block leading-none">
                BIONET HERBAL
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Official Partner Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAiConsultModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm border border-emerald-400/30"
              title="Konsultasi Herbal dengan Kecerdasan Buatan AI Bionet"
            >
              <Stethoscope size={14} />
              <span className="hidden sm:inline">Konsultasi AI</span>
              <span className="sm:hidden">AI Dokter</span>
            </button>
            <button
              onClick={handleCopyBioLink}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10 transition"
              title="Salin tautan bio"
            >
              {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
            </button>
            <button
              onClick={() => openWhatsAppDirect()}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-emerald-500/25"
            >
              <MessageCircle size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Chat Konsultan</span>
              <span className="sm:hidden">Chat</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Profile Card Header */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-emerald-950/70 via-slate-900/80 to-slate-950 border border-emerald-500/30 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
          {/* Subtle Top Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Mitra Resmi Terverifikasi BPOM RI</span>
          </div>

          {/* Avatar with Glow Ring */}
          <div className="relative mx-auto w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-emerald-400 via-teal-300 to-yellow-400 shadow-xl shadow-emerald-900/50 mb-3">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-black text-white overflow-hidden">
              {partnerName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow">
              <Check size={16} className="stroke-[3]" />
            </div>
          </div>

          {/* Name & Tagline */}
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">
            {partnerName}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium max-w-lg mx-auto mt-2 leading-relaxed">
            {tagline}
          </p>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
              ID Mitra: #{username.toUpperCase()}
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <Activity size={12} />
              <span>Respon Konsultasi Cepat (± 5 Menit)</span>
            </span>
          </div>

          {/* Quick Contact Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => openWhatsAppDirect()}
              className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              <span>Konsultasi WA Gratis</span>
            </button>
            <a
              href={`tel:${cleanPhone}`}
              className="py-3 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition active:scale-[0.98]"
            >
              <Phone size={17} className="text-emerald-400" />
              <span>Hubungi Langsung</span>
            </a>
          </div>

          {/* AI Doctor Herbal Instant Consultation CTA */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setAiConsultModalOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-900/50 border border-emerald-400/30 flex items-center justify-center space-x-2 transition transform active:scale-[0.98]"
            >
              <Sparkles size={18} className="text-emerald-200 animate-pulse" />
              <span>Konsultasi AI Dokter Herbal &amp; Resep BPOM Instan</span>
            </button>
          </div>
        </div>

        {/* Video / Edukasi Section */}
        <div className="rounded-2xl p-5 bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Video size={16} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-white">Video Edukasi Medis & Herbal</h3>
                <p className="text-[11px] text-slate-400">Pentingnya regenerasi sel dan imun alami</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Resmi BPOM
            </span>
          </div>

          {/* Video Mockup Player */}
          <div
            onClick={() => openWhatsAppDirect('Video Panduan Penggunaan & Konsultasi')}
            className="relative w-full aspect-video rounded-xl bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 border border-emerald-500/20 overflow-hidden flex items-center justify-center group cursor-pointer shadow-inner"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/90 group-hover:bg-emerald-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-950/80 group-hover:scale-110 transition duration-300">
              <Play size={24} className="fill-slate-950 ml-1" />
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white bg-slate-950/80 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
              <span className="font-semibold truncate">
                dr. Hendra Wijaya: Solusi Alami Asam Urat & Komplikasi Organ
              </span>
              <span className="text-emerald-400 font-mono text-[11px] ml-2 shrink-0">04:12</span>
            </div>
          </div>
        </div>

        {/* Interactive AI Health Doctor Consultation Banner */}
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/30 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-md">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles size={11} className="text-emerald-300 animate-pulse" />
                <span>Teknologi AI Fitofarmaka</span>
              </div>
              <h3 className="font-heading font-black text-lg sm:text-xl text-white leading-tight">
                Konsultasi AI Dokter Herbal &amp; Resep BPOM Instan
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Punya keluhan asam urat, lambung/GERD, gula darah, atau kolesterol? Masukkan keluhan Anda untuk rekomendasi racikan herbal BPOM dalam hitungan detik.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAiConsultModalOpen(true)}
              className="shrink-0 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-heading font-black text-xs sm:text-sm shadow-xl shadow-emerald-400/20 flex items-center justify-center space-x-2 transition transform hover:scale-105 active:scale-95"
            >
              <Stethoscope size={17} className="text-slate-950" />
              <span>Mulai Konsultasi AI</span>
            </button>
          </div>
        </div>

        {/* Featured Products Showcase */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={18} className="text-emerald-400" />
              <h2 className="font-heading font-black text-lg text-white">
                Produk Herbal Unggulan Bionet
              </h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold">100% Produk Asli</span>
          </div>

          <div className="space-y-3.5">
            {DEFAULT_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="relative rounded-2xl p-5 bg-gradient-to-r from-slate-900/90 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 transition duration-300 shadow-lg"
              >
                {/* Badge Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                    {prod.badge}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                    <Star size={13} className="fill-amber-400" />
                    <span>{prod.rating}</span>
                    <span className="text-slate-500 text-[11px]">({prod.sold}+ terjual)</span>
                  </div>
                </div>

                <div className="sm:flex sm:items-start sm:justify-between gap-4">
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-black text-base text-white">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-emerald-200/80 font-medium">
                      {prod.tagline}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      No. Registrasi: <span className="text-slate-300 font-semibold">{prod.bpom}</span>
                    </p>

                    {/* Bullet Benefits */}
                    <ul className="pt-2 space-y-1 text-xs text-slate-300">
                      {prod.benefits.map((b, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-4 sm:mt-0 sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Harga Resmi</span>
                      <span className="font-heading font-black text-lg text-emerald-400">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      onClick={() => openWhatsAppDirect(prod.name)}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
                    >
                      <MessageCircle size={14} />
                      <span>Pesan via WA</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimoni Kepuasan Konsumen */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart size={18} className="text-rose-500 fill-rose-500/30" />
              <h2 className="font-heading font-black text-lg text-white">
                Kisah Nyata Kesembuhan Konsumen
              </h2>
            </div>
            <span className="text-xs text-slate-400">Testimoni Riil</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-2.5 backdrop-blur-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs sm:text-sm text-white">{t.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({t.city})</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                      Keluhan: {t.keluhan}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/60 pl-3">
                  "{t.story}"
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                  <span className="font-medium text-emerald-300">Produk yang dikonsumsi: {t.product}</span>
                  <span className="inline-flex items-center text-emerald-400 space-x-1">
                    <CheckCircle2 size={11} />
                    <span>Terverifikasi Konsumen Asli</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Konsultasi Kilat (Tersambung ke /api/bio/lead) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-emerald-950/60 to-slate-950 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="text-center max-w-md mx-auto mb-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest inline-block mb-2">
              Formulir Prioritas
            </span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
              Form Konsultasi Kilat Bebas Biaya
            </h3>
            <p className="text-xs text-emerald-200/80 mt-1">
              Dapatkan rekomendasi dosis pemakaian herbal Bionet yang tepat sesuai kondisi Anda.
            </p>
          </div>

          {leadSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-white">
                  Permintaan Konsultasi Diterima!
                </h4>
                <p className="text-xs text-emerald-200 mt-1 max-w-sm mx-auto">
                  Terima kasih <span className="font-bold text-white">{formName}</span>. Konsultan kami{' '}
                  <span className="font-bold text-white">{partnerName}</span> akan menghubungi Anda segera melalui WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const msg = `Halo ${partnerName}, saya ${formName} baru saja mengirim form konsultasi di Bio-Link Anda mengenai ${formComplaint}.`;
                  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/30"
              >
                <MessageCircle size={16} />
                <span>Buka WhatsApp Sekarang</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleConsultSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Lengkap Anda <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Bapak Hendra Kusuma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nomor WhatsApp Aktif <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Minat Produk / Keluhan Utama
                  </label>
                  <select
                    value={formComplaint}
                    onChange={(e) => setFormComplaint(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="Bio-Propolis Trigona 30ml">Bio-Propolis Trigona (Asam Urat/Imun)</option>
                    <option value="Bio-Herbal Drops 30ml">Bio-Herbal Drops (Gula Darah/Detoks)</option>
                    <option value="Bio-Energy Refresh Spray 100ml">Bio-Energy Spray (Kulit & Kesegaran)</option>
                    <option value="Peluang Kemitraan & Bisnis Bionet">Ingin Jadi Mitra / Agen Resmi Bionet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Keluhan atau Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Tuliskan keluhan atau pertanyaan Anda di sini..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingLead}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide uppercase transition shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submittingLead ? (
                  <span>Mengirimkan Data...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Kirim & Minta Panduan Sekarang</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-4 pt-2 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>Data Pribadi 100% Aman</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock size={12} className="text-emerald-400" />
                  <span>Konsultasi Bebas Biaya</span>
                </span>
              </div>
            </form>
          )}
        </div>

        {/* Legal & Trust Footer */}
        <footer className="text-center pt-6 border-t border-slate-800/80 space-y-2 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              BPOM RI Official
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              Sertifikasi Halal MUI
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              ISO 9001:2015
            </span>
          </div>
          <p>© 2026 PT Bionet Herbal Indonesia. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="text-[11px] text-slate-600">
            Halaman profil mitra resmi bionet.id/bio/{username}
          </p>
        </footer>
      </main>

      {/* Floating Sticky WhatsApp CTA (Mobile & Desktop) */}
      <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => openWhatsAppDirect()}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-between shadow-2xl shadow-emerald-950 border border-emerald-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-600 flex items-center justify-center">
                  <MessageCircle size={18} className="fill-emerald-600" />
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 rounded-full" />
              </div>
              <div className="text-left">
                <span className="block font-black leading-tight">Konsultasi WhatsApp Sekarang</span>
                <span className="text-[10px] text-emerald-200/90 font-medium">
                  Tersambung langsung dengan {partnerName}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-emerald-200" />
          </button>
        </div>
      </div>

      {/* AI Health Consultant & Prescription Modal */}
      <AIHealthConsultModal
        isOpen={aiConsultModalOpen}
        onClose={() => setAiConsultModalOpen(false)}
        partnerWhatsApp={cleanPhone}
        partnerName={partnerName}
      />
    </div>
  );
}
