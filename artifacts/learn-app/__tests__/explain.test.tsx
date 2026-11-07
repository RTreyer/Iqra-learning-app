import { render, screen } from "@testing-library/react-native";
import React from "react";

import { arithmeticPrompt } from "@/components/activities/math/prompts";
import { Gloss } from "@/components/Gloss";
import { GOAL_LINES } from "@/content/story";
import { EN_GLOSS } from "@/content/translations/gloss";
import { EN_LINES } from "@/content/translations/lines";
import { LanguageProvider } from "@/context/LanguageContext";
import { explainLine, gloss, lineParts, setExplainMode } from "@/lib/explain";
import { speak } from "@/lib/speech";
import { readingOf, transliterate } from "@/lib/transliterate";
import { collectExplainStrings } from "@/test-utils/explainStrings";

const Speech = jest.requireMock("expo-speech") as { speak: jest.Mock };

afterEach(() => setExplainMode(false));

test("every line has its English and every word or sentence its meaning", () => {
  const { lines, gloss: words } = collectExplainStrings();
  expect(lines.filter((text) => !EN_LINES[text])).toEqual([]);
  expect(words.filter((text) => !EN_GLOSS[text])).toEqual([]);
});

test("in Arabic mode nothing changes", () => {
  expect(lineParts(GOAL_LINES.letters.path)).toEqual([
    { text: GOAL_LINES.letters.path, lang: "ar" },
  ]);
  expect(gloss("قِطَّة")).toBeNull();
});

test("in English mode Hudhud's lines are English, the learning stays Arabic with its meaning", () => {
  setExplainMode(true);
  // English is isolated left to right inside the right-to-left layout.
  expect(explainLine(GOAL_LINES.letters.path)).toBe(
    `\u2066${EN_LINES[GOAL_LINES.letters.path]}\u2069`,
  );
  // A line around the child's letter: the letter stays Arabic, spoken by the Arabic voice.
  expect(lineParts("حَاوِلْ مَرَّةً أُخْرَى، مَ")).toEqual([
    { text: `${EN_LINES["حَاوِلْ مَرَّةً أُخْرَى"]},`, lang: "en" },
    { text: "مَ", lang: "ar" },
  ]);
  // A learning word is never replaced, it gets its meaning.
  const word = Object.keys(EN_GLOSS)[0];
  expect(lineParts(word)).toEqual([{ text: word, lang: "ar" }]);
  expect(gloss(word)).toBe(EN_GLOSS[word]);
  // The spoken sums are made by code.
  expect(explainLine(arithmeticPrompt(3, "+", 2).spoken)).toBe(
    "\u2066three plus two makes how many?\u2069",
  );
});

test("letters and syllables get a Latin reading", () => {
  expect(readingOf("م")).toBe("the letter mīm");
  expect(readingOf("مـ")).toBe("the letter mīm");
  expect(transliterate("مَ")).toBe("ma");
  expect(transliterate("مَا")).toBe("mā");
  expect(transliterate("بُو")).toBe("bū");
  expect(transliterate("سِي")).toBe("sī");
});

test("in English mode a line is spoken in English and the letter in it in Arabic", () => {
  setExplainMode(true);
  Speech.speak.mockClear();
  speak("حَاوِلْ مَرَّةً أُخْرَى، مَ");
  expect(Speech.speak).toHaveBeenCalledTimes(1);
  const [first, options] = Speech.speak.mock.calls[0];
  expect(options.language).toBe("en-US");
  expect(first).toMatch(/^[A-Za-z]/);
  // The next part follows once the first is done.
  options.onDone();
  expect(Speech.speak).toHaveBeenLastCalledWith("مَ", expect.objectContaining({ language: "ar" }));
});

test("the gloss shows only in English mode", () => {
  const word = Object.keys(EN_GLOSS)[0];
  render(
    <LanguageProvider>
      <Gloss text={word} />
    </LanguageProvider>,
  );
  expect(screen.queryByTestId("gloss")).toBeNull();
  setExplainMode(true);
  render(<Gloss text={word} />, { wrapper: EnglishProvider });
  expect(screen.getByTestId("gloss")).toHaveTextContent(EN_GLOSS[word]);
});

/** A language provider that starts in English (as after the parents chose it). */
function EnglishProvider({ children }: { children: React.ReactNode }) {
  return <LanguageProvider initial="en">{children}</LanguageProvider>;
}
