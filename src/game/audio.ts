let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'square', vol = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playShoot() { playTone(880, 0.08, 'square', 0.05); }
export function playExplosion() { playTone(120, 0.3, 'sawtooth', 0.08); }
export function playSpecialExplosion() {
  playTone(440, 0.4, 'sine', 0.06);
  setTimeout(() => playTone(660, 0.3, 'sine', 0.05), 100);
}
export function playPowerUp() { playTone(523, 0.15, 'sine', 0.06); setTimeout(() => playTone(784, 0.2, 'sine', 0.06), 100); }
export function playDamage() { playTone(80, 0.3, 'sawtooth', 0.1); }
export function playGameOver() {
  playTone(440, 0.3, 'square', 0.08);
  setTimeout(() => playTone(330, 0.3, 'square', 0.08), 200);
  setTimeout(() => playTone(220, 0.5, 'square', 0.08), 400);
}

export function initAudio() {
  getCtx();
}
