import { SimulationEngine, PinState } from "../simulator/engine";

export class SimulationService {
  private static engine: SimulationEngine | null = null;

  static start(
    hex: string,
    onPinChange: (pin: string | number, state: PinState) => void,
    onUartByte: (byte: number) => void
  ) {
    this.stop();
    this.engine = SimulationEngine.fromHex(hex);
    this.engine.onPinChange = onPinChange;
    this.engine.onUartByte = onUartByte;
    this.engine.start();
  }

  static stop() {
    if (this.engine) {
      this.engine.pause();
      this.engine = null;
    }
  }

  static writeSerial(data: string) {
    if (this.engine) {
      for (let i = 0; i < data.length; i++) {
        this.engine.serialWrite(data.charCodeAt(i));
      }
    }
  }

  static isRunning(): boolean {
    return this.engine !== null;
  }
}
