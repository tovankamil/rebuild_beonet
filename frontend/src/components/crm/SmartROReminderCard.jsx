import React, { useState, useEffect } from 'react';
import {
  Clock,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageCircle,
  Share2,
  RefreshCw,
  Sparkles,
  Users,
  ChevronRight,
  TrendingDown,
  ShoppingBag,
  HeartHandshake,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { playCoinChime } from '../../utils/soundNotification';

export default function SmartROReminderCard({ user }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'critical' | 'passive'
  const [reminders, setReminders] = useState([]);
  const [passiveDownlines, setPassiveDownlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState({}); // local status overrides: { [id]: 'pending' | 'contacted' | 'closed' }

  // Fallback demo data if backend /api/crm/ro-reminders endpoint is empty or offline
  const fallbackReminders = [
    {
      id: 'ro-01',
      customer_name: 'Ibu Ratna Suminar',
      phone: '6281234567890',
      product_name: 'Bio-Propolis Trigona 30ml',
      order_date: '2026-10-02',
      bottle_cycle_days: 30,
      days_elapsed: 27, // Day 27/30 -> Critical!
      bottle_usage_pct: 90,
      bottles_remaining_est: '3-4 hari pemakaian',
      city: 'Bandung',
      status: 'pending',
    },
    {
      id: 'ro-02',
      customer_name: 'Bpk. Hendro Wicaksono',
      phone: '6281398765432',
      product_name: 'Paket Kebugaran Sendi & Tulang',
      order_date: '2026-10-07',
      bottle_cycle_days: 30,
      days_elapsed: 22, // Day 22/30 -> Stok Menipis
      bottle_usage_pct: 73,
      bottles_remaining_est: '7-8 hari pemakaian',
      city: 'Surabaya',
      status: 'pending',
    },
    {
      id: 'ro-03',
      customer_name: 'Ibu Siti Aminah',
      phone: '6282112344321',
      product_name: 'Bio-Herbal Tetes Lambung',
      order_date: '2026-10-18',
      bottle_cycle_days: 30,
      days_elapsed: 11, // Day 11/30 -> Stok Aman
      bottle_usage_pct: 36,
      bottles_remaining_est: '19 hari pemakaian',
      city: 'Jakarta Selatan',
      status: 'pending',
    },
    {
      id: 'ro-04',
      customer_name: 'Bpk. Agus Priyanto',
      phone: '6285712398711',
      product_name: 'Bio-Madu Herbal Alami Anak',
      order_date: '2026-09-30',
      bottle_cycle_days: 30,
      days_elapsed: 29, // Day 29/30 -> Critical!
      bottle_usage_pct: 96,
      bottles_remaining_est: '1-2 hari pemakaian',
      city: 'Yogyakarta',
      status: 'pending',
    },
  ];

  const fallbackPassiveDownlines = [
    {
      id: 'down-01',
      name: 'Rian Pratama',
      username: 'rian_bionet',
      phone: '6281987654321',
      position: 'Kaki Kiri',
      inactive_days: 48,
      last_activity: '11 September 2026',
      total_team: 4,
    },
    {
      id: 'down-02',
      name: 'Dewi Lestari',
      username: 'dewi_bio',
      phone: '6281233445566',
      position: 'Kaki Kanan',
      inactive_days: 62,
      last_activity: '28 Agustus 2026',
      total_team: 2,
    },
  ];

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/crm/ro-reminders');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setReminders(res.data.data);
        if (res.data.passive_downlines) {
          setPassiveDownlines(res.data.passive_downlines);
        } else {
          setPassiveDownlines(fallbackPassiveDownlines);
        }
      } else {
        setReminders(fallbackReminders);
        setPassiveDownlines(fallbackPassiveDownlines);
      }
    } catch (err) {
      // Fallback gracefully on network / missing endpoint
      setReminders(fallbackReminders);
      setPassiveDownlines(fallbackPassiveDownlines);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleStatusToggle = (item) => {
    const current = statuses[item.id] || item.status || 'pending';
    let next = 'contacted';
    if (current === 'contacted') next = 'closed';
    else if (current === 'closed') next = 'pending';

    setStatuses((prev) => ({
      ...prev,
      [item.id]: next,
    }));

    if (next === 'closed') {
      playCoinChime();
    }
  };

  const handleSendWhatsApp = (item) => {
    playCoinChime();
    const cleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
    const phoneTarget = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const message = `Halo Kak ${item.customer_name}, salam hangat dari Bionet Herbal!

Semoga selalu sehat ya Kak. Mau mengabarkan bahwa ${item.product_name} pesanan kemarin perkiraan tinggal sedikit ya (estimasi tersisa ${item.bottles_remaining_est})? 

Biar khasiatnya tetap berkesinambungan dan tidak putus minum, mau kami bantu siapkan paket repeat order hemat hari ini? Ada bonus poin reward khusus untuk pesanan minggu ini lho!`;

    window.open(`https://wa.me/${phoneTarget}?text=${encodeURIComponent(message)}`, '_blank');

    // Automatically mark as contacted
    setStatuses((prev) => ({
      ...prev,
      [item.id]: 'contacted',
    }));
  };

  const handleReEngageDownline = (downline) => {
    playCoinChime();
    const cleanPhone = (downline.phone || '').replace(/[^0-9]/g, '');
    const phoneTarget = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const message = `Halo Mitra Hebat Kak ${downline.name} (@${downline.username})! Apa kabar?

Lagi kangen diskusi perkembangan tim Bionet nih. Di jalur ${downline.position} Anda sudah ada omset bertumbuh, sayang banget kalau poin pasangannya tidak dimaksimalkan.

Ada strategi baru dan promo promo repeat order terbaru dari manajemen minggu ini. Kapan ada waktu santai 10 menit buat ngobrol via telepon atau Zoom?`;

    window.open(`https://wa.me/${phoneTarget}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Filter items
  const filteredReminders = reminders.filter((item) => {
    if (activeTab === 'critical') return item.days_elapsed >= 25;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-50/60 to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 flex-shrink-0">
            <Droplets size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-base text-slate-900 tracking-tight">
                Smart RO Reminder &amp; CRM Retensi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Auto-Cycle
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Prediksi habisnya botol herbal pelanggan (siklus 30 hari) &amp; re-engagement downline pasif
            </p>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua RO ({reminders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('critical')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Kritis (Hari 25+)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passive')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'passive'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Downline Pasif ({passiveDownlines.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {activeTab !== 'passive' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReminders.map((item) => {
              const currentStatus = statuses[item.id] || item.status || 'pending';
              const isCritical = item.days_elapsed >= 25;
              const isWarning = item.days_elapsed >= 18 && item.days_elapsed < 25;

              // Remaining fill percentage for bottle
              const remainingPct = Math.max(0, 100 - item.bottle_usage_pct);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCritical
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      : isWarning
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Top: Customer & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-heading font-extrabold text-sm text-slate-900">
                        {item.customer_name}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <ShoppingBag size={12} className="text-emerald-600" />
                        <span>{item.product_name}</span>
                        <span>•</span>
                        <span>{item.city}</span>
                      </div>
                    </div>

                    {/* Cycle Indicator Badge */}
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                        <AlertTriangle size={11} />
                        Kritis (Hari {item.days_elapsed}+)
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock size={11} />
                        Stok Menipis (H-{item.days_elapsed})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={11} />
                        Stok Aman (H-{item.days_elapsed})
                      </span>
                    )}
                  </div>

                  {/* Bottle Cycle Visual Meter */}
                  <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Droplets size={13} className="text-teal-600" />
                        Estimasi Sisa Herbal: <strong>{item.bottles_remaining_est}</strong>
                      </span>
                      <span className="font-bold text-slate-700">{remainingPct}% Sisa</span>
                    </div>

                    {/* Progress Bar with Liquid gradient */}
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical
                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                            : isWarning
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${remainingPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {/* Status Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleStatusToggle(item)}
                      title="Klik untuk mengubah status follow-up"
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        currentStatus === 'closed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : currentStatus === 'contacted'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {currentStatus === 'closed' ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Closing RO ✓</span>
                        </>
                      ) : currentStatus === 'contacted' ? (
                        <>
                          <Clock size={13} />
                          <span>Sudah Dihubungi</span>
                        </>
                      ) : (
                        <>
                          <Phone size={13} />
                          <span>Hubungi</span>
                        </>
                      )}
                    </button>

                    {/* 1-Click WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <MessageCircle size={14} />
                      <span>Follow-up WA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Downline Pasif (>45 Hari) Section */
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Users size={16} className="text-amber-700 flex-shrink-0" />
              <span>
                Mitra di bawah ini belum melakukan repeat order atau pendaftaran mitra baru lebih dari 45 hari. Kirim pesan sapaan motivasi untuk re-aktivasi!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {passiveDownlines.map((dl) => (
                <div
                  key={dl.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-heading font-extrabold text-sm text-slate-900">
                        {dl.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        @{dl.username} • Posisi: <strong className="text-slate-700">{dl.position}</strong>
                      </div>
                      <div className="text-[11px] text-rose-600 font-semibold mt-1">
                        Pasif: {dl.inactive_days} Hari (Terakhir aktif: {dl.last_activity})
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Pasif &gt;45 Hari
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Tim Binaan: <strong>{dl.total_team} Mitra</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleReEngageDownline(dl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <HeartHandshake size={14} />
                      <span>Re-aktivasi Downline WA</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
