import React from "react";
import { COLORS } from "../CONSTANTS/colors";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = COLORS.SOLDER_COPPER,
  className,
}) => {
  const sizes = {
    sm: "14px",
    md: "20px",
    lg: "28px",
  };

  const dimension = sizes[size];

  return (
    <div
      className={className}
      style={{
        width: dimension,
        height: dimension,
        border: `2px solid ${color}33`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        display: "inline-block",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
