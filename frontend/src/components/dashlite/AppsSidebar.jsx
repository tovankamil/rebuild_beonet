import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import {
  LayoutDashboard,
  GitFork,
  Users,
  Wallet,
  Building2,
  Layers,
  Landmark,
  KeyRound,
  ShoppingBag,
  Settings,
  Shield,
  ShieldAlert,
  Palette,
  TrendingUp,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Sparkles,
  Share2,
  LogOut,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Boxes,
  Truck,
  Zap,
  MessagesSquare,
  X,
  User,
  BookOpen,
} from 'lucide-react';
import DashAvatar from './DashAvatar';

/**
 * Dynamic Role-Based Menu Modules Generator
 */
function getRoleMenuModules(role) {
  if (role === 'admin') {
    return [
      {
        id: 'admin-overview',
        title: 'Overview Admin',
        icon: LayoutDashboard,
        badge: 'Admin',
        submenus: [
          { id: 'admin-overview', title: 'Ringkasan Eksekutif', desc: 'KPI global pengguna, bonus & omset', icon: LayoutDashboard },
          { id: 'admin-withdrawals', title: 'Approval Pencairan Dana', desc: 'Verifikasi penarikan saldo mitra', icon: Landmark },
        ],
      },
      {
        id: 'admin-users',
        title: 'Manajemen Pengguna & RBAC',
        icon: Users,
        badge: 'RBAC',
        submenus: [
          { id: 'admin-users', title: 'Direktori Pengguna', desc: 'Mitra, Gudang, Administrator', icon: Users },
          { id: 'admin-users', title: 'Alokasi Role & Status Akun', desc: 'Ubah role & status aktif/suspend', icon: Shield },
        ],
      },
      {
        id: 'admin-transactions',
        title: 'Buku Besar & Bonus Pasangan',
        icon: Wallet,
        badge: 'Ledger',
        submenus: [
          { id: 'admin-transactions', title: 'Buku Besar Transaksi', desc: 'Seluruh mutasi kredit & debit platform', icon: Wallet },
          { id: 'admin-transactions', title: 'Audit Bonus Pasangan', desc: 'Riwayat pembayaran matching binary', icon: Zap },
        ],
      },
      {
        id: 'admin-points',
        title: 'Poin Pasangan Binary',
        icon: GitFork,
        badge: 'Kaki Binary',
        submenus: [
          { id: 'admin-points', title: 'Keseimbangan Kaki Kiri/Kanan', desc: 'Volume omset PV & rasio kaki', icon: GitFork },
          { id: 'admin-points', title: 'Potensi Pasangan & Adjust Poin', desc: 'Matching pair & koreksi manual', icon: TrendingUp },
        ],
      },
      {
        id: 'admin-pins',
        title: 'Stokis & Serial PIN',
        icon: KeyRound,
        badge: 'HU',
        submenus: [
          { id: 'admin-pins', title: 'Master Serial PIN', desc: 'Inventori PIN Silver, Gold, Platinum', icon: KeyRound },
          { id: 'admin-pins', title: 'Log Transfer Antar Mitra', desc: 'Riwayat mutasi PIN jaringan', icon: Send },
          { id: 'admin-pins', title: 'Pencetakan PIN Baru', desc: 'Generate serial PIN untuk mitra', icon: Sparkles },
        ],
      },
      {
        id: 'admin-orders',
        title: 'Pesanan RO E-Commerce',
        icon: ShoppingBag,
        badge: 'RO',
        submenus: [
          { id: 'admin-orders', title: 'Daftar Invoice Belanja RO', desc: 'Pesanan produk repeat order mitra', icon: ShoppingBag },
          { id: 'admin-orders', title: 'Audit Status & Resi Ekspedisi', desc: 'Alur fulfillment pesanan', icon: Truck },
        ],
      },
      {
        id: 'admin-withdrawals',
        title: 'Pencairan Dana (WD)',
        icon: Landmark,
        badge: 'Flip.id',
        submenus: [
          { id: 'admin-withdrawals', title: 'Daftar Request Withdrawal', desc: 'Persetujuan transfer dana Flip.id', icon: Landmark },
          { id: 'overview', title: 'Mode Pratinjau Portal Mitra', desc: 'Lihat tampilan dari sudut pandang mitra', icon: ExternalLink },
        ],
      },
      {
        id: 'admin-fraud',
        title: 'Fraud Control & Risiko',
        icon: ShieldAlert,
        badge: 'Security',
        submenus: [
          { id: 'admin-fraud', title: 'Audit Risiko & Sybil Detection', desc: 'Deteksi duplikasi KTP, rekening & lonjakan WD', icon: ShieldAlert },
          { id: 'admin-users', title: 'Manajemen Pembekuan Akun', desc: 'Suspend akun mencurigakan & audit log', icon: Shield },
        ],
      },
      {
        id: 'chat',
        title: 'Live Chat Bantuan',
        icon: MessagesSquare,
        badge: 'Support',
        submenus: [
          { id: 'chat', title: 'Helpdesk & Chat Mitra', desc: 'Respon tiket & pesan live mitra', icon: MessagesSquare },
        ],
      },
      {
        id: 'admin-guide',
        title: 'Panduan Fitur & Menu',
        icon: BookOpen,
        badge: 'Manual',
        submenus: [
          { id: 'admin-guide', title: 'Direktori & Panduan Lengkap', desc: 'Penjelasan semua fitur & menu aplikasi', icon: BookOpen },
          { id: 'components', title: 'Galeri Komponen DashLite', desc: 'Desain token & elemen UI', icon: Palette },
        ],
      },
    ];
  }

  if (role === 'keuangan') {
    return [
      {
        id: 'admin-overview',
        title: 'Overview Finansial',
        icon: LayoutDashboard,
        badge: 'Kasir',
        submenus: [
          { id: 'admin-overview', title: 'Ringkasan Kas & Omset', desc: 'KPI finansial platform & kas masuk', icon: LayoutDashboard },
        ],
      },
      {
        id: 'admin-transactions',
        title: 'Buku Besar & Bonus',
        icon: Wallet,
        badge: 'Ledger',
        submenus: [
          { id: 'admin-transactions', title: 'Buku Besar Transaksi', desc: 'Mutasi kredit & debit lengkap', icon: Wallet },
        ],
      },
      {
        id: 'admin-withdrawals',
        title: 'Pencairan Dana (WD)',
        icon: Landmark,
        badge: 'Flip.id',
        submenus: [
          { id: 'admin-withdrawals', title: 'Validasi Approval Withdrawal', desc: 'Persetujuan transfer dana Flip.id', icon: Landmark },
        ],
      },
      {
        id: 'admin-fraud',
        title: 'Fraud & Validasi Risiko',
        icon: ShieldAlert,
        badge: 'Risk',
        submenus: [
          { id: 'admin-fraud', title: 'Pusat Deteksi Risiko Penarikan', desc: 'Analisis anomali penarikan & rekening duplikat', icon: ShieldAlert },
        ],
      },
      {
        id: 'chat',
        title: 'Live Chat Bantuan',
        icon: MessagesSquare,
        badge: 'CS',
        submenus: [
          { id: 'chat', title: 'Chat Mitra & Konfirmasi Payout', desc: 'Layanan tanya jawab transaksi', icon: MessagesSquare },
        ],
      },
    ];
  }

  if (role === 'cs') {
    return [
      {
        id: 'admin-overview',
        title: 'Overview Helpdesk',
        icon: LayoutDashboard,
        badge: 'CS',
        submenus: [
          { id: 'admin-overview', title: 'Ringkasan Operasional CS', desc: 'Aktivitas mitra & performa layanan', icon: LayoutDashboard },
        ],
      },
      {
        id: 'admin-users',
        title: 'Direktori Pengguna',
        icon: Users,
        badge: 'Mitra',
        submenus: [
          { id: 'admin-users', title: 'Data Anggota & Sponsor', desc: 'Audit profil & status akun mitra', icon: Users },
        ],
      },
      {
        id: 'chat',
        title: 'Live Chat Bantuan',
        icon: MessagesSquare,
        badge: 'Live',
        submenus: [
          { id: 'chat', title: 'Tiket Chat Bantuan Mitra', desc: 'Layanan interaktif real-time 24/7', icon: MessagesSquare },
        ],
      },
    ];
  }

  if (role === 'gudang') {
    return [
      {
        id: 'warehouse-overview',
        title: 'Portal Logistik Gudang',
        icon: Building2,
        badge: 'Gudang',
        submenus: [
          { id: 'warehouse-overview', title: 'Ringkasan Stok & Logistik', desc: 'Status fisik barang & antrean', icon: Building2 },
          { id: 'warehouse-orders', title: 'Antrean Packing & Kirim', desc: 'Pemenuhan pesanan RO', icon: Truck },
        ],
      },
      {
        id: 'warehouse-inventory',
        title: 'Inventori & Restock',
        icon: Layers,
        badge: 'Stok',
        submenus: [
          { id: 'warehouse-overview', title: 'Katalog Stok Fisik', desc: 'Penyesuaian stok produk', icon: Layers },
        ],
      },
      {
        id: 'warehouse-orders',
        title: 'Pemrosesan Pesanan RO',
        icon: ShoppingBag,
        badge: 'Fulfillment',
        submenus: [
          { id: 'warehouse-overview', title: 'Daftar Pesanan Siap Kirim', desc: 'Input nomor resi pengiriman', icon: Send },
        ],
      },
      {
        id: 'products',
        title: 'Katalog Produk Herbal',
        icon: Sparkles,
        badge: 'Produk',
        submenus: [
          { id: 'products', title: 'Katalog Produk Bionet', desc: 'Spesifikasi & foto produk', icon: ShoppingBag },
        ],
      },
    ];
  }

  // Default: Member / Mitra
  return [
    {
      id: 'overview',
      title: 'Overview & Sales',
      icon: LayoutDashboard,
      badge: 'Live',
      submenus: [
        { id: 'overview', title: 'Ringkasan Utama & Sales', desc: 'KPI saldo, omset & bonus', icon: LayoutDashboard },
        { id: 'overview', title: 'Grafik Omset 7 Hari', desc: 'Pertumbuhan omset harian', icon: TrendingUp },
        { id: 'overview', title: 'Keseimbangan Kaki Binary', desc: 'Rasio matching pairing 1:1', icon: GitFork },
      ],
    },
    {
      id: 'genealogy',
      title: 'Jaringan & Pohon Binary',
      icon: GitFork,
      badge: 'MLM',
      submenus: [
        { id: 'genealogy', title: 'Pohon Binary Kemitraan', desc: 'Visualizer pohon 3 generasi', icon: GitFork },
        { id: 'referrals', title: 'Direct Sponsor Kemitraan', desc: 'Daftar mitra referral Anda', icon: Users },
      ],
    },
    {
      id: 'referrals',
      title: 'Direct Sponsor',
      icon: Users,
      submenus: [
        { id: 'referrals', title: 'Daftar Referral Langsung', desc: 'Mitra binaan langsung', icon: Users },
        { id: 'genealogy', title: 'Penempatan di Pohon Binary', desc: 'Struktur kaki kiri / kanan', icon: GitFork },
      ],
    },
    {
      id: 'withdrawal',
      title: 'Pencairan Dana (WD)',
      icon: Landmark,
      badge: 'Flip.id',
      submenus: [
        { id: 'withdrawal', title: 'Form Pengajuan Pencairan', desc: 'Penarikan saldo dompet harian', icon: Landmark },
        { id: 'withdrawal', title: 'Riwayat Transfer Bank', desc: 'Status mutasi payout Flip.id', icon: Clock },
        { id: 'bank', title: 'Kelola Rekening Bank', desc: 'Data bank penerima transfer', icon: Building2 },
      ],
    },
    {
      id: 'transactions',
      title: 'Buku Besar Mutasi',
      icon: Wallet,
      submenus: [
        { id: 'transactions', title: 'Semua Mutasi Saldo', desc: 'Audit trail transaksi lengkap', icon: Wallet },
        { id: 'transactions', title: 'Mutasi Bonus Masuk (Kredit)', desc: 'Komisi sponsor & pasangan', icon: ArrowDownLeft },
        { id: 'transactions', title: 'Mutasi Penarikan (Debit)', desc: 'Penarikan saldo & admin fee', icon: ArrowUpRight },
      ],
    },
    {
      id: 'pins',
      title: 'Stokis & Serial PIN',
      icon: KeyRound,
      badge: 'HU',
      submenus: [
        { id: 'pins', title: 'Inventori Serial PIN', desc: 'Stok PIN aktif & terpakai', icon: KeyRound },
        { id: 'pins', title: 'Transfer PIN ke Downline', desc: 'Kirim lisensi ke mitra lain', icon: Send },
        { id: 'pins', title: 'Katalog Paket Hak Usaha', desc: 'Paket Silver, Gold, Platinum', icon: Shield },
      ],
    },
    {
      id: 'products',
      title: 'Katalog Produk (RO)',
      icon: ShoppingBag,
      badge: 'PV',
      submenus: [
        { id: 'products', title: 'Katalog Herbal & RO', desc: 'Suplemen kesehatan BPOM', icon: ShoppingBag },
        { id: 'products', title: 'Simulasi Pemesanan Produk', desc: 'Repeat order poin volume', icon: Sparkles },
      ],
    },
    {
      id: 'profile',
      title: 'Profil & Keamanan Akun',
      icon: User,
      badge: 'Akun',
      submenus: [
        { id: 'profile', title: 'Data Profil & Identitas KYC', desc: 'Ubah nama, No. HP, KTP & NPWP', icon: User },
        { id: 'profile-password', title: 'Ganti Kata Sandi', desc: 'Ubah kata sandi akun Anda', icon: KeyRound },
        { id: 'bank', title: 'Pengaturan Rekening Bank', desc: 'BCA, Mandiri, BRI, BNI, BSI', icon: Building2 },
      ],
    },
    {
      id: 'bank',
      title: 'Rekening Bank Mitra',
      icon: Building2,
      submenus: [
        { id: 'bank', title: 'Pengaturan Rekening Bank', desc: 'BCA, Mandiri, BRI, BNI, BSI', icon: Building2 },
        { id: 'withdrawal', title: 'Pencairan Saldo ke Rekening', desc: 'Gateway Flip.id otomatis', icon: Landmark },
      ],
    },
    {
      id: 'chat',
      title: 'Live Chat Bantuan',
      icon: MessagesSquare,
      badge: 'CS',
      submenus: [
        { id: 'chat', title: 'Chat Layanan Pelanggan', desc: 'Bantuan kemitraan & tiket kendala', icon: MessagesSquare },
      ],
    },
    {
      id: 'components',
      title: 'Komponen DashLite',
      icon: Palette,
      badge: 'UI Kit',
      submenus: [
        { id: 'components', title: 'Galeri Komponen DashLite', desc: 'Badges, Avatars, Cards, Tables', icon: Palette },
        { id: 'components', title: 'Dokumentasi Sistem Desain', desc: 'Panduan tipografi & token warna', icon: Layers },
      ],
    },
  ];
}

/**
 * DashLite Demo 3 - Signature Apps Sidebar with Mobile Drawer & Interactive Hover Flyouts
 */
export default function AppsSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  mobileOpen = false,
  setMobileOpen,
  onOpenProfile,
}) {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [flyoutTop, setFlyoutTop] = useState(0);
  const timeoutRef = useRef(null);

  const userRole = user?.role || 'member';
  const [dynamicAllowedKeys, setDynamicAllowedKeys] = useState(null);

  // Load dynamic menu permissions from database for active role
  useEffect(() => {
    let isMounted = true;
    api
      .get('/rbac/my-menus')
      .then((res) => {
        if (isMounted && res.data?.data) {
          const keys = res.data.data.map((m) => m.menu_key);
          setDynamicAllowedKeys(keys);
        }
      })
      .catch((err) => {
        console.warn('Fallback to standard role menu structure:', err.message);
      });
    return () => {
      isMounted = false;
    };
  }, [userRole]);

  const baseModules = getRoleMenuModules(userRole);
  const menuModules = dynamicAllowedKeys
    ? baseModules.filter((m) => dynamicAllowedKeys.includes(m.id))
    : baseModules;

  const handleMouseEnter = (menuItem, event) => {
    if (window.innerWidth < 1024) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    const topPos = Math.min(Math.max(12, rect.top - 8), window.innerHeight - 380);
    setFlyoutTop(topPos);
    setHoveredMenu(menuItem);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 220);
  };

  const handleFlyoutMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleIconClick = (item, event) => {
    if (item.id === 'profile') {
      if (onOpenProfile) onOpenProfile('profile');
      return;
    }
    setActiveTab(item.id);
    if (window.innerWidth < 1024) {
      if (hoveredMenu?.id === item.id) {
        setHoveredMenu(null);
        if (setMobileOpen) setMobileOpen(false);
      } else {
        const rect = event.currentTarget.getBoundingClientRect();
        const topPos = Math.min(Math.max(12, rect.top - 8), window.innerHeight - 380);
        setFlyoutTop(topPos);
        setHoveredMenu(item);
      }
    }
  };

  const handleSubmenuClick = (sub) => {
    if (sub.action === 'logout') {
      onLogout();
    } else if (sub.action === 'copy_ref') {
      handleCopyLink();
    } else if (sub.action === 'open_profile' || sub.id === 'profile') {
      if (onOpenProfile) onOpenProfile('profile');
    } else if (sub.action === 'open_password' || sub.id === 'profile-password') {
      if (onOpenProfile) onOpenProfile('password');
    } else if (sub.id) {
      setActiveTab(sub.id);
    }
    setHoveredMenu(null);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/register?ref=${user?.username || 'mitra'}`;
    navigator.clipboard.writeText(url);
    alert('Link referral sponsor berhasil disalin ke clipboard!');
    setHoveredMenu(null);
    if (setMobileOpen) setMobileOpen(false);
  };

  const roleLabel = {
    admin: 'SUPER ADMIN',
    gudang: 'TIM GUDANG',
    member: 'MITRA BIONET',
  }[userRole] || 'PENGGUNA';

  // Mobile drawer submenu accordion state
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState(null);

  // Auto-expand current active module when drawer opens or activeTab changes
  useEffect(() => {
    if (activeTab) {
      const parent = menuModules.find(
        (m) => m.id === activeTab || m.submenus?.some((s) => s.id === activeTab)
      );
      if (parent) {
        setMobileExpandedMenu(parent.id);
      }
    }
  }, [mobileOpen, activeTab, menuModules]);

  const handleMobileMenuToggle = (item) => {
    if (item.id === 'profile') {
      if (onOpenProfile) onOpenProfile('profile');
      if (setMobileOpen) setMobileOpen(false);
      return;
    }
    if (mobileExpandedMenu === item.id) {
      setMobileExpandedMenu(null);
    } else {
      setMobileExpandedMenu(item.id);
      setActiveTab(item.id);
    }
  };

  const handleMobileSubmenuSelect = (sub) => {
    if (sub.action === 'logout') {
      onLogout();
    } else if (sub.action === 'copy_ref') {
      handleCopyLink();
    } else if (sub.action === 'open_profile' || sub.id === 'profile') {
      if (onOpenProfile) onOpenProfile('profile');
    } else if (sub.action === 'open_password' || sub.id === 'profile-password') {
      if (onOpenProfile) onOpenProfile('password');
    } else if (sub.id) {
      setActiveTab(sub.id);
    }
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => {
            setHoveredMenu(null);
            if (setMobileOpen) setMobileOpen(false);
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* 1. Apps Sidebar / Mobile Responsive Drawer */}
      <aside
        className={`w-72 sm:w-80 lg:w-[68px] bg-[#051812] border-r border-[#0d362a] fixed top-0 left-0 h-dvh z-40 shadow-2xl select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* DESKTOP VIEW (Slim 68px Icon Column) */}
        <div className="hidden lg:flex flex-col items-center justify-between py-4 h-full w-full">
          {/* Top Brand Logo */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            <div
              onClick={() => {
                const defaultTab = userRole === 'admin' ? 'admin-overview' : userRole === 'gudang' ? 'warehouse-overview' : 'overview';
                setActiveTab(defaultTab);
              }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-transform"
              title="Bionet Hub"
            >
              <Layers size={22} className="text-white" strokeWidth={2} />
            </div>

            <div className="w-7 h-[1px] bg-emerald-900/60 my-1" />

            {/* Navigation Icons List */}
            <nav className="flex flex-col items-center gap-2 w-full px-2 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
              {menuModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isHovered = hoveredMenu?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                    className="relative flex items-center justify-center w-full"
                  >
                    <button
                      onClick={(e) => handleIconClick(item, e)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 relative ${
                        isActive
                          ? 'bg-[#059669] text-white shadow-[0_4px_18px_rgba(16,185,129,0.5)]'
                          : isHovered
                          ? 'bg-emerald-900/50 text-white'
                          : 'text-emerald-400/80 hover:text-white hover:bg-emerald-950/60'
                      }`}
                    >
                      <Icon size={21} strokeWidth={isActive ? 2.2 : 1.9} />
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom User Avatar Trigger */}
          <div
            onClick={() => onOpenProfile && onOpenProfile('profile')}
            onMouseEnter={(e) =>
              handleMouseEnter(
                {
                  id: 'profile',
                  title: user?.full_name || user?.username || 'Akun Pengguna',
                  badge: roleLabel,
                  submenus: [
                    { action: 'open_profile', title: 'Edit Profil & KYC', desc: 'Nama, No. HP, KTP & NPWP', icon: User },
                    { action: 'open_password', title: 'Ganti Kata Sandi', desc: 'Ubah password akun Anda', icon: KeyRound },
                    { action: 'copy_ref', title: 'Salin Link Referral', desc: 'Bagikan ke calon mitra', icon: Share2 },
                    { id: 'bank', title: 'Pengaturan Rekening Bank', desc: 'Data bank penerima bonus', icon: Building2 },
                    { action: 'logout', title: 'Keluar dari Sistem', desc: 'Akhiri sesi akun aman', icon: LogOut, danger: true },
                  ],
                },
                e
              )
            }
            onMouseLeave={handleMouseLeave}
            className="relative flex items-center justify-center cursor-pointer p-1 rounded-full hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-full font-heading font-extrabold text-sm flex items-center justify-center shadow-sm ${
                userRole === 'admin'
                  ? 'bg-amber-200 text-amber-900'
                  : userRole === 'gudang'
                  ? 'bg-sky-200 text-sky-900'
                  : 'bg-[#bbf7d0] text-[#065f46]'
              }`}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10b981] ring-2 ring-[#051812]" />
            </div>
          </div>
        </div>

        {/* MOBILE VIEW (Full Drawer with Labels, User Chip & Fast Navigation) */}
        <div className="flex lg:hidden flex-col justify-between h-full py-4 px-4 overflow-hidden">
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_14px_rgba(16,185,129,0.4)]">
                <Layers size={18} className="text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm text-white leading-tight">
                  Bionet Mitra Hub
                </h3>
                <p className="text-[10px] text-emerald-400/80 font-medium">
                  {roleLabel}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen && setMobileOpen(false)}
              aria-label="Tutup Menu"
              className="p-2 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/60 border border-emerald-900/60 active:scale-95 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Profile Mini Card */}
          <div className="mt-3 p-3 rounded-xl bg-[#092b21] border border-emerald-900/60 flex items-center justify-between">
            <div
              onClick={() => {
                if (onOpenProfile) onOpenProfile('profile');
                if (setMobileOpen) setMobileOpen(false);
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            >
              <div className={`w-9 h-9 rounded-full font-heading font-extrabold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${
                userRole === 'admin'
                  ? 'bg-amber-200 text-amber-900'
                  : userRole === 'gudang'
                  ? 'bg-sky-200 text-sky-900'
                  : 'bg-[#bbf7d0] text-[#065f46]'
              }`}>
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                  {user?.full_name || user?.username || 'Mitra Bionet'}
                </div>
                <div className="text-[10px] text-emerald-400/80 truncate">
                  @{user?.username || 'user'} • Edit Profil
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile('profile');
                  if (setMobileOpen) setMobileOpen(false);
                }}
                title="Edit Profil & Password"
                className="px-2 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 hover:text-white border border-emerald-600/50 text-[10px] font-bold transition flex items-center gap-1"
              >
                <User size={12} />
                <span>Edit</span>
              </button>
              {userRole === 'member' && (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Salin Link Referral"
                  className="p-1.5 rounded-lg bg-emerald-900/80 text-emerald-300 hover:text-white border border-emerald-700/60 flex-shrink-0"
                >
                  <Share2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation List with Labels & Expandable Submenus */}
          <nav className="flex-1 overflow-y-auto space-y-1.5 py-3 my-2 scrollbar-none">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/60 px-2 mb-1 flex items-center justify-between">
              <span>Navigasi Menu & Submenu</span>
              <span className="text-[9px] font-normal text-emerald-500/60">Sentuh untuk buka submenu</span>
            </div>
            {menuModules.map((item) => {
              const Icon = item.icon;
              const isExpanded = mobileExpandedMenu === item.id;
              const hasSubmenus = item.submenus && item.submenus.length > 0;
              const isCurrentModuleActive =
                activeTab === item.id || item.submenus?.some((s) => s.id === activeTab);

              return (
                <div key={item.id} className="space-y-1">
                  {/* Parent Module Button */}
                  <button
                    type="button"
                    onClick={() => handleMobileMenuToggle(item)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 ${
                      isCurrentModuleActive
                        ? 'bg-emerald-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] font-bold'
                        : isExpanded
                        ? 'bg-[#092b21] text-emerald-300 border border-emerald-800/60 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-[#092b21] font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isCurrentModuleActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-xs text-left truncate">
                        {item.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isCurrentModuleActive
                              ? 'bg-white/25 text-white'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenus ? (
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-emerald-200' : 'text-emerald-500/60'
                          }`}
                        />
                      ) : (
                        <ChevronRight size={14} className={isCurrentModuleActive ? 'text-white' : 'text-emerald-600/60'} />
                      )}
                    </div>
                  </button>

                  {/* Submenus Accordion Panel */}
                  {isExpanded && hasSubmenus && (
                    <div className="pl-2 pr-1 py-1.5 space-y-1 bg-[#041610]/95 border border-emerald-900/60 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.submenus.map((sub, sIdx) => {
                        const SubIcon = sub.icon || ChevronRight;
                        const isSubActive = sub.id && activeTab === sub.id;

                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleMobileSubmenuSelect(sub)}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                              sub.danger
                                ? 'text-rose-400 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40'
                                : isSubActive
                                ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/50 shadow-2xs'
                                : 'text-slate-300 hover:text-white hover:bg-emerald-950/60'
                            }`}
                          >
                            <div
                              className={`p-1.5 rounded-md flex-shrink-0 mt-0.5 ${
                                sub.danger
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : isSubActive
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-[#061e16] text-emerald-400 border border-emerald-900/60'
                              }`}
                            >
                              <SubIcon size={13} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold leading-tight flex items-center justify-between gap-1">
                                <span className={isSubActive ? 'text-white font-bold' : 'text-slate-200'}>
                                  {sub.title}
                                </span>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                )}
                              </div>
                              {sub.desc && (
                                <p className="text-[10px] text-emerald-400/70 leading-tight mt-0.5 line-clamp-1">
                                  {sub.desc}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile Drawer Footer Actions */}
          <div className="pt-2 border-t border-emerald-900/60 space-y-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('bank');
                if (setMobileOpen) setMobileOpen(false);
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-950/50 transition"
            >
              <Building2 size={15} />
              <span>Rekening Bank & Pembayaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (setMobileOpen) setMobileOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-950/60 border border-rose-900/50 transition active:scale-98"
            >
              <LogOut size={15} />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Floating Flyout Submenu Panel (Desktop Only) */}
      {hoveredMenu && (
        <div
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ top: `${flyoutTop}px` }}
          className="hidden lg:block fixed left-[68px] z-40 w-72 bg-[#061d15] border border-[#0f4637] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] p-3.5 text-white animate-in fade-in slide-in-from-left-1 duration-150 before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']"
        >
          {/* Subtle Left Connector Caret */}
          <div className="absolute -left-1.5 top-4 w-3 h-3 bg-[#061d15] border-l border-b border-[#0f4637] rotate-45 pointer-events-none" />

          {/* Header of Flyout */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#0f4637]/80 relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xs text-white tracking-wide truncate max-w-[170px]">
                {hoveredMenu.title}
              </span>
            </div>
            {hoveredMenu.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {hoveredMenu.badge}
              </span>
            )}
          </div>

          {/* Submenu Links List (Best-practice clean transparent background, shows bg on hover only) */}
          <div className="space-y-1 relative z-10">
            {hoveredMenu.submenus?.map((sub, idx) => {
              const SubIcon = sub.icon || ChevronRight;
              const isSubActive = sub.id && activeTab === sub.id;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (sub.action === 'logout') {
                      onLogout();
                    } else if (sub.action === 'copy_ref') {
                      handleCopyLink();
                    } else {
                      handleSubmenuClick(sub);
                    }
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors duration-150 group bg-transparent hover:bg-[#0a2e22] ${
                    sub.danger
                      ? 'text-rose-400 hover:text-rose-300'
                      : isSubActive
                      ? 'text-emerald-300 hover:text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-md flex-shrink-0 mt-0.5 transition-colors ${
                      sub.danger
                        ? 'bg-rose-500/20 text-rose-400'
                        : isSubActive
                        ? 'bg-[#0d3b2c] text-emerald-400 ring-1 ring-emerald-500/30'
                        : 'bg-[#082218] text-slate-400 group-hover:text-emerald-300'
                    }`}
                  >
                    <SubIcon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold leading-tight flex items-center justify-between">
                      <span className={isSubActive ? 'text-emerald-300 group-hover:text-white' : 'text-slate-200 group-hover:text-white'}>
                        {sub.title}
                      </span>
                      {isSubActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Menu Aktif" />
                      )}
                    </div>
                    {sub.desc && (
                      <p className="text-[10px] text-emerald-400/60 leading-tight mt-0.5 truncate group-hover:text-emerald-300/80">
                        {sub.desc}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
