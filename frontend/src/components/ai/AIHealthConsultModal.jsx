import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Stethoscope,
  ShieldCheck,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Send,
  Copy,
  Check,
  RefreshCw,
  Info,
  Clock,
  Pill,
  Apple,
  ExternalLink,
  User,
  Activity,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const COMPLAINT_PRESETS = [
  {
    id: 'asam_urat',
    label: 'Asam Urat & Nyeri Sendi',
    category: 'Sendi & Tulang',
    products: [
      {
        name: 'Bio-Propolis Trigona 30ml',
        badge: 'Formula Utama',
        bpom: 'POM TR 226012891',
        dose: '3x sehari @ 7 tetes dilarutkan dalam 100ml air hangat (pagi, siang, malam).',
        timing: 'Diminum 30 menit sebelum makan.',
        action: 'Menekan kristal asam urat, meredakan inflamasi sendi, dan regenerasi jaringan.',
        price: 250000,
      },
      {
        name: 'Bio-Herbal Drops 30ml',
        badge: 'Pendukung Detoks',
        bpom: 'POM TR 213609811',
        dose: '2x sehari @ 5 tetes.',
        timing: 'Malam sebelum tidur untuk melancarkan pembuangan asam urat lewat ginjal.',
        action: 'Meningkatkan fungsi filtrasi ginjal agar pembuangan purin optimal.',
        price: 225000,
      },
    ],
    dietAdvice: [
      'Hindari jeroan, emping melinjo, kerang, dan daging merah berlemak tinggi.',
      'Perbanyak konsumsi air putih minimal 2.5 - 3 liter per hari untuk melarutkan kristal purin.',
      'Kompres hangat area persendian yang meradang saat pagi hari.',
    ],
    contraindicationSafe: 'Aman untuk lambung sensitif dengan jeda minum 15 menit setelah makan ringan.',
    severityNote: 'Estimasi pemulihan bertahap terasa dalam 5-10 hari konsumsi teratur.',
  },
  {
    id: 'gerd_maag',
    label: 'Asam Lambung & GERD Menahun',
    category: 'Pencernaan',
    products: [
      {
        name: 'Bio-Herbal Drops 30ml',
        badge: 'Formula Penenang Lambung',
        bpom: 'POM TR 213609811',
        dose: '3x sehari @ 5 tetes dalam air hangat kuku.',
        timing: 'Diminum saat perut kosong (15-20 menit sebelum makan).',
        action: 'Melapisi mukosa lambung dari asam hidroklorida berlebih dan cegah iritasi lambung.',
        price: 225000,
      },
      {
        name: 'Bio-Propolis Trigona 30ml',
        badge: 'Anti-Bakteri H.Pylori',
        bpom: 'POM TR 226012891',
        dose: '2x sehari @ 5 tetes.',
        timing: 'Pagi hari dan malam sebelum tidur.',
        action: 'Menumpas koloni bakteri Helicobacter Pylori dan menyembuhkan luka tukak lambung.',
        price: 250000,
      },
    ],
    dietAdvice: [
      'Hindari kopi, makanan pedas, santan kental, tomat, dan buah berasam tinggi (jeruk/nanas).',
      'Pola makan porsi kecil namun sering (4-5 kali sehari). Jangan langsung rebahan setelah makan.',
      'Kelola stres dan usahakan tidur malam tidak larut (> 23.00 WIB).',
    ],
    contraindicationSafe: 'Formula bebas alkohol dan non-asam, tidak memicu perih di kerongkongan.',
    severityNote: 'Rasa sesak dan perih dada umumnya membaik dalam 3-7 hari pertama.',
  },
  {
    id: 'diabetes',
    label: 'Gula Darah & Gejala Diabetes',
    category: 'Metabolisme',
    products: [
      {
        name: 'Bio-Propolis Trigona 30ml',
        badge: 'Aktivator Pankreas',
        bpom: 'POM TR 226012891',
        dose: '3x sehari @ 8 tetes air hangat.',
        timing: 'Diminum 30 menit sebelum makan.',
        action: 'Senyawa CAPE & Quercetin merangsang kepekaan insulin dan regenerasi sel beta pankreas.',
        price: 250000,
      },
    ],
    dietAdvice: [
      'Batasi karbohidrat sederhana, gula pasir, nasi putih berlebih, dan minuman kemasan.',
      'Ganti karbohidrat dengan beras merah, oatmeal, dan sayuran hijau berserat tinggi.',
      'Lakukan jalan pagi santai 20-30 menit secara konsisten setiap hari.',
    ],
    contraindicationSafe: 'Dapat dikonsumsi berdampingan dengan obat medis diabetes dengan jeda 1 jam.',
    severityNote: 'Pantau gula darah berkala setiap 5-7 hari.',
  },
  {
    id: 'kolesterol',
    label: 'Kolesterol & Sirkulasi Jantung',
    category: 'Kardiovaskular',
    products: [
      {
        name: 'Bio-Propolis Trigona 30ml',
        badge: 'Pembersih Plak Vaskular',
        bpom: 'POM TR 226012891',
        dose: '3x sehari @ 7 tetes.',
        timing: 'Diminum sebelum makan.',
        action: 'Flavonoid bio-aktif mengikis timbunan kolesterol jahat (LDL) di dinding pembuluh darah.',
        price: 250000,
      },
      {
        name: 'Bio-Energy Refresh Spray 100ml',
        badge: 'Relaksasi Sirkulasi',
        bpom: 'POM NA 18220104821',
        dose: 'Semprotkan 2-3 kali di bagian tengkuk leher dan pergelangan tangan saat leher terasa tegang.',
        timing: 'Kapan saja saat tegang/pusing.',
        action: 'Memberikan relaksasi ion negatif dan melancarkan sirkulasi ke kepala.',
        price: 175000,
      },
    ],
    dietAdvice: [
      'Kurangi makanan yang digoreng berulang kali dan lemak trans.',
      'Perbanyak konsumsi alpukat, kacang almond, minyak zaitun, dan ikan laut.',
      'Cukupi istirahat minimal 7 jam per malam.',
    ],
    contraindicationSafe: 'Alami tanpa bahan kimia obat (BKO), aman bagi ginjal jangka panjang.',
    severityNote: 'Leher kaku dan pusing berangsur ringan dalam 4-6 hari.',
  },
  {
    id: 'mata_lelah',
    label: 'Mata Minus, Silau & Katarak Dini',
    category: 'Indera & Penglihatan',
    products: [
      {
        name: 'Bio-Energy Refresh Spray 100ml',
        badge: 'Nutrisi Seluler Eksternal',
        bpom: 'POM NA 18220104821',
        dose: 'Pejamkan mata, semprotkan dengan jarak 15cm ke area sekitar kelopak mata (2-3 kali sehari).',
        timing: 'Pagi hari dan setelah beraktivitas di depan layar HP/laptop.',
        action: 'Meredakan ketegangan otot akomodasi mata dan memperbaiki oksigenasi mata.',
        price: 175000,
      },
      {
        name: 'Bio-Propolis Trigona 30ml',
        badge: 'Antioksidan Retina',
        bpom: 'POM TR 226012891',
        dose: '2x sehari @ 5 tetes diminum.',
        timing: 'Pagi dan malam.',
        action: 'Melindungi sel fotoreseptor retina dari kerusakan radikal bebas sinar biru (blue light).',
        price: 250000,
      },
    ],
    dietAdvice: [
      'Gunakan aturan 20-20-20: setiap 20 menit menatap layar, pandang objek berjarak 6 meter selama 20 detik.',
      'Perbanyak konsumsi wortel, tomat, bayam, dan buah berry.',
    ],
    contraindicationSafe: 'Spray tidak perih, pH seimbang dan ramah bagi kelopak mata sensitif.',
    severityNote: 'Mata lelah dan kering mereda dalam 15-30 menit setelah semprotan pertama.',
  },
];

export default function AIHealthConsultModal({
  isOpen,
  onClose,
  partnerWhatsApp = '',
  partnerName = 'Konsultan Herbal Bionet',
}) {
  const [step, setStep] = useState('input'); // 'input' | 'analyzing' | 'result'
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('42');
  const [patientGender, setPatientGender] = useState('Wanita');
  const [selectedComplaintId, setSelectedComplaintId] = useState('asam_urat');
  const [symptomDuration, setSymptomDuration] = useState('1-3 bulan');
  const [severity, setSeverity] = useState('Sedang');
  const [hasUlcer, setHasUlcer] = useState(false);
  const [hasAllergy, setHasAllergy] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Analyzing animation state
  const [analyzingStage, setAnalyzingStage] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedPreset =
    COMPLAINT_PRESETS.find((p) => p.id === selectedComplaintId) || COMPLAINT_PRESETS[0];

  const handleStartAnalysis = () => {
    setStep('analyzing');
    setAnalyzingStage(1);

    setTimeout(() => {
      setAnalyzingStage(2);
    }, 900);

    setTimeout(() => {
      setAnalyzingStage(3);
    }, 1800);

    setTimeout(() => {
      setStep('result');
      try {
        playCoinChime();
      } catch (e) {}
    }, 2700);
  };

  const handleQuickPreset = (presetId) => {
    setSelectedComplaintId(presetId);
    if (presetId === 'asam_urat') {
      setPatientName('Ibu Maryam');
      setPatientAge('52');
      setPatientGender('Wanita');
      setSeverity('Sedang');
      setHasUlcer(true);
      setAdditionalNotes('Jempol kaki kanan sering bengkak merah terutama saat bangun tidur.');
    } else if (presetId === 'gerd_maag') {
      setPatientName('Bpk. Hendra');
      setPatientAge('38');
      setPatientGender('Pria');
      setSeverity('Akut');
      setHasUlcer(true);
      setAdditionalNotes('Tenggorokan panas terbakar, dada sesak dan sering begah setelah makan.');
    } else if (presetId === 'diabetes') {
      setPatientName('Bpk. Sudirman');
      setPatientAge('56');
      setPatientGender('Pria');
      setSeverity('Sedang');
      setHasUlcer(false);
      setAdditionalNotes('Gula darah puasa 210 mg/dL, sering haus malam hari dan cepat lelah.');
    }
  };

  const calculateTotalPrice = () => {
    return selectedPreset.products.reduce((acc, p) => acc + p.price, 0);
  };

  const generateWhatsAppMessage = () => {
    const pName = patientName.trim() || 'Prospek';
    let text = `*KONSULTASI RESEP HERBAL AI BIONET*\n`;
    text += `--------------------------------------\n`;
    text += `👤 *Pasien:* ${pName} (${patientAge} th, ${patientGender})\n`;
    text += `🩺 *Keluhan:* ${selectedPreset.label} (${severity})\n`;
    text += `⏱️ *Durasi:* ${symptomDuration}\n`;
    if (hasUlcer) text += `⚠️ *Riwayat:* Ada riwayat asam lambung / maag\n`;
    if (hasAllergy) text += `⚠️ *Riwayat:* Ada alergi spesifik\n`;
    if (additionalNotes) text += `📝 *Catatan:* ${additionalNotes}\n`;
    text += `--------------------------------------\n`;
    text += `🌿 *REKOMENDASI PRODUK RESMI BPOM:*\n`;

    selectedPreset.products.forEach((p, idx) => {
      text += `\n${idx + 1}. *${p.name}* (${p.bpom})\n`;
      text += `   • *Aturan:* ${p.dose}\n`;
      text += `   • *Waktu:* ${p.timing}\n`;
      text += `   • *Khasiat:* ${p.action}\n`;
    });

    text += `\n🥗 *Anjuran Gaya Hidup & Pantangan:*\n`;
    selectedPreset.dietAdvice.forEach((advice) => {
      text += `• ${advice}\n`;
    });

    text += `\n--------------------------------------\n`;
    text += `💰 *Estimasi Paket:* Rp ${calculateTotalPrice().toLocaleString('id-ID')}\n\n`;
    text += `Halo ${partnerName}, saya ingin pesan paket resep herbal ini untuk segera dikirimkan. Bagaimana cara pemesanan dan pembayarannya?`;

    return text;
  };

  const handleSendWhatsApp = () => {
    const rawNumber = partnerWhatsApp.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
    const msg = encodeURIComponent(generateWhatsAppMessage());
    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
  };

  const handleCopyPrescription = () => {
    navigator.clipboard.writeText(generateWhatsAppMessage());
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

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800"
      >
        {/* Luxury DashLite Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
              <Stethoscope size={20} className="text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Fitofarmaka Bionet
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <ShieldCheck size={12} className="mr-1 text-emerald-300" /> Standar BPOM RI
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Konsultan Herbal &amp; Resep AI
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
          {step === 'input' && (
            <div className="space-y-5">
              {/* Preset Chips */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  ⚡ Contoh Kasus Cepat (Klik untuk Coba Langsung):
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('asam_urat')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                      selectedComplaintId === 'asam_urat'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    🦶 Asam Urat &amp; Nyeri Sendi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('gerd_maag')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                      selectedComplaintId === 'gerd_maag'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    🔥 GERD &amp; Maag Menahun
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPreset('diabetes')}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${
                      selectedComplaintId === 'diabetes'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    🩸 Gula Darah &amp; Pankreas
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Pasien / Prospek
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Contoh: Ibu Maryam"
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Usia Pasien</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      min="1"
                      max="120"
                      className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                    />
                    <span className="text-xs text-slate-500 ml-2">Tahun</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white"
                  >
                    <option value="Wanita">Wanita</option>
                    <option value="Pria">Pria</option>
                  </select>
                </div>
              </div>

              {/* Primary Complaint Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Keluhan Utama yang Dirasakan:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COMPLAINT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedComplaintId(preset.id)}
                      className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                        selectedComplaintId === preset.id
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          selectedComplaintId === preset.id
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {selectedComplaintId === preset.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{preset.label}</div>
                        <div className="text-[11px] text-slate-500">{preset.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Lama Keluhan Berlangsung
                  </label>
                  <select
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none bg-white"
                  >
                    <option value="< 1 Minggu">&lt; 1 Minggu (Baru Muncul)</option>
                    <option value="1-3 bulan">1 - 3 Bulan</option>
                    <option value="3-6 bulan">3 - 6 Bulan</option>
                    <option value="> 1 Tahun (Menahun)">&gt; 1 Tahun (Kronis Menahun)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tingkat Keparahan / Gangguan Aktivitas
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Ringan', 'Sedang', 'Akut'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSeverity(lvl)}
                        className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition ${
                          severity === lvl
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Medical History Checkboxes */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Riwayat Khusus / Keadaan Tertentu:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasUlcer}
                      onChange={(e) => setHasUlcer(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ada Riwayat Maag / Asam Lambung Sensitif</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasAllergy}
                      onChange={(e) => setHasAllergy(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Alergi Produk Lebah / Propolis Ekstrak</span>
                  </label>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Gejala Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Misal: Sering kram di malam hari, hasil tes darah terakhir, obat dokter yang sedang dikonsumsi..."
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-heading font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.99]"
                >
                  <Sparkles size={18} className="animate-pulse" />
                  <span>Analisis AI &amp; Racik Resep Herbal Sinergis</span>
                </button>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Stethoscope size={28} className="text-emerald-700 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Mesin AI Fitofarmaka Sedang Bekerja...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Mencocokkan profil pasien dengan bio-flavonoid CAPE &amp; parameter BPOM RI
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2 text-left pt-2">
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle2
                    size={14}
                    className={analyzingStage >= 1 ? 'text-emerald-600' : 'text-slate-300'}
                  />
                  <span className={analyzingStage >= 1 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    Verifikasi interaksi herbal &amp; riwayat maag
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle2
                    size={14}
                    className={analyzingStage >= 2 ? 'text-emerald-600' : 'text-slate-300'}
                  />
                  <span className={analyzingStage >= 2 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    Merumuskan takaran dosis harian bio-aktif
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <CheckCircle2
                    size={14}
                    className={analyzingStage >= 3 ? 'text-emerald-600' : 'text-slate-300'}
                  />
                  <span className={analyzingStage >= 3 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    Menyusun anjuran gaya hidup &amp; pantangan
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-5">
              {/* Patient Badge Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">
                    Lembar Rekomendasi Resep AI #BN-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {patientName.trim() || 'Pasien / Prospek'} ({patientAge} th, {patientGender})
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Keluhan: <span className="font-semibold text-emerald-900">{selectedPreset.label}</span> • Tingkat {severity} ({symptomDuration})
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center space-x-1"
                  >
                    <RefreshCw size={12} />
                    <span>Ubah Data</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPrescription}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center space-x-1 shadow-xs"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Tersalin!' : 'Salin Resep'}</span>
                  </button>
                </div>
              </div>

              {/* Products Prescriptions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center">
                  <Pill size={14} className="mr-1.5 text-emerald-600" />
                  Rangkaian Produk Terapi Sinergis Bionet:
                </h4>

                <div className="space-y-3">
                  {selectedPreset.products.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white shadow-xs transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-heading font-bold text-sm text-slate-900 block">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {prod.bpom}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {prod.badge}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-700">
                            Rp {prod.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs">
                        <div className="flex items-start space-x-2">
                          <Clock size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">Aturan Pakai: </span>
                            <span className="text-slate-700">{prod.dose}</span>{' '}
                            <span className="text-emerald-700 font-medium italic">({prod.timing})</span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Activity size={13} className="text-teal-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800">Mekanisme Kerja: </span>
                            <span className="text-slate-600">{prod.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle & Dietary Guidance */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 text-xs space-y-2">
                <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <Apple size={15} className="text-amber-700" />
                  <span>Anjuran Pola Makan &amp; Pantangan Gaya Hidup:</span>
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-slate-700">
                  {selectedPreset.dietAdvice.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <div className="pt-1 text-[11px] text-amber-800 font-medium">
                  💡 {selectedPreset.contraindicationSafe}
                </div>
              </div>

              {/* Official Medical Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p>
                  <strong>Disclaimer Medis Resmi:</strong> Resep herbal AI ini disusun berdasarkan prinsip
                  fitofarmaka empiris produk resmi BPOM PT Bionet Herbal Indonesia sebagai suplemen pendukung daya
                  tahan sel dan metabolisme. Bukan pengganti intervensi medis darurat rumah sakit. Konsultasikan dengan
                  dokter spesialis bila keluhan berlanjut.
                </p>
              </div>

              {/* Total & Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-[11px] text-slate-400">Total Paket Terapi Herbal:</div>
                  <div className="text-xl font-heading font-extrabold text-emerald-400">
                    Rp {calculateTotalPrice().toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-emerald-200/80">
                    Gratis Konsultasi Pendampingan Rutin
                  </div>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 sm:flex-initial py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-extrabold text-xs shadow-md shadow-emerald-500/30 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
                  >
                    <Send size={15} />
                    <span>Pesan via WhatsApp Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
