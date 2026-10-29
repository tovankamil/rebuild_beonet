import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Disc3,
  Sliders,
  Check,
  Copy,
  Video,
  Loader2,
  ArrowRight,
  Flame,
} from 'lucide-react';

/**
 * In-App TikTok / Reels 9:16 Motion Video Generator
 * Renders dynamic kinetic typography, animated product showcase, BPOM badges,
 * and synthesized rhythmic soundtrack directly into an MP4/WebM video file via Canvas & MediaRecorder.
 */
export default function TikTokVideoModal({
  isOpen,
  onClose,
  scriptText = '',
  productName = 'Bio-Herbal Drops 30ml',
  mitraUsername = 'mitra01',
}) {
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(16); // 16 seconds standard TikTok hook
  const [theme, setTheme] = useState('emerald'); // 'emerald', 'luxury_gold', 'cyber_neon'
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [renderedBlob, setRenderedBlob] = useState(null);
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);

  // Mode Switcher: 'motion' (In-App Canvas) | 'veo' (Google Veo 3 Cinematic AI)
  const [activeMode, setActiveMode] = useState('motion');
  const [veoModel, setVeoModel] = useState('veo-3.1-generate-preview');
  const [veoRatio, setVeoRatio] = useState('9:16');
  const [veoPreset, setVeoPreset] = useState('rainforest');
  const [veoCopied, setVeoCopied] = useState(false);
  const [veoPrompt, setVeoPrompt] = useState(
    `Cinematic 4K close-up shot of a luxury dark amber dropper bottle labeled "${productName}" resting on a wet mossy forest stone with fresh morning dew droplets. Golden sun rays penetrate tropical emerald leaves, soft mist drifting around the bottle. High-end natural medicine commercial, photorealistic, cinematic lighting, 9:16 vertical aspect ratio.`
  );

  const handleVeoPresetChange = (presetKey) => {
    setVeoPreset(presetKey);
    if (presetKey === 'rainforest') {
      setVeoPrompt(`Cinematic 4K close-up shot of a luxury dark amber dropper bottle labeled "${productName}" resting on a wet mossy forest stone with fresh morning dew droplets. Golden sun rays penetrate tropical emerald leaves, soft mist drifting around the bottle. High-end natural medicine commercial, photorealistic, cinematic lighting, ${veoRatio} aspect ratio.`);
    } else if (presetKey === 'biotech') {
      setVeoPrompt(`High-tech pharmaceutical laboratory commercial shot of ${productName} bottle surrounded by glowing cyan and emerald botanical molecules, precision pipettes, clean room aesthetic, crystal clear glass reflection, 4K resolution, photorealistic, ${veoRatio} vertical video.`);
    } else if (presetKey === 'lifestyle') {
      setVeoPrompt(`Warm morning lifestyle commercial of a healthy Indonesian woman smiling as she prepares her morning herbal drink with drops of ${productName}, bright minimalist kitchen, soft natural window light, joyful wellness atmosphere, 4K ultra-realistic, ${veoRatio} aspect ratio.`);
    }
  };

  const handleCopyVeoPrompt = () => {
    navigator.clipboard.writeText(veoPrompt);
    setVeoCopied(true);
    setTimeout(() => setVeoCopied(false), 2000);
  };

  // Extracted scenes from script or smart defaults
  const [scenes, setScenes] = useState([
    {
      id: 1,
      name: 'HOOK (Detik 0-4)',
      title: 'MASIH SERING LEMAS & GULA DARAH NAIK?',
      subtitle: 'Jangan abaikan sebelum komplikasi parah!',
      tag: '⚠️ PERINGATAN KESEHATAN',
      tagColor: '#ef4444',
      bgGlow: '#ef4444',
      start: 0,
      end: 4,
    },
    {
      id: 2,
      name: 'PROBLEM (Detik 4-8)',
      title: 'KADAR GULA & KOLESTEROL MENUMPUK',
      subtitle: 'Sulit tidur, kebas pada kaki & gampang lelah',
      tag: '🩺 FAKTA METABOLISME',
      tagColor: '#f59e0b',
      bgGlow: '#f59e0b',
      start: 4,
      end: 8,
    },
    {
      id: 3,
      name: 'SOLUSI (Detik 8-12)',
      title: 'BIO-HERBAL DROPS 30ML',
      subtitle: 'Ekstrak 100% Herbal Alami • Formula Tetes Cepat Serap',
      tag: '🌿 IZIN RESMI BPOM RI',
      tagColor: '#10b981',
      bgGlow: '#10b981',
      start: 8,
      end: 12,
    },
    {
      id: 4,
      name: 'CTA (Detik 12-16)',
      title: 'PROMO FREE ONGKIR HARI INI!',
      subtitle: 'Siap kirim ke rumah Anda • Stok terbatas',
      tag: '👉 KLIK LINK DI BIO SEKARANG',
      tagColor: '#06b6d4',
      bgGlow: '#06b6d4',
      start: 12,
      end: 16,
    },
  ]);

  // Parse custom scriptText into scenes if provided
  useEffect(() => {
    if (!scriptText) return;

    // Detect hook, problem, solution, cta in the text
    const cleanLines = scriptText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('---') && !l.startsWith('#'));

    let hookText = 'MASIH SERING LEMAS & GULA DARAH TINGGI?';
    let probText = 'Kadar Gula & Kolesterol Ganggu Aktivitas?';
    let solText = `${productName.toUpperCase()}`;
    let ctaText = 'PROMO FREE ONGKIR HARI INI!';

    for (const line of cleanLines) {
      const lower = line.toLowerCase();
      if ((lower.includes('hook') || lower.includes('audio:')) && !hookText.includes('!')) {
        hookText = line.replace(/\[.*?\]|\*\*.*?\*\*|audio:|visual:/gi, '').trim().slice(0, 50) || hookText;
      } else if (lower.includes('masalah') || lower.includes('problem')) {
        probText = line.replace(/\[.*?\]|\*\*.*?\*\*|audio:|visual:/gi, '').trim().slice(0, 60) || probText;
      } else if (lower.includes('solusi') || lower.includes('bionet') || lower.includes('herbal')) {
        solText = line.replace(/\[.*?\]|\*\*.*?\*\*|audio:|visual:/gi, '').trim().slice(0, 50) || solText;
      } else if (lower.includes('call to action') || lower.includes('bio') || lower.includes('promo')) {
        ctaText = line.replace(/\[.*?\]|\*\*.*?\*\*|audio:|visual:/gi, '').trim().slice(0, 50) || ctaText;
      }
    }

    setScenes([
      {
        id: 1,
        name: 'HOOK (0-4s)',
        title: hookText.toUpperCase(),
        subtitle: 'Simak 15 detik ini sebelum menyesal!',
        tag: '⚠️ PERINGATAN KESEHATAN',
        tagColor: '#ef4444',
        bgGlow: '#ef4444',
        start: 0,
        end: 4,
      },
      {
        id: 2,
        name: 'PROBLEM (4-8s)',
        title: probText.toUpperCase(),
        subtitle: 'Tubuh gampang lelah & metabolisme lambat',
        tag: '🩺 SOLUSI ALAMI DIABETES',
        tagColor: '#f59e0b',
        bgGlow: '#f59e0b',
        start: 4,
        end: 8,
      },
      {
        id: 3,
        name: 'SOLUSI (8-12s)',
        title: solText.toUpperCase(),
        subtitle: 'Resmi Izin BPOM RI & Halal • Formula Tetes Cepat Serap',
        tag: '🌿 FORMULA HERBAL TERUJI',
        tagColor: '#10b981',
        bgGlow: '#10b981',
        start: 8,
        end: 12,
      },
      {
        id: 4,
        name: 'CTA (12-16s)',
        title: ctaText.toUpperCase(),
        subtitle: `Toko Resmi Mitra @${mitraUsername} • Siap Kirim Hari Ini`,
        tag: '👉 KLIK LINK DI BIO SEKARANG',
        tagColor: '#06b6d4',
        bgGlow: '#06b6d4',
        start: 12,
        end: 16,
      },
    ]);
  }, [scriptText, productName, mitraUsername]);

  // Audio Beat Synthesizer with Web Audio API (No external assets required!)
  const playSynthesizedBeat = (timeSec, audioCtx, destNode) => {
    if (!audioCtx || !isAudioEnabled) return;
    const now = audioCtx.currentTime;
    const beatInterval = 0.5; // 120 BPM = 0.5s per beat
    const beatIndex = Math.floor(timeSec / beatInterval);

    // Kick on every beat
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(destNode || audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    // Hi-hat / Shaker on off-beats
    if (beatIndex % 2 === 1) {
      const noiseOsc = audioCtx.createOscillator();
      const noiseGain = audioCtx.createGain();
      noiseOsc.type = 'triangle';
      noiseOsc.frequency.setValueAtTime(800, now);
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseOsc.connect(noiseGain);
      noiseGain.connect(destNode || audioCtx.destination);
      noiseOsc.start(now);
      noiseOsc.stop(now + 0.09);
    }
  };

  // Canvas Frame Rendering Engine
  const renderFrame = (t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // Active scene determination
    const scene = scenes.find((s) => t >= s.start && t < s.end) || scenes[scenes.length - 1];
    const sceneIdx = scenes.findIndex((s) => s.id === scene.id);
    if (sceneIdx !== activeSceneIdx) {
      setActiveSceneIdx(sceneIdx);
    }

    const sceneProgress = (t - scene.start) / (scene.end - scene.start); // 0 to 1

    // 1. Background Canvas
    ctx.clearRect(0, 0, W, H);

    // Dynamic gradient background based on theme
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (theme === 'emerald') {
      bgGrad.addColorStop(0, '#041610');
      bgGrad.addColorStop(0.5, '#07241a');
      bgGrad.addColorStop(1, '#020b08');
    } else if (theme === 'luxury_gold') {
      bgGrad.addColorStop(0, '#1c1503');
      bgGrad.addColorStop(0.5, '#0d0d0c');
      bgGrad.addColorStop(1, '#000000');
    } else {
      bgGrad.addColorStop(0, '#0f0c29');
      bgGrad.addColorStop(0.5, '#1b1236');
      bgGrad.addColorStop(1, '#080514');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Ambient floating particles & glow
    ctx.save();
    const glowX = W / 2 + Math.sin(t * 1.5) * 60;
    const glowY = H * 0.42 + Math.cos(t * 1.2) * 50;
    const radGlow = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 320);
    radGlow.addColorStop(0, `${scene.bgGlow}33`);
    radGlow.addColorStop(0.7, `${scene.bgGlow}11`);
    radGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = radGlow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // 2. Scene Top Header Tag
    ctx.save();
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    // Tag badge container
    const tagText = scene.tag;
    const tagWidth = ctx.measureText(tagText).width + 48;
    const tagY = 160;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - tagWidth / 2, tagY - 26, tagWidth, 48, 24);
    ctx.fill();
    ctx.strokeStyle = scene.tagColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = scene.tagColor;
    ctx.fillText(tagText, W / 2, tagY + 7);
    ctx.restore();

    // 3. Central Kinetic Product Packshot & Visual Anchor
    ctx.save();
    const centerY = H * 0.45;
    const pulseScale = 1 + Math.sin(t * 3.5) * 0.035;

    // Outer Aura Ring
    ctx.beginPath();
    ctx.arc(W / 2, centerY, 190 * pulseScale, 0, Math.PI * 2);
    ctx.strokeStyle = `${scene.tagColor}44`;
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing Disc Center
    const discGrad = ctx.createRadialGradient(W / 2, centerY, 20, W / 2, centerY, 150);
    discGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    discGrad.addColorStop(0.6, `${scene.tagColor}22`);
    discGrad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = discGrad;
    ctx.beginPath();
    ctx.arc(W / 2, centerY, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // High-Tech Product Graphic Symbol inside disc
    ctx.font = 'bold 74px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (scene.id === 1) {
      ctx.fillText('⚡', W / 2, centerY);
    } else if (scene.id === 2) {
      ctx.fillText('🩺', W / 2, centerY);
    } else if (scene.id === 3) {
      ctx.fillText('🌿', W / 2, centerY);
    } else {
      ctx.fillText('🎁', W / 2, centerY);
    }

    // Official Certified BPOM Floating Badge (Scene 3 & 4)
    if (scene.id >= 3) {
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 130, centerY + 105, 260, 42, 21);
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✓ RESMI BPOM RI & HALAL', W / 2, centerY + 132);
    }
    ctx.restore();

    // 4. Kinetic Subtitles / Punchy Big Text (TikTok Viral Style)
    ctx.save();
    const titleY = H * 0.69;
    ctx.textAlign = 'center';

    // Word wrap helper
    const wrapText = (text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    // Main Kinetic Title
    ctx.font = '900 46px system-ui, sans-serif';
    const titleLines = wrapText(scene.title, W - 100);

    titleLines.forEach((line, idx) => {
      const lineY = titleY + idx * 56;

      // Dark text stroke/shadow for maximum TikTok punchiness
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 10;
      ctx.strokeText(line, W / 2, lineY);

      // Yellow/White kinetic punch
      if (idx === 0) {
        ctx.fillStyle = '#fbbf24'; // TikTok bold yellow
      } else {
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillText(line, W / 2, lineY);
    });

    // Subtitle Explanation
    ctx.font = '600 24px system-ui, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    const subY = titleY + titleLines.length * 56 + 32;
    const subLines = wrapText(scene.subtitle, W - 140);
    subLines.forEach((sub, sIdx) => {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.strokeText(sub, W / 2, subY + sIdx * 32);
      ctx.fillText(sub, W / 2, subY + sIdx * 32);
    });
    ctx.restore();

    // 5. TikTok Native Overlay Elements (UI Chrome)
    ctx.save();
    // Bottom User Bio Tag
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(`@${mitraUsername} • Mitra Bionet Resmi`, 45, H - 120);

    ctx.font = 'normal 19px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Solusi Herbal Sehat Alami Tetes Berizin BPOM', 45, H - 90);

    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('♫ Suara Asli - Bionet Herbal Tren 2026', 45, H - 60);

    // Right Sidebar Fake TikTok Buttons (Social Proof)
    const rightX = W - 60;
    const drawSideAction = (y, icon, count) => {
      ctx.beginPath();
      ctx.arc(rightX, y, 26, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fill();
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, rightX, y);

      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.fillText(count, rightX, y + 32);
    };

    drawSideAction(H * 0.45, '❤️', '24.8K');
    drawSideAction(H * 0.54, '💬', '1.4K');
    drawSideAction(H * 0.63, '🔖', '4.2K');
    drawSideAction(H * 0.72, '↗️', 'Bagikan');

    // Bottom Animated Progress Bar
    const progressW = (t / totalDuration) * W;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, H - 10, W, 10);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, H - 10, progressW, 10);
    ctx.restore();
  };

  // Preview Loop with requestAnimationFrame
  useEffect(() => {
    if (!isOpen) return;
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlaying) {
        setCurrentTime((prev) => {
          const next = prev + dt;
          if (next >= totalDuration) {
            return 0; // loop
          }

          // Trigger audio beat every quarter beat
          if (audioCtxRef.current && Math.floor(next * 4) !== Math.floor(prev * 4)) {
            playSynthesizedBeat(next, audioCtxRef.current);
          }
          return next;
        });
      }

      renderFrame(currentTime);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, currentTime, totalDuration, theme, scenes]);

  // Audio Context Initialization
  const handleTogglePlay = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  };

  // Render & Export MP4/WebM Video File
  const handleRenderVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsPlaying(false);
    setIsRendering(true);
    setRenderProgress(0);
    setDownloadUrl(null);
    recordedChunksRef.current = [];

    // Initialize Audio Context and MediaStreamDestination
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const renderAudioCtx = new AudioContextClass();
    const audioDest = renderAudioCtx.createMediaStreamDestination();

    // Capture Canvas Stream at 30 FPS
    const canvasStream = canvas.captureStream(30);

    // Combine Video Track and Audio Track
    const combinedTracks = [
      ...canvasStream.getVideoTracks(),
      ...audioDest.stream.getAudioTracks(),
    ];
    const combinedStream = new MediaStream(combinedTracks);

    // MediaRecorder format selection
    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
    }

    try {
      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 3500000, // 3.5 Mbps crisp 720p HD
      });

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setRenderedBlob(blob);
        setIsRendering(false);
        setRenderProgress(100);
        renderAudioCtx.close();
      };

      recorder.start();

      // Render timeline step-by-step
      const fps = 30;
      const totalFrames = totalDuration * fps;
      let frame = 0;

      const recordStep = () => {
        if (frame >= totalFrames) {
          recorder.stop();
          return;
        }

        const t = frame / fps;
        renderFrame(t);

        // Synthesize audio tick
        if (frame % 15 === 0) {
          playSynthesizedBeat(t, renderAudioCtx, audioDest);
        }

        frame++;
        const pct = Math.round((frame / totalFrames) * 100);
        setRenderProgress(pct);

        setTimeout(recordStep, 1000 / fps);
      };

      recordStep();
    } catch (err) {
      console.error('MediaRecorder failed:', err);
      alert('Browser Anda memerlukan izin perekaman canvas atau gunakan browser Google Chrome / Edge.');
      setIsRendering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-[0_25px_70px_rgba(0,0,0,0.7)] text-white flex flex-col my-auto max-h-[94vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/40">
                <Flame size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-base text-white">
                    TikTok & Reels Video Motion Studio
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    9:16 Vertikal
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Render otomatis naskah AI menjadi video konten TikTok animasi kinetik berizin BPOM
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Tutup Studio"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-4 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMode('motion')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeMode === 'motion'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={14} />
              <span>1. In-App Motion Canvas (Instan &amp; Gratis)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('veo')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeMode === 'veo'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video size={14} />
              <span>2. Google Veo 3 / 3.1 (Cinematic AI Video)</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold">DeepMind</span>
            </button>
          </div>

          {/* VIEW 1: IN-APP MOTION CANVAS */}
          {activeMode === 'motion' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 overflow-y-auto">
            {/* Left: TikTok Phone Mockup (5 Cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-[280px] sm:w-[300px] h-[497px] sm:h-[533px] rounded-[36px] bg-black border-4 border-slate-700 shadow-2xl overflow-hidden ring-4 ring-slate-900 flex items-center justify-center">
                {/* 9:16 Canvas Canvas (720x1280 internal buffer) */}
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={1280}
                  className="w-full h-full object-contain select-none pointer-events-none"
                />

                {/* Center Big Play Pause Overlay */}
                {!isPlaying && !isRendering && (
                  <button
                    onClick={handleTogglePlay}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-transform shadow-2xl"
                  >
                    <Play size={28} className="ml-1 text-emerald-400" />
                  </button>
                )}

                {/* Render Progress Overlay */}
                {isRendering && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
                    <Loader2 size={36} className="text-rose-500 animate-spin mb-3" />
                    <div className="text-sm font-black text-white">Merekam Video TikTok...</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">{renderProgress}%</div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Mengompres animasi kinetik 30 FPS & soundtrack audio...
                    </p>
                  </div>
                )}
              </div>

              {/* Player Quick Bar */}
              <div className="flex items-center gap-3 mt-3 w-[280px] sm:w-[300px] justify-between">
                <button
                  onClick={handleTogglePlay}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
                </button>

                <div className="text-[11px] font-mono text-slate-400">
                  {Math.floor(currentTime)}s / {totalDuration}s
                </div>

                <button
                  onClick={() => {
                    setCurrentTime(0);
                    renderFrame(0);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Ulangi dari Detik 0"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Right: Customization & Render Controls (7 Cols) */}
            <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
              {/* Scene Timeline Steps */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Struktur Adegan Naskah TikTok (4 Scene)</span>
                  <span className="text-[10px] text-emerald-400 font-normal">Otomatis Terbagi 16 Detik</span>
                </label>
                <div className="space-y-2">
                  {scenes.map((sc, idx) => {
                    const isActive = activeSceneIdx === idx;
                    return (
                      <div
                        key={sc.id}
                        onClick={() => {
                          setCurrentTime(sc.start);
                          renderFrame(sc.start);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-slate-800/90 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className={isActive ? 'text-emerald-400' : 'text-slate-300'}>
                            {sc.name}
                          </span>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-md font-bold"
                            style={{ backgroundColor: `${sc.tagColor}22`, color: sc.tagColor }}
                          >
                            {sc.tag}
                          </span>
                        </div>
                        <div className="text-xs text-white font-extrabold truncate">{sc.title}</div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{sc.subtitle}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Theme & Soundtrack Settings */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Tema Visual:</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="emerald">🌿 Bio-Emerald Forest</option>
                    <option value="luxury_gold">✨ Luxury Gold Obsidian</option>
                    <option value="cyber_neon">⚡ Cyber Neon Purple</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Soundtrack Beat:</label>
                  <button
                    onClick={() => setIsAudioEnabled((prev) => !prev)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                      isAudioEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {isAudioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    <span>{isAudioEnabled ? 'Musik Aktif (120 BPM)' : 'Musik Mati'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: Render & Download */}
              <div className="pt-3 border-t border-slate-800 space-y-2.5">
                {!downloadUrl ? (
                  <button
                    onClick={handleRenderVideo}
                    disabled={isRendering}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs transition shadow-xl shadow-rose-950 flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
                  >
                    {isRendering ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sedang Merekam ({renderProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Render & Ekspor Video TikTok (.webm / .mp4)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <a
                      href={downloadUrl}
                      download={`Video_TikTok_${productName.replace(/\s+/g, '_')}_Bionet.webm`}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition shadow-xl shadow-emerald-950 flex items-center justify-center space-x-2 animate-bounce"
                    >
                      <Download size={16} />
                      <span>Unduh Video TikTok Anda Sekarang (Siap Upload)</span>
                    </a>

                    <button
                      onClick={() => setDownloadUrl(null)}
                      className="w-full py-2 text-[11px] text-slate-400 hover:text-white font-semibold text-center"
                    >
                      Render Ulang Variasi Lain
                    </button>
                  </div>
                )}

                <div className="text-[10.5px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>Format 9:16 cocok langsung di-upload ke TikTok, IG Reels, Shorts &amp; WA Status</span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* VIEW 2: GOOGLE VEO 3 / 3.1 DEEPMIND CINEMATIC STUDIO */}
          {activeMode === 'veo' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 overflow-y-auto">
              {/* Left Column: Veo Model Capabilities & Showcase */}
              <div className="md:col-span-5 space-y-4">
                <div className="rounded-3xl p-5 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 border border-indigo-500/30 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      Google DeepMind Video Model
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">v3.1 Preview</span>
                  </div>

                  <h4 className="font-heading font-black text-lg text-white leading-tight">
                    Google Veo 3 Generative Video Engine
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Model AI video generasi terbaru dari Google yang mampu menghasilkan video sinematik fotorealistik 1080p / 4K dengan pencahayaan alami, pergerakan kamera halus, dan audio suara ambient asli.
                  </p>

                  <div className="pt-2 border-t border-indigo-900/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>• Format Output:</span>
                      <strong className="text-white">9:16 Vertikal &amp; 16:9 Landscape</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>• Durasi Per Klip:</span>
                      <strong className="text-white">5 – 8 Detik Sinematik</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>• Kualitas Visual:</span>
                      <strong className="text-emerald-400">1080p Full HD / 4K Ultra</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>• Audio Native:</span>
                      <strong className="text-cyan-400">Suara Air, Tetesan &amp; Musik Halus</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>💡 Catatan Integrasi Google Veo 3:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Google Veo memerlukan akses <strong>Google Cloud Vertex AI</strong> atau <strong>Gemini API (Video Quota Whitelist)</strong> karena proses render video memerlukan cluster GPU TPU Cloud.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Anda dapat menggunakan <strong>Prompt Sinematik di samping</strong> langsung di <strong>Google AI Studio</strong> (aistudio.google.com) atau menghubungkan API Key Vertex AI project Anda.
                  </p>
                </div>
              </div>

              {/* Right Column: Prompt Generator & Controls */}
              <div className="md:col-span-7 space-y-4">
                {/* Scene Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2 uppercase tracking-wider">
                    Pilih Gaya Sinematik Naskah:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleVeoPresetChange('rainforest')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        veoPreset === 'rainforest'
                          ? 'bg-emerald-950/80 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">🌿 Rainforest Dew</div>
                      <div className="text-[10px] text-slate-400 truncate">Hutan &amp; Embun Pagi</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVeoPresetChange('biotech')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        veoPreset === 'biotech'
                          ? 'bg-indigo-950/80 border-indigo-500 text-white ring-1 ring-indigo-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">⚡ Lab Biotech</div>
                      <div className="text-[10px] text-slate-400 truncate">Molekul &amp; Kaca Modern</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVeoPresetChange('lifestyle')}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        veoPreset === 'lifestyle'
                          ? 'bg-amber-950/80 border-amber-500 text-white ring-1 ring-amber-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold">☀️ Pagi Bugar</div>
                      <div className="text-[10px] text-slate-400 truncate">Wanita Sehat Indonesia</div>
                    </button>
                  </div>
                </div>

                {/* Parameters Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Model AI:</label>
                    <select
                      value={veoModel}
                      onChange={(e) => setVeoModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="veo-3.1-generate-preview">Google Veo 3.1 (Flagship + Audio)</option>
                      <option value="veo-2.0-generate">Google Veo 2.0 (Fast Commercial)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Aspek Rasio:</label>
                    <select
                      value={veoRatio}
                      onChange={(e) => {
                        setVeoRatio(e.target.value);
                        setVeoPrompt((prev) => prev.replace(/(9:16|16:9)/g, e.target.value));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500"
                    >
                      <option value="9:16">9:16 Vertikal (TikTok / Reels / Shorts)</option>
                      <option value="16:9">16:9 Landscape (YouTube / TV Ads)</option>
                    </select>
                  </div>
                </div>

                {/* Prompt Box */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300">
                      Prompt Sinematik Siap Kirim (Standard Input Veo 3):
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyVeoPrompt}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center gap-1"
                    >
                      {veoCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{veoCopied ? 'Tersalin!' : 'Salin Prompt'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={veoPrompt}
                    onChange={(e) => setVeoPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-indigo-200 leading-relaxed focus:outline-hidden focus:border-indigo-500 shadow-inner"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={handleCopyVeoPrompt}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs transition shadow-xl shadow-indigo-950 flex items-center justify-center space-x-2 active:scale-98"
                  >
                    {veoCopied ? (
                      <>
                        <Check size={16} className="text-emerald-300" />
                        <span>Prompt Veo 3 Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Salin Prompt Google Veo 3 &amp; Buka Google AI Studio</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10.5px] text-slate-400 text-center">
                    Gunakan prompt di atas di portal <strong>aistudio.google.com</strong> pada menu <em>Generate Video</em> untuk merender video 4K fotorealistik gratis dengan kuota developer Anda.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

