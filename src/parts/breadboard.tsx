import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-breadboard": any;
    }
  }
}

export const BREADBOARD_DEFINITION: PartDefinition = {
  type: "wokwi-breadboard",
  label: "Breadboard",
  category: "Basic",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-breadboard", attrs)}
    </div>
  ),
};

registerPart(BREADBOARD_DEFINITION);
