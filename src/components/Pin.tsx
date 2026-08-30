import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { PINS } from "../CONSTANTS/pins";

interface PinProps {
  id: string;
  x: number | string;
  y: number | string;
  type?: "source" | "target";
  _internal?: boolean;
}

export const Pin: React.FC<PinProps> = ({ id, x, y, type = "source", _internal = false }) => {
  if (!_internal) return null;
  const [isHovered, setIsHovered] = useState(false);

  // Use pixel strings for absolute CSS placement
  const left = typeof x === 'number' ? `${x}px` : x;
  const top = typeof y === 'number' ? `${y}px` : y;

  return (
    <Handle
      id={id}
      type={type}
      position={Position.Top}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: left,
        top: top,
        width: PINS.SIZE,
        height: PINS.SIZE,
        backgroundColor: isHovered ? PINS.HOVER_COLOR : PINS.COLOR,
        border: "1px solid rgba(0,0,0,0.5)",
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        transition: "background-color 0.15s ease",
        zIndex: 2000,
        minWidth: 0,
        minHeight: 0,
        cursor: "crosshair",
        pointerEvents: "auto",
        boxShadow: isHovered ? `0 0 6px ${PINS.HOVER_COLOR}` : "none",
        opacity: isHovered ? 1 : 0.8
      }}
    />
  );
};
