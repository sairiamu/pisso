import { BoardDefinition, Diagnostic, Circuit, PinState } from '../domain/models';

export interface SimulationState {
  running: boolean;
  pc: number;
  cycles: number;
  pins: Record<string, PinState>;
}

/**
 * ISimulationManager defines the interface for controlling the AVR simulation.
 * This abstraction ensures that React components do not directly interact with
 * the underlying simulation engine or library (e.g., avr8js).
 */
export interface ISimulationManager {
  /**
   * Loads the compiled firmware (hex) into the simulation engine.
   * @param hex The Intel Hex string of the compiled firmware.
   * @param board The definition of the target board.
   * @param circuit The current circuit design.
   * @param onPinChange Optional callback for pin state changes.
   * @param onUartByte Optional callback for UART output.
   * @returns A list of diagnostics from the firmware loading process.
   */
  loadFirmware(
    hex: string,
    board: BoardDefinition,
    circuit: Circuit,
    onPinChange?: (pin: string | number, state: PinState) => void,
    onUartByte?: (byte: number) => void
  ): Diagnostic[];

  /**
   * Starts or resumes the simulation.
   */
  start(): void;

  /**
   * Pauses the simulation.
   */
  pause(): void;

  /**
   * Executes a single CPU instruction and then pauses.
   */
  step(): void;

  /**
   * Resets the CPU to its initial state.
   */
  reset(): void;

  /**
   * Stops the simulation and releases resources.
   */
  stop(): void;

  /**
   * Returns the current state of the simulation.
   */
  readState(): SimulationState;

  /**
   * Writes data to the simulated UART input.
   */
  writeSerial(data: string): void;
}
