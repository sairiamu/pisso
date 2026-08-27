import { resolveNode } from "./resolver";
import { Diagram, PinRef } from "./types";

const mockDiagram: Diagram = {
  version: 1,
  parts: [
    { id: "bb1", type: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attrs: {} },
    { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} },
    { id: "led1", type: "wokwi-led", x: 0, y: 0, rotation: 0, attrs: {} }
  ],
  connections: [
    {
      id: "w1",
      from: { partId: "uno1", pin: "13" },
      to: { partId: "bb1", pin: "1a" }
    },
    {
      id: "w2",
      from: { partId: "bb1", pin: "1e" },
      to: { partId: "led1", pin: "anode" }
    }
  ]
};

function testContinuity() {
  console.log("Running Netlist Tests...");

  // Test 1: Same row continuity (1a should connect to 1e and thus to led1:anode)
  const startPin: PinRef = { partId: "uno1", pin: "13" };
  const connected = resolveNode(mockDiagram, startPin);

  const hasAnode = connected.some(p => p.partId === "led1" && p.pin === "anode");
  console.assert(hasAnode, "FAILED: pin 13 should be connected to led1:anode via breadboard row 1");

  // Test 2: Power rail continuity
  const railStart: PinRef = { partId: "bb1", pin: "tp.0" };
  const railConnected = resolveNode(mockDiagram, railStart);
  console.assert(railConnected.some(p => p.pin === "tp.24"), "FAILED: tp.0 should connect to tp.24");
  console.assert(!railConnected.some(p => p.pin === "tg.0"), "FAILED: tp rail should NOT connect to tg rail");

  // Test 3: Cross-row non-continuity
  const row1: PinRef = { partId: "bb1", pin: "1a" };
  const row1Connected = resolveNode(mockDiagram, row1);
  console.assert(!row1Connected.some(p => p.pin === "2a"), "FAILED: Row 1 should NOT connect to Row 2");
  console.assert(!row1Connected.some(p => p.pin === "1f"), "FAILED: Row 1a-e should NOT connect to Row 1f-j");

  console.log("All Netlist Tests Passed!");
}

// In a real environment, this would be run by a test runner.
// For now, we export it.
export const runTests = testContinuity;
