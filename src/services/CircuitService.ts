import { applyCommand } from '../domain/circuit-commands';
import { Circuit } from '../core/circuit/Circuit';

export class CircuitService {
  public static createEmptyCircuit(): Circuit {
    return {
      version: 1,
      components: [],
      connections: [],
      nets: []
    };
  }

  public static addComponent(
    circuit: Circuit,
    definitionId: string,
    x: number,
    y: number
  ): Circuit {
    return applyCommand(circuit as any, {
      type: 'ADD_COMPONENT',
      definitionId,
      x,
      y
    }) as any;
  }

  public static removeComponent(
    circuit: Circuit,
    componentId: string
  ): Circuit {
    return applyCommand(circuit as any, {
      type: 'REMOVE_COMPONENT',
      id: componentId
    }) as any;
  }

  public static addConnection(
    circuit: Circuit,
    from: { componentId: string; pinName: string },
    to: { componentId: string; pinName: string },
    color?: string
  ): Circuit {
    return applyCommand(circuit as any, {
      type: 'ADD_CONNECTION',
      connection: {
        id: `conn-${Date.now()}`,
        from,
        to,
        color
      }
    }) as any;
  }

  public static removeConnection(
    circuit: Circuit,
    connectionId: string
  ): Circuit {
    return applyCommand(circuit as any, {
      type: 'REMOVE_CONNECTION',
      id: connectionId
    }) as any;
  }
}
