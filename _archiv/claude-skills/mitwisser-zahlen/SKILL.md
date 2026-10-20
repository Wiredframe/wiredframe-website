---
name: mitwisser-zahlen
description: Aktualisiert die Claude-Code-Kennzahlen im Band „Die Mitwisser“ auf der Startseite (Karten, Schriftführer und Stand in index.html aus ~/.claude/stats-cache.json). Trigger: "Mitwisser aktualisieren", "Claude-Zahlen aktualisieren", "Stats auf der Website erneuern", "Kennzahlen neu ziehen".
---

# Mitwisser-Zahlen aktualisieren

Das Band „Die Mitwisser“ unter „Öffentlicher Code“ steht statisch in `index.html`
(`#mitwisser`). Die Statistik-Karten zwischen `<!-- mitwisser:karten -->` und
`<!-- /mitwisser:karten -->` sowie die Spans `data-mitwisser="schriftfuehrer"` und
`data-mitwisser="stand"` im Text entstehen aus
`~/.claude/stats-cache.json`, der Quelle von `/stats` in Claude Code. Es werden
nur Summen übernommen.

1. `python3 werkzeuge/claude-stats.py` im Projektordner ausführen. Das Skript
   schreibt Karten, Schriftführer und Stand in `index.html` und gibt die neuen Werte aus.
2. Bricht es mit „Das Format … hat sich geändert“ ab, hat ein Update von Claude
   Code die Quelle umgebaut. Dann `stats-cache.json` ansehen, das Skript
   anpassen und dem Nutzer sagen, was sich geändert hat. Nichts schätzen.
   Bricht es mit „Nicht gefunden in index.html“ ab, fehlen Marker oder Spans
   im Markup: wieder einsetzen, nicht das Skript umgehen.
3. Kurz berichten: alte und neue Werte im Vergleich (`git diff index.html`).
   Fällt ein Wert, obwohl er nur wachsen kann, nachfragen statt committen: dann
   fehlt meist die Historie auf diesem Rechner.
4. Committen nur nach Rückfrage, Nachricht: `Update the accomplice numbers`.
   Pushen nur, wenn der Nutzer es ausdrücklich sagt.

Hinweise:
- Gezählt wird nur dieser Rechner. Sessions von anderen Geräten fehlen.
- `stats-cache.json` wird von Claude Code selbst neu berechnet (`lastComputedDate`).
  Ist der Stand alt, hilft es, einmal `/stats` aufzurufen.
- Beschriftungen der Karten stehen in `werkzeuge/claude-stats.py` (`ZAHLEN`),
  alles andere der Section von Hand in `index.html`.
