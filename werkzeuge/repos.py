#!/usr/bin/env python3
"""
Holt die öffentlichen GitHub-Repositories für die Section #repos.

    python3 werkzeuge/repos.py

Fragt die GitHub-API ab (über gh, wenn angemeldet, sonst ohne Anmeldung)
und schreibt die Karten in index.html, zwischen <!-- repos:karten --> und
<!-- /repos:karten -->. Archivierte Repositories bleiben draußen.

Früher holte der Browser jedes Besuchers die Liste selbst. Ohne Anmeldung
erlaubt GitHub aber nur 60 Anfragen pro Stunde und IP, hinter Mobilfunk-
oder Firmenanschlüssen war die Grenze schnell erreicht. Statisch gibt es
das Problem nicht, dafür steht statt „vor 3 Tagen“ der Monat der letzten
Änderung auf der Karte.
"""

import datetime
import html
import json
import shutil
import subprocess
import sys
import urllib.request

from seite import MONATE, SEITE, einsetzen

USER = 'Wiredframe'
PFAD = f'users/{USER}/repos?per_page=100&sort=pushed&direction=desc'

# Farben wie auf GitHub
SPRACHEN = {
	'Swift': '#F05138', 'HTML': '#e34c26', 'CSS': '#563d7c', 'SCSS': '#c6538c', 'TypeScript': '#3178c6',
	'JavaScript': '#f1e05a', 'Ruby': '#701516', 'Python': '#3572A5', 'Shell': '#89e051', 'Go': '#00ADD8',
	'Rust': '#dea584', 'Java': '#b07219', 'Kotlin': '#A97BFF', 'PHP': '#4F5D95', 'C++': '#f34b7d', 'C#': '#178600',
}
OHNE_BESCHREIBUNG = 'Noch ohne Beschreibung, aber öffentlich einsehbar.'


def holen():
	if shutil.which('gh'):
		lauf = subprocess.run(['gh', 'api', PFAD], capture_output=True, text=True)
		if lauf.returncode == 0:
			return json.loads(lauf.stdout)
		print(f'gh api scheiterte, versuche es ohne Anmeldung: {lauf.stderr.strip()}', file=sys.stderr)
	anfrage = urllib.request.Request(f'https://api.github.com/{PFAD}',
		headers={'Accept': 'application/vnd.github+json'})
	with urllib.request.urlopen(anfrage, timeout=20) as antwort:
		return json.load(antwort)


def monat(iso):
	d = datetime.datetime.fromisoformat(iso.replace('Z', '+00:00'))
	return f'{MONATE[d.month - 1]} {d.year}'


def karte(r):
	e = html.escape
	zeilen = [
		f'<a class="cell cell--repo" href="{e(r["html_url"])}" target="_blank" rel="noopener">',
		'\t<span class="repo__icon"><span class="repo__glyph icon--repo"></span></span>',
		f'\t<h3 class="subtitle">{e(r["name"])}</h3>',
		f'\t<p class="text repo__desc">{e(r.get("description") or OHNE_BESCHREIBUNG)}</p>',
		'\t<span class="repo__meta">',
	]
	if r.get('language'):
		farbe = SPRACHEN.get(r['language'], '#7d8b88')
		zeilen.append(f'\t\t<span class="repo__lang"><span class="repo__dot" style="--dot:{farbe}"></span>{e(r["language"])}</span>')
	zeilen.append(f'\t\t<span>{monat(r.get("pushed_at") or r["updated_at"])}</span>')
	return zeilen + ['\t</span>', '</a>']


def main():
	repos = [r for r in holen() if not r.get('archived')]
	if not repos:
		sys.exit('GitHub lieferte keine Repositories, index.html bleibt unverändert.')
	markup = [z for r in repos for z in karte(r)]
	SEITE.write_text(einsetzen(SEITE.read_text(encoding='utf-8'), 'repos:karten', markup), encoding='utf-8')
	print(f'{len(repos)} Repositories -> {SEITE.name}')
	for r in repos:
		print(f'  {r["name"]:32} {r.get("language") or "":12} {monat(r.get("pushed_at") or r["updated_at"])}')


if __name__ == '__main__':
	main()
