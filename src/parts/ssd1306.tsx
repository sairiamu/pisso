import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SSD1306_DEFINITION: PartDefinition = {
  type: "wokwi-ssd1306",
  label: "SSD1306 OLED Display",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 35, height: 35 },
  pins: [
    { name: "GND", x: 10, y: 35 },
    { name: "VCC", x: 15, y: 35 },
    { name: "SCL", x: 20, y: 35 },
    { name: "SDA", x: 25, y: 35 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ssd1306", { ...attrs, className: "wokwi-ssd1306" })}
    </div>
  ),
};


