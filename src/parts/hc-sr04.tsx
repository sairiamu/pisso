import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const HC_SR04_DEFINITION: PartDefinition = {
  type: "wokwi-hc-sr04",
  label: "HC-SR04 Ultrasonic Distance Sensor",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 45, height: 25 },
  pins: [
    { name: "VCC", x: 71.3, y: 94.5 },
    { name: "TRIG", x: 81.3, y: 94.5 },
    { name: "ECHO", x: 91.3, y: 94.5 },
    { name: "GND", x: 101.3, y: 94.5 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-hc-sr04", { ...attrs, className: "wokwi-hc-sr04" })}
    </div>
  ),
};


