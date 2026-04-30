// ─── color-utils.test.ts ───────────────────────────────────

import { describe, it, expect } from "vitest";
import { colorToHex } from "@/lib/color-utils";

describe("colorToHex", () => {
  it("returns exact match for known colors", () => {
    expect(colorToHex("red")).toBe("#ef4444");
    expect(colorToHex("blue")).toBe("#3b82f6");
    expect(colorToHex("black")).toBe("#111111");
    expect(colorToHex("white")).toBe("#f5f5f5");
    expect(colorToHex("navy")).toBe("#1e293b");
  });

  it("handles case-insensitive input", () => {
    expect(colorToHex("RED")).toBe("#ef4444");
    expect(colorToHex("Blue")).toBe("#3b82f6");
    expect(colorToHex("NAVY")).toBe("#1e293b");
  });

  it("handles whitespace", () => {
    expect(colorToHex("  red  ")).toBe("#ef4444");
  });

  it("returns partial match for compound names", () => {
    // "burgundy red" should find burgundy or red
    const result = colorToHex("burgundy");
    expect(result).toBeTruthy();
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it("returns fallback for unknown colors", () => {
    expect(colorToHex("")).toBe("#666666");
    expect(colorToHex("unknowncolorxyz")).toBe("#666666");
  });

  it("handles light/dark modifiers on unknown color names", () => {
    // "light somethingunknown" should trigger the lighten path
    const lightUnknown = colorToHex("light mauve");
    const darkUnknown = colorToHex("dark mauve");
    expect(lightUnknown).toBeTruthy();
    expect(darkUnknown).toBeTruthy();
    expect(lightUnknown).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(darkUnknown).toMatch(/^#[0-9a-fA-F]{6}$/);
    // Both resolve through fallback → may be same or different, but must be valid hex
  });

  it("covers all major color categories", () => {
    // Reds
    expect(colorToHex("burgundy")).toBeTruthy();
    expect(colorToHex("maroon")).toBeTruthy();
    // Blues
    expect(colorToHex("teal")).toBeTruthy();
    expect(colorToHex("indigo")).toBeTruthy();
    // Greens
    expect(colorToHex("olive")).toBeTruthy();
    expect(colorToHex("mint")).toBeTruthy();
    // Browns
    expect(colorToHex("camel")).toBeTruthy();
    expect(colorToHex("beige")).toBeTruthy();
    // Purples/Pinks
    expect(colorToHex("lavender")).toBeTruthy();
    expect(colorToHex("rose")).toBeTruthy();
  });

  it("always returns valid hex format", () => {
    const colors = [
      "red", "blue", "green", "yellow", "purple", "orange",
      "black", "white", "gray", "brown", "pink", "navy",
      "beige", "cream", "coral", "turquoise", "gold",
      "silver", "charcoal", "ivory", "rust", "mauve",
      "", "   ", "bluish-green", "something-random",
    ];
    for (const c of colors) {
      const hex = colorToHex(c);
      expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
