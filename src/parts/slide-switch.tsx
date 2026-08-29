import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SLIDE_SWITCH_DEFINITION: PartDefinition = {
  type: "wokwi-slide-switch",
  label: "Slide Switch",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 12, height: 6 },
  pins: [
    { name: "1", x: 2, y: 6 },
    { name: "2", x: 6, y: 6 },
    { name: "3", x: 10, y: 6 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-slide-switch", { ...attrs, className: "wokwi-slide-switch" })}
    </div>
  ),
};


