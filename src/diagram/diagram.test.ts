import { save } from "./save";
import { load } from "./load";
import { Diagram } from "./types";

export function testDiagramRoundTrip() {
  console.log("Running Diagram Round-trip Tests...");

  const original: Diagram = {
    version: 1,
    parts: [
      {
        id: "uno1",
        type: "wokwi-arduino-uno",
        x: 120,
        y: 80,
        rotation: 90,
        attrs: { "cpu": "atmega328p" }
      },
      {
        id: "led1",
        type: "wokwi-led",
        x: 320,
        y: 140,
        rotation: 0,
        attrs: { "color": "red" }
      }
    ],
    connections: [
      {
        id: "w1",
        from: { partId: "uno1", pin: "13" },
        to: { partId: "led1", pin: "anode" },
        route: [{ x: 200, y: 100 }, { x: 250, y: 100 }]
      }
    ]
  };

  const serialized = save(original);
  const reloaded = load(serialized);

  // Deep equality check (simple version for this test)
  const originalStr = JSON.stringify(original);
  const reloadedStr = JSON.stringify(reloaded);

  if (originalStr === reloadedStr) {
    console.log("SUCCESS: Round-trip identical!");
  } else {
    console.error("FAILED: Round-trip mismatch!");
    console.error("Original:", originalStr);
    console.error("Reloaded:", reloadedStr);
    throw new Error("Round-trip failed");
  }
}

// Export for execution if needed
// testDiagramRoundTrip();
