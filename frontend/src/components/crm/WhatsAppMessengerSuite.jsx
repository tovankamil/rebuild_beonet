import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  RefreshCw,
  Plus,
  Smartphone,
  Radio,
  QrCode,
  ShieldCheck,
  Zap,
  Users,
  Download,
  CheckCircle2,
  ExternalLink,
  Filter,
  Trash2,
  X,
} from 'lucide-react';
import api from '../../services/api';
import ModalPortal from '../common/ModalPortal';
import { downloadVCardContact, downloadBatchVCard } from '../../utils/vCardGenerator';

export default function WhatsAppMessengerSuite({ user, onOpenObjectionModal }) {
  // Navigation Sub-tab
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'broadcast' | 'bot' | 'device' | 'contacts' | 'logs'

  // Chat Messenger State
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [threadFilter, setThreadFilter] = useState('all'); // 'all' | 'unread' | 'new' | 'interested' | 'closing' | 'health_journey'
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTypingSimulated, setIsTypingSimulated] = useState(false);

  // New Chat Modal State
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [newChatProduct, setNewChatProduct] = useState('Bio-Propolis Trigona 30ml');
  const [newChatCity, setNewChatCity] = useState('');
  const [newChatStage, setNewChatStage] = useState('new');

  // Broadcast State
  const [broadcasts, setBroadcasts] = useState([]);
  const [bcTitle, setBcTitle] = useState('');
  const [bcSegment, setBcSegment] = useState('all');
  const [bcTemplate, setBcTemplate] = useState('Halo {{nama}}, salam sehat dari Bionet Official! 🙏\n\nKami memiliki penawaran spesial untuk produk {{produk}} khusus hari ini dengan subsidi gratis ongkir ke {{kota}}.\n\nApakah berkenan kami siapkan paketnya? 🌿');
  const [bcDelay, setBcDelay] = useState(8);
  const [bcSending, setBcSending] = useState(false);
  const [bcSuccessAlert, setBcSuccessAlert] = useState('');

  // Bot & Auto-Responder State
  const [botRules, setBotRules] = useState([]);
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRuleReply, setNewRuleReply] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('general');
  const [botTestInput, setBotTestInput] = useState('');
  const [botTestResult, setBotTestResult] = useState('');

  // Device & Gateway Status State
  const [deviceSession, setDeviceSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [pairPhone, setPairPhone] = useState('+6281234567890');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairSuccessMsg, setPairSuccessMsg] = useState('');

  // AI Assistant Drafting in Chat
  const [aiDrafting, setAiDrafting] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTypingSimulated]);

  // Fetch Chat Threads
  const fetchThreads = async () => {
    try {
      const res = await api.get('/crm/whatsapp/threads');
      if (res.data?.data) {
        setThreads(res.data.data);
        if (!activeThreadId && res.data.data.length > 0) {
          setActiveThreadId(res.data.data[0].ID || res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Fetch Messages for Active Thread
  const fetchMessages = async (tId) => {
    if (!tId) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/crm/whatsapp/threads/${tId}/messages`);
      if (res.data?.data) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch thread messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch Device & Broadcasts & Bot Rules
  const fetchAuxiliaryData = async () => {
    try {
      const [resDev, resBc, resBot, resLogs] = await Promise.all([
        api.get('/crm/whatsapp/device'),
        api.get('/crm/whatsapp/broadcasts'),
        api.get('/crm/whatsapp/bot-rules'),
        api.get('/crm/whatsapp/logs'),
      ]);
      if (resDev.data?.data) setDeviceSession(resDev.data.data);
      if (resBc.data?.data) setBroadcasts(resBc.data.data);
      if (resBot.data?.data) setBotRules(resBot.data.data);
      if (resLogs.data?.data) setLogs(resLogs.data.data);
    } catch (err) {
      console.error('Failed to load auxiliary WhatsApp data:', err);
    }
  };

  // Polling updates every 6 seconds
  useEffect(() => {
    fetchThreads();
    fetchAuxiliaryData();
    const interval = setInterval(() => {
      fetchAuxiliaryData();
      if (activeThreadId) {
        api.get(`/crm/whatsapp/threads/${activeThreadId}/messages`).then((res) => {
          if (res.data?.data) setMessages(res.data.data);
        });
      }
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // When active thread changes, fetch its messages
  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId]);

  const activeThread = threads.find(
    (t) => (t.ID || t.id) === activeThreadId
  );

  // Send message in current thread
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeThreadId) return;

    const messageText = inputText.trim();
    setInputText('');
    setSendingMessage(true);

    try {
      const res = await api.post(`/crm/whatsapp/threads/${activeThreadId}/messages`, {
        text: messageText,
        media_type: 'text',
      });

      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
        // Update thread preview
        setThreads((prev) =>
          prev.map((t) =>
            (t.ID || t.id) === activeThreadId
              ? { ...t, last_message: messageText, last_message_time: new Date().toISOString() }
              : t
          )
        );

        // Simulate customer typing indicator after 2.5s
        setTimeout(() => {
          setIsTypingSimulated(true);
          setTimeout(() => {
            setIsTypingSimulated(false);
            fetchMessages(activeThreadId);
          }, 3500);
        }, 2200);
      }
    } catch (err) {
      alert('Gagal mengirim pesan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingMessage(false);
    }
  };

  // AI Assistant Drafting in Chat
  const handleDraftWithAI = async () => {
    if (!activeThread) return;
    setAiDrafting(true);
    try {
      const res = await api.post('/crm/ai/objection-handler', {
        objection_type: 'ragu_khasiat',
        customer_name: activeThread.contact_name,
        product_name: activeThread.product || 'Bio-Propolis Trigona',
        lead_name: activeThread.contact_name,
        lead_phone: activeThread.phone,
        tone: 'ramah, empatik dan berwibawa',
      });

      if (res.data?.whatsapp_ready_text || res.data?.response_text) {
        setInputText(res.data.whatsapp_ready_text || res.data.response_text);
      }
    } catch (err) {
      setInputText(
        `Halo ${activeThread.contact_name}, terima kasih telah berkonsultasi dengan Bionet! 🙏 Produk ${activeThread.product || 'Bio-Propolis Trigona'} kami 100% berizin resmi BPOM TR 226012891 dan bersertifikat Halal. Apakah ada keluhan spesifik yang ingin kami bantu berikan panduan dosisnya? 😊🌿`
      );
    } finally {
      setAiDrafting(false);
    }
  };

  // Quick reply snippet clicked
  const handleQuickReply = (snippet) => {
    setInputText((prev) => (prev ? prev + ' ' + snippet : snippet));
  };

  // Create new thread
  const handleCreateNewThread = async (e) => {
    e.preventDefault();
    if (!newChatPhone || !newChatName) return;

    try {
      const res = await api.post('/crm/whatsapp/threads', {
        phone: newChatPhone,
        contact_name: newChatName,
        product: newChatProduct,
        city: newChatCity,
        lead_stage: newChatStage,
      });

      if (res.data?.data) {
        setThreads((prev) => [res.data.data, ...prev]);
        setActiveThreadId(res.data.data.id || res.data.data.ID);
        setNewChatModalOpen(false);
        setNewChatPhone('');
        setNewChatName('');
        setNewChatCity('');
      }
    } catch (err) {
      alert('Gagal membuat chat baru: ' + (err.response?.data?.message || err.message));
    }
  };

  // Broadcast Launch
  const handleLaunchBroadcast = async (e) => {
    e.preventDefault();
    if (!bcTitle || !bcTemplate) return;

    setBcSending(true);
    setBcSuccessAlert('');
    try {
      const res = await api.post('/crm/whatsapp/broadcasts', {
        title: bcTitle,
        target_segment: bcSegment,
        template: bcTemplate,
      });

      if (res.data?.data) {
        setBroadcasts((prev) => [res.data.data, ...prev]);
        setBcSuccessAlert(`Siaran massal "${bcTitle}" berhasil diluncurkan ke ${res.data.data.total_recipients} kontak!`);
        setBcTitle('');
        setTimeout(() => setBcSuccessAlert(''), 6000);
      }
    } catch (err) {
      alert('Gagal meluncurkan broadcast: ' + (err.response?.data?.message || err.message));
    } finally {
      setBcSending(false);
    }
  };

  // Add Bot Rule
  const handleAddBotRule = async (e) => {
    e.preventDefault();
    if (!newRuleKeyword || !newRuleReply) return;

    try {
      const res = await api.post('/crm/whatsapp/bot-rules', {
        keyword: newRuleKeyword.toLowerCase().trim(),
        reply: newRuleReply,
        category: newRuleCategory,
        is_active: true,
      });

      if (res.data?.data) {
        setBotRules((prev) => [...prev, res.data.data]);
        setNewRuleKeyword('');
        setNewRuleReply('');
      }
    } catch (err) {
      alert('Gagal menyimpan aturan bot: ' + (err.response?.data?.message || err.message));
    }
  };

  // Toggle Bot Rule
  const handleToggleBotRule = async (id) => {
    try {
      const res = await api.patch(`/crm/whatsapp/bot-rules/${id}/toggle`);
      setBotRules((prev) =>
        prev.map((r) => ((r.id || r.ID) === id ? { ...r, is_active: res.data?.is_active } : r))
      );
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  // Delete Bot Rule
  const handleDeleteBotRule = async (id) => {
    if (!window.confirm('Hapus kata kunci auto-responder ini?')) return;
    try {
      await api.delete(`/crm/whatsapp/bot-rules/${id}`);
      setBotRules((prev) => prev.filter((r) => (r.id || r.ID) !== id));
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  // Test Bot Simulation
  const handleTestBot = () => {
    const query = botTestInput.toLowerCase();
    const match = botRules.find((r) => r.is_active && query.includes(r.keyword.toLowerCase()));
    if (match) {
      setBotTestResult(match.reply);
    } else {
      setBotTestResult('Bot tidak menemukan kata kunci yang cocok. (Pesan akan diteruskan ke CS atau Gemini AI)');
    }
  };

  // Pair WhatsApp Device with User's Real Phone Number
  const handlePairDevice = async (e) => {
    e?.preventDefault();
    if (!pairPhone.trim()) return;
    setPairingLoading(true);
    setPairSuccessMsg('');
    try {
      const res = await api.post('/crm/whatsapp/device/pair', {
        phone_number: pairPhone.trim(),
      });
      if (res.data?.data) {
        setDeviceSession(res.data.data);
        setPairSuccessMsg(`Nomor ${res.data.data.phone_number} berhasil ditautkan sebagai Gateway WhatsApp Utama!`);
        setTimeout(() => setPairSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Failed to pair device:', err);
      alert('Gagal menautkan nomor: ' + (err.response?.data?.message || err.message));
    } finally {
      setPairingLoading(false);
    }
  };

  // Disconnect Device
  const handleDisconnectDevice = async () => {
    if (!window.confirm('Putuskan sesi WhatsApp saat ini?')) return;
    setPairingLoading(true);
    setPairSuccessMsg('');
    try {
      const res = await api.post('/crm/whatsapp/device/disconnect');
      if (res.data?.data) {
        setDeviceSession(res.data.data);
      }
    } catch (err) {
      console.error('Failed to disconnect device:', err);
    } finally {
      setPairingLoading(false);
    }
  };

  // Filtered Threads
  const filteredThreads = threads.filter((t) => {
    const nameMatch = (t.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (t.phone || '').includes(searchQuery);
    const prodMatch = (t.product || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || phoneMatch || prodMatch;
    if (!matchesSearch) return false;

    if (threadFilter === 'unread') return t.unread_count > 0;
    if (threadFilter === 'new') return t.lead_stage === 'new';
    if (threadFilter === 'interested') return t.lead_stage === 'interested';
    if (threadFilter === 'closing') return t.lead_stage === 'closing';
    if (threadFilter === 'health_journey') return t.lead_stage === 'health_journey';

    return true;
  });

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'new':
        return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">Baru</span>;
      case 'interested':
        return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">Konsultasi</span>;
      case 'webinar':
        return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">Webinar</span>;
      case 'closing':
        return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Closing</span>;
      case 'health_journey':
        return <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">Siklus Sehat</span>;
      default:
        return <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{stage}</span>;
    }
  };

  const getDeliveryStatusIcon = (status) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-blue-500 inline-block flex-shrink-0" title="Dibaca (Centang Biru)" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-slate-400 inline-block flex-shrink-0" title="Terkirim ke HP (Centang Abu)" />;
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-slate-400 inline-block flex-shrink-0" title="Terkirim ke Server" />;
      default:
        return <Clock className="w-3 h-3 text-slate-300 inline-block flex-shrink-0" title="Menunggu kirim" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Suite Navigation & Telemetry Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-5 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>WhatsApp Suite v3.2 &bull; Direct Gateway &amp; Live Messenger</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <span>WhatsApp CRM Hub Terintegrasi</span>
            </h2>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Obrolan langsung dengan konsumen tanpa keluar aplikasi, kirim broadcast terschedule dengan anti-banned delay, auto-responder bot kata kunci, simpan kontak .vcf 1-klik, dan telemetri delivery centang biru.
            </p>
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-emerald-200/70 font-semibold">Device Linked</div>
                <div className="font-bold text-white font-mono">{deviceSession?.phone_number || '+62812-3456-7890'}</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs flex items-center space-x-2">
              <Radio className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-[10px] text-emerald-200/70 font-semibold">Baterai &amp; Sinyal</div>
                <div className="font-bold text-white">{deviceSession?.battery_level || 96}% &bull; Online</div>
              </div>
            </div>

            <button
              onClick={() => setNewChatModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-950/40 flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Mulai Chat Baru</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation Buttons */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Web Messenger</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
              {threads.reduce((acc, t) => acc + (t.unread_count || 0), 0)}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'broadcast'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Broadcast &amp; Blast</span>
          </button>

          <button
            onClick={() => setActiveTab('bot')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'bot'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chatbot &amp; Auto-Responder</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'contacts'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Buku Kontak &amp; .vcf</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'device'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Perangkat &amp; QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'text-emerald-200 hover:bg-white/10'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Log Telemetri Delivery</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: IN-APP LIVE WHATSAPP WEB MESSENGER */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
          {/* Left Sidebar: Threads List (Cols 4) */}
          <div className="md:col-span-4 border-r border-slate-200 flex flex-col h-full bg-slate-50/60">
            {/* Top Search & Filter Bar */}
            <div className="p-3.5 border-b border-slate-200/80 bg-white space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari obrolan atau nomor..."
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-0.5 text-[11px]">
                <button
                  onClick={() => setThreadFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    threadFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setThreadFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    threadFilter === 'unread' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Belum Dibaca
                </button>
                <button
                  onClick={() => setThreadFilter('new')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    threadFilter === 'new' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Baru
                </button>
                <button
                  onClick={() => setThreadFilter('health_journey')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    threadFilter === 'health_journey' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Siklus RO
                </button>
              </div>
            </div>

            {/* Threads List Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  Tidak ada percakapan yang cocok.
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const tId = thread.ID || thread.id;
                  const isActive = activeThreadId === tId;

                  return (
                    <div
                      key={tId}
                      onClick={() => setActiveThreadId(tId)}
                      className={`p-3.5 flex items-start space-x-3 cursor-pointer transition select-none ${
                        isActive
                          ? 'bg-emerald-50/90 border-l-4 border-l-emerald-600 shadow-xs'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      {/* Avatar with Online Badge */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={thread.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={thread.contact_name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs"
                        />
                        {thread.is_online && (
                          <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
                        )}
                      </div>

                      {/* Content Preview */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-slate-900 text-xs truncate">
                            {thread.contact_name}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {thread.last_message_time
                              ? new Date(thread.last_message_time).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Baru'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 mt-0.5">
                          {getStageBadge(thread.lead_stage)}
                          {thread.product && (
                            <span className="text-[10px] text-slate-400 truncate">
                              &bull; {thread.product}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[11px] text-slate-500 truncate flex items-center space-x-1 pr-1">
                            <CheckCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            <span className="truncate">{thread.last_message || 'Belum ada pesan...'}</span>
                          </div>

                          {thread.unread_count > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex-shrink-0 animate-pulse">
                              {thread.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Area: Active Chat Conversation (Cols 8) */}
          <div className="md:col-span-8 flex flex-col h-full bg-[#efeae2]/40 relative">
            {activeThread ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={activeThread.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={activeThread.contact_name}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-extrabold text-slate-900 text-sm truncate">
                          {activeThread.contact_name}
                        </h3>
                        {getStageBadge(activeThread.lead_stage)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center space-x-2">
                        <span>{activeThread.phone}</span>
                        {activeThread.city && <span>&bull; {activeThread.city}</span>}
                        {isTypingSimulated ? (
                          <span className="text-emerald-600 font-semibold italic animate-pulse">
                            &bull; sedang mengetik...
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">&bull; Online</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Fast Actions */}
                  <div className="flex items-center space-x-1.5">
                    {/* Objection AI Assistant */}
                    <button
                      onClick={() => onOpenObjectionModal && onOpenObjectionModal(activeThread)}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center space-x-1 transition shadow-xs"
                      title="Bantu Jawab AI Keraguan Konsumen"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span className="hidden sm:inline">Asisten Closing AI</span>
                    </button>

                    {/* Save Contact vCard */}
                    <button
                      onClick={() =>
                        downloadVCardContact({
                          name: activeThread.contact_name,
                          phone: activeThread.phone,
                          city: activeThread.city,
                          notes: `Pelanggan Bionet - ${activeThread.product || ''}`,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 transition"
                      title="Download .vcf untuk langsung disimpan ke buku kontak HP"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">Simpan (.vcf)</span>
                    </button>

                    {/* External WhatsApp Web Link */}
                    <a
                      href={`https://wa.me/${activeThread.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title="Buka di WhatsApp Web / App Eksternal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Message Stream Pane */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                  {/* Subtle WhatsApp wallpaper overlay */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Security Notice Pill */}
                  <div className="text-center my-2">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200/80 text-[10px] font-semibold text-amber-900 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Pesan terenkripsi &amp; terhubung langsung ke Server Gateway Bionet</span>
                    </span>
                  </div>

                  {loadingMessages ? (
                    <div className="h-48 flex items-center justify-center text-slate-400 space-x-2 text-xs">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Memuat riwayat chat...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs italic">
                      Belum ada riwayat pesan. Kirim pesan pertama untuk menyapa calon konsumen!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender === 'me';

                      return (
                        <div
                          key={msg.id || msg.ID}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                        >
                          <div
                            className={`max-w-[78%] sm:max-w-[65%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs relative ${
                              isMe
                                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-line text-xs font-sans">
                              {msg.text}
                            </p>

                            <div
                              className={`flex items-center justify-end space-x-1 mt-1 text-[10px] ${
                                isMe ? 'text-emerald-100/80' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {msg.sent_at
                                  ? new Date(msg.sent_at).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </span>
                              {isMe && getDeliveryStatusIcon(msg.status)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing Simulator Indicator */}
                  {isTypingSimulated && (
                    <div className="flex justify-start animate-in fade-in">
                      <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2 border border-slate-200/80 text-xs text-slate-500 shadow-xs flex items-center space-x-2">
                        <span className="font-bold text-slate-700">{activeThread.contact_name}</span>
                        <div className="flex space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Reply Pills Bar */}
                <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center space-x-1.5 overflow-x-auto text-[11px]">
                  <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex-shrink-0">
                    ⚡ Template:
                  </span>
                  <button
                    onClick={() =>
                      handleQuickReply(
                        'Produk herbal Bionet 100% resmi berizin BPOM RI (POM TR 226012891) dan Halal MUI. Sangat aman dan bebas Bahan Kimia Obat.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-semibold whitespace-nowrap transition shadow-2xs"
                  >
                    Izin BPOM Resmi
                  </button>
                  <button
                    onClick={() =>
                      handleQuickReply(
                        'Dosis anjuran awal: 3 tetes 2x sehari diteteskan ke 1/4 gelas air hangat sebelum makan.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-semibold whitespace-nowrap transition shadow-2xs"
                  >
                    Panduan Dosis
                  </button>
                  <button
                    onClick={() =>
                      handleQuickReply(
                        'Promo spesial hari ini: Paket 2 botol hemat Rp 450.000 + Subsidi Bebas Ongkir ke alamat Anda!'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-semibold whitespace-nowrap transition shadow-2xs"
                  >
                    Promo 2 Botol Hemat
                  </button>
                  <button
                    onClick={() =>
                      handleQuickReply(
                        'Pembayaran resmi Bionet via Transfer Rekening BCA 0123-456-789 atas nama PT Bionet Prima Sejahtera.'
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 font-semibold whitespace-nowrap transition shadow-2xs"
                  >
                    Rekening Pembayaran
                  </button>
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200 flex items-end space-x-2"
                >
                  {/* Draft with AI Button */}
                  <button
                    type="button"
                    onClick={handleDraftWithAI}
                    disabled={aiDrafting}
                    className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition flex items-center space-x-1"
                    title="Rangkai Balasan Closing dengan Asisten AI"
                  >
                    <Sparkles className={`w-4 h-4 text-amber-600 ${aiDrafting ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline text-xs font-bold">Tanya AI</span>
                  </button>

                  {/* Input Box */}
                  <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 flex items-center px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white transition">
                    <textarea
                      rows={1}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ketik pesan WhatsApp (tekan Enter untuk kirim)..."
                      className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none resize-none max-h-24 leading-relaxed font-sans"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sendingMessage}
                    className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-md shadow-emerald-950 disabled:opacity-40 flex items-center justify-center flex-shrink-0"
                    title="Kirim Pesan"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-md">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">Pilih Percakapan untuk Memulai</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Kelola hubungan prospek, closing herbal, konsultasi dosis, dan pantau status pesan terkirim secara real-time.
                </p>
                <button
                  onClick={() => setNewChatModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition inline-flex items-center space-x-1.5 shadow-md shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>Kirim Pesan ke Nomor Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: WHATSAPP BROADCAST BLAST */}
      {/* ========================================================================= */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Create Broadcast */}
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Zap className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Luncurkan Siaran Massal (Blast)</h3>
                <p className="text-[10px] text-slate-400">Kirim naskah follow-up ke puluhan calon pembeli sekaligus</p>
              </div>
            </div>

            {bcSuccessAlert && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{bcSuccessAlert}</span>
              </div>
            )}

            <form onSubmit={handleLaunchBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Campaign Broadcast *</label>
                <input
                  type="text"
                  required
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="Contoh: Follow-up Pasien Hari ke-25 Siap RO"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Segmen Prospek *</label>
                <select
                  value={bcSegment}
                  onChange={(e) => setBcSegment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Semua Database Prospek (65 Kontak)</option>
                  <option value="new">Prospek Baru Belum Dihubungi (20 Kontak)</option>
                  <option value="day_25_ro">Pasien Siklus Hari ke-25 Siap RO (14 Kontak)</option>
                  <option value="webinar">Peminat Webinar Bisnis BOP (38 Kontak)</option>
                  <option value="closing">Mitra &amp; Konsumen Setia (Closing)</option>
                </select>
              </div>

              {/* Dynamic Tag Helpers */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sisipkan Tag Variabel Dinamis:</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBcTemplate((prev) => prev + ' {{nama}}')}
                    className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold"
                  >
                    + {'{{nama}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBcTemplate((prev) => prev + ' {{produk}}')}
                    className="px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold"
                  >
                    + {'{{produk}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBcTemplate((prev) => prev + ' {{kota}}')}
                    className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold"
                  >
                    + {'{{kota}}'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Naskah Pesan Broadcast *</label>
                <textarea
                  rows={6}
                  required
                  value={bcTemplate}
                  onChange={(e) => setBcTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans text-xs"
                />
              </div>

              {/* Anti-Ban Delay Protection */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Jeda Anti-Banned Proteksi Server:</span>
                  </span>
                  <span>{bcDelay} detik / pesan</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={bcDelay}
                  onChange={(e) => setBcDelay(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <p className="text-[10px] text-amber-800/80 leading-normal">
                  Pemberian interval acak 5-15 detik antar pengiriman pesan membuat server WhatsApp mendeteksi pesan sebagai ketikan manusia, mencegah blokir nomor.
                </p>
              </div>

              <button
                type="submit"
                disabled={bcSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{bcSending ? 'Sedang Meluncurkan...' : 'Luncurkan Broadcast Sekarang'}</span>
              </button>
            </form>
          </div>

          {/* Broadcast History & Past Campaigns */}
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Broadcast Campaign</h3>
              <span className="text-xs text-slate-400 font-bold">{broadcasts.length} Campaign</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[600px]">
              {broadcasts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs italic">
                  Belum ada riwayat broadcast.
                </div>
              ) : (
                broadcasts.map((bc) => (
                  <div key={bc.id || bc.ID} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{bc.title}</h4>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Segmen: <span className="font-semibold text-emerald-700">{bc.target_segment}</span> &bull;{' '}
                          {bc.created_at ? new Date(bc.created_at).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Selesai ({bc.sent_count}/{bc.total_recipients})
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-100 line-clamp-2">
                      &ldquo;{bc.template}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span>Keterkiriman: 100%</span>
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">Anti-Ban Safe</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: CHATBOT & AUTO-RESPONDER RULES */}
      {/* ========================================================================= */}
      {activeTab === 'bot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Rules List & Management */}
          <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Daftar Kata Kunci Auto-Responder</span>
                </h3>
                <p className="text-[10px] text-slate-400">Pesan yang memuat kata kunci ini akan dibalas otomatis 24/7</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {botRules.filter((r) => r.is_active).length} Aktif
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[520px]">
              {botRules.map((rule) => {
                const rId = rule.id || rule.ID;

                return (
                  <div
                    key={rId}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono font-black text-xs">
                          keyword: &quot;{rule.keyword}&quot;
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">&bull; {rule.category}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleBotRule(rId)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                            rule.is_active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {rule.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button
                          onClick={() => handleDeleteBotRule(rId)}
                          className="p-1 rounded-md text-slate-300 hover:text-red-500 transition"
                          title="Hapus Aturan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-sans">
                      {rule.reply}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Add New Rule & Interactive Tester */}
          <div className="lg:col-span-5 space-y-4">
            {/* Add Rule Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5">
              <h3 className="font-extrabold text-slate-900 text-sm">Tambah Aturan Kata Kunci Baru</h3>
              <form onSubmit={handleAddBotRule} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kata Kunci Pemicu (Trigger) *</label>
                  <input
                    type="text"
                    required
                    value={newRuleKeyword}
                    onChange={(e) => setNewRuleKeyword(e.target.value)}
                    placeholder="Contoh: testimoni, legal, dosis, agen"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pricing">Harga &amp; Promo</option>
                    <option value="legality">Legalitas BPOM &amp; Halal</option>
                    <option value="usage">Aturan Pakai &amp; Dosis</option>
                    <option value="membership">Kemitraan &amp; Peluang Bisnis</option>
                    <option value="general">Umum / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teks Balasan Otomatis *</label>
                  <textarea
                    rows={4}
                    required
                    value={newRuleReply}
                    onChange={(e) => setNewRuleReply(e.target.value)}
                    placeholder="Contoh: Kami memiliki ratusan testimoni laboratorium asli..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-950"
                >
                  Simpan Aturan Bot
                </button>
              </form>
            </div>

            {/* Interactive Bot Simulator */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <span>Simulator Pengujian Bot Interaktif</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ketik kalimat uji coba (misal: &ldquo;Apakah ada bpom nya?&rdquo;) untuk menguji respon bot.
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={botTestInput}
                  onChange={(e) => setBotTestInput(e.target.value)}
                  placeholder="Ketik kalimat pertanyaan..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleTestBot}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Uji
                </button>
              </div>

              {botTestResult && (
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Respon Bot:</div>
                  <div className="text-slate-200 font-sans leading-relaxed text-xs">{botTestResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 4: CONTACTS & VCARD EXPORT */}
      {/* ========================================================================= */}
      {activeTab === 'contacts' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Buku Kontak WhatsApp &amp; Generator vCard (.vcf)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Simpan nomor prospek ke buku telepon HP Android/iOS sekali klik tanpa mengetik manual
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  downloadBatchVCard(
                    threads.map((t) => ({
                      name: t.contact_name,
                      phone: t.phone,
                      city: t.city,
                      notes: `Prospek Bionet: ${t.product || ''}`,
                    })),
                    'semua-kontak-bionet-whatsapp'
                  )
                }
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-md shadow-indigo-950 flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Semua Kontak (.vcf)</span>
              </button>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Kontak</th>
                  <th className="py-3 px-4">Nomor WhatsApp</th>
                  <th className="py-3 px-4">Kota</th>
                  <th className="py-3 px-4">Minat Produk</th>
                  <th className="py-3 px-4">Status Pipeline</th>
                  <th className="py-3 px-4 text-center">Tindakan Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {threads.map((t) => (
                  <tr key={t.id || t.ID} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{t.contact_name}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{t.phone}</td>
                    <td className="py-3 px-4 text-slate-600">{t.city || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-700">{t.product || '-'}</td>
                    <td className="py-3 px-4">{getStageBadge(t.lead_stage)}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() =>
                            downloadVCardContact({
                              name: t.contact_name,
                              phone: t.phone,
                              city: t.city,
                              notes: `Prospek Bionet - ${t.product || ''}`,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center space-x-1 transition"
                          title="Download file .vcf untuk membuka dialog simpan kontak di HP"
                        >
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>Simpan ke HP</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveThreadId(t.id || t.ID);
                            setActiveTab('chat');
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition"
                        >
                          Buka Chat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 5: DEVICE & QR CODE LINK */}
      {/* ========================================================================= */}
      {activeTab === 'device' && (
        <div className="space-y-5">
          {/* Success Banner */}
          {pairSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{pairSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column: Form Tautkan Nomor & QR Code */}
            <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Tautkan Nomor WhatsApp Anda</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan nomor WhatsApp ponsel Anda yang ingin dijadikan pengirim resmi pesan konsumen, notifikasi, dan broadcast.
                </p>
              </div>

              {/* Input Nomor Telepon Form */}
              <form onSubmit={handlePairDevice} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp Anda:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pairPhone}
                      onChange={(e) => setPairPhone(e.target.value)}
                      placeholder="Contoh: 081234567890 atau +6281234567890"
                      className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Format otomatis dinormalisasi ke standar internasional (+62).
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={pairingLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    {pairingLoading ? (
                      <span>Menyinkronkan...</span>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4" />
                        <span>Tautkan Nomor WhatsApp Saya</span>
                      </>
                    )}
                  </button>

                  {deviceSession?.status === 'connected' && (
                    <button
                      type="button"
                      onClick={handleDisconnectDevice}
                      disabled={pairingLoading}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold transition"
                      title="Putuskan sesi saat ini"
                    >
                      Putuskan Sesi
                    </button>
                  )}
                </div>
              </form>

              <div className="pt-3 border-t border-slate-100 text-center space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Pindai QR Code WAHA (WhatsApp Live)</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchAuxiliaryData}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition"
                    title="Segarkan QR Code"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Perbarui QR</span>
                  </button>
                </div>

                <div className="inline-block p-3.5 bg-white rounded-3xl border-2 border-emerald-500 shadow-md">
                  <img
                    src={deviceSession?.qr_code || "http://localhost:3000/api/default/auth/qr"}
                    alt="WhatsApp QR Code Pairing"
                    className="w-48 h-48 mx-auto object-contain rounded-xl"
                  />
                </div>

                <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${deviceSession?.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                  <span>
                    {deviceSession?.status === 'connected' 
                      ? '✓ Perangkat Terhubung & Siap Kirim Pesan' 
                      : 'Buka WhatsApp di HP > Perangkat Tertaut > Tautkan Perangkat'}
                  </span>
                </div>

                <div className="pt-1">
                  <a
                    href="http://localhost:3000/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>Buka WAHA Docker Dashboard (Port 3000)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Status Sesi & Panduan Penggunaan Nomor */}
            <div className="md:col-span-6 space-y-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-900 text-sm">Status Sesi Gateway Saat Ini</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Status Server:</span>
                    <span className="font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{deviceSession?.status === 'connected' ? 'Terhubung (Online)' : 'Belum Terhubung'}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Nomor WhatsApp Aktif:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {deviceSession?.phone_number || pairPhone || '+62812-3456-7890'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Perangkat Node:</span>
                    <span className="font-semibold text-slate-800">{deviceSession?.device_name || 'Bionet Node v2.24'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Auto-Responder Bot:</span>
                    <span className="font-bold text-emerald-600">Aktif (24/7)</span>
                  </div>
                </div>
              </div>

              {/* Panduan 2 Metode Penggunaan Nomor Sendiri */}
              <div className="bg-emerald-50/60 p-5 rounded-3xl border border-emerald-200/80 space-y-3 text-xs">
                <h4 className="font-extrabold text-emerald-950 flex items-center space-x-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>2 Cara Menggunakan Nomor WhatsApp Anda</span>
                </h4>
                
                <div className="space-y-2.5 text-slate-700">
                  <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                    <div className="font-bold text-emerald-800 flex items-center space-x-1 mb-0.5">
                      <span>1. Direct Link (100% Gratis via HP Anda)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Klik tombol WhatsApp di setiap chat atau kartu CRM. Aplikasi akan langsung membuka WhatsApp di HP Anda sendiri dengan naskah yang sudah otomatis terketik rapi siap kirim.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-emerald-100 shadow-xs">
                    <div className="font-bold text-emerald-800 flex items-center space-x-1 mb-0.5">
                      <span>2. Otomatis dari Server (Fonnte / WAHA Gateway)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Jika Anda ingin dashboard mengirim pesan secara otomatis 24 jam (misal balasan bot otomatis &amp; broadcast terjadwal), cukup hubungkan nomor Anda ke Fonnte/WAHA dan masukkan token API Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Webhook Listener URL */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400">Webhook URL Callback (Inbound Message &amp; Delivery):</div>
                <div className="flex items-center space-x-2 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <span className="font-mono text-[10px] text-slate-300 truncate flex-1">
                    http://localhost:8081/api/crm/whatsapp/webhook
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('http://localhost:8081/api/crm/whatsapp/webhook');
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2000);
                    }}
                    className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold"
                  >
                    {copiedWebhook ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 6: DELIVERY LOGS & TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-900 text-sm">Riwayat Live Log Telemetri Server WhatsApp</h3>
            <span className="text-xs text-slate-400 font-bold">{logs.length} Log Terakhir</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Penerima / Nomor</th>
                  <th className="py-2.5 px-3">Arah</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Isi Pesan</th>
                  <th className="py-2.5 px-3 text-center">Status Centang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                      {l.sent_at ? new Date(l.sent_at).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{l.recipient}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.phone}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.direction === 'inbound' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {l.direction === 'inbound' ? 'Masuk' : 'Keluar'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 capitalize text-[10px]">{l.category}</td>
                    <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{l.message}</td>
                    <td className="py-2.5 px-3 text-center">{getDeliveryStatusIcon(l.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MULAI CHAT BARU */}
      {/* ========================================================================= */}
      {newChatModalOpen && (
        <ModalPortal isOpen={newChatModalOpen} onClose={() => setNewChatModalOpen(false)}>
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base">Mulai Obrolan WhatsApp Baru</h3>
              <button onClick={() => setNewChatModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewThread} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kontak *</label>
                <input
                  type="text"
                  required
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Contoh: Ibu Rina Melati"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif *</label>
                <input
                  type="tel"
                  required
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kota</label>
                  <input
                    type="text"
                    value={newChatCity}
                    onChange={(e) => setNewChatCity(e.target.value)}
                    placeholder="Contoh: Semarang"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tahap Pipeline</label>
                  <select
                    value={newChatStage}
                    onChange={(e) => setNewChatStage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="new">🔴 Prospek Baru</option>
                    <option value="interested">🔵 Konsultasi</option>
                    <option value="health_journey">🩺 Siklus RO</option>
                    <option value="closing">🟢 Closing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Minat Produk</label>
                <select
                  value={newChatProduct}
                  onChange={(e) => setNewChatProduct(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Bio-Propolis Trigona 30ml">Bio-Propolis Trigona 30ml</option>
                  <option value="Bio-Herbal Drops">Bio-Herbal Drops</option>
                  <option value="Bio-Gluta White">Bio-Gluta White</option>
                  <option value="Peluang Bisnis BOP">Peluang Bisnis BOP</option>
                </select>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-950"
                >
                  Buka Obrolan
                </button>
                <button
                  type="button"
                  onClick={() => setNewChatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

