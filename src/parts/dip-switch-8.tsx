import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const DIP_SWITCH_8_DEFINITION: PartDefinition = {
  type: "wokwi-dip-switch-8",
  label: "8-Position DIP Switch",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 83.4, height: 51.3 },
  pins: [
    { name: "1a", x: 8.1, y: 51.3 },
    { name: "2a", x: 17.7, y: 51.3 },
    { name: "3a", x: 27.3, y: 51.3 },
    { name: "4a", x: 36.9, y: 51.3 },
    { name: "5a", x: 46.5, y: 51.3 },
    { name: "6a", x: 56.1, y: 51.3 },
    { name: "7a", x: 65.7, y: 51.3 },
    { name: "8a", x: 75.3, y: 51.3 },
    { name: "1b", x: 8.1, y: 3 },
    { name: "2b", x: 17.7, y: 3 },
    { name: "3b", x: 27.3, y: 3 },
    { name: "4b", x: 36.9, y: 3 },
    { name: "5b", x: 46.5, y: 3 },
    { name: "6b", x: 56.1, y: 3 },
    { name: "7b", x: 65.7, y: 3 },
    { name: "8b", x: 75.3, y: 3 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-dip-switch-8", { ...attrs, className: "wokwi-dip-switch-8" })}
    </div>
  ),
};


