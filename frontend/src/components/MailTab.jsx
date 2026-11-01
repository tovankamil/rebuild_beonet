import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import api from '../services/api';

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
  });
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState(null);

  // Compose / Reply state
  const [composeForm, setComposeForm] = useState({
    to: '',
    subject: '',
    body: '',
    in_reply_to: '',
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);

  // Load config and inbox on mount
  useEffect(() => {
    fetchConfig();
    fetchInbox();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/mail/config');
      if (res.data?.data) {
        setConfig((prev) => ({ ...prev, ...res.data.data }));
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
    });
    setActiveView('compose');
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
      const res = await api.post('/mail/send', composeForm);
      setSendSuccess('Email berhasil dikirim!');
      setComposeForm({ to: '', subject: '', body: '', in_reply_to: '' });
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
              setComposeForm({ to: '', subject: '', body: '', in_reply_to: '' });
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
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveView('inbox')}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} />
              Kembali ke Kotak Masuk
            </button>

            {selectedEmail && (
              <button
                onClick={() => handleReply(selectedEmail)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Reply size={14} />
                Balas Email Ini
              </button>
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
              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                >
                  <Reply size={16} />
                  Balas Pesan Ini (@{selectedEmail.from})
                </button>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Email *</label>
              <textarea
                required
                rows={10}
                placeholder="Tuliskan pesan Anda di sini..."
                value={composeForm.body}
                onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                className="w-full px-3.5 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
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

