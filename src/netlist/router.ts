export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Point {
  x: number;
  y: number;
}

export type Direction = "up" | "down" | "left" | "right";

export interface RouteHints {
  startDirection?: Direction;
  endDirection?: Direction;
}

export interface RouterObstacles {
  parts: Rect[]; // bounding boxes of every part on canvas, with clearance already applied
  routedSegments: Point[][]; // each existing wire's waypoint path, as consecutive point pairs = segments
}

export interface RouteResult {
  points: Point[]; // simplified waypoint polyline, collinear points removed
  found: boolean; // false if no path existed even through soft-cost cells (shouldn't normally happen)
}

interface RouterNode {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent?: RouterNode;
  dir?: { dCol: number; dRow: number };
}

/**
 * Computes an orthogonal path from `start` to `end` around the given
 * obstacles, using a grid-based A* search restricted to horizontal and
 * vertical moves. `gridSize` controls grid resolution in canvas px
 * (default 10) — smaller is more precise but slower.
 */
export function routeOrthogonal(
  start: Point,
  end: Point,
  obstacles: RouterObstacles,
  gridSize: number = 10,
  hints?: RouteHints
): RouteResult {
  // 1. Handle stubs
  const stubLen = 2; // grid cells
  let actualStart = start;
  let actualEnd = end;
  const startPoints: Point[] = [start];
  const endPoints: Point[] = [end];

  if (hints?.startDirection) {
    const dir = hints.startDirection;
    const dx = dir === "left" ? -1 : dir === "right" ? 1 : 0;
    const dy = dir === "up" ? -1 : dir === "down" ? 1 : 0;
    for (let i = 1; i <= stubLen; i++) {
      startPoints.push({
        x: start.x + dx * i * gridSize,
        y: start.y + dy * i * gridSize,
      });
    }
    actualStart = startPoints[startPoints.length - 1];
  }

  if (hints?.endDirection) {
    const dir = hints.endDirection;
    const dx = dir === "left" ? -1 : dir === "right" ? 1 : 0;
    const dy = dir === "up" ? -1 : dir === "down" ? 1 : 0;
    for (let i = 1; i <= stubLen; i++) {
      endPoints.unshift({
        x: end.x + dx * i * gridSize,
        y: end.y + dy * i * gridSize,
      });
    }
    actualEnd = endPoints[0];
  }

  // 2. Build a grid covering the bounding box of start, end, and all obstacles.parts, expanded by a margin.
  const margin = 2 * gridSize + (stubLen * gridSize);
  let minX = Math.min(start.x, end.x, actualStart.x, actualEnd.x);
  let minY = Math.min(start.y, end.y, actualStart.y, actualEnd.y);
  let maxX = Math.max(start.x, end.x, actualStart.x, actualEnd.x);
  let maxY = Math.max(start.y, end.y, actualStart.y, actualEnd.y);

  for (const rect of obstacles.parts) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  minX -= margin;
  minY -= margin;
  maxX += margin;
  maxY += margin;

  // Align to grid
  const gridMinX = Math.floor(minX / gridSize) * gridSize;
  const gridMinY = Math.floor(minY / gridSize) * gridSize;
  const gridMaxX = Math.ceil(maxX / gridSize) * gridSize;
  const gridMaxY = Math.ceil(maxY / gridSize) * gridSize;

  const cols = Math.round((gridMaxX - gridMinX) / gridSize) + 1;
  const rows = Math.round((gridMaxY - gridMinY) / gridSize) + 1;

  const getGridCoords = (p: Point) => ({
    col: Math.round((p.x - gridMinX) / gridSize),
    row: Math.round((p.y - gridMinY) / gridSize),
  });

  const startCoords = getGridCoords(actualStart);
  const endCoords = getGridCoords(actualEnd);

  // 3. A* Search
  const openList: RouterNode[] = [];
  const closedSet = new Set<string>();

  const startNode: RouterNode = {
    col: startCoords.col,
    row: startCoords.row,
    g: 0,
    h: manhattan(startCoords, endCoords),
    f: manhattan(startCoords, endCoords),
  };
  // If start stub exists, set the initial direction to match the stub
  if (hints?.startDirection) {
    const dir = hints.startDirection;
    startNode.dir = {
      dCol: dir === "left" ? -1 : dir === "right" ? 1 : 0,
      dRow: dir === "up" ? -1 : dir === "down" ? 1 : 0,
    };
  }
  openList.push(startNode);

  const nodeKey = (col: number, row: number) => `${col},${row}`;

  const isPointInRect = (px: number, py: number, rect: Rect) => {
    return px >= rect.x && px <= rect.x + rect.width && py >= rect.y && py <= rect.y + rect.height;
  };

  const isOnSegment = (px: number, py: number, p1: Point, p2: Point) => {
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    // Check if point is within bounding box of segment
    if (px < minX - 0.1 || px > maxX + 0.1 || py < minY - 0.1 || py > maxY + 0.1) return false;

    // Check collinearity (horizontal or vertical only)
    if (Math.abs(p1.x - p2.x) < 0.1) {
      return Math.abs(px - p1.x) < 0.1;
    }
    if (Math.abs(p1.y - p2.y) < 0.1) {
      return Math.abs(py - p1.y) < 0.1;
    }
    return false;
  };

  const getCellCost = (col: number, row: number) => {
    const px = gridMinX + col * gridSize;
    const py = gridMinY + row * gridSize;

    // actualStart and actualEnd are always enterable
    const isStart = col === startCoords.col && row === startCoords.row;
    const isEnd = col === endCoords.col && row === endCoords.row;

    if (!isStart && !isEnd) {
      for (const rect of obstacles.parts) {
        if (isPointInRect(px, py, rect)) {
          return Infinity;
        }
      }
    }

    let cost = 1;
    for (const segment of obstacles.routedSegments) {
      for (let i = 0; i < segment.length - 1; i++) {
        if (isOnSegment(px, py, segment[i], segment[i + 1])) {
          cost = 50;
          break;
        }
      }
      if (cost > 1) break;
    }

    return cost;
  };

  while (openList.length > 0) {
    // Sort by f value (could use a binary heap for better performance)
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.col === endCoords.col && current.row === endCoords.row) {
      const mainPath = reconstructPath(current, gridMinX, gridMinY, gridSize, actualStart, actualEnd);
      // Combine startPoints + mainPath (without actualStart) + endPoints (without actualEnd)
      const combinedPoints = [
        ...startPoints.slice(0, -1),
        ...mainPath,
        ...endPoints.slice(1)
      ];
      return {
        points: simplifyPath(combinedPoints),
        found: true,
      };
    }

    closedSet.add(nodeKey(current.col, current.row));

    const neighbors = [
      { dCol: 0, dRow: -1 }, // Up
      { dCol: 0, dRow: 1 }, // Down
      { dCol: -1, dRow: 0 }, // Left
      { dCol: 1, dRow: 0 }, // Right
    ];

    for (const { dCol, dRow } of neighbors) {
      const nCol = current.col + dCol;
      const nRow = current.row + dRow;

      if (nCol < 0 || nCol >= cols || nRow < 0 || nRow >= rows) continue;
      if (closedSet.has(nodeKey(nCol, nRow))) continue;

      const cellCost = getCellCost(nCol, nRow);
      if (cellCost === Infinity) continue;

      const moveCost = cellCost * gridSize;
      const turnCost =
        current.dir && (current.dir.dCol !== dCol || current.dir.dRow !== dRow) ? gridSize * 2 : 0;
      const gScore = current.g + moveCost + turnCost;

      const existingOpenNode = openList.find((n) => n.col === nCol && n.row === nRow);
      if (existingOpenNode && gScore >= existingOpenNode.g) continue;

      const h = manhattan({ col: nCol, row: nRow }, endCoords) * gridSize;
      const newNode: RouterNode = {
        col: nCol,
        row: nRow,
        g: gScore,
        h: h,
        f: gScore + h,
        parent: current,
        dir: { dCol, dRow },
      };

      if (existingOpenNode) {
        existingOpenNode.g = newNode.g;
        existingOpenNode.f = newNode.f;
        existingOpenNode.parent = newNode.parent;
        existingOpenNode.dir = newNode.dir;
      } else {
        openList.push(newNode);
      }
    }
  }

  return { points: [start, end], found: false };
}

function manhattan(p1: { col: number; row: number }, p2: { col: number; row: number }) {
  return Math.abs(p1.col - p2.col) + Math.abs(p1.row - p2.row);
}

function reconstructPath(
  endNode: RouterNode,
  gridMinX: number,
  gridMinY: number,
  gridSize: number,
  start: Point,
  end: Point
): Point[] {
  const path: Point[] = [];
  let current: RouterNode | undefined = endNode;
  while (current) {
    path.push({
      x: gridMinX + current.col * gridSize,
      y: gridMinY + current.row * gridSize,
    });
    current = current.parent;
  }
  path.reverse();

  // Replace first and last points with exact start and end to avoid grid snap artifacts
  if (path.length > 0) {
    path[0] = start;
    path[path.length - 1] = end;
  }

  return path;
}

function simplifyPath(path: Point[]): Point[] {
  // Simplify path: merge collinear points
  if (path.length <= 2) return path;

  const simplified: Point[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = path[i];
    const next = path[i + 1];

    const isCollinear =
      (Math.abs(prev.x - curr.x) < 0.1 && Math.abs(curr.x - next.x) < 0.1) ||
      (Math.abs(prev.y - curr.y) < 0.1 && Math.abs(curr.y - next.y) < 0.1);

    if (!isCollinear) {
      simplified.push(curr);
    }
  }
  simplified.push(path[path.length - 1]);

  return simplified;
}
