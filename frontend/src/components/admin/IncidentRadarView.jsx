import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Activity,
  Server,
  Zap,
  RefreshCw,
  Clock,
  Filter,
  Check,
  Cpu,
  Database,
  Mail,
  Video,
  FileCode,
  X
} from 'lucide-react';
import api from '../../services/api';

export default function IncidentRadarView() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [wahaStats, setWahaStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterComponent, setFilterComponent] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [unresolvedOnly, setUnresolvedOnly] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Polling tiap 10 detik
    return () => clearInterval(interval);
  }, [filterComponent, filterLevel, unresolvedOnly]);

  const loadData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filterComponent) queryParams.set('component', filterComponent);
      if (filterLevel) queryParams.set('level', filterLevel);
      if (unresolvedOnly) queryParams.set('unresolved_only', 'true');

      const [statRes, incRes, wahaRes] = await Promise.all([
        api.get('/incidents/stats'),
        api.get(`/incidents?${queryParams.toString()}`),
        api.get('/waha/queue/stats').catch(() => ({ data: { data: null } })),
      ]);

      if (statRes.data?.data) setStats(statRes.data.data);
      if (incRes.data?.data) setIncidents(incRes.data.data);
      if (wahaRes.data?.data) setWahaStats(wahaRes.data.data);
    } catch (err) {
      console.warn('Gagal memuat log insiden:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      await api.post(`/incidents/${id}/resolve`);
      setIncidents((prev) =>
        prev.map((inc) => (inc.id === id ? { ...inc, is_resolved: true } : inc))
      );
      if (selectedIncident?.id === id) {
        setSelectedIncident((prev) => ({ ...prev, is_resolved: true }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menandai insiden selesai.');
    } finally {
      setResolvingId(null);
    }
  };

  const getComponentIcon = (comp) => {
    switch (comp) {
      case 'whatsapp_engine':
        return <Zap size={14} className="text-emerald-500" />;
      case 'database':
        return <Database size={14} className="text-sky-500" />;
      case 'email_smtp':
        return <Mail size={14} className="text-indigo-500" />;
      case 'tiktok_api':
        return <Video size={14} className="text-rose-500" />;
      case 'system_runtime':
        return <Cpu size={14} className="text-amber-500" />;
      default:
        return <Server size={14} className="text-slate-500" />;
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
            <AlertTriangle size={10} /> CRITICAL
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
            <ShieldAlert size={10} /> ERROR
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI System Health */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Log Gangguan Sistem & Incident Telemetry
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                Live Radar
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Pencatatan persisten gangguan runtime, kegagalan antrean WhatsApp, disconnect gateway, dan toleransi fault sistem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-400">System Uptime Rate</p>
            <p className="text-lg font-black text-emerald-600">
              {stats?.system_health_rate ? stats.system_health_rate.toFixed(2) : '99.95'}%
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Log"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-rose-500' : ''} />
          </button>
        </div>
      </div>

      {/* Component Matrix & High-Concurrency WAHA Worker Queue Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {stats?.component_status &&
          Object.entries(stats.component_status).map(([comp, status]) => (
            <div
              key={comp}
              className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex items-center gap-2.5"
            >
              <div className="p-2 rounded-lg bg-slate-50">{getComponentIcon(comp)}</div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase truncate">
                  {comp.replace('_', ' ')}
                </p>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                    status === 'operational'
                      ? 'text-emerald-700 bg-emerald-50'
                      : status === 'degraded'
                      ? 'text-amber-700 bg-amber-50'
                      : 'text-rose-700 bg-rose-50'
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>
          ))}

        {/* Go-WAHA Concurrency Worker Telemetry */}
        {wahaStats && (
          <div className="col-span-2 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap size={18} className="text-amber-400 animate-pulse" />
              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase">Go-WAHA Goroutine Workers</p>
                <p className="text-xs font-semibold text-white">
                  {wahaStats.active_workers} Workers Concurrent
                </p>
              </div>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-emerald-400 font-bold">{wahaStats.processed_jobs} Sent</span>
              <span className="text-slate-400 mx-1">/</span>
              <span className="text-rose-400 font-bold">{wahaStats.failed_jobs} Failed</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar & Incident List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="">Semua Komponen</option>
              <option value="whatsapp_engine">WhatsApp Engine</option>
              <option value="database">Database</option>
              <option value="email_smtp">Email SMTP</option>
              <option value="tiktok_api">TikTok API</option>
              <option value="system_runtime">System Runtime</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
            >
              <option value="">Semua Tingkat Keparahan</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer ml-2">
              <input
                type="checkbox"
                checked={unresolvedOnly}
                onChange={(e) => setUnresolvedOnly(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              Hanya Gangguan Belum Selesai
            </label>
          </div>

          <span className="text-xs text-slate-400">Total {incidents.length} Catatan Insiden</span>
        </div>

        {incidents.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <CheckCircle size={36} className="mx-auto mb-2 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-700">Sistem Berjalan Normal Tanpa Gangguan</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh komponen WhatsApp, Database, Email, dan API beroperasi secara sehat.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                  !inc.is_resolved ? 'bg-rose-50/15' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 mt-0.5 flex-shrink-0">
                    {getComponentIcon(inc.component)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getLevelBadge(inc.level)}
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {inc.component}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{inc.title}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{inc.message}</p>

                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(inc.created_at).toLocaleString('id-ID')}
                      {inc.is_resolved && (
                        <span className="ml-2 font-semibold text-emerald-600 flex items-center gap-0.5">
                          <Check size={11} /> Diselesaikan oleh {inc.resolved_by || 'admin'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {!inc.is_resolved ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(inc.id);
                    }}
                    disabled={resolvingId === inc.id}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1 transition-all disabled:opacity-50 flex-shrink-0"
                  >
                    <Check size={12} />
                    {resolvingId === inc.id ? 'Memproses...' : 'Tandai Selesai'}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 flex-shrink-0">
                    <CheckCircle size={14} /> Terselesaikan
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Stack Trace & Payload */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getLevelBadge(selectedIncident.level)}
                  <span className="text-xs font-bold uppercase text-slate-500">
                    {selectedIncident.component}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedIncident.title}</h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pesan Gangguan:</label>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {selectedIncident.message}
              </p>
            </div>

            {selectedIncident.payload && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Debug Payload / Stack Trace:
                </label>
                <pre className="text-[11px] font-mono text-slate-700 bg-slate-900 text-slate-100 p-3.5 rounded-xl overflow-x-auto max-h-60">
                  {selectedIncident.payload}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Terjadi pada: {new Date(selectedIncident.created_at).toLocaleString('id-ID')}
              </span>
              <div className="flex items-center gap-2">
                {!selectedIncident.is_resolved && (
                  <button
                    onClick={() => handleResolve(selectedIncident.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                  >
                    Tandai Telah Diperbaiki
                  </button>
                )}
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

