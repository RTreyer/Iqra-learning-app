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

Hudhud ist ein Tagelöhner des Jemen: Jeden Tag macht er eine andere Arbeit, und in jeder lernt er etwas, denn er träumt davon, in seinem Dorf eine Schule zu bauen, in der alle Kinder lernen. Das ist sein Antrieb, und es ist der des Kindes: Wer lesen und rechnen kann, kann allen helfen. Die Geschichte (`content/story.ts`, `app/intro.tsx`, Bilder in `components/world/DayScenes.tsx` und `StoryScenes.tsx`) hat einen gemeinsamen Anfang und zwei Kapitel, eines pro Arbeit.

**Anfang** (beim ersten Tipp auf Play, fünf Szenen mit Stimme):

1. **Morgen über Sanaa**: Die Nacht weicht, die Sonne geht auf, ein Vogelschwarm zieht vorbei, Hudhud erwacht auf einem Dach: «Ich bin Hudhud. Jeden Morgen fliege ich über den Jemen und mache eine neue Arbeit.»
2. **Seine Arbeiten**: Hudhud fliegt, und das Land zieht unter ihm von rechts nach links vorbei: die Terrassenfelder des Bauern, das Meer mit Sanbuq und springendem Fisch, die Berge des Imkers mit Honig und Bienen.
3. **Sein Traum**: Nachts unter funkelnden Sternen liest er im Laternenlicht. In seiner Gedankenblase zeichnet sich eine Schule mit jemenitischer Fahne, und Kinder kommen eins nach dem anderen: «Ich träume davon, in meinem Dorf eine Schule zu bauen, in der alle Kinder lernen.»
4. **Heute zwei Arbeiten**: links der Kaffee mit Säcken, rechts die Post mit Brief und Häusern; Hudhud schaut hin und her: «Darum lerne ich bei jeder Arbeit. Heute habe ich zwei Arbeiten und brauche deine Hilfe!»
5. **Wahl**: «Soll ich Postbote sein oder dem Kaffeehändler helfen? Wähle!»

**Kapitel** (wird beim ersten Mal in einem Fach erzählt, danach öffnet sich dessen Lernpfad; gespeichert in `chaptersSeen`):

- **Postbote (Arabisch, «Read and learn»)**: Hudhud fliegt mit der Posttasche über Sanaa; der Sandsturm bläst die Buchstaben und ihre Vokalzeichen aus den Briefen; die Menschen warten auf ihre Briefe: «Sammeln wir die Buchstaben gemeinsam!»
- **Kaffeehändler (Mathe)**: Auf dem Markt von Mokka hat der Händler viel Kaffee; Bohnen kullern aus einem Sack, Hudhud beginnt zu zählen (١ ٢ ٣) und verliert den Überblick (؟ ؟): «Er weiss nicht, wie viele Bohnen und wie viele Säcke er hat.» Im Hafen schaukelt das Schiff, das auf den Kaffee wartet: «Zählen wir gemeinsam!»

Die Wahl im Anfang führt direkt ins Kapitel der gewählten Arbeit; tippt das Kind später zum ersten Mal auf die Insel des anderen Fachs, wird dessen Kapitel erzählt. Am Ende eines Fachs sagt Hudhud: «Ein weiterer Schritt zu meiner Schule. Danke!»

Zwischen den Szenen blättert die Geschichte wie ein arabisches Buch um: Die alte Szene spielt weiter, während sie ausblendet und nach rechts gleitet, die neue gleitet von links herein; der gesprochene Satz und am Ende die Fachwahl erscheinen sanft. Die Szenen gehen weiter, sobald die Stimme fertig ist (bewegte Szenen spielen mindestens bis zum Ende ihrer Bewegung); Antippen geht sofort weiter, «تخطَّ» springt zur Wahl bzw. aus dem Kapitel in den Lernpfad. Hudhud ist ein ausgedachter Vogel, inspiriert vom Wiedehopf; Figuren aus dem Koran werden nicht dargestellt. Alle Sätze sind einfaches Hocharabisch, zur Sprachprüfung in `docs/CONTENT_REVIEW.md`, und die ersten Kandidaten für Aufnahmen.

### Die Geschichte in den Lernpfaden

Jede Einheit hat ein Ziel am Ende ihres Pfads (`GoalKind` in `content/types.ts`, Logik in `lib/storyProgress.ts`, Sätze in `GOAL_LINES` in `content/story.ts`). Die Buchstaben-Leiste oben, das Ziel am Pfadende und die Abschlusskarte lesen denselben Zustand und widersprechen sich nie.

| Einheit | Ziel | Was sich füllt |
|---|---|---|
| A1 Vorbereitung | Hudhud lehrt das Schreiben: eine leere Briefseite | eine Zeile Schrift pro Viertel der Lektionen, die letzte mit der letzten Lektion; am Ende seine Schilfrohrfeder |
| A2, A3, A6, A7, A8 | Hudhuds Brief | ein Buchstabe kehrt zurück, sobald alle Lektionen seines Abschnitts fertig sind; die Übungen am Ende versiegeln den Brief |
| A4, A5 (Vokalzeichen) | derselbe Brief, die Buchstaben ohne «Kleider» | die Buchstaben (schon aus A2 bekannt) stehen blass da und bekommen ihr Vokalzeichen zurück, wenn ihr Abschnitt fertig ist; auch die Leiste zeigt dann «مُ» |
| M1 Sortieren | Markttag, Station 1 | drei Körbe (Honig, Rosinen, Kaffee) werden gefüllt |
| M2 Zahlen | Station 2 | die Säcke ١ bis ٥ werden gezählt |
| M3 Addieren | Station 3 | das Kamel bringt Säcke, sie kommen dazu (+) |
| M4 Subtrahieren | Station 4 | Säcke gehen vom Kai weg aufs wartende Schiff |
| M5 Formen | Station 5 | die Waren werden verpackt (Quader, Zylinder, Würfel, Kugel); erst dann legt das Schiff ab, einmal, am Ende des Buchs |

Der Sturm im Intro bläst deshalb «die Buchstaben und ihre Vokalzeichen» aus den Briefen.

**Zustellung**: Jeder fertige Brief geht an eine Person aus den Geschichten der Einheit; ihr Bild steht unter dem Brief, blass auf dem Weg, mit Goldrand, wenn er zugestellt ist. Die Abschlusskarte der letzten Lektion sagt «اِكْتَمَلَتِ الرِّسَالَةُ! سَأُوصِلُهَا …», das Ziel danach «أَوْصَلْتُ رِسَالَتِي … شُكْرًا لَكَ!».

| Einheit | Empfänger |
|---|---|
| A2 | إِلَى مَامَا وَبَابَا |
| A3 | إِلَى الْمُعَلِّمَةِ بَيَانَ |
| A4 | إِلَى أَصْدِقَائِي عَلَى الشَّاطِئِ |
| A5 | إِلَى رَجُلِ الْمُرُورِ |
| A6 | إِلَى صَابِرٍ وَبُلْبُلِهِ |
| A7 | إِلَى وَسِيمٍ |
| A8 | إِلَى جَدِّي |

**Ende der Geschichte**: Hat das Kind alle Lektionen eines Fachs mit drei Sternen, sagt Hudhud auf der Startseite «وَصَلَتْ كُلُّ رَسَائِلِي! شُكْرًا لَكَ!» (Arabisch) bzw. «أَبْحَرَتِ السَّفِينَةُ، وَالتَّاجِرُ سَعِيدٌ! شُكْرًا لَكَ!» (Mathe). **Sticker** sind Dankesgeschenke: «هَدِيَّةُ شُكْرٍ لَكَ: …». Das Naturkunde-Buch (noch gesperrt) hat bewusst kein Ziel, bis es eine eigene Geschichte bekommt.

**Play danach**: öffnet die nächste noch nicht gemachte Lektion im gewählten Fach; ein kleines Abzeichen (أ / ١) zeigt, welches. **Wechseln**: Antippen einer Insel öffnet dieses Buch und macht es zum Fach für Play (goldener Rand). Ein Buch-Knopf oben spielt die Geschichte nochmals ab.

## Englischer Erklär-Modus

Für Erwachsene, die kein Arabisch lesen (Eltern im Ausland, Lehrkräfte, Spender, Prüfer): Wer in der Elternecke die Menüsprache auf English stellt, sieht und hört, was in der App passiert (`lib/explain.ts`, `components/Gloss.tsx`).

- **Englisch, mit englischer Stimme**: alles, was Hudhud und die App sagen und zeigen: das Intro, Hudhuds Sätze auf Pfaden und am Ziel, Anweisungen, Lob und «Try again», Mathe-Fragen, Lektions- und Abschnittstitel (`content/translations/lines.ts`).
- **Arabisch mit Übersetzung darunter**: der Lernstoff bleibt, was das Kind sieht und hört. Wörter und Lesesätze zeigen klein ihre englische Bedeutung (`content/translations/gloss.ts`), Buchstaben und Silben eine Lateinlesung («م» → «the letter mīm», «مَا» → «mā», `lib/transliterate.ts`). Gesprochen werden sie weiter mit der arabischen Stimme.
- **Gemischte Sätze** wie «حَاوِلْ مَرَّةً أُخْرَى، مَ» werden Teil für Teil gesprochen: «Try again,» englisch, der Buchstabe arabisch.
- Die Sprache wird vor dem ersten gesprochenen Satz geladen, damit nichts in der falschen Sprache beginnt.
- `test-utils/explainStrings.ts` sammelt alle Texte; ein Test meldet jeden ohne Übersetzung. Die Übersetzungen sind maschinell und sollten gegengelesen werden. Hudhuds «رِسَالَة» heisst durchgehend «message», ein Buchstabe «letter».

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
