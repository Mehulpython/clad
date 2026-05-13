// ─── Color Utils Tests ─────────────────────────────────────
// Tests for colorToHex and color mapping logic.

import { describe, it, expect } from "vitest";
import { colorToHex } from "../color-utils";

describe("colorToHex", () => {
  // ── Direct matches ─────────────────────────────────────

  it("returns correct hex for basic color names", () => {
    expect(colorToHex("red")).toBe("#ef4444");
    expect(colorToHex("blue")).toBe("#3b82f6");
    expect(colorToHex("green")).toBe("#22c55e");
    expect(colorToHex("yellow")).toBe("#eab308");
    expect(colorToHex("purple")).toBe("#a855f7");
    expect(colorToHex("orange")).toBe("#f97316");
  });

  it("returns correct hex for neutral colors", () => {
    expect(colorToHex("black")).toBe("#111111");
    expect(colorToHex("white")).toBe("#f5f5f5");
    expect(colorToHex("gray")).toBe("#6b7280");
    expect(colorToHex("beige")).toBe("#f5f5dc");
    expect(colorToHex("cream")).toBe("#fffdd0");
  });

  it("returns correct hex for brown tones", () => {
    expect(colorToHex("brown")).toBe("#92400e");
    expect(colorToHex("tan")).toBe("#d2b48c");
    expect(colorToHex("camel")).toBe("#c19a6b");
    expect(colorToHex("khaki")).toBe("#f0e68c");
  });

  it("returns correct hex for specific color variants", () => {
    expect(colorToHex("navy")).toBe("#1e293b");
    expect(colorToHex("burgundy")).toBe("#800020");
    expect(colorToHex("coral")).toBe("#ff7f50");
    expect(colorToHex("teal")).toBe("#14b8a6");
    expect(colorToHex("indigo")).toBe("#6366f1");
    expect(colorToHex("lavender")).toBe("#e6e6fa");
  });

  // ── Partial matching ────────────────────────────────────

  it("handles partial name matches via substring inclusion", () => {
    const result = colorToHex("dark blue");
    // Should not crash and should return some valid hex
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  // ── Edge cases ──────────────────────────────────────────

  it('returns default gray (#666666) for empty string', () => {
    expect(colorToHex("")).toBe("#666666");
  });

  it("returns default gray for falsy input", () => {
    expect(colorToHex("")).toBe("#666666");
  });

  it("returns default gray for completely unknown colors", () => {
    expect(colorToHex("xyznonexistent")).toBe("#666666");
    expect(colorToHex("foobarcolor")).toBe("#666666");
  });

  it("trims and lowercases input before matching", () => {
    expect(colorToHex("  RED  ")).toBe("#ef4444");
    expect(colorToHex("BLUE")).toBe("#3b82f6");
  });

  it("always returns a valid 6-digit hex string", () => {
    const inputs: string[] = [
      "red", "blue", "", "unknown", "navy", "sage",
      "  green ", "MAGENTA",
    ];
    for (const input of inputs) {
      const result = colorToHex(input);
      expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
