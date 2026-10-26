import React, { useState, useEffect } from 'react';
import {
  Building2,
  PackageCheck,
  AlertTriangle,
  Truck,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Boxes,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';

export default function WarehouseTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(5);
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(5);
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(25);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchWarehouseData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouse/overview');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const handleStockAdjustment = async (productId) => {
    if (!adjustAmount) return;
    setActionLoading(true);
    setNotification('');
    try {
      const res = await api.post(`/warehouse/products/${productId}/stock`, {
        adjustment: parseInt(adjustAmount, 10),
        notes: 'Restock via Portal Gudang',
      });
      setNotification(res.data?.message || 'Stok berhasil diperbarui');
      setAdjustingId(null);
      fetchWarehouseData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah stok');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOrder = async (orderId) => {
    setActionLoading(true);
    setNotification('');
    try {
      await api.patch(`/warehouse/orders/${orderId}/status`, {
        status: 'shipped',
      });
      setNotification('Pesanan berhasil ditandai sebagai TERKIRIM (Shipped)');
      fetchWarehouseData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status pengiriman');
    } finally {
      setActionLoading(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const productsList = data?.products || [];
  const totalProductPages = Math.ceil(productsList.length / productPageSize) || 1;
  const paginatedProducts = productsList.slice((productPage - 1) * productPageSize, productPage * productPageSize);

  const ordersList = data?.recent_orders || [];
  const totalOrderPages = Math.ceil(ordersList.length / orderPageSize) || 1;
  const paginatedOrders = ordersList.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw size={24} className="animate-spin text-emerald-600 mr-2" />
        <span className="text-sm font-medium">Memuat data logistik gudang...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Portal Logistik &amp; Manajemen Gudang
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
              Role: Tim Gudang &amp; Logistik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau ketersediaan stok produk herbal, restock inventori, dan pemenuhan pengiriman pesanan Repeat Order (RO)
          </p>
        </div>

        <button
          onClick={fetchWarehouseData}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stok</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-card p-5 bg-white border-l-4 border-l-sky-600">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">TOTAL FISIK STOK</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Boxes size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900">
            {data?.total_stock || 0} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total barang siap edar di gudang
          </p>
        </div>

        <div className="dash-card p-5 bg-white border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">STOK MENIPIS (&lt;20 PCS)</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-rose-700">
            {data?.low_stock_count || 0} Produk
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Perlu restock segera ke produsen
          </p>
        </div>

        <div className="dash-card p-5 bg-white border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">ANTREAN PACKING / KIRIM</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <PackageCheck size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-amber-700">
            {data?.pending_orders_count || 0} Pesanan
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Perlu dikemas &amp; diproses resi
          </p>
        </div>

        <div className="dash-card p-5 bg-white border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="overline-title text-[10px]">PESANAN SELESAI KIRIM</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Truck size={18} />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-heading text-slate-900">
            {data?.shipped_orders_count || 0} Pesanan
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Telah diserahkan ke kurir ekspedisi
          </p>
        </div>
      </div>

      {/* Two Column Layout: Stock Inventory & Order Fulfillment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Inventory List (7 Cols) */}
        <div className="lg:col-span-7 dash-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Inventori &amp; Penyesuaian Stok Herbal
              </h3>
              <p className="text-xs text-slate-400">
                Pencatatan fisik barang masuk &amp; update stok gudang
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse dash-table">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Produk Herbal</th>
                  <th className="py-2.5 px-3">Harga Mitra</th>
                  <th className="py-2.5 px-3">Stok Saat Ini</th>
                  <th className="py-2.5 px-3 text-right">Aksi Restock</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p) => {
                  const isLow = p.stock <= 20;
                  const isEditing = adjustingId === p.id;

                  return (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.description}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                          isLow
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {p.stock} pcs {isLow && '(Menipis)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              value={adjustAmount}
                              onChange={(e) => setAdjustAmount(e.target.value)}
                              className="dash-input w-16 py-1 px-1.5 text-xs text-center font-bold"
                              placeholder="+Qty"
                            />
                            <button
                              onClick={() => handleStockAdjustment(p.id)}
                              disabled={actionLoading}
                              className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setAdjustingId(null)}
                              className="px-1.5 py-1 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAdjustingId(p.id);
                              setAdjustAmount(50);
                            }}
                            className="px-2.5 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold border border-sky-200 text-[11px] transition-colors inline-flex items-center gap-1"
                          >
                            <Plus size={12} />
                            <span>Restock</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <DashPagination
            currentPage={productPage}
            totalPages={totalProductPages}
            totalItems={productsList.length}
            pageSize={productPageSize}
            onPageChange={setProductPage}
            onPageSizeChange={setProductPageSize}
          />
        </div>

        {/* Right: Orders Fulfillment (5 Cols) */}
        <div className="lg:col-span-5 dash-card p-5 bg-white">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                Pemrosesan Pesanan RO
              </h3>
              <p className="text-xs text-slate-400">
                Daftar pesanan mitra yang siap dikirim
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(!data?.recent_orders || data.recent_orders.length === 0) ? (
              <div className="text-center py-8 text-slate-400">
                <CheckCircle2 size={30} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-xs">Semua pesanan telah terkirim.</p>
              </div>
            ) : (
              paginatedOrders.map((ord) => {
                const isProcessing = ord.status === 'processing' || ord.status === 'paid' || ord.status === 'pending';

                return (
                  <div key={ord.id} className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {ord.order_number}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ord.status === 'shipped'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      Pemesan: <strong className="text-slate-900">{ord.user?.full_name || 'Mitra'}</strong> (@{ord.user?.username})
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Total: <strong className="text-emerald-700">{formatRupiah(ord.total_amount)}</strong>
                    </div>

                    {isProcessing && (
                      <div className="mt-3 pt-2 border-t border-slate-200 flex justify-end">
                        <button
                          onClick={() => handleShipOrder(ord.id)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Send size={13} />
                          <span>Tandai Terkirim (Resi)</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          <DashPagination
            currentPage={orderPage}
            totalPages={totalOrderPages}
            totalItems={ordersList.length}
            pageSize={orderPageSize}
            onPageChange={setOrderPage}
            onPageSizeChange={setOrderPageSize}
          />
        </div>
      </div>
    </div>
  );
}
