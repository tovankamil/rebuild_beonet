import React, { useState, useEffect } from 'react';
import { ShoppingBag, RefreshCw, Sparkles, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import api from '../services/api';
import DashPagination from './dashlite/DashPagination';

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [fetching, setFetching] = useState(true);
  const [orderedItem, setOrderedItem] = useState(null);

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const fetchProducts = async () => {
    setFetching(true);
    try {
      const res = await api.get('/products');
      if (res.data?.data) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOrderSimulate = (prod) => {
    setOrderedItem(prod);
    setTimeout(() => setOrderedItem(null), 3500);
  };

  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag size={24} className="text-emerald-600" />
            <span>Katalog Produk Herbal & Repeat Order (RO)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Produk kesehatan alami dan bio-energi eksklusif untuk konsumsi pribadi dan omset poin kemitraan
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={fetching}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto"
          title="Segarkan Katalog"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin text-emerald-600' : ''} />
        </button>
      </div>

      {orderedItem && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
          <div>
            <strong>Pesanan RO Berhasil Dibuat!</strong> Permintaan untuk{' '}
            <span className="font-bold underline">{orderedItem.name}</span> berhasil diteruskan ke stokis terdekat untuk proses pengiriman.
          </div>
        </div>
      )}

      {/* Product Cards Grid */}
      {fetching ? (
        <div className="text-center py-24 text-slate-400">
          <RefreshCw size={28} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs">Memuat katalog produk herbal...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
            <div
              key={p.id}
              className="dash-card overflow-hidden flex flex-col justify-between group hover:border-emerald-300 transition-all"
            >
              <div>
                {/* Image Placeholder with Herbal Backdrop */}
                <div className="h-44 bg-gradient-to-tr from-emerald-100/60 via-teal-50 to-slate-100 flex items-center justify-center border-b border-slate-100 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <Sparkles size={32} />
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-emerald-700 shadow-sm border border-emerald-100 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>BPOM Certified</span>
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="overline-title text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                      Suplemen Herbal
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      Stok: {p.stock} pcs
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base text-slate-900 mb-2 leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {p.description || 'Ekstrak herbal alami berkualitas tinggi untuk stamina, detoksifikasi, dan pemulihan sel tubuh.'}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Harga Mitra</span>
                    <span className="font-heading font-extrabold text-xl text-slate-900">
                      {formatRupiah(p.price)}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    +1 PV
                  </span>
                </div>

                <button
                  onClick={() => handleOrderSimulate(p)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag size={15} />
                  <span>Pesan Repeat Order (RO)</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Catalog Pagination */}
        <div className="dash-card p-0 overflow-hidden bg-white shadow-xs">
          <DashPagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={products.length}
            pageSize={pageSize}
            pageSizeOptions={[4, 8, 12, 24, 48]}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
      )}
    </div>
  );
}
