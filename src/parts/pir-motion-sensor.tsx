import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PIR_MOTION_SENSOR_DEFINITION: PartDefinition = {
  type: "wokwi-pir-motion-sensor",
  label: "PIR Motion Sensor",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pir-motion-sensor", { ...attrs, className: "wokwi-pir-motion-sensor" })}
    </div>
  ),
};


