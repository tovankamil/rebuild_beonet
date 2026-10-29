import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  CreditCard,
  Download,
  Share2,
  X,
  ShieldCheck,
  Check,
  Sparkles,
  QrCode,
  Radio,
  Cpu,
  Award,
} from 'lucide-react';
import { QrCodeSvg, drawQrToCanvas } from '../../utils/qrCodeGenerator';
import { playCoinChime } from '../../utils/soundNotification';

export default function DigitalMemberCardModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const memberId = currentUser?.id
    ? `BIO-MBR-${currentUser.id.slice(0, 8).toUpperCase()}`
    : 'BIO-MBR-2026-DEMO';
  const fullName = currentUser?.full_name || currentUser?.username || 'Mitra Bionet';
  const username = currentUser?.username || 'mitra';
  const verifyUrl = `${window.location.origin}/verify/member/${currentUser?.id || 'demo'}`;

  // Formatted date
  const memberSince = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    })
    : 'Januari 2026';

  const userRole = currentUser?.role === 'admin'
    ? 'EXECUTIVE SUPER ADMIN'
    : currentUser?.rank || 'PLATINUM DISTRIBUTOR';

  // Download High-Resolution PNG via Canvas
  const handleDownloadPNG = () => {
    setDownloading(true);
    playCoinChime();

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = 1200;
      const h = 760;
      canvas.width = w;
      canvas.height = h;

      // 1. Obsidian & Emerald Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#041611');
      bgGrad.addColorStop(0.4, '#082a20');
      bgGrad.addColorStop(0.8, '#0b3528');
      bgGrad.addColorStop(1, '#02120e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Gold Metallic Outer Border
      const goldBorder = ctx.createLinearGradient(0, 0, w, h);
      goldBorder.addColorStop(0, '#fef08a');
      goldBorder.addColorStop(0.3, '#f59e0b');
      goldBorder.addColorStop(0.7, '#d97706');
      goldBorder.addColorStop(1, '#fef08a');
      ctx.strokeStyle = goldBorder;
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Subtle inner frame
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, w - 64, h - 64);

      // 3. Header Branding
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.fillText('BIONET NETWORK SYSTEM', 60, 90);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('KARTU TANDA ANGGOTA (KTA) DIGITAL RESMI', 60, 125);

      // 4. Gold EMV Chip
      const chipX = 60;
      const chipY = 160;
      const chipW = 100;
      const chipH = 75;
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, '#fef08a');
      chipGrad.addColorStop(0.5, '#f59e0b');
      chipGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = chipGrad;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 10);
      ctx.fill();

      // Chip circuit lines
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.strokeRect(chipX + 24, chipY, 52, chipH);
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + 38);
      ctx.lineTo(chipX + chipW, chipY + 38);
      ctx.stroke();

      // Contactless NFC icon hint
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(190, 198, 14, -0.6, 0.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(190, 198, 24, -0.6, 0.6);
      ctx.stroke();

      // 5. Member Information
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText('NAMA LENGKAP MITRA', 60, 310);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Outfit", sans-serif';
      ctx.fillText(fullName.toUpperCase(), 60, 365);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText('ID ANGGOTA RESMI', 60, 440);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText(memberId, 60, 485);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`TERDAFTAR SEJAK: ${memberSince.toUpperCase()}`, 60, 550);

      // Status Pill
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.beginPath();
      ctx.roundRect(60, 580, 480, 44, 8);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('✓ DISTRIBUTOR RESMI TERVERIFIKASI BPOM', 80, 608);

      // 6. Right Column: Hologram & QR Code
      const qrSize = 220;
      const qrX = w - qrSize - 80;
      const qrY = 190;

      // QR Code Box Frame
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
      ctx.fill();

      // Draw QR Code
      drawQrToCanvas(ctx, verifyUrl, qrX, qrY, qrSize, '#071e17', '#ffffff');

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SCAN VERIFIKASI RESMI', qrX + qrSize / 2, qrY + qrSize + 42);
      ctx.textAlign = 'left';

      // Security Seal Hologram
      const sealX = w - 180;
      const sealY = 560;
      const sealRadius = 45;
      const holoGrad = ctx.createRadialGradient(sealX, sealY, 10, sealX, sealY, sealRadius);
      holoGrad.addColorStop(0, '#ffffff');
      holoGrad.addColorStop(0.4, '#f59e0b');
      holoGrad.addColorStop(0.7, '#06b6d4');
      holoGrad.addColorStop(1, '#10b981');
      ctx.fillStyle = holoGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, sealRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#071e17';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BIONET', sealX, sealY - 6);
      ctx.fillText('GENUINE', sealX, sealY + 12);
      ctx.textAlign = 'left';

      // 7. Footer text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('PT. BIONET NETWORK INDONESIA • SIUPL & BPOM COMPLIANT', 60, 690);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `KTA_Bionet_${username.toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate KTA PNG:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    playCoinChime();
    const msg =
      `*KARTU TANDA ANGGOTA (KTA) DIGITAL BIONET*
Nama: *${fullName}*
ID Anggota: *${memberId}*
Status: *DISTRIBUTOR RESMI TERVERIFIKASI BPOM*
Peringkat: *${userRole}*

Verifikasi keaslian lisensi kemitraan resmi:
${verifyUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="KTA Digital Resmi Mitra Bionet">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-400/20">
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white">
                KTA Digital Resmi Mitra Bionet
              </h3>
              <p className="text-xs text-slate-400">
                Kartu Tanda Anggota terenkripsi dengan verifikasi QR-Code BPOM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content / Visual Card Preview */}
        <div className="p-6 bg-slate-100 flex flex-col items-center">
          {/* Card Component (3D Style Obsidian Gold / Emerald) */}
          <div className="relative w-full max-w-[540px] aspect-[1.586/1] rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#041611] via-[#082a20] to-[#02120e] text-white shadow-2xl border-2 border-amber-400/60 overflow-hidden select-none">
            {/* Holographic reflection highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Top Bar: Brand & Chip */}
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-white">
                    BIONET
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.2 rounded border border-amber-400/40">
                    NETWORK
                  </span>
                </div>
                <div className="text-[10px] text-emerald-200/80 font-mono tracking-widest mt-0.5">
                  OFFICIAL MEMBER CARD
                </div>
              </div>

              {/* Holographic Security Seal */}
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 via-teal-300 to-emerald-400 p-[2px] shadow-lg shadow-teal-500/20">
                <div className="w-full h-full rounded-full bg-[#071e17] flex flex-col items-center justify-center text-[9px] font-extrabold text-amber-300">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>SEAL</span>
                </div>
              </div>
            </div>

            {/* Middle: EMV Chip & NFC */}
            <div className="relative z-10 my-4 flex items-center gap-3">
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-1 flex flex-col justify-between shadow-inner">
                <div className="h-0.5 bg-amber-800/40 rounded-full" />
                <div className="h-0.5 bg-amber-800/40 rounded-full" />
                <div className="h-0.5 bg-amber-800/40 rounded-full" />
              </div>
              <Radio size={18} className="text-amber-400/80 rotate-90" />
            </div>

            {/* Bottom Row: Member Info + QR */}
            <div className="relative z-10 flex items-end justify-between mt-auto pt-2">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-mono text-emerald-300/80 tracking-wider">
                  {userRole}
                </div>
                <div className="font-heading font-extrabold text-base sm:text-xl text-white tracking-tight uppercase line-clamp-1">
                  {fullName}
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-amber-300 tracking-wider">
                  {memberId}
                </div>
                <div className="text-[10px] text-slate-300 pt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Distributor Resmi BPOM</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-1.5 bg-white rounded-xl shadow-lg flex-shrink-0">
                <QrCodeSvg value={verifyUrl} size={64} fgColor="#071e17" />
              </div>
            </div>
          </div>

          {/* Hidden Canvas for High-Res PNG Generation */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            URL Verifikasi: <strong className="text-slate-700 font-mono">{memberId}</strong>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              <Share2 size={15} />
              <span>Bagikan KTA</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download size={15} />
              <span>{downloading ? 'Memproses...' : 'Unduh Kartu (PNG)'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
