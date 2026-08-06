export const themeTokenNames = [
  "canvas",
  "canvas-accent",
  "surface",
  "border",
  "fg",
  "fg-muted",
  "accent",
  "accent-fg",
  "info",
  "warning",
  "danger",
  "success",
  "overlay",
  "shell-glow-a",
  "shell-glow-b",
] as const;

export type ThemeTokenName = (typeof themeTokenNames)[number];
