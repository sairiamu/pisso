import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

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


