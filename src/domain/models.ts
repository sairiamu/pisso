/**
 * Core domain models for Pisso.
 * These are serializable to JSON and decoupled from UI libraries like React Flow.
 */

/**
 * Represents the electrical state of a pin.
 */
export type PinState = 'HIGH' | 'LOW' | 'FLOAT';

/**
 * A unique identifier for a component instance within a circuit.
 */
export type ComponentId = string;

/**
 * The name of a pin on a component definition.
 */
export type PinName = string;

/**
 * A reference to a specific pin on a specific component instance.
 */
export interface PinReference {
  componentId: ComponentId;
  pinName: PinName;
}

/**
 * Represents a physical or logical pin on a component definition.
 */
export interface Pin {
  name: PinName;
  x: number;
  y: number;
  type?: 'io' | 'input' | 'output' | 'power' | 'ground' | 'analog';
  description?: string;
}

/**
 * Metadata defining a type of component (e.g., "LED", "Resistor", "Arduino Uno").
 */
export interface ComponentDefinition {
  id: string; // The type identifier (e.g., "wokwi-led")
  name: string; // Human readable name
  category: string;
  pins: Pin[];
  isBoard: boolean;
  fqbn?: string; // Fully Qualified Board Name, required if isBoard is true
  defaultAttributes: Record<string, any>;
}

/**
 * A specific instance of a component placed in a circuit.
 */
export interface ComponentInstance {
  id: ComponentId;
  definitionId: string; // References ComponentDefinition.id
  x: number;
  y: number;
  rotation: number;
  attributes: Record<string, any>;
}

/**
 * A board is a specialized component instance that acts as the controller (e.g., Arduino Uno).
 */
export interface Board extends ComponentInstance {
  /**
   * The specific FQBN used for this board instance.
   * While the definition has a default, the instance might override it if supported.
   */
  fqbn: string;
  /**
   * The COM port or device path currently associated with this board.
   */
  port?: string;
}

/**
 * A direct electrical connection (wire) between two component pins.
 */
export interface Connection {
  id: string;
  from: PinReference;
  to: PinReference;
  color?: string;
  thickness?: number;
  tracked?: boolean; // Used for simulation visualization
  /**
   * User-placed anchor points for the connection path in the UI.
   */
  waypoints?: { x: number; y: number }[];
}

/**
 * A logical grouping of interconnected pins that share the same electrical potential.
 * Nets are usually derived from connections but can be explicitly defined.
 */
export interface Net {
  id: string;
  name: string;
  pins: PinReference[];
}

/**
 * The complete circuit design, consisting of components and their interconnections.
 */
export interface Circuit {
  version: number;
  components: ComponentInstance[];
  connections: Connection[];
  nets: Net[];
}

/**
 * An external library that the project depends on.
 */
export interface LibraryDependency {
  name: string;
  version: string;
  source: 'registry' | 'zip' | 'bundled';
}

/**
 * A file within a project (e.g., sketch.ino, utils.h).
 */
export interface ProjectFile {
  name: string;
  content: string;
}

/**
 * A project represents a complete design, including its circuit, code, and configuration.
 */
export interface Project {
  id: string;
  name: string;
  rootPath: string;
  circuit: Circuit;
  files: ProjectFile[];
  libraries: LibraryDependency[];
  createdAt: number;
  updatedAt: number;
}

/**
 * A diagnostic message typically resulting from compilation or validation.
 */
export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  code?: string;
}

/**
 * The result of a project build process.
 */
export interface BuildResult {
  status: 'success' | 'failed' | 'error';
  hex?: string;
  flashUsed?: number;
  ramUsed?: number;
  stdout: string;
  stderr: string;
  output: string;
  diagnostics: Diagnostic[];
  timestamp: number;
}

/**
 * Summary information for a board used in selection UIs.
 */
export interface BoardInfo {
  id: string;
  type: string;
  label: string;
  fqbn: string;
}

/**
 * Data-driven definition for a microcontroller board.
 */
export interface BoardDefinition {
  id: string;
  name: string;
  fqbn: string;
  architecture: string;
  mcu: string;
  clock: number; // in Hz
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
