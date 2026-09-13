import { Diagram, PinRef, Connection } from "./types";
import { generateNetlist, Net } from "./generator";
import { PARTS_REGISTRY } from "../parts";
import { PinType } from "../parts/types";

export interface Diagnostic {
  severity: "error" | "warning";
  message: string;
  partId?: string;
  pin?: string;
  connectionId?: string;
}

export function validateCircuit(diagram: Diagram): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // 1. Connection to nonexistent pin
  for (const conn of diagram.connections) {
    validatePinRef(conn.from, conn.id, diagram, diagnostics);
    validatePinRef(conn.to, conn.id, diagram, diagnostics);
  }

  // 2. Duplicate connections
  const seenConnections = new Set<string>();
  for (const conn of diagram.connections) {
    const key = [conn.from, conn.to]
      .map((p) => `${p.partId}:${p.pin}`)
      .sort()
      .join("<->");
    if (seenConnections.has(key)) {
      diagnostics.push({
        severity: "warning",
        message: `Duplicate connection between ${conn.from.partId}:${conn.from.pin} and ${conn.to.partId}:${conn.to.pin}`,
        connectionId: conn.id,
      });
    }
    seenConnections.add(key);
  }

  const nets = generateNetlist(diagram);

  for (const net of nets) {
    const pinTypes = net.map(p => getPinType(p, diagram)).filter(t => t !== undefined) as PinType[];

    // 3. Power conflicts (e.g., VCC shorted to GND)
    const hasPower = pinTypes.includes("power");
    const hasGround = pinTypes.includes("ground");
    if (hasPower && hasGround) {
      diagnostics.push({
        severity: "error",
        message: "Short circuit detected: Power connected to Ground",
        partId: net[0].partId,
        pin: net[0].pin
      });
    }

    // 4. Output-Output conflicts
    const outputCount = pinTypes.filter(t => t === "output").length;
    if (outputCount > 1) {
       diagnostics.push({
        severity: "error",
        message: `Multiple outputs connected together (${outputCount} outputs)`,
        partId: net[0].partId,
        pin: net[0].pin
      });
    }
  }

  // 5. Floating required pins
  for (const part of diagram.parts) {
    const def = PARTS_REGISTRY.get(part.type);
    if (!def) continue;

    for (const pinDef of def.pins) {
      if (pinDef.required) {
        const isConnected = diagram.connections.some(
          c => (c.from.partId === part.id && c.from.pin === pinDef.name) ||
               (c.to.partId === part.id && c.to.pin === pinDef.name)
        );
        if (!isConnected) {
          diagnostics.push({
            severity: "error",
            message: `Required pin '${pinDef.name}' on '${part.id}' is not connected`,
            partId: part.id,
            pin: pinDef.name
          });
        }
      }
    }
  }

  return diagnostics;
}

function validatePinRef(ref: PinRef, connId: string, diagram: Diagram, diagnostics: Diagnostic[]) {
  const part = diagram.parts.find(p => p.id === ref.partId);
  if (!part) {
    diagnostics.push({
      severity: "error",
      message: `Connection refers to nonexistent part: ${ref.partId}`,
      connectionId: connId
    });
    return;
  }

  const def = PARTS_REGISTRY.get(part.type);
  if (!def) return; // Should probably be a separate error if part type is unknown

  const pinDef = def.pins.find(p => p.name === ref.pin);
  // Breadboard pins are dynamic, so we check if it's a breadboard
  if (!pinDef && !isBreadboardPin(part.type, ref.pin)) {
    diagnostics.push({
      severity: "error",
      message: `Part '${ref.partId}' (${def.label}) has no pin named '${ref.pin}'`,
      partId: ref.partId,
      pin: ref.pin,
      connectionId: connId
    });
  }
}

function getPinType(ref: PinRef, diagram: Diagram): PinType | undefined {
  const part = diagram.parts.find(p => p.id === ref.partId);
  if (!part) return undefined;

  const def = PARTS_REGISTRY.get(part.type);
  if (!def) return undefined;

  const pinDef = def.pins.find(p => p.name === ref.pin);
  if (pinDef?.type) return pinDef.type;

  // Breadboard logic
  if (part.type === "wokwi-breadboard") {
    if (ref.pin.includes("p")) return "power";
    if (ref.pin.includes("g")) return "ground";
    return "io";
  }

  return undefined;
}

function isBreadboardPin(type: string, pin: string): boolean {
    if (type !== "wokwi-breadboard") return false;
    // Basic check for breadboard pin patterns: 1a, 25j, tp.0, bg.24 etc.
    return /^\d+[a-j]$/.test(pin) || /^[tb][pg]\.\d+$/.test(pin);
}
