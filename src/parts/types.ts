export interface PartPin {
  name: string;
  x: number;
  y: number;
}

export interface PartDefinition {
  type: string; // e.g., "wokwi-led"
  label: string; // e.g., "LED"
  category: string; // e.g., "Basic"
  pins: PartPin[]; // relative to part origin
  render: (props: { attrs: Record<string, any> }) => JSX.Element;
  defaultAttrs: Record<string, any>;
}
