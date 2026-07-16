import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg } from "../components/Bg";
import { Chat } from "../components/Chat";
import { FixAndCta } from "../components/FixAndCta";
import { Keycap } from "../components/Keycap";
import { SfxTrack, imeCues } from "../components/SfxTrack";
import { Stamp } from "../components/Stamp";
import { buildTypingEvents, stateAt } from "../lib/ime";
import { COLORS, JP_FONT, MONO_FONT, flashAt, sumShake } from "../theme";

const HERO_END = 3.6;
const MEANING_END = 9.6;
const CHAOS_END = 16.2;

const EVENTS = buildTypingEvents({
  start: 11.2,
  keyInterval: 0.09,
  convertGap: 0.4,
  confirmGap: 0.5,
  chunkGap: 0.85,
});
// confirm1 ≈ 12.64, confirm2 ≈ 14.93 → keep inside CHAOS scene
const FIRES = EVENTS.filter((e) => e.kind === "confirm").map((e) => e.t);
const BOSS = [{ text: "??", t: 15.35 }];

const Hero: React.FC<{ t: number }> = ({ t }) => {
  const l1 = interpolate(t, [0.2, 0.65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s1 = interpolate(t, [0.2, 0.7], [0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const l2 = interpolate(t, [1.15, 1.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [HERO_END - 0.35, HERO_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: JP_FONT, textAlign: "center", opacity: exit }}>
      <div style={{ fontSize: 152, fontWeight: 900, color: COLORS.text, opacity: l1, scale: String(s1), lineHeight: 1.12, width: 1700 }}>
        Your Enter key is <span style={{ color: COLORS.blue }}>bilingual</span>.
      </div>
      <div style={{ fontSize: 78, fontWeight: 700, color: COLORS.dim, marginTop: 40, opacity: l2 }}>
        In Japanese, Chinese and Korean input, it doesn’t mean “send”.
      </div>
    </AbsoluteFill>
  );
};

const Meaning: React.FC<{ t: number }> = ({ t }) => {
  const ease = Easing.out(Easing.cubic);
  const enter = interpolate(t, [HERO_END, HERO_END + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [MEANING_END - 0.35, MEANING_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1 = interpolate(t, [3.7, 4.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c1x = interpolate(t, [3.7, 4.2], [-70, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const c2 = interpolate(t, [4.1, 4.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const c2x = interpolate(t, [4.1, 4.6], [70, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const stripOp = interpolate(t, [5.7, 6.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stripRise = interpolate(t, [5.7, 6.2], [46, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  const card = (opacity: number, x: number, border: string): React.CSSProperties => ({
    opacity,
    translate: `${x}px 0`,
    width: 780,
    height: 470,
    borderRadius: 32,
    border: `5px solid ${border}`,
    background: COLORS.cardBg,
    padding: "30px 40px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 18,
  });

  const chip = (text: string, style: React.CSSProperties = {}): React.ReactNode => (
    <div
      style={{
        fontSize: 58,
        fontWeight: 700,
        color: "#111",
        background: "#fff",
        borderRadius: 16,
        padding: "10px 30px",
        whiteSpace: "nowrap",
        ...style,
      }}
      lang="ja"
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{ fontFamily: JP_FONT, opacity: enter * exit }}>
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 88 }}>
        <div style={card(c1, c1x, "rgba(255,255,255,0.4)")}>
          <div style={{ fontSize: 62, fontWeight: 700, color: COLORS.dim, whiteSpace: "nowrap" }}>For you</div>
          <div style={{ fontSize: 118, fontWeight: 900, color: COLORS.text, lineHeight: 1.1, whiteSpace: "nowrap" }}>SEND ⏎</div>
        </div>
        <div style={card(c2, c2x, COLORS.blue)}>
          <div style={{ fontSize: 62, fontWeight: 700, color: COLORS.dim, whiteSpace: "nowrap" }}>For IME users</div>
          <div style={{ fontSize: 52, fontWeight: 700, color: COLORS.dim, whiteSpace: "nowrap" }} lang="ja">
            日本語・中文・한국어
          </div>
          <div style={{ fontSize: 118, fontWeight: 900, color: COLORS.blue, lineHeight: 1.1, whiteSpace: "nowrap" }}>CONFIRM ⏎</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 690, left: 0, right: 0, opacity: stripOp, translate: `0 ${stripRise}px` }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
          {chip("あす", { borderBottom: `6px dotted ${COLORS.composing}` })}
          <Keycap label="Space" size={38} accent={COLORS.blue} />
          {chip("明日", { background: COLORS.convertBg })}
          <Keycap label="⏎" size={38} accent={COLORS.blue} minWidth={96} />
          {chip("confirmed ✓", { background: COLORS.greenSoft, color: COLORS.greenText, fontFamily: JP_FONT })}
        </div>
        <div style={{ textAlign: "center", marginTop: 34 }}>
          <div style={{ fontSize: 64, fontWeight: 700, color: COLORS.text }}>That Enter confirms the kanji — nothing is sent.</div>
          <div style={{ fontSize: 48, fontWeight: 700, color: COLORS.dim, marginTop: 8 }}>
            (typing “asu” → あす, Space converts it to 明日 “tomorrow”)
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Chaos: React.FC<{ t: number }> = ({ t }) => {
  const state = stateAt(EVENTS, t, "broken");
  const shake = sumShake(t, FIRES, 16);
  const enter = interpolate(t, [MEANING_END, MEANING_END + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [CHAOS_END - 0.35, CHAOS_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headOp = interpolate(t, [9.75, 10.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const codeOp = interpolate(t, [10.25, 10.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const codeScale = interpolate(t, [10.25, 10.65], [1.35, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flash = FIRES.reduce((a, f) => a + flashAt(t, f, 0.32), 0);
  return (
    <AbsoluteFill style={{ fontFamily: JP_FONT, opacity: enter * exit }}>
      <div style={{ position: "absolute", top: 90, left: 0, right: 0, textAlign: "center", opacity: headOp }}>
        <div style={{ fontSize: 92, fontWeight: 900, color: COLORS.text }}>But your handler says:</div>
      </div>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            opacity: codeOp,
            scale: String(codeScale),
            background: "#1a1114",
            border: `5px solid ${COLORS.red}`,
            borderRadius: 24,
            padding: "30px 60px",
            fontFamily: MONO_FONT,
            fontSize: 78,
            fontWeight: 700,
            color: "#ffb3bc",
            whiteSpace: "nowrap",
          }}
        >
          {'if (e.key === "Enter") send();'}
        </div>
      </div>
      <div style={{ position: "absolute", left: 560 + shake.x, top: 450 + shake.y }}>
        <Chat
          state={state}
          time={t}
          width={800}
          height={560}
          title="My boss"
          subtitle="online"
          accent={COLORS.redDeep}
          fontSize={52}
          theirMessages={BOSS}
        />
      </div>
      <Stamp
        text="I WASN'T DONE!"
        time={t}
        t0={FIRES[1] ?? 14.93}
        hold={1.25}
        color={COLORS.red}
        fontSize={108}
        x={480}
        y={560}
        rotate={-6}
      />
      <AbsoluteFill style={{ background: COLORS.red, opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const EnterLie: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sec = (s: number) => Math.round(s * fps);

  return (
    <Bg>
      {t < HERO_END ? <Hero t={t} /> : null}
      {t >= HERO_END - 0.1 && t < MEANING_END ? <Meaning t={t} /> : null}
      {t >= MEANING_END - 0.1 && t < CHAOS_END ? <Chaos t={t} /> : null}
      <Sequence from={sec(CHAOS_END)}>
        <FixAndCta headline="One line protects 1.5B people." sub="Everyone who types with an IME — Japanese, Chinese, Korean and more." />
      </Sequence>
      <Audio loop src={staticFile("sfx/pad.wav")} volume={0.6} />
      <SfxTrack cues={imeCues(EVENTS)} />
      {[HERO_END, MEANING_END, CHAOS_END].map((s, i) => (
        <Sequence key={i} from={sec(s - 0.12)}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.4} />
        </Sequence>
      ))}
      {BOSS.map((b, i) => (
        <Sequence key={`b${i}`} from={sec(b.t)}>
          <Audio src={staticFile("sfx/convert.wav")} volume={0.3} />
        </Sequence>
      ))}
    </Bg>
  );
};
