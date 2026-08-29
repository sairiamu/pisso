import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const POTENTIOMETER_DEFINITION: PartDefinition = {
  type: "wokwi-potentiometer",
  label: "Potentiometer",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 38, height: 48 },
  pins: [
    { name: "1", x: 0, y: 48 },
    { name: "2", x: 19, y: 48 },
    { name: "3", x: 38, y: 48 },
  ],
  defaultAttrs: { value: "10000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-potentiometer", { ...attrs, className: "wokwi-potentiometer" })}
    </div>
  ),
};


