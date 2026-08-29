import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-resistor": any;
    }
  }
}

export const RESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-resistor",
  label: "Resistor",
  category: "Basic",
  defaultAttrs: { value: "1000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-resistor", attrs)}
    </div>
  ),
};

registerPart(RESISTOR_DEFINITION);
