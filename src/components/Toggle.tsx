import React from "react";
import { COLORS } from "../CONSTANTS/colors";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, label }) => {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        gap: "10px",
        userSelect: "none",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: "36px",
          height: "20px",
          backgroundColor: checked ? COLORS.TRACE_GREEN : COLORS.GRAPHITE_500,
          borderRadius: "10px",
          position: "relative",
          transition: "background-color 0.2s ease",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            backgroundColor: COLORS.WARM_WHITE,
            borderRadius: "50%",
            position: "absolute",
            top: "3px",
            left: checked ? "19px" : "3px",
            transition: "left 0.2s ease",
            boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      {label && (
        <span style={{ color: COLORS.WARM_WHITE, fontSize: "14px", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </label>
  );
};
