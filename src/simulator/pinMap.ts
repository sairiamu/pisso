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
  "D0": { port: "D", bit: 0 },
  "D1": { port: "D", bit: 1 },
  "D2": { port: "D", bit: 2 },
  "D3": { port: "D", bit: 3 },
  "D4": { port: "D", bit: 4 },
  "D5": { port: "D", bit: 5 },
  "D6": { port: "D", bit: 6 },
  "D7": { port: "D", bit: 7 },
  "D8": { port: "B", bit: 0 },
  "D9": { port: "B", bit: 1 },
  "D10": { port: "B", bit: 2 },
  "D11": { port: "B", bit: 3 },
  "D12": { port: "B", bit: 4 },
  "D13": { port: "B", bit: 5 },

  // Analog Pins (as digital)
  "A0": { port: "C", bit: 0 },
  "A1": { port: "C", bit: 1 },
  "A2": { port: "C", bit: 2 },
  "A3": { port: "C", bit: 3 },
  "A4": { port: "C", bit: 4 },
  "A5": { port: "C", bit: 5 },
};
