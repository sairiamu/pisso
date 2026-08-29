import "@wokwi/elements";
import { PartDefinition } from "./types";
import { registerPart } from "./registry";
import React from "react";

export const ANALOG_JOYSTICK_DEFINITION: PartDefinition = {
  type: "wokwi-analog-joystick",
  label: "Analog Joystick",
  category: "Sensors",
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-analog-joystick", { ...attrs, className: "wokwi-analog-joystick" })}
    </div>
  ),
};

registerPart(ANALOG_JOYSTICK_DEFINITION);
