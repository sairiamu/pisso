import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LED_DEFINITION: PartDefinition = {
  type: "wokwi-led",
  label: "LED",
  category: "Displays",
  defaultAttrs: { color: "red" },
  render: ({ attrs, pinValues }) => {
    const isOn = pinValues?.anode === 'HIGH' && pinValues?.cathode === 'LOW';
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-led", { ...attrs, value: isOn, className: "wokwi-led" })}
      </div>
    );
  },
};


