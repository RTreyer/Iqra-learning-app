import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { db, lessonProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const UpsertBody = z.object({
  lessonId: z.string().min(1),
  stars: z.number().int().min(0).max(3),
});

router.get("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const rows = await db
      .select({
        lessonId: lessonProgressTable.lessonId,
        stars: lessonProgressTable.stars,
        completedAt: lessonProgressTable.completedAt,
      })
      .from(lessonProgressTable)
      .where(eq(lessonProgressTable.userId, req.user.id));

    res.json({
      entries: rows.map((r) => ({
        lessonId: r.lessonId,
        stars: r.stars,
        completedAt: r.completedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load progress");
    res.status(500).json({ error: "Failed to load progress" });
  }
});

router.post("/progress", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = UpsertBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid fields" });
    return;
  }

  const { lessonId, stars } = parsed.data;
  const userId = req.user.id;

  try {
    const [row] = await db
      .insert(lessonProgressTable)
      .values({ userId, lessonId, stars })
      .onConflictDoUpdate({
        target: [lessonProgressTable.userId, lessonProgressTable.lessonId],
        set: {
          // Keep the highest star count seen across all attempts
          stars: sql`GREATEST(lesson_progress.stars, EXCLUDED.stars)`,
          updatedAt: new Date(),
        },
      })
      .returning({
        lessonId: lessonProgressTable.lessonId,
        stars: lessonProgressTable.stars,
        completedAt: lessonProgressTable.completedAt,
      });

    res.json({
      lessonId: row.lessonId,
      stars: row.stars,
      completedAt: row.completedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save progress");
    res.status(500).json({ error: "Failed to save progress" });
  }
});

export default router;
