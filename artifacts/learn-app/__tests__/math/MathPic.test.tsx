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
