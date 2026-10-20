# Product Requirements Document (PRD) - Dashboard Mitra (Rebuild Bionet)

## 1. Pendahuluan
**Nama Proyek:** Rebuild Bionet - Dashboard Mitra  
**Tujuan Proyek:** Mengembangkan ulang (rebuild) dashboard khusus untuk Mitra/Member Bionetv5 agar lebih modern, cepat, aman, dan *scalable*. Rebuild ini akan menyelesaikan masalah performa dari sistem lama (Node.js/Sequelize) dengan arsitektur baru yang lebih efisien.

## 2. Tech Stack (Tumpukan Teknologi)
Sesuai dengan arahan arsitektur, proyek ini akan menggunakan:
*   **Frontend:** React (Direkomendasikan menggunakan Vite atau Next.js untuk performa dan SEO/Routing yang baik) + TailwindCSS (untuk UI yang cepat dan responsif).
*   **Backend:** Golang (Direkomendasikan menggunakan framework Gin atau Fiber untuk performa API yang sangat cepat).
*   **Database:** MySQL 8.0 (Melanjutkan database existing yang telah dioptimasi).
*   **Komunikasi API:** RESTful API dengan format JSON.

## 3. Perubahan Arsitektur Database & UUID
Sesuai dengan kebutuhan keamanan dan skalabilitas, skema database akan dinormalisasi:
*   **Migrasi Primary Key:** Primary Key pada tabel `users` akan diubah dari auto-increment/string `username` menjadi tipe data **UUID** (`user_id`).
*   **Penerapan Foreign Key (FK):** Seluruh tabel yang berelasi dengan user (seperti `wallets`, `datasponsors`, `dataposisis`, `jaluruplines`, dll) akan menggunakan `user_id` (UUID) sebagai Foreign Key, bukan lagi string `idUsername`.
*   *Keuntungan:* UUID mencegah enumerasi data (user id tidak mudah ditebak), lebih aman untuk sistem terdistribusi/microservices, dan konsisten di seluruh tabel.

## 4. Ruang Lingkup Fitur (Key Features)

### A. Autentikasi & Profil (User Management)
1.  **Login & Logout:** Autentikasi menggunakan JSON Web Token (JWT) dari backend Golang.
2.  **Dashboard Profil:** Melihat data pribadi, status paket (Silver, Gold, dll), dan username.
3.  **Manajemen Rekening Bank:** Menambah/mengubah data rekening bank untuk keperluan pencairan bonus (menggantikan fungsionalitas tabel `databankusers`).

### B. Ringkasan Dashboard (Overview)
1.  **Kartu Statistik Utama (Stat Cards):**
    *   Total Saldo Wallet aktif.
    *   Total Bonus (Sponsor, Pasangan, dll) bulan ini.
    *   Total Poin Kiri & Kanan (dari `poinpasangans` / `poinrewards`).
2.  **Grafik Pertumbuhan:** Grafik pendaftaran mitra baru di bawah jaringannya.

### C. Jaringan & Genealogi (MLM Network)
1.  **Pohon Jaringan (Binary Tree):** Visualisasi struktur pohon jaringan (kiri & kanan) menggunakan data dari `jaluruplines` dan `dataposisis`.
2.  **Daftar Sponsor (Referral List):** Tabel daftar mitra yang disponsori secara langsung (dari `datasponsors`).
3.  **Pencarian Jaringan:** Kemudahan mencari spesifik mitra di bawah jaringannya.

### D. Dompet Digital & Keuangan (E-Wallet & Bonus)
1.  **Mutasi Saldo (Ledger):** Melihat riwayat uang masuk (bonus) dan keluar (withdraw/belanja) bersumber dari tabel `wallets`.
2.  **Pencairan Bonus (Withdrawal):** Form untuk menarik dana ke rekening bank yang sudah didaftarkan.
3.  **Status Pencairan:** Melacak status transfer harian/bulanan (termasuk integrasi dengan webhook Flip.id jika diperlukan).

### E. Stokis & Aktivasi PIN
1.  **Katalog PIN:** Melihat daftar paket PIN yang tersedia (dari tabel `paketpin`).
2.  **Inventori PIN Mitra:** Melihat PIN yang dimiliki, belum terpakai, atau sudah terpakai (dari `stokpins`).
3.  **Transfer & Aktivasi PIN:** Fitur untuk mendaftarkan mitra baru (downline) menggunakan PIN yang belum terpakai.

### F. E-Commerce & Transaksi (RO - Repeat Order)
1.  **Katalog Produk:** Menampilkan daftar barang fisik yang bisa dibeli.
2.  **Riwayat Transaksi (Belanja/RO):** Melacak status pesanan (menunggu pembayaran, diproses, dikirim).

## 5. Kebutuhan Non-Fungsional
*   **Security:** Proteksi endpoint Golang dengan JWT Middleware, sanitasi input untuk mencegah SQL Injection, dan implementasi CORS yang ketat.
*   **Performance:** Backend Golang harus mampu menangani concurrent request tinggi, terutama saat kalkulasi bonus jaringan (Tree Traversal).
*   **Responsive UI:** Frontend React wajib ramah seluler (mobile-first design) karena mayoritas mitra MLM mengakses via *smartphone*.

## 6. Fase Pengembangan (Roadmap Singkat)
*   **Fase 1 - Database Refactoring (Backend):** Menyesuaikan skema MySQL, mengubah `username` menjadi UUID (`user_id`), dan migrasi data awal.
*   **Fase 2 - Core API Development (Golang):** Membuat endpoint Autentikasi, Profil, dan Ringkasan Wallet.
*   **Fase 3 - Core UI Development (React):** Membangun kerangka aplikasi React, implementasi state management, dan integrasi API Login & Dashboard.
*   **Fase 4 - Advanced API & UI (Golang + React):** Mengembangkan visualisasi Genealogi (Binary Tree), sistem Transaksi, dan integrasi Withdrawal (Flip.id).
*   **Fase 5 - Testing & UAT:** Pengujian fungsionalitas perhitungan bonus dan integritas data, dilanjutkan dengan peluncuran Beta.
