import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RELAY_DEFINITION: PartDefinition = {
  type: "wokwi-ks2e-m-dc5",
  label: "Relay (KS2E-M-DC5)",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 75.6, height: 37.8 },
  pins: [
    { name: "1", x: 7.56, y: 37.8 },
    { name: "2", x: 15.12, y: 37.8 },
    { name: "3", x: 22.68, y: 37.8 },
    { name: "4", x: 30.24, y: 37.8 },
    { name: "5", x: 37.8, y: 37.8 },
    { name: "6", x: 45.36, y: 37.8 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ks2e-m-dc5", { ...attrs, className: "wokwi-ks2e-m-dc5" })}
    </div>
  ),
};


