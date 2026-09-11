import React, { useState } from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "neutral" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: isPressed ? COLORS.SOLDER_COPPER : isHovered ? `${COLORS.SOLDER_COPPER}EE` : COLORS.SOLDER_COPPER,
          color: COLORS.WARM_WHITE,
          border: "none",
          boxShadow: isPressed ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
        };
      case "secondary":
        return {
          backgroundColor: isPressed ? COLORS.TRACE_GREEN : isHovered ? `${COLORS.TRACE_GREEN}EE` : COLORS.TRACE_GREEN,
          color: COLORS.WARM_WHITE,
          border: "none",
          boxShadow: isPressed ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
        };
      case "neutral":
        return {
          backgroundColor: isPressed ? COLORS.GRAPHITE_500 : isHovered ? COLORS.GRAPHITE_500 : COLORS.GRAPHITE_700,
          color: COLORS.WARM_WHITE,
          border: `1px solid ${COLORS.GRAPHITE_500}`,
          boxShadow: isPressed ? "none" : "0 1px 2px rgba(0,0,0,0.1)",
        };
      case "danger":
        return {
          backgroundColor: isPressed ? COLORS.FAULT_RED : isHovered ? `${COLORS.FAULT_RED}EE` : COLORS.FAULT_RED,
          color: COLORS.WARM_WHITE,
          border: "none",
          boxShadow: isPressed ? "none" : "0 2px 4px rgba(0,0,0,0.2)",
        };
      case "ghost":
        return {
          backgroundColor: isPressed ? `${COLORS.GRAPHITE_500}44` : isHovered ? `${COLORS.GRAPHITE_500}22` : "transparent",
          color: isHovered ? COLORS.WARM_WHITE : COLORS.FOG,
          border: "none",
          boxShadow: "none",
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case "sm":
        return {
          padding: "4px 12px",
          fontSize: "12px",
          height: "28px",
        };
      case "md":
        return {
          padding: "8px 16px",
          fontSize: "14px",
          height: "36px",
        };
      case "lg":
        return {
          padding: "12px 24px",
          fontSize: "16px",
          height: "44px",
        };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "6px",
    cursor: (disabled || isLoading) ? "not-allowed" : "pointer",
    fontWeight: 600,
    fontFamily: TYPOGRAPHY.UI,
    transition: "all 0.15s ease-in-out",
    opacity: disabled ? 0.5 : 1,
    outline: "none",
    position: "relative",
    userSelect: "none",
    whiteSpace: "nowrap",
    ...getSizeStyles(),
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        setIsPressed(false);
        onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!disabled && !isLoading) setIsPressed(true);
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        setIsPressed(false);
        onMouseUp?.(e);
      }}
      style={baseStyle}
      {...props}
    >
      {isLoading && (
        <div style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner size={size === "lg" ? "md" : "sm"} color={variant === "ghost" ? COLORS.FOG : COLORS.WARM_WHITE} />
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", visibility: isLoading ? "hidden" : "visible" }}>
        {leftIcon}
        {children}
        {rightIcon}
      </div>
    </button>
  );
};
