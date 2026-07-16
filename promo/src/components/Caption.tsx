import React from "react";
import { Easing, interpolate } from "remotion";
import { COLORS, JP_FONT, TYPE } from "../theme";

// Trapezoid-faded caption: one main line + optional dim sub line (both English).
export const Caption: React.FC<{
  en: string;
  sub?: string;
  time: number;
  from: number;
  to: number;
  enSize?: number;
  subSize?: number;
  color?: string;
}> = ({ en, sub, time, from, to, enSize = TYPE.caption, subSize = TYPE.captionJp, color = COLORS.text }) => {
  if (time < from || time > to) return null;
  const op = interpolate(time, [from, from + 0.28, to - 0.28, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(time, [from, from + 0.32], [26, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div
      style={{
        opacity: op,
        translate: `0 ${rise}px`,
        textAlign: "center",
        fontFamily: JP_FONT,
        width: "100%",
      }}
    >
      <div style={{ fontSize: enSize, fontWeight: 900, lineHeight: 1.12, color }}>{en}</div>
      {sub ? (
        <div style={{ fontSize: subSize, fontWeight: 700, lineHeight: 1.2, color: COLORS.dim, marginTop: 10 }}>{sub}</div>
      ) : null}
    </div>
  );
};
