#!/usr/bin/env python3
"""
Zieht die Kennzahlen der Mitwisser aus Claude Code für die Startseite.

    python3 werkzeuge/claude-stats.py [pfad/zur/stats-cache.json]

Liest  ~/.claude/stats-cache.json  und schreibt die Statistik-Karten der
Section #mitwisser direkt in index.html, zwischen <!-- mitwisser:karten -->
und <!-- /mitwisser:karten -->, dazu die Werte der Spans data-mitwisser="schriftfuehrer" und "stand" im Text.
Alles andere bleibt von Hand.

Die Quelle ist die Datei, aus der Claude Code selbst /stats berechnet. Sie
ist nicht dokumentiert und kann sich mit einem Update ändern, deshalb prüft
das Skript die Felder, die es braucht, und bricht mit einer klaren Meldung
ab, statt still Nullen zu schreiben.

Übernommen werden nur Summen. Die Quelle kennt daneben Session-IDs und den
Zeitpunkt der längsten Session, beides hat auf der Website nichts verloren.
Die Logs mit Inhalten und Projektpfaden liest das Skript gar nicht erst.

Gezählt wird nur, was auf diesem Rechner lief.
"""

import datetime
import html
import json
import pathlib
import re
import sys

from seite import MONATE, SEITE, WURZEL, einsetzen, ersetzen

QUELLE = pathlib.Path.home() / '.claude' / 'stats-cache.json'

# Beschriftung der Karten, in dieser Reihenfolge
ZAHLEN = [
	('sitzungen', 'konspirative Sitzungen'),
	('nachrichten', 'geflüsterte Nachrichten'),
	('handgriffe', 'Handgriffe meiner Helfer'),
	('tage', 'Tage im Untergrund'),
	('geschrieben', 'Tokens zu Papier gebracht'),
	('erinnert', 'Tokens aus dem Gedächtnis gekramt'),
]

# Auf der Karte stehen wie in Profil höchstens drei Ziffern, sonst sprengt
# die Schaugröße die Karte. Die Größenordnung wandert in die Beschriftung,
# und wo abgerundet wird, steht „mehr als“ davor.
STUFEN = [(10**9, 'Milliarden'), (10**6, 'Millionen'), (10**3, 'Tausend')]

# Modellkennungen wechseln mit jeder Generation, die Familien bleiben.
# Auf der Seite stehen deshalb nur sie, nicht claude-opus-4-8 und Co.
FAMILIEN = ['Opus', 'Sonnet', 'Haiku', 'Fable']


def familie(modell):
	for name in FAMILIEN:
		if re.search(name, modell, re.I):
			return name
	return None


def karte(n, name):
	teiler, wort = next(((t, w) for t, w in STUFEN if n >= t), (1, ''))
	wert = n // teiler
	zeilen = ['<article class="cell cell--stat">']
	if wert * teiler != n:
		zeilen.append('\t<p class="text">mehr als</p>')
	zeilen.append(f'\t<p class="stat__value">{wert}</p>')
	zeilen.append(f'\t<p class="text">{html.escape(f"{wort} {name}".strip())}</p>')
	zeilen.append('</article>')
	return zeilen


def datum(iso):
	d = datetime.date.fromisoformat(iso)
	return f'{d.day}. {MONATE[d.month - 1]} {d.year}'


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

	seite = SEITE.read_text()
	seite = einsetzen(seite, 'mitwisser:karten', [z for k, name in ZAHLEN for z in karte(daten[k], name)])
	werte = {'stand': datum(daten['stand'])}
	if mitwisser:
		werte['schriftfuehrer'] = mitwisser[0]['name']
	for name, wert in werte.items():
		seite = ersetzen(seite, rf'(<span\s+data-mitwisser="{name}">).*?(</span>)',
			lambda m: m[1] + html.escape(wert) + m[2], f'<span data-mitwisser="{name}">')
	SEITE.write_text(seite)

	print(f'{SEITE.relative_to(WURZEL)}: Stand {daten["stand"]}')
	for k in ('sitzungen', 'nachrichten', 'handgriffe', 'tage', 'geschrieben', 'erinnert'):
		print(f'  {k:12} {daten[k]:>16,}'.replace(',', '.'))
	print('  ' + ', '.join(f'{m["name"]} {m["anteil"]:.0%}' for m in mitwisser))


if __name__ == '__main__':
	main()
