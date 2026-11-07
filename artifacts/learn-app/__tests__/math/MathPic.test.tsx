import { render, screen } from "@testing-library/react-native";
import React from "react";
import { MathPic, PicGroup } from "@/components/activities/math/MathPic";

test("a shape is an image labelled by its words", () => {
  render(<MathPic pic={{ shape: "square", color: "green", size: "big" }} />);
  expect(screen.getByLabelText("مُرَبَّعٌ أَخْضَرُ كَبِيرٌ")).toBeTruthy();
});

test("an emoji shows its drawing", () => {
  render(<MathPic pic={{ emoji: "🐟" }} />);
  expect(screen.getByTestId("picture-🐟")).toBeTruthy();
});

test("a group renders every picture", () => {
  render(<PicGroup pics={[{ emoji: "🐟" }, { emoji: "🐟" }, { emoji: "🐟" }]} />);
  expect(screen.getAllByTestId("picture-🐟")).toHaveLength(3);
});

test("groups of 6 or more are small and wrap at five, like a ten frame", () => {
  const six = Array.from({ length: 6 }, () => ({ emoji: "🐟" }));
  render(<PicGroup pics={six} />);
  expect(screen.getByTestId("pic-group")).toHaveStyle({ maxWidth: 5 * 36 + 4 * 6 });
  expect(screen.getAllByTestId("picture-🐟")[0]).toHaveStyle({ width: 36 });
});

test("groups of 5 or fewer keep the normal size", () => {
  const five = Array.from({ length: 5 }, () => ({ emoji: "🐟" }));
  render(<PicGroup pics={five} />);
  expect(screen.getByTestId("pic-group")).toHaveStyle({ maxWidth: 260 });
  expect(screen.getAllByTestId("picture-🐟")[0]).toHaveStyle({ width: 52 });
});
