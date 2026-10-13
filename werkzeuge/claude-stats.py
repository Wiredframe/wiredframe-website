#!/usr/bin/env python3
"""
Zieht die Kennzahlen der Mitwisser aus Claude Code für die Startseite.

    python3 werkzeuge/claude-stats.py [pfad/zur/stats-cache.json]

Liest  ~/.claude/stats-cache.json  und schreibt  data/claude-stats.json.

Die Quelle ist die Datei, aus der Claude Code selbst /stats berechnet. Sie
ist nicht dokumentiert und kann sich mit einem Update ändern, deshalb prüft
das Skript die Felder, die es braucht, und bricht mit einer klaren Meldung
ab, statt still Nullen zu schreiben.

Übernommen werden nur Summen. Die Quelle kennt daneben Session-IDs und den
Zeitpunkt der längsten Session, beides hat auf der Website nichts verloren.
Die Logs mit Inhalten und Projektpfaden liest das Skript gar nicht erst.

Gezählt wird nur, was auf diesem Rechner lief.
"""

import json
import pathlib
import re
import sys

WURZEL = pathlib.Path(__file__).resolve().parent.parent
QUELLE = pathlib.Path.home() / '.claude' / 'stats-cache.json'
ZIEL = WURZEL / 'data' / 'claude-stats.json'

# Modellkennungen wechseln mit jeder Generation, die Familien bleiben.
# Auf der Seite stehen deshalb nur sie, nicht claude-opus-4-8 und Co.
FAMILIEN = ['Opus', 'Sonnet', 'Haiku', 'Fable']


def familie(modell):
	for name in FAMILIEN:
		if re.search(name, modell, re.I):
			return name
	return None


def main():
	quelle = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else QUELLE
	try:
		roh = json.loads(quelle.read_text())
	except FileNotFoundError:
		sys.exit(f'Nicht gefunden: {quelle}. Läuft Claude Code auf diesem Rechner?')

	fehlt = [k for k in ('totalSessions', 'totalMessages', 'dailyActivity', 'modelUsage', 'firstSessionDate')
		if k not in roh]
	if fehlt:
		sys.exit(f'Das Format von {quelle.name} hat sich geändert, es fehlt: {", ".join(fehlt)}. '
			f'Version laut Datei: {roh.get("version")}. Skript anpassen.')

	modelle = roh['modelUsage'].values()
	summe = lambda feld: sum(m.get(feld, 0) for m in modelle)

	geschrieben = {}
	for modell, werte in roh['modelUsage'].items():
		name = familie(modell)
		if name:
			geschrieben[name] = geschrieben.get(name, 0) + werte.get('outputTokens', 0)
	gesamt = sum(geschrieben.values()) or 1
	mitwisser = sorted(
		({'name': n, 'anteil': round(t / gesamt, 4)} for n, t in geschrieben.items() if t),
		key=lambda m: -m['anteil'])

	daten = {
		'stand': roh.get('lastComputedDate'),
		'seit': roh['firstSessionDate'][:10],
		'sitzungen': roh['totalSessions'],
		'nachrichten': roh['totalMessages'],
		'handgriffe': sum(t.get('toolCallCount', 0) for t in roh['dailyActivity']),
		'tage': len(roh['dailyActivity']),
		'geschrieben': summe('outputTokens'),
		'erinnert': summe('cacheReadInputTokens'),
		'mitwisser': mitwisser,
	}

	ZIEL.write_text(json.dumps(daten, ensure_ascii=False, indent='\t') + '\n')
	print(f'{ZIEL.relative_to(WURZEL)}: Stand {daten["stand"]}')
	for k in ('sitzungen', 'nachrichten', 'handgriffe', 'tage', 'geschrieben', 'erinnert'):
		print(f'  {k:12} {daten[k]:>16,}'.replace(',', '.'))
	print('  ' + ', '.join(f'{m["name"]} {m["anteil"]:.0%}' for m in mitwisser))


if __name__ == '__main__':
	main()
