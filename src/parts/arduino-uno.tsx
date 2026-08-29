import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

// Extend JSX namespace to support wokwi elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-arduino-uno": any;
    }
  }
}

export const ARDUINO_UNO_DEFINITION: PartDefinition = {
  type: "wokwi-arduino-uno",
  label: "Arduino Uno",
  category: "Microcontrollers",
  defaultAttrs: {},
  render: ({ attrs }) => {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-arduino-uno", attrs)}
      </div>
    );
  },
};

// Auto-register when this file is imported
registerPart(ARDUINO_UNO_DEFINITION);
