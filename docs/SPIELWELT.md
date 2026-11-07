# Spielwelt für Kinder, die noch nicht lesen

Ziel: Ein Kind der 1. Klasse findet sich allein zurecht, ohne zu lesen, und kommt gern wieder. Die Bildsprache stammt aus dem Jemen.

## Hudhud als Hauptfigur

Hudhud ist auf jedem Kinder-Bildschirm die eine Figur, die durch die Welt geht und anleitet:

| Ort | Was Hudhud tut | Code |
|---|---|---|
| Start | begrüsst, lädt zur Geschichte ein | `app/index.tsx` |
| Geschichte | ist der Held: Briefbote, Sturm, Bitte um Hilfe | `app/intro.tsx`, `components/world/StoryScenes.tsx` |
| Lernpfade (mit Palmen am Wegrand) | fliegt im Bogen vom letzten Stopp zum nächsten, landet und sagt dort seinen Satz | `components/world/PathMap.tsx` |
| Ende jeder Einheit | Arabisch: sein Brief, den der Sturm verweht hat; mit jeder Lektion kehren Buchstaben zurück, mit der ganzen Einheit ist er vollständig, versiegelt und leuchtet. Mathe: die Kaffeesäcke des Händlers in Mokka, einer nach dem anderen gezählt, bis das Schiff ablegt | `components/world/StoryGoal.tsx` |
| Nach jeder Lektion | zeigt auf dem Abschluss den Brief bzw. die Säcke; was die Lektion zurückgebracht hat, leuchtet, und er sagt es («رَجَعَ حَرْفٌ إِلَى رِسَالَتِي!» / «عَدَدْنَا كِيسًا آخَرَ!») | `lib/storyProgress.ts`, `app/lesson/[lessonId].tsx` |
| Jede Übung | steht über der Aufgabe, seine Sprechblase zeigt die Anweisung (Antippen wiederholt sie); hüpft bei richtigen Antworten, wackelt verwundert bei falschen | `components/world/LessonGuide.tsx` |
| Vorgemachtes Beispiel | erzählt in seiner Sprechblase, was die Hand vormacht | `components/demo/DemoPlayer.tsx` |
| Wiederholung | bringt «die Briefe des Tages» und reagiert auf die Antworten | `app/review.tsx` |
| Geschafft, Album | jubelt, nennt Sticker | `components/LessonCompleteCard.tsx`, `app/album.tsx` |

Pro Bildschirm gibt es nur einen Hudhud. Die Elternecke hat keinen; sie ist für Erwachsene.

## Lernpfade und Übungen nach dem Entwurf

- **Kopfzeile ohne Text**: runder Bild-Knopf eine Stufe nach oben (Haus zum Start, Karte zum Pfad), in der Mitte das Bild der Einheit bzw. der Übungsart (antippen sagt den Namen), links die Sterne bzw. die Hilfe-Hand. Titel und «x / y مكتمل» sind nur noch für Screenreader angesagt.
- **Buchstaben der Einheit**: gesammelt (alle Lektionen des Buchstabens fertig) gefüllt, sonst gestrichelt. Wo die Lektionen eines Buchstabens beginnen, trägt der Stopp ein Fähnchen mit dem Buchstaben.
- **Weg**: gold bis zum aktuellen Stopp, danach gestrichelt bis zum Ziel. Palmen am Rand.
- **Hintergrund**: warmer Sand mit einem Hauch Fachfarbe, keine Deko-Emojis.
- **Fortschritt als Teil der Geschichte** (`components/activities/shared/StoryProgress.tsx`): pro Aufgabe ein Brief. Gelöste Briefe sind farbig und hüpfen kurz, als flögen sie in Hudhuds Posttasche, die am Ende der Reihe (in Leserichtung links) wartet; der aktuelle ist in der Fachfarbe umrandet, die kommenden gestrichelt. In Mathe sind es die Kaffeesäcke des Händlers, am Ende wartet das Schiff. Vorher war es ein Zug, der weder zur Geschichte noch zum Jemen passte (dort gibt es kaum Eisenbahn).
- **Silben-Übung als Hudhuds Brief** (`BuildWordActivity.tsx`): Statt Wagen zu beladen, schreibt das Kind die Silben in die Lücken eines Briefs mit Siegel. Ist das Wort vollständig, fliegt der Brief davon. Hudhud sagt: «اِسْمَعْ جَيِّدًا، وَاكْتُبِ الْكَلِمَةَ فِي رِسَالَتِي.» Die Lektionen heissen «مَقَاطِعُ الرِّسَالَة», «جُمْلَةُ الرِّسَالَة» und «رِسَالَةُ الْوَحْدَة».
- **Gezeichnete Bilder statt Emojis** (`components/world/Emblem.tsx`, Feld `emblem` an Buch und Einheit): Emojis sehen auf jedem Handy anders aus und gehören nicht in die Welt des Kindes. Jedes Bild sagt, worum es in der Einheit geht, aus dem Jemen oder aus Hudhuds Geschichte, auf einer Papierscheibe:

  | Wo | Bild | Warum |
  |---|---|---|
  | Buch Arabisch | offenes Buch mit أ und ب | die ersten Buchstaben |
  | Buch «لغتي العربية» | Tintenfass und Schilfrohr-Feder (قلم) | Schreiben |
  | Buch Mathe | hölzerner Rechenrahmen | Zählen |
  | Buch Naturkunde | Blatt unter der Lupe | Entdecken |
  | A1 Vorbereitung | Holztafel (لوح) mit Wellenlinie zum Nachspuren | erste Linien |
  | A2 أُحِبُّ مَامَا وَبَابَا | Turmhaus aus Sanaa | Familie, Zuhause |
  | A3 Lehrerin, kranker Bruder, Waisenhaus | Herz in zwei Händen | Fürsorge |
  | A4 بَيْتٌ مِنْ رَمْلٍ | Sand-Turmhaus am Meer, Eimer | Titelgeschichte |
  | A5 Klasse, Verkehr | Schule mit jemenitischer Fahne | Schule |
  | A6 صَابِرٌ وَالْبُلْبُلُ | Bülbül auf einem Zweig | Titelgeschichte |
  | A7 Sauberkeit, Zähne | Messing-Ibriq, Seifenblasen | Waschen |
  | A8 فِي الْقَرْيَةِ | Terrassenfelder, Turmhaus auf dem Berg | Dorf im Hochland |
  | M1 Sortieren, Muster | geflochtener Korb mit Zickzack, Perlen rot-gelb-rot | Muster |
  | M2 Zahlen | Kaffeesäcke ١ ٢ ٣ des Händlers | Hudhuds Geschichte |
  | M3 Addieren | Messingtablett mit Datteln, eine kommt dazu, «+» | dazu |
  | M4 Subtrahieren | Granatäpfel, einer rollt weg, «−» | weg |
  | M5 Formen, Brüche | Sanaa-Fenster: Qamariya in zwei Hälften, Dreieck | Formen und Hälften |
  | N1–N3 (noch nicht frei) | Hand, Kamel, Kaffeesetzling mit Tropfen | Körper, Tiere, Pflanzen |

  Die Übungsarten haben feste, einfarbige Bilder (`lessonPicture.tsx`): Rechenrahmen fürs Zählen, Waage fürs Vergleichen, Lücke mit Fragezeichen fürs Ergänzen, zwei Körbe fürs Sortieren, Verbindungslinien fürs Zuordnen, Herz fürs richtige Verhalten, Bilderrahmen für Bildauswahl, «+ −» fürs Rechnen. Sterne und Lautsprecher sind überall gezeichnet statt ⭐ und 🔊.
- **Übungen ohne Lesen**: Hudhud sagt die Aufgabe; die früheren Texthinweise («ابحث عن الحرف», «اضغط على كل جملة…», «٤ جملة متبقية», «رتّب…») sind entfernt. Der Fortschritt in einer Übung ist Teil der Geschichte (siehe unten). Der gesuchte Buchstabe steht gross auf einer Karte mit Lautsprecher zum Nochmal-Hören; die Antwortkarten sind grösser. Weiter ist ein grosser runder Play-Knopf, Nachzeichnen hat Bild-Knöpfe (neu anfangen, fertig).

## Hudhuds Geschichte

Beim ersten Tipp auf Play erzählt Hudhud seine Geschichte (`content/story.ts`, `app/intro.tsx`), fünf Szenen mit Stimme, jede mit einem bewegten Bild:

1. Hudhud ist der Briefbote des Jemen und bringt die Briefe zu allen Häusern. Er fliegt mit Flügelschlag über Sanaa, eine lederne Brieftasche umgeschnallt, aus der die Briefe hervorschauen.
2. Ein Sandsturm zieht auf: dunkle Wolken, Sandschleier und Sandkörner jagen durchs Bild, Hudhud kämpft mit schlagenden Flügeln gegen die Böen. Der Sturm reisst die drei Briefe nacheinander vorne aus der Tasche, unter dem Schnabel hindurch und vor Hudhud hoch (nie über ihn hinweg); in der Luft platzt jeder Brief auf, und seine Buchstaben wirbeln als Papierkärtchen davon. Danach ist die Tasche leer und bleibt es in den folgenden Szenen. Die Szene dauert mindestens 5,6 Sekunden, damit der Sturm fertig spielt.
3. Auf dem Markt von Mokka weiss der Händler nicht, wie viele Säcke Kaffee er hat.
4. Die Menschen warten, das Schiff wartet: «Ich brauche deine Hilfe!»
5. «Hilfst du mir? Wir sammeln Buchstaben oder zählen auf dem Markt. Wähle!»

Zwischen den Szenen blättert die Geschichte wie ein arabisches Buch um: Die alte Szene spielt weiter, während sie ausblendet und nach rechts gleitet, die neue gleitet von links herein; der gesprochene Satz und am Ende die Fachwahl erscheinen sanft. Die Szenen gehen weiter, sobald die Stimme fertig ist; Antippen geht sofort weiter, «تخطَّ» springt zur Wahl. Die Wahl legt das Fach fest (Briefe = Arabisch, Markt = Mathe) und öffnet dessen Lernpfad. Hudhud ist ein ausgedachter Bote; Figuren aus dem Koran werden nicht dargestellt. Die fünf Sätze sind einfaches Hocharabisch und die ersten Kandidaten für Aufnahmen.

**Play danach**: öffnet die nächste noch nicht gemachte Lektion im gewählten Fach; ein kleines Abzeichen (أ / ١) zeigt, welches. **Wechseln**: Antippen einer Insel öffnet dieses Buch und macht es zum Fach für Play (goldener Rand). Ein Buch-Knopf oben spielt die Geschichte nochmals ab.

## Aufbau

| Bildschirm | Was das Kind sieht | Code |
|---|---|---|
| Start | Hudhud mit Gruss («بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ»), ein grosser Play-Knopf direkt zur nächsten Lektion, eine Insel pro Buch (أ ب ت / ١ ٢ ٣), die Qamariya des Tages, das Stickeralbum, bei fälligen Wiederholungen eine Brief-Kachel. Unten die Altstadt von Sanaa. | `app/index.tsx` |
| Buch | Die Einheiten als Stationen auf einem Weg. Ein Ring zeigt, wie viel erledigt ist; die nächste Station leuchtet, Hudhud steht mit seiner Sprechblase daneben. | `app/book/[bookId].tsx`, `components/world/PathMap.tsx` |
| Einheit | Die Lektionen als Weg. Jede Übungsart hat ein festes Bild (Buch = Geschichte, Stift = Schreiben, Auge = Wörter …). Erledigt = gold mit Sternen, jetzt = farbig mit Lichtring, später = sandfarben, aber offen. Hudhud steht neben der nächsten Lektion und sagt das Thema der Einheit; der Pfad scrollt beim Öffnen zu ihm. Oben die Buchstaben der Einheit, die sich beim Antippen selbst sprechen. | `app/unit/[unitId].tsx`, `components/world/lessonPicture.tsx` |
| Übung | Fortschritt als Reihe von Briefen, die in Hudhuds Posttasche fliegen (Mathe: Kaffeesäcke bis zum Schiff), statt «سؤال ١ من ٤». | `components/activities/shared/StoryProgress.tsx` |
| Geschafft | Sterne springen einzeln auf, kurzes Konfetti in den Qamariya-Farben, Hudhud jubelt, die Qamariya des Tages, ein neuer Sticker. Drei Bildknöpfe: Karte, weiter, nochmal. | `components/LessonCompleteCard.tsx` |
| Album | Neun Sticker mit Motiven aus dem Jemen; jeder sagt seinen Namen. Ein Balken zeigt den Weg zum nächsten. | `app/album.tsx`, `lib/stickers.ts` |
| Elternecke | Hinter einer Halten-Sperre (1,5 s): Klasse, Menüsprache, Stimme, Vibration, Fortschritt, Zurücksetzen mit zweiter Bestätigung. | `app/parents.tsx`, `context/SettingsContext.tsx` |

Hudhud spricht mit der Stimme der App; die Sprechblase zeigt nur, was gesagt wird. Antippen von Hudhud wiederholt den Satz.

## Belohnungen

- **Sterne** wie bisher: 1 bis 3 pro Lektion, nur der beste Versuch zählt.
- **Qamariya des Tages**: jede heute abgeschlossene oder verbesserte Lektion färbt ein Glasfeld; nach drei leuchtet das Fenster (`lib/daily.ts`). Am nächsten Tag beginnt es leer, ohne Strafe. Die frühere Serie (Streak) ist entfernt.
- **Sticker**: alle 12 Sterne einer, in fester Reihenfolge (`lib/stickers.ts`). Nie zufällig.

## Fehler ohne Beschämung

Eine falsche Karte wackelt kurz, wird grau und lässt sich nicht nochmals antippen. Die Stimme sagt «حَاوِلْ مَرَّةً أُخْرَى» und wiederholt die Aufgabe (den gesuchten Buchstaben, das Wort, die Frage), nie die Lösung. Das Kind versucht es erneut, bis es die Antwort findet; erst dann wird sie grün und die nächste Runde beginnt. Sterne und Wiederholungs-Karten zählen weiterhin nur den ersten Tipp. Gilt für alle Auswahl-Übungen und die tägliche Wiederholung (`components/activities/shared/useQuiz.ts`, `components/activities/ReviewRound.tsx`). Die Silben-Übung (Hudhuds Brief) behält ihre eigene Wiederholung pro Kachel.

## Kulturelle Entscheidungen

- **Hudhud (Wiedehopf)**: bringt in Sure An-Naml die Nachricht aus Saba, also aus dem Jemen. Keine Hunde oder Schweine als Figuren, keine Zauberwesen.
- **Bildsprache aus Sanaa**: Lehm-Turmhäuser mit weissem Gips, Qamariya-Fenster als Fortschrittsanzeige; Farben in `theme/tokens.ts` (`yemen`).
- **Sticker-Motive**: Qamariya, Haus aus Sanaa, Mokka-Kaffee, Sanbuq (Dau), Sidr-Honig, Drachenblutbaum (Sokotra), Dattelpalme, Datteln, Bint al-Sahn. Keine Waffen (auch keine Jambiya), keine Kriegsbilder.
- **Kein Glücksspiel-Mechanismus**: keine Glücksräder, Lootboxen oder Zufallsbelohnungen.
- **Kein Druck**: kein Streak, nichts verfällt. Stromausfälle, Freitage, Ramadan oder eine Flucht werden nicht bestraft.
- **Ruhig im Alltag, spannend in der Geschichte**: In der App kurze Animationen und ein langsam atmender Lichtring. Der Sandsturm in der Geschichte ist bewegt, aber ohne Blitze, Donner oder Flackern (erinnert nicht an Explosionen, schont lichtempfindliche Kinder). Keine lauten Töne, keine Musik.
- **Alltagssprache**: «بسم الله» zum Start, «أَحْسَنْت» als Lob (in der Pausalform für Jungen und Mädchen gleich).

## Offen

- **Aufgenommene Stimme**: Alle Sätze von Hudhud laufen über die Sprachausgabe des Geräts. Ohne arabische Stimme hört das Kind nichts (siehe `docs/VOICE.md`).
- **Soundeffekte** (sanftes Glöckchen, Vogelruf, Klatschen): brauchen Audiodateien und ein Audio-Modul.
- **Junge / Mädchen**: Arabische Anweisungen sind heute männlich formuliert (اِضْغَطْ). Eine Einstellung in der Elternecke braucht weibliche Formen aller gesprochenen Anweisungen, geprüft von einer Muttersprachlerin oder einem Muttersprachler.
- **Sprachprüfung**: Hudhuds Geschichte, seine Sätze, Stickernamen und die Texte der Elternecke von einer jemenitischen Lehrkraft prüfen lassen.
- **Geschichte weiterführen**: Der vollständige Brief am Ende einer Einheit könnte an einen Ort im Jemen zugestellt werden (Shibam, Aden, Sokotra …), mit einem Satz Geschichte.
- **Klassenwahl**: Nur Klasse 1 hat Bücher; die Elternecke zeigt die anderen als «قريباً». Sobald weitere Klassen Inhalt haben, wird die Wahl dort aktiv.
