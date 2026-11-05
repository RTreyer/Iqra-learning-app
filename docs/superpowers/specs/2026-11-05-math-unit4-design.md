# Math Unit 4 (subtraction within 10): design

Date: 2026-11-05. Status: built, native speaker review pending. Step 4 of the math rebuild (see `2026-11-05-math-foundation-design.md`), following the Unit 2 rebuild (`2026-11-05-math-unit2-design.md`).

Source: الرياضيات، الصف الأول، الجزء الأول (Sana'a 2026), Unit 4 الطرح ضمن العدد ١٠, printed pp. 91 to 116. Notes: `docs/content/textbooks/math-part1/unit-04.md`.

## Unit `math-u4`

File `content/math/bookUnit4.ts`, built with `mathKit.ts`. Unit number 4, title الْوَحْدَةُ الرَّابِعَةُ, theme الطَّرْحُ ضِمْنَ الْعَدَدِ ١٠, badge أَطْرَحُ, 23 lessons. Every lesson has a `section` from `bookSection(4, n, title)`; the test lessons have اخْتِبَارُ الْوَحْدَةِ. No foundation changes: only the existing types are used.

The book's method is kept: taken objects are **crossed out** (`number_fill` rounds with `pics`, the last `b` pictures `crossed: true`), and the child reads the sentence `a - b = c` under the picture. Groups of 6 or more show as a ten frame. Only the task is spoken (كَمِ الْبَاقِي؟، أَطْرَحُ رَأْسِيًّا: كَمِ الْبَاقِي؟، أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ.); story prompts name what happened without numbers (طَارَتْ بَالُونَاتٌ. كَمِ الْبَاقِي؟).

| Book lesson | App lessons (type) |
|---|---|
| 4-1 التهيئة للطرح | chicks, apples, flowers, balloons, turtles, eggs: in which picture are n left (`picture_choice`, crossed groups) |
| 4-2 الطرح ضمن ٥ | horses leave the field, bees, trees, candles, boys, crossed circles (`number_fill` with pictures); the same subtraction across and down, balloons (`row` and `vertical`); أفكر: missing number to subtract |
| 4-3 حقائق الطرح ضمن ٥ | facts from 2 and 3 with counters; facts from 4 and 5 across and down (dominoes 4 - 2, 5 - 3); marbles out of the box incl. 5 - 0; أفكر: which picture leaves 2 (`picture_choice`) |
| 4-4 الطرح ضمن ١٠ | the six crossed pictures of p. 102 (10 - 1, 10 - 3, 8 - 2, 7 - 0, 9 - 3, 6 - 6); the race لنتسابق في الحل (six vertical subtractions) |
| 4-5 حقائق الطرح ضمن ١٠ | balloons and flowers (7 - 3, 7 - 2, 6 - 2, 7 - 4); facts from 6 to 10 across and down; which picture leaves 4, 1, 7 (the join task); أفكر: complete the sentence from the picture, missing whole or missing part |
| 4-6 حل المسألة | the countryside (bird flies off, apples fall, rabbits hop away, players leave) and the schoolyard of the unit opener (8 children, a boy and a girl leave); the falling bricks |
| 4-7 اكتشاف الأنماط | 2 - 1, 3 - 1, 4 - 1, 5 - 1 and same difference 9 - 7, 8 - 6; counting back by 1 and by 2 (`number_fill` sequence) |
| 4-8 تدريبات عامة | triangles, pens, balloons (4 - 0), footballs, two plain facts; the butterflies (- 5, - 2) and the star with ٣ (missing part, missing whole) |
| اختبار الوحدة | crossed pictures (birds, apples, tennis balls, triangles); six facts across and down; the pattern ٢ ٤ ٦ and counting back |

## Adapted or left out

- Prompts match Unit 3: a plain difference asks كَمِ الْبَاقِي؟ (أَطْرَحُ أُفُقِيًّا / رَأْسِيًّا: كَمِ الْبَاقِي؟ where the book contrasts the two forms), as a plain sum asks كَمِ الْمَجْمُوعُ؟; a missing number is أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ. in Units 2 to 4.
- Word form ٥ نَاقِص ٢ يُسَاوِي ٣ appears as a lesson subtitle (shown, not spoken), so prompts never read the sentence aloud. `arithmetic` is not used: it speaks the whole sentence.
- Joining lines (join subtractions to ٢، ٤، ١، ٧) became `picture_choice`: in which crossed picture is n left.
- The book's tables (العدد، ناقص، العدد، يساوي، الناتج) became short runs of facts, not all of them: 3 to 6 rounds per lesson.
- Marbles and counters are drawn circles (blue, red); there is no marble emoji. The jars became a box (الْعُلْبَة). The race car with the Yemeni flag is only the lesson emoji 🏁.
- Left out: the subtraction triangle (p. 111), shape number patterns, the reteaching page, the enrichment page (caterpillar, the riddle عددي ينقص عن ٩ بـ ٣), writing sentences by hand.
- Options are three numbers around the answer, from 0 to 10, shuffled on screen.

## Known layout issue

At 360 px a five cell row `a - b = c` is wider than the screen (cells are at least 64 px with 12 px gaps), with one or two digit numbers alike: the outer cells are cut. Unit 2 had no five cell rows. The fix belongs in `NumberFillActivity` (smaller cells or gaps for rows of five), shared with Unit 3, so it is left to the lead.

## Testing

Data tests run every validator on the new unit; typecheck, lint, Jest and Playwright pass unchanged. No new Playwright path: `number_fill` and `picture_choice` are already covered by Unit 2.
