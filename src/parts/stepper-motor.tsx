import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const STEPPER_MOTOR_DEFINITION: PartDefinition = {
  type: "wokwi-stepper-motor",
  label: "Stepper Motor",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 42, height: 42 },
  pins: [
    { name: "A-", x: 10, y: 42 },
    { name: "A+", x: 15, y: 42 },
    { name: "B+", x: 20, y: 42 },
    { name: "B-", x: 25, y: 42 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-stepper-motor", { ...attrs, className: "wokwi-stepper-motor" })}
    </div>
  ),
};


