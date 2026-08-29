import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PHOTORESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-photoresistor-sensor",
  label: "Photoresistor (LDR)",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 25, height: 25 },
  pins: [
    { name: "1", x: 5, y: 25 },
    { name: "2", x: 20, y: 25 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-photoresistor-sensor", { ...attrs, className: "wokwi-photoresistor-sensor" })}
    </div>
  ),
};


