import React, { useState } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { Label } from "./Label";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  containerStyle?: React.CSSProperties;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  success,
  prefix,
  suffix,
  disabled,
  required,
  style,
  containerStyle,
  onFocus,
  onBlur,
  id,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const getBorderStyle = () => {
    if (error) return `1px solid ${COLORS.FAULT_RED}`;
    if (success) return `1px solid ${COLORS.TRACE_GREEN}`;
    if (isFocused) return `1px solid ${COLORS.SOLDER_COPPER}`;
    return `1px solid ${COLORS.GRAPHITE_500}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", ...containerStyle }}>
      {label && (
        <Label htmlFor={inputId} required={required}>
          {label}
        </Label>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: COLORS.GRAPHITE_900,
          borderRadius: "6px",
          border: getBorderStyle(),
          transition: "border-color 0.2s ease",
          opacity: disabled ? 0.6 : 1,
          padding: "0 12px",
          minHeight: "36px",
          boxShadow: isFocused ? `0 0 0 2px ${COLORS.SOLDER_COPPER}22` : "none",
        }}
      >
        {prefix && <div style={{ marginRight: "8px", display: "flex", color: COLORS.FOG }}>{prefix}</div>}

        <input
          id={inputId}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: COLORS.WARM_WHITE,
            fontSize: "14px",
            fontFamily: TYPOGRAPHY.UI,
            padding: "8px 0",
            width: "100%",
            ...style,
          }}
          {...props}
        />

        {suffix && <div style={{ marginLeft: "8px", display: "flex", color: COLORS.FOG }}>{suffix}</div>}
      </div>

      {(error || hint) && (
        <div
          style={{
            marginTop: "4px",
            fontSize: "11px",
            color: error ? COLORS.FAULT_RED : COLORS.FOG,
            fontFamily: TYPOGRAPHY.UI,
          }}
        >
          {error || hint}
        </div>
      )}
    </div>
  );
};
