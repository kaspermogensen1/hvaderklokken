// Simple procedural Web Audio synthesizer for the app's sound effects
// Does not rely on external MP3s.

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true; // Auto-enabled, but browsers require gesture first
  }

  _init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    this._init();
    const t = this.ctx.currentTime;
    
    // A nice, bright "Ding!" (Major third harmony)
    this._beep(523.25, 'sine', t, 0.1, 0.4); // C5
    this._beep(659.25, 'sine', t + 0.1, 0.1, 0.6); // E5
  }

  playError() {
    if (!this.enabled) return;
    this._init();
    const t = this.ctx.currentTime;

    // A dull, descending "Boing"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.3);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playPop() {
    if (!this.enabled) return;
    this._init();
    const t = this.ctx.currentTime;
    this._beep(800, 'sine', t, 0.05, 0.1);
  }

  _beep(freq, type, time, attack, release) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.2, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.01, time + attack + release);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + attack + release);
  }
}

export const audio = new AudioEngine();
