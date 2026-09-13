import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const DIP_SWITCH_8_DEFINITION: PartDefinition = {
  type: "wokwi-dip-switch-8",
  label: "8-Position DIP Switch",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 83.4, height: 51.3 },
  pins: [
    { name: "1", x: 8.1, y: 51.3 },
    { name: "2", x: 17.7, y: 51.3 },
    { name: "3", x: 27.3, y: 51.3 },
    { name: "4", x: 36.9, y: 51.3 },
    { name: "5", x: 46.5, y: 51.3 },
    { name: "6", x: 56.1, y: 51.3 },
    { name: "7", x: 65.7, y: 51.3 },
    { name: "8", x: 75.3, y: 51.3 },
    { name: "16", x: 8.1, y: 3 },
    { name: "15", x: 17.7, y: 3 },
    { name: "14", x: 27.3, y: 3 },
    { name: "13", x: 36.9, y: 3 },
    { name: "12", x: 46.5, y: 3 },
    { name: "11", x: 56.1, y: 3 },
    { name: "10", x: 65.7, y: 3 },
    { name: "9", x: 75.3, y: 3 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-dip-switch-8", { ...attrs, className: "wokwi-dip-switch-8" })}
    </div>
  ),
};


