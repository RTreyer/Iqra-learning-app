# Kinderprofile: mehrere Kinder, ein Handy

Status: Konzept zur Besprechung im Team, noch nicht gebaut.

## Ausgangslage

Viele Familien haben ein Handy, aber vier, fünf oder mehr Kinder, die lernen. Heute speichert die App einen einzigen Fortschritt pro Handy: Lernt das zweite Kind, überschreibt es die Sterne und Lektionen des ersten. Jedes Kind soll seinen eigenen Fortschritt, sein eigenes Tempo und seine eigene Klasse haben. Ein älteres Kind soll Stoff der 1. oder 2. Klasse nachholen können.

## Entscheid: Profile nur auf dem Handy, keine Konten im Internet

Vorgeschlagen war ein Elternkonto mit E-Mail und Passwort und darunter ein Konto pro Kind. Ein solches Konto braucht einen Server. Das widerspricht dem Versprechen an die Familien:

| Elternkonto mit E-Mail | Profile auf dem Handy |
|---|---|
| E-Mail-Adressen jemenitischer Familien liegen auf einem Server, ein Ziel für Angreifer | keine Daten verlassen das Handy |
| App braucht die Internet-Berechtigung | App bleibt ohne jede Berechtigung ausser Vibration |
| ohne Netz keine Anmeldung | funktioniert immer, auch ohne Netz |
| Server, Passwort-Reset, Datenschutzerklärung «Daten werden erhoben», laufender Betrieb | nichts davon |
| viele Eltern haben keine oder nutzen keine E-Mail | keine Voraussetzung |

Darum: Profile werden nur auf dem Handy gespeichert, ohne E-Mail, Passwort und Server. Grenze: Geht das Handy verloren oder wird es zurückgesetzt, ist der Fortschritt weg (wie heute). Eine Sicherung ohne Server ist ein späterer Schritt (siehe unten).

## Abläufe

### Erster Start und Familien mit einem Kind

Nichts ändert sich. Beim ersten Start gibt es ein Profil, ohne dass jemand etwas einrichten muss. Solange es nur ein Profil gibt, erscheint keine Auswahl. Familien mit einem Kind merken von der Funktion nichts.

### Profil wählen (ab zwei Profilen)

- Beim Start erscheint ein Bildschirm mit einem grossen Bild pro Kind. Das Kind tippt auf sein Bild. Kein Lesen nötig.
- Hudhud fragt: «مَنْ يَتَعَلَّمُ الْيَوْمَ؟» (Wer lernt heute?).
- Jedes Bild gibt es nur einmal pro Handy, damit Geschwister sich nicht verwechseln.
- Der Name steht klein unter dem Bild, für die Eltern. Gesprochen wird er nicht (die Sprachausgabe spricht Namen oft falsch aus).
- In der Kopfzeile des Startbildschirms zeigt ein runder Knopf das Bild des aktiven Kindes. Antippen führt zurück zur Auswahl. Wechseln ist für Kinder frei, ohne Sperre.

### Elternecke

Die Elternecke (`app/parents.tsx`, heute hinter langem Drücken) bekommt einen Abschnitt «الأطفال»:

- **Kind hinzufügen:** Name (freiwillig) und Bild wählen. Höchstens 8 Profile.
- **Bearbeiten:** Name und Bild ändern.
- **Fortschritt ansehen:** die heutige Übersicht, pro Kind.
- **Fortschritt zurücksetzen:** pro Kind, mit Bestätigung, die den Namen bzw. das Bild des Kindes nennt.
- **Profil löschen:** mit derselben Bestätigung. Das letzte Profil lässt sich nicht löschen, nur zurücksetzen.

### Eltern-PIN (Vorschlag, offen)

Bei vier, fünf Kindern sind ältere Geschwister dabei, die das lange Drücken schnell herausfinden. Vorschlag: Eltern können in der Elternecke eine 4-stellige PIN einschalten. Sie wird nur auf dem Handy gespeichert (als Hash). Sie schützt vor Kindern, nicht vor Angreifern; dafür reicht sie.

## Was pro Kind gilt und was für das ganze Handy

| Pro Kind | Für das ganze Handy |
|---|---|
| Lektionen, Sterne, Sticker | Ton an/aus, Vibration an/aus (Schalter der Eltern) |
| Wiederholung des Tages (Leitner-Kästen) | Sprache der Oberfläche (Arabisch/Englisch) |
| Hudhuds Geschichte: erzählt ja/nein, erzählte Kapitel, Stand der Briefe und Stationen | Liste der Profile, aktives Profil, PIN |
| gewähltes Fach (`bookId`), also auch Klasse | |
| vorgemachte Beispiele schon gesehen | |

Jedes Kind hat Zugang zu jeder Klasse und jedem Fach. Die App sperrt heute nichts, das bleibt so. Für die erste Veröffentlichung gibt es nur Inhalte der 1. Klasse. Kommt die 2. Klasse dazu, steht sie jedem Kind sofort offen.

## Technik

### Speicher heute

| Schlüssel | Inhalt | Code |
|---|---|---|
| `@kidlearn_progress_v1` | Fortschritt (Schema v2) | `context/ProgressContext.tsx`, `lib/progressState.ts` |
| `@iqra_settings_v1` | Ton, Vibration, `introSeen`, `bookId`, `chaptersSeen` | `context/SettingsContext.tsx` |
| `@iqra_demo_seen_v1` | gesehene Beispiele | `hooks/useDemoSeen.ts` |
| `iqra_ui_language` | Sprache | `context/LanguageContext.tsx` |
| `@iqra_voice_hint_shown` | Hinweis zur Stimme gezeigt | `hooks/useVoiceHint.ts` |

Sticker und Geschichtsstand werden aus dem Fortschritt berechnet (`lib/stickers.ts`, `lib/storyProgress.ts`) und werden damit automatisch pro Kind getrennt.

### Speicher neu

- Neuer Schlüssel `@iqra_profiles_v1`: `{ profiles: [{ id, name, avatar, createdAt }], activeId, pinHash? }`.
- Fortschritt und die Kind-Einstellungen (`introSeen`, `bookId`, `chaptersSeen`, gesehene Beispiele) bekommen pro Profil einen eigenen Schlüssel, z. B. `@kidlearn_progress_v1:<id>`.
- `SettingsContext` wird geteilt: Ton und Vibration bleiben für das Handy, die drei Kind-Felder wandern in einen Kind-Speicher.
- `ProgressProvider` lädt den Fortschritt des aktiven Profils. Beim Wechsel wird der laufende Schreibvorgang abgeschlossen, dann das neue Profil geladen. Die bestehenden Sicherheitsregeln (nichts schreiben vor dem Lesen, defekte Daten sichern, eine Schreibkette) gelten pro Profil weiter.

### Übernahme beim Update (wichtigster Punkt)

Kein Kind darf beim Update seinen Fortschritt verlieren:

- Das erste Profil benutzt weiter die heutigen Schlüssel (`@kidlearn_progress_v1` usw.), ohne Kopieren. Damit kann bei der Übernahme nichts verloren gehen.
- Erst neue Profile bekommen neue Schlüssel.
- Tests: Update mit vorhandenem Fortschritt, Update mit defektem Fortschritt, Wechsel während eines Schreibvorgangs, Löschen eines Profils lässt die anderen unberührt.

### Bilder für die Profile

8 bis 12 Zeichnungen im Stil von `components/pictures/`, je auf einer farbigen Scheibe, z. B. Gazelle, Kamel, Katze, Bülbül, Schildkröte, Fisch, Dattelpalme, Mond. Gleiche kulturelle Regeln wie in SPIELWELT.md. Keine Gesichter echter Personen, keine Fotos.

## Schritte

1. Speicher pro Profil, Übernahme beim Update, Tests. Grösstes Risiko, darum zuerst.
2. Auswahl-Bildschirm und Knopf in der Kopfzeile.
3. Profilverwaltung in der Elternecke.
4. Eltern-PIN, falls beschlossen.
5. End-to-end-Test: zwei Kinder, je eine Lektion, Fortschritt bleibt getrennt.

Geschätzt einige Tage. Weil `SettingsContext`, `ProgressContext` und die Geschichte gerade weiterentwickelt werden, sollte nur eine Person gleichzeitig daran arbeiten.

## Später, nicht jetzt

- **Sicherung ohne Server:** Fortschritt eines Kindes als Datei exportieren oder per QR-Code auf ein anderes Handy übertragen.
- **Konten im Internet** (z. B. damit Lehrer den Fortschritt einer Klasse sehen) wären ein eigenes Projekt mit eigener Sicherheitsprüfung und nicht Teil der Familien-App.

## Offene Fragen

1. Eltern-PIN: immer, freiwillig oder gar nicht? Und was passiert bei vergessener PIN, ohne dass ein älteres Kind sie umgehen kann?
2. Höchstzahl der Profile: 8 genug?
3. Name Pflicht oder freiwillig? (Vorschlag: freiwillig, das Bild genügt.)
4. Ton und Vibration pro Kind oder für das Handy? (Vorschlag: für das Handy.)
5. Welche Bilder für die Profile? Vorschlag oben, Entscheid durch das Team bzw. den Owner.
6. Wer im Team baut es, und wann, ohne mit der Arbeit an der Geschichte zu kollidieren?
