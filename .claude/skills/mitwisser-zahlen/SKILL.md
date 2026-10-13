---
name: mitwisser-zahlen
description: Aktualisiert die Claude-Code-Kennzahlen im Band „Die Mitwisser“ auf der Startseite (data/claude-stats.json aus ~/.claude/stats-cache.json). Trigger: "Mitwisser aktualisieren", "Claude-Zahlen aktualisieren", "Stats auf der Website erneuern", "Kennzahlen neu ziehen".
---

# Mitwisser-Zahlen aktualisieren

Das Band „Die Mitwisser“ unter „Öffentlicher Code“ liest `data/claude-stats.json`.
Die Datei enthält nur Summen und entsteht aus `~/.claude/stats-cache.json`, der
Quelle von `/stats` in Claude Code.

1. `python3 werkzeuge/claude-stats.py` im Projektordner ausführen. Das Skript
   gibt die neuen Werte aus.
2. Bricht es mit „Das Format … hat sich geändert“ ab, hat ein Update von Claude
   Code die Quelle umgebaut. Dann `stats-cache.json` ansehen, das Skript
   anpassen und dem Nutzer sagen, was sich geändert hat. Nichts schätzen.
3. Kurz berichten: alte und neue Werte im Vergleich (`git diff data/claude-stats.json`).
   Fällt ein Wert, obwohl er nur wachsen kann, nachfragen statt committen: dann
   fehlt meist die Historie auf diesem Rechner.
4. Committen nur nach Rückfrage, Nachricht: `Update the accomplice numbers`.
   Pushen nur, wenn der Nutzer es ausdrücklich sagt.

Hinweise:
- Gezählt wird nur dieser Rechner. Sessions von anderen Geräten fehlen.
- `stats-cache.json` wird von Claude Code selbst neu berechnet (`lastComputedDate`).
  Ist der Stand alt, hilft es, einmal `/stats` aufzurufen.
- Texte und Beschriftungen des Bands stehen in `js/deck.js` (`initMitwisser`)
  und `index.html` (`#mitwisser`), nicht im Skript.
