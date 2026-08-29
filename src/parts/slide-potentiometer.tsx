import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SLIDE_POTENTIOMETER_DEFINITION: PartDefinition = {
  type: "wokwi-slide-potentiometer",
  label: "Slide Potentiometer",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 88, height: 15 },
  pins: [
    { name: "1", x: 0, y: 15 },
    { name: "2", x: 44, y: 15 },
    { name: "3", x: 88, y: 15 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-slide-potentiometer", { ...attrs, className: "wokwi-slide-potentiometer" })}
    </div>
  ),
};


