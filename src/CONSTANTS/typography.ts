export const TYPOGRAPHY = {
  UI: "Inter, system-ui, -apple-system, sans-serif",
  CODE: "'JetBrains Mono', monospace",
  NUMERIC: "'JetBrains Mono', monospace",
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;
export type TypographyValue = typeof TYPOGRAPHY[TypographyKey];
