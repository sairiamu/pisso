import { COLORS } from "./colors";

export const PANEL = {
  RADIUS: "4px",
  INSET_SHADOW: "none",
  SCREW: {
    SIZE: "0px",
    COLOR: "transparent",
    OPACITY: 0,
  },
  ACCENT_GLOW: {
    WIDTH: "1px",
    COLOR: `${COLORS.SOLDER_COPPER}40`,
    RAW_COLOR: COLORS.SOLDER_COPPER,
    OPACITY: 0.25,
  },
  SPACING: {
    XS: "4px",
    SM: "6px",
    MD: "10px",
    LG: "14px",
    XL: "20px",
    XXL: "28px",
    RAIL: "12px",
  },
} as const;

export type PanelConstants = typeof PANEL;
