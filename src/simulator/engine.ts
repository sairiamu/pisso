import {
  CPU,
  avrInstruction,
  AVRTimer,
  AVRIOPort,
  portBConfig,
  portCConfig,
  portDConfig,
  AVRUSART,
  usart0Config,
  timer0Config,
  timer1Config,
  timer2Config,
} from 'avr8js';
import { UNO_PIN_MAP } from './pinMap';
import { BoardDefinition, Diagnostic, PinState } from '../domain/models';
import { ARDUINO_UNO } from '../domain/boards';
import { validateHex } from './hex-validator';

function getFlashSize(mcu: string): number {
  switch (mcu.toLowerCase()) {
    case 'atmega328p': return 32768;
    case 'atmega2560': return 262144;
    case 'attiny85': return 8192;
    default: return 32768;
  }
}

/**
 * SimulationEngine wrap avr8js to provide a cycle-accurate AVR simulation.
 * It manages the CPU, timers, GPIO ports, and UART.
 */
export class SimulationEngine {
  private cpu: CPU;
  private timer0: AVRTimer;
  private timer1: AVRTimer;
  private timer2: AVRTimer;
  private portB: AVRIOPort;
  private portC: AVRIOPort;
  private portD: AVRIOPort;
  private usart: AVRUSART;
  private running = false;
  private lastTime = 0;
  private board: BoardDefinition;
  private animationFrameId: number | null = null;
  private simTimeoutId: any = null;
  private dirtyPins = new Set<string | number>();
  private uartBuffer: number[] = [];

  public onPinChange?: (pin: string | number, state: PinState) => void;
  public onUartByte?: (byte: number) => void;
  public onStateUpdate?: (state: { pc: number; cycles: number }) => void;

  constructor(flash: Uint16Array, board: BoardDefinition = ARDUINO_UNO) {
    this.board = board;
    this.cpu = new CPU(flash);
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);

    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);

    this.usart = new AVRUSART(this.cpu, usart0Config, this.board.clock);

    this.setupListeners();
  }

  /**
   * Factory method to create an engine from an Intel Hex string.
   */
  public static fromHex(
    hex: string,
    board: BoardDefinition = ARDUINO_UNO
  ): { engine: SimulationEngine | null; diagnostics: Diagnostic[] } {
    const flashSize = getFlashSize(board.mcu);

    const { isValid, data, diagnostics } = validateHex(hex, flashSize);

    if (!isValid) {
      return { engine: null, diagnostics };
    }

    // AVR instructions are 16-bit, so flash size in words is bytes / 2
    const flash = new Uint16Array(flashSize / 2);
    for (let i = 0; i < data.length; i += 2) {
      flash[i / 2] = data[i] | (data[i + 1] << 8);
    }

    return {
      engine: new SimulationEngine(flash, board),
      diagnostics,
    };
  }

  private setupListeners() {
    this.portB.addListener(() => this.markPortDirty('B'));
    this.portC.addListener(() => this.markPortDirty('C'));
    this.portD.addListener(() => this.markPortDirty('D'));

    this.usart.onByteTransmit = (byte) => {
      this.uartBuffer.push(byte);
    };
  }

  private markPortDirty(portName: 'B' | 'C' | 'D') {
    const pinMap = this.board.simulation.pinMap || UNO_PIN_MAP;
    Object.keys(pinMap).forEach((pin) => {
      const mapping = pinMap[pin];
      if (mapping.port === portName) {
        this.dirtyPins.add(pin);
      }
    });
  }

  /**
   * Starts the simulation loop.
   */
  public start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.runSimulation();
    this.scheduleUiUpdate();
  }

  /**
   * Pauses the simulation loop.
   */
  public pause() {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.simTimeoutId !== null) {
      clearTimeout(this.simTimeoutId);
      this.simTimeoutId = null;
    }
  }

  /**
   * Executes a single instruction.
   */
  public step() {
    this.pause();
    avrInstruction(this.cpu);
    this.cpu.tick();
  }

  /**
   * Resets the CPU state.
   */
  public reset() {
    this.cpu.reset();
    // Note: AVRTimer and AVRIOPort state are mostly tied to CPU registers
  }

  /**
   * Returns the current simulation state.
   */
  public readState() {
    return {
      running: this.running,
      pc: this.cpu.pc,
      cycles: this.cpu.cycles,
    };
  }

  private runSimulation = () => {
    if (!this.running) return;

    const now = performance.now();
    let deltaMs = now - this.lastTime;

    // Cap catch-up to 20ms to allow frequent yielding for UI responsiveness
    if (deltaMs > 20) deltaMs = 20;

    const cyclesToRun = Math.floor(deltaMs * (this.board.clock / 1000));

    if (cyclesToRun > 0) {
      this.lastTime += cyclesToRun / (this.board.clock / 1000);

      for (let i = 0; i < cyclesToRun; i++) {
          avrInstruction(this.cpu);
          this.cpu.tick();
      }
    }

    // Yield to the event loop immediately to allow UI events to be processed
    this.simTimeoutId = setTimeout(this.runSimulation, 0);
  };

  private scheduleUiUpdate = () => {
    if (!this.running) return;

    this.flushUpdates();
    this.animationFrameId = requestAnimationFrame(this.scheduleUiUpdate);
  };

  private flushUpdates() {
    // Notify about pin changes
    if (this.dirtyPins.size > 0) {
      this.dirtyPins.forEach((pin) => {
        this.onPinChange?.(pin, this.getPinState(pin));
      });
      this.dirtyPins.clear();
    }

    // Notify about UART data
    if (this.uartBuffer.length > 0) {
      this.uartBuffer.forEach((byte) => {
        this.onUartByte?.(byte);
      });
      this.uartBuffer = [];
    }

    // Notify about general state update (PC, cycles)
    this.onStateUpdate?.({
        pc: this.cpu.pc,
        cycles: this.cpu.cycles
    });
  }

  /**
   * Exposes a timer instance (0, 1, or 2) so callers (e.g. PWM/servo
   * pulse-width readers used by simulated environment inputs) can read its
   * compare registers without the engine needing to know about them.
   */
  public getTimer(index: 0 | 1 | 2): AVRTimer {
    return [this.timer0, this.timer1, this.timer2][index];
  }

  /**
   * Returns the current state of a specific Arduino pin.
   */
  public getPinState(pin: string | number): PinState {
    const pinMap = this.board.simulation.pinMap || UNO_PIN_MAP;
    const mapping = pinMap[pin];
    if (!mapping) return 'LOW';
    let port: AVRIOPort;
    switch (mapping.port) {
      case 'B':
        port = this.portB;
        break;
      case 'C':
        port = this.portC;
        break;
      case 'D':
        port = this.portD;
        break;
      default:
        return 'LOW';
    }
    return port.pinState(mapping.bit) ? 'HIGH' : 'LOW';
  }

  /**
   * Writes a byte to the UART RX (receiving data in the AVR).
   */
  public serialWrite(byte: number) {
    this.usart.writeByte(byte);
  }

  /**
   * Sets the state of a specific Arduino pin from an external source.
   */
  public setPinState(pin: string | number, state: PinState) {
    const pinMap = this.board.simulation.pinMap || UNO_PIN_MAP;
    const mapping = pinMap[pin];
    if (!mapping) return;

    let port: AVRIOPort;
    switch (mapping.port) {
      case 'B': port = this.portB; break;
      case 'C': port = this.portC; break;
      case 'D': port = this.portD; break;
      default: return;
    }

    port.setPin(mapping.bit, state === 'HIGH');
  }
}
