import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const ARDUINO_UNO_DEFINITION: PartDefinition = {
  type: "wokwi-arduino-uno",
  label: "Arduino Uno",
  category: "Microcontrollers",
  viewBox: { x: -4, y: 0, width: 72.58, height: 53.34 },
  pins: [
    { name: "A5.2", x: 87, y: 9 },
    { name: "A4.2", x: 97, y: 9 },
    { name: "AREF", x: 106, y: 9 },
    { name: "GND.1", x: 115.5, y: 9 },
    { name: "13", x: 125, y: 9 },
    { name: "12", x: 134.5, y: 9 },
    { name: "11", x: 144, y: 9 },
    { name: "10", x: 153.5, y: 9 },
    { name: "9", x: 163, y: 9 },
    { name: "8", x: 173, y: 9 },
    { name: "7", x: 189, y: 9 },
    { name: "6", x: 198.5, y: 9 },
    { name: "5", x: 208, y: 9 },
    { name: "4", x: 217.5, y: 9 },
    { name: "3", x: 227, y: 9 },
    { name: "2", x: 236.5, y: 9 },
    { name: "1", x: 246, y: 9 },
    { name: "0", x: 255.5, y: 9 },
    { name: "IOREF", x: 131, y: 191.5 },
    { name: "RESET", x: 140.5, y: 191.5 },
    { name: "3.3V", x: 150, y: 191.5 },
    { name: "5V", x: 160, y: 191.5 },
    { name: "GND.2", x: 169.5, y: 191.5 },
    { name: "GND.3", x: 179, y: 191.5 },
    { name: "VIN", x: 188.5, y: 191.5 },
    { name: "A0", x: 208, y: 191.5 },
    { name: "A1", x: 217.5, y: 191.5 },
    { name: "A2", x: 227, y: 191.5 },
    { name: "A3", x: 236.5, y: 191.5 },
    { name: "A4", x: 246, y: 191.5 },
    { name: "A5", x: 255.5, y: 191.5 },
  ],
  defaultAttrs: {},
  render: ({ attrs }) => {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-arduino-uno", attrs)}
      </div>
    );
  },
};


