import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PUSHBUTTON_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton",
  label: "Pushbutton",
  category: "Basic",
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton", { ...attrs, className: "wokwi-pushbutton" })}
    </div>
  ),
};


