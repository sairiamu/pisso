import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-led-bar-graph": any;
    }
  }
}

export const LED_BAR_GRAPH_DEFINITION: PartDefinition = {
  type: "wokwi-led-bar-graph",
  label: "LED Bar Graph",
  category: "Displays",
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-led-bar-graph", { ...attrs, className: "wokwi-led-bar-graph" })}
    </div>
  ),
};

registerPart(LED_BAR_GRAPH_DEFINITION);
