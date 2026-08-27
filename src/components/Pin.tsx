import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { PINS } from "../CONSTANTS/pins";

interface PinProps {
  id: string;
  x: number;
  y: number;
  type?: "source" | "target";
  _internal?: boolean;
}

export const Pin: React.FC<PinProps> = ({ id, x, y, type = "source", _internal = false }) => {
  if (!_internal) return null;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Handle
      id={id}
      type={type}
      position={Position.Top} // Position doesn't matter much for absolute placement but is required
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: PINS.SIZE,
        height: PINS.SIZE,
        backgroundColor: isHovered ? PINS.HOVER_COLOR : PINS.COLOR,
        border: "none",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "background-color 0.2s ease, box-shadow 0.2s ease",
        zIndex: 10,
        minWidth: 0,
        minHeight: 0,
        boxShadow: isHovered
          ? `0 0 6px ${PINS.HOVER_COLOR}`
          : "inset 0 1px 1px rgba(0,0,0,0.3)",
        cursor: "crosshair",
      }}
    />
  );
};
