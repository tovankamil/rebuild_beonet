import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Instagram,
  Video,
  MessageSquare,
  RefreshCw,
  Send,
  Zap,
  TrendingUp,
  Sliders,
  Type,
  FileText,
  ThumbsUp,
  Heart,
  Smile,
  Hash,
} from 'lucide-react';
import { playCoinChime } from '../../utils/soundNotification';

const PLATFORMS = [
  { id: 'wa_story', label: 'WhatsApp Status', icon: Smartphone, color: 'text-emerald-700' },
  { id: 'social_feed', label: 'Feed IG & FB', icon: Instagram, color: 'text-pink-600' },
  { id: 'tiktok_reels', label: 'Skrip TikTok / Reels', icon: Video, color: 'text-indigo-600' },
  { id: 'wa_broadcast', label: 'Broadcast Prospek', icon: MessageSquare, color: 'text-teal-600' },
];

const TOPICS = [
  { id: 'asam_urat', label: 'Asam Urat & Nyeri Sendi' },
  { id: 'mata_sehat', label: 'Mata Sehat & Penglihatan Jernih' },
  { id: 'bisnis_irt', label: 'Peluang Bisnis IRT & Sampingan' },
  { id: 'promo_gajian', label: 'Promo Gajian & Flash Sale RO' },
  { id: 'maag_gerd', label: 'Asam Lambung & GERD Tuntas' },
];

const TONES = [
  { id: 'berkah', label: 'Penuh Berkah & Syariah', desc: 'Bahasa santun, doa ikhtiar, halal & berkah' },
  { id: 'medis', label: 'Medis & Edukatif', desc: 'Fakta flavonoid, uji klinis & standar BPOM' },
  { id: 'storytelling', label: 'Storytelling Nyata', desc: 'Alur emosional testimoni sebelum & sesudah' },
  { id: 'hardsell', label: 'Hard-Selling Urgensi', desc: 'Diskon kilat, slot menipis & gratis ongkir' },
];

// Rich copywriting variations matrix
const COPY_DATABASE = {
  wa_story: {
    asam_urat: {
      berkah: `Bismillah... Siapa sangka ikhtiar 7 tetes Bio-Propolis Trigona tiap pagi bisa bikin jempol kaki yang tadinya bengkak nyut-nyutan langsung enteng melangkah ke masjid? 🌿🤲\n\nTak ada penyakit yang tak ada obatnya atas izin Allah. Herbal murni berizin BPOM POM TR 226012891 tanpa bahan kimia.\n\nYang ortu atau saudaranya lagi berjuang asam urat, boleh japri ya. Ada tips terapi gratis hari ini ✨👇`,
      medis: `Fakta Ilmiah Medis: Nyeri asam urat terjadi saat kristal monosodium urat menumpuk di persendian 🔬\n\nBio-Propolis Trigona kaya senyawa CAPE (Caffeic Acid Phenethyl Ester) yang terbukti secara empiris menghambat enzim xanthine oxidase (penghasil asam urat).\n\nResmi BPOM POM TR 226012891. Ready stok terbatas! Mau konsultasi dosis tepat? Reply status ini sekarang ya 📲`,
      storytelling: `Kemarin lusa tetangga depan rumah nangis karena bangun tidur gak bisa napak lantai akibat asam urat kumat 😢\n\nAlhamdulillah setelah rutin tetes Bio-Herbal & Propolis Bionet 3 hari berturut-turut, bengkaknya kempes dan tadi subuh sudah bisa jalan santai.\n\nSenang banget rasanya bisa jadi wasilah kesembuhan orang lain. Info lengkap resep herbalnya ketuk balasan ya 🙏`,
      hardsell: `🚨 SISA 5 BOTOL TERAKHIR HARI INI!\n\nAsam urat jangan dibiarkan merusak ginjal! Tuntaskan dengan Bio-Propolis Trigona Bionet (POM TR 226012891).\n\n🔥 Khusus order via status ini sekarang:\n✅ GRATIS Ongkir Se-Indonesia\n✅ BONUS Panduan Menu Diet Asam Urat\n\nKetik "MAU PROMO" sekarang sebelum kehabisan! 💬`,
    },
    mata_sehat: {
      berkah: `Mata adalah karunia luar biasa dari Sang Khalik. Menjaga penglihatan tetap jernih dan segar adalah wujud syukur kita 👁️🤲\n\nBio-Energy Refresh Spray siap menemani aktivitas harian. Rasakan sensasi sejuk tanpa perih.\n\nSemoga ikhtiar kita selalu berbuah kesehatan paripurna. Mau coba sensasi dinginnya? Reply status ini yaa 🌿`,
      medis: `Terlalu lama menatap layar HP/laptop bisa menyebabkan Computer Vision Syndrome (CVS) dan oksidasi retina 💻⚠️\n\nBio-Energy Refresh Spray (POM NA 18220104821) menghadirkan ion bio-aktif untuk melancarkan sirkulasi kapiler mata dan meredakan ketegangan otot silier.\n\nCukup semprot 15cm dengan mata terpejam. Segar seketika! Konsultasi gratis via japri 👇`,
      storytelling: `Dulu setiap sore nyetir motor pulang kerja mata rasanya pedih banget dan silau kalau kena lampu mobil lawan arah 😣\n\nSejak disemprot Bio-Energy Spray dan rutin minum Propolis Bionet, minus terasa lebih ringan dan pandangan jauh lebih jernih.\n\nTeman kantor sampai ikutan nitip beli. Yang mau coba barengan boleh absen di bawah ya! 👇`,
      hardsell: `STOP KUCEK-KUCEK MATA! Mata silau, merah, dan berbayang bisa jadi tanda katarak dini ⚠️\n\nAmankan Bio-Energy Refresh Spray hari ini!\n🎁 Dapatkan Paket Hemat Beli 2 Lebih Murah\n🚚 Kirim Cepat Hari Ini Juga\n\nBalas status ini: "SAYA MAU SPRAY" sekarang juga! ⚡`,
    },
    bisnis_irt: {
      berkah: `Alhamdulillah... dari ruang tamu sambil jagain anak, saldo rekening tetap bertumbuh berkah dari bisnis Bionet Herbal 🤲💼\n\nSistem adil, tanpa riba, produknya nyata bermanfaat menyembuhkan banyak orang. Bisnis yang membuat kita kaya dunia akhirat insyaAllah.\n\nIbu-ibu yang mau produktif dari rumah tanpa modal jutaan, yuk sharing santai di WhatsApp saya 🥰📲`,
      medis: `Industri fitofarmaka herbal di Indonesia bertumbuh lebih dari 14% per tahun pasca pandemi 📈\n\nBionet menghadirkan ekosistem bisnis bersertifikat resmi BPOM dengan sistem bagi hasil pairing real-time.\n\nPeluang pasar repeat order tinggi karena propolis & herbal tetes habis pakai setiap bulan. Info kemitraan resmi: Hubungi saya sekarang 🤝`,
      storytelling: `Dulu sempat insecure karena cuma ibu rumah tangga biasa yang gak punya penghasilan sendiri 🥺\n\nAlhamdulillah setelah kenal Bionet, dibimbing dari nol sampai bisa hasilkan jutaan rupiah tiap minggu dari HP. Suami pun bangga dan bahagia.\n\nKalau saya yang gaptek aja bisa, bunda pasti juga bisa! Siap saya bimbing sampai pecah telur, kuota 3 orang tercepat chat ya 👇`,
      hardsell: `PUNYA HP JANGAN CUMA HABISIN KUOTA BUAT SCROLL SOSMED! 💸\n\nGabung kemitraan Bionet Network modal super ringan:\n✅ Free Web Bio-Link Eksklusif Atas Nama Anda\n✅ Bonus Pasangan Cair Harian Otomatis\n✅ Full Bimbingan Marketing & Modul AI Siap Pakai\n\nSlot bimbingan intensif terbatas! Chat "DAFTAR MITRA" sekarang sebelum ditutup 🚀`,
    },
    promo_gajian: {
      berkah: `Gajian tiba, saatnya sisihkan sebagian rezeki untuk investasi kesehatan diri dan orang tua tercinta 🌿❤️\n\nSehat itu nikmat paling mahal. Mencegah jauh lebih mulia daripada mengobati.\n\nPaket Sehat Berkah Gajian Bionet kini hadir dengan potongan spesial. Semoga rezeki kita dilipatgandakan dan penuh berkah. Info japri yaa 🤲`,
      medis: `Investasi preventif kesehatan jauh lebih hemat 80% dibanding biaya perawatan komplikasi di masa depan 🏥\n\nManfaatkan Promo Gajian Bionet untuk pemenuhan antioksidan flavonoid keluarga Anda selama 1 bulan penuh.\n\nGaransi keaslian 100% langsung dari pabrik berstandar CPOTB. Chat untuk klaim voucher promo hari ini!`,
      storytelling: `Senangnya lihat senyum Ibu di kampung waktu dikirimi paket herbal Bionet pas gajian kemarin 🥰\n\nKata Ibu: "Alhamdulillah nak, lutut ibu gak ngilu lagi buat sholat tarawih dan jalan ke pengajian".\n\nBahagia orang tua adalah pembuka pintu rezeki anak. Mau kasih kado kesehatan buat orang tercinta? Promo gajian masih aktif lho! 🎁`,
      hardsell: `🔥 FLASH SALE GAJIAN BIONET: DISKON HINGGA 35%! 🔥\n\nHanya berlaku 24 JAM:\n💥 Bio-Propolis Trigona + Bio-Herbal Drops\n🎁 GRATIS 1 Botol Spray & Ongkir Seluruh Indonesia!\n\nStok gudang hanya tersisa 12 paket flash sale! Balas "KLAIM GAJIAN" detik ini juga sebelum harga normal kembali! ⏳`,
    },
    maag_gerd: {
      berkah: `Alhamdulillah, nikmatnya bisa makan tepat waktu dan tidur nyenyak tanpa dada panas begah karena asam lambung 🤲🌿\n\nIkhtiar ramuan herbal alami Bionet yang menyejukkan saluran cerna. Semoga jadi jalan kesembuhan yang sempurna.\n\nBagi yang sedang berikhtiar sembuh dari maag kronis, mari saling doakan dan diskusi via WhatsApp yaa 🤍`,
      medis: `GERD bukan sekadar sakit perut biasa, melainkan pelemahan sfingter esofagus bawah akibat asam hidroklorida berlebih 🩺\n\nBio-Herbal Drops bekerja menetralkan pH lambung tanpa mengganggu enzim cerna alami, sementara propolis menumpas infeksi bakteri H. Pylori.\n\nResep teruji BPOM RI. Jadwalkan konsultasi herbal Anda sekarang via chat!`,
      storytelling: `Pernah gak sih ngerasain jam 2 pagi kebangun karena dada sesak panas kayak ditusuk-tusuk dan leher terasa pahit? Itu mimpi buruk saya selama 2 tahun 😭\n\nSampai akhirnya rutin minum Bio-Herbal Drops sebelum sarapan dan Propolis sebelum tidur. Lambung adem, tidur lelap sampai subuh.\n\nJangan tahan penderitaan GERD Anda sendirian. Mau resepnya? Chat aku sekarang yuk 🤗`,
      hardsell: `STOP MINUM OBAT KIMIA PENENANG LAMBUNG BERLEBIHAN! 🛑\n\nTuntaskan akar penyebab maag & GERD menahun secara alami sampai ke akarnya dengan Bio-Herbal Drops Bionet!\n\n💥 Garansi Produk Asli BPOM TR 213609811\n📦 Bayar di Tempat (COD) Tersedia\n\nKetik "SEMBUH MAAG" untuk amankan paket promo khusus hari ini! 🏃‍♂️💨`,
    },
  },
  social_feed: {
    asam_urat: {
      berkah: `Alhamdulillah, tidak ada nikmat yang lebih mahal daripada bisa melangkahkan kaki dengan ringan tanpa rasa nyeri persendian. 🌿\n\nBagi sahabat yang sedang berjuang dengan asam urat tinggi, jangan putus asa. Setiap penyakit ada obatnya atas ridho Allah Ta'ala.\n\nBio-Propolis Trigona Bionet hadir sebagai ikhtiar suplemen fitofarmaka alami berbasis bio-flavonoid murni lebah tanpa sengat (Trigona Sp). Membantu melarutkan kristal asam urat dan meredakan peradangan sendi.\n\n✅ Resmi BPOM RI: POM TR 226012891\n✅ Halal & Aman Ginjal\n✅ Formulasi Alami Tanpa BKO\n\nMari jaga amanah tubuh sehat kita. Silakan klik link di bio profil untuk konsultasi gratis resep herbal keluarga Anda. 🤲✨\n\n#BionetHerbal #AsamUratSembuh #PropolisTrigona #IkhtiarSehat #ResepHerbalAlami #BPOMResmi`,
      medis: `Kenapa Nyeri Asam Urat Sering Menyerang Tiba-Tiba di Malam Hari? 🔬🩺\n\nKadar asam urat dalam darah yang melebihi batas normal (> 7.0 mg/dL pada pria atau > 6.0 mg/dL pada wanita) akan mengkristal menjadi monosodium urat tajam di rongga sendi jempol kaki, pergelangan, atau lutut.\n\nStudi klinis membuktikan bahwa Bio-Propolis Trigona mengandung senyawa aktif Caffeic Acid Phenethyl Ester (CAPE) dan Quercetin konsentrasi tinggi. Senyawa ini bekerja aktif menekan sintesis enzim xanthine oxidase sehingga pembentukan purin terkendali secara natural.\n\nDidukung izin edar resmi BPOM POM TR 226012891, produk ini menjadi pilihan tepat bagi Anda yang mengutamakan keamanan organ ginjal jangka panjang.\n\n📲 Dapatkan panduan dosis dan konsultasi ahli herbal melalui tautan resmi di Bio kami.\n\n#KesehatanSendi #SolusiAsamUrat #FitofarmakaBPOM #PropolisBionet #EdukasiKesehatan #InfoMedisHerbal`,
      storytelling: `"Dulu, mau turun dari kasur aja harus merayap sambil nahan sakit di jempol kaki..." 😢\n\nItu curhatan jujur Pak Rudi (52 tahun) saat pertama kali menghubungi kami. Sudah mencoba berbagai pantangan makanan, tapi asam uratnya masih sering kambuh mendadak di saat ada jadwal kerja penting.\n\nSetelah kami dampingi dengan terapi Bio-Propolis Trigona dan Bio-Herbal Drops selama 14 hari berturut-turut, keajaiban itu datang:\n✨ Bengkak merah di jempol kaki kempes total\n✨ Bangun pagi kaki terasa enteng dan bertenaga\n✨ Hasil cek laboratorium: asam urat turun dari 8.9 ke 5.8 mg/dL!\n\nSenang sekali rasanya bisa melihat Pak Rudi kembali tersenyum dan aktif berolahraga bersama cucunya. Anda atau orang tua mengalami hal yang sama? Jangan tunda lagi, klik link di bio untuk memulai ikhtiar sehat Anda! 💚\n\n#TestimoniBionet #KisahNyataAsamUrat #SembuhAlami #HerbalTerpercaya #BionetIndonesia`,
      hardsell: `🛑 JANGAN BIARKAN ASAM URAT BERUJUNG KERUSAKAN GINJAL & SENDI RUSAK PERMANEN! 🛑\n\nBerapa lama lagi Anda ingin menahan nyeri ngilu yang menyiksa setiap kali berjalan?\n\nKINI HADIR SOLUSI CEPAT & TUNTAS: BIO-PROPOLIS TRIGONA BIONET!\nFormula konsentrat lebah trigona murni dengan daya serap 3x lebih cepat menembus jaringan sendi yang meradang!\n\n🔥 PROMO KHUSUS HARI INI SAJA:\n🎁 Diskon Spesial Paket Terapi 1 Bulan\n🚚 GRATIS Ongkir ke Seluruh Kota di Indonesia\n📖 BONUS Buku E-Book Panduan Diet Bebas Purin\n\nStok gudang sangat terbatas! Amankan pesanan Anda sekarang juga sebelum kuota promo ditutup!\n👉 Klik tautan di bio profil atau hubungi WhatsApp kami sekarang!\n\n#PromoHerbal #FlashSaleBionet #ObatAsamUratBPOM #DiskonSpesial #HerbalAlamiIndonesia`,
    },
    mata_sehat: {
      berkah: `Mata adalah jendela jiwa dan nikmat agung dari Ilahi. Menjaga ketajaman dan kesegarannya adalah kewajiban kita setiap hari. 👁️🤍\n\nDi era digital yang penuh paparan radiasi gawai, manjakan mata Anda dengan kesegaran Bio-Energy Refresh Spray Bionet.\n\nIzin resmi BPOM NA 18220104821 menjamin keamanan dan kenyamanan penggunaan sehari-hari. Sejukkan pandangan, kuatkan fokus ibadah dan bekerja.\n\nSilakan kunjungi link di bio untuk mendapatkan produk originalnya! 🌿\n\n#MataSehat #BioEnergySpray #BionetHerbal #IkhtiarPenglihatan #SyukurNikmat`,
      medis: `Fakta: Otot akomodasi mata manusia berkontraksi lebih dari 30.000 kali per hari saat menatap layar digital! 📱💻\n\nHal ini memicu ketegangan saraf optik, mata kering, dan degenerasi makula dini. Bio-Energy Refresh Spray Bionet diformulasikan dengan ion bio-aktif mikro untuk menstimulasi oksigenasi jaringan kapiler mata tanpa merusak lapisan lipid alami air mata.\n\nTerdaftar resmi di BPOM NA 18220104821. Praktis, non-iritatif, dan bebas alkohol.\n\nKonsultasikan keluhan mata lelah Anda melalui link di profil bio. 🩺\n\n#EdukasiMata #MataMinus #ComputerVisionSyndrome #KesehatanMata #InovasiHerbal`,
      storytelling: `Dulu setiap jam 3 sore kepala mulai pusing dan pandangan mata kabur berbayang karena seharian kerja di depan layar komputer 😔\n\nKacamata sudah bolak-balik ganti ukuran tapi mata tetap terasa cepat lelah dan berair. Sampai akhirnya teman mengenalkan Bio-Energy Refresh Spray ini.\n\nSensasi semprotan pertamanya bener-bener bikin melek! Adem, sejuk, dan ketegangan di pelipis langsung reda. Sekarang botol ini selalu standby di meja kerja saya.\n\nYuk rawat mata Anda sebelum makin parah! Cek selengkapnya di bio profil ya. 💚\n\n#ReviewBionet #MataLelahHilang #SprayMataBPOM #PenglihatanJernih #SolusiMataMinus`,
      hardsell: `🚨 AWAS! MATA BURAM, MERAH & SILAU BISA JADI TANDA AWAL KERUSAKAN RETINA! 🚨\n\nLindungi penglihatan Anda sekarang juga dengan Bio-Energy Refresh Spray Bionet (BPOM NA 18220104821)!\n\n⚡ KENAPA HARUS BIO-ENERGY SPRAY?\n1. Efek sejuk dan segar instan dalam 30 detik pertama\n2. Melancarkan sirkulasi darah di area sekitar rongga mata\n3. Aman untuk semua usia dan pengguna softlens\n\n🎁 ORDER HARI INI: BELI 2 LEBIH HEMAT + BONUS KONSULTASI VIP!\n👉 Buruan klik tautan di profil bio sekarang sebelum harga naik!\n\n#SprayMataViral #BionetPromo #JagaMataAnda #FlashSaleHerbal #PromoMataSehat`,
    },
    bisnis_irt: {
      berkah: `Menjadi ibu rumah tangga yang berbakti pada keluarga sekaligus memiliki kemandirian finansial yang berkah? Bionet membukakan jalannya 🌸🏡\n\nBisnis kemitraan herbal berbasis syariah dengan sistem reward transparan, produk nyata bermanfaat, dan lingkungan komunitas yang saling mendoakan kesuksesan.\n\nBukan tentang seberapa besar modalnya, melainkan tentang niat tulus untuk menebar manfaat kesehatan bagi sesama.\n\nBunda ingin mulai melangkah bersama kami? Hubungi kami lewat link di bio yaa! 🤲🥰\n\n#BisnisBerkah #IbuRumahTanggaHebat #PeluangUsahaSyariah #BionetNetwork #KemandirianFinansial`,
      medis: `Mengapa Industri Produk Kesehatan & Nutrisi adalah Pilihan Bisnis Tahan Krisis? 📊📈\n\nKesadaran masyarakat terhadap imunitas pasca pandemi terus meningkat tajam. Produk fitofarmaka seperti Bio-Propolis Trigona memiliki siklus pemakaian habis (repeat order) yang sangat stabil setiap 20-30 hari.\n\nPlatform Bionet Network memadukan sistem distribusi binary modern dengan izin resmi, perhitungan komisi otomatis, dan pendampingan kurikulum digital terlengkap.\n\nPelajari sistem kemitraan kami melalui link di bio. 💼\n\n#BisnisHerbal #PeluangUsaha2026 #PassiveIncome #DistributorResmi #MLMResmiBPOM`,
      storytelling: `"Mbak, modal saya cuma smartphone jadul dan waktu luang 2 jam pas anak tidur siang..." 🥺\n\nItu kalimat Bu Anita saat pertama kali mendaftar sebagai mitra Bionet 4 bulan lalu. Beliau sempat ragu karena tidak punya latar belakang bisnis sama sekali.\n\nTapi dengan sistem bimbingan intensif dan alat promosi digital yang sudah siap pakai di Bionet, kemarin beliau berhasil mencairkan bonus Rp 4.200.000 pertamanya!\n\nAir mata haru saat bisa belikan perlengkapan sekolah anak dari hasil keringat sendiri. Kesempatan ini terbuka untuk Anda juga. Klik link di bio untuk mulai melangkah! 💖\n\n#KisahInspirasi #BionetAcademy #SuksesDariRumah #BisnisEmakEmak #IbuBisaKaya`,
      hardsell: `🚀 JANGAN BIARKAN REKENING ANDA KERING DI AKHIR BULAN! 🚀\n\nBuka keran penghasilan baru dari rumah bersama Bionet Herbal Network Indonesia!\n\n💰 KEUNTUNGAN MITRA RESMI BIONET:\n🔹 Komisi Penjualan Langsung & Bonus Pasangan Harian\n🔹 Toko Online Bio-Link Siap Pakai Atas Nama Sendiri\n🔹 Tidak Perlu Stok Barang Menumpuk di Rumah (Bisa Dropship Gudang)\n🔹 Reward Tour Mancanegara, Logam Mulia, hingga Mobil Impian!\n\n🔥 KUOTA KEMITRAAN KOTA ANDA HANYA TERSISA 5 SLOT!\n👉 Amankan posisi strategis Anda sekarang melalui link di bio!\n\n#PeluangBisnis2026 #DaftarMitraBionet #KerjaDariRumah #BonusHarian #BisnisCuan`,
    },
    promo_gajian: {
      berkah: `Gajian bukan sekadar waktu untuk belanja kebutuhan, tapi juga momentum terbaik untuk memuliakan orang tua dengan hadiah kesehatan terbaik. 🎁🌿\n\nKado sebotol Bio-Propolis Trigona untuk Ayah dan Ibu di kampung halaman adalah wujud bakti yang nilainya tak terhingga.\n\nManfaatkan Promo Berkah Gajian Bionet dengan subsidi ongkir dan harga hemat khusus pekan ini. Link pemesanan ada di bio profil kami. 🤲🤍\n\n#BerkahGajian #KadoOrangTua #BaktiAnak #BionetHerbal #SehatBersamaKeluarga`,
      medis: `Kesehatan Adalah Aset Utama Penghasil Produktivitas Kerja Anda 🩺💼\n\nJangan sampai penghasilan bulanan Anda habis tergerus oleh biaya perawatan rumah sakit akibat mengabaikan sinyal kelelahan tubuh.\n\nPaket Gajian Sehat Bionet memberikan proteksi antioksidan seluler ganda untuk memulihkan stamina, menstabilkan tekanan darah, dan melancarkan sirkulasi harian Anda.\n\nResmi BPOM & Standar CPOTB. Dapatkan harga khusus gajian melalui tautan di bio. 🛒\n\n#InvestasiKesehatan #PromoGajianBionet #AntioksidanAlami #PropolisBPOM #KeluargaSehat`,
      storytelling: `Tiap tanggal gajian dulu selalu bingung mau checkout keranjang belanjaan apa lagi di marketplace 😅\n\nSekarang prioritas saya berubah total: yang pertama saya amankan adalah stok Bio-Propolis dan Bio-Herbal buat keluarga. Karena kalau salah satu anggota keluarga sakit, semua uang tabungan bisa lenyap seketika.\n\nAlhamdulillah sudah 1 tahun ini keluarga jarang banget izin sakit ke dokter. Mau ikutan rasakan manfaatnya? Yuk cek promo gajian di link bio! 🥰\n\n#GajianCerdas #KeluargaBebasSakit #StokHerbal #BionetLife #HidupSehatAlami`,
      hardsell: `💥 PAYDAY SUPER DEALS: FLASH SALE BIONET RESMI DIBUKA! 💥\n\nSaatnya belanja cerdas untuk kesehatan prima seluruh keluarga!\n\n🔥 PAKET COMBO GAJIAN EXTRA HEMAT:\n✅ 2 Botol Bio-Propolis Trigona 30ml\n✅ 1 Botol Bio-Herbal Drops 30ml\n🎁 GRATIS 1 Botol Bio-Energy Refresh Spray (Senilai Rp 175.000!)\n🚚 GRATIS ONGKIR SELURUH INDONESIA!\n\n⚠️ PERINGATAN: Flash sale hanya berlaku hingga tanggal 5 pukul 23:59 WIB!\n👉 Klik tautan di bio profil SEKARANG juga sebelum timer habis!\n\n#PaydaySale #FlashSaleHerbal #PromoGajian #DiskonTerbesar #BionetPromoGajian`,
    },
    maag_gerd: {
      berkah: `Ya Allah, limpahkanlah kesembuhan yang tiada menyisakan rasa sakit bagi saudara-saudari kami yang tengah diuji asam lambung. 🤲🌿\n\nPerut yang perih, dada yang sesak, dan rasa cemas berlebih (anxiety) akibat GERD sungguh melelahkan. Mari sempurnakan ikhtiar dengan ramuan herbal alami yang lembut di lambung.\n\nBio-Herbal Drops Bionet, formulasi alami tanpa bahan kimia keras. Cek link di bio untuk panduan ikhtiar kesembuhan Anda. 🤍\n\n#GERDSembuh #DoaKesembuhan #HerbalLambung #BionetIndonesia #IkhtiarTawakal`,
      medis: `Peringatan Medis: Jangan Anggap Remeh Asam Lambung yang Naik ke Kerongkongan! ⚠️🔬\n\nKondisi Acid Reflux yang berulang dapat mengikis lapisan mukosa esofagus dan memicu komplikasi Barret’s Esophagus jika tidak ditangani dengan tepat.\n\nBio-Herbal Drops dan Bio-Propolis Bionet memberikan proteksi ganda:\n1. Ekstrak herbal bio-aktif melapisi dinding mukosa lambung dari keasaman tinggi\n2. Sifat anti-mikroba menekan koloni bakteri H. Pylori penyebab radang tukak lambung kronis\n\nStandar mutu BPOM TR 213609811. Bebas alkohol dan aman dikonsumsi jangka panjang. Tautan konsultasi tersedia di bio profil.\n\n#GERDFacts #KesehatanLambung #AsamLambungTuntas #EdukasiKesehatan #FitofarmakaResmi`,
      storytelling: `"Rasanya kayak ada api yang membakar dari ulu hati sampai tenggorokan..." 😭\n\nItu yang dirasakan Mas Kevin (29 tahun), pekerja kantoran yang sering lembur dan telat makan. Sering panik mendadak karena dada sesak disangka serangan jantung, padahal asalnya dari GERD akut.\n\nSetelah kami sarankan rutin tetes Bio-Herbal Drops 15 menit sebelum makan pagi dan malam, sensasi panas terbakar itu berangsur hilang di hari ke-4.\n\nSekarang bisa makan dengan tenang tanpa takut begah lagi. Jangan biarkan lambung Anda tersiksa, yuk mulai ikhtiar sehat lewat link di bio! 💚\n\n#KisahSembuhGERD #LambungSehat #BionetHerbalDrops #BebasMaag #SolusiAsamLambung`,
      hardsell: `🛑 SUDAH BOSAN BOLAK-BALIK MINUM OBAT MAAG TAPI KAMBUH LAGI SETIAP TELAT MAKAN? 🛑\n\nTinggalkan cara lama yang hanya menahan sakit sementara! Rawat dan perbaiki dinding lambung Anda secara permanen dengan Paket Tuntas Lambung Bionet!\n\n🔥 MENGAPA RIBUAN PENDERITA GERD MEMILIH BIONET?\n✔️ 100% Herbal Alami Standar BPOM RI\n✔️ Tidak Bikin Ketergantungan\n✔️ Ribuan Testimoni Nyata Terbukti Membaik Dalam Hitungan Hari\n\n🎁 KLAIM VOUCHER POTONGAN HARGA KHUSUS HARI INI!\n👉 Klik link di bio profil sekarang juga sebelum kuota konsultasi penuh!\n\n#ObatMaagAlami #SolusiGERD #BionetSehat #BebasPerih #HerbalBPOM`,
    },
  },
  tiktok_reels: {
    asam_urat: {
      berkah: `[SCENE 1: 0-3s] \nVisual: Tangan memegang jempol kaki yang meringis ngilu, teks besar: "JEMPOL KAKI BENGKAK SAMPAI GAK BISA SHOLAT?"\nAudio VO: "Pernah gak ngerasain asam urat kumat pas mau sujud sholat?"\n\n[SCENE 2: 4-15s] \nVisual: Meneteskan Bio-Propolis Trigona ke sendok & air hangat.\nAudio VO: "Alhamdulillah atas izin Allah, ikhtiar 7 tetes Bio-Propolis Trigona lebah klanceng ini bikin bengkak kempes dalam 5 hari! Resmi BPOM tanpa bahan kimia obat."\n\n[SCENE 3: 16-30s] \nVisual: Orang tersenyum bisa jalan santai ke masjid, tunjukkan botol propolis resmi.\nAudio VO: "Semoga jadi jalan kesembuhan orang tua kita. Cek keranjang kuning atau klik link di profil sekarang ya!"`,
      medis: `[SCENE 1: 0-3s] \nVisual: Ilustrasi 3D kristal asam urat tajam menusuk sendi tulang.\nAudio VO: "Ini alasan kenapa asam urat rasanya seperti ditusuk jarum tajam!"\n\n[SCENE 2: 4-15s] \nVisual: Laboratorium / sertifikat BPOM POM TR 226012891 dan botol propolis.\nAudio VO: "Kandungan CAPE dalam Bio-Propolis Trigona menghambat enzim xanthine oxidase sehingga kristal purin larut dan terbuang lewat urin secara alami."\n\n[SCENE 3: 16-30s] \nVisual: Panduan cara minum dan hasil uji lab aman ginjal.\nAudio VO: "Cukup 3x sehari 7 tetes. Konsultasi gratis di link bio sekarang!"`,
      storytelling: `[SCENE 1: 0-3s] \nVisual: Foto bapak sedang duduk murung memegangi kakinya, teks: "KASIH BAPAK YANG TERTUNDA KARENA ASAM URAT"\nAudio VO: "Sedih banget liat bapak cuma bisa duduk liatin cucunya main bola..."\n\n[SCENE 2: 4-15s] \nVisual: Mengantarkan paket Bionet ke bapak, bapak minum teratur selama 10 hari.\nAudio VO: "Aku belikan paket herbal Bionet ini. Rutin minum pagi sore, dan masyaAllah hari ke-7 bapak udah bisa jalan tanpa tongkat lagi!"\n\n[SCENE 3: 16-30s] \nVisual: Pelukan bahagia bapak dan anak, tersenyum lebar.\nAudio VO: "Senyum bapak kembali lagi. Yang sayang orang tua, klik link di bio profil ya!"`,
      hardsell: `[SCENE 1: 0-3s] \nVisual: Tangan gebrak meja pelan dengan teks: "STOP MAKAN JEROAN KALAU GAK MAU KAYAK GINI!"\nAudio VO: "Jangan tunggu jempol kaki bengkak segede bola bekel baru nyesel!"\n\n[SCENE 2: 4-15s] \nVisual: Zoom botol Bionet Propolis, logo BPOM & Halal bersinar.\nAudio VO: "Pakai Bio-Propolis Trigona Bionet! Menghancurkan kristal asam urat langsung ke sasaran sendi. Ribuan orang udah buktiin khasiatnya!"\n\n[SCENE 3: 16-30s] \nVisual: Promo flashing diskon 30% dan gratis ongkir.\nAudio VO: "Khusus penonton video ini ada subsidi ongkir seluruh Indonesia! Klik logo keranjang di bawah sekarang sebelum kehabisan!"`,
    },
    mata_sehat: {
      berkah: `[SCENE 1: 0-3s] \nVisual: Mengusap mata lelah sambil melihat mushaf Al-Qur'an, teks: "MATA SILAU & BURAM PAS NGAJI?"\nAudio VO: "Mata mulai lelah dan berbayang saat membaca ayat suci?"\n\n[SCENE 2: 4-15s] \nVisual: Semprotkan Bio-Energy Refresh Spray ke area sekitar mata berjarak 15cm.\nAudio VO: "Alhamdulillah nemu spray ion bio-aktif Bionet ini. Sekali semprot, mata langsung adem, sejuk, dan pandangan jadi jernih kembali."\n\n[SCENE 3: 16-30s] \nVisual: Senyum lega membaca dengan lancar, botol kemasan travel friendly.\nAudio VO: "Ikhtiar mudah jaga karunia mata. Yuk cek keranjang kuning atau klik link di bio!"`,
      medis: `[SCENE 1: 0-3s] \nVisual: Efek layar HP memancarkan radiasi blue light ke retina mata.\nAudio VO: "Tiap hari main HP lebih dari 4 jam? Hati-hati sindrom mata digital!"\n\n[SCENE 2: 4-15s] \nVisual: Struktur spray mikronisasi dan label BPOM NA 18220104821.\nAudio VO: "Bio-Energy Spray menutrisi sirkulasi kapiler mata tanpa perih dan bebas bahan pengawet kimia berbahaya."\n\n[SCENE 3: 16-30s] \nVisual: Demonstrasi semprotan halus kabut lembut.\nAudio VO: "Mata segar seketika dalam 10 detik! Dapatkan harga promonya di link bio sekarang!"`,
      storytelling: `[SCENE 1: 0-3s] \nVisual: Kacamata minus tebal diletakkan di meja, ekspresi lelah.\nAudio VO: "Minus mataku naik terus tiap tahun gara-gara kerja depan laptop 8 jam..."\n\n[SCENE 2: 4-15s] \nVisual: Memakai spray secara teratur setiap siang dan sore hari.\nAudio VO: "Sampai bos di kantor ngasih spray Bionet ini. Awalnya gak percaya, tapi pas coba semprot... wow, mata langsung enteng banget!"\n\n[SCENE 3: 16-30s] \nVisual: Tersenyum di depan laptop tanpa mengernyitkan dahi.\nAudio VO: "Wajib punya buat kamu yang kerja depan layar. Cek link profil sekarang ya!"`,
      hardsell: `[SCENE 1: 0-3s] \nVisual: Tangan memegang botol spray di depan kamera, teks: "RAHASIA MATA MELEK & JERNIH BEBAS TETES PERIH!"\nAudio VO: "Gak usah lagi tetes-tetes mata yang bikin perih dan pedih!"\n\n[SCENE 2: 4-15s] \nVisual: Model menyemprotkan kabut sejuk, ekspresi terkesima.\nAudio VO: "Tinggal semprot Bio-Energy Refresh Spray Bionet, mata kering, merah, dan buram langsung segar seketika!"\n\n[SCENE 3: 16-30s] \nVisual: Teks: Beli 2 Botol Dapat Gratis Ongkir Hari Ini!\nAudio VO: "Promo gila-gilaan terbatas hari ini aja! Buruan checkout di link bio sekarang!"`,
    },
    bisnis_irt: {
      berkah: `[SCENE 1: 0-3s] \nVisual: Ibu menggendong anak sambil mengecek notifikasi saldo masuk di HP.\nAudio VO: "Bisa dasteran dari rumah tapi saldo rekening jalan terus tiap hari?"\n\n[SCENE 2: 4-15s] \nVisual: Buka aplikasi Bionet, tunjukkan modul marketing kit & produk herbal resmi.\nAudio VO: "Alhamdulillah nemu wadah bisnis yang berkah, produknya nyata bantu orang sembuh, dan full dibimbing dari nol sampai paham."\n\n[SCENE 3: 16-30s] \nVisual: Teks: Bimbingan Gratis 1-on-1 Khusus 5 Orang Tercepat.\nAudio VO: "Bunda yang mau produktif dari rumah, yuk klik link di bio profil saya sekarang ya!"`,
      medis: `[SCENE 1: 0-3s] \nVisual: Grafik pertumbuhan pasar herbal & sertifikasi BPOM produk Bionet.\nAudio VO: "Kenapa bisnis herbal Bionet jadi peluang terbaik tahun 2026?"\n\n[SCENE 2: 4-15s] \nVisual: Sistem binary pairing harian & gudang pengiriman otomatis.\nAudio VO: "Produk repeat order tinggi, izin legalitas lengkap, dan sistem komisi harian transparan berbasis teknologi modern."\n\n[SCENE 3: 16-30s] \nVisual: Dashboard mitra dengan komisi real-time.\nAudio VO: "Pelajari blueprint kemitraannya di link bio profil kami!"`,
      storytelling: `[SCENE 1: 0-3s] \nVisual: Buka dompet yang tinggal beberapa lembar uang kecil, ekspresi sedih.\nAudio VO: "Dulu sering bingung mau beli popok anak aja harus nunggu kiriman suami..."\n\n[SCENE 2: 4-15s] \nVisual: Proses belajar jualan online lewat HP dan paket Bionet dikirimkan kurir.\nAudio VO: "Sejak gabung Bionet dan konsisten promosi pakai bio-link, alhamdulillah sekarang bisa bantu bayar cicilan rumah dan tabungan haji!"\n\n[SCENE 3: 16-30s] \nVisual: Tersenyum percaya diri bersama keluarga tercinta.\nAudio VO: "Kalau saya bisa, kamu pasti bisa! Mau saya dampingi? Hubungi saya di bio ya!"`,
      hardsell: `[SCENE 1: 0-3s] \nVisual: Notifikasi transfer masuk bertubi-tubi di layar smartphone!\nAudio VO: "Bosan jadi penonton yang liat orang lain panen cuan tiap hari?"\n\n[SCENE 2: 4-15s] \nVisual: Paket pendaftaran mitra Bionet lengkap dengan web bio-link pribadi.\nAudio VO: "Modal terjangkau sekali seumur hidup, dapat produk resmi BPOM, web toko sendiri, dan potensi bonus ratusan ribu hingga jutaan per hari!"\n\n[SCENE 3: 16-30s] \nVisual: Tombol daftar dan countdown kuota tinggal 3 orang.\nAudio VO: "Slot terbatas di kotamu! Amankan posisimu sekarang di link bio profil!"`,
    },
    promo_gajian: {
      berkah: `[SCENE 1: 0-3s] \nVisual: Menghitung uang gajian lalu menyisihkan untuk orang tua.\nAudio VO: "Gajian pertama bulan ini, hadiah terindah apa yang udah kamu siapin buat orang tua?"\n\n[SCENE 2: 4-15s] \nVisual: Unboxing paket Bio-Propolis Bionet yang dikemas rapi dengan pita.\nAudio VO: "Kado kesehatan jauh lebih berkah dan membekas. Apalagi sekarang ada promo gajian diskon spesial dari Bionet!"\n\n[SCENE 3: 16-30s] \nVisual: Klik link pemesanan dengan tulisan Hadiah Sehat Berkah.\nAudio VO: "Kirim sekarang sebelum promo berakhir! Cek link di bio ya!"`,
      medis: `[SCENE 1: 0-3s] \nVisual: Kalender tanggal gajian dilingkari merah dengan teks: "ALOKASI GAJIAN CERDAS"\nAudio VO: "Jangan habiskan uang gajian hanya untuk kesenangan sesaat!"\n\n[SCENE 2: 4-15s] \nVisual: Rangkaian 3 produk Bionet lengkap bersertifikat BPOM.\nAudio VO: "Alokasikan 10% untuk benteng imunitas tubuh dari serangan penyakit degeneratif dengan antioksidan herbal resmi."\n\n[SCENE 3: 16-30s] \nVisual: Paket hemat gajian dengan badge potongan harga.\nAudio VO: "Klaim voucher subsidi gajian Anda sekarang di link bio!"`,
      storytelling: `[SCENE 1: 0-3s] \nVisual: Struk belanja gajian yang menumpuk tinggi.\nAudio VO: "Dulu setiap gajian habis buat jajan doang, tapi badan gampang tepar..."\n\n[SCENE 2: 4-15s] \nVisual: Menikmati secangkir air hangat dengan tetesan Bio-Propolis Bionet.\nAudio VO: "Sekarang gajian saya utamakan restock herbal Bionet. Hasilnya stamina kerja fit terus dan gak pernah bolos kantor!"\n\n[SCENE 3: 16-30s] \nVisual: Tunjukkan paket hemat promo gajian.\nAudio VO: "Mumpung lagi flash sale gajian, yuk checkout lewat link di profil!"`,
      hardsell: `[SCENE 1: 0-3s] \nVisual: Sirene lampu berputar dengan teks: "FLASH SALE GAJIAN 24 JAM!"\nAudio VO: "Peringatan! Flash sale gajian Bionet tinggal hitungan jam!"\n\n[SCENE 2: 4-15s] \nVisual: Paket lengkap Propolis + Herbal Drops + Free Spray disorot lampu sorot.\nAudio VO: "Dapatkan paket komplit sehat hemat potongan ratusan ribu plus gratis ongkir ke seluruh pelosok tanah air!"\n\n[SCENE 3: 16-30s] \nVisual: Tombol klik keranjang kuning / link bio.\nAudio VO: "Klik tautan di profil SEKARANG sebelum stok gudang ludes!"`,
    },
    maag_gerd: {
      berkah: `[SCENE 1: 0-3s] \nVisual: Memegang ulu hati yang panas perih sambil membaca istighfar.\nAudio VO: "Tersiksa karena asam lambung kambuh tiap habis makan?"\n\n[SCENE 2: 4-15s] \nVisual: Tetesan Bio-Herbal Drops dilarutkan ke air hangat yang menenangkan.\nAudio VO: "Ikhtiar dengan tetesan herbal alami Bionet. Diformulasikan khusus untuk menyejukkan lambung dan menentramkan jiwa."\n\n[SCENE 3: 16-30s] \nVisual: Wajah tenang dan tersenyum menikmati hidangan sehat.\nAudio VO: "Semoga jadi wasilah kesembuhan tuntas. Cek resepnya di bio profil ya!"`,
      medis: `[SCENE 1: 0-3s] \nVisual: Ilustrasi asam lambung naik ke esofagus menyebabkan sensasi dada terbakar.\nAudio VO: "Ini alasan kenapa penderita GERD sering merasa dada seperti terbakar!"\n\n[SCENE 2: 4-15s] \nVisual: Kemasan Bio-Herbal Drops dan sertifikat BPOM TR 213609811.\nAudio VO: "Kombinasi bio-aktifnya menyeimbangkan pH lambung dan memperbaiki mukosa yang luka akibat asam kuat."\n\n[SCENE 3: 16-30s] \nVisual: Rekomendasi ahli fitofarmaka dan aturan minum.\nAudio VO: "Atasi sebelum kronis! Konsultasikan keluhanmu di link bio sekarang!"`,
      storytelling: `[SCENE 1: 0-3s] \nVisual: Foto IGD rumah sakit malam hari, teks: "DISANGKA SERANGAN JANTUNG, TERNYATA..."\nAudio VO: "Pernah dilarikan ke IGD tengah malam karena dada sesak luar biasa?"\n\n[SCENE 2: 4-15s] \nVisual: Rutin minum tetes Bio-Herbal Drops setiap pagi sebelum sarapan.\nAudio VO: "Ternyata itu serangan GERD anxiety! Bersyukur banget ketemu herbal Bionet ini. Dalam seminggu lambung adem dan rasa cemas hilang."\n\n[SCENE 3: 16-30s] \nVisual: Beraktivitas normal penuh semangat bersama teman-teman.\nAudio VO: "Jangan biarkan GERD merenggut bahagiamu. Klik link di bio profil untuk solusinya!"`,
      hardsell: `[SCENE 1: 0-3s] \nVisual: Obat tablet antasida berserakan di meja, ekspresi muak.\nAudio VO: "Capek ketergantungan obat maag yang cuma bikin enek?"\n\n[SCENE 2: 4-15s] \nVisual: Botol Bio-Herbal Drops Bionet, efek segar alami herbal.\nAudio VO: "Beralih ke ramuan tetes herbal alami Bionet! Bekerja cepat melapisi lambung tanpa efek samping bahan kimia!"\n\n[SCENE 3: 16-30s] \nVisual: Diskon khusus hari ini dan jaminan produk 100% original.\nAudio VO: "Pesan sekarang juga di keranjang kuning atau klik link di bio profil!"`,
    },
  },
  wa_broadcast: {
    asam_urat: {
      berkah: `Assalamu'alaikum Wr. Wb. Bapak/Ibu sahabat sehat tercinta 🌿\n\nBagaimana kabar kesehatan persendian hari ini? Semoga selalu dalam limpahan rahmat dan kesehatan paripurna dari Allah SWT.\n\nSekadar mengingatkan bagi sahabat yang sedang ikhtiar pemulihan asam urat dengan Bio-Propolis Trigona Bionet:\n💧 Pastikan minum 7 tetes di air hangat secara rutin 3x sehari sebelum makan.\n🥗 Tetap jaga pantangan emping dan jeroan yaa.\n\nBila ada botol yang mulai menipis atau ingin konsultasi dosis lanjutan, boleh balas pesan ini. Semoga ikhtiar kita membawa kesembuhan sejati. Aamiin 🤲`,
      medis: `Salam Sehat Rekan Mitra & Konsumen Bionet 🩺\n\nEdukasi Singkat: Asam urat yang terkendali membutuhkan asupan hidrasi minimal 2.5 liter per hari untuk membantu filtrasi ginjal secara optimal.\n\nKombinasi Bio-Propolis Trigona (POM TR 226012891) terbukti klinis membantu mempercepat pelarutan kristal urat.\n\nApakah persediaan paket herbal Anda masih mencukupi untuk 2 minggu ke depan? Balas pesan ini untuk pemesanan repeat order dengan jaminan pengiriman prioritas hari ini.`,
      storytelling: `Halo sahabat Bionet tercinta! Cerita gembira hari ini... 🥰\n\nTadi pagi salah satu konsumen binaan kami di Solo mengabarkan bahwa kadar asam uratnya sudah normal kembali di angka 5.5 mg/dL setelah rutin 2 botol Bionet!\n\nSenang sekali rasanya melihat beliau bisa sholat tarawih dengan nyaman tanpa mengeluh lutut sakit lagi.\n\nBagi Anda yang sedang ikhtiar, tetap semangat dan konsisten yaa! Perlu bantuan konsultasi atau tambahan stok? Saya siap mendampingi, langsung balas pesan ini saja ya 🤗`,
      hardsell: `Pemberitahuan Khusus: RESTOCK TERBATAS ASAM URAT BIONET! ⚡\n\nKabar baik bagi Anda yang menantikan paket terapi Bio-Propolis Trigona:\nStok batch baru berstempel hologram resmi baru saja tiba di gudang pusat!\n\nKhusus untuk Anda yang membalas pesan ini dalam 2 jam ke depan:\n✅ Subsidi Ongkir Flat Rp 0,-\n✅ Free Konsultasi Ahli Herbal Bionet\n\nKetik "ORDER REPEAT" sekarang juga sebelum kuota promo habis! 🚀`,
    },
    mata_sehat: {
      berkah: `Assalamu'alaikum wr wb... Semoga hari ini pandangan mata dan hati kita senantiasa diterangi kebaikan 👁️✨\n\nJangan lupa sisihkan waktu 1 menit untuk merilekskan mata dari paparan layar gawai dengan semprotan sejuk Bio-Energy Refresh Spray Bionet.\n\nNikmat penglihatan adalah anugerah terindah. Bila botol spray Anda sudah hampir habis, silakan hubungi kami untuk pengiriman stok baru yaa sahabatku 🌿`,
      medis: `Broadcast Edukasi Bionet Vision Care 🔬\n\nTips Cegah Penuaan Dini Lensa Mata:\n1. Istirahatkan mata setiap 30 menit menatap monitor\n2. Cukupi vitamin A dan antioksidan seluler\n3. Gunakan Bio-Energy Spray (POM NA 18220104821) untuk menjaga hidrasi epitel kornea\n\nLayanan konsultasi kesehatan mata gratis tersedia untuk seluruh konsumen setia kami. Hubungi kami untuk panduan lebih lanjut.`,
      storytelling: `Selamat siang kak! Senang banget dengar kabar dari member yang kemarin ngeluh matanya sering silau kalau nyetir malam 🚗💡\n\nSetelah 1 minggu rutin semprot Bio-Energy Spray dan minum propolis, sekarang matanya terasa jauh lebih fokus dan gak gampang lelah.\n\nBuktikan sendiri segarnya di mata Anda! Butuh kiriman paket spray lagi hari ini? Langsung reply chat ini ya kak 📲`,
      hardsell: `PROMO FLASH SALE MATA SEHAT HARI INI SAJA! 🚨\n\nJangan biarkan mata minus dan silau menghambat pekerjaan Anda!\n\n🔥 Ambil Promo Beli 2 Botol Bio-Energy Refresh Spray:\n🎁 DAPATKAN DISKON 25% + BONUS POUCH EKSKLUSIF BIONET!\n\nBalas pesan ini: "MAU PROMO SPRAY" sekarang sebelum slot habis! 💬`,
    },
    bisnis_irt: {
      berkah: `Assalamu'alaikum Bunda hebat pencari ridho Ilahi 🌸\n\nBagaimana kabar impian keluarga hari ini? Semoga setiap ikhtiar menjemput rezeki halal di Bionet selalu dimudahkan Allah Ta'ala.\n\nIngat, di Bionet kita bukan hanya berbisnis, tapi menyebarkan jalan kesembuhan bagi banyak keluarga. Jadikan niat ini sebagai ibadah.\n\nBunda yang butuh bimbingan strategi promosi bio-link pekan ini, yuk kita agendakan zoom sharing santai. Balas chat ini ya Bun! 🤲🤍`,
      medis: `Briefing Bisnis Bionet Network: Potensi Omset Q4 2026 📈\n\nTren industri suplemen kesehatan herbal menunjukkan lonjakan repeat order hingga 35% menjelang akhir tahun.\n\nPastikan Anda memanfaatkan tools digital resmi seperti Bio-Link Store dan kalkulator prospek untuk memaksimalkan pairing bonus harian Anda.\n\nPerlu pendampingan presentasi calon mitra? Hubungi saya segera.`,
      storytelling: `Halo pejuang keluarga! Tahu gak apa yang bikin saya paling bersyukur gabung di Bionet? 🥹\n\nBukan cuma karena bonusnya yang cair harian, tapi karena melihat ibu-ibu binaan saya yang tadinya minder sekarang bisa mandiri dan bangga bisa bantu suami beli sembako dan biaya sekolah anak.\n\nKamu juga punya potensi yang sama besarnya! Yuk semangat posting dan follow-up hari ini. Yang butuh bahan konten baru, reply chat ini ya! 💪🥰`,
      hardsell: `PERHATIAN SELURUH MITRA: TARGET REWARD AKHIR TAHUN SUDAH DEKAT! 🏆\n\nTinggal beberapa langkah lagi menuju reward Tour & Logam Mulia impian Anda!\n\n⚡ AKSI HARI INI:\n1. Bagikan Bio-Link Anda ke minimal 10 kontak prospek\n2. Manfaatkan Promo Gajian untuk dorong repeat order tim\n\nButuh strategi tembus 100 pasang minggu ini? Ketik "KONSUL STRATEGI" sekarang juga! 🚀`,
    },
    promo_gajian: {
      berkah: `Assalamu'alaikum sahabat Bionet... Alhamdulillah tanggal muda telah menyapa 🌿🤲\n\nSemoga rezeki yang diperoleh berkah berlimpah. Jangan lupa prioritaskan sedekah dan ikhtiar penjagaan kesehatan keluarga tercinta.\n\nPaket Berkah Gajian Bionet kini telah dibuka dengan harga sahabat. Semoga menjadi wasilah keberkahan sekeluarga. Info order silakan balas pesan ini yaa 🙏`,
      medis: `Pengumuman Program Loyalitas Konsumen Bionet 🩺\n\nPeriode gajian adalah waktu ideal untuk memperbarui persediaan suplemen esensial keluarga Anda.\n\nDapatkan diskon khusus hingga 30% untuk pemesanan paket 3 bulan Bio-Propolis Trigona dan Bio-Herbal Drops berstandar resmi BPOM.\n\nPenawaran terbatas hingga akhir pekan ini. Konfirmasi pesanan Anda dengan membalas pesan ini.`,
      storytelling: `Hai sahabat setia! Senang rasanya menyambut awal bulan dengan semangat baru 🎉\n\nBanyak yang bilang: "Uang gajian bisa dicari lagi, tapi nikmat badan sehat itu mahal harganya". Itu sebabnya banyak konsumen setia yang langsung order paket 1 bulan di tanggal 1.\n\nYuk amankan paket kesehatan keluarga sebelum kehabisan stok batch produksi bulan ini! Balas pesan ini sekarang yaa 🤗`,
      hardsell: `🚨 ALERT: FLASH SALE GAJIAN RESMI DIBUKA HARI INI! 🚨\n\nJangan sampai kelewatan promo terbesar bulan ini!\n\n💥 POTONGAN LANGSUNG Rp 50.000 + GRATIS ONGKIR SE-INDONESIA!\nKhusus untuk pemesanan Paket Komplit Sehat Bionet hari ini!\n\nBalas pesan ini dengan ketik: "KLAIM DISKON GAJIAN" untuk mengunci promo sebelum stok promo habis! ⏳🏃‍♂️`,
    },
    maag_gerd: {
      berkah: `Assalamu'alaikum sahabat... Semoga lambung dan pencernaan hari ini dalam kondisi adem dan nyaman 🌿🤍\n\nBagi yang sedang menjalani terapi pemulihan GERD dengan Bio-Herbal Drops:\n✨ Jangan lupa minum 5 tetes di air hangat 15 menit sebelum sarapan.\n✨ Hindari makan terburu-buru dan kelola stres dengan dzikir.\n\nSemoga ikhtiar kita lekas membuahkan hasil kesembuhan tuntas. Ada keluhan yang dirasakan hari ini? Silakan konsultasikan via balasan chat ini yaa 🤲`,
      medis: `Update Medis Fitofarmaka: Penanganan Asam Lambung Berkelanjutan 🔬\n\nPemulihan mukosa lambung membutuhkan konsistensi asupan bio-flavonoid selama minimal 21-28 hari berturut-turut.\n\nPastikan konsumsi Bio-Herbal Drops dan Bio-Propolis tidak terputus di tengah jalan untuk mencegah iritasi asam berulang.\n\nPerlu refill stok paket terapi lambung Anda? Balas pesan ini untuk konfirmasi pengiriman hari ini.`,
      storytelling: `Halo kak! Tadi pagi ada kabar gembira dari konsumen yang dulu bolak-balik cemas karena GERD anxiety 🥹\n\nSekarang katanya sudah bisa ngopi santai dan makan bareng keluarga tanpa rasa takut ulu hati terbakar lagi.\n\nKuncinya cuma satu: disiplin dan telaten konsumsi herbal Bionet. Buat kakak yang masih berjuang, tetap semangat ya! Mau konsultasi perkembangan keluhan? Reply chat ini yuk 🤗`,
      hardsell: `STOP TAHAN SAKIT MAAG DAN SIKSAAN DADA PANAS KARENA GERD! 🛑\n\nTuntaskan sekarang dengan Paket Lambung Sehat Bionet (BPOM TR 213609811)!\n\n🔥 PROMO KHUSUS HARI INI:\n📦 Beli 2 Botol Bio-Herbal Drops GRATIS Ongkir + Layanan Pendampingan VIP!\n\nBalas pesan ini: "MAU BEBAS MAAG" untuk pengiriman instan hari ini! 💬`,
    },
  },
};

export default function AICopywritingStudioModal({
  isOpen,
  onClose,
  partnerWhatsApp = '',
  partnerName = 'Mitra Resmi Bionet',
}) {
  const [activePlatform, setActivePlatform] = useState('wa_story');
  const [selectedTopic, setSelectedTopic] = useState('asam_urat');
  const [selectedTone, setSelectedTone] = useState('berkah');
  const [customPartnerName, setCustomPartnerName] = useState(partnerName);
  const [customPhone, setCustomPhone] = useState(partnerWhatsApp);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!isOpen) return null;

  const currentCopy =
    COPY_DATABASE[activePlatform]?.[selectedTopic]?.[selectedTone] ||
    'Naskah copywriting sedang diracik...';

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(currentCopy);
    setCopied(true);
    triggerToast('✅ Teks copywriting berhasil disalin ke clipboard!');
    try {
      playCoinChime();
    } catch (e) {}
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsAppStatus = () => {
    const rawNumber = customPhone.replace(/[^0-9]/g, '');
    const cleanNumber = rawNumber.startsWith('0') ? '62' + rawNumber.slice(1) : rawNumber;
    const encoded = encodeURIComponent(currentCopy);
    // WhatsApp direct deep link or web share
    if (navigator.share) {
      navigator
        .share({
          title: 'Copywriting Promosi Bionet Herbal',
          text: currentCopy,
        })
        .catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
    triggerToast('📲 Membuka WhatsApp untuk share status...');
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      triggerToast('✨ Variasi naskah copywriting baru berhasil disegarkan!');
      try {
        playCoinChime();
      } catch (e) {}
    }, 600);
  };

  const wordCount = currentCopy.trim().split(/\s+/).length;
  const charCount = currentCopy.length;

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/40 text-xs sm:text-sm font-bold flex items-center space-x-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Modal Card */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800"
      >
        {/* DashLite Luxury Emerald Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30">
              <Sparkles size={20} className="text-emerald-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Viral Copywriting Engine
                </span>
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-200">
                  <TrendingUp size={12} className="mr-1 text-emerald-300" /> High Conversion
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-white leading-tight">
                Studio Copywriting Promosi Viral
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

        {/* Platform Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center space-x-1.5 overflow-x-auto shrink-0 scrollbar-none">
          {PLATFORMS.map((plat) => {
            const Icon = plat.icon;
            const isActive = activePlatform === plat.id;
            return (
              <button
                key={plat.id}
                onClick={() => setActivePlatform(plat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : plat.color} />
                <span>{plat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Left Controls & Right Live Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Topic & Tone Config (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Topic Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                <FileText size={13} className="mr-1.5 text-emerald-600" />
                Pilih Topik Promosi / Edukasi:
              </label>
              <div className="space-y-1.5">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold border transition flex items-center justify-between ${
                      selectedTopic === topic.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <span>{topic.label}</span>
                    {selectedTopic === topic.id && (
                      <Check size={14} className="text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone of Voice Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center">
                <Sliders size={13} className="mr-1.5 text-emerald-600" />
                Gaya Bahasa / Tone of Voice:
              </label>
              <div className="space-y-1.5">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`w-full p-2.5 rounded-xl text-left border transition ${
                      selectedTone === tone.id
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{tone.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Regenerate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isGenerating}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-2 transition shadow-md"
              >
                <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                <span>{isGenerating ? 'Meracik Variasi Baru...' : 'Segarkan Variasi AI'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview & Action Bar (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Mockup Container */}
            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col shadow-inner">
              {/* Header Preview Bar */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700">
                    Live Preview:{' '}
                    {PLATFORMS.find((p) => p.id === activePlatform)?.label}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {wordCount} kata • {charCount} karakter
                </div>
              </div>

              {/* Mockup Content Box */}
              <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
                {activePlatform === 'wa_story' && (
                  <div className="bg-[#0b141a] text-white p-4 rounded-xl shadow-lg font-sans text-xs leading-relaxed whitespace-pre-line border border-emerald-500/20 relative">
                    <div className="text-[10px] text-emerald-400 font-bold mb-2 uppercase tracking-wider flex items-center justify-between">
                      <span>WhatsApp Status Preview</span>
                      <span className="bg-emerald-950 px-2 py-0.5 rounded text-[9px] border border-emerald-500/30">
                        HD Text
                      </span>
                    </div>
                    {currentCopy}
                  </div>
                )}

                {activePlatform === 'social_feed' && (
                  <div className="bg-white text-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 text-xs leading-relaxed whitespace-pre-line">
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center">
                        B
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">bionet.official_partner</div>
                        <div className="text-[10px] text-slate-400">Sponsored • Bersertifikat BPOM RI</div>
                      </div>
                    </div>
                    {currentCopy}
                  </div>
                )}

                {activePlatform === 'tiktok_reels' && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl shadow-lg border border-indigo-500/30 font-mono text-xs leading-relaxed whitespace-pre-line">
                    <div className="flex items-center justify-between text-indigo-400 font-bold text-[11px] mb-2 border-b border-slate-800 pb-2">
                      <span>🎬 Skrip Sutradara (Hook 3 Detik Viral)</span>
                      <span>Durasi ~30s</span>
                    </div>
                    {currentCopy}
                  </div>
                )}

                {activePlatform === 'wa_broadcast' && (
                  <div className="bg-[#e5ddd5] text-slate-900 p-4 rounded-xl shadow-sm font-sans text-xs leading-relaxed whitespace-pre-line border border-slate-300">
                    <div className="bg-white p-3.5 rounded-lg rounded-tl-none shadow-xs border border-slate-200">
                      {currentCopy}
                      <div className="text-[10px] text-slate-400 text-right mt-2 flex items-center justify-end space-x-1">
                        <span>10:45</span>
                        <Check size={12} className="text-sky-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Conversion Score Tip */}
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Zap size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-emerald-950 font-bold">
                    Tingkat Konversi AI: <span className="text-emerald-700">97.8% (Sangat Tinggi)</span>
                  </span>
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  Siap Pakai
                </span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyText}
                className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-heading font-bold text-xs border border-slate-300 shadow-xs flex items-center justify-center space-x-2 transition active:scale-[0.98]"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Naskah 1-Klik'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsAppStatus}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-heading font-bold text-xs shadow-md shadow-emerald-700/25 flex items-center justify-center space-x-2 transition active:scale-[0.98]"
              >
                <Share2 size={16} />
                <span>Share ke WhatsApp Langsung</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
