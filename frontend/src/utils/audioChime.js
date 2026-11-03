/**
 * Pure Web Audio API Audio Chime Synthesizer
 * 100% offline, zero external audio assets, zero latency.
 * Provides realistic sound effects for commissions, rewards, and status pings.
 */

let sharedAudioCtx = null;

function getSafeAudioContext() {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.warn('Web Audio API not supported or blocked:', err);
    return null;
  }
}

/**
 * Play Gold Coin Chime / Cash Register Chime ("Kring! Koin Emas & Payout Sukses")
 * Synthesizes crisp metallic clinks, coin bounce cascade, and warm cash register ding.
 */
export function playGoldCoinChime() {
  try {
    const ctx = getSafeAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master compressor for crispy dynamics
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(10, now);
    compressor.ratio.setValueAtTime(8, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.15, now);
    compressor.connect(ctx.destination);

    // Coin 1: Initial Clink
    const playCoinImpact = (startTime, baseFreq, overtoneFreq, volume) => {
      // Fundamental
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.05, startTime + 0.05);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(compressor);
      osc.start(startTime);
      osc.stop(startTime + 0.7);

      // Metallic Overtone (triangle)
      const metal = ctx.createOscillator();
      const metalGain = ctx.createGain();
      metal.type = 'triangle';
      metal.frequency.setValueAtTime(overtoneFreq, startTime);

      metalGain.gain.setValueAtTime(0.0001, startTime);
      metalGain.gain.linearRampToValueAtTime(volume * 0.45, startTime + 0.003);
      metalGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      metal.connect(metalGain);
      metalGain.connect(compressor);
      metal.start(startTime);
      metal.stop(startTime + 0.4);

      // High Shimmer (sparkle ring)
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(overtoneFreq * 1.5, startTime);

      shimmerGain.gain.setValueAtTime(0.0001, startTime);
      shimmerGain.gain.linearRampToValueAtTime(volume * 0.25, startTime + 0.01);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(compressor);
      shimmer.start(startTime);
      shimmer.stop(startTime + 0.55);
    };

    // Cascade 3 distinct gold coins bouncing in rapid succession (Cha-ching!)
    playCoinImpact(now, 1046.5, 2093.0, 0.35); // C6 & C7
    playCoinImpact(now + 0.075, 1318.5, 2637.0, 0.42); // E6 & E7
    playCoinImpact(now + 0.16, 1760.0, 3520.0, 0.48); // A6 & A7 (Final resonant ring)

    // Warm register cash register drawer latch pulse
    const latchOsc = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latchOsc.type = 'triangle';
    latchOsc.frequency.setValueAtTime(220, now);
    latchOsc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    latchGain.gain.setValueAtTime(0.18, now);
    latchGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    latchOsc.connect(latchGain);
    latchGain.connect(compressor);
    latchOsc.start(now);
    latchOsc.stop(now + 0.15);
  } catch (err) {
    console.warn('playGoldCoinChime failed:', err);
  }
}

/**
 * Play Level Up Fanfare ("Naik Peringkat / Reward Tercapai!")
 * Synthesizes an uplifting orchestral-synth harmonic arpeggio with celebratory resonance.
 */
export function playLevelUpFanfare() {
  try {
    const ctx = getSafeAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.12, vol: 0.35 }, // C5
      { freq: 659.25, time: 0.10, dur: 0.12, vol: 0.38 }, // E5
      { freq: 783.99, time: 0.20, dur: 0.14, vol: 0.40 }, // G5
      { freq: 1046.5, time: 0.32, dur: 0.65, vol: 0.55 }, // C6 (grand finish)
      { freq: 1318.5, time: 0.34, dur: 0.60, vol: 0.35 }, // E6 harmony
    ];

    notes.forEach((note) => {
      const startTime = now + note.time;

      // Primary tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(note.vol, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + note.dur + 0.05);

      // Brass-like harmonic overtone
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(note.freq * 2, startTime);

      subGain.gain.setValueAtTime(0.0001, startTime);
      subGain.gain.linearRampToValueAtTime(note.vol * 0.3, startTime + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur * 0.7);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(startTime);
      sub.stop(startTime + note.dur * 0.75);
    });
  } catch (err) {
    console.warn('playLevelUpFanfare failed:', err);
  }
}

/**
 * Play Notification Ping ("Ting! Notifikasi / Webhook Diterima")
 * Synthesizes a glassy, clean, and pleasant ping sound.
 */
export function playNotificationPing() {
  try {
    const ctx = getSafeAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1174.66, now); // D6
    osc1.frequency.exponentialRampToValueAtTime(1760.00, now + 0.04); // A6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2349.32, now); // D7 sparkle

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch (err) {
    console.warn('playNotificationPing failed:', err);
  }
}

export default {
  playGoldCoinChime,
  playLevelUpFanfare,
  playNotificationPing,
};
