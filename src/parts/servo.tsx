import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

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


