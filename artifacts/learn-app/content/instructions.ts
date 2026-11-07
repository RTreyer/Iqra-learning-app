import type { Lesson, LessonType } from "./types";

/**
 * Activity types whose rounds speak their own task (useInstruction, NumberQuiz):
 * in maths the task changes every round, so a fixed instruction would only repeat it.
 */
export const SPOKEN_PER_ROUND = [
  "counting",
  "arithmetic",
  "picture_choice",
  "compare",
  "number_fill",
  "sort",
] as const satisfies readonly LessonType[];

type SpokenPerRound = (typeof SPOKEN_PER_ROUND)[number];

/**
 * What to do, spoken after the lesson title: a child who cannot read yet must hear
 * every instruction (docs/DIDAKTIK.md, section 6). Fully vocalised so the TTS voice
 * reads it correctly. A new activity type fails to compile until it has an entry here
 * or speaks its task per round.
 */
export const ACTIVITY_INSTRUCTIONS: Record<Exclude<LessonType, SpokenPerRound>, string> = {
  story: "اِضْغَطْ عَلَى كُلِّ جُمْلَةٍ لِتَسْمَعَهَا.",
  naming: "اِضْغَطْ عَلَى كُلِّ كَلِمَةٍ لِتَسْمَعَهَا.",
  letter_pick: "اِسْمَعِ الْحَرْفَ، وَابْحَثْ عَنْهُ.",
  word_read: "اِسْمَعِ الْكَلِمَةَ، وَاخْتَرِ الصَّوَابَ.",
  listen_pick: "اِسْمَعْ جَيِّدًا، وَاخْتَرِ الصَّوَابَ.",
  behavior:
    "اِضْغَطْ عَلَامَةَ الصَّحِّ لِلسُّلُوكِ الصَّحِيحِ، وَعَلَامَةَ الْخَطَأِ لِلسُّلُوكِ الْخَطَأِ.",
  matching: "اِضْغَطْ عَلَى شَيْءٍ فِي الْيَمِينِ، ثُمَّ عَلَى مَا يُنَاسِبُهُ فِي الْيَسَارِ.",
  trace: "تَتَبَّعِ الشَّكْلَ بِإِصْبَعِكَ، ثُمَّ اضْغَطْ تَمَّ.",
  build_word: "اِسْمَعْ جَيِّدًا، وَحَمِّلِ الْقِطَارَ.",
};

/** The spoken instruction of a lesson, or undefined when its rounds speak the task. */
export function instructionFor(lesson: Pick<Lesson, "type">): string | undefined {
  return lesson.type in ACTIVITY_INSTRUCTIONS
    ? ACTIVITY_INSTRUCTIONS[lesson.type as keyof typeof ACTIVITY_INSTRUCTIONS]
    : undefined;
}
