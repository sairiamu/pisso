import { simulationManager } from '../simulator/SimulationManager';
import { BoardDefinition, Circuit, PinState } from '../core/index';
import { Diagnostic } from '../core/diagnostics/Diagnostic';

export class SimulationService {
  public static startSimulation(
    hex: string,
    board: BoardDefinition,
    circuit: Circuit,
    onPinChange: (pin: string | number, state: PinState) => void,
    onUartByte: (byte: number) => void
  ): Diagnostic[] {
    const diagnostics = simulationManager.loadFirmware(hex, board, circuit, onPinChange, onUartByte);
    const hasErrors = diagnostics.some(d => d.severity === 'error');
    if (!hasErrors) {
      simulationManager.start();
    }
    return diagnostics;
  }

  public static stopSimulation(): void {
    simulationManager.stop();
  }

  public static isRunning(): boolean {
    return simulationManager.readState().running;
  }

  public static writeSerial(data: string): void {
    simulationManager.writeSerial(data);
  }
}
