import { SimulationEngine } from './engine';
import { BoardDefinition, Diagnostic, Circuit, PinState } from '../domain/models';
import { SimulationNetlist } from './SimulationNetlist';
import {
  ISimulationAdapter,
  BaseSimulationAdapter,
  LedAdapter,
  ButtonAdapter,
  ResistorAdapter,
  PowerAdapter,
  ArduinoPinsAdapter
} from './SimulationAdapter';
import { ISimulationManager, SimulationState } from './ISimulationManager';

/**
 * SimulationManager provides a high-level abstraction for controlling the AVR simulation.
 * It encapsulates the SimulationEngine and ensures that React components do not
 * directly interact with the underlying avr8js library.
 */
export class SimulationManager implements ISimulationManager {
  private engine: SimulationEngine | null = null;
  private netlist: SimulationNetlist | null = null;
  private adapters: ISimulationAdapter[] = [];
  private onPinChangeCallback: ((pin: string | number, state: PinState) => void) | null = null;
  private onUartByteCallback: ((byte: number) => void) | null = null;

  /**
   * Loads the compiled firmware (hex) into the simulation engine.
   */
  public loadFirmware(
    hex: string,
    board: BoardDefinition,
    circuit: Circuit,
    onPinChange?: (pin: string | number, state: PinState) => void,
    onUartByte?: (byte: number) => void
  ): Diagnostic[] {
    const wasRunning = this.engine?.readState().running;
    this.stop();

    if (onPinChange) this.onPinChangeCallback = onPinChange;
    if (onUartByte) this.onUartByteCallback = onUartByte;

    const { engine, diagnostics } = SimulationEngine.fromHex(hex, board);
    this.engine = engine;

    if (this.engine) {
      // Find the board component in the circuit to identify its ID for the netlist
      const boardComponent = circuit.components.find(c => c.definitionId === board.id || c.definitionId === 'wokwi-arduino-uno');

      this.netlist = new SimulationNetlist(circuit, boardComponent?.id);

      // Initialize adapters for all components
      this.adapters = circuit.components.map(comp => {
          let adapter: ISimulationAdapter;
          if (boardComponent && comp.id === boardComponent.id) {
              adapter = new ArduinoPinsAdapter(
                  comp.id,
                  (pin) => this.engine!.getPinState(pin),
                  (pin, state) => this.engine!.setPinState(pin, state)
              );
          } else {
              switch (comp.definitionId) {
                case 'wokwi-led':
                  adapter = new LedAdapter(comp.id);
                  break;
                case 'wokwi-pushbutton':
                case 'wokwi-pushbutton-6mm':
                  adapter = new ButtonAdapter(comp.id);
                  break;
                case 'wokwi-resistor':
                  adapter = new ResistorAdapter(comp.id);
                  break;
                case 'wokwi-vcc':
                  adapter = new PowerAdapter(comp.id, 'HIGH');
                  break;
                case 'wokwi-gnd':
                  adapter = new PowerAdapter(comp.id, 'LOW');
                  break;
                default:
                  // Fallback to a generic adapter that doesn't drive anything
                  adapter = new (class extends BaseSimulationAdapter {
                    update() {}
                  })(comp.id);
              }
          }
          adapter.initialize(this.netlist!);
          return adapter;
      });

      // Hook up engine pin changes to the netlist
      this.engine.onPinChange = (pin, state) => {
        if (!this.netlist) return;

        const changed = this.netlist.setArduinoPinState(pin, state);
        if (!changed) return;

        // Find all pins affected by this net change and notify the callback
        const netId = this.netlist.getNetIdForArduinoPin(pin);
        if (netId) {
          const affectedPins = this.netlist.getPinsInNet(netId);
          for (const pinRef of affectedPins) {
            const key = this.netlist.getPinKey(pinRef);
            this.onPinChangeCallback?.(key, state);
          }
        }

        // Notify adapters and handle their driven pins back to engine
        this.syncAdapters();
      };

      if (this.onUartByteCallback) {
        this.engine.onUartByte = this.onUartByteCallback;
      }

      if (wasRunning) {
        this.start();
      }
    }

    return diagnostics;
  }

  /**
   * Starts or resumes the simulation.
   */
  public start() {
    this.engine?.start();
  }

  /**
   * Pauses the simulation.
   */
  public pause() {
    this.engine?.pause();
  }

  /**
   * Executes a single instruction.
   */
  public step() {
    this.engine?.step();
  }

  /**
   * Resets the simulation to its initial state.
   */
  public reset() {
    this.engine?.reset();
    for (const adapter of this.adapters) {
      adapter.reset();
    }
  }

  /**
   * Stops the simulation and clears the engine.
   */
  public stop() {
    if (this.engine) {
      this.engine.pause();
      this.engine = null;
    }
    for (const adapter of this.adapters) {
      adapter.reset();
    }
    this.netlist = null;
    this.adapters = [];
  }

  private syncAdapters() {
    if (!this.netlist || !this.engine) return;

    for (const adapter of this.adapters) {
      adapter.update(this.netlist);

      // For each pin this component has, check if it's driving anything
      const componentPins = this.netlist.getComponentPinNames(adapter.componentId);
      for (const pinName of componentPins) {
        const drivenState = adapter.read(pinName);
        if (drivenState !== 'FLOAT') {
          const netId = this.netlist.getNetIdForPin(adapter.componentId, pinName);
          if (netId) {
            const arduinoPin = this.netlist.getArduinoPinForNet(netId);
            if (arduinoPin !== undefined) {
              this.engine.setPinState(arduinoPin, drivenState);
            }
          }
        }
      }
    }
  }

  /**
   * Returns the current state of the simulation.
   */
  public readState(): SimulationState {
    if (!this.engine) {
      return {
        running: false,
        pc: 0,
        cycles: 0,
        pins: {},
      };
    }
    const engineState = this.engine.readState();
    return {
      running: engineState.running,
      pc: engineState.pc,
      cycles: engineState.cycles,
      pins: this.netlist?.getAllPinStates() || {},
    };
  }

  /**
   * Writes data to the simulated UART.
   */
  public writeSerial(data: string) {
    if (this.engine) {
      for (let i = 0; i < data.length; i++) {
        this.engine.serialWrite(data.charCodeAt(i));
      }
    }
  }

  /**
   * Sets the listener for pin state changes.
   */
  public setPinChangeListener(listener: (pin: string | number, state: PinState) => void) {
    this.onPinChangeCallback = listener;
    if (this.engine) {
      this.engine.onPinChange = listener;
    }
  }

  /**
   * Sets the listener for UART data.
   */
  public setUartListener(listener: (byte: number) => void) {
    this.onUartByteCallback = listener;
    if (this.engine) {
      this.engine.onUartByte = listener;
    }
  }
}

// Singleton instance for global access
export const simulationManager = new SimulationManager();
