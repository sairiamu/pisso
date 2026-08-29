import { COLORS } from "./colors";

export const PANEL = {
  RADIUS: "10px",
  INSET_SHADOW: "inset 0 2px 4px rgba(0, 0, 0, 0.3)", // Subtle recessed look
  SCREW: {
    SIZE: "6px",
    COLOR: COLORS.GRAPHITE_500,
    OPACITY: 0.6,
  },
  ACCENT_GLOW: {
    WIDTH: "1px",
    COLOR: `${COLORS.SOLDER_COPPER}26`, // #C97A4B with ~15% opacity (26 in hex)
    RAW_COLOR: COLORS.SOLDER_COPPER,
    OPACITY: 0.15,
  },
  SPACING: {
    XS: "4px",
    SM: "8px",
    MD: "12px",
    LG: "16px",
    XL: "24px",
    XXL: "32px",
    RAIL: "20px",
  },
} as const;

export type PanelConstants = typeof PANEL;
