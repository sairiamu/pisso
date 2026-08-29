import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LED_RING_DEFINITION: PartDefinition = {
  type: "wokwi-led-ring",
  label: "NeoPixel Ring",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 60, height: 60 },
  pins: [
    { name: "GND", x: 20, y: 60 },
    { name: "VCC", x: 30, y: 60 },
    { name: "DIN", x: 40, y: 60 },
    { name: "DOUT", x: 50, y: 60 },
  ],
  defaultAttrs: { pixels: 16 },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-led-ring", { ...attrs, className: "wokwi-led-ring" })}
    </div>
  ),
};


