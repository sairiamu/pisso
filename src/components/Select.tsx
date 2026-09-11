import React, { useState } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { ChevronDown } from "lucide-react";
import { Label } from "./Label";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  disabled,
  required,
  error,
  placeholder = "Select an option...",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderStyle = () => {
    if (error) return `1px solid ${COLORS.FAULT_RED}`;
    if (isFocused) return `1px solid ${COLORS.SOLDER_COPPER}`;
    return `1px solid ${COLORS.GRAPHITE_500}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {label && <Label required={required}>{label}</Label>}

      <div style={{ position: "relative", width: "100%" }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          style={{
            width: "100%",
            backgroundColor: COLORS.GRAPHITE_900,
            color: value ? COLORS.WARM_WHITE : COLORS.FOG,
            border: getBorderStyle(),
            borderRadius: "6px",
            padding: "8px 36px 8px 12px",
            fontSize: "14px",
            fontFamily: TYPOGRAPHY.UI,
            appearance: "none",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "border-color 0.2s ease",
            opacity: disabled ? 0.6 : 1,
            boxShadow: isFocused ? `0 0 0 2px ${COLORS.SOLDER_COPPER}22` : "none",
          }}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: COLORS.FOG,
            display: "flex",
          }}
        >
          <ChevronDown size={16} />
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            color: COLORS.FAULT_RED,
            fontFamily: TYPOGRAPHY.UI,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
