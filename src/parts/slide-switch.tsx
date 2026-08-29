import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const SLIDE_SWITCH_DEFINITION: PartDefinition = {
  type: "wokwi-slide-switch",
  label: "Slide Switch",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-slide-switch", { ...attrs, className: "wokwi-slide-switch" })}
    </div>
  ),
};

registerPart(SLIDE_SWITCH_DEFINITION);
