import "@wokwi/elements";
import { PartDefinition } from "./types";
import { getPinValue } from "./utils";
import React from "react";

export const LED_BAR_GRAPH_DEFINITION: PartDefinition = {
  type: "wokwi-led-bar-graph",
  label: "LED Bar Graph",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 25.4, height: 10.16 },
  pins: [
    { name: "A1", x: 1.27, y: 10.16 }, { name: "A2", x: 3.81, y: 10.16 }, { name: "A3", x: 6.35, y: 10.16 }, { name: "A4", x: 8.89, y: 10.16 }, { name: "A5", x: 11.43, y: 10.16 }, { name: "A6", x: 13.97, y: 10.16 }, { name: "A7", x: 16.51, y: 10.16 }, { name: "A8", x: 19.05, y: 10.16 }, { name: "A9", x: 21.59, y: 10.16 }, { name: "A10", x: 24.13, y: 10.16 },
    { name: "C1", x: 1.27, y: 0 }, { name: "C2", x: 3.81, y: 0 }, { name: "C3", x: 6.35, y: 0 }, { name: "C4", x: 8.89, y: 0 }, { name: "C5", x: 11.43, y: 0 }, { name: "C6", x: 13.97, y: 0 }, { name: "C7", x: 16.51, y: 0 }, { name: "C8", x: 19.05, y: 0 }, { name: "C9", x: 21.59, y: 0 }, { name: "C10", x: 24.13, y: 0 },
  ],
  defaultAttrs: { color: "red" },
  render: ({ attrs, pinValues }) => {
    const values = Array.from({ length: 10 }, (_, i) => {
      const a = getPinValue(pinValues, `A${i + 1}`, "LED Bar Graph");
      const c = getPinValue(pinValues, `C${i + 1}`, "LED Bar Graph");
      return a === "HIGH" && c === "LOW" ? 1 : 0;
    });
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-led-bar-graph", {
          ...attrs,
          values,
          className: "wokwi-led-bar-graph",
        })}
      </div>
    );
  },
};


