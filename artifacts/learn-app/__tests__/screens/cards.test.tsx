import { screen } from "@testing-library/react-native";
import React from "react";
import { LessonRow } from "@/components/LessonRow";
import { StarBadge, starsLabel } from "@/components/StarBadge";
import { getLesson } from "@/content";
import { withAlpha } from "@/theme/tokens";
import { renderScreen } from "@/test-utils/screens";

const lesson = getLesson("u2-3")!.lesson;

test("withAlpha turns a hex colour into rgba", () => {
  expect(withAlpha("#D97706", 0.18)).toBe("rgba(217,119,6,0.18)");
});

test("star labels use Arabic dual and plural forms", () => {
  expect(starsLabel(1, "ar")).toBe("نجمة واحدة");
  expect(starsLabel(2, "ar")).toBe("نجمتان");
  expect(starsLabel(5, "ar")).toBe("5 نجوم");
  expect(starsLabel(12, "ar")).toBe("12 نجمة");
  expect(starsLabel(1, "en")).toBe("1 star");
  expect(starsLabel(3, "en")).toBe("3 stars");
});

test("StarBadge announces the star count", () => {
  renderScreen(<StarBadge stars={7} />);
  expect(screen.getByLabelText("7 نجوم")).toBeTruthy();
});

test("LessonRow announces completion and stars", () => {
  renderScreen(<LessonRow lesson={lesson} status={{ completed: true, stars: 2 }} onPress={jest.fn()} />);
  expect(screen.getByLabelText(`${lesson.title}، مكتمل، نجمتان`)).toBeTruthy();
});

test("LessonRow mirrors for Arabic with the accent border on the right", () => {
  renderScreen(<LessonRow lesson={lesson} status={{ completed: false, stars: 0 }} onPress={jest.fn()} />);
  expect(screen.getByTestId(`lesson-row-${lesson.id}`)).toHaveStyle({ flexDirection: "row-reverse", borderRightWidth: 5 });
});
