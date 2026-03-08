import { useState, useEffect, useRef, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import { Volume2, VolumeX, Zap, ZapOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PixelIcon from './PixelIcon';
import { getSfxMuted, setSfxMuted } from '@/hooks/useSfx';

const MIDI_URL = '/music/Oh-My-Darling-Clementine.mid';
const CREDIT_URL = 'https://www.sheetmusicsinger.com/oh-my-darling-clementine/';

// Convert MIDI note name to frequency
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

interface ScheduledNote {
  time: number;
  freq: number;
  duration: number;
  velocity: number;
}

const MusicPlayer = ({ onReset }: { onReset?: () => void }) => {
  const [sfxOff, setSfxOffState] = useState(() => getSfxMuted());
  const [confirmReset, setConfirmReset] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('wadapav-music-muted');
    return saved === 'true';
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('wadapav-music-volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  const [started, setStarted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const notesRef = useRef<ScheduledNote[]>([]);
  const durationRef = useRef(0);
  const loopTimerRef = useRef<number | null>(null);
  const activeOscsRef = useRef<OscillatorNode[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const mutedRef = useRef(muted);
  const volumeRef = useRef(volume);

  mutedRef.current = muted;
  volumeRef.current = volume;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('pointerdown', handler);
    return () => window.removeEventListener('pointerdown', handler);
  }, [open]);

  const midiLoadedRef = useRef(false);

  // Load MIDI on mount
  useEffect(() => {
    fetch(MIDI_URL)
      .then(r => r.arrayBuffer())
      .then(buf => {
        const midi = new Midi(buf);
        const allNotes: ScheduledNote[] = [];
        midi.tracks.forEach(track => {
          track.notes.forEach(n => {
            allNotes.push({
              time: n.time,
              freq: noteToFreq(n.name),
              duration: n.duration,
              velocity: n.velocity,
            });
          });
        });
        allNotes.sort((a, b) => a.time - b.time);
        notesRef.current = allNotes;
        durationRef.current = midi.duration;
        midiLoadedRef.current = true;
      })
      .catch(console.error);

    return () => {
      if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
      activeOscsRef.current.forEach(o => { try { o.stop(); } catch {} });
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = muted ? 0 : volume * 0.15;
    }
    localStorage.setItem('wadapav-music-muted', String(muted));
    localStorage.setItem('wadapav-music-volume', String(volume));
  }, [volume, muted]);

  const scheduleLoop = useCallback(() => {
    const ctx = audioCtxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain || notesRef.current.length === 0) return;

    const now = ctx.currentTime + 0.1;
    const dur = durationRef.current;

    notesRef.current.forEach(note => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      const noteGain = ctx.createGain();
      noteGain.gain.value = note.velocity * 0.6;
      // Envelope
      const start = now + note.time;
      noteGain.gain.setValueAtTime(0, start);
      noteGain.gain.linearRampToValueAtTime(note.velocity * 0.6, start + 0.02);
      noteGain.gain.setValueAtTime(note.velocity * 0.6, start + note.duration * 0.7);
      noteGain.gain.linearRampToValueAtTime(0, start + note.duration);

      osc.connect(noteGain).connect(gain);
      osc.start(start);
      osc.stop(start + note.duration + 0.01);
      activeOscsRef.current.push(osc);
      osc.onended = () => {
        activeOscsRef.current = activeOscsRef.current.filter(o => o !== osc);
      };
    });

    // Schedule next loop
    loopTimerRef.current = window.setTimeout(() => {
      scheduleLoop();
    }, dur * 1000);
  }, []);

  const startMusic = useCallback(async () => {
    if (started) return;

    // On mobile, AudioContext must be created & resumed inside a user gesture
    if (!audioCtxRef.current) {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const gain = ctx.createGain();
      gain.gain.value = mutedRef.current ? 0 : volumeRef.current * 0.15;
      gain.connect(ctx.destination);
      gainRef.current = gain;
    }

    // Resume suspended context (required on iOS Safari & mobile Chrome)
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    // If MIDI not loaded yet, wait and retry
    if (notesRef.current.length === 0) return;

    scheduleLoop();
    setStarted(true);
  }, [started, scheduleLoop]);

  // Start on first user interaction
  useEffect(() => {
    if (started) return;
    const handler = () => { startMusic(); };
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, [started, startMusic]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1 hover:opacity-80 transition-opacity"
        aria-label="Settings"
      >
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
            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMuted(m => !m)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={e => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (v > 0 && muted) setMuted(false);
                  if (v === 0) setMuted(true);
                }}
                className="flex-1 h-1 accent-primary cursor-pointer"
              />
            </div>

            {/* SFX toggle */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => {
                  const next = !getSfxMuted();
                  setSfxMuted(next);
                  setSfxOffState(next);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle SFX"
              >
                {sfxOff ? <ZapOff size={14} /> : <Zap size={14} />}
              </button>
              <span className="text-[9px] font-body text-muted-foreground">
                SFX {sfxOff ? 'OFF' : 'ON'}
              </span>
            </div>

            {/* Reset progress */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="w-full text-[9px] font-body text-destructive/70 hover:text-destructive transition-colors text-left"
                >
                  🗑️ Reset All Progress
                </button>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-body text-destructive font-bold">
                    ⚠️ This will erase ALL progress permanently!
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onReset?.();
                        setConfirmReset(false);
                        setOpen(false);
                      }}
                      className="flex-1 text-[8px] font-display bg-destructive text-destructive-foreground py-1 px-2 hover:bg-destructive/80 transition-colors"
                    >
                      YES, DELETE
                    </button>
                    <button
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 text-[8px] font-display bg-muted text-muted-foreground py-1 px-2 hover:bg-muted/80 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Hire me — prominent */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              <a
                href="https://antariksh.me"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-primary/20 border border-primary/50 hover:bg-primary/30 transition-colors px-2 py-1.5"
              >
                <span className="text-[9px] font-display text-primary tracking-wider">🚀 HIRE THE DEV</span>
                <span className="block text-[8px] font-body text-muted-foreground mt-0.5">antariksh.me</span>
              </a>
            </div>

            {/* Credit */}
            <div className="mt-2 pt-1.5 border-t border-border/30">
              <a
                href={CREDIT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[8px] font-body text-muted-foreground hover:text-primary transition-colors"
              >
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
