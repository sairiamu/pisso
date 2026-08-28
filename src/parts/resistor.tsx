import "@wokwi/elements";
import { PartDefinition, PartPin } from "./types";
import { registerPart } from "./registry";
import React from "react";
import { Pin } from "../components/Pin";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-resistor": any;
    }
  }
}

const RESISTOR_PINS: PartPin[] = [
  { name: "1", x: 0, y: 6 },
  { name: "2", x: 67, y: 6 },
];

export const RESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-resistor",
  label: "Resistor",
  category: "Basic",
  pins: RESISTOR_PINS,
  defaultAttrs: { value: "1000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-resistor", attrs)}
    </div>
  ),
};

registerPart(RESISTOR_DEFINITION);
