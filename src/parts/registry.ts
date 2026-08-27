import { PartDefinition } from "./types";

/**
 * Global registry of all available parts.
 * Parts are indexed by their unique type string (e.g., "wokwi-arduino-uno").
 */
export const PARTS_REGISTRY = new Map<string, PartDefinition>();

/**
 * Returns all registered parts as an array, grouped by category.
 */
export const getRegisteredParts = (): PartDefinition[] => {
  return Array.from(PARTS_REGISTRY.values());
};

/**
 * Registers a new part definition.
 */
export const registerPart = (definition: PartDefinition) => {
  PARTS_REGISTRY.set(definition.type, definition);
};
