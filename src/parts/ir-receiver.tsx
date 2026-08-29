import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const IR_RECEIVER_DEFINITION: PartDefinition = {
  type: "wokwi-ir-receiver",
  label: "IR Receiver",
  category: "Sensors",
  viewBox: { x: 0, y: 0, width: 61.1, height: 88.7 },
  pins: [
    { name: "GND", x: 20.977, y: 87.75 },
    { name: "VCC", x: 30.578, y: 87.75 },
    { name: "DAT", x: 40.18, y: 87.75 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ir-receiver", { ...attrs, className: "wokwi-ir-receiver" })}
    </div>
  ),
};


