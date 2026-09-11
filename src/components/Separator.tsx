import React from "react";
import { COLORS } from "../CONSTANTS/colors";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  thickness?: number;
  color?: string;
  margin?: string | number;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  thickness = 1,
  color = COLORS.GRAPHITE_500,
  margin = "12px",
}) => {
  const isHorizontal = orientation === "horizontal";

  const style: React.CSSProperties = {
    backgroundColor: color,
    width: isHorizontal ? "100%" : `${thickness}px`,
    height: isHorizontal ? `${thickness}px` : "100%",
    margin: isHorizontal ? `${margin} 0` : `0 ${margin}`,
    flexShrink: 0,
  };

  return <div style={style} role="separator" />;
};
