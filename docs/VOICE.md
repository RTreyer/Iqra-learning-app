# Sprachführung: Anweisungen über die Stimme

Ziel: Ein Kind, das noch nicht lesen kann, versteht jede Aufgabe allein über die Stimme (DIDAKTIK.md, Abschnitt 6).

## Stand

Die App spricht mit der Text-to-Speech-Stimme des Geräts (`expo-speech`, Arabisch, Tempo 0.8, `lib/speech.ts`). Es gibt keine Aufnahmen und keine Netzwerkanfragen.

| Übungstyp                                                                                                   | Was gesprochen wird                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alle Lektionen                                                                                              | Beim Öffnen zuerst der Titel                                                                                                                          |
| `story`, `naming`, `letter_pick`, `word_read`, `listen_pick`, `behavior`, `matching`, `trace`, `build_word` | Danach eine feste Anweisung pro Übungstyp (`content/instructions.ts`), erst dann startet die Übung. Der Knopf 🗣️ oben im Lektionskopf wiederholt sie. |
| `counting`, `arithmetic`, `picture_choice`, `compare`, `number_fill`, `sort` (Mathe)                        | Keine zusätzliche Anweisung: Jede Runde spricht ihre eigene Aufgabe (`useInstruction`, `NumberQuiz`), der Lautsprecher-Knopf wiederholt sie.          |

Bis jetzt waren bei den Arabisch-Übungen die Anweisungen («Tippe auf jeden Satz, um ihn zu hören», «Tippe links, dann das Passende rechts» usw.) nur geschrieben. Gesprochen wurden nur der Titel und das Zielwort.

Absicherung in den Tests:

- `__tests__/instructions.test.ts`: Jede Lektion im Katalog bekommt ihre Aufgabe über die Stimme, entweder als Anweisung oder pro Runde. Die Anweisungen sind vokalisiert und enthalten keine Zeichen, die die Stimme nicht lesen kann (✓, ✗, Emoji).
- Ein neuer Übungstyp kompiliert erst, wenn er in `ACTIVITY_INSTRUCTIONS` eine Anweisung hat oder in `SPOKEN_PER_ROUND` steht.
- `__tests__/screens/lesson.test.tsx`: Reihenfolge Titel → Anweisung → Übung, Ersatz-Timer, wenn die Stimme nie zurückmeldet, Wiederholen-Knopf.

## Test auf dem Handy (offen)

Auf einem echten Android-Gerät prüfen, am besten auf einem günstigen Modell, wie es im Jemen verbreitet ist:

1. Gerät **mit** arabischer TTS-Stimme (Google Text-to-Speech, Sprachdaten Arabisch heruntergeladen): eine Lektion pro Übungstyp öffnen. Werden Titel und Anweisung vollständig gesprochen, bevor die Übung ihr erstes Wort spricht? Wird nichts abgeschnitten?
2. Ist die Anweisung verständlich ausgesprochen? Stimmen Vokale und Betonung? (Prüfung durch eine arabische Muttersprachlerin oder einen Muttersprachler.)
3. Ist die Anweisung für ein Kind der 1. Klasse kurz und klar genug? Wartezeit bis zum Start der Übung angemessen?
4. 🗣️-Knopf: Wiederholt er die Anweisung? Stoppt er laufende Sprache sauber?
5. Gerät **ohne** arabische Stimme (Sprachdaten löschen oder Flugmodus vor dem Download): Erscheint der Hinweis-Banner? Startet die Übung trotzdem nach höchstens ein paar Sekunden?
6. Gerät stumm geschaltet oder Lautstärke 0: Startet die Übung normal?

## Nächste Schritte

- **Texte prüfen lassen:** Die neun Anweisungen in `content/instructions.ts` sind vom Entwicklungsteam formuliert und müssen von einer Muttersprachlerin oder einem Muttersprachler geprüft werden (wie alle Inhalte, siehe CONTENT_REVIEW.md).
- **Aufnahmen statt TTS:** Viele günstige Geräte haben keine arabische Stimme. Dann hört das Kind auch die Anweisungen nicht. Die neun Anweisungen sind ein guter erster Kandidat für aufgenommene Audiodateien (UI-Vorschlag 8 in UI_PROPOSALS.md): wenige, kurze Sätze, die in jeder Lektion vorkommen. Ungefähr 9 × 3 s × 4 KB/s ≈ 110 KB.
- **Wiederholung:** Die Wiederholungsrunde (`/review`) spricht noch keine Anweisung («ابحث عن الحرف» steht nur geschrieben).
- **Pro Lektion abweichende Anweisung:** Heute gilt eine Anweisung pro Übungstyp. Falls einzelne Lektionen eine eigene brauchen (z. B. Satzzug statt Silbenzug), kann ein optionales Feld `instruction` an der Lektion ergänzt werden.
