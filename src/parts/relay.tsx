import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RELAY_DEFINITION: PartDefinition = {
  type: "wokwi-ks2e-m-dc5",
  label: "Relay (KS2E-M-DC5)",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 20, height: 10 },
  pins: [
    { name: "1", x: 2, y: 10 },
    { name: "2", x: 4, y: 10 },
    { name: "3", x: 6, y: 10 },
    { name: "4", x: 8, y: 10 },
    { name: "5", x: 10, y: 10 },
    { name: "6", x: 12, y: 10 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ks2e-m-dc5", { ...attrs, className: "wokwi-ks2e-m-dc5" })}
    </div>
  ),
};


