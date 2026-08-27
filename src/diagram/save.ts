import { Diagram } from "./types";

/**
 * Converts a Diagram object into a plain JSON-serializable object.
 * This ensures the output matches the diagram.json schema exactly.
 */
export function save(diagram: Diagram): any {
  return {
    version: diagram.version,
    parts: diagram.parts.map((p) => ({
      id: p.id,
      type: p.type,
      x: p.x,
      y: p.y,
      rotation: p.rotation,
      attrs: { ...p.attrs },
    })),
    connections: diagram.connections.map((c) => ({
      id: c.id,
      from: { ...c.from },
      to: { ...c.to },
      route: c.route ? c.route.map((r) => ({ ...r })) : [],
    })),
  };
}
