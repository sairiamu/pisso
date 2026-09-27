export type PinState = 'HIGH' | 'LOW' | 'FLOAT';

export type ComponentId = string;

export type PinName = string;

export interface PinReference {
  componentId: ComponentId;
  pinName: PinName;
}

export interface Pin {
  name: PinName;
  x: number;
  y: number;
  type?: 'io' | 'input' | 'output' | 'power' | 'ground' | 'analog';
  description?: string;
  required?: boolean;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  label?: string;
  category: string;
  pins: Pin[];
  isBoard: boolean;
  fqbn?: string;
  defaultAttributes: Record<string, any>;
}

export interface ComponentInstance {
  id: ComponentId;
  definitionId: string;
  type?: string;
  x: number;
  y: number;
  rotation: number;
  attributes: Record<string, any>;
  attrs?: Record<string, any>;
}

export interface Connection {
  id: string;
  from: PinReference;
  to: PinReference;
  color?: string;
  thickness?: number;
  tracked?: boolean;
  waypoints?: { x: number; y: number }[];
  route?: { x: number; y: number }[];
}

export interface Net {
  id: string;
  name: string;
  pins: PinReference[];
}

export interface Circuit {
  version: number;
  components: ComponentInstance[];
  connections: Connection[];
  nets: Net[];
}

export interface DiagramPart {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  attrs?: Record<string, unknown>;
}

export interface DiagramConnection {
  id: string;
  from: { partId: string; pin: string };
  to: { partId: string; pin: string };
  route?: { x: number; y: number }[];
  waypoints?: { x: number; y: number }[];
  color?: string;
  thickness?: number;
  tracked?: boolean;
}

export interface Diagram {
  version: number;
  parts: DiagramPart[];
  connections: DiagramConnection[];
}
