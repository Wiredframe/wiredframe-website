#!/usr/bin/env python3
"""
Schreibt die Daten der Terminal-Fassung unter tui/.

    python3 werkzeuge/tui.py

Erzeugt  tui/js/daten.js  mit allem, was die Anwendung nicht von Hand
kennt: Repositories samt Releases und Homebrew-Befehl, die anonymen
Projekte, Kennzahlen der Referenzliste, die Mitwisser und daraus die
Rubrik „Neues“.

Woher was kommt:

    Repositories, Releases, Tap   GitHub-API, wie in repos.py
    anonyme Projekte              data/references.json, anonymisiert mit
                                  den Regeln aus referenzen.py
    Kennzahlen                    data/references.json, nur Summen
    Mitwisser                     index.html, wie claude-stats.py sie schreibt

Wie bei referenzen.py gilt: was der Browser holt, kann der Besucher auch
holen. Aus der Referenzliste wandern deshalb nur Jahr, Gattung, Branche und
Technik in die Datei, dazu Zählungen. Die echten Namen lädt tui.js erst
nach dem Codewort, wie die grafische Seite.
"""

import base64
import collections
import datetime
import json
import re
import shutil
import subprocess
import sys

import referenzen
import repos as repos_werkzeug
from seite import MONATE, SEITE, WURZEL

ZIEL = WURZEL / 'tui' / 'js' / 'daten.js'
USER = repos_werkzeug.USER
NEUES = 20

# Die Sinnbilder aus referenzen.py als Wort
FELDER = {
	'digital': 'IT & Elektronik', 'sonst': 'Sonstige', 'reise': 'Tourismus & Gastgewerbe',
	'technik': 'Industrie & Technik', 'gesund': 'Gesundheit & Soziales', 'handel': 'Handel',
	'medien': 'Medien, Bildung & Kultur', 'finanz': 'Finanzen & Immobilien', 'energie': 'Energie & Umwelt',
	'amt': 'Öffentliche Hand', 'wohnen': 'Bauen & Wohnen', 'sport': 'Sport & Vereine',
}


def gh(pfad):
	"""Fragt die GitHub-API über gh ab. Ohne gh gibt es eben keine Releases."""
	if not shutil.which('gh'):
		return None
	lauf = subprocess.run(['gh', 'api', pfad], capture_output=True, text=True)
	if lauf.returncode != 0:
		print(f'gh api {pfad} scheiterte: {lauf.stderr.strip()}', file=sys.stderr)
		return None
	return json.loads(lauf.stdout)


def tag(iso):
	return iso[:10] if iso else ''


# ----------------------------------------------------------------------
# Repositories
# ----------------------------------------------------------------------
def tap():
	"""Ordnet jedem Repo den Homebrew-Befehl zu, wenn der Tap eins kennt.
	Die Zuordnung steht in der Formel selbst, über die Download-Adresse."""
	befehle = {}
	for ordner, art in (('Casks', '--cask '), ('Formula', '')):
		for datei in gh(f'repos/{USER}/homebrew-tap/contents/{ordner}') or []:
			name = datei['name'].removesuffix('.rb')
			inhalt = gh(f'repos/{USER}/homebrew-tap/contents/{ordner}/{datei["name"]}')
			if not inhalt:
				continue
			text = base64.b64decode(inhalt['content']).decode('utf-8', 'replace')
			treffer = re.search(rf'github\.com/{USER}/([\w.-]+)', text, re.I)
			if treffer:
				repo = treffer[1].removesuffix('.git')
				befehle[repo.lower()] = f'brew install {art}{USER.lower()}/tap/{name}'
	return befehle


def repositories():
	roh = [r for r in repos_werkzeug.holen() if not r.get('archived')]
	befehle = tap()
	ausgabe = []
	for r in roh:
		releases = []
		for rel in gh(f'repos/{USER}/{r["name"]}/releases?per_page=10') or []:
			if rel.get('draft'):
				continue
			releases.append({
				'tag': rel['tag_name'],
				'name': rel.get('name') or rel['tag_name'],
				'datum': tag(rel.get('published_at')),
				'notizen': (rel.get('body') or '').strip(),
			})
		ausgabe.append({
			'name': r['name'],
			'url': r['html_url'],
			'beschreibung': r.get('description') or repos_werkzeug.OHNE_BESCHREIBUNG,
			'sprache': r.get('language') or '',
			'geaendert': tag(r.get('pushed_at') or r['updated_at']),
			'monat': repos_werkzeug.monat(r.get('pushed_at') or r['updated_at']),
			'erstellt': tag(r.get('created_at')),
			'sterne': r.get('stargazers_count', 0),
			'brew': befehle.get(r['name'].lower(), ''),
			'releases': releases,
		})
	return ausgabe


# ----------------------------------------------------------------------
# Projekte
# ----------------------------------------------------------------------
def projekte(quelle):
	"""Die anonymen Projekte, nach denselben Regeln wie die Karten der
	grafischen Seite. Zusätzlich zum Satz stehen Gattung und Branche einzeln
	drin, beides steckt ohnehin schon im Satz."""
	ausgabe, gesehen = [], set()
	for eintrag in quelle:
		if len(ausgabe) == referenzen.ANZAHL:
			break
		typ = (eintrag.get('Typ') or '').strip()
		branche = (eintrag.get('Branche') or '').strip()
		gattung = referenzen.GATTUNG.get(typ, 'Projekt')
		satz = referenzen.satz_fuer(gattung, branche) if branche else gattung
		if satz in gesehen:
			continue
		gesehen.add(satz)
		ausgabe.append({
			'jahr': (eintrag.get('Jahr') or '').strip(),
			'satz': satz,
			'gattung': gattung,
			'branche': referenzen.erster_teil(branche),
			'technik': referenzen.TECHNIK.get(typ, ''),
		})
	return ausgabe


def kennzahlen(quelle):
	gattungen = collections.Counter(referenzen.GATTUNG.get((e.get('Typ') or '').strip(), 'Projekt') for e in quelle)
	techniken = collections.Counter(referenzen.TECHNIK.get((e.get('Typ') or '').strip(), '') for e in quelle)
	techniken.pop('', None)
	branchen = collections.Counter(referenzen.icon_fuer(e.get('Branche') or '') for e in quelle)
	jahre = sorted(int(e['Jahr']) for e in quelle if (e.get('Jahr') or '').isdigit())
	return {
		'dokumentiert': len(quelle),
		'von': jahre[0] if jahre else None,
		'bis': jahre[-1] if jahre else None,
		'gattungen': gattungen.most_common(),
		'techniken': techniken.most_common(),
		'felder': [[FELDER.get(k, k), n] for k, n in branchen.most_common()],
		'jahre': sorted(collections.Counter(jahre).items()),
	}


# ----------------------------------------------------------------------
# Mitwisser
# ----------------------------------------------------------------------
def mitwisser():
	seite = SEITE.read_text(encoding='utf-8')
	block = seite[seite.index('<!-- mitwisser:karten -->'):seite.index('<!-- /mitwisser:karten -->')]
	zahlen = []
	for karte in re.findall(r'<article class="cell cell--stat">(.*?)</article>', block, re.S):
		mehr = 'mehr als' in karte
		wert = re.search(r'stat__value">([^<]+)<', karte)[1]
		texte = [t for t in re.findall(r'class="text">([^<]+)<', karte) if t != 'mehr als']
		zahlen.append({'wert': ('&gt;' if mehr else '') + wert, 'text': texte[-1]})
	schrift = re.search(r'data-mitwisser="schriftfuehrer">([^<]+)<', seite)[1]
	stand = re.search(r'data-mitwisser="stand">([^<]+)<', seite)[1]
	t, m, j = re.match(r'(\d+)\. (\S+) (\d{4})', stand).groups()
	iso = f'{j}-{MONATE.index(m) + 1:02d}-{int(t):02d}'
	return {'zahlen': zahlen, 'schriftfuehrer': schrift, 'stand': stand, 'datum': iso}


# ----------------------------------------------------------------------
# Neues
# ----------------------------------------------------------------------
def neues(repos, wissen):
	"""Eine Zeitleiste aus dem, was ein Datum trägt. Pro Repo zählt nur das
	jüngste Release, sonst stünden fünf Patch-Versionen eines Nachmittags
	untereinander. Ein erstes Release (1.0.0) bekommt einen eigenen Eintrag."""
	eintraege = []
	for r in repos:
		if r['releases']:
			neu, erstes = r['releases'][0], r['releases'][-1]
			version = neu['tag'].lstrip('v')
			ziel = f'code/{r["name"]}'
			if re.fullmatch(r'v?1\.0(\.0)?', erstes['tag']) and erstes['datum'] == neu['datum']:
				# Am Tag des ersten Release zählt nur, dass es da ist
				eintraege.append({'datum': neu['datum'], 'art': 'Neu',
					'titel': f'{r["name"]} {version} ist erschienen', 'text': r['beschreibung'], 'ziel': ziel})
				continue
			eintraege.append({'datum': neu['datum'], 'art': 'Release', 'titel': f'{r["name"]} {version}',
				'text': r['beschreibung'], 'ziel': ziel})
			if erstes is not neu and re.fullmatch(r'v?1\.0(\.0)?', erstes['tag']):
				eintraege.append({'datum': erstes['datum'], 'art': 'Neu', 'titel': f'{r["name"]} ist erschienen',
					'text': r['beschreibung'], 'ziel': ziel})
		else:
			eintraege.append({'datum': r['geaendert'], 'art': 'Code', 'titel': f'{r["name"]} geändert',
				'text': r['beschreibung'], 'ziel': f'code/{r["name"]}'})
	eintraege.append({'datum': wissen['datum'], 'art': 'Stand', 'titel': 'Neue Zahlen der Mitwisser',
		'text': f'Schriftführer war meistens {wissen["schriftfuehrer"]}.', 'ziel': 'mitwisser'})
	eintraege.sort(key=lambda e: e['datum'], reverse=True)
	return eintraege[:NEUES]


def main():
	quelle = json.loads(referenzen.QUELLE.read_text(encoding='utf-8'))
	repos = repositories()
	wissen = mitwisser()
	daten = {
		'stand': datetime.date.today().isoformat(),
		'repos': repos,
		'projekte': projekte(quelle),
		'kennzahlen': kennzahlen(quelle),
		'mitwisser': wissen,
		'neues': neues(repos, wissen),
	}
	text = json.dumps(daten, ensure_ascii=False, indent='\t')
	ZIEL.write_text('// Erzeugt von werkzeuge/tui.py, nicht von Hand bearbeiten.\n'
		f'window.WF = {text};\n', encoding='utf-8')

	print(f'{ZIEL.relative_to(WURZEL)}: {len(repos)} Repos, '
		f'{sum(len(r["releases"]) for r in repos)} Releases, '
		f'{sum(1 for r in repos if r["brew"])} mit Homebrew, '
		f'{len(daten["projekte"])} Projekte, {len(daten["neues"])} Neuigkeiten')

	# Gegenprobe wie in referenzen.py: aus den geschützten Feldern darf
	# nichts in der Ausgabe stehen.
	ausgabe = set(re.findall(r'[a-zäöüß]{4,}', json.dumps(daten['projekte'], ensure_ascii=False).lower()))
	eigen = set()
	for e in quelle:
		eigen.update(w.lower() for w in re.findall(r'[A-Za-zÄÖÜäöüß]{4,}', referenzen.erster_teil(e.get('Branche') or '')))
	for v in list(referenzen.GATTUNG.values()) + list(referenzen.TECHNIK.values()) + [t for _, t in referenzen.TRAEGER]:
		eigen.update(w.lower() for w in re.findall(r'[A-Za-zÄÖÜäöüß]{4,}', v))
	eigen.update(('bereich', 'unternehmen'))
	verraeter = {f'{feld}: {w}' for e in quelle for feld in ('Projekttitel', 'Agentur', 'URL', 'Image', 'Beschreibung')
		for w in re.findall(r'[A-Za-zÄÖÜäöüß]{4,}', e.get(feld) or '') if w.lower() in ausgabe and w.lower() not in eigen}
	if verraeter:
		sys.exit('ACHTUNG, Wörter aus geschützten Feldern in der Ausgabe:\n    ' + '\n    '.join(sorted(verraeter)))
	print('Gegenprobe bestanden.')


if __name__ == '__main__':
	main()
