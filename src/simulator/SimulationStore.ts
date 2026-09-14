import { PinState, Diagnostic } from '../domain/models';

export interface ObservableSimulationState {
  isSimulating: boolean;
  digitalPins: Record<string | number, PinState>;
  analogPins: Record<string | number, number>; // Analog voltage or 0-1023 reading
  serialOutput: string;
  componentStates: Record<string, any>; // e.g. { 'led_1': { isOn: true } }
  simulationTimeMs: number;
  errors: Diagnostic[];
}

export type SimulationStoreListener = (state: ObservableSimulationState) => void;

/**
 * A dedicated external store for rapidly changing simulation state.
 * This keeps high-frequency updates out of React's state tree,
 * preventing unnecessary renders and maximizing performance.
 */
export class SimulationStore {
  private state: ObservableSimulationState;
  private listeners: Set<SimulationStoreListener> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): ObservableSimulationState {
    return {
      isSimulating: false,
      digitalPins: {},
      analogPins: {},
      serialOutput: '',
      componentStates: {},
      simulationTimeMs: 0,
      errors: [],
    };
  }

  public getState(): ObservableSimulationState {
    return this.state;
  }

  public subscribe(listener: SimulationStoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    // Return a shallow copy of the state structure so React knows it has changed
    const copiedState = {
      ...this.state,
      digitalPins: { ...this.state.digitalPins },
      analogPins: { ...this.state.analogPins },
      componentStates: { ...this.state.componentStates },
      errors: [...this.state.errors],
    };
    this.listeners.forEach((listener) => listener(copiedState));
  }

  public setIsSimulating(isSimulating: boolean) {
    this.state.isSimulating = isSimulating;
    if (!isSimulating) {
      this.state = this.getInitialState();
    }
    this.emit();
  }

  public setDigitalPin(pin: string | number, pinState: PinState) {
    if (this.state.digitalPins[pin] === pinState) return;
    this.state.digitalPins[pin] = pinState;
    this.emit();
  }

  public setAnalogPin(pin: string | number, value: number) {
    if (this.state.analogPins[pin] === value) return;
    this.state.analogPins[pin] = value;
    this.emit();
  }

  public appendSerialOutput(text: string) {
    this.state.serialOutput += text;
    this.emit();
  }

  public clearSerialOutput() {
    this.state.serialOutput = '';
    this.emit();
  }

  public setComponentState(componentId: string, state: any) {
    this.state.componentStates[componentId] = state;
    this.emit();
  }

  public updateSimulationTime(cycles: number, clockSpeedHz: number) {
    // cycles / (cycles per second) * 1000 = ms
    const timeMs = Math.floor((cycles / clockSpeedHz) * 1000);
    if (this.state.simulationTimeMs === timeMs) return;
    this.state.simulationTimeMs = timeMs;
    this.emit();
  }

  public setErrors(errors: Diagnostic[]) {
    this.state.errors = errors;
    this.emit();
  }

  public reset() {
    this.state = this.getInitialState();
    this.emit();
  }
}

export const simulationStore = new SimulationStore();
