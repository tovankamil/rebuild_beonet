/**
 * Web Audio API Synth Engine for Bionet Executive 3D Virtual Office
 * Zero external audio assets - 100% generated in real-time in the browser.
 * Provides soothing executive ambient drone synth + interactive UI sound effects.
 */

class OfficeAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.ambientGain = null;
    this.oscillators = [];
    this.lfo = null;
    this.filter = null;
    this.volume = 0.35;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient sub-gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    } catch (e) {
      console.warn('OfficeAudioEngine init failed:', e);
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Start the soothing executive cyberpunk ambient drone.
   * Uses a harmonious minor-ninth/suspended chord pad (A2, E3, B3, C#4)
   * filtered through a warm resonant low-pass filter with gentle LFO modulation.
   */
  startAmbience() {
    this.ensureContext();
    if (!this.ctx || this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;

      // Low-pass filter for warm, relaxing texture
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(380, now);
      this.filter.Q.setValueAtTime(2.5, now);
      this.filter.connect(this.ambientGain);

      // Slow LFO for gentle acoustic breathing effect (0.06 Hz)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.06, now);
      lfoGain.gain.setValueAtTime(140, now);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);
      this.lfo.start(now);

      // Chord frequencies: A1 (55Hz sub), A2 (110Hz), E3 (164.81Hz), B3 (246.94Hz), C#4 (277.18Hz)
      const frequencies = [55, 110, 164.81, 246.94, 277.18];
      const detunes = [-4, 3, -2, 4, 1]; // gentle analog chorusing

      this.oscillators = frequencies.map((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // Sub bass is sine, mid-high chords are warm triangle/warm saw mix
        osc.type = idx === 0 ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detunes[idx], now);

        // Individual level balance
        const gainLevel = idx === 0 ? 0.35 : 0.15;
        oscGain.gain.setValueAtTime(gainLevel, now);

        osc.connect(oscGain);
        oscGain.connect(this.filter);
        osc.start(now);
        return osc;
      });

      // Smooth fade-in
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.7, now + 2.0);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Failed to start ambient audio:', e);
    }
  }

  /**
   * Stop ambient drone with smooth fade-out.
   */
  stopAmbience() {
    if (!this.ctx || !this.isPlaying) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      setTimeout(() => {
        this.oscillators.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_) {}
        });
        this.oscillators = [];

        if (this.lfo) {
          try {
            this.lfo.stop();
            this.lfo.disconnect();
          } catch (_) {}
          this.lfo = null;
        }

        if (this.filter) {
          try {
            this.filter.disconnect();
          } catch (_) {}
          this.filter = null;
        }

        this.isPlaying = false;
      }, 1300);
    } catch (e) {
      this.isPlaying = false;
    }
  }

  toggleAmbience() {
    if (this.isPlaying) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  /**
   * Subtle high-tech hover sound when pointer enters interactive 3D object
   */
  playHoverSound() {
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (_) {}
  }

  /**
   * High-tech chime sound when user selects or clicks an interactive hotspot
   */
  playClickSound() {
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Two harmonic chime tones (C6 1046.5Hz & E6 1318.5Hz)
      [1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.04 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.35);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.36);
      });
    } catch (_) {}
  }

  /**
   * Camera angle switch swoosh sound
   */
  playCameraPresetSound() {
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  dispose() {
    try {
      this.stopAmbience();
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch (_) {}
  }
}

export const officeAudio = new OfficeAudioEngine();
