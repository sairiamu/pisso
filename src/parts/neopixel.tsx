import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const NEOPIXEL_DEFINITION: PartDefinition = {
  type: "wokwi-neopixel",
  label: "NeoPixel LED",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 5, height: 5 },
  pins: [
    { name: "DIN", x: 0, y: 1 },
    { name: "VCC", x: 0, y: 2 },
    { name: "GND", x: 0, y: 3 },
    { name: "DOUT", x: 0, y: 4 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-neopixel", { ...attrs, className: "wokwi-neopixel" })}
    </div>
  ),
};


