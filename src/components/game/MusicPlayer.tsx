import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Midi } from '@tonejs/midi';
import { Volume2, VolumeX } from 'lucide-react';

const MIDI_URL = '/music/Oh-My-Darling-Clementine.mid';

const MusicPlayer = () => {
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

  // Load MIDI on mount
  useEffect(() => {
    fetch(MIDI_URL)
      .then(r => r.arrayBuffer())
      .then(buf => {
        midiRef.current = new Midi(buf);
      })
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
    <div className="flex items-center gap-1.5 bg-card/70 backdrop-blur-sm px-2 py-0.5">
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
        className="w-14 h-1 accent-primary cursor-pointer"
      />
    </div>
  );
};

export default MusicPlayer;
