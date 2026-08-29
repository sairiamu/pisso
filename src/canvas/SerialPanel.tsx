import React from "react";
import { ConsoleView } from "./ConsoleView";
import { useSimulation } from "../simulator/SimulationContext";

export const SerialPanel: React.FC = () => {
  const { serialOutput, clearSerialOutput, writeSerial } = useSimulation();

  const handleInputSubmit = (value: string) => {
    writeSerial(value + "\n");
  };

  return (
    <ConsoleView
      content={serialOutput}
      onClear={clearSerialOutput}
      onInputSubmit={handleInputSubmit}
      placeholder="Send to serial..."
      showInput={true}
    />
  );
};
