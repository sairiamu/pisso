import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Circuit, PinReference, Connection } from './models';
import { applyCommand, CircuitCommand, createInverse } from './circuit-commands';

interface CircuitContextType {
  circuit: Circuit;
  addComponent: (definitionId: string, x: number, y: number, attributes?: Record<string, any>) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  rotateComponent: (id: string) => void;
  connectPins: (from: PinReference, to: PinReference) => void;
  disconnectPins: (id: string) => void;
  updateComponent: (id: string, attributes: Record<string, any>) => void;
  updateConnectionStyle: (id: string, style: Partial<{ color: string; thickness: number; tracked: boolean }>) => void;
  addWaypoint: (edgeId: string, point: { x: number; y: number }, insertAtIndex: number) => void;
  moveWaypoint: (edgeId: string, index: number, point: { x: number; y: number }) => void;
  removeWaypoint: (edgeId: string, index: number) => void;
  clearCircuit: () => void;
  setCircuit: (circuit: Circuit) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CircuitContext = createContext<CircuitContextType | undefined>(undefined);

const initialCircuit: Circuit = {
  version: 1,
  components: [],
  connections: [],
  nets: [],
};

type HistoryItem = {
  command: CircuitCommand;
  inverse: CircuitCommand;
};

type HistoryState = {
  circuit: Circuit;
  undoStack: HistoryItem[];
  redoStack: HistoryItem[];
};

type HistoryAction =
  | { type: 'EXECUTE'; command: CircuitCommand; inverse: CircuitCommand }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; circuit: Circuit };

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'EXECUTE':
      return {
        circuit: applyCommand(state.circuit, action.command),
        undoStack: [...state.undoStack, { command: action.command, inverse: action.inverse }],
        redoStack: [],
      };
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const last = state.undoStack[state.undoStack.length - 1];
      return {
        circuit: applyCommand(state.circuit, last.inverse),
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, last],
      };
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const last = state.redoStack[state.redoStack.length - 1];
      return {
        circuit: applyCommand(state.circuit, last.command),
        undoStack: [...state.undoStack, last],
        redoStack: state.redoStack.slice(0, -1),
      };
    }
    case 'RESET':
      return {
        circuit: action.circuit,
        undoStack: [],
        redoStack: [],
      };
    default:
      return state;
  }
}

export const CircuitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [{ circuit, undoStack, redoStack }, dispatch] = useReducer(historyReducer, {
    circuit: initialCircuit,
    undoStack: [],
    redoStack: [],
  });

  const execute = useCallback((command: CircuitCommand) => {
    const inverse = createInverse(circuit, command);
    dispatch({ type: 'EXECUTE', command, inverse });
  }, [circuit]);

  const addComponent = useCallback((definitionId: string, x: number, y: number, attributes?: Record<string, any>) => {
    const id = `${definitionId}-${Math.random().toString(36).substr(2, 9)}`;
    execute({ type: 'ADD_COMPONENT', id, definitionId, x, y, attributes });
  }, [execute]);

  const removeComponent = useCallback((id: string) => {
    execute({ type: 'REMOVE_COMPONENT', id });
  }, [execute]);

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    execute({ type: 'MOVE_COMPONENT', id, x, y });
  }, [execute]);

  const rotateComponent = useCallback((id: string) => {
    execute({ type: 'ROTATE_COMPONENT', id });
  }, [execute]);

  const connectPins = useCallback((from: PinReference, to: PinReference) => {
    const connectionId = `w-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const connection: Connection = {
      id: connectionId,
      from,
      to,
      thickness: 3,
    };
    execute({ type: 'ADD_CONNECTION', connection });
  }, [execute]);

  const disconnectPins = useCallback((id: string) => {
    execute({ type: 'REMOVE_CONNECTION', id });
  }, [execute]);

  const updateComponent = useCallback((id: string, attributes: Record<string, any>) => {
    execute({ type: 'UPDATE_COMPONENT_ATTRIBUTES', id, attributes });
  }, [execute]);

  const updateConnectionStyle = useCallback((id: string, style: Partial<{ color: string; thickness: number; tracked: boolean }>) => {
    execute({ type: 'UPDATE_CONNECTION_STYLE', id, style });
  }, [execute]);

  const addWaypoint = useCallback((edgeId: string, point: { x: number; y: number }, insertAtIndex: number) => {
    execute({ type: 'ADD_WAYPOINT', edgeId, point, insertAtIndex });
  }, [execute]);

  const moveWaypoint = useCallback((edgeId: string, index: number, point: { x: number; y: number }) => {
    execute({ type: 'MOVE_WAYPOINT', edgeId, index, point });
  }, [execute]);

  const removeWaypoint = useCallback((edgeId: string, index: number) => {
    execute({ type: 'REMOVE_WAYPOINT', edgeId, index });
  }, [execute]);

  const clearCircuit = useCallback(() => {
    dispatch({ type: 'RESET', circuit: initialCircuit });
  }, []);

  const setCircuit = useCallback((newCircuit: Circuit) => {
    dispatch({ type: 'RESET', circuit: newCircuit });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  return (
    <CircuitContext.Provider
      value={{
        circuit,
        addComponent,
        removeComponent,
        moveComponent,
        rotateComponent,
        connectPins,
        disconnectPins,
        updateComponent,
        updateConnectionStyle,
        addWaypoint,
        moveWaypoint,
        removeWaypoint,
        clearCircuit,
        setCircuit,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
      }}
    >
      {children}
    </CircuitContext.Provider>
  );
};

export const useCircuit = () => {
  const context = useContext(CircuitContext);
  if (context === undefined) {
    throw new Error('useCircuit must be used within a CircuitProvider');
  }
  return context;
};
