export interface PinRef {
  partId: string;
  pin: string;
}

export interface PartInstance {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  attrs: Record<string, any>;
}

export interface Connection {
  id: string;
  from: PinRef;
  to: PinRef;
  route?: { x: number; y: number }[];
}

export interface Diagram {
  version: number;
  parts: PartInstance[];
  connections: Connection[];
}
