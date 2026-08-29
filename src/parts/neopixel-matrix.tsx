import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const NEOPIXEL_MATRIX_DEFINITION: PartDefinition = {
  type: "wokwi-neopixel-matrix",
  label: "NeoPixel Matrix",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 64, height: 64 },
  pins: [
    { name: "VCC", x: 10, y: 64 },
    { name: "GND", x: 20, y: 64 },
    { name: "DIN", x: 30, y: 64 },
    { name: "DOUT", x: 40, y: 64 },
  ],
  defaultAttrs: { rows: 8, cols: 8 },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-neopixel-matrix", { ...attrs, className: "wokwi-neopixel-matrix" })}
    </div>
  ),
};


