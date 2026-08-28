import "@wokwi/elements";
import { PartDefinition, PartPin } from "./types";
import { registerPart } from "./registry";
import React from "react";
import { Pin } from "../components/Pin";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-led": any;
    }
  }
}

const LED_PINS: PartPin[] = [
  { name: "anode", x: 14.5, y: 55 },
  { name: "cathode", x: 4.5, y: 55 },
];

export const LED_DEFINITION: PartDefinition = {
  type: "wokwi-led",
  label: "LED",
  category: "Basic",
  pins: LED_PINS,
  defaultAttrs: { color: "red" },
  render: ({ attrs, pinValues }) => {
    const isOn = pinValues?.anode === 'HIGH' && pinValues?.cathode === 'LOW';
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-led", { ...attrs, value: isOn })}
      </div>
    );
  },
};

registerPart(LED_DEFINITION);
