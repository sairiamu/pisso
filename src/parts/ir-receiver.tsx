import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

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


