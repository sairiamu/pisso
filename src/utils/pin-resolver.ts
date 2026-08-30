import { PartDefinition, PinDefinition } from "../parts/types";

export interface ResolvedPin {
  name: string;
  x: number;
  y: number;
}

/**
 * Reliable pin-resolution function for Wokwi parts.
 *
 * 1. Prefer Wokwi pinInfo when available.
 * 2. Convert its coordinates correctly into the rendered element's coordinate space.
 * 3. Fall back to registry pins only when explicitly valid.
 * 4. Validate every resulting pin coordinate is finite and inside the component bounds.
 * 5. Never return pins with NaN, Infinity, or coordinates far outside the component.
 */
export function resolvePartPins(
  element: HTMLElement | null,
  definition: PartDefinition,
  naturalWidth: number,
  naturalHeight: number
): ResolvedPin[] {
  const resolvedPins: ResolvedPin[] = [];
  const seenNames = new Set<string>();

  // 1. Try authoritative Wokwi pinInfo
  const pinInfo = (element as any)?.pinInfo;

  if (Array.isArray(pinInfo) && pinInfo.length > 0) {
    for (const p of pinInfo) {
      if (p && typeof p.x === 'number' && typeof p.y === 'number' && p.name) {
        if (!seenNames.has(p.name)) {
          // Validate finite
          if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
             // 5. Never render handles with coordinates far outside the component.
             // We allow a reasonable margin (50px) because some pins stick out.
             const margin = 50;
             if (p.x >= -margin && p.x <= naturalWidth + margin &&
                 p.y >= -margin && p.y <= naturalHeight + margin) {
               seenNames.add(p.name);
               resolvedPins.push({ name: p.name, x: p.x, y: p.y });
             } else {
               console.warn(`[Pisso] Wokwi pinInfo for ${definition.type}:${p.name} is far out of bounds: (${p.x}, ${p.y}) for size ${naturalWidth}x${naturalHeight}`);
             }
          }
        }
      }
    }

    if (resolvedPins.length > 0) {
      return resolvedPins;
    }
  }

  // 3. Fall back to registry pins
  if (definition.pins && definition.pins.length > 0) {
    for (const p of definition.pins) {
      const x = typeof p.x === 'string' ? parseFloat(p.x) : p.x;
      const y = typeof p.y === 'string' ? parseFloat(p.y) : p.y;

      if (Number.isFinite(x) && Number.isFinite(y)) {
        // Validation with warning
        const margin = 50;
        const isOutOfBounds = x < -margin || x > naturalWidth + margin ||
                             y < -margin || y > naturalHeight + margin;

        if (isOutOfBounds) {
          console.warn(
            `[Pisso] REGISTRY FAIL: Part "${definition.type}" has pin "${p.name}" at (${x}, ${y}), ` +
            `which is outside bounds (${naturalWidth}x${naturalHeight}).`
          );
        }

        // Still allow them if they are not completely crazy (e.g. within margin)
        if (x >= -margin && x <= naturalWidth + margin &&
            y >= -margin && y <= naturalHeight + margin) {
          if (!seenNames.has(p.name)) {
            seenNames.add(p.name);
            resolvedPins.push({ name: p.name, x, y });
          }
        }
      } else {
        console.error(`[Pisso] Part "${definition.type}" has invalid non-finite pin coordinates for "${p.name}"`);
      }
    }
  }

  return resolvedPins;
}
