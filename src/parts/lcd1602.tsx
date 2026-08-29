import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LCD1602_DEFINITION: PartDefinition = {
  type: "wokwi-lcd1602",
  label: "LCD 1602",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 80, height: 36 },
  pins: [
    { name: "VSS", x: 7.62, y: 2.54 },
    { name: "VDD", x: 10.16, y: 2.54 },
    { name: "VO", x: 12.7, y: 2.54 },
    { name: "RS", x: 15.24, y: 2.54 },
    { name: "RW", x: 17.78, y: 2.54 },
    { name: "E", x: 20.32, y: 2.54 },
    { name: "D0", x: 22.86, y: 2.54 },
    { name: "D1", x: 25.4, y: 2.54 },
    { name: "D2", x: 27.94, y: 2.54 },
    { name: "D3", x: 30.48, y: 2.54 },
    { name: "D4", x: 33.02, y: 2.54 },
    { name: "D5", x: 35.56, y: 2.54 },
    { name: "D6", x: 38.1, y: 2.54 },
    { name: "D7", x: 40.64, y: 2.54 },
    { name: "A", x: 43.18, y: 2.54 },
    { name: "K", x: 45.72, y: 2.54 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-lcd1602", { ...attrs, className: "wokwi-lcd1602" })}
    </div>
  ),
};


