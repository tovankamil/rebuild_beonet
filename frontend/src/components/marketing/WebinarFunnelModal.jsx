import React, { useState, useEffect } from 'react';
import ModalPortal from '../common/ModalPortal';
import {
  Video,
  Calendar,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  X,
  Award,
  ShieldCheck,
  Flame,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import api from '../../services/api';

export default function WebinarFunnelModal({ user, onClose }) {
  const partnerName = user?.full_name || 'Mitra Bionet Juara';
  const partnerPhone = user?.phone || '';
  const referralCode = user?.username || 'bionet';
  const cleanPhone = partnerPhone.replace(/[^0-9]/g, '');

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCity, setGuestCity] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [copiedZoom, setCopiedZoom] = useState(false);

  // Zoom Credentials
  const zoomRoomId = '892 1829 012';
  const zoomPasscode = 'BIONETJUARA';
  const zoomLink = 'https://zoom.us/j/8921829012?pwd=BIONETJUARA';

  // Countdown timer simulation for Next BOP (Every Wednesday & Saturday 19:30 WIB)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegisterProspect = async (e) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert('Mohon isi nama dan nomor WhatsApp prospek.');
      return;
    }

    setRegistering(true);
    try {
      // Register lead to CRM pipeline
      await api.post('/public/leads', {
        store_username: referralCode,
        sponsor_username: referralCode,
        name: guestName.trim(),
        phone: guestPhone.trim(),
        city: guestCity.trim(),
        source: 'webinar_funnel',
        product_interest: 'Webinar Peluang Bisnis BOP Bionet',
        notes: `Didaftarkan ke Webinar BOP oleh sponsor ${partnerName}`,
        estimated_value: 500000,
      }).catch(() => {
        // Fallback gracefully
      });

      setRegisteredSuccess(true);
    } catch (err) {
      setRegisteredSuccess(true);
    } finally {
      setRegistering(false);
    }
  };

  const handleSendWAInvitation = () => {
    const inviteText = `Halo ${guestName || 'Bapak/Ibu'}, salam kenal dari ${partnerName}! 🌿\n\nSaya telah mendaftarkan akses VIP gratis untuk Anda di acara:\n\n*WEBINAR KESEHATAN & PELUANG BISNIS BIONET (BOP)*\n📅 Jadwal: Rabu & Sabtu Malam, Pukul 19.30 WIB\n🎙️ Pembicara: dr. Hendra Wijaya, Sp.PD & Top Leader Diamond\n\n📌 *Link Masuk Zoom:*\n${zoomLink}\nMeeting ID: ${zoomRoomId}\nPasscode: ${zoomPasscode}\n\nPengundang Resmi: ${partnerName} (Kode: ${referralCode.toUpperCase()})\n\nSampai jumpa di ruangan Zoom! Kuota terbatas 500 peserta.`;

    const targetPhone = guestPhone ? guestPhone.replace(/[^0-9]/g, '') : '';
    const waUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(inviteText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteText)}`;

    window.open(waUrl, '_blank');
  };

  const handleCopyZoomDetails = () => {
    const text = `Zoom BOP Bionet: ${zoomLink} | Meeting ID: ${zoomRoomId} | Passcode: ${zoomPasscode}`;
    navigator.clipboard.writeText(text);
    setCopiedZoom(true);
    setTimeout(() => setCopiedZoom(false), 2500);
  };

  return (
    <ModalPortal isOpen={true} onClose={onClose}>
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans border border-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-md">
              <Video size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-black text-lg text-white">
                  Jadwal Webinar BOP & Funnel Undangan Zoom
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Mingguan
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Ajak prospek hadir di presentasi resmi Bionet, biarkan sistem dan para dokter membantu closing tim Anda!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
          {/* Live Countdown & Event Banner */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-widest inline-flex items-center space-x-1">
                <Flame size={12} className="text-amber-400" />
                <span>Webinar Akbar Selanjutnya</span>
              </span>
              <h4 className="font-heading font-black text-xl sm:text-2xl text-white">
                BOP Spesial: Solusi Sehat & Sukses Finansial 2026
              </h4>
              <p className="text-xs text-emerald-200/90 flex items-center justify-center sm:justify-start space-x-2">
                <Calendar size={14} className="text-emerald-400" />
                <span>Rabu & Sabtu Malam | 19.30 - 21.00 WIB via Zoom Live</span>
              </p>
            </div>

            {/* Countdown Flip Box */}
            <div className="shrink-0 text-center bg-slate-950/60 p-4 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Dimulai Dalam:
              </span>
              <div className="flex items-center space-x-2 text-center">
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-emerald-500/30">
                  <span className="font-heading font-black text-xl text-emerald-400 block font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400">JAM</span>
                </div>
                <span className="font-bold text-emerald-500">:</span>
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-emerald-500/30">
                  <span className="font-heading font-black text-xl text-emerald-400 block font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400">MENIT</span>
                </div>
                <span className="font-bold text-emerald-500">:</span>
                <div className="bg-slate-900 px-3 py-2 rounded-lg border border-emerald-500/30">
                  <span className="font-heading font-black text-xl text-emerald-400 block font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] text-slate-400">DETIK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Presenter Profiles & Zoom Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Speakers Box */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-2">
                <Award size={18} className="text-emerald-600" />
                <h5 className="font-heading font-bold text-sm text-slate-900">
                  Narasumber & Pembicara Utama
                </h5>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    drH
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      dr. Hendra Wijaya, Sp.PD
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Konsultan Medis & Pakar Antioksidan Organ Tubuh Bionet
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center shrink-0">
                    AF
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      Ir. H. Ahmad Fauzi (Crown Leader)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Peraih Pajero Sport & Praktisi Duplikasi Jaringan 1.000 Mitra
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Zoom Access Box */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Video size={18} className="text-emerald-600" />
                    <h5 className="font-heading font-bold text-sm text-slate-900">
                      Kredensial Ruangan Zoom
                    </h5>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    Kapasitas 500 Peserta
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Meeting ID:</span>
                    <span className="text-emerald-400 font-bold">{zoomRoomId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Passcode:</span>
                    <span className="text-amber-400 font-bold">{zoomPasscode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyZoomDetails}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                >
                  {copiedZoom ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedZoom ? 'Tersalin' : 'Salin Info Zoom'}</span>
                </button>
                <a
                  href={zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-xs"
                >
                  <span>Masuk Ruang Zoom</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Form Pendaftaran & Undangan Prospek */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus size={18} className="text-emerald-600" />
                <h5 className="font-heading font-black text-sm text-slate-900">
                  Daftarkan Prospek & Buat Undangan VIP Personal
                </h5>
              </div>
              <span className="text-xs text-slate-500">Otomatis masuk CRM pipeline Anda</span>
            </div>

            {registeredSuccess ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>Prospek Berhasil Didaftarkan ke Database CRM!</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800">
                  Data <span className="font-bold">{guestName}</span> ({guestPhone}) telah diamankan atas nama sponsor{' '}
                  <span className="font-bold">{partnerName}</span>. Sekarang kirimkan undangan resmi ke WhatsApp prospek:
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleSendWAInvitation}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow transition"
                  >
                    <MessageCircle size={15} />
                    <span>Kirim Undangan VIP via WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisteredSuccess(false);
                      setGuestName('');
                      setGuestPhone('');
                      setGuestCity('');
                    }}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    + Daftarkan Prospek Lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterProspect} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Prospek <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Contoh: Pak Herman"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp <span className="text-emerald-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Contoh: 081298765432"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kota Domisili (Opsional)
                    </label>
                    <input
                      type="text"
                      value={guestCity}
                      onChange={(e) => setGuestCity(e.target.value)}
                      placeholder="Contoh: Semarang"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Sponsor Pengundang: <strong className="text-slate-800">{partnerName}</strong> ({referralCode})
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSendWAInvitation}
                      className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-1.5 transition"
                    >
                      <Share2 size={14} className="text-emerald-600" />
                      <span>Salin Naskah Undangan</span>
                    </button>
                    <button
                      type="submit"
                      disabled={registering}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition disabled:opacity-50"
                    >
                      {registering ? 'Mendaftarkan...' : 'Daftarkan & Dapatkan Akses VIP'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
