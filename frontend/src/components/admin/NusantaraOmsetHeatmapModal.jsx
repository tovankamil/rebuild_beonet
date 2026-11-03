import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  X,
  MapPin,
  TrendingUp,
  Package,
  Users,
  Search,
  Filter,
  Flame,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Globe2,
  Droplets,
  Coins,
} from 'lucide-react';
import { playNotificationPing, playGoldCoinChime } from '../../utils/audioChime';

// 38 Provinsi di Indonesia dengan data omset & volume botol herbal
const PROVINCES_DATA = [
  // TOP 5
  { id: 'jabar', name: 'Jawa Barat', region: 'Jawa', omset: 482500000, bottles: 3420, partners: 5410, growth: '+24.5%', x: 275, y: 250, isTop: true, rank: 1 },
  { id: 'jatim', name: 'Jawa Timur', region: 'Jawa', omset: 412300000, bottles: 2910, partners: 4890, growth: '+21.8%', x: 380, y: 270, isTop: true, rank: 2 },
  { id: 'dki', name: 'DKI Jakarta', region: 'Jawa', omset: 378900000, bottles: 2680, partners: 3950, growth: '+18.2%', x: 235, y: 235, isTop: true, rank: 3 },
  { id: 'sumut', name: 'Sumatera Utara', region: 'Sumatera', omset: 245800000, bottles: 1740, partners: 2840, growth: '+19.6%', x: 105, y: 110, isTop: true, rank: 4 },
  { id: 'sulsel', name: 'Sulawesi Selatan', region: 'Sulawesi', omset: 198400000, bottles: 1410, partners: 2310, growth: '+16.4%', x: 520, y: 245, isTop: true, rank: 5 },

  // Pulau Jawa
  { id: 'jateng', name: 'Jawa Tengah', region: 'Jawa', omset: 185200000, bottles: 1310, partners: 2240, growth: '+14.1%', x: 325, y: 260 },
  { id: 'banten', name: 'Banten', region: 'Jawa', omset: 134500000, bottles: 950, partners: 1680, growth: '+12.7%', x: 205, y: 238 },
  { id: 'diy', name: 'DI Yogyakarta', region: 'Jawa', omset: 96400000, bottles: 680, partners: 1210, growth: '+15.3%', x: 330, y: 280 },

  // Pulau Sumatera
  { id: 'aceh', name: 'Aceh', region: 'Sumatera', omset: 74200000, bottles: 520, partners: 890, growth: '+11.2%', x: 75, y: 75 },
  { id: 'sumbar', name: 'Sumatera Barat', region: 'Sumatera', omset: 88600000, bottles: 630, partners: 1050, growth: '+13.8%', x: 125, y: 170 },
  { id: 'riau', name: 'Riau', region: 'Sumatera', omset: 112500000, bottles: 790, partners: 1320, growth: '+15.9%', x: 155, y: 145 },
  { id: 'kepri', name: 'Kepulauan Riau', region: 'Sumatera', omset: 68400000, bottles: 480, partners: 790, growth: '+14.2%', x: 200, y: 135 },
  { id: 'jambi', name: 'Jambi', region: 'Sumatera', omset: 54100000, bottles: 380, partners: 640, growth: '+9.8%', x: 175, y: 195 },
  { id: 'sumsel', name: 'Sumatera Selatan', region: 'Sumatera', omset: 121800000, bottles: 860, partners: 1450, growth: '+16.5%', x: 195, y: 225 },
  { id: 'babel', name: 'Bangka Belitung', region: 'Sumatera', omset: 42300000, bottles: 300, partners: 510, growth: '+8.4%', x: 240, y: 195 },
  { id: 'bengkulu', name: 'Bengkulu', region: 'Sumatera', omset: 39500000, bottles: 280, partners: 460, growth: '+7.9%', x: 150, y: 230 },
  { id: 'lampung', name: 'Lampung', region: 'Sumatera', omset: 98700000, bottles: 700, partners: 1180, growth: '+14.0%', x: 205, y: 255 },

  // Pulau Kalimantan
  { id: 'kalbar', name: 'Kalimantan Barat', region: 'Kalimantan', omset: 76500000, bottles: 540, partners: 910, growth: '+12.4%', x: 310, y: 150 },
  { id: 'kalteng', name: 'Kalimantan Tengah', region: 'Kalimantan', omset: 58200000, bottles: 410, partners: 690, growth: '+10.1%', x: 365, y: 175 },
  { id: 'kalsel', name: 'Kalimantan Selatan', region: 'Kalimantan', omset: 92400000, bottles: 650, partners: 1100, growth: '+14.7%', x: 415, y: 215 },
  { id: 'kaltim', name: 'Kalimantan Timur (IKN)', region: 'Kalimantan', omset: 128900000, bottles: 910, partners: 1520, growth: '+23.1%', x: 435, y: 150 },
  { id: 'kaltara', name: 'Kalimantan Utara', region: 'Kalimantan', omset: 34100000, bottles: 240, partners: 410, growth: '+8.5%', x: 440, y: 95 },

  // Pulau Sulawesi
  { id: 'sulut', name: 'Sulawesi Utara', region: 'Sulawesi', omset: 67300000, bottles: 470, partners: 810, growth: '+11.8%', x: 575, y: 115 },
  { id: 'gorontalo', name: 'Gorontalo', region: 'Sulawesi', omset: 29800000, bottles: 210, partners: 360, growth: '+7.4%', x: 545, y: 135 },
  { id: 'sulteng', name: 'Sulawesi Tengah', region: 'Sulawesi', omset: 52400000, bottles: 370, partners: 620, growth: '+10.2%', x: 530, y: 180 },
  { id: 'sulbar', name: 'Sulawesi Barat', region: 'Sulawesi', omset: 31200000, bottles: 220, partners: 370, growth: '+8.1%', x: 495, y: 205 },
  { id: 'sultra', name: 'Sulawesi Tenggara', region: 'Sulawesi', omset: 48900000, bottles: 340, partners: 580, growth: '+9.5%', x: 565, y: 235 },

  // Bali & Nusa Tenggara
  { id: 'bali', name: 'Bali', region: 'Bali-Nusra', omset: 95600000, bottles: 670, partners: 1140, growth: '+15.2%', x: 435, y: 285 },
  { id: 'ntb', name: 'Nusa Tenggara Barat', region: 'Bali-Nusra', omset: 56700000, bottles: 400, partners: 680, growth: '+11.0%', x: 475, y: 290 },
  { id: 'ntt', name: 'Nusa Tenggara Timur', region: 'Bali-Nusra', omset: 43200000, bottles: 300, partners: 520, growth: '+8.7%', x: 545, y: 300 },

  // Maluku & Papua (Termasuk 4 DOB Baru)
  { id: 'maluku', name: 'Maluku', region: 'Maluku-Papua', omset: 38400000, bottles: 270, partners: 460, growth: '+8.9%', x: 635, y: 215 },
  { id: 'malut', name: 'Maluku Utara', region: 'Maluku-Papua', omset: 35100000, bottles: 250, partners: 420, growth: '+9.1%', x: 620, y: 145 },
  { id: 'papua', name: 'Papua (Jayapura)', region: 'Maluku-Papua', omset: 51200000, bottles: 360, partners: 610, growth: '+12.0%', x: 735, y: 200 },
  { id: 'papuabarat', name: 'Papua Barat (Manokwari)', region: 'Maluku-Papua', omset: 33400000, bottles: 240, partners: 390, growth: '+8.2%', x: 680, y: 175 },
  { id: 'pabar_daya', name: 'Papua Barat Daya (Sorong)', region: 'Maluku-Papua', omset: 36800000, bottles: 260, partners: 430, growth: '+10.5%', x: 655, y: 165 },
  { id: 'papua_selatan', name: 'Papua Selatan (Merauke)', region: 'Maluku-Papua', omset: 28600000, bottles: 200, partners: 340, growth: '+7.1%', x: 745, y: 265 },
  { id: 'papua_tengah', name: 'Papua Tengah (Nabire)', region: 'Maluku-Papua', omset: 31500000, bottles: 220, partners: 370, growth: '+7.8%', x: 705, y: 215 },
  { id: 'papua_pegunungan', name: 'Papua Pegunungan (Jayawijaya)', region: 'Maluku-Papua', omset: 26400000, bottles: 190, partners: 310, growth: '+6.9%', x: 725, y: 230 },
];

export default function NusantaraOmsetHeatmapModal({
  isOpen,
  onClose,
}) {
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(PROVINCES_DATA[0]);

  if (!isOpen) return null;

  // Filter provinces
  const filteredProvinces = useMemo(() => {
    return PROVINCES_DATA.filter((p) => {
      const matchRegion = regionFilter === 'all' || p.region === regionFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [regionFilter, searchQuery]);

  // Aggregate stats
  const totalOmset = useMemo(() => PROVINCES_DATA.reduce((acc, curr) => acc + curr.omset, 0), []);
  const totalBottles = useMemo(() => PROVINCES_DATA.reduce((acc, curr) => acc + curr.bottles, 0), []);
  const totalPartners = useMemo(() => PROVINCES_DATA.reduce((acc, curr) => acc + curr.partners, 0), []);

  const top5List = useMemo(
    () => [...PROVINCES_DATA].sort((a, b) => b.omset - a.omset).slice(0, 5),
    []
  );

  const handleSelectProvince = (prov) => {
    setSelectedProvince(prov);
    playNotificationPing();
  };

  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <Globe2 className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Peta Sebaran Omset Nusantara (38 Provinsi)
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Heatmap</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pantau real-time volume botol herbal, perputaran omset mitra, dan penetrasi produk di seluruh Indonesia.
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

        {/* Aggregate KPI Stat Cards */}
        <div className="px-6 py-3.5 bg-slate-900/60 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Omset Nasional Hari Ini</span>
            </div>
            <div className="text-lg font-black text-amber-400 mt-1 font-mono">
              Rp {totalOmset.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              <span>Botol Terkirim Hari Ini</span>
            </div>
            <div className="text-lg font-black text-cyan-400 mt-1 font-mono">
              {totalBottles.toLocaleString('id-ID')} Botol
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mitra Aktif Nusantara</span>
            </div>
            <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
              {totalPartners.toLocaleString('id-ID')} Mitra
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span>Cakupan Distribusi</span>
            </div>
            <div className="text-lg font-black text-rose-400 mt-1">
              38 / 38 Provinsi (100%)
            </div>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top 5 Highlight Cards */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Top 5 Provinsi Penyumbang Omset Terbesar
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {top5List.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProvince(item)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition duration-200 relative overflow-hidden ${
                    selectedProvince?.id === item.id
                      ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400 shadow-lg shadow-amber-950/30'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">{item.growth}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                  <div className="text-sm font-black text-amber-400 font-mono mt-1">
                    Rp {item.omset.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {item.bottles.toLocaleString('id-ID')} botol • {item.partners} mitra
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Nusantara SVG Map Viewport */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Radar Geografis Nusantara (Titik Lampu Berkedip / Pulsing Dots)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Pilih atau arahkan kursor ke titik provinsi untuk melihat rincian
              </span>
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full bg-[#030712] rounded-2xl border border-slate-800/80 p-4 relative overflow-hidden min-h-[300px] flex items-center justify-center">
              {/* Radial glow background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-transparent to-transparent pointer-events-none" />

              <svg
                viewBox="0 0 820 340"
                className="w-full h-auto max-h-[320px] select-none"
                style={{ filter: 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.15))' }}
              >
                {/* Simplified Archipelago Outline Paths */}
                {/* Sumatera */}
                <path
                  d="M60,60 L140,120 L210,240 L160,260 L80,140 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Jawa */}
                <path
                  d="M200,245 L410,270 L400,295 L190,265 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Kalimantan */}
                <path
                  d="M290,110 L450,90 L460,200 L320,200 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Sulawesi */}
                <path
                  d="M510,120 L580,105 L550,170 L580,240 L520,260 L500,190 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Bali & Nusra */}
                <path
                  d="M420,285 L560,300 L560,315 L420,295 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Maluku */}
                <path
                  d="M610,130 L645,150 L630,230 L595,200 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />
                {/* Papua */}
                <path
                  d="M660,160 L780,190 L770,275 L680,240 Z"
                  fill="#0f172a"
                  stroke="#1e293b"
                  strokeWidth="1.5"
                />

                {/* Render All 38 Province Nodes */}
                {PROVINCES_DATA.map((prov) => {
                  const isSelected = selectedProvince?.id === prov.id;
                  const isHovered = hoveredProvince?.id === prov.id;
                  const dotRadius = prov.isTop ? 6 : 4;
                  const pulseColor = prov.isTop ? '#f59e0b' : '#10b981';

                  return (
                    <g
                      key={prov.id}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleSelectProvince(prov)}
                      onMouseEnter={() => setHoveredProvince(prov)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    >
                      {/* Pulsing Outer Ripple for Top Producers */}
                      {prov.isTop && (
                        <circle
                          cx={prov.x}
                          cy={prov.y}
                          r="14"
                          fill="none"
                          stroke={pulseColor}
                          strokeWidth="1.5"
                          opacity="0.6"
                        >
                          <animate
                            attributeName="r"
                            from="6"
                            to="20"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.8"
                            to="0"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}

                      {/* Main Glowing Circle */}
                      <circle
                        cx={prov.x}
                        cy={prov.y}
                        r={dotRadius}
                        fill={isSelected ? '#38bdf8' : prov.isTop ? '#f59e0b' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? '2' : '1'}
                      />

                      {/* Label for Top 5 */}
                      {(prov.isTop || isHovered) && (
                        <text
                          x={prov.x}
                          y={prov.y - 10}
                          textAnchor="middle"
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="bold"
                          className="pointer-events-none drop-shadow"
                        >
                          {prov.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Province Detailed Snapshot */}
            {selectedProvince && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-base font-black text-white">{selectedProvince.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                        Wilayah {selectedProvince.region}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pertumbuhan Omset: <strong className="text-emerald-400">{selectedProvince.growth}</strong> dibanding bulan lalu
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400">Total Omset Wilayah</div>
                    <div className="text-sm font-black text-amber-400 font-mono">
                      Rp {selectedProvince.omset.toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Volume Botol Terkirim</div>
                    <div className="text-sm font-black text-cyan-400 font-mono">
                      {selectedProvince.bottles.toLocaleString('id-ID')} Botol
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Mitra Terdaftar</div>
                    <div className="text-sm font-black text-emerald-400 font-mono">
                      {selectedProvince.partners.toLocaleString('id-ID')} Mitra
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 38 Provinces Full Directory Table with Filter */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Daftar Lengkap 38 Provinsi
                </h3>
              </div>

              {/* Regional Pills Switcher */}
              <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1">
                {['all', 'Jawa', 'Sumatera', 'Kalimantan', 'Sulawesi', 'Bali-Nusra', 'Maluku-Papua'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      setRegionFilter(reg);
                      playNotificationPing();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      regionFilter === reg
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {reg === 'all' ? 'Semua Wilayah' : reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Provinsi</th>
                    <th className="py-2.5 px-3">Wilayah</th>
                    <th className="py-2.5 px-3 text-right">Omset (IDR)</th>
                    <th className="py-2.5 px-3 text-right">Volume Botol</th>
                    <th className="py-2.5 px-3 text-right">Mitra Aktif</th>
                    <th className="py-2.5 px-3 text-right">Pertumbuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProvinces.map((prov) => (
                    <tr
                      key={prov.id}
                      onClick={() => handleSelectProvince(prov)}
                      className={`cursor-pointer transition ${
                        selectedProvince?.id === prov.id
                          ? 'bg-emerald-950/30 text-white'
                          : 'hover:bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center space-x-2">
                        {prov.isTop && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                        <span>{prov.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{prov.region}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        Rp {prov.omset.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-cyan-300">
                        {prov.bottles.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {prov.partners.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {prov.growth}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Data tersinkronisasi otomatis dengan server fulfillment &amp; multi-kurir SYNETIQ.</span>
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
