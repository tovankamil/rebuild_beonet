import React, { useState } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Lock,
  PlayCircle,
  HelpCircle,
  Award,
  Sparkles,
  ChevronRight,
  Download,
  Share2,
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  Star,
  Clock,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

const ACADEMY_MODULES = [
  {
    day: 1,
    title: 'Mindset Juara & Fondasi Sehat Bionet',
    desc: 'Menanamkan visi besar, etika kemitraan, dan komitmen kesehatan jangka panjang.',
    duration: '12 Menit',
    summary: 'Fondasi utama sukses di Bionet bukan sekadar jualan, melainkan niat tulus menebar manfaat kesembuhan alami. Mitra juara memprioritaskan edukasi berbasis bukti dan membangun relasi persaudaraan yang kokoh.',
    questions: [
      {
        q: 'Apa tujuan utama seorang Mitra Resmi Bionet dalam mengedukasi masyarakat?',
        options: [
          'Memaksa calon konsumen membeli paket termahal hari ini juga',
          'Membantu memberikan edukasi kesehatan holistik dan solusi herbal legal terpercaya',
          'Hanya mengincar bonus sponsor tanpa memedulikan hasil kesembuhan',
          'Menyembunyikan informasi izin BPOM dari calon pembeli',
        ],
        correct: 1,
        explanation: 'Mitra Bionet adalah konsultan kesehatan herbal terpercaya yang mendahulukan empati dan edukasi berdasar izin resmi BPOM.',
      },
      {
        q: 'Mengapa izin BPOM RI sangat krusial dalam memilih produk herbal?',
        options: [
          'Hanya sebagai formalitas tempelan kertas di kemasan',
          'Menjamin produk bebas Bahan Kimia Obat (BKO) berbahaya dan teruji klinis keamanannya',
          'Membuat harga produk bisa dinaikkan berkali-kali lipat',
          'BPOM tidak ada pengaruhnya terhadap keamanan konsumen',
        ],
        correct: 1,
        explanation: 'Sertifikasi BPOM menjamin produk 100% aman dikonsumsi harian dan bebas dari cemaran BKO berbahaya.',
      },
      {
        q: 'Sikap mental apa yang harus dimiliki seorang mitra saat menghadapi penolakan awal?',
        options: [
          'Langsung marah dan memblokir kontak calon konsumen',
          'Tetap ramah, menghargai keputusan, dan menjaga tali silaturahmi untuk follow-up berkala',
          'Berhenti menjadi mitra dan menyerah selamanya',
          'Menyalahkan sponsor dan perusahaan',
        ],
        correct: 1,
        explanation: 'Penolakan adalah bagian alami dari proses bisnis. Sikap tenang dan silaturahmi yang terjaga sering berbuah closing di kemudian hari.',
      },
    ],
  },
  {
    day: 2,
    title: 'Bedah Khasiat Herbal Utama & Legalitas BPOM',
    desc: 'Mengenal keunggulan Bio-Propolis Trigona, Bio-Herbal Drops, dan Spray Energi.',
    duration: '15 Menit',
    summary: 'Ketahui detail kandungan bio-flavonoid murni, asam amino alami lebah Trigona tanpa alkohol, serta cara kerja sinergis dengan herbal tetes untuk detoksifikasi asam urat dan gula darah.',
    questions: [
      {
        q: 'Berapa nomor registrasi izin edar resmi BPOM RI untuk Bio-Propolis Trigona 30ml?',
        options: [
          'POM TR 226012891',
          'POM NA 998877661',
          'P-IRT 1234567890',
          'Izin Usaha Mikro 001',
        ],
        correct: 0,
        explanation: 'Bio-Propolis Trigona resmi terdaftar dengan nomor registrasi BPOM TR 226012891.',
      },
      {
        q: 'Bagaimana cara minum Bio-Propolis yang dianjurkan untuk pemulihan asam urat/kolesterol?',
        options: [
          'Diminum langsung satu botol sekaligus saat malam hari',
          '5 tetes diteteskan ke 1/4 gelas air hangat, diminum 3 kali sehari sebelum makan',
          'Dicampur air mendidih panas 100°C agar aromanya hilang',
          'Diteteskan ke mata setiap pagi',
        ],
        correct: 1,
        explanation: 'Dosis anjuran pemulihan adalah 5 tetes ke air hangat 3x sehari. Jangan gunakan air mendidih agar bioflavonoid tidak rusak.',
      },
      {
        q: 'Jika konsumen sedang mengonsumsi obat resep dari dokter, apa anjuran yang benar?',
        options: [
          'Meminta konsumen membuang seluruh obat dokter seketika',
          'Beri jeda waktu 1 hingga 2 jam antara konsumsi obat dokter dan herbal Bionet',
          'Herbal diminum bersamaan sekaligus dengan obat dokter',
          'Melarang konsumen periksa ke dokter lagi',
        ],
        correct: 1,
        explanation: 'Herbal Bionet bersifat komplementer pendamping. Selalu berikan jeda waktu 1-2 jam dan anjurkan kontrol rutin dengan dokter.',
      },
    ],
  },
  {
    day: 3,
    title: 'Marketing Plan Binary & Formula Bonus Pasangan',
    desc: 'Memahami omset jalur kiri & kanan, bonus sponsor harian, dan kualifikasi reward.',
    duration: '18 Menit',
    summary: 'Sistem Binary Bionet dirancang adil dan berkelanjutan. Pahami hitungan bonus pasangan per titik keseimbangan, batas kuota flush harian, dan strategi duplikasi dua kaki aktif.',
    questions: [
      {
        q: 'Dalam sistem binary Bionet, bagaimana bonus pasangan dihitung?',
        options: [
          'Dihitung dari jumlah member tanpa perlu ada transaksi poin PV',
          'Dihitung dari keseimbangan pasangan poin PV di Kaki Kiri dan Kaki Kanan',
          'Hanya dihitung jika mitra memiliki 10 kaki sejajar',
          'Diberikan secara acak melalui undian lotere bulanan',
        ],
        correct: 1,
        explanation: 'Bonus pasangan tercipta dari setiap titik keseimbangan omset poin di kaki kiri dan kanan jaringan Anda.',
      },
      {
        q: 'Kapan bonus sponsor dan bonus pasangan di Bionet dicairkan?',
        options: [
          'Harus menunggu 1 tahun kemudian',
          'Cair harian secara otomatis ke dompet digital siap ditarik ke rekening bank',
          'Hanya bisa dicairkan dalam bentuk kupon undian',
          'Tidak bisa dicairkan ke uang rupiah',
        ],
        correct: 1,
        explanation: 'Bionet menerapkan sistem mutasi dan penarikan harian terintegrasi dengan gateway perbankan nasional.',
      },
      {
        q: 'Berapa syarat pasangan PV untuk memenuhi kualifikasi Reward Smartwatch AMOLED?',
        options: [
          '10 Pasang Kiri : Kanan',
          '50 Pasang Kiri : 50 Pasang Kanan',
          '500 Pasang Kiri : Kanan',
          'Tidak ada syarat reward di Bionet',
        ],
        correct: 1,
        explanation: 'Reward Smartwatch AMOLED terbuka pada kualifikasi 50 PV Kiri : 50 PV Kanan tanpa batas waktu reset.',
      },
    ],
  },
  {
    day: 4,
    title: 'Seni Prospecting Hangat & Mengatasi 5 Keberatan',
    desc: 'Teknik membuka obrolan santai, empati kesehatan, dan menepis keraguan prospek.',
    duration: '14 Menit',
    summary: 'Kuasai teknik Heart-to-Heart prospecting. Ubah respon skeptis seperti "Apakah ini MLM?" atau "Harganya mahal" menjadi peluang edukasi yang menyadarkan nilai kesehatan.',
    questions: [
      {
        q: 'Bagaimana cara terbaik merespon keberatan konsumen: "Apakah herbal ini mahal?"',
        options: [
          'Langsung mendebat konsumen bahwa mereka tidak punya uang',
          'Bandingkan biaya preventif 1 botol (Rp 250rb untuk 1 bulan) dengan risiko rawat inap rumah sakit jutaan rupiah',
          'Langsung memberikan diskon 90% secara sembunyi-sembunyi',
          'Mengabaikan pesan chat konsumen',
        ],
        correct: 1,
        explanation: 'Teknik reframing nilai: 1 botol hemat 600 tetes untuk konsumsi 3-4 minggu jauh lebih terjangkau daripada biaya berobat di RS.',
      },
      {
        q: 'Apa respon bijak jika prospek bertanya "Apakah saya wajib merekrut orang?"',
        options: [
          'Ya, Anda wajib rekrut minimal 50 orang per minggu',
          'Tidak sama sekali! Konsumen murni membeli untuk kesembuhan tanpa kewajiban jualan atau rekrut',
          'Bohong kepada prospek demi closing',
          'Mengatakan bahwa Bionet bukan perusahaan resmi',
        ],
        correct: 1,
        explanation: 'Konsumen berhak membeli murni sebagai pemakai produk tanpa paksaan rekrutmen apapun.',
      },
      {
        q: 'Kanal mana yang paling efektif untuk prospecting hangat pertama kali?',
        options: [
          'Spam pesan ke nomor orang asing tanpa izin',
          'Kontak keluarga, sahabat terdekat, dan relasi yang memiliki riwayat keluhan kesehatan',
          'Membeli database ilegal di internet',
          'Memasang poster liar di tiang listrik',
        ],
        correct: 1,
        explanation: 'Lingkaran terdekat (warm market) yang percaya pada integritas Anda adalah fondasi awal yang paling responsif.',
      },
    ],
  },
  {
    day: 5,
    title: 'Optimalisasi Bio-Link, WhatsApp CRM & Funnel',
    desc: 'Memanfaatkan teknologi digital untuk mendatangkan prospek secara otomatis.',
    duration: '15 Menit',
    summary: 'Pasang Bio-Link interaktif di profil TikTok dan IG. Manfaatkan fitur Smart Scheduler WhatsApp untuk follow-up teratur dan pelacakan health journey pelanggan.',
    questions: [
      {
        q: 'Di mana tempat paling strategis memasang tautan Bio-Link Bionet Anda?',
        options: [
          'Di catatan rahasia di dalam buku harian yang terkunci',
          'Di Bio Profil TikTok, Bio Instagram, WhatsApp Story, dan Kartu Nama Digital',
          'Hanya dikirimkan ke diri sendiri',
          'Tidak perlu disebarkan sama sekali',
        ],
        correct: 1,
        explanation: 'Menyematkan bio-link di seluruh etalase media sosial memaksimalkan konversi prospek inbound organik.',
      },
      {
        q: 'Apa fungsi utama dari Smart Scheduler WhatsApp di CRM Bionet?',
        options: [
          'Menghapus seluruh kontak pelanggan secara otomatis',
          'Mengingatkan mitra untuk follow-up prospek yang belum merespon setelah 24 atau 48 jam',
          'Mengirimkan spam iklan tengah malam',
          'Mengubah nomor WhatsApp mitra secara acak',
        ],
        correct: 1,
        explanation: 'Smart Scheduler memastikan tidak ada prospek potensial yang terlupakan melalui pengingat ritme 24/48 jam.',
      },
      {
        q: 'Mengapa live smartphone preview di Bio-Link Studio sangat membantu mitra?',
        options: [
          'Hanya sebagai hiasan tampilan',
          'Memungkinkan mitra melihat secara real-time bagaimana landing page mereka tampil di layar HP calon pembeli',
          'Membuat HP mitra menjadi lebih cepat panas',
          'Menghapus kuota internet mitra',
        ],
        correct: 1,
        explanation: 'Live preview memastikan teks, video, dan kartu produk tersaji dengan sempurna di layar smartphone prospek.',
      },
    ],
  },
  {
    day: 6,
    title: 'Strategi Closing 1-on-1 & Pendampingan Konsumen',
    desc: 'Teknik menutup pesanan secara elegan dan memandu jadwal minum pelanggan.',
    duration: '16 Menit',
    summary: 'Closing terjadi saat konsumen merasa aman dan dipedulikan. Dampingi hari ke-3, ke-7, dan ke-14 untuk memantau reaksi awal detoksifikasi herbal.',
    questions: [
      {
        q: 'Kapan waktu terbaik melakukan follow-up pertama setelah produk diterima konsumen?',
        options: [
          'Setelah 1 tahun produk dibeli',
          'Hari ke-3 untuk memastikan produk sudah mulai diminum dan menanyakan rasa/kenyamanan di perut',
          'Tidak perlu follow-up sama sekali jika sudah bayar',
          'Hanya jika konsumen mengajukan komplain',
        ],
        correct: 1,
        explanation: 'Follow-up hari ke-3 menunjukkan tanggung jawab konsultan dan membangun kepercayaan jangka panjang untuk Repeat Order.',
      },
      {
        q: 'Jika konsumen merasakan reaksi detoks awal (misal buang air kecil lebih sering), apa yang harus disampaikan?',
        options: [
          'Menyuruh konsumen panik dan segera berhenti',
          'Menenangkan dengan empati, menjelaskan bahwa itu reaksi pembuangan racun alami, dan anjurkan perbanyak air hangat',
          'Mengatakan bahwa produknya kadaluarsa',
          'Menghapus nomor konsumen',
        ],
        correct: 1,
        explanation: 'Edukasi proses detoksifikasi adalah kunci agar konsumen tetap tenang dan disiplin melanjutkan terapi herbal.',
      },
      {
        q: 'Apa manfaat dari mendampingi konsumen hingga sembuh total?',
        options: [
          'Konsumen akan menjadi duta cerita kesembuhan (testimoni) dan melakukan Repeat Order berkelanjutan',
          'Tidak ada manfaatnya untuk bisnis',
          'Membuat mitra kehabisan waktu',
          'Hanya membuat konsumen merasa terganggu',
        ],
        correct: 0,
        explanation: 'Konsumen yang puas adalah sumber referensi terbesar dan calon mitra masa depan yang paling militan.',
      },
    ],
  },
  {
    day: 7,
    title: 'Duplikasi Jaringan & Mencetak Tim Mandiri',
    desc: 'Menduplikasi ilmu 7 hari ke seluruh downline dan melahirkan Leader baru.',
    duration: '20 Menit',
    summary: 'Puncak keberhasilan di bisnis Bionet adalah duplikasi. Saat Anda mampu membimbing 2 orang mitra menguasai kurikulum 7 hari ini, jaringan Anda akan bertumbuh mandiri menghasilkan kebebasan waktu dan finansial.',
    questions: [
      {
        q: 'Apa prinsip dasar duplikasi yang benar dalam sistem kemitraan Bionet?',
        options: [
          'Mengerjakan semua hal sendirian tanpa mengajarkan ke tim downline',
          'Membimbing mitra baru menyelesaikan Kurikulum 7 Hari Bionet Academy agar mandiri prospek & bina konsumen',
          'Membiarkan mitra baru berjuang sendiri tanpa arahan sistem',
          'Melarang downline untuk sukses melebihi sponsor',
        ],
        correct: 1,
        explanation: 'Duplikasi sistematis menciptakan tim mandiri yang kuat dan tahan uji.',
      },
      {
        q: 'Berapa jumlah mitra aktif di kaki kiri dan kaki kanan yang ideal untuk memulai duplikasi kokoh?',
        options: [
          'Minimal 2 Leader Aktif dan Mandiri (1 di Tim A Kiri, 1 di Tim B Kanan)',
          '100 orang di satu kaki saja',
          'Nol mitra aktif',
          'Hanya mengandalkan limpahan sponsor terus-menerus',
        ],
        correct: 0,
        explanation: 'Fokus mencetak 1 Leader Kiri dan 1 Leader Kanan yang mandiri adalah rahasia passive income binary Bionet.',
      },
      {
        q: 'Setelah menyelesaikan modul hari ke-7 ini, langkah apa yang harus segera Anda lakukan?',
        options: [
          'Berhenti belajar dan tidak bertindak apa-apa',
          'Unduh Sertifikat Master Partner dan mulai praktekkan langsung bersama sponsor & tim Anda',
          'Menghapus akun Bionet',
          'Menunggu keajaiban tanpa aksi nyata',
        ],
        correct: 1,
        explanation: 'Ilmu terbaik adalah ilmu yang dipraktekkan secara konsisten dengan bimbingan mentor.',
      },
    ],
  },
];

export default function BionetAcademyModal({ user, onClose }) {
  const partnerName = user?.full_name || 'Mitra Bionet Juara';
  const username = user?.username || 'mitra01';
  const storageKey = `bionet_academy_${username}`;

  // Completed modules set (stored in localStorage)
  const [completedModules, setCompletedModules] = useState(() => {
    const saved = localStorage.getItem(`${storageKey}_completed`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [1]; // Day 1 completed by default for demo
      }
    }
    return [1]; // Start with day 1 completed
  });

  const [selectedDay, setSelectedDay] = useState(1);
  const [quizState, setQuizState] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showCertificateView, setShowCertificateView] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const currentModule = ACADEMY_MODULES.find((m) => m.day === selectedDay) || ACADEMY_MODULES[0];
  const isAllCompleted = completedModules.length >= 7;

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizState((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    // Ensure all 3 questions answered
    if (Object.keys(quizState).length < 3) {
      alert('Mohon jawab ketiga pertanyaan kuis terlebih dahulu.');
      return;
    }
    setQuizSubmitted(true);

    // Calculate score
    let correctCount = 0;
    currentModule.questions.forEach((q, idx) => {
      if (quizState[idx] === q.correct) correctCount++;
    });

    // Pass condition: at least 2 correct
    if (correctCount >= 2) {
      if (!completedModules.includes(selectedDay)) {
        const nextCompleted = [...completedModules, selectedDay];
        setCompletedModules(nextCompleted);
        localStorage.setItem(`${storageKey}_completed`, JSON.stringify(nextCompleted));
      }
    }
  };

  const handleResetQuiz = () => {
    setQuizState({});
    setQuizSubmitted(false);
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    setQuizState({});
    setQuizSubmitted(false);
  };

  const handleDownloadCertificate = () => {
    setDownloadingCert(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');

    // Background Rich Emerald Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1130);
    bgGrad.addColorStop(0, '#022C22');
    bgGrad.addColorStop(0.5, '#064E3B');
    bgGrad.addColorStop(1, '#021B16');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1130);

    // Gold Outer Border
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 14;
    ctx.strokeRect(35, 35, 1530, 1060);

    // Gold Inner Border
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 3;
    ctx.strokeRect(55, 55, 1490, 1020);

    // Header Emblem
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PT BIONET HERBAL INDONESIA', 800, 150);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('AKADEMI PELATIHAN MANDIRI MITRA RESMI', 800, 195);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 60px sans-serif';
    ctx.fillText('SERTIFIKAT KELULUSAN', 800, 310);

    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('CERTIFIED BIONET MASTER PARTNER', 800, 360);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '24px sans-serif';
    ctx.fillText('Dengan ini menerangkan bahwa:', 800, 440);

    // Graduate Name
    ctx.fillStyle = '#34D399';
    ctx.font = '900 56px sans-serif';
    ctx.fillText(partnerName.toUpperCase(), 800, 530);

    ctx.fillStyle = '#FDE68A';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`ID Mitra: #${username.toUpperCase()} | Status: Terakreditasi`, 800, 580);

    // Body Text
    ctx.fillStyle = '#D1D5DB';
    ctx.font = '22px sans-serif';
    ctx.fillText('Telah berhasil menyelesaikan seluruh 7 Modul Kurikulum Bionet Academy:', 800, 660);
    ctx.fillText('Mindset Juara, Legalitas BPOM, Marketing Plan Binary, Prospecting, Funnel Bio-Link,', 800, 700);
    ctx.fillText('Closing 1-on-1, serta Duplikasi Jaringan Berkelanjutan.', 800, 740);

    // Signatures
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('dr. Hendra Wijaya, Sp.PD', 450, 930);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText('Ketua Tim Kurikulum Medis', 450, 960);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Direktur Utama PT Bionet', 1150, 930);
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.fillText('PT Bionet Herbal Indonesia', 1150, 960);

    // Gold Medal Center Seal
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(800, 890, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('LULUS', 800, 890);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('VERIFIED', 800, 910);

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `Sertifikat_Bionet_Master_${username}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadingCert(false);
    }, 600);
  };

  const progressPercent = Math.round((completedModules.length / 7) * 100);

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <GraduationCap size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Bionet Academy: Kurikulum 7 Hari Sukses Mitra
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {progressPercent}% Selesai
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Pelatihan mandiri terstruktur dengan kuis interaktif berhadiah E-Sertifikat Master Partner resmi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAllCompleted && (
              <button
                type="button"
                onClick={() => setShowCertificateView(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition shadow"
              >
                <Award size={15} />
                <span>Lihat Sertifikat</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Overall Progress Ribbon */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 max-w-lg">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Kemajuan Anda: {completedModules.length} / 7 Modul
            </span>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
            <Sparkles size={14} />
            <span>Selesaikan 7 modul untuk sertifikasi resmi</span>
          </span>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-50/70">
          {/* Left Column: List of 7 Modules (4 cols) */}
          <div className="lg:col-span-4 p-4 space-y-2 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
              Daftar 7 Modul Harian:
            </span>

            {ACADEMY_MODULES.map((mod) => {
              const isCompleted = completedModules.includes(mod.day);
              const isSelected = selectedDay === mod.day;

              return (
                <button
                  key={mod.day}
                  onClick={() => handleSelectDay(mod.day)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start space-x-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isSelected
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <Check size={16} className="stroke-[3]" /> : `H${mod.day}`}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700">Hari ke-{mod.day}</span>
                      <span className="text-[10px] text-slate-400">{mod.duration}</span>
                    </div>
                    <h5 className="font-heading font-bold text-xs text-slate-900 truncate mt-0.5">
                      {mod.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{mod.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Module Material & 3-Question Quiz (8 cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            {/* Module Material Brief */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Hari ke-{currentModule.day} • {currentModule.duration}
                </span>
                {completedModules.includes(currentModule.day) && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 size={15} />
                    <span>Telah Lulus</span>
                  </span>
                )}
              </div>

              <h4 className="font-heading font-black text-lg text-slate-900">
                {currentModule.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                {currentModule.summary}
              </p>
            </div>

            {/* Interactive 3-Question Quiz */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <HelpCircle size={18} className="text-emerald-600" />
                  <h5 className="font-heading font-bold text-sm text-slate-900">
                    Kuis Evaluasi Pemahaman (3 Pertanyaan)
                  </h5>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Syarat lulus: Benar minimal 2 dari 3
                </span>
              </div>

              <div className="space-y-5">
                {currentModule.questions.map((qItem, qIdx) => {
                  const selectedOpt = quizState[qIdx];
                  const isCorrect = selectedOpt === qItem.correct;

                  return (
                    <div key={qIdx} className="space-y-2.5">
                      <p className="text-xs font-bold text-slate-800 flex items-start space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <span>{qItem.q}</span>
                      </p>

                      <div className="space-y-1.5 pl-7">
                        {qItem.options.map((opt, optIdx) => {
                          const isOptionSelected = selectedOpt === optIdx;
                          let optionClass = 'border-slate-200 hover:border-slate-300 bg-white text-slate-700';

                          if (quizSubmitted) {
                            if (optIdx === qItem.correct) {
                              optionClass = 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              optionClass = 'border-rose-400 bg-rose-50/80 text-rose-900 line-through';
                            }
                          } else if (isOptionSelected) {
                            optionClass = 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500/20 font-medium';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between ${optionClass}`}
                            >
                              <span>{opt}</span>
                              {quizSubmitted && optIdx === qItem.correct && (
                                <Check size={14} className="text-emerald-600 shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Feedback if Submitted */}
                      {quizSubmitted && (
                        <div
                          className={`mt-2 ml-7 p-2.5 rounded-lg text-[11px] leading-relaxed ${
                            isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
                          }`}
                        >
                          <strong>{isCorrect ? '✓ Tepat Sekali: ' : 'ℹ Penjelasan: '}</strong>
                          {qItem.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quiz Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {quizSubmitted ? (
                  <div className="flex items-center space-x-3 w-full justify-between">
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      <RotateCcw size={14} />
                      <span>Ulangi Kuis</span>
                    </button>

                    {completedModules.includes(currentModule.day) && selectedDay < 7 && (
                      <button
                        type="button"
                        onClick={() => handleSelectDay(selectedDay + 1)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                      >
                        <span>Lanjut ke Hari {selectedDay + 1}</span>
                        <ChevronRight size={15} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-end w-full">
                    <button
                      type="button"
                      onClick={handleCheckQuiz}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition"
                    >
                      Periksa Jawaban Kuis
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate View Submodal / Drawer */}
        {showCertificateView && (
          <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-slate-900 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-2xl text-center space-y-4">
              <button
                onClick={() => setShowCertificateView(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award size={36} className="stroke-[2.5]" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest inline-block mb-2">
                  Lulus Akreditasi Penuh
                </span>
                <h4 className="font-heading font-black text-2xl text-white">
                  Selamat, {partnerName}!
                </h4>
                <p className="text-xs text-emerald-200 max-w-md mx-auto mt-1">
                  Anda resmi dinobatkan sebagai <strong>Certified Bionet Master Partner</strong> setelah menguasai seluruh 7 kurikulum mandiri.
                </p>
              </div>

              {/* Digital Badge Mockup */}
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 font-mono text-xs text-emerald-300 inline-block">
                No. Akreditasi: BIO-CERT-2026-MASTER-{username.toUpperCase()}
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>{downloadingCert ? 'Memproses HD...' : 'Unduh E-Sertifikat Master (HD)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalPortal>
  );
}
