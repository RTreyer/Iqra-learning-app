import { render, screen } from "@testing-library/react-native";
import React from "react";
import { MathPic, PicGroup } from "@/components/activities/math/MathPic";

test("a shape is an image labelled by its words", () => {
  render(<MathPic pic={{ shape: "square", color: "green", size: "big" }} />);
  expect(screen.getByLabelText("مُرَبَّعٌ أَخْضَرُ كَبِيرٌ")).toBeTruthy();
});

test("an emoji shows its character", () => {
  render(<MathPic pic={{ emoji: "🐟" }} />);
  expect(screen.getByText("🐟")).toBeTruthy();
});

test("a group renders every picture", () => {
  render(<PicGroup pics={[{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }]} />);
  expect(screen.getAllByText("🐟")).toHaveLength(3);
});

test("groups of 6 or more are small and wrap at five, like a ten frame", () => {
  const six = Array.from({ length: 6 }, () => ({ emoji: "🐟" }));
  render(<PicGroup pics={six} />);
  expect(screen.getByTestId("pic-group")).toHaveStyle({ maxWidth: 5 * 36 + 4 * 6 });
  expect(screen.getAllByText("🐟")[0]).toHaveStyle({ fontSize: 36 * 0.8 });
});

test("groups of 5 or fewer keep the normal size", () => {
  const five = Array.from({ length: 5 }, () => ({ emoji: "🐟" }));
  render(<PicGroup pics={five} />);
  expect(screen.getByTestId("pic-group")).toHaveStyle({ maxWidth: 260 });
  expect(screen.getAllByText("🐟")[0]).toHaveStyle({ fontSize: 52 * 0.8 });
});
