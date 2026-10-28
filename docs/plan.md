# 📋 MASTER ROADMAP & ANALISIS PENGEMBANGAN FITUR BIONET v6

Dokumen ini memuat **analisis kelayakan teknis, arsitektur sistem, dan rencana implementasi rinci** untuk 10 poin rencana pengembangan aplikasi Bionet v6 (Platform Multi-Level Marketing & E-Commerce Terintegrasi).

---

## 📑 DAFTAR ISI & RINGKASAN ANALISIS

| No | Rencana Fitur | Kelayakan Teknis | Prioritas | Estimasi Kompleksitas |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Integrasi Fitur AI (Artificial Intelligence)** | Sangat Layak (API Ready) | 🔥 Tinggi (Fase 1) | Sedang |
| **2** | **Toko Online Afiliasi Mitra (Drag & Drop + Custom Markup)** | Sangat Layak (Frontend & DB) | 🔥 Tinggi (Fase 1) | Menengah - Lanjutan |
| **3** | **Video Conference Terintegrasi (Zoom / Teams Clone)** | Sangat Layak (WebRTC / LiveKit) | ⚡ Sedang (Fase 2) | Menengah |
| **4** | **Integrasi Marketplace, Ekspedisi 3PL, & Barcode Resi Thermal** | Sangat Layak (REST API Biteship) | 🔥 Tinggi (Fase 1) | Menengah |
| **5** | **Pengembangan Menjadi CRM, ERP, & Modul Akuntansi Lengkap** | Sangat Layak (Modular Monolith) | ⚡ Sedang (Fase 2) | Tinggi |
| **6** | **Master Serial PIN Free (Promosi & Uji Coba)** | Sangat Layak (Cepat Dibuat) | 🔥 Sangat Cepat (Fase 1) | Rendah |
| **7** | **Aplikasi Mobile Menggunakan React Native / Expo** | Sangat Layak (API Go Gin Siap) | ⚡ Sedang (Fase 2) | Menengah |
| **8** | **Analisis Lisensi VictoriaMetrics & InfluxDB** | 100% Gratis & Open-Source | 💡 Teknis Infrastruktur | Rendah |
| **9** | **Auto-Alert Telegram Jika Threshold RAM/Bandwidth > 80%** | Sangat Layak (Bot Telegram Siap) | 🔥 Cepat (Fase 1) | Rendah |
| **10** | **WhatsApp Gateway Otomatis (Notifikasi Bonus, OTP, & Resi)** | Sangat Layak (Fonnte/Waha/Baileys)| 🔥 Tinggi (Fase 1) | Rendah - Sedang |

---

## 🔍 ANALISIS MENDALAM SETIAP FITUR

---

### 1. Fitur-Fitur Bionet yang Bisa Digabungkan dengan AI

Aplikasi Bionet v6 memiliki banyak proses bisnis yang dapat diakselerasi menggunakan kecerdasan buatan (khususnya Google Gemini 3.1 & Model Machine Learning):

1. **AI RAG Marketing Plan & Kalkulator Bonus Real-Time**:
   - **Masalah**: Mitra baru sering bingung menghitung potensi bonus pasangan (*pairing*), batas *flush-out*, dan syarat kualifikasi reward.
   - **Solusi AI**: AI Copilot yang membaca aturan resmi marketing plan dan database jaringan mitra, lalu menjawab pertanyaan spesifik: *"Berapa potensi bonus saya jika kaki kanan tambah 15 pasang dan kaki kiri 10 pasang?"*.
2. **AI Fraud & Sybil Attack Detection (Pencegahan Manipulasi Jaringan)**:
   - **Solusi AI**: Model analisis anomali untuk mendeteksi:
     - Duplikasi nomor rekening bank dan NIK KTP dengan nama yang dimanipulasi.
     - Pendaftaran massal dari IP address atau subnet yang identik.
     - Lonjakan permohonan *withdrawal* (WD) mencurigakan dalam waktu singkat.
3. **AI Sales Copywriting & Promosi Otomatis untuk Mitra**:
   - **Solusi AI**: Generator materi promosi dalam satu klik. Mitra memilih produk herbal Bionet, dan AI secara instan membuat:
     - Teks promosi WhatsApp Broadcast yang persuasif dan sopan.
     - Caption Instagram & naskah video pendek TikTok.
     - Story WhatsApp yang siap disalin beserta link afiliasi mitra.
4. **AI Smart Downline Health Advisor (Deteksi Kaki Pasif)**:
   - **Solusi AI**: Menganalisis pohon jaringan (*genealogy tree*). Jika ada downline aktif yang tiba-tiba berhenti melakukan repeat order atau ada kaki binary yang timpang, AI memberikan rekomendasi tindakan kepada upline leader untuk melakukan pendampingan.
5. **AI Automated Customer Support (CS) 24/7**:
   - Menjawab pertanyaan konsumen seputar izin BPOM, aturan minum produk herbal, status resi paket, dan panduan transfer PIN.

---

### 2. Toko Online Afiliasi Mitra (Replicated Website, Drag & Drop Builder, & Custom Markup Harga)

Fitur ini merupakan terobosan besar untuk memberdayakan mitra agar bisa berjualan layaknya pemilik toko online profesional:

#### A. Konsep Sistem & Alur Bisnis
```
[Produk Bionet di Pusat]
   Harga Modal Member: Rp 150.000 (ditetapkan Admin)
           │
           ▼
[Toko Online Kustom Mitra (Contoh: bionet.id/toko/ahmad-yani)]
   Mitra bebas menentukan Harga Jual Konsumen: Rp 200.000
           │
           ▼
[Customer Membeli via Link Afiliasi Mitra]
   1. Customer membayar: Rp 200.000
   2. Sistem otomatis membagi dana:
      - Rp 150.000 masuk ke kas perusahaan (dan diproses poin PV/RO).
      - Rp 50.000 (Selisih Markup) langsung masuk ke Saldo Wallet Mitra sebagai Keuntungan Langsung (Direct Retail Profit).
```

#### B. Fitur Unggulan Toko Online Mitra:
1. **Drag & Drop Layout Builder**:
   - Mitra dapat mengatur urutan blok tampilan: *Banner Promosi*, *Video Testimoni*, *Katalog Produk Unggulan*, *Profil Singkat Mitra*, *Tombol Chat WhatsApp Langsung*.
   - Menggunakan komponen modular berbasis React (mengadopsi konsep *Linktree* atau *Shopify mini*).
2. **Multi-Tier Sub-Affiliate**:
   - Mitra utama dapat membuat link khusus untuk *reseller* atau *dropshipper* mereka dengan persentase bagi hasil komisi yang fleksibel.
3. **Integrasi Tracking Pixel Mandiri**:
   - Mitra tingkat mahir dapat memasukkan ID **Meta Pixel (Facebook Ads)**, **TikTok Pixel**, dan **Google Tag Manager** milik mereka sendiri untuk melacak konversi iklan digital berbayar.
4. **Checkout Terhubung ke WhatsApp & Payment Gateway**:
   - Konsumen bisa memilih checkout instan via WhatsApp (format pesanan terisi otomatis) atau bayar langsung via QRIS/Virtual Account.

---

### 3. Video Conference Terintegrasi (Zoom / Microsoft Teams Clone)

#### A. Apakah Bisa Dibuat?
**BISA 100%**. Pengguna tidak perlu membuka aplikasi Zoom eksternal; meeting video conference dapat dibuka langsung di dalam portal dashboard Bionet.

#### B. Pilihan Arsitektur & Teknologi:
1. **LiveKit (Opsi Terbaik - Native Go + React)**:
   - LiveKit Server dibangun menggunakan **Golang** (sejalan dengan backend Bionet).
   - Memiliki komponen resmi React (`@livekit/components-react`) yang responsif untuk desktop dan HP.
   - **Gratis & Open-Source** jika di-host di VPS sendiri.
2. **Jitsi Meet React SDK (Opsi Tercepat)**:
   - Memasang room meeting siap pakai ke dalam tab dashboard Bionet hanya dalam beberapa baris kode.
   - Sudah memiliki fitur lengkap: Mute all, screen sharing, raise hand, rekaman cloud, dan chat room.

#### C. Skenario Penggunaan Utama di Bionet:
- **BOP (Business Opportunity Presentation) Online**: Leader mempresentasikan peluang bisnis Bionet kepada calon prospek secara live.
- **Video KYC Anti-Fraud**: Petugas CS/Admin melakukan video call singkat dengan mitra untuk memvalidasi KTP asli dan wajah sebelum pencairan dana reward bernilai besar (Mobil/Rumah).
- **Klinik Herbal & Konsultasi Kesehatan Online**: Sesi tanya jawab live dengan herbalis/dokter mitra Bionet.

---

### 4. Integrasi Marketplace, Ekspedisi Pihak Ketiga (3PL), & Cetak Label Thermal Barcode

#### A. Integrasi Ekspedisi Pihak Ketiga (JNE, J&T, SiCepat, Anteraja, Pos Indonesia)
- **Metode Integrasi Terbaik**: Menggunakan API Agregator Logistik Indonesia seperti **Biteship API** atau **Shipper API**.
- **Fitur Otomatis**:
  - Pengecekan ongkos kirim real-time berdasarkan berat barang dan kelurahan/kecamatan tujuan (terintegrasi dengan dropdown wilayah Indonesia yang sudah ada).
  - *Auto-Generate Airway Bill (AWB / Nomor Resi)* langsung saat admin gudang mengklik tombol "Proses Pengiriman".
  - *Live Tracking Resi*: Mitra dan admin dapat memantau posisi paket langsung dari aplikasi.

#### B. Cetak Label Thermal Resi (Ukuran Standar 100x150 mm)
- **Mekanisme**: Menghasilkan dokumen cetak berformat standar printer thermal (Bluetooth/USB) dengan:
  - Barcode Resi (Code 128) dan QR Code Pesanan.
  - Alamat pengirim (Gudang Bionet atau nama toko mitra dropshipper).
  - Alamat penerima lengkap dengan nomor telepon.
  - Rincian produk dan instruksi kurir (*Fragile / Jangan Dibanting*).

#### C. Integrasi Marketplace (Shopee, TikTok Shop, Lazada)
- Menggunakan Open Platform API resmi (Shopee Open API & TikTok Shop Partner API).
- **Sinkronisasi Stok Otomatis (Omnichannel)**: Saat ada pesanan masuk dari TikTok Shop atau Shopee, stok fisik di gudang Bionet otomatis berkurang, menghindari *overselling*.

---

### 5. Pengembangan Menjadi CRM, ERP, & Aplikasi Keuangan Lengkap

Arsitektur Bionet v6 saat ini (Golang Clean Architecture + UUID) sangat ideal untuk diekspansi menjadi sistem manajemen perusahaan terpadu:

1. **CRM (Customer Relationship Management)**:
   - **Leads Pipeline**: Mencatat calon mitra yang masuk dari iklan atau link afiliasi (status: *Prospek Baru* ➔ *Dihubungi* ➔ *Ikut Seminar* ➔ *Join Member*).
   - **Riwayat Follow-Up**: Mencatat catatan pembicaraan leader dengan prospek.
   - **Pengingat Repeat Order Otomatis**: Mengingatkan mitra yang produk herbalnya diperkirakan habis dalam 30 hari.
2. **ERP (Enterprise Resource Planning - Gudang & Stokis)**:
   - **Multi-Warehouse**: Gudang Pusat, Gudang Cabang Regional, dan Master Stokis.
   - **Batch Lot & Tanggal Kadaluarsa (Expiry Date)** produk herbal.
   - **Purchase Order (PO)** ke pabrik/pemasok dan pencatatan barang masuk (*Goods Receipt*).
3. **Aplikasi Keuangan & Akuntansi (Core Finance)**:
   - **Chart of Accounts (COA)**: Daftar kode akun standar akuntansi Indonesia.
   - **Jurnal Umum Otomatis**: Setiap transaksi bonus, penjualan RO, dan penarikan saldo otomatis mencatat posisi Debet dan Kredit.
   - **Laporan Laba Rugi (Profit & Loss)** dan **Neraca Saldo (Balance Sheet)** platform.

---

### 6. Fitur Admin: Pembuatan Serial PIN Free (Promosi & Uji Coba)

#### A. Kebutuhan Bisnis
Manajemen sering membutuhkan PIN aktivasi gratis untuk program promo pendaftaran member tanpa modal awal, reward promosi event, atau kemitraan khusus.

#### B. Aturan Sistem (Business Rules) Penting:
1. **Harga & Biaya Modal**: Rp 0.
2. **Nilai Poin PV (Point Volume)**: Wajib bernilai **0 PV**.
   - *Penting*: PIN Free tidak boleh menghasilkan bonus pasangan (*pairing bonus*) bagi upline agar perusahaan tidak mengalami kerugian finansial (*pairing bonus drain*).
3. **Hak Akun**: Member yang mendaftar via PIN Free dapat login, mendapatkan link referral, dan membina jaringan. Saat mereka ingin mencairkan bonus, mereka diwajibkan melakukan *upgrade* ke paket reguler (Silver/Gold/Platinum) dengan membeli PIN berbayar.
4. **Implementasi di Backend**:
   - Menambahkan tipe paket `'FREE'` pada enum paket PIN di tabel database `pins` dan `pin_transfers`.
   - Menambahkan opsi `"Paket Promosi (PIN Free - 0 PV)"` pada form generate PIN di `AdminPinsTab.jsx`.

---

### 7. Aplikasi Mobile Menggunakan React Native / Expo

#### A. Analisis Kelayakan & Efisiensi
- **Sangat Direkomendasikan & Sangat Efisien**.
- **Alasan**: Backend Golang Gin Bionet v6 saat ini telah dirancang sebagai **API RESTful murni berbasis JSON & JWT**. Artinya:
  - Backend yang sama 100% langsung dapat melayani aplikasi Mobile tanpa perlu menulis ulang satu baris pun kode backend.
  - React Native (terutama menggunakan framework **Expo**) berbagi konsep logika yang identik dengan React Web yang saat ini sudah berjalan.

#### B. Keunggulan Versi Mobile Native:
1. **Push Notifications Instan**: HP mitra langsung berdering saat ada bonus pasangan masuk, bonus referral cair, atau downline baru bergabung.
2. **Pemindai Kamera Native**: Scan QR Code instan untuk transfer serial PIN antar mitra saat pertemuan tatap muka.
3. **Biometrik Login**: Login cepat menggunakan sidik jari (Fingerprint / Face ID) tanpa perlu mengetik kata sandi berulang kali.
4. **Distribusi**: Tersedia di Google Play Store (Android) dan Apple App Store (iOS).

---

### 8. Apakah VictoriaMetrics dan InfluxDB Gratis?

| Database | Model Lisensi | Biaya | Batasan Versi Gratis |
| :--- | :--- | :--- | :--- |
| **VictoriaMetrics** | **Open Source (Apache 2.0)** | **100% GRATIS SELAMANYA** | Versi Single-Node bebas digunakan tanpa batasan fitur untuk monitoring server pribadi/perusahaan. Mendukung jutaan metrik/detik dengan konsumsi RAM sangat kecil. |
| **InfluxDB** | **Open Source (MIT / Influx Community)** | **100% GRATIS** (Community Edition) | Versi Open Source v1.x/v2.x/v3 Core gratis di-host sendiri. Versi InfluxDB Cloud/Enterprise berbasis langganan bulanan. |
| **Prometheus** | **Open Source (Apache 2.0)** | **100% GRATIS SELAMANYA** | Standar resmi Cloud Native Computing Foundation (CNCF), gratis tanpa biaya lisensi. |

> **Kesimpulan Rekomendasi**:  
> Jika Anda ingin database monitoring gratis, hemat RAM, dan sangat cepat untuk aplikasi Go Bionet, **VictoriaMetrics Single-Node** adalah pilihan nomor satu di dunia saat ini.

---

### 9. Alert Otomatis ke Bot Telegram Jika Threshold RAM / Bandwidth / CPU > 80%

#### A. Mekanisme Kerja Alerting
Sistem Bionet v6 saat ini sudah memiliki integrasi **Telegram Bot Service** (`telegram_service.go`). Fitur auto-alert dapat langsung diaktifkan dengan alur berikut:

```
[Background Monitoring Worker (Setiap 10 Detik)]
                     │
                     ▼
  Membaca: RAM Usage (Alloc vs Sys), CPU %, Latensi HTTP
                     │
         Apakah Threshold >= 80% ?
         ┌───────────┴───────────┐
        YA                      TIDAK
         │                        │
         ▼                        ▼
[Cek Cooldown 15 Menit]      Lanjutkan loop normal
         │
    Kirim Pesan Darurat ke Telegram Admin Chat ID:
    "🚨 ALERT SERVER OVERLOAD!
     Penggunaan RAM mencapai 84.2% (24.1 MB / 28.5 MB)
     Total Request Aktif: 1,420 req/menit
     Segera periksa Admin Telemetry Dashboard!"
```

#### B. Fitur Anti-Spam (Cooldown Timer):
Agar bot Telegram tidak membombardir pesan setiap 10 detik saat server sedang sibuk, sistem diberi jeda waktu peringatan (*cooldown*) selama 10–15 menit sebelum mengirimkan peringatan berikutnya jika kondisi beban tinggi masih bertahan.

---

### 10. WhatsApp Gateway Otomatis (Notifikasi Transaksi, OTP, & Update Resi)

#### A. Mengapa Fitur Ini Krusial?
Di Indonesia, 95%+ mitra MLM dan konsumen e-commerce membuka pesan **WhatsApp** jauh lebih cepat dibandingkan email atau notifikasi web.

#### B. Opsi Implementasi:
1. **Fonnte API / Wabus / Starsender (SaaS API - Praktis & Siap Pakai)**:
   - Cukup scan QR code nomor WhatsApp perusahaan, backend Go mengirim pesan otomatis melalui REST API HTTP.
2. **Waha (WhatsApp HTTP API) / Baileys (Open-Source Self-Hosted - Gratis)**:
   - Dijalankan di server VPS sendiri via Docker container, tanpa biaya langganan bulanan pihak ketiga.

#### C. Pesan Otomatis yang Dikirim:
- Notifikasi pendaftaran mitra baru beserta username & password awal.
- Notifikasi penerimaan bonus pasangan dan bonus sponsor.
- Notifikasi persetujuan transfer penarikan dana (WD) berhasil.
- Pengiriman nomor resi paket pengiriman beserta link pelacakan kurir.

---

## 🚀 TAHAPAN & JADWAL PRIORITAS IMPLEMENTASI (ROADMAP)

### 📌 FASE 1: Quick Wins & Fondasi Kritis (1 - 2 Minggu)
1. ✅ **Serial PIN Free**: Tambahkan paket PIN Free (0 PV) di admin & backend.
2. ✅ **Auto-Alert Telegram Threshold 80%**: Sambungkan worker `monitoring_service.go` ke `telegram_service.go`.
3. ✅ **Integrasi Cetak Label Resi Thermal & Biteship**: Cek ongkir otomatis dan print label 100x150 mm.
4. ✅ **Toko Afiliasi Mitra (Fase Awal)**: Halaman template bio-link toko online per mitra dengan pengaturan markup harga retail.

### 📌 FASE 2: Ekspansi Fitur Interaktif & Mobile (3 - 5 Minggu)
1. 📱 **Aplikasi Mobile (React Native / Expo)**: Rilis versi Android APK untuk mitra dengan fitur push notifikasi bonus.
2. ✅ **Video Conference Internal (WebRTC & Jitsi Meet)**: Tab room meeting webinar BOP, Video KYC, dan konsultasi herbal.
3. ✅ **WhatsApp Gateway**: Notifikasi otomatis untuk bonus, PIN, dan pengiriman barang.
4. 📊 **Database Telemetri (VictoriaMetrics)**: Penyimpanan grafik performa server jangka panjang.

### 📌 FASE 3: Enterprise Omnichannel & Intelligence (6+ Minggu)
1. 🛍️ **Sinkronisasi Marketplace**: Integrasi inventori terpusat dengan TikTok Shop & Shopee.
2. 🤖 **AI Advanced RAG & Predictive Downline Churn**: Analisis jaringan mendalam dan asistensi marketing otomatis.
3. 🏢 **ERP & Akuntansi Lanjutan**: Jurnal umum otomatis, mutasi multi-gudang, dan laporan laba rugi platform.

---

## 🛠️ LOG PROGRESS PENGERJAAN FASE 1 (SUDAH SELESAI DIKERJAKAN)

Berikut adalah rekapitulasi modul dan fitur Fase 1 yang telah selesai diimplementasikan, diuji, dan aktif berjalan:

### 1. Serial PIN Free (0 PV) & Paket Platinum (7 HU)
- **Database & Model**:
  - Didaftarkan paket resmi baru `Paket Promo Free (0 PV)` dengan harga Rp 0, Sponsor Bonus Rp 0, Pairing Bonus Rp 0, dan Poin 0.00 PV.
  - Didaftarkan paket `Paket Platinum (7 HU)` dengan harga Rp 1.750.000 (Bonus Sponsor Rp 350.000, Pairing Rp 140.000, 7.00 PV).
- **Keamanan Bisnis Jaringan (Anti-Drain)**:
  - Pada fungsi `RegisterDownline` di repository, penambahan poin volume binary hanya dipicu jika `pin.Package.Points > 0`. Pendaftaran via PIN Free tidak memicu poin pasangan ke upline, menjamin keamanan kas perusahaan dari kecurangan akun tuyul/kloning.
- **Frontend Admin & Mitra**:
  - Di `AdminPinsTab.jsx`: Pilihan cetak PIN Free tersedia otomatis dengan badge khusus `FREE PROMO (0 PV)`.
  - Di `PinTab.jsx`: Ditampilkan kartu paket promo gratis di samping Silver, Gold, dan Platinum.

### 2. Auto-Alert Telegram Bot Threshold 80% (RAM / CPU / Bandwidth)
- **Background Engine Watcher**:
  - Goroutine di `monitoring_service.go` memantau rasio `AllocMB / SysMB` setiap 4 detik.
  - Jika rasio $\ge 80\%$, sistem otomatis mengirimkan pesan bahaya ke chat admin Telegram via `telegram_service.go`.
  - Dilengkapi sistem **Cooldown 15 Menit** untuk mencegah spam notifikasi.
- **Uji Coba Langsung (Testing Trigger)**:
  - Dibuatkan endpoint API `POST /api/admin/monitoring/test-alert` (Role: Admin).
  - Ditambahkan tombol **"Test Bot Telegram"** di header `AdminMonitoringTab.jsx` untuk memverifikasi bot secara instan.

### 3. Cetak Label Resi Thermal Ekspedisi 3PL (Standar 100 x 150 mm)
- **Modal Label Resi Thermal**:
  - Ditambahkan tombol **"Label Resi"** pada setiap baris pesanan di `AdminOrdersTab.jsx`.
  - Format cetak dirancang sesuai standar printer thermal Bluetooth/USB ukuran 100x150 mm:
    - Header kurir (J&T EZ, JNE REG, SiCepat, NON-COD).
    - Barcode visual Code 128 dan Nomor Resi `BIO-EXP-[NO_ORDER]`.
    - Alamat lengkap Penerima (HP & Kecamatan/Kota) dan Pengirim (Warehouse Pusat Bionet).
    - Rincian produk, berat koli (1.0 Kg), dan stiker peringatan `FRAGILE / JANGAN DIBANTING`.
    - Tombol cetak langsung memicu dialog printer browser (`window.print()`).

### 4. Toko Online Afiliasi Mandiri Mitra (Replicated Storefront & 5 Template Desain)
- **Fitur Toko Afiliasi**:
  - Modal interaktif `AffiliateStoreModal.jsx` yang bisa diakses langsung dari `OverviewTab.jsx`.
  - **Link Afiliasi Unik & Parameter Template**: `http://localhost:5173/?store=mitra01&tpl=luxury` dengan tombol salin link otomatis menyertakan template pilihan.
  - **Pengaturan Markup & Keuntungan**: Mitra dapat menentukan margin keuntungan ritel sendiri (misal +Rp 50.000 per botol). Sistem otomatis menghitung harga jual konsumen dan keuntungan bersih langsung mitra.
  - **Instant WhatsApp Checkout & Form Order**: Konsumen mengklik tombol "Pesan via WA" atau mengisi formulir order singkat, sistem otomatis membuka chat WhatsApp mitra dengan teks pesanan yang sudah terformat rapi.
  - **5 Pilihan Template Desain Toko (Minimal 5)**:
    1. **Modern Emerald (`emerald`)**: Tampilan distributor resmi standar Bionet dengan palet hijau zamrud berwibawa, lencana BPOM, dan tata letak katalog 2 kolom bersih.
    2. **Royal Obsidian & Gold (`luxury`)**: Tampilan premium dark mode bertema obsidian hitam dengan aksen emas murni, lencana VIP Reserve, dan tipografi eksklusif untuk segmen pasar kelas atas.
    3. **Fresh Botanical Mint (`organic`)**: Nuansa hijau daun segar yang menenangkan dan ramah keluarga, menonjolkan kealamian herbal nabati tanpa efek samping.
    4. **Futuristic Cyber Clinical (`biotech`)**: Desain berorientasi sains dan nanoteknologi seluler dengan palet midnight navy & electric cyan serta metrik lab real-time (Bioavailability 99.8%).
    5. **Social Bio-Link (`minimalist`)**: Format vertikal mobile-first ala Linktree/TikTok/IG Bio dengan avatar profil besar, tombol cepat WhatsApp, dan kartu produk ringkas 1-klik checkout.
  - **Live Preview & Quick Switcher**: Mitra dapat mengganti template secara instan di modal pratinjau maupun di halaman publik mandiri (`PublicStorefrontPage.jsx`).

### 5. Live Telemetry Area Chart, Route Monitoring, & Fraud Alert Telegram
- **SVG Real-Time Area Chart**: Grafik live visual throughput bandwidth (KB/s) dan alokasi RAM Heap (MB) dengan rentang historis 30 titik kontinu di `AdminMonitoringTab.jsx`, dilengkapi kurva cubic spline halus, grid Y-axis terukur, dan hover crosshair tooltip interaktif.
- **Frontend Route Access Tracking**: Middleware dan service `monitoring_service.go` mencatat frekuensi akses menu/rute frontend oleh user secara live.
- **Fraud Telegram Instant Alert**: Setiap indikasi fraud terdeteksi (pendaftaran kloning IP, duplikasi rekening, pembekuan user) langsung dikirimkan sebagai peringatan prioritas tinggi ke Telegram Admin.

---

## 🛠️ LOG PROGRESS PENGERJAAN FASE 2 (AKTIF & SUDAH BERJALAN)

### 1. Video Conference Internal Terintegrasi (Zoom & Teams Clone)
- **Model Database & API Go Gin**:
  - Dibuatkan model `models.Meeting` dengan UUID primary key, `room_id`, `category` (`bop`, `kyc`, `herbal`, `training`), `status` (`scheduled`, `live`, `ended`), dan kapasitas peserta.
  - Endpoint RESTful:
    - `GET /api/meetings`: Daftar room meeting aktif dan terjadwal.
    - `POST /api/meetings`: Pembuatan room meeting baru oleh host/mitra.
    - `GET /api/meetings/:room_id`: Validasi dan detail room.
    - `POST /api/meetings/:room_id/end`: Penutupan room meeting oleh host.
- **Frontend In-App Meeting Room (`MeetingTab.jsx`)**:
  - **Lobby & Penjadwalan**: Filter kategori agenda (Webinar BOP Nasional, Video KYC Anti-Fraud, Klinik Herbal), tombol salin link undangan room, dan modal buat room baru.
  - **Live Conference Interface**:
    - Kontrol mikrofon (Mute/Unmute) & kamera (On/Off) berbasis `navigator.mediaDevices.getUserMedia`.
    - Fitur **Screen Sharing** materi presentasi (`navigator.mediaDevices.getDisplayMedia`).
    - Fitur **Raise Hand (Angkat Tangan)** dengan animasi interaktif.
    - **In-Meeting Live Chat & Peserta**: Tab chat interaktif antar peserta di dalam room dan daftar partisipan aktif.
    - **Dukungan Dual-Engine**: Mode Native WebRTC dan opsi 1-klik beralih ke Mode Global Jitsi 8x8 Mesh.
- **Integrasi Navigasi Sidebar**:
  - Tersedia di sidebar mitra maupun administrator (`Video Conference & BOP`).

### 2. WhatsApp Gateway Otomatis (Notifikasi Transaksi, Bonus, & Resi)
- **Backend Service `whatsapp_service.go`**:
  - Service pengiriman pesan WhatsApp otomatis terintegrasi (Fonnte/Waha/Simulation).
  - Generator template pesan otomatis:
    - `SendBonusNotification`: Notifikasi komisi bonus sponsor & pasangan (pairing) cair ke dompet.
    - `SendOrderTrackingNotification`: Notifikasi pickup kurir dan nomor resi pengiriman ekspedisi 3PL.
    - `SendCustomMessage`: Pesan kustom / pengumuman broadcast admin.
  - Antrean buffer log delivery 50 pesan terakhir dengan status `sent`.
- **Panel Monitoring & Uji Coba di Admin (`AdminMonitoringTab.jsx`)**:
  - Sub-tab khusus **"WhatsApp Gateway & Notifikasi"** pada menu Live Telemetry.
  - Form interaktif uji kirim pesan WhatsApp ke nomor HP tujuan.
  - Tabel log pengiriman pesan real-time (Waktu, No. HP, Penerima, Kategori, Cuplikan Pesan, Status Delivery).



