import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Activity,
  Clock,
  Phone,
  MessageCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
  Droplets,
  Smartphone,
  Users,
  HeartPulse,
  Award,
  BookOpen,
} from 'lucide-react';
import api from '../../services/api';
import ModalPortal from '../common/ModalPortal';
import { downloadVCardContact } from '../../utils/vCardGenerator';

// 4 Milestone Definisi Siklus Herbal SYNETIQ
export const HEALTH_MILESTONES = [
  {
    step: 1,
    key: 'day_3',
    dayNumber: 3,
    title: 'Hari ke-3',
    subtitle: 'Penyesuaian Rasa & Detoks Tubuh',
    desc: 'Cek reaksi adaptasi alami, sensasi hangat, metabolisme lancar.',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    dotColor: 'bg-amber-500',
    promptTemplate: (name, keluhan, produk) =>
      `Halo Bapak/Ibu ${name}, salam sehat dari SYNETIQ! 🙏\n\nAlhamdulillah hari ini sudah memasuki hari ke-3 konsumsi rutin ${produk}.\n\nBagaimana rasa dan proses adaptasi di tubuh sejauh ini? Apakah mulai terasa sedikit lebih hangat atau buang air lebih lancar? Itu merupakan respon alami pembersihan toksin (detoksifikasi) tubuh. Pastikan tetap minum air putih hangat yang cukup ya. 😊🌿`,
  },
  {
    step: 2,
    key: 'day_7',
    dayNumber: 7,
    title: 'Hari ke-7',
    subtitle: 'Perkembangan Awal & Stamina',
    desc: 'Evaluasi tidur lebih nyenyak, keluhan nyeri/pegal mulai mereda.',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    dotColor: 'bg-blue-500',
    promptTemplate: (name, keluhan, produk) =>
      `Halo Bapak/Ibu ${name}, semoga selalu diberikan kesehatan prima! ✨\n\nMemasuki 1 minggu pemakaian ${produk}, biasanya sel-sel organ tubuh mulai merespon perbaikan. Bagaimana perkembangan keluhan ${keluhan} Bapak/Ibu saat ini? Apakah tidur terasa lebih pulas dan badan lebih segar saat bangun pagi? Boleh ceritakan perkembangannya ya. 😊🩺`,
  },
  {
    step: 3,
    key: 'day_14',
    dayNumber: 14,
    title: 'Hari ke-14',
    subtitle: 'Testimoni Perubahan Tubuh',
    desc: 'Dokumentasi penurunan asam urat/gula darah & testimoni kesembuhan.',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    dotColor: 'bg-purple-500',
    promptTemplate: (name, keluhan, produk) =>
      `Salam hangat Bapak/Ibu ${name}! 🌿\n\nSudah 2 minggu konsumsi rutin ${produk}. Berdasarkan pengalaman konsumen kami, di hari ke-14 biasanya terjadi progres perbaikan signifikan untuk keluhan ${keluhan}.\n\nApakah sudah ada perubahan rasa nyeri atau sudah sempat cek lab mandiri? Jika berkenan, kami sangat bahagia mendengar cerita perbaikan kesehatan Bapak/Ibu sebagai inspirasi bagi konsumen lainnya. Terima kasih atas ikhtiarnya! 🙏❤️`,
  },
  {
    step: 4,
    key: 'day_25',
    dayNumber: 25,
    title: 'Hari ke-25',
    subtitle: 'Kunci Repeat Order Sebelum Stok Habis',
    desc: 'Sisa botol tinggal sedikit (3-5 hari), amankan paket RO hemat tanpa jeda.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotColor: 'bg-emerald-500',
    promptTemplate: (name, keluhan, produk) =>
      `Halo Bapak/Ibu ${name}, semoga semakin sehat dan berstamina! 🌟\n\nMelihat catatan pemakaian, hari ini sudah memasuki hari ke-25. Perkiraan isi botol ${produk} Bapak/Ibu tinggal sedikit untuk 3-5 hari ke depan.\n\nAgar proses pemulihan herbal tidak terputus di tengah jalan, apakah ingin kami siapkan pengiriman paket repeat order hematnya hari ini? Khusus konsumen setia kami ada gratis ongkir dan bonus konsultasi. Kabari kami ya! 📦✨`,
  },
];

export default function CustomerHealthJourneyView({ user }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterComplaint, setFilterComplaint] = useState('all');
  const [filterMilestone, setFilterMilestone] = useState('all');

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formComplaint, setFormComplaint] = useState('Asam Urat');
  const [formDosage, setFormDosage] = useState('3 x 5 tetes/hari sesudah makan');
  const [formProduct, setFormProduct] = useState('Bio-Propolis Trigona 30ml');
  const [formStartDate, setFormStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formNotes, setFormNotes] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/health-records');
      if (res.data && res.data.data) {
        setRecords(res.data.data);
      }
    } catch (err) {
      console.warn('Backend health records fallback:', err.message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleOpenCreate = () => {
    setFormName('');
    setFormPhone('');
    setFormAge('');
    setFormCity('');
    setFormComplaint('Asam Urat');
    setFormDosage('3 x 5 tetes/hari sesudah makan');
    setFormProduct('Bio-Propolis Trigona 30ml');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        customer_name: formName,
        phone: formPhone,
        age: Number(formAge) || 0,
        city: formCity,
        chief_complaint: formComplaint,
        dosage_instructions: formDosage,
        product: formProduct,
        start_date: formStartDate,
        notes: formNotes,
      };

      const res = await api.post('/crm/health-records', payload);
      if (res.data?.status === 'success' || res.data?.data) {
        alert('Data pasien herbal berhasil ditambahkan ke Health Journey!');
        setCreateModalOpen(false);
        fetchRecords();
      }
    } catch (err) {
      // Local optimistic fallback
      const newRec = {
        id: 'local-' + Date.now(),
        customer_name: formName,
        phone: formPhone,
        age: Number(formAge) || 0,
        city: formCity,
        chief_complaint: formComplaint,
        dosage_instructions: formDosage,
        product: formProduct,
        start_date: formStartDate,
        days_elapsed: 0,
        current_milestone: 'day_3',
        health_notes: formNotes,
        status: 'active',
      };
      setRecords([newRec, ...records]);
      setCreateModalOpen(false);
      alert('Pasien herbal berhasil ditambahkan!');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMilestone = async (recordId, targetMilestone) => {
    try {
      await api.put(`/crm/health-records/${recordId}/milestone`, {
        milestone: targetMilestone,
      });
      fetchRecords();
    } catch (err) {
      // Local optimistic update
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId ? { ...r, current_milestone: targetMilestone } : r
        )
      );
    }
  };

  // Helper calculation for active days
  const calculateDays = (record) => {
    if (typeof record.days_elapsed === 'number') return record.days_elapsed;
    if (!record.start_date) return 0;
    const diff = Date.now() - new Date(record.start_date).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // Filtered List
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone?.includes(searchQuery) ||
      r.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chief_complaint?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesComplaint =
      filterComplaint === 'all' ||
      r.chief_complaint?.toLowerCase().includes(filterComplaint.toLowerCase());

    const matchesMilestone =
      filterMilestone === 'all' || r.current_milestone === filterMilestone;

    return matchesSearch && matchesComplaint && matchesMilestone;
  });

  // Summary Metrics
  const totalActive = records.length;
  const countDay3 = records.filter(
    (r) => calculateDays(r) <= 3 || r.current_milestone === 'day_3'
  ).length;
  const countDay7 = records.filter(
    (r) =>
      (calculateDays(r) > 3 && calculateDays(r) <= 7) ||
      r.current_milestone === 'day_7'
  ).length;
  const countDay14 = records.filter(
    (r) =>
      (calculateDays(r) > 7 && calculateDays(r) <= 14) ||
      r.current_milestone === 'day_14'
  ).length;
  const countDay25 = records.filter(
    (r) => calculateDays(r) >= 15 || r.current_milestone === 'day_25'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Executive Medical Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-[#021810] via-[#062c1d] to-[#041a12] p-6 sm:p-8 text-white shadow-2xl shadow-emerald-950/30">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            {/* Clinical Protocol Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-300 ml-0.5" />
              <span className="tracking-wide">Protokol Retensi Klinis Pasien Herbal SYNETIQ</span>
            </div>

            {/* Banner Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Customer Health Journey
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  {' '}(Siklus 3-7-14-25 Hari)
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/85 max-w-2xl leading-relaxed mt-2 font-normal">
                Sistematisasi pendampingan konsumen herbal SYNETIQ: pantau detoks awal (Hari 3), evaluasi vitalitas (Hari 7), kumpulkan testimoni klinis (Hari 14), dan amankan repeat order otomatis sebelum botol habis (Hari 25).
              </p>
            </div>

            {/* Stepper Timeline Mini Pills */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-emerald-200/90">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>H-3: Detoks</span>
              </div>
              <span className="text-emerald-500/60">→</span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>H-7: Evaluasi</span>
              </div>
              <span className="text-emerald-500/60">→</span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>H-14: Testimoni</span>
              </div>
              <span className="text-emerald-500/60">→</span>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>H-25: Repeat Order</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setGuideModalOpen(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white hover:text-emerald-200 font-semibold text-xs sm:text-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>Panduan SOP Siklus</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="group relative inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 ring-1 ring-white/30"
            >
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              <span>Tambah Pasien Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Step Milestone Stage Interactive Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Pasien Aktif */}
        <button
          type="button"
          onClick={() => setFilterMilestone('all')}
          className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
            filterMilestone === 'all'
              ? 'bg-gradient-to-b from-white to-slate-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/40'
              : 'bg-white border-slate-200/80 shadow-xs hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Total Pasien
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              filterMilestone === 'all' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {totalActive}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-slate-500 font-medium">Sedang terapi herbal</span>
            {filterMilestone === 'all' && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Semua
              </span>
            )}
          </div>
        </button>

        {/* Card 2: Hari ke-3 Detoks */}
        <button
          type="button"
          onClick={() => setFilterMilestone(filterMilestone === 'day_3' ? 'all' : 'day_3')}
          className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
            filterMilestone === 'day_3'
              ? 'bg-gradient-to-b from-amber-50/80 to-amber-100/50 border-amber-500 shadow-md ring-2 ring-amber-500/50'
              : 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200/80 shadow-xs hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Hari ke-3
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Droplets className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-2 tracking-tight">
            {countDay3}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-amber-700/90 font-medium">Detoks & adaptasi rasa</span>
            {filterMilestone === 'day_3' && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded-md">
                Aktif
              </span>
            )}
          </div>
        </button>

        {/* Card 3: Hari ke-7 Evaluasi */}
        <button
          type="button"
          onClick={() => setFilterMilestone(filterMilestone === 'day_7' ? 'all' : 'day_7')}
          className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
            filterMilestone === 'day_7'
              ? 'bg-gradient-to-b from-blue-50/80 to-blue-100/50 border-blue-500 shadow-md ring-2 ring-blue-500/50'
              : 'bg-gradient-to-b from-white to-blue-50/30 border-blue-200/80 shadow-xs hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Hari ke-7
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-2 tracking-tight">
            {countDay7}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-blue-700/90 font-medium">Tidur pulas & stamina</span>
            {filterMilestone === 'day_7' && (
              <span className="text-[10px] font-bold text-blue-800 bg-blue-200/60 px-1.5 py-0.5 rounded-md">
                Aktif
              </span>
            )}
          </div>
        </button>

        {/* Card 4: Hari ke-14 Testimoni */}
        <button
          type="button"
          onClick={() => setFilterMilestone(filterMilestone === 'day_14' ? 'all' : 'day_14')}
          className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
            filterMilestone === 'day_14'
              ? 'bg-gradient-to-b from-purple-50/80 to-purple-100/50 border-purple-500 shadow-md ring-2 ring-purple-500/50'
              : 'bg-gradient-to-b from-white to-purple-50/30 border-purple-200/80 shadow-xs hover:border-purple-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
              Hari ke-14
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-2 tracking-tight">
            {countDay14}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-purple-700/90 font-medium">Bukti lab & testimoni</span>
            {filterMilestone === 'day_14' && (
              <span className="text-[10px] font-bold text-purple-800 bg-purple-200/60 px-1.5 py-0.5 rounded-md">
                Aktif
              </span>
            )}
          </div>
        </button>

        {/* Card 5: Hari ke-25 Repeat Order */}
        <button
          type="button"
          onClick={() => setFilterMilestone(filterMilestone === 'day_25' ? 'all' : 'day_25')}
          className={`text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
            filterMilestone === 'day_25'
              ? 'bg-gradient-to-b from-emerald-50/90 to-teal-100/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/50'
              : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-300 shadow-xs hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Hari ke-25
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2 tracking-tight">
            {countDay25}
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px]">
            <span className="text-emerald-700 font-bold">Kunci Repeat Order!</span>
            {filterMilestone === 'day_25' ? (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded-md">
                Aktif
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
        </button>
      </div>

      {/* Active Filter Pill Bar (Shown when a specific filter is engaged) */}
      {filterMilestone !== 'all' && (
        <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
          <div className="flex items-center space-x-2">
            <span className="font-bold">Menampilkan Filter Milestone:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold text-[11px]">
              {filterMilestone === 'day_3' && 'Hari ke-3: Detoks & Adaptasi'}
              {filterMilestone === 'day_7' && 'Hari ke-7: Evaluasi & Vitalitas'}
              {filterMilestone === 'day_14' && 'Hari ke-14: Koleksi Testimoni'}
              {filterMilestone === 'day_25' && 'Hari ke-25: Penguncian Repeat Order'}
            </span>
            <span className="text-emerald-700 text-[11px]">
              ({filteredRecords.length} pasien)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterMilestone('all')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 flex items-center space-x-1"
          >
            <span>Reset ke Semua Pasien</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pasien, WhatsApp, keluhan, kota..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Filter Keluhan */}
          <select
            value={filterComplaint}
            onChange={(e) => setFilterComplaint(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Keluhan</option>
            <option value="Asam Urat">Asam Urat &amp; Sendi</option>
            <option value="Diabetes">Diabetes &amp; Gula Darah</option>
            <option value="Lambung">Maag &amp; GERD Lambung</option>
            <option value="Kolesterol">Kolesterol &amp; Hipertensi</option>
            <option value="Vitalitas">Vitalitas &amp; Imun</option>
          </select>

          {/* Filter Milestone */}
          <select
            value={filterMilestone}
            onChange={(e) => setFilterMilestone(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Milestone Hari</option>
            <option value="day_3">🟡 Hari ke-3 (Detoks)</option>
            <option value="day_7">🔵 Hari ke-7 (Evaluasi Awal)</option>
            <option value="day_14">🟣 Hari ke-14 (Testimoni)</option>
            <option value="day_25">🟢 Hari ke-25 (Repeat Order)</option>
          </select>
        </div>

        <button
          onClick={fetchRecords}
          className="px-3 py-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition flex items-center space-x-1.5 self-end md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Patient Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRecords.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-slate-700 text-sm">
              Belum Ada Pasien di Kategori Ini
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tambahkan data konsumen herbal pertama Anda untuk mulai memantau perkembangan kesehatan siklus 3-7-14-25 hari secara profesional.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pasien Sekarang</span>
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => {
            const days = calculateDays(record);
            // Cari milestone aktif saat ini
            let activeMilestone = HEALTH_MILESTONES[0];
            if (days >= 25 || record.current_milestone === 'day_25') {
              activeMilestone = HEALTH_MILESTONES[3];
            } else if (days >= 14 || record.current_milestone === 'day_14') {
              activeMilestone = HEALTH_MILESTONES[2];
            } else if (days >= 7 || record.current_milestone === 'day_7') {
              activeMilestone = HEALTH_MILESTONES[1];
            }

            // Progress percentage for visual bar
            const progressPct = Math.min(
              100,
              Math.max(12, Math.round((days / 30) * 100))
            );

            // WhatsApp dynamic message
            const waMessage = activeMilestone.promptTemplate(
              record.customer_name,
              record.chief_complaint,
              record.product || 'Bio-Propolis Trigona'
            );
            const waUrl = `https://wa.me/${record.phone}?text=${encodeURIComponent(
              waMessage
            )}`;

            return (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Header: Customer Info & Day Counter Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {record.customer_name}
                      </h3>
                      {record.age > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({record.age} th)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                      <span className="font-mono flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{record.phone}</span>
                      </span>
                      {record.city && (
                        <span className="truncate">&bull; {record.city}</span>
                      )}
                    </div>
                  </div>

                  {/* Day Counter Pill */}
                  <div className="text-right flex-shrink-0">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hari ke-{days}</span>
                    </span>
                    <div className="text-[9px] text-slate-400 mt-1">
                      Mulai:{' '}
                      {record.start_date
                        ? new Date(record.start_date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })
                        : '-'}
                    </div>
                  </div>
                </div>

                {/* Medical Details: Keluhan & Dosis */}
                <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-100 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Keluhan Utama:
                      </div>
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span>{record.chief_complaint}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Produk:
                      </div>
                      <div className="font-semibold text-indigo-700 truncate text-[11px]">
                        {record.product || 'Bio-Propolis Trigona'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <div className="text-slate-600 flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-teal-600" />
                      <span>
                        <strong className="text-slate-700">Dosis:</strong>{' '}
                        {record.dosage_instructions || '3 x 5 tetes/hari'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & 4-Step Milestone Stepper */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700 flex items-center space-x-1">
                      <span>Progres Siklus Terapi</span>
                      <span className="text-emerald-600 font-extrabold">({progressPct}%)</span>
                    </span>
                    <span className="text-slate-400 text-[10px]">Target 30 Hari</span>
                  </div>

                  {/* Progress Bar Track */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* 4 Interactive Milestone Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {HEALTH_MILESTONES.map((ms) => {
                      const isCompleted = days >= ms.dayNumber;
                      const isCurrent = activeMilestone.key === ms.key;

                      return (
                        <button
                          key={ms.key}
                          type="button"
                          onClick={() => handleUpdateMilestone(record.id, ms.key)}
                          className={`p-2 rounded-xl text-left border transition relative flex flex-col justify-between min-h-[58px] ${isCurrent
                            ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                            : isCompleted
                              ? 'bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-white border-slate-100 text-slate-400 opacity-70'
                            }`}
                          title={`Ubah milestone aktif ke ${ms.title}`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-wider ${isCurrent
                                ? 'text-emerald-700'
                                : isCompleted
                                  ? 'text-slate-600'
                                  : 'text-slate-400'
                                }`}
                            >
                              {ms.title}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-slate-200 flex-shrink-0" />
                            )}
                          </div>
                          <div
                            className={`text-[10px] font-semibold leading-tight line-clamp-1 mt-0.5 ${isCurrent ? 'text-emerald-950 font-bold' : ''
                              }`}
                          >
                            {ms.subtitle}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Health Notes if available */}
                {record.health_notes && (
                  <p className="text-[10px] text-slate-600 italic bg-amber-50/60 p-2 rounded-xl border border-amber-200/70">
                    &ldquo;{record.health_notes}&rdquo;
                  </p>
                )}

                {/* 1-Click WhatsApp Trigger & Save Contact */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200" />
                    <span>Kirim WA {activeMilestone.title}: {activeMilestone.subtitle}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      downloadVCardContact({
                        name: record.customer_name,
                        phone: record.phone,
                        city: record.city,
                        notes: `Pasien: ${record.chief_complaint} (${record.product || ''})`,
                      })
                    }
                    className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs transition flex items-center space-x-1.5"
                    title="Simpan Kontak Pasien ke HP (.vcf)"
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    <span>.vcf</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: TAMBAH PASIEN KONSUMEN HERBAL BARU */}
      {createModalOpen && (
        <ModalPortal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <HeartHandshake className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Tambah Pasien / Konsumen Herbal
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Pemantauan otomatis siklus sehat 3-7-14-25 hari
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap Pasien / Konsumen *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ibu Hj. Nurhasanah"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Usia (Tahun)</label>
                  <input
                    type="number"
                    value={formAge}
                    onChange={(e) => setFormAge(e.target.value)}
                    placeholder="Contoh: 52"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Keluhan Utama *
                  </label>
                  <select
                    value={formComplaint}
                    onChange={(e) => setFormComplaint(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Asam Urat">Asam Urat &amp; Nyeri Sendi</option>
                    <option value="Diabetes">Diabetes (Gula Darah Tinggi)</option>
                    <option value="Lambung / Maag">Maag Kronis &amp; GERD</option>
                    <option value="Kolesterol">Kolesterol &amp; Tengkuk Kaku</option>
                    <option value="Hipertensi">Hipertensi (Tekanan Darah Tinggi)</option>
                    <option value="Vitalitas & Imun">Vitalitas &amp; Pemulihan Stamina</option>
                    <option value="Kebugaran Lansia">Kebugaran Lansia</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota Asal</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Contoh: Bandung"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Produk yang Dikonsumsi
                  </label>
                  <select
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Bio-Propolis Trigona 30ml">
                      Bio-Propolis Trigona 30ml (BPOM)
                    </option>
                    <option value="Bio-Herbal Drops">Bio-Herbal Drops Ekstrak Alami</option>
                    <option value="Bio-Gluta White">Bio-Gluta White Antioksidan</option>
                    <option value="Paket Terapi Sendi & Gula">
                      Paket Terapi Sendi &amp; Gula 2 Botol
                    </option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tanggal Mulai Konsumsi
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Aturan Dosis Pemakaian
                </label>
                <input
                  type="text"
                  value={formDosage}
                  onChange={(e) => setFormDosage(e.target.value)}
                  placeholder="Contoh: 3 x 5 tetes dilarutkan ke air hangat sebelum makan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Riwayat Medis / Kondisi Awal
                </label>
                <textarea
                  rows="2"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Contoh: Hasil lab asam urat terakhir 8.9 mg/dL, sudah minum obat dokter 1 bulan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-md shadow-emerald-500/25 flex items-center justify-center space-x-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Menyimpan...' : 'Mulai Pendampingan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* MODAL: PANDUAN PROTOKOL SIKLUS 3-7-14-25 */}
      {guideModalOpen && (
        <ModalPortal isOpen={guideModalOpen} onClose={() => setGuideModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Panduan SOP Siklus Sehat 3-7-14-25 Hari
                  </h3>
                  <p className="text-xs text-slate-500">
                    Protokol retensi &amp; pendampingan klinis konsumen herbal SYNETIQ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGuideModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span>Fase 1 (Hari ke-3) &mdash; Adaptasi Rasa &amp; Detoksifikasi Alami</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  <strong>Tujuan Utama:</strong> Mengonfirmasi pasien sudah meminum produk dengan dosis benar serta menenangkan respon detoks awal (sensasi hangat, BAB lebih lancar, sedikit ngantuk/lelah). Pasien yang didampingi di Hari 3 memiliki tingkat kepatuhan terapi 85% lebih tinggi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
                  <HeartPulse className="w-4 h-4 text-blue-600" />
                  <span>Fase 2 (Hari ke-7) &mdash; Evaluasi Kebugaran &amp; Kualitas Tidur</span>
                </div>
                <p className="text-xs text-blue-900/90 leading-relaxed">
                  <strong>Tujuan Utama:</strong> Memastikan sel tubuh mulai merespon perbaikan. Tanyakan perbaikan spesifik seperti kualitas tidur malam yang lebih pulas, sendi yang lebih enteng saat bangun pagi, dan vitalitas tubuh harian.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-1.5">
                <div className="flex items-center space-x-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Fase 3 (Hari ke-14) &mdash; Koleksi Testimoni &amp; Validasi Hasil</span>
                </div>
                <p className="text-xs text-purple-900/90 leading-relaxed">
                  <strong>Tujuan Utama:</strong> Di minggu ke-2, terjadi regenerasi sel organ nyata. Minta pasien menceritakan perubahan rasa sakit atau hasil cek gula darah/asam urat mandiri. Dokumentasikan izin testimoni untuk membangun kepercayaan konsumen baru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1.5">
                <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Fase 4 (Hari ke-25) &mdash; Penguncian Repeat Order (RO) Otomatis</span>
                </div>
                <p className="text-xs text-emerald-900/90 leading-relaxed">
                  <strong>Tujuan Utama:</strong> Isi botol 30ml tersisa untuk 3&ndash;5 hari konsumsi. Jangan biarkan pasien kehabisan stok agar progres pengobatan tidak terputus. Tawarkan paket hemat repeat order 2-3 botol dengan fasilitas gratis ongkir dan konsultasi berlanjut.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setGuideModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
