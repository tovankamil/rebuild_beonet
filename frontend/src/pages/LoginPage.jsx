import React, { useState } from 'react';
import { ShieldCheck, LogIn, Sparkles, User, Lock, AlertCircle, Layers } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

  const handleUseDemo = () => {
    setUsername('mitra01');
    setPassword('bionet123');
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
            Masuk ke panel kendali kemitraan & penjualan jaringan herbal
          </p>
        </div>

        {/* DashLite Login Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-dashlite-md p-8">
          <div className="mb-6">
            <h4 className="font-heading font-bold text-lg text-slate-800">
              Masuk Akun Mitra
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Gunakan kredensial yang terdaftar pada jaringan Bionet
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Mitra
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="dash-input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Silakan hubungi administrator stokis Anda untuk bantuan reset password.');
                  }}
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Lupa Sandi?
                </a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="dash-input pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <LogIn size={15} />
              <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          {/* Demo Autofill Quick Pill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUseDemo}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles size={14} className="text-emerald-600" />
              <span>Gunakan Akun Demo (mitra01 / bionet123)</span>
            </button>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Bionet v6 Security Engine with Closure Table & 100% UUID</span>
        </div>
      </div>
    </div>
  );
}
