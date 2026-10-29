import React, { useState, useEffect } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  Coins,
  HeartPulse,
  Pill,
  Users2,
  ExternalLink,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import api from '../../services/api';

export const OBJECTION_CATEGORIES = [
  {
    id: 'mahal',
    alias: 'harga_mahal',
    label: 'Harganya Mahal',
    icon: Coins,
    color: 'from-amber-500 to-yellow-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    subtitle: 'Rp 250rb terasa berat di awal',
    shortTip: 'Bagi harga jadi Rp 8.000/hari vs biaya rawat inap',
  },
  {
    id: 'efek_samping',
    alias: 'efek_samping',
    label: 'Takut Efek Samping & Ketergantungan',
    icon: HeartPulse,
    color: 'from-rose-500 to-red-600',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    subtitle: 'Khawatir bahaya ginjal atau ketergantungan',
    shortTip: 'Edukasi 100% herbal nano bebas BKO & reaksi detoks alami',
  },
  {
    id: 'obat_dokter',
    alias: 'obat_dokter',
    label: 'Boleh Bareng Obat Dokter?',
    icon: Pill,
    color: 'from-blue-500 to-indigo-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    subtitle: 'Sedang minum resep obat kimia RS',
    shortTip: 'Beri jeda 1-2 jam, herbal meregenerasi sel akar penyakit',
  },
  {
    id: 'ragu_khasiat',
    alias: 'bpom_halal',
    label: 'Sudah Resmi BPOM & Halal?',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    subtitle: 'Takut produk abal-abal tanpa izin',
    shortTip: 'Tunjukkan nomor POM TR & barcode verifikasi BPOM Mobile',
  },
  {
    id: 'bukan_mlm',
    alias: 'mlm_piramida',
    label: 'Apakah Bisnis MLM / Piramida?',
    icon: Users2,
    color: 'from-purple-500 to-violet-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    subtitle: 'Trauma sistem tutup poin & rekrut member',
    shortTip: 'Konsumen murni bebas beli tanpa syarat target atau keanggotaan',
  },
];

export default function AIObjectionHandlerModal({
  isOpen,
  onClose,
  lead = null,
  user = null,
}) {
  const [selectedType, setSelectedType] = useState('mahal');
  const [customerName, setCustomerName] = useState(lead?.name || 'Bapak/Ibu');
  const [productName, setProductName] = useState(
    lead?.product_interest || 'Bio-Propolis Trigona 30ml'
  );
  const [phone, setPhone] = useState(lead?.phone || '');
  const [tone, setTone] = useState('empatik dan persuasif');

  // Result state
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [framework, setFramework] = useState('');
  const [closingTip, setClosingTip] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync when lead prop changes
  useEffect(() => {
    if (lead) {
      setCustomerName(lead.name || 'Bapak/Ibu');
      setProductName(lead.product_interest || 'Bio-Propolis Trigona 30ml');
      setPhone(lead.phone || '');
    }
  }, [lead]);

  // Generate Objection Handler
  const generateHandler = async (overrideType = null) => {
    const typeToUse = overrideType || selectedType;
    setLoading(true);
    setCopied(false);

    try {
      const res = await api.post('/crm/ai/objection-handler', {
        objection_type: typeToUse,
        customer_name: customerName,
        product_name: productName,
        lead_name: customerName,
        lead_phone: phone,
        tone: tone,
      });

      if (res.data) {
        setGeneratedText(
          res.data.whatsapp_ready_text ||
          res.data.response_text ||
          res.data.message_text ||
          ''
        );
        setFramework(res.data.framework || 'Metodologi Closing Empati Bionet');
        setClosingTip(
          res.data.recommended_closing_tip ||
          'Tutup dengan pertanyaan alternatif pilihan paket.'
        );
      }
    } catch (err) {
      console.warn('Using client fallback objection script:', err);
      // Instant Curated Fallback
      fallbackScript(typeToUse);
    } finally {
      setLoading(false);
    }
  };

  const fallbackScript = (type) => {
    const name = customerName || 'Bapak/Ibu';
    const prod = productName || 'Bio-Propolis Trigona';

    switch (type) {
      case 'mahal':
      case 'harga_mahal':
        setFramework('Feel - Felt - Found & Value Per Day Breakdown');
        setClosingTip(
          'Pecah nominal harga menjadi Rp 8.000/hari vs biaya rawat jalan atau komplikasi rumah sakit.'
        );
        setGeneratedText(
          `Halo ${name}, terima kasih banyak atas keterbukaannya... 🙏\n\nSaya sangat memahami pertimbangan mengenai biaya. Banyak konsumen kami sebelumnya juga sempat merasa demikian di awal.\n\nNamun setelah mereka membuktikan sendiri khasiat ${prod}, 1 botol ini berisi 600 tetes murni yang cukup untuk 3-4 minggu pemakaian. Jika dihitung, investasinya hanya sekitar Rp 8.000-an per hari—jauh lebih hemat daripada secangkir kopi atau biaya berobat rawat jalan saat keluhan kambuh.\n\nSelain itu, produk ini sudah berizin resmi BPOM dan Halal MUI dengan ekstrak propolis trigona bersertifikat. Apakah berkenan kami siapkan paket 1 botol hematnya hari ini untuk pemulihan minggu pertama ${name}? 😊🌿`
        );
        break;

      case 'efek_samping':
        setFramework('BPOM Safety & Natural Detoksifikasi Education');
        setClosingTip(
          'Jelaskan perbedaan efek samping kimiawi berbahaya vs respon detoksifikasi alami (reaksi penyesuaian tubuh).'
        );
        setGeneratedText(
          `Halo ${name}, pertanyaan yang sangat bijak dan penting sekali ditanyakan! 🙏\n\n${prod} diformulasikan dari 100% bahan aktif herbal alami murni dengan Nano-Technology, tanpa BKO (Bahan Kimia Obat), tanpa alkohol, sehingga sangat aman untuk organ ginjal dan hati walau dikonsumsi harian.\n\nDi beberapa hari awal, sebagian konsumen mungkin merasakan respon adaptasi alami (cleansing reaction) seperti buang air kecil lebih lancar atau sensasi hangat—ini pertanda sirkulasi darah mulai lancar dan racun tubuh dikeluarkan. Cukup perbanyak air putih hangat.\n\nKami juga akan memandu dosis bertahap mulai 3 tetes agar tubuh ${name} beradaptasi dengan sangat nyaman. Apakah ${name} ingin mencoba mulai dosis awal bersama pendampingan kami? 🌿🩺`
        );
        break;

      case 'obat_dokter':
        setFramework('Complementary Health Integration (Jeda Waktu 1-2 Jam)');
        setClosingTip(
          'Tampilkan herbal sebagai pendamping komplementer sinergis dengan jeda waktu 1-2 jam.'
        );
        setGeneratedText(
          `Halo ${name}, kami sangat menghormati pengobatan dari dokter yang sedang dijalani ${name}! 🙏\n\nKabar baiknya, ${prod} bersifat komplementer (pendamping alami) yang aman dikonsumsi berdampingan dengan obat medis RS. Cukup beri jeda waktu 1 hingga 2 jam antara obat dokter dan herbal kami.\n\nObat dokter bekerja meredakan keluhan akut secara cepat, sedangkan herbal Bionet bekerja meregenerasi sel dan memperbaiki akar metabolisme tubuh. Banyak konsumen kami yang setelah beberapa minggu rutin, kondisi tubuhnya membaik sehingga dosis obat kimia mereka bisa diturunkan bertahap oleh dokter yang merawat.\n\nBoleh tahu obat resep apa yang sedang rutin dikonsumsi ${name} saat ini agar kami bantu aturkan jadwal minumnya? 😊📋`
        );
        break;

      case 'ragu_khasiat':
      case 'bpom_halal':
        setFramework('Evidence-Based Social Proof & Lab Verification');
        setClosingTip(
          'Tunjukkan nomor registrasi BPOM yang dapat dicek di situs resmi atau aplikasi BPOM Mobile.'
        );
        setGeneratedText(
          `Halo ${name}, sangat wajar bila ada kehati-hatian sebelum mencoba produk kesehatan! 🛡️\n\nKami tegaskan bahwa ${prod} 100% resmi memiliki izin edar BPOM RI (POM TR 226012891) serta sertifikasi Halal MUI yang bisa langsung dicek keasliannya di situs cekbpom.pom.go.id atau aplikasi BPOM Mobile.\n\nSelain legalitas resmi, kami memiliki ratusan testimoni laboratorium klinis pelanggan yang membuktikan perbaikan nyata pada asam urat, gula darah, dan kolesterol dalam 7-14 hari. Ditambah lagi, kami memiliki panduan evaluasi berkala hari ke-3, ke-7, dan ke-14.\n\nApakah ${name} ingin kami kirimkan foto sertifikat resmi BPOM dan bukti hasil lab pelanggan yang memiliki keluhan serupa? 📑✨`
        );
        break;

      case 'bukan_mlm':
      case 'mlm_piramida':
        setFramework('Direct Consumer Value & Freedom of Choice');
        setClosingTip(
          'Tegaskan bahwa konsumen tidak ada kewajiban rekrut atau target; murni pelanggan berhak atas kesembuhan.'
        );
        setGeneratedText(
          `Halo ${name}, terima kasih atas keterbukaannya. ${name} tidak perlu khawatir sama sekali! 🙏\n\nDi Bionet, fokus nomor satu kami adalah mutu khasiat produk untuk kesembuhan konsumen. ${name} murni membeli sebagai pelanggan tercinta, tanpa kewajiban jualan, tanpa tutup poin, tanpa rekrut member, dan tanpa target apapun.\n\n${name} berhak mendapatkan produk asli bergaransi dengan harga resmi terbaik langsung dari pabrik. Kesehatan dan kenyamanan ${name} adalah prioritas utama kami.\n\nBoleh kami tahu keluhan apa yang saat ini paling ingin ${name} pulihkan agar kami siapkan paket yang paling tepat? 😊🤝`
        );
        break;

      default:
        setGeneratedText(
          `Halo ${name}, terima kasih banyak atas pertanyaannya yang sangat baik! Kami di Bionet siap mendampingi ikhtiar kesehatan ${name} dengan produk herbal berstandar BPOM resmi. 😊🌿`
        );
    }
  };

  // Run on mount or when opening
  useEffect(() => {
    if (isOpen) {
      generateHandler();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const waUrl = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(generatedText)}`
    : `https://wa.me/?text=${encodeURIComponent(generatedText)}`;

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} ariaLabel="Asisten AI Penjawab Keraguan Konsumen">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-950">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-1.5">
                <span>Asisten AI Penjawab Keraguan Konsumen</span>
                <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                  Objection Handler
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Solusi closing instan: 100% legal BPOM, empatik, persuasif &amp; berkonversi tinggi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lead Context Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Nama Calon Prospek:
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama prospek"
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              WhatsApp:
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234..."
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Produk Minat:
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Bio-Propolis"
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 5 Core Objection Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-700 block">
            Pilih Keberatan / Keraguan Utama yang Disampaikan Pelanggan:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {OBJECTION_CATEGORIES.map((cat) => {
              const isSelected = selectedType === cat.id;
              const IconComp = cat.icon;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(cat.id);
                    generateHandler(cat.id);
                  }}
                  className={`p-3 rounded-2xl text-left border transition relative flex items-start space-x-2.5 ${isSelected
                    ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-0.5`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-slate-900 leading-tight">
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {cat.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Framework & Closing Tip Banner */}
        {framework && (
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-indigo-950">
            <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 min-w-0">
              <div className="font-bold text-[11px] text-indigo-900">
                Framework Penjualan: <span className="font-mono text-indigo-700">{framework}</span>
              </div>
              <p className="text-[11px] text-indigo-800/90 leading-snug">
                <strong>Tips Closing:</strong> {closingTip}
              </p>
            </div>
          </div>
        )}

        {/* AI Output Script Display */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Naskah WhatsApp Closing Siap Kirim:</span>
            </span>
            <button
              onClick={() => generateHandler()}
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-500 text-[11px] font-bold flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Generate Ulang</span>
            </button>
          </div>

          {loading ? (
            <div className="h-44 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Sparkles className="w-6 h-6 text-indigo-500 animate-spin" />
              <span className="text-xs font-semibold">
                AI sedang merancang naskah persuasif &amp; berempati...
              </span>
            </div>
          ) : (
            <textarea
              rows="7"
              value={generatedText}
              onChange={(e) => setGeneratedText(e.target.value)}
              className="w-full bg-emerald-50/20 border border-emerald-200/80 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          )}
        </div>

        {/* Action Buttons: WhatsApp & Copy */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Salin Jawaban &amp; Buka WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}
