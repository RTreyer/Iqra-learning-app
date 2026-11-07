import { render, screen } from "@testing-library/react-native";
import React from "react";

import { Picture, hasPicture, pictureKey } from "@/components/pictures/Picture";

test("a drawn emoji renders as a drawing, not as text", () => {
  render(<Picture emoji="🍎" size={40} />);
  expect(screen.queryByText("🍎")).toBeNull();
});

test("an emoji without a drawing falls back to text", () => {
  render(<Picture emoji="🛸" size={40} />);
  expect(screen.getByText("🛸")).toBeTruthy();
});

test("variation selectors name the same picture", () => {
  expect(pictureKey("☀️")).toBe("☀");
  expect(hasPicture("🍎")).toBe(true);
});

test("every picture in the lessons and worked examples is drawn, none falls back to emoji", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { books } = require("@/content") as typeof import("@/content");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const demos = require("@/content/demos") as Record<string, unknown>;
  const missing = new Set<string>();
  const walk = (value: unknown, top: unknown): void => {
    if (Array.isArray(value)) return value.forEach((v) => walk(v, top));
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    // A lesson's own emoji is its card decoration; only the pictures inside it are drawn.
    if (
      value !== top &&
      typeof record.emoji === "string" &&
      record.emoji &&
      !hasPicture(record.emoji)
    )
      missing.add(record.emoji);
    for (const [key, v] of Object.entries(record)) if (key !== "emoji") walk(v, top);
  };
  for (const book of books) for (const unit of book.units) for (const l of unit.lessons) walk(l, l);
  walk(Object.values(demos), null);
  expect([...missing]).toEqual([]);
});
