import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { PANEL } from "../CONSTANTS/panel";

interface PanelProps {
  children?: React.ReactNode;
  showScrews?: boolean;
  isActive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const Screw: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div
    style={{
      position: "absolute",
      width: PANEL.SCREW.SIZE,
      height: PANEL.SCREW.SIZE,
      borderRadius: "50%",
      backgroundColor: PANEL.SCREW.COLOR,
      opacity: PANEL.SCREW.OPACITY,
      boxShadow: "inset -1px -1px 1px rgba(0,0,0,0.4), 0.5px 0.5px 1px rgba(255,255,255,0.1)",
      pointerEvents: "none",
      ...style,
    }}
  />
);

export const Panel: React.FC<PanelProps> = ({
  children,
  showScrews = true,
  isActive = false,
  style,
  className,
}) => {
  const containerStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: COLORS.GRAPHITE_700,
    borderRadius: PANEL.RADIUS,
    boxShadow: isActive
      ? `${PANEL.INSET_SHADOW}, 0 0 0 ${PANEL.ACCENT_GLOW.WIDTH} ${PANEL.ACCENT_GLOW.COLOR}`
      : PANEL.INSET_SHADOW,
    color: COLORS.WARM_WHITE,
    transition: "box-shadow 0.2s ease-in-out",
    ...style,
  };

  const screwOffset = "8px";

  return (
    <div style={containerStyle} className={className}>
      {showScrews && (
        <>
          <Screw style={{ top: screwOffset, left: screwOffset }} />
          <Screw style={{ top: screwOffset, right: screwOffset }} />
          <Screw style={{ bottom: screwOffset, left: screwOffset }} />
          <Screw style={{ bottom: screwOffset, right: screwOffset }} />
        </>
      )}
      <div style={{
        position: "relative",
        zIndex: 1,
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
