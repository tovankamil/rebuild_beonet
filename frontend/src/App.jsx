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
import LoginPage from './pages/LoginPage';
import api from './services/api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('bionet_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bionet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState('overview');
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

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

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
    setActiveTab('overview');
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

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex text-slate-800 font-sans relative overflow-x-hidden">
      {/* 1. DashLite Demo 3 Slim Apps Sidebar with Responsive Mobile Drawer & Hover Flyouts */}
      <AppsSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* 2. Main Content Wrapper: ml-0 on mobile, cleanly ml-[68px] on desktop */}
      <div className="flex-1 ml-0 lg:ml-[68px] flex flex-col min-w-0 min-h-screen transition-all duration-300">
        <Header
          user={user}
          onRefresh={fetchStats}
          loading={loading}
          mobileOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* 3. Fluid Page Content Area (Clean, balanced max-w container, neatly padded) */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1380px] mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              stats={stats}
              setActiveTab={setActiveTab}
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

          {activeTab === 'components' && <ComponentsTab />}
        </main>

        {/* DashLite Standard Footer */}
        <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white text-xs text-slate-400">
          <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              &copy; {new Date().getFullYear()} <strong className="text-slate-600">Bionet Network System</strong>. DashLite Demo 3 Architecture.
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span>Server: v6.0-UUID</span>
              <span>Gateway: Flip.id Realtime</span>
              <span>UI: DashLite Slim Suite</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
