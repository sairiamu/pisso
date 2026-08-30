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
  route?: { x: number; y: number }[];      // last-rendered full path (cache, unchanged)
  waypoints?: { x: number; y: number }[];  // user-placed anchor points, source→target order
  color?: string;      // defaults to COLORS.TRACE_GREEN if unset
  thickness?: number;  // stroke width in px, defaults to 3
  tracked?: boolean;   // when true, wire glows/pulses
}

export interface Diagram {
  version: number;
  parts: PartInstance[];
  connections: Connection[];
}
