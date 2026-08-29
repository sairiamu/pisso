import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const SLIDE_POTENTIOMETER_DEFINITION: PartDefinition = {
  type: "wokwi-slide-potentiometer",
  label: "Slide Potentiometer",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-slide-potentiometer", { ...attrs, className: "wokwi-slide-potentiometer" })}
    </div>
  ),
};

registerPart(SLIDE_POTENTIOMETER_DEFINITION);
