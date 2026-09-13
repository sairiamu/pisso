import "@wokwi/elements";
import { PartDefinition } from "./types";
import React from "react";

export const ARDUINO_UNO_DEFINITION: PartDefinition = {
  type: "wokwi-arduino-uno",
  label: "Arduino Uno",
  category: "Microcontrollers",
  viewBox: { x: 0, y: 0, width: 274.35, height: 201.62 },
  pins: [
    { name: "SCL", x: 87, y: 9, type: "io" },
    { name: "SDA", x: 97, y: 9, type: "io" },
    { name: "AREF", x: 106, y: 9, type: "input" },
    { name: "GND.1", x: 115.5, y: 9, type: "ground" },
    { name: "D13", x: 125, y: 9, type: "io" },
    { name: "D12", x: 134.5, y: 9, type: "io" },
    { name: "D11", x: 144, y: 9, type: "io" },
    { name: "D10", x: 153.5, y: 9, type: "io" },
    { name: "D9", x: 163, y: 9, type: "io" },
    { name: "D8", x: 173, y: 9, type: "io" },
    { name: "D7", x: 189, y: 9, type: "io" },
    { name: "D6", x: 198.5, y: 9, type: "io" },
    { name: "D5", x: 208, y: 9, type: "io" },
    { name: "D4", x: 217.5, y: 9, type: "io" },
    { name: "D3", x: 227, y: 9, type: "io" },
    { name: "D2", x: 236.5, y: 9, type: "io" },
    { name: "D1", x: 246, y: 9, type: "io" },
    { name: "D0", x: 255.5, y: 9, type: "io" },
    { name: "IOREF", x: 131, y: 191.5, type: "power" },
    { name: "RESET", x: 140.5, y: 191.5, type: "input" },
    { name: "3.3V", x: 150, y: 191.5, type: "power" },
    { name: "5V", x: 160, y: 191.5, type: "power" },
    { name: "GND.2", x: 169.5, y: 191.5, type: "ground" },
    { name: "GND.3", x: 179, y: 191.5, type: "ground" },
    { name: "VIN", x: 188.5, y: 191.5, type: "power" },
    { name: "A0", x: 208, y: 191.5, type: "analog" },
    { name: "A1", x: 217.5, y: 191.5, type: "analog" },
    { name: "A2", x: 227, y: 191.5, type: "analog" },
    { name: "A3", x: 236.5, y: 191.5, type: "analog" },
    { name: "A4", x: 246, y: 191.5, type: "analog" },
    { name: "A5", x: 255.5, y: 191.5, type: "analog" },
  ],
  defaultAttrs: {},
  isBoard: true,
  fqbn: "arduino:avr:uno",
  render: ({ attrs }) => {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-arduino-uno", attrs)}
      </div>
    );
  },
};


