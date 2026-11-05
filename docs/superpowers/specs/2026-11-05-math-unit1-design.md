# Math Unit 1 (classification and patterns): design

Date: 2026-11-05. Status: built, native speaker review pending. Step of the math rebuild after Unit 2 (see `2026-11-05-math-foundation-design.md` and `2026-11-05-math-unit2-design.md`).

Source: الرياضيات، الصف الأول، الجزء الأول (Sana'a 2026), Unit 1 التَّصْنِيفُ وَالأَنْمَاطُ, printed pp. 7 to 32. Notes: `docs/content/textbooks/math-part1/unit-01.md`. The unit is pre number: every task is a picture and every instruction is spoken.

## Foundation addition: pattern rows

`PictureChoiceRound.pattern?: MathPic[]`. When set, the row is shown above the choices in reading order (first on the right, `row-reverse`), followed by a dashed empty slot for what comes next. The row's pictures are accessible images with their labels (not decorative), so a screen reader reads the pattern. Pictures shrink so that the row and its slot fit one line of a 360 px phone (`patternPicSize`: at most 52 px, 29 px for 8 pictures). A pattern that uses sizes (tall and short candles, cow and calf) keeps them apart inside equal cells: big 100 %, normal 80 %, small 55 % of the cell. Validator: 2 to 8 pictures, `checkPic` on each. Jest covers render order, the slot, shrinking, size patterns and validation; Playwright plays the first pattern lesson.

A data test now also checks that every non ordered `picture_choice` answer is unique among its choices and equals its `model` when there is one.

## Unit `math-u1`

File `content/math/bookUnit1.ts`, built with `mathKit.ts`. Unit number 1, title الْوَحْدَةُ الأُولَى, theme التَّصْنِيفُ وَالأَنْمَاطُ, badge أُصَنِّفُ, 19 lessons, first in the `math-1` units.

| Book lesson | App lessons (type) |
|---|---|
| 1-1 التصنيف وفق خاصية | same size as the model: balls, hats, cans, mugs (`picture_choice`); small things in the pencil case, big things in the bag (`sort`); same colour: apples, flowers, shapes (`picture_choice`); red and blue shapes (`sort`); shape: odd one out and same as the model (`picture_choice`) |
| 1-2 التصنيف وفق خاصيتين | the book's yellow triangles, pink circles, blue squares, plus size and colour, shape and size (`picture_choice`); red triangles in one box, every other shape in the other (`sort`); the group whose things are all alike: balls, fish, hens, shapes (`picture_choice`) |
| 1-3 أكثر من، أقل من، يساوي | roses and bees (5 and 4, 3 bees and 4 roses, 4 and 4), rabbits and carrots, rulers and pencils (`compare`); shirts and trousers, pens and notebooks, girls and handbags, shoes and socks, children and chairs (`compare`); which group is more or fewer (`picture_choice`) |
| 1-4 المواقع النسبية | left out, see below |
| 1-5 اكتشاف الأنماط | frog and turtle, hen and two chicks, cow and calf, bee and two flowers; tall and short candles, two leaves, red and green apples, half coloured circles; circle triangle square, triangle square, big and small circles, two squares two circles (`picture_choice` with `pattern`) |
| 1-6 حل المسألة | two property patterns and shapes alike in shape and colour (`picture_choice`) |
| 1-7 تدريبات عامة | blue circles in one box, others in the other (`sort`); rectangle of the same size and colour, the odd dress, which group is more, a shape pattern (`picture_choice`) |
| اختبار الوحدة | same shape and colour, the car among bicycles (from إعادة التعليم), the bigger group, a triangle and square pattern (`picture_choice`); apples and boys 5 and 5, roses and bees, rabbits and carrots (`compare`) |

Content rules: fully vowelled MSA with the book's terms (أُصَنِّفُ، أَكْثَرُ، أَقَلُّ، يُسَاوِي، النَّمَطُ، مَا التَّالِي؟); 3 to 6 rounds per lesson; at most 4 choice cards. Compare prompts follow Unit 2: the first group (on the right) is named first and all three answers are spoken. Colour is the only cue only when the prompt names the colour ("أَيْنَ التُّفَّاحَةُ الْحَمْرَاءُ؟", "تُفَّاحَةٌ حَمْرَاءُ، ثُمَّ تُفَّاحَةٌ خَضْرَاءُ. مَا التَّالِي؟"); otherwise shape or size also differ, and red against green is avoided where the book allows.

## Position words: left out

Lesson 1-4 (فَوْقَ، تَحْتَ، دَاخِلَ، خَارِجَ) and the position questions of the unit test are left out. Emoji cannot be composed into a scene: a ball "under" a chair drawn as a ball below a chair emoji reads as "lower on the screen", not under the seat; "under a tree" in the book means in its shade beside the trunk; inside and outside need a container drawn around some pictures. A stacked or framed layout would add a new picture model, layout and labels for one lesson and could still show a child who hears "تَحْتَ" something that is not under. The honest fix is drawn scenes, like the Arabic story pictures (`components/art/scenes`): ducks in and out of the pond, the ball in the goal, the bird on the branch, the boy under the tree. That is a separate step.

## Adapted or left out

- Shapes: the book's hexagon, pentagon, rhombus and ellipse become the app's circle, square, triangle and rectangle; the triangle and rhombus test pattern becomes triangle and square.
- Objects without emoji: the sharpener and the yellow apple (colour lesson) are replaced by shapes; plates, clocks and boots (two properties) by shapes with size and colour; the red balloon and green T-shirt colouring tasks are left out.
- Drawing, colouring and ringing tasks become choices or sorting (draw the next shape → pick it; ring the alike group → tap it; join one to one → compare with word buttons).
- Left out: joining identical shapes with lines, the م أ letter pattern (pictures only), the house built from lines, drawing a group of a given size, the happy and sad face pattern (enrichment), the Yemeni flag boxes (position).
- The unit opener (palms, picnic) has no lesson: its questions are position and counting.

## Wiring and tests

- `content/catalog.ts`: `math-1` units are `math-u1`, `math-u2`, `m2`, `m3`. `nextLesson` after Arabic is now `math-u1-1`.
- `content/ui-translations.ts`: الْوَحْدَةُ الأُولَى → Unit 1.
- Playwright: the first `math-u1` pattern lesson completes with 3 stars, answering each round by the spoken name of its right card.
