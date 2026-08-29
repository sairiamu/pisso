import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-neopixel-matrix": any;
    }
  }
}

export const NEOPIXEL_MATRIX_DEFINITION: PartDefinition = {
  type: "wokwi-neopixel-matrix",
  label: "NeoPixel Matrix",
  category: "Displays",
  defaultAttrs: { rows: 8, cols: 8 },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-neopixel-matrix", { ...attrs, className: "wokwi-neopixel-matrix" })}
    </div>
  ),
};

registerPart(NEOPIXEL_MATRIX_DEFINITION);
