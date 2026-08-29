import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-pushbutton": any;
    }
  }
}

export const PUSHBUTTON_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton",
  label: "Pushbutton",
  category: "Basic",
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton", attrs)}
    </div>
  ),
};

registerPart(PUSHBUTTON_DEFINITION);
