import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import type { ImeEvent } from "../lib/ime";

type Cue = { t: number; src: string; volume: number };

// Sound cues derived from an IME event script.
export const imeCues = (
  events: ImeEvent[],
  opts: { brokenFires?: boolean; fixedSend?: boolean } = {},
): Cue[] => {
  const cues: Cue[] = [];
  for (const e of events) {
    if (e.kind === "key") cues.push({ t: e.t, src: "sfx/key.wav", volume: 0.55 });
    else if (e.kind === "convert") cues.push({ t: e.t, src: "sfx/convert.wav", volume: 0.6 });
    else if (e.kind === "confirm" && opts.brokenFires !== false) {
      cues.push({ t: e.t, src: "sfx/error.wav", volume: 0.85 });
      cues.push({ t: e.t, src: "sfx/whoosh.wav", volume: 0.45 });
    } else if (e.kind === "send" && opts.fixedSend) {
      cues.push({ t: e.t, src: "sfx/chime.wav", volume: 0.75 });
    }
  }
  return cues;
};

export const SfxTrack: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <>
      {cues
        .filter((c) => Math.round(c.t * fps) < durationInFrames - 2)
        .map((c, i) => (
          <Sequence key={i} from={Math.round(c.t * fps)}>
            <Audio src={staticFile(c.src)} volume={c.volume} />
          </Sequence>
        ))}
    </>
  );
};
