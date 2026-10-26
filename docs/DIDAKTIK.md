# Didaktisches Konzept für die Iqra-App

Stand: 26.10.2026

Die App sollte jede Lektion von einem expliziten Ziel aus aufbauen, Roths Lernstufen bis zum Transfer durchlaufen und Fehler mit erklärendem Feedback auffangen.

Grundlage sind die Vorlesungen 1–6 aus «Grundlagen der Wirtschaftspädagogik» (Folien und Grundlagenliteratur: Euler/Hahn, Helmke, Sorgalla, Raso, Werth/Denzler, Metzger/Nüesch), abgeglichen mit dem aktuellen Aufbau der App.

Einschränkung: Das Material ist für Wirtschaftsunterricht auf Sek-II-Stufe geschrieben. Die Planungslogik lässt sich gut übertragen, zur Didaktik des Lesenlernens (phonologische Bewusstheit, arabisch-spezifische Leselehrgänge) steht darin aber nichts. Dafür braucht es zusätzliche Fachliteratur.

## Grundgerüst: Angebot und Nutzung

Nach Helmkes Angebots-Nutzungs-Modell ist die App nur das Angebot. Ob gelernt wird, entscheidet die Nutzung durch das Kind, und die hängt von Motivation, Vorwissen und Kontext ab.

Für ein Kind, das allein und ohne Lehrperson lernt, muss die App deshalb die Aufgaben der Lehrperson übernehmen: Ziele klären, motivieren, erklären, Fehler auffangen und Fortschritt sichtbar machen.

## 1. Bedingungsanalyse: Wer nutzt die App wirklich?

Die Vorlesung unterscheidet fachliche, personale und strukturelle Bedingungen. Für die Zielgruppe ergeben sich drei konkrete Folgen:

- **Altersheterogenität:** Ein 10-jähriges Kind ohne Schulzugang lernt dieselben Buchstaben wie ein 6-jähriges. Ein kurzer Einstiegstest («Welche Buchstaben kennst du schon?») überspringt Bekanntes und verhindert Unterforderung.
- **Geteilte Handys:** Ohne Login teilen sich Geschwister ein Gerät und damit einen Fortschritt. Mehrere Kinderprofile (Name oder Tier-Avatar, alles lokal gespeichert) lösen das.
- **Umgebung:** Lärm, keine Kopfhörer, wenig Akku. Jede Lektion sollte in 3–5 Minuten abschliessbar sein.

## 2. Lernziele explizit machen

Heute ist die App inhaltsgetrieben: Aus jeder Buchseite wird eine Lektion. Die Vorlesung betont, dass zuerst das Ziel stehen muss.

- **Feinziel pro Lektion** mit Inhalts-, Verhaltens- und Situationskomponente, z.B. «Das Kind unterscheidet بَ بُ بِ (Inhalt) beim Hören (Verhalten) in Wörtern aus der Geschichte (Situation).» Technisch ein Feld `goal` im Lektionstyp.
- **Alle drei Dimensionen abdecken:** kognitiv (lesen, unterscheiden), psychomotorisch (das Nachfahren deckt das bereits ab) und affektiv (Freude am Lesen, Werte aus den Geschichten).
- **Für das Kind sichtbar** als Kann-Sätze mit Symbol: «Ich kann ب lesen». Laut Hattie gehört das Kommunizieren von Erfolgskriterien zu den wirksamsten Faktoren.

## 3. Lektionsaufbau nach Roths Lernstufen

Von Roths sechs Stufen fehlen in der App heute die Schwierigkeit (Stufe 2) und die Übertragung (Stufe 6).

| Roth-Stufe | Heute in der App | Lücke |
| --- | --- | --- |
| 1 Motivation | Geschichte | – |
| 2 Schwierigkeit | fehlt | Kein echtes Problem zu Beginn |
| 3 Lösung | Laute hören, Silbenzug | Kaum Vormachen |
| 4 Tun | Wörter lesen | – |
| 5 Einüben | Leitner-Wiederholung | – |
| 6 Übertragung | fehlt weitgehend | Nur bekannte Wörter |

- **Stufe 2 ergänzen:** Nach der Geschichte zeigt die App ein Wort, das das Kind noch nicht lesen kann («Kannst du dieses Wort lesen? Am Ende der Einheit kannst du es!»). Das gibt der Einheit ein Ziel.
- **Vormachen nach Bandura:** Vor dem Nachfahren zeigt eine Animation die Strichfolge. Eine wiederkehrende Kinderfigur aus der Geschichte liest Wörter vor, bevor das Kind es selbst tut. Aufmerksamkeit und Behalten brauchen ein attraktives Modell.
- **Stufe 6 ergänzen:** Am Ende jeder Einheit eine Transferaufgabe mit neuen, nie gesehenen Wörtern aus bekannten Buchstaben. Metzger/Nüesch trennen Reproduktions- und Transferaufgaben; erst der Transfer zeigt, ob das Kind liest oder nur Wortbilder wiedererkennt.

## 4. Didaktische Reduktion: Gründlichkeit vor Vollständigkeit

179 Lektionen allein für Arabisch Teil 1 sind viel; wenn jede Buchseite zur Lektion wird, droht die Vollständigkeitsfalle (Lehner, Sorgalla).

- **Ein Feinziel pro Lektion** und prüfen, ob alle Lektionen wirklich nötig sind.
- **Grundlandschaft plus Tiefenbohrung:** Eine «Buchstabenlandkarte» als Überblick, auf der gelernte Buchstaben aufleuchten, dazu die vertieften Lektionen pro Buchstabe.
- **Elementarisierung:** Der Laut des Buchstabens ist der Schlüsselbegriff, alles andere baut darauf auf.

## 5. Visualisierung

Nach Raso bewirkt nicht die Visualisierung selbst Lernen, sondern ihre aktive Verarbeitung durch das Kind.

- **Bilder mit Aufgabe:** antippen, zuordnen, statt blosser Dekoration.
- **Sparsam und selbsterklärend:** weniger Emoji-Schmuck, dafür klare, kulturell passende Bilder. Die jemenitischen SVG-Illustrationen sind der richtige Weg; Emoji sind für Kinder im Jemen nicht immer eindeutig.
- **Buchstabenformen als Struktur:** Anfang, Mitte und Ende als zusammenhängende Grafik, nicht als einzelne Zeichen.

## 6. Kommunikation: Die Stimme der App ist die Lehrperson

- **Fragend-gelenktes Verfahren:** Für Lernende mit wenig Vorwissen empfiehlt Huwendiek kleinschrittige Führung mit grossen Hilfen. Das passt zur ersten Klasse.
- **Alle Anweisungen vorlesen:** Kinder, die noch nicht lesen können, verstehen geschriebene Aufgabenstellungen nicht. In der App prüfen.
- **Gute Fragen nach Dubs:** kurz, eindeutig, eine Frage pro Runde, keine Fragebatterien.

## 7. Feedback und Leistungsbeurteilung

Hier liegt der grösste Hebel: Heute wird eine falsche Antwort nur markiert, nicht erklärt.

- **Lernförderliches Fehlerfeedback (Hattie & Timperley):** Die App spielt den richtigen Laut vor und zeigt den Unterschied («Das war بُ, du suchst بِ – hör nochmal»). Fehler werden zur Lerngelegenheit.
- **Bezugsnormen:** nur individuell («Du kannst heute 3 Buchstaben mehr als letzte Woche») und kriterial («Du kannst ب»), nie sozial, also keine Ranglisten.
- **Gültigkeit:** Das Nachfahren kann Buchstaben, die sich nur durch Punkte unterscheiden (ح/ج, س/ص), nicht auseinanderhalten. Abhilfe: ein separater Schritt «Setze die Punkte».
- **Zuverlässigkeit:** Bei drei Antwortoptionen liegt die Ratewahrscheinlichkeit bei 33 %. Ein Buchstabe gilt erst nach mehreren richtigen Runden an verschiedenen Tagen als gemeistert.

## 8. Aktivität vertiefen (ICAP-Modell)

Chi & Wylie unterscheiden passiv, aktiv, konstruktiv und interaktiv. Die meisten Übungen sind heute aktiv (antippen); der Silbenzug ist bereits konstruktiv.

- **«Ich spreche nach»:** Das Kind nimmt sich auf und hört sich im Vergleich zum Modell. Funktioniert offline, ohne Spracherkennung.
- **Soziale Dimension (Illeris):** Aufgaben wie «Lies dieses Wort deiner Schwester vor» holen die Familie als Lernpartner ins Boot.

## Prioritäten

1. **Fehlerfeedback mit Erklärung** – grösste Wirkung bei kleinem Aufwand.
2. **Transferaufgabe am Ende jeder Einheit** – zeigt echtes Lesenkönnen.
3. **Feinziele pro Lektion** und Kann-Sätze für das Kind.
4. **Mehrere Kinderprofile** – praktisch nötig bei geteilten Handys.
5. **Vormachen** der Strichfolge vor dem Nachfahren.
