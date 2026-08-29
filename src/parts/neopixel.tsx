import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const NEOPIXEL_DEFINITION: PartDefinition = {
  type: "wokwi-neopixel",
  label: "NeoPixel LED",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-neopixel", { ...attrs, className: "wokwi-neopixel" })}
    </div>
  ),
};


