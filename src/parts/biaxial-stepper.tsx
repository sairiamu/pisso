import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-biaxial-stepper": any;
    }
  }
}

export const BIAXIAL_STEPPER_DEFINITION: PartDefinition = {
  type: "wokwi-biaxial-stepper",
  label: "Biaxial Stepper Motor",
  category: "Actuators",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-biaxial-stepper", { ...attrs, className: "wokwi-biaxial-stepper" })}
    </div>
  ),
};

registerPart(BIAXIAL_STEPPER_DEFINITION);
