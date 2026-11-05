import { screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { NumberFillActivity } from "@/components/activities/NumberFillActivity";
import type { Lesson } from "@/content/types";
import { renderActivity } from "@/test-utils/activities";

const lesson: Extract<Lesson, { type: "number_fill" }> = {
  id: "math-u4-1",
  number: 1,
  title: "أَطْرَحُ",
  subtitle: "",
  emoji: "➖",
  color: "#7C3AED",
  type: "number_fill",
  rounds: [{ prompt: "أُكْمِلُ", cells: [10, "-", 2, "=", "?"], layout: "row", options: [7, 8, 9] }],
};

test("a five cell row fits a 360 px phone inside the activity padding", () => {
  renderActivity(
    <NumberFillActivity lesson={lesson} color="#7C3AED" attemptKey="x:1" onComplete={jest.fn()} />,
  );
  const row = StyleSheet.flatten(screen.getByTestId("number-fill-sentence").props.style);
  const box = StyleSheet.flatten(screen.getByTestId("number-fill-box").props.style);
  const width = 5 * box.minWidth + 4 * row.gap;
  expect(width).toBeLessThanOrEqual(360 - 2 * 20);
});
