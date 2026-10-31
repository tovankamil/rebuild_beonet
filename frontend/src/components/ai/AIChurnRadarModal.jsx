import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Send,
  UserCheck,
  UserX,
  Clock,
  Phone,
  Flame,
  Search,
  Filter,
  TrendingDown,
  ShieldAlert,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const CHURN_MEMBERS_SAMPLE = [];

export default function AIChurnRadarModal({ isOpen, onClose }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'stable'
  const [searchQuery, setSearchQuery] = useState('');
  const [contactedIds, setContactedIds] = useState(new Set());
  const [selectedMemberForCustomMsg, setSelectedMemberForCustomMsg] = useState(null);

  if (!isOpen) return null;

  const filteredMembers = CHURN_MEMBERS_SAMPLE.filter((m) => {
    const matchesFilter = filter === 'all' || m.status === filter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const criticalCount = CHURN_MEMBERS_SAMPLE.filter((m) => m.status === 'critical').length;
  const warningCount = CHURN_MEMBERS_SAMPLE.filter((m) => m.status === 'warning').length;
  const stableCount = CHURN_MEMBERS_SAMPLE.filter((m) => m.status === 'stable').length;

  const handleSendWhatsApp = (member) => {
    const rawNumber = member.phone.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
    const msg = encodeURIComponent(member.suggestedMessage);

    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');

    setContactedIds((prev) => new Set([...prev, member.id]));
    try {
      playCoinChime();
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Main Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800"
      >
        {/* DashLite Luxury Emerald Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-rose-500/30">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Downline Retention Radar
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <HeartHandshake size={12} className="mr-1 text-emerald-300" /> Anti-Burnout Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Radar Retensi Downline &amp; Prediksi Kejenuhan AI
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors z-10"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Radar Sweep Banner & Quick Stats */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg border border-slate-700/60">
            {/* Left Radar Sweep Animation Graphic */}
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full border-2 border-emerald-500/40 bg-slate-950/80 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {/* Radar Concentric Rings */}
                <div className="absolute inset-2 rounded-full border border-emerald-500/20" />
                <div className="absolute inset-5 rounded-full border border-emerald-500/20" />
                {/* Crosshairs */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/25" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/25" />
                {/* Rotating Sweep Beam */}
                <div
                  className="absolute inset-0 origin-center animate-spin"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.4) 45deg, transparent 50deg)',
                    animationDuration: '3s',
                  }}
                />
                {/* Blinking Member Dots */}
                <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-rose-500" />
                <div className="absolute bottom-5 right-5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="absolute top-7 right-6 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Radar AI Aktif Memindai
                </span>
                <h3 className="text-base font-heading font-extrabold text-white mt-1">
                  142 Mitra Dalam Pantauan
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  AI memindai frekuensi login, volume RO, dan rentang hari tanpa rekrutmen.
                </p>
              </div>
            </div>

            {/* Right Status Badges */}
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-center">
                <span className="text-[10px] font-bold text-rose-300 block">Kritis (&gt;30 Hari)</span>
                <span className="text-lg font-black text-rose-400">{criticalCount} Mitra</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-center">
                <span className="text-[10px] font-bold text-amber-300 block">Waspada (15-30 H)</span>
                <span className="text-lg font-black text-amber-400">{warningCount} Mitra</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-center">
                <span className="text-[10px] font-bold text-emerald-300 block">Sehat &amp; Aktif</span>
                <span className="text-lg font-black text-emerald-400">{stableCount} Mitra</span>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({CHURN_MEMBERS_SAMPLE.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('critical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  filter === 'critical'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Risiko Kritis ({criticalCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter('warning')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  filter === 'warning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Waspada ({warningCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter('stable')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                  filter === 'stable'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Stabil ({stableCount})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / kota mitra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Member Churn Cards List */}
          <div className="space-y-3.5">
            {filteredMembers.map((member) => {
              const isContacted = contactedIds.has(member.id);

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-xl border transition ${
                    member.status === 'critical'
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                      : member.status === 'warning'
                      ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                      : 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          member.status === 'critical'
                            ? 'bg-rose-100 text-rose-700'
                            : member.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {member.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-heading font-extrabold text-sm text-slate-900">
                            {member.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {member.id}
                          </span>
                          <span className="text-xs text-slate-500">• {member.city}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>
                            Tidak aktif <strong>{member.inactiveDays} hari</strong> (Gabung: {member.joinDate})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Churn Risk Gauge Meter */}
                    <div className="flex items-center space-x-3 sm:text-right">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-slate-500">Churn Risk:</span>
                          <span
                            className={
                              member.churnRisk >= 80
                                ? 'text-rose-600'
                                : member.churnRisk >= 50
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }
                          >
                            {member.churnRisk}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${member.churnRisk}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              member.churnRisk >= 80
                                ? 'bg-rose-500'
                                : member.churnRisk >= 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Diagnosis Reason & Solution */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                      <span className="font-bold text-slate-700 block mb-0.5 flex items-center">
                        <AlertTriangle size={12} className="mr-1 text-amber-500" />
                        Alasan Deteksi AI:
                      </span>
                      <p className="text-slate-600 leading-relaxed">{member.reason}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                      <span className="font-bold text-emerald-950 block mb-0.5 flex items-center">
                        <Sparkles size={12} className="mr-1 text-emerald-600" />
                        Rekomendasi Tindakan AI:
                      </span>
                      <p className="text-emerald-900 leading-relaxed">{member.solution}</p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-3 flex items-center justify-between pt-2">
                    <div className="text-[11px] text-slate-400">
                      {isContacted ? (
                        <span className="text-emerald-700 font-semibold inline-flex items-center">
                          <Check size={12} className="mr-1" /> Telah Disapa Hari Ini
                        </span>
                      ) : (
                        <span>Siap dihubungi dengan pesan personal</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(member)}
                      className={`py-2 px-3.5 rounded-xl font-heading font-bold text-xs flex items-center space-x-1.5 transition active:scale-[0.98] ${
                        isContacted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-700/20'
                      }`}
                    >
                      <Send size={13} />
                      <span>{isContacted ? 'Kirim Sapaan Ulang' : 'Kirim Motivasi Personal via WA'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
