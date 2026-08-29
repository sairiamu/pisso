import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PIR_MOTION_SENSOR_DEFINITION: PartDefinition = {
  type: "wokwi-pir-motion-sensor",
  label: "PIR Motion Sensor",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 32, height: 24 },
  pins: [
    { name: "VCC", x: 8, y: 24 },
    { name: "OUT", x: 16, y: 24 },
    { name: "GND", x: 24, y: 24 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pir-motion-sensor", { ...attrs, className: "wokwi-pir-motion-sensor" })}
    </div>
  ),
};


