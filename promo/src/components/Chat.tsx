import React from "react";
import { Easing, interpolate } from "remotion";
import { COLORS, JP_FONT } from "../theme";
import type { ImeState } from "../lib/ime";

export type TheirMsg = { text: string; t: number };

const Bubble: React.FC<{
  text: string;
  time: number;
  t: number;
  premature?: boolean;
  ok?: boolean;
  them?: boolean;
  fontSize: number;
  badge?: string;
}> = ({ text, time, t, premature, ok, them, fontSize, badge }) => {
  const pop = interpolate(time - t, [0, 0.22], [0.5, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(1.8)),
  });
  const op = interpolate(time - t, [0, 0.12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bg = them ? "#eceff2" : premature ? COLORS.redSoft : ok ? COLORS.greenSoft : "#d4ecff";
  const border = them ? "#d3d8dd" : premature ? "#f1a3ad" : ok ? "#9fd9b4" : "#a8d4f5";
  return (
    <div
      style={{
        alignSelf: them ? "flex-start" : "flex-end",
        maxWidth: "88%",
        opacity: op,
        scale: String(pop),
        background: bg,
        border: `3px solid ${border}`,
        borderRadius: them ? "26px 26px 26px 6px" : "26px 26px 6px 26px",
        padding: `${fontSize * 0.28}px ${fontSize * 0.5}px`,
      }}
    >
      <div style={{ fontSize, lineHeight: 1.25, color: COLORS.chatText, fontWeight: 500 }} lang="ja">
        {text}
      </div>
      {badge ? (
        <div
          style={{
            fontSize: fontSize * 0.62,
            fontWeight: 700,
            marginTop: 6,
            color: premature ? COLORS.redText : COLORS.greenText,
          }}
        >
          {badge}
        </div>
      ) : null}
    </div>
  );
};

export const Chat: React.FC<{
  state: ImeState;
  time: number;
  width: number;
  height: number;
  title: string;
  subtitle?: string;
  accent: string;
  fontSize?: number;
  theirMessages?: TheirMsg[];
  showBadges?: boolean;
  placeholder?: string;
}> = ({
  state,
  time,
  width,
  height,
  title,
  subtitle,
  accent,
  fontSize = 64,
  theirMessages = [],
  showBadges = true,
  placeholder = "Type a message…",
}) => {
  const items: Array<
    | { kind: "mine"; text: string; premature: boolean; t: number }
    | { kind: "theirs"; text: string; t: number }
  > = [
    ...state.messages.map((m) => ({ kind: "mine" as const, text: m.text, premature: m.premature, t: m.t })),
    ...theirMessages.filter((m) => m.t <= time).map((m) => ({ kind: "theirs" as const, text: m.text, t: m.t })),
  ].sort((a, b) => a.t - b.t);

  const visible = items.slice(-4);
  const inputFs = fontSize * 0.94;

  return (
    <div
      style={{
        width,
        height,
        background: COLORS.chatBg,
        borderRadius: 34,
        border: `4px solid rgba(255,255,255,0.25)`,
        borderTop: `14px solid ${accent}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: JP_FONT,
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          padding: `${fontSize * 0.28}px ${fontSize * 0.5}px`,
          borderBottom: "3px solid #e8eaed",
          display: "flex",
          alignItems: "baseline",
          gap: 18,
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: fontSize * 0.85, fontWeight: 900, color: "#111" }}>{title}</div>
        {subtitle ? (
          <div style={{ fontSize: fontSize * 0.55, fontWeight: 500, color: "#5b6570", minWidth: 0 }}>{subtitle}</div>
        ) : null}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          gap: fontSize * 0.32,
          padding: `${fontSize * 0.35}px ${fontSize * 0.45}px`,
        }}
      >
        {visible.map((m, i) =>
          m.kind === "theirs" ? (
            <Bubble key={`t${i}`} them text={m.text} time={time} t={m.t} fontSize={fontSize} />
          ) : (
            <Bubble
              key={`m${i}`}
              text={m.text}
              time={time}
              t={m.t}
              premature={m.premature}
              ok={!m.premature}
              fontSize={fontSize}
              badge={showBadges ? (m.premature ? "✗ sent mid-sentence" : "✓ complete") : undefined}
            />
          ),
        )}
      </div>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: 18,
          alignItems: "center",
          padding: `${fontSize * 0.3}px ${fontSize * 0.45}px`,
          borderTop: "3px solid #e8eaed",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: inputFs * 1.7,
            border: "3px solid #c9ced4",
            borderRadius: 20,
            padding: `${inputFs * 0.16}px ${inputFs * 0.35}px`,
            fontSize: inputFs,
            lineHeight: 1.35,
            color: COLORS.chatText,
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          lang="ja"
        >
          {state.committed || state.composing ? (
            <>
              <span>{state.committed}</span>
              {state.composing ? (
                <span
                  style={
                    state.converted
                      ? { background: COLORS.convertBg, borderRadius: 6 }
                      : { borderBottom: `5px dotted ${COLORS.composing}`, paddingBottom: 2 }
                  }
                >
                  {state.composing}
                </span>
              ) : null}
            </>
          ) : (
            <span style={{ color: "#9aa4ad", fontSize: inputFs * 0.8 }}>{placeholder}</span>
          )}
        </div>
        <div
          style={{
            flexShrink: 0,
            background: accent,
            color: "#fff",
            fontWeight: 700,
            fontSize: inputFs * 0.72,
            borderRadius: 18,
            padding: `${inputFs * 0.28}px ${inputFs * 0.55}px`,
          }}
        >
          Send
        </div>
      </div>
    </div>
  );
};
