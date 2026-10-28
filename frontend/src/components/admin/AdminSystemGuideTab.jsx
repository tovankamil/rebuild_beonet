import React, { useState } from 'react';
import {
  BookOpen,
  LayoutDashboard,
  GitFork,
  Users,
  Wallet,
  Building2,
  Landmark,
  KeyRound,
  ShoppingBag,
  Shield,
  ShieldAlert,
  Palette,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  MapPin,
  Bot,
  Truck,
  Send,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Filter,
  Check,
  MessagesSquare,
  HelpCircle,
} from 'lucide-react';

export default function AdminSystemGuideTab({ setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Modul & Menu' },
    { id: 'admin', label: 'Admin & Manajemen' },
    { id: 'mlm', label: 'Jaringan & Binary MLM' },
    { id: 'finance', label: 'Keuangan & Payout' },
    { id: 'stokis', label: 'Stokis & Serial PIN' },
    { id: 'ecommerce', label: 'Logistik & RO Herbal' },
    { id: 'ai-support', label: 'AI & Layanan Bantuan' },
  ];

  const appModules = [
    {
      id: 'admin-overview',
      name: 'Overview Admin (Eksekutif)',
      category: 'admin',
      roles: ['admin', 'keuangan', 'cs'],
      icon: LayoutDashboard,
      badge: 'KPI Global',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Pusat komando eksekutif platform Bionet yang menampilkan metrik agregat nasional secara real-time.',
      features: [
        'Total omset nasional dan volume penjualan paket PIN hak usaha.',
        'Metrik total member aktif, pending withdrawal, dan saldo dompet beredar.',
        'Grafik pertumbuhan volume harian & mingguan platform.',
        'Log audit transaksi keuangan real-time dengan status mutasi.',
      ],
      flow: [
        '1. Login sebagai Administrator, Keuangan, atau CS.',
        '2. Buka tab Overview Admin untuk melihat KPI makro perusahaan.',
        '3. Pantau saldo dompet member yang beredar dan antrean pencairan dana.',
        '4. Klik kartu metrik untuk melompat langsung ke audit detail.',
      ],
      dbTables: ['users', 'wallet_transactions', 'withdrawals', 'pins'],
      apiEndpoints: ['GET /api/admin/overview', 'GET /api/admin/transactions'],
    },
    {
      id: 'admin-users',
      name: 'Manajemen Pengguna & RBAC',
      category: 'admin',
      roles: ['admin', 'cs'],
      icon: Users,
      badge: '5 Role RBAC',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Pusat pengelolaan akun seluruh entitas pengguna, alokasi role hierarki, dan verifikasi KYC data member.',
      features: [
        'Alokasi 5 Role RBAC: Admin, Member, Gudang, Keuangan, Customer Service.',
        'Status Akun: Active, Suspended (pembekuan), Banned.',
        'Audit NIK KTP (16 digit) dan NPWP untuk pencegahan akun tuyul.',
        'Fitur Reset Password darurat bagi member yang lupa sandi.',
        'Audit Rekening Bank Primer untuk pencairan dana Flip.id.',
      ],
      flow: [
        '1. Cari member berdasarkan username, nama lengkap, atau email.',
        '2. Klik tombol Edit Akun untuk menyesuaikan role atau status.',
        '3. Cek kartu identitas KYC & nomor rekening terverifikasi.',
        '4. Simpan perubahan; sesi member akan disinkronkan seketika.',
      ],
      dbTables: ['users', 'user_banks', 'user_addresses'],
      apiEndpoints: ['GET /api/admin/users', 'PUT /api/admin/users/:id'],
    },
    {
      id: 'admin-points',
      name: 'Poin Pasangan Binary (Matching Pair)',
      category: 'mlm',
      roles: ['admin'],
      icon: GitFork,
      badge: 'Binary Engine',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      desc: 'Audit rasio keseimbangan volume kaki kiri & kanan binary seluruh mitra untuk pembayaran bonus pasangan matching 1:1.',
      features: [
        'Monitoring Point Left (L) dan Point Right (R) setiap node jaringan.',
        'Perhitungan potensi bonus pasangan: 1 pasang = Rp 25.000.',
        'Sistem Carry Forward: sisa poin kaki besar tidak hangus, dibawa ke hari berikutnya.',
        'Tool Adjustment Poin Darurat oleh Admin untuk koreksi omset.',
      ],
      flow: [
        '1. Sistem otomatis menambahkan PV saat downline baru mendaftar via PIN.',
        '2. Poin naik ke seluruh upline melalui tabel upline_paths.',
        '3. Setiap malam sistem menghitung matching pair seimbang.',
        '4. Bonus pasangan otomatis dikreditkan ke dompet tunai member.',
      ],
      dbTables: ['point_balances', 'binary_pairs', 'upline_paths'],
      apiEndpoints: ['GET /api/admin/points', 'POST /api/admin/points/adjust'],
    },
    {
      id: 'genealogy',
      name: 'Pohon Jaringan Binary (MLM Tree)',
      category: 'mlm',
      roles: ['member', 'admin'],
      icon: GitFork,
      badge: 'Visual Tree + Drilldown',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Visualisasi interaktif bagan silsilah kemitraan binary 3 generasi dengan kemampuan navigasi hierarki ke bawah (drill-down).',
      features: [
        'Visualisasi 3 generasi (Akun Utama, 2 Kaki Anak, 4 Kaki Cucu).',
        'Fitur "Buka Pohon": Klik tombol di kartu downline untuk menjelajahi pohon di bawahnya.',
        'Keamanan Closure Table: Member hanya dapat melihat diri sendiri dan jaringan downline-nya.',
        'Slot Kosong Dinamis: Klik "+ Daftarkan Downline" untuk aktivasi mitra baru seketika.',
        'Breadcrumb Navigasi: Jejak penelusuran dengan tombol "Naik 1 Level" dan "Akun Utama".',
        'Pencarian Langsung: Ketik username downline lalu tekan Enter untuk melompat ke pohonnya.',
      ],
      flow: [
        '1. Buka tab Pohon Binary MLM.',
        '2. Klik tombol "Buka Pohon" pada salah satu member downline.',
        '3. Bagan memperbarui fokus menjadi member tersebut dan menampilkan anak-anak di bawahnya.',
        '4. Gunakan tombol "Naik 1 Level" atau "Akun Utama" untuk kembali.',
      ],
      dbTables: ['network_positions', 'upline_paths', 'point_balances'],
      apiEndpoints: ['GET /api/dashboard/genealogy?username=:target'],
    },
    {
      id: 'admin-pins',
      name: 'Stokis & Manajemen Serial PIN',
      category: 'stokis',
      roles: ['admin'],
      icon: KeyRound,
      badge: 'Paket Hak Usaha',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      desc: 'Penerbitan dan pengelolaan serial PIN registrasi mitra baru yang menentukan jenis lisensi Hak Usaha (HU) dan PV awal.',
      features: [
        'Penerbitan 3 Paket: Silver (1 HU, 100 PV), Gold (3 HU, 300 PV), Platinum (7 HU, 700 PV).',
        'Generator serial PIN acak berkeamanan tinggi dengan token verifikasi.',
        'Distribusi PIN ke Master Stokis dan Stokis Wilayah.',
        'Pelacakan status PIN: Available, Used, Transferred.',
        'Audit log mutasi transfer PIN antar mitra.',
      ],
      flow: [
        '1. Admin mencetak sejumlah serial PIN pada paket yang dipilih.',
        '2. PIN ditransfer ke akun stokis mitra pemesan.',
        '3. Stokis mengalokasikan PIN ke calon member untuk registrasi downline.',
        '4. Saat PIN diaktivasi, status berubah menjadi Used dan tidak bisa dipakai ulang.',
      ],
      dbTables: ['pins', 'pin_packages', 'pin_transfers'],
      apiEndpoints: ['GET /api/admin/pins', 'POST /api/admin/pins/generate', 'POST /api/admin/pins/transfer'],
    },
    {
      id: 'admin-withdrawals',
      name: 'Approval Pencairan Dana (Withdrawal)',
      category: 'finance',
      roles: ['admin', 'keuangan'],
      icon: Landmark,
      badge: 'Flip.id Gateway',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Persetujuan dan eksekusi transfer dana pencairan saldo dompet mitra ke rekening bank lokal.',
      features: [
        'Verifikasi pengajuan penarikan dana (minimal Rp 50.000).',
        'Pencegahan saldo negatif: saldo dompet dipotong di awal saat request dibuat.',
        'Persetujuan One-Click via integrasi API Flip.id / Transfer Bank Otomatis.',
        'Fitur Reject dengan Auto-Refund: Jika ditolak, saldo otomatis dikembalikan ke dompet mitra.',
        'Audit nomor rekening tujuan dan kesesuaian nama pemilik buku tabungan.',
      ],
      flow: [
        '1. Member mengajukan penarikan saldo di portal kemitraan.',
        '2. Request masuk ke antrean Approval Pencairan Dana.',
        '3. Tim Admin/Keuangan memeriksa kesesuaian rekening dan status fraud.',
        '4. Klik Approve untuk mengeksekusi transfer bank atau Reject untuk refund.',
      ],
      dbTables: ['withdrawals', 'wallet_transactions', 'user_banks'],
      apiEndpoints: ['GET /api/admin/withdrawals', 'POST /api/admin/withdrawals/:id/approve', 'POST /api/admin/withdrawals/:id/reject'],
    },
    {
      id: 'admin-transactions',
      name: 'Buku Besar & Mutasi Transaksi (Ledger)',
      category: 'finance',
      roles: ['admin', 'keuangan'],
      icon: Wallet,
      badge: 'Immutable Ledger',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Buku besar keuangan terpadu yang mencatat seluruh aliran dana masuk dan keluar pada platform.',
      features: [
        'Pencatatan ganda: Kredit (Penambahan Saldo) & Debit (Pengurangan Saldo).',
        'Kategori Transaksi: Bonus Sponsor, Bonus Pasangan, Pencairan Dana (WD), Belanja RO.',
        'Filter berdasarkan rentang tanggal, username mitra, dan tipe mutasi.',
        'Export laporan keuangan ke format CSV dan PDF untuk rekonsiliasi.',
      ],
      flow: [
        '1. Setiap aksi finansial otomatis menulis log ke tabel wallet_transactions.',
        '2. Administrator dapat memfilter mutasi berdasarkan member tertentu.',
        '3. Rekonsiliasi antara total bonus terbayar dengan saldo kas perusahaan.',
      ],
      dbTables: ['wallet_transactions', 'users'],
      apiEndpoints: ['GET /api/admin/transactions'],
    },
    {
      id: 'admin-orders',
      name: 'Pesanan RO E-Commerce & Logistik',
      category: 'ecommerce',
      roles: ['admin', 'gudang'],
      icon: ShoppingBag,
      badge: 'RO & Resi',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      desc: 'Pengelolaan invoice repeat order produk herbal, monitoring pembayaran, dan pengiriman paket.',
      features: [
        'Daftar pesanan produk herbal kesehatan (Bio Moringa, Bio Propolis, Madu Hutan).',
        'Status alur: Menunggu Pembayaran -> Diproses Gudang -> Dikirim -> Selesai.',
        'Input nomor resi pengiriman ekspedisi (JNE, J&T, SiCepat).',
        'Koneksi alamat domisili terverifikasi dari Database Wilayah Kemendagri.',
        'Perhitungan penambahan Poin Volume (PV) Repeat Order ke struktur jaringan.',
      ],
      flow: [
        '1. Member memesan produk herbal di katalog Repeat Order.',
        '2. Invoice diterbitkan dan pesanan masuk ke tim admin & gudang.',
        '3. Staf gudang menyiapkan paket dan memasukkan nomor resi ekspedisi.',
        '4. Member menerima nomor resi untuk pelacakan paket secara mandiri.',
      ],
      dbTables: ['orders', 'order_items', 'products', 'user_addresses'],
      apiEndpoints: ['GET /api/admin/orders', 'PUT /api/admin/orders/:id/status'],
    },
    {
      id: 'admin-fraud',
      name: 'Fraud Control & Deteksi Risiko',
      category: 'admin',
      roles: ['admin'],
      icon: ShieldAlert,
      badge: 'Security Engine',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      desc: 'Sistem deteksi dini anomali dan mitigasi risiko manipulasi jaringan MLM atau fraud pencairan dana.',
      features: [
        'Deteksi duplikasi NIK KTP (Sybil attack prevention).',
        'Deteksi nomor rekening bank yang didaftarkan pada lebih dari satu akun member.',
        'Peringatan lonjakan penarikan dana tidak wajar dalam kurun waktu 24 jam.',
        'One-Click Freeze: Pembekuan akun yang terindikasi mencurigakan untuk audit forensik.',
      ],
      flow: [
        '1. Algoritma fraud engine memindai seluruh data profil dan riwayat mutasi.',
        '2. Akun dengan skor risiko tinggi otomatis ditandai badge merah.',
        '3. Administrator memeriksa bukti anomali data.',
        '4. Tindakan pembekuan akun dapat dilakukan langsung dari dasbor.',
      ],
      dbTables: ['users', 'user_banks', 'withdrawals'],
      apiEndpoints: ['GET /api/admin/fraud/audit', 'POST /api/admin/fraud/freeze'],
    },
    {
      id: 'chat',
      name: 'Live Chat CS & Helpdesk 24/7',
      category: 'ai-support',
      roles: ['admin', 'cs', 'member'],
      icon: MessagesSquare,
      badge: 'Helpdesk Realtime',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      desc: 'Saluran komunikasi langsung terenkripsi antara mitra kemitraan dan tim Layanan Pelanggan Pusat.',
      features: [
        'Dukungan live chat 2 arah secara instan antara Mitra dan Administrator/CS.',
        'Quick replies / saran pertanyaan cepat seputar jadwal WD, aktivasi PIN, dan produk RO.',
        'Indikator pesan belum terbaca (unread badge counter) di bilah navigasi atas.',
        'Penyimpanan log percakapan terenkripsi untuk audit kepatuhan layanan.',
      ],
      flow: [
        '1. Mitra mengetik pesan bantuan pada menu Live Chat.',
        '2. Notifikasi masuk ke dasbor Customer Service & Admin Pusat.',
        '3. Tim CS memberikan jawaban dan panduan teknis.',
        '4. Seluruh percakapan tersimpan dalam log audit Bionet.',
      ],
      dbTables: ['support_chats', 'chat_messages'],
      apiEndpoints: ['GET /api/chat/messages', 'POST /api/chat/send', 'GET /api/chat/unread-count'],
    },
    {
      id: 'ai-copilot',
      name: 'Bionet AI Copilot & Bot Telegram',
      category: 'ai-support',
      roles: ['member', 'admin'],
      icon: Bot,
      badge: 'Gemini 3.1 & Telegram',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      desc: 'Asisten kecerdasan buatan Google Gemini 3.1 Flash-Lite terintegrasi database Bionet dan bot Telegram resmi.',
      features: [
        'Didukung model AI Google Gemini 3.1 Flash-Lite dengan pengetahuan domain Bionet.',
        'Bot Telegram resmi (@btfn_assistant_bot) yang aktif menerima perintah interaktif.',
        'Kemampuan mengecek status bonus, omset pairing, panduan aktivasi PIN, dan info herbal.',
        'Widget mengambang di pojok kanan bawah yang siap diakses dari halaman mana pun.',
      ],
      flow: [
        '1. Member membuka widget Bionet AI Copilot atau mengirim pesan ke @btfn_assistant_bot.',
        '2. AI membaca konteks database dan memberikan jawaban terstruktur.',
        '3. Mempermudah edukasi mitra baru tanpa membebani tim CS manual.',
      ],
      dbTables: ['users', 'point_balances', 'binary_pairs'],
      apiEndpoints: ['POST /api/ai/ask', 'POST /webhook/telegram'],
    },
    {
      id: 'address-kemendagri',
      name: 'Database Wilayah Indonesia (Kemendagri)',
      category: 'ecommerce',
      roles: ['member', 'admin', 'gudang'],
      icon: MapPin,
      badge: '38 Provinsi • 514 Kota',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Master data wilayah administratif Republik Indonesia terstandarisasi Kemendagri dengan pencarian cepat instan.',
      features: [
        'Memuat 38 Provinsi, 514 Kota/Kabupaten, 7.277+ Kecamatan, dan Kode Pos nasional.',
        'Pilihan bertingkat (cascading select): Pilih Provinsi -> Kota menyesuaikan -> Kecamatan menyesuaikan.',
        'Pencarian Instan (Auto-Suggest): Ketik nama kecamatan atau kota untuk auto-fill seluruh field.',
        'Penyimpanan otomatis ke tabel user_addresses sebagai alamat primer pengiriman Repeat Order.',
        'Notifikasi Sticky Konfirmasi langsung saat data berhasil disimpan ke database.',
      ],
      flow: [
        '1. Buka menu Edit Profil & KYC -> Tab "Alamat Pengiriman".',
        '2. Pilih Provinsi, Kota/Kabupaten, dan Kecamatan melalui dropdown atau auto-suggest.',
        '3. Klik "Simpan Alamat".',
        '4. Notifikasi hijau konfirmasi langsung muncul mengambang dan tombol berubah menjadi "Tersimpan di Database!".',
      ],
      dbTables: ['indonesia_kode', 'user_addresses'],
      apiEndpoints: ['GET /api/regions/provinces', 'GET /api/regions/regencies', 'GET /api/regions/districts', 'PUT /api/dashboard/address'],
    },
  ];

  // Filtering Logic
  const filteredModules = appModules.filter((mod) => {
    const matchCategory = selectedCategory === 'all' || mod.category === selectedCategory;
    const matchRole = selectedRole === 'all' || mod.roles.includes(selectedRole);
    const matchSearch =
      searchQuery === '' ||
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
      mod.dbTables.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchCategory && matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-4">
            <BookOpen size={14} />
            <span>Pusat Dokumentasi &amp; Direktori Sistem Platform Bionet</span>
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white mb-2">
            Panduan Lengkap Fitur &amp; Menu Aplikasi
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Halaman ini menjelaskan secara menyeluruh seluruh modul aplikasi, logika pohon binary MLM, arsitektur database Closure Table, buku besar transaksi, hingga integrasi database wilayah Kemendagri dan AI Copilot.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] font-semibold text-slate-400">Total Modul Utama</div>
              <div className="font-heading font-extrabold text-xl text-emerald-400 mt-0.5">12 Modul</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] font-semibold text-slate-400">Tingkat Hak Akses</div>
              <div className="font-heading font-extrabold text-xl text-cyan-400 mt-0.5">5 Role RBAC</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] font-semibold text-slate-400">Database Wilayah</div>
              <div className="font-heading font-extrabold text-xl text-amber-400 mt-0.5">38 Provinsi</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-[11px] font-semibold text-slate-400">Genealogi Binary</div>
              <div className="font-heading font-extrabold text-xl text-purple-400 mt-0.5">Closure Table</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="dash-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari fitur, menu, tabel, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dash-input pl-10 pr-4 py-2 text-xs w-full font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Role Filter Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
              <Filter size={13} className="text-emerald-600" />
              <span>Filter Role:</span>
            </span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="dash-input py-1.5 px-3 text-xs font-semibold text-slate-700 w-full sm:w-auto"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Administrator</option>
              <option value="member">Mitra / Member</option>
              <option value="keuangan">Keuangan</option>
              <option value="gudang">Logistik Gudang</option>
              <option value="cs">Customer Service</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Module Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              className="dash-card p-5 sm:p-6 hover:shadow-md transition-all border border-slate-200/90 flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-base text-slate-900 tracking-tight">
                        {mod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Tab ID: {mod.id}
                        </span>
                        <div className="flex items-center gap-1">
                          {mod.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4 leading-relaxed font-normal">
                  {mod.desc}
                </p>

                {/* Fitur Utama */}
                <div className="mb-4 space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="text-emerald-600" />
                    <span>Fitur &amp; Kemampuan Teknis:</span>
                  </div>
                  <ul className="space-y-1 pl-1">
                    {mod.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alur Kerja */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4 space-y-1.5 text-xs">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <ArrowRight size={12} className="text-cyan-600" />
                    <span>Alur Kerja Penggunaan:</span>
                  </div>
                  {mod.flow.map((step, idx) => (
                    <div key={idx} className="text-slate-600 text-[11px]">
                      {step}
                    </div>
                  ))}
                </div>

                {/* Database & API Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 text-[10px]">
                  <span className="text-slate-400 font-bold flex items-center gap-1">
                    <Database size={11} className="text-emerald-600" />
                    <span>Tabel DB:</span>
                  </span>
                  {mod.dbTables.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-semibold border border-emerald-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button: Jump to this tab */}
              {setActiveTab && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab(mod.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>Buka Modul Ini Sekarang</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Deep-Dive Architecture Info Cards */}
      <div className="dash-card p-6 border-l-4 border-l-emerald-600">
        <h3 className="font-heading font-extrabold text-lg text-slate-900 mb-2 flex items-center gap-2">
          <Database size={20} className="text-emerald-600" />
          <span>Arsitektur Khusus &amp; Fondasi Database Bionet v6</span>
        </h3>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Berikut adalah penjelasan mendalam mengenai teknologi utama yang menjamin keakuratan komisi, kecepatan query pohon jaringan, dan integritas data pengguna.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <GitFork size={15} className="text-emerald-600" />
              <span>Closure Table (upline_paths)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Alih-alih query rekursif lambat yang rawan timeout pada ribuan downline, Bionet menyimpan relasi hierarki multi-generasi pada tabel closure. Query upline dan downline berjalan pada kompleksitas waktu <strong>O(1)</strong> instan.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <MapPin size={15} className="text-cyan-600" />
              <span>Data Wilayah Kemendagri</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tabel <code>indonesia_kode</code> memuat lebih dari 91.000 titik wilayah dari Sabang sampai Merauke. Terintegrasi langsung dengan alamat logistik pengiriman repeat order produk herbal dan domisili profil mitra.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Bot size={15} className="text-purple-600" />
              <span>AI Copilot &amp; Bot Telegram</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Terhubung langsung ke model Google Gemini 3.1 Flash-Lite dan Webhook Telegram Bot (<code>@btfn_assistant_bot</code>). Mitra dapat menanyakan status bonus pasangan, jadwal penarikan dana, dan edukasi herbal 24 jam nonstop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
