import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SLIDE_SWITCH_DEFINITION: PartDefinition = {
  type: "wokwi-slide-switch",
  label: "Slide Switch",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 45.36, height: 22.68 },
  pins: [
    { name: "1", x: 7.56, y: 22.68 },
    { name: "2", x: 22.68, y: 22.68 },
    { name: "3", x: 37.8, y: 22.68 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-slide-switch", { ...attrs, className: "wokwi-slide-switch" })}
    </div>
  ),
};


