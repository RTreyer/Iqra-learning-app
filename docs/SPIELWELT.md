# Spielwelt für Kinder, die noch nicht lesen

Ziel: Ein Kind der 1. Klasse findet sich allein zurecht, ohne zu lesen, und kommt gern wieder. Die Bildsprache stammt aus dem Jemen.

## Hudhuds Geschichte

Beim ersten Tipp auf Play erzählt Hudhud seine Geschichte (`content/story.ts`, `app/intro.tsx`), fünf Szenen mit Stimme, jede mit einem bewegten Bild:

1. Hudhud ist der Briefbote des Jemen und bringt die Briefe zu allen Häusern. Er fliegt mit Flügelschlag über Sanaa, eine lederne Brieftasche umgeschnallt, aus der die Briefe hervorschauen.
2. Ein starker Wind zieht die Briefe einzeln vorne aus der Tasche, unter dem Schnabel hindurch und vor Hudhud hoch (nie über ihn hinweg); in der Luft platzt jeder Brief auf, und seine Buchstaben flattern als kleine Papierkärtchen davon.
3. Auf dem Markt von Mokka weiss der Händler nicht, wie viele Säcke Kaffee er hat.
4. Die Menschen warten, das Schiff wartet: «Ich brauche deine Hilfe!»
5. «Hilfst du mir? Wir sammeln Buchstaben oder zählen auf dem Markt. Wähle!»

Die Szenen gehen weiter, sobald die Stimme fertig ist; Antippen geht sofort weiter, «تخطَّ» springt zur Wahl. Die Wahl legt das Fach fest (Briefe = Arabisch, Markt = Mathe) und öffnet dessen Lernpfad. Hudhud ist ein ausgedachter Bote; Figuren aus dem Koran werden nicht dargestellt. Die fünf Sätze sind einfaches Hocharabisch und die ersten Kandidaten für Aufnahmen.

**Play danach**: öffnet die nächste noch nicht gemachte Lektion im gewählten Fach; ein kleines Abzeichen (أ / ١) zeigt, welches. **Wechseln**: Antippen einer Insel öffnet dieses Buch und macht es zum Fach für Play (goldener Rand). Ein Buch-Knopf oben spielt die Geschichte nochmals ab.

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

## Fehler ohne Beschämung

Eine falsche Karte wackelt kurz, wird grau und lässt sich nicht nochmals antippen. Die Stimme sagt «حَاوِلْ مَرَّةً أُخْرَى» und wiederholt die Aufgabe (den gesuchten Buchstaben, das Wort, die Frage), nie die Lösung. Das Kind versucht es erneut, bis es die Antwort findet; erst dann wird sie grün und die nächste Runde beginnt. Sterne und Wiederholungs-Karten zählen weiterhin nur den ersten Tipp. Gilt für alle Auswahl-Übungen und die tägliche Wiederholung (`components/activities/shared/useQuiz.ts`, `components/activities/ReviewRound.tsx`). Der Silbenzug behält seine eigene Wiederholung pro Kachel.

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
- **Junge / Mädchen**: Arabische Anweisungen sind heute männlich formuliert (اِضْغَطْ). Eine Einstellung in der Elternecke braucht weibliche Formen aller gesprochenen Anweisungen, geprüft von einer Muttersprachlerin oder einem Muttersprachler.
- **Sprachprüfung**: Hudhuds Geschichte, seine Sätze, Stickernamen und die Texte der Elternecke von einer jemenitischen Lehrkraft prüfen lassen.
- **Geschichte weiterführen**: Jede fertige Einheit als zugestellter Brief an einen Ort im Jemen (Shibam, Aden, Sokotra …), mit einem Satz Geschichte.
- **Klassenwahl**: Nur Klasse 1 hat Bücher; die Elternecke zeigt die anderen als «قريباً». Sobald weitere Klassen Inhalt haben, wird die Wahl dort aktiv.
