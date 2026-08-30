import { Diagram } from "./types";

/**
 * Parses a plain object (from diagram.json) into a Diagram object.
 * Validates types and provides defaults for missing fields.
 */
export function load(data: any): Diagram {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid diagram data: root must be an object");
  }

  const version = typeof data.version === "number" ? data.version : 1;

  const parts = Array.isArray(data.parts)
    ? data.parts.map((p: any) => ({
        id: String(p.id || ""),
        type: String(p.type || ""),
        x: Number(p.x) || 0,
        y: Number(p.y) || 0,
        rotation: Number(p.rotation) || 0,
        attrs: p.attrs && typeof p.attrs === "object" ? { ...p.attrs } : {},
      }))
    : [];

  const connections = Array.isArray(data.connections)
    ? data.connections.map((c: any) => ({
        id: String(c.id || ""),
        from: {
          partId: String(c.from?.partId || ""),
          pin: String(c.from?.pin || ""),
        },
        to: {
          partId: String(c.to?.partId || ""),
          pin: String(c.to?.pin || ""),
        },
        route: Array.isArray(c.route)
          ? c.route.map((r: any) => ({
              x: Number(r.x) || 0,
              y: Number(r.y) || 0,
            }))
          : [],
        waypoints: Array.isArray(c.waypoints)
          ? c.waypoints.map((w: any) => ({
              x: Number(w.x) || 0,
              y: Number(w.y) || 0,
            }))
          : [],
        color: c.color,
        thickness: typeof c.thickness === "number" ? c.thickness : 3,
        tracked: c.tracked === true,
      }))
    : [];

  return {
    version,
    parts,
    connections,
  };
}
