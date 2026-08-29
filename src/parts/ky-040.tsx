import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const KY_040_DEFINITION: PartDefinition = {
  type: "wokwi-ky-040",
  label: "Rotary Encoder (KY-040)",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ky-040", { ...attrs, className: "wokwi-ky-040" })}
    </div>
  ),
};


