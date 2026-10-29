import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Shield,
  Share2,
  Check,
  Sparkles,
  Menu,
  X,
  Bell,
  MessagesSquare,
  CheckCheck,
  Wallet,
  ArrowDownLeft,
  KeyRound,
  ShoppingBag,
  Info,
  Clock,
  ExternalLink,
  Volume2,
  CreditCard,
  Calculator,
} from 'lucide-react';
import api from '../services/api';
import { playCoinChime } from '../utils/soundNotification';

export default function Header({
  user,
  onRefresh,
  loading,
  mobileOpen,
  onToggleMobileSidebar,
  onNavigate,
  onOpenProfile,
  onOpenProspectCalculator,
  onOpenDigitalCard,
  onOpenCertificate,
}) {
  const [copied, setCopied] = useState(false);
  const [chimePlayed, setChimePlayed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifFilter, setNotifFilter] = useState('all');
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const notifRef = useRef(null);

  const handleCopy = () => {
    const url = `${window.location.origin}/register?ref=${user?.username || 'mitra'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Fetch unread counters & notifications list
  const fetchNotificationData = async () => {
    try {
      const [notifRes, chatRes] = await Promise.allSettled([
        api.get('/notifications'),
        api.get('/chat/unread-count'),
      ]);

      if (notifRes.status === 'fulfilled' && notifRes.value.data?.data) {
        setNotifications(notifRes.value.data.data.notifications || []);
        setUnreadNotifCount(notifRes.value.data.data.unread_count || 0);
      }

      if (chatRes.status === 'fulfilled' && chatRes.value.data?.data) {
        setUnreadChatCount(chatRes.value.data.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Failed to sync header notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotificationData();

    // Poll every 8 seconds for real-time alerts
    const interval = setInterval(fetchNotificationData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Close popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadNotifCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await api.patch(`/notifications/${notif.id}/read`);
        setUnreadNotifCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      }
      setNotificationsOpen(false);

      if (notif.link && onNavigate) {
        // Remove leading slash if any to match tab IDs (e.g. '/transactions' -> 'transactions')
        const tabKey = notif.link.replace(/^\//, '');
        if (tabKey) {
          onNavigate(tabKey);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'transaction':
        return <Wallet size={15} className="text-emerald-600" />;
      case 'chat':
        return <MessagesSquare size={15} className="text-indigo-600" />;
      case 'pin':
        return <KeyRound size={15} className="text-amber-600" />;
      case 'order':
        return <ShoppingBag size={15} className="text-teal-600" />;
      default:
        return <Info size={15} className="text-sky-600" />;
    }
  };

  return (
    <header className="min-h-16 pt-[env(safe-area-inset-top,0px)] bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Hamburger Toggle (Mobile) + Section Header & Status */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Mobile Menu"
          className="lg:hidden p-2 -ml-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 flex-shrink-0"
        >
          {mobileOpen ? <X size={22} className="text-emerald-700" /> : <Menu size={22} />}
        </button>

        <div className="min-w-0">
          <h2 className="font-heading font-bold text-sm sm:text-base lg:text-lg text-slate-800 leading-snug truncate">
            {user?.role === 'admin'
              ? 'Portal Administrasi Pusat'
              : user?.role === 'keuangan'
              ? 'Portal Keuangan & Kasir'
              : user?.role === 'cs'
              ? 'Portal Helpdesk & Layanan Pelanggan'
              : user?.role === 'gudang'
              ? 'Portal Logistik Pergudangan'
              : 'Dashboard Kemitraan'}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate">
            {user?.role === 'admin'
              ? 'Panel Kontrol Pusat & Manajemen Eksekutif Bionet'
              : user?.role === 'keuangan'
              ? 'Audit Transaksi, Rekonsiliasi Bank & Pencairan WD'
              : user?.role === 'cs'
              ? 'Layanan Chat Interaktif & Bantuan Member 24/7'
              : user?.role === 'gudang'
              ? 'Manajemen Stok Produk Herbal & Pemenuhan Order RO'
              : 'Sistem Kemitraan & Penjualan Jaringan Herbal'}
          </p>
        </div>
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Network Live</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Chat, & User Meta */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Referral Link Fast Share (Member Only) */}
        {user?.role === 'member' && (
          <button
            onClick={handleCopy}
            title="Salin Link Referral Sponsor"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            {copied ? (
              <Check size={14} className="text-emerald-600" />
            ) : (
              <Share2 size={14} className="text-emerald-600" />
            )}
            <span className="text-[11px]">{copied ? 'Tersalin!' : 'Link Referral'}</span>
          </button>
        )}

        {/* Live Chat Direct Button with Unread Badge */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('chat')}
          title="Buka Live Chat Bantuan"
          className="relative p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-all shadow-xs"
        >
          <MessagesSquare size={16} />
          {unreadChatCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-extrabold text-white shadow-xs animate-bounce">
              {unreadChatCount}
            </span>
          )}
        </button>

        {/* Notification Bell Dropdown Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifikasi Transaksi & Sistem"
            className={`relative p-2 rounded-lg border transition-all shadow-xs ${
              notificationsOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Bell size={16} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-xs">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-emerald-600" />
                  <span className="font-heading font-bold text-xs text-slate-900">
                    Notifikasi ({unreadNotifCount} baru)
                  </span>
                </div>
                {unreadNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <CheckCheck size={14} />
                    <span>Tandai Semua Dibaca</span>
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/40">
                <button
                  type="button"
                  onClick={() => setNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    notifFilter === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('transaction')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    notifFilter === 'transaction'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  Transaksi ({notifications.filter((n) => ['transaction', 'pin', 'order', 'bank'].includes(n.type)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('chat')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                    notifFilter === 'chat'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  Chat ({notifications.filter((n) => n.type === 'chat').length})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.filter((n) => {
                  if (notifFilter === 'transaction') {
                    return ['transaction', 'pin', 'order', 'bank'].includes(n.type);
                  }
                  if (notifFilter === 'chat') {
                    return n.type === 'chat';
                  }
                  return true;
                }).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                    <Bell size={24} className="mx-auto text-slate-300" />
                    <p>Tidak ada notifikasi dalam kategori ini</p>
                  </div>
                ) : (
                  notifications
                    .filter((n) => {
                      if (notifFilter === 'transaction') {
                        return ['transaction', 'pin', 'order', 'bank'].includes(n.type);
                      }
                      if (notifFilter === 'chat') {
                        return n.type === 'chat';
                      }
                      return true;
                    })
                    .map((notif) => {
                    const timeAgo = new Date(notif.created_at).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    });
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                          !notif.is_read
                            ? 'bg-emerald-50/50 hover:bg-emerald-50/80'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            !notif.is_read ? 'bg-white shadow-xs' : 'bg-slate-100'
                          }`}
                        >
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs truncate ${
                                !notif.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                              }`}
                            >
                              {notif.title}
                            </span>
                            {!notif.is_read && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            <span>{timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <span className="text-[10px] text-slate-400">
                  Notifikasi otomatis tersinkronisasi dengan transaksi & chat
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs">
          {user?.role === 'admin' ? (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1.5">
              <Shield size={13} className="text-amber-600" />
              SUPER ADMIN
            </span>
          ) : user?.role === 'keuangan' ? (
            <span className="text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 flex items-center gap-1.5">
              <Shield size={13} className="text-purple-600" />
              TIM KEUANGAN
            </span>
          ) : user?.role === 'cs' ? (
            <span className="text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200 flex items-center gap-1.5">
              <Shield size={13} className="text-indigo-600" />
              CUSTOMER SERVICE
            </span>
          ) : user?.role === 'gudang' ? (
            <span className="text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 flex items-center gap-1.5">
              <Shield size={13} className="text-sky-600" />
              TIM GUDANG
            </span>
          ) : (
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1.5">
              <Shield size={13} className="text-emerald-600" />
              MITRA UTAMA
            </span>
          )}
        </div>

        {/* Module 4 Quick Trigger: Kalkulator Simulasi Prospek */}
        {onOpenProspectCalculator && (
          <button
            type="button"
            onClick={onOpenProspectCalculator}
            title="Kalkulator Simulasi Bonus & Prospek Mitra"
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100/80 text-teal-800 border border-teal-200 transition-all text-xs font-bold active:scale-95 shadow-xs"
          >
            <Calculator size={13} className="text-teal-600" />
            <span>Simulasi Bonus</span>
          </button>
        )}

        {/* Module 5 Quick Trigger: KTA Digital */}
        {onOpenDigitalCard && (
          <button
            type="button"
            onClick={onOpenDigitalCard}
            title="KTA Digital Resmi BPOM"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 transition-all text-xs font-bold active:scale-95 shadow-xs"
          >
            <CreditCard size={13} className="text-emerald-600" />
            <span>KTA Digital</span>
          </button>
        )}

        {/* Module 7: Uji Suara Notifikasi Komisi */}
        <button
          type="button"
          onClick={() => {
            playCoinChime();
            setChimePlayed(true);
            setTimeout(() => setChimePlayed(false), 2000);
          }}
          title="Uji Suara Notifikasi Komisi (Web Audio API Synthesizer)"
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-bold active:scale-95 shadow-xs ${
            chimePlayed
              ? 'bg-amber-100 text-amber-900 border-amber-300 scale-95'
              : 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border-amber-200'
          }`}
        >
          <Volume2 size={13} className={chimePlayed ? 'text-amber-600 animate-bounce' : 'text-amber-600'} />
          <span className="hidden 2xl:inline">{chimePlayed ? 'Kring! Komisi!' : 'Uji Suara'}</span>
        </button>

        {/* Refresh Button (Visible on sm+ screens to preserve mobile header space) */}
        <button
          onClick={onRefresh}
          disabled={loading}
          title="Segarkan Data Real-Time"
          className="hidden sm:inline-flex p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-0.5 hidden sm:block" />

        {/* User Mini Profile Trigger */}
        <button
          type="button"
          onClick={() => onOpenProfile && onOpenProfile('profile')}
          title="Buka Pengaturan Profil & Kata Sandi"
          className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100/90 active:scale-95 transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-extrabold text-xs shadow-xs flex-shrink-0 group-hover:ring-2 group-hover:ring-emerald-500/40 transition-all ${
              user?.role === 'admin'
                ? 'bg-amber-100 text-amber-800'
                : user?.role === 'keuangan'
                ? 'bg-purple-100 text-purple-800'
                : user?.role === 'cs'
                ? 'bg-indigo-100 text-indigo-800'
                : user?.role === 'gudang'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-[#bbf7d0] text-[#065f46]'
            }`}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
              {user?.full_name || user?.username || 'Pengguna'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              @{user?.username || 'user'} • <span className="uppercase font-semibold">{user?.role || 'member'}</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
