import { BoardDefinition } from "./models";

export const ARDUINO_UNO: BoardDefinition = {
  id: "arduino-uno",
  name: "Arduino Uno",
  fqbn: "arduino:avr:uno",
  architecture: "avr",
  mcu: "atmega328p",
  clock: 16000000,
  variant: "standard",
  compilerFlags: ["-mmcu=atmega328p", "-DF_CPU=16000000L", "-DARDUINO=10810", "-DARDUINO_AVR_UNO", "-DARDUINO_ARCH_AVR"],
  upload: {
    protocol: "arduino",
    speed: 115200,
    requireReset: true,
    resetMethod: "dtr"
  },
  simulation: {
    engine: "avr8js",
    capabilities: ["digital-io", "analog-input", "pwm", "uart", "spi", "i2c"],
    pinMap: {
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
      "A0": { port: "C", bit: 0 },
      "A1": { port: "C", bit: 1 },
      "A2": { port: "C", bit: 2 },
      "A3": { port: "C", bit: 3 },
      "A4": { port: "C", bit: 4 },
      "A5": { port: "C", bit: 5 },
    }
  }
};

export const BOARDS: Record<string, BoardDefinition> = {
  "arduino:avr:uno": ARDUINO_UNO
};

export function getBoardByFqbn(fqbn: string): BoardDefinition | undefined {
  return BOARDS[fqbn];
}

export function getBoardById(id: string): BoardDefinition | undefined {
  return Object.values(BOARDS).find(b => b.id === id);
}
