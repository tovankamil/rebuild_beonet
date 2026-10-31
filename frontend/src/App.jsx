import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppsSidebar from './components/dashlite/AppsSidebar';
import Header from './components/Header';
import OverviewTab from './components/OverviewTab';
import BinaryTreeTab from './components/BinaryTreeTab';
import ReferralsTab from './components/ReferralsTab';
import TransactionsTab from './components/TransactionsTab';
import BankTab from './components/BankTab';
import WithdrawalTab from './components/WithdrawalTab';
import PinTab from './components/PinTab';
import ProductsTab from './components/ProductsTab';
import ComponentsTab from './components/dashlite/ComponentsTab';
import AdminOverviewTab from './components/admin/AdminOverviewTab';
import AdminUsersTab from './components/admin/AdminUsersTab';
import AdminTransactionsTab from './components/admin/AdminTransactionsTab';
import AdminPointsTab from './components/admin/AdminPointsTab';
import AdminPinsTab from './components/admin/AdminPinsTab';
import AdminOrdersTab from './components/admin/AdminOrdersTab';
import AdminWithdrawalsTab from './components/admin/AdminWithdrawalsTab';
import AdminFraudTab from './components/admin/AdminFraudTab';
import AdminMonitoringTab from './components/admin/AdminMonitoringTab';
import AdminSystemGuideTab from './components/admin/AdminSystemGuideTab';
import AdminSecurityThreatRadar from './components/admin/AdminSecurityThreatRadar';
import AdminGeoTrafficMap from './components/admin/AdminGeoTrafficMap';
import AdminBrandingTab from './components/admin/AdminBrandingTab';
import WarehouseTab from './components/warehouse/WarehouseTab';
import ChatTab from './components/ChatTab';
import MeetingTab from './components/MeetingTab';
import LeadsCRMTab from './components/crm/LeadsCRMTab';
import AIMarketingStudioTab from './components/ai/AIMarketingStudioTab';
import ProfileModal from './components/ProfileModal';
import AIAssistantWidget from './components/AIAssistantWidget';
import BionetAIFloatingHub from './components/ai/BionetAIFloatingHub';
import ProspectingCalculatorModal from './components/prospecting/ProspectingCalculatorModal';
import DigitalMemberCardModal from './components/credentials/DigitalMemberCardModal';
import ECertificateModal from './components/credentials/ECertificateModal';
import BionetLuckyWheelModal from './components/gamification/BionetLuckyWheelModal';
import PwaInstallBanner from './components/pwa/PwaInstallBanner';
import LoginPage from './pages/LoginPage';
import PublicStorefrontPage from './components/store/PublicStorefrontPage';
import PublicMeetingPage from './components/meeting/PublicMeetingPage';
import PublicBioPage from './pages/PublicBioPage';
import api from './services/api';

export default function App() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('bionet_token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bionet_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Invalid bionet_user in localStorage, clearing:', e);
      try {
        localStorage.removeItem('bionet_user');
      } catch {}
      return null;
    }
  });

  const getInitialTab = (role) => {
    if (role === 'admin') return 'admin-overview';
    if (role === 'keuangan') return 'admin-overview';
    if (role === 'cs') return 'admin-users';
    if (role === 'gudang') return 'warehouse-overview';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(() => getInitialTab(user?.role));
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  const [prospectCalculatorOpen, setProspectCalculatorOpen] = useState(false);
  const [digitalCardOpen, setDigitalCardOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [luckyWheelOpen, setLuckyWheelOpen] = useState(false);

  useEffect(() => {
    const handleOpenWheel = () => setLuckyWheelOpen(true);
    window.addEventListener('bionet:open-wheel', handleOpenWheel);
    return () => window.removeEventListener('bionet:open-wheel', handleOpenWheel);
  }, []);

  useEffect(() => {
    if (activeTab === 'lucky-wheel') {
      setLuckyWheelOpen(true);
      setActiveTab('overview');
    }
  }, [activeTab]);
  const [securityAlertAcknowledged, setSecurityAlertAcknowledged] = useState(() => {
    try {
      return sessionStorage.getItem('bionet_security_alert_ack') === 'true';
    } catch {
      return false;
    }
  });

  const handleAcknowledgeAlert = () => {
    setSecurityAlertAcknowledged(true);
    try {
      sessionStorage.setItem('bionet_security_alert_ack', 'true');
    } catch {}
  };

  const handleOpenProfile = (tab = 'profile') => {
    setProfileModalTab(tab);
    setProfileModalOpen(true);
  };

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data && res.data.data) {
        setStats(res.data.data);
        if (res.data.data.user) {
          setUser(res.data.data.user);
          localStorage.setItem('bionet_user', JSON.stringify(res.data.data.user));
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSession = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.data) {
        const freshUser = res.data.data;
        setUser((prev) => {
          if (prev && prev.role !== freshUser.role) {
            setActiveTab(getInitialTab(freshUser.role));
          }
          return freshUser;
        });
        localStorage.setItem('bionet_user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.error('Failed to sync auth/me session:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserSession();
      fetchStats();
    }
  }, [token]);

  // Frontend Role Guard: Otomatis mengarahkan ke tab awal jika tab aktif tidak sesuai role
  useEffect(() => {
    if (!user?.role) return;
    const role = user.role;
    if (role === 'admin') return;

    if (role === 'keuangan') {
      const allowed = ['admin-overview', 'admin-transactions', 'admin-withdrawals', 'admin-fraud', 'admin-monitoring', 'admin-guide', 'leads', 'overview', 'chat', 'meetings'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    if (role === 'cs') {
      const allowed = ['admin-overview', 'admin-users', 'admin-guide', 'leads', 'chat', 'meetings', 'overview'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    if (role === 'gudang') {
      const allowed = ['warehouse-overview', 'warehouse-inventory', 'warehouse-orders', 'admin-guide', 'products'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    // Member
    if (activeTab.startsWith('admin-') || activeTab.startsWith('warehouse-') || activeTab === 'ai-marketing' || activeTab === 'components') {
      setActiveTab(getInitialTab(role));
    }
  }, [user?.role, activeTab]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
      setStats(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Heartbeat tracking for online presence
  useEffect(() => {
    if (!token || !user) return;

    const sendHeartbeat = async () => {
      try {
        await api.post('/user/heartbeat', {
          current_page: activeTab,
          full_name: user?.full_name || user?.username,
        });
      } catch (err) {
        // Silently ignore ping errors
      }
    };

    // Send immediately when tab changes or initially mounts
    sendHeartbeat();

    // Periodic heartbeat every 20 seconds
    const interval = setInterval(sendHeartbeat, 20000);

    const handleBeforeUnload = () => {
      try {
        navigator.sendBeacon?.('/api/user/logout-ping');
      } catch (e) {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [token, user?.id, activeTab]);

  const handleLoginSuccess = (userData) => {
    setToken(localStorage.getItem('bionet_token'));
    setUser(userData);
    setActiveTab(getInitialTab(userData?.role));
  };

  const handleLogout = async () => {
    try {
      await api.post('/user/logout-ping');
    } catch (e) {}
    localStorage.removeItem('bionet_token');
    localStorage.removeItem('bionet_user');
    setToken(null);
    setUser(null);
    setStats(null);
  };

  // 0. Public Handlers (Bisa diakses publik tanpa login)
  const pathname = window.location.pathname;
  const bioMatch = pathname.match(/^\/bio\/([^/?#]+)/i);
  const searchParams = new URLSearchParams(window.location.search);
  const bioParam = searchParams.get('bio');

  if (bioMatch || bioParam) {
    const bioUsername = bioMatch ? decodeURIComponent(bioMatch[1]) : bioParam;
    return <PublicBioPage username={bioUsername} />;
  }

  const storeParam = searchParams.get('store');
  const meetingParam = searchParams.get('meeting');

  if (meetingParam) {
    return (
      <PublicMeetingPage
        roomId={meetingParam}
        onGoHome={() => {
          window.location.href = window.location.pathname;
        }}
      />
    );
  }

  if (storeParam) {
    return (
      <PublicStorefrontPage
        storeUsername={storeParam}
        onGoToLogin={() => {
          window.location.href = window.location.pathname;
        }}
      />
    );
  }

  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const role = user?.role || 'member';

  return (
    <div className="min-h-screen min-h-dvh bg-[#f5f6fa] flex text-slate-800 font-sans overflow-x-hidden">
      {/* 1. DashLite Demo 3 Slim Apps Sidebar */}
      <AppsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenProfile={handleOpenProfile}
        onOpenProspectCalculator={() => setProspectCalculatorOpen(true)}
        onOpenDigitalCard={() => setDigitalCardOpen(true)}
        onOpenCertificate={() => setCertificateOpen(true)}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 ml-0 lg:ml-[68px] flex flex-col min-w-0 min-h-screen min-h-dvh transition-all duration-300">
        <Header
          user={user}
          onRefresh={fetchStats}
          loading={loading}
          mobileOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onNavigate={setActiveTab}
          onOpenProfile={handleOpenProfile}
          onOpenProspectCalculator={() => setProspectCalculatorOpen(true)}
          onOpenDigitalCard={() => setDigitalCardOpen(true)}
          onOpenCertificate={() => setCertificateOpen(true)}
        />

        {/* 3. Fluid Full-Width Page Content Area with Seamless Edge-to-Edge Grid Alignment */}
        <main className="flex-1 px-4 sm:px-8 py-4 sm:py-6 safe-bottom w-full">
          {/* PWA Standalone Install Banner */}
          <PwaInstallBanner />

          {/* Cyber Bio-Defense Floating Alert Banner for Super Admin */}
          {role === 'admin' && !securityAlertAcknowledged && activeTab !== 'admin-security' && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950 via-slate-950 to-red-950 border border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-600 text-white tracking-wider">
                      DEFCON WARNING
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                      Insiden Percobaan Intrusi Terdeteksi &amp; Berhasil Dimigasikannya
                    </h3>
                  </div>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">
                    WAF Bionet telah memblokir 8 percobaan Distributed SYN Flooding &amp; injeksi SQL dari cluster IP asing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                <button
                  onClick={() => setActiveTab('admin-security')}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02]"
                >
                  <span>Buka Radar Keamanan</span>
                  <span className="text-xs">↗</span>
                </button>
                <button
                  onClick={handleAcknowledgeAlert}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                  title="Acknowledge alert"
                >
                  Tutup / Acknowledge
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ==================== ADMIN ROLE VIEWS ==================== */}
              {activeTab === 'admin-overview' && (
                <AdminOverviewTab setActiveTab={setActiveTab} />
              )}

              {activeTab === 'admin-users' && <AdminUsersTab />}

              {activeTab === 'admin-transactions' && <AdminTransactionsTab />}

              {activeTab === 'admin-points' && <AdminPointsTab />}

              {activeTab === 'admin-pins' && <AdminPinsTab />}

              {activeTab === 'admin-orders' && <AdminOrdersTab />}

              {activeTab === 'admin-withdrawals' && <AdminWithdrawalsTab />}

              {activeTab === 'admin-fraud' && (
                <AdminFraudTab onNavigateToAudit={() => setActiveTab('admin-users')} />
              )}

              {activeTab === 'admin-monitoring' && (
                <AdminMonitoringTab setActiveTab={setActiveTab} />
              )}

              {activeTab === 'admin-guide' && (
                <AdminSystemGuideTab setActiveTab={setActiveTab} />
              )}

              {/* ==================== ADMIN SECURITY & RADAR ROLE VIEWS ==================== */}
              {activeTab === 'admin-security' && role === 'admin' && (
                <AdminSecurityThreatRadar setActiveTab={setActiveTab} />
              )}

              {activeTab === 'admin-geotraffic' && role === 'admin' && (
                <AdminGeoTrafficMap setActiveTab={setActiveTab} />
              )}

              {activeTab === 'admin-branding' && (role === 'admin' || role === 'keuangan') && (
                <AdminBrandingTab />
              )}

              {/* ==================== WAREHOUSE ROLE VIEWS ==================== */}
              {(activeTab === 'warehouse-overview' ||
                activeTab === 'warehouse-inventory' ||
                activeTab === 'warehouse-orders') && <WarehouseTab />}

              {/* ==================== MEMBER & SHARED VIEWS ==================== */}
              {activeTab === 'overview' && (
                <OverviewTab
                  stats={stats}
                  setActiveTab={setActiveTab}
                  currentUser={user}
                  onOpenProfile={handleOpenProfile}
                  onOpenProspectCalculator={() => setProspectCalculatorOpen(true)}
                  onOpenDigitalCard={() => setDigitalCardOpen(true)}
                  onOpenCertificate={() => setCertificateOpen(true)}
                  onProfileUpdated={(updated) => {
                    setUser((prev) => ({ ...prev, ...updated }));
                    fetchStats();
                  }}
                />
              )}

              {activeTab === 'genealogy' && <BinaryTreeTab />}

              {activeTab === 'referrals' && <ReferralsTab />}

              {activeTab === 'withdrawal' && (
                <WithdrawalTab
                  walletBalance={stats?.wallet_balance}
                  bank={stats?.bank}
                  onWithdrawalSuccess={fetchStats}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsTab walletBalance={stats?.wallet_balance} />
              )}

              {activeTab === 'pins' && <PinTab />}

              {activeTab === 'products' && <ProductsTab />}

              {activeTab === 'bank' && (
                <BankTab
                  onBankUpdated={(bank) => {
                    setStats((prev) => (prev ? { ...prev, bank } : prev));
                  }}
                />
              )}

              {activeTab === 'chat' && <ChatTab currentUser={user} />}

              {activeTab === 'leads' && <LeadsCRMTab user={user} />}

              {activeTab === 'ai-marketing' && role === 'admin' && (
                <AIMarketingStudioTab user={user} />
              )}

              {activeTab === 'meetings' && (
                <MeetingTab user={user} setActiveTab={setActiveTab} />
              )}

              {activeTab === 'components' && role === 'admin' && <ComponentsTab />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* DashLite Standard Footer */}
        <footer className="py-4 px-6 sm:px-8 border-t border-slate-200 bg-white text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            &copy; {new Date().getFullYear()} <strong className="text-slate-600">Bionet Network System</strong>. DashLite Demo 3 Architecture.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Role: <strong className="uppercase text-slate-700">{role}</strong></span>
            <span>Server: v6.0-UUID</span>
            <span>Gateway: Flip.id Realtime</span>
            <span>RBAC: Multi-Role Engine</span>
          </div>
        </footer>
      </div>

      {/* Global Profile & Password Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={user}
        initialTab={profileModalTab}
        onProfileUpdated={(updated) => {
          setUser((prev) => ({ ...prev, ...updated }));
          fetchStats();
        }}
      />

      {/* Module 4: Kalkulator Simulasi Bonus & Prospek Mitra Modal */}
      <ProspectingCalculatorModal
        isOpen={prospectCalculatorOpen}
        onClose={() => setProspectCalculatorOpen(false)}
        currentUser={user}
      />

      {/* Module 5: KTA Digital Resmi BPOM Modal */}
      <DigitalMemberCardModal
        isOpen={digitalCardOpen}
        onClose={() => setDigitalCardOpen(false)}
        currentUser={user}
      />

      {/* Module 5: E-Sertifikat Kemitraan & Konsultan Herbal Modal */}
      <ECertificateModal
        isOpen={certificateOpen}
        onClose={() => setCertificateOpen(false)}
        currentUser={user}
      />

      {/* Module 6: Intermezo Roda Berkah Keberuntungan Modal */}
      <BionetLuckyWheelModal
        isOpen={luckyWheelOpen}
        onClose={() => setLuckyWheelOpen(false)}
        currentUser={user}
      />

      {/* Floating AI Copilot Widget */}
      <AIAssistantWidget currentUser={user} hideFab={true} />

      {/* Luxury Bionet AI Intelligence Suite Floating Hub */}
      <BionetAIFloatingHub
        currentUser={user}
        stats={stats}
        onOpenRegisterDownline={(slotData) => {
          setActiveTab('genealogy');
        }}
      />
    </div>
  );
}
