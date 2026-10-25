import AsyncStorage from "@react-native-async-storage/async-storage";
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
  expect(screen.getByLabelText("٧ نجوم")).toBeTruthy();
});

test("LessonRow announces completion and stars", () => {
  renderScreen(
    <LessonRow lesson={lesson} status={{ completed: true, stars: 2 }} onPress={jest.fn()} />,
  );
  expect(screen.getByLabelText(`${lesson.title}، مكتمل، نجمتان`)).toBeTruthy();
});

test("LessonRow mirrors for Arabic with the accent border on the right", () => {
  renderScreen(
    <LessonRow lesson={lesson} status={{ completed: false, stars: 0 }} onPress={jest.fn()} />,
  );
  expect(screen.getByTestId(`lesson-row-${lesson.id}`)).toHaveStyle({
    flexDirection: "row-reverse",
    borderRightWidth: 5,
  });
});

describe("digits follow the interface language", () => {
  afterEach(() => AsyncStorage.clear());

  test("Arabic shows Eastern Arabic digits", () => {
    renderScreen(<StarBadge stars={12} />);
    expect(screen.getByTestId("star-badge")).toHaveTextContent("⭐١٢");
  });

  test("English keeps Western digits", async () => {
    await AsyncStorage.setItem("iqra_ui_language", "en");
    renderScreen(<StarBadge stars={12} />);
    expect(await screen.findByLabelText("12 stars")).toBeTruthy();
    expect(screen.getByTestId("star-badge")).toHaveTextContent("⭐12");
  });
});
