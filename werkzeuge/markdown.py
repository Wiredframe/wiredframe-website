#!/usr/bin/env python3
"""
Schreibt die Startseite als Markdown nach index.md.

    python3 werkzeuge/markdown.py

Quelle ist allein index.html: das Deck mit seinen Screens und das
Impressum-Deck. Jeder Screen wird ein Abschnitt, getrennt durch eine
Linie. Was nur fürs Auge da ist (Icons, Signet, Zähler, Filter, Knöpfe),
bleibt draußen, was das Skript im Browser erst einsetzt (Jahre, Mail),
setzt dieses hier selbst ein.

repos.py und referenzen.py rufen es nach jedem Lauf auf, damit die
Karten in beiden Fassungen gleich sind. Wer index.html von Hand ändert,
lässt es danach selbst laufen.

index.md darf nicht mit --- anfangen: GitHub Pages lässt Jekyll laufen,
und Jekyll hielte das für einen Kopf und machte HTML daraus. Ohne Kopf
liefert es die Datei unverändert aus.
"""

import datetime
import html.parser
import re

from seite import SEITE, WURZEL

ZIEL = WURZEL / 'index.md'
BASIS = 'https://www.wiredframe.de'
JAHRE = str(datetime.date.today().year - 2005)

# Elemente, deren Inhalt nie Text der Seite ist
WEG = {'svg', 'button', 'select', 'script', 'style', 'canvas', 'img'}
LEER = {'br', 'img', 'link', 'meta', 'input', 'source', 'hr', 'path', 'line', 'rect', 'polyline'}


# ========================================
# Baum
# ----------------------------------------
# html.parser liefert nur Ereignisse. Für die Regeln unten ist ein kleiner
# Baum bequemer, weil eine Karte erst als Ganzes entscheidet, wie sie
# aussieht.
# ========================================
class Knoten:
	def __init__(self, tag, attrs):
		self.tag = tag
		self.attrs = dict(attrs)
		self.kinder = []

	def klasse(self, name):
		return name in (self.attrs.get('class') or '').split()

	def finden(self, pruefen):
		for k in self.kinder:
			if isinstance(k, Knoten):
				if pruefen(k):
					yield k
				yield from k.finden(pruefen)


class Leser(html.parser.HTMLParser):
	def __init__(self):
		super().__init__(convert_charrefs=True)
		self.wurzel = Knoten('#', [])
		self.stapel = [self.wurzel]

	def handle_starttag(self, tag, attrs):
		k = Knoten(tag, attrs)
		self.stapel[-1].kinder.append(k)
		if tag not in LEER:
			self.stapel.append(k)

	def handle_startendtag(self, tag, attrs):
		self.stapel[-1].kinder.append(Knoten(tag, attrs))

	def handle_endtag(self, tag):
		for i in range(len(self.stapel) - 1, 0, -1):
			if self.stapel[i].tag == tag:
				del self.stapel[i:]
				break

	def handle_data(self, text):
		self.stapel[-1].kinder.append(text)


# ========================================
# Text im Absatz
# ========================================
def unsichtbar(k):
	return (k.tag in WEG or 'hidden' in k.attrs or k.attrs.get('aria-hidden') == 'true'
		or k.klasse('skip-link'))


def adresse(href):
	if href.startswith('/blog/') and href.endswith('/'):
		return f'{BASIS}{href}index.md'
	if href.startswith('/'):
		return BASIS + href
	return href


def inline(k):
	"""Text eines Elements mit Links, fett und Umbrüchen, in einer Zeile."""
	teile = []
	for kind in k.kinder:
		if isinstance(kind, str):
			teile.append(kind)
		elif unsichtbar(kind):
			continue
		elif kind.tag == 'br':
			teile.append('\x00')
		elif 'data-years' in kind.attrs:
			teile.append(JAHRE)
		elif 'data-codewort' in kind.attrs:
			teile.append(f'`{text(kind)}`')
		elif kind.klasse('mail-rueckwaerts'):
			teile.append(text(kind)[::-1])
		elif kind.tag == 'a':
			ziel = kind.attrs.get('href', '')
			inhalt = inline(kind)
			# Sprungmarken im Deck gibt es im Markdown nicht
			teile.append(inhalt if ziel.startswith('#') else f'[{inhalt}]({adresse(ziel)})')
		elif kind.tag in ('strong', 'b'):
			teile.append(f'**{inline(kind)}**')
		elif kind.tag in ('em', 'i'):
			teile.append(f'*{inline(kind)}*')
		else:
			teile.append(inline(kind))
	zeile = re.sub(r'\s+', ' ', ''.join(teile))
	return re.sub(r' ?\x00 ?', '  \n', zeile).strip()


def text(k):
	return re.sub(r'\s+', ' ', ''.join(
		kind if isinstance(kind, str) else text(kind) for kind in k.kinder)).strip()


# ========================================
# Blöcke
# ========================================
# Kopfzeilen der Tabellen, je Art von Karte
TABELLEN = {
	'leistung': ['Leistung', 'Worum es geht'],
	'zahl': ['Zahl', 'Wofür'],
	'referenz': ['Jahr', 'Projekt', 'Technik'],
	'repo': ['Repository', 'Beschreibung', 'Sprache', 'Stand'],
}


def zelle(text):
	return text.replace('|', '\\|')


def karte(k):
	"""Eine Zelle in der Schiene eines Screens. Gleichartige Karten werden
	eine Tabelle, siehe TABELLEN, die übrigen Blöcke oder Listenpunkte."""
	titel = next(k.finden(lambda n: n.tag == 'h3'), None)
	absaetze = list(k.finden(lambda n: n.tag == 'p'))
	meta = next(k.finden(lambda n: n.klasse('repo__meta')), None)
	angaben = [n for n in (meta.kinder if meta else []) if isinstance(n, Knoten)]
	if k.klasse('cell--photo'):
		return [f'![{k.attrs.get("aria-label", "")}]({BASIS}/images/portrait.jpg)']
	if k.klasse('cell--stat'):
		wert = next(p for p in absaetze if p.klasse('stat__value'))
		rest = [inline(p) for p in absaetze if p is not wert]
		zahl = JAHRE if 'data-years' in wert.attrs else inline(wert)
		if rest[0] == 'mehr als':
			zahl, rest = f'{zahl}+', rest[1:]
		return [('zahl', [f'**{zahl}**', ' '.join(rest)])]
	if k.klasse('cell--referenz'):
		technik = next((text(n) for n in angaben if n.klasse('referenz__technik')), '')
		return [('referenz', [text(angaben[0]), inline(absaetze[0]), technik])]
	if k.klasse('cell--repo'):
		sprache = next((text(n) for n in angaben if n.klasse('repo__lang')), '')
		return [('repo', [f'[{text(titel)}]({k.attrs["href"]})', inline(absaetze[0]), sprache, text(angaben[-1])])]
	if titel and not k.klasse('cell--title') and k.tag == 'article':
		return [('leistung', [f'**{inline(titel)}**', ' '.join(inline(p) for p in absaetze)])]
	if not k.klasse('cell--title') and not titel:
		return ['- ' + ' '.join(inline(p) for p in absaetze)]
	return bloecke(k)


def bloecke(k, ebene=0):
	"""Überschriften, Absätze und Karten in Reihenfolge, als Liste von
	Blöcken. Aufeinanderfolgende Listenpunkte fasst schreiben() zusammen."""
	aus = []
	for kind in k.kinder:
		if not isinstance(kind, Knoten) or unsichtbar(kind):
			continue
		if kind.tag in ('h1', 'h2'):
			aus.append(f'{"#" * (2 + ebene)} {inline(kind)}')
		elif kind.tag == 'h3':
			aus.append(f'{"#" * (3 + ebene)} {inline(kind)}')
		elif kind.tag == 'p' and kind.klasse('sheet__sub'):
			aus.append(f'{"#" * (4 + ebene)} {inline(kind)}')
		elif kind.tag == 'p' and inline(kind):
			if kind.klasse('text--accent'):
				aus.append(f'> **{inline(kind)}**')
			elif kind.klasse('text--muted'):
				aus.append(f'*{inline(kind)}*')
			else:
				aus.append(inline(kind))
		elif kind.klasse('cell'):
			aus += karte(kind)
		elif kind.klasse('btn-row'):
			for a in kind.finden(lambda n: n.tag == 'a'):
				ziel = 'mailto:info@wiredframe.de' if a.attrs.get('id') == 'email-link' else adresse(a.attrs['href'])
				aus.append(f'- **[{inline(a)}]({ziel})**')
		else:
			aus += bloecke(kind, ebene)
	return aus


def schreiben(bloecke):
	"""Fügt die Blöcke zusammen. Listenpunkte und Tabellenzeilen derselben
	Art rücken ohne Leerzeile aneinander, vor der ersten Tabellenzeile
	steht der Kopf."""
	zeilen, vorher = [], None
	for b in bloecke:
		art = b[0] if isinstance(b, tuple) else ('liste' if b.startswith('- ') else None)
		if art != vorher or art is None:
			if zeilen:
				zeilen.append('')
			if isinstance(b, tuple):
				kopf = TABELLEN[art]
				zeilen += ['| ' + ' | '.join(kopf) + ' |', '|' + '|'.join('---' for _ in kopf) + '|']
		zeilen.append('| ' + ' | '.join(zelle(z) for z in b[1]) + ' |' if isinstance(b, tuple) else b)
		vorher = art
	return '\n'.join(zeilen)


def main():
	leser = Leser()
	leser.feed(SEITE.read_text(encoding='utf-8'))
	wurzel = leser.wurzel
	titel = text(next(wurzel.finden(lambda n: n.tag == 'title')))

	teile = [
		'# wiredframe',
		f'> {titel}',
	]
	for screen in wurzel.finden(lambda n: n.tag == 'section' and n.klasse('screen')):
		teile += ['---', schreiben(bloecke(screen))]
	impressum = next(wurzel.finden(lambda n: n.attrs.get('id') == 'impressum'))
	teile += ['---', schreiben(bloecke(impressum))]

	ZIEL.write_text('\n\n'.join(teile) + '\n', encoding='utf-8')
	print(f'{SEITE.name} -> {ZIEL.name}')


if __name__ == '__main__':
	main()
