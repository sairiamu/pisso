import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const DIP_SWITCH_8_DEFINITION: PartDefinition = {
  type: "wokwi-dip-switch-8",
  label: "8-Position DIP Switch",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-dip-switch-8", { ...attrs, className: "wokwi-dip-switch-8" })}
    </div>
  ),
};

registerPart(DIP_SWITCH_8_DEFINITION);
