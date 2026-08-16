/**
 * Web Audio API Sound Synthesizer & Sound Effects
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isSoundOn = true;
  private isMusicOn = true;
  private isVibrationOn = true;
  private musicInterval: number | null = null;

  constructor() {
    // Lazy init audio context on user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSettings(sound: boolean, music: boolean, vibration: boolean) {
    this.isSoundOn = sound;
    this.isMusicOn = music;
    this.isVibrationOn = vibration;

    if (!music) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public vibrate(ms: number | number[] = 30) {
    if (this.isVibrationOn && typeof navigator !== 'undefined' && (navigator as unknown as { vibrate: (pattern: unknown) => boolean }).vibrate) {
      try {
        (navigator as unknown as { vibrate: (pattern: unknown) => boolean }).vibrate(ms);
      } catch {
        // ignore
      }
    }
  }

  // Play a fruit pickup pop sound
  public playPickUp() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(15);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Play a fruit drop/plop sound
  public playPlace() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(25);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Invalid move buzz/shake
  public playInvalid() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([40, 30, 40]);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Single basket completed chord
  public playBasketComplete() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(50);
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.35);
    });
  }

  // Victory fanfare for solving entire level
  public playLevelWin() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate([80, 50, 100]);
    const now = this.ctx.currentTime;
    // C5, E5, G5, C6 triumphant arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      const dur = i === notes.length - 1 ? 0.8 : 0.25;
      gain.gain.setValueAtTime(0.18, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + dur);
    });
  }

  // Button Click / Tap
  public playClick() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(10);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Undo move
  public playUndo() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(15);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Hint sound
  public playHint() {
    if (!this.isSoundOn) return;
    this.initCtx();
    if (!this.ctx) return;

    this.vibrate(20);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Voice announcements using SpeechSynthesis API
  public speakVoice(text: string) {
    if (!this.isSoundOn) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Cancel ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore
      }
    }
  }

  // Soft pleasant ambient music loop generator
  public startMusic() {
    if (!this.isMusicOn || this.musicInterval !== null) return;

    // Gentle relaxing pentatonic progression
    const melodies = [
      [261.63, 329.63, 392.00, 523.25], // C - E - G - C5
      [220.00, 261.63, 329.63, 440.00], // A - C - E - A4
      [174.61, 220.00, 261.63, 349.23], // F - A - C - F4
      [196.00, 246.94, 293.66, 392.00], // G - B - D - G4
    ];

    let step = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicOn) return;
      this.initCtx();
      if (!this.ctx) return;

      const chord = melodies[step % melodies.length];
      const now = this.ctx.currentTime;

      chord.forEach((note, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now + i * 0.2);

        gain.gain.setValueAtTime(0.02, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.2 + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 2.5);
      });

      step++;
    }, 4000);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new SoundEngine();
