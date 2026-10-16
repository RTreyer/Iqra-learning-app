import React from "react";
import { render, screen } from "@testing-library/react-native";
import { LanguageProvider } from "@/context/LanguageContext";
import { UiText } from "@/components/UiText";

test("renders UiText inside LanguageProvider", async () => {
  render(
    <LanguageProvider>
      <UiText>مرحبا</UiText>
    </LanguageProvider>,
  );
  expect(await screen.findByText("مرحبا")).toBeTruthy();
});
