// Decode an MP4's audio to PCM and report peak dB, RMS dB, and silent windows.
// Usage: node scripts/audio-qa.mjs <input.mp4> [input2.mp4 ...]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Pass pre-decoded mono 44100Hz 16-bit WAV files (decode with ffmpeg beforehand).
for (const input of process.argv.slice(2)) {
  const buf = fs.readFileSync(input);
  const dataIdx = buf.indexOf(Buffer.from("data"));
  const samples = new Int16Array(buf.buffer, buf.byteOffset + dataIdx + 8, (buf.length - dataIdx - 8) >> 1);
  const SR = 44100;
  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i]) / 32768;
    if (v > peak) peak = v;
    sumSq += (samples[i] / 32768) ** 2;
  }
  const rms = Math.sqrt(sumSq / samples.length);
  const db = (x) => (x <= 0 ? -Infinity : (20 * Math.log10(x)).toFixed(1));
  // silence: consecutive 400ms windows with RMS below -55dB
  const win = Math.floor(SR * 0.4);
  const silent = [];
  let runStart = -1;
  for (let w = 0; w * win < samples.length; w++) {
    let s = 0;
    const off = w * win;
    const len = Math.min(win, samples.length - off);
    for (let i = 0; i < len; i++) s += (samples[off + i] / 32768) ** 2;
    const wr = Math.sqrt(s / len);
    const isSilent = wr < Math.pow(10, -55 / 20);
    if (isSilent && runStart < 0) runStart = w;
    if (!isSilent && runStart >= 0) {
      if ((w - runStart) * 0.4 >= 1.5) silent.push(`${(runStart * 0.4).toFixed(1)}-${(w * 0.4).toFixed(1)}s`);
      runStart = -1;
    }
  }
  if (runStart >= 0 && (samples.length / win - runStart) * 0.4 >= 1.5) {
    silent.push(`${(runStart * 0.4).toFixed(1)}s-end`);
  }
  console.log(
    `${path.basename(input)}  peak=${db(peak)}dB  rms=${db(rms)}dB  silent(>=1.5s@-55dB): ${silent.length ? silent.join(", ") : "none"}`,
  );
}
