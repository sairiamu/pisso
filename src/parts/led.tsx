import "@wokwi/elements";
import { PartDefinition } from "./types";
import { getPinValue } from "./utils";
import React from "react";

export const LED_DEFINITION: PartDefinition = {
  type: "wokwi-led",
  label: "LED",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 134, height: 150 },
  pins: [
    { name: "anode", x: 132.3, y: 177.66, type: "input" },
    { name: "cathode", x: 94.5, y: 177.66, type: "input" },
  ],
  defaultAttrs: { color: "red" },
  render: ({ attrs, pinValues }) => {
    const aValue = getPinValue(pinValues, "anode", "LED");
    const cValue = getPinValue(pinValues, "cathode", "LED");
    const isOn = aValue === "HIGH" && cValue === "LOW";
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-led", { ...attrs, value: isOn, className: "wokwi-led" })}
      </div>
    );
  },
};


