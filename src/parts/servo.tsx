import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SERVO_DEFINITION: PartDefinition = {
  type: "wokwi-servo",
  label: "Servo Motor",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 45, height: 40 },
  pins: [
    { name: "PWM", x: 10, y: 40 },
    { name: "VCC", x: 15, y: 40 },
    { name: "GND", x: 20, y: 40 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-servo", { ...attrs, className: "wokwi-servo" })}
    </div>
  ),
};


