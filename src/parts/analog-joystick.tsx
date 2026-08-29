import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const ANALOG_JOYSTICK_DEFINITION: PartDefinition = {
  type: "wokwi-analog-joystick",
  label: "Analog Joystick",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 100, height: 115.8 },
  pins: [
    { name: "GND", x: 71.4, y: 115.8 },
    { name: "VCC", x: 33, y: 115.8 },
    { name: "VERT", x: 42.6, y: 115.8 },
    { name: "HORZ", x: 52.2, y: 115.8 },
    { name: "SEL", x: 61.8, y: 115.8 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-analog-joystick", { ...attrs, className: "wokwi-analog-joystick" })}
    </div>
  ),
};


