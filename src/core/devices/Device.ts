import { ComponentInstance } from '../circuit/Circuit';

export interface Board extends ComponentInstance {
  fqbn: string;
  port?: string;
}

export interface BoardInfo {
  id: string;
  type: string;
  label: string;
  fqbn: string;
}

export interface BoardDefinition {
  id: string;
  name: string;
  fqbn: string;
  architecture: string;
  mcu: string;
  clock: number;
  variant: string;
  compilerFlags: string[];
  upload: {
    protocol: string;
    speed: number;
    requireReset?: boolean;
    resetMethod?: 'none' | 'dtr' | 'rts' | '1200bps';
  };
  simulation: {
    engine: string;
    capabilities: string[];
    pinMap?: Record<string | number, { port: string; bit: number }>;
  };
}

export interface SerialPortInfo {
  portName: string;
  vendorId?: number;
  productId?: number;
  isArduino: boolean;
}
