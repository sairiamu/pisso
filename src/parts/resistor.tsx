import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-resistor",
  label: "Resistor",
  category: "Basic",
  viewBox: { x: 0, y: 0, width: 15.645, height: 3 },
  pins: [
    { name: "1", x: 0, y: 5.65 },
    { name: "2", x: 58.8, y: 5.65 },
  ],
  defaultAttrs: { value: "1000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-resistor", attrs)}
    </div>
  ),
};


