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
