import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Home,
  ArrowUp,
  CornerDownRight,
} from 'lucide-react';
import api from '../services/api';
import RegisterDownlineModal from './RegisterDownlineModal';

export default function BinaryTreeTab() {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState(null);
  const [registerSlot, setRegisterSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rootUsername, setRootUsername] = useState('');
  const [mainAccountUsername, setMainAccountUsername] = useState('');
  const [trail, setTrail] = useState([]); // [{ username, fullName }]

  const fetchTree = async (targetUsername = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (targetUsername) {
        params.username = targetUsername;
      }
      const res = await api.get('/dashboard/genealogy', { params });
      if (res.data && res.data.data) {
        const data = res.data.data;
        setTree(data);

        // Jika pemuatan awal
        if (!targetUsername && !mainAccountUsername) {
          setMainAccountUsername(data.username);
          setRootUsername(data.username);
          setTrail([{ username: data.username, fullName: data.full_name }]);
        } else if (targetUsername) {
          setRootUsername(data.username);
          setTrail((prev) => {
            const existingIdx = prev.findIndex((item) => item.username === data.username);
            if (existingIdx !== -1) {
              return prev.slice(0, existingIdx + 1);
            }
            return [...prev, { username: data.username, fullName: data.full_name }];
          });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memuat pohon jaringan.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleDrillDown = (username, fullName = '') => {
    if (!username) return;
    fetchTree(username);
  };

  const handleResetToMain = () => {
    if (mainAccountUsername) {
      fetchTree(mainAccountUsername);
      setTrail((prev) => prev.slice(0, 1));
    } else {
      fetchTree();
    }
  };

  const handleGoUpOneLevel = () => {
    if (tree?.upline_username) {
      handleDrillDown(tree.upline_username);
    } else if (trail.length > 1) {
      const parent = trail[trail.length - 2];
      handleDrillDown(parent.username);
    }
  };

  const handleBreadcrumbClick = (idx) => {
    if (trail[idx]) {
      handleDrillDown(trail[idx].username);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchTerm.trim().replace(/^@/, '');
    if (clean) {
      handleDrillDown(clean);
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(1.3, Math.max(0.7, +(prev + delta).toFixed(2))));
  };

  const handleResetZoom = () => setZoomLevel(1);

  const renderNode = (node, positionLabel, uplineNode = null, position = 'kiri', isRoot = false) => {
    if (!node) {
      const isSelectable = !!uplineNode;
      return (
        <div
          onClick={() => {
            if (isSelectable) {
              setRegisterSlot({
                upline: uplineNode,
                position: position,
                label: positionLabel,
              });
            }
          }}
          className={`w-48 p-4 rounded-xl border-2 border-dashed transition-all duration-200 text-center group ${
            isSelectable
              ? 'border-emerald-300/80 hover:border-emerald-500 bg-white hover:bg-emerald-50/40 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]'
              : 'border-slate-200 bg-slate-50/50 opacity-50 cursor-not-allowed'
          }`}
          title={
            isSelectable
              ? `Klik untuk daftarkan mitra baru di slot ${positionLabel} di bawah @${uplineNode.username}`
              : `Slot ${positionLabel} (Isi posisi di atasnya terlebih dahulu)`
          }
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-200 ${
              isSelectable
                ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-2xs'
                : 'bg-slate-100 text-slate-300'
            }`}
          >
            <UserPlus size={18} />
          </div>
          <div className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
            Slot {positionLabel} Kosong
          </div>
          {isSelectable ? (
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1 group-hover:underline">
              <span>+ Daftarkan Downline</span>
            </div>
          ) : (
            <div className="text-[10px] text-slate-400 mt-1">
              Terkunci (Isi upline dulu)
            </div>
          )}
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
              ? rootUsername && rootUsername !== mainAccountUsername
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isRoot
            ? rootUsername && rootUsername !== mainAccountUsername
              ? 'Fokus Downline'
              : 'Akun Utama'
            : 'Mitra Downline'}
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

        {/* Action Button: Buka Pohon Downline Ini */}
        {!isRoot && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDrillDown(node.username, node.full_name);
            }}
            className="w-full mt-2 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs group/drill"
            title={`Buka pohon jaringan di bawah @${node.username}`}
          >
            <GitFork size={12} className="text-emerald-600 group-hover/drill:text-white transition-colors" />
            <span>Buka Pohon</span>
          </button>
        )}
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

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {/* Quick Return to Main Account if viewing downline */}
          {rootUsername && rootUsername !== mainAccountUsername && (
            <button
              onClick={handleResetToMain}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors flex-shrink-0"
              title="Kembali ke Akun Utama Saya"
            >
              <Home size={13} />
              <span>Akun Utama</span>
            </button>
          )}

          {/* Search Downline Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial min-w-[150px]">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari & buka @username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dash-input pl-8 pr-14 py-1.5 text-xs w-full sm:w-52"
            />
            {searchTerm.trim() && (
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-colors"
              >
                Buka
              </button>
            )}
          </form>

          {/* Zoom Buttons */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
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
            onClick={() => fetchTree(rootUsername)}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex-shrink-0"
            title="Segarkan Struktur Pohon"
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin text-emerald-600' : ''}
            />
          </button>
        </div>
      </div>

      {/* Downline Focus Banner */}
      {rootUsername && rootUsername !== mainAccountUsername && tree && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs flex-shrink-0">
              <GitFork size={18} />
            </div>
            <div>
              <div className="text-xs text-emerald-950 font-bold flex items-center gap-1.5 flex-wrap">
                <span>Sedang Menampilkan Pohon:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-extrabold tracking-wide">
                  @{tree.username}
                </span>
                {tree.full_name && (
                  <span className="text-emerald-800 font-semibold">({tree.full_name})</span>
                )}
              </div>
              <div className="text-[11px] text-emerald-700/90 mt-0.5 flex items-center gap-2">
                <span>
                  Upline Langsung:{' '}
                  <button
                    onClick={() => handleDrillDown(tree.upline_username)}
                    className="font-bold underline hover:text-emerald-900"
                  >
                    @{tree.upline_username || 'Pusat'}
                  </button>
                </span>
                <span>•</span>
                <span>
                  Kaki Binary: <strong className="capitalize">{tree.position || 'Utama'}</strong>
                </span>
                <span>•</span>
                <span>Omset: L {tree.point_left || 0} PV | R {tree.point_right || 0} PV</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            {tree.upline_username && (
              <button
                type="button"
                onClick={handleGoUpOneLevel}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
                title={`Naik ke Upline @${tree.upline_username}`}
              >
                <ArrowUp size={13} />
                <span>Naik 1 Level</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleResetToMain}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Kembali ke Akun Utama Saya"
            >
              <Home size={13} />
              <span>Akun Utama Saya</span>
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs Trail */}
      {trail.length > 1 && (
        <div className="flex items-center gap-1 text-xs text-slate-500 flex-wrap px-1">
          <span className="font-bold text-slate-400 mr-1">Navigasi:</span>
          {trail.map((item, idx) => {
            const isLast = idx === trail.length - 1;
            return (
              <React.Fragment key={item.username}>
                {idx > 0 && <ChevronRight size={13} className="text-slate-300 flex-shrink-0" />}
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`transition-colors px-2 py-0.5 rounded-md text-xs ${
                    isLast
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'hover:text-emerald-700 hover:bg-slate-100 text-slate-600 font-semibold'
                  }`}
                  title={isLast ? 'Posisi Saat Ini' : `Buka pohon @${item.username}`}
                >
                  {idx === 0 ? `🏠 Akun Utama (@${item.username})` : `@${item.username}`}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="dash-card p-3 sm:p-6 overflow-hidden min-h-[480px]">
        {loading ? (
          <div className="text-center py-24 text-slate-400">
            <RefreshCw size={28} className="animate-spin text-emerald-600 mx-auto mb-2" />
            <p className="text-xs">Memuat struktur pohon kemitraan binary...</p>
          </div>
        ) : (
          <div className="overflow-x-auto py-4 sm:py-6 touch-pan-x touch-pan-y scrollbar-none">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="min-w-[820px] flex flex-col items-center mx-auto"
            >
              {/* Level 1: Root */}
              <div className="flex flex-col items-center">
                {renderNode(tree, 'Pusat', null, 'kiri', true)}
                <div className="tree-line-v my-1" />
              </div>

              {/* Level 2 & 3: Branches */}
              <div className="tree-branches">
                {/* Left Branch */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider mb-2">
                    ◀ Jalur Kaki Kiri
                  </span>
                  {renderNode(tree?.left_node, 'Kiri', tree, 'kiri')}
                  <div className="tree-line-v my-1" />

                  {/* Level 3: Left-Left and Left-Right */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-1">
                    {renderNode(tree?.left_node?.left_node, 'L-Kiri', tree?.left_node, 'kiri')}
                    {renderNode(tree?.left_node?.right_node, 'L-Kanan', tree?.left_node, 'kanan')}
                  </div>
                </div>

                {/* Right Branch */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                    Jalur Kaki Kanan ▶
                  </span>
                  {renderNode(tree?.right_node, 'Kanan', tree, 'kanan')}
                  <div className="tree-line-v my-1" />

                  {/* Level 3: Right-Left and Right-Right */}
                  <div className="grid grid-cols-2 gap-4 w-full mt-1">
                    {renderNode(tree?.right_node?.left_node, 'R-Kiri', tree?.right_node, 'kiri')}
                    {renderNode(tree?.right_node?.right_node, 'R-Kanan', tree?.right_node, 'kanan')}
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
            <span className="w-3 h-3 rounded border-2 border-dashed border-emerald-400" />
            <span>Slot Kosong Siap Diisi (+Daftar)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>Hasil Pencarian</span>
          </div>
        </div>
      </div>

      {/* Selected Node Modal */}
      {selectedNode && createPortal(
        <div
          className="fixed inset-0 z-[100] !m-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200/90 ring-1 ring-slate-900/5 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 ease-out"
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

              {/* Drill-down button if selectedNode is not the current root */}
              {selectedNode.username !== tree?.username && (
                <button
                  type="button"
                  onClick={() => {
                    handleDrillDown(selectedNode.username, selectedNode.full_name);
                    setSelectedNode(null);
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <GitFork size={15} />
                  <span>Buka Pohon Jaringan @{selectedNode.username}</span>
                </button>
              )}

              {/* Quick placement actions under this node */}
              <div className="flex gap-2 pt-1">
                {!selectedNode.left_node && (
                  <button
                    onClick={() => {
                      const up = selectedNode;
                      setSelectedNode(null);
                      setRegisterSlot({
                        upline: up,
                        position: 'kiri',
                        label: `Kiri @${up.username}`,
                      });
                    }}
                    className="flex-1 py-2 px-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UserPlus size={14} />
                    <span>+ Pasang Kaki Kiri</span>
                  </button>
                )}
                {!selectedNode.right_node && (
                  <button
                    onClick={() => {
                      const up = selectedNode;
                      setSelectedNode(null);
                      setRegisterSlot({
                        upline: up,
                        position: 'kanan',
                        label: `Kanan @${up.username}`,
                      });
                    }}
                    className="flex-1 py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <UserPlus size={14} />
                    <span>+ Pasang Kaki Kanan</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors mt-2"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Registration Downline Modal via Serial PIN */}
      {registerSlot && (
        <RegisterDownlineModal
          isOpen={!!registerSlot}
          onClose={() => setRegisterSlot(null)}
          upline={registerSlot.upline}
          position={registerSlot.position}
          onSuccess={() => {
            fetchTree();
          }}
        />
      )}
    </div>
  );
}
