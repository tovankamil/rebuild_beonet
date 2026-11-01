import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  FileText,
  Image as ImageIcon,
  RefreshCw,
  LayoutGrid,
  List,
  ShieldCheck,
  Scale,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';

export default function AdminProductsTab() {
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    active_products: 0,
    low_stock: 0,
    out_of_stock: 0,
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Tetes Herbal');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formBpomNumber, setFormBpomNumber] = useState('');
  const [formWeightGram, setFormWeightGram] = useState(250);
  const [formPrice, setFormPrice] = useState('');
  const [formCogs, setFormCogs] = useState('');
  const [formStock, setFormStock] = useState(50);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const predefinedCategories = [
    'Tetes Herbal',
    'Madu Alami',
    'Kapsul',
    'Perawatan Bio-Energi',
    'Lainnya',
  ];

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchProducts = async () => {
    setLoading(true);
    setErrorBanner('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/admin/products', { params });
      if (res.data?.data) {
        setProducts(res.data.data);
      }
      if (res.data?.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setErrorBanner(err.response?.data?.message || 'Gagal memuat katalog produk herbal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    setCurrentPage(1);
  }, [selectedCategory, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
    setCurrentPage(1);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Tetes Herbal');
    setFormCustomCategory('');
    setFormBpomNumber('');
    setFormWeightGram(250);
    setFormPrice('');
    setFormCogs('');
    setFormStock(50);
    setFormImageUrl('');
    setFormDescription('');
    setFormIsActive(true);
    setErrorBanner('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name || '');
    if (predefinedCategories.includes(product.category)) {
      setFormCategory(product.category || 'Tetes Herbal');
      setFormCustomCategory('');
    } else {
      setFormCategory('Lainnya');
      setFormCustomCategory(product.category || '');
    }
    setFormBpomNumber(product.bpom_number || '');
    setFormWeightGram(product.weight_gram || 250);
    setFormPrice(product.price || '');
    setFormCogs(product.cogs || '');
    setFormStock(product.stock !== undefined ? product.stock : 0);
    setFormImageUrl(product.image_url || '');
    setFormDescription(product.description || '');
    setFormIsActive(product.is_active !== undefined ? product.is_active : true);
    setErrorBanner('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/admin/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.url) {
        setFormImageUrl(res.data.url);
        setNotification('Foto produk berhasil diunggah!');
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert(err.response?.data?.message || 'Gagal mengunggah gambar produk');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setErrorBanner('');

    if (!formName.trim()) {
      setErrorBanner('Nama produk herbal wajib diisi');
      return;
    }
    if (!formPrice || parseFloat(formPrice) <= 0) {
      setErrorBanner('Harga eceran produk harus lebih dari Rp 0');
      return;
    }

    const resolvedCategory =
      formCategory === 'Lainnya' ? formCustomCategory.trim() || 'Herbal' : formCategory;

    const payload = {
      name: formName.trim(),
      category: resolvedCategory,
      bpom_number: formBpomNumber.trim(),
      weight_gram: parseInt(formWeightGram) || 250,
      price: parseFloat(formPrice),
      cogs: parseFloat(formCogs) || 0,
      stock: parseInt(formStock) || 0,
      image_url: formImageUrl.trim(),
      description: formDescription.trim(),
      is_active: formIsActive,
    };

    setSaving(true);
    try {
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct.id}`, payload);
        setNotification(res.data?.message || 'Produk herbal berhasil diperbarui');
      } else {
        const res = await api.post('/admin/products', payload);
        setNotification(res.data?.message || 'Produk herbal baru berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Save product error:', err);
      setErrorBanner(err.response?.data?.message || 'Gagal menyimpan data produk herbal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus/menonaktifkan produk "${product.name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await api.delete(`/admin/products/${product.id}`);
      setNotification(res.data?.message || 'Produk herbal berhasil diproses');
      fetchProducts();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus produk herbal');
    }
  };

  // Stock Badge Render Helper
  const renderStockBadge = (stock) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" /> Habis (0)
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Menipis ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aman ({stock})
      </span>
    );
  };

  // Pagination slicing
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Prepare Export Data
  const exportColumns = [
    { key: 'name', label: 'Nama Produk' },
    { key: 'category', label: 'Kategori' },
    { key: 'bpom_number', label: 'No. BPOM RI' },
    { key: 'weight_gram', label: 'Berat (g)' },
    { key: 'price', label: 'Harga Retail (Rp)' },
    { key: 'cogs', label: 'HPP (Rp)' },
    { key: 'stock', label: 'Stok Fisik' },
    { key: 'is_active', label: 'Status Aktif', render: (val) => (val ? 'Aktif' : 'Nonaktif') },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Master Katalog Produk Herbal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
              BPOM RI Resmikan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen inventori produk herbal, nomor registrasi BPOM, harga retail, HPP, serta jatah paket kemitraan & repeat order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
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
            Tambah Produk Baru
          </button>
        </div>
      </div>

      {/* 2. Notification Toast Banner */}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Total Katalog Produk</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">
              {summary.total_products || products.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Produk Aktif Terbit</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">
              {summary.active_products}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Stok Menipis (&lt; 10)</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">
              {summary.low_stock}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500">Stok Kosong / Habis</div>
            <div className="text-xl font-bold text-rose-600 mt-0.5">
              {summary.out_of_stock}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk herbal, izin BPOM, kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors shrink-0"
            >
              Cari
            </button>
          </form>

          {/* Filters & View Switches */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="Tetes Herbal">Tetes Herbal</option>
                <option value="Madu Alami">Madu Alami</option>
                <option value="Kapsul">Kapsul</option>
                <option value="Perawatan Bio-Energi">Perawatan Bio-Energi</option>
              </select>
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Export Buttons */}
            <ExportButtons
              data={products}
              columns={exportColumns}
              filename="katalog-produk-herbal-bionet"
              title="Katalog Produk Herbal Bionet"
            />
          </div>
        </div>
      </div>

      {/* 5. Products Content: Table or Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <div className="text-xs text-slate-500 font-medium">Memuat katalog produk herbal...</div>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">Tidak Ada Produk Herbal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Belum ada produk herbal yang sesuai dengan kriteria pencarian atau filter yang Anda pilih.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Tambah Produk Sekarang
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Produk Herbal</th>
                  <th className="py-3 px-4">Kategori &amp; BPOM</th>
                  <th className="py-3 px-4">Harga Retail (HPP)</th>
                  <th className="py-3 px-4">Stok Fisik</th>
                  <th className="py-3 px-4">Berat</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '';
                              }}
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {p.description || 'Tidak ada deskripsi'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{p.category || 'Herbal'}</div>
                      <div className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5 font-mono">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {p.bpom_number || 'Belum Terdaftar'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{formatRupiah(p.price)}</div>
                      <div className="text-[10px] text-slate-400">
                        HPP: {formatRupiah(p.cogs || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-4">{renderStockBadge(p.stock)}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.weight_gram || 250} gr
                    </td>
                    <td className="py-3 px-4">
                      {p.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus/Arsipkan Produk"
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
          <div className="p-3 border-t border-slate-100">
            <DashPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={products.length}
            />
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:border-emerald-300 transition-all hover:shadow-md"
              >
                {/* Image header */}
                <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    <ShoppingBag className="w-12 h-12 text-slate-300" />
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs border border-slate-200/80">
                      {p.category || 'Herbal'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    {renderStockBadge(p.stock)}
                  </div>
                </div>

                {/* Body details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description || 'Tidak ada deskripsi rinci untuk produk herbal ini.'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">BPOM:</span>
                      <span className="font-mono text-emerald-700 text-[11px] font-medium">
                        {p.bpom_number || 'Dalam Proses'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Berat:</span>
                      <span className="font-medium text-slate-700 text-[11px]">
                        {p.weight_gram || 250} gram
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Harga Retail:</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        {formatRupiah(p.price)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span
                      className={`text-[10px] font-bold ${
                        p.is_active ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {p.is_active ? '● Aktif Dijual' : '○ Nonaktif'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors text-xs inline-flex items-center gap-1 font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm">
            <DashPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={products.length}
            />
          </div>
        </div>
      )}

      {/* 6. Modal Tambah / Edit Produk Herbal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base text-slate-900">
                    {editingProduct ? 'Edit Data Produk Herbal' : 'Tambah Produk Herbal Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lengkapi spesifikasi BPOM, kategori herbal, harga retail, dan stok fisik
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

            {/* Modal Error Banner */}
            {errorBanner && (
              <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Produk Herbal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bionet Bio-Herbal Drops 30ml"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Produk Herbal
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tetes Herbal">Tetes Herbal (Drops)</option>
                    <option value="Madu Alami">Madu Alami (Propolis Pure)</option>
                    <option value="Kapsul">Kapsul Ekstrak Bio</option>
                    <option value="Perawatan Bio-Energi">Perawatan Bio-Energi</option>
                    <option value="Lainnya">Kategori Lainnya (Custom)</option>
                  </select>
                  {formCategory === 'Lainnya' && (
                    <input
                      type="text"
                      placeholder="Masukkan nama kategori baru..."
                      value={formCustomCategory}
                      onChange={(e) => setFormCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Berat Produk (Gram)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      placeholder="250"
                      value={formWeightGram}
                      onChange={(e) => setFormWeightGram(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      gram
                    </span>
                  </div>
                </div>
              </div>

              {/* BPOM RI & Physical Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Izin Edar BPOM RI
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: POM TR 226012341"
                    value={formBpomNumber}
                    onChange={(e) => setFormBpomNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Format: POM TR (Obat Tradisional) / POM NA (Kosmetik)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stok Fisik di Gudang Pusat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Price & COGS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Eceran / Retail Konsumen (Rp) <span className="text-rose-500">*</span>
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
                      placeholder="150000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    HPP / Modal Produksi COGS (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="85000"
                      value={formCogs}
                      onChange={(e) => setFormCogs(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Digunakan untuk audit margin laba perusahaan
                  </p>
                </div>
              </div>

              {/* Upload Foto Produk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Foto Produk Herbal &amp; Kemasan
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                    {formImageUrl ? (
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        {uploadingImage ? 'Mengunggah...' : 'Pilih File Gambar'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormImageUrl('')}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar eksternal di sini..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi Khasiat &amp; Manfaat Produk
                </label>
                <textarea
                  rows="3"
                  placeholder="Jelaskan kandungan bahan alami, indikasi khasiat herbal, petunjuk pemakaian..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* IsActive Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Status Publikasi Produk</div>
                  <div className="text-[11px] text-slate-500">
                    Aktifkan agar produk dapat dipilih pada paket join &amp; repeat order mitra
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

              {/* Modal Buttons */}
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
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {editingProduct ? 'Simpan Perubahan' : 'Terbitkan Produk'}
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
