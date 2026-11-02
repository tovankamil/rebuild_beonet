import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Send,
  Save,
  CheckCircle2,
  Phone,
  RefreshCw,
  Sliders,
  ExternalLink,
  Layers,
  Package,
  ShieldCheck,
  RotateCcw,
  Bot,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import api from '../../services/api';

export default function WhatsAppInteractiveStoreView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [toast, setToast] = useState(null);
  const [activeCategoryModal, setActiveCategoryModal] = useState(null);

  // Store Configuration
  const [storeConfig, setStoreConfig] = useState({
    store_name: '🌸 BIONET OFFICIAL HERBAL & STORE 🌸',
    greeting_text: '👋 *Pilih Kategori Produk & Kemitraan*\nProduk herbal BPOM & paket join ready, dapat langsung dipesan otomatis 24/7.',
    footer_text: '⚡ Proses Otomatis 24/7 • 🛡️ Transaksi Aman & BPOM Resmi',
    is_active: true,
    auto_reply_on: true,
    categories: [],
  });

  const [formattedText, setFormattedText] = useState('');

  // Simulator State
  const [simulatedChat, setSimulatedChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch store catalog configuration
  const fetchStoreCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/crm/whatsapp/store-catalog');
      if (res.data?.data) {
        setStoreConfig(res.data.data);
        setFormattedText(res.data.formatted_text || '');
        resetSimulator(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load store catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreCatalog();
  }, []);

  // Reset phone simulator to initial store menu
  const resetSimulator = (cfg = storeConfig) => {
    setSimulatedChat([
      {
        id: 'msg-init-store',
        sender: 'bot',
        type: 'store_menu',
        timestamp: '07:31',
        config: cfg,
      },
    ]);
  };

  // Handle clicking button on phone simulator
  const handleSimulatorButtonClick = (category) => {
    if (isTyping) return;

    // 1. Add user click message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: `${category.icon} ${category.title}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setSimulatedChat((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Add bot automated response after brief simulated delay
    setTimeout(() => {
      setIsTyping(false);
      if (category.action_type === 'home') {
        setSimulatedChat((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            type: 'store_menu',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            config: storeConfig,
          },
        ]);
      } else {
        setSimulatedChat((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            type: 'text_reply',
            categoryTitle: category.title,
            categoryIcon: category.icon,
            text: category.reply_text,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }, 450);
  };

  // Save changes to database
  const handleSaveConfig = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/crm/whatsapp/store-catalog', storeConfig);
      if (res.data?.data) {
        setStoreConfig(res.data.data);
        setFormattedText(res.data.formatted_text || '');
        resetSimulator(res.data.data);
      }
      showNotification('Konfigurasi Katalog Toko Bot WhatsApp berhasil disimpan!', 'success');
    } catch (err) {
      showNotification('Gagal menyimpan konfigurasi: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Send live test WhatsApp message
  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!testPhone.trim()) {
      showNotification('Silakan masukkan nomor WhatsApp tujuan', 'error');
      return;
    }

    try {
      setSendingTest(true);
      await api.post('/crm/whatsapp/store-catalog/send', { phone: testPhone.trim() });
      showNotification(`Pesan Katalog Toko berhasil dikirimkan ke ${testPhone}!`, 'success');
      setTestPhone('');
    } catch (err) {
      showNotification('Gagal mengirim pesan: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSendingTest(false);
    }
  };

  // Update specific category text
  const handleUpdateCategoryReply = (catId, newText) => {
    setStoreConfig((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, reply_text: newText } : c)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center space-x-3 backdrop-blur-xl animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          }`}
        >
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span className="text-xs font-bold font-mono">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="text-xs text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-[#062016] border border-emerald-700/60 shadow-lg text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-pink-900/30 shrink-0">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Katalog Toko Interaktif Bot WhatsApp 24/7
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-400/40">
                Button &amp; List Menu
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Fitur menu interaktif otomatis dengan tombol kategori produk &amp; paket kemitraan yang siap dibeli pelanggan 24/7.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => resetSimulator()}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Reset tampilan preview ponsel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Preview</span>
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-950 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Config Form (Col 7) vs WhatsApp Phone Simulator (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Konfigurasi Teks, Kategori Tombol & Kirim Uji Coba */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. General Settings & Switches */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Pengaturan Toko &amp; Pemicu Otomatis</span>
              </h3>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storeConfig.is_active}
                    onChange={(e) => setStoreConfig((p) => ({ ...p, is_active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-700">
                  {storeConfig.is_active ? 'Toko Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Toko / Judul Banner Atas
                </label>
                <input
                  type="text"
                  value={storeConfig.store_name}
                  onChange={(e) => setStoreConfig((p) => ({ ...p, store_name: e.target.value }))}
                  placeholder="Contoh: 🌸 BIONET OFFICIAL HERBAL & STORE 🌸"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teks Salam Pembuka (Greeting Message)
                </label>
                <textarea
                  rows={2}
                  value={storeConfig.greeting_text}
                  onChange={(e) => setStoreConfig((p) => ({ ...p, greeting_text: e.target.value }))}
                  placeholder="Teks sambutan pelanggan saat membuka menu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 leading-relaxed focus:outline-none focus:border-emerald-500 font-sans text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Catatan Kaki (Footer Badge)
                </label>
                <input
                  type="text"
                  value={storeConfig.footer_text}
                  onChange={(e) => setStoreConfig((p) => ({ ...p, footer_text: e.target.value }))}
                  placeholder="Contoh: ⚡ Proses Otomatis 24/7 • 🛡️ Transaksi Aman"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="autoReplyToggle"
                  checked={storeConfig.auto_reply_on}
                  onChange={(e) => setStoreConfig((p) => ({ ...p, auto_reply_on: e.target.checked }))}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autoReplyToggle" className="cursor-pointer">
                  <span className="font-bold text-emerald-950 block">
                    Balas Otomatis 24/7 saat Ada Kata Kunci Masuk
                  </span>
                  <span className="text-[11px] text-emerald-800 leading-relaxed block mt-0.5">
                    Jika pelanggan mengirim kata: &quot;menu&quot;, &quot;toko&quot;, &quot;store&quot;, &quot;katalog&quot;, &quot;produk&quot;, &quot;paket&quot;, atau &quot;halo&quot;, bot akan otomatis membalas dengan format katalog interaktif ini!
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Daftar Kategori Tombol Interaktif */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Tombol Kategori &amp; Balasan Otomatis</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik kartu kategori di bawah untuk menyesuaikan rincian teks respon yang diterima pelanggan.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                {storeConfig.categories?.filter((c) => c.is_active).length || 0} Tombol Aktif
              </span>
            </div>

            <div className="space-y-3">
              {storeConfig.categories?.map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl shrink-0 p-1 bg-white rounded-xl shadow-2xs border border-slate-200/60">
                        {cat.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                          <span>{cat.title}</span>
                          <span className="text-[10px] font-normal text-slate-400">
                            ({cat.subtitle})
                          </span>
                        </h4>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          Aksi: {cat.action_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setStoreConfig((prev) => ({
                            ...prev,
                            categories: prev.categories.map((c) =>
                              c.id === cat.id ? { ...c, is_active: !c.is_active } : c
                            ),
                          }))
                        }
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition ${
                          cat.is_active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cat.is_active ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Editable Reply Snippet */}
                  <div className="pt-1">
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Teks Balasan Otomatis Saat Tombol Diklik:
                    </label>
                    <textarea
                      rows={3}
                      value={cat.reply_text}
                      onChange={(e) => handleUpdateCategoryReply(cat.id, e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 font-sans leading-relaxed focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Uji Coba Kirim Langsung ke Nomor WhatsApp */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 p-5 rounded-3xl border border-emerald-800/60 shadow-sm text-white space-y-3.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
              <Send className="w-4 h-4" />
              <span>Kirim Uji Coba Pesan Toko ke Nomor WhatsApp Anda</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Uji langsung ke ponsel Anda bagaimana pesan katalog interaktif ini diterima dan tampil di aplikasi WhatsApp resmi.
            </p>

            <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Contoh: 081234567890 atau 62812..."
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={sendingTest}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950 disabled:opacity-50 flex items-center justify-center space-x-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingTest ? 'Mengirim...' : 'Kirim Sekarang'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: WhatsApp Phone Simulator (Persis Seperti Screenshot) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[370px] bg-slate-900 p-3 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-4 border-slate-800 relative">
            {/* Phone Top Notch / Speaker */}
            <div className="w-32 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-10 h-1.5 rounded-full bg-slate-800" />
            </div>

            {/* Smartphone Inner Screen */}
            <div className="rounded-[30px] overflow-hidden border border-slate-800 bg-[#efeae2] flex flex-col h-[650px] relative font-sans text-slate-800 select-none">
              {/* WhatsApp App Header Bar */}
              <div className="bg-[#075e54] text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm font-bold shadow-inner">
                    🌿
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-tight">Bionet Official Store</h4>
                    <span className="text-[9px] text-emerald-200 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Online 24/7 • Bot Store</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => resetSimulator()}
                  className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="Reset Obrolan Simulator"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chat Wallpaper Canvas with Green Doodle Pattern */}
              <div
                className="flex-1 overflow-y-auto p-3 space-y-3 relative"
                style={{
                  backgroundColor: '#86a789',
                  backgroundImage: `radial-gradient(#739072 1.5px, transparent 1.5px), radial-gradient(#5f7a5e 1.5px, #86a789 1.5px)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              >
                {simulatedChat.map((msg) => {
                  if (msg.type === 'store_menu') {
                    const cfg = msg.config || storeConfig;
                    return (
                      <div key={msg.id} className="space-y-1.5 max-w-[94%] animate-fadeIn">
                        {/* 1. Main Store Bubble Card (Identik dengan Screenshot) */}
                        <div className="bg-[#fef4f4] rounded-2xl p-3 border-l-4 border-rose-500 shadow-md text-xs relative space-y-2">
                          {/* Stylized Header Tag */}
                          <div className="text-center font-bold text-slate-800 text-[11px] tracking-wide border-b border-rose-200/60 pb-1.5">
                            {cfg.store_name}
                          </div>

                          {/* Greeting Description */}
                          <div className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                            {cfg.greeting_text}
                          </div>

                          {/* Category Counts List */}
                          <div className="space-y-1 pt-1 border-t border-rose-200/50 text-[11px] text-slate-800 font-semibold">
                            {cfg.categories
                              ?.filter((c) => c.is_active && c.action_type !== 'home')
                              .map((cat, i) => (
                                <div key={i} className="flex items-center space-x-1.5">
                                  <span>{cat.icon}</span>
                                  <span className="font-bold">{cat.title}:</span>
                                  <span className="font-normal text-slate-600">{cat.subtitle}</span>
                                </div>
                              ))}
                          </div>

                          {/* Divider */}
                          <div className="w-full h-[1px] bg-slate-300 my-1.5" />

                          {/* Footer Tag */}
                          <div className="text-[10px] text-rose-900 font-semibold bg-rose-100/70 p-1.5 rounded-lg text-center">
                            {cfg.footer_text}
                          </div>

                          {/* Message Timestamp */}
                          <div className="text-[9px] text-slate-400 text-right mt-1">
                            {msg.timestamp} ✓✓
                          </div>
                        </div>

                        {/* 2. Interactive Stacked Full-Width Buttons (Persis Screenshot) */}
                        <div className="space-y-1.5 pt-1">
                          {cfg.categories
                            ?.filter((c) => c.is_active)
                            .map((cat, idx) => (
                              <button
                                key={cat.id || idx}
                                onClick={() => handleSimulatorButtonClick(cat)}
                                className="w-full py-2.5 px-3 rounded-xl bg-[#597e52]/90 hover:bg-[#43643d] active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all border border-[#71916a]"
                              >
                                <span>{cat.icon}</span>
                                <span className="drop-shadow-xs">{cat.title}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === 'user') {
                    return (
                      <div key={msg.id} className="flex justify-end animate-fadeIn">
                        <div className="bg-[#dcf8c6] text-slate-800 rounded-2xl rounded-tr-xs px-3 py-2 text-xs shadow-md max-w-[80%] space-y-0.5">
                          <p className="font-bold">{msg.text}</p>
                          <span className="text-[9px] text-slate-500 block text-right">
                            {msg.timestamp} ✓✓
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (msg.sender === 'bot') {
                    return (
                      <div key={msg.id} className="flex justify-start animate-fadeIn">
                        <div className="bg-white text-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs shadow-md max-w-[90%] space-y-1.5 border border-slate-100">
                          <div className="flex items-center space-x-1.5 font-bold text-emerald-800 border-b border-slate-100 pb-1">
                            <span>{msg.categoryIcon}</span>
                            <span>{msg.categoryTitle}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                            {msg.text}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                            <span className="text-emerald-700 font-bold">Bionet Bot 24/7</span>
                            <span>{msg.timestamp} ✓✓</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center space-x-1 bg-white px-3 py-2 rounded-xl w-16 shadow-md text-slate-400 animate-pulse text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                  </div>
                )}
              </div>

              {/* Chat Input Bottom Bar Mockup */}
              <div className="bg-[#f0f2f5] p-2 flex items-center space-x-2 border-t border-slate-200 shrink-0">
                <div className="flex-1 bg-white rounded-full px-3.5 py-1.5 text-xs text-slate-400 border border-slate-200">
                  Ketik pesan atau klik tombol di atas...
                </div>
                <div className="w-8 h-8 rounded-full bg-[#128c7e] text-white flex items-center justify-center shadow-xs">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-medium text-center mt-3">
            💡 <em>Klik tombol manapun di layar simulator ponsel untuk menguji alur balasan otomatis!</em>
          </p>
        </div>
      </div>
    </div>
  );
}

