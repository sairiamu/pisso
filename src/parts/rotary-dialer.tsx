import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const ROTARY_DIALER_DEFINITION: PartDefinition = {
  type: "wokwi-rotary-dialer",
  label: "Rotary Dialer",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-rotary-dialer", { ...attrs, className: "wokwi-rotary-dialer" })}
    </div>
  ),
};

registerPart(ROTARY_DIALER_DEFINITION);
