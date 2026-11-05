# Math Unit 3 (addition within 10): design

Date: 2026-11-05. Step 3 of the math rebuild (see `2026-11-05-math-foundation-design.md`), built like Unit 2 (`2026-11-05-math-unit2-design.md`). No new activity types or foundation changes.

Source: الرياضيات، الصف الأول، الجزء الأول (Sana'a 2026), Unit 3 الجمع ضمن العدد ١٠, printed pp. 65 to 90. Notes: `docs/content/textbooks/math-part1/unit-03.md`.

## Unit `math-u3`

File `content/math/bookUnit3.ts`, built with `mathKit.ts`. Unit number 3, title الْوَحْدَةُ الثَّالِثَةُ, theme الْجَمْعُ ضِمْنَ الْعَدَدِ ١٠, badge أَجْمَعُ, 25 lessons, 3 to 6 rounds each. Every lesson has a `section` from `bookSection(3, n, title)`; the unit test lessons have the section اخْتِبَارُ الْوَحْدَةِ.

| Book lesson | App lessons (type) |
|---|---|
| 3-1 التهيئة للجمع | two joining stories heard, then tap the group with all of them (`picture_choice`): boys at football, chicks, turtles, the opener's doves; rabbits, a sheep and a ram, ducks |
| 3-2 الجمع ضمن ٥ | picture sums (`number_fill` with `pics`): the family at the table, giraffes, flowers, children, rabbits, the girl with Yemeni flags; a second set: girls, apples, stars, cubes, birds, tomatoes; the book's word form ٣ زَائِد ٢ يُسَاوِي ٥ as the subtitle of a lesson of plain row sums (`number_fill`); أفكر missing addends (`number_fill`) |
| 3-3 حقائق الجمع ضمن ٥ | swap the addends with apples and flowers, then ٤ = ٣ + ؟ (`number_fill`); the facts of ٥ and ٤ as missing addends |
| 3-4 الجمع ضمن ١٠ | the football team ٦ + ٢, five apples and an empty plate ٥ + ٠, birds, balls (`number_fill` with `pics`); twelve sums of the book, with zero (`number_fill`); أفكر missing addends to ١٠ |
| 3-5 الجمع الرأسي | vertical sums with red and yellow flowers, balls and circles, swapped pairs (`number_fill` vertical with `pics`); plain vertical sums with zero |
| 3-6 حقائق الجمع ضمن ١٠ | the coloured flowers and circles for ٦ and ٧; the petals of ٨ and the star of ٩; making ١٠; part and whole (all `number_fill`) |
| 3-7 حل المسألة | picture word problems: balls into the basket, two baskets, shirts, the girl's and the boy's rulers, pencils and bags |
| 3-8 اكتشاف الأنماط | red and blue cubes ٥ + ٠ to ١ + ٤; odd and even rows and "add one" (`number_fill` sequence and row) |
| 3-9 تدريبات عامة | domino dots, two coloured circles and the أفكر pencils ٧ + ٣ (`number_fill`); mixed row sums (`number_fill`) |
| اختبار الوحدة | six row sums; the chicks ٥ + ٢ and four vertical sums showing the order; missing addends to ٦ |

## Choices and adaptations

- **Spoken task only.** Number sentences are shown, not read: prompts are كَمِ الْمَجْمُوعُ؟ (row), أَجْمَعُ رَأْسِيًّا: كَمِ الْمَجْمُوعُ؟ (vertical), أُكْمِلُ بِالْعَدَدِ الْمُنَاسِبِ. (missing addend), أَجْمَعُ الزَّرَافَاتِ. كَمِ الْمَجْمُوعُ؟ and similar. A missing addend with a coloured hint is أَعُدُّ الأَزْهَارَ الصَّفْرَاءَ وَأُكْمِلُ.; a missing part is مَا الْجُزْءُ الآخَرُ؟; a number pattern is أُلَاحِظُ النَّمَطَ وَأُكْمِلُ. The wording avoids مَا الْعَدَدُ النَّاقِصُ؟, since نَاقِص is the word for minus. One exception: the 3-1 joining stories name the numbers, because no sentence is shown and listening is the task. `arithmetic` is not used: it speaks the whole sentence (ثَلَاثَة زَائِد اثْنَان يُسَاوِي كَمْ؟), so the book's word form ٣ زَائِد ٢ يُسَاوِي ٥ is a subtitle, shown and not spoken.
- **Two parts.** A picture story is one `PicGroup`, so the parts are told apart by two emoji (🌹 and 🌼, 🍎 and 🍏, 👦 and 👧, 👦 and 🏃) or two coloured shapes (red and blue cubes and circles), first part on the right. Groups of 6 or more fall into the ten frame.
- **"Ring the sums that make ٨" and the fact boxes** become missing addend rounds (١ + ؟ = ٨): no activity offers sums as tap choices.
- **Part and whole.** When the whole is asked, the two parts are coloured; when a part is asked, the whole is shown in one colour (🟡), so the child takes the known part away in the head.
- **Number rows** have at most 4 cells (Unit 2 rule); the odd row ١ ٣ ؟ ٧ ٩ is cut to four numbers.
- **Book order.** Cells follow reading order, so the book's "٥ = ٢ + ٣" is `[3, "+", 2, "=", 5]`. The vertical "٠ + ١٠" is taken as ١٠ + ٠.

Left out: the egg characters of the opener, the addition table with gaps and the shape number pattern (3-8), the colouring steps, drawing dots, the reteaching page (p. 89, same sums as the unit) and the enrichment diamond (p. 90). Shirt colours cannot be shown with one shirt emoji, so the story names them only.

## Replacing the old unit

Old `m2` (`content/math/unit2.ts`, sample addition and subtraction) is deleted; its progress is dropped as decided in the foundation spec. Book Unit 4 (subtraction) is rebuilt separately. Catalog order: `math-u2`, `math-u3`, `m3`.

## Testing

Validators in `test:data` cover every round (answer in options, at most 4 options, `a + b = c` rows of 5 cells). Gate: typecheck, lint, jest, test:data, test:e2e. The e2e math paths stay on `math-u2`, which uses the same activity types.
