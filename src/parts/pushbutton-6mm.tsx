import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PUSHBUTTON_6MM_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton-6mm",
  label: "Pushbutton 6mm",
  category: "Sensors",
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton-6mm", { ...attrs, className: "wokwi-pushbutton-6mm" })}
    </div>
  ),
};


