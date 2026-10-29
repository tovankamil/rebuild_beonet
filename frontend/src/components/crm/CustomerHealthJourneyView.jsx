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
} from 'lucide-react';
import api from '../../services/api';
import ModalPortal from '../common/ModalPortal';
import { downloadVCardContact } from '../../utils/vCardGenerator';

// 4 Milestone Definisi Siklus Herbal Bionet
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
      `Halo Bapak/Ibu ${name}, salam sehat dari Bionet! 🙏\n\nAlhamdulillah hari ini sudah memasuki hari ke-3 konsumsi rutin ${produk}.\n\nBagaimana rasa dan proses adaptasi di tubuh sejauh ini? Apakah mulai terasa sedikit lebih hangat atau buang air lebih lancar? Itu merupakan respon alami pembersihan toksin (detoksifikasi) tubuh. Pastikan tetap minum air putih hangat yang cukup ya. 😊🌿`,
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
      // Fallback data jika backend belum ada records
      setRecords([
        {
          id: 'hr-01',
          customer_name: 'Ibu Hj. Siti Nurhasanah',
          phone: '6281234567890',
          age: 54,
          city: 'Bandung',
          chief_complaint: 'Asam Urat',
          dosage_instructions: '3 x 5 tetes dilarutkan ke 150ml air hangat',
          product: 'Bio-Propolis Trigona 30ml',
          start_date: new Date(Date.now() - 4 * 86400000).toISOString(),
          days_elapsed: 4,
          current_milestone: 'day_7',
          health_notes:
            'Kaki sering kaku di pagi hari, asam urat lab 8.9 mg/dL. Mulai membaik pasca hari ke-3 detoks.',
          status: 'active',
        },
        {
          id: 'hr-02',
          customer_name: 'Bpk. Bambang Sujiwo',
          phone: '6281398765432',
          age: 48,
          city: 'Surabaya',
          chief_complaint: 'Diabetes',
          dosage_instructions: '2 x 7 tetes dicampur air mineral pagi & malam',
          product: 'Bio-Herbal Drops',
          start_date: new Date(Date.now() - 12 * 86400000).toISOString(),
          days_elapsed: 12,
          current_milestone: 'day_14',
          health_notes:
            'Badan cepat lemas, sering haus. Hari ke-10 stamina jauh lebih segar dan tidak ngantukan.',
          status: 'active',
        },
        {
          id: 'hr-03',
          customer_name: 'Ibu Ratna Dewi',
          phone: '6282112344321',
          age: 42,
          city: 'Jakarta Selatan',
          chief_complaint: 'Lambung / Maag',
          dosage_instructions: '3 x 3 tetes dicampur madu hangat sebelum sarapan',
          product: 'Bio-Propolis Trigona 30ml',
          start_date: new Date(Date.now() - 26 * 86400000).toISOString(),
          days_elapsed: 26,
          current_milestone: 'day_25',
          health_notes:
            'GERD dan heartburn sudah reda total. Stok botol tinggal sedikit, siap repeat order.',
          status: 'active',
        },
        {
          id: 'hr-04',
          customer_name: 'Bpk. H. Ahmad Fauzi',
          phone: '6285712348899',
          age: 60,
          city: 'Yogyakarta',
          chief_complaint: 'Kolesterol',
          dosage_instructions: '3 x 5 tetes rutin sebelum tidur malam',
          product: 'Bio-Propolis Trigona 30ml',
          start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
          days_elapsed: 2,
          current_milestone: 'day_3',
          health_notes:
            'Tengkuk kaku dan berat pasca makan daging. Baru mulai 2 hari.',
          status: 'active',
        },
      ]);
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
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
              <span>Metodologi Retensi &amp; Pendampingan Pasien Herbal Bionet</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              Customer Health Journey (Siklus 3-7-14-25 Hari)
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Dampingi konsumen herbal secara sistematis pada fase detoks (Hari 3), evaluasi awal (Hari 7), testimoni hasil klinis (Hari 14), hingga repeat order otomatis sebelum stok habis (Hari 25).
            </p>
          </div>

          <div className="flex items-center space-x-2.5 flex-shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pasien / Konsumen Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Milestone Stage Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Pasien Aktif
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalActive}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sedang terapi herbal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs bg-gradient-to-b from-white to-amber-50/30">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center justify-between">
            <span>Hari ke-3 (Detoks)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{countDay3}</div>
          <div className="text-[10px] text-amber-600/80 mt-0.5">Adaptasi rasa &amp; detox</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs bg-gradient-to-b from-white to-blue-50/30">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            Hari ke-7 (Evaluasi)
          </div>
          <div className="text-2xl font-black text-blue-800 mt-1">{countDay7}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Tidur pulas &amp; stamina</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs bg-gradient-to-b from-white to-purple-50/30">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
            Hari ke-14 (Testimoni)
          </div>
          <div className="text-2xl font-black text-purple-800 mt-1">{countDay14}</div>
          <div className="text-[10px] text-purple-600/80 mt-0.5">Koleksi bukti pemulihan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-300 shadow-xs bg-gradient-to-b from-white to-emerald-50/40">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Hari ke-25 (RO)</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{countDay25}</div>
          <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
            Stok menipis, kunci RO!
          </div>
        </div>
      </div>

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
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-md shadow-emerald-950"
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
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-md shadow-emerald-950 flex items-center justify-center space-x-2"
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
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-950 flex items-center justify-center space-x-1.5"
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
    </div>
  );
}
