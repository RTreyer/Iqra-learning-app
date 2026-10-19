import type { ComponentType } from "react";
import type { LessonType } from "@/content/types";
import { ArithmeticActivity } from "./ArithmeticActivity";
import { BehaviorActivity } from "./BehaviorActivity";
import { BuildWordActivity } from "./BuildWordActivity";
import { CountingActivity } from "./CountingActivity";
import { LetterPickActivity } from "./LetterPickActivity";
import { ListenPickActivity } from "./ListenPickActivity";
import { MatchingActivity } from "./MatchingActivity";
import { NamingActivity } from "./NamingActivity";
import { StoryActivity } from "./StoryActivity";
import { TraceActivity } from "./TraceActivity";
import type { ActivityProps } from "./types";
import { WordReadActivity } from "./WordReadActivity";

export type { ActivityProps } from "./types";

export type ActivityMap = { [K in LessonType]: ComponentType<ActivityProps<K>> };

/** One component per lesson type; the mapped type fails to compile when a type is missing or extra. */
export const ACTIVITY_COMPONENTS: ActivityMap = {
  story: StoryActivity,
  naming: NamingActivity,
  letter_pick: LetterPickActivity,
  word_read: WordReadActivity,
  listen_pick: ListenPickActivity,
  behavior: BehaviorActivity,
  matching: MatchingActivity,
  trace: TraceActivity,
  build_word: BuildWordActivity,
  counting: CountingActivity,
  arithmetic: ArithmeticActivity,
};

export function activityFor<K extends LessonType>(type: K): ComponentType<ActivityProps<K>> {
  return ACTIVITY_COMPONENTS[type];
}
