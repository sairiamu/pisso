import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-stepper-motor": any;
    }
  }
}

export const STEPPER_MOTOR_DEFINITION: PartDefinition = {
  type: "wokwi-stepper-motor",
  label: "Stepper Motor",
  category: "Actuators",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-stepper-motor", { ...attrs, className: "wokwi-stepper-motor" })}
    </div>
  ),
};

registerPart(STEPPER_MOTOR_DEFINITION);
