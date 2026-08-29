import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LED_RING_DEFINITION: PartDefinition = {
  type: "wokwi-led-ring",
  label: "NeoPixel Ring",
  category: "Displays",
  defaultAttrs: { pixels: 16 },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-led-ring", { ...attrs, className: "wokwi-led-ring" })}
    </div>
  ),
};


