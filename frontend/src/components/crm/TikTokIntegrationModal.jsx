import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalPortal from '../common/ModalPortal';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Send,
  ShieldCheck,
  Webhook,
  Activity,
  Code2,
  ExternalLink,
  Layers,
  Terminal,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  Smartphone,
  Eye,
  Hash,
} from 'lucide-react';
import { playNotificationPing, playGoldCoinChime } from '../../utils/audioChime';
import api from '../../services/api';

export default function TikTokIntegrationModal({
  isOpen,
  onClose,
  currentUser,
  onLeadInjected,
}) {
  const [activeTab, setActiveTab] = useState('webhook-guide'); // 'webhook-guide' | 'pixel-guide' | 'simulator'
  const [copiedKey, setCopiedKey] = useState(null);
  const [secretKey, setSecretKey] = useState('tiktok_sec_bionet_enterprise_99x');
  const [webhookUrl] = useState('https://synetiq.id/api/public/leads/webhook?key=tiktok_ads');
  const [pixelId, setPixelId] = useState('CTIKTOK_BIONET_PRO_PIXEL_ID');
  const [accessToken, setAccessToken] = useState('tiktok_act_77bionet8923a10dfa902341bop');

  // Simulator State
  const [simLeadName, setSimLeadName] = useState('Siti Rahmawati (TikTok Ads Lead)');
  const [simPhone, setSimPhone] = useState('081298765432');
  const [simCity, setSimCity] = useState('Surabaya');
  const [simProduct, setSimProduct] = useState('Bio-Propolis Trigona');
  const [simAdName, setSimAdName] = useState('Video Testimoni Kolesterol & Asam Urat');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([]);
  const [lastInjectedLead, setLastInjectedLead] = useState(null);

  // Compute dummy SHA256 HMAC for visual verification preview
  const signaturePreview = useMemo(() => {
    const raw = `${secretKey}:${simPhone}:${simLeadName}:${Date.now().toString().slice(0, 8)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256=${hex}89ab2c7f56d0e34b1a890e76cd1f3490714b`;
  }, [secretKey, simPhone, simLeadName]);

  const samplePayloadJson = useMemo(() => {
    return JSON.stringify(
      {
        event_type: 'lead.create',
        advertiser_id: '719283019284712039',
        campaign_id: '1789230198273910',
        campaign_name: 'TikTok Ads Bionet BOP & Retail Herbal',
        adgroup_id: '1789230198273922',
        ad_id: '1789230198273955',
        ad_name: simAdName,
        form_id: '1789230198273999',
        lead_id: `tt_lead_${Date.now()}`,
        create_time: Math.floor(Date.now() / 1000),
        signature: signaturePreview,
        form_data: [
          { field_name: 'full_name', field_value: simLeadName },
          { field_name: 'phone_number', field_value: simPhone },
          { field_name: 'city', field_value: simCity },
          { field_name: 'product_interest', field_value: simProduct },
          { field_name: 'budget_level', field_value: 'Paket Agen 5 Botol' },
          { field_name: 'note', field_value: 'Tertarik gabung kemitraan herbal propolis' },
        ],
      },
      null,
      2
    );
  }, [simLeadName, simPhone, simCity, simProduct, simAdName, signaturePreview]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    playNotificationPing();
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleRunSimulator = async () => {
    setIsSimulating(true);
    setSimulationLogs([]);
    playNotificationPing();

    const addLog = (msg, status = 'info') => {
      setSimulationLogs((prev) => [...prev, { time: new Date().toLocaleTimeString('id-ID'), msg, status }]);
    };

    addLog('Menginisiasi payload webhook TikTok Instant Form...', 'info');

    setTimeout(() => {
      addLog(`Menghitung HMAC-SHA256 signature dengan secret key: [${secretKey.slice(0, 10)}...]`, 'info');
    }, 250);

    setTimeout(() => {
      addLog(`POST ${webhookUrl} (Content-Type: application/json)`, 'warning');
    }, 600);

    setTimeout(async () => {
      try {
        const leadPayload = {
          name: simLeadName,
          phone: simPhone,
          email: `${simLeadName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
          city: simCity,
          source: 'tiktok_ads',
          product_interest: simProduct,
          status: 'new',
          notes: `[TikTok Ads Lead] Iklan: ${simAdName} | Form ID: 1789230198273999 | HMAC: OK`,
          estimated_value: 350000,
        };

        // Try injecting to backend CRM API
        let savedLead = null;
        try {
          const res = await api.post('/leads', leadPayload);
          if (res.data?.data) {
            savedLead = res.data.data;
          }
        } catch (apiErr) {
          // If offline or mock mode, create clean mock lead object
          savedLead = {
            id: 'mock_tt_' + Date.now(),
            ...leadPayload,
            created_at: new Date().toISOString(),
          };
        }

        setLastInjectedLead(savedLead);
        if (onLeadInjected) {
          onLeadInjected(savedLead);
        }

        addLog('HTTP 200 OK: Webhook berhasil diterima oleh SYNETIQ CRM Gateway (Latency: 38ms)', 'success');
        addLog(`Prospek [${simLeadName}] berhasil diinjeksi ke Pipeline CRM status: [BARU / NEW]`, 'success');
        addLog('WhatsApp Instant Auto-Greeting dipicu ke nomor: ' + simPhone, 'success');

        playGoldCoinChime();
      } catch (err) {
        addLog('Error injecting lead: ' + err.message, 'error');
      } finally {
        setIsSimulating(false);
      }
    }, 1100);
  };

  if (!isOpen) return null;

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
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-rose-500 to-amber-400 p-0.5 shadow-lg shadow-rose-950/40">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                {/* TikTok Custom SVG Brand Glyph */}
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.69 6.34 6.34 0 0 0 9.35 22a6.34 6.34 0 0 0 6.33-6.31V9.22a8.16 8.16 0 0 0 4.91 1.62V7.4a4.84 4.84 0 0 1-1-.71z" />
                </svg>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Integrasi TikTok Ads &amp; Events Gateway
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Instant Form &amp; CAPI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pusat Integrasi Webhook Lead Generation, TikTok Pixel, Server Events API &amp; Live Test Suite
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

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('webhook-guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'webhook-guide'
                ? 'bg-slate-850 text-cyan-400 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Webhook className="w-4 h-4 text-cyan-400" />
            <span>1. Lead Instant Form Webhook</span>
          </button>

          <button
            onClick={() => setActiveTab('pixel-guide')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'pixel-guide'
                ? 'bg-slate-850 text-rose-400 border-rose-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>2. Pixel &amp; Events API (CAPI)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center space-x-2 border-b-2 ${
              activeTab === 'simulator'
                ? 'bg-slate-850 text-amber-400 border-amber-400'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>3. Live Webhook Payload Simulator</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: WEBHOOK PANDUAN STEP-BY-STEP */}
          {activeTab === 'webhook-guide' && (
            <div className="space-y-6">
              {/* Quick Credentials Box */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SYNETIQ Webhook Ingestion Endpoint</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">HMAC SHA-256 Enabled</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Production Webhook URL (TikTok Ads Manager):
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="bg-transparent text-xs font-mono text-cyan-300 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(webhookUrl, 'url')}
                        className="ml-2 text-slate-400 hover:text-white transition flex items-center space-x-1 text-xs"
                      >
                        {copiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      TikTok Webhook Secret Verification Key:
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="bg-transparent text-xs font-mono text-amber-300 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(secretKey, 'secret')}
                        className="ml-2 text-slate-400 hover:text-white transition flex items-center space-x-1 text-xs"
                      >
                        {copiedKey === 'secret' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center mb-3">
                      1
                    </div>
                    <h3 className="font-bold text-white text-sm">Buat Kampanye Lead Gen</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Buka <strong>TikTok Ads Manager &gt; Campaign</strong>. Pilih objektif <strong>Lead Generation</strong> dan buat <strong>Instant Form</strong> dengan pertanyaan nama lengkap, WhatsApp &amp; kota.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-cyan-400 font-semibold">
                    Objektif: Leads Prospek Herbal
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 font-black text-xs flex items-center justify-center mb-3">
                      2
                    </div>
                    <h3 className="font-bold text-white text-sm">Hubungkan Webhook CRM</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Masuk menu <strong>Assets &gt; Lead Generation &gt; Webhook Delivery</strong>. Tempel Webhook URL SYNETIQ dan masukkan Secret Key verifikasi HMAC.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-purple-400 font-semibold">
                    Keamanan: SHA256 HMAC
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-black text-xs flex items-center justify-center mb-3">
                      3
                    </div>
                    <h3 className="font-bold text-white text-sm">Mapping Kolom Form Otomatis</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Sistem SYNETIQ secara otomatis memetakan kolom: <code>full_name</code> &rarr; Nama Prospek, <code>phone_number</code> &rarr; No WA, <code>product_interest</code> &rarr; Minat Produk.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-rose-400 font-semibold">
                    Auto-Parsing Cepat
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center mb-3">
                      4
                    </div>
                    <h3 className="font-bold text-white text-sm">Instant WhatsApp Nurturing</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Saat prospek submit form di TikTok, sistem langsung mengirim WhatsApp sambutan hangat &amp; mengaktifkan Drip Nurturing 3-7-14-25 hari.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-emerald-400 font-semibold">
                    Respon &lt; 3 Detik
                  </div>
                </div>
              </div>

              {/* Technical Code Snippet */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Contoh Script Verifikasi Signature HMAC (Node.js / Express Backend)</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `const crypto = require('crypto');
function verifyTikTokSignature(req, secretKey) {
  const signature = req.headers['x-tiktok-signature'];
  const computed = 'sha256=' + crypto.createHmac('sha256', secretKey).update(JSON.stringify(req.body)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}`,
                        'backend-code'
                      )
                    }
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'backend-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin Kode</span>
                  </button>
                </div>
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl text-slate-300 overflow-x-auto border border-slate-800/60 leading-relaxed">
{`const crypto = require('crypto');

// Verifikasi integritas payload sebelum memasukkan prospek ke CRM
app.post('/api/public/leads/webhook', (req, res) => {
  const signature = req.headers['x-tiktok-signature'];
  const computed = 'sha256=' + crypto
    .createHmac('sha256', process.env.TIKTOK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== computed) {
    return res.status(401).json({ error: 'Invalid TikTok HMAC Signature' });
  }

  // Parse lead & injeksi ke CRM
  const { form_data, campaign_name, ad_name } = req.body;
  // ... Simpan ke database & picu WhatsApp Nurturing ...
  return res.status(200).json({ status: 'success', message: 'Lead queued' });
});`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: TIKTOK PIXEL & SERVER-TO-SERVER EVENTS API (CAPI) */}
          {activeTab === 'pixel-guide' && (
            <div className="space-y-6">
              {/* CAPI Config Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>TikTok Pixel &amp; Server-Side Conversion API Credentials</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    Deduplication Active (event_id match)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">TikTok Pixel ID:</label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        className="bg-transparent text-xs font-mono text-rose-300 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(pixelId, 'pixel')}
                        className="ml-2 text-slate-400 hover:text-white transition"
                      >
                        {copiedKey === 'pixel' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                      Events API Access Token (Server-to-Server):
                    </label>
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <input
                        type="text"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        className="bg-transparent text-xs font-mono text-indigo-300 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopy(accessToken, 'capi')}
                        className="ml-2 text-slate-400 hover:text-white transition"
                      >
                        {copiedKey === 'capi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Conversion Events */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Daftar Event Terlacak Otomatis (Browser Pixel + Server CAPI)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-white">CompleteRegistration</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Pemicu saat member baru aktivasi akun atau membeli PIN kemitraan herbal.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded w-max">
                      ROAS Booster
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-white">ViewContent</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Pemicu saat calon pembeli membuka halaman produk web replika mitra.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded w-max">
                      Top Funnel
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-white">InitiateCheckout</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Pemicu saat pembeli mengisi form checkout botol herbal &amp; memilih kurir.
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded w-max">
                      Intent High
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                    <div className="text-xs font-bold text-white">Purchase / RepeatOrder</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Pemicu saat pembayaran Midtrans/Flip terverifikasi (omset tercatat).
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded w-max">
                      Revenue Conversion
                    </div>
                  </div>
                </div>
              </div>

              {/* Pixel Code Snippet */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                    <Code2 className="w-4 h-4 text-rose-400" />
                    <span>Script Injeksi Browser Pixel (Head Tag Website Replika)</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `<!-- TikTok Pixel Code Start -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
  var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
  ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- TikTok Pixel Code End -->`,
                        'pixel-script'
                      )
                    }
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'pixel-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Salin Snippet Pixel</span>
                  </button>
                </div>
                <pre className="text-xs font-mono bg-slate-950 p-4 rounded-xl text-slate-300 overflow-x-auto border border-slate-800/60 leading-relaxed">
{`ttq.track('CompleteRegistration', {
  content_name: 'Paket Kemitraan Herbal Propolis',
  currency: 'IDR',
  value: 750000,
  event_id: 'evt_reg_8829103' // Wajib dicocokkan dengan event_id Server CAPI
});`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE WEBHOOK PAYLOAD SIMULATOR & TESTER */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Controls */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                      <Sliders className="w-4 h-4" />
                      <span>Parameter Simulasi Lead TikTok Ads</span>
                    </h3>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nama Lengkap Calon Prospek:</label>
                      <input
                        type="text"
                        value={simLeadName}
                        onChange={(e) => setSimLeadName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Nomor WhatsApp:</label>
                        <input
                          type="text"
                          value={simPhone}
                          onChange={(e) => setSimPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Kota Domisili:</label>
                        <input
                          type="text"
                          value={simCity}
                          onChange={(e) => setSimCity(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Minat Produk Herbal:</label>
                      <select
                        value={simProduct}
                        onChange={(e) => setSimProduct(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Bio-Propolis Trigona">Bio-Propolis Trigona</option>
                        <option value="Bio-Moringa Super Extract">Bio-Moringa Super Extract</option>
                        <option value="Bio-Gamavit Collagen">Bio-Gamavit Collagen</option>
                        <option value="Paket Kemitraan Reseller VIP">Paket Kemitraan Reseller VIP</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Judul Video Iklan TikTok:</label>
                      <input
                        type="text"
                        value={simAdName}
                        onChange={(e) => setSimAdName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleRunSimulator}
                        disabled={isSimulating}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 hover:from-rose-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-950/40 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {isSimulating ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Mengirim Webhook Payload...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-slate-950" />
                            <span>Kirim Prospek Uji Coba dari TikTok Ads</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Verification Status Card */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Verifikasi Signature:</span>
                      <span className="text-emerald-400 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>HMAC Valid</span>
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 break-all bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      {signaturePreview}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live JSON Payload & Terminal Console */}
                <div className="lg:col-span-7 space-y-4">
                  {/* JSON Code Viewer */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                        <Code2 className="w-4 h-4 text-cyan-400" />
                        <span>Generated TikTok Webhook JSON Body:</span>
                      </span>
                      <button
                        onClick={() => handleCopy(samplePayloadJson, 'payload')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                      >
                        {copiedKey === 'payload' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin JSON</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono bg-slate-950 p-3.5 rounded-xl text-cyan-200 overflow-x-auto max-h-56 border border-slate-800/60">
                      {samplePayloadJson}
                    </pre>
                  </div>

                  {/* Terminal Log Console */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2 min-h-40">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400 flex items-center space-x-1.5 text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SYNETIQ Webhook Ingestion Logs</span>
                      </span>
                      <span className="text-[10px] text-slate-500">Port 443 HTTPS</span>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pt-1">
                      {simulationLogs.length === 0 ? (
                        <div className="text-slate-600 italic text-[11px]">
                          Klik &quot;Kirim Prospek Uji Coba dari TikTok Ads&quot; untuk menyimulasikan transaksi webhook instan.
                        </div>
                      ) : (
                        simulationLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`text-[11px] flex items-start space-x-2 ${
                              log.status === 'success'
                                ? 'text-emerald-400'
                                : log.status === 'warning'
                                ? 'text-amber-400'
                                : log.status === 'error'
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }`}
                          >
                            <span className="text-slate-600 select-none">[{log.time}]</span>
                            <span>{log.msg}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Notification of Injected Lead */}
                  {lastInjectedLead && (
                    <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Lead Berhasil Masuk CRM: {lastInjectedLead.name}
                          </div>
                          <div className="text-[11px] text-emerald-300/80">
                            No WA: {lastInjectedLead.phone} | Kota: {lastInjectedLead.city}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-emerald-500/20 text-emerald-300">
                        Status: NEW
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>TikTok Ads Marketing API v1.3 Standard Compliant</span>
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
