import { simulationManager } from '../simulator/SimulationManager';
import { BoardDefinition, Circuit } from '../domain/models';

export * from '../simulator/SimulationManager';
export * from '../simulator/ISimulationManager';

/**
 * @deprecated Use simulationManager from '../simulator/SimulationManager' directly.
 * This is kept for backward compatibility.
 */
export const SimulationService = {
  start: (hex: string, board: BoardDefinition, circuit: Circuit, onPinChange: any, onUartByte: any) => {
    const diagnostics = simulationManager.loadFirmware(hex, board, circuit, onPinChange, onUartByte);
    const hasErrors = diagnostics.some(d => d.severity === 'error');
    if (!hasErrors) {
      simulationManager.start();
    }
    return diagnostics;
  },
  stop: () => simulationManager.stop(),
  writeSerial: (data: string) => simulationManager.writeSerial(data),
  isRunning: () => simulationManager.readState().running,
};
