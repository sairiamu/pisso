import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PUSHBUTTON_6MM_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton-6mm",
  label: "Pushbutton 6mm",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 6, height: 6 },
  pins: [
    { name: "1", x: 0, y: 1 },
    { name: "2", x: 6, y: 1 },
    { name: "3", x: 0, y: 5 },
    { name: "4", x: 6, y: 5 },
  ],
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton-6mm", { ...attrs, className: "wokwi-pushbutton-6mm" })}
    </div>
  ),
};


