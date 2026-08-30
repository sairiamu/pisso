import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const LCD1602_DEFINITION: PartDefinition = {
  type: "wokwi-lcd1602",
  label: "LCD 1602",
  category: "Displays",
  viewBox: { x: 0, y: 0, width: 302.4, height: 136.08 },
  pins: [
    { name: "VSS", x: 28.8, y: 9.6 },
    { name: "VDD", x: 38.4, y: 9.6 },
    { name: "VO", x: 48.0, y: 9.6 },
    { name: "RS", x: 57.6, y: 9.6 },
    { name: "RW", x: 67.2, y: 9.6 },
    { name: "E", x: 76.8, y: 9.6 },
    { name: "D0", x: 86.4, y: 9.6 },
    { name: "D1", x: 96.0, y: 9.6 },
    { name: "D2", x: 105.6, y: 9.6 },
    { name: "D3", x: 115.2, y: 9.6 },
    { name: "D4", x: 124.8, y: 9.6 },
    { name: "D5", x: 134.4, y: 9.6 },
    { name: "D6", x: 144.0, y: 9.6 },
    { name: "D7", x: 153.6, y: 9.6 },
    { name: "A", x: 163.2, y: 9.6 },
    { name: "K", x: 172.8, y: 9.6 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-lcd1602", { ...attrs, className: "wokwi-lcd1602" })}
    </div>
  ),
};


