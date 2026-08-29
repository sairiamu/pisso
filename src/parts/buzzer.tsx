import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const BUZZER_DEFINITION: PartDefinition = {
  type: "wokwi-buzzer",
  label: "Buzzer",
  category: "Actuators",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-buzzer", { ...attrs, className: "wokwi-buzzer" })}
    </div>
  ),
};

registerPart(BUZZER_DEFINITION);
