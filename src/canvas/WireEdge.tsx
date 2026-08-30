import React from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath
} from "@xyflow/react";
import { COLORS } from "../CONSTANTS/colors";

export const WireEdge: React.FC<EdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const isShorted = data?.isShorted === true;
  const color = isShorted ? COLORS.FAULT_RED : (data?.color as string || COLORS.TRACE_GREEN);
  const thickness = typeof data?.thickness === 'number' ? data.thickness : 3;
  const tracked = data?.tracked === true;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      {tracked && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: color,
            strokeWidth: thickness + 6,
            strokeLinecap: "round",
            opacity: 0.35,
            pointerEvents: "none"
          }}
          className="pissow-wire-glow"
        />
      )}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: selected ? thickness + 1.5 : thickness,
          strokeLinecap: "round",
          filter: selected
            ? `drop-shadow(0px 0px 4px ${color})`
            : "drop-shadow(0px 1px 1px rgba(0,0,0,0.5))",
        }}
      />
    </>
  );
};
