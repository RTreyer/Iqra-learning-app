import { getUnit } from "@/content";
import { storySymbols, unitStoryLine } from "@/content/story";
import { collectedLetters, sectionLetter, storyStep, symbolsBack } from "@/lib/storyProgress";

test("a section is about the letter before its colon; exercises are about none", () => {
  expect(sectionLetter("م: أُحِبُّ مَامَا")).toBe("م");
  expect(sectionLetter("تَدْرِيبَات")).toBeNull();
  expect(sectionLetter(undefined)).toBeNull();
});

test("a letter is collected back once all of its lessons are done", () => {
  const unit = getUnit("a2")!;
  const ofMim = unit.lessons.filter((l) => sectionLetter(l.section) === "م").map((l) => l.id);
  expect(ofMim.length).toBeGreaterThan(0);
  const some = new Set(ofMim.slice(0, -1));
  expect(collectedLetters(unit, (l) => some.has(l.id)).has("م")).toBe(false);
  const all = new Set(ofMim);
  expect([...collectedLetters(unit, (l) => all.has(l.id))]).toEqual(["م"]);
  expect(collectedLetters(unit, () => true).size).toBe(unit.letters!.length);
});

test("a lesson brings a letter back when it crosses to the next one, and the last completes the goal", () => {
  expect(symbolsBack(7, 0.5)).toBe(3);
  // 31 lessons, 7 letters: the 5th lesson done brings the first letter back.
  expect(storyStep(7, 31, 4, false)).toEqual({ share: 5 / 31, fresh: 0, completed: false });
  expect(storyStep(7, 31, 5, false).fresh).toBeNull();
  // Replaying a done lesson brings nothing new.
  expect(storyStep(7, 31, 5, true)).toEqual({ share: 5 / 31, fresh: null, completed: false });
  expect(storyStep(7, 31, 30, false)).toEqual({ share: 1, fresh: 6, completed: true });
});

test("the goal and Hudhud's line follow the story: letters in Arabic, sacks in maths", () => {
  expect(storySymbols(getUnit("a2")!, "arabic")).toEqual(getUnit("a2")!.letters);
  expect(storySymbols({}, "math")).toEqual(["١", "٢", "٣", "٤", "٥"]);
  expect(unitStoryLine(getUnit("a3")!, "arabic")).toBe("هَيَّا نَجْمَعُ حُرُوفَ رِسَالَتِي!");
  expect(unitStoryLine({}, "math")).toBe("هَيَّا نَعُدُّ أَكْيَاسَ الْبُنِّ لِلتَّاجِرِ!");
});
