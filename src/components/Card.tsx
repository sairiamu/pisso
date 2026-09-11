import React from "react";
import { COLORS } from "../CONSTANTS/colors";
import { PANEL } from "../CONSTANTS/panel";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, style, className }) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: COLORS.GRAPHITE_700,
        borderRadius: PANEL.RADIUS,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        color: COLORS.WARM_WHITE,
        overflow: "hidden",
        border: `1px solid ${COLORS.GRAPHITE_500}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      padding: "16px",
      borderBottom: `1px solid ${COLORS.GRAPHITE_500}`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardBody: React.FC<CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      padding: "16px",
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      padding: "12px 16px",
      borderTop: `1px solid ${COLORS.GRAPHITE_500}`,
      backgroundColor: `${COLORS.GRAPHITE_900}44`,
      ...style,
    }}
  >
    {children}
  </div>
);
