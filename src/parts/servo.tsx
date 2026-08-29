import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-servo": any;
    }
  }
}

export const SERVO_DEFINITION: PartDefinition = {
  type: "wokwi-servo",
  label: "Servo Motor",
  category: "Actuators",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-servo", { ...attrs, className: "wokwi-servo" })}
    </div>
  ),
};

registerPart(SERVO_DEFINITION);
