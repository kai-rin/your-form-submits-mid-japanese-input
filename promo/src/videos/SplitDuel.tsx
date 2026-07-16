import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg } from "../components/Bg";
import { Chat } from "../components/Chat";
import { FixAndCta } from "../components/FixAndCta";
import { Keycap } from "../components/Keycap";
import { SfxTrack, imeCues } from "../components/SfxTrack";
import { Stamp } from "../components/Stamp";
import { FULL_SENTENCE, buildTypingEvents, sendTime, stateAt } from "../lib/ime";
import { COLORS, JP_FONT, flashAt, sumShake } from "../theme";

const EVENTS = buildTypingEvents({
  start: 4.4,
  keyInterval: 0.2,
  convertGap: 1.0,
  confirmGap: 1.5,
  chunkGap: 2.2,
  sendGap: 1.8,
});
// confirm1 ≈ 8.1, confirm2 ≈ 14.0, send ≈ 15.8
const FIRE1 = 8.1;
const FIRE2 = 14.0;
const SEND = sendTime(EVENTS)!;

const SPLASH_END = 3.4;
const DUEL_END = 20.0;
const SCORE_END = 24.4;

const Splash: React.FC<{ t: number }> = ({ t }) => {
  const ease = Easing.out(Easing.cubic);
  const l1 = interpolate(t, [0.15, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s1 = interpolate(t, [0.15, 0.6], [0.86, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const l2 = interpolate(t, [0.7, 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l3 = interpolate(t, [1.3, 1.75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [SPLASH_END - 0.35, SPLASH_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: JP_FONT, textAlign: "center", opacity: exit }}>
      <div style={{ fontSize: 172, fontWeight: 900, color: COLORS.text, opacity: l1, scale: String(s1), lineHeight: 1.05 }}>
        SAME KEYSTROKES.
      </div>
      <div style={{ fontSize: 172, fontWeight: 900, color: COLORS.blue, opacity: l2, lineHeight: 1.05 }}>TWO FORMS.</div>
      <div style={{ fontSize: 78, fontWeight: 700, color: COLORS.dim, marginTop: 36, opacity: l3 }}>
        One naive handler. One that checks isComposing.
      </div>
    </AbsoluteFill>
  );
};

const Banner: React.FC<{ t: number; from: number; to: number; en: string; sub?: string; color?: string }> = ({
  t,
  from,
  to,
  en,
  sub,
  color = COLORS.text,
}) => {
  if (t < from || t > to) return null;
  const op = interpolate(t, [from, from + 0.25, to - 0.25, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          opacity: op,
          background: "rgba(8,14,22,0.88)",
          border: `4px solid ${color === COLORS.text ? COLORS.accent : color}`,
          borderRadius: 28,
          padding: "36px 74px",
          textAlign: "center",
          fontFamily: JP_FONT,
          maxWidth: 1700,
        }}
      >
        <div style={{ fontSize: 92, fontWeight: 900, color, lineHeight: 1.12, whiteSpace: "nowrap" }}>{en}</div>
        {sub ? (
          <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.dim, marginTop: 10, whiteSpace: "nowrap" }}>{sub}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const Duel: React.FC<{ t: number }> = ({ t }) => {
  const broken = stateAt(EVENTS, t, "broken");
  const fixed = stateAt(EVENTS, t, "fixed");
  const shake = sumShake(t, [FIRE1, FIRE2], 15);
  const enter = interpolate(t, [SPLASH_END, SPLASH_END + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [DUEL_END - 0.35, DUEL_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = flashAt(t, FIRE1, 0.3) + flashAt(t, FIRE2, 0.3);
  const greenGlow = flashAt(t, SEND, 0.35);

  // keycap pressed states around events
  const near = (times: number[]) => times.some((et) => t >= et - 0.04 && t <= et + 0.24);
  const spacePressed = near(EVENTS.filter((e) => e.kind === "convert").map((e) => e.t));
  const enterPressed = near(EVENTS.filter((e) => e.kind === "confirm" || e.kind === "send").map((e) => e.t));

  const preview = fixed.committed + (fixed.composing || "");

  return (
    <AbsoluteFill style={{ opacity: enter * exit, fontFamily: JP_FONT }}>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 96,
          right: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 60,
        }}
      >
        <div
          style={{
            minWidth: 900,
            maxWidth: 1150,
            minHeight: 130,
            border: `4px solid ${COLORS.cardBorder}`,
            background: COLORS.cardBg,
            borderRadius: 24,
            padding: "18px 42px",
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          <div style={{ fontSize: 46, fontWeight: 700, color: COLORS.dim, flexShrink: 0 }}>IME</div>
          <div style={{ fontSize: 84, fontWeight: 700, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden" }} lang="ja">
            {preview ? (
              <span
                style={
                  fixed.converted
                    ? { background: "rgba(127,212,255,0.35)", borderRadius: 8 }
                    : fixed.composing
                      ? { borderBottom: `6px dotted ${COLORS.dim}` }
                      : {}
                }
              >
                {preview}
              </span>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 60 }}>…</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, flexShrink: 0 }}>
          <Keycap label="Space" size={52} pressed={spacePressed} accent={COLORS.blue} />
          <Keycap label="⏎" size={52} pressed={enterPressed} accent={COLORS.red} minWidth={120} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 96 + shake.x, top: 370 + shake.y }}>
        <Chat
          state={broken}
          time={t}
          width={820}
          height={620}
          title="❌ Naive form"
          subtitle="sends on every Enter"
          accent={COLORS.redDeep}
          fontSize={56}
        />
      </div>
      <div style={{ position: "absolute", left: 1004, top: 370 }}>
        <Chat
          state={fixed}
          time={t}
          width={820}
          height={620}
          title="✅ Fixed form"
          subtitle="checks isComposing"
          accent={COLORS.greenDeep}
          fontSize={56}
        />
      </div>

      <Stamp text="✗ SENT" time={t} t0={FIRE1} hold={1.9} color={COLORS.red} fontSize={104} x={300} y={430} rotate={-10} />
      <Stamp text="✗ SENT AGAIN" time={t} t0={FIRE2} hold={1.6} color={COLORS.red} fontSize={92} x={200} y={430} rotate={-8} />
      <Stamp text="✓ PERFECT" time={t} t0={SEND} hold={2.4} color={COLORS.green} fontSize={104} x={1240} y={760} rotate={7} />

      <Banner t={t} from={8.25} to={10.15} en="That Enter = CONFIRM, not send" sub="the user just picked their kanji" color={COLORS.red} />
      <Banner t={t} from={16.3} to={18.15} en="This Enter = the real send" sub="composition is over — now Enter means send" color={COLORS.green} />
      <Banner t={t} from={18.35} to={19.85} en="Same keys. Opposite fate." />

      <div
        style={{
          position: "absolute",
          left: 96,
          top: 370,
          width: 820,
          height: 620,
          borderRadius: 34,
          background: COLORS.red,
          opacity: flash,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1004,
          top: 370,
          width: 820,
          height: 620,
          borderRadius: 34,
          background: COLORS.green,
          opacity: greenGlow,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

const Score: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - DUEL_END;
  const ease = Easing.out(Easing.cubic);
  const c1 = interpolate(lt, [0.05, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1s = interpolate(lt, [0.05, 0.55], [0.88, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const c2 = interpolate(lt, [0.4, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c2s = interpolate(lt, [0.4, 0.9], [0.88, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const exit = interpolate(t, [SCORE_END - 0.35, SCORE_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = (opacity: number, scale: number, border: string): React.CSSProperties => ({
    opacity,
    scale: String(scale),
    width: 800,
    height: 560,
    borderRadius: 34,
    border: `6px solid ${border}`,
    background: "rgba(8,14,22,0.75)",
    padding: "40px 40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", fontFamily: JP_FONT, opacity: exit, flexDirection: "row", gap: 84 }}
    >
      <div style={card(c1, c1s, COLORS.red)}>
        <div style={{ fontSize: 224, fontWeight: 900, color: COLORS.red, lineHeight: 1 }}>2</div>
        <div style={{ fontSize: 76, fontWeight: 900, color: COLORS.text }}>fragments ✗</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: COLORS.dim, marginTop: 14 }}>the sentence never arrived</div>
      </div>
      <div style={card(c2, c2s, COLORS.green)}>
        <div style={{ fontSize: 224, fontWeight: 900, color: COLORS.green, lineHeight: 1 }}>1</div>
        <div style={{ fontSize: 66, fontWeight: 900, color: COLORS.text, whiteSpace: "nowrap" }}>complete message ✓</div>
        <div style={{ fontSize: 54, fontWeight: 700, color: COLORS.dim, marginTop: 14 }} lang="ja">
          {FULL_SENTENCE}
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.dim, marginTop: 6, fontStyle: "italic" }}>
          “Tomorrow’s meeting starts at 10.”
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SplitDuel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sec = (s: number) => Math.round(s * fps);

  return (
    <Bg>
      {t < SPLASH_END ? <Splash t={t} /> : null}
      {t >= SPLASH_END - 0.1 && t < DUEL_END ? <Duel t={t} /> : null}
      {t >= DUEL_END - 0.1 && t < SCORE_END ? <Score t={t} /> : null}
      <Sequence from={sec(SCORE_END)}>
        <FixAndCta />
      </Sequence>
      <Audio src={staticFile("bgm/split-duel.wav")} volume={0.9} />
      <SfxTrack cues={imeCues(EVENTS, { fixedSend: true })} />
      {[FIRE1, FIRE2, SEND].map((s, i) => (
        <Sequence key={`th${i}`} from={sec(s)}>
          <Audio src={staticFile("sfx/thud.wav")} volume={0.5} />
        </Sequence>
      ))}
      {[SPLASH_END, DUEL_END, SCORE_END].map((s, i) => (
        <Sequence key={i} from={sec(s - 0.12)}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
        </Sequence>
      ))}
    </Bg>
  );
};
