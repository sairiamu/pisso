import "@wokwi/elements";
import { PartDefinition } from "./types";
import { getPinValue } from "./utils";
import React from "react";

export const RGB_LED_DEFINITION: PartDefinition = {
  type: "wokwi-rgb-led",
  label: "RGB LED",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 35, height: 40 },
  pins: [
    { name: "R", x: 10, y: 40 },
    { name: "COM", x: 15, y: 40 },
    { name: "G", x: 20, y: 40 },
    { name: "B", x: 25, y: 40 },
  ],
  defaultAttrs: {},
  render: ({ attrs, pinValues }) => {
    const r = getPinValue(pinValues, "R", "RGB LED") === "HIGH" ? 1 : 0;
    const g = getPinValue(pinValues, "G", "RGB LED") === "HIGH" ? 1 : 0;
    const b = getPinValue(pinValues, "B", "RGB LED") === "HIGH" ? 1 : 0;

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-rgb-led", {
          ...attrs,
          ledRed: r,
          ledGreen: g,
          ledBlue: b,
          className: "wokwi-rgb-led"
        })}
      </div>
    );
  },
};


