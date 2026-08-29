import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const BUZZER_DEFINITION: PartDefinition = {
  type: "wokwi-buzzer",
  label: "Buzzer",
  category: "Actuators",
  viewBox: { x: 0, y: 0, width: 64, height: 84 },
  pins: [
    { name: "1", x: 27, y: 84 },
    { name: "2", x: 37, y: 84 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-buzzer", { ...attrs, className: "wokwi-buzzer" })}
    </div>
  ),
};


