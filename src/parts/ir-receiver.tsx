import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-ir-receiver": any;
    }
  }
}

export const IR_RECEIVER_DEFINITION: PartDefinition = {
  type: "wokwi-ir-receiver",
  label: "IR Receiver",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ir-receiver", { ...attrs, className: "wokwi-ir-receiver" })}
    </div>
  ),
};

registerPart(IR_RECEIVER_DEFINITION);
