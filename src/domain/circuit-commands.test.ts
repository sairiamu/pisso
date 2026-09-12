import { describe, it, expect } from 'vitest';
import { applyCommand, createInverse } from './circuit-commands';
import { Circuit, Connection } from './models';

const initialCircuit: Circuit = {
  version: 1,
  components: [],
  connections: [],
  nets: [],
};

describe('Circuit Commands', () => {
  it('should ADD_COMPONENT and undo it', () => {
    const cmd = { type: 'ADD_COMPONENT' as const, definitionId: 'led', x: 10, y: 20, id: 'led1' };
    const nextState = applyCommand(initialCircuit, cmd);
    expect(nextState.components).toHaveLength(1);
    expect(nextState.components[0].id).toBe('led1');

    const inverse = createInverse(initialCircuit, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.components).toHaveLength(0);
  });

  it('should REMOVE_COMPONENT and undo it', () => {
    const startState: Circuit = {
      ...initialCircuit,
      components: [{ id: 'led1', definitionId: 'led', x: 10, y: 20, rotation: 0, attributes: {} }],
    };
    const cmd = { type: 'REMOVE_COMPONENT' as const, id: 'led1' };
    const nextState = applyCommand(startState, cmd);
    expect(nextState.components).toHaveLength(0);

    const inverse = createInverse(startState, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.components).toHaveLength(1);
    expect(backState.components[0].id).toBe('led1');
  });

  it('should MOVE_COMPONENT and undo it', () => {
    const startState: Circuit = {
      ...initialCircuit,
      components: [{ id: 'led1', definitionId: 'led', x: 10, y: 20, rotation: 0, attributes: {} }],
    };
    const cmd = { type: 'MOVE_COMPONENT' as const, id: 'led1', x: 100, y: 200 };
    const nextState = applyCommand(startState, cmd);
    expect(nextState.components[0].x).toBe(100);

    const inverse = createInverse(startState, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.components[0].x).toBe(10);
  });

  it('should ROTATE_COMPONENT and undo it', () => {
    const startState: Circuit = {
      ...initialCircuit,
      components: [{ id: 'led1', definitionId: 'led', x: 10, y: 20, rotation: 0, attributes: {} }],
    };
    const cmd = { type: 'ROTATE_COMPONENT' as const, id: 'led1' };
    const nextState = applyCommand(startState, cmd);
    expect(nextState.components[0].rotation).toBe(90);

    const inverse = createInverse(startState, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.components[0].rotation).toBe(0);
  });

  it('should ADD_CONNECTION and undo it', () => {
    const conn: Connection = {
      id: 'w1',
      from: { componentId: 'c1', pinName: 'p1' },
      to: { componentId: 'c2', pinName: 'p1' },
    };
    const cmd = { type: 'ADD_CONNECTION' as const, connection: conn };
    const nextState = applyCommand(initialCircuit, cmd);
    expect(nextState.connections).toHaveLength(1);

    const inverse = createInverse(initialCircuit, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.connections).toHaveLength(0);
  });

  it('should REMOVE_CONNECTION and undo it', () => {
    const conn: Connection = {
      id: 'w1',
      from: { componentId: 'c1', pinName: 'p1' },
      to: { componentId: 'c2', pinName: 'p1' },
    };
    const startState: Circuit = { ...initialCircuit, connections: [conn] };
    const cmd = { type: 'REMOVE_CONNECTION' as const, id: 'w1' };
    const nextState = applyCommand(startState, cmd);
    expect(nextState.connections).toHaveLength(0);

    const inverse = createInverse(startState, cmd);
    const backState = applyCommand(nextState, inverse);
    expect(backState.connections).toHaveLength(1);
    expect(backState.connections[0].id).toBe('w1');
  });

  it('should BATCH commands and undo them', () => {
    const cmd1 = { type: 'ADD_COMPONENT' as const, definitionId: 'led', x: 0, y: 0, id: 'l1' };
    const cmd2 = { type: 'ADD_COMPONENT' as const, definitionId: 'res', x: 0, y: 0, id: 'r1' };
    const batch = { type: 'BATCH' as const, commands: [cmd1, cmd2] };

    const nextState = applyCommand(initialCircuit, batch);
    expect(nextState.components).toHaveLength(2);

    const inverse = createInverse(initialCircuit, batch);
    const backState = applyCommand(nextState, inverse);
    expect(backState.components).toHaveLength(0);
  });
});
