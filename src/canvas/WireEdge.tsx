import React, { useMemo } from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath, useNodes, useEdges } from "@xyflow/react";
import { COLORS } from "../CONSTANTS/colors";
import { routeOrthogonal, Rect } from "../netlist/router";
import { useRouteCache } from "./RouteCache";

const CLEARANCE = 6; // px padding around each part's footprint

function pointsToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  return points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`),
    ""
  );
}

export const WireEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
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
  const nodes = useNodes();
  const edges = useEdges();
  const routeCache = useRouteCache();

  const isShorted = data?.isShorted === true;
  const color = isShorted ? COLORS.FAULT_RED : (data?.color as string || COLORS.TRACE_GREEN);
  const thickness = typeof data?.thickness === "number" ? data.thickness : 3;
  const tracked = data?.tracked === true;

  const routedPath = useMemo(() => {
    try {
      const parts: Rect[] = nodes
        .filter((n) => n.id !== source && n.id !== target)
        .map((n) => ({
          x: n.position.x - CLEARANCE,
          y: n.position.y - CLEARANCE,
          width: (n.measured?.width || 120) + CLEARANCE * 2,
          height: (n.measured?.height || 120) + CLEARANCE * 2,
        }));

      const routedSegments = edges
        .filter((e) => e.id !== id)
        .map((e) => routeCache.get(e.id) || [])
        .filter((pts) => (pts as any[]).length >= 2);

      const result = routeOrthogonal(
        { x: sourceX, y: sourceY },
        { x: targetX, y: targetY },
        { parts, routedSegments }
      );

      routeCache.set(id, result.points);
      return pointsToPath(result.points);
    } catch (err) {
      console.error(`WireEdge: routing failed for edge ${id}`, err);
      return null;
    }
  }, [nodes, edges, id, source, target, sourceX, sourceY, targetX, targetY, routeCache]);

  const [fallbackPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const edgePath = routedPath || fallbackPath;
  if (!edgePath) return null;

  return (
    <>
      {tracked && (
        <BaseEdge
          path={edgePath}
          style={{ stroke: color, strokeWidth: thickness + 6, strokeLinecap: "round", opacity: 0.35 }}
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
