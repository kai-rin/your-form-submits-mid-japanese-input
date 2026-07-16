import React from "react";
import { Easing, interpolate } from "remotion";
import { COLORS, JP_FONT, TYPE } from "../theme";

// Trapezoid-faded bilingual caption. Positioned by the parent via wrapper.
export const Caption: React.FC<{
  en?: string;
  jp?: string;
  time: number;
  from: number;
  to: number;
  enSize?: number;
  jpSize?: number;
  color?: string;
  jpFirst?: boolean;
}> = ({ en, jp, time, from, to, enSize = TYPE.caption, jpSize = TYPE.captionJp, color = COLORS.text, jpFirst = false }) => {
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
  const enEl = en ? (
    <div style={{ fontSize: enSize, fontWeight: 900, lineHeight: 1.12, color }}>{en}</div>
  ) : null;
  const jpEl = jp ? (
    <div style={{ fontSize: jpSize, fontWeight: 700, lineHeight: 1.2, color: COLORS.dim, marginTop: 10 }} lang="ja">
      {jp}
    </div>
  ) : null;
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
      {jpFirst ? (
        <>
          {jp ? (
            <div style={{ fontSize: enSize, fontWeight: 900, lineHeight: 1.12, color }} lang="ja">
              {jp}
            </div>
          ) : null}
          {en ? (
            <div style={{ fontSize: jpSize, fontWeight: 700, lineHeight: 1.2, color: COLORS.dim, marginTop: 10 }}>
              {en}
            </div>
          ) : null}
        </>
      ) : (
        <>
          {enEl}
          {jpEl}
        </>
      )}
    </div>
  );
};
