import { Circuit, PinReference } from "./models";
import { getBreadboardInternalConnections, isBreadboard } from "./breadboard-logic";

/**
 * Resolves all pins electrically connected to the given pinRef.
 * This is a domain-level circuit connectivity algorithm.
 */
export function resolveNode(circuit: Circuit, startPin: PinReference): PinReference[] {
  const visited = new Set<string>();
  const result: PinReference[] = [];
  const queue: PinReference[] = [startPin];

  const pinToKey = (p: PinReference) => `${p.componentId}:${p.pinName}`;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = pinToKey(current);

    if (visited.has(key)) continue;
    visited.add(key);
    result.push(current);

    // 1. External connections (wires)
    for (const conn of circuit.connections) {
      if (pinToKey(conn.from) === key) {
        queue.push(conn.to);
      } else if (pinToKey(conn.to) === key) {
        queue.push(conn.from);
      }
    }

    // 2. Internal connections (part-specific logic, e.g., breadboard bus)
    const component = circuit.components.find(c => c.id === current.componentId);
    if (component && isBreadboard(component.definitionId)) {
      const internalPins = getBreadboardInternalConnections(current.pinName);
      for (const internalPin of internalPins) {
        if (internalPin !== current.pinName) {
          queue.push({ componentId: current.componentId, pinName: internalPin });
        }
      }
    }
  }

  return result;
}
