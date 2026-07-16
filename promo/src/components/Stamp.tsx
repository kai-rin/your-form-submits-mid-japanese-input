import React from "react";
import { Easing, interpolate } from "remotion";
import { JP_FONT } from "../theme";

// Rotated rubber-stamp that slams in at time t0.
export const Stamp: React.FC<{
  text: string;
  time: number;
  t0: number;
  hold?: number;
  color: string;
  fontSize?: number;
  rotate?: number;
  x: number;
  y: number;
}> = ({ text, time, t0, hold = 2.2, color, fontSize = 150, rotate = -8, x, y }) => {
  const dt = time - t0;
  if (dt < 0 || dt > hold) return null;
  const scale = interpolate(dt, [0, 0.16], [2.2, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const op = interpolate(dt, [0, 0.1, hold - 0.35, hold], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        rotate: `${rotate}deg`,
        scale: String(scale),
        opacity: op,
        border: `10px solid ${color}`,
        borderRadius: 22,
        padding: "10px 44px",
        color,
        fontFamily: JP_FONT,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.15,
        whiteSpace: "nowrap",
        background: "rgba(10,16,24,0.72)",
        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
      lang="ja"
    >
      {text}
    </div>
  );
};
