import React from "react";
import { Composition } from "remotion";
import { PovRage } from "./videos/PovRage";
import { SplitDuel } from "./videos/SplitDuel";
import { EnterLie } from "./videos/EnterLie";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PovRage" component={PovRage} durationInFrames={24 * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="SplitDuel" component={SplitDuel} durationInFrames={26 * FPS} fps={FPS} width={1920} height={1080} />
      <Composition id="EnterLie" component={EnterLie} durationInFrames={22 * FPS} fps={FPS} width={1920} height={1080} />
    </>
  );
};
