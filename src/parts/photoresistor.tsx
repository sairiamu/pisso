import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-photoresistor-sensor": any;
    }
  }
}

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

registerPart(PHOTORESISTOR_DEFINITION);
