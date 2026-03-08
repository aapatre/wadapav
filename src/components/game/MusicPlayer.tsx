import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { Volume2, VolumeX, Zap, ZapOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import PixelIcon from './PixelIcon';
import { getSfxMuted, setSfxMuted } from '@/hooks/useSfx';

const MIDI_URL = '/music/Oh-My-Darling-Clementine.mid';
const CREDIT_URL = 'https://www.sheetmusicsinger.com/oh-my-darling-clementine/';

const MusicPlayer = () => {
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
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const midiRef = useRef<Midi | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Load MIDI on mount
  useEffect(() => {
    fetch(MIDI_URL)
      .then(r => r.arrayBuffer())
      .then(buf => { midiRef.current = new Midi(buf); })
      .catch(console.error);
    return () => {
      partsRef.current.forEach(p => p.dispose());
      synthRef.current?.dispose();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = muted ? -Infinity : Tone.gainToDb(volume);
    }
    localStorage.setItem('wadapav-music-muted', String(muted));
    localStorage.setItem('wadapav-music-volume', String(volume));
  }, [volume, muted]);

  const startMusic = useCallback(async () => {
    if (started || !midiRef.current) return;
    await Tone.start();

    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 },
    }).toDestination();
    synth.volume.value = muted ? -Infinity : Tone.gainToDb(volume);
    synthRef.current = synth;

    const midi = midiRef.current;
    const duration = midi.duration;

    midi.tracks.forEach(track => {
      const notes = track.notes.map(n => ({
        time: n.time,
        note: n.name,
        duration: n.duration,
        velocity: n.velocity,
      }));

      const part = new Tone.Part((time, val) => {
        synth.triggerAttackRelease(val.note, val.duration, time, val.velocity * 0.6);
      }, notes);
      part.loop = true;
      part.loopEnd = duration;
      part.start(0);
      partsRef.current.push(part);
    });

    Tone.getTransport().start();
    setStarted(true);
  }, [started, muted, volume]);

  // Start on first user interaction
  useEffect(() => {
    if (started) return;
    const handler = () => { startMusic(); };
    window.addEventListener('pointerdown', handler, { once: true });
    return () => window.removeEventListener('pointerdown', handler);
  }, [started, startMusic]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Gear button — no background, white icon with dark outline */}
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1 hover:opacity-80 transition-opacity"
        aria-label="Settings"
      >
        <PixelIcon id="gear" size={28} />
      </button>

      {/* Dropdown panel */}
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
