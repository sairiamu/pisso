export interface PinRef {
  partId: string;
  pin: string;
}

export interface PartInstance {
  id: string;
  type: string;
  attrs: Record<string, any>;
}

export interface Connection {
  id: string;
  from: PinRef;
  to: PinRef;
}

export interface Diagram {
  version: number;
  parts: PartInstance[];
  connections: Connection[];
}
