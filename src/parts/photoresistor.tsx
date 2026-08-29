import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PHOTORESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-photoresistor-sensor",
  label: "Photoresistor (LDR)",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-photoresistor-sensor", { ...attrs, className: "wokwi-photoresistor-sensor" })}
    </div>
  ),
};


