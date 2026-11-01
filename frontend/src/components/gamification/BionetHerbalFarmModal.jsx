import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Droplets,
  Heart,
  Sparkles,
  Award,
  Users,
  Gift,
  CheckCircle2,
  Share2,
  RefreshCw,
  ShoppingBag,
  Volume2,
  VolumeX,
  Compass,
  ArrowRight,
  Sun,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import api from '../../services/api';

// Pure in-browser lightweight celebratory particle burst (zero external dependencies)
function triggerFarmConfetti({ particleCount = 40, origin = { y: 0.6 } } = {}) {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6'];
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: canvas.width * 0.5,
      y: canvas.height * (origin.y || 0.6),
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 14,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
    }));

    let start = performance.now();
    function render(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.alpha -= 0.015;
        p.rotation += p.vRot;
        if (p.alpha > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (elapsed < 2000) {
        requestAnimationFrame(render);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(render);
  } catch {}
}

// Web Audio API Synthesizer for rich pastoral sounds without heavy external mp3s
class FarmSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playWaterSplash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Gentle water ripple sequence
      [360, 520, 680, 840].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + idx * 0.05 + 0.12);

        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.16);
      });
    } catch {}
  }

  playBeeBuzz() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.2);
      osc.frequency.linearRampToValueAtTime(220, now + 0.4);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  playPetPurr() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  playHarvestVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Majestic harp victory chord (C Major Pentatonic)
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.48);
      });
    } catch {}
  }
}

const soundEngine = new FarmSoundEngine();

// Catalog of Nusantara Herbal Seeds
const SEEDS_CATALOG = [
  {
    id: 'propolis_flower',
    name: 'Bunga Air Mata Pengantin (Nektar Trigona)',
    tag: 'Mudah • Favorit Lebah',
    targetWater: 100,
    timeDesc: '10x Siram Air',
    rewardDesc: 'Madu Propolis Asli + Voucher Belanja RO 10%',
    rewardType: 'voucher',
    rewardValue: 10000,
    badgeColor: 'from-amber-400 to-amber-600',
    iconEmoji: '🌺',
    plantColor: 'text-rose-500',
  },
  {
    id: 'red_ginger',
    name: 'Jahe Merah & Temulawak Organik',
    tag: 'Sedang • Peningkat Imun',
    targetWater: 150,
    timeDesc: '15x Siram Air',
    rewardDesc: 'Bio Herbal Tonic + Voucher Belanja RO 20%',
    rewardType: 'voucher',
    rewardValue: 25000,
    badgeColor: 'from-orange-400 to-amber-600',
    iconEmoji: '🌿',
    plantColor: 'text-amber-600',
  },
  {
    id: 'bio_sirsak',
    name: 'Pohon Sirsak & Bio Herbal Drops',
    tag: 'Spesial • Anti-Oksidan Alami',
    targetWater: 200,
    timeDesc: '20x Siram Air',
    rewardDesc: 'Gratis Ongkir Seluruh Indonesia + Saldo Rp 15.000',
    rewardType: 'wallet_cash',
    rewardValue: 15000,
    badgeColor: 'from-emerald-400 to-teal-600',
    iconEmoji: '🍃',
    plantColor: 'text-emerald-600',
  },
  {
    id: 'royal_trigona',
    name: 'Herbal Emas Propolis Trigona Bionet',
    tag: 'Jackpot • Panen Akbar',
    targetWater: 300,
    timeDesc: '30x Siram Air',
    rewardDesc: '1 Botol Bio Propolis Trigona + Saldo Rp 50.000',
    rewardType: 'wallet_cash',
    rewardValue: 50000,
    badgeColor: 'from-yellow-400 to-amber-600',
    iconEmoji: '🍯',
    plantColor: 'text-yellow-500',
  },
];

export default function BionetHerbalFarmModal({ isOpen, onClose, currentUser, onRewardClaimed }) {
  const [activeSubTab, setActiveSubTab] = useState('farm'); // 'farm', 'seeds', 'friends', 'harvests'
  const [loading, setLoading] = useState(false);
  const [wateringAnim, setWateringAnim] = useState(false);
  const [muted, setMuted] = useState(false);
  const [petActionNote, setPetActionNote] = useState('');
  const [harvestSuccessModal, setHarvestSuccessModal] = useState(null);

  // Local game state fallback (synced with backend /api/farm)
  const [farmData, setFarmData] = useState({
    plot: {
      id: 'plot-1',
      plant_type: 'propolis_flower',
      plant_name: 'Bunga Air Mata Pengantin (Nektar Trigona)',
      current_water: 40,
      target_water: 100,
      stage: 'growing', // 'seed', 'sprout', 'growing', 'bloom', 'harvest_ready'
      health: 100,
      reward_title: 'Madu Propolis Asli + Voucher Diskon RO 10%',
      reward_type: 'voucher',
      reward_value: 10000,
    },
    pet: {
      id: 'pet-1',
      pet_type: 'trigona_bee',
      pet_name: 'Lebah Klanceng (Trigona)',
      happiness: 85,
      level: 3,
    },
    water_tank: {
      water_droplets: 70,
      max_capacity: 100,
      total_harvests: 2,
    },
    friends: [
      { id: 'f-1', full_name: 'Herman Prasetyo (Sponsor)', username: 'herman_bionet', plant_name: 'Jahe Merah Organik', stage: 'bloom', helped_today: false },
      { id: 'f-2', full_name: 'Siti Rahmawati', username: 'siti_herbal', plant_name: 'Bunga Air Mata Pengantin', stage: 'growing', helped_today: false },
      { id: 'f-3', full_name: 'Budi Santoso (Gudang)', username: 'budi_gudang', plant_name: 'Herbal Emas Trigona', stage: 'harvest_ready', helped_today: true },
      { id: 'f-4', full_name: 'Dewi Lestari', username: 'dewi_propolis', plant_name: 'Pohon Sirsak Bio Drops', stage: 'sprout', helped_today: false },
    ],
    harvest_history: [
      { id: 'h-1', plant_name: 'Bunga Air Mata Pengantin', reward: 'Voucher Diskon RO 10%', voucher_code: 'PANEN-TRIGONA-982', date: '30 Okt 2026' },
      { id: 'h-2', plant_name: 'Jahe Merah Organik', reward: 'Voucher Diskon RO 20%', voucher_code: 'PANEN-JAHE-411', date: '28 Okt 2026' },
    ],
  });

  // Fetch farm state from backend
  const fetchFarmState = async () => {
    try {
      const res = await api.get('/farm/state');
      if (res.data?.status === 'success' && res.data.data) {
        setFarmData((prev) => ({
          ...prev,
          plot: res.data.data.plot || prev.plot,
          pet: res.data.data.pet || prev.pet,
          water_tank: res.data.data.water_tank || prev.water_tank,
          friends: res.data.data.friends || prev.friends,
          harvest_history: res.data.data.harvest_history || prev.harvest_history,
        }));
      }
    } catch {
      // Gracefully fall back to rich client-side game state
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFarmState();
      soundEngine.init();
    }
  }, [isOpen]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
  };

  // Water the Plant
  const handleWaterPlant = async () => {
    if (wateringAnim || loading) return;

    if (farmData.water_tank.water_droplets < 10) {
      alert('Tetesan air Anda habis! Kunjungi dan bantu siram kebun rekan atau tunggu air terisi kembali.');
      return;
    }

    setWateringAnim(true);
    soundEngine.playWaterSplash();

    try {
      const res = await api.post('/farm/water');
      if (res.data?.status === 'success' && res.data.data) {
        setFarmData((prev) => ({
          ...prev,
          plot: res.data.data.plot,
          water_tank: res.data.data.water_tank,
          pet: res.data.data.pet || prev.pet,
        }));
      } else {
        simulateClientWatering();
      }
    } catch {
      simulateClientWatering();
    } finally {
      setTimeout(() => setWateringAnim(false), 900);
    }
  };

  const simulateClientWatering = () => {
    setFarmData((prev) => {
      const newWater = Math.min(prev.plot.target_water, prev.plot.current_water + 10);
      const ratio = newWater / prev.plot.target_water;
      let newStage = 'seed';
      if (ratio >= 1.0) newStage = 'harvest_ready';
      else if (ratio >= 0.75) newStage = 'bloom';
      else if (ratio >= 0.45) newStage = 'growing';
      else if (ratio >= 0.2) newStage = 'sprout';

      if (newStage === 'harvest_ready' && prev.plot.stage !== 'harvest_ready') {
        triggerFarmConfetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        soundEngine.playHarvestVictory();
      }

      return {
        ...prev,
        plot: {
          ...prev.plot,
          current_water: newWater,
          stage: newStage,
        },
        water_tank: {
          ...prev.water_tank,
          water_droplets: Math.max(0, prev.water_tank.water_droplets - 10),
        },
        pet: {
          ...prev.pet,
          happiness: Math.min(100, prev.pet.happiness + 5),
        },
      };
    });
  };

  // Plant a new seed
  const handleSelectSeed = async (seed) => {
    setLoading(true);
    try {
      await api.post('/farm/plant', { plant_type: seed.id });
    } catch {}

    setFarmData((prev) => ({
      ...prev,
      plot: {
        id: 'plot-' + Date.now(),
        plant_type: seed.id,
        plant_name: seed.name,
        current_water: 0,
        target_water: seed.targetWater,
        stage: 'seed',
        health: 100,
        reward_title: seed.rewardDesc,
        reward_type: seed.rewardType,
        reward_value: seed.rewardValue,
      },
    }));
    setActiveSubTab('farm');
    setLoading(false);
  };

  // Harvest Plant
  const handleHarvest = async () => {
    if (farmData.plot.stage !== 'harvest_ready') return;

    soundEngine.playHarvestVictory();
    triggerFarmConfetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

    const harvestCode = 'PANEN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newHarvest = {
      id: 'h-' + Date.now(),
      plant_name: farmData.plot.plant_name,
      reward: farmData.plot.reward_title,
      voucher_code: harvestCode,
      date: 'Hari Ini',
    };

    try {
      await api.post('/farm/harvest');
    } catch {}

    setHarvestSuccessModal(newHarvest);

    setFarmData((prev) => ({
      ...prev,
      plot: {
        ...prev.plot,
        stage: 'harvested',
      },
      water_tank: {
        ...prev.water_tank,
        total_harvests: prev.water_tank.total_harvests + 1,
      },
      harvest_history: [newHarvest, ...prev.harvest_history],
    }));

    if (onRewardClaimed) onRewardClaimed();
  };

  // Pet & Feed the Bee / Cat
  const handlePetAction = async () => {
    soundEngine.playPetPurr();
    soundEngine.playBeeBuzz();
    setPetActionNote('✨ Lebah & Kucing merasa disayangi! +15 Tetes Air Bonus ditambahkan!');
    setTimeout(() => setPetActionNote(''), 3500);

    try {
      await api.post('/farm/feed-pet');
    } catch {}

    setFarmData((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        happiness: 100,
        level: Math.min(10, prev.pet.level + 1),
      },
      water_tank: {
        ...prev.water_tank,
        water_droplets: Math.min(prev.water_tank.max_capacity, prev.water_tank.water_droplets + 15),
      },
    }));
  };

  // Help water a friend's garden
  const handleHelpFriend = async (friend) => {
    if (friend.helped_today) return;

    soundEngine.playWaterSplash();
    triggerFarmConfetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 },
    });

    try {
      await api.post(`/farm/help-water/${friend.id}`);
    } catch {}

    setFarmData((prev) => ({
      ...prev,
      friends: prev.friends.map((f) => (f.id === friend.id ? { ...f, helped_today: true } : f)),
      water_tank: {
        ...prev.water_tank,
        water_droplets: Math.min(prev.water_tank.max_capacity, prev.water_tank.water_droplets + 15),
      },
    }));

    alert(`Alhamdulillah! Anda telah membantu menyiram kebun ${friend.full_name}. Anda mendapatkan hadiah +15 tetes air!`);
  };

  if (!isOpen) return null;

  const currentProgressPercent = Math.min(
    100,
    Math.round((farmData.plot.current_water / (farmData.plot.target_water || 100)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Farm Top Sky Header Bar */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-4 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30">
              🏡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/30 text-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Intermezo Komunitas Bionet
                </span>
                <span className="text-[10px] bg-amber-400 text-amber-950 font-extrabold px-1.5 py-0.5 rounded-md">
                  Level {farmData.pet.level}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-heading font-black tracking-tight text-white flex items-center gap-1.5">
                Kebun Herbal &amp; Peternakan Lebah
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              title={muted ? 'Aktifkan Suara' : 'Matikan Suara'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Droplet Tank & Quick Status Ribbon */}
        <div className="bg-emerald-50/90 border-b border-emerald-100 px-5 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-100 text-cyan-900 font-extrabold border border-cyan-200 shadow-xs">
              <Droplets size={14} className="text-cyan-600 fill-cyan-500 animate-pulse" />
              <span>
                {farmData.water_tank.water_droplets}/{farmData.water_tank.max_capacity} Tetes Air
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (+1 tetes air tiap 2 mnt)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200">
              🍯 {farmData.water_tank.total_harvests}x Panen Berhasil
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Ala Shopee Tanam) */}
        <div className="flex items-center bg-slate-50 border-b border-slate-200 px-3 py-1 gap-1 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('farm')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'farm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🌱 Kebun Saya</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('seeds')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'seeds'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🌾 Pilih Bibit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('friends')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'friends'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>👥 Sahabat Kebun ({farmData.friends.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('harvests')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeSubTab === 'harvests'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <span>🎁 Gudang Panen</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-sky-50 via-emerald-50/40 to-amber-50/30">
          {/* TAB 1: KEBUN SAYA (MAIN INTERACTIVE CANVAS) */}
          {activeSubTab === 'farm' && (
            <div className="space-y-4">
              {/* Pet Action Feedback Banner */}
              {petActionNote && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold text-center shadow-xs"
                >
                  {petActionNote}
                </motion.div>
              )}

              {/* The Pastoral Garden Card */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-300/80 bg-gradient-to-b from-sky-200 via-emerald-100 to-emerald-200 p-5 shadow-lg min-h-[340px] flex flex-col justify-between">
                {/* Sun & Floating Clouds Animation */}
                <div className="absolute top-4 right-5 flex items-center gap-2 opacity-90">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center text-xl"
                  >
                    ☀️
                  </motion.div>
                </div>

                {/* Trigona Bee Pet Hovering Around */}
                <motion.div
                  animate={{
                    x: [0, 25, -20, 15, 0],
                    y: [0, -15, 10, -8, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  onClick={handlePetAction}
                  title="Klik untuk menyapa Lebah Klanceng (Bonus Air!)"
                  className="absolute top-14 left-8 cursor-pointer group flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/70 backdrop-blur-xs border border-amber-300/70 shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="text-2xl group-hover:animate-bounce">🐝</span>
                  <div className="text-[10px] leading-tight">
                    <span className="font-extrabold text-amber-900 block">Lebah Klanceng</span>
                    <span className="text-emerald-700 font-semibold">Senang {farmData.pet.happiness}% ❤️</span>
                  </div>
                </motion.div>

                {/* Cat on the Wooden Garden Fence */}
                <div
                  onClick={handlePetAction}
                  title="Elus Kucing Penjaga Kebun (Bonus Air!)"
                  className="absolute bottom-24 right-5 cursor-pointer flex flex-col items-center group active:scale-95 transition-transform"
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-3xl filter drop-shadow-md"
                  >
                    🐱
                  </motion.span>
                  <span className="text-[9px] font-bold bg-white/80 px-1.5 py-0.5 rounded-md text-slate-700 border border-slate-200 shadow-xs">
                    Si Belang
                  </span>
                </div>

                {/* Active Plant Centerpiece Display */}
                <div className="flex-1 flex flex-col items-center justify-center my-6 z-10">
                  <div className="relative">
                    {/* Water Droplets Falling Animation */}
                    {wateringAnim && (
                      <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: [0, 1, 0], y: [ -40, 40 ] }}
                        transition={{ duration: 0.6, repeat: 2 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 text-2xl z-20 pointer-events-none"
                      >
                        💧💧💧
                      </motion.div>
                    )}

                    {/* Plant Stage Visual */}
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/40 backdrop-blur-xs border-4 border-emerald-300/60 shadow-[0_10px_25px_rgba(16,185,129,0.2)] flex items-center justify-center relative overflow-hidden group">
                      {farmData.plot.stage === 'seed' && (
                        <div className="text-center">
                          <span className="text-5xl sm:text-6xl filter drop-shadow-md">🌱</span>
                          <span className="block text-[11px] font-bold text-emerald-800 mt-1">Bibit Baru</span>
                        </div>
                      )}
                      {farmData.plot.stage === 'sprout' && (
                        <div className="text-center">
                          <span className="text-5xl sm:text-6xl filter drop-shadow-md animate-pulse">🌿</span>
                          <span className="block text-[11px] font-bold text-emerald-800 mt-1">Tunas Segar</span>
                        </div>
                      )}
                      {farmData.plot.stage === 'growing' && (
                        <div className="text-center">
                          <span className="text-6xl sm:text-7xl filter drop-shadow-md">🪴</span>
                          <span className="block text-[11px] font-bold text-emerald-900 mt-1">Tumbuh Rimbun</span>
                        </div>
                      )}
                      {farmData.plot.stage === 'bloom' && (
                        <div className="text-center">
                          <span className="text-6xl sm:text-7xl filter drop-shadow-md animate-bounce">🌺</span>
                          <span className="block text-[11px] font-bold text-rose-700 mt-1">Mekar Sempurna</span>
                        </div>
                      )}
                      {farmData.plot.stage === 'harvest_ready' && (
                        <div className="text-center">
                          <span className="text-6xl sm:text-7xl filter drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                            🍯
                          </span>
                          <span className="block text-xs font-black text-amber-700 mt-1 uppercase tracking-wider">
                            Siap Panen!
                          </span>
                        </div>
                      )}
                      {farmData.plot.stage === 'harvested' && (
                        <div className="text-center">
                          <span className="text-5xl sm:text-6xl">✨</span>
                          <span className="block text-xs font-bold text-slate-700 mt-1">Siap Tanam Lagi</span>
                        </div>
                      )}
                    </div>

                    {/* Mound of Rich Garden Soil */}
                    <div className="w-40 h-10 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-[50%] -mt-5 mx-auto border-2 border-amber-950/40 shadow-inner flex items-center justify-center">
                      <span className="text-[10px] text-amber-200/70 font-mono font-bold">Tanah Organik Bionet</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm sm:text-base font-heading font-extrabold text-slate-900 text-center">
                    {farmData.plot.plant_name}
                  </h3>
                  <p className="text-xs text-emerald-800 font-semibold text-center mt-0.5">
                    Hadiah: {farmData.plot.reward_title}
                  </p>
                </div>

                {/* Progress Bar & Stage Indicator */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-200 shadow-sm z-10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-700 flex items-center gap-1">
                      <span>Perkembangan Tumbuh</span>
                      <span className="text-emerald-600">({currentProgressPercent}%)</span>
                    </span>
                    <span className="text-emerald-700 font-extrabold">
                      {farmData.plot.current_water} / {farmData.plot.target_water} Tetes Air
                    </span>
                  </div>

                  {/* Visual Multi-Stage Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${currentProgressPercent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold px-1">
                    <span className={farmData.plot.stage === 'seed' ? 'text-emerald-700 font-extrabold' : ''}>🌱 Bibit</span>
                    <span className={farmData.plot.stage === 'sprout' ? 'text-emerald-700 font-extrabold' : ''}>🌿 Tunas</span>
                    <span className={farmData.plot.stage === 'growing' ? 'text-emerald-700 font-extrabold' : ''}>🪴 Rimbun</span>
                    <span className={farmData.plot.stage === 'bloom' ? 'text-emerald-700 font-extrabold' : ''}>🌺 Mekar</span>
                    <span className={farmData.plot.stage === 'harvest_ready' ? 'text-amber-600 font-black' : ''}>🍯 Panen</span>
                  </div>
                </div>

                {/* Action Controls: Siram Air / Panen Sekarang */}
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 z-10">
                  {farmData.plot.stage === 'harvest_ready' ? (
                    <button
                      type="button"
                      onClick={handleHarvest}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-heading font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 active:scale-95 transition-all animate-bounce"
                    >
                      <Sparkles size={18} className="text-amber-900" />
                      <span>Panen Hadiah Sekarang!</span>
                    </button>
                  ) : farmData.plot.stage === 'harvested' ? (
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('seeds')}
                      className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                    >
                      <span>🌾 Pilih Bibit Herbal Baru</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleWaterPlant}
                      disabled={wateringAnim || farmData.water_tank.water_droplets < 10}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-heading font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md disabled:opacity-50"
                    >
                      <Droplets size={18} className={wateringAnim ? 'animate-bounce text-cyan-200' : 'text-cyan-200'} />
                      <span>Siram Tanaman (-10 Tetes Air)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tips Intermezo Ramah Usia 25-60 Tahun */}
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="text-xs text-slate-600 leading-relaxed">
                  <strong>Tips Perawatan Kebun:</strong> Siram kebun Anda setiap pagi dan sore hari. Ajak rekan downline saling berkunjung untuk saling bantu siram kebun agar hadiah diskon belanja dan saldo Bionet lebih cepat dipanen!
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PILIH BIBIT HERBAL */}
          {activeSubTab === 'seeds' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-2">
                <h3 className="text-base font-heading font-black text-slate-900">
                  Katalog Bibit Herbal Nusantara Bionet
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih tanaman yang ingin Anda rawat hari ini. Setiap bibit menghasilkan hadiah riil berupa madu asli, voucher belanja RO, atau saldo tunai!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SEEDS_CATALOG.map((seed) => {
                  const isCurrent = farmData.plot.plant_type === seed.id && farmData.plot.stage !== 'harvested';
                  return (
                    <div
                      key={seed.id}
                      className={`p-4 rounded-2xl bg-white border-2 transition-all flex flex-col justify-between shadow-xs ${
                        isCurrent
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-3xl">{seed.iconEmoji}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {seed.tag}
                          </span>
                        </div>
                        <h4 className="font-heading font-extrabold text-sm text-slate-900 leading-snug">
                          {seed.name}
                        </h4>
                        <div className="mt-2 text-xs space-y-1">
                          <p className="text-slate-500 flex items-center gap-1">
                            <span>⏳ Butuh:</span>
                            <strong className="text-slate-700">{seed.timeDesc}</strong>
                          </p>
                          <p className="text-emerald-700 font-bold flex items-start gap-1">
                            <span>🎁 Hadiah:</span>
                            <span>{seed.rewardDesc}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {isCurrent ? (
                          <span className="w-full py-2 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1">
                            <CheckCircle2 size={14} /> Sedang Ditanam
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectSeed(seed)}
                            disabled={loading}
                            className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition active:scale-95 shadow-xs"
                          >
                            Tanam Bibit Ini 🌱
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SAHABAT KEBUN (FITUR KOMUNITAS ALA SHOPEE TANAM) */}
          {activeSubTab === 'friends' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-xs">
                    🤝
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-black text-teal-900">
                      Gotong Royong Kebun Sahabat
                    </h4>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Bantu siram kebun rekan Anda 1x sehari untuk mendapatkan <strong>+15 Tetes Air</strong> per teman!
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {farmData.friends.map((friend) => (
                  <div key={friend.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 text-emerald-800 font-heading font-black flex items-center justify-center text-sm shadow-xs border border-emerald-200">
                        {friend.full_name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-heading font-extrabold text-xs text-slate-900">
                          {friend.full_name}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Sedang merawat: <strong className="text-emerald-700">{friend.plant_name}</strong>
                        </p>
                      </div>
                    </div>

                    <div>
                      {friend.helped_today ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs flex items-center gap-1">
                          <CheckCircle2 size={13} /> Sudah Disiram
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleHelpFriend(friend)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition shadow-xs"
                        >
                          <Droplets size={13} className="text-cyan-200" />
                          <span>Bantu Siram (+15 💧)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GUDANG PANEN (RIWAYAT REWARD) */}
          {activeSubTab === 'harvests' && (
            <div className="space-y-4">
              <div className="text-center max-w-md mx-auto mb-2">
                <h3 className="text-base font-heading font-black text-slate-900">
                  Gudang Hasil Panen &amp; Voucher Anda
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Voucher diskon belanja Repeat Order (RO) dan bonus uang tunai hasil panen kebun herbal Anda.
                </p>
              </div>

              {farmData.harvest_history.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  Belum ada hasil panen. Siram kebun Anda setiap hari untuk memanen hadiah pertama!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {farmData.harvest_history.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
                          🍯
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Panen: {h.plant_name}
                          </span>
                          <h4 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900">
                            {h.reward}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                            Kode: {h.voucher_code}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(h.voucher_code);
                          alert(`Kode voucher ${h.voucher_code} berhasil disalin! Gunakan saat belanja Repeat Order.`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200 transition active:scale-95"
                      >
                        Salin Kode
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Komunitas Petani Herbal Bionet Nusantara</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition active:scale-95"
          >
            Tutup Kebun
          </button>
        </div>
      </div>

      {/* Harvest Success Popup Overlay */}
      {harvestSuccessModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in zoom-in-95 duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center border-4 border-amber-400 shadow-2xl space-y-4">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-4xl shadow-inner animate-bounce">
              🍯
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Alhamdulillah! Panen Raya Berhasil
              </span>
              <h3 className="text-lg font-heading font-black text-slate-900 mt-2">
                Selamat! Anda Mendapatkan:
              </h3>
              <p className="text-sm font-extrabold text-emerald-700 mt-1">
                {harvestSuccessModal.reward}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Kode Klaim Voucher:</span>
              <strong className="text-base font-mono text-emerald-800 tracking-wider">
                {harvestSuccessModal.voucher_code}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => {
                setHarvestSuccessModal(null);
                setActiveSubTab('seeds');
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition active:scale-95"
            >
              Tanam Tanaman Baru 🌱
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
