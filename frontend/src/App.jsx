import React, { useState, useEffect } from 'react';
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
import WarehouseTab from './components/warehouse/WarehouseTab';
import ChatTab from './components/ChatTab';
import MeetingTab from './components/MeetingTab';
import ProfileModal from './components/ProfileModal';
import AIAssistantWidget from './components/AIAssistantWidget';
import LoginPage from './pages/LoginPage';
import PublicStorefrontPage from './components/store/PublicStorefrontPage';
import PublicMeetingPage from './components/meeting/PublicMeetingPage';
import api from './services/api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('bionet_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bionet_user');
    return saved ? JSON.parse(saved) : null;
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
      const allowed = ['admin-overview', 'admin-transactions', 'admin-withdrawals', 'admin-fraud', 'admin-monitoring', 'admin-guide', 'overview', 'chat', 'meetings', 'components'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    if (role === 'cs') {
      const allowed = ['admin-overview', 'admin-users', 'admin-guide', 'chat', 'meetings', 'overview', 'components'];
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
    if (activeTab.startsWith('admin-') || activeTab.startsWith('warehouse-')) {
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
  const searchParams = new URLSearchParams(window.location.search);
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
    <div className="min-h-screen bg-[#f5f6fa] flex text-slate-800 font-sans">
      {/* 1. DashLite Demo 3 Slim Apps Sidebar */}
      <AppsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenProfile={handleOpenProfile}
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
        />

        {/* 3. Fluid Page Content Area with Mobile Native Spacing */}
        <main className="flex-1 px-3.5 sm:px-8 py-4 sm:py-6 safe-bottom w-full max-w-none">
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

          {activeTab === 'meetings' && (
            <MeetingTab user={user} setActiveTab={setActiveTab} />
          )}

          {activeTab === 'components' && <ComponentsTab />}
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

      {/* Floating AI Copilot Widget */}
      <AIAssistantWidget currentUser={user} />
    </div>
  );
}
