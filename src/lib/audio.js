const profiles = {
  pixel: { wave: 'square', notes: [220, 246.94, 261.63, 293.66, 329.63, 392], step: .32 },
  city: { wave: 'sine', notes: [174.61, 196, 207.65, 233.08, 261.63, 293.66], step: .52 },
  manga: { wave: 'triangle', notes: [220, 261.63, 293.66, 349.23, 392], step: .68 },
  comic: { wave: 'sawtooth', notes: [261.63, 329.63, 392, 415.3, 493.88], step: .22 },
  void: { wave: 'square', notes: [82.41, 110, 123.47, 164.81, 220], step: .18 },
};

export class AudioEngine {
  constructor(onLevel) {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.ambientMaster = null;
    this.analyser = null;
    this.onLevel = onLevel;
    this.playing = false;
    this.demoTimer = null;
    this.raf = null;
    this.media = new Audio();
    this.media.loop = false;
    this.mediaSource = null;
    this.usingUpload = false;
    this.ambientNodes = new Map();
    this.pendingMusicVolume = .68;
  }

  ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = .72;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.pendingMusicVolume;
    this.ambientMaster = this.ctx.createGain();
    this.ambientMaster.gain.value = .6;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.musicGain.connect(this.master);
    this.ambientMaster.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.monitor();
  }

  monitor = () => {
    if (!this.analyser) return;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / Math.max(1, data.length) / 255;
    this.onLevel?.(avg);
    this.raf = requestAnimationFrame(this.monitor);
  };

  note(freq, time, dur, wave, gain = .32, destination = this.musicGain) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + .02);
    g.gain.exponentialRampToValueAtTime(.0001, time + dur);
    osc.connect(g); g.connect(destination || this.master);
    osc.start(time); osc.stop(time + dur + .03);
  }

  startDemo(theme) {
    this.ensure();
    this.usingUpload = false;
    this.media.pause();
    clearTimeout(this.demoTimer);
    const playLoop = () => {
      if (!this.playing || this.usingUpload) return;
      const p = profiles[theme] || profiles.pixel;
      const now = this.ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const n = p.notes[Math.floor(Math.random() * p.notes.length)];
        this.note(n, now + i * p.step, p.step * .82, p.wave, theme === 'void' ? .18 : .24);
        if (i % 4 === 0) this.note(n / 2, now + i * p.step, p.step * 1.5, p.wave, .12);
      }
      this.demoTimer = setTimeout(playLoop, p.step * 8 * 1000);
    };
    playLoop();
  }

  async play(theme) {
    this.ensure();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.playing = true;
    if (this.usingUpload) await this.media.play();
    else this.startDemo(theme);
  }

  pause() {
    this.playing = false;
    clearTimeout(this.demoTimer);
    this.media.pause();
  }

  setMusicVolume(value) {
    this.pendingMusicVolume = Math.max(0, Math.min(1, value));
    if (this.ctx && this.musicGain) this.musicGain.gain.setTargetAtTime(this.pendingMusicVolume, this.ctx.currentTime, .04);
  }

  async setTrack(file) {
    this.ensure();
    clearTimeout(this.demoTimer);
    this.media.pause();
    if (this.media.src?.startsWith('blob:')) URL.revokeObjectURL(this.media.src);
    this.media.src = URL.createObjectURL(file);
    if (!this.mediaSource) {
      this.mediaSource = this.ctx.createMediaElementSource(this.media);
      this.mediaSource.connect(this.musicGain);
    }
    this.usingUpload = true;
    this.media.currentTime = 0;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.playing = true;
    await this.media.play();
  }

  createNoise(kind) {
    this.ensure();
    if (this.ambientNodes.has(kind)) return this.ambientNodes.get(kind);
    const length = Math.floor(this.ctx.sampleRate * 2.2);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      if (kind === 'rain') data[i] = white * .55;
      else if (kind === 'vinyl') data[i] = white * .16 + (Math.random() > .997 ? (Math.random() * 2 - 1) * .8 : 0);
      else data[i] = brown * 2.6;
    }
    const src = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    src.buffer = buffer; src.loop = true;
    if (kind === 'rain') { filter.type = 'highpass'; filter.frequency.value = 1200; }
    else if (kind === 'cafe') { filter.type = 'bandpass'; filter.frequency.value = 650; filter.Q.value = .55; }
    else if (kind === 'fire') { filter.type = 'lowpass'; filter.frequency.value = 680; }
    else { filter.type = 'bandpass'; filter.frequency.value = 2400; filter.Q.value = .4; }
    gain.gain.value = 0;
    src.connect(filter); filter.connect(gain); gain.connect(this.ambientMaster); src.start();
    const node = { src, gain, filter };
    this.ambientNodes.set(kind, node);
    return node;
  }

  async setAmbient(kind, level) {
    this.ensure();
    const node = this.createNoise(kind);
    const target = Math.max(0, Math.min(1, Number(level) || 0)) * (kind === 'rain' ? .22 : kind === 'vinyl' ? .16 : .2);
    node.gain.gain.setTargetAtTime(target, this.ctx.currentTime, .08);
  }

  sfx(type = 'coin') {
    this.ensure();
    const t = this.ctx.currentTime;
    const map = {
      hit: [240, 110], win: [440, 660, 880], coin: [520, 760], bark: [180, 120], tick: [900], fail: [180, 130, 90], start: [330, 440, 660]
    };
    const tones = map[type] || map.coin;
    tones.forEach((f, i) => this.note(f, t + i * .07, .12, type === 'bark' ? 'sawtooth' : 'square', .16, this.master));
  }

  destroy() {
    clearTimeout(this.demoTimer);
    cancelAnimationFrame(this.raf);
    this.media.pause();
    for (const node of this.ambientNodes.values()) { try { node.src.stop(); } catch {} }
    this.ctx?.close();
  }
}
