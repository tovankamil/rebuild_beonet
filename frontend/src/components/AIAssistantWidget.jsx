import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';

export default function AIAssistantWidget({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Halo ${currentUser?.full_name ? currentUser.full_name.split(' ')[0] : 'Mitra'}! 👋 Saya adalah Asisten AI Bionet (didukung Google Gemini).\n\nAda yang bisa saya bantu seputar bonus pasangan, pohon jaringan binary, aktivasi PIN, atau produk herbal Repeat Order?`,
      time: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Bagaimana cara perhitungan bonus pairing?',
    'Apa saja produk herbal BPOM yang aktif?',
    'Jelaskan cara aktivasi PIN serial mitra',
    'Berapa batas pencairan saldo harian?',
  ];

  const handleSend = async (textToSend) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: promptText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: promptText });
      const reply = res.data?.reply || 'Maaf, saya tidak menerima respons yang valid.';

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: '⚠️ Maaf, layanan AI sedang sibuk memproses antrean. Silakan coba sesaat lagi.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3 rounded-full shadow-[0_10px_25px_rgba(5,150,105,0.4)] flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30 group"
          aria-label="Tanya Asisten AI Bionet"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-emerald-200 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[11px] font-bold tracking-wide uppercase text-emerald-100">Bionet AI</div>
            <div className="text-xs font-extrabold text-white">Tanya Asisten</div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse sm:hidden" />
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[540px] max-h-[85vh] bg-white rounded-2xl shadow-[0_25px_60px_rgba(15,23,42,0.25)] border border-slate-200 ring-1 ring-slate-900/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#07241b] to-[#0d3f31] px-4 py-3.5 flex items-center justify-between text-white border-b border-emerald-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-heading font-extrabold text-xs text-white">Bionet AI Copilot</h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                    Gemini 3.1
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online • Terhubung ke Database Bionet</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                title="Tutup Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Telegram Banner Notice */}
          <a
            href="https://t.me/Tfn_assistant_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-indigo-50/90 hover:bg-indigo-100/90 px-3.5 py-2 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900 transition-colors"
          >
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="font-bold">📱 Bot Telegram:</span>
              <span className="truncate">Tersedia di @Tfn_assistant_bot</span>
            </div>
            <ExternalLink size={12} className="text-indigo-600 shrink-0 ml-1" />
          </a>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[9px] mt-1 text-right font-medium ${
                      m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <RefreshCw size={12} className="animate-spin text-emerald-600" />
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-600 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium ml-1">Menganalisa data Bionet...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 3 && (
            <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-[10.5px] font-medium text-slate-600 transition-colors shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja seputar Bionet..."
              disabled={loading}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 shadow-xs transition-colors shrink-0"
              title="Kirim Pesan"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
