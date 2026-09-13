import { Diagram, PinRef } from "./types";
import { resolveNode } from "./resolver";

/**
 * A Net is a collection of electrically connected pins.
 * The order of pins within a Net is deterministic.
 */
export type Net = PinRef[];

/**
 * Generates a deterministic netlist for a given diagram.
 * A netlist is a collection of all nets (electrically connected groups of pins).
 * The output is deterministic: the same diagram will always produce the same netlist,
 * regardless of the order of parts or connections in the diagram, or their canvas positions.
 */
export function generateNetlist(diagram: Diagram): Net[] {
  const visited = new Set<string>();
  const nets: Net[] = [];

  const pinToKey = (p: PinRef) => `${p.partId}:${p.pin}`;

  // 1. Gather all pins that are part of any connection (wire).
  // These serve as starting points for net discovery.
  const seedPins: PinRef[] = [];
  for (const conn of diagram.connections) {
    seedPins.push(conn.from);
    seedPins.push(conn.to);
  }

  // 2. Sort seed pins to ensure deterministic discovery order.
  seedPins.sort((a, b) => {
    const keyA = pinToKey(a);
    const keyB = pinToKey(b);
    return keyA.localeCompare(keyB);
  });

  // 3. Traverse the connectivity graph from each seed pin.
  for (const seed of seedPins) {
    const key = pinToKey(seed);
    if (visited.has(key)) continue;

    // resolveNode handles wires and internal part logic (like breadboards).
    const connectedPins = resolveNode(diagram, seed);

    // Mark all pins in this net as visited.
    for (const p of connectedPins) {
      visited.add(pinToKey(p));
    }

    // 4. Determinism: Sort pins within the net.
    connectedPins.sort((a, b) => {
      const keyA = pinToKey(a);
      const keyB = pinToKey(b);
      return keyA.localeCompare(keyB);
    });

    nets.push(connectedPins);
  }

  // 5. Determinism: Sort the nets themselves based on their first pin.
  nets.sort((a, b) => {
    const keyA = pinToKey(a[0]);
    const keyB = pinToKey(b[0]);
    return keyA.localeCompare(keyB);
  });

  return nets;
}
