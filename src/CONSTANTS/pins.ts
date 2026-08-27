import { COLORS } from "./colors";

export const PINS = {
  SIZE: "8px",
  COLOR: COLORS.SOLDER_COPPER,
  HOVER_COLOR: "#FFB38A", // Brightened copper
  ACTIVE_COLOR: COLORS.TRACE_GREEN,
  ERROR_COLOR: COLORS.FAULT_RED,
} as const;

export type PinConstants = typeof PINS;
