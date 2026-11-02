import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Coins,
  Sparkles,
  Layers,
  ShoppingBag,
  RefreshCw,
  Info,
  X,
  ShieldCheck,
  Check,
  Tag,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import ExportButtons from '../dashlite/ExportButtons';

export default function AdminPackagesTab() {
  const [packages, setPackages] = useState([]);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    total_packages: 0,
    active_packages: 0,
    total_pins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSponsorBonus, setFormSponsorBonus] = useState('');
  const [formPairingBonus, setFormPairingBonus] = useState('');
  const [formPoints, setFormPoints] = useState(1);
  const [formProductQuota, setFormProductQuota] = useState(1);
  const [formSelectionRule, setFormSelectionRule] = useState('free_choice'); // 'free_choice' or 'fixed_bundle'
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formBundleItems, setFormBundleItems] = useState([]); // [{ product_id, quantity }]

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/packages');
      if (res.data?.data) {
        setPackages(res.data.data);
      }
      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
      setErrorBanner(err.response?.data?.message || 'Gagal memuat katalog paket kemitraan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/admin/products');
      if (res.data?.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load products for bundle config:', err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setFormName('');
    setFormPrice('500000');
    setFormSponsorBonus('200000');
    setFormPairingBonus('60000');
    setFormPoints(3);
    setFormProductQuota(3);
    setFormSelectionRule('free_choice');
    setFormDescription('Paket kemitraan resmi SYNETIQ dengan hak usaha dan jatah produk herbal pilihan.');
    setFormIsActive(true);
    setFormBundleItems([]);
    setErrorBanner('');
    setModalOpen(true);
  };

  const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setFormName(pkg.name || '');
    setFormPrice(pkg.price || '');
    setFormSponsorBonus(pkg.sponsor_bonus || '');
    setFormPairingBonus(pkg.pairing_bonus || '');
    setFormPoints(pkg.points !== undefined ? pkg.points : 1);
    setFormProductQuota(pkg.product_quota !== undefined ? pkg.product_quota : 1);
    setFormSelectionRule(pkg.selection_rule || 'free_choice');
    setFormDescription(pkg.description || '');
    setFormIsActive(pkg.is_active !== undefined ? pkg.is_active : true);

    if (pkg.items && Array.isArray(pkg.items)) {
      setFormBundleItems(
        pkg.items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity || 1,
        }))
      );
    } else {
      setFormBundleItems([]);
    }

    setErrorBanner('');
    setModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    if (!formName.trim()) {
      setErrorBanner('Nama paket kemitraan wajib diisi');
      return;
    }
    if (!formPrice || parseFloat(formPrice) <= 0) {
      setErrorBanner('Harga paket kemitraan harus lebih dari Rp 0');
      return;
    }

    const payload = {
      name: formName.trim(),
      price: parseFloat(formPrice),
      sponsor_bonus: parseFloat(formSponsorBonus) || 0,
      pairing_bonus: parseFloat(formPairingBonus) || 0,
      points: parseFloat(formPoints) || 1,
      product_quota: parseInt(formProductQuota) || 1,
      selection_rule: formSelectionRule,
      description: formDescription.trim(),
      is_active: formIsActive,
      items: formSelectionRule === 'fixed_bundle' ? formBundleItems : [],
    };

    setSaving(true);
    try {
      if (editingPackage) {
        const res = await api.put(`/admin/packages/${editingPackage.id}`, payload);
        setNotification(res.data?.message || 'Paket kemitraan berhasil diperbarui');
      } else {
        const res = await api.post('/admin/packages', payload);
        setNotification(res.data?.message || 'Paket kemitraan baru berhasil dibuat');
      }
      setModalOpen(false);
      fetchPackages();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Save package error:', err);
      setErrorBanner(err.response?.data?.message || 'Gagal menyimpan paket kemitraan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePackage = async (pkg) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus/menonaktifkan paket "${pkg.name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/admin/packages/${pkg.id}`);
      setNotification(res.data?.message || 'Paket kemitraan berhasil diproses');
      fetchPackages();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus paket kemitraan');
    }
  };

  const exportColumns = [
    { key: 'name', label: 'Nama Paket' },
    { key: 'price', label: 'Harga (Rp)' },
    { key: 'sponsor_bonus', label: 'Bonus Sponsor (Rp)' },
    { key: 'pairing_bonus', label: 'Bonus Pasangan (Rp)' },
    { key: 'points', label: 'Poin PV' },
    { key: 'product_quota', label: 'Jatah Produk' },
    { key: 'selection_rule', label: 'Aturan Produk' },
    { key: 'is_active', label: 'Status Aktif', render: (val) => (val ? 'Aktif' : 'Nonaktif') },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Master Paket Join Kemitraan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
              Hak Usaha (HU)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi paket registrasi mitra baru (e.g. Paket Gold 500rb, 3 Poin Binary, Bonus Sponsor Rp 200.000 &amp; Jatah 3 Produk Herbal).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            <PlusCircle className="w-4 h-4" />
            Buat Paket Baru
          </button>
        </div>
      </div>

      {/* 2. Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* 3. Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Paket Kemitraan</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {summary.total_packages || packages.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Paket Aktif Ditawarkan</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {summary.active_packages}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Serial PIN Terkait</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">
              {summary.total_pins}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Packages Interactive Table & Cards */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-sm">Daftar Paket Hak Usaha Kemitraan</span>
            <span className="text-xs text-slate-400">({packages.length} paket)</span>
          </div>

          <ExportButtons
            data={packages}
            columns={exportColumns}
            filename="master-paket-kemitraan-synetiq"
            title="Master Paket Join Kemitraan SYNETIQ"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <div className="text-xs text-slate-500 font-medium">Memuat master paket kemitraan...</div>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">Belum Ada Paket Kemitraan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Buat paket join pertama Anda (misalnya Paket Silver Rp 250.000 atau Paket Gold Rp 500.000).
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Buat Paket Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Paket &amp; Deskripsi</th>
                  <th className="py-3 px-4">Biaya Join (Rp)</th>
                  <th className="py-3 px-4">Poin Binary (PV)</th>
                  <th className="py-3 px-4">Bonus Sponsor</th>
                  <th className="py-3 px-4">Jatah Produk Herbal</th>
                  <th className="py-3 px-4">Serial PIN (Aktif/Pakai)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{pkg.name}</div>
                      <div className="text-[11px] text-slate-400 max-w-xs line-clamp-1 mt-0.5">
                        {pkg.description || 'Tidak ada keterangan khusus'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {formatRupiah(pkg.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        {pkg.points} PV
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-emerald-600 text-xs">
                        {formatRupiah(pkg.sponsor_bonus)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pairing: {formatRupiah(pkg.pairing_bonus || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{pkg.product_quota || 1} Item Produk</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 capitalize">
                        {pkg.selection_rule === 'free_choice'
                          ? '✨ Bebas Pilih Produk'
                          : '📦 Paket Bundel Tetap'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {pkg.active_pins_count || 0} aktif
                        </span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-500">
                          {pkg.used_pins_count || 0} terpakai
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {pkg.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Diarsipkan
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit Paket"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus / Nonaktifkan Paket"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Quick Creation / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-slate-900">
                    {editingPackage ? 'Edit Paket Kemitraan' : 'Buat Paket Kemitraan Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tentukan biaya join, PV binary, komisi sponsor &amp; kuota produk herbal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSavePackage} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Paket Kemitraan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Paket Gold (3 HU)"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Price & PV Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Biaya Registrasi Paket (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="500000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Poin Volume Binary (PV) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      required
                      placeholder="3"
                      value={formPoints}
                      onChange={(e) => setFormPoints(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-blue-700"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      PV
                    </span>
                  </div>
                </div>
              </div>

              {/* Sponsor & Pairing Bonus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bonus Direct Sponsor (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      required
                      placeholder="200000"
                      value={formSponsorBonus}
                      onChange={(e) => setFormSponsorBonus(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-600"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ditransfer langsung ke saldo wallet sponsor
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Satuan Bonus Pasangan (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="60000"
                      value={formPairingBonus}
                      onChange={(e) => setFormPairingBonus(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Product Quota & Selection Rule */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950">
                    Jatah Produk Herbal Saat Registrasi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jumlah Item Produk (Quota) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        placeholder="3"
                        value={formProductQuota}
                        onChange={(e) => setFormProductQuota(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800 bg-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        item
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Aturan Pemilihan Produk
                    </label>
                    <select
                      value={formSelectionRule}
                      onChange={(e) => setFormSelectionRule(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                    >
                      <option value="free_choice">Bebas Pilih dari Katalog (Free Choice)</option>
                      <option value="fixed_bundle">Bundel Paket Tetap (Fixed Bundle)</option>
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  {formSelectionRule === 'free_choice'
                    ? `Mitra downline dapat memilih bebas ${formProductQuota || 1} produk herbal dari seluruh katalog aktif saat pendaftaran.`
                    : `Mitra downline akan otomatis mendapatkan paket produk herbal sesuai kombinasi tetap.`}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi &amp; Keunggulan Paket
                </label>
                <textarea
                  rows="2"
                  placeholder="Jelaskan keistimewaan paket join ini untuk mitra..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* IsActive Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Status Penawaran Paket</div>
                  <div className="text-[11px] text-slate-500">
                    Aktifkan agar paket ini dapat digenerate menjadi serial PIN aktivasi
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {editingPackage ? 'Simpan Perubahan' : 'Buat Paket Kemitraan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
