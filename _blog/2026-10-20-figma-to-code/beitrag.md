# Figma to Code: Tokens rein, Interpretation raus

*Ein KI-Agent kann ein Figma-Design in HTML und CSS übersetzen. Damit dabei mein Design herauskommt und nicht seine Version davon, habe ich ihm vor allem eins beigebracht: was er nicht darf.*

Ich gestalte seit 2005 Oberflächen, und ein großer Teil davon passiert heute in Figma mit Variablen. Abstände, Schriftgrößen, Radien, Farben und das Raster sind dort keine losen Zahlen, sondern benannte Tokens wie `spacer-64` oder `radius-xl`, jeweils mit einem Wert für Desktop, Tablet und Mobile. Genau diese Arbeit geht bei der Umsetzung in Code gern verloren, wenn jemand die Werte abmisst, statt die Tokens zu übernehmen.

Daraus ist im Januar eine Vorlage entstanden, die auf GitHub liegt: [Figma to Code](https://github.com/Wiredframe/Figma-to-Code). Später kam ein Claude-Skill dazu, der dieselben Regeln für meine tägliche Arbeit bereithält. Beide haben dieselbe Haltung: Der Agent ist Verbraucher der Tokens, nie ihr Erfinder.

## Variablen werden Custom Properties

Der Grundgedanke ist schlicht. Jede Figma-Variable wird zu einer CSS Custom Property mit demselben Namen. Aus `spacer-64` wird `--spacer-64`, aus der Farbe `brand.600` wird `--color-brand-600`. Wer im Code `padding: var(--spacer-64)` liest, weiß sofort, welche Variable in Figma gemeint ist. Für Designer und Frontend ist das dieselbe Sprache.

Interessant wird es bei den Modes. Ein Spacer, der auf Desktop 64 und auf Mobile 40 Pixel misst, ist in Figma eine Variable mit zwei Werten. Im Browser könnte man an einem Breakpoint von einem Wert auf den anderen umschalten. Die Vorlage macht das nicht. Sie rechnet stattdessen mit `clamp()` eine Gerade zwischen den beiden Werten, sodass der Abstand mit der Fensterbreite stufenlos mitwächst:

```css
:root {
  --spacer-4: 4px;
  --spacer-64: clamp(40px, 6.57vw + 15.36px, 64px);
  --spacer-128: clamp(64px, 9.76vw + 27.43px, 128px);
}
```

Das Beispiel steht so im Generator für die Spacer. Unten liegt der Mobile-Wert, oben der Desktop-Wert, dazwischen eine Formel, die bei der Mobile-Breite genau 40 und bei der Desktop-Breite genau 64 ergibt. Sind beide Werte gleich, wie beim kleinen `spacer-4`, entsteht ein fester Wert ohne `clamp()`. Es gibt keinen Sprung an einer Grenze, und Abstände, Schriftgrößen und Radien brauchen keine einzige Media Query.

Media Queries bleiben für das, was sich nicht interpolieren lässt: Struktur. Eine Spalte, die auf Mobile unter die andere rutscht, eine andere Reihenfolge, ein Menü, das zum Hamburger wird. Und einen dritten Fall, der mir wichtig ist. Bindet das Design auf Desktop `--spacer-56` und auf Mobile `--spacer-32` an dieselbe Fläche, sind das zwei verschiedene Rollen, keine zwei Werte einer Rolle. Dann tauscht eine Media Query das Token aus. Aber nur, wenn Figma das nachweislich so bindet, nicht weil Mobile sich irgendwie kleiner anfühlen sollte. In meiner Knowledgebase steht dazu der Satz: Das ist der Unterschied zwischen einer Umsetzung und einer Interpretation.

## Die Pipeline und ihr manueller Anfang

Die Vorlage besteht aus fünf kleinen Node-Skripten, je eins für Farben, Raster, Radien, Spacer und Typografie, samt Konfiguration und vorbereitetem API-Export rund 2.100 Zeilen. Sie lesen die exportierten Variablen als JSON und schreiben daraus die Token-Dateien `colors.css`, `grid.css`, `radii.css`, `spacers.css` und `typography.css`.

Der erste Schritt ist dabei bewusst Handarbeit, auch wenn das nicht ganz freiwillig ist. Die Figma-Schnittstelle für Variablen verlangt eine Berechtigung, die es nur für Enterprise-Konten gibt. Mit einem Pro-Konto antwortet sie nicht. Das Export-Skript für die API liegt fertig im Repo, wartet aber auf einen anderen Account. Bis dahin exportiere ich die Variablen von Hand, und die ganze Zuordnung steckt im Dateinamen: `Desktop.tokens.spacer.json`, `Mobile.tokens.spacer.json` und so weiter, nach dem Muster `{Mode}.tokens.{Collection}.json`.

Das hat eine Tücke, die nirgends als Fehler auftaucht. Ist eine Datei falsch benannt, fehlt einem Generator einfach ein Mode, und aus einem fluiden Token wird still ein fester Wert. Deshalb halte ich nach dem Export die Dateiliste gegen die Tabelle in der Doku.

Auch die Reihenfolge zählt. Das Raster läuft zuerst, denn aus seinen `viewport-width`-Werten liest das Skript die Ankerbreiten für alle `clamp()`-Formeln und schreibt sie in die gemeinsame Konfiguration. Läuft es zuletzt, sind alle anderen Dateien auf die alten Breiten gerechnet, und wieder schlägt nichts fehl. Der Typografie-Generator prüft zusätzlich den Tablet-Wert: Liegt er mehr als 15 Prozent neben der Geraden zwischen Mobile und Desktop, warnt er, dass die Skalierung im Design nicht linear ist.

## Was der Agent nicht darf

Der größere Teil des Repos ist kein Code, sondern Regelwerk. `AGENTS.md` beschreibt, was ein KI-Agent beim Umsetzen einhalten muss, `TASKS.md` ist der Auftrag für einen einzelnen Screen. Das Erste, was dort steht, ist eine Liste von Verboten:

- keine festen Werte, also kein px, rem oder Hex im handgeschriebenen CSS
- keine eigenen Breakpoints
- keine neuen Tokens, kein Umbenennen
- keine eigenen `clamp()`-Formeln
- keine erfundenen Zustände

Der letzte Punkt klingt kleiner, als er ist. Ein Screen zeigt einen Button meistens nur im Normalzustand. Hover, Fokus und Disabled stehen in der Hauptkomponente, nicht im Frame. Ein Agent, der nur den Screen sieht, denkt sich die Zustände aus und trifft meine Designentscheidungen ein zweites Mal, meistens anders. Also muss er jede Instanz auf ihre Hauptkomponente zurückführen. Und wenn er die nicht findet, soll er fragen, mit vorbereiteter Tabelle: welche Instanz, wo sie vorkommt, welcher Link fehlt. Dasselbe gilt für fehlende Viewports.

Fragen ist ausdrücklich erwünscht. Das steht auch im Skill als Hausregel ganz oben. Eine Rückfrage kostet mich kaum etwas, ein geratener Wert später eine Suche, bei der niemand mehr weiß, ob eine Zahl gemessen oder im Vorbeigehen geschätzt wurde. Genau so hat sich schon eine Umsetzung, die als fertig galt, sichtbar vom Figma-Stand entfernt. Seitdem ist die Regel binär. Sobald sie nur meistens gilt, prüft sie niemand mehr.

Eine Kleinigkeit aus dem Regelwerk zeige ich gern her, weil sie viele kennen, ohne den Grund zu wissen. Die Abstände stimmen, die Schriftgrößen stimmen, und trotzdem sitzt alles ein paar Pixel zu weit auseinander. Figma schneidet Textboxen oben an der Versalhöhe und unten an der Grundlinie ab, der Browser verteilt die Zeilenhöhe als Luft darüber und darunter. Zwei globale Zeilen gleichen das an:

```css
* {
  text-box-trim: both;
  text-box-edge: cap alphabetic;
}
```

## Vom Repo zum Skill

Im August habe ich Claude alle meine bisherigen Sitzungen nach Abläufen durchsuchen lassen, die immer wiederkehren. Die Umsetzung von Figma-Designs in tokenbasiertes HTML war einer der beiden, aus denen ein Skill wurde: `figma-zu-tokens-html`. Zwei Wochen später habe ich ihn umgebaut. Das Wissen aus dem Repo steht jetzt als einzelne Notizen in meiner Knowledgebase, und der Skill ist nur noch Wegweiser, kein Drehbuch. Er sagt Claude, welche Notizen es vorher lesen soll, und erinnert daran, dass das Argumente sind und keine Checkliste. Was auf ein Projekt nicht passt, wird verworfen und die Abweichung benannt.

Für Einzelseiten ohne Export liest Claude die Variablen direkt über den Figma-MCP-Server und rechnet die Mode-Paare mit einem kleinen Python-Skript um, in rem und mit beiden Werten als Kommentar:

```
clamp.py space-32 20 32
  --space-32: clamp(1.25rem, calc(0.971rem + 1.143vw), 2rem);  /* 32 -> 20 */
```

Das Skript rundet kaufmännisch statt so, wie Python es von Haus aus tut, damit 0,5625rem als 0,563rem herauskommt, genau wie in den von Hand gepflegten Dateien. Werte von Hand ausrechnen ist keine Option, jeder Rundungsfehler wandert sonst unbemerkt in die Seite.

## Der Abgleich ist nicht optional

Fertig ist eine Seite erst nach dem Soll-Ist-Abgleich. Claude holt Screenshots der Figma-Vorlage für Desktop und Mobile, nimmt die gebaute Seite bei 1440 und 390 Pixeln Breite auf und vergleicht Sektion für Sektion: Abstände, Schriftgrößen, Zeilenhöhen, Farbflächen, Radien, Reihenfolge. Abweichungen werden behoben, bevor das Wort „fertig“ fällt. Was bewusst so bleibt, wird benannt und begründet.

Am Ende steht noch ein `grep` über die Stylesheets, das jede feste Zahl findet. Erlaubt sind nur Null, Haarlinien, Rahmenbreiten und Bildmaße. Alles andere ist entweder ein Fehler oder eine Lücke im Designsystem, und dann gehört das fehlende Token nach Figma, nicht als Zahl in den Code.

Das ist für mich der eigentliche Gewinn. Der Agent übernimmt die Fleißarbeit, aber jede Designentscheidung bleibt sichtbar dort, wo sie hingehört. Die Vorlage liegt auf [GitHub](https://github.com/Wiredframe/Figma-to-Code), drei Commits, Regelwerk inklusive.
