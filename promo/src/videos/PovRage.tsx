import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Bg } from "../components/Bg";
import { Caption } from "../components/Caption";
import { Chat } from "../components/Chat";
import { FixAndCta } from "../components/FixAndCta";
import { SfxTrack, imeCues } from "../components/SfxTrack";
import { Stamp } from "../components/Stamp";
import { buildTypingEvents, stateAt } from "../lib/ime";
import { COLORS, JP_FONT, flashAt, sumShake } from "../theme";

const EVENTS = buildTypingEvents({
  start: 4.6,
  keyInterval: 0.21,
  convertGap: 0.8,
  confirmGap: 1.3,
  chunkGap: 2.8,
});
// fires: confirm1 ≈ 7.96s, confirm2 ≈ 14.12s
const FIRE1 = 7.96;
const FIRE2 = 14.12;
const BOSS = [
  { text: "??", t: 9.4 },
  { text: "???", t: 15.5 },
];

const HOOK_END = 3.6;
const TYPING_END = 20.4;
const REVEAL_END = 24.6;

const Hook: React.FC<{ t: number }> = ({ t }) => {
  const ease = Easing.out(Easing.cubic);
  const l1 = interpolate(t, [0.2, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l2 = interpolate(t, [0.55, 1.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l2s = interpolate(t, [0.55, 1.05], [0.85, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const l3 = interpolate(t, [1.25, 1.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [HOOK_END - 0.35, HOOK_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: JP_FONT, opacity: exit, textAlign: "center" }}>
      <div style={{ fontSize: 104, fontWeight: 700, color: COLORS.dim, opacity: l1 }}>Watch me try to send</div>
      <div style={{ fontSize: 196, fontWeight: 900, color: COLORS.text, lineHeight: 1.08, opacity: l2, scale: String(l2s) }}>
        ONE sentence.
      </div>
      <div style={{ fontSize: 84, fontWeight: 700, color: COLORS.blue, marginTop: 34, opacity: l3 }}>
        as a Japanese user — in your web app.
      </div>
    </AbsoluteFill>
  );
};

const Typing: React.FC<{ t: number }> = ({ t }) => {
  const state = stateAt(EVENTS, t, "broken");
  const shake = sumShake(t, [FIRE1], 13);
  const shake2 = sumShake(t, [FIRE2], 22);
  const enter = interpolate(t, [HOOK_END, HOOK_END + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = interpolate(t, [HOOK_END, HOOK_END + 0.5], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(t, [TYPING_END - 0.35, TYPING_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = flashAt(t, FIRE1, 0.32) + flashAt(t, FIRE2, 0.42);
  return (
    <AbsoluteFill style={{ opacity: enter * exit }}>
      <div style={{ position: "absolute", top: 96, left: 96, right: 96 }}>
        <Caption time={t} from={4.0} to={6.5} en="Typing the reading…" sub="romaji becomes hiragana as you type" />
        <Caption time={t} from={6.55} to={7.9} en="Space picks the kanji. Enter confirms it." />
        <Caption time={t} from={8.05} to={10.4} en="IT SENT?!" sub="that Enter only meant “yes, this kanji”" enSize={132} color={COLORS.red} />
        <Caption time={t} from={10.7} to={12.7} en="Deep breath. The second half…" />
        <Caption time={t} from={14.35} to={16.5} en="Every. Single. Sentence." enSize={120} color={COLORS.red} />
        <Caption time={t} from={16.9} to={20.1} en="2 fragments sent. 0 sentences finished." />
      </div>
      <div
        style={{
          position: "absolute",
          left: 500 + shake.x + shake2.x,
          top: 350 + shake.y + shake2.y,
          translate: `0 ${rise}px`,
        }}
      >
        <Chat
          state={state}
          time={t}
          width={920}
          height={650}
          title="My boss"
          subtitle="online"
          accent={COLORS.redDeep}
          theirMessages={BOSS}
        />
      </div>
      <Stamp text="SENT ✗" time={t} t0={FIRE1} hold={2.1} color={COLORS.red} fontSize={140} x={1140} y={430} rotate={-9} />
      <Stamp
        text="I WASN'T DONE!!"
        time={t}
        t0={FIRE2}
        hold={2.6}
        color={COLORS.red}
        fontSize={118}
        x={370}
        y={520}
        rotate={-6}
      />
      <AbsoluteFill style={{ background: COLORS.red, opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const lt = t - TYPING_END;
  const op = interpolate(lt, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rise = interpolate(lt, [0, 0.5], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const jp = interpolate(lt, [0.8, 1.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(t, [REVEAL_END - 0.35, REVEAL_END], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", fontFamily: JP_FONT, textAlign: "center", opacity: op * exit }}
    >
      <div style={{ translate: `0 ${rise}px`, width: 1660 }}>
        <div style={{ fontSize: 122, fontWeight: 900, color: COLORS.text, lineHeight: 1.22 }}>
          That Enter never meant “send”.
        </div>
        <div style={{ fontSize: 122, fontWeight: 900, color: COLORS.blue, lineHeight: 1.22 }}>
          It meant “yes, that’s the right kanji”.
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, color: COLORS.dim, marginTop: 44, opacity: jp }}>
          The Enter key does double duty in Japanese, Chinese and Korean input.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PovRage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sec = (s: number) => Math.round(s * fps);

  return (
    <Bg>
      {t < HOOK_END ? <Hook t={t} /> : null}
      {t >= HOOK_END - 0.1 && t < TYPING_END ? <Typing t={t} /> : null}
      {t >= TYPING_END - 0.1 && t < REVEAL_END ? <Reveal t={t} /> : null}
      <Sequence from={sec(REVEAL_END)}>
        <FixAndCta />
      </Sequence>
      <Audio src={staticFile("bgm/pov-rage.wav")} volume={0.9} />
      <SfxTrack cues={imeCues(EVENTS)} />
      {[FIRE1, FIRE2].map((s, i) => (
        <Sequence key={`th${i}`} from={sec(s)}>
          <Audio src={staticFile("sfx/thud.wav")} volume={0.55} />
        </Sequence>
      ))}
      {[HOOK_END, TYPING_END, REVEAL_END].map((s, i) => (
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
