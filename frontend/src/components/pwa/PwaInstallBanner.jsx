import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Volume2, Sparkles, Check, Share } from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('bionet_pwa_dismissed') === 'true';
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [chimeTested, setChimeTested] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.removeItem('bionet_pwa_dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosGuide((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('bionet_pwa_dismissed', 'true');
  };

  const handleTestChime = () => {
    playCoinChime();
    setChimeTested(true);
    setTimeout(() => setChimeTested(false), 2200);
  };

  // If already installed or explicitly dismissed (and not prompting), return null
  if (isInstalled || (isDismissed && !deferredPrompt && !isIOS)) {
    return null;
  }

  // Only show if can install or on iOS without standalone
  const canInstall = !!deferredPrompt || isIOS;
  if (!canInstall) return null;

  return (
    <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-[#071e17] via-[#093527] to-[#0b281f] p-3.5 sm:p-4 text-white shadow-lg border border-emerald-500/25">
      {/* Ambient background decoration */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-36 h-36 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info Column */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 flex-shrink-0">
            <Smartphone size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold tracking-tight text-white">
                Pasang Aplikasi Bionet di HP
              </h4>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PWA Standalone
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Akses cepat tanpa browser, notifikasi instan komisi masuk &amp; hemat kuota data.
            </p>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleTestChime}
            title="Dengarkan simulasi audio koin komisi masuk"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              chimeTested
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 scale-95'
                : 'bg-white/10 hover:bg-white/15 text-emerald-200 border-emerald-500/30 hover:border-emerald-400'
            }`}
          >
            {chimeTested ? (
              <>
                <Check size={14} className="text-amber-300" />
                <span className="font-bold">Kring! Komisi!</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-amber-400" />
                <span>Uji Suara Komisi</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>{isIOS ? 'Cara Pasang di iOS' : 'Install Sekarang'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            title="Sembunyikan pesan ini"
            className="p-1.5 rounded-lg text-emerald-300/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Guide */}
      {showIosGuide && isIOS && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20 text-xs text-emerald-100/90 bg-emerald-950/40 p-3 rounded-xl flex flex-col gap-1.5">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Share size={13} />
            <span>Petunjuk Pemasangan Safari iOS:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-200 text-[11px]">
            <li>Ketuk tombol <strong className="text-white">Bagikan (Share)</strong> di bagian bawah layar Safari.</li>
            <li>Gulir ke bawah dan pilih opsi <strong className="text-amber-300">"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
            <li>Ketuk <strong className="text-emerald-400">Tambah (Add)</strong> di pojok kanan atas. Ikon Bionet akan langsung tampil di Home HP Anda!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
