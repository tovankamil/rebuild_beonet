import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Stethoscope,
  PenTool,
  GitFork,
  Activity,
  Mic,
  ShieldCheck,
  Bot,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';

import AIHealthConsultModal from './AIHealthConsultModal';
import AICopywritingStudioModal from './AICopywritingStudioModal';
import AIBinaryAdvisorModal from './AIBinaryAdvisorModal';
import AIChurnRadarModal from './AIChurnRadarModal';
import AIVoiceNoteModal from './AIVoiceNoteModal';
import AIFraudScanModal from './AIFraudScanModal';

export default function BionetAIFloatingHub({ currentUser, stats, onOpenRegisterDownline }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'health' | 'copywriting' | 'binary' | 'churn' | 'voicenote' | 'fraud' | null

  // Global event listener to allow any component to open specific AI module directly
  useEffect(() => {
    const handleOpenModule = (e) => {
      if (e.detail && e.detail.module) {
        setActiveModal(e.detail.module);
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('bionet:open-ai-module', handleOpenModule);
    return () => window.removeEventListener('bionet:open-ai-module', handleOpenModule);
  }, []);

  const openCopilot = () => {
    setIsMenuOpen(false);
    window.dispatchEvent(new Event('bionet:open-copilot'));
  };

  const handleSelectModule = (modKey) => {
    setIsMenuOpen(false);
    setActiveModal(modKey);
  };

  const aiModules = [
    {
      id: 'health',
      name: 'Konsultan Herbal & Resep AI',
      desc: 'Analisis keluhan, riwayat maag, dan dosis fitofarmaka BPOM.',
      icon: Stethoscope,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Resep Herbal',
    },
    {
      id: 'copywriting',
      name: 'Studio Copywriting Viral',
      desc: 'Generator naskah WA Status, Feed IG/FB & Skrip TikTok.',
      icon: PenTool,
      color: 'from-amber-500 to-orange-500',
      badge: 'Multi-Platform',
    },
    {
      id: 'binary',
      name: 'Penasihat Taktis Binary',
      desc: 'Kalkulator bonus pasangan mengendap & titik penempatan optimal.',
      icon: GitFork,
      color: 'from-teal-600 to-emerald-600',
      badge: 'Pairing Booster',
    },
    {
      id: 'churn',
      name: 'Radar Retensi & Churn Downline',
      desc: 'Deteksi dini mitra jenuh dan pesan motivasi WhatsApp personal.',
      icon: Activity,
      color: 'from-rose-500 to-pink-500',
      badge: 'Anti-Burnout',
    },
    {
      id: 'voicenote',
      name: 'Studio AI Voice Note WA',
      desc: 'Sintesis audio sapaan prospek dengan waveform equalizer dinamis.',
      icon: Mic,
      color: 'from-cyan-600 to-teal-600',
      badge: 'Voice Note',
    },
    {
      id: 'fraud',
      name: 'Audit Forensik KTP & Transfer',
      desc: 'Uji optik laser OCR, keaslian font, dan skor integritas dokumen.',
      icon: ShieldCheck,
      color: 'from-indigo-600 to-blue-600',
      badge: 'Anti-Fraud',
    },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] right-4 sm:right-6 z-40 flex items-center">
        {/* Soft Glowing Radar Ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-sm animate-pulse pointer-events-none" />

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="relative bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 hover:from-emerald-700 hover:to-teal-900 text-white px-4 py-3 rounded-full shadow-[0_8px_25px_rgba(4,120,87,0.45)] border border-emerald-400/40 flex items-center space-x-2.5 transition group"
          aria-label="Buka Menu Bionet AI Hub"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-400/50">
            <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Bionet AI Hub
            </div>
            <div className="text-xs font-black text-white leading-tight">
              6 Fitur Cerdas
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping sm:hidden" />
        </motion.button>
      </div>

      {/* Drawer / Popover Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:pr-8 p-3 sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Menu Panel Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[85vh] text-slate-800"
            >
              {/* Luxury DashLite Emerald Header */}
              <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4.5 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 shadow-md">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm text-white">
                      Bionet AI Intelligence Suite
                    </h3>
                    <p className="text-[10px] text-emerald-300">
                      Pusat Fitur AI Cerdas Mitra &amp; CRM Herbal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition"
                  aria-label="Tutup Menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Module Cards List */}
              <div className="p-3.5 overflow-y-auto space-y-2 flex-1">
                {aiModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleSelectModule(mod.id)}
                      className="w-full p-3 rounded-2xl border border-slate-200/90 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-left transition flex items-center justify-between group shadow-xs active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-heading font-bold text-xs text-slate-900">
                              {mod.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {mod.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition shrink-0 ml-2"
                      />
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Row: Chat Copilot */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={openCopilot}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-xs"
                >
                  <Bot size={15} className="text-emerald-400" />
                  <span>Buka Tanya Asisten AI (Chat Copilot)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Render All 6 Modals Based on State */}
      <AIHealthConsultModal
        isOpen={activeModal === 'health'}
        onClose={() => setActiveModal(null)}
        partnerWhatsApp={currentUser?.phone || ''}
        partnerName={currentUser?.full_name || 'Konsultan Herbal Bionet'}
      />

      <AICopywritingStudioModal
        isOpen={activeModal === 'copywriting'}
        onClose={() => setActiveModal(null)}
        partnerWhatsApp={currentUser?.phone || ''}
        partnerName={currentUser?.full_name || 'Mitra Resmi Bionet'}
      />

      <AIBinaryAdvisorModal
        isOpen={activeModal === 'binary'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
        stats={stats}
        onOpenRegisterDownline={onOpenRegisterDownline}
      />

      <AIChurnRadarModal
        isOpen={activeModal === 'churn'}
        onClose={() => setActiveModal(null)}
      />

      <AIVoiceNoteModal
        isOpen={activeModal === 'voicenote'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
      />

      <AIFraudScanModal
        isOpen={activeModal === 'fraud'}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
