const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export class AudioManager {
  constructor({ bgSrc, fxSources }) {
    this.bg = new Audio(bgSrc);
    this.bg.loop = true;
    this.fxSources = fxSources;
    this.soundEnabled = true;
    this.musicVolume = 0.32;
    this.fxVolume = 0.9;
    this.unlocked = false;
    this.audioCtx = null;
  }

  bindUnlock(target = document) {
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      if (this.soundEnabled) this.playMusic();
    };
    target.addEventListener("pointerdown", unlock, { once: true });
    target.addEventListener("keydown", unlock, { once: true });
  }

  applySettings(settings) {
    this.setMusicVolume(settings.musicVolume);
    this.setFxVolume(settings.fxVolume);
    this.setSoundEnabled(settings.sound);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = !!enabled;
    if (!this.soundEnabled) {
      this.stopMusic();
    } else if (this.unlocked) {
      this.playMusic();
    }
  }

  setMusicVolume(percent) {
    const vol = clamp(Number(percent) || 0, 0, 100) / 100;
    this.musicVolume = vol;
    this.bg.volume = vol;
  }

  setFxVolume(percent) {
    const vol = clamp(Number(percent) || 0, 0, 100) / 100;
    this.fxVolume = vol;
  }

  playMusic() {
    if (!this.soundEnabled) return;
    this.bg.volume = this.musicVolume;
    this.bg.play().catch(() => {});
  }

  stopMusic() {
    this.bg.pause();
    this.bg.currentTime = 0;
  }

  playFX(kind) {
    if (!this.soundEnabled) return;
    const src = this.fxSources[kind];
    if (!src) return;
    try {
      const audio = new Audio(src);
      audio.volume = this.fxVolume;
      audio.play().catch(() => this.beep(kind));
    } catch {
      this.beep(kind);
    }
  }

  beep(kind) {
    if (!this.soundEnabled) return;
    try {
      this.audioCtx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = kind === "level" ? 880 : kind === "good" ? 660 : 220;
      g.gain.value = 0.06;
      o.connect(g);
      g.connect(this.audioCtx.destination);
      o.start();
      o.stop(this.audioCtx.currentTime + 0.12);
    } catch {}
  }
}
