import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const NTC_TEMPERATURE_SENSOR_DEFINITION: PartDefinition = {
  type: "wokwi-ntc-temperature-sensor",
  label: "NTC Temperature Sensor",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 10, height: 10 },
  pins: [
    { name: "pin1", x: 2, y: 10 },
    { name: "pin2", x: 8, y: 10 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ntc-temperature-sensor", { ...attrs, className: "wokwi-ntc-temperature-sensor" })}
    </div>
  ),
};


