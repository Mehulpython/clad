// ─── Color Utilities ────────────────────────────────────────
// Shared color name → hex mapping for UI rendering.

const COLOR_MAP: Record<string, string> = {
  // Reds
  red: "#ef4444", burgundy: "#800020", maroon: "#800000", rust: "#b7410e",
  crimson: "#dc143c", scarlet: "#ff2400", coral: "#ff7f50",
  // Blues
  blue: "#3b82f6", navy: "#1e293b", azure: "#007fff", cobalt: "#0047ab",
  royal: "#4169e1", sky: "#87ceeb", baby: "#89cff0", denim: "#1560bd",
  teal: "#14b8a6", turquoise: "#40e0d0", indigo: "#6366f1",
  // Greens
  green: "#22c55e", forest: "#228b22", olive: "#808000", sage: "#9caf88",
  emerald: "#50c878", mint: "#98ff98", lime: "#32cd32",
  // Yellows / Oranges
  yellow: "#eab308", gold: "#ffd700", mustard: "#ffdb58",
  orange: "#f97316", burnt: "#cc5500", amber: "#ffb000", peach: "#ffcba4",
  // Purples / Pinks
  purple: "#a855f7", violet: "#ee82ee", lavender: "#e6e6fa", mauve: "#e0b0ff",
  magenta: "#ff00ff", fuchsia: "#ff00ff",
  pink: "#ec4899", rose: "#f43f5e", blush: "#de5d83", hot: "#ff69b4",
  // Neutrals
  black: "#111111", white: "#f5f5f5", gray: "#6b7280", charcoal: "#36453f",
  silver: "#c0c0c0", ivory: "#fffff0",
  // Browns
  brown: "#92400e", tan: "#d2b48c", camel: "#c19a6b", beige: "#f5f5dc",
  cream: "#fffdd0", khaki: "#f0e68c",
};

/**
 * Convert a color name to its approximate hex value.
 */
export function colorToHex(color: string): string {
  if (!color) return "#666666";
  const c = color.toLowerCase().trim();

  // Direct match
  if (COLOR_MAP[c]) return COLOR_MAP[c];

  // Partial match — check if any key is contained in the color name or vice versa
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (c.includes(key) || key.includes(c)) return hex;
  }

  // Check for common modifiers
  if (c.includes("light")) return lighten(COLOR_MAP[c.replace("light", "").trim()] || "#888888");
  if (c.includes("dark")) return darken(COLOR_MAP[c.replace("dark", "").trim()] || "#444444");

  return "#666666";
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.min(255, r + 60).toString(16).padStart(2, "0")}${Math.min(
    255,
    g + 60
  ).toString(16).padStart(2, "0")}${Math.min(255, b + 60)
    .toString(16)
    .padStart(2, "0")}`;
}

function darken(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.max(0, r - 40).toString(16).padStart(2, "0")}${Math.max(
    0,
    g - 40
  ).toString(16).padStart(2, "0")}${Math.max(0, b - 40)
    .toString(16)
    .padStart(2, "0")}`;
}
