import "@wokwi/elements";
import { PartDefinition, PartPin } from "./types";
import { registerPart } from "./registry";
import React from "react";
import { Pin } from "../components/Pin";

// Extend JSX namespace to support wokwi elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-arduino-uno": any;
    }
  }
}

const UNO_PINS: PartPin[] = [
  // Digital Pins (Top Row, Right to Left)
  { name: "0", x: 216.5, y: 13 },
  { name: "1", x: 206.5, y: 13 },
  { name: "2", x: 196.5, y: 13 },
  { name: "3", x: 186.5, y: 13 },
  { name: "4", x: 176.5, y: 13 },
  { name: "5", x: 166.5, y: 13 },
  { name: "6", x: 156.5, y: 13 },
  { name: "7", x: 146.5, y: 13 },
  { name: "8", x: 126.5, y: 13 },
  { name: "9", x: 116.5, y: 13 },
  { name: "10", x: 106.5, y: 13 },
  { name: "11", x: 96.5, y: 13 },
  { name: "12", x: 86.5, y: 13 },
  { name: "13", x: 76.5, y: 13 },
  { name: "GND.1", x: 66.5, y: 13 },
  { name: "AREF", x: 56.5, y: 13 },
  { name: "SDA", x: 46.5, y: 13 },
  { name: "SCL", x: 36.5, y: 13 },

  // Power Pins (Bottom Row, Left to Right)
  { name: "RESET", x: 70.3, y: 319.5 },
  { name: "3.3V", x: 80.3, y: 319.5 },
  { name: "5V", x: 90.3, y: 319.5 },
  { name: "GND.2", x: 100.3, y: 319.5 },
  { name: "GND.3", x: 110.3, y: 319.5 },
  { name: "VIN", x: 120.3, y: 319.5 },

  // Analog Pins (Bottom Row, Right to Power)
  { name: "A0", x: 150.3, y: 319.5 },
  { name: "A1", x: 160.3, y: 319.5 },
  { name: "A2", x: 170.3, y: 319.5 },
  { name: "A3", x: 180.3, y: 319.5 },
  { name: "A4", x: 190.3, y: 319.5 },
  { name: "A5", x: 200.3, y: 319.5 },
];

export const ARDUINO_UNO_DEFINITION: PartDefinition = {
  type: "wokwi-arduino-uno",
  label: "Arduino Uno",
  category: "Microcontrollers",
  pins: UNO_PINS,
  defaultAttrs: {},
  render: ({ attrs }) => {
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        {React.createElement("wokwi-arduino-uno", attrs)}
        {UNO_PINS.map((pin) => (
          <Pin
            key={pin.name}
            id={pin.name}
            x={pin.x}
            y={pin.y}
          />
        ))}
      </div>
    );
  },
};

// Auto-register when this file is imported
registerPart(ARDUINO_UNO_DEFINITION);
