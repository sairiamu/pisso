import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-hc-sr04": any;
    }
  }
}

export const HC_SR04_DEFINITION: PartDefinition = {
  type: "wokwi-hc-sr04",
  label: "HC-SR04 Ultrasonic Distance Sensor",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-hc-sr04", { ...attrs, className: "wokwi-hc-sr04" })}
    </div>
  ),
};

registerPart(HC_SR04_DEFINITION);
