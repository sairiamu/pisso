import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PinState } from './engine';

interface SimulationContextType {
  isSimulating: boolean;
  pinStates: Record<string | number, PinState>;
  pinMappings: Record<string, (string | number)[]>; // Maps "partId:pin" to Arduino pins
  serialOutput: string;
  buildOutput: string | null;
  serialConnected: boolean;
  setPinState: (pin: string | number, state: PinState) => void;
  appendSerialOutput: (text: string) => void;
  clearSerialOutput: () => void;
  setBuildOutput: (text: string | null) => void;
  setSerialConnected: (connected: boolean) => void;
  writeSerial: (data: string) => void;
  setWriteSerialHandler: (handler: (data: string) => void) => void;
  setPinMappings: (mappings: Record<string, (string | number)[]>) => void;
  resetPinStates: () => void;
  setIsSimulating: (simulating: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [pinStates, setPinStates] = useState<Record<string | number, PinState>>({});
  const [pinMappings, setPinMappings] = useState<Record<string, (string | number)[]>>({});
  const [serialOutput, setSerialOutput] = useState('');
  const [buildOutput, setBuildOutput] = useState<string | null>(null);
  const [serialConnected, setSerialConnected] = useState(false);
  const [writeSerialHandler, setWriteSerialHandler] = useState<(data: string) => void>(() => () => {});

  const setPinState = useCallback((pin: string | number, state: PinState) => {
    setPinStates((prev) => {
      if (prev[pin] === state) return prev;
      return { ...prev, [pin]: state };
    });
  }, []);

  const appendSerialOutput = useCallback((text: string) => {
    setSerialOutput((prev) => prev + text);
  }, []);

  const clearSerialOutput = useCallback(() => {
    setSerialOutput('');
  }, []);

  const writeSerial = useCallback((data: string) => {
    writeSerialHandler(data);
  }, [writeSerialHandler]);

  const resetPinStates = useCallback(() => {
    setPinStates({});
    setSerialOutput('');
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        pinStates,
        pinMappings,
        serialOutput,
        buildOutput,
        serialConnected,
        setPinState,
        appendSerialOutput,
        clearSerialOutput,
        setBuildOutput,
        setSerialConnected,
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
