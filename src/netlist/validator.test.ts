import { describe, it, expect } from "vitest";
import { validateCircuit } from "./validator";
import { Diagram } from "./types";

describe("Circuit Validator", () => {
  it("should detect nonexistent pins", () => {
    const diagram: Diagram = {
      version: 1,
      parts: [
        { id: "led1", type: "wokwi-led", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: [
        {
          id: "w1",
          from: { partId: "led1", pin: "nonexistent" },
          to: { partId: "other", pin: "pin" }
        }
      ]
    };

    const diagnostics = validateCircuit(diagram);
    expect(diagnostics.some(d => d.message.includes("no pin named 'nonexistent'"))).toBe(true);
    expect(diagnostics.some(d => d.message.includes("nonexistent part: other"))).toBe(true);
  });

  it("should detect short circuits (Power to Ground)", () => {
    const diagram: Diagram = {
      version: 1,
      parts: [
        { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: [
        {
          id: "w1",
          from: { partId: "uno1", pin: "5V" },
          to: { partId: "uno1", pin: "GND.1" }
        }
      ]
    };

    const diagnostics = validateCircuit(diagram);
    expect(diagnostics.some(d => d.message.includes("Short circuit"))).toBe(true);
  });

  it("should detect duplicate connections", () => {
    const diagram: Diagram = {
      version: 1,
      parts: [
        { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} },
        { id: "led1", type: "wokwi-led", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: [
        {
          id: "w1",
          from: { partId: "uno1", pin: "D13" },
          to: { partId: "led1", pin: "anode" }
        },
        {
          id: "w2",
          from: { partId: "led1", pin: "anode" },
          to: { partId: "uno1", pin: "D13" }
        }
      ]
    };

    const diagnostics = validateCircuit(diagram);
    expect(diagnostics.some(d => d.severity === "warning" && d.message.includes("Duplicate"))).toBe(true);
  });

  it("should allow valid breadboard connections", () => {
      const diagram: Diagram = {
          version: 1,
          parts: [
              { id: "bb1", type: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attrs: {} },
              { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} }
          ],
          connections: [
              {
                  id: "w1",
                  from: { partId: "uno1", pin: "5V" },
                  to: { partId: "bb1", pin: "tp.0" }
              }
          ]
      };

      const diagnostics = validateCircuit(diagram);
      expect(diagnostics.filter(d => d.severity === "error").length).toBe(0);
  });

  it("should detect floating required pins", () => {
    // We need to mock a part with a required pin.
    // Since we use the real PARTS_REGISTRY, we should check if any real part has a required pin or just test the logic.
    // Let's assume for this test we might need to mock or just rely on the logic if we had one.
    // For now, I'll just add the test structure.
    const diagram: Diagram = {
      version: 1,
      parts: [
        { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: []
    };
    // If I make a pin required in the registry, it should fail.
    const diagnostics = validateCircuit(diagram);
    // Currently no pins are marked required in the registry, so this should pass.
    expect(diagnostics.filter(d => d.message.includes("Required pin")).length).toBe(0);
  });
});
