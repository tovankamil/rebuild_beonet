import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import StorefrontRenderer from './StorefrontRenderer';
import ModalPortal from '../common/ModalPortal';

export default function PublicStorefrontPage({ storeUsername, onGoToLogin }) {
  const searchParams = new URLSearchParams(window.location.search);
  const urlTpl = searchParams.get('tpl');

  const [shopName, setShopName] = useState('Toko Herbal Resmi Bionet');
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [customMarkup, setCustomMarkup] = useState(50000);
  const [activeTemplate, setActiveTemplate] = useState(() => urlTpl || localStorage.getItem('bionet_shop_template') || 'emerald');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [copied, setCopied] = useState(false);

  // Customer Checkout Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [courier, setCourier] = useState('J&T Express EZ');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    // If URL has tpl, prioritize it
    if (urlTpl) {
      setActiveTemplate(urlTpl);
    }

    // Load local stored preferences if available
    const savedName = localStorage.getItem('bionet_shop_name');
    const savedWa = localStorage.getItem('bionet_shop_wa');
    const savedMarkup = localStorage.getItem('bionet_shop_markup');
    const savedTemplate = localStorage.getItem('bionet_shop_template');

    if (savedName) setShopName(savedName);
    else if (storeUsername) setShopName(`Toko Resmi Herbal @${storeUsername}`);

    if (savedWa) setWhatsappNumber(savedWa);
    if (savedMarkup) setCustomMarkup(Number(savedMarkup));
    if (!urlTpl && savedTemplate) setActiveTemplate(savedTemplate);
  }, [storeUsername, urlTpl]);

  // Product catalog
  const products = [
    {
      id: 'p1',
      name: 'Bionet Bio-Herbal Drops 30ml',
      desc: 'Konsentrat herbal tetes kaya antioksidan dan mineral alami untuk meningkatkan daya tahan tubuh, menstabilkan gula darah, dan melancarkan metabolisme.',
      basePrice: 150000,
      memberPrice: 150000,
      image: '/assets/bionet_biotech_hero.jpg',
      bpom: 'POM TR 226019881',
      rating: '4.9/5 (340+ Ulasan)',
      stock: 'Ready Stock',
    },
    {
      id: 'p2',
      name: 'Bionet Royal Propolis Elixir 15ml',
      desc: 'Ekstrak propolis murni lebah trigona kualitas premium berkhasiat tinggi untuk regenerasi sel, imunitas maksimal, dan pemulihan stamina tubuh.',
      basePrice: 180000,
      memberPrice: 180000,
      image: '/assets/bionet_ambient_luxury.jpg',
      bpom: 'POM TR 236021102',
      rating: '5.0/5 (190+ Ulasan)',
      stock: 'Ready Stock',
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getRetailPrice = (basePrice) => {
    return basePrice + customMarkup;
  };

  const handleDirectWa = (product) => {
    const price = getRetailPrice(product.memberPrice || product.basePrice || 150000);
    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Halo kak, saya ingin memesan produk herbal *${product.name}* (Rp ${price.toLocaleString('id-ID')}) lewat toko online resmi Anda. Mohon info nomor rekening dan pengirimannya ya kak.`
    );
    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const price = getRetailPrice(selectedProduct.memberPrice || selectedProduct.basePrice || 150000);
    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '');

    // Auto-capture lead in CRM for the mitra
    try {
      axios.post('/api/public/leads', {
        store_username: storeUsername || '',
        name: customerName,
        phone: customerPhone,
        city: customerAddress,
        product_interest: selectedProduct.name,
        notes: `Pemesanan Toko Afiliasi online (Kurir: ${courier})`,
        estimated_value: price,
      }).catch((err) => console.log('Lead auto-capture silent log:', err));
    } catch (_) {}

    const text = encodeURIComponent(
      `Halo kak, saya baru saja melakukan pemesanan via Toko Online Bionet:\n\n` +
      `📦 *Produk:* ${selectedProduct.name}\n` +
      `💰 *Total Harga:* Rp ${price.toLocaleString('id-ID')}\n` +
      `🚚 *Ekspedisi Pilihan:* ${courier}\n\n` +
      `👤 *Data Penerima:*\n` +
      `- Nama: ${customerName}\n` +
      `- No HP: ${customerPhone}\n` +
      `- Alamat Pengiriman: ${customerAddress}\n\n` +
      `Mohon segera diproses dan diinfokan total transfer beserta ongkirnya ya kak. Terima kasih!`
    );

    window.open(`https://wa.me/${cleanWa}?text=${text}`, '_blank');
    setOrderSuccess(true);
  };

  return (
    <div className="relative min-h-screen">
      {/* Active Storefront Template Renderer */}
      <StorefrontRenderer
        templateId={activeTemplate}
        shopName={shopName}
        whatsappNumber={whatsappNumber}
        customMarkup={customMarkup}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onDirectWa={handleDirectWa}
        onCopyLink={handleCopyLink}
        copied={copied}
        onGoToLogin={onGoToLogin}
        isPreview={false}
      />

      {/* Customer Quick Order Modal */}
      {selectedProduct && (
        <ModalPortal
          isOpen={!!selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setOrderSuccess(false);
          }}
          ariaLabel="Formulir Pemesanan Produk"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Formulir Pemesanan Produk
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedProduct.name} — Rp {getRetailPrice(selectedProduct.memberPrice || selectedProduct.basePrice || 150000).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setOrderSuccess(false);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Pemesanan Terkirim ke WhatsApp!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tab WhatsApp Anda telah terbuka. Silakan tekan tombol kirim di WhatsApp untuk menyelesaikan pemesanan dengan mitra resmi kami.
                </p>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setOrderSuccess(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap Penerima:</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif:</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Alamat Lengkap Pengiriman:</label>
                  <textarea
                    required
                    rows="3"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Nama jalan, RT/RW, No. Rumah, Kelurahan, Kecamatan, Kota &amp; Kode Pos"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Pilihan Ekspedisi Kurir:</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="J&T Express EZ">J&amp;T Express EZ (Reguler)</option>
                    <option value="JNE REG">JNE REG (Reguler)</option>
                    <option value="SiCepat REG">SiCepat REG (Reguler)</option>
                    <option value="Anteraja">Anteraja Reguler</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Lanjutkan ke WhatsApp</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
