import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PinState } from './engine';

interface SimulationContextType {
  isSimulating: boolean;
  pinStates: Record<string | number, PinState>;
  pinMappings: Record<string, (string | number)[]>; // Maps "partId:pin" to Arduino pins
  setPinState: (pin: string | number, state: PinState) => void;
  setPinMappings: (mappings: Record<string, (string | number)[]>) => void;
  resetPinStates: () => void;
  setIsSimulating: (simulating: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [pinStates, setPinStates] = useState<Record<string | number, PinState>>({});
  const [pinMappings, setPinMappings] = useState<Record<string, (string | number)[]>>({});

  const setPinState = useCallback((pin: string | number, state: PinState) => {
    setPinStates((prev) => {
      if (prev[pin] === state) return prev;
      return { ...prev, [pin]: state };
    });
  }, []);

  const resetPinStates = useCallback(() => {
    setPinStates({});
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        pinStates,
        pinMappings,
        setPinState,
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
