import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Inbox,
  Settings,
  RefreshCw,
  Search,
  Reply,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  ShieldCheck,
  Server,
  Globe,
  HelpCircle,
  FileText,
  Paperclip,
  Image as ImageIcon,
  X,
  Sparkles,
  Bot,
  Zap
} from 'lucide-react';
import api from '../services/api';

const AUTO_REPLY_PRESETS = [
  {
    id: 'cs',
    title: '📌 Konfirmasi CS 24 Jam',
    subject: 'Re: [Bionet Official] Konfirmasi Penerimaan Email',
    message: `Halo, terima kasih telah menghubungi Bionet Official.

Pesan Anda telah kami terima dengan baik. Tim layanan pelanggan dan dukungan kemitraan kami akan segera meninjau dan merespons pesan Anda dalam 1x24 jam kerja.

Jika ada informasi mendesak mengenai akun atau layanan Bionet Anda, silakan lampirkan ID Pengguna Anda pada balasan email ini.

Salam hangat,
Customer Care Bionet Indonesia`
  },
  {
    id: 'ekspedisi',
    title: '📦 Ekspedisi & Produk Herbal',
    subject: 'Re: [Bionet Official] Status Pengiriman & Produk Herbal',
    message: `Halo, terima kasih telah menghubungi Tim Logistik & Produk Herbal Bionet.

Pesan dan pertanyaan Anda terkait ketersediaan stok produk herbal, konfirmasi resi, atau status pengiriman ekspedisi telah kami terima. Tim gudang dan operasional kami akan memeriksa nomor pesanan Anda secepat mungkin.

Pastikan Anda telah menyertakan Nomor Invoice atau Nomor Resi pengiriman agar proses pengecekan dapat dilakukan lebih cepat.

Salam sehat,
Tim Logistik Bionet Herbal`
  },
  {
    id: 'kemitraan',
    title: '💼 Kemitraan & Penarikan Dana',
    subject: 'Re: [Bionet Official] Informasi Kemitraan & Finansial',
    message: `Halo Mitra Bionet yang terhormat,

Terima kasih atas email Anda kepada Tim Kemitraan & Finansial Bionet.

Email Anda terkait program kemitraan, bonus referensi, verifikasi rekening, atau proses penarikan dana (withdrawal) telah masuk ke antrean prioritas departemen keuangan kami. Semua permintaan penarikan dan verifikasi diproses sesuai jadwal operasional perbankan.

Terima kasih atas kerja sama dan dedikasi Anda bersama jaringan Bionet.

Salam sukses mulia,
Tim Kemitraan & Finance Bionet`
  }
];

/**
 * Isolated Sandboxed Iframe for Email HTML
 * Prevents email <style> tags (like Google's body { width: 720px; }) from leaking into and squeezing the main dashboard layout.
 */
function EmailBodyViewer({ html, textSnippet }) {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(450);

  useEffect(() => {
    const updateHeight = () => {
      try {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          const doc = iframeRef.current.contentWindow.document;
          if (doc && doc.body) {
            const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 250);
            setIframeHeight(h + 24);
          }
        }
      } catch (err) {
        // Sandboxed fallback
      }
    };

    const t1 = setTimeout(updateHeight, 200);
    const t2 = setTimeout(updateHeight, 800);
    const t3 = setTimeout(updateHeight, 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [html]);

  if (!html) {
    return (
      <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-700 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        {textSnippet || '(Pesan kosong)'}
      </pre>
    );
  }

  const sanitizedDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    body {
      margin: 0;
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1e293b;
      background: #ffffff;
      box-sizing: border-box;
      word-wrap: break-word;
    }
    img { max-width: 100%; height: auto; }
    table { max-width: 100% !important; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 bg-white">
      <iframe
        ref={iframeRef}
        srcDoc={sanitizedDoc}
        title="Email Body"
        onLoad={() => {
          try {
            if (iframeRef.current && iframeRef.current.contentWindow) {
              const doc = iframeRef.current.contentWindow.document;
              if (doc && doc.body) {
                const h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, 250);
                setIframeHeight(h + 24);
              }
            }
          } catch {}
        }}
        className="w-full border-0 block"
        style={{ height: `${iframeHeight}px`, minHeight: '300px' }}
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      />
    </div>
  );
}

export default function MailTab({ currentUser }) {
  const [activeView, setActiveView] = useState('inbox'); // 'inbox', 'detail', 'compose', 'settings'
  const [inboxList, setInboxList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Settings state
  const [config, setConfig] = useState({
    provider: 'gmail',
    email_address: '',
    sender_name: 'Bionet Official',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    imap_host: 'imap.gmail.com',
    imap_port: 993,
    imap_username: '',
    imap_password: '',
    imap_encryption: 'ssl',
    is_active: false,
    auto_reply_enabled: false,
    auto_reply_mode: 'standard', // 'standard' or 'ai'
    auto_reply_subject: 'Re: [Bionet Official] Konfirmasi Penerimaan Email',
    auto_reply_message: 'Halo, terima kasih telah menghubungi Bionet Official.\n\nPesan Anda telah kami terima dengan baik. Tim layanan pelanggan dan dukungan kemitraan kami akan segera meninjau dan merespons pesan Anda dalam 1x24 jam kerja.\n\nSalam hangat,\nTim Bionet Indonesia',
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState(null);

  // File & Image attachment refs
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Compose / Reply state
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: '',
    in_reply_to: '',
    attachments: [],
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);

  // AI Reply State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  // Load config and inbox on mount
  useEffect(() => {
    fetchConfig();
    fetchInbox();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/mail/config');
      if (res.data?.data) {
        const data = res.data.data;
        setConfig((prev) => ({
          ...prev,
          ...data,
          auto_reply_enabled: data.auto_reply_enabled ?? false,
          auto_reply_mode: data.auto_reply_mode || 'standard',
          auto_reply_subject: data.auto_reply_subject || 'Re: [Bionet Official] Konfirmasi Penerimaan Email',
          auto_reply_message: data.auto_reply_message || 'Halo, terima kasih telah menghubungi Bionet Official.\n\nPesan Anda telah kami terima dengan baik. Tim layanan pelanggan dan dukungan kemitraan kami akan segera meninjau dan merespons pesan Anda dalam 1x24 jam kerja.\n\nSalam hangat,\nTim Bionet Indonesia',
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch mail config:', err);
    }
  };

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mail/inbox?limit=25');
      if (res.data?.data) {
        setInboxList(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEmail = async (item) => {
    setDetailLoading(true);
    setActiveView('detail');
    try {
      const res = await api.get(`/mail/messages/${item.seq_num}`);
      if (res.data?.data) {
        setSelectedEmail(res.data.data);
      } else {
        setSelectedEmail(item);
      }
    } catch (err) {
      console.warn('Failed to load email detail:', err);
      setSelectedEmail(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        alert(`File "${file.name}" terlalu besar (maksimal 20 MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const base64Data = typeof result === 'string' && result.includes(',')
          ? result.split(',')[1]
          : result;
        const isImg = file.type.startsWith('image/');

        setComposeForm((prev) => ({
          ...prev,
          attachments: [
            ...(prev.attachments || []),
            {
              filename: file.name,
              content_type: file.type || 'application/octet-stream',
              data: base64Data,
              size: file.size,
              previewUrl: isImg ? result : null,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveAttachment = (indexToRemove) => {
    setComposeForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleReply = (email) => {
    const cleanFrom = email.from.includes('<')
      ? email.from.split('<')[1].replace('>', '').trim()
      : email.from.trim();

    setComposeForm({
      to: cleanFrom,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n--- Pada ${new Date(email.date).toLocaleString('id-ID')}, ${email.from} menulis:\n> ${
        email.body_text || email.snippet || ''
      }`,
      in_reply_to: email.message_id || '',
      attachments: [],
    });
    setActiveView('compose');
  };

  const handleAIReplyFromDetail = async (email) => {
    if (!email) return;
    setAiLoading(true);
    setAiNotice(null);

    const cleanFrom = email.from.includes('<')
      ? email.from.split('<')[1].replace('>', '').trim()
      : email.from.trim();

    try {
      const res = await api.post('/mail/ai-reply', {
        sender: email.from,
        subject: email.subject || 'Konfirmasi Pesan',
        body: email.body_text || email.snippet || email.subject || 'Mohon respon pertanyaan ini',
      });

      const aiReplyText = res.data?.data?.reply || '';
      const quoteHeader = `\n\n--- Pada ${new Date(email.date).toLocaleString('id-ID')}, ${email.from} menulis:\n> ${
        email.body_text || email.snippet || ''
      }`;

      setComposeForm({
        to: cleanFrom,
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body: aiReplyText ? `${aiReplyText}${quoteHeader}` : quoteHeader,
        in_reply_to: email.message_id || '',
        attachments: [],
      });

      setActiveView('compose');
      setAiNotice({ type: 'success', text: '✨ Draf balasan cerdas berhasil diracik oleh Google Gemini AI!' });
    } catch (err) {
      console.error('Failed to generate AI reply:', err);
      alert(err.response?.data?.message || 'Gagal meracik balasan AI. Pastikan GEMINI_API_KEY terkonfigurasi di server backend.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateAIReplyInCompose = async () => {
    setAiLoading(true);
    setAiNotice(null);

    const sender = composeForm.to || (selectedEmail?.from || 'Pelanggan');
    const subject = composeForm.subject || (selectedEmail?.subject || 'Pertanyaan');
    const body = selectedEmail?.body_text || selectedEmail?.snippet || composeForm.body || subject;

    try {
      const res = await api.post('/mail/ai-reply', {
        sender,
        subject,
        body,
      });

      const aiReplyText = res.data?.data?.reply || '';
      if (!aiReplyText) {
        throw new Error('AI tidak memberikan respon balasan');
      }

      setComposeForm((prev) => {
        const quoteIndex = prev.body.indexOf('\n\n--- Pada ');
        if (quoteIndex !== -1) {
          const quotePart = prev.body.substring(quoteIndex);
          return {
            ...prev,
            body: `${aiReplyText}${quotePart}`,
          };
        }
        return {
          ...prev,
          body: prev.body ? `${aiReplyText}\n\n${prev.body}` : aiReplyText,
        };
      });

      setAiNotice({ type: 'success', text: '✨ Jawaban cerdas berhasil diracik dan disisipkan oleh Gemini AI!' });
    } catch (err) {
      console.error('Failed to generate AI reply in compose:', err);
      alert(err.response?.data?.message || 'Gagal meracik balasan AI. Periksa koneksi atau konfigurasi GEMINI_API_KEY di server.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setConfig((prev) => ({
      ...prev,
      auto_reply_subject: preset.subject || prev.auto_reply_subject,
      auto_reply_message: preset.message,
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      alert('Penerima, subjek, dan isi email wajib diisi!');
      return;
    }

    setSending(true);
    setSendSuccess(null);
    try {
      const payload = {
        to: composeForm.to,
        subject: composeForm.subject,
        body: composeForm.body,
        in_reply_to: composeForm.in_reply_to,
        attachments: (composeForm.attachments || []).map((att) => ({
          filename: att.filename,
          content_type: att.content_type,
          data: att.data,
          size: att.size,
        })),
      };
      await api.post('/mail/send', payload);
      setSendSuccess('Email berhasil dikirim!');
      setComposeForm({ to: '', subject: '', body: '', in_reply_to: '', attachments: [] });
      setTimeout(() => {
        setActiveView('inbox');
        fetchInbox();
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim email: periksa pengaturan SMTP Anda.');
    } finally {
      setSending(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMessage(null);
    try {
      await api.post('/mail/config', config);
      setConfigMessage({ type: 'success', text: 'Konfigurasi email akun berhasil disimpan!' });
      fetchInbox();
    } catch (err) {
      setConfigMessage({
        type: 'error',
        text: err.response?.data?.message || 'Gagal menyimpan konfigurasi email.',
      });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleProviderChange = (provider) => {
    if (provider === 'gmail') {
      setConfig((prev) => ({
        ...prev,
        provider: 'gmail',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_encryption: 'tls',
        imap_host: 'imap.gmail.com',
        imap_port: 993,
        imap_encryption: 'ssl',
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        provider: 'custom',
        smtp_host: prev.smtp_host === 'smtp.gmail.com' ? 'mail.domainanda.com' : prev.smtp_host,
        smtp_port: 587,
        smtp_encryption: 'tls',
        imap_host: prev.imap_host === 'imap.gmail.com' ? 'mail.domainanda.com' : prev.imap_host,
        imap_port: 993,
        imap_encryption: 'ssl',
      }));
    }
  };

  const filteredInbox = inboxList.filter(
    (item) =>
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Webmail & Komunikasi Email
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                IMAP & SMTP
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Kelola pesan masuk dan balas langsung menggunakan akun Gmail atau domain bisnis sendiri.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveView('inbox');
              fetchInbox();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'inbox'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Inbox size={15} />
            Kotak Masuk ({inboxList.length})
          </button>

          <button
            onClick={() => {
              setComposeForm({ to: '', subject: '', body: '', in_reply_to: '', attachments: [] });
              setActiveView('compose');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'compose'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            }`}
          >
            <Send size={15} />
            Tulis Email Baru
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === 'settings'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Settings size={15} />
            Pengaturan Akun
          </button>
        </div>
      </div>

      {/* VIEW: INBOX */}
      {activeView === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Search & Actions Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari subjek, pengirim, atau kata kunci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={fetchInbox}
                disabled={loading}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Muat ulang email terbaru"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-sky-600' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Email List */}
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-sky-500" />
              <p className="text-sm font-medium">Menghubungkan ke server email & mengunduh kotak masuk...</p>
            </div>
          ) : filteredInbox.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Inbox size={42} className="mx-auto mb-3 text-slate-300" />
              <h3 className="text-base font-semibold text-slate-700">Tidak ada pesan di kotak masuk</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Kotak masuk Anda kosong atau belum ada pesan baru. Pastikan akun email Gmail atau Custom Domain Anda telah diatur dengan benar di tab Pengaturan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredInbox.map((item) => (
                <div
                  key={item.seq_num || item.uid}
                  onClick={() => openEmail(item)}
                  className={`p-4 hover:bg-sky-50/50 cursor-pointer transition-colors flex items-start gap-4 ${
                    !item.is_seen ? 'bg-sky-50/20 font-semibold' : 'bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0 mt-0.5">
                    <User size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-800 truncate">{item.from}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock size={12} />
                        {new Date(item.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-700 truncate mb-1">
                      {item.subject || '(Tanpa Subjek)'}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.snippet}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: EMAIL DETAIL */}
      {activeView === 'detail' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Detail Header Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setActiveView('inbox')}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              Kembali ke Kotak Masuk
            </button>

            {selectedEmail && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAIReplyFromDetail(selectedEmail)}
                  disabled={aiLoading}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                  title="Gunakan Google Gemini AI untuk menganalisis email dan merangkai balasan instan"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>AI sedang meracik jawaban...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>✨ Buat Balasan Cerdas dengan AI</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleReply(selectedEmail)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Reply size={14} />
                  Balas Email Ini
                </button>
              </div>
            )}
          </div>

          {detailLoading ? (
            <div className="p-16 text-center text-slate-400">
              <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-sky-500" />
              <p className="text-sm">Memuat isi lengkap email...</p>
            </div>
          ) : selectedEmail ? (
            <div className="p-6 space-y-6">
              {/* Meta Info */}
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-900 mb-3">{selectedEmail.subject}</h2>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Dari: </span>
                    <span className="text-sky-700 font-medium">{selectedEmail.from}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Waktu: </span>
                    <span>{new Date(selectedEmail.date).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {selectedEmail.to && (
                  <div className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">Kepada: </span>
                    <span>{selectedEmail.to}</span>
                  </div>
                )}
              </div>

              {/* Email Content Body (Sandboxed & Isolated to prevent CSS leak) */}
              <div className="w-full">
                <EmailBodyViewer
                  html={selectedEmail.body_html}
                  textSnippet={selectedEmail.body_text || selectedEmail.snippet}
                />
              </div>

              {/* Bottom Quick Reply Action */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAIReplyFromDetail(selectedEmail)}
                    disabled={aiLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>AI sedang meracik jawaban...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>✨ Buat Balasan Cerdas dengan AI</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReply(selectedEmail)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-all border border-slate-200/80"
                  >
                    <Reply size={15} />
                    <span>Balas Manual (@{selectedEmail.from})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Sparkles size={13} className="text-purple-500" />
                  <span>Google Gemini Smart Assistant</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400">
              <AlertCircle size={32} className="mx-auto mb-2 text-amber-500" />
              <p>Email tidak dapat dimuat.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW: COMPOSE / REPLY */}
      {activeView === 'compose' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send size={18} className="text-sky-600" />
                {composeForm.in_reply_to ? 'Balas Email (Thread Terhubung)' : 'Tulis Pesan Email Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Email akan dikirim secara aman melalui server SMTP yang Anda konfigurasikan.
              </p>
            </div>
            <button
              onClick={() => setActiveView('inbox')}
              className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              Batal
            </button>
          </div>

          {sendSuccess && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600" />
              {sendSuccess}
            </div>
          )}

          {aiNotice && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
                aiNotice.type === 'success'
                  ? 'bg-purple-50 text-purple-900 border border-purple-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
                <span>{aiNotice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiNotice(null)}
                className="text-purple-400 hover:text-purple-700 p-0.5 rounded"
                title="Tutup pesan"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kepada (Alamat Email Tujuan) *
              </label>
              <input
                type="email"
                required
                placeholder="contoh: partner@bionet.id, customer@gmail.com"
                value={composeForm.to}
                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subjek Email *</label>
              <input
                type="text"
                required
                placeholder="Subjek email..."
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Isi Pesan Email *</label>
                <button
                  type="button"
                  onClick={handleGenerateAIReplyInCompose}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200/90 rounded-xl shadow-xs transition-all disabled:opacity-50"
                  title="Gunakan Google Gemini AI untuk merangkai draf balasan kontekstual secara otomatis"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin text-purple-600" />
                      <span>AI sedang meracik jawaban...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-purple-600" />
                      <span>✨ Buat Balasan Cerdas dengan AI</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                required
                rows={10}
                placeholder="Tuliskan pesan Anda di sini..."
                value={composeForm.body}
                onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                className="w-full px-3.5 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 leading-relaxed font-sans"
              />
            </div>

            {/* Hidden file & image inputs */}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="file"
              multiple
              accept="image/*"
              ref={imageInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attached files preview chips */}
            {composeForm.attachments?.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
                  <span>Lampiran ({composeForm.attachments.length} file)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Total: {formatFileSize(composeForm.attachments.reduce((acc, a) => acc + (a.size || 0), 0))}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  {composeForm.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-xl p-2 pr-2.5 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      {att.previewUrl ? (
                        <img
                          src={att.previewUrl}
                          alt={att.filename}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 flex-shrink-0">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="max-w-[170px] sm:max-w-[210px] min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-xs" title={att.filename}>
                          {att.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatFileSize(att.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(idx)}
                        className="ml-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                        title="Hapus lampiran ini"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom action bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl flex items-center gap-1.5 transition-all border border-slate-200/80 shadow-xs"
                >
                  <Paperclip size={14} className="text-slate-500" />
                  Lampirkan File
                </button>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-xl flex items-center gap-1.5 transition-all border border-slate-200/80 shadow-xs"
                >
                  <ImageIcon size={14} className="text-sky-600" />
                  Tambah Gambar
                </button>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('inbox')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Mengirim Email...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Kirim Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {activeView === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Settings size={18} className="text-sky-600" />
              Pengaturan Akun Email (Gmail atau Domain Sendiri)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Atur koneksi IMAP (untuk membaca kotak masuk) dan SMTP (untuk mengirim/membalas email).
            </p>
          </div>

          {configMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2 ${
                configMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {configMessage.type === 'success' ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="text-rose-600" />
              )}
              {configMessage.text}
            </div>
          )}

          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Pilih Jenis Penyedia Email:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => handleProviderChange('gmail')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  config.provider === 'gmail'
                    ? 'border-sky-600 bg-sky-50/40 text-slate-800 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  G
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Google Workspace / Gmail</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan alamat Gmail dan 16-digit Google App Password untuk akses aman tanpa blokir.
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleProviderChange('custom')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  config.provider === 'custom'
                    ? 'border-sky-600 bg-sky-50/40 text-slate-800 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Domain Sendiri (cPanel / Plesk / Webmail)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan hostname mail domain Anda sendiri (contoh: mail.bionet.id, support@perusahaan.com).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Guide Alert for Gmail */}
          {config.provider === 'gmail' && (
            <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-xl text-xs text-sky-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-sky-800">
                <HelpCircle size={15} />
                Petunjuk Pembuatan Google App Password:
              </div>
              <p className="text-slate-600 leading-relaxed">
                1. Buka <b>myaccount.google.com</b> &rarr; Tab <b>Keamanan (Security)</b> &rarr; Aktifkan <b>Verifikasi 2 Langkah</b>.
                <br />
                2. Cari menu <b>Sandi Aplikasi (App Passwords)</b> &rarr; Masukkan nama aplikasi "Bionet" &rarr; Klik Buat.
                <br />
                3. Salin kode 16-karakter yang muncul ke kolom <b>Password / Sandi Aplikasi</b> di bawah.
              </p>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Email Lengkap *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: akun@gmail.com atau info@domain.com"
                  value={config.email_address}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      email_address: e.target.value,
                      smtp_username: config.provider === 'gmail' ? e.target.value : config.smtp_username,
                      imap_username: config.provider === 'gmail' ? e.target.value : config.imap_username,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengirim (Display Name)</label>
                <input
                  type="text"
                  placeholder="contoh: Bionet Official, Ahmad Support"
                  value={config.sender_name}
                  onChange={(e) => setConfig({ ...config, sender_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-slate-800"
                />
              </div>
            </div>

            {/* SMTP Settings */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Server size={14} className="text-sky-600" />
                Pengaturan SMTP (Pengiriman & Balas Email)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={config.smtp_host}
                    onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SMTP Port</label>
                  <input
                    type="number"
                    required
                    value={config.smtp_port}
                    onChange={(e) => setConfig({ ...config, smtp_port: parseInt(e.target.value) || 587 })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">SMTP Username</label>
                  <input
                    type="text"
                    required
                    value={config.smtp_username}
                    onChange={(e) => setConfig({ ...config, smtp_username: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    SMTP Password / App Password
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password atau 16-digit kode"
                    value={config.smtp_password}
                    onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* IMAP Settings */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Inbox size={14} className="text-sky-600" />
                Pengaturan IMAP (Membaca Kotak Masuk Inbox)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">IMAP Host</label>
                  <input
                    type="text"
                    required
                    value={config.imap_host}
                    onChange={(e) => setConfig({ ...config, imap_host: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">IMAP Port</label>
                  <input
                    type="number"
                    required
                    value={config.imap_port}
                    onChange={(e) => setConfig({ ...config, imap_port: parseInt(e.target.value) || 993 })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">IMAP Username</label>
                  <input
                    type="text"
                    required
                    value={config.imap_username}
                    onChange={(e) => setConfig({ ...config, imap_username: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    IMAP Password
                  </label>
                  <input
                    type="password"
                    placeholder="Gunakan password yang sama atau password email"
                    value={config.imap_password}
                    onChange={(e) => setConfig({ ...config, imap_password: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* 🤖 Automasi Balas Pesan (Auto-Responder & Smart AI) */}
            <div className="p-5 bg-gradient-to-b from-white to-slate-50/70 rounded-xl border border-slate-200 shadow-sm space-y-5">
              {/* Header with Title, Badge, and Toggle Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Bot size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">
                        🤖 Automasi Balas Pesan (Auto-Responder & Smart AI)
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          config.auto_reply_enabled
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {config.auto_reply_enabled ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sistem akan secara otomatis mengirimkan email balasan setiap kali ada pesan baru yang masuk ke kotak masuk Anda.
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-semibold text-slate-600">
                    {config.auto_reply_enabled ? 'Auto-Reply Aktif' : 'Nonaktif'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={config.auto_reply_enabled}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        auto_reply_enabled: !prev.auto_reply_enabled,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                      config.auto_reply_enabled ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        config.auto_reply_enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Active Details when auto_reply_enabled is TRUE */}
              {config.auto_reply_enabled && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  {/* Mode Selection Cards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2.5">
                      Pilih Metode Balasan Otomatis:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Card 1: Standard Template */}
                      <div
                        onClick={() => setConfig((prev) => ({ ...prev, auto_reply_mode: 'standard' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          config.auto_reply_mode === 'standard'
                            ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                              config.auto_reply_mode === 'standard'
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Zap size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800">
                                ⚡ Template Kalimat Standar
                              </h4>
                              {config.auto_reply_mode === 'standard' && (
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Gunakan teks jawaban tetap yang dapat Anda sesuaikan bebas dengan preset siap pakai.
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] font-semibold text-sky-700 bg-sky-100/70 px-2.5 py-1 rounded-md w-fit">
                          Dapat Diedit Bebas & Cepat
                        </div>
                      </div>

                      {/* Card 2: Smart AI Auto-Reply (Google Gemini) */}
                      <div
                        onClick={() => setConfig((prev) => ({ ...prev, auto_reply_mode: 'ai' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 relative overflow-hidden ${
                          config.auto_reply_mode === 'ai'
                            ? 'border-purple-500 bg-purple-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                              config.auto_reply_mode === 'ai'
                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Sparkles size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                🧠 Smart AI Auto-Reply
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                                Google Gemini
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              Email masuk dianalisis konteksnya oleh AI untuk merespons otomatis secara cerdas & santun.
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-2.5 py-1 rounded-md w-fit">
                          24/7 Context-Aware AI Reasoning
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mode Details Section */}
                  {config.auto_reply_mode === 'standard' ? (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subjek Email Balasan Otomatis *
                        </label>
                        <input
                          type="text"
                          required={config.auto_reply_enabled && config.auto_reply_mode === 'standard'}
                          value={config.auto_reply_subject}
                          onChange={(e) => setConfig({ ...config, auto_reply_subject: e.target.value })}
                          placeholder="Re: [Bionet Official] Konfirmasi Penerimaan Email"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-slate-800"
                        />
                      </div>

                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <label className="block text-xs font-bold text-slate-700">
                            Isi Template Balasan (Dapat Diedit Bebas) *
                          </label>
                          {/* Quick Template Preset Buttons */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-slate-400 font-medium mr-1">Preset Cepat:</span>
                            {AUTO_REPLY_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyPreset(preset)}
                                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 rounded-lg transition-colors"
                                title={`Gunakan template: ${preset.title}`}
                              >
                                {preset.title}
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          required={config.auto_reply_enabled && config.auto_reply_mode === 'standard'}
                          rows={6}
                          value={config.auto_reply_message}
                          onChange={(e) => setConfig({ ...config, auto_reply_message: e.target.value })}
                          placeholder="Tuliskan template balasan otomatis untuk pelanggan Anda..."
                          className="w-full px-3.5 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 text-slate-800 leading-relaxed font-sans"
                        />
                        <p className="text-[11px] text-slate-400 mt-1">
                          Template ini akan langsung dikirimkan ke pengirim setiap kali ada email baru masuk.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-50/60 to-indigo-50/40 p-4 rounded-xl border border-purple-200/90 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                          <Sparkles size={16} className="text-purple-600" />
                          Mode Balasan Cerdas Google Gemini AI Sedang Aktif
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-200/70 text-purple-800">
                          Model: Gemini 2.0 / 1.5 Flash
                        </span>
                      </div>

                      <p className="text-xs text-purple-950/80 leading-relaxed">
                        Setiap email yang masuk ke kotak masuk Anda akan dipindai oleh Google Gemini AI. Sistem memahami pertanyaan pelanggan (seperti status pesanan herbal, kemitraan Bionet, atau info rekening) dan menyusun respon resmi yang ramah, akurat, dan sopan dalam hitungan detik.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100 text-xs">
                          <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-500" />
                            Respon Kontekstual
                          </div>
                          <p className="text-[11px] text-slate-500">Merespons sesuai topik email tanpa kaku seperti bot konvensional.</p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100 text-xs">
                          <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-500" />
                            Identitas Resmi Bionet
                          </div>
                          <p className="text-[11px] text-slate-500">Menyertakan salam resmi tim Bionet Indonesia dan nada bicara korporat.</p>
                        </div>

                        <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100 text-xs">
                          <div className="font-bold text-slate-800 mb-0.5 flex items-center gap-1.5">
                            <CheckCircle size={13} className="text-emerald-500" />
                            Otomatis 24 Jam
                          </div>
                          <p className="text-[11px] text-slate-500">Tetap melayani pertanyaan mitra dan pelanggan saat Anda sedang offline.</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-purple-200/60">
                        <label className="block text-[11px] font-bold text-purple-900 mb-1">
                          Prefix / Subjek Default Email Balasan AI:
                        </label>
                        <input
                          type="text"
                          value={config.auto_reply_subject}
                          onChange={(e) => setConfig({ ...config, auto_reply_subject: e.target.value })}
                          placeholder="Re: [Bionet Official] Tanggapan Pesan Anda"
                          className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={configSaving}
                className="px-6 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {configSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Simpan Konfigurasi Akun Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

