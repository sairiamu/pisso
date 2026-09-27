import { PinState } from '../circuit/Circuit';
import { BuildResult } from '../diagnostics/Diagnostic';

export interface Simulation {
  isSimulating: boolean;
  pinStates: Record<string | number, PinState>;
  pinMappings: Record<string, (string | number)[]>;
  serialOutput: string;
  buildOutput: string | null;
  lastBuildResult: BuildResult | null;
  serialConnected: boolean;
  serialSource: 'simulation' | 'hardware';
}

export interface ObservableSimulationState extends Simulation {
  digitalPins: Record<string | number, PinState>;
}
