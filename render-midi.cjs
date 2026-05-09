const fs = require('fs');
const { Midi } = require('@tonejs/midi');

const MIDI_PATH = '/dev-server/public/music/Oh-My-Darling-Clementine.mid';
const OUTPUT_PATH = '/mnt/documents/Oh-My-Darling-Clementine.wav';

function noteToFreq(name) {
  const notes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const match = name.match(/^([A-G])(#|b)?(\d+)$/);
  if (!match) return 440;
  let semitone = notes[match[1]];
  if (match[2] === '#') semitone++;
  if (match[2] === 'b') semitone--;
  const octave = parseInt(match[3]);
  const midi = semitone + 12 * (octave + 1);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function triSample(phase) {
  const p = ((phase % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
  if (p < Math.PI / 2) return p / (Math.PI / 2);
  if (p < 3 * Math.PI / 2) return 1 - 2 * (p - Math.PI / 2) / Math.PI;
  return -1 + 2 * (p - 3 * Math.PI / 2) / Math.PI;
}

function renderMidiToPCM(midiBuffer, sampleRate = 8000) {
  const midi = new Midi(midiBuffer);
  const notes = [];
  midi.tracks.forEach(track => {
    track.notes.forEach(n => {
      notes.push({ time: n.time, freq: noteToFreq(n.name), duration: n.duration, velocity: n.velocity });
    });
  });
  notes.sort((a, b) => a.time - b.time);

  const totalDuration = midi.duration + 0.5;
  const totalSamples = Math.ceil(totalDuration * sampleRate);
  const pcm = new Float32Array(totalSamples);

  notes.forEach(note => {
    const startSample = Math.floor(note.time * sampleRate);
    const endSample = Math.floor((note.time + note.duration) * sampleRate);
    const amp = note.velocity * 0.6;
    const freq = note.freq;
    const phaseInc = (2 * Math.PI * freq) / sampleRate;
    
    for (let i = startSample; i < endSample && i < totalSamples; i++) {
      const t = (i - startSample) / sampleRate;
      const rel = t / note.duration;
      let env;
      if (rel < 0.05) env = rel / 0.05;
      else if (rel < 0.7) env = 1;
      else env = Math.max(0, 1 - (rel - 0.7) / 0.3);
      
      const phase = phaseInc * (i - startSample);
      pcm[i] += triSample(phase) * amp * env * 0.6;
    }
  });

  let max = 0;
  for (let i = 0; i < pcm.length; i++) {
    if (Math.abs(pcm[i]) > max) max = Math.abs(pcm[i]);
  }
  if (max > 1) {
    for (let i = 0; i < pcm.length; i++) pcm[i] /= max;
  }
  
  return { pcm, sampleRate, duration: totalDuration };
}

function writeWav(pcm, sampleRate, path) {
  const bitsPerSample = 16;
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = pcm.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < pcm.length; i++) {
    const sample = Math.max(-1, Math.min(1, pcm[i]));
    const intSample = Math.floor(sample < 0 ? sample * 0x8000 : sample * 0x7FFF);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  fs.writeFileSync(path, buffer);
}

const midiBuf = fs.readFileSync(MIDI_PATH);
const { pcm, sampleRate } = renderMidiToPCM(midiBuf);
writeWav(pcm, sampleRate, OUTPUT_PATH);
console.log(`WAV written: ${OUTPUT_PATH} (${pcm.length} samples, ${(pcm.length / sampleRate).toFixed(2)}s)`);
