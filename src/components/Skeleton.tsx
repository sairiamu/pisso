import React from "react";
import { COLORS } from "../CONSTANTS/colors";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "20px",
  variant = "rectangular",
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    backgroundColor: COLORS.GRAPHITE_500,
    width,
    height,
    borderRadius: variant === "circular" ? "50%" : variant === "text" ? "4px" : "8px",
    position: "relative",
    overflow: "hidden",
    opacity: 0.3,
    animation: "pulse 1.5s ease-in-out infinite",
    ...style,
  };

  return (
    <div style={baseStyle}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.3; }
            50% { opacity: 0.5; }
            100% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
};
