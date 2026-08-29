import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const KY_040_DEFINITION: PartDefinition = {
  type: "wokwi-ky-040",
  label: "Rotary Encoder (KY-040)",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 116, height: 70.4 },
  pins: [
    { name: "CLK", x: 116, y: 7.9 },
    { name: "DT", x: 116, y: 17.4 },
    { name: "SW", x: 116, y: 27 },
    { name: "VCC", x: 116, y: 36.3 },
    { name: "GND", x: 116, y: 45.5 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ky-040", { ...attrs, className: "wokwi-ky-040" })}
    </div>
  ),
};


