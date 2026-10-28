import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Copy,
  Check,
  Package,
  UserPlus,
} from 'lucide-react';
import api from '../services/api';
import DashPagination from './dashlite/DashPagination';
import ExportButtons from './dashlite/ExportButtons';
import RegisterDownlineModal from './RegisterDownlineModal';
import { formatExportDate } from '../utils/exportUtils';

export default function PinTab() {
  const [pins, setPins] = useState([]);
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPinId, setSelectedPinId] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedPinForReg, setSelectedPinForReg] = useState('');

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      const [pinsRes, pkgsRes] = await Promise.all([
        api.get('/pins/my-pins'),
        api.get('/pins/packages'),
      ]);
      if (pinsRes.data?.data) setPins(pinsRes.data.data);
      if (pkgsRes.data?.data) setPackages(pkgsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!selectedPinId || !targetUsername) {
      setErrorMsg('Pilih serial PIN dan masukkan username mitra tujuan.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/pins/transfer', {
        pin_id: selectedPinId,
        target_username: targetUsername,
      });

      if (res.data) {
        setSuccessMsg(`Serial PIN berhasil ditransfer ke mitra @${targetUsername}!`);
        setSelectedPinId('');
        setTargetUsername('');
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mentransfer PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const activePins = pins.filter((p) => p.status === 'active');
  const totalPages = Math.ceil(pins.length / pageSize) || 1;
  const paginatedPins = pins.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound size={24} className="text-emerald-600" />
            <span>Inventori PIN Lisensi & Stokis Kemitraan</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen serial aktivasi hak usaha (HU) untuk pendaftaran downline baru
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={fetching}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Segarkan Data PIN"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-emerald-600' : ''} />
        </button>
      </div>

      {/* Package Showcase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="dash-card p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="overline-title text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  {pkg.points === 0 ? 'Promo Eksklusif' : 'Paket Kemitraan'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  pkg.points === 0
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {pkg.points === 0 ? 'FREE (0 PV)' : `${pkg.points} PV`}
                </span>
              </div>
              <h4 className="font-heading font-extrabold text-base text-slate-900 mb-1">
                {pkg.name}
              </h4>
              <div className="font-heading font-extrabold text-xl text-emerald-600 mb-4">
                {pkg.price === 0 ? 'GRATIS (Rp 0)' : formatRupiah(pkg.price)}
              </div>
              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bonus Sponsor:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(pkg.sponsor_bonus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bonus Pasangan:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(pkg.pairing_bonus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hak Usaha (HU):</span>
                  <span className="font-bold text-emerald-700">
                    {pkg.points === 0 ? 'Akun Uji Coba (0 HU)' : `${pkg.points} Titik Usaha`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transfer PIN Form & Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transfer Form (Col 5) */}
        <div className="lg:col-span-5 dash-card p-6">
          <div className="mb-4 pb-3 border-b border-slate-100">
            <h4 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
              <Send size={18} className="text-emerald-600" />
              <span>Transfer PIN ke Mitra Lain</span>
            </h4>
            <p className="text-xs text-slate-400">Kirim serial PIN aktivasi ke downline atau stokis</p>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Serial PIN Aktif
              </label>
              <select
                value={selectedPinId}
                onChange={(e) => setSelectedPinId(e.target.value)}
                className="dash-input text-xs"
                required
              >
                <option value="">-- Pilih PIN dari Inventori --</option>
                {activePins.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.serial_code || p.pin_code} ({p.package?.name || 'Paket'})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                PIN aktif siap transfer: {activePins.length} buah
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Mitra Penerima
              </label>
              <input
                type="text"
                placeholder="Contoh: mitra_sukses01"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                className="dash-input text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || activePins.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Send size={15} />
              <span>{loading ? 'Memproses Transfer...' : 'Kirim PIN Sekarang'}</span>
            </button>
          </form>
        </div>

        {/* PIN Inventory Table (Col 7) */}
        <div className="lg:col-span-7 dash-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h4 className="font-heading font-bold text-base text-slate-800">
                Inventori PIN Anda
              </h4>
              <p className="text-xs text-slate-400">Total {pins.length} serial lisensi</p>
            </div>
            <ExportButtons
              filename="Inventori_PIN_Mitra"
              title="INVENTORI SERIAL PIN MITRA BIONET"
              subtitle="Stok serial PIN aktif dan terpakai untuk aktivasi paket hak usaha"
              headers={['SERIAL CODE', 'PAKET HU', 'STATUS', 'TANGGAL']}
              rows={pins.map((p) => [
                p.serial_code || p.pin_code,
                p.package?.name || 'Paket Standar',
                p.status === 'active' ? 'AKTIF (TERSEDIA)' : 'TERPAKAI',
                formatExportDate(p.created_at, { includeTime: false }),
              ])}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse dash-table">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200">
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Kode Serial PIN
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Belum ada stok serial PIN. Hubungi admin untuk pembelian.
                    </td>
                  </tr>
                ) : (
                  paginatedPins.map((pin) => (
                    <tr key={pin.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {pin.serial_code || pin.pin_code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {pin.package?.name || 'Paket Silver'}
                      </td>
                      <td className="py-3 px-4">
                        {pin.status === 'active' ? (
                          <span className="badge-dot badge-dot-success text-[11px] text-emerald-700">
                            Aktif
                          </span>
                        ) : pin.status === 'used' ? (
                          <span className="badge-dot badge-dot-danger text-[11px] text-slate-400">
                            Terpakai
                          </span>
                        ) : (
                          <span className="badge-dot badge-dot-info text-[11px] text-cyan-700">
                            Ditransfer
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pin.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedPinForReg(pin.id);
                                setRegisterModalOpen(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded text-[11px] transition-colors flex items-center gap-1 shadow-xs"
                              title="Daftarkan Downline dengan PIN ini"
                            >
                              <UserPlus size={13} />
                              <span className="hidden sm:inline">Aktivasi</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyCode(pin.serial_code || pin.pin_code)}
                            className="p-1.5 rounded text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Salin Kode Serial"
                          >
                            {copiedCode === (pin.serial_code || pin.pin_code) ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <DashPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={pins.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      {/* Registration Downline Modal */}
      {registerModalOpen && (
        <RegisterDownlineModal
          isOpen={registerModalOpen}
          onClose={() => {
            setRegisterModalOpen(false);
            setSelectedPinForReg('');
          }}
          preselectedPinId={selectedPinForReg}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
}
