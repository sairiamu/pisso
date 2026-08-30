import React from "react";

export interface PinDefinition {
  name: string;
  x: number | string;
  y: number | string;
}

export interface PartDefinition {
  type: string; // e.g., "wokwi-led"
  label: string; // e.g., "LED"
  category: string; // e.g., "Basic"
  viewBox: { x: number; y: number; width: number; height: number };
  pins: PinDefinition[];
  render: (props: {
    attrs: Record<string, any>;
    pinValues?: Record<string, 'HIGH' | 'LOW' | 'FLOAT'>;
  }) => React.JSX.Element;
  defaultAttrs: Record<string, any>;
  isBoard?: boolean;
  fqbn?: string; // e.g. "arduino:avr:uno", required if isBoard is true
}
