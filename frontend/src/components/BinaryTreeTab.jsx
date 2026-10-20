import React, { useState, useEffect } from 'react';
import {
  GitFork,
  UserCheck,
  UserPlus,
  RefreshCw,
  AlertCircle,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Shield,
  Layers,
  ChevronRight,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

export default function BinaryTreeTab() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [registerSlot, setRegisterSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTree = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/genealogy');
      if (res.data && res.data.data) {
        setTree(res.data.data);
      }
    } catch (err) {
      setError('Gagal memuat pohon jaringan. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(1.3, Math.max(0.7, +(prev + delta).toFixed(2))));
  };

  const handleResetZoom = () => setZoomLevel(1);

  const renderNode = (node, positionLabel, isRoot = false) => {
    if (!node) {
      return (
        <div
          onClick={() => setRegisterSlot(positionLabel)}
          className="w-48 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-white/60 hover:bg-cyan-50/50 transition-all cursor-pointer text-center group"
          title={`Klik untuk pasang mitra baru di slot ${positionLabel}`}
        >
          <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-cyan-100 text-slate-400 group-hover:text-cyan-600 flex items-center justify-center mx-auto mb-2 transition-colors">
            <UserPlus size={18} />
          </div>
          <div className="text-xs font-bold text-slate-600 group-hover:text-cyan-800">
            Slot {positionLabel} Kosong
          </div>
          <div className="text-[11px] text-cyan-600 font-semibold mt-1">
            + Daftarkan Downline
          </div>
        </div>
      );
    }

    const isMatch = searchTerm && (
      node.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.full_name && node.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div
        onClick={() => setSelectedNode(node)}
        className={`w-48 p-4 rounded-xl bg-white border transition-all cursor-pointer text-center relative shadow-sm hover:shadow-md ${
          isMatch
            ? 'border-amber-400 ring-2 ring-amber-400/30'
            : isRoot
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200 hover:border-emerald-400'
        }`}
      >
        {/* Top Tag */}
        <span
          className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isRoot
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isRoot ? 'Akun Utama' : 'Mitra Downline'}
        </span>

        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm shadow-sm ${
            isRoot
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
              : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white'
          }`}
        >
          {node.username.charAt(0).toUpperCase()}
        </div>

        {/* User Info */}
        <div className="font-heading font-bold text-xs text-slate-900 truncate">
          {node.username}
        </div>
        <div className="text-[10px] text-slate-400 truncate mb-2">
          {node.full_name || 'Mitra Bionet'}
        </div>

        {/* L / R PV Counter */}
        <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-semibold">
          <span className="text-cyan-700">L: {node.point_left || 0} PV</span>
          <span className="text-emerald-700">R: {node.point_right || 0} PV</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <GitFork size={24} className="text-emerald-600" />
            <span>Pohon Jaringan Binary (MLM Tree)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi struktur pohon kemitraan 3 generasi kaki kiri & kanan dengan omset real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Downline */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari username downline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dash-input pl-8 py-1.5 text-xs w-44"
            />
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Perkecil (-)"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1.5 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Perbesar (+)"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <button
            onClick={fetchTree}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Segarkan Struktur Pohon"
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin text-emerald-600' : ''}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="dash-card p-6 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="text-center py-24 text-slate-400">
            <RefreshCw size={28} className="animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs">Memuat struktur pohon kemitraan binary...</p>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="overflow-x-auto py-6"
          >
            <div className="flex flex-col items-center">
              {/* Level 1: Root */}
              <div className="flex flex-col items-center">
                {renderNode(tree, 'Pusat', true)}
                <div className="tree-line-v my-1" />
              </div>

              {/* Level 2 & 3: Branches */}
              <div className="tree-branches">
                {/* Left Branch */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-2">
                    ◀ Jalur Kaki Kiri
                  </span>
                  {renderNode(tree?.left_node, 'Kiri')}
                  <div className="tree-line-v my-1" />

                  {/* Level 3: Left-Left and Left-Right */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-1">
                    {renderNode(tree?.left_node?.left_node, 'L-Kiri')}
                    {renderNode(tree?.left_node?.right_node, 'L-Kanan')}
                  </div>
                </div>

                {/* Right Branch */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    Jalur Kaki Kanan ▶
                  </span>
                  {renderNode(tree?.right_node, 'Kanan')}
                  <div className="tree-line-v my-1" />

                  {/* Level 3: Right-Left and Right-Right */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-1">
                    {renderNode(tree?.right_node?.left_node, 'R-Kiri')}
                    {renderNode(tree?.right_node?.right_node, 'R-Kanan')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span>Akun Utama Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-600" />
            <span>Mitra Terverifikasi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded border-2 border-dashed border-slate-400" />
            <span>Slot Kosong Siap Diisi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Hasil Pencarian</span>
          </div>
        </div>
      </div>

      {/* Selected Node Modal */}
      {selectedNode && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-heading font-bold text-base text-slate-800">
                Informasi Mitra: @{selectedNode.username}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Lengkap</span>
                  <span className="font-bold text-slate-800">{selectedNode.full_name || 'Mitra Bionet'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Username</span>
                  <span className="font-bold text-emerald-600">@{selectedNode.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Omset Poin Kiri (L)</span>
                  <span className="font-bold text-cyan-700">{selectedNode.point_left || 0} PV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Omset Poin Kanan (R)</span>
                  <span className="font-bold text-emerald-700">{selectedNode.point_right || 0} PV</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Slot Modal */}
      {registerSlot && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setRegisterSlot(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-heading font-bold text-base text-slate-800">
                Pendaftaran Mitra di Slot {registerSlot}
              </h4>
              <button
                onClick={() => setRegisterSlot(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Anda memilih posisi <strong>Slot {registerSlot}</strong>. Calon mitra baru akan otomatis terhubung pada jalur pohon binary ini menggunakan serial PIN aktivasi Anda.
              </p>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800">
                <strong>Tips Keseimbangan Binary:</strong> Pastikan Anda menempatkan mitra baru di jalur kaki yang membutuhkan penambahan poin omset agar bonus pasangan harian maksimal.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRegisterSlot(null)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    alert(`Fitur penempatan mitra di slot ${registerSlot} dipilih. Siapkan PIN lisensi di menu Stokis.`);
                    setRegisterSlot(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Lanjut Registrasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
