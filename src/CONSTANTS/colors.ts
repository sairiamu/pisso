export const COLORS = {
  GRAPHITE_900: "#181818",
  GRAPHITE_700: "#1f1f1f",
  GRAPHITE_500: "#2d2d2d",
  BORDER: "#333333",
  ACCENT_BLUE: "#007acc",
  SOLDER_COPPER: "#c97a4b",
  TRACE_GREEN: "#388e3c",
  FAULT_RED: "#f44336",
  WARM_WHITE: "#e1e1e1",
  FOG: "#858585",
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];
