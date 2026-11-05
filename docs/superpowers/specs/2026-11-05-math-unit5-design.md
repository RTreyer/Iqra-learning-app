# Math Unit 5 (shapes and fractions): design

Date: 2026-11-05. Status: built, native speaker review pending. Step 5 of the math rebuild (see `2026-11-05-math-foundation-design.md`).

Source: الرياضيات، الصف الأول، الجزء الأول (Sana'a 2026), Unit 5 الأشكال الهندسية والكسور, printed pp. 117 to 139. Notes: `docs/content/textbooks/math-part1/unit-05.md`.

## Unit `math-u5`

File `content/math/bookUnit5.ts`, built with `mathKit.ts`. Unit number 5, title الْوَحْدَةُ الْخَامِسَةُ, theme الأَشْكَالُ الْهَنْدَسِيَّةُ وَالْكُسُورُ, badge أَشْكَالٌ, 24 lessons. Every lesson has a `section` from `bookSection(5, n, title)`; the unit test lessons have the section اخْتِبَارُ الْوَحْدَةِ. No foundation changes: only existing activity types are used.

| Book lesson | App lessons (type) |
|---|---|
| 5-1 الْمُجَسَّمَاتُ | مَنْ أَنَا؟ the solids say their names, "أَنَا الْكُرَةُ" (`naming`); hear a solid, tap it (`listen_pick`); the object with the same shape as the model (`picture_choice` with model); sphere or cylinder, cube or cuboid (`sort`, two lessons) |
| 5-2 الأَشْكَالُ الْمُسْتَوِيَةُ | where is the circle, square, triangle, rectangle (`picture_choice`); door, window, road sign, clock, Yemeni flag: which shape is it like (`picture_choice` with model); circles and triangles, squares and rectangles (`sort`, two lessons); which group has three circles, two triangles, three squares (the book's example), four rectangles (`picture_choice` with groups) |
| 5-3 اكْتِشَافُ الأَنْمَاطِ | which row continues the pattern: solids (ball, cube…; cylinder, cylinder, cube…), plane shapes (rectangle, circle, triangle…; the book's two green triangles and a red one) (`picture_choice`, rows of 5) |
| 5-4 حَلُّ الْمَسْأَلَةِ | colour the boat by the key, rectangles yellow, triangles green, circles red: which shape is coloured right, where is the sail, the porthole (`picture_choice`) |
| 5-5 النِّصْفُ | the orange and apple cut in two equal parts (`story`); which shape has half coloured (`picture_choice`); is the coloured part a half? 👍 / 👎 (`picture_choice` with model) |
| 5-6 الرُّبْعُ | the apple cut in four equal parts (`story`); which shape has a quarter coloured; is it a quarter? 👍 / 👎 |
| 5-7 تَدْرِيبَاتٌ عَامَّةٌ | half ١/٢ or quarter ١/٤ (`sort`); the book's problem "أَكَلَ أَحْمَدُ نِصْفَ تُفَّاحَةٍ…": who ate more, Ahmad, Fatima or the same (`picture_choice`, 👦 / 🧕 / both) |
| 5-8 هَيَّا بِنَا نَلْعَبُ وَنَتَعَلَّمُ | the schoolyard game: أَقْفِزُ إِلَى الْمُثَلَّثِ، إِلَى الدَّائِرَةِ الَّتِي نِصْفُهَا مُلَوَّنٌ… (`picture_choice`) |
| اختبار الوحدة | solids by name (`listen_pick`, the book's cube, sphere, cylinder plus cone); shapes and fractions, starting from the car wheel (`picture_choice`) |

## Pictures

- **Solids are emoji** of the book's everyday objects: sphere ⚽ 🍊 🏀 🎱; cube 🎲 🧊 🎁; cylinder 🥫 🔋 🪵 🕯️; cone 🍦; cuboid 📦 🧈 🧽 📕 (butter and sponge are the book's). No SVG solids were added.
- **The pyramid (الْهَرَمُ) is left out**: no emoji shows a pyramid (🔺 is the plane triangle, ⛺ a prism). It needs a drawn picture first.
- Plane shapes, halves and quarters are `MathPic` shapes with named colours. Colour is never the only cue, except in the colour pattern and the colour key lessons, whose prompts name the colours.
- Yes / no is 👍 / 👎, said in the prompt ("نَعَمْ أَمْ لَا؟").
- Girls are 🧕, as in Unit 2.

## Adapted or left out

- **Unequal parts** (Ahmad's mistake, the triangle cut into 4 with a middle piece): `shaded` always draws equal parts, so "is it a half?" is asked with halves, quarters and whole shapes instead.
- **Patterns**: `picture_choice` shows one model, not a row, so the child picks the row whose last picture continues the pattern (3 rows of 5 small pictures, under the ten frame limit of 6).
- **Ringing the answer** (أُحَوِّطُ) is tapping in the app, so subtitles say أَخْتَارُ, as in Units 2 to 4. The first unit test lesson is titled اخْتِبَارُ الْوَحْدَةِ, as in the other units.
- **Colouring** (5-2, 5-4, unit test car): became choosing the shape coloured by the key.
- **Who ate more**: the book's equal halves round plus three rounds comparing a half with a quarter (bread, orange) and two quarters (cake).
- Left out: building a cuboid from 8 cubes (needs real cubes), the tangram fox (p. 129), the fraction missing from a circle, the quarter circle patterns, the enrichment bars of 8 parts, the reteaching page.

## Wiring and tests

- `content/catalog.ts`: `math-1` units are `math-u2`, `m2`, `math-u5`. The old `m3` (`content/math/unit3.ts`) is deleted; its progress is dropped, as decided in the foundation spec. The unit title already has an English entry (Unit 5).
- Data tests: all `picture_choice` and `sort` validators pass (at most 4 choices, no quarter on a triangle).
- Playwright: the first `math-u5` sort lesson (first `sort` path in the suite).
- Layout checked at 360 px: rows of 5 small pictures, groups of 4, two sort boxes with the long label مُتَوَازِي مُسْتَطِيلَاتٍ.
