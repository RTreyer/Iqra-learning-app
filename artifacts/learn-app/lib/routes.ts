import type { Href } from "expo-router";

export const routes = {
  home: (): Href => "/",
  book: (bookId: string): Href => ({ pathname: "/book/[bookId]", params: { bookId } }),
  unit: (unitId: string): Href => ({ pathname: "/unit/[unitId]", params: { unitId } }),
  lesson: (lessonId: string): Href => ({ pathname: "/lesson/[lessonId]", params: { lessonId } }),
  review: (): Href => "/review",
};
