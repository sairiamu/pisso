import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-lcd2004": any;
    }
  }
}

export const LCD2004_DEFINITION: PartDefinition = {
  type: "wokwi-lcd2004",
  label: "LCD 2004",
  category: "Displays",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-lcd2004", { ...attrs, className: "wokwi-lcd2004" })}
    </div>
  ),
};

registerPart(LCD2004_DEFINITION);
