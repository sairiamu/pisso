import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RELAY_DEFINITION: PartDefinition = {
  type: "wokwi-ks2e-m-dc5",
  label: "Relay (KS2E-M-DC5)",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 75.6, height: 37.8 },
  pins: [
    { name: "NO2", x: 5.5, y: 5.1 },
    { name: "NC2", x: 25, y: 5.1 },
    { name: "P2", x: 45, y: 5.1 },
    { name: "COIL2", x: 74, y: 5.1 },
    { name: "NO1", x: 5.5, y: 32.7 },
    { name: "NC1", x: 25, y: 32.7 },
    { name: "P1", x: 45, y: 32.7 },
    { name: "COIL1", x: 74, y: 32.7 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ks2e-m-dc5", { ...attrs, className: "wokwi-ks2e-m-dc5" })}
    </div>
  ),
};


