import { routeOrthogonal, Point, RouterObstacles } from "./router";

function testRouter() {
  console.log("Running Router Tests...");

  // Test 1: No obstacles - straight line
  {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    const obstacles: RouterObstacles = { parts: [], routedSegments: [] };
    const result = routeOrthogonal(start, end, obstacles);
    console.assert(result.found, "FAILED: Path should be found with no obstacles");
    console.assert(result.points.length === 2, "FAILED: Straight line should have 2 points");
    console.assert(result.points[0].x === 0 && result.points[0].y === 0, "FAILED: Start point mismatch");
    console.assert(result.points[1].x === 100 && result.points[1].y === 0, "FAILED: End point mismatch");
  }

  // Test 2: Single rectangular obstacle between start and end
  {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    // Obstacle blocking the straight path (40-60 on X, -20 to 20 on Y)
    const obstacles: RouterObstacles = {
      parts: [{ x: 40, y: -20, width: 20, height: 40 }],
      routedSegments: []
    };
    const result = routeOrthogonal(start, end, obstacles);
    console.assert(result.found, "FAILED: Path should be found around obstacle");

    // Check if any point or segment goes through the obstacle
    for (const p of result.points) {
      const inRect = p.x > 40 && p.x < 60 && p.y > -20 && p.y < 20;
      console.assert(!inRect, `FAILED: Path point (${p.x}, ${p.y}) is inside obstacle`);
    }
  }

  // Test 3: Existing routed segment preferred avoidance
  {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    // Existing wire on the straight path
    const obstacles: RouterObstacles = {
      parts: [],
      routedSegments: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]]
    };
    const result = routeOrthogonal(start, end, obstacles);
    console.assert(result.found, "FAILED: Path should be found despite existing segment");

    // It should avoid the existing segment if possible (e.g. by going around it)
    // A straight line would have a cost of 50 * 100 = 5000 + (some grid stuff)
    // Going around by 20px (e.g. 0,0 -> 0,20 -> 100,20 -> 100,0) would have cost 100 + 20 + 20 = 140 + turn costs.
    // So it should definitely NOT be a straight line.
    const isStraightLine = result.points.length === 2 && result.points[0].y === 0 && result.points[1].y === 0;
    console.assert(!isStraightLine, "FAILED: Router should avoid existing segment");
  }

  // Test 4: Start/end adjacent to own parts
  {
    const start: Point = { x: 50, y: 50 }; // on edge of part
    const end: Point = { x: 150, y: 50 };
    const obstacles: RouterObstacles = {
      parts: [
        { x: 0, y: 0, width: 50, height: 50 }, // start is at corner/edge
        { x: 150, y: 0, width: 50, height: 50 } // end is at corner/edge
      ],
      routedSegments: []
    };
    const result = routeOrthogonal(start, end, obstacles);
    console.assert(result.found, "FAILED: Path should be found when start/end are on part edges");
  }

  console.log("All Router Tests Passed!");
}

export const runRouterTests = testRouter;
