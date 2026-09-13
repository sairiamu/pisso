import { describe, it, expect } from "vitest";
import { generateNetlist } from "./generator";
import { Diagram } from "./types";

describe("Netlist Generator", () => {
  const mockDiagram: Diagram = {
    version: 1,
    parts: [
      { id: "bb1", type: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attrs: {} },
      { id: "uno1", type: "wokwi-arduino-uno", x: 100, y: 100, rotation: 0, attrs: {} },
      { id: "led1", type: "wokwi-led", x: 200, y: 200, rotation: 0, attrs: {} }
    ],
    connections: [
      {
        id: "w1",
        from: { partId: "uno1", pin: "D13" },
        to: { partId: "bb1", pin: "1a" }
      },
      {
        id: "w2",
        from: { partId: "bb1", pin: "1e" },
        to: { partId: "led1", pin: "anode" }
      }
    ]
  };

  it("should identify breadboard row continuity", () => {
    const nets = generateNetlist(mockDiagram);
    const mainNet = nets.find(net => net.some(p => p.partId === "uno1" && p.pin === "D13"));

    expect(mainNet).toBeDefined();

    const expectedPins = [
      { partId: "uno1", pin: "D13" },
      { partId: "bb1", pin: "1a" },
      { partId: "bb1", pin: "1b" },
      { partId: "bb1", pin: "1c" },
      { partId: "bb1", pin: "1d" },
      { partId: "bb1", pin: "1e" },
      { partId: "led1", pin: "anode" }
    ];

    for (const exp of expectedPins) {
      expect(mainNet).toContainEqual(exp);
    }
  });

  it("should be deterministic regardless of part/connection order", () => {
    const scrambled: Diagram = {
      ...mockDiagram,
      parts: [...mockDiagram.parts].reverse(),
      connections: [...mockDiagram.connections].reverse()
    };

    const nets1 = generateNetlist(mockDiagram);
    const nets2 = generateNetlist(scrambled);

    expect(nets1).toEqual(nets2);
  });

  it("should handle power rail continuity", () => {
    const railDiagram: Diagram = {
      version: 1,
      parts: [
        { id: "bb1", type: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attrs: {} },
        { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: [
        { id: "w1", from: { partId: "bb1", pin: "tp.0" }, to: { partId: "uno1", pin: "5V" } }
      ]
    };

    const nets = generateNetlist(railDiagram);
    const railNet = nets.find(n => n.some(p => p.pin === "tp.0"));

    expect(railNet).toContainEqual({ partId: "bb1", pin: "tp.24" });
    expect(railNet).not.toContainEqual({ partId: "bb1", pin: "tg.0" });
  });

  it("should not connect different breadboard rows", () => {
    const diagram: Diagram = {
      version: 1,
      parts: [
        { id: "bb1", type: "wokwi-breadboard", x: 0, y: 0, rotation: 0, attrs: {} },
        { id: "uno1", type: "wokwi-arduino-uno", x: 0, y: 0, rotation: 0, attrs: {} }
      ],
      connections: [
        { id: "w1", from: { partId: "bb1", pin: "1a" }, to: { partId: "uno1", pin: "D1" } },
        { id: "w2", from: { partId: "bb1", pin: "2a" }, to: { partId: "uno1", pin: "D2" } }
      ]
    };

    const nets = generateNetlist(diagram);
    const net1 = nets.find(n => n.some(p => p.pin === "1a"));
    const net2 = nets.find(n => n.some(p => p.pin === "2a"));

    expect(net1).not.toEqual(net2);
    expect(net1).not.toContainEqual({ partId: "bb1", pin: "2a" });
  });
});
