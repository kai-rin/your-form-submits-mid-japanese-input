import React from "react";
import { COLORS, MONO_FONT } from "../theme";

export const Keycap: React.FC<{
  label: string;
  size?: number;
  pressed?: boolean;
  accent?: string;
  minWidth?: number;
}> = ({ label, size = 72, pressed = false, accent, minWidth }) => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: minWidth ?? size * 2,
        padding: `${size * 0.22}px ${size * 0.42}px`,
        borderRadius: size * 0.24,
        border: `4px solid ${accent ?? "rgba(255,255,255,0.45)"}`,
        borderBottomWidth: pressed ? 4 : 10,
        translate: pressed ? "0 6px" : "0 0",
        background: pressed ? (accent ?? COLORS.blue) : "rgba(255,255,255,0.10)",
        color: pressed ? "#08121c" : COLORS.text,
        fontFamily: MONO_FONT,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1,
      }}
    >
      {label}
    </div>
  );
};
