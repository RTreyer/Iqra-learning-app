# Sprachführung: Anweisungen über die Stimme

Ziel: Ein Kind, das noch nicht lesen kann, versteht jede Aufgabe allein über die Stimme (DIDAKTIK.md, Abschnitt 6).

## Stand

Die App spricht mit der Text-to-Speech-Stimme des Geräts (`expo-speech`, Arabisch, Tempo 0.8, `lib/speech.ts`). Es gibt keine Aufnahmen und keine Netzwerkanfragen.

| Übungstyp                                                                                                   | Was gesprochen wird                                                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alle Lektionen                                                                                              | Beim Öffnen zuerst der Titel                                                                                                                                                    |
| `story`, `naming`, `letter_pick`, `word_read`, `listen_pick`, `behavior`, `matching`, `trace`, `build_word` | Danach eine feste Anweisung pro Übungstyp (`content/instructions.ts`), erst dann startet die Übung. Der Knopf 👆 oben im Lektionskopf wiederholt sie zusammen mit dem Beispiel. |
| `counting`, `arithmetic`, `picture_choice`, `compare`, `number_fill`, `sort` (Mathe)                        | Keine zusätzliche Anweisung: Jede Runde spricht ihre eigene Aufgabe (`useInstruction`, `NumberQuiz`), der Lautsprecher-Knopf wiederholt sie.                                    |

Bis jetzt waren bei den Arabisch-Übungen die Anweisungen («Tippe auf jeden Satz, um ihn zu hören», «Tippe links, dann das Passende rechts» usw.) nur geschrieben. Gesprochen wurden nur der Titel und das Zielwort.

Absicherung in den Tests:

- `__tests__/instructions.test.ts`: Jede Lektion im Katalog bekommt ihre Aufgabe über die Stimme, entweder als Anweisung oder pro Runde. Die Anweisungen sind vokalisiert und enthalten keine Zeichen, die die Stimme nicht lesen kann (✓, ✗, Emoji).
- Ein neuer Übungstyp kompiliert erst, wenn er in `ACTIVITY_INSTRUCTIONS` eine Anweisung hat oder in `SPOKEN_PER_ROUND` steht.
- `__tests__/screens/lesson.test.tsx`: Reihenfolge Titel → Anweisung → (Beispiel) → Übung, Ersatz-Timer, wenn die Stimme nie zurückmeldet.

## Test auf dem Handy (offen)

Auf einem echten Android-Gerät prüfen, am besten auf einem günstigen Modell, wie es im Jemen verbreitet ist:

1. Gerät **mit** arabischer TTS-Stimme (Google Text-to-Speech, Sprachdaten Arabisch heruntergeladen): eine Lektion pro Übungstyp öffnen. Werden Titel und Anweisung vollständig gesprochen, bevor die Übung ihr erstes Wort spricht? Wird nichts abgeschnitten?
2. Ist die Anweisung verständlich ausgesprochen? Stimmen Vokale und Betonung? (Prüfung durch eine arabische Muttersprachlerin oder einen Muttersprachler.)
3. Ist die Anweisung für ein Kind der 1. Klasse kurz und klar genug? Wartezeit bis zum Start der Übung angemessen?
4. 👆-Knopf: Spricht er die Anweisung und zeigt das Beispiel? Ist danach die Übung noch an derselben Stelle?
5. Gerät **ohne** arabische Stimme (Sprachdaten löschen oder Flugmodus vor dem Download): Erscheint der Hinweis-Banner? Startet die Übung trotzdem nach höchstens ein paar Sekunden?
6. Gerät stumm geschaltet oder Lautstärke 0: Startet die Übung normal?

## Vorgemachtes Beispiel

Beim ersten Mal, wenn das Kind einen Übungstyp sieht, macht die App ihn vor: Nach Titel und Anweisung sagt die Stimme «اُنْظُرْ، سَأُرِيكَ مِثَالًا.», eine Hand 👆 bedient die echte Übung an einem eigenen Beispiel und die Stimme erklärt jeden Schritt. Am Ende kommt «اَلْآنَ دَوْرُكَ!», dann startet die Lektion.

- **Inhalt:** `content/demos.ts`, ein Beispiel für jeden der 15 Übungstypen, dazu ein zweites Nachfahr-Beispiel mit einer Linie für Unit 1, die Linien statt Buchstaben nachfährt (`trace_lines`, gewählt von `demoIdFor`). Kein Beispiel ist eine Aufgabe aus einer Lektion (Test). Für das Nachfahren gibt es den Buchstaben «ه», der in keiner Lektion nachgefahren wird; seine Vorlage wird mit den anderen erzeugt (`npm run guides`).
- **Ablauf:** `components/demo/DemoPlayer.tsx` spielt die echte Übung mit dem Beispielinhalt. Die Hand findet Knöpfe über ihre `testID` oder Beschriftung (`components/demo/DemoPressable.tsx`), beim Nachfahren folgt sie der Mittellinie des Buchstabens (`trace/guidePath.ts`), so dass die echte Prüfung besteht. Während des Beispiels sind Berührungen gesperrt; «تخطَّ» (Überspringen) beendet es sofort.
- **Zählt nicht:** keine Sterne, keine Wiederholungs-Einträge.
- **Einmal pro Typ:** gespeichert unter `@iqra_demo_seen_v1` (Linien und Buchstaben nachfahren zählen getrennt). Wer die Beispiele noch einmal von vorne sehen will, löscht diesen Eintrag oder die Website-Daten im Browser, oder öffnet ein privates Fenster. Der Knopf 👆 im Lektionskopf zeigt das Beispiel jederzeit wieder, zusammen mit der Anweisung; die angefangene Übung bleibt dabei erhalten.
- **Tests:** `__tests__/demo/` spielt jedes Beispiel ganz durch und prüft, dass jedes Element gefunden und jede Aufgabe richtig gelöst wird; zwei Playwright-Tests prüfen den Ablauf im Browser.

Auf dem Handy zusätzlich prüfen: Ist die Hand gut sichtbar und das Tempo für Kinder angenehm? Verstehen Kinder ohne Hilfe, dass sie danach selbst dran sind?

## Nächste Schritte

- **Texte prüfen lassen:** Die neun Anweisungen in `content/instructions.ts` und die Beispiele mit ihren Sprechtexten in `content/demos.ts` sind vom Entwicklungsteam formuliert und müssen von einer Muttersprachlerin oder einem Muttersprachler geprüft werden (wie alle Inhalte, siehe CONTENT_REVIEW.md).
- **Aufnahmen statt TTS:** Viele günstige Geräte haben keine arabische Stimme. Dann hört das Kind auch die Anweisungen nicht. Die neun Anweisungen sind ein guter erster Kandidat für aufgenommene Audiodateien (UI-Vorschlag 8 in UI_PROPOSALS.md): wenige, kurze Sätze, die in jeder Lektion vorkommen. Ungefähr 9 × 3 s × 4 KB/s ≈ 110 KB.
- **Wiederholung:** Die Wiederholungsrunde (`/review`) spricht noch keine Anweisung («ابحث عن الحرف» steht nur geschrieben).
- **Pro Lektion abweichende Anweisung:** Heute gilt eine Anweisung pro Übungstyp. Falls einzelne Lektionen eine eigene brauchen (z. B. Satz statt Silben in Hudhuds Brief), kann ein optionales Feld `instruction` an der Lektion ergänzt werden.
