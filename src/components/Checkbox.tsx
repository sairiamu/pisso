import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, disabled, label, id }) => {
  const checkboxId = id || (label ? `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={checkboxId}
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
        style={{
          width: "18px",
          height: "18px",
          backgroundColor: checked ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_900,
          border: `1px solid ${checked ? COLORS.SOLDER_COPPER : COLORS.GRAPHITE_500}`,
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          style={{ display: "none" }}
        />
        {checked && <Check size={14} color={COLORS.WARM_WHITE} strokeWidth={3} />}
      </div>
      {label && (
        <span style={{ color: COLORS.WARM_WHITE, fontSize: "14px", fontWeight: 500 }}>
          {label}
        </span>
      )}
    </label>
  );
};
