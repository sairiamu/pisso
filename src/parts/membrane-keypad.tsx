import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const MEMBRANE_KEYPAD_DEFINITION: PartDefinition = {
  type: "wokwi-membrane-keypad",
  label: "Membrane Keypad",
  category: "Sensors",
  defaultAttrs: { columns: "4" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-membrane-keypad", { ...attrs, className: "wokwi-membrane-keypad" })}
    </div>
  ),
};


