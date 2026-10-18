# Grade 1 Arabic textbooks: extracted content

Structured notes read page by page from the Yemen Ministry of Education Grade 1 Arabic textbooks. They are the source for lesson design, the recording script and the audio. The PDFs themselves stay local in `/textbooks/` (ignored by Git).

| Folder | Book | PDF location | Status |
|---|---|---|---|
| `arabic-part1/` | أقرأ وأتعلم, Part 1 (Aden 2017, 192 pp.) | `textbooks/arabic-part1/` | read in full, 8 units saved, app comparison done |
| `arabic-part2/` | أقرأ وأتعلم, Part 2 (Aden, trial edition 2014-2015, 192 pp.) | `textbooks/arabic-part2/` | read in full: Units 7 to 12 saved (7 and 8 repeat Part 1 in an older version) |
| `my-arabic-part1/` | لغتي العربية (My Arabic Language), Part 1 (Sana'a 2026, 166 pp.). Own course in the app: subject `lughati`, book `lughati-1` | `textbooks/my-arabic-part1/` | read in full: Units 1 to 4 saved, letters أ to غ |

## Layout per book

- `00-overview.md`: metadata (title, authority, edition, year, pages), table of units, letter order, themes
- `unit-NN.md`: one file per unit, every lesson with
  - number, title, printed and PDF page numbers
  - target letters and new words
  - reading and story texts with full vowel marks, exactly as printed
  - exercises (what the child does), described in words
  - teacher notes (للمعلم والمعلمة)
  - every picture, screened and described in detail (see Pictures below)
  - `[?]` marks any word whose vowel marks are unclear in the scan, for teacher review
- `99-app-comparison.md`: each existing app lesson marked as matches, differs or not in the book, plus what the book has that the app lacks (Arabic Part 1 first)

Rule: existing app lessons are changed only after owner approval (README owner rule).

## Pictures

Pictures carry much of the teaching in a Grade 1 book (the child often cannot read the instruction yet), so every page is screened for them. For each picture record:

- page and position (top, middle, bottom; right or left)
- what it shows: people, animals, objects, setting, actions, how many of each, colours when they matter
- its teaching role: what the child must notice, count, name, match, colour or say
- the words or letters it goes with (the word under the picture, the sound it starts with)
- how the app can show it: an existing emoji, an inline SVG, or a new illustration needed

Pictures are described, never copied into the app or the repo. Where a new illustration is needed, the description is the brief for the illustrator.
