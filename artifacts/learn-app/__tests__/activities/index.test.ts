import { ACTIVITY_COMPONENTS, activityFor } from "@/components/activities";
import { books } from "@/content";

test("every lesson type in the catalog has an activity component", () => {
  for (const book of books)
    for (const unit of book.units)
      for (const lesson of unit.lessons) expect(activityFor(lesson.type)).toBeDefined();
  expect(Object.keys(ACTIVITY_COMPONENTS).sort()).toEqual([
    "arithmetic",
    "behavior",
    "build_word",
    "counting",
    "letter_pick",
    "listen_pick",
    "matching",
    "naming",
    "story",
    "trace",
    "word_read",
  ]);
});
