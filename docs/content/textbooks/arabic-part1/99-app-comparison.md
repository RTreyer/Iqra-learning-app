# Arabic Part 1: book compared with the app

Book: أَقْرَأُ وَأَتَعَلَّمُ, Grade 1, Part 1 (Aden, 2017), read in full (192 pages). App: `artifacts/learn-app/content/arabic/unit1.ts` to `unit8.ts` (47 lessons), as of 2026-10-18.

Following the owner rule, nothing in the app has been changed. This file is the basis for the decision on how to rebuild the Arabic lessons.

## 1. Headline

**Only Unit 1 roughly follows the book. Units 2 to 8 of the app do not follow the book**: they teach letters in alphabetical order with invented themes and stories, while the book teaches letters by frequency, with its own stories, and returns to the same letters with new vowels (spiral).

## 2. Letter order

| Unit | Book (Part 1) | App |
|---|---|---|
| 1 | pre-reading (no letters) | pre-reading (no letters) |
| 2 | م ب ل ن ر د ت (with fatha and long alif) | ب ت ث |
| 3 | ي و أ (all vowels and sukun) | ج ح خ |
| 4 | م ب ل again (damma, kasra, sukun) | د ذ ر ز |
| 5 | ن ر د ت again (damma, kasra, sukun) | س ش |
| 6 | ق ص ف (new, all vowels) | ص ض |
| 7 | ح س ج (new, all vowels) | ط ظ |
| 8 | ش ط ز (new, all vowels) | ع غ ف ق |

- Book Part 1 teaches **19 letters**: م ب ل ن ر د ت ي و أ ق ص ف ح س ج ش ط ز.
- App Part 1 teaches **20 letters**: ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق.
- **In the book, missing from the app (6):** م ل ن ي و أ. These are the most frequent letters and the ones the book starts with (مَامَا، بَابَا).
- **In the app, not in book Part 1 (7):** ث خ ذ ض ظ ع غ. Presumably in book Part 2 (to confirm).
- In both but in different units (13): ب ت ر د ز س ش ص ط ف ق ج ح.

## 3. Vowels and reading skills

| Skill | Book | App |
|---|---|---|
| Fatha, long alif | Unit 2 | not taught explicitly |
| Damma, kasra, long و and ي, sukun | Units 3 to 8, page per vowel | not taught |
| Letter forms (initial, medial, final, isolated) | every letter, 4 forms to trace | isolated form only |
| Syllable reading (مَـ، مُـ، مِـ، مْـ) | every lesson | none |
| Syllable to word (مَا / مَا → مَامَا) | every lesson | none |
| Syllables to word matching with distractors | Units 4 and 5 | `matching` exists, not used this way |
| Fill the missing syllable | Units 6 to 8 | none |
| First sound of a word | every تدريبات | none |
| Sight words | 2 to 3 per reading page, review lists | `word_read` partly |
| Tracing whole words | Units 3 to 8 | none |
| Copying a sentence | Units 7 and 8 | none |
| Rebus sentences (picture replaces a word) | Units 2 to 4 | none |
| Listening story per reading page | about 60 listening pictures | none (only one story per unit) |

## 4. Unit by unit

| App unit | App theme and story | Book unit | Book stories | Match |
|---|---|---|---|---|
| a1 تَمْهِيدِيَّة (5 lessons) | naming school objects, animals, fruit, sky; listen and pick; 5 behaviours; matching; 5 lines (horizontal, vertical, diagonal, circle, zigzag) | Unit 1 (5 lessons) | animals and their young, national symbols, vehicles, feelings, family; animal and human **sounds**; odd one out; put things back; posture and pencil grip; dog and bone story; curves, corners, steps, circles | **partial**: same activity types, different vocabulary and pictures; app lacks sounds, odd one out, put things back, posture, the listening story |
| a2 بَيْتُنَا | ب ت ث | Unit 2 | أُحِبُّ مَامَا، أُحِبُّ بَابَا، اللَّبَنُ، النَّمْلُ، رَبَابُ، دَارُ خَالِي، التَّمْرُ | **no** |
| a3 فِي الْحَدِيقَة | ج ح خ | Unit 3 | الْمُعَلِّمَةُ بَيَانُ، أَخِي مَرِيضٌ، دَارُ الأَيْتَامِ | **no** |
| a4 فِي الْمَزْرَعَة | د ذ ر ز | Unit 4 | بَيْتٌ مِنْ رَمْلٍ، ابْنَةٌ أَمِينَةٌ، الْبَقَرَةُ | **no** |
| a5 فِي السُّوق | س ش | Unit 5 | تَرْتِيبُ الصَّفِّ، رَجُلُ الْمُرُورِ، بَدْرٌ وَاللُّعْبَةُ، مَنَالُ وَالْمَزْرَعَةُ | **no** |
| a6 أَنَا وَصِحَّتِي | ص ض | Unit 6 | مُنِيرٌ وَالْقِرَاءَةُ، صَابِرٌ وَالْبُلْبُلُ، مِصْيَدَةُ مُفِيدٍ | **no** (ص only) |
| a7 الطَّعَام اللَّذِيذ | ط ظ | Unit 7 | النَّظَافَةُ، أَسْنَانُ وَسِيمٍ، جَارُ الْمَسْجِدِ | **no** |
| a8 فِي الْقَرْيَة | ع غ ف ق | Unit 8 | رَشِيدَةُ وَالْفَرَاشَاتُ، لَطِيفَةُ وَالنَّحْلَةُ، زِيَارَةُ جَدِّي | **no** |

## 5. Counts

| | Book | App |
|---|---|---|
| Units | 8 | 8 |
| Story lessons | 25 (7 + 3 + 3 + 3 + 4 + 3 + 3 + 3) | 7 (one per unit 2 to 8) |
| Reading pages (syllables, words, sight words) | about 60 | 7 `letter_pick` + 7 `word_read` |
| Listening stories (teacher tells, not printed) | about 45 different ones, plus the recurring school performance | 0 |
| Writing pages | 25 letter tables + 18 word tables + 8 exercise sets | 7 `trace` (isolated letters) + 1 lines lesson |

## 6. What this means for the rebuild

1. **Keep:** the app's engine (scoring, review, progress, activities), Unit 1's activity types, and the lesson IDs `u1-1` to `u8-5` that saved progress refers to (see `scripts/content.test.mjs`, "every stored legacy lesson ID still exists").
2. **Rebuild Units 2 to 8 from the book**: letter order, stories, sight words, syllables. This replaces the current authored content, so it needs the owner's explicit approval.
3. **New activity types needed** (in order of value):
   - syllable reading (hear and pick the syllable: مَـ / مُـ / مِـ / مْـ)
   - syllables to word (build or match مَا / مَا → مَامَا)
   - fill the missing syllable
   - first sound of a word
   - trace all four letter forms, then whole words
   - rebus sentence (pick the word the picture stands for)
   - odd one out, put things back (Unit 1)
4. **Texts to write** (not printed in the book): about 45 listening stories and the rebus words. Best source: the teacher's guide (دليل المعلم). Without it, a Yemeni teacher writes them.
5. **Audio:** the recording script grows to roughly 1,200 to 1,500 clips for Part 1 (stories, every syllable with every vowel, words, sight words, listening stories, sounds of animals and vehicles).
6. **Pictures:** about 25 story pictures, about 45 listening pictures and many small rebus pictures; all described in the unit files. They need new illustrations (cannot be copied).

## 7. Questions for the owner

1. Rebuild Units 2 to 8 from the book (recommended), or keep the current units and add the book as a separate track?
2. Is the teacher's guide (دليل المعلم) for this book available? It would give the listening story texts.
3. The book is the **Aden 2017** edition and لغتي العربية is **Sana'a 2026**. Which curriculum does the app follow for Arabic, or both as separate courses (as now: أقرأ وأتعلم and لغتي العربية)?
