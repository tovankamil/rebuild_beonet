import React, { useState } from 'react';
import {
  Users,
  MessageCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Send,
  HeartHandshake,
  RefreshCw,
} from 'lucide-react';

const DORMANT_DOWNLINES = [
  {
    id: 'dl_1',
    name: 'Wahyu Hidayat',
    username: 'wahyu_herbal',
    phone: '6281398765432',
    side: 'Tim Kiri (A)',
    inactiveDays: 16,
    lastActivity: 'Repeat Order Terakhir: 16 hari lalu',
    joinedDate: '12 Sep 2026',
    package: 'Silver',
  },
  {
    id: 'dl_2',
    name: 'Siti Rahmawati',
    username: 'rahma_propolis',
    phone: '6281234987650',
    side: 'Tim Kanan (B)',
    inactiveDays: 24,
    lastActivity: 'Belum sponsori mitra baru: 24 hari',
    joinedDate: '02 Sep 2026',
    package: 'Gold',
  },
  {
    id: 'dl_3',
    name: 'Heri Gunawan',
    username: 'heri_bio',
    phone: '6285712345678',
    side: 'Tim Kiri (A)',
    inactiveDays: 31,
    lastActivity: 'Belum aktivasi PIN kedua: 31 hari',
    joinedDate: '18 Agu 2026',
    package: 'Silver',
  },
];

export default function DownlineInactivityCard({ user, onNavigateTree }) {
  const [filterDays, setFilterDays] = useState('all'); // 'all' | '14' | '30'
  const [downlines, setDownlines] = useState(DORMANT_DOWNLINES);
  const sponsorName = user?.full_name || 'Sponsor Bionet Anda';

  const filteredList = downlines.filter((item) => {
    if (filterDays === '30') return item.inactiveDays >= 30;
    if (filterDays === '14') return item.inactiveDays >= 14 && item.inactiveDays < 30;
    return true;
  });

  const handleSendMentoringWA = (member) => {
    const text = `Halo Mas/Mbak ${member.name}, apa kabar? Salam hangat dari ${sponsorName} di Bionet! 🙏🌿\n\nSaya perhatikan sudah ${member.inactiveDays} hari belum ada kabar aktivitas di jaringan Bionet Anda. Semoga Anda sekeluarga selalu sehat ya.\n\nApakah ada kendala seputar cara prospek, stok produk Bio-Propolis, atau cara closing di WhatsApp yang bisa saya bantu dampingi? Yuk kalau ada waktu luang kita ngobrol santai 10 menit via telepon/video call agar omset dan bonus pasangan Anda segera melesat lagi!\n\nSemangat selalu, kita sukses bareng di Bionet! 💪✨`;

    const clean = member.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="dash-card p-5 border-t-4 border-t-amber-500 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-heading font-black text-sm text-slate-900">
                Radar Pendampingan Downline Pasif (14+ Hari)
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                {downlines.length} Perlu Pendampingan
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cegah rontoknya jaringan dengan menyapa dan memberikan motivasi kepada mitra yang melambat
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 self-start sm:self-auto bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterDays('all')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterDays === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Semua ({downlines.length})
          </button>
          <button
            onClick={() => setFilterDays('14')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterDays === '14' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            14-29 Hari
          </button>
          <button
            onClick={() => setFilterDays('30')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterDays === '30' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            30+ Hari
          </button>
        </div>
      </div>

      {/* Downlines List */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Tidak ada downline pasif pada kategori ini. Tim Anda sangat aktif!
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200/90 hover:border-amber-300 bg-white hover:bg-amber-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs">
                    {item.name.charAt(0)}
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
                    !
                  </span>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{item.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                      @{item.username}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold">
                      {item.side}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.lastActivity}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                  {item.inactiveDays} Hari Pasif
                </span>

                <button
                  onClick={() => handleSendMentoringWA(item)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition active:scale-95"
                  title="Kirim pesan pendampingan via WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>Kirim Pendampingan via WA</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Hint */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>💡 Tips: Duplikasi berhasil saat Anda aktif menyapa tim minimal 1x per minggu.</span>
        {onNavigateTree && (
          <button
            onClick={onNavigateTree}
            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5"
          >
            <span>Buka Pohon Jaringan</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
