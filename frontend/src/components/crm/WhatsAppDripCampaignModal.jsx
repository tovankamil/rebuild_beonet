import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  X,
  MessageCircle,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Play,
  RotateCw,
  Power,
  Sliders,
  Calendar,
  Smartphone,
  ChevronRight,
  Droplets,
  HeartPulse,
  Award,
  Zap,
  Flame,
  UserCheck,
} from 'lucide-react';
import { playNotificationPing, playGoldCoinChime } from '../../utils/audioChime';

const DRIP_STAGES_CONFIG = [
  {
    day: 3,
    id: 'stage_day_3',
    title: 'Hari 3: Cek Reaksi Detox Alami',
    subtitle: 'Evaluasi adaptasi tubuh & hidrasi sel',
    icon: Droplets,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    colorAccent: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    defaultTime: '09:00 WIB',
    defaultEnabled: true,
    messageTemplate: `Halo Bapak/Ibu {nama}, salam hangat dari SYNETIQ Herbal Care! 🌿✨\n\nAlhamdulillah hari ini sudah hari ke-3 konsumsi rutin {produk}.\n\nBagaimana rasa dan respon di tubuh sejauh ini? Apakah mulai terasa keringat lebih hangat atau BAB lebih lancar? Itu adalah proses detoksifikasi (pengeluaran sisa racun metabolisme).\n\n💡 Tips penting: Pastikan minum air putih minimal 2,5 liter per hari agar sel tubuh terhidrasi optimal ya Bapak/Ibu!`,
  },
  {
    day: 7,
    id: 'stage_day_7',
    title: 'Hari 7: Edukasi Pola Hidup Sehat & Dosis',
    subtitle: 'Perbaikan metabolisme seluler & nutrisi',
    icon: HeartPulse,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    colorAccent: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    defaultTime: '10:00 WIB',
    defaultEnabled: true,
    messageTemplate: `Semangat pagi Bapak/Ibu {nama}! Semoga selalu diberikan nikmat sehat. 🌸\n\nMemasuki 1 minggu konsumsi {produk}, organ tubuh mulai meregenerasi sel-sel baru. Agar khasiatnya berlipat ganda:\n\n1. Kurangi gorengan bertepung dan minuman manis buatan\n2. Teteskan/minum {produk} 30 menit sebelum makan saat perut kosong\n3. Tidur berkualitas minimal 7 jam\n\nBagaimana kualitas tidur dan stamina Bapak/Ibu saat bangun pagi saat ini? Boleh cerita di sini ya! 😊`,
  },
  {
    day: 14,
    id: 'stage_day_14',
    title: 'Hari 14: Testimoni Khasiat & Penguatan Komitmen',
    subtitle: 'Cerita kesembuhan nyata & evaluasi keluhan',
    icon: Award,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    colorAccent: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    defaultTime: '14:30 WIB',
    defaultEnabled: true,
    messageTemplate: `Halo Bapak/Ibu {nama}, selamat sudah konsumsi rutin selama 2 minggu penuh! 👏✨\n\nBanyak konsumen kami yang memiliki keluhan serupa merasakan nyeri persendian reda dan tekanan darah lebih stabil di minggu ke-2 ini berkat kebaikan bioflavonoid alami {produk}.\n\nBagaimana perubahan positif yang paling terasa pada tubuh Bapak/Ibu? Konsistensi adalah kunci utama penyembuhan alami dari akar penyakit. Tetap semangat! 🌟`,
  },
  {
    day: 25,
    id: 'stage_day_25',
    title: 'Hari 25: Reminder Repeat Order & Diskon Mitra',
    subtitle: 'Sisa botol menipis & voucher hemat 20%',
    icon: Sparkles,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    colorAccent: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    defaultTime: '11:00 WIB',
    defaultEnabled: true,
    messageTemplate: `Salam sehat Bapak/Ibu {nama}! 🙏\n\nBiasanya di hari ke-25, botol {produk} Bapak/Ibu sudah tersisa untuk 3-5 hari ke depan.\n\nAgar proses pemulihan tidak terputus, kami siapkan VOUCHER KHUSUS REPEAT ORDER diskon 20% atau subsidi ongkir seluruh Indonesia.\n\nBapak/Ibu juga bisa klaim paket Kemitraan Reseller agar dapat harga pabrik seumur hidup.\n\n👉 Klik link untuk pesan ulang sekarang: {link_ro}\nAtau balas pesan ini: "MAU RO" ya Bapak/Ibu!`,
  },
];

export default function WhatsAppDripCampaignModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [stages, setStages] = useState(DRIP_STAGES_CONFIG);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);

  // Simulation variables
  const [simName, setSimName] = useState('Haji Bambang Sutrisno');
  const [simPhone, setSimPhone] = useState('081288992211');
  const [simProduct, setSimProduct] = useState('Bio-Propolis Trigona 30ml');
  const [simLinkRO] = useState('https://synetiq.id/order/bambang-ro');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentStage = stages[selectedStageIndex];

  // Render personalized text
  const renderPreviewText = (template) => {
    return template
      .replace(/{nama}/g, simName || 'Pelanggan')
      .replace(/{produk}/g, simProduct || 'Bio-Propolis Trigona')
      .replace(/{hari_ke}/g, currentStage.day)
      .replace(/{link_ro}/g, simLinkRO);
  };

  const handleToggleStage = (index) => {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], defaultEnabled: !updated[index].defaultEnabled };
      return updated;
    });
    playNotificationPing();
  };

  const handleUpdateTemplate = (index, newText) => {
    setStages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], messageTemplate: newText };
      return updated;
    });
  };

  const handleCopyMessage = () => {
    const text = renderPreviewText(currentStage.messageTemplate);
    navigator.clipboard.writeText(text);
    setCopied(true);
    playNotificationPing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    playNotificationPing();

    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({
        status: 'success',
        phone: simPhone,
        customer: simName,
        stage: currentStage.title,
        dispatchedAt: new Date().toLocaleTimeString('id-ID'),
      });
      playGoldCoinChime();
    }, 1200);
  };

  const handleOpenDirectWhatsApp = () => {
    const text = renderPreviewText(currentStage.messageTemplate);
    let clean = simPhone.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  WhatsApp Drip Nurturing (Siklus 3-7-14-25 Hari)
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Auto-Nurturing AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Otomatisasi follow-up edukasi konsumsi herbal, monitoring reaksi detoks, dan peningkatan repeat order mitra.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Global Master Switch */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-bold text-slate-300">
                {masterEnabled ? 'Campaign Aktif' : 'Campaign Nonaktif'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMasterEnabled(!masterEnabled);
                  playNotificationPing();
                }}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  masterEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Milestone Cycle Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stages.map((stage, idx) => {
              const isSelected = selectedStageIndex === idx;
              const IconComp = stage.icon;

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStageIndex(idx)}
                  className={`cursor-pointer rounded-2xl p-4 border transition duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${stage.badgeColor}`}>
                      Hari {stage.day}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStage(idx);
                      }}
                      className={`w-7 h-4 flex items-center rounded-full p-0.5 transition ${
                        stage.defaultEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                      }`}
                      title={stage.defaultEnabled ? 'Nonaktifkan tahap ini' : 'Aktifkan tahap ini'}
                    >
                      <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <IconComp className={`w-4 h-4 ${stage.colorAccent}`} />
                    <h4 className="text-xs font-bold text-white truncate">{stage.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{stage.subtitle}</p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Pukul {stage.defaultTime}</span>
                    <span className={stage.defaultEnabled ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {stage.defaultEnabled ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two-Column Editor & Live Phone Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Template Editor & Personalization Variables */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <span>Edit Template Pesan - {currentStage.title}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Gunakan variabel dinamis agar pesan terasa personal dan eksklusif.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    Auto-Queue: 09:00 WIB
                  </span>
                </div>

                {/* Variable Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-slate-400 font-semibold mr-1">Variabel:</span>
                  {['{nama}', '{produk}', '{hari_ke}', '{link_ro}'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        handleUpdateTemplate(
                          selectedStageIndex,
                          currentStage.messageTemplate + ' ' + v
                        )
                      }
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] border border-slate-700 transition"
                    >
                      + {v}
                    </button>
                  ))}
                </div>

                {/* Message Textarea */}
                <div>
                  <textarea
                    rows={8}
                    value={currentStage.messageTemplate}
                    onChange={(e) => handleUpdateTemplate(selectedStageIndex, e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                {/* Simulation Input Panel */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Prospek Uji Coba:</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nomor WhatsApp Prospek:</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Simulation Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSimulating ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Mengirim Drip Simulasi...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Jalankan Simulasi Drip ke Prospek</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenDirectWhatsApp}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center space-x-1.5 border border-slate-700"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Buka via WA Web</span>
                  </button>
                </div>

                {/* Result Feedback Banner */}
                {simulationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        Simulasi Sukses terkirim ke <strong>{simulationResult.customer}</strong> ({simulationResult.phone})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/80">
                      [{simulationResult.dispatchedAt}]
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right 5 Cols: WhatsApp Chat Bubble Mockup */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Preview Layar WhatsApp Konsumen</span>
                </span>
                <button
                  onClick={handleCopyMessage}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
                </button>
              </div>

              {/* Realistic WhatsApp Smartphone Shell */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-2 shadow-2xl">
                {/* Chat Header Bar */}
                <div className="bg-[#0b141a] px-3.5 py-2.5 rounded-t-2xl flex items-center space-x-3 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-xs">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">SYNETIQ Customer Care</div>
                    <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Online | Official Verified</span>
                    </div>
                  </div>
                </div>

                {/* Chat Wallpaper Area */}
                <div
                  className="p-3.5 min-h-[360px] max-h-[380px] overflow-y-auto space-y-3 rounded-b-2xl"
                  style={{
                    backgroundColor: '#0b141a',
                    backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  <div className="text-center">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-slate-400 text-[10px] font-mono shadow-xs">
                      HARI INI • 09:00 WIB
                    </span>
                  </div>

                  {/* Incoming Simulated Bubble */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[92%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-xs p-3.5 shadow-md relative text-xs leading-relaxed">
                      <p className="whitespace-pre-line break-words text-slate-100">
                        {renderPreviewText(currentStage.messageTemplate)}
                      </p>
                      <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-emerald-200/70">
                        <span>{currentStage.defaultTime.replace(' WIB', '')}</span>
                        <span>✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Helper explanation */}
              <div className="text-[11px] text-slate-500 text-center">
                Pesan akan dikirim otomatis oleh Gateway WhatsApp SYNETIQ pada jam kerja secara berurutan.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Siklus 3-7-14-25 telah terbukti menaikkan konversi repeat order hingga 340%.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Selesai
          </button>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
