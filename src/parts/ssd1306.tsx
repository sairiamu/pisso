import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SSD1306_DEFINITION: PartDefinition = {
  type: "wokwi-ssd1306",
  label: "SSD1306 OLED Display",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 132.3, height: 132.3 },
  pins: [
    { name: "GND", x: 37.8, y: 132.3 },
    { name: "VCC", x: 56.7, y: 132.3 },
    { name: "SCL", x: 75.6, y: 132.3 },
    { name: "SDA", x: 94.5, y: 132.3 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ssd1306", { ...attrs, className: "wokwi-ssd1306" })}
    </div>
  ),
};


