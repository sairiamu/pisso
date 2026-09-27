import { describe, it, expect } from 'vitest';
import { routeOrthogonal, Point, RouterObstacles } from '../domain/wire-router';

describe('Wire Router', () => {
  it('should find straight path with no obstacles', () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    const obstacles: RouterObstacles = { parts: [], routedSegments: [] };
    const result = routeOrthogonal(start, end, obstacles);
    expect(result.found).toBe(true);
    expect(result.points.length).toBe(2);
    expect(result.points[0]).toEqual({ x: 0, y: 0 });
    expect(result.points[1]).toEqual({ x: 100, y: 0 });
  });

  it('should find path around rectangular obstacle', () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    const obstacles: RouterObstacles = {
      parts: [{ x: 40, y: -20, width: 20, height: 40 }],
      routedSegments: [],
    };
    const result = routeOrthogonal(start, end, obstacles);
    expect(result.found).toBe(true);
    for (const p of result.points) {
      const inRect = p.x > 40 && p.x < 60 && p.y > -20 && p.y < 20;
      expect(inRect).toBe(false);
    }
  });

  it('should avoid existing routed segments', () => {
    const start: Point = { x: 0, y: 0 };
    const end: Point = { x: 100, y: 0 };
    const obstacles: RouterObstacles = {
      parts: [],
      routedSegments: [[{ x: 0, y: 0 }, { x: 100, y: 0 }]],
    };
    const result = routeOrthogonal(start, end, obstacles);
    expect(result.found).toBe(true);
    const isStraightLine = result.points.length === 2 && result.points[0].y === 0 && result.points[1].y === 0;
    expect(isStraightLine).toBe(false);
  });

  it('should find path when start/end are on part edges', () => {
    const start: Point = { x: 50, y: 50 };
    const end: Point = { x: 150, y: 50 };
    const obstacles: RouterObstacles = {
      parts: [
        { x: 0, y: 0, width: 50, height: 50 },
        { x: 150, y: 0, width: 50, height: 50 },
      ],
      routedSegments: [],
    };
    const result = routeOrthogonal(start, end, obstacles);
    expect(result.found).toBe(true);
  });

  it('should respect exit direction hints', () => {
    const start: Point = { x: 50, y: 50 };
    const end: Point = { x: 150, y: 150 };
    const obstacles: RouterObstacles = { parts: [], routedSegments: [] };
    const result = routeOrthogonal(start, end, obstacles, 10, { startDirection: 'right' });
    expect(result.found).toBe(true);
    expect(result.points.length).toBeGreaterThanOrEqual(2);
    expect(result.points[1].x).toBeGreaterThan(result.points[0].x);
    expect(result.points[1].y).toBe(result.points[0].y);
  });
});
