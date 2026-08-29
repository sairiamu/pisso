import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const BREADBOARD_DEFINITION: PartDefinition = {
  type: "wokwi-breadboard",
  label: "Breadboard",
  category: "Basic",
  viewBox: { x: 0, y: 0, width: 300, height: 100 },
  pins: [], // Dynamically handled or needs migration
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-breadboard", attrs)}
    </div>
  ),
};


