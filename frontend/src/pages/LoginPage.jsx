import React, { useState } from 'react';
import { ShieldCheck, LogIn, Sparkles, User, Lock, AlertCircle, Layers, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data && res.data.data) {
        localStorage.setItem('bionet_token', res.data.data.token);
        localStorage.setItem('bionet_user', JSON.stringify(res.data.data.user));
        onLoginSuccess(res.data.data.user);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = (role = 'member') => {
    if (role === 'admin') {
      setUsername('admin01');
      setPassword('bionet123');
    } else if (role === 'gudang') {
      setUsername('gudang01');
      setPassword('bionet123');
    } else {
      setUsername('mitra01');
      setPassword('bionet123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/30">
            <Layers size={26} className="text-white" />
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            BIONET MITRA HUB
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Masuk ke panel kendali kemitraan &amp; penjualan jaringan herbal
          </p>
        </div>

        {/* DashLite Login Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-dashlite-md p-7 sm:p-8">
          <div className="mb-6">
            <h4 className="font-heading font-bold text-lg text-slate-800">
              Masuk Akun Mitra
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan kredensial yang terdaftar pada jaringan Bionet
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2" role="alert">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Input: Username Mitra */}
            <div>
              <label htmlFor="login-username" className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Mitra
              </label>
              <div className="relative flex items-center group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors flex items-center justify-center">
                  <User size={18} aria-hidden="true" />
                </span>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  spellCheck={false}
                  className="dash-input pl-11 pr-4 py-2.5 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            {/* Input: Kata Sandi */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi administrator stokis Anda untuk bantuan reset password.');
                  }}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none focus-visible:underline"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative flex items-center group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors flex items-center justify-center">
                  <Lock size={18} aria-hidden="true" />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="dash-input pl-11 pr-11 py-2.5 text-sm font-medium tracking-normal placeholder:tracking-normal placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <LogIn size={16} aria-hidden="true" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          {/* Demo Autofill Quick Pills (RBAC Roles: Member, Admin, Gudang) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
              <Sparkles size={13} className="text-emerald-600" aria-hidden="true" />
              <span>Pilih Akun Demo (Uji Coba RBAC):</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleUseDemo('member')}
                className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-200 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex flex-col items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <span>Mitra/User</span>
                <span className="text-[9px] font-normal text-emerald-600">mitra01</span>
              </button>
              <button
                type="button"
                onClick={() => handleUseDemo('admin')}
                className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100/80 active:bg-amber-200 border border-amber-200 text-amber-900 text-[11px] font-bold flex flex-col items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <span>Admin</span>
                <span className="text-[9px] font-normal text-amber-700">admin01</span>
              </button>
              <button
                type="button"
                onClick={() => handleUseDemo('gudang')}
                className="py-1.5 px-2 rounded-lg bg-sky-50 hover:bg-sky-100/80 active:bg-sky-200 border border-sky-200 text-sky-900 text-[11px] font-bold flex flex-col items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <span>Gudang</span>
                <span className="text-[9px] font-normal text-sky-700">gudang01</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" aria-hidden="true" />
          <span>Bionet v6 Security Engine with Closure Table &amp; 100% UUID</span>
        </div>
      </div>
    </div>
  );
}
