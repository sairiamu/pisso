import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-potentiometer": any;
    }
  }
}

export const POTENTIOMETER_DEFINITION: PartDefinition = {
  type: "wokwi-potentiometer",
  label: "Potentiometer",
  category: "Sensors",
  defaultAttrs: { value: "10000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-potentiometer", { ...attrs, className: "wokwi-potentiometer" })}
    </div>
  ),
};

registerPart(POTENTIOMETER_DEFINITION);
