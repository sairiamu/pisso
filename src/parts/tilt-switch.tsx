import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const TILT_SWITCH_DEFINITION: PartDefinition = {
  type: "wokwi-tilt-switch",
  label: "Tilt Switch",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-tilt-switch", { ...attrs, className: "wokwi-tilt-switch" })}
    </div>
  ),
};

registerPart(TILT_SWITCH_DEFINITION);
