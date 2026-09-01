export const COLORS = {
  GRAPHITE_900: "#1C1E22",
  GRAPHITE_700: "#2A2D33",
  GRAPHITE_500: "#3C4048",
  SOLDER_COPPER: "#C97A4B",
  TRACE_GREEN: "#4CAF6D",
  FAULT_RED: "#E5533D",
  WARM_WHITE: "#EDE8E0",
  FOG: "#9A9FA6",
} as const;


export type ColorKey = keyof typeof COLORS;
export type ColorValue = typeof COLORS[ColorKey];
