import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const POTENTIOMETER_DEFINITION: PartDefinition = {
  type: "wokwi-potentiometer",
  label: "Potentiometer",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 143.64, height: 181.44 },
  pins: [
    { name: "1", x: 0, y: 181.44 },
    { name: "2", x: 71.82, y: 181.44 },
    { name: "3", x: 143.64, y: 181.44 },
  ],
  defaultAttrs: { value: "10000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-potentiometer", { ...attrs, className: "wokwi-potentiometer" })}
    </div>
  ),
};


