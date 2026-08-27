import "@wokwi/elements";
import { PartDefinition, PartPin } from "./types";
import { registerPart } from "./registry";
import React from "react";
import { Pin } from "../components/Pin";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-pushbutton": any;
    }
  }
}

const PUSHBUTTON_PINS: PartPin[] = [
  { name: "1.L", x: 1, y: 1 },
  { name: "1.R", x: 35, y: 1 },
  { name: "2.L", x: 1, y: 23 },
  { name: "2.R", x: 35, y: 23 },
];

export const PUSHBUTTON_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton",
  label: "Pushbutton",
  category: "Basic",
  pins: PUSHBUTTON_PINS,
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton", attrs)}
      {PUSHBUTTON_PINS.map((pin) => (
        <Pin key={pin.name} id={pin.name} x={pin.x} y={pin.y} />
      ))}
    </div>
  ),
};

registerPart(PUSHBUTTON_DEFINITION);
