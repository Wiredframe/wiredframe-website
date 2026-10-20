# Live Inspect: Von der Vorschau zurück in den Quelltext

*Brackets konnte etwas, das ich in VS Code nicht gefunden habe: auf ein Element in der Vorschau zeigen und im Code an der richtigen Stelle landen. Also habe ich es mir mit Claude nachgebaut.*

Wenn ich HTML und CSS schreibe, denke ich von der Oberfläche her. Ich sehe eine Überschrift, die zu eng am Bild sitzt, oder einen Button, dessen Text umbricht. Was ich dann brauche, ist der Weg von diesem Ding auf dem Bildschirm zu der Zeile, in der es steht. In Figma ist das selbstverständlich: Element anklicken, Eigenschaften sehen. Im Code ist es eine Suche, und je größer die Seite, desto länger dauert sie.

Adobe Brackets hatte dafür die Live Preview. Der Editor war eng mit dem Browser verbunden, und zwischen Vorschau und Quelltext gab es eine echte Rückkopplung. Brackets gibt es nicht mehr in der Form, und VS Code bringt so etwas nicht von Haus aus mit. Ich wollte beides zusammen: eine Vorschau, die aussieht wie im echten Browser, und einen Klick, der zurück zur Quelle führt.

Also habe ich Claude gebeten, eine zu bauen. Herausgekommen ist Live Inspect, eine kleine Erweiterung für VS Code, an einem Tag entstanden und als Open Source veröffentlicht.

## Drei Modi, eine Leiste

Die Vorschau öffnet sich neben dem Editor, über einen Knopf in der Titelleiste einer HTML-Datei. Oben sitzt eine schmale Leiste mit drei Modi:

- **Preview** ist normales Browsen. Links funktionieren, Skripte laufen, nichts greift ein.
- **Inspect** zeigt beim Überfahren eine Umrandung im Stil der Entwicklerwerkzeuge, dazu ein Etikett mit Tag, ID und Klassen, also etwa `p.tagline`. Ein Klick springt im Editor an genau diese Stelle und hebt sie kurz hervor. Bei verschachtelten Elementen gewinnt das innerste.
- **Edit** macht Textelemente direkt in der Vorschau bearbeitbar. Was ich tippe, wird in den HTML-Quelltext zurückgeschrieben. Cmd+Z macht im Feld rückgängig, und sobald ich ein Element anklicke, scrollt der Editor zur passenden Zeile, ohne mir den Fokus wegzunehmen.

Speichere ich die HTML-Datei oder eine verlinkte CSS-, JavaScript- oder Bilddatei, lädt die Vorschau neu. Scrollposition und Modus bleiben dabei erhalten. Das klingt nach einem Detail, ist aber der Unterschied zwischen einem Werkzeug, das man nebenher laufen lässt, und einem, das einen bei jedem Speichern an den Seitenanfang wirft.

## Warum gerade diese Rückkopplung

Ein UI Designer, der selbst HTML und CSS baut, wechselt ständig zwischen zwei Sichten: dem, was gerendert wird, und dem, was geschrieben steht. Das Urteil fällt in der ersten Sicht. Ob ein Abstand stimmt, ob eine Zeile zu lang ist, ob ein Text auf dem Bildschirm noch so klingt wie in der Copy-Datei: Das sehe ich nur in der Vorschau. Die Korrektur passiert aber in der zweiten.

Jeder Wechsel kostet einen kleinen Suchschritt. Welche Datei, welche Zeile, welcher der drei Absätze mit derselben Klasse? Einzeln ist das nichts. Über einen Tag summiert es sich, und vor allem reißt es einen aus dem Blick auf die Gestaltung heraus. Ein Klick auf das Element, und der Editor steht an der richtigen Stelle: Damit wird die Vorschau zum Einstieg in den Code statt zu einem zweiten Fenster, das man vergleichen muss.

Der Edit-Modus ist die kleine Schwester davon. Für einen Tippfehler oder eine Formulierung, die im Layout nicht funktioniert, muss ich nicht erst die Stelle im Markup suchen. Ich ändere den Text dort, wo ich ihn lese.

## Originalgetreu heißt echter Browser

Die ersten Fassungen haben die Seite direkt in der Webview von VS Code angezeigt. Dafür mussten Pfade zu Bildern, Schriften und Stylesheets umgeschrieben werden, und genau da fangen die Abweichungen an. Mit Version 0.1.0 hat Claude die Darstellung umgebaut: Ein kleiner HTTP-Server auf `127.0.0.1` liefert den Projektordner so aus, wie er ist, und die Vorschau zeigt ihn in einem iframe. CSS, Schriften und das JavaScript der Seite laufen dort nativ, relative Pfade lösen sich auf wie in jedem Browser.

Nur das HTML wird auf dem Weg verändert. Der Parser `parse5` liest es mitsamt der Position jedes Elements im Quelltext. Jedes Element bekommt ein Attribut `data-vscode-id`, und die Erweiterung merkt sich, welche ID zu welchem Bereich im Code gehört. Das ist der Ansatz von Brackets: Die Vorschau versucht nie, aus dem gerenderten DOM auf den Quelltext zurückzuschließen. Sie schickt beim Klick einfach die ID zurück, und die Erweiterung schlägt nach. Keine Source Maps, kein Framework.

Ich mag diese Lösung, weil sie so unspektakulär ist. Die Zuordnung steht fest, bevor die Seite überhaupt gerendert wird.

## Was die Prüfung fand

Vor dem Release lief eine Fehlerrunde mit einer Durchsicht des Codes. In Version 0.2.4 ist unter anderem eingeflossen:

- Mehrere Bearbeitungen kurz hintereinander konnten sich überholen und den Quelltext beschädigen. Sie laufen jetzt nacheinander durch eine Warteschlange.
- Vorschau und Seite nehmen Nachrichten nur noch vom erwarteten Fenster an.
- Fehler auf den asynchronen Wegen erscheinen als Meldung, statt still zu verschwinden.
- Ändern sich Dateien ununterbrochen, wird trotzdem irgendwann neu geladen.

## Ein Fehler, der keiner war

Im Oktober schrieb ich Claude, ich glaube, Live Inspect sei kaputt: Die Vorschau zeige einen völlig veralteten Stand meiner Website. Claude prüfte zuerst die Erweiterung, dann startete es deren Server und rief die Seite in Headless Chrome auf, zum Gegencheck auch über einen ganz normalen statischen Server. Ergebnis in beiden Fällen gleich.

Die Ursache lag in der Seite. Ich hatte einen leeren Absatz gelöscht, den ein Skript noch befüllen wollte. Das Skript brach ab, ein leerer `catch` verschluckte den Fehler, und ein ganzer Abschnitt blieb unsichtbar. Die Vorschau zeigte also den aktuellen Stand, er sah nur aus wie ein alter. Am Ende haben wir das Skript deutlich eingedampft und den Inhalt statisch ins HTML geschrieben.

Für mich ist das die beste Bestätigung des Grundgedankens. Eine originalgetreue Vorschau zeigt auch die Fehler der Seite, genau wie ein Browser.

## Was bewusst fehlt

Live Inspect liest die Datei von der Festplatte, nicht aus dem Editor. Ungespeicherte Änderungen erscheinen erst nach dem Speichern, und auch Text aus dem Edit-Modus landet zwar im Editor, will aber noch gespeichert werden. Bearbeiten lassen sich nur Elemente, die reinen Text enthalten, also keinen Absatz mit Link darin. Und weil `parse5` das HTML für die Vorschau neu zusammensetzt, kann sehr ungewöhnliches Markup minimal vom Original abweichen. Auf der Liste für später stehen ein eigenes Symbol, eine automatische Prüfung bei jedem Push und das Einfügen der IDs direkt an den Byte-Positionen, ganz ohne Neuaufbau.

Die Erweiterung besteht aus rund 1.000 Zeilen TypeScript, sauber getrennt in Parser, Instrumentierung, Zuordnung, Server, Vorschau und Nachrichten. Sie steht nicht im Marketplace, sondern als VSIX-Datei im Release auf [GitHub](https://github.com/Wiredframe/vscode-live-inspect), installierbar mit:

```
code --install-extension live-inspect-0.2.4.vsix
```
