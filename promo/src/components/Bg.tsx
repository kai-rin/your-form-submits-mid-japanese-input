import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS } from "../theme";

export const Bg: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.bg2} 0%, ${COLORS.bg1} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 42%, rgba(127,212,255,0.07) 0%, rgba(0,0,0,0) 60%)",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 340px rgba(0,0,0,0.55)",
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
