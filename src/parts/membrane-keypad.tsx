import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const MEMBRANE_KEYPAD_DEFINITION: PartDefinition = {
  type: "wokwi-membrane-keypad",
  label: "Membrane Keypad",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 68, height: 68 },
  pins: [
    { name: "R1", x: 10, y: 68 },
    { name: "R2", x: 15, y: 68 },
    { name: "R3", x: 20, y: 68 },
    { name: "R4", x: 25, y: 68 },
    { name: "C1", x: 30, y: 68 },
    { name: "C2", x: 35, y: 68 },
    { name: "C3", x: 40, y: 68 },
    { name: "C4", x: 45, y: 68 },
  ],
  defaultAttrs: { columns: "4" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-membrane-keypad", { ...attrs, className: "wokwi-membrane-keypad" })}
    </div>
  ),
};


