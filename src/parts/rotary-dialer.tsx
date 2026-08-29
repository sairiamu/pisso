import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const ROTARY_DIALER_DEFINITION: PartDefinition = {
  type: "wokwi-rotary-dialer",
  label: "Rotary Dialer",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 80, height: 80 },
  pins: [
    { name: "PULSE", x: 20, y: 80 },
    { name: "GND", x: 40, y: 80 },
    { name: "READY", x: 60, y: 80 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-rotary-dialer", { ...attrs, className: "wokwi-rotary-dialer" })}
    </div>
  ),
};


