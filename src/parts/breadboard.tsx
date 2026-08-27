import "@wokwi/elements";
import { PartDefinition, PartPin } from "./types";
import { registerPart } from "./registry";
import React from "react";
import { Pin } from "../components/Pin";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wokwi-breadboard": any;
    }
  }
}

const generateBreadboardPins = (): PartPin[] => {
  const pins: PartPin[] = [];

  // Basic half-size breadboard layout (estimated coordinates for wokwi-breadboard)
  // Rows 1-30, Columns A-J
  // Power rails: Top (+, -), Bottom (+, -)

  const startX = 28.5;
  const startY = 72.5;
  const spacing = 7.62; // ~0.1 inch in pixels at this scale

  for (let row = 0; row < 30; row++) {
    for (let col = 0; col < 10; col++) {
      const colGroup = col >= 5 ? 1 : 0;
      const x = startX + row * spacing;
      const y = startY + col * spacing + (colGroup * 15); // Gap in middle

      const colLetter = String.fromCharCode(97 + col);
      pins.push({
        name: `${row + 1}${colLetter}`,
        x,
        y,
      });
    }
  }

  // Simplified power rails
  for (let i = 0; i < 25; i++) {
     const x = 32 + i * (spacing * 1.2);
     pins.push({ name: `tp.${i}`, x, y: 15 }); // Top Power
     pins.push({ name: `tg.${i}`, x, y: 25 }); // Top Ground
     pins.push({ name: `bp.${i}`, x, y: 185 }); // Bottom Power
     pins.push({ name: `bg.${i}`, x, y: 195 }); // Bottom Ground
  }

  return pins;
};

const BREADBOARD_PINS = generateBreadboardPins();

export const BREADBOARD_DEFINITION: PartDefinition = {
  type: "wokwi-breadboard",
  label: "Breadboard",
  category: "Basic",
  pins: BREADBOARD_PINS,
  defaultAttrs: {},
  render: ({ attrs }) => (
    <div style={{ position: "relative", display: "inline-block" }}>
      {React.createElement("wokwi-breadboard", attrs)}
      {/* For performance, we might want to skip rendering all 300+ pins until zoom-in,
          but for MVP we follow the pattern */}
      {BREADBOARD_PINS.map((pin) => (
        <Pin key={pin.name} id={pin.name} x={pin.x} y={pin.y} />
      ))}
    </div>
  ),
};

registerPart(BREADBOARD_DEFINITION);
