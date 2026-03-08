/**
 * Lightweight SFX + haptic feedback using Web Audio API oscillators.
 * No external audio files needed — all sounds are synthesised.
 */

const SFX_VOLUME_KEY = 'wadapav-sfx-muted';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function isMuted(): boolean {
  return localStorage.getItem(SFX_VOLUME_KEY) === 'true';
}

/** Play a short beep/tone */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.12,
  ramp?: number,
) {
  if (isMuted()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    if (ramp) osc.frequency.linearRampToValueAtTime(ramp, ctx.currentTime + duration);
    gain.gain.value = volume;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

/** Trigger haptic vibration if supported */
function haptic(pattern: number | number[]) {
  try {
    navigator?.vibrate?.(pattern);
  } catch {}
}

// ——— Public SFX functions ———

export function sfxBuy() {
  playTone(523, 0.08, 'square', 0.1);
  setTimeout(() => playTone(659, 0.08, 'square', 0.1), 60);
  setTimeout(() => playTone(784, 0.1, 'square', 0.1), 120);
  haptic(30);
}

export function sfxPrestige() {
  playTone(440, 0.12, 'sine', 0.15);
  setTimeout(() => playTone(554, 0.12, 'sine', 0.15), 100);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.15), 200);
  setTimeout(() => playTone(880, 0.2, 'sine', 0.15), 300);
  haptic([50, 30, 50, 30, 80]);
}

export function sfxComboStart() {
  // Ascending chirp when combo threshold reached
  playTone(600, 0.1, 'square', 0.08);
  setTimeout(() => playTone(800, 0.1, 'square', 0.08), 80);
  haptic(20);
}

export function sfxComboUp() {
  // Short blip for combo milestones (50, 100)
  playTone(900, 0.06, 'square', 0.1);
  setTimeout(() => playTone(1100, 0.08, 'square', 0.1), 50);
  haptic([15, 10, 15]);
}

export function sfxTap() {
  playTone(220, 0.04, 'triangle', 0.06);
  haptic(10);
}

export function sfxThiefCaught() {
  playTone(500, 0.08, 'square', 0.1);
  setTimeout(() => playTone(700, 0.1, 'square', 0.1), 70);
  haptic(40);
}

export function sfxThiefStole() {
  playTone(300, 0.15, 'sawtooth', 0.08, 100);
  haptic([80, 40, 80]);
}

export function getSfxMuted(): boolean {
  return isMuted();
}

export function setSfxMuted(muted: boolean) {
  localStorage.setItem(SFX_VOLUME_KEY, String(muted));
}
