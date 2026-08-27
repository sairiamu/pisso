import React from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  Position
} from "@xyflow/react";
import { COLORS } from "../CONSTANTS/colors";

export const WireEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const isShorted = data?.isShorted === true;

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
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: isShorted ? COLORS.FAULT_RED : COLORS.TRACE_GREEN,
        strokeWidth: 3,
        strokeLinecap: "round",
        filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.5))",
      }}
    />
  );
};
