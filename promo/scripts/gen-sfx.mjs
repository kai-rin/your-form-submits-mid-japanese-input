// Generates license-free synthesized SFX WAVs into public/sfx/.
// Deterministic (seeded noise) so re-runs produce identical files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
fs.mkdirSync(outDir, { recursive: true });

function writeWav(name, samples) {
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
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log("wrote", name, (n / SR).toFixed(2) + "s");
}

const sec = (s) => Math.round(s * SR);
let seed = 123456789;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x3fffffff - 1;
};

// short keyboard tick
{
  const n = sec(0.06);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = rand() * Math.exp(-t * 260) * 0.45 + Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 320) * 0.18;
  }
  writeWav("key.wav", out);
}

// conversion pop (rising blip)
{
  const n = sec(0.14);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 480 + 720 * (i / n);
    out[i] = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 26) * 0.42;
  }
  writeWav("convert.wav", out);
}

// error buzz (premature send)
{
  const n = sec(0.34);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const sq = Math.sign(Math.sin(2 * Math.PI * 128 * t)) * 0.3 + Math.sign(Math.sin(2 * Math.PI * 96 * t)) * 0.22;
    out[i] = sq * Math.exp(-t * 8.5);
  }
  writeWav("error.wav", out);
}

// whoosh (message flies away / scene cut)
{
  const n = sec(0.38);
  const out = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) {
    const x = i / n;
    const env = Math.pow(Math.sin(Math.PI * x), 2);
    lp = lp + 0.13 * (rand() - lp);
    out[i] = lp * env * 1.7;
  }
  writeWav("whoosh.wav", out);
}

// success chime (fixed form sends complete message)
{
  const n = sec(0.55);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = Math.sin(2 * Math.PI * 659.25 * t) * Math.exp(-t * 6) * 0.28;
    if (t > 0.12) {
      const t2 = t - 0.12;
      v += Math.sin(2 * Math.PI * 880 * t2) * Math.exp(-t2 * 5) * 0.3;
    }
    out[i] = v;
  }
  writeWav("chime.wav", out);
}

// ambient pad bed (12s seamless loop, quiet)
{
  const DUR = 12;
  const n = sec(DUR);
  const out = new Float32Array(n);
  const tones = [
    { f: 55, a: 0.045 },
    { f: 110, a: 0.038 },
    { f: 220, a: 0.02 },
    { f: 329.63, a: 0.012 },
  ];
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let v = 0;
    for (const { f, a } of tones) {
      // integer LFO cycles over DUR keep the loop seamless
      const lfo = 0.75 + 0.25 * Math.sin(2 * Math.PI * (2 / DUR) * t + f);
      v += Math.sin(2 * Math.PI * f * t) * a * lfo;
    }
    out[i] = v;
  }
  writeWav("pad.wav", out);
}
