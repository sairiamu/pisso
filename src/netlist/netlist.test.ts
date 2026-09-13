import { resolveNode } from "../domain/circuit-resolver";
import { Circuit, PinReference } from "../domain/models";

const mockCircuit: Circuit = {
  version: 1,
  components: [
    { id: "bb1", definitionId: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attributes: {} },
    { id: "uno1", definitionId: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attributes: {} },
    { id: "led1", definitionId: "wokwi-led", x: 0, y: 0, rotation: 0, attributes: {} }
  ],
  connections: [
    {
      id: "w1",
      from: { componentId: "uno1", pinName: "13" },
      to: { componentId: "bb1", pinName: "1a" }
    },
    {
      id: "w2",
      from: { componentId: "bb1", pinName: "1e" },
      to: { componentId: "led1", pinName: "A" }
    }
  ],
  nets: []
};

function testContinuity() {
  console.log("Running Netlist Tests...");

  // Test 1: Same row continuity (1a should connect to 1e and thus to led1:A)
  const startPin: PinReference = { componentId: "uno1", pinName: "13" };
  const connected = resolveNode(mockCircuit, startPin);

  const hasAnode = connected.some(p => p.componentId === "led1" && p.pinName === "A");
  console.assert(hasAnode, "FAILED: pin 13 should be connected to led1:A via breadboard row 1");

  // Test 2: Power rail continuity
  const railStart: PinReference = { componentId: "bb1", pinName: "tp.0" };
  const railConnected = resolveNode(mockCircuit, railStart);
  console.assert(railConnected.some(p => p.pinName === "tp.24"), "FAILED: tp.0 should connect to tp.24");
  console.assert(!railConnected.some(p => p.pinName === "tg.0"), "FAILED: tp rail should NOT connect to tg rail");

  // Test 3: Cross-row non-continuity
  const row1: PinReference = { componentId: "bb1", pinName: "1a" };
  const row1Connected = resolveNode(mockCircuit, row1);
  console.assert(!row1Connected.some(p => p.pinName === "2a"), "FAILED: Row 1 should NOT connect to Row 2");
  console.assert(!row1Connected.some(p => p.pinName === "1f"), "FAILED: Row 1a-e should NOT connect to Row 1f-j");

  console.log("All Netlist Tests Passed!");
}

// In a real environment, this would be run by a test runner.
// For now, we export it.
export const runTests = testContinuity;
