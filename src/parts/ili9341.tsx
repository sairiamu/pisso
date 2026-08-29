import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const ILI9341_DEFINITION: PartDefinition = {
  type: "wokwi-ili9341",
  label: "ILI9341 TFT LCD",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 46.5, height: 77.6 },
  pins: [
    { name: "VCC", x: 48.3, y: 287.2 },
    { name: "GND", x: 57.9, y: 287.2 },
    { name: "CS", x: 67.5, y: 287.2 },
    { name: "RST", x: 77.1, y: 287.2 },
    { name: "D/C", x: 86.7, y: 287.2 },
    { name: "MOSI", x: 96.3, y: 287.2 },
    { name: "SCK", x: 105.9, y: 287.2 },
    { name: "LED", x: 115.5, y: 287.2 },
    { name: "MISO", x: 125.1, y: 287.2 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ili9341", { ...attrs, className: "wokwi-ili9341" })}
    </div>
  ),
};


