import React, { useState, useEffect } from 'react';
import {
  Video,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  UserPlus,
  Reply,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';

export default function TikTokAnalyticsTab({ user, onLeadCreated }) {
  const [overview, setOverview] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    loadTikTokData();
  }, []);

  const loadTikTokData = async () => {
    setLoading(true);
    try {
      const [ovRes, vidRes] = await Promise.all([
        api.get('/tiktok/overview'),
        api.get('/tiktok/videos?limit=10'),
      ]);

      if (ovRes.data?.data) {
        setOverview(ovRes.data.data);
      }
      if (vidRes.data?.data) {
        setVideos(vidRes.data.data);
        if (vidRes.data.data.length > 0) {
          const firstVidId = vidRes.data.data[0].video_id;
          setSelectedVideoId(firstVidId);
          loadComments(firstVidId);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat data TikTok:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (videoId) => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/tiktok/comments?video_id=${videoId || ''}`);
      if (res.data?.data) {
        setComments(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat komentar TikTok:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSelectVideo = (vidId) => {
    setSelectedVideoId(vidId);
    loadComments(vidId);
  };

  const handleConvertToLead = async (comment) => {
    try {
      const res = await api.post(`/tiktok/comments/${comment.id}/convert-lead`);
      setActionSuccess(`Komentar dari @${comment.author_username} berhasil dikonversi menjadi Prospek CRM!`);
      // Update local state
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, is_converted_lead: true } : c))
      );
      if (onLeadCreated) {
        onLeadCreated();
      }
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengonversi komentar ke lead CRM.');
    }
  };

  const handleSendReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/tiktok/comments/${commentId}/reply`, { text });
      setActionSuccess('Balasan Anda berhasil dikirim ke komentar TikTok!');
      setReplyText((prev) => ({ ...prev, [commentId]: '' }));
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membalas komentar.');
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num || 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center text-slate-400">
        <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-rose-500" />
        <p className="text-sm font-medium">Menghubungkan ke TikTok Creator & Video Analytics Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Notifikasi Aksi */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={16} className="text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Header KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tayangan (Views)</p>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {formatNumber(overview?.total_views)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
            <Heart size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Likes</p>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {formatNumber(overview?.total_likes)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Komentar</p>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {formatNumber(overview?.total_comments)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Share2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Shares</p>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {formatNumber(overview?.total_shares)}
            </h3>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Engagement Rate</p>
            <h3 className="text-lg font-black text-white">
              {(overview?.engagement_rate || 0).toFixed(2)}%
            </h3>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Video List (Left) + Comments Stream & Lead Conversion (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: TikTok Video Catalog (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Video size={16} className="text-rose-600" />
                Daftar Konten Video TikTok
              </h3>
              <span className="text-xs text-slate-400">{videos.length} Video Aktif</span>
            </div>

            <div className="space-y-3">
              {videos.map((vid) => {
                const isSelected = selectedVideoId === vid.video_id;
                return (
                  <div
                    key={vid.video_id}
                    onClick={() => handleSelectVideo(vid.video_id)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex gap-3 ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/20 shadow-sm'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                      <img
                        src={vid.cover_image_url}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-mono px-1 py-0.5 rounded">
                        {vid.duration_second}s
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                        {vid.title}
                      </h4>

                      <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-500 mt-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <Eye size={12} className="text-rose-500" />
                          {formatNumber(vid.view_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} className="text-pink-500" />
                          {formatNumber(vid.like_count)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} className="text-sky-500" />
                          {formatNumber(vid.comment_count)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        <span className="text-[10px] text-slate-400">
                          {new Date(vid.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <a
                          href={vid.video_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-0.5 font-semibold"
                        >
                          Buka di TikTok <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Comments & 1-Click Lead Converter (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MessageCircle size={16} className="text-sky-600" />
                  Komentar Audiens & Konversi Prospek
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Balas pertanyaan audiens langsung atau masukkan penanya potensial ke pipeline CRM.
                </p>
              </div>

              <button
                onClick={() => loadComments(selectedVideoId)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1"
                title="Refresh komentar"
              >
                <RefreshCw size={13} className={commentsLoading ? 'animate-spin text-rose-600' : ''} />
              </button>
            </div>

            {commentsLoading ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-rose-500" />
                <p className="text-xs">Memuat daftar komentar TikTok...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <MessageCircle size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Belum ada komentar pada video ini.</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-slate-100">
                {comments.map((c) => (
                  <div key={c.comment_id || c.id} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.author_avatar}
                          alt={c.author_username}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {c.author_nickname || c.author_username}
                            </span>
                            <span className="text-[10px] text-slate-400">@{c.author_username}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {c?.created_at ? new Date(c.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Convert to Lead Button */}
                      {c.is_converted_lead ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle size={12} /> Prospek CRM Aktif
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvertToLead(c)}
                          className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <UserPlus size={13} />
                          Konversi ke CRM Lead
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100 leading-relaxed">
                      {c.text}
                    </p>

                    {/* Reply Input Box */}
                    <div className="flex items-center gap-2 pl-2">
                      <input
                        type="text"
                        placeholder={`Balas komentar @${c.author_username}...`}
                        value={replyText[c.id] || ''}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [c.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendReply(c.id);
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-800 placeholder-slate-400"
                      />
                      <button
                        onClick={() => handleSendReply(c.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded-lg flex items-center gap-1"
                      >
                        <Send size={11} />
                        Balas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

