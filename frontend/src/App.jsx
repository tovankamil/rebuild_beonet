import React, { useState, useEffect, useRef } from 'react';
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
import AdminPackagesTab from './components/admin/AdminPackagesTab';
import AdminProductsTab from './components/admin/AdminProductsTab';
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
import MailTab from './components/MailTab';
import LeadsCRMTab from './components/crm/LeadsCRMTab';
import AIMarketingStudioTab from './components/ai/AIMarketingStudioTab';
import ProfileModal from './components/ProfileModal';
import AIAssistantWidget from './components/AIAssistantWidget';
import BionetAIFloatingHub from './components/ai/BionetAIFloatingHub';
import ProspectingCalculatorModal from './components/prospecting/ProspectingCalculatorModal';
import DigitalMemberCardModal from './components/credentials/DigitalMemberCardModal';
import ECertificateModal from './components/credentials/ECertificateModal';
import BionetLuckyWheelModal from './components/gamification/BionetLuckyWheelModal';
import BionetRankRewardsModal from './components/gamification/BionetRankRewardsModal';
import BionetHerbalFarmModal from './components/gamification/BionetHerbalFarmModal';
import MidtransSnapModal from './components/payment/MidtransSnapModal';
import PwaInstallBanner from './components/pwa/PwaInstallBanner';
import LoginPage from './pages/LoginPage';
import PublicStorefrontPage from './components/store/PublicStorefrontPage';
import PublicMeetingPage from './components/meeting/PublicMeetingPage';
import PublicBioPage from './pages/PublicBioPage';
import LandingPage from './pages/LandingPage';
import api from './services/api';

// ==================== URL ROUTING & TAB NAVIGATION CONSTANTS ====================
export const MODAL_TABS = new Set([
  'lucky-wheel',
  'rank-rewards',
  'herbal-farm',
  'digital-card',
  'certificate',
  'e-certificate',
  'prospect-calculator',
]);

export const KNOWN_BASE_TABS = new Set([
  // Member & Shared Tabs
  'landing',
  'overview',
  'genealogy',
  'referrals',
  'withdrawal',
  'transactions',
  'pins',
  'products',
  'bank',
  'chat',
  'mail',
  'leads',
  'ai-marketing',
  'meetings',
  'components',
  // Admin Tabs
  'admin-overview',
  'admin-users',
  'admin-transactions',
  'admin-points',
  'admin-packages',
  'admin-products',
  'admin-pins',
  'admin-orders',
  'admin-withdrawals',
  'admin-fraud',
  'admin-monitoring',
  'admin-guide',
  'admin-security',
  'admin-geotraffic',
  'admin-branding',
  // Warehouse Tabs
  'warehouse-overview',
  'warehouse-inventory',
  'warehouse-orders',
]);

export const getInitialTab = (role) => {
  if (role === 'admin') return 'admin-overview';
  if (role === 'keuangan') return 'admin-overview';
  if (role === 'cs') return 'admin-users';
  if (role === 'gudang') return 'warehouse-overview';
  return 'overview';
};

export const isValidTabName = (tab) => {
  if (!tab || typeof tab !== 'string') return false;
  const clean = tab.toLowerCase().trim();
  if (!clean) return false;
  if (clean.startsWith('admin-') || clean.startsWith('warehouse-')) return true;
  if (KNOWN_BASE_TABS.has(clean) || MODAL_TABS.has(clean)) return true;
  return false;
};

export const isTabAllowedForRole = (tab, role = 'member') => {
  if (!tab) return false;
  const clean = tab.toLowerCase().trim();

  // Role: Gudang (Logistik & Inventori Pergudangan - STRICTLY WAREHOUSE ONLY)
  if (role === 'gudang') {
    const allowed = [
      'warehouse-overview',
      'warehouse-inventory',
      'warehouse-orders',
      'admin-guide',
      'products',
    ];
    return allowed.includes(clean);
  }

  // Role: Admin (Pusat Kendali Eksekutif & Audit - NO MEMBER GAMIFICATION GAMES)
  if (role === 'admin') {
    if (
      clean === 'lucky-wheel' ||
      clean === 'herbal-farm' ||
      clean === 'rank-rewards' ||
      clean === 'digital-card' ||
      clean === 'certificate' ||
      clean === 'e-certificate' ||
      clean === 'prospect-calculator'
    ) {
      return false;
    }
    return true;
  }

  if (role === 'keuangan') {
    const allowed = [
      'admin-overview',
      'admin-transactions',
      'admin-withdrawals',
      'admin-fraud',
      'admin-monitoring',
      'admin-guide',
      'admin-branding',
      'leads',
      'overview',
      'chat',
      'meetings',
    ];
    return allowed.includes(clean);
  }

  if (role === 'cs') {
    const allowed = [
      'admin-overview',
      'admin-users',
      'admin-guide',
      'leads',
      'chat',
      'meetings',
      'overview',
    ];
    return allowed.includes(clean);
  }

  // Regular Member Role Restrictions
  if (MODAL_TABS.has(clean)) return true;

  if (
    clean.startsWith('admin-') ||
    clean.startsWith('warehouse-') ||
    clean === 'ai-marketing' ||
    clean === 'components' ||
    clean === 'mail'
  ) {
    return false;
  }
  return true;
};

export const parseHashTab = () => {
  try {
    const hash = window.location.hash || '';
    if (!hash) return null;
    const clean = hash.replace(/^#\/?/, '').split('?')[0].split('/')[0].trim().toLowerCase();
    return clean || null;
  } catch {
    return null;
  }
};

export const parsePathTab = () => {
  try {
    const pathname = window.location.pathname || '';
    if (!pathname || pathname === '/' || pathname.startsWith('/bio')) return null;
    const clean = pathname.replace(/^\//, '').split('?')[0].split('/')[0].trim().toLowerCase();
    if (!clean || clean === 'index.html' || clean === 'login' || clean === 'register' || clean === 'bio') {
      return null;
    }
    return clean;
  } catch {
    return null;
  }
};

export const parseSearchTab = () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get('tab');
    return t ? t.trim().toLowerCase() : null;
  } catch {
    return null;
  }
};

export const parseStorageTab = () => {
  try {
    const t = localStorage.getItem('synetiq_active_tab') || localStorage.getItem('bionet_active_tab');
    return t ? t.trim().toLowerCase() : null;
  } catch {
    return null;
  }
};

export const parseTargetTab = (role) => {
  // a) window.location.hash (e.g. #/genealogy or #genealogy -> genealogy)
  const hashCandidate = parseHashTab();
  if (hashCandidate && isValidTabName(hashCandidate) && isTabAllowedForRole(hashCandidate, role)) {
    return hashCandidate;
  }

  // b) window.location.pathname (e.g. /genealogy -> genealogy)
  const pathCandidate = parsePathTab();
  if (pathCandidate && isValidTabName(pathCandidate) && isTabAllowedForRole(pathCandidate, role)) {
    return pathCandidate;
  }

  // c) URL search params (?tab=genealogy)
  const searchCandidate = parseSearchTab();
  if (searchCandidate && isValidTabName(searchCandidate) && isTabAllowedForRole(searchCandidate, role)) {
    return searchCandidate;
  }

  // d) localStorage.getItem('synetiq_active_tab') / fallback bionet_active_tab
  const storageCandidate = parseStorageTab();
  if (storageCandidate && isValidTabName(storageCandidate) && isTabAllowedForRole(storageCandidate, role)) {
    return storageCandidate;
  }

  // e) Fallback to getInitialTab(role)
  return getInitialTab(role);
};

export default function App() {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('synetiq_token') || localStorage.getItem('bionet_token');
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('synetiq_user') || localStorage.getItem('bionet_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Invalid user in localStorage, clearing:', e);
      try {
        localStorage.removeItem('synetiq_user');
        localStorage.removeItem('bionet_user');
      } catch {}
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => parseTargetTab(user?.role));
  const previousBaseTabRef = useRef(
    MODAL_TABS.has(activeTab) ? getInitialTab(user?.role) : (activeTab || getInitialTab(user?.role))
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  const [prospectCalculatorOpen, setProspectCalculatorOpen] = useState(false);
  const [digitalCardOpen, setDigitalCardOpen] = useState(false);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [luckyWheelOpen, setLuckyWheelOpen] = useState(false);
  const [rankRewardsOpen, setRankRewardsOpen] = useState(false);
  const [herbalFarmOpen, setHerbalFarmOpen] = useState(false);
  const [midtransModalOpen, setMidtransModalOpen] = useState(false);
  const [midtransPaymentData, setMidtransPaymentData] = useState(null);

  useEffect(() => {
    const handleOpenWheel = () => {
      if (user?.role === 'member') setLuckyWheelOpen(true);
    };
    const handleOpenRanks = () => {
      if (user?.role === 'member') setRankRewardsOpen(true);
    };
    const handleOpenFarm = () => {
      if (user?.role === 'member') setHerbalFarmOpen(true);
    };
    const handleOpenMidtrans = (e) => {
      setMidtransPaymentData(e?.detail || null);
      setMidtransModalOpen(true);
    };

    window.addEventListener('synetiq:open-wheel', handleOpenWheel);
    window.addEventListener('bionet:open-wheel', handleOpenWheel);
    window.addEventListener('synetiq:open-ranks', handleOpenRanks);
    window.addEventListener('bionet:open-ranks', handleOpenRanks);
    window.addEventListener('synetiq:open-farm', handleOpenFarm);
    window.addEventListener('bionet:open-farm', handleOpenFarm);
    window.addEventListener('synetiq:open-midtrans', handleOpenMidtrans);
    window.addEventListener('bionet:open-midtrans', handleOpenMidtrans);

    return () => {
      window.removeEventListener('synetiq:open-wheel', handleOpenWheel);
      window.removeEventListener('bionet:open-wheel', handleOpenWheel);
      window.removeEventListener('synetiq:open-ranks', handleOpenRanks);
      window.removeEventListener('bionet:open-ranks', handleOpenRanks);
      window.removeEventListener('synetiq:open-farm', handleOpenFarm);
      window.removeEventListener('bionet:open-farm', handleOpenFarm);
      window.removeEventListener('synetiq:open-midtrans', handleOpenMidtrans);
      window.removeEventListener('bionet:open-midtrans', handleOpenMidtrans);
    };
  }, [user?.role]);

  // Handle special modal tabs: open their respective modal AND keep or restore the previous base tab
  useEffect(() => {
    if (MODAL_TABS.has(activeTab)) {
      if (user?.role === 'member') {
        if (activeTab === 'lucky-wheel') setLuckyWheelOpen(true);
        else if (activeTab === 'rank-rewards') setRankRewardsOpen(true);
        else if (activeTab === 'herbal-farm') setHerbalFarmOpen(true);
        else if (activeTab === 'digital-card') setDigitalCardOpen(true);
        else if (activeTab === 'certificate' || activeTab === 'e-certificate') setCertificateOpen(true);
        else if (activeTab === 'prospect-calculator') setProspectCalculatorOpen(true);
      }

      const restoreTab =
        previousBaseTabRef.current &&
        !MODAL_TABS.has(previousBaseTabRef.current) &&
        isTabAllowedForRole(previousBaseTabRef.current, user?.role)
          ? previousBaseTabRef.current
          : getInitialTab(user?.role);

      setActiveTab(restoreTab);
    } else if (activeTab) {
      previousBaseTabRef.current = activeTab;
    }
  }, [activeTab, user?.role]);

  // Safety role enforcement: if activeTab is not permitted for current role, reset to default role tab
  useEffect(() => {
    if (user?.role && activeTab && !isTabAllowedForRole(activeTab, user.role)) {
      const fallbackTab = getInitialTab(user.role);
      setActiveTab(fallbackTab);
      try {
        localStorage.setItem('synetiq_active_tab', fallbackTab);
        localStorage.setItem('bionet_active_tab', fallbackTab);
      } catch {}
    }
  }, [user?.role, activeTab]);

  // Synchronize activeTab to URL Hash, Browser History & LocalStorage
  useEffect(() => {
    if (!token || !activeTab) return;
    if (MODAL_TABS.has(activeTab)) return;

    // 1. Persist to localStorage
    try {
      localStorage.setItem('synetiq_active_tab', activeTab);
      localStorage.setItem('bionet_active_tab', activeTab);
    } catch (e) {
      console.warn('Failed to save active_tab to localStorage:', e);
    }

    // 2. Synchronize URL hash and browser history stack
    const targetHash = '#/' + activeTab;
    const currentHash = window.location.hash || '';
    const cleanCurrentHash = currentHash.replace(/^#\/?/, '').split('?')[0].split('/')[0].trim().toLowerCase();

    if (cleanCurrentHash !== activeTab) {
      try {
        if (!cleanCurrentHash) {
          window.history.replaceState({ tab: activeTab }, '', targetHash);
        } else {
          window.history.pushState({ tab: activeTab }, '', targetHash);
        }
      } catch {
        window.location.hash = targetHash;
      }
    }
  }, [activeTab, token]);

  // Listen to popstate and hashchange events for browser Back / Forward buttons
  useEffect(() => {
    const handleUrlChange = (event) => {
      // 1. Check event state if available
      const stateTab = event?.state?.tab;
      if (stateTab && isValidTabName(stateTab) && isTabAllowedForRole(stateTab, user?.role)) {
        if (stateTab !== activeTab) {
          setActiveTab(stateTab);
        }
        return;
      }

      // 2. Parse from current hash
      const hashTab = parseHashTab();
      if (hashTab && isValidTabName(hashTab) && isTabAllowedForRole(hashTab, user?.role)) {
        if (hashTab !== activeTab) {
          setActiveTab(hashTab);
        }
        return;
      }

      // 3. Parse from pathname
      const pathTab = parsePathTab();
      if (pathTab && isValidTabName(pathTab) && isTabAllowedForRole(pathTab, user?.role)) {
        if (pathTab !== activeTab) {
          setActiveTab(pathTab);
        }
        return;
      }

      // 4. Fallback to initial tab
      const defaultTab = getInitialTab(user?.role);
      if (defaultTab !== activeTab) {
        setActiveTab(defaultTab);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [activeTab, user?.role]);
  const [securityAlertAcknowledged, setSecurityAlertAcknowledged] = useState(() => {
    try {
      return (
        sessionStorage.getItem('synetiq_security_alert_ack') === 'true' ||
        sessionStorage.getItem('bionet_security_alert_ack') === 'true'
      );
    } catch {
      return false;
    }
  });

  const handleAcknowledgeAlert = () => {
    setSecurityAlertAcknowledged(true);
    try {
      sessionStorage.setItem('synetiq_security_alert_ack', 'true');
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
          localStorage.setItem('synetiq_user', JSON.stringify(res.data.data.user));
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
        localStorage.setItem('synetiq_user', JSON.stringify(freshUser));
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

    if (activeTab === 'mail') {
      setActiveTab(getInitialTab(role) || 'overview');
      return;
    }

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
    if (activeTab.startsWith('admin-') || activeTab.startsWith('warehouse-') || activeTab === 'ai-marketing' || activeTab === 'components' || activeTab === 'mail') {
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
    setToken(localStorage.getItem('synetiq_token') || localStorage.getItem('bionet_token'));
    setUser(userData);
    const target = parseTargetTab(userData?.role);
    setActiveTab(target);
  };

  const handleLogout = async () => {
    try {
      await api.post('/user/logout-ping');
    } catch (e) {}
    localStorage.removeItem('synetiq_token');
    localStorage.removeItem('bionet_token');
    localStorage.removeItem('synetiq_user');
    localStorage.removeItem('bionet_user');
    localStorage.removeItem('synetiq_active_tab');
    localStorage.removeItem('bionet_active_tab');
    setToken(null);
    setUser(null);
    setStats(null);
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      window.location.hash = '';
    }
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

  // SYNETIQ Autonomous Commerce Landing Page (Publicly accessible)
  const landingSectionHashes = new Set([
    'hero',
    'brainstorming',
    'studio',
    'features',
    'systems',
    'security',
    'defcon',
    'beefarm',
    'bpom',
    'digital-products',
    'products',
    'pricing',
    'cta',
    'consultation',
    'footer',
  ]);
  const hashVal = (window.location.hash || '').toLowerCase();
  const cleanHash = hashVal.replace(/^#\/?/, '').split('?')[0].split('/')[0].trim();
  const isLandingRoute =
    hashVal === '#/landing' ||
    hashVal === '#landing' ||
    hashVal.startsWith('#/landing') ||
    pathname.toLowerCase().startsWith('/landing') ||
    searchParams.get('page') === 'landing' ||
    landingSectionHashes.has(cleanHash);

  if (isLandingRoute) {
    return (
      <LandingPage
        onGoToLogin={() => {
          try {
            window.location.hash = '#/login';
          } catch {}
          window.location.reload();
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
        onOpenProspectCalculator={() => setActiveTab('prospect-calculator')}
        onOpenDigitalCard={() => setActiveTab('digital-card')}
        onOpenCertificate={() => setActiveTab('certificate')}
        onOpenRankRewards={() => setActiveTab('rank-rewards')}
        onOpenHerbalFarm={() => setActiveTab('herbal-farm')}
        onOpenMidtrans={(data) => { setMidtransPaymentData(data || null); setMidtransModalOpen(true); }}
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
          onOpenProspectCalculator={() => setActiveTab('prospect-calculator')}
          onOpenDigitalCard={() => setActiveTab('digital-card')}
          onOpenCertificate={() => setActiveTab('certificate')}
          onOpenRankRewards={() => setActiveTab('rank-rewards')}
          onOpenHerbalFarm={() => setActiveTab('herbal-farm')}
          onOpenMidtrans={(data) => { setMidtransPaymentData(data || null); setMidtransModalOpen(true); }}
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
                    WAF SYNETIQ telah memblokir 8 percobaan Distributed SYN Flooding &amp; injeksi SQL dari cluster IP asing.
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

              {activeTab === 'admin-packages' && <AdminPackagesTab />}

              {activeTab === 'admin-products' && <AdminProductsTab />}

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
              {activeTab === 'landing' && (
                <LandingPage onGoToLogin={() => setActiveTab('overview')} />
              )}

              {activeTab === 'overview' && (
                <OverviewTab
                  stats={stats}
                  setActiveTab={setActiveTab}
                  currentUser={user}
                  onOpenProfile={handleOpenProfile}
                  onOpenProspectCalculator={() => setActiveTab('prospect-calculator')}
                  onOpenDigitalCard={() => setActiveTab('digital-card')}
                  onOpenCertificate={() => setActiveTab('certificate')}
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

              {activeTab === 'mail' && role === 'admin' && <MailTab currentUser={user} />}

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
            &copy; {new Date().getFullYear()} <strong className="text-slate-600">SYNETIQ Network System</strong>. DashLite Demo 3 Architecture.
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

      {/* Module 4: Kalkulator Simulasi Bonus & Prospek Mitra Modal (Member Only) */}
      {role === 'member' && (
        <ProspectingCalculatorModal
          isOpen={prospectCalculatorOpen}
          onClose={() => setProspectCalculatorOpen(false)}
          currentUser={user}
        />
      )}

      {/* Module 5: KTA Digital Resmi BPOM Modal (Member Only) */}
      {role === 'member' && (
        <DigitalMemberCardModal
          isOpen={digitalCardOpen}
          onClose={() => setDigitalCardOpen(false)}
          currentUser={user}
        />
      )}

      {/* Module 5: E-Sertifikat Kemitraan & Konsultan Herbal Modal (Member Only) */}
      {role === 'member' && (
        <ECertificateModal
          isOpen={certificateOpen}
          onClose={() => setCertificateOpen(false)}
          currentUser={user}
        />
      )}

      {/* Module 6: Intermezo Roda Berkah Keberuntungan Modal (Member Only) */}
      {role === 'member' && (
        <SYNETIQLuckyWheelModal
          isOpen={luckyWheelOpen}
          onClose={() => setLuckyWheelOpen(false)}
          currentUser={user}
        />
      )}

      {/* Module 8: Sistem Peringkat & Klaim Reward Karir SYNETIQ (Member Only) */}
      {role === 'member' && (
        <SYNETIQRankRewardsModal
          isOpen={rankRewardsOpen}
          onClose={() => setRankRewardsOpen(false)}
          currentUser={user}
          onRewardClaimed={() => {
            fetchStats();
          }}
        />
      )}

      {/* Module 10: Game Intermezo Kebun Herbal & Peternakan Lebah (Member Only) */}
      {role === 'member' && (
        <SYNETIQHerbalFarmModal
          isOpen={herbalFarmOpen}
          onClose={() => setHerbalFarmOpen(false)}
          currentUser={user}
          onRewardClaimed={() => {
            fetchStats();
          }}
        />
      )}

      {/* Module 9: Pembayaran Otomatis Midtrans Snap QRIS & VA */}
      {midtransModalOpen && (
        <MidtransSnapModal
          isOpen={midtransModalOpen}
          onClose={() => setMidtransModalOpen(false)}
          orderData={midtransPaymentData}
          currentUser={user}
          onPaymentSuccess={(result) => {
            fetchStats();
          }}
        />
      )}

      {/* Floating AI Copilot Widget (Member Only) */}
      {role === 'member' && <AIAssistantWidget currentUser={user} hideFab={true} />}

      {/* Luxury SYNETIQ AI Intelligence Suite Floating Hub (Member Only) */}
      {role === 'member' && (
        <SYNETIQAIFloatingHub
          currentUser={user}
          stats={stats}
          onOpenRegisterDownline={(slotData) => {
            setActiveTab('genealogy');
          }}
        />
      )}
    </div>
  );
}
