import { Circuit, ComponentInstance, Connection } from "./models";

export type CircuitCommand =
  | { type: 'ADD_COMPONENT'; definitionId: string; x: number; y: number; id?: string; attributes?: Record<string, any> }
  | { type: 'REMOVE_COMPONENT'; id: string }
  | { type: 'MOVE_COMPONENT'; id: string; x: number; y: number }
  | { type: 'ROTATE_COMPONENT'; id: string }
  | { type: 'UPDATE_COMPONENT_ATTRIBUTES'; id: string; attributes: Record<string, any> }
  | { type: 'ADD_CONNECTION'; connection: Connection }
  | { type: 'REMOVE_CONNECTION'; id: string }
  | { type: 'UPDATE_CONNECTION_STYLE'; id: string; style: Partial<{ color: string; thickness: number; tracked: boolean }> }
  | { type: 'ADD_WAYPOINT'; edgeId: string; point: { x: number; y: number }; insertAtIndex: number }
  | { type: 'MOVE_WAYPOINT'; edgeId: string; index: number; point: { x: number; y: number } }
  | { type: 'REMOVE_WAYPOINT'; edgeId: string; index: number }
  | { type: 'SET_CIRCUIT'; circuit: Circuit }
  | { type: 'BATCH'; commands: CircuitCommand[] };

export function applyCommand(state: Circuit, command: CircuitCommand): Circuit {
  switch (command.type) {
    case 'BATCH':
      return command.commands.reduce((s, c) => applyCommand(s, c), state);

    case 'ADD_COMPONENT': {
      const newComponent: ComponentInstance = {
        id: command.id || `${command.definitionId}-${Math.random().toString(36).substr(2, 9)}`,
        definitionId: command.definitionId,
        x: command.x,
        y: command.y,
        rotation: 0,
        attributes: command.attributes || {},
      };
      return {
        ...state,
        components: [...state.components, newComponent],
      };
    }

    case 'REMOVE_COMPONENT':
      return {
        ...state,
        components: state.components.filter((c) => c.id !== command.id),
        connections: state.connections.filter(
          (c) => c.from.componentId !== command.id && c.to.componentId !== command.id
        ),
      };

    case 'MOVE_COMPONENT':
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === command.id ? { ...c, x: command.x, y: command.y } : c
        ),
      };

    case 'ROTATE_COMPONENT':
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === command.id ? { ...c, rotation: (c.rotation + 90) % 360 } : c
        ),
      };

    case 'UPDATE_COMPONENT_ATTRIBUTES':
      return {
        ...state,
        components: state.components.map((c) =>
          c.id === command.id ? { ...c, attributes: { ...c.attributes, ...command.attributes } } : c
        ),
      };

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, command.connection],
      };

    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter((c) => c.id !== command.id),
      };

    case 'UPDATE_CONNECTION_STYLE':
      return {
        ...state,
        connections: state.connections.map((c) =>
          c.id === command.id ? { ...c, ...command.style } : c
        ),
      };

    case 'ADD_WAYPOINT':
      return {
        ...state,
        connections: state.connections.map((c) => {
          if (c.id !== command.edgeId) return c;
          const waypoints = [...(c.waypoints || [])];
          waypoints.splice(command.insertAtIndex, 0, command.point);
          return { ...c, waypoints };
        }),
      };

    case 'MOVE_WAYPOINT':
      return {
        ...state,
        connections: state.connections.map((c) => {
          if (c.id !== command.edgeId) return c;
          const waypoints = [...(c.waypoints || [])];
          waypoints[command.index] = command.point;
          return { ...c, waypoints };
        }),
      };

    case 'REMOVE_WAYPOINT':
      return {
        ...state,
        connections: state.connections.map((c) => {
          if (c.id !== command.edgeId) return c;
          const waypoints = (c.waypoints || []).filter((_, i) => i !== command.index);
          return { ...c, waypoints };
        }),
      };

    case 'SET_CIRCUIT':
      return command.circuit;

    default:
      return state;
  }
}

/**
 * Creates a command that reverses the effect of the given command.
 * The state provided MUST be the state BEFORE the command is applied.
 */
export function createInverse(state: Circuit, command: CircuitCommand): CircuitCommand {
  switch (command.type) {
    case 'ADD_COMPONENT':
      return { type: 'REMOVE_COMPONENT', id: command.id! };

    case 'REMOVE_COMPONENT': {
      const comp = state.components.find((c) => c.id === command.id);
      if (!comp) return { type: 'BATCH', commands: [] };
      const connections = state.connections.filter(
        (c) => c.from.componentId === command.id || c.to.componentId === command.id
      );
      return {
        type: 'BATCH',
        commands: [
          { type: 'ADD_COMPONENT', ...comp } as CircuitCommand,
          ...connections.map((c) => ({ type: 'ADD_CONNECTION', connection: c } as CircuitCommand)),
        ],
      };
    }

    case 'MOVE_COMPONENT': {
      const comp = state.components.find((c) => c.id === command.id);
      if (!comp) return { type: 'BATCH', commands: [] };
      return { type: 'MOVE_COMPONENT', id: command.id, x: comp.x, y: comp.y };
    }

    case 'ROTATE_COMPONENT':
      // The inverse of +90 is +270 (or 3 rotations of 90)
      return {
        type: 'BATCH',
        commands: [
          { type: 'ROTATE_COMPONENT', id: command.id },
          { type: 'ROTATE_COMPONENT', id: command.id },
          { type: 'ROTATE_COMPONENT', id: command.id },
        ],
      };

    case 'UPDATE_COMPONENT_ATTRIBUTES': {
      const comp = state.components.find((c) => c.id === command.id);
      if (!comp) return { type: 'BATCH', commands: [] };
      // Restore only the attributes that are being changed
      const oldAttributes: Record<string, any> = {};
      Object.keys(command.attributes).forEach((key) => {
        oldAttributes[key] = comp.attributes[key];
      });
      return { type: 'UPDATE_COMPONENT_ATTRIBUTES', id: command.id, attributes: oldAttributes };
    }

    case 'ADD_CONNECTION':
      return { type: 'REMOVE_CONNECTION', id: command.connection.id };

    case 'REMOVE_CONNECTION': {
      const conn = state.connections.find((c) => c.id === command.id);
      if (!conn) return { type: 'BATCH', commands: [] };
      return { type: 'ADD_CONNECTION', connection: conn };
    }

    case 'UPDATE_CONNECTION_STYLE': {
      const conn = state.connections.find((c) => c.id === command.id);
      if (!conn) return { type: 'BATCH', commands: [] };
      const oldStyle: any = {};
      Object.keys(command.style).forEach((key) => {
        oldStyle[key] = (conn as any)[key];
      });
      return { type: 'UPDATE_CONNECTION_STYLE', id: command.id, style: oldStyle };
    }

    case 'ADD_WAYPOINT':
      return { type: 'REMOVE_WAYPOINT', edgeId: command.edgeId, index: command.insertAtIndex };

    case 'MOVE_WAYPOINT': {
      const conn = state.connections.find((c) => c.id === command.edgeId);
      if (!conn || !conn.waypoints) return { type: 'BATCH', commands: [] };
      const oldPoint = conn.waypoints[command.index];
      return { type: 'MOVE_WAYPOINT', edgeId: command.edgeId, index: command.index, point: oldPoint };
    }

    case 'REMOVE_WAYPOINT': {
      const conn = state.connections.find((c) => c.id === command.edgeId);
      if (!conn || !conn.waypoints) return { type: 'BATCH', commands: [] };
      const oldPoint = conn.waypoints[command.index];
      return {
        type: 'ADD_WAYPOINT',
        edgeId: command.edgeId,
        point: oldPoint,
        insertAtIndex: command.index,
      };
    }

    case 'SET_CIRCUIT':
      return { type: 'SET_CIRCUIT', circuit: state };

    case 'BATCH': {
      const inverses: CircuitCommand[] = [];
      let currentState = state;
      for (const cmd of command.commands) {
        inverses.push(createInverse(currentState, cmd));
        currentState = applyCommand(currentState, cmd);
      }
      return { type: 'BATCH', commands: inverses.reverse() };
    }

    default:
      return { type: 'BATCH', commands: [] };
  }
}
