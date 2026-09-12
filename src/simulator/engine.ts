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
import { parse } from 'intel-hex';
import { UNO_PIN_MAP } from './pinMap';
import { BoardDefinition } from '../domain/models';
import { ARDUINO_UNO } from '../domain/boards';

export type PinState = 'HIGH' | 'LOW';

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

  public onPinChange?: (pin: string | number, state: PinState) => void;
  public onUartByte?: (byte: number) => void;

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
  public static fromHex(hex: string, board: BoardDefinition = ARDUINO_UNO): SimulationEngine {
    const buffer = parse(hex).data;
    // TODO: Use board.mcu or some other metadata to determine flash size
    const flashSize = board.id === 'arduino-uno' ? 32768 : 32768;
    const flash = new Uint16Array(flashSize);
    for (let i = 0; i < buffer.length; i += 2) {
      flash[i / 2] = buffer[i] | (buffer[i + 1] << 8);
    }
    return new SimulationEngine(flash, board);
  }

  private setupListeners() {
    this.portB.addListener(() => this.handlePortChange('B', this.portB));
    this.portC.addListener(() => this.handlePortChange('C', this.portC));
    this.portD.addListener(() => this.handlePortChange('D', this.portD));

    this.usart.onByteTransmit = (byte) => {
      this.onUartByte?.(byte);
    };
  }

  private handlePortChange(portName: 'B' | 'C' | 'D', port: AVRIOPort) {
    const pinMap = this.board.simulation.pinMap || UNO_PIN_MAP;
    Object.keys(pinMap).forEach((pin) => {
      const mapping = pinMap[pin];
      if (mapping.port === portName) {
        const state = port.pinState(mapping.bit) ? 'HIGH' : 'LOW';
        this.onPinChange?.(pin, state);
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
    this.loop();
  }

  /**
   * Pauses the simulation loop.
   */
  public pause() {
    this.running = false;
  }

  /**
   * Resets the CPU state.
   */
  public reset() {
    this.cpu.reset();
    // Note: AVRTimer and AVRIOPort state are mostly tied to CPU registers
  }

  private loop = () => {
    if (!this.running) return;

    const now = performance.now();
    let deltaMs = now - this.lastTime;
    if (deltaMs > 100) deltaMs = 100; // Cap to avoid huge catch-up jumps
    this.lastTime = now;

    // clock speed cycles per millisecond
    const cyclesToRun = Math.floor(deltaMs * (this.board.clock / 1000));

    for (let i = 0; i < cyclesToRun; i++) {
      avrInstruction(this.cpu);
      this.cpu.tick();
    }

    requestAnimationFrame(this.loop);
  };

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
}
