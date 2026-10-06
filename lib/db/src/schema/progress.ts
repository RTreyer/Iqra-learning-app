import { integer, pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const lessonProgressTable = pgTable(
  "lesson_progress",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    lessonId: varchar("lesson_id", { length: 64 }).notNull(),
    stars: integer("stars").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [unique("lesson_progress_user_lesson_unique").on(t.userId, t.lessonId)],
);

export type LessonProgress = typeof lessonProgressTable.$inferSelect;
export type InsertLessonProgress = typeof lessonProgressTable.$inferInsert;
