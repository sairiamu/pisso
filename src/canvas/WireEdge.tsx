import React, { useMemo } from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath, useNodes, useEdges, useReactFlow } from "@xyflow/react";
import { COLORS } from "../CONSTANTS/colors";
import { routeOrthogonal, Rect, Direction } from "../netlist/router";
import { useRouteCache } from "./RouteCache";
import { useWireActions } from "./WireActions";

const CLEARANCE = 6; // px padding around each part's footprint

function pointsToRoundedPath(points: { x: number; y: number }[], radius = 6): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const segLen1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const segLen2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, segLen1 / 2, segLen2 / 2);

    const beforeCorner = {
      x: curr.x - (r / segLen1) * (curr.x - prev.x),
      y: curr.y - (r / segLen1) * (curr.y - prev.y),
    };
    const afterCorner = {
      x: curr.x + (r / segLen2) * (next.x - curr.x),
      y: curr.y + (r / segLen2) * (next.y - curr.y),
    };

    d += ` L ${beforeCorner.x},${beforeCorner.y} Q ${curr.x},${curr.y} ${afterCorner.x},${afterCorner.y}`;
  }
  d += ` L ${points[points.length - 1].x},${points[points.length - 1].y}`;
  return d;
}

function inferExitDirection(
  pinX: number, pinY: number,
  partX: number, partY: number, partWidth: number, partHeight: number
): Direction {
  const relX = pinX - partX;
  const relY = pinY - partY;
  const distances: [Direction, number][] = [
    ["left", relX],
    ["right", partWidth - relX],
    ["up", relY],
    ["down", partHeight - relY],
  ];
  const [closest] = distances.reduce((a, b) => (b[1] < a[1] ? b : a));
  return closest;
}

function findNearestSegmentIndex(
  pathPoints: { x: number; y: number }[],
  clickPos: { x: number; y: number },
  segmentEndIndices: number[]
): number {
  if (pathPoints.length < 2) return 0;

  let minDistance = Infinity;
  let nearestSegmentStartIdx = 0;

  for (let i = 0; i < pathPoints.length - 1; i++) {
    const p1 = pathPoints[i];
    const p2 = pathPoints[i + 1];

    const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
    if (l2 === 0) continue;
    let t = ((clickPos.x - p1.x) * (p2.x - p1.x) + (clickPos.y - p1.y) * (p2.y - p1.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const distance = Math.sqrt(
      Math.pow(clickPos.x - (p1.x + t * (p2.x - p1.x)), 2) + Math.pow(clickPos.y - (p1.y + t * (p2.y - p1.y)), 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestSegmentStartIdx = i;
    }
  }

  for (let i = 0; i < segmentEndIndices.length; i++) {
    if (nearestSegmentStartIdx < segmentEndIndices[i]) {
      return i;
    }
  }
  return 0;
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
  const { screenToFlowPosition } = useReactFlow();
  const { onAddWaypoint, onMoveWaypoint, onRemoveWaypoint } = useWireActions();
  const waypoints = (data?.waypoints as { x: number; y: number }[]) || [];

  const isShorted = data?.isShorted === true;
  const color = isShorted ? COLORS.FAULT_RED : (data?.color as string || COLORS.TRACE_GREEN);
  const thickness = typeof data?.thickness === "number" ? data.thickness : 3;
  const tracked = data?.tracked === true;

  const routedPath = useMemo(() => {
    try {
      const anchors = [{ x: sourceX, y: sourceY }, ...waypoints, { x: targetX, y: targetY }];
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

      let allPoints: { x: number; y: number }[] = [];
      const segmentEndIndices: number[] = [];

      for (let i = 0; i < anchors.length - 1; i++) {
        const isFirst = i === 0;
        const isLast = i === anchors.length - 2;

        const sourceNode = nodes.find((n) => n.id === source);
        const targetNode = nodes.find((n) => n.id === target);

        const hints = {
          startDirection: isFirst && sourceNode
            ? inferExitDirection(sourceX, sourceY, sourceNode.position.x, sourceNode.position.y, sourceNode.measured?.width || 120, sourceNode.measured?.height || 120)
            : undefined,
          endDirection: isLast && targetNode
            ? inferExitDirection(targetX, targetY, targetNode.position.x, targetNode.position.y, targetNode.measured?.width || 120, targetNode.measured?.height || 120)
            : undefined,
        };

        const result = routeOrthogonal(anchors[i], anchors[i + 1], { parts, routedSegments }, undefined, hints);
        const pts = i === 0 ? result.points : result.points.slice(1);
        allPoints = allPoints.concat(pts);
        segmentEndIndices.push(allPoints.length - 1);
      }

      routeCache.set(id, allPoints);
      return { pathString: pointsToRoundedPath(allPoints), points: allPoints, segmentEndIndices };
    } catch (err) {
      console.error(`WireEdge: routing failed for edge ${id}`, err);
      return null;
    }
  }, [nodes, edges, id, source, target, sourceX, sourceY, targetX, targetY, waypoints, routeCache]);

  const [fallbackPath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const edgePath = routedPath?.pathString || fallbackPath;
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
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: "crosshair", pointerEvents: "visibleStroke" }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
          const insertAtIndex = findNearestSegmentIndex(routedPath?.points || [], flowPos, routedPath?.segmentEndIndices || []);
          onAddWaypoint(id, flowPos, insertAtIndex);
        }}
      />
      {selected &&
        waypoints.map((wp, index) => (
          <circle
            key={index}
            cx={wp.x}
            cy={wp.y}
            r={5}
            fill={COLORS.SOLDER_COPPER}
            stroke={COLORS.WARM_WHITE}
            strokeWidth={1.5}
            style={{ cursor: "grab", pointerEvents: "all" }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRemoveWaypoint(id, index);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              const move = (moveEvent: PointerEvent) => {
                const flowPos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
                onMoveWaypoint(id, index, flowPos);
              };
              const up = () => {
                window.removeEventListener("pointermove", move);
                window.removeEventListener("pointerup", up);
              };
              window.addEventListener("pointermove", move);
              window.addEventListener("pointerup", up);
            }}
          />
        ))}
    </>
  );
};
