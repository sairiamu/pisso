import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RELAY_DEFINITION: PartDefinition = {
  type: "wokwi-ks2e-m-dc5",
  label: "Relay (KS2E-M-DC5)",
  category: "Actuators",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-ks2e-m-dc5", { ...attrs, className: "wokwi-ks2e-m-dc5" })}
    </div>
  ),
};


