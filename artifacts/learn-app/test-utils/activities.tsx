import { render } from "@testing-library/react-native";
import React from "react";
import { getLesson } from "@/content";
import type { Lesson, LessonType } from "@/content/types";
import { LanguageProvider } from "@/context/LanguageContext";

/** A real lesson from content/, narrowed to its type. */
export function lessonOf<T extends LessonType>(id: string, type: T): Extract<Lesson, { type: T }> {
  const lesson = getLesson(id)?.lesson;
  if (!lesson || lesson.type !== type) throw new Error(`Lesson ${id} is not a ${type} lesson`);
  return lesson as Extract<Lesson, { type: T }>;
}

/** Renders an activity inside the providers UiText needs. */
export function renderActivity(ui: React.ReactElement) {
  const result = render(<LanguageProvider>{ui}</LanguageProvider>);
  return {
    ...result,
    rerenderActivity: (next: React.ReactElement) =>
      result.rerender(<LanguageProvider>{next}</LanguageProvider>),
  };
}
