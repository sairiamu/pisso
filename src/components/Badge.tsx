import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";

export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return { backgroundColor: `${COLORS.SOLDER_COPPER}33`, color: COLORS.SOLDER_COPPER, border: `1px solid ${COLORS.SOLDER_COPPER}66` };
      case "success":
        return { backgroundColor: `${COLORS.TRACE_GREEN}33`, color: COLORS.TRACE_GREEN, border: `1px solid ${COLORS.TRACE_GREEN}66` };
      case "danger":
        return { backgroundColor: `${COLORS.FAULT_RED}33`, color: COLORS.FAULT_RED, border: `1px solid ${COLORS.FAULT_RED}66` };
      case "warning":
        // Fallback to SOLDER_COPPER if no specific warning color
        return { backgroundColor: `${COLORS.SOLDER_COPPER}22`, color: COLORS.SOLDER_COPPER, border: `1px solid ${COLORS.SOLDER_COPPER}44` };
      case "info":
        return { backgroundColor: `${COLORS.FOG}33`, color: COLORS.FOG, border: `1px solid ${COLORS.FOG}66` };
      case "neutral":
      default:
        return { backgroundColor: `${COLORS.GRAPHITE_500}33`, color: COLORS.FOG, border: `1px solid ${COLORS.GRAPHITE_500}66` };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: 600,
    fontFamily: TYPOGRAPHY.UI,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
    ...getVariantStyles(),
    ...style,
  };

  return <span style={baseStyle}>{children}</span>;
};
