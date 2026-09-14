import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PinState, BuildResult } from '../domain/models';
import { simulationStore, ObservableSimulationState } from './SimulationStore';

interface SimulationContextType {
  isSimulating: boolean;
  pinStates: Record<string | number, PinState>;
  pinMappings: Record<string, (string | number)[]>; // Maps "partId:pin" to Arduino pins
  serialOutput: string;
  buildOutput: string | null;
  lastBuildResult: BuildResult | null;
  serialConnected: boolean;
  serialSource: 'simulation' | 'hardware';
  storeState: ObservableSimulationState;
  setPinState: (pin: string | number, state: PinState) => void;
  appendSerialOutput: (text: string) => void;
  clearSerialOutput: () => void;
  setBuildOutput: (text: string | null) => void;
  setLastBuildResult: (result: BuildResult | null) => void;
  appendBuildOutput: (text: string | null) => void;
  setSerialConnected: (connected: boolean) => void;
  setSerialSource: (source: 'simulation' | 'hardware') => void;
  writeSerial: (data: string) => void;
  setWriteSerialHandler: (handler: (data: string) => void) => void;
  setPinMappings: (mappings: Record<string, (string | number)[]>) => void;
  resetPinStates: () => void;
  setIsSimulating: (simulating: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulating, setIsSimulatingState] = useState(false);
  const [pinStates, setPinStates] = useState<Record<string | number, PinState>>({});
  const [pinMappings, setPinMappings] = useState<Record<string, (string | number)[]>>({});
  const [serialOutput, setSerialOutput] = useState('');
  const [buildOutput, setBuildOutput] = useState<string | null>(null);
  const [lastBuildResult, setLastBuildResult] = useState<BuildResult | null>(null);
  const [serialConnected, setSerialConnected] = useState(false);
  const [serialSource, setSerialSource] = useState<'simulation' | 'hardware'>('simulation');
  const [writeSerialHandler, setWriteSerialHandler] = useState<(data: string) => void>(() => () => {});
  const [storeState, setStoreState] = useState<ObservableSimulationState>(() => simulationStore.getState());

  // Sync with external simulationStore
  useEffect(() => {
    return simulationStore.subscribe((nextState) => {
      setStoreState(nextState);
      setIsSimulatingState(nextState.isSimulating);
      setPinStates(nextState.digitalPins);
      setSerialOutput(nextState.serialOutput);
    });
  }, []);

  const setIsSimulating = useCallback((simulating: boolean) => {
    simulationStore.setIsSimulating(simulating);
  }, []);

  const setPinState = useCallback((pin: string | number, state: PinState) => {
    simulationStore.setDigitalPin(pin, state);
  }, []);

  const appendSerialOutput = useCallback((text: string) => {
    simulationStore.appendSerialOutput(text);
  }, []);

  const clearSerialOutput = useCallback(() => {
    simulationStore.clearSerialOutput();
  }, []);

  const appendBuildOutput = useCallback((text: string | null) => {
    if (text === null) {
      setBuildOutput(null);
    } else {
      setBuildOutput((prev) => (prev || '') + text + '\n');
    }
  }, []);

  const writeSerial = useCallback((data: string) => {
    writeSerialHandler(data);
  }, [writeSerialHandler]);

  const resetPinStates = useCallback(() => {
    simulationStore.reset();
    setBuildOutput(null);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        pinStates,
        pinMappings,
        serialOutput,
        buildOutput,
        lastBuildResult,
        serialConnected,
        serialSource,
        setPinState,
        appendSerialOutput,
        clearSerialOutput,
        setBuildOutput,
        setLastBuildResult,
        appendBuildOutput,
        setSerialConnected,
        setSerialSource,
        writeSerial,
        setWriteSerialHandler,
        setPinMappings,
        resetPinStates,
        setIsSimulating,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
