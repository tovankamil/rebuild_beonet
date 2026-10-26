import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Search,
  Filter,
  RefreshCw,
  Send,
  PlusCircle,
  Copy,
  Check,
  Shield,
  Layers,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';

export default function AdminPinsTab() {
  const [pins, setPins] = useState([]);
  const [pinPage, setPinPage] = useState(1);
  const [pinPageSize, setPinPageSize] = useState(10);
  const [transferPage, setTransferPage] = useState(1);
  const [transferPageSize, setTransferPageSize] = useState(10);
  const [packages, setPackages] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ total_pins: 0, active_pins: 0, used_pins: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('pins'); // pins, transfers, generate
  const [copiedCode, setCopiedCode] = useState(null);
  const [notification, setNotification] = useState('');

  // Generate PIN Form State
  const [genPackageId, setGenPackageId] = useState('');
  const [genOwnerId, setGenOwnerId] = useState('');
  const [genCount, setGenCount] = useState(1);
  const [genLoading, setGenLoading] = useState(false);

  const fetchPins = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/pins', { params });
      if (res.data?.data) {
        setPins(res.data.data);
      }
      if (res.data?.packages) {
        setPackages(res.data.packages);
        if (!genPackageId && res.data.packages.length > 0) {
          setGenPackageId(res.data.packages[0].id);
        }
      }
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load pins:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransfers = async () => {
    try {
      const res = await api.get('/admin/pin-transfers');
      if (res.data?.data) {
        setTransfers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pin transfers:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data?.data) {
        setUsers(res.data.data);
        if (!genOwnerId && res.data.data.length > 0) {
          setGenOwnerId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load users for pin generation:', err);
    }
  };

  useEffect(() => {
    setPinPage(1);
    fetchPins();
    fetchTransfers();
    fetchUsers();
  }, [statusFilter]);

  const totalPinPages = Math.ceil(pins.length / pinPageSize) || 1;
  const paginatedPins = pins.slice((pinPage - 1) * pinPageSize, pinPage * pinPageSize);

  const totalTransferPages = Math.ceil(transfers.length / transferPageSize) || 1;
  const paginatedTransfers = transfers.slice((transferPage - 1) * transferPageSize, transferPage * transferPageSize);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenLoading(true);
    try {
      const res = await api.post('/admin/pins/generate', {
        package_id: genPackageId,
        owner_id: genOwnerId,
        count: parseInt(genCount) || 1,
      });
      setNotification(res.data?.message || 'Serial PIN berhasil digenerate');
      fetchPins();
      setActiveSubTab('pins');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal men-generate PIN');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Manajemen Stokis &amp; Serial PIN Lisensi
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Hak Usaha
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master registrasi serial PIN aktivasi Hak Usaha (Silver/Gold), log transfer antar downline, dan pencetakan PIN baru
          </p>
        </div>

        <button
          onClick={() => {
            fetchPins();
            fetchTransfers();
          }}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh PIN</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* 2. KPI Banner Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="dash-card p-4 bg-white border-l-4 border-l-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Serial PIN</div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">{metrics.total_pins}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tercatat di sistem</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">PIN Aktif (Siap Pakai)</div>
          <div className="text-2xl font-heading font-extrabold text-emerald-800 mt-1">{metrics.active_pins}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Tersedia di dompet mitra</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-sky-600">
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">PIN Terpakai (Aktivasi)</div>
          <div className="text-2xl font-heading font-extrabold text-sky-800 mt-1">{metrics.used_pins}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Sudah digunakan aktivasi HU</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-amber-600">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Riwayat Transfer</div>
          <div className="text-2xl font-heading font-extrabold text-amber-800 mt-1">{transfers.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Log perpindahan kepemilikan</div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('pins')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'pins'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound size={14} />
          <span>Master Daftar Serial PIN ({pins.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'transfers'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send size={14} />
          <span>Log Mutasi Transfer Antar Mitra ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('generate')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
            activeSubTab === 'generate'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle size={14} />
          <span>Generate Serial PIN Baru</span>
        </button>
      </div>

      {/* 4. Tab 1: Master Daftar Serial PIN */}
      {activeSubTab === 'pins' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="dash-card p-4 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari serial code atau username pemilik..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPinPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchPins();
                }}
                className="dash-input pl-10 text-xs py-2 w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <ExportButtons
                filename="Master_PIN_Bionet"
                title="MASTER INVENTORI SERIAL PIN BIONET"
                subtitle="Daftar seluruh serial code hak usaha, status lisensi, dan pemilik"
                headers={['SERIAL CODE', 'PAKET HU', 'PEMILIK', 'STATUS', 'DIGUNAKAN OLEH', 'TANGGAL BUAT']}
                rows={pins.map((p) => [
                  p.serial_code,
                  p.package?.name || 'Paket Standar',
                  p.owner?.username ? `@${p.owner.username} (${p.owner.full_name || ''})` : '-',
                  p.status?.toUpperCase(),
                  p.used_by?.username ? `@${p.used_by.username}` : '-',
                  formatExportDate(p.created_at),
                ])}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="dash-input text-xs py-1.5 px-3 w-auto"
              >
                <option value="">Semua Status PIN</option>
                <option value="active">Aktif (Tersedia)</option>
                <option value="used">Terpakai</option>
                <option value="transferred">Ditransfer</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse dash-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Serial Code</th>
                    <th className="py-3 px-4">Paket Hak Usaha</th>
                    <th className="py-3 px-4">Pemilik Saat Ini</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Digunakan Oleh</th>
                    <th className="py-3 px-4">Tanggal Buat</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && pins.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">
                        <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                        <span>Memuat data serial PIN...</span>
                      </td>
                    </tr>
                  ) : pins.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400">
                        Belum ada serial PIN yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    paginatedPins.map((p) => {
                      const isActive = p.status === 'active';

                      return (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          {/* Serial Code */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {p.serial_code}
                              </span>
                              <button
                                onClick={() => handleCopy(p.serial_code)}
                                title="Copy Serial Code"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              >
                                {copiedCode === p.serial_code ? (
                                  <Check size={12} className="text-emerald-600" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Package */}
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">
                              {p.package?.name || 'Paket Hak Usaha'}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Rp {(p.package?.price || 0).toLocaleString('id-ID')}
                            </div>
                          </td>

                          {/* Owner */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{p.owner?.full_name || '-'}</div>
                            <div className="text-[10px] text-slate-400">@{p.owner?.username || '-'}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              {p.status?.toUpperCase()}
                            </span>
                          </td>

                          {/* Used By */}
                          <td className="py-3 px-4 text-slate-600">
                            {p.used_by ? `@${p.used_by.username}` : '-'}
                          </td>

                          {/* Created At */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(p.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <DashPagination
              currentPage={pinPage}
              totalPages={totalPinPages}
              totalItems={pins.length}
              pageSize={pinPageSize}
              onPageChange={setPinPage}
              onPageSizeChange={setPinPageSize}
            />
          </div>
        </div>
      )}

      {/* 5. Tab 2: Log Mutasi Transfer Antar Mitra */}
      {activeSubTab === 'transfers' && (
        <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse dash-table">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Waktu Transfer</th>
                  <th className="py-3 px-4">Serial PIN &amp; Paket</th>
                  <th className="py-3 px-4">Dari Mitra (Pengirim)</th>
                  <th className="py-3 px-4">Ke Mitra (Penerima)</th>
                  <th className="py-3 px-4 text-center">Status Mutasi</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-slate-400">
                      Belum ada riwayat transfer PIN antar mitra.
                    </td>
                  </tr>
                ) : (
                  paginatedTransfers.map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(t.transferred_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800">{t.pin?.serial_code}</div>
                        <div className="text-[10px] text-slate-400">{t.pin?.package?.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.from_user?.full_name}</div>
                        <div className="text-[10px] text-slate-400">@{t.from_user?.username}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.to_user?.full_name}</div>
                        <div className="text-[10px] text-slate-400">@{t.to_user?.username}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          BERHASIL DITERIMA
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <DashPagination
            currentPage={transferPage}
            totalPages={totalTransferPages}
            totalItems={transfers.length}
            pageSize={transferPageSize}
            onPageChange={setTransferPage}
            onPageSizeChange={setTransferPageSize}
          />
        </div>
      )}

      {/* 6. Tab 3: Generate Serial PIN Baru */}
      {activeSubTab === 'generate' && (
        <div className="dash-card p-6 bg-white max-w-2xl mx-auto border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-heading font-extrabold text-lg text-slate-900">
              Pencetakan Serial PIN Hak Usaha (Admin)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate serial PIN unik untuk langsung dialokasikan ke akun Mitra atau dipegang sebagai stok pusat
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Pilih Paket Hak Usaha:
              </label>
              <select
                value={genPackageId}
                onChange={(e) => setGenPackageId(e.target.value)}
                className="dash-input text-xs w-full py-2"
                required
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name} — Rp {pkg.price.toLocaleString('id-ID')} (Bonus Sponsor: Rp{' '}
                    {pkg.sponsor_bonus?.toLocaleString('id-ID')} | Pairing: Rp{' '}
                    {pkg.pairing_bonus?.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Alokasikan ke Pengguna (Pemilik PIN):
              </label>
              <select
                value={genOwnerId}
                onChange={(e) => setGenOwnerId(e.target.value)}
                className="dash-input text-xs w-full py-2"
                required
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} (@{u.username}) [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Jumlah PIN yang Digenerate (1 - 50):
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={genCount}
                onChange={(e) => setGenCount(e.target.value)}
                className="dash-input text-xs w-full py-2"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={genLoading}
                className="w-full py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {genLoading && <RefreshCw size={14} className="animate-spin" />}
                <Sparkles size={14} />
                <span>Generate &amp; Terbitkan Serial PIN</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
