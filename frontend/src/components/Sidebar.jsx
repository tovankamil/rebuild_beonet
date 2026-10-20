import React from 'react';
import {
  LayoutDashboard,
  GitFork,
  Users,
  Wallet,
  Building2,
  LogOut,
  Layers,
  Landmark,
  KeyRound,
  ShoppingBag,
  Palette,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, isOpen = true }) {
  const primaryMenuItems = [
    { id: 'overview', label: 'Overview & Sales', icon: LayoutDashboard, badge: 'Live' },
    { id: 'genealogy', label: 'Pohon Binary MLM', icon: GitFork },
    { id: 'referrals', label: 'Direct Sponsor', icon: Users },
  ];

  const financeMenuItems = [
    { id: 'withdrawal', label: 'Pencairan Dana (WD)', icon: Landmark, badge: 'Flip.id' },
    { id: 'transactions', label: 'Buku Besar Mutasi', icon: Wallet },
    { id: 'bank', label: 'Rekening Bank Mitra', icon: Building2 },
  ];

  const stokisMenuItems = [
    { id: 'pins', label: 'Inventori Serial PIN', icon: KeyRound },
    { id: 'products', label: 'Katalog RO Herbal', icon: ShoppingBag, badge: 'PV' },
  ];

  const uiMenuItems = [
    { id: 'components', label: 'Komponen DashLite', icon: Palette, badge: 'UI Kit' },
  ];

  const renderNavGroup = (title, items) => (
    <div className="mb-4">
      <div className="px-4 mb-1.5">
        <span className="overline-title text-[10px] tracking-wider text-emerald-300/60 font-bold uppercase">
          {title}
        </span>
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-emerald-glow font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={16}
                  className={isActive ? 'text-white' : 'text-emerald-400/80'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside
      className={`w-60 bg-[#071e17] text-white flex flex-col h-screen fixed top-0 left-16 z-40 border-r border-[#0d362a] shadow-xl transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Brand Header - DashLite Demo 3 style */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#0d362a] bg-[#051812]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/40">
          <Layers size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading font-extrabold text-sm tracking-tight text-white leading-none">
              BIONET
            </h1>
            <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-1 py-0.5 rounded">
              v6
            </span>
          </div>
          <p className="text-[10px] text-emerald-400/70 font-medium tracking-wide">
            Mitra Enterprise Hub
          </p>
        </div>
      </div>

      {/* Navigation Scrollable Body */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        {renderNavGroup('Menu Utama', primaryMenuItems)}
        {renderNavGroup('Finansial & Wallet', financeMenuItems)}
        {renderNavGroup('Stokis & Produk', stokisMenuItems)}
        {renderNavGroup('Desain Sistem', uiMenuItems)}
      </nav>

      {/* User Footer Profile Card */}
      <div className="p-3 border-t border-[#0d362a] bg-[#051812]/90">
        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-bold text-[11px] text-slate-900 flex-shrink-0 shadow-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-white truncate">
                {user?.full_name || user?.username || 'Mitra'}
              </h4>
              <p className="text-[9px] text-emerald-300/70 truncate">
                @{user?.username || 'mitra'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Keluar dari akun"
            className="p-1 rounded-md text-emerald-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
