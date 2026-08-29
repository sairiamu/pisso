import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const RESISTOR_DEFINITION: PartDefinition = {
  type: "wokwi-resistor",
  label: "Resistor",
  category: "Basic",
  defaultAttrs: { value: "1000" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-resistor", attrs)}
    </div>
  ),
};


