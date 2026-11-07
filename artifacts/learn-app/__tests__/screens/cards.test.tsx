import AsyncStorage from "@react-native-async-storage/async-storage";
import { screen } from "@testing-library/react-native";
import React from "react";
import { StarBadge, starsLabel } from "@/components/StarBadge";
import { withAlpha } from "@/theme/tokens";
import { renderScreen } from "@/test-utils/screens";

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
