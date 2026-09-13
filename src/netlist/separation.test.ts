import { describe, it, expect } from "vitest";
import { generateNetlist } from "./generator";
import { Diagram } from "./types";

describe("Netlist/Visual Separation", () => {
  const baseDiagram: Diagram = {
    version: 1,
    parts: [
      { id: "p1", type: "wokwi-resistor", x: 10, y: 10, rotation: 0, attrs: { value: "1k" } },
      { id: "p2", type: "wokwi-led", x: 50, y: 10, rotation: 0, attrs: { color: "red" } }
    ],
    connections: [
      {
        id: "w1",
        from: { partId: "p1", pin: "pin2" },
        to: { partId: "p2", pin: "anode" }
      }
    ]
  };

  it("should produce the same netlist regardless of component position", () => {
    const movedDiagram: Diagram = {
      ...baseDiagram,
      parts: baseDiagram.parts.map(p => ({ ...p, x: p.x + 100, y: p.y + 200 }))
    };

    const netlist1 = generateNetlist(baseDiagram);
    const netlist2 = generateNetlist(movedDiagram);

    expect(netlist1).toEqual(netlist2);
  });

  it("should produce the same netlist regardless of component rotation", () => {
    const rotatedDiagram: Diagram = {
      ...baseDiagram,
      parts: baseDiagram.parts.map(p => ({ ...p, rotation: 90 }))
    };

    const netlist1 = generateNetlist(baseDiagram);
    const netlist2 = generateNetlist(rotatedDiagram);

    expect(netlist1).toEqual(netlist2);
  });

  it("should produce the same netlist regardless of visual appearance attributes", () => {
    const styledDiagram: Diagram = {
      ...baseDiagram,
      parts: baseDiagram.parts.map(p => ({
        ...p,
        attrs: { ...p.attrs, color: "blue", label: "Custom LED" }
      }))
    };

    const netlist1 = generateNetlist(baseDiagram);
    const netlist2 = generateNetlist(styledDiagram);

    expect(netlist1).toEqual(netlist2);
  });

  it("should produce the same netlist regardless of wire visual properties (color, thickness, waypoints)", () => {
    const decoratedDiagram: Diagram = {
      ...baseDiagram,
      connections: baseDiagram.connections.map(c => ({
        ...c,
        color: "#ff0000",
        thickness: 5,
        waypoints: [{ x: 100, y: 100 }]
      }))
    };

    const netlist1 = generateNetlist(baseDiagram);
    const netlist2 = generateNetlist(decoratedDiagram);

    expect(netlist1).toEqual(netlist2);
  });
});
