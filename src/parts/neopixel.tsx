import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-neopixel": any;
    }
  }
}

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

registerPart(NEOPIXEL_DEFINITION);
