// Synthesizes one 30s BGM WAV per video, section-aligned to scene boundaries.
// Deterministic, license-free. Sections crossfade over 0.8s (no hard gates).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DUR = 30;
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "bgm");
fs.mkdirSync(outDir, { recursive: true });

let seed = 987654321;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

const SEMIS = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const NOTE = (name) => {
  const m = name.match(/^([A-G][#b]?)(-?\d)$/);
  return 440 * Math.pow(2, (SEMIS[m[1]] + (parseInt(m[2], 10) + 1) * 12 - 69) / 12);
};

const smoothstep = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// section gain with 0.8s overlapping fades
const FADE = 0.8;
const sectionGain = (sec, t) => smoothstep(sec.t0 - FADE / 2, sec.t0 + FADE / 2, t) * (1 - smoothstep(sec.t1 - FADE / 2, sec.t1 + FADE / 2, t));

function wave(type, f, t) {
  const w = 2 * Math.PI * f;
  switch (type) {
    case "soft":
      return Math.sin(w * t) + 0.22 * Math.sin(2 * w * t) + 0.08 * Math.sin(3 * w * t);
    case "bass":
      return Math.sin(w * t) + 0.38 * Math.sin(2 * w * t) + 0.18 * Math.sin(3 * w * t);
    case "kick": {
      const phase = 2 * Math.PI * (44 * t + (110 / 16) * (1 - Math.exp(-16 * t)));
      return Math.sin(phase);
    }
    case "noise":
      return rand();
    default:
      return Math.sin(w * t);
  }
}

function render(events) {
  const out = new Float32Array(SR * DUR);
  for (const e of events) {
    const atk = e.atk ?? 0.008;
    const rel = e.rel ?? 0.12;
    const n0 = Math.floor(e.t * SR);
    const n1 = Math.min(out.length, Math.ceil((e.t + e.dur + rel * 1.5) * SR));
    for (let i = Math.max(0, n0); i < n1; i++) {
      const t = (i - n0) / SR;
      let env = Math.min(1, t / atk);
      if (t > e.dur) env *= Math.exp(((e.dur - t) * 5) / rel);
      out[i] += wave(e.type, e.f, t) * e.gain * env;
    }
  }
  return out;
}

// Build note events for a song spec: {bpm, sections:[{t0,t1,chords,layers:{pad,arp,bass,hat,kick}}]}
function song(spec) {
  const beat = 60 / spec.bpm;
  const bar = beat * 4;
  const eighth = beat / 2;
  const ev = [];
  for (const sec of spec.sections) {
    // pads per bar (global bar grid keeps phrase alignment across sections)
    const firstBar = Math.floor(sec.t0 / bar);
    const lastBar = Math.ceil(sec.t1 / bar);
    for (let b = firstBar; b < lastBar; b++) {
      const t = b * bar;
      if (t + bar < sec.t0 - FADE || t > sec.t1 + FADE) continue;
      const chord = sec.chords[((b % sec.chords.length) + sec.chords.length) % sec.chords.length];
      const gAt = (tt) => sectionGain(sec, tt);
      if (sec.layers.pad) {
        for (const n of chord.pad) {
          ev.push({ t, dur: bar * 0.95, f: NOTE(n), type: "soft", gain: 0.045 * sec.layers.pad * gAt(t + 0.4), atk: 0.5, rel: 0.7 });
        }
      }
      for (let e8 = 0; e8 < 8; e8++) {
        const te = t + e8 * eighth;
        if (te < sec.t0 - FADE || te > sec.t1 + FADE) continue;
        const g = gAt(te);
        if (sec.layers.bass && e8 % 2 === 0) {
          const oct = e8 % 4 === 0 ? 0 : 12;
          ev.push({ t: te, dur: eighth * 0.8, f: NOTE(chord.bass) * Math.pow(2, oct / 12), type: "bass", gain: 0.085 * sec.layers.bass * g, rel: 0.08 });
        }
        if (sec.layers.arp) {
          const tone = chord.arp[e8 % chord.arp.length];
          ev.push({ t: te, dur: eighth * 0.85, f: NOTE(tone), type: "sine", gain: 0.05 * sec.layers.arp * g, atk: 0.012, rel: 0.18 });
        }
        if (sec.layers.hat && e8 % 2 === 1) {
          ev.push({ t: te, dur: 0.03, f: 0, type: "noise", gain: 0.022 * sec.layers.hat * g, atk: 0.002, rel: 0.03 });
        }
        if (sec.layers.kick && (sec.layers.kick === 2 ? e8 % 2 === 0 : e8 % 4 === 0)) {
          ev.push({ t: te, dur: 0.22, f: 0, type: "kick", gain: 0.15 * g, atk: 0.002, rel: 0.1 });
        }
      }
    }
  }
  return render(ev);
}

function writeWav(name, samples) {
  // global tail fadeout, normalize to -13dBFS peak, soft clip
  const fadeStart = Math.floor(29.2 * SR);
  for (let i = fadeStart; i < samples.length; i++) {
    samples[i] *= 1 - smoothstep(29.2, 29.9, i / SR);
  }
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  const target = 0.22;
  const k = peak > 0 ? target / peak : 1;
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.tanh(samples[i] * k * 1.15) / 1.15;
    buf.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32767, 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name);
}

const ch = (bass, pad, arp) => ({ bass, pad, arp });

// --- PovRage: tension in A minor → resolution (scenes: 3.6 / 20.4 / 24.6 / 30)
{
  const Am = ch("A1", ["A2", "E3", "C4"], ["A3", "C4", "E4", "C4"]);
  const F = ch("F1", ["F2", "C3", "A3"], ["F3", "A3", "C4", "A3"]);
  const Dm = ch("D1", ["D2", "A2", "F3"], ["D3", "F3", "A3", "F3"]);
  const E = ch("E1", ["E2", "B2", "G#3"], ["E3", "G#3", "B3", "G#3"]);
  const C = ch("C2", ["C3", "G3", "E4"], ["C4", "E4", "G4", "E4"]);
  const G = ch("G1", ["G2", "D3", "B3"], ["G3", "B3", "D4", "B3"]);
  writeWav(
    "pov-rage.wav",
    song({
      bpm: 100,
      sections: [
        { t0: 0, t1: 3.6, chords: [Am, Am, F, F], layers: { pad: 1 } },
        { t0: 3.6, t1: 20.4, chords: [Am, F, Dm, E], layers: { pad: 0.8, bass: 1, arp: 0.9, hat: 1 } },
        { t0: 20.4, t1: 24.6, chords: [F, G, Am, Am], layers: { pad: 1.1 } },
        { t0: 24.6, t1: 30, chords: [C, G, Am, F], layers: { pad: 1, arp: 1, kick: 1 } },
      ],
    }),
  );
}

// --- SplitDuel: versus groove in E minor → triumph (scenes: 3.4 / 20.0 / 24.4 / 30)
{
  const Em = ch("E1", ["E2", "B2", "G3"], ["E3", "G3", "B3", "G3"]);
  const Cq = ch("C2", ["C3", "G3", "E4"], ["C4", "E4", "G4", "E4"]);
  const Gq = ch("G1", ["G2", "D3", "B3"], ["G3", "B3", "D4", "B3"]);
  const Dq = ch("D2", ["D3", "A3", "F#4"], ["D4", "F#4", "A4", "F#4"]);
  writeWav(
    "split-duel.wav",
    song({
      bpm: 112,
      sections: [
        { t0: 0, t1: 3.4, chords: [Em, Em, Cq, Cq], layers: { pad: 1, arp: 0.6 } },
        { t0: 3.4, t1: 20.0, chords: [Em, Cq, Gq, Dq], layers: { pad: 0.7, bass: 1, arp: 0.8, hat: 1, kick: 1 } },
        { t0: 20.0, t1: 24.4, chords: [Gq, Dq, Em, Cq], layers: { pad: 1, bass: 0.8, arp: 1.1, kick: 2 } },
        { t0: 24.4, t1: 30, chords: [Cq, Gq, Dq, Gq], layers: { pad: 1.1, arp: 0.8 } },
      ],
    }),
  );
}

// --- EnterLie: curious D minor arpeggio → warm resolve (scenes: 4.2 / 12.2 / 21.4 / 30)
{
  const Dm = ch("D2", ["D3", "A3", "F4"], ["D4", "F4", "A4", "E5"]);
  const Bb = ch("Bb1", ["Bb2", "F3", "D4"], ["Bb3", "D4", "F4", "D4"]);
  const Fq = ch("F1", ["F2", "C3", "A3"], ["F3", "A3", "C4", "A3"]);
  const Cq = ch("C2", ["C3", "G3", "E4"], ["C4", "E4", "G4", "E4"]);
  const Gm = ch("G1", ["G2", "D3", "Bb3"], ["G3", "Bb3", "D4", "Bb3"]);
  const A = ch("A1", ["A2", "E3", "C#4"], ["A3", "C#4", "E4", "C#4"]);
  writeWav(
    "enter-lie.wav",
    song({
      bpm: 84,
      sections: [
        { t0: 0, t1: 4.2, chords: [Dm, Dm, Bb, Bb], layers: { pad: 1, arp: 0.5 } },
        { t0: 4.2, t1: 12.2, chords: [Dm, Bb, Fq, Cq], layers: { pad: 0.9, arp: 0.9, hat: 0.7 } },
        { t0: 12.2, t1: 21.4, chords: [Dm, Bb, Gm, A], layers: { pad: 0.8, bass: 1, arp: 0.9, hat: 1, kick: 1 } },
        { t0: 21.4, t1: 30, chords: [Fq, Cq, Bb, Cq], layers: { pad: 1.1, arp: 0.7 } },
      ],
    }),
  );
}
