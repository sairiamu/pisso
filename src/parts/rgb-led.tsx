import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-rgb-led": any;
    }
  }
}

export const RGB_LED_DEFINITION: PartDefinition = {
  type: "wokwi-rgb-led",
  label: "RGB LED",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-rgb-led", { ...attrs, className: "wokwi-rgb-led" })}
    </div>
  ),
};

registerPart(RGB_LED_DEFINITION);
