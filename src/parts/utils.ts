import { PinState } from "../simulator/engine";

/**
 * Validates and retrieves a pin value from the pinValues record.
 * Warns in the console if a component tries to access a pin name
 * that wasn't registered in its definition.
 */
export function getPinValue(
  pinValues: Record<string, 'HIGH' | 'LOW' | 'FLOAT'> | undefined,
  pinName: string,
  componentName: string
): 'HIGH' | 'LOW' | 'FLOAT' {
  if (!pinValues) return 'FLOAT';

  if (!(pinName in pinValues)) {
    // We only warn if there are actually some pins (means simulation is active and pins were resolved)
    if (Object.keys(pinValues).length > 0) {
      console.warn(
        `[Pisso] Component "${componentName}" attempted to access unregistered pin "${pinName}". ` +
        `Available pins: ${Object.keys(pinValues).join(', ')}`
      );
    }
    return 'FLOAT';
  }

  return pinValues[pinName];
}
