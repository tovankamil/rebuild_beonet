/**
 * Sound Notification Utility for Bionet Mitra Hub
 * Synthesizes pure Web Audio API sounds with 0 external audio dependencies (works 100% offline).
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play Golden Coin Chime ("Kring! Komisi Masuk!")
 * Harmonic chime: B5 (987.77 Hz) -> E6 (1318.51 Hz) with secondary chime G6 (1567.98 Hz)
 */
export function playCoinChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- Primary Bell / Coin Ping 1 ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    // Frequency glide: B5 (987.77) to E6 (1318.51)
    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08);

    // Envelope
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.9);

    // --- Metallic Harmonic Overtone 1 ---
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(1975.5, now); // B6 overtone

    gainHarmonic.gain.setValueAtTime(0.001, now);
    gainHarmonic.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(ctx.destination);

    oscHarmonic.start(now);
    oscHarmonic.stop(now + 0.5);

    // --- Secondary Bell / Double Clink 0.09s later ---
    const t2 = now + 0.09;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1318.51, t2); // E6
    osc2.frequency.exponentialRampToValueAtTime(1567.98, t2 + 0.1); // G6

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.45, t2 + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.1);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(t2);
    osc2.stop(t2 + 1.15);

    // --- High Shimmer Ring 2637 Hz (E7) ---
    const oscShimmer = ctx.createOscillator();
    const gainShimmer = ctx.createGain();

    oscShimmer.type = 'sine';
    oscShimmer.frequency.setValueAtTime(2637.02, t2);

    gainShimmer.gain.setValueAtTime(0.001, t2);
    gainShimmer.gain.linearRampToValueAtTime(0.08, t2 + 0.02);
    gainShimmer.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.6);

    oscShimmer.connect(gainShimmer);
    gainShimmer.connect(ctx.destination);

    oscShimmer.start(t2);
    oscShimmer.stop(t2 + 0.65);
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

/**
 * Play Smooth Notification Tone (C5 - E5 - G5 arpeggio)
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    });
  } catch (err) {
    console.warn('Notification sound error:', err);
  }
}
