import { SimulationNetlist } from './SimulationNetlist';
import { PinState } from '../domain/models';

/**
 * ISimulationAdapter defines the lifecycle and interaction methods for
 * a simulated component in the circuit.
 */
export interface ISimulationAdapter {
  readonly componentId: string;

  /**
   * Called when the simulation starts or firmware is loaded.
   */
  initialize(netlist: SimulationNetlist): void;

  /**
   * Called on every simulation cycle or when a net state changes.
   * The adapter should read its input pins and update internal state.
   */
  update(netlist: SimulationNetlist): void;

  /**
   * Returns the state this component is currently driving on a specific pin.
   * If the component does not drive the pin, it should return 'FLOAT'.
   */
  read(pinName: string): PinState;

  /**
   * Allows external sources (like the UI or netlist) to apply a state to a pin.
   */
  write(pinName: string, state: PinState): void;

  /**
   * Resets the component to its power-on state.
   */
  reset(): void;
}

export abstract class BaseSimulationAdapter implements ISimulationAdapter {
  protected drivenPins: Record<string, PinState> = {};

  constructor(public readonly componentId: string) {}

  initialize(netlist: SimulationNetlist): void {}
  update(netlist: SimulationNetlist): void {}

  read(pinName: string): PinState {
    return this.drivenPins[pinName] || 'FLOAT';
  }

  write(pinName: string, state: PinState): void {}

  reset(): void {
    this.drivenPins = {};
  }

  protected getPinState(netlist: SimulationNetlist, pinName: string): PinState {
    return netlist.getPinState(this.componentId, pinName);
  }
}

/**
 * Adapter for an LED component.
 */
export class LedAdapter extends BaseSimulationAdapter {
  public isOn: boolean = false;

  update(netlist: SimulationNetlist): void {
    const anode = this.getPinState(netlist, 'anode');
    const cathode = this.getPinState(netlist, 'cathode');
    this.isOn = (anode === 'HIGH' && cathode === 'LOW');
  }

  reset(): void {
    super.reset();
    this.isOn = false;
  }
}

/**
 * Adapter for a Pushbutton component.
 */
export class ButtonAdapter extends BaseSimulationAdapter {
  private pressed = false;

  update(netlist: SimulationNetlist): void {
    if (this.pressed) {
      // A simple button bridges two nets. In this digital model,
      // if pressed, we reflect the state from one pin to the other
      // to simulate connectivity.
      const p1 = this.getPinState(netlist, '1');
      const p2 = this.getPinState(netlist, '2');

      if (p1 !== 'FLOAT') this.drivenPins['2'] = p1;
      else if (p2 !== 'FLOAT') this.drivenPins['1'] = p2;
    } else {
      this.drivenPins = {};
    }
  }

  write(pinName: string, state: PinState): void {
    // We use 'write' to simulate physical interaction from the UI
    if (pinName === 'interactive:press') {
      this.pressed = (state === 'HIGH');
    }
  }

  reset(): void {
    super.reset();
    this.pressed = false;
  }
}

/**
 * Adapter for Power (VCC) or Ground (GND) components.
 */
export class PowerAdapter extends BaseSimulationAdapter {
  constructor(componentId: string, private outputState: PinState) {
    super(componentId);
    this.drivenPins['out'] = outputState;
  }

  initialize(): void {
    this.drivenPins['out'] = this.outputState;
  }

  reset(): void {
    this.drivenPins['out'] = this.outputState;
  }
}

/**
 * Adapter for a Resistor. In a digital-only simulation,
 * it behaves like a wire (0 ohms) or an open circuit (infinity).
 */
export class ResistorAdapter extends BaseSimulationAdapter {
  update(netlist: SimulationNetlist): void {
    const p1 = this.getPinState(netlist, '1');
    const p2 = this.getPinState(netlist, '2');

    // Bridge the states
    if (p1 !== 'FLOAT') this.drivenPins['2'] = p1;
    else if (p2 !== 'FLOAT') this.drivenPins['1'] = p2;
    else this.drivenPins = {};
  }
}

/**
 * Adapter for Arduino pins. This acts as a proxy between the simulation engine
 * and the electrical netlist.
 */
export class ArduinoPinsAdapter extends BaseSimulationAdapter {
  constructor(
    componentId: string,
    private onRead: (pinName: string) => PinState,
    private onWrite: (pinName: string, state: PinState) => void
  ) {
    super(componentId);
  }

  read(pinName: string): PinState {
    return this.onRead(pinName);
  }

  write(pinName: string, state: PinState): void {
    this.onWrite(pinName, state);
  }
}
