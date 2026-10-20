// Erzeugt von werkzeuge/tui.py, nicht von Hand bearbeiten.
window.WF = {
	"stand": "2026-10-18",
	"repos": [
		{
			"name": "wiredframe-website",
			"url": "https://github.com/Wiredframe/wiredframe-website",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "HTML",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2024-01-31",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "homebrew-tap",
			"url": "https://github.com/Wiredframe/homebrew-tap",
			"beschreibung": "Homebrew tap for Wiredframe's macOS apps",
			"sprache": "Ruby",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-08-08",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "rectmangle",
			"url": "https://github.com/Wiredframe/rectmangle",
			"beschreibung": "Minimal macOS window manager modelled on Rectangle: keyboard shortcuts, no network access",
			"sprache": "Swift",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-10-18",
			"sterne": 0,
			"brew": "brew install --cask wiredframe/tap/rectmangle",
			"releases": [
				{
					"tag": "v1.2.0",
					"name": "Rectmangle 1.2.0",
					"datum": "2026-10-18",
					"notizen": "- New settings window (menu bar › Settings…, or launch the app again): record shortcuts by clicking a field and pressing the keys, with an icon per action, conflict check and Restore Defaults.\n- General tab for launch at login, menu bar icon, display options, almost maximize size and the larger/smaller step.\n- The config file stays the single source of truth and can still be edited by hand; the window writes it in a fixed layout and refuses to save while the file has a syntax error.\n- `open rectmangle://settings` opens the settings, `RECTMANGLE_CONFIG` points to another config file.\n- Fix: a shortcut on the key that types \"#\" can now be read back."
				},
				{
					"tag": "v1.1.0",
					"name": "Rectmangle 1.1.0",
					"datum": "2026-10-18",
					"notizen": "- App icon\n- The menu bar menu lists every action with its shortcut and runs it on click\n- \"Launch at Login\" and \"Hide Menu Bar Icon\" in the menu, both written to the config file\n- Launching the app again brings back a hidden menu bar icon\n- Menu in English and German, following the system language"
				},
				{
					"tag": "v1.0.3",
					"name": "Rectmangle 1.0.3",
					"datum": "2026-10-18",
					"notizen": "Docs, menu, messages and `--check` output are now in English. No functional changes.\n\nSigned with a Developer ID but not notarized: install with Homebrew (`brew install --cask wiredframe/tap/rectmangle`) or run `xattr -dr com.apple.quarantine Rectmangle.app` after unpacking."
				},
				{
					"tag": "v1.0.2",
					"name": "Rectmangle 1.0.2",
					"datum": "2026-10-18",
					"notizen": "Built for Apple Silicon only, Intel Macs are no longer supported. Otherwise unchanged from 1.0.1.\n\nSigned with a Developer ID but not notarized: install with Homebrew (`brew install --cask wiredframe/tap/rectmangle`) or run `xattr -dr com.apple.quarantine Rectmangle.app` after unpacking."
				},
				{
					"tag": "v1.0.1",
					"name": "Rectmangle 1.0.1",
					"datum": "2026-10-18",
					"notizen": "Bug fixes.\n\n- Pressing left or right half again only moves to a display that is actually beside the current one, not above or below it\n- If an app hangs, Rectmangle waits at most one second for its window\n- `almostMaximize` and `sizeStep` are clamped to sensible ranges\n- Saving a broken config several times no longer stacks error messages\n- The internal list of windows no longer grows without limit"
				},
				{
					"tag": "v1.0.0",
					"name": "Rectmangle 1.0.0",
					"datum": "2026-10-18",
					"notizen": "First release.\n\n- Arrange windows with keyboard shortcuts: halves, quarters, thirds, maximize, almost maximize, maximize height, larger, smaller, center, restore\n- Next and previous display; pressing left or right half again moves the window to the neighbouring display\n- Config as JSON in `~/.config/rectmangle/config.json`, reloaded on save, `--check` validates it\n- Actions can be triggered by URL: `open -g rectmangle://leftHalf`\n- No networking code, no license check, no updater\n- Universal (Apple Silicon and Intel), macOS 13+\n\nSigned with a Developer ID but not notarized: on first launch choose \"Open Anyway\" under Privacy & Security, or run `xattr -dr com.apple.quarantine ~/Applications/Rectmangle.app`. Then grant Accessibility access."
				}
			]
		},
		{
			"name": "dropme",
			"url": "https://github.com/Wiredframe/dropme",
			"beschreibung": "A small, private drop shelf for macOS, inspired by Dropover. No network, no telemetry.",
			"sprache": "Swift",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-10-18",
			"sterne": 0,
			"brew": "brew install --cask wiredframe/tap/dropme",
			"releases": [
				{
					"tag": "v1.1.0",
					"name": "DropMe 1.1.0",
					"datum": "2026-10-18",
					"notizen": "- New menu item \"Menüsymbol ausblenden\" hides the menu bar icon. Open DropMe again from the Finder (or `open -a DropMe`) to bring it back."
				},
				{
					"tag": "v1.0.2",
					"name": "DropMe 1.0.2",
					"datum": "2026-10-18",
					"notizen": "- Signed with a Developer ID (with secure timestamp and hardened runtime) instead of ad hoc\n- Apple Silicon only, no more Intel build\n- Not notarized yet: on first launch click “Open Anyway” under Privacy & Security, or run `xattr -dr com.apple.quarantine /Applications/DropMe.app`; Homebrew does this automatically"
				},
				{
					"tag": "v1.0.1",
					"name": "DropMe 1.0.1",
					"datum": "2026-10-18",
					"notizen": "Bug fixes:\n\n- Quick destinations with “=” in their name are stored correctly (new storage format, the old one is still read)\n- The action menu only checks the clipboard's types and no longer reads its contents, so macOS doesn't ask for access\n- Files deleted or moved elsewhere disappear from the shelf instead of failing when dragged or shared\n- Fixed a possible Quick Look crash when the list changes while the preview is open"
				},
				{
					"tag": "v1.0.0",
					"name": "DropMe 1.0.0",
					"datum": "2026-10-18",
					"notizen": "First release.\n\n- Hold Shift while dragging files to open the shelf; it goes away again if nothing is dropped\n- Action menu: Open With, Finder, Quick Look, Share (AirDrop, Mail, Messages, Notes …), Copy and Move to, quick destinations\n- Liquid Glass on macOS 26+, subtle animations, light and dark mode\n- No networking code, no telemetry\n- Universal (Apple Silicon and Intel), macOS 14+\n\nAd hoc signed only: on first launch click “Open Anyway” under Privacy & Security, or run `xattr -dr com.apple.quarantine /Applications/DropMe.app`."
				}
			]
		},
		{
			"name": "mittelklick",
			"url": "https://github.com/Wiredframe/mittelklick",
			"beschreibung": "Middle click on the macOS trackpad by tapping with three or four fingers, no network",
			"sprache": "Swift",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-10-18",
			"sterne": 0,
			"brew": "brew install --cask wiredframe/tap/mittelklick",
			"releases": [
				{
					"tag": "v1.0.2",
					"name": "Mittelklick 1.0.2",
					"datum": "2026-10-18",
					"notizen": "- Menu localized in English and German (follows the system language).\n- README, code comments and log messages in English.\n\nInstall: `brew install --cask wiredframe/tap/mittelklick`"
				},
				{
					"tag": "v1.0.1",
					"name": "Mittelklick 1.0.1",
					"datum": "2026-10-18",
					"notizen": "- No middle click right after a key press (palms while typing) or a left click. Only the time is queried, never which key.\n- Slightly slower taps (up to 400 ms) are recognized.\n- The first gesture after waking or connecting a trackpad is no longer lost.\n- \"Allow Accessibility …\" only opens System Settings instead of also showing the system prompt.\n- No global mouse monitor anymore."
				},
				{
					"tag": "v1.0.0",
					"name": "Mittelklick 1.0.0",
					"datum": "2026-10-18",
					"notizen": "First release: middle click by tapping the trackpad with three or four fingers, optionally Fn + left click. Menu bar app without network access, signed with a Developer ID (not notarized).\n\nInstall: `brew install --cask wiredframe/tap/mittelklick`"
				}
			]
		},
		{
			"name": "flow",
			"url": "https://github.com/Wiredframe/flow",
			"beschreibung": "A tiny, fast photo and video viewer for macOS: one folder, square grid, newest first, videos play in place.",
			"sprache": "Swift",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-10-15",
			"sterne": 0,
			"brew": "brew install --cask wiredframe/tap/flow",
			"releases": [
				{
					"tag": "v1.0.1",
					"name": "Flow 1.0.1",
					"datum": "2026-10-18",
					"notizen": "- Modern title bar: folder name and photo/video count shown on the left, the grid scrolls underneath it\n- The full path is still available by ⌘-clicking the title\n\nSigned with Developer ID, not notarized: on first launch right-click Flow.app and choose Open.\n\nSHA-256: 37bb436be61eb3ea16e488fc50d61466ccece7411566802ed5e093b7117e725d"
				},
				{
					"tag": "v1.0.0",
					"name": "Flow 1.0.0",
					"datum": "2026-10-15",
					"notizen": "First release.\n\n- Square grid of all photos and videos in a folder, newest first\n- Thumbnails cached on disk and pre-generated in the background; embedded camera previews shown until they are ready\n- Selected videos loop in their tile, with sound (M to mute), paused while hidden or minimized\n- Quick Look with Space or double-click, arrow keys keep working\n- File names can be hidden (⇧⌘N), tile size adjustable (⌘+ / ⌘−)\n- Watches the folder for new files without the grid jumping\n- Reopens the last folder and waits for a network drive to come back\n\nSigned with Developer ID, not notarized: on first launch right-click Flow.app and choose Open.\n\nSHA-256: 5b2ce1eb3e45d065d346a6d826dfb51143e2a9c362d1bd9f61c2576e7c310df7"
				}
			]
		},
		{
			"name": "los",
			"url": "https://github.com/Wiredframe/los",
			"beschreibung": "A tiny launcher for everything you installed in the terminal. Los means go!",
			"sprache": "Shell",
			"geaendert": "2026-10-18",
			"monat": "Oktober 2026",
			"erstellt": "2026-09-24",
			"sterne": 0,
			"brew": "brew install wiredframe/tap/los",
			"releases": [
				{
					"tag": "v1.1.1",
					"name": "los 1.1.1",
					"datum": "2026-10-18",
					"notizen": "List and preview now split the width evenly. The preview moves below the list only when it would get narrower than 50 columns (terminals under about 100). Category and name columns fit their longest entry, long names are cut at 20 characters so more of the description stays visible."
				},
				{
					"tag": "v1.1.0",
					"name": "los 1.1.0",
					"datum": "2026-10-18",
					"notizen": "Scripts one subfolder deep (`~/Scripts/tool/tool.sh`) now show up. A script that is not on your PATH is picked as `cd <its folder> && ./script`, so it finds its helper files. Your own scripts preview their header instead of the tldr or man page of a namesake. In terminals narrower than 100 columns the preview moves below the list, and `Ctrl-/` toggles it."
				},
				{
					"tag": "v1.0.1",
					"name": "los 1.0.1",
					"datum": "2026-09-25",
					"notizen": "Category and name stay visible while you filter (the list no longer scrolls sideways to the match). The README now has a demo GIF."
				},
				{
					"tag": "v1.0.0",
					"name": "los 1.0.0",
					"datum": "2026-09-24",
					"notizen": "First release. A tiny fzf launcher that finds everything you installed with Homebrew plus your own scripts, describes and categorizes it automatically. No catalog to maintain.\n\nInstall:\n```sh\nbrew install fzf jq tlrc\ncurl -fsSL https://raw.githubusercontent.com/Wiredframe/los/main/los -o ~/.local/bin/los && chmod +x ~/.local/bin/los\necho 'eval \"$(los --init zsh)\"' >> ~/.zshrc\n```"
				}
			]
		},
		{
			"name": "kontor-buchhaltung",
			"url": "https://github.com/Wiredframe/kontor-buchhaltung",
			"beschreibung": "Lokale Buchhaltungs-App (SwiftUI + SwiftData) für Freelancer – EÜR, UStVA, KSK, MCP-Server",
			"sprache": "Swift",
			"geaendert": "2026-10-06",
			"monat": "Oktober 2026",
			"erstellt": "2026-07-10",
			"sterne": 1,
			"brew": "brew install --cask wiredframe/tap/kontor",
			"releases": [
				{
					"tag": "v3.2.12",
					"name": "Kontor 3.2.12",
					"datum": "2026-09-25",
					"notizen": "Kontor 3.2.12 – kostenlos & quelloffen.\n\n## KSK-Monatswerte über den MCP-Server setzen\n\nDie KSK-Beiträge (KV, RV, PV) und das voraussichtliche Jahresarbeitseinkommen\nließen sich per MCP bisher nur lesen. `kontor_aktualisieren` nimmt jetzt\n`typ: ksk` an, adressiert wie die Jahres-Einstellungen ohne id über `jahr` und\n`monat`:\n\n```json\n{ \"typ\": \"ksk\", \"jahr\": 2026, \"monat\": 10,\n  \"felder\": { \"rv\": 271.25, \"kv\": 252.15, \"pv\": 70, \"jae\": 35000 } }\n```\n\n- Die Werte gelten ab diesem Monat, Folgemonate ohne eigene Werte erben sie,\n  genau wie beim Bearbeiten im Monatsabschluss.\n- `zuruecksetzen: true` entfernt die eigenen Werte des Monats, er erbt dann\n  wieder vom Vormonat.\n- Abgeschlossene Monate sind gesperrt, wie in der App.\n- Ungültige Beträge werden abgewiesen, bevor etwas geschrieben wird. Vor dem\n  ersten Schreibzugriff legt Kontor wie immer ein Backup an."
				},
				{
					"tag": "v3.2.11",
					"name": "Kontor 3.2.11",
					"datum": "2026-09-17",
					"notizen": "Kontor 3.2.11 – kostenlos & quelloffen.\n\n## Tabellenfokus repariert\n\nEin Klick in eine Tabelle wählte die Zeile zwar aus, ließ sie aber grau statt\nblau, und die Pfeiltasten wirkten nicht. Mal ging es, mal nicht, und nach jedem\nModulwechsel begann es von vorn.\n\nUrsache ist nicht Kontor, sondern SwiftUI auf macOS 26/27: Eine `Table` (und die\nSidebar-`List`) wird durch den Klick nicht mehr zum First Responder. Das ließ\nsich mit einer leeren Minimal-App reproduzieren. Der bestehende Klick-Monitor\n`FokusAbgabe` reicht den Fokus deshalb jetzt nach jedem Klick in eine Tabelle\nselbst an sie weiter, außer er liegt schon darin (Zelle, Feldeditor).\n\n## Inspector gleich breit\n\nDie rechte Seitenleiste startet in allen Modulen mit derselben, schmalen Breite\n(280 pt) statt sechs verschiedener Werte je Ansicht; breiter ziehen geht wie\ngehabt.\n\nInstallation siehe README (nicht notarisiert)."
				},
				{
					"tag": "v3.2.10",
					"name": "Kontor 3.2.10",
					"datum": "2026-09-15",
					"notizen": "Kontor 3.2.10 – kostenlos & quelloffen.\n\n## Ruhigere Hinweise\n\nDie Hinweise unter der Titelleiste – „Monat abgeschlossen\", „für dieses Jahr\nsind keine Einstellungen hinterlegt\" – zogen sich als vollflächig grün oder\norange eingefärbte Bahn über die ganze Fensterbreite. In der aufgeräumten\nKopfzeile erschlug das alles andere.\n\nSie folgen jetzt dem Hinweis, den es dort schon gab („liegt in der Zukunft\"):\nein abgerundeter, neutral grauer Kasten. **Die Farbe trägt allein das\nSymbol** – grünes Siegel oder oranges Warndreieck. Das genügt, um die Fälle\nzu unterscheiden, ohne die halbe Seite einzufärben.\n\nDazu weniger Luft in diesem Bereich, alle Hinweise stehen beieinander, und\ndie Trennlinie darunter ist verschwunden.\n\nGilt im Monatsabschluss und auf allen fünf Jahresabschluss-Seiten.\n\nInstallation siehe README (nicht notarisiert)."
				},
				{
					"tag": "v3.2.9",
					"name": "Kontor 3.2.9",
					"datum": "2026-09-15",
					"notizen": "Kontor 3.2.9 – kostenlos & quelloffen.\n\n## Ausgaben im Jahresverlauf\n\nDer Umschalter über dem Monats-Chart der Übersicht hat eine vierte Kennzahl:\nneben **Gewinn**, **Frei** und **Rücklage** jetzt auch **Ausgaben**. Damit\nsieht man auf einen Blick, wie hoch die betrieblichen Ausgaben Monat für\nMonat liegen, statt sie nur indirekt über den Gewinn abzulesen.\n\nGezeigt werden die Ausgaben **netto** – also genau die Zahl, die vom Umsatz\nabgezogen den Gewinn ergibt, und die auch in der EÜR steht. Eine Ausgabe über\n1.190 € brutto erscheint entsprechend als 1.000 €; die Vorsteuer ist ein\ndurchlaufender Posten.\n\nInstallation siehe README (nicht notarisiert)."
				},
				{
					"tag": "v3.2.8",
					"name": "Kontor 3.2.8",
					"datum": "2026-09-15",
					"notizen": "Kontor 3.2.8 – kostenlos & quelloffen.\n\nNachbesserung zu 3.2.7: zwei sichtbare Fehler in der neuen Titelleiste.\n\n- Das Chevron der Zeitraum-Auswahl stand **links** vom Datum („⌄ September\n  2026\") statt rechts.\n- Der Schalter für die rechte Seitenleiste teilte sich weiter eine Kapsel mit\n  den Aktionsknöpfen, statt abgesetzt zu stehen.\n\nDazu die Feinarbeit aus 3.2.7, die dort schon gedacht, aber nicht sichtbar\nwar: feste Mindestbreite für die Zeitraum-Beschriftung, damit die Pfeile\nbeim Wechsel zwischen „September 2026\" und „Q3 2026\" nicht mehr wandern,\nund größere Pfeilknöpfe.\n\n**Wer 3.2.7 installiert hat, sollte auf 3.2.8 wechseln** – der Rest ist\nidentisch. Die Änderungen von 3.2.7 im Überblick:\n\n## Aufgeräumte Kopfleisten\n\nZeitraum, Filter und Aktionen sitzen in der Fenster-Titelleiste statt in\ngestapelten Leisten über der Tabelle. Die Ausgaben-View hatte davon drei\nübereinander, jetzt ist es eine Zeile. Der Zeitraum ist ein einziges\nElement: `‹ September 2026 ⌄ ›`, die Pfeile springen in der Granularität\ndes gewählten Zeitraums.\n\n**Neu: Quartal als Zeitraum**, auch für den Rhythmus der UStVA.\n\n## Schmalere Fenster\n\n| Modul | vorher | jetzt |\n|---|---|---|\n| Ausgaben | 1135 pt | 888 pt |\n| Aufgaben | 1145 pt | 810 pt |\n| Einnahmen | 1145 pt | 946 pt |\n| UStVA | 702 pt | 462 pt |\n\n## Flüssigeres Arbeiten\n\nDie Jahresansicht des Monatsabschlusses rechnete beim Ziehen am Fensterrand\nihre zwölf Monatsauswertungen pro Bild neu durch. Einnahmen filterten ihre\nListe fünfmal je Durchlauf, die UStVA rechnete ihr Ergebnis zwanzigmal.\n\n## Behoben\n\nKlick ins Leere gibt den Tastaturfokus wieder ab.\n\nInstallation siehe README (nicht notarisiert)."
				},
				{
					"tag": "v3.2.7",
					"name": "Kontor 3.2.7",
					"datum": "2026-09-15",
					"notizen": "Kontor 3.2.7 – kostenlos & quelloffen.\n\n## Aufgeräumte Kopfleisten\n\nZeitraum, Filter und Aktionen sitzen jetzt in der Fenster-Titelleiste statt in\ngestapelten Leisten über der Tabelle. Die Ausgaben-View hatte davon drei\nübereinander, jetzt ist es eine Zeile.\n\nDer Zeitraum ist ein einziges Element: `‹ September 2026 ⌄ ›`. Die Pfeile\nspringen in der Granularität des gewählten Zeitraums, das Menü bietet\nDieser/Letzter Monat, Dieses/Letztes Quartal, Dieses/Letztes Jahr und Gesamt.\n\n**Neu: Quartal als Zeitraum.** Tabellen lassen sich damit quartalsweise\nfiltern, und die UStVA nutzt es für den Rhythmus der Voranmeldung – statt\ndafür einen zweiten, eigenen Zustand zu führen.\n\nDer Monatsabschluss hatte einen Monat/Jahr-Umschalter **und** einen\nZeitraum-Wähler, die widersprüchlich stehen konnten. Beide zeigen jetzt\ndasselbe an.\n\n## Schmalere Fenster, keine Abstürze\n\nAlle Module lassen sich deutlich schmaler ziehen, weil Toolbar-Elemente\nanders als Steuerelemente im Inhalt keine Fenster-Mindestbreite erzwingen:\n\n| Modul | vorher | jetzt |\n|---|---|---|\n| Ausgaben | 1135 pt | 888 pt |\n| Aufgaben | 1145 pt | 810 pt |\n| Einnahmen | 1145 pt | 946 pt |\n| UStVA | 702 pt | 462 pt |\n| Lebensmittel / Einkäufe | 1115 pt | 896 pt |\n\nVerifiziert über ein Breitenraster von 650 bis 1350 pt mit Modulwechsel bei\njeder Breite.\n\n## Flüssigeres Arbeiten\n\n- Die Jahresansicht des Monatsabschlusses rechnete beim Ziehen am Fensterrand\n  ihre zwölf Monatsauswertungen pro Bild neu durch. Jetzt nur noch bei\n  Datenänderung.\n- Einnahmen filterten ihre Liste fünfmal je Durchlauf, die UStVA rechnete ihr\n  Ergebnis zwanzigmal, der Ausgaben-Ledger baute sich dreimal auf.\n- Beträge werden nicht mehr bei jedem Einzelwert neu formatiert.\n\n## Behoben\n\n- Klick ins Leere gibt den Tastaturfokus wieder ab. Vorher blieb der Cursor im\n  Such- oder Eingabefeld, auch wenn man längst woanders hingeklickt hatte.\n\nInstallation siehe README (nicht notarisiert)."
				},
				{
					"tag": "v3.2.6",
					"name": "Kontor 3.2.6",
					"datum": "2026-09-14",
					"notizen": "Stabilitäts-Release für macOS 26 und 27.\n\n## Kein Absturz mehr beim Modulwechsel\n\nAuf macOS 26/27 konnte Kontor beim Wechsel in den Monatsabschluss oder den Jahresabschluss abstürzen: nicht jedes Mal, aber reproduzierbar bei mittelgroßen Fenstern.\n\nUrsache waren die Mindestbreiten der Kopf- und Filterleisten. Segmentierte Umschalter und Knöpfe mit Text lassen sich nicht stauchen, ihre Beschriftungsbreite geht 1:1 in die Mindestbreite des Fensters ein. Zusammen mit Seitenleiste, Tabellenspalten und Inspector kam die Ausgaben-Ansicht auf 1648 pt und damit auf mehr, als ein 14\"-Bildschirm breit ist. Musste das Fenster beim Modulwechsel wachsen, schaukelten sich die Größen-Constraints der Hosting-View und das AppKit-Layout auf, bis AppKit den Vorgang mit einer Exception abbrach und die App beendete. Früher war das eine stille Warnung, seit macOS 26 ist es ein Absturz.\n\n- Jede Kopf- und Filterleiste hat jetzt eine kompakte Stufe: segmentierte Umschalter werden zu Menüs, „September\" wird „Sept.\", Knöpfe mit Text werden Symbolknöpfe.\n- Mindestbreiten: Ausgaben 1648 → 1135 pt, Monatsabschluss 1329 → 1148 pt, Einnahmen 1321 → 1145 pt, Lebensmittel und Anschaffungen 1291 → 1115 pt.\n- In voller Fensterbreite ist die Darstellung unverändert, die kompakte Stufe greift erst, wenn der Platz wirklich fehlt.\n\nVerifiziert am reproduzierten Absturz (schmales Fenster, dann reihum durch alle Module): vorher 4 von 9 Läufen über das Breitenraster 650–1350 pt abgestürzt, danach keiner. 326 Tests grün.\n\n## Ausgabenfilter sprengt nicht mehr das Fenster\n\nDerselbe Punkt von der sichtbaren Seite: Die Bereichswahl in den Ausgaben (Alle · Betriebsausgaben · Fixkosten · Subscriptions · Vorsorge · Steuern) zog das Fenster breiter als den Bildschirm. Reicht der Platz nicht, wird daraus jetzt ein Menü.\n\n---\n\nKostenlos und quelloffen. Installation siehe README, die App ist ad-hoc signiert und nicht notarisiert."
				},
				{
					"tag": "v3.2.5",
					"name": "Kontor 3.2.5",
					"datum": "2026-08-24",
					"notizen": "Korrekturen an der KZ-21-Erweiterung aus 3.2.4, gemessen an einer echten Voranmeldung.\n\n## Zahllast deckt sich jetzt mit ELSTER\n\nDas Formular nimmt **Bemessungsgrundlagen nur in vollen Euro** entgegen, Cent bleiben unberücksichtigt. Kontor zeigte sie mit Cent und rechnete die Umsatzsteuer daraus, ELSTER dagegen aus dem gekürzten Wert. Schon 75 Cent Bemessungsdifferenz verschoben die Zahllast um 14 Cent.\n\n- KZ 81, 86, 21, 45 und 84 werden auf volle Euro gekürzt, die USt aus dem gekürzten Wert gerechnet.\n- **Steuerbeträge** (KZ 85, 66, 67) behalten ihre Cent, sie sind eigene Eingabefelder. KZ 85 wird insbesondere nicht aus dem gekürzten KZ 84 neu gerechnet.\n- Gekürzt wird die Summe je Steuersatz, nicht der einzelne Beleg: 3 × 10,90 € ergeben 32 €, nicht 30 €.\n- Gekürzt wird Richtung Null. Ein negatives KZ 21 nach einer §17-Berichtigung verliert dadurch seine Cent, statt betragsmäßig zu wachsen.\n\n## Zusammenfassende Meldung\n\n- Die Summe war fest mit „= KZ 21\" beschriftet. Fehlt einem Umsatz die USt-IdNr., ist er nicht meldbar und fällt aus der Summe: die Beschriftung behauptete die Gleichheit also ausgerechnet dort, wo sie nicht mehr gilt. Jetzt wird jede Lücke mit Betrag ausgewiesen, und das Label sagt nur „= KZ 21\", wenn es stimmt.\n- ZM-Beträge ebenfalls in vollen Euro, dort aber je Zeile gekürzt. Die dadurch mögliche Differenz zu KZ 21 wird erklärt statt versteckt.\n- Die Erklärung bei KZ 21 ist kürzer und sagt direkt, dass derselbe Umsatz zusätzlich in die Zusammenfassende Meldung muss. Die beiden ersetzen einander nicht: § 18b verlangt die Angabe in der Voranmeldung, § 18a die Meldung ans BZSt.\n\n## Sonstiges\n\nFett ausgezeichnete Stellen in den Erklärtexten wurden als Sternchen dargestellt. SwiftUI parst Markdown nur bei String-Literalen, nicht bei zur Laufzeit zusammengesetzten Texten.\n\n---\n\nKostenlos und quelloffen. Installation siehe README, die App ist ad-hoc signiert und nicht notarisiert."
				},
				{
					"tag": "v3.2.4",
					"name": "Kontor 3.2.4",
					"datum": "2026-08-24",
					"notizen": "Kunden im EU-Ausland: Kontor kennt jetzt den Übergang der Steuerschuld.\n\n## Neu\n\n**Umsatzart je Rechnung.** Eine Ausgangsrechnung ist entweder ein steuerpflichtiger Inlandsumsatz, eine sonstige Leistung an einen Unternehmer im EU-Ausland (§3a Abs. 2 UStG, Reverse Charge) oder ein nicht steuerbarer Drittlandsumsatz. Dazu ein Feld für die USt-IdNr. des Kunden. Bisher ließ sich ein EU-Auftrag nur als Inlandsrechnung mit „USt 0,00\" erfassen: die Zahllast stimmte damit zwar, aber KZ 21 und die Zusammenfassende Meldung fehlten ersatzlos.\n\n**KZ 21 und KZ 45 in der UStVA.** Beide sind reine Meldekennzahlen und gehen bewusst nicht in die Zahllast ein: nicht steuerbare Umsätze werden gemeldet, nicht besteuert.\n\n**Zusammenfassende Meldung.** Eigenes Panel in der UStVA-Ansicht, je USt-IdNr. eine Zeile. Es rechnet immer aufs Quartal, auch in der Monatsansicht: Meldezeitraum ist nach §18a Abs. 2 UStG das Kalendervierteljahr, unabhängig vom Voranmeldungs-Rhythmus. Rechnungen ohne USt-IdNr. werden separat ausgewiesen statt mitsummiert. Auf Knopfdruck legt Kontor die Quartalsaufgabe zum 25. an.\n\n## Details\n\n- Bei nicht steuerbaren Umsätzen blendet der Editor Steuersatz und USt-Felder aus, statt sie nur zu sperren.\n- Beim Umschalten auf Reverse Charge wird eine stehengebliebene USt gelöscht, auch über den MCP-Schreibpfad. Sonst liefe sie weiter in Rücklage und Voranmeldung.\n- Ein Forderungsausfall (§17) mindert KZ 21 und die Meldung spiegelbildlich im Ausfallquartal.\n- Bestandsrechnungen bleiben unangetastet: Wer einen EU-Umsatz bisher als Inlandsrechnung mit USt 0,00 erfasst hat, findet ihn unverändert vor. Er rutscht nicht rückwirkend mit 19 % in KZ 81, ist aber per Hand auf die neue Umsatzart umzustellen.\n- Umsatzart und USt-IdNr. sind in Backup, MCP-CSV und der Duplizieren-Funktion enthalten.\n\nDie Gültigkeit einer USt-IdNr. prüft Kontor nicht: Die qualifizierte Bestätigungsabfrage beim BZSt braucht Netz, und die App bleibt offline.\n\n---\n\nKostenlos und quelloffen. Installation siehe README, die App ist ad-hoc signiert und nicht notarisiert."
				},
				{
					"tag": "v3.2.3",
					"name": "Kontor 3.2.3",
					"datum": "2026-08-21",
					"notizen": "Kleines Hotfix-Release. Kostenlos & quelloffen; das ZIP ist ad-hoc signiert, **nicht notarisiert** (Installation siehe README).\n\n## Start im aktuellen Monat\n\nKontor öffnet den Zeitraum-Filter jetzt auf dem laufenden Monat statt auf „Alle\". Einnahmen, Ausgaben, Lebensmittel, Anschaffungen und Aufgaben zeigen beim Start also direkt den Monat, in dem man arbeitet, statt der kompletten Historie, die man erst wegfiltern musste.\n\nJahr und Monat standen intern ohnehin schon auf heute, nur der Modus zog nicht nach. Umschalter (Alle/Jahr/Monat), der „Heute\"-Knopf und die Querlinks aus Monats- und Jahresabschluss bleiben unverändert, und eine geänderte Auswahl hält weiterhin für die ganze Sitzung.\n\nHinweis: Der Zeitraum ist bewusst einer für alle Tabellen. Da die Aufgabenliste daran hängt, sind überfällige Aufgaben aus Vormonaten beim Start ausgeblendet, bis man auf „Alle\" oder „Jahr\" schaltet.\n\nVier neue Tests auf den Start-Zustand des Filters, 303 Tests insgesamt grün."
				}
			]
		},
		{
			"name": "kontor-landingpage",
			"url": "https://github.com/Wiredframe/kontor-landingpage",
			"beschreibung": "Landingpage für Kontor – die native macOS-Buchhaltungs-App für KSK-versicherte Freiberufler (EÜR, UStVA, KSK, Rücklagen, lokal auf dem Mac).",
			"sprache": "HTML",
			"geaendert": "2026-10-02",
			"monat": "Oktober 2026",
			"erstellt": "2026-06-30",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "reminders-cli",
			"url": "https://github.com/Wiredframe/reminders-cli",
			"beschreibung": "A simple CLI for interacting with macOS reminders",
			"sprache": "",
			"geaendert": "2026-09-24",
			"monat": "September 2026",
			"erstellt": "2026-09-24",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "paper-comic-reader",
			"url": "https://github.com/Wiredframe/paper-comic-reader",
			"beschreibung": "Paper Comic Reader — a focused iOS comic reader",
			"sprache": "Swift",
			"geaendert": "2026-09-23",
			"monat": "September 2026",
			"erstellt": "2026-07-10",
			"sterne": 3,
			"brew": "",
			"releases": [
				{
					"tag": "v1.4.1",
					"name": "v1.4.1",
					"datum": "2026-09-23",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Group Settings by appearance, page turning, portrait and landscape\n- Read portrait as one page strip and hand over to spreads on rotation\n- Add a portrait strip reading mode\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.4.0...v1.4.1"
				},
				{
					"tag": "v1.4.0",
					"name": "v1.4.0",
					"datum": "2026-09-22",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n**Notes for this build:** the Recent Comic widget in this sideload build offers the Small size only; Extra Large Portrait needs the iOS 27 SDK, which this release runner doesn't have yet (the App Store build includes it). The widget also relies on an App Group; if your sideloading tool drops it when re-signing, the widget stays empty.\n\n\n- Build the widget with the iOS 26 SDK too\n- Extract UI strings on every build so the catalogs stay in sync\n- Localize into German and Italian; steady the widget's way in\n- Add a Recent Comic home-screen widget\n- Open portrait pages at fit-height, on request\n- Let the pinch read the slot instead of the fit's name\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.16...v1.4.0"
				},
				{
					"tag": "v1.3.16",
					"name": "v1.3.16",
					"datum": "2026-08-21",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Replace the reader's free pinch zoom with a fit ladder\n- Turn the reader sideways from its own toolbar\n- Retune the settings a fresh install starts with\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.15...v1.3.16"
				},
				{
					"tag": "v1.3.15",
					"name": "v1.3.15",
					"datum": "2026-08-13",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Show and cancel downloads from every listing\n- Carry the double-page zoom across page turns\n- Fold Shuffle into the library menu on iPad\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.14...v1.3.15"
				},
				{
					"tag": "v1.3.14",
					"name": "v1.3.14",
					"datum": "2026-08-10",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Let the reader rotate on the first open after a download\n- Build the paper kernel as a stitchable Core Image function\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.13...v1.3.14"
				},
				{
					"tag": "v1.3.13",
					"name": "v1.3.13",
					"datum": "2026-07-30",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Drive both file pickers in Settings from one importer\n- Export and import the whole library as one file\n- Recognise a folder comic on manual import, and reset the open count\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.12...v1.3.13"
				},
				{
					"tag": "v1.3.12",
					"name": "v1.3.12",
					"datum": "2026-07-28",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Lay two facing pages out as one shape when their scans differ by a hair\n- Add an optional hairline gap between the halves of a double page\n- Keep a zoomed spread from panning past its own edges\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.11...v1.3.12"
				},
				{
					"tag": "v1.3.11",
					"name": "v1.3.11",
					"datum": "2026-07-27",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Assign a bookmark to a story from its comic's index\n- Rest zoomed pages against the screen edges instead of centring them\n- Mark comics as favorites and filter the library by them\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.10...v1.3.11"
				},
				{
					"tag": "v1.3.10",
					"name": "v1.3.10",
					"datum": "2026-07-26",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Add reader pinch-to-zoom and shrink the page-turn tap zones to 10%\n- Search comics by their characters, not just titles and stories\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.9...v1.3.10"
				},
				{
					"tag": "v1.3.9",
					"name": "v1.3.9",
					"datum": "2026-07-24",
					"notizen": "Unsigned `.ipa` for sideloading (AltStore / Sideloadly / TrollStore).\n\n**Requires iOS 26 or later.** On anything older the install fails with an unhelpful error rather than saying why.\n\niOS can't install this directly — see the README for how to sideload it and re-sign it with your own Apple ID.\n\n### What changed\n\n- Shuffle highlights a comic in the grid and list instead of opening it\n- Auto-hide reader controls after 2s and fix forced-landscape drift\n- Re-read folder metadata in Settings, confirm folder removal\n- Step the paper effect sliders in 5% notches\n\n**Full Changelog**: https://github.com/Wiredframe/paper-comic-reader/compare/v1.3.8...v1.3.9"
				}
			]
		},
		{
			"name": "ricoh-sp150-macos-tahoe",
			"url": "https://github.com/Wiredframe/ricoh-sp150-macos-tahoe",
			"beschreibung": "Get the Ricoh SP 150 (USB, host based) printing again on macOS 26 Tahoe using only Apple CoreGraphics. No Ghostscript, no print server.",
			"sprache": "C",
			"geaendert": "2026-09-17",
			"monat": "September 2026",
			"erstellt": "2026-07-28",
			"sterne": 1,
			"brew": "",
			"releases": []
		},
		{
			"name": "Simple-Comic",
			"url": "https://github.com/Wiredframe/Simple-Comic",
			"beschreibung": "macOS comic viewer",
			"sprache": "Objective-C",
			"geaendert": "2026-09-07",
			"monat": "September 2026",
			"erstellt": "2026-07-06",
			"sterne": 0,
			"brew": "brew install --cask wiredframe/tap/simple-comic-paper",
			"releases": [
				{
					"tag": "v2.0.3",
					"name": "Simple Comic 2.0.3",
					"datum": "2026-08-08",
					"notizen": "## Install\n\n```\nbrew tap wiredframe/tap\nbrew trust --cask wiredframe/tap/simple-comic-paper\nbrew install --cask simple-comic-paper\n```\n\nOr download the zip below and move `Simple Comic.app` into `/Applications`.\n\nThe app is signed but not notarised. The cask clears the quarantine flag for you;\nafter a manual download, open it once via right-click → **Open**, or clear it:\n`xattr -dr com.apple.quarantine \"/Applications/Simple Comic.app\"`\n\nSHA-256: `f24eb6a5f1d5f12a95f4e1bef04a8981ff729808d9b03826d5323661a4f1e622`"
				},
				{
					"tag": "v2.0.2",
					"name": "Simple Comic 2.0.2",
					"datum": "2026-08-08",
					"notizen": "## Install\n\n```\nbrew tap wiredframe/tap\nbrew trust --cask wiredframe/tap/simple-comic-paper\nbrew install --cask simple-comic-paper\n```\n\nOr download the zip below and move `Simple Comic.app` into `/Applications`.\n\nThe app is signed but not notarised. The cask clears the quarantine flag for you;\nafter a manual download, open it once via right-click → **Open**, or clear it:\n`xattr -dr com.apple.quarantine \"/Applications/Simple Comic.app\"`\n\nSHA-256: `ff2d96f1037c88581659af5638247f1201af0ce8354d45af3899e0fbccef9065`"
				},
				{
					"tag": "v2.0.1",
					"name": "Simple Comic 2.0.1",
					"datum": "2026-08-08",
					"notizen": "## Install\n\n```\nbrew tap wiredframe/tap\nbrew install --cask wiredframe/tap/simple-comic\n```\n\nOr download the zip below and move `Simple Comic.app` into `/Applications`.\n\nThe app is signed but not notarised. The cask clears the quarantine flag for you;\nafter a manual download, open it once via right-click → **Open**, or clear it:\n`xattr -dr com.apple.quarantine \"/Applications/Simple Comic.app\"`\n\nSHA-256: `f1c2feaa2e488ee6eaedaf8f2e55afc896c69bb6eca2bf41b4b88fff788aacac`"
				},
				{
					"tag": "v2.0.0",
					"name": "Simple Comic 2.0.0",
					"datum": "2026-08-08",
					"notizen": "## Install\n\n```\nbrew tap wiredframe/tap\nbrew install --cask wiredframe/tap/simple-comic\n```\n\nOr download the zip below and move `Simple Comic.app` into `/Applications`.\n\nThe app is signed but not notarised. The cask clears the quarantine flag for you;\nafter a manual download, open it once via right-click → **Open**, or clear it:\n`xattr -dr com.apple.quarantine \"/Applications/Simple Comic.app\"`\n\nSHA-256: `b0fe8c80e58351e5391393de66fd74c957c0c912a90e0e3218d1a7a069af9383`"
				}
			]
		},
		{
			"name": "vscode-live-inspect",
			"url": "https://github.com/Wiredframe/vscode-live-inspect",
			"beschreibung": "Faithful HTML live preview for VS Code with click to source, inspect outline, and lightweight in place editing",
			"sprache": "TypeScript",
			"geaendert": "2026-07-30",
			"monat": "Juli 2026",
			"erstellt": "2026-07-29",
			"sterne": 0,
			"brew": "",
			"releases": [
				{
					"tag": "v0.2.4",
					"name": "v0.2.4",
					"datum": "2026-07-30",
					"notizen": "Faithful HTML live preview mit Klick-zu-Quelltext, Inspect-Outline und leichtem Frontend-Editing.\n\nInstallation:\n```\ncode --install-extension live-inspect-0.2.4.vsix\n```\n\nDetails siehe CHANGELOG.md."
				}
			]
		},
		{
			"name": "paper-comic-reader-landingpage",
			"url": "https://github.com/Wiredframe/paper-comic-reader-landingpage",
			"beschreibung": "Landing page for Paper Comic Reader — a lean, native iPhone & iPad comic reader that makes pages read like ink on paper.",
			"sprache": "HTML",
			"geaendert": "2026-07-26",
			"monat": "Juli 2026",
			"erstellt": "2026-07-17",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "basquiat",
			"url": "https://github.com/Wiredframe/basquiat",
			"beschreibung": "Agents for Figma design files",
			"sprache": "",
			"geaendert": "2026-03-04",
			"monat": "März 2026",
			"erstellt": "2026-03-15",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "Figma-to-Code",
			"url": "https://github.com/Wiredframe/Figma-to-Code",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "JavaScript",
			"geaendert": "2026-02-04",
			"monat": "Februar 2026",
			"erstellt": "2026-01-29",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "convert-figma-variables2css-output",
			"url": "https://github.com/Wiredframe/convert-figma-variables2css-output",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "CSS",
			"geaendert": "2024-08-28",
			"monat": "August 2024",
			"erstellt": "2024-08-28",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "Responsive-Replacer-Dynamic",
			"url": "https://github.com/Wiredframe/Responsive-Replacer-Dynamic",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "TypeScript",
			"geaendert": "2023-06-27",
			"monat": "Juni 2023",
			"erstellt": "2023-06-27",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "Responsive-Replacer-Static",
			"url": "https://github.com/Wiredframe/Responsive-Replacer-Static",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "TypeScript",
			"geaendert": "2023-06-27",
			"monat": "Juni 2023",
			"erstellt": "2023-06-27",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "Responsive-Replacer-Text",
			"url": "https://github.com/Wiredframe/Responsive-Replacer-Text",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "TypeScript",
			"geaendert": "2023-06-27",
			"monat": "Juni 2023",
			"erstellt": "2023-06-27",
			"sterne": 0,
			"brew": "",
			"releases": []
		},
		{
			"name": "Duplicate-Component",
			"url": "https://github.com/Wiredframe/Duplicate-Component",
			"beschreibung": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"sprache": "TypeScript",
			"geaendert": "2023-06-27",
			"monat": "Juni 2023",
			"erstellt": "2023-06-27",
			"sterne": 0,
			"brew": "",
			"releases": []
		}
	],
	"projekte": [
		{
			"jahr": "2026",
			"satz": "Website für ein Unternehmen aus dem Bereich Tourismus",
			"gattung": "Website",
			"branche": "Tourismus",
			"technik": ""
		},
		{
			"jahr": "2026",
			"satz": "Website für ein Unternehmen aus dem Bereich Küchen",
			"gattung": "Website",
			"branche": "Küchen",
			"technik": ""
		},
		{
			"jahr": "2026",
			"satz": "Website für eine soziale Einrichtung",
			"gattung": "Website",
			"branche": "Soziale Einrichtung",
			"technik": "Payload"
		},
		{
			"jahr": "2026",
			"satz": "Website für eine Investmentfondsgesellschaft",
			"gattung": "Website",
			"branche": "Investmentfondsgesellschaft",
			"technik": ""
		},
		{
			"jahr": "2025",
			"satz": "Website für eine öffentliche Einrichtung",
			"gattung": "Website",
			"branche": "Öffentliche Einrichtung",
			"technik": ""
		},
		{
			"jahr": "2025",
			"satz": "Website für ein Unternehmen aus dem Bereich Photovoltaik",
			"gattung": "Website",
			"branche": "Photovoltaik",
			"technik": ""
		},
		{
			"jahr": "2024",
			"satz": "Website für ein Unternehmen aus dem Bereich Messtechnik",
			"gattung": "Website",
			"branche": "Messtechnik",
			"technik": ""
		},
		{
			"jahr": "2025",
			"satz": "Onlineshop für ein Unternehmen aus dem Bereich Ersatzteilehandel",
			"gattung": "Onlineshop",
			"branche": "Ersatzteilehandel",
			"technik": "Shopware"
		},
		{
			"jahr": "2025",
			"satz": "Onlineshop für ein Unternehmen aus dem Bereich Baustoffhandel",
			"gattung": "Onlineshop",
			"branche": "Baustoffhandel",
			"technik": "Shopware"
		},
		{
			"jahr": "2025",
			"satz": "Website für ein Unternehmen aus dem Bereich Biotechnologie",
			"gattung": "Website",
			"branche": "Biotechnologie",
			"technik": ""
		}
	],
	"kennzahlen": {
		"dokumentiert": 168,
		"von": 2007,
		"bis": 2026,
		"gattungen": [
			[
				"Website",
				133
			],
			[
				"Onlineshop",
				32
			],
			[
				"App",
				3
			]
		],
		"techniken": [
			[
				"Shopware",
				14
			],
			[
				"OXID",
				10
			],
			[
				"CosmoShop",
				6
			],
			[
				"XT-Commerce",
				2
			],
			[
				"Payload",
				1
			]
		],
		"felder": [
			[
				"IT & Elektronik",
				32
			],
			[
				"Sonstige",
				20
			],
			[
				"Tourismus & Gastgewerbe",
				19
			],
			[
				"Industrie & Technik",
				15
			],
			[
				"Gesundheit & Soziales",
				14
			],
			[
				"Handel",
				14
			],
			[
				"Medien, Bildung & Kultur",
				13
			],
			[
				"Finanzen & Immobilien",
				11
			],
			[
				"Energie & Umwelt",
				10
			],
			[
				"Öffentliche Hand",
				9
			],
			[
				"Bauen & Wohnen",
				7
			],
			[
				"Sport & Vereine",
				4
			]
		],
		"jahre": [
			[
				2007,
				3
			],
			[
				2008,
				6
			],
			[
				2009,
				28
			],
			[
				2010,
				10
			],
			[
				2011,
				7
			],
			[
				2012,
				10
			],
			[
				2013,
				11
			],
			[
				2014,
				9
			],
			[
				2015,
				9
			],
			[
				2016,
				10
			],
			[
				2017,
				5
			],
			[
				2018,
				2
			],
			[
				2019,
				11
			],
			[
				2020,
				10
			],
			[
				2021,
				5
			],
			[
				2022,
				8
			],
			[
				2023,
				5
			],
			[
				2024,
				8
			],
			[
				2025,
				7
			],
			[
				2026,
				4
			]
		]
	},
	"mitwisser": {
		"zahlen": [
			{
				"wert": "616",
				"text": "konspirative Sitzungen"
			},
			{
				"wert": "&gt;253",
				"text": "Tausend geflüsterte Nachrichten"
			},
			{
				"wert": "&gt;69",
				"text": "Tausend Handgriffe meiner Helfer"
			},
			{
				"wert": "111",
				"text": "Tage im Untergrund"
			},
			{
				"wert": "&gt;193",
				"text": "Millionen Tokens zu Papier gebracht"
			},
			{
				"wert": "&gt;34",
				"text": "Milliarden Tokens aus dem Gedächtnis gekramt"
			}
		],
		"schriftfuehrer": "Opus",
		"stand": "14. Oktober 2026",
		"datum": "2026-10-14"
	},
	"neues": [
		{
			"datum": "2026-10-18",
			"art": "Code",
			"titel": "wiredframe-website geändert",
			"text": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"ziel": "code/wiredframe-website"
		},
		{
			"datum": "2026-10-18",
			"art": "Code",
			"titel": "homebrew-tap geändert",
			"text": "Homebrew tap for Wiredframe's macOS apps",
			"ziel": "code/homebrew-tap"
		},
		{
			"datum": "2026-10-18",
			"art": "Neu",
			"titel": "rectmangle 1.2.0 ist erschienen",
			"text": "Minimal macOS window manager modelled on Rectangle: keyboard shortcuts, no network access",
			"ziel": "code/rectmangle"
		},
		{
			"datum": "2026-10-18",
			"art": "Neu",
			"titel": "dropme 1.1.0 ist erschienen",
			"text": "A small, private drop shelf for macOS, inspired by Dropover. No network, no telemetry.",
			"ziel": "code/dropme"
		},
		{
			"datum": "2026-10-18",
			"art": "Neu",
			"titel": "mittelklick 1.0.2 ist erschienen",
			"text": "Middle click on the macOS trackpad by tapping with three or four fingers, no network",
			"ziel": "code/mittelklick"
		},
		{
			"datum": "2026-10-18",
			"art": "Release",
			"titel": "flow 1.0.1",
			"text": "A tiny, fast photo and video viewer for macOS: one folder, square grid, newest first, videos play in place.",
			"ziel": "code/flow"
		},
		{
			"datum": "2026-10-18",
			"art": "Release",
			"titel": "los 1.1.1",
			"text": "A tiny launcher for everything you installed in the terminal. Los means go!",
			"ziel": "code/los"
		},
		{
			"datum": "2026-10-15",
			"art": "Neu",
			"titel": "flow ist erschienen",
			"text": "A tiny, fast photo and video viewer for macOS: one folder, square grid, newest first, videos play in place.",
			"ziel": "code/flow"
		},
		{
			"datum": "2026-10-14",
			"art": "Stand",
			"titel": "Neue Zahlen der Mitwisser",
			"text": "Schriftführer war meistens Opus.",
			"ziel": "mitwisser"
		},
		{
			"datum": "2026-10-02",
			"art": "Code",
			"titel": "kontor-landingpage geändert",
			"text": "Landingpage für Kontor – die native macOS-Buchhaltungs-App für KSK-versicherte Freiberufler (EÜR, UStVA, KSK, Rücklagen, lokal auf dem Mac).",
			"ziel": "code/kontor-landingpage"
		},
		{
			"datum": "2026-09-25",
			"art": "Release",
			"titel": "kontor-buchhaltung 3.2.12",
			"text": "Lokale Buchhaltungs-App (SwiftUI + SwiftData) für Freelancer – EÜR, UStVA, KSK, MCP-Server",
			"ziel": "code/kontor-buchhaltung"
		},
		{
			"datum": "2026-09-24",
			"art": "Neu",
			"titel": "los ist erschienen",
			"text": "A tiny launcher for everything you installed in the terminal. Los means go!",
			"ziel": "code/los"
		},
		{
			"datum": "2026-09-24",
			"art": "Code",
			"titel": "reminders-cli geändert",
			"text": "A simple CLI for interacting with macOS reminders",
			"ziel": "code/reminders-cli"
		},
		{
			"datum": "2026-09-23",
			"art": "Release",
			"titel": "paper-comic-reader 1.4.1",
			"text": "Paper Comic Reader — a focused iOS comic reader",
			"ziel": "code/paper-comic-reader"
		},
		{
			"datum": "2026-09-17",
			"art": "Code",
			"titel": "ricoh-sp150-macos-tahoe geändert",
			"text": "Get the Ricoh SP 150 (USB, host based) printing again on macOS 26 Tahoe using only Apple CoreGraphics. No Ghostscript, no print server.",
			"ziel": "code/ricoh-sp150-macos-tahoe"
		},
		{
			"datum": "2026-08-08",
			"art": "Release",
			"titel": "Simple-Comic 2.0.3",
			"text": "macOS comic viewer",
			"ziel": "code/Simple-Comic"
		},
		{
			"datum": "2026-07-30",
			"art": "Release",
			"titel": "vscode-live-inspect 0.2.4",
			"text": "Faithful HTML live preview for VS Code with click to source, inspect outline, and lightweight in place editing",
			"ziel": "code/vscode-live-inspect"
		},
		{
			"datum": "2026-07-26",
			"art": "Code",
			"titel": "paper-comic-reader-landingpage geändert",
			"text": "Landing page for Paper Comic Reader — a lean, native iPhone & iPad comic reader that makes pages read like ink on paper.",
			"ziel": "code/paper-comic-reader-landingpage"
		},
		{
			"datum": "2026-03-04",
			"art": "Code",
			"titel": "basquiat geändert",
			"text": "Agents for Figma design files",
			"ziel": "code/basquiat"
		},
		{
			"datum": "2026-02-04",
			"art": "Code",
			"titel": "Figma-to-Code geändert",
			"text": "Noch ohne Beschreibung, aber öffentlich einsehbar.",
			"ziel": "code/Figma-to-Code"
		}
	]
};
