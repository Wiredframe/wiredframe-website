"""
Schreibt erzeugtes Markup zwischen zwei Marker in index.html.

    <!-- name -->
    … wird bei jedem Lauf ersetzt …
    <!-- /name -->

Die Werkzeuge in diesem Ordner bauen ihre Karten vorab, damit die Seite
sie ohne Skript und ohne Nachladen zeigt. Fehlt ein Marker, bricht der
Lauf mit einer klaren Meldung ab, statt still nichts zu schreiben.
"""

import pathlib
import re
import sys

WURZEL = pathlib.Path(__file__).resolve().parent.parent
SEITE = WURZEL / 'index.html'
MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August',
	'September', 'Oktober', 'November', 'Dezember']


def einsetzen(seite, name, markup):
	"""Ersetzt den Inhalt zwischen <!-- name --> und <!-- /name -->.
	markup ist eine Liste von Zeilen ohne Einrückung, sie übernehmen die
	Einrückung des Startmarkers."""
	muster = re.compile(rf'^([ \t]*)(<!-- {re.escape(name)} -->).*?(<!-- /{re.escape(name)} -->)', re.S | re.M)
	m = muster.search(seite)
	if not m:
		sys.exit(f'Nicht gefunden in {SEITE.name}: <!-- {name} --> … <!-- /{name} -->. Marker wieder einsetzen.')
	einzug = m[1]
	block = ''.join(f'{einzug}{z}\n' if z else '\n' for z in markup)
	return seite[:m.start()] + f'{einzug}{m[2]}\n{block}{einzug}{m[3]}' + seite[m.end():]


def ersetzen(seite, muster, ersatz, was):
	"""Ersetzt genau einen Treffer eines regulären Ausdrucks."""
	neu, anzahl = re.subn(muster, ersatz, seite, count=1, flags=re.S)
	if not anzahl:
		sys.exit(f'Nicht gefunden in {SEITE.name}: {was}.')
	return neu
