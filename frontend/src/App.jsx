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
import WarehouseTab from './components/warehouse/WarehouseTab';
import ChatTab from './components/ChatTab';
import LoginPage from './pages/LoginPage';
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
      const allowed = ['admin-overview', 'admin-transactions', 'admin-withdrawals', 'overview', 'chat', 'components'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    if (role === 'cs') {
      const allowed = ['admin-overview', 'admin-users', 'chat', 'overview', 'components'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(getInitialTab(role));
      }
      return;
    }

    if (role === 'gudang') {
      const allowed = ['warehouse-overview', 'warehouse-inventory', 'warehouse-orders', 'products'];
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

  const handleLoginSuccess = (userData) => {
    setToken(localStorage.getItem('bionet_token'));
    setUser(userData);
    setActiveTab(getInitialTab(userData?.role));
  };

  const handleLogout = () => {
    localStorage.removeItem('bionet_token');
    localStorage.removeItem('bionet_user');
    setToken(null);
    setUser(null);
    setStats(null);
  };

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
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 ml-0 lg:ml-[68px] flex flex-col min-w-0 min-h-screen transition-all duration-300">
        <Header
          user={user}
          onRefresh={fetchStats}
          loading={loading}
          mobileOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onNavigate={setActiveTab}
        />

        {/* 3. Fluid Page Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-6 w-full max-w-none">
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
    </div>
  );
}
