import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const BIAXIAL_STEPPER_DEFINITION: PartDefinition = {
  type: "wokwi-biaxial-stepper",
  label: "Biaxial Stepper Motor",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 212, height: 255 },
  pins: [],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-biaxial-stepper", { ...attrs, className: "wokwi-biaxial-stepper" })}
    </div>
  ),
};


