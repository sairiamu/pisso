import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-ssd1306": any;
    }
  }
}

export const SSD1306_DEFINITION: PartDefinition = {
  type: "wokwi-ssd1306",
  label: "SSD1306 OLED Display",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ssd1306", { ...attrs, className: "wokwi-ssd1306" })}
    </div>
  ),
};

registerPart(SSD1306_DEFINITION);
