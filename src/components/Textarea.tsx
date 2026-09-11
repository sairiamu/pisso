import React, { useState } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { Label } from "./Label";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  hint,
  error,
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
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const getBorderStyle = () => {
    if (error) return `1px solid ${COLORS.FAULT_RED}`;
    if (isFocused) return `1px solid ${COLORS.SOLDER_COPPER}`;
    return `1px solid ${COLORS.GRAPHITE_500}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", ...containerStyle }}>
      {label && (
        <Label htmlFor={textareaId} required={required}>
          {label}
        </Label>
      )}

      <textarea
        id={textareaId}
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
          backgroundColor: COLORS.GRAPHITE_900,
          borderRadius: "6px",
          border: getBorderStyle(),
          transition: "border-color 0.2s ease",
          opacity: disabled ? 0.6 : 1,
          color: COLORS.WARM_WHITE,
          fontSize: "14px",
          fontFamily: TYPOGRAPHY.UI,
          padding: "8px 12px",
          outline: "none",
          minHeight: "80px",
          resize: "vertical",
          boxShadow: isFocused ? `0 0 0 2px ${COLORS.SOLDER_COPPER}22` : "none",
          ...style,
        }}
        {...props}
      />

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
