// Shared IME typing model, mirroring the site's interactive demo.
export const CHUNKS = [
  {
    steps: ["あ", "あす", "あすの", "あすのか", "あすのかい", "あすのかいぎ", "あすのかいぎは"],
    converted: "明日の会議は",
  },
  {
    steps: ["1", "10", "10じ", "10じか", "10じから", "10じからで", "10じからです"],
    converted: "10時からです",
  },
];

export const FULL_SENTENCE = "明日の会議は10時からです";

export type ImeEvent = {
  t: number; // seconds
  kind: "key" | "convert" | "confirm" | "send";
  text?: string;
};

export type BuildOpts = {
  start: number;
  keyInterval: number;
  convertGap: number;
  confirmGap: number;
  chunkGap: number;
  sendGap?: number;
};

export const buildTypingEvents = (opts: BuildOpts): ImeEvent[] => {
  const ev: ImeEvent[] = [];
  let t = opts.start;
  CHUNKS.forEach((c, i) => {
    if (i > 0) t += opts.chunkGap;
    c.steps.forEach((s) => {
      ev.push({ t, kind: "key", text: s });
      t += opts.keyInterval;
    });
    t += opts.convertGap - opts.keyInterval;
    ev.push({ t, kind: "convert", text: c.converted });
    t += opts.confirmGap;
    ev.push({ t, kind: "confirm" });
  });
  if (opts.sendGap !== undefined) {
    t += opts.sendGap;
    ev.push({ t, kind: "send" });
  }
  return ev;
};

export type Msg = { text: string; premature: boolean; t: number };

export type ImeState = {
  committed: string;
  composing: string;
  converted: boolean;
  messages: Msg[];
  fireTimes: number[]; // premature fires (broken) or real send (fixed)
  done: boolean;
};

export const stateAt = (events: ImeEvent[], time: number, mode: "broken" | "fixed"): ImeState => {
  const s: ImeState = { committed: "", composing: "", converted: false, messages: [], fireTimes: [], done: false };
  for (const e of events) {
    if (e.t > time) break;
    if (e.kind === "key") {
      s.composing = e.text!;
      s.converted = false;
    } else if (e.kind === "convert") {
      s.composing = e.text!;
      s.converted = true;
    } else if (e.kind === "confirm") {
      if (mode === "broken") {
        s.messages.push({ text: s.committed + s.composing, premature: true, t: e.t });
        s.committed = "";
        s.fireTimes.push(e.t);
      } else {
        s.committed += s.composing;
      }
      s.composing = "";
      s.converted = false;
    } else if (e.kind === "send") {
      if (mode === "fixed" && s.committed) {
        s.messages.push({ text: s.committed, premature: false, t: e.t });
        s.committed = "";
        s.fireTimes.push(e.t);
      }
      s.done = true;
    }
  }
  return s;
};

export const confirmTimes = (events: ImeEvent[]): number[] =>
  events.filter((e) => e.kind === "confirm").map((e) => e.t);

export const sendTime = (events: ImeEvent[]): number | undefined =>
  events.find((e) => e.kind === "send")?.t;
