import React, { useState, useEffect, useRef } from 'react';
import {
  MessagesSquare,
  Send,
  User,
  Headphones,
  Search,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Shield,
  HelpCircle,
  MessageCircle,
  Smile,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../services/api';

const EMOJI_CATEGORIES = {
  'Reaksi': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '😊', '😇', '😍', '🤩', '😘', '😋', '😎', '🤝', '🙏'],
  'Tangan & Semangat': ['👍', '👎', '👏', '🙌', '💪', '🔥', '✨', '⭐', '🎉', '💯', '🚀', '👌', '✌️'],
  'Bisnis & Cuan': ['💰', '💵', '💳', '📈', '📊', '🏆', '🥇', '👑', '💎', '💼', '🛒', '📦'],
  'Herbal & Sehat': ['🌿', '🌱', '🍃', '💧', '💊', '🩺', '❤️', '🍵', '🍎', '☀️', '🌸', '🌳'],
};

export default function ChatTab({ currentUser }) {
  const isSupportRole = currentUser?.role === 'admin' || currentUser?.role === 'cs' || currentUser?.role === 'keuangan';

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Reaksi');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState(null); // { file, previewUrl, name, size, type }

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const quickRepliesMitra = [
    'Halo CS Bionet, mohon info jadwal penarikan dana.',
    'Bagaimana cara melakukan transfer PIN lisensi ke mitra baru?',
    'Kapan komisi bonus pasangan binary masuk ke dompet?',
    'Terima kasih banyak atas bantuannya!',
  ];

  const quickRepliesCS = [
    'Halo Kak, ada yang bisa kami bantu seputar kemitraan Bionet?',
    'Pengajuan penarikan dana Anda telah berhasil diproses melalui Flip.id.',
    'Serial PIN lisensi Anda sudah aktif dan siap didaftarkan.',
    'Terima kasih telah menghubungi Customer Service Bionet!',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for a specific conversation or for member support
  const fetchMessages = async (targetUserId = null, silent = false) => {
    if (!silent) setLoading(true);
    try {
      let url = '/chat/messages';
      if (isSupportRole && targetUserId) {
        url = `/chat/messages?with_user_id=${targetUserId}`;
      } else if (!isSupportRole) {
        url = `/chat/messages`;
      }

      const res = await api.get(url);
      if (res.data && res.data.data) {
        setMessages(res.data.data);
      }

      // Mark messages as read
      if (isSupportRole && targetUserId) {
        await api.patch(`/chat/read?with_user_id=${targetUserId}`);
      } else if (!isSupportRole) {
        await api.patch('/chat/read');
      }
    } catch (err) {
      console.error('Gagal mengambil pesan:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch conversation inbox for CS / Admin
  const fetchConversations = async (silent = false) => {
    if (!isSupportRole) return;
    try {
      const res = await api.get('/chat/conversations');
      if (res.data && res.data.data) {
        setConversations(res.data.data);
        // Auto-select first conversation if none selected
        if (!selectedUser && res.data.data.length > 0) {
          setSelectedUser(res.data.data[0]);
          fetchMessages(res.data.data[0].user_id, true);
        }
      }
    } catch (err) {
      console.error('Gagal memuat percakapan:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (isSupportRole) {
      fetchConversations();
    } else {
      fetchMessages();
    }

    // Polling every 4 seconds for real-time live chat feel
    const interval = setInterval(() => {
      if (isSupportRole) {
        fetchConversations(true);
        if (selectedUser) {
          fetchMessages(selectedUser.user_id, true);
        }
      } else {
        fetchMessages(null, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedUser?.user_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji popover on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji) => {
    setInputText((prev) => prev + emoji);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Maksimum batas ukuran: 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Ukuran file melebihi batas maksimum 5MB. Silakan pilih berkas yang lebih kecil.');
      setTimeout(() => setUploadError(''), 4000);
      return;
    }

    setUploadError('');
    const isImg = file.type.startsWith('image/');
    const previewUrl = isImg ? URL.createObjectURL(file) : null;

    setSelectedAttachment({
      file,
      name: file.name,
      size: file.size,
      type: isImg ? 'image' : 'document',
      previewUrl,
    });
  };

  const cancelAttachment = () => {
    if (selectedAttachment?.previewUrl) {
      URL.revokeObjectURL(selectedAttachment.previewUrl);
    }
    setSelectedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedAttachment) || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      let attachmentUrl = '';
      let attachmentType = '';
      let attachmentName = '';
      let attachmentSize = 0;

      // Jika ada attachment terpilih, unggah dulu via /api/chat/upload
      if (selectedAttachment) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', selectedAttachment.file);

        const uploadRes = await api.post('/chat/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.data) {
          attachmentUrl = uploadRes.data.data.url;
          attachmentType = uploadRes.data.data.type;
          attachmentName = uploadRes.data.data.name;
          attachmentSize = uploadRes.data.data.size;
        }
        cancelAttachment();
      }

      const payload = {
        message: messageText,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
        attachment_size: attachmentSize,
      };

      if (isSupportRole && selectedUser) {
        payload.receiver_id = selectedUser.user_id;
        payload.room = `support-${selectedUser.user_id}`;
      }

      const res = await api.post('/chat/messages', payload);
      if (res.data && res.data.data) {
        setMessages((prev) => [...prev, res.data.data]);
        scrollToBottom();
      }

      if (isSupportRole) {
        fetchConversations(true);
      }
    } catch (err) {
      console.error('Gagal mengirim pesan:', err);
      setUploadError(err.response?.data?.message || 'Gagal mengirim pesan atau lampiran berkas');
      setTimeout(() => setUploadError(''), 4000);
    } finally {
      setSending(false);
      setUploadingFile(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedUser(conv);
    fetchMessages(conv.user_id);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
            <MessagesSquare size={26} className="text-emerald-600 flex-shrink-0" />
            <span>
              {isSupportRole ? 'Pusat Helpdesk & Live Chat Bantuan' : 'Live Chat Bantuan Layanan Pelanggan'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isSupportRole
              ? 'Kelola tiket percakapan mitra, panduan jaringan binary, kendala mutasi, dan pencairan bonus harian.'
              : 'Komunikasi langsung dengan Tim Layanan Pelanggan (CS) dan Administrator Bionet Pusat.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Support Online 24/7</span>
          </span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="dash-card overflow-hidden h-[620px] flex flex-col md:flex-row border border-slate-200 shadow-md">
        {/* Left Sidebar for CS / Admin (Conversations list) */}
        {isSupportRole && (
          <div
            className={`w-full md:w-80 border-r border-slate-200 bg-slate-50/70 flex flex-col h-full ${
              selectedUser ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mitra / username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Belum ada percakapan aktif
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedUser?.user_id === conv.user_id;
                  return (
                    <div
                      key={conv.user_id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-100/80 bg-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {conv.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-800 truncate">
                            {conv.full_name || conv.username}
                          </span>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {conv.last_message_at}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">@{conv.username}</div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {conv.last_message || 'Mulai pesan...'}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right Pane: Active Chat Room */}
        <div className={`flex-1 flex flex-col h-full bg-slate-50/30 ${
          isSupportRole && !selectedUser ? 'hidden md:flex items-center justify-center' : 'flex'
        }`}>
          {isSupportRole && !selectedUser ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <Headphones size={36} className="mx-auto text-slate-300" />
              <h5 className="font-bold text-sm text-slate-600">Pilih Percakapan Mitra</h5>
              <p className="text-xs max-w-xs">
                Pilih salah satu mitra di daftar sebelah kiri untuk memulai layanan bantuan dan menjawab pertanyaan.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Room Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  {isSupportRole && (
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}

                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {isSupportRole ? (
                      selectedUser?.username?.slice(0, 2).toUpperCase() || 'M'
                    ) : (
                      <Headphones size={18} />
                    )}
                  </div>

                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>
                        {isSupportRole
                          ? selectedUser?.full_name || selectedUser?.username
                          : 'Customer Service & Helpdesk Bionet'}
                      </span>
                      {isSupportRole ? (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                          {selectedUser?.role || 'Mitra'}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                          <Shield size={10} />
                          <span>Official</span>
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {isSupportRole ? `@${selectedUser?.username}` : 'Respon cepat dalam < 5 menit'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fetchMessages(selectedUser?.user_id, true)}
                  title="Segarkan Pesan"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
                {/* Security Note Banner */}
                <div className="text-center my-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-white/80 border border-slate-200 px-3 py-1 rounded-full shadow-xs">
                    <Shield size={12} className="text-emerald-600" />
                    <span>Percakapan dienkripsi secara aman & tersimpan dalam log audit Bionet</span>
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                    Memuat riwayat obrolan...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center space-y-2 text-slate-400">
                    <MessageCircle size={32} className="mx-auto text-emerald-300" />
                    <p className="text-xs">Belum ada riwayat pesan. Silakan ketik pesan pertama Anda di bawah.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    const timeStr = new Date(msg.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in-50 duration-200`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-slate-500 mb-1 ml-1 flex items-center gap-1">
                            <span>{msg.sender?.full_name || msg.sender?.username || 'CS Bionet'}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-normal">
                              {msg.sender?.role?.toUpperCase() || 'SUPPORT'}
                            </span>
                          </span>
                        )}

                        <div
                          className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-xs text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          {/* Image Attachment Preview */}
                          {msg.attachment_url && msg.attachment_type === 'image' && (
                            <div className="mb-2 overflow-hidden rounded-xl bg-black/10 border border-black/5">
                              <img
                                src={msg.attachment_url}
                                alt={msg.attachment_name || 'Lampiran Gambar'}
                                className="max-h-60 w-auto rounded-lg object-cover cursor-pointer hover:opacity-95 transition"
                                onClick={() => {
                                  const targetUrl = msg.attachment_url.startsWith('http')
                                    ? msg.attachment_url
                                    : msg.attachment_url;
                                  window.open(targetUrl, '_blank');
                                }}
                                onError={(e) => {
                                  if (!e.target.dataset.triedFallback && msg.attachment_url?.startsWith('/uploads')) {
                                    e.target.dataset.triedFallback = 'true';
                                    e.target.src = `http://localhost:8081${msg.attachment_url}`;
                                  }
                                }}
                              />
                            </div>
                          )}

                          {/* Document Attachment Card */}
                          {msg.attachment_url && msg.attachment_type === 'document' && (
                            <a
                              href={msg.attachment_url}
                              download={msg.attachment_name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl mb-2 transition border ${
                                isMe
                                  ? 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMe ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'}`}>
                                <FileText size={18} />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="font-bold text-xs truncate">{msg.attachment_name || 'Dokumen'}</div>
                                <div className={`text-[10px] ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                                  {msg.attachment_size ? (msg.attachment_size / 1024).toFixed(1) + ' KB' : 'Dokumen'}
                                </div>
                              </div>
                              <Download size={14} className={isMe ? 'text-white' : 'text-slate-400'} />
                            </a>
                          )}

                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] mt-1 font-mono ${
                              isMe ? 'text-emerald-100/80' : 'text-slate-400'
                            }`}
                          >
                            <span>{timeStr}</span>
                            {isMe && (
                              msg.is_read ? (
                                <CheckCheck size={12} className="text-emerald-200" />
                              ) : (
                                <Check size={12} className="text-emerald-200/60" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies Carousel / Chips */}
              <div className="px-4 py-2 bg-white/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-500" />
                  <span>Cepat:</span>
                </span>
                {(isSupportRole ? quickRepliesCS : quickRepliesMitra).map((reply, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(reply)}
                    className="px-2.5 py-1 text-[11px] rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-slate-600 transition flex-shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Attachment Preview Bar (if file selected) */}
              {selectedAttachment && (
                <div className="px-4 py-2 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedAttachment.type === 'image' && selectedAttachment.previewUrl ? (
                      <img
                        src={selectedAttachment.previewUrl}
                        alt="Preview"
                        className="w-9 h-9 rounded-lg object-cover border border-emerald-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                        <FileText size={18} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate max-w-[200px] sm:max-w-md">
                        {selectedAttachment.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {(selectedAttachment.size / 1024).toFixed(1)} KB &bull; Maks. 5MB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={cancelAttachment}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Upload Error Banner */}
              {uploadError && (
                <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle size={14} className="text-rose-600 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Input Box & Emoticon Picker */}
              <div className="relative">
                {/* Emoticon Picker Popover */}
                {emojiPickerOpen && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-4 mb-2 z-40 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 w-80 max-w-[calc(100vw-2rem)] animate-fadeIn"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Smile size={14} className="text-amber-500" />
                        <span>Pilih Emoticon</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmojiPickerOpen(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Emoji Category Tabs */}
                    <div className="flex items-center gap-1 border-b border-slate-100 pb-1 mb-2 overflow-x-auto no-scrollbar text-[11px]">
                      {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveEmojiCategory(cat)}
                          className={`px-2 py-0.5 rounded-md font-semibold whitespace-nowrap transition ${
                            activeEmojiCategory === cat
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Emoji Grid */}
                    <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-1 text-lg">
                      {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition active:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  {/* Emoji Button */}
                  <button
                    type="button"
                    onClick={() => setEmojiPickerOpen((prev) => !prev)}
                    title="Sisipkan Emoticon"
                    className={`p-2 rounded-xl transition ${
                      emojiPickerOpen
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <Smile size={18} />
                  </button>

                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Unggah Gambar / Dokumen (Maks. 5MB)"
                    className={`p-2 rounded-xl transition ${
                      selectedAttachment
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <Paperclip size={18} />
                  </button>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    className="hidden"
                  />

                  <input
                    type="text"
                    placeholder={selectedAttachment ? 'Tambahkan keterangan berkas (opsional)...' : 'Ketik pesan Anda... (Enter untuk kirim)'}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 py-2 px-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition"
                  />

                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !selectedAttachment) || sending || uploadingFile}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs shadow-sm shadow-emerald-600/30 transition flex items-center gap-1.5 active:scale-95"
                  >
                    {uploadingFile || sending ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    <span className="hidden sm:inline">
                      {uploadingFile ? 'Mengunggah...' : sending ? 'Mengirim...' : 'Kirim'}
                    </span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
