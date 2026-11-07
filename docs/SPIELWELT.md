# Spielwelt für Kinder, die noch nicht lesen

Ziel: Ein Kind der 1. Klasse findet sich allein zurecht, ohne zu lesen, und kommt gern wieder. Die Bildsprache stammt aus dem Jemen.

## Hudhud als Hauptfigur

Hudhud ist auf jedem Kinder-Bildschirm die eine Figur, die durch die Welt geht und anleitet:

| Ort | Was Hudhud tut | Code |
|---|---|---|
| Start | begrüsst, lädt zur Geschichte ein | `app/index.tsx` |
| Geschichte | ist der Held: Briefbote, Sturm, Bitte um Hilfe | `app/intro.tsx`, `components/world/StoryScenes.tsx` |
| Lernpfade (mit Palmen am Wegrand) | fliegt im Bogen vom letzten Stopp zum nächsten, landet und sagt dort seinen Satz | `components/world/PathMap.tsx` |
| Ende jeder Einheit | Arabisch: der Hinweis der Station auf Rashas Spur (Türschild, Heft, Bootsname, Brief); mit jedem fertigen Abschnitt kann Hudhud einen Buchstaben mehr lesen, mit der ganzen Einheit ist er gelesen und leuchtet. Mathe: eine Station der Kaffee-Reise des Händlers (Kirschen sortieren, Säcke zählen, Säcke dazuzählen, verschenken, Schiff beladen) | `components/world/StoryGoal.tsx` |
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
- **Gezeichnete Bilder in den Übungen** (`components/pictures/`): Alle 211 Bilder in den Lektionen und Vormach-Beispielen (Tiere, Früchte, Menschen, Dinge, Orte, Formen) sind flache Zeichnungen im Stil der App statt Emojis. Der Inhalt nennt ein Bild weiter über sein Emoji; `Picture` schlägt die Zeichnung nach (SVG-Markup in `people.ts`, `nature.ts`, `home.ts`, `places.ts`, `things.ts`). Ein Test prüft, dass jedes Emoji im Inhalt eine Zeichnung hat. Kulturelle Regeln der Zeichnungen: Jungen und Männer im Thobe, Frauen und Mädchen mit Kopftuch und langem Kleid, keine Jambiya oder Waffe (der Verkehrspolizist hebt nur die Hand), roter Halbmond statt Kreuz (Arzt, Krankenhaus), keine Würfelaugen (🎲 ist der Würfel als Körper), keine Musiknoten (🎵 ist ein singender Bülbül), Haus, Schule, Moschee, Tür und Fenster im Stil von Sanaa, die Kaffeetasse ohne Henkel, der Besen aus Palmblättern.
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
  | A8 رَشِيدَةُ وَالْفَرَاشَاتُ، لَطِيفَةُ وَالنَّحْلَةُ | Schmetterling über einer Blume, eine Biene | Titelgeschichten |
  | M1 Sortieren, Muster | geflochtener Korb mit Zickzack, Perlen rot-gelb-rot | Muster |
  | M2 Zahlen | Kaffeesäcke ١ ٢ ٣ des Händlers | Hudhuds Geschichte |
  | M3 Addieren | Messingtablett mit Datteln, eine kommt dazu, «+» | dazu |
  | M4 Subtrahieren | Granatäpfel, einer rollt weg, «−» | weg |
  | M5 Formen, Brüche | Sanaa-Fenster: Qamariya in zwei Hälften, Dreieck | Formen und Hälften |
  | N1–N3 (noch nicht frei) | Hand, Kamel, Kaffeesetzling mit Tropfen | Körper, Tiere, Pflanzen |

  Die Übungsarten haben feste, einfarbige Bilder (`lessonPicture.tsx`): Rechenrahmen fürs Zählen, Waage fürs Vergleichen, Lücke mit Fragezeichen fürs Ergänzen, zwei Körbe fürs Sortieren, Verbindungslinien fürs Zuordnen, Herz fürs richtige Verhalten, Bilderrahmen für Bildauswahl, «+ −» fürs Rechnen. Sterne und Lautsprecher sind überall gezeichnet statt ⭐ und 🔊.
- **Übungen ohne Lesen**: Hudhud sagt die Aufgabe; die früheren Texthinweise («ابحث عن الحرف», «اضغط على كل جملة…», «٤ جملة متبقية», «رتّب…») sind entfernt. Der Fortschritt in einer Übung ist Teil der Geschichte (siehe unten). Der gesuchte Buchstabe steht gross auf einer Karte mit Lautsprecher zum Nochmal-Hören; die Antwortkarten sind grösser. Weiter ist ein grosser runder Play-Knopf, Nachzeichnen hat Bild-Knöpfe (neu anfangen, fertig).

## Hudhuds Geschichte

Im Geist einer stillen Reise (wie «Der kleine Prinz», ohne dessen Figuren) und mit der heutigen Lage im Jemen nur angedeutet: Vertreibung, Wassermangel, Gemeinschaft, Hoffnung. Keine Kriegsbilder, keine Schuldigen. Hudhud erzählt selbst (`content/story.ts`, `app/intro.tsx`, Bilder in `components/world/StoryScenes.tsx`, `Bowl.tsx`, `StoryArt.tsx`, `Voyage.tsx`).

**Kapitel 1** (beim ersten Tipp auf Play, 12 lebende Bilder): Hudhud wohnt auf einem Dach in Sanaa. Im heissen Sommer findet er kein Wasser: die Erde ist rissig, der Krug leer, die Hitze flimmert. Eines Morgens kommt ein Mädchen aufs Dach und giesst Wasser in eine Tonschale; Hudhud trinkt, Spatz und Taube kommen dazu. «Du kennst uns doch gar nicht!» – «Aber ihr habt Durst.» Sie heisst Rasha; Tag für Tag (Sonne, Nacht, Sonne) wartet er auf sie, und sie kommt. Dann ein trauriger Tag: Ihre Familie lädt ihre Sachen auf einen Pick-up und zieht weit weg; Rasha winkt von der Ladefläche, Hudhud fliegt ein Stück hinterher. Am nächsten Morgen bleibt die Schale leer; er wartet, bis es Nacht wird. Unter die Schale hat sie einen Zettel geklemmt. Hudhud zieht ihn mit dem Schnabel hervor und kann ihn nicht lesen. «Rasha hat uns Wasser gegeben, als wir Durst hatten. Jetzt bin ich dran: Ich suche sie!» Er steckt ihren Zettel in seine Tasche und fliegt los. Dann erscheint die Karte des Jemen: Sanaa mit Rashas Schale als Zuhause, gestrichelte Flugwege und die Orte, an die er fliegen kann, je einer pro Faden: Mukalla am Arabischen Meer (der Postbote, Lesen) und Mokka am Roten Meer (der Kaffeehändler, Mathe). «Wo suche ich zuerst? Wähle einen Ort!» Das Kind tippt auf einen Ort; das ist die Wahl des Fachs (`components/world/YemenMap.tsx`, `MAP_PLACES` in `content/story.ts`). Wie beim kleinen Prinzen trifft Hudhud an jedem Ort Figuren: den alten Postboten, die Lehrerin, den Fischer, den Händler. Jedes Bild läuft mindestens so lange, bis seine Bewegung zu Ende ist; «Überspringen» führt direkt zur Wahl.

**Zwei Fäden, je ein Fach**:

- **Arabisch: Wer lesen kann, versteht.** In Mukalla gibt der alte Postbote Hudhud Arbeit: «Arbeite mit mir, und frag in jedem Haus nach Rasha!» Um die Briefe zuzustellen, lernt er die Buchstaben. Jede Einheit ist eine Station mit etwas zu lesen (der erste Brief mit einem Namen an der Tür, die Lehrerin Bayan hat Rashas Heft, der Fischer hat einen Namen auf dem Boot, der Verkehrspolizist zeigt ein Wegschild, beim Grossvater liegt ein Brief von Rasha). Am Ende jeder Einheit ein Hinweis auf ihrer Spur; nach Einheit 8: «Rasha ist in einem neuen Zuhause, und es geht ihr gut.» Am Ende des Pfads wartet die Schale mit Rashas Zettel darunter: Ihre Botschaft «اِسْقِ الطُّيُورَ» («Gib den Vögeln Wasser») und der Name «رَشَا» bestehen aus Buchstaben der Einheiten 2, 3, 6, 7 und 8; jeder gelernte Buchstabe erscheint auf dem Zettel in Tinte, die übrigen bleiben blass. Erst mit dem ganzen Buch liest das Kind die Botschaft und ihren Namen.
- **Mathe: Wer zählen kann, kann helfen.** In Mokka, dem alten Kaffeehafen am Roten Meer, trifft Hudhud einen traurigen Kaffeehändler: Sein Helfer ist fort, er weiss nicht, wie viele Säcke er hat, und das Schiff in Mokka wartet nicht. «Rasha hat uns geholfen, also helfen wir ihm!» Jede Mathe-Einheit ist eine Station in Mokka: auf dem Markt die roten (reifen) von den grünen Kaffeekirschen sortieren, die die Bauern aus den Bergen bringen, im Lager die Säcke zählen («Der Händler lächelt zum ersten Mal»), die Säcke des Kamels dazuzählen, am Meer Kaffee an die Nachbarn verschenken und sehen, was bleibt («Wer gibt, wird nicht ärmer»), im Hafen von Mokka Pakete in allen Formen aufs Schiff laden. Wenn das Schiff ablegt, stellt der Händler eine Schale Wasser für die Vögel auf: Rashas Freundlichkeit geht weiter. Am Ende des Pfads liegt die Dau am Kai, mit jeder fertigen Einheit kommt ein Sack an Bord, mit allen fünf setzt sie Segel.

**Stationen** (`STATIONS`): Beim ersten Öffnen einer Einheit erzählt Hudhud, wo er ist und was zu lesen oder zu zählen ist; sein Satz auf dem Pfad ist diese Aufgabe, und die Abschlusskarte der Einheit sagt den Hinweis oder die Lehre. Das Ziel am Pfadende zeigt, wer den Hinweis hat.

**Die tägliche Schale** ersetzt die Qamariya: Jede Lektion des Tages füllt Rashas Schale ein wenig, mit drei ist sie voll, und die Vögel trinken. Hudhud wartet jeden Morgen, wie Rasha auf ihn gewartet hat. An einem Tag ohne Lektion geht nichts verloren.

**Ende** (wenn alle Lektionen beider Fächer fertig sind, einmal): Hudhud fliegt heim nach Sanaa und sieht unterwegs überall Schalen mit Wasser für die Vögel. Auf seinem Dach füllt ein kleines Mädchen, neu im Haus, Rashas Schale. «Rasha ist fort, aber ihre Freundlichkeit ist geblieben. Gib den Vögeln Wasser, mein Freund!» Sticker sind Andenken von der Reise.

Zwischen den Szenen blättert die Geschichte wie ein arabisches Buch um. Die Szenen gehen weiter, sobald die Stimme fertig ist; Antippen geht sofort weiter, «تخطَّ» springt zur Wahl bzw. aus einem Kapitel oder einer Station heraus. Gespeichert in `chaptersSeen`. Alle Sätze sind einfaches Hocharabisch, zur Sprachprüfung in `docs/CONTENT_REVIEW.md`; die englischen Übersetzungen für den Erklär-Modus sind ergänzt.

## Aufbau

| Bildschirm | Was das Kind sieht | Code |
|---|---|---|
| Start | Hudhud mit Gruss («بِسْمِ اللهِ! هَيَّا نَتَعَلَّمُ»), ein grosser Play-Knopf direkt zur nächsten Lektion, eine Insel pro Buch (أ ب ت / ١ ٢ ٣), Rashas Schale des Tages, das Stickeralbum, bei fälligen Wiederholungen eine Brief-Kachel. Unten die Altstadt von Sanaa. | `app/index.tsx` |
| Buch | Die Einheiten als Stationen auf einem Weg. Ein Ring zeigt, wie viel erledigt ist; die nächste Station leuchtet, Hudhud steht mit seiner Sprechblase daneben. | `app/book/[bookId].tsx`, `components/world/PathMap.tsx` |
| Einheit | Die Lektionen als Weg. Jede Übungsart hat ein festes Bild (Buch = Geschichte, Stift = Schreiben, Auge = Wörter …). Erledigt = gold mit Sternen, jetzt = farbig mit Lichtring, später = sandfarben, aber offen. Hudhud steht neben der nächsten Lektion und sagt das Thema der Einheit; der Pfad scrollt beim Öffnen zu ihm. Oben die Buchstaben der Einheit, die sich beim Antippen selbst sprechen. | `app/unit/[unitId].tsx`, `components/world/lessonPicture.tsx` |
| Übung | Fortschritt als Reihe von Briefen, die in Hudhuds Posttasche fliegen (Mathe: Kaffeesäcke bis zum Schiff), statt «سؤال ١ من ٤». | `components/activities/shared/StoryProgress.tsx` |
| Geschafft | Sterne springen einzeln auf, kurzes Konfetti in den Qamariya-Farben, Hudhud jubelt, Rashas Schale des Tages, ein neuer Sticker. Drei Bildknöpfe: Karte, weiter, nochmal. | `components/LessonCompleteCard.tsx` |
| Album | Neun Sticker mit Motiven aus dem Jemen; jeder sagt seinen Namen. Ein Balken zeigt den Weg zum nächsten. | `app/album.tsx`, `lib/stickers.ts` |
| Elternecke | Hinter einer Halten-Sperre (1,5 s): Klasse, Menüsprache, Stimme, Vibration, Fortschritt, Zurücksetzen mit zweiter Bestätigung. | `app/parents.tsx`, `context/SettingsContext.tsx` |

Hudhud spricht mit der Stimme der App; die Sprechblase zeigt nur, was gesagt wird. Antippen von Hudhud wiederholt den Satz.

## Belohnungen

- **Sterne** wie bisher: 1 bis 3 pro Lektion, nur der beste Versuch zählt.
- **Rashas Schale des Tages**: jede heute abgeschlossene oder verbesserte Lektion füllt die Tonschale ein wenig; nach drei ist sie voll und die Vögel trinken (`lib/daily.ts`, `components/world/Bowl.tsx`). Am nächsten Tag beginnt es leer, ohne Strafe. Die frühere Serie (Streak) ist entfernt.
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
- **Langfassung der Geschichte**: Die ausführliche Fassung von Hudhuds Reise (Ma'rib, Haraz, Aden, Sokotra, die Rückkehr) könnte als Vorlesegeschichte für Eltern in die Elternecke.
- **Klassenwahl**: Nur Klasse 1 hat Bücher; die Elternecke zeigt die anderen als «قريباً». Sobald weitere Klassen Inhalt haben, wird die Wahl dort aktiv.
