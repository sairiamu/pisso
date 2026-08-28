import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export type AppMode = "design" | "code";

interface ModeSwitcherProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    backgroundColor: COLORS.GRAPHITE_900,
    borderRadius: "20px",
    padding: "2px",
    border: `1px solid ${COLORS.GRAPHITE_500}`,
    width: "fit-content",
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 16px",
    borderRadius: "18px",
    border: "none",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: TYPOGRAPHY.UI,
    fontWeight: 600,
    backgroundColor: active ? COLORS.GRAPHITE_500 : "transparent",
    color: active ? COLORS.WARM_WHITE : COLORS.FOG,
    transition: "all 0.2s ease",
  });

  return (
    <div style={containerStyle}>
      <button
        style={buttonStyle(mode === "design")}
        onClick={() => onModeChange("design")}
      >
        DESIGN
      </button>
      <button
        style={buttonStyle(mode === "code")}
        onClick={() => onModeChange("code")}
      >
        CODE
      </button>
    </div>
  );
};
