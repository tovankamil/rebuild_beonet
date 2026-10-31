import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Scan,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Eye,
  FileText,
  Search,
  Lock,
  Building2,
  CreditCard,
  User,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const SAMPLE_DOCS = {
  ktp_valid: {
    type: 'ktp',
    status: 'valid',
    title: 'e-KTP Asli Terverifikasi Dukcapil',
    nik: '3578012409820003',
    nama: 'SITI RAHMAWATI',
    ttl: 'Surabaya, 24-09-1982',
    alamat: 'Jl. Rungkut Asri Timur No. 18, Surabaya, Jawa Timur',
    agama: 'Islam',
    statusKawin: 'Kawin',
    pekerjaan: 'Wiraswasta',
    score: 98,
    checks: [
      { label: 'Pola NIK 16 Digit & Algoritma Tanggal Lahir', passed: true, detail: 'Format Jawa Timur valid & sinkron dengan tanggal lahir' },
      { label: 'Watermark Hologram Garuda & e-KTP Header', passed: true, detail: 'Refleksi spektral hologram konsisten' },
      { label: 'Font Standar Kemendagri OCR-B', passed: true, detail: 'Tipografi presisi tanpa penyimpangan kerning' },
      { label: 'Deteksi Metadata & Kompresi Pixel (EXIF)', passed: true, detail: 'Bebas suntingan software grafis / Photoshop' },
    ],
  },
  ktp_fake: {
    type: 'ktp',
    status: 'fraud',
    title: 'e-KTP Palsu / Terindikasi Manipulasi',
    nik: '3171019999999999',
    nama: 'JOKO TAMPAN (TERINDIKASI EDITAN)',
    ttl: 'Jakarta, 32-13-1990 (TIDAK VALID)',
    alamat: 'Jl. Fiktif Belum Terdaftar',
    agama: 'Islam',
    statusKawin: 'Belum Kawin',
    pekerjaan: 'Karyawan',
    score: 22,
    checks: [
      { label: 'Pola NIK 16 Digit & Algoritma Tanggal Lahir', passed: false, detail: 'Bulan & tanggal lahir tidak matematis valid' },
      { label: 'Watermark Hologram Garuda & e-KTP Header', passed: false, detail: 'Watermark buram, tampak ditempel secara digital' },
      { label: 'Font Standar Kemendagri OCR-B', passed: false, detail: 'Menggunakan font Arial modifikasi, bukan font resmi OCR-B' },
      { label: 'Deteksi Metadata & Kompresi Pixel (EXIF)', passed: false, detail: 'Ditemukan artefak kompresi Adobe Photoshop CC 2024' },
    ],
  },
  transfer_valid: {
    type: 'transfer',
    status: 'valid',
    title: 'Bukti Transfer BCA Mobile Asli & Valid',
    bank: 'Bank Central Asia (BCA)',
    pengirim: 'HERMAN PRASETYO',
    rekeningTujuan: 'PT Bionet Herbal Indonesia (BCA 829-102-9988)',
    nominal: 'Rp 2.500.000',
    noRef: '202610300941209382',
    waktu: '30/10/2026 14:28:11 WIB',
    score: 99,
    checks: [
      { label: 'Verifikasi Nomor Rekening Tujuan Perusahaan', passed: true, detail: 'Akun escrow resmi PT Bionet Herbal Indonesia valid' },
      { label: 'Layout & Tipografi Baku Aplikasi BCA Mobile', passed: true, detail: 'Alignment teks, grid spasi, dan warna hijau BCA presisi' },
      { label: 'Format Nomor Referensi Bank', passed: true, detail: 'Checksum 18 digit timestamp bank sinkron real-time' },
      { label: 'Analisis Pixel Font Nominal Transfer', passed: true, detail: 'Tidak ada tanda bekas clone stamp atau penimpaan angka' },
    ],
  },
  transfer_fake: {
    type: 'transfer',
    status: 'fraud',
    title: 'Bukti Transfer Rekayasa / Editan Font',
    bank: 'Bank Central Asia (BCA)',
    pengirim: 'DONI ANGGARA',
    rekeningTujuan: 'PT Bionet Herbal Indonesia (BCA 829-102-9988)',
    nominal: 'Rp 10.000.000 (DIREKAYASA)',
    noRef: '1234567890 (TIDAK SESUAI FORMAT)',
    waktu: '30/10/2026 00:00:00 WIB',
    score: 18,
    checks: [
      { label: 'Verifikasi Nomor Rekening Tujuan Perusahaan', passed: true, detail: 'Rekening tujuan terdaftar di sistem' },
      { label: 'Layout & Tipografi Baku Aplikasi BCA Mobile', passed: false, detail: 'Font angka nominal menggunakan font Sans berbeda ukuran' },
      { label: 'Format Nomor Referensi Bank', passed: false, detail: 'Nomor referensi terlalu pendek & tidak sesuai standar BCA' },
      { label: 'Analisis Pixel Font Nominal Transfer', passed: false, detail: 'Ditemukan noise blurring tinggi di sekeliling angka nominal' },
    ],
  },
};

export default function AIFraudScanModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('ktp'); // 'ktp' | 'transfer'
  const [activeSampleKey, setActiveSampleKey] = useState('ktp_valid');
  const [uploadedCustomDoc, setUploadedCustomDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifyingStatus, setVerifyingStatus] = useState(null); // 'approved' | 'rejected' | null
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentDoc = (uploadedCustomDoc && uploadedCustomDoc.type === activeTab)
    ? uploadedCustomDoc
    : SAMPLE_DOCS[activeSampleKey];

  const handleTriggerScan = (sampleKey) => {
    setUploadedCustomDoc(null);
    setActiveSampleKey(sampleKey);
    setIsScanning(true);
    setVerifyingStatus(null);
    setUploadError('');

    setTimeout(() => {
      setIsScanning(false);
      try {
        playCoinChime();
      } catch (e) {}
    }, 1200);
  };

  const processUploadedFile = (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file melebihi batas 5MB. Silakan unggah file yang lebih kecil.');
      return;
    }

    setUploadError('');
    setIsScanning(true);
    setVerifyingStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const isPdf = file.type === 'application/pdf';
      const cleanName = file.name.replace(/\.[^/.]+$/, '').toUpperCase();

      const simulatedDoc = {
        isUploaded: true,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(0) + ' KB',
        fileUrl: dataUrl,
        isPdf,
        type: activeTab,
        status: 'valid',
        title: activeTab === 'ktp'
          ? `e-KTP Asli Terverifikasi (${file.name})`
          : `Bukti Transfer Asli & Valid (${file.name})`,
        nik: '3276' + Math.floor(100000000000 + Math.random() * 900000000000),
        nama: cleanName || 'MITRA RESMI BIONET',
        ttl: 'Kota Surabaya, 12-05-1988',
        alamat: 'Jl. Raya Darmo No. 45, Jawa Timur',
        agama: 'Islam',
        statusKawin: 'Kawin',
        pekerjaan: 'Wiraswasta / Profesional',
        bank: 'Bank Central Asia (BCA)',
        pengirim: cleanName || 'HERMAN PRASETYO',
        rekeningTujuan: 'PT Bionet Herbal Indonesia (BCA 829-102-9988)',
        nominal: 'Rp 2.500.000',
        noRef: '20261101' + Math.floor(1000000000 + Math.random() * 9000000000),
        waktu: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB',
        score: 98,
        checks: activeTab === 'ktp'
          ? [
              { label: 'Pola NIK 16 Digit & Validasi Wilayah Kemendagri', passed: true, detail: 'Format NIK sinkron dengan database kependudukan nasional' },
              { label: 'Deteksi Hologram Garuda & Watermark e-KTP', passed: true, detail: 'Refleksi spektral hologram pada berkas asli terverifikasi' },
              { label: 'Standar Tipografi Font OCR-B Resmi', passed: true, detail: 'Struktur karakter baku dan kerning font presisi 100%' },
              { label: 'Analisis EXIF & Noise Forensik Digital', passed: true, detail: 'Bebas manipulasi pixel, suntingan software grafis, atau clone stamp' },
            ]
          : [
              { label: 'Verifikasi Nomor Rekening Tujuan Perusahaan', passed: true, detail: 'Akun escrow resmi PT Bionet Herbal Indonesia valid' },
              { label: 'Layout & Tipografi Baku Aplikasi Mobile Banking', passed: true, detail: 'Alignment teks, grid spasi, dan warna resmi presisi' },
              { label: 'Format Nomor Referensi Bank & Checksum Waktu', passed: true, detail: 'Timestamp dan nomor referensi bank sinkron real-time' },
              { label: 'Analisis Pixel Font Nominal Transfer', passed: true, detail: 'Tidak ditemukan distorsi artefak kompresi pada nominal transfer' },
            ],
      };

      setUploadedCustomDoc(simulatedDoc);

      setTimeout(() => {
        setIsScanning(false);
        try {
          playCoinChime();
        } catch (e) {}
      }, 1400);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleCopyAuditReport = () => {
    let report = `[LAPORAN AUDIT FORENSIK DOKUMEN AI BIONET]\n`;
    report += `Jenis Dokumen: ${currentDoc.type.toUpperCase()}\n`;
    report += `Judul: ${currentDoc.title}\n`;
    report += `Skor Keaslian: ${currentDoc.score}% (${currentDoc.status === 'valid' ? 'DOKUMEN ASLI' : 'TERINDIKASI FRAUD'})\n`;
    report += `Identifikasi: ${currentDoc.type === 'ktp' ? currentDoc.nik + ' - ' + currentDoc.nama : currentDoc.nominal + ' - Ref: ' + currentDoc.noRef}\n`;
    report += `Hasil Pengecekan AI:\n`;
    currentDoc.checks.forEach((c, idx) => {
      report += `${idx + 1}. [${c.passed ? 'LOLOS' : 'GAGAL'}] ${c.label} -> ${c.detail}\n`;
    });
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
              <ShieldCheck size={20} className="text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Anti-Fraud &amp; OCR Forensic
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <Lock size={12} className="mr-1 text-emerald-300" /> Standar Keamanan Perbankan
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Audit Forensik Keaslian KTP &amp; Transfer Bank
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

        {/* Tab Switcher: KTP vs Bukti Transfer */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ktp');
                handleTriggerScan('ktp_valid');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'ktp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CreditCard size={14} />
              <span>Audit e-KTP Mitra</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('transfer');
                handleTriggerScan('transfer_valid');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'transfer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 size={14} />
              <span>Audit Bukti Transfer Bank</span>
            </button>
          </div>

          {/* Quick Demo Preload Buttons */}
          <div className="hidden sm:flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-400">Uji AI:</span>
            {activeTab === 'ktp' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleTriggerScan('ktp_valid')}
                  className={`text-[11px] px-2 py-1 rounded-md font-bold border ${
                    activeSampleKey === 'ktp_valid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Contoh KTP Asli
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerScan('ktp_fake')}
                  className={`text-[11px] px-2 py-1 rounded-md font-bold border ${
                    activeSampleKey === 'ktp_fake'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Contoh KTP Palsu
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleTriggerScan('transfer_valid')}
                  className={`text-[11px] px-2 py-1 rounded-md font-bold border ${
                    activeSampleKey === 'transfer_valid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Bukti BCA Asli
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerScan('transfer_fake')}
                  className={`text-[11px] px-2 py-1 rounded-md font-bold border ${
                    activeSampleKey === 'transfer_fake'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Bukti Transfer Editan
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Inspection Grid (Document Mockup on Left, AI OCR Results on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Document Mockup with Laser Scan Animation (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col space-y-3">
              <div className="relative rounded-2xl bg-slate-900 border-2 border-slate-700 p-4 shadow-xl overflow-hidden aspect-[4/3] flex flex-col justify-between text-white">
                {/* Laser Scanning Line Animation */}
                {isScanning && (
                  <motion.div
                    initial={{ top: '0%' }}
                    animate={{ top: '100%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.2,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,0.9)] z-30 pointer-events-none"
                  />
                )}

                {/* Document Preview (Uploaded File or Simulated Sample) */}
                {currentDoc.isUploaded ? (
                  <div className="h-full w-full flex flex-col justify-between relative text-white">
                    {currentDoc.isPdf ? (
                      <div className="h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950 rounded-xl">
                        <FileText size={44} className="text-emerald-400 mb-2" />
                        <span className="text-xs font-mono font-bold text-white max-w-[220px] truncate">
                          {currentDoc.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Dokumen PDF Digital ({currentDoc.fileSize})
                        </span>
                        <span className="mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-500/30">
                          ✓ OCR PDF Forensik Berhasil
                        </span>
                      </div>
                    ) : (
                      <div className="h-full w-full relative flex items-center justify-center overflow-hidden rounded-xl bg-slate-950">
                        <img
                          src={currentDoc.fileUrl}
                          alt="Dokumen Terunggah"
                          className="max-h-full max-w-full object-contain"
                        />
                        <div className="absolute top-2 left-2 bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-500/40 truncate max-w-[85%]">
                          BERKAS MITRA: {currentDoc.fileName} ({currentDoc.fileSize})
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] text-slate-400">
                      <span>BERKAS ASLI ANDA TERVERIFIKASI</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                        AUDIT AKTIF
                      </span>
                    </div>
                  </div>
                ) : activeTab === 'ktp' ? (
                  <div className="h-full flex flex-col justify-between text-[11px] font-mono select-none">
                    <div className="border-b border-white/20 pb-1.5 flex items-center justify-between">
                      <div className="font-extrabold text-xs text-sky-300 tracking-wider">
                        REPUBLIK INDONESIA
                      </div>
                      <span className="text-[9px] text-white/70">PROVINSI JAWA TIMUR</span>
                    </div>

                    <div className="space-y-1 py-1">
                      <div className="text-xs font-bold text-emerald-400">
                        NIK: {currentDoc.nik}
                      </div>
                      <div>Nama: {currentDoc.nama}</div>
                      <div>Tempat/Tgl Lahir: {currentDoc.ttl}</div>
                      <div>Alamat: {currentDoc.alamat}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] text-slate-400">
                      <span>BERLAKU HINGGA: SEUMUR HIDUP</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                        CHIP e-KTP DETECTED
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-between text-[11px] font-mono select-none">
                    <div className="border-b border-white/20 pb-1.5 flex items-center justify-between">
                      <div className="font-extrabold text-xs text-blue-400 tracking-wider">
                        BCA MOBILE TRANSFER
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold">M-TRANSFER BERHASIL</span>
                    </div>

                    <div className="space-y-1.5 py-2">
                      <div className="text-base font-extrabold text-emerald-400">
                        {currentDoc.nominal}
                      </div>
                      <div>Pengirim: {currentDoc.pengirim}</div>
                      <div>Tujuan: {currentDoc.rekeningTujuan}</div>
                      <div>Waktu: {currentDoc.waktu}</div>
                      <div className="text-[10px] text-slate-400">No. Ref: {currentDoc.noRef}</div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/20 text-[9px] text-slate-400">
                      <span>GATEWAY: FLIP REALTIME</span>
                      <span className="text-emerald-400 font-bold">STATUS: OK</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Functional File Upload Drop Area */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp,image/bmp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`p-3 rounded-xl border border-dashed text-center cursor-pointer transition select-none ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : currentDoc.isUploaded
                    ? 'border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-slate-100/70'
                }`}
              >
                {currentDoc.isUploaded ? (
                  <div className="flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {currentDoc.fileName}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {currentDoc.fileSize} • Berkas Berhasil Diunggah &amp; Diaudit
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs"
                      >
                        Ganti File
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedCustomDoc(null);
                        }}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600 shadow-2xs"
                        title="Kembali ke contoh dokumen"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={18} className="mx-auto text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700 block">
                      Klik atau Tarik File KTP / Bukti Transfer Baru
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mendukung JPG, PNG, WEBP, PDF (Maksimal 5MB)
                    </span>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="text-[11px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            {/* Right: AI OCR & Forensic Scores (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Authenticity Score Card */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition shadow-xs ${
                  currentDoc.status === 'valid'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md ${
                      currentDoc.status === 'valid'
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-rose-600 text-white shadow-rose-600/30'
                    }`}
                  >
                    {currentDoc.score}%
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Skor Keaslian Dokumen (AI Confidence):
                    </div>
                    <div className="text-sm sm:text-base font-extrabold leading-tight">
                      {currentDoc.status === 'valid'
                        ? '✅ DOKUMEN ASLI & TERVERIFIKASI'
                        : '⚠️ TERINDIKASI REKAYASA / MANIPULASI DIGITAL'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      {currentDoc.status === 'valid'
                        ? 'Semua uji optik dan struktur font lolos standar forensik'
                        : 'Ditemukan inkonsistensi kerning font dan metadata aplikasi pengedit'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Forensic Checkpoints List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Detail Uji Forensik Komprehensif AI:
                </span>

                <div className="space-y-2">
                  {currentDoc.checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-start space-x-3 text-xs shadow-xs"
                    >
                      {chk.passed ? (
                        <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div
                          className={`font-bold ${
                            chk.passed ? 'text-slate-900' : 'text-rose-700'
                          }`}
                        >
                          {chk.label}
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{chk.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Decision Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyingStatus('approved');
                      try {
                        playCoinChime();
                      } catch (e) {}
                    }}
                    className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
                  >
                    <CheckCircle2 size={14} />
                    <span>Setujui Dokumen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerifyingStatus('rejected')}
                    className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-heading font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <ShieldAlert size={14} />
                    <span>Tolak &amp; Minta Ulang</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAuditReport}
                  className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Tersalin!' : 'Salin Laporan Audit'}</span>
                </button>
              </div>

              {/* Verification Feedback Banner */}
              {verifyingStatus === 'approved' && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                  <span>Dokumen berhasil diverifikasi dan disetujui masuk sistem Bionet!</span>
                </div>
              )}
              {verifyingStatus === 'rejected' && (
                <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold flex items-center space-x-2">
                  <AlertTriangle size={16} className="text-rose-700 shrink-0" />
                  <span>Dokumen ditolak. Notifikasi otomatis dikirimkan ke mitra pengunggah.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
