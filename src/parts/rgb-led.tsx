import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

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


