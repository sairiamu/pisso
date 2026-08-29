import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const PUSHBUTTON_DEFINITION: PartDefinition = {
  type: "wokwi-pushbutton",
  label: "Pushbutton",
  category: "Basic",
  viewBox: { x: -3, y: 0, width: 18, height: 12 },
  pins: [
    { name: "1.l", x: 0, y: 13 },
    { name: "2.l", x: 0, y: 32 },
    { name: "1.r", x: 67, y: 13 },
    { name: "2.r", x: 67, y: 32 },
  ],
  defaultAttrs: { color: "red" },
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-pushbutton", { ...attrs, className: "wokwi-pushbutton" })}
    </div>
  ),
};


