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
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-led", attrs)}
      {LED_PINS.map((pin) => (
        <Pin key={pin.name} id={pin.name} x={pin.x} y={pin.y} />
      ))}
    </div>
  ),
};

registerPart(LED_DEFINITION);
