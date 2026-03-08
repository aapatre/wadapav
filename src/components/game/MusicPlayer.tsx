import { useState, useEffect, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import { Volume2, VolumeX, Zap, ZapOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PixelIcon from './PixelIcon';
import { getSfxMuted, setSfxMuted } from '@/hooks/useSfx';

const MIDI_URL = '/music/Oh-My-Darling-Clementine.mid';
const CREDIT_URL = 'https://www.sheetmusicsinger.com/oh-my-darling-clementine/';
const IDB_STORE = 'wadapav-audio';
const IDB_KEY = 'music-v1';

function noteToFreq(name: string): number {
  const notes: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const match = name.match(/^([A-G])(#|b)?(\d+)$/);
  if (!match) return 440;
  let semitone = notes[match[1]];
  if (match[2] === '#') semitone++;
  if (match[2] === 'b') semitone--;
  const octave = parseInt(match[3]);
  const midi = semitone + 12 * (octave + 1);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ——— IndexedDB cache helpers ———
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_STORE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('audio');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedPCM(): Promise<Float32Array | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction('audio', 'readonly');
      const req = tx.objectStore('audio').get(IDB_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function cachePCM(data: Float32Array): Promise<void> {
  try {
    const db = await openIDB();
    const tx = db.transaction('audio', 'readwrite');
    tx.objectStore('audio').put(data, IDB_KEY);
  } catch {}
}

// ——— Render MIDI to raw PCM (Float32Array) ———
interface ParsedNote { time: number; freq: number; duration: number; velocity: number; }

async function renderMidiToPCM(): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const res = await fetch(MIDI_URL);
  const buf = await res.arrayBuffer();
  const midi = new Midi(buf);
  const notes: ParsedNote[] = [];
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      notes.push({ time: n.time, freq: noteToFreq(n.name), duration: n.duration, velocity: n.velocity });
    });
  });
  notes.sort((a, b) => a.time - b.time);

  const sampleRate = 8000;
  const totalDuration = midi.duration + 0.5;
  const offline = new OfflineAudioContext(1, Math.ceil(totalDuration * sampleRate), sampleRate);
  const masterGain = offline.createGain();
  masterGain.gain.value = 0.6;
  masterGain.connect(offline.destination);

  notes.forEach(note => {
    const osc = offline.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = note.freq;
    const ng = offline.createGain();
    const start = note.time;
    const end = start + note.duration;
    ng.gain.setValueAtTime(0, start);
    ng.gain.linearRampToValueAtTime(note.velocity * 0.6, start + 0.02);
    ng.gain.setValueAtTime(note.velocity * 0.6, start + note.duration * 0.7);
    ng.gain.linearRampToValueAtTime(0, end);
    osc.connect(ng).connect(masterGain);
    osc.start(start);
    osc.stop(end + 0.01);
  });

  const rendered = await offline.startRendering();
  return { pcm: rendered.getChannelData(0).slice(), sampleRate };
}

// ——— Load PCM: from cache or render fresh ———
async function loadPCM(): Promise<{ pcm: Float32Array; sampleRate: number }> {
  const cached = await getCachedPCM();
  if (cached) return { pcm: cached, sampleRate: 8000 };
  const result = await renderMidiToPCM();
  cachePCM(result.pcm); // fire-and-forget
  return result;
}

// ——— Component ———
const MusicPlayer = ({ onReset }: { onReset?: () => void }) => {
  const [sfxOff, setSfxOffState] = useState(() => getSfxMuted());
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem('wadapav-music-muted') === 'true');
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('wadapav-music-volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [started, setStarted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(muted);
  const volumeRef = useRef(volume);
  const readyRef = useRef(false);

  mutedRef.current = muted;
  volumeRef.current = volume;

  // Close panel on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, [open]);

  // Load and cache the audio buffer on mount
  useEffect(() => {
    loadPCM().then(({ pcm, sampleRate }) => {
      const floats = new Float32Array(pcm.buffer.slice(0) as ArrayBuffer);
      const buf = new AudioBuffer({ length: floats.length, numberOfChannels: 1, sampleRate });
      buf.copyToChannel(floats, 0);
      bufferRef.current = buf;
      readyRef.current = true;
    }).catch(console.error);

    return () => { try { sourceRef.current?.stop(); } catch {} };
  }, []);

  // Sync volume
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume * 0.15;
    localStorage.setItem('wadapav-music-muted', String(muted));
    localStorage.setItem('wadapav-music-volume', String(volume));
  }, [volume, muted]);

  const playBuffer = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    const buffer = bufferRef.current;
    if (!ctx || !gain || !buffer) return;
    try { sourceRef.current?.stop(); } catch {}

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    source.start(0);
    sourceRef.current = source;
  }, []);

  const startMusic = useCallback(async () => {
    if (started) return;
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = mutedRef.current ? 0 : volumeRef.current * 0.15;
      gain.connect(ctx.destination);
      gainRef.current = gain;
    }
    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();
    if (!readyRef.current) return;
    playBuffer();
    setStarted(true);
  }, [started, playBuffer]);

  // Start on first user interaction
  useEffect(() => {
    if (started) return;
    const handler = () => { startMusic(); };
    window.addEventListener('pointerdown', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('pointerdown', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [started, startMusic]);

  // Retry once buffer ready
  useEffect(() => {
    if (!started && readyRef.current && audioCtxRef.current) startMusic();
  });

  // ——— UI ———
  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(o => !o)} className="p-1 hover:opacity-80 transition-opacity" aria-label="Settings">
        <PixelIcon id="gear" size={28} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 bg-card/95 backdrop-blur-sm border border-border/50 p-2.5 min-w-[160px]"
            style={{ zIndex: 9999 }}
          >
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={() => setMuted(m => !m)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={e => { const v = parseFloat(e.target.value); setVolume(v); if (v > 0 && muted) setMuted(false); if (v === 0) setMuted(true); }}
                className="flex-1 h-1 accent-primary cursor-pointer"
              />
            </div>

            {/* SFX toggle */}
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => { const next = !getSfxMuted(); setSfxMuted(next); setSfxOffState(next); }}
                className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle SFX">
                {sfxOff ? <ZapOff size={14} /> : <Zap size={14} />}
              </button>
              <span className="text-[9px] font-body text-muted-foreground">SFX {sfxOff ? 'OFF' : 'ON'}</span>
            </div>

            {/* Reset progress */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="w-full text-[9px] font-body text-destructive/70 hover:text-destructive transition-colors text-left">
                  🗑️ Reset All Progress
                </button>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-body text-destructive font-bold">⚠️ This will erase ALL progress permanently!</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => { onReset?.(); setConfirmReset(false); setOpen(false); }}
                      className="flex-1 text-[8px] font-display bg-destructive text-destructive-foreground py-1 px-2 hover:bg-destructive/80 transition-colors">YES, DELETE</button>
                    <button onClick={() => setConfirmReset(false)}
                      className="flex-1 text-[8px] font-display bg-muted text-muted-foreground py-1 px-2 hover:bg-muted/80 transition-colors">CANCEL</button>
                  </div>
                </div>
              )}
            </div>

            {/* Hire me */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              <a href="https://antariksh.me" target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-primary/20 border border-primary/50 hover:bg-primary/30 transition-colors px-2 py-1.5">
                <span className="text-[9px] font-display text-primary tracking-wider">🚀 HIRE THE DEV</span>
                <span className="block text-[8px] font-body text-muted-foreground mt-0.5">antariksh.me</span>
              </a>
            </div>

            {/* Credit */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              <a href={CREDIT_URL} target="_blank" rel="noopener noreferrer"
                className="text-[8px] font-body text-muted-foreground hover:text-primary transition-colors">
                🎵 Music: sheetmusicsinger.com
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicPlayer;
