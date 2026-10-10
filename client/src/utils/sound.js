// Web Audio API Synthesized Sound Generator (Zero External Assets needed)

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.stopEngine();
    }
  }

  playCountdownTick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio context policy
    }
  }

  startEngine() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.engineOsc) this.stopEngine();

      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(80, this.ctx.currentTime); // Low engine drone

      // Low pass filter to soften sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.engineGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.5);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch (e) {
      //
    }
  }

  updateEnginePitch(multiplier) {
    if (this.isMuted || !this.engineOsc || !this.ctx) return;
    try {
      // Pitch smoothly rises with multiplier
      const targetFreq = Math.min(650, 80 + Math.log2(multiplier) * 110);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch (e) {}
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        if (this.engineGain && this.ctx) {
          this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, this.ctx.currentTime);
          this.engineGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
        }
        setTimeout(() => {
          if (this.engineOsc) {
            try { this.engineOsc.stop(); } catch(e){}
            this.engineOsc.disconnect();
            this.engineOsc = null;
          }
        }, 120);
      } catch (e) {
        this.engineOsc = null;
      }
    }
  }

  playCashout() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Casino Win Arpeggio)
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.35);
      });
    } catch (e) {}
  }

  playCrash() {
    if (this.isMuted) return;
    this.stopEngine();
    try {
      this.init();
      if (!this.ctx) return;

      // Crash / Flyaway low noise burst
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
