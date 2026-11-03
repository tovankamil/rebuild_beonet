import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  X,
  Truck,
  Package,
  Printer,
  Barcode,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Snowflake,
  Send,
  Sliders,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { playNotificationPing, playGoldCoinChime } from '../../utils/audioChime';

const COURIER_SERVICES = [
  {
    id: 'jnt_ez',
    courier: 'J&T Express',
    service: 'EZ Reguler',
    eta: '1-2 Hari Kerja',
    baseRatePerKg: 18000,
    logoText: 'J&T',
    color: 'from-red-600 to-rose-600',
    type: 'Standard',
  },
  {
    id: 'jne_yes',
    courier: 'JNE Express',
    service: 'YES (Yakin Esok Sampai)',
    eta: '1 Hari (Besok Sampai)',
    baseRatePerKg: 24000,
    logoText: 'JNE',
    color: 'from-blue-600 to-cyan-600',
    type: 'Priority Express',
  },
  {
    id: 'sicepat_reg',
    courier: 'SiCepat Ekspres',
    service: 'SIUNTUNG Reguler',
    eta: '1-2 Hari Kerja',
    baseRatePerKg: 17500,
    logoText: 'SICEPAT',
    color: 'from-amber-600 to-red-600',
    type: 'Standard',
  },
  {
    id: 'paxel_cold',
    courier: 'Paxel Cold-Chain',
    service: 'Thermolabel Fresh Care',
    eta: 'Sameday / Nextday',
    baseRatePerKg: 28000,
    logoText: 'PAXEL',
    color: 'from-cyan-600 to-teal-600',
    type: 'Cold-Chain (Suhu Terjaga)',
    coldChain: true,
  },
];

export default function ShippingLogisticsModal({
  isOpen,
  onClose,
  initialOrder = null,
  onAwbGenerated,
}) {
  const [recipientName, setRecipientName] = useState(initialOrder?.customer_name || 'Budi Utomo');
  const [recipientPhone, setRecipientPhone] = useState(initialOrder?.customer_phone || '081388991122');
  const [destinationCity, setDestinationCity] = useState(initialOrder?.city || 'Bandung, Jawa Barat');
  const [destinationAddress, setDestinationAddress] = useState(
    'Jl. Dago Asri No. 14, RT 02/05, Coblong, Kota Bandung 40135'
  );
  const [packageWeightGram, setPackageWeightGram] = useState(350); // 350 grams (approx 2 herbal bottles + box)
  const [bottleCount, setBottleCount] = useState(2);
  const [selectedCourierId, setSelectedCourierId] = useState('jnt_ez');
  const [isGeneratingAwb, setIsGeneratingAwb] = useState(false);
  const [activeAwb, setActiveAwb] = useState(initialOrder?.tracking_number || null);
  const [awbCourier, setAwbCourier] = useState('J&T Express');
  const [showThermalPreview, setShowThermalPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Tracking timeline simulation
  const [trackingTimeline, setTrackingTimeline] = useState([
    { title: 'Pesanan Dikonfirmasi Gudang', time: '10:00 WIB', done: true },
    { title: 'Packing Bubble Wrap & Dus Segel BPOM', time: '10:20 WIB', done: true },
    { title: 'AWB Barcode Dibuat (Menunggu Pickup)', time: '10:35 WIB', done: true },
    { title: 'Kurir Sedang Menuju Lokasi Penjemputan', time: 'Estimasi 13:00 WIB', done: false },
  ]);

  if (!isOpen) return null;

  const weightKg = Math.max(0.2, packageWeightGram / 1000);
  const selectedService = COURIER_SERVICES.find((c) => c.id === selectedCourierId) || COURIER_SERVICES[0];
  const calculatedShippingCost = Math.round(selectedService.baseRatePerKg * Math.ceil(weightKg));

  const handleGenerateAwb = () => {
    setIsGeneratingAwb(true);
    playNotificationPing();

    setTimeout(() => {
      const prefix = selectedService.courier.includes('J&T')
        ? 'JT'
        : selectedService.courier.includes('JNE')
        ? 'JNE'
        : selectedService.courier.includes('Paxel')
        ? 'PXL'
        : 'SCP';

      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      const generatedAwb = `${prefix}${randomDigits}ID`;

      setActiveAwb(generatedAwb);
      setAwbCourier(selectedService.courier);
      setIsGeneratingAwb(false);
      playGoldCoinChime();

      if (onAwbGenerated) {
        onAwbGenerated({
          awb: generatedAwb,
          courier: selectedService.courier,
          service: selectedService.service,
          cost: calculatedShippingCost,
        });
      }
    }, 900);
  };

  const handleCopyAwb = () => {
    if (!activeAwb) return;
    navigator.clipboard.writeText(activeAwb);
    setCopied(true);
    playNotificationPing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintThermal = () => {
    playNotificationPing();
    window.print();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Logistik Ekspedisi &amp; Auto-AWB Barcode
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Biteship &amp; RajaOngkir Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih ekspedisi real-time, generate nomor resi otomatis, dan cetak label thermal 10x10 cm.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center justify-center border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Package Weight & Courier Selection */}
            <div className="lg:col-span-7 space-y-5">
              {/* Package Specs */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Spesifikasi Paket Herbal &amp; Alamat Tujuan</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Nama Penerima:</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">No. WhatsApp Penerima:</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Kota / Kabupaten Tujuan:</label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Berat Total Paket (Gram):</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="100"
                        step="50"
                        value={packageWeightGram}
                        onChange={(e) => setPackageWeightGram(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                      <span className="text-xs font-mono text-cyan-400 flex-shrink-0">
                        ({(packageWeightGram / 1000).toFixed(2)} kg)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Alamat Lengkap Pengiriman:</label>
                  <textarea
                    rows={2}
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Real-time Courier Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span>Pilihan Ekspedisi Real-Time</span>
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">Rates Live via Biteship API</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COURIER_SERVICES.map((srv) => {
                    const isSelected = selectedCourierId === srv.id;
                    const calculatedCost = Math.round(srv.baseRatePerKg * Math.ceil(weightKg));

                    return (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedCourierId(srv.id);
                          playNotificationPing();
                        }}
                        className={`cursor-pointer rounded-2xl p-4 border transition duration-200 relative ${
                          isSelected
                            ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 shadow-lg shadow-cyan-950/20'
                            : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-xs text-white flex items-center space-x-1.5">
                            <span>{srv.courier}</span>
                            {srv.coldChain && (
                              <Snowflake className="w-3.5 h-3.5 text-cyan-400" title="Cold-Chain Temperature Controlled" />
                            )}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            Rp {calculatedCost.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 font-semibold">{srv.service}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                          <span>Estimasi: {srv.eta}</span>
                          <span className="text-cyan-400 font-medium">{srv.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate AWB Action */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateAwb}
                  disabled={isGeneratingAwb}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-xl shadow-cyan-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isGeneratingAwb ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menghubungi Server Kurir &amp; Booking Resi...</span>
                    </>
                  ) : (
                    <>
                      <Barcode className="w-5 h-5" />
                      <span>
                        {activeAwb ? 'Generate Ulang Nomor Resi AWB' : 'Booking & Generate Resi AWB Otomatis'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right 5 Cols: AWB Barcode & Thermal Label Preview */}
            <div className="lg:col-span-5 space-y-4">
              {/* Generated AWB Card */}
              {activeAwb && (
                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                      <Barcode className="w-4 h-4" />
                      <span>Nomor Resi Resmi</span>
                    </span>
                    <button
                      onClick={handleCopyAwb}
                      className="text-xs text-cyan-300 hover:text-white flex items-center space-x-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin Resi'}</span>
                    </button>
                  </div>

                  <div className="text-center py-2 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="text-lg font-black font-mono text-white tracking-widest">{activeAwb}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{awbCourier} Express Logistics</div>
                  </div>

                  {/* Tracking Timeline */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Status Pelacakan Kurir
                    </span>
                    {trackingTimeline.map((step, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs">
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 ${
                            step.done ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        />
                        <div className="flex-1">
                          <div className={step.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                            {step.title}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{step.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Printable 10x10 cm Thermal Label Mockup */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Preview Label Thermal 10x10 cm</span>
                  </span>
                  <button
                    onClick={handlePrintThermal}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Label</span>
                  </button>
                </div>

                {/* Thermal Label White Canvas (Printable Target) */}
                <div
                  id="thermal-label-print-area"
                  className="bg-white text-black p-4 rounded-2xl shadow-xl font-sans text-xs border border-slate-300 space-y-3 select-all"
                  style={{ minHeight: '340px' }}
                >
                  {/* Courier & AWB Header */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <div>
                      <div className="text-base font-black tracking-tight uppercase">
                        {awbCourier} {selectedService.service}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600">SYNETIQ HERBAL FULFILLMENT CENTER</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold">{weightKg.toFixed(2)} KG</div>
                      <div className="text-[9px] uppercase font-bold text-red-600">FRAGILE / CAIRAN</div>
                    </div>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="text-center py-1">
                    <div className="h-10 flex items-center justify-center space-x-1 font-mono tracking-widest text-[9px]">
                      {/* Barcode line representation */}
                      <div className="h-8 w-1 bg-black" />
                      <div className="h-8 w-0.5 bg-black" />
                      <div className="h-8 w-1.5 bg-black" />
                      <div className="h-8 w-0.5 bg-black" />
                      <div className="h-8 w-2 bg-black" />
                      <div className="h-8 w-1 bg-black" />
                      <div className="h-8 w-0.5 bg-black" />
                      <div className="h-8 w-2 bg-black" />
                      <div className="h-8 w-1 bg-black" />
                      <div className="h-8 w-1.5 bg-black" />
                      <div className="h-8 w-0.5 bg-black" />
                      <div className="h-8 w-2 bg-black" />
                      <div className="h-8 w-1 bg-black" />
                    </div>
                    <div className="font-mono font-black text-xs tracking-wider mt-1">
                      {activeAwb || 'JT9283719028ID'}
                    </div>
                  </div>

                  {/* Recipient and Sender Info */}
                  <div className="border-t border-b border-black py-2 space-y-2 text-[11px] leading-tight">
                    <div>
                      <span className="font-bold uppercase text-[9px] text-slate-500 block">PENERIMA:</span>
                      <strong className="text-sm font-black">{recipientName}</strong> ({recipientPhone})
                      <div className="text-slate-800 mt-0.5">{destinationAddress}</div>
                      <div className="font-bold text-slate-900 mt-0.5">{destinationCity}</div>
                    </div>

                    <div className="pt-1 border-t border-dashed border-slate-300">
                      <span className="font-bold uppercase text-[9px] text-slate-500 block">PENGIRIM:</span>
                      <div className="font-bold">PT SYNETIQ GLOBAL NUSANTARA</div>
                      <div className="text-slate-700 text-[10px]">
                        Gudang Farmasi &amp; Distribusi Herbal Nasional - 081122334455
                      </div>
                    </div>
                  </div>

                  {/* Footer Goods Description */}
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <div>
                      <span>Isi Paket: <strong>2x Bio-Propolis Trigona 30ml</strong></span>
                    </div>
                    <div className="text-right font-mono font-bold">NON-COD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Terhubung otomatis dengan scanner kurir &amp; pelacakan webhook real-time.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </ModalPortal>
  );
}
