import { Diagram, PinRef } from "./types";
import { getBreadboardInternalConnections, isBreadboard } from "./breadboard";

/**
 * Resolves all pins electrically connected to the given pinRef.
 */
export function resolveNode(diagram: Diagram, startPin: PinRef): PinRef[] {
  const visited = new Set<string>();
  const result: PinRef[] = [];
  const queue: PinRef[] = [startPin];

  const pinToKey = (p: PinRef) => `${p.partId}:${p.pin}`;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = pinToKey(current);

    if (visited.has(key)) continue;
    visited.add(key);
    result.push(current);

    // 1. External connections (wires)
    for (const conn of diagram.connections) {
      if (pinToKey(conn.from) === key) {
        queue.push(conn.to);
      } else if (pinToKey(conn.to) === key) {
        queue.push(conn.from);
      }
    }

    // 2. Internal connections (part-specific logic, e.g., breadboard bus)
    const part = diagram.parts.find(p => p.id === current.partId);
    if (part && isBreadboard(part.type)) {
      const internalPins = getBreadboardInternalConnections(current.pin);
      for (const internalPin of internalPins) {
        if (internalPin !== current.pin) {
          queue.push({ partId: current.partId, pin: internalPin });
        }
      }
    }
  }

  return result;
}
