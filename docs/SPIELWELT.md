# Spielwelt für Kinder, die noch nicht lesen

Ziel: Ein Kind der 1. Klasse findet sich allein zurecht, ohne zu lesen, und kommt gern wieder. Die Bildsprache stammt aus dem Jemen.

## Aufbau

| Bildschirm | Was das Kind sieht | Code |
|---|---|---|
| Start | Hudhud mit Gruss («بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ»), ein grosser Play-Knopf direkt zur nächsten Lektion, eine Insel pro Buch (أ ب ت / ١ ٢ ٣), die Qamariya des Tages, das Stickeralbum, bei fälligen Wiederholungen eine Brief-Kachel. Unten die Altstadt von Sanaa. | `app/index.tsx` |
| Buch | Die Einheiten als Stationen auf einem Weg. Ein Ring zeigt, wie viel erledigt ist; die nächste Station leuchtet, Hudhud sitzt darauf. | `app/book/[bookId].tsx`, `components/world/PathMap.tsx` |
| Einheit | Die Lektionen als Weg. Jede Übungsart hat ein festes Bild (Buch = Geschichte, Stift = Schreiben, Auge = Wörter …). Erledigt = gold mit Sternen, jetzt = farbig mit Lichtring, später = sandfarben, aber offen. Oben die Buchstaben der Einheit, die sich beim Antippen selbst sprechen. | `app/unit/[unitId].tsx`, `components/world/lessonPicture.tsx` |
| Übung | Fortschritt als kleiner Zug statt «سؤال ١ من ٤». | `components/activities/shared/ProgressDots.tsx` |
| Geschafft | Sterne springen einzeln auf, kurzes Konfetti in den Qamariya-Farben, Hudhud jubelt, die Qamariya des Tages, ein neuer Sticker. Drei Bildknöpfe: Karte, weiter, nochmal. | `components/LessonCompleteCard.tsx` |
| Album | Neun Sticker mit Motiven aus dem Jemen; jeder sagt seinen Namen. Ein Balken zeigt den Weg zum nächsten. | `app/album.tsx`, `lib/stickers.ts` |
| Elternecke | Hinter einer Halten-Sperre (1,5 s): Klasse, Menüsprache, Stimme, Vibration, Fortschritt, Zurücksetzen mit zweiter Bestätigung. | `app/parents.tsx`, `context/SettingsContext.tsx` |

Hudhud spricht mit der Stimme der App; die Sprechblase zeigt nur, was gesagt wird. Antippen von Hudhud wiederholt den Satz.

## Belohnungen

- **Sterne** wie bisher: 1 bis 3 pro Lektion, nur der beste Versuch zählt.
- **Qamariya des Tages**: jede heute abgeschlossene oder verbesserte Lektion färbt ein Glasfeld; nach drei leuchtet das Fenster (`lib/daily.ts`). Am nächsten Tag beginnt es leer, ohne Strafe. Die frühere Serie (Streak) ist entfernt.
- **Sticker**: alle 12 Sterne einer, in fester Reihenfolge (`lib/stickers.ts`). Nie zufällig.

## Kulturelle Entscheidungen

- **Hudhud (Wiedehopf)**: bringt in Sure An-Naml die Nachricht aus Saba, also aus dem Jemen. Keine Hunde oder Schweine als Figuren, keine Zauberwesen.
- **Bildsprache aus Sanaa**: Lehm-Turmhäuser mit weissem Gips, Qamariya-Fenster als Fortschrittsanzeige; Farben in `theme/tokens.ts` (`yemen`).
- **Sticker-Motive**: Qamariya, Haus aus Sanaa, Mokka-Kaffee, Sanbuq (Dau), Sidr-Honig, Drachenblutbaum (Sokotra), Dattelpalme, Datteln, Bint al-Sahn. Keine Waffen (auch keine Jambiya), keine Kriegsbilder.
- **Kein Glücksspiel-Mechanismus**: keine Glücksräder, Lootboxen oder Zufallsbelohnungen.
- **Kein Druck**: kein Streak, nichts verfällt. Stromausfälle, Freitage, Ramadan oder eine Flucht werden nicht bestraft.
- **Ruhig**: kurze Animationen, die einmal ablaufen; der Lichtring um den nächsten Schritt atmet langsam. Keine lauten Töne, keine Musik.
- **Alltagssprache**: «بسم الله» zum Start, «أَحْسَنْت» als Lob (in der Pausalform für Jungen und Mädchen gleich).

## Offen

- **Aufgenommene Stimme**: Alle Sätze von Hudhud laufen über die Sprachausgabe des Geräts. Ohne arabische Stimme hört das Kind nichts (siehe `docs/VOICE.md`).
- **Soundeffekte** (sanftes Glöckchen, Vogelruf, Klatschen): brauchen Audiodateien und ein Audio-Modul.
- **Nochmal versuchen bei Fehlern**: Heute zählt der erste Tipp, die Runde wird gesperrt und die richtige Antwort gezeigt. Geplant: falsche Karte wird grau, das Kind versucht es erneut, Sterne zählen weiter nur den ersten Versuch (DIDAKTIK.md, Abschnitt 7).
- **Junge / Mädchen**: Arabische Anweisungen sind heute männlich formuliert (اِضْغَطْ). Eine Einstellung in der Elternecke braucht weibliche Formen aller gesprochenen Anweisungen, geprüft von einer Muttersprachlerin oder einem Muttersprachler.
- **Sprachprüfung**: Hudhuds Sätze, Stickernamen und die Texte der Elternecke von einer jemenitischen Lehrkraft prüfen lassen.
- **Klassenwahl**: Nur Klasse 1 hat Bücher; die Elternecke zeigt die anderen als «قريباً». Sobald weitere Klassen Inhalt haben, wird die Wahl dort aktiv.
