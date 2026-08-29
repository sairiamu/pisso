import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const NTC_TEMPERATURE_SENSOR_DEFINITION: PartDefinition = {
  type: "wokwi-ntc-temperature-sensor",
  label: "NTC Temperature Sensor",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ntc-temperature-sensor", { ...attrs, className: "wokwi-ntc-temperature-sensor" })}
    </div>
  ),
};

registerPart(NTC_TEMPERATURE_SENSOR_DEFINITION);
