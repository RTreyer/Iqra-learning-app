import { render, screen } from "@testing-library/react-native";
import React from "react";

import { BowlMessage, messageLetters } from "@/components/world/Bowl";
import { MESSAGE } from "@/content/story";

const letters = [...MESSAGE.words, MESSAGE.name].flatMap(messageLetters);

test("Rasha's note lies under the bowl; only alif reads before any letter is learnt", () => {
  render(<BowlMessage learnt={new Set()} />);
  const note = screen.getByTestId("bowl-message");
  expect(note.props.accessibilityLabel).toContain("تَحْتَ الصَّحْنِ وَرَقَةٌ");
  expect(note.props.accessibilityState).toMatchObject({ checked: false });
  const alifs = letters.filter((l) => l === "ا").length;
  expect(screen.getAllByTestId("bowl-letter-lit")).toHaveLength(alifs);
  expect(screen.getAllByTestId("bowl-letter-faint")).toHaveLength(letters.length - alifs);
});

test("with every letter learnt the note reads as a whole", () => {
  render(<BowlMessage learnt={new Set(letters)} />);
  const note = screen.getByTestId("bowl-message");
  expect(note.props.accessibilityLabel).toBe(`${MESSAGE.words.join(" ")}. ${MESSAGE.name}.`);
  expect(note.props.accessibilityState).toMatchObject({ checked: true });
  expect(screen.queryByTestId("bowl-letter-faint")).toBeNull();
  expect(screen.getByText(MESSAGE.words.join(" "))).toBeTruthy();
});
