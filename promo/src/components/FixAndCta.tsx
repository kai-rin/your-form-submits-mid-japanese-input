import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, JP_FONT, MONO_FONT } from "../theme";

// Shared final scene: the one-line fix + CTA with the site URL.
// Mount inside a <Sequence> so local frame starts at 0.
// Sized to fit 1080px height with margin: headline ~190 + code ~230 + cta ~330 + gaps.
export const FixAndCta: React.FC<{ headline?: string; sub?: string; tagline?: string }> = ({
  headline = "The fix is one line.",
  sub = "Works for Japanese, Chinese and Korean input alike.",
  tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const ease = Easing.out(Easing.cubic);
  const headOp = interpolate(t, [0.1, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headRise = interpolate(t, [0.1, 0.5], [34, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const codeOp = interpolate(t, [0.55, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const codeScale = interpolate(t, [0.55, 0.95], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const glow = interpolate(t, [0.9, 1.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaOp = interpolate(t, [1.5, 1.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ctaRise = interpolate(t, [1.5, 2.0], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const tagOp = interpolate(t, [4.6, 5.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: JP_FONT, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1720, display: "flex", flexDirection: "column", alignItems: "center", gap: 38 }}>
        <div style={{ opacity: headOp, translate: `0 ${headRise}px`, textAlign: "center" }}>
          <div style={{ fontSize: 112, fontWeight: 900, color: COLORS.text, lineHeight: 1.1, whiteSpace: "nowrap" }}>
            {headline}
          </div>
          <div style={{ fontSize: 54, fontWeight: 700, color: COLORS.dim, marginTop: 10, whiteSpace: "nowrap" }}>{sub}</div>
        </div>

        <div
          style={{
            opacity: codeOp,
            scale: String(codeScale),
            background: "#101a26",
            border: `4px solid ${COLORS.accent}`,
            borderRadius: 24,
            padding: "30px 56px",
            boxShadow: `0 0 ${60 * glow}px rgba(57,193,240,${0.35 * glow})`,
          }}
        >
          <div style={{ fontFamily: MONO_FONT, fontSize: 74, fontWeight: 700, color: COLORS.blue, whiteSpace: "nowrap" }}>
            <span style={{ color: "#c586c0" }}>if</span> (event.
            <span style={{ color: "#ffd479" }}>isComposing</span>) <span style={{ color: "#c586c0" }}>return</span>;
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 40, color: "#7d8b99", marginTop: 14, whiteSpace: "nowrap" }}>
            {"// + keyCode === 229 for Safari — details on the site"}
          </div>
        </div>

        <div
          style={{
            opacity: ctaOp,
            translate: `0 ${ctaRise}px`,
            background: "rgba(255,255,255,0.97)",
            borderRadius: 24,
            padding: "32px 62px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, color: "#39505f", whiteSpace: "nowrap" }}>
            Interactive demo — feel the bug yourself, no IME needed
          </div>
          <div
            style={{ fontFamily: MONO_FONT, fontSize: 92, fontWeight: 700, color: "#0d1520", marginTop: 10, lineHeight: 1.1, whiteSpace: "nowrap" }}
          >
            kai-rin.github.io
          </div>
          <div style={{ fontFamily: MONO_FONT, fontSize: 60, fontWeight: 400, color: "#31424f", lineHeight: 1.3, whiteSpace: "nowrap" }}>
            /your-form-submits-mid-japanese-input
          </div>
        </div>

        {tagline ? (
          <div style={{ opacity: tagOp, fontSize: 46, fontWeight: 700, color: COLORS.dim, whiteSpace: "nowrap" }}>{tagline}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
