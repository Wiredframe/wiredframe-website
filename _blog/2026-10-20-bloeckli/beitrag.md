# Blöckli: Erst der Block, dann der Satz

*Über 500 UI-Blöcke als Vokabular und ein Skill, der Webcopy schreibt. Entstanden ist er aus einem Ablauf, der für eine Seite mit 282 Wörtern rund 1.000 Zeilen Papier erzeugt hat.*

Wenn ich eine Seite entwerfe, denke ich Text und Layout nie getrennt. Eine Headline, die in drei Zeilen umbricht, ist im Hero eine andere Headline als eine, die in eine Zeile passt. Drei Leistungskarten mit Texten von zwölf, vierzig und neunzig Wörtern sind kein Raster mehr, sondern ein Unfall. Und ein Abschnitt, der eine Behauptung aufstellt, braucht einen Platz für den Beleg, sonst steht die Behauptung allein da.

Genau das verlieren Texte, die ohne Layout geschrieben werden. Und Texte von Sprachmodellen verlieren noch etwas mehr: Sie klingen nach allem und nach niemandem. Blöckli ist mein Versuch, beides zusammen in den Griff zu bekommen, gebaut mit Claude als Mitarbeiter. Es besteht aus zwei Teilen: einem Datensatz von Inhaltsblöcken und dem Claude-Skill `bloeckli`, der damit arbeitet.

## Der Datensatz

Ein Block ist im Datensatz ein Eintrag mit drei Teilen: eine ID, eine Zeile **Structure** und eine Zeile **Purpose**. So sieht einer aus:

```
### cta-remaining-questions
Structure: Two columns. On the left heading, one sentence and the action,
on the right three to five collapsed questions that can be opened
individually, below them a link to the full list of questions. Opening
one shifts only the right-hand column. On narrow viewports action part
on top, questions below.
Purpose: Answer open questions in the same section in which the action
is offered.
```

Die Struktur soll so konkret sein, dass man ein Wireframe daraus zeichnen kann, ohne die Vorlage je gesehen zu haben. Der Zweck sagt in einem Satz, was der Block in der Argumentation einer Seite leistet. Mehr steht da nicht, und das ist Absicht: keine Farben, keine Schriften, keine Abstände, keine Frameworks, keine Bewertung, keine Empfehlung. Alles davon veraltet schnell oder gehört zu einem bestimmten Projekt. Zwei Blöcke, die sich nur in Farbe, Ausrichtung oder Bildausschnitt unterscheiden, sind derselbe Block. Ein eigener Eintrag braucht eine andere Struktur oder einen anderen Zweck.

Geschrieben ist der Datensatz nicht aus dem Gedächtnis. Für jede Kategorie läuft einmal ein eigener Agent, der `blockfinder`. Er sieht sich aktuelle Websites und Shops an, quer durch Branchen, auch außerhalb des englischsprachigen Markts, und beschreibt die Strukturen, die er findet, in eigenen Worten und auf Englisch. „Modern“ ist dabei ein Auswahlkriterium, kein Wort, das im Text vorkommen darf: Maßstab sind Seiten der letzten ein bis zwei Jahre, verschwundene Muster fliegen raus. Ziel sind 20 bis 35 Einträge je Kategorie, und die Regel dazu gefällt mir besonders: Achtzehn scharfe schlagen fünfunddreißig mit Dubletten.

Fertig sind bisher 16 Kategorien für Websites, vom Header über Hero, Leistungen, Preise und FAQ bis zum Footer, zusammen 508 Blöcke. Allein für Abschlüsse und Handlungsaufrufe sind es 34, von der schlichten zentrierten Aufforderung bis zum Einschub, der den Lesefluss einmal anhält. Geplant sind weitere Website-Kategorien und dreizehn für Onlineshops, vom Produktraster bis zum Checkout.

## Wie es dazu kam

Der Skill in seiner heutigen Form ist die dritte Fassung innerhalb weniger Tage Anfang September. Die erste war ein Orchestrator für Inhaltskonzepte: zwei Skills mit 378 Zeilen, neun Beilagen, vier Agenten, vier Tore mit kaltem Gegenlesen, drei Rechercherunden. Am Ende einer Lösungsseite für B2B und Industrie stand eine Bilanz, die ich im Archiv festgehalten habe: rund 1.000 Zeilen Prozessdokument für 282 Wörter Seite. Dazu ein Layout, dessen Gewichtung man nicht sehen konnte, weil alle Abschnitte dieselben Abstände hatten.

Am meisten gelernt habe ich aus den Textregeln. Die damalige Textwerkstatt bestand aus 220 neuen Zeilen, fast alle Verbote. Herausgekommen sind fehlerfreie leere Sätze. Mein Lieblingsbeispiel:

> Neue Systeme setzen wir neben die, die bei Ihnen laufen.

Dieser Satz besteht jede Prüfung. Er sagt nur nichts. In der Knowledgebase habe ich danach mit Claude zusammengetragen, warum das so ist: Sprachmodelle werden im Training auf das Typische hin belohnt. Appelle wie „schreib menschlich“ ändern daran wenig, lange Verbotslisten eher gar nichts, und ein Modell, das seinen eigenen Text bewerten soll, hält ihn gern für besonders gelungen. Was eher hilft: echte Sätze als Vorbild, mechanische Prüfungen von außen und ein Mensch, der auswählt.

Die zweite Fassung baute das Layout direkt in Figma, mit drei Skeletten nebeneinander und einem Audit per Skript. Auch sie liegt jetzt im Archiv. Übrig geblieben sind aus beiden Fassungen nur der Datensatz und eine einzige Prüfung: Jede Block-ID wird per `grep` im Datensatz gesucht, bevor sie verwendet wird. Gibt es keinen Treffer, gibt es den Block nicht. Erfundene Block-IDs waren einer der Fehler, die die alten Tore immer wieder gefunden hatten.

## Sechs Schritte im Kreis

Die heutige Fassung kann zwei Dinge, sonst nichts: Copy schreiben, die trägt, und je Abschnitt den Block wählen, in dem sie steht. Das Ergebnis ist eine einzige Datei pro Seite. Der Ablauf:

1. **Worum geht es.** Eine Runde mit höchstens vier Fragen, nur nach dem, was die Sätze ändert: Angebot, Ziel, wie Besucher ankommen, welches Material es gibt.
2. **Recherche.** Drei bis fünf echte Auftritte, die dieselbe Aufgabe für dieselbe Zielgruppe lösen, dazu Branchenmedien, Foren und Bewertungen. Dort spricht die Zielgruppe selbst. Ergebnis ist ein Sprachprofil von höchstens zwölf Zeilen, mit den Begriffen der Zielgruppe neben den Anbieterwörtern, die sie ersetzen.
3. **Gerüst.** Erst die Abschnitte als reine Liste von Zwecken, dann je Abschnitt ein Block aus dem Datensatz.
4. **Schreiben.** Slot für Slot, in den Feldern, die der Block vorgibt.
5. **Verfeinern.** Der Skill `humanizer-de` geht einmal über den ganzen Text.
6. **Abgleich.** Text gegen Block halten. Passt es nicht, zurück zu Schritt 3.

Schritt 3 vor Schritt 4 ist der Kern, und es ist der Teil, der am meisten nach UI-Design aussieht. Der Block kommt vor dem Feintext, weil er die Slots und die Textmenge vorgibt. Ein Block wie `services-alternating-row-proof` hat neben Titel, Text und Bild einen Platz für einen Beleg, ein Zitat mit Name und Funktion oder eine einzelne Zahl. Wer das vorher weiß, schreibt den Absatz so, dass er auf diesen Beleg zuläuft. Wer erst schreibt und dann sucht, schreibt an jedem Block vorbei.

Schritt 6 schließt den Kreis mit Fragen, die ich mir auch beim Entwerfen stelle: Trägt die Headline in einer Zeile? Sind drei Karten annähernd gleich lang? Bleibt die Subline unter der üblichen Menge? Wenn nicht, wird einmal bewusst entschieden, ob der Text kürzer wird oder der Block wechselt.

## Eine Frage statt einer Verbotsliste

Von den 220 Zeilen Verboten ist eine Frage übrig geblieben:

> Kann dieser Satz falsch sein?

Könnte ihm niemand widersprechen, ist er Dekoration. „Ihr Kunde findet das Bauteil über Merkmale statt über die Artikelnummer“ kann falsch sein, also bleibt er. Der Satz von oben mit den neuen Systemen kann es nicht, also fliegt er.

## Was bewusst nicht automatisiert wird

Ein paar Dinge macht Blöckli absichtlich nicht.

- **Zahlen, Referenzen, Zitate.** Werden nie erfunden. Was fehlt, steht sichtbar als `[offen: …]` in der Datei und wird nicht glattgeschrieben.
- **Gestaltung.** Gebaut wird woanders. Der Datensatz kennt keine Design-Tokens, damit er in jedes Figma-File und neben jedes Designsystem passt.
- **Geschmack.** Der Skill soll zu jeder Option eine Meinung haben und einmal deutlich widersprechen, wenn es nötig ist. Über Stil und Geschmack entscheide ich.
- **Fremde Sätze.** Aus der Recherche kommen Wortwahl, Tonfall und übliche Abschnittsfolgen mit, nie Sätze im Wortlaut, fremde Claims oder fremde Zahlen.

Im Chat bleibt Claude dabei kurz: höchstens zehn Zeilen je Antwort, kein Vorwort, keine Zusammenfassung des gerade Geschriebenen. Der Skill hat heute 132 Zeilen. Das ist die vielleicht wichtigste Zahl in diesem Beitrag, weil die Fassungen davor jeweils ein Vielfaches davon hatten.

Ob die neue Fassung hält, was sie verspricht, muss sich noch zeigen. In meiner Knowledgebase steht dazu offen, dass die Gegenmittel aus der Literatur belegt, im eigenen Ablauf aber noch nicht getestet sind. Eine erste Seite liegt als Entwurf vor, mit einem Sprachprofil, acht Abschnitten in ihren Blöcken und einer ehrlichen Menge an `[offen]`. Das finde ich nicht schlimm. Lieber eine Lücke, die man sieht, als ein Satz, der nur so tut.
