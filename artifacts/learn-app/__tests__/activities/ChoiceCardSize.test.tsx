import { render, screen } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";

import { ChoiceCard, isSyllable } from "@/components/activities/shared/ChoiceCard";

const card = (word: string) =>
  render(
    <ChoiceCard
      index={0}
      word={word}
      state="idle"
      selected={false}
      locked={false}
      variant="word"
      onPick={jest.fn()}
    />,
  );

const fontSize = (word: string) => StyleSheet.flatten(screen.getByText(word).props.style).fontSize;

test("a syllable on a word card is drawn as large as a letter, so أُ and أَ can be told apart", () => {
  expect(isSyllable("أُ")).toBe(true);
  expect(isSyllable("يَا")).toBe(true);
  expect(isSyllable("أُحِبُّ")).toBe(false);
  card("أُ");
  expect(fontSize("أُ")).toBeGreaterThanOrEqual(48);
});

test("whole words stay at word size, still large enough for their vowel marks", () => {
  card("أُحِبُّ");
  const size = fontSize("أُحِبُّ");
  expect(size).toBeGreaterThanOrEqual(28);
  expect(size).toBeLessThan(48);
});
