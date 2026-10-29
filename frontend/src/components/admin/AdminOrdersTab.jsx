import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  RefreshCw,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  CreditCard,
  Printer,
  QrCode,
  Barcode,
} from 'lucide-react';
import api from '../../services/api';
import DashPagination from '../dashlite/DashPagination';
import ExportButtons from '../dashlite/ExportButtons';
import { formatExportDate } from '../../utils/exportUtils';
import ModalPortal from '../common/ModalPortal';

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [metrics, setMetrics] = useState({ total_orders: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState('');

  // Selected Order for Detail Modal
  const [detailOrder, setDetailOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/admin/orders', { params });
      if (res.data?.data) {
        setOrders(res.data.data);
      }
      if (res.data?.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const totalPages = Math.ceil(orders.length / pageSize) || 1;
  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setNotification(`Status pesanan berhasil diperbarui ke: ${newStatus.toUpperCase()}`);
      if (detailOrder && detailOrder.id === orderId) {
        setDetailOrder((prev) => ({ ...prev, status: newStatus }));
      }
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
              Audit Pesanan E-Commerce RO (Repeat Order)
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
              Produk Herbal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit seluruh invoice transaksi repeat order herbal, alur verifikasi pembayaran, packing gudang, dan resi ekspedisi
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Pesanan</span>
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
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Invoice RO</div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
            {metrics.total_orders}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Seluruh pesanan platform</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-emerald-600">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Omset Penjualan</div>
          <div className="text-xl font-heading font-extrabold text-slate-900 mt-1">
            Rp {(metrics.total_revenue || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Penjualan produk non-batal</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-amber-500">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Sedang Diproses</div>
          <div className="text-2xl font-heading font-extrabold text-amber-800 mt-1">
            {orders.filter((o) => o.status === 'processing' || o.status === 'paid').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Menunggu resi / kirim</div>
        </div>

        <div className="dash-card p-4 bg-white border-l-4 border-l-sky-600">
          <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">Telah Selesai</div>
          <div className="text-2xl font-heading font-extrabold text-sky-800 mt-1">
            {orders.filter((o) => o.status === 'completed' || o.status === 'shipped').length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Terkirim / Diterima</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="dash-card p-4 bg-white flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor invoice, username, atau nama pemesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dash-input pl-10 text-xs py-2 w-full"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter size={14} />
            <span>Status:</span>
          </div>

          <div className="flex items-center gap-2">
            <ExportButtons
              filename="Pesanan_RO_Bionet"
              title="DAFTAR PESANAN REPEAT ORDER (RO) E-COMMERCE"
              subtitle="Laporan pemesanan produk herbal, status invoice & nomor resi ekspedisi"
              headers={['NO. INVOICE', 'USERNAME', 'PEMESAN', 'TOTAL (RP)', 'STATUS', 'TANGGAL']}
              rows={orders.map((o) => [
                o.order_number,
                o.user?.username || '-',
                o.user?.full_name || '-',
                o.total_amount,
                o.status?.toUpperCase(),
                formatExportDate(o.created_at),
              ])}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="dash-input text-xs py-1.5 px-3 w-auto"
            >
              <option value="">Semua Status</option>
              <option value="pending">Pending (Menunggu Pembayaran)</option>
              <option value="paid">Paid (Sudah Dibayar)</option>
              <option value="processing">Processing (Packing Gudang)</option>
              <option value="shipped">Shipped (Dalam Pengiriman)</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="cancelled">Cancelled (Dibatalkan)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Orders Table */}
      <div className="dash-card p-0 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse dash-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">No. Invoice RO</th>
                <th className="py-3 px-4">Mitra Pemesan</th>
                <th className="py-3 px-4">Rincian Produk</th>
                <th className="py-3 px-4">Total Belanja</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4">Tanggal Pesan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Memuat daftar pesanan...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    Tidak ditemukan data pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => {
                  const statusStyles = {
                    pending: 'bg-amber-50 text-amber-700 border-amber-200',
                    paid: 'bg-blue-50 text-blue-700 border-blue-200',
                    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
                    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[o.status] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                      {/* Invoice */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {o.order_number}
                        </span>
                      </td>

                      {/* User */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{o.user?.full_name || 'Mitra'}</div>
                        <div className="text-[10px] text-slate-400">@{o.user?.username || '-'}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {o.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-slate-700 text-[11px] truncate">
                              &bull; {item.product?.name || 'Produk'} <span className="font-bold">x{item.quantity}</span>
                            </div>
                          ))}
                          {o.items?.length > 2 && (
                            <div className="text-[10px] text-emerald-700 font-semibold">
                              +{o.items.length - 2} produk lainnya...
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          Rp {o.total_amount.toLocaleString('id-ID')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${statusStyles}`}>
                          {o.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(o.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setPrintOrder(o)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors inline-flex items-center gap-1 shadow-xs"
                          title="Cetak Label Pengiriman Thermal (100x150 mm)"
                        >
                          <Printer size={12} />
                          <span>Label Resi</span>
                        </button>
                        <button
                          onClick={() => setDetailOrder(o)}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Eye size={12} />
                          <span>Rincian</span>
                        </button>
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
          currentPage={page}
          totalPages={totalPages}
          totalItems={orders.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* 5. Order Detail & Status Override Modal */}
      {detailOrder && (
        <ModalPortal isOpen={!!detailOrder} onClose={() => setDetailOrder(null)} ariaLabel="Rincian Pesanan">
          <div
            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900">
                  Rincian Pesanan: {detailOrder.order_number}
                </h3>
                <p className="text-xs text-slate-400">
                  Dipesan oleh {detailOrder.user?.full_name} (@{detailOrder.user?.username})
                </p>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Product Items Breakdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Daftar Produk Pesanan:</label>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2">
                {detailOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">{item.product?.name || 'Produk Herbal'}</div>
                      <div className="text-slate-400 text-[10px]">
                        {item.quantity} unit @ Rp {item.price_at_time?.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-800">
                      Rp {(item.quantity * item.price_at_time).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between font-bold text-xs">
                <span>Total Tagihan:</span>
                <span className="text-emerald-700 font-mono text-sm">
                  Rp {detailOrder.total_amount.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Status Change Dropdown */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Ubah Status Pesanan (Admin Override):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['paid', 'processing', 'shipped', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(detailOrder.id, st)}
                    disabled={actionLoading || detailOrder.status === st}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold uppercase transition-all border ${detailOrder.status === st
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* 6. Thermal Shipping Label Modal (Standar Ekspedisi 100x150 mm) */}
      {printOrder && (
        <ModalPortal isOpen={!!printOrder} onClose={() => setPrintOrder(null)} ariaLabel="Cetak Label Resi Thermal">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cetak Label Resi Thermal (100x150 mm)
                </h3>
              </div>
              <button
                onClick={() => setPrintOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thermal Label 100x150 mm Preview Container */}
            <div
              id="printable-thermal-label"
              className="bg-white border-2 border-black p-4 font-mono text-black text-xs space-y-3 rounded-lg shadow-xs select-none"
              style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}
            >
              {/* Header: Logo & Courier */}
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div>
                  <div className="font-black text-base tracking-tighter">BIONET LOGISTICS</div>
                  <div className="text-[10px] font-sans font-bold text-slate-700">HERBAL E-COMMERCE 3PL</div>
                </div>
                <div className="text-right">
                  <div className="bg-black text-white px-2 py-0.5 font-black text-xs uppercase rounded">
                    J&amp;T EZ
                  </div>
                  <div className="text-[9px] font-bold mt-0.5">NON-COD</div>
                </div>
              </div>

              {/* Barcode & Tracking Number */}
              <div className="text-center py-1 border-b-2 border-black">
                {/* Visual Barcode bars */}
                <div className="h-10 flex items-center justify-center space-x-1 overflow-hidden my-1">
                  <div className="w-1 h-10 bg-black"></div>
                  <div className="w-2 h-10 bg-black"></div>
                  <div className="w-0.5 h-10 bg-black"></div>
                  <div className="w-1.5 h-10 bg-black"></div>
                  <div className="w-3 h-10 bg-black"></div>
                  <div className="w-0.5 h-10 bg-black"></div>
                  <div className="w-2 h-10 bg-black"></div>
                  <div className="w-1 h-10 bg-black"></div>
                  <div className="w-2.5 h-10 bg-black"></div>
                  <div className="w-1 h-10 bg-black"></div>
                  <div className="w-3 h-10 bg-black"></div>
                  <div className="w-1.5 h-10 bg-black"></div>
                  <div className="w-0.5 h-10 bg-black"></div>
                  <div className="w-2 h-10 bg-black"></div>
                  <div className="w-1 h-10 bg-black"></div>
                  <div className="w-2.5 h-10 bg-black"></div>
                  <div className="w-1.5 h-10 bg-black"></div>
                  <div className="w-3 h-10 bg-black"></div>
                  <div className="w-1 h-10 bg-black"></div>
                </div>
                <div className="font-bold text-sm tracking-wider">
                  BIO-EXP-{printOrder.order_number?.replace('#', '') || '992019'}
                </div>
              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 gap-2 text-[11px] border-b-2 border-black pb-2">
                <div>
                  <div className="font-bold uppercase text-[9px] text-slate-600">Penerima:</div>
                  <div className="font-bold text-xs">{printOrder.user?.full_name || 'Mitra Bionet'}</div>
                  <div className="text-[10px]">{printOrder.user?.phone || '0812-3456-7890'}</div>
                  <div className="text-[10px] mt-0.5 leading-tight">
                    Jl. Sukajadi No. 45, RT 02/05, Kel. Pasteur, Kec. Sukajadi, Kota Bandung, Jawa Barat (40161)
                  </div>
                </div>

                <div className="pt-1 border-t border-dashed border-black">
                  <div className="font-bold uppercase text-[9px] text-slate-600">Pengirim (Warehouse Pusat):</div>
                  <div className="font-bold text-[10px]">BIONET LOGISTICS CENTER</div>
                  <div className="text-[10px]">0821-8899-7711 | Gudang Herbal Bandung, Jawa Barat</div>
                </div>
              </div>

              {/* Package Content & Notes */}
              <div className="text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold">Berat Paket:</span>
                  <span>1.0 Kg (Koli: 1/1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Isi Barang:</span>
                  <span>Herbal Bio-Drops ({printOrder.items?.length || 1} macam)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Invoice RO:</span>
                  <span className="font-mono">{printOrder.order_number}</span>
                </div>
                <div className="p-1 bg-slate-100 rounded text-[9px] text-center font-bold border border-slate-300 mt-2">
                  ⚠️ PERHATIAN: FRAGILE / JANGAN DIBANTING / SIMPAN DI TEMPAT SEJUK
                </div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500">Standar Printer: Thermal 100x150 mm</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPrintOrder(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center space-x-1.5 shadow-sm"
                >
                  <Printer size={14} />
                  <span>Cetak Label Thermal</span>
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
