import React, { useState } from 'react';
import {
  Phone,
  Sparkles,
  Flame,
  Zap,
  Snowflake,
  ArrowLeft,
  ArrowRight,
  Plus,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  Clock,
  TrendingUp,
  Trash2,
  Edit3,
  Smartphone,
} from 'lucide-react';
import { downloadVCardContact } from '../../utils/vCardGenerator';

export const KANBAN_STAGES = [
  {
    key: 'new',
    title: 'Baru Masuk',
    subtitle: 'Belum dihubungi',
    icon: Clock,
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-t-rose-500',
    headerBg: 'bg-rose-50/70 text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-700',
    accentLight: 'bg-rose-50 border-rose-200',
  },
  {
    key: 'contacted',
    title: 'Sudah Dihubungi',
    subtitle: 'Tahap perkenalan',
    icon: Phone,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-t-amber-500',
    headerBg: 'bg-amber-50/70 text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-700',
    accentLight: 'bg-amber-50 border-amber-200',
  },
  {
    key: 'interested',
    title: 'Konsultasi & Tertarik',
    subtitle: 'Tanya dosis & harga',
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-t-blue-500',
    headerBg: 'bg-blue-50/70 text-blue-700',
    badgeBg: 'bg-blue-100 text-blue-700',
    accentLight: 'bg-blue-50 border-blue-200',
  },
  {
    key: 'webinar',
    title: 'Ikut Webinar BOP',
    subtitle: 'Edukasi bisnis & herbal',
    icon: Sparkles,
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-t-purple-500',
    headerBg: 'bg-purple-50/70 text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-700',
    accentLight: 'bg-purple-50 border-purple-200',
  },
  {
    key: 'closing',
    title: 'Closing Order / Mitra',
    subtitle: 'Deal repeat order/paket',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-t-emerald-500',
    headerBg: 'bg-emerald-50/70 text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-700',
    accentLight: 'bg-emerald-50 border-emerald-200',
  },
];

export default function CrmKanbanBoard({
  leads = [],
  onStatusChange,
  onOpenAiFollowUp,
  onOpenObjectionHandler,
  onOpenEdit,
  onDeleteLead,
  onOpenCreate,
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  // Hitung Skor Heat Suhu Lead Prospek
  const getLeadHeatScore = (lead) => {
    const now = new Date();
    const refDate = lead.last_contacted_at
      ? new Date(lead.last_contacted_at)
      : new Date(lead.created_at || now);

    const diffMs = now - refDate;
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    let score = 20;

    // Recency bonus
    if (diffDays <= 3) score += 45;
    else if (diffDays <= 7) score += 25;
    else if (diffDays <= 14) score += 10;
    else score -= 15;

    // Stage weight bonus
    if (lead.status === 'closing') score += 40;
    else if (lead.status === 'webinar') score += 30;
    else if (lead.status === 'interested') score += 25;
    else if (lead.status === 'contacted') score += 15;

    // Value bonus
    if (Number(lead.estimated_value) >= 500000) score += 10;

    if (score >= 60 || diffDays <= 3) {
      return {
        type: 'HOT',
        score: Math.min(99, Math.max(65, score)),
        badge: (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xs">
            <Flame className="w-3 h-3 text-yellow-200 fill-yellow-200 animate-pulse" />
            <span>HOT {Math.min(99, Math.max(65, score))}</span>
          </span>
        ),
      };
    } else if (score >= 30 || diffDays <= 7) {
      return {
        type: 'WARM',
        score: Math.max(30, Math.min(59, score)),
        badge: (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-300">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>WARM {Math.max(30, Math.min(59, score))}</span>
          </span>
        ),
      };
    } else {
      return {
        type: 'COLD',
        score: Math.max(5, Math.min(29, score)),
        badge: (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <Snowflake className="w-3 h-3 text-blue-400" />
            <span>COLD ({diffDays > 14 ? `>14h` : `${diffDays}h`})</span>
          </span>
        ),
      };
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, targetStageKey) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDraggedLeadId(null);

    if (!leadId) return;
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStageKey) return;

    if (onStatusChange) {
      await onStatusChange(leadId, targetStageKey);
    }
  };

  // Quick move adjacent
  const moveAdjacent = async (lead, direction) => {
    const currentIndex = KANBAN_STAGES.findIndex((s) => s.key === lead.status);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < KANBAN_STAGES.length) {
      const nextStage = KANBAN_STAGES[targetIndex].key;
      if (onStatusChange) {
        await onStatusChange(lead.id, nextStage);
      }
    }
  };

  // Build smart stage-specific WhatsApp Greeting
  const getWhatsAppGreeting = (lead) => {
    const name = lead.name || 'Bapak/Ibu';
    const prod = lead.product_interest || 'produk herbal Bionet';
    let text = '';

    switch (lead.status) {
      case 'new':
        text = `Halo ${name}, salam kenal dari Bionet Herbal! Kami melihat ketertarikan Anda pada ${prod}. Ada yang bisa kami bantu jelaskan mengenai dosis pemakaian atau khasiatnya? 😊🌿`;
        break;
      case 'contacted':
        text = `Halo ${name}, salam sehat! Melanjutkan perbincangan kita mengenai ${prod}, bagaimana kabarnya hari ini? Apakah sudah sempat membaca brosur khasiat yang kami kirimkan? 😊`;
        break;
      case 'interested':
        text = `Halo ${name}! Untuk pemesanan ${prod} minggu ini kami ada promo free konsultasi dan panduan terapi khusus. Apakah ingin kami siapkan pengirimannya hari ini? 📦✨`;
        break;
      case 'webinar':
        text = `Halo ${name}! Jangan lupa malam ini ada sesi Webinar BOP Bionet. Kita akan kupas tuntas rahasia kesehatan herbal dan potensi peluang kemitraannya. Link room sudah siap ya! 🎥🌟`;
        break;
      case 'closing':
        text = `Selamat ${name}! Paket ${prod} sudah siap kami proses. Terima kasih banyak atas kepercayaannya ikhtiar sehat bersama Bionet. Kami siap pantau progresnya dari hari ke hari! 🙏🌿`;
        break;
      default:
        text = `Halo ${name}, salam sehat dari Bionet! Semoga harinya menyenangkan. 😊`;
    }
    return `https://wa.me/${lead.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-4">
      {/* Board Scroll Container */}
      <div className="flex xl:grid xl:grid-cols-5 gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory xl:snap-none -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-slate-300">
        {KANBAN_STAGES.map((stage, stageIdx) => {
          const stageLeads = leads.filter((l) => l.status === stage.key);
          const totalValue = stageLeads.reduce(
            (sum, l) => sum + (Number(l.estimated_value) || 0),
            0
          );
          const isOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
              className={`flex-shrink-0 w-[290px] sm:w-[310px] xl:w-auto snap-start bg-slate-100/80 rounded-2xl p-3 border-t-4 ${
                stage.borderColor
              } border-slate-200/90 flex flex-col min-h-[560px] transition-all duration-200 ${
                isOver ? 'ring-2 ring-indigo-500 bg-indigo-50/50 scale-[1.01]' : ''
              }`}
            >
              {/* Stage Header */}
              <div className="pb-2.5 mb-3 border-b border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stage.color} flex items-center justify-center text-white shadow-xs`}
                    >
                      <stage.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-800 leading-tight">
                        {stage.title}
                      </h3>
                      <p className="text-[10px] text-slate-400">{stage.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black ${stage.badgeBg}`}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Counter & Potential Value */}
                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-500 bg-white/70 px-2 py-1 rounded-lg border border-slate-200/60">
                  <span>Potensi Omset:</span>
                  <span className="font-mono font-bold text-slate-800">
                    Rp {totalValue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[660px] pr-1 scrollbar-thin">
                {stageLeads.length === 0 ? (
                  <div className="h-44 rounded-xl border-2 border-dashed border-slate-200/80 flex flex-col items-center justify-center text-center p-4 text-slate-400 space-y-2">
                    <div className="w-9 h-9 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400">
                      <stage.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">Tarik kartu prospek ke sini</span>
                    {onOpenCreate && stage.key === 'new' && (
                      <button
                        onClick={onOpenCreate}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah Cepat</span>
                      </button>
                    )}
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const heat = getLeadHeatScore(lead);
                    const isDragging = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className={`bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 space-y-2.5 cursor-grab active:cursor-grabbing ${
                          isDragging ? 'opacity-40 scale-95 border-indigo-400' : ''
                        }`}
                      >
                        {/* Top: Name, Heat Badge & City */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <h4 className="font-bold text-slate-900 text-xs leading-snug truncate">
                                {lead.name}
                              </h4>
                              {heat.badge}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="font-mono truncate">{lead.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Product & Value Pill */}
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-[11px] space-y-1">
                          {lead.product_interest && (
                            <div className="flex items-center space-x-1.5 text-indigo-700 font-semibold truncate">
                              <ShoppingBag className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{lead.product_interest}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                            {lead.city ? (
                              <span className="flex items-center space-x-1 truncate">
                                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{lead.city}</span>
                              </span>
                            ) : (
                              <span>Domisili: -</span>
                            )}
                            <span className="font-mono font-bold text-slate-700">
                              Rp {(Number(lead.estimated_value) || 250000).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* Notes Preview */}
                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 italic line-clamp-2 bg-amber-50/50 p-1.5 rounded border border-amber-100">
                            "{lead.notes}"
                          </p>
                        )}

                        {/* 1-Click WhatsApp & AI Objection Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <a
                            href={getWhatsAppGreeting(lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center space-x-1 shadow-xs transition"
                            title="Chat WhatsApp dengan Sapaan Ramah"
                          >
                            <Phone className="w-3 h-3 text-emerald-100" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => onOpenObjectionHandler && onOpenObjectionHandler(lead)}
                            className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] flex items-center justify-center space-x-1 shadow-xs transition"
                            title="Buka Asisten Penjawab Keberatan Konsumen"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Bantu AI</span>
                          </button>
                        </div>

                        {/* Quick Shift & Actions Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          {/* Left Arrow Shift */}
                          <button
                            type="button"
                            disabled={stageIdx === 0}
                            onClick={() => moveAdjacent(lead, 'prev')}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                            title="Geser Mundur 1 Tahap"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Dropdown Shift */}
                          <select
                            value={lead.status}
                            onChange={(e) => onStatusChange(lead.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5 text-[9px] font-bold text-slate-700 max-w-[130px]"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.key} value={s.key}>
                                ➔ {s.title}
                              </option>
                            ))}
                            <option value="lost">❌ Batal / Tidak Aktif</option>
                          </select>

                          {/* Right Arrow Shift */}
                          <button
                            type="button"
                            disabled={stageIdx === KANBAN_STAGES.length - 1}
                            onClick={() => moveAdjacent(lead, 'next')}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition"
                            title="Geser Maju 1 Tahap"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Save vCard & Edit / Delete */}
                          <div className="flex items-center space-x-0.5 border-l border-slate-100 pl-1">
                            <button
                              type="button"
                              onClick={() =>
                                downloadVCardContact({
                                  name: lead.name,
                                  phone: lead.phone,
                                  city: lead.city,
                                  notes: `Prospek: ${lead.product_interest || ''}`,
                                })
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 transition"
                              title="Simpan Kontak ke HP (.vcf)"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenEdit && onOpenEdit(lead)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition"
                              title="Edit Data Prospek"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteLead && onDeleteLead(lead.id, lead.name)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 transition"
                              title="Hapus Prospek"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
