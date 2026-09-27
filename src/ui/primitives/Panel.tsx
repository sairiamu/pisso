import React from "react";
import { COLORS } from "../../CONSTANTS/colors";
import { PANEL } from "../../CONSTANTS/panel";

interface PanelProps {
  children?: React.ReactNode;
  showScrews?: boolean;
  isActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const PanelHeader: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    padding: "8px 12px",
    borderBottom: `1px solid ${COLORS.BORDER}`,
    backgroundColor: COLORS.GRAPHITE_500,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.03em",
    ...style
  }}>
    {children}
  </div>
);

export const PanelBody: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ padding: "12px", ...style }}>
    {children}
  </div>
);

export const PanelFooter: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    padding: "8px 12px",
    borderTop: `1px solid ${COLORS.BORDER}`,
    backgroundColor: COLORS.GRAPHITE_500,
    ...style
  }}>
    {children}
  </div>
);

export const Panel: React.FC<PanelProps> = ({
  children,
  isActive = false,
  style,
  className,
}) => {
  const containerStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: COLORS.GRAPHITE_700,
    borderRadius: PANEL.RADIUS,
    border: `1px solid ${isActive ? COLORS.SOLDER_COPPER : COLORS.BORDER}`,
    color: COLORS.WARM_WHITE,
    overflow: "hidden",
    boxSizing: "border-box",
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      <div style={{
        position: "relative",
        height: "100%",
        display: style?.display === "flex" ? "flex" : "block",
        flexDirection: style?.flexDirection,
        flex: style?.display === "flex" ? 1 : undefined,
        minHeight: style?.display === "flex" ? 0 : undefined,
      }}>
        {children}
      </div>
    </div>
  );
};
