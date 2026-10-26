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
  ExternalLink,
  Boxes,
  Truck,
  Zap,
  MessagesSquare,
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
        id: 'chat',
        title: 'Live Chat Bantuan',
        icon: MessagesSquare,
        badge: 'Support',
        submenus: [
          { id: 'chat', title: 'Helpdesk & Chat Mitra', desc: 'Respon tiket & pesan live mitra', icon: MessagesSquare },
        ],
      },
      {
        id: 'components',
        title: 'Galeri Komponen',
        icon: Palette,
        badge: 'UI Kit',
        submenus: [
          { id: 'components', title: 'Komponen DashLite Demo 3', desc: 'Desain token & elemen UI', icon: Palette },
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
    if (sub.id) setActiveTab(sub.id);
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

      {/* 1. Main 68px Slim Apps Icon Sidebar */}
      <aside
        className={`w-[68px] bg-[#051812] border-r border-[#0d362a] flex flex-col items-center justify-between py-4 fixed top-0 left-0 h-screen z-50 shadow-2xl select-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Logo */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          <div
            onClick={() => {
              const defaultTab = userRole === 'admin' ? 'admin-overview' : userRole === 'gudang' ? 'warehouse-overview' : 'overview';
              setActiveTab(defaultTab);
              if (setMobileOpen) setMobileOpen(false);
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
          onClick={(e) => {
            if (window.innerWidth < 1024) {
              const rect = e.currentTarget.getBoundingClientRect();
              setFlyoutTop(Math.max(12, rect.top - 180));
              setHoveredMenu({
                id: 'profile',
                title: user?.full_name || user?.username || 'Akun Pengguna',
                badge: roleLabel,
                submenus: [
                  { action: 'copy_ref', title: 'Salin Link Referral', desc: 'Bagikan ke calon mitra', icon: Share2 },
                  { id: 'bank', title: 'Pengaturan Rekening Bank', desc: 'Data bank penerima bonus', icon: Building2 },
                  { action: 'logout', title: 'Keluar dari Sistem', desc: 'Akhiri sesi akun aman', icon: LogOut, danger: true },
                ],
              });
            }
          }}
          onMouseEnter={(e) =>
            handleMouseEnter(
              {
                id: 'profile',
                title: user?.full_name || user?.username || 'Akun Pengguna',
                badge: roleLabel,
                submenus: [
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
      </aside>

      {/* 2. Floating Flyout Submenu Panel */}
      {hoveredMenu && (
        <div
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ top: `${flyoutTop}px` }}
          className="fixed left-[68px] z-50 w-72 bg-[#061d15] border border-[#0f4637] rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.5)] p-3.5 text-white animate-in fade-in slide-in-from-left-1 duration-150 before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']"
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
