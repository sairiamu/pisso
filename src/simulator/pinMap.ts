export interface PinMapping {
  port: "B" | "C" | "D";
  bit: number;
}

/**
 * Mapping table for ATmega328p (Arduino Uno)
 * Maps Arduino pin numbers to AVR Port and Bit.
 */
export const UNO_PIN_MAP: Record<string | number, PinMapping> = {
  // Digital Pins
  0: { port: "D", bit: 0 },
  1: { port: "D", bit: 1 },
  2: { port: "D", bit: 2 },
  3: { port: "D", bit: 3 },
  4: { port: "D", bit: 4 },
  5: { port: "D", bit: 5 },
  6: { port: "D", bit: 6 },
  7: { port: "D", bit: 7 },
  8: { port: "B", bit: 0 },
  9: { port: "B", bit: 1 },
  10: { port: "B", bit: 2 },
  11: { port: "B", bit: 3 },
  12: { port: "B", bit: 4 },
  13: { port: "B", bit: 5 },

  // Analog Pins (as digital)
  14: { port: "C", bit: 0 },
  15: { port: "C", bit: 1 },
  16: { port: "C", bit: 2 },
  17: { port: "C", bit: 3 },
  18: { port: "C", bit: 4 },
  19: { port: "C", bit: 5 },

  // Analog Aliases
  "A0": { port: "C", bit: 0 },
  "A1": { port: "C", bit: 1 },
  "A2": { port: "C", bit: 2 },
  "A3": { port: "C", bit: 3 },
  "A4": { port: "C", bit: 4 },
  "A5": { port: "C", bit: 5 },
};
