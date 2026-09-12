import { Circuit, ComponentInstance, Connection } from "./models";

/**
 * Converts a Circuit object into a plain JSON-serializable object.
 */
export function serializeCircuit(circuit: Circuit): any {
  return {
    version: circuit.version,
    parts: circuit.components.map((c) => ({
      id: c.id,
      type: c.definitionId,
      x: c.x,
      y: c.y,
      rotation: c.rotation,
      attrs: { ...c.attributes },
    })),
    connections: circuit.connections.map((c) => ({
      id: c.id,
      from: { partId: c.from.componentId, pin: c.from.pinName },
      to: { partId: c.to.componentId, pin: c.to.pinName },
      waypoints: c.waypoints ? c.waypoints.map((w) => ({ ...w })) : [],
      color: c.color,
      thickness: c.thickness,
      tracked: c.tracked,
    })),
    nets: circuit.nets.map((n) => ({
      id: n.id,
      name: n.name,
      pins: n.pins.map((p) => ({ partId: p.componentId, pin: p.pinName })),
    })),
  };
}

/**
 * Parses a plain object into a Circuit object.
 */
export function deserializeCircuit(data: any): Circuit {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid circuit data: root must be an object");
  }

  const version = typeof data.version === "number" ? data.version : 1;

  const components: ComponentInstance[] = Array.isArray(data.parts)
    ? data.parts.map((p: any) => ({
        id: String(p.id || ""),
        definitionId: String(p.type || ""),
        x: Number(p.x) || 0,
        y: Number(p.y) || 0,
        rotation: Number(p.rotation) || 0,
        attributes: p.attrs && typeof p.attrs === "object" ? { ...p.attrs } : {},
      }))
    : [];

  const connections: Connection[] = Array.isArray(data.connections)
    ? data.connections.map((c: any) => ({
        id: String(c.id || ""),
        from: {
          componentId: String(c.from?.partId || ""),
          pinName: String(c.from?.pin || ""),
        },
        to: {
          componentId: String(c.to?.partId || ""),
          pinName: String(c.to?.pin || ""),
        },
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

  const nets = Array.isArray(data.nets)
    ? data.nets.map((n: any) => ({
        id: String(n.id || ""),
        name: String(n.name || ""),
        pins: Array.isArray(n.pins)
          ? n.pins.map((p: any) => ({
              componentId: String(p.partId || ""),
              pinName: String(p.pin || ""),
            }))
          : [],
      }))
    : [];

  return {
    version,
    components,
    connections,
    nets,
  };
}
