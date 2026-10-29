import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  Award,
  Download,
  Printer,
  Share2,
  X,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { QrCodeSvg, drawQrToCanvas } from '../../utils/qrCodeGenerator';
import { playCoinChime } from '../../utils/soundNotification';

export default function ECertificateModal({
  isOpen,
  onClose,
  currentUser,
}) {
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const certId = currentUser?.id
    ? `BIO/CERT/2026/${currentUser.id.slice(0, 6).toUpperCase()}`
    : 'BIO/CERT/2026/MBR001';
  const fullName = currentUser?.full_name || currentUser?.username || 'Mitra Bionet';
  const username = currentUser?.username || 'mitra';
  const verifyUrl = `${window.location.origin}/verify/cert/${currentUser?.id || 'demo'}`;

  const issueDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    playCoinChime();
    window.print();
  };

  const handleDownloadPNG = () => {
    setDownloading(true);
    playCoinChime();

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = 1600;
      const h = 1130; // Standard A4 Landscape Aspect Ratio
      canvas.width = w;
      canvas.height = h;

      // 1. Warm Ivory Parchment Canvas
      ctx.fillStyle = '#faf8f2';
      ctx.fillRect(0, 0, w, h);

      // 2. Ornate Luxury Guilloche Double Border
      const goldGrad = ctx.createLinearGradient(0, 0, w, h);
      goldGrad.addColorStop(0, '#d97706');
      goldGrad.addColorStop(0.3, '#f59e0b');
      goldGrad.addColorStop(0.6, '#065f46');
      goldGrad.addColorStop(1, '#b45309');

      ctx.strokeStyle = goldGrad;
      ctx.lineWidth = 14;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      ctx.strokeStyle = '#044e3b';
      ctx.lineWidth = 3;
      ctx.strokeRect(58, 58, w - 116, h - 116);

      // Corner Accents
      const drawCorner = (cx, cy) => {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(cx - 15, cy - 15, 30, 30);
      };
      drawCorner(58, 58);
      drawCorner(w - 58, 58);
      drawCorner(58, h - 58);
      drawCorner(w - 58, h - 58);

      // 3. Header Text
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 36px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PT. BIONET NETWORK INDONESIA', w / 2, 140);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('IZIN USAHA PENJUALAN LANGSUNG • KEMENTERIAN PERDAGANGAN RI & BPOM', w / 2, 175);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 58px "Outfit", sans-serif';
      ctx.fillText('SERTIFIKAT KEMITRAAN RESMI', w / 2, 270);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Official Certificate of Authorized Distribution & Herbal Consultant', w / 2, 310);

      ctx.fillStyle = '#0f172a';
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Diberikan dengan hormat dan bangga kepada:', w / 2, 380);

      // 4. Recipient Name
      ctx.fillStyle = '#064e3b';
      ctx.font = 'bold 64px "Outfit", sans-serif';
      ctx.fillText(fullName.toUpperCase(), w / 2, 470);

      // Underline decorative
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w / 2 - 280, 495);
      ctx.lineTo(w / 2 + 280, 495);
      ctx.stroke();

      // ID
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText(`Nomor Registrasi: ${certId}`, w / 2, 540);

      // Paragraph
      ctx.fillStyle = '#334155';
      ctx.font = '22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        'Sebagai bukti kelayakan kemitraan dan sertifikasi Distributor Resmi & Konsultan Herbal Alami Bionet,',
        w / 2,
        610
      );
      ctx.fillText(
        'telah memenuhi standar kode etik bisnis, integritas pelayanan, dan kepatuhan regulasi izin edar BPOM RI.',
        w / 2,
        645
      );

      // 5. Signatures Row
      const leftSigX = 320;
      const rightSigX = w - 320;
      const sigY = 880;

      // Left Signature: Direktur Utama
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic bold 32px "Brush Script MT", cursive, sans-serif';
      ctx.fillText('Dr. Hendra Setiawan', leftSigX, sigY - 45);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(leftSigX - 140, sigY - 20);
      ctx.lineTo(leftSigX + 140, sigY - 20);
      ctx.stroke();

      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Dr. H. Hendra Setiawan, M.Sc', leftSigX, sigY + 12);
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Direktur Utama PT Bionet Network', leftSigX, sigY + 40);

      // Right Signature: Head of Network
      ctx.fillStyle = '#0f172a';
      ctx.font = 'italic bold 32px "Brush Script MT", cursive, sans-serif';
      ctx.fillText('Raditya Pratama, MM', rightSigX, sigY - 45);

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rightSigX - 140, sigY - 20);
      ctx.lineTo(rightSigX + 140, sigY - 20);
      ctx.stroke();

      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Ir. Raditya Pratama, MM', rightSigX, sigY + 12);
      ctx.font = '16px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Head of Business Development', rightSigX, sigY + 40);

      // Center: Official Golden Seal
      const sealX = w / 2;
      const sealY = 830;
      const sealGrad = ctx.createRadialGradient(sealX, sealY, 15, sealX, sealY, 65);
      sealGrad.addColorStop(0, '#fef08a');
      sealGrad.addColorStop(0.5, '#f59e0b');
      sealGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = sealGrad;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 15px "Outfit", sans-serif';
      ctx.fillText('OFFICIAL', sealX, sealY - 8);
      ctx.fillText('SEAL 2026', sealX, sealY + 14);

      // 6. Draw QR Code for Verification
      drawQrToCanvas(ctx, verifyUrl, 90, h - 210, 110, '#064e3b', '#ffffff');
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('SCAN VERIFIKASI', 90, h - 85);
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(issueDate, 90, h - 68);

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Sertifikat_Bionet_${username.toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate Certificate:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="E-Sertifikat Kemitraan">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="printable-area relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-400/20">
              <Award size={22} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-white">
                E-Sertifikat Kemitraan &amp; Konsultan Herbal
              </h3>
              <p className="text-xs text-emerald-200/80">
                Sertifikasi kelayakan distributor resmi berstandar BPOM RI
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

        {/* Certificate Display Area */}
        <div className="p-4 sm:p-8 bg-slate-100/70 overflow-y-auto flex justify-center">
          <div className="relative w-full max-w-[760px] aspect-[1.414/1] bg-[#faf8f2] rounded-2xl p-6 sm:p-10 shadow-xl border-4 border-amber-600/60 flex flex-col justify-between text-slate-800 select-none">
            {/* Inner Border */}
            <div className="absolute inset-3 border-2 border-emerald-900/40 rounded-xl pointer-events-none" />

            {/* Top Emblem & Brand */}
            <div className="text-center relative z-10">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-800">
                PT. BIONET NETWORK INDONESIA
              </div>
              <div className="text-[9px] text-amber-800 font-semibold uppercase tracking-wider mt-0.5">
                SIUPL &amp; BPOM RI COMPLIANCE
              </div>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 tracking-tight mt-3 uppercase">
                Sertifikat Kemitraan Resmi
              </h2>
              <p className="text-[11px] text-slate-500 italic mt-0.5">
                Authorized Distribution &amp; Herbal Consultant
              </p>
            </div>

            {/* Recipient Details */}
            <div className="text-center my-auto py-2 relative z-10">
              <div className="text-xs text-slate-500 font-medium">
                Diberikan dengan hormat kepada:
              </div>
              <div className="font-heading font-extrabold text-2xl sm:text-3xl text-emerald-900 tracking-tight mt-1 uppercase">
                {fullName}
              </div>
              <div className="w-36 h-0.5 bg-amber-500 mx-auto mt-2" />
              <div className="font-mono text-xs font-bold text-slate-600 mt-2">
                Nomor Sertifikat: {certId}
              </div>
              <p className="text-xs text-slate-600 max-w-lg mx-auto mt-3 leading-relaxed">
                Sebagai bukti sah Distributor Resmi dan Konsultan Herbal Alami Bionet, telah memenuhi kualifikasi kode etik, integritas kemitraan, dan perizinan BPOM RI.
              </p>
            </div>

            {/* Bottom Row: QR, Seal, Signatures */}
            <div className="relative z-10 flex items-end justify-between pt-4 border-t border-slate-200">
              {/* QR Verification */}
              <div className="flex items-center gap-2.5">
                <div className="p-1 bg-white rounded-lg shadow-sm">
                  <QrCodeSvg value={verifyUrl} size={48} fgColor="#064e3b" />
                </div>
                <div className="text-[9px] text-slate-500 leading-tight">
                  <span className="font-bold text-slate-700 block">Scan Verifikasi</span>
                  <span>{issueDate}</span>
                </div>
              </div>

              {/* Golden Seal Badge */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center text-center">
                <div className="w-full h-full rounded-full border border-amber-800/40 flex flex-col items-center justify-center text-[8px] font-extrabold text-amber-950">
                  <Award size={14} className="text-amber-950" />
                  <span>RESMI</span>
                </div>
              </div>

              {/* Management Signature */}
              <div className="text-right">
                <div className="font-serif italic text-sm text-slate-800 font-bold">
                  Dr. Hendra Setiawan
                </div>
                <div className="text-[10px] font-bold text-slate-800 border-t border-slate-400 pt-0.5 mt-0.5">
                  Dr. H. Hendra Setiawan, M.Sc
                </div>
                <div className="text-[9px] text-slate-500">
                  Direktur Utama PT Bionet
                </div>
              </div>
            </div>
          </div>

          {/* Hidden Canvas for High-Res Certificate Download */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Berlaku seumur hidup selama akun kemitraan berstatus aktif
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs"
            >
              <Printer size={15} />
              <span>Cetak Sertifikat</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download size={15} />
              <span>{downloading ? 'Membuat File...' : 'Unduh HD (PNG)'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
