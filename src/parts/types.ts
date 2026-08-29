export interface PartDefinition {
  type: string; // e.g., "wokwi-led"
  label: string; // e.g., "LED"
  category: string; // e.g., "Basic"
  render: (props: {
    attrs: Record<string, any>;
    pinValues?: Record<string, 'HIGH' | 'LOW' | 'FLOAT'>;
  }) => React.JSX.Element;
  defaultAttrs: Record<string, any>;
}
