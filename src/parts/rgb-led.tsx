import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RGB_LED_DEFINITION: PartDefinition = {
  type: "wokwi-rgb-led",
  label: "RGB LED",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 35, height: 40 },
  pins: [
    { name: "R", x: 10, y: 40 },
    { name: "COM", x: 15, y: 40 },
    { name: "G", x: 20, y: 40 },
    { name: "B", x: 25, y: 40 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-rgb-led", { ...attrs, className: "wokwi-rgb-led" })}
    </div>
  ),
};


