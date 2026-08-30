import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const SERVO_DEFINITION: PartDefinition = {
  type: "wokwi-servo",
  label: "Servo Motor",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 170.1, height: 151.2 },
  pins: [
    { name: "PWM", x: 37.8, y: 151.2 },
    { name: "V+", x: 56.7, y: 151.2 },
    { name: "GND", x: 75.6, y: 151.2 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-servo", { ...attrs, className: "wokwi-servo" })}
    </div>
  ),
};


