import { Circuit, PinReference, PinState } from '../domain/models';
import { resolveNode } from '../domain/circuit-resolver';

/**
 * SimulationNetlist represents the electrical connectivity of the circuit
 * during simulation. It maps component pins to electrical nets and tracks
 * the state of each net.
 */
export class SimulationNetlist {
  private pinToNetId: Map<string, string> = new Map();
  private netToPins: Map<string, PinReference[]> = new Map();
  private netStates: Map<string, PinState> = new Map();
  private arduinoPinToNetId: Map<string | number, string> = new Map();

  constructor(circuit: Circuit, boardId?: string) {
    this.rebuild(circuit, boardId);
  }

  public rebuild(circuit: Circuit, boardId?: string) {
    this.pinToNetId.clear();
    this.netToPins.clear();
    this.netStates.clear();
    this.arduinoPinToNetId.clear();

    const visitedPins = new Set<string>();
    let netCount = 0;

    for (const component of circuit.components) {
      // We need to know all possible pins for this component to ensure they all get assigned to a net
      // For now, we'll rely on the pins that have connections.
      // A better approach would be to use the ComponentDefinition to get all pins.
    }

    // Iterate through all connections to find all participating pins
    const allPins: PinReference[] = [];
    circuit.connections.forEach(conn => {
      allPins.push(conn.from);
      allPins.push(conn.to);
    });

    // Also include pins from the board if we know which one it is
    if (boardId) {
        const board = circuit.components.find(c => c.id === boardId);
        // ... boards might have pins that aren't connected yet but we want to track ...
    }

    for (const pinRef of allPins) {
      const pinKey = this.getPinKey(pinRef);
      if (visitedPins.has(pinKey)) continue;

      const netId = `net_${netCount++}`;
      const connectedPins = resolveNode(circuit, pinRef);

      this.netToPins.set(netId, connectedPins);
      this.netStates.set(netId, 'LOW');

      for (const p of connectedPins) {
        const pKey = this.getPinKey(p);
        visitedPins.add(pKey);
        this.pinToNetId.set(pKey, netId);

        if (boardId && p.componentId === boardId) {
          this.arduinoPinToNetId.set(p.pinName, netId);
        }
      }
    }
  }

  public getNetIdForArduinoPin(pinName: string | number): string | undefined {
    return this.arduinoPinToNetId.get(pinName);
  }

  public getNetIdForPin(componentId: string, pinName: string): string | undefined {
    return this.pinToNetId.get(`${componentId}:${pinName}`);
  }

  public getArduinoPinForNet(netId: string): string | number | undefined {
    for (const [arduinoPin, id] of this.arduinoPinToNetId.entries()) {
      if (id === netId) return arduinoPin;
    }
    return undefined;
  }

  public getPinsInNet(netId: string): PinReference[] {
    return this.netToPins.get(netId) || [];
  }

  public getPinKey(pinRef: PinReference): string {
    return `${pinRef.componentId}:${pinRef.pinName}`;
  }

  public setNetState(netId: string, state: PinState) {
    if (this.netStates.get(netId) === state) return false;
    this.netStates.set(netId, state);
    return true;
  }

  public setArduinoPinState(pinName: string | number, state: PinState) {
    const netId = this.arduinoPinToNetId.get(pinName);
    if (netId) {
      return this.setNetState(netId, state);
    }
    return false;
  }

  public getPinState(componentId: string, pinName: string): PinState {
    const pinKey = `${componentId}:${pinName}`;
    const netId = this.pinToNetId.get(pinKey);
    if (!netId) return 'FLOAT';
    return this.netStates.get(netId) || 'FLOAT';
  }

  public getNetStates(): Record<string, PinState> {
    const result: Record<string, PinState> = {};
    for (const [netId, state] of this.netStates.entries()) {
      result[netId] = state;
    }
    return result;
  }

  /**
   * Returns a map of component pins to their current state.
   */
  public getAllPinStates(): Record<string, PinState> {
    const result: Record<string, PinState> = {};
    for (const [pinKey, netId] of this.pinToNetId.entries()) {
      result[pinKey] = this.netStates.get(netId) || 'FLOAT';
    }
    return result;
  }

  /**
   * Returns all pin names registered for a specific component.
   */
  public getComponentPinNames(componentId: string): string[] {
    const pinNames: string[] = [];
    for (const pinKey of this.pinToNetId.keys()) {
      if (pinKey.startsWith(`${componentId}:`)) {
        pinNames.push(pinKey.split(':')[1]);
      }
    }
    return pinNames;
  }
}
