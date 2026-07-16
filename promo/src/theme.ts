import { loadFont as loadJp } from "@remotion/google-fonts/NotoSansJP";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: JP_FONT } = loadJp("normal", {
  weights: ["400", "500", "700", "900"],
  subsets: ["latin", "japanese"],
});

export const { fontFamily: MONO_FONT } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const CANVAS = { w: 1920, h: 1080 };

// Safe areas (5% action / 10% title)
export const SAFE = {
  actionX: CANVAS.w * 0.05,
  actionY: CANVAS.h * 0.05,
  titleX: CANVAS.w * 0.1,
  titleY: CANVAS.h * 0.1,
};

// Type scale designed for ~360px-wide portrait-phone playback (displayScale ≈ 0.1875):
// hero 180 → ~34px effective, headline 150 → ~28px, sub 92 → ~17px, label 64 → ~12px.
export const TYPE = {
  hero: 180,
  headline: 148,
  caption: 100,
  captionJp: 66,
  sub: 92,
  chat: 64,
  chatName: 54,
  label: 64,
  codeBig: 86,
  code: 52,
  stamp: 150,
  urlBig: 104,
  urlSmall: 68,
};

export const COLORS = {
  bg1: "#0d1520",
  bg2: "#1b2735",
  text: "#ffffff",
  dim: "#aebdcc",
  red: "#ff5468",
  redDeep: "#d73a49",
  redSoft: "#ffe5e8",
  redText: "#c0293a",
  green: "#3fce6e",
  greenDeep: "#2da44e",
  greenSoft: "#dcf5e3",
  greenText: "#1a7f37",
  blue: "#7fd4ff",
  accent: "#39c1f0",
  cardBg: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.16)",
  chatBg: "#ffffff",
  chatText: "#222222",
  composing: "#2c3e50",
  convertBg: "#b8d8ff",
};

// Decaying screen shake around a trigger time (seconds).
export const shakeAt = (time: number, t0: number, amp: number): { x: number; y: number } => {
  const dt = time - t0;
  if (dt < 0 || dt > 0.65) return { x: 0, y: 0 };
  const d = Math.exp(-dt * 7);
  return {
    x: Math.sin(dt * 36) * amp * d,
    y: Math.cos(dt * 29) * amp * 0.6 * d,
  };
};

export const sumShake = (time: number, triggers: number[], amp: number) => {
  let x = 0;
  let y = 0;
  for (const t0 of triggers) {
    const s = shakeAt(time, t0, amp);
    x += s.x;
    y += s.y;
  }
  return { x, y };
};

// Short flash (0→peak→0) after a trigger time.
export const flashAt = (time: number, t0: number, peak = 0.45): number => {
  const dt = time - t0;
  if (dt < 0 || dt > 0.4) return 0;
  return peak * Math.exp(-dt * 11);
};
