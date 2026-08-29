import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LED_DEFINITION: PartDefinition = {
  type: "wokwi-led",
  label: "LED",
  category: "Displays",
  viewBox: { x: -10, y: -5, width: 35.456, height: 39.618 },
  pins: [
    { name: "A", x: 25, y: 42 },
    { name: "C", x: 15, y: 42 },
  ],
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


