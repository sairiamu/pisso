import React from "react";
import { SimulationProvider } from "../../simulator/SimulationContext";
import { CircuitProvider } from "../../domain/CircuitContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <SimulationProvider>
      <CircuitProvider>
        {children}
      </CircuitProvider>
    </SimulationProvider>
  );
};
