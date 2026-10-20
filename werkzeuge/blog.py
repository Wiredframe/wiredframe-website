#!/usr/bin/env python3
"""
Baut die Mitschrift, den Blog unter /blog/, aus Markdown.

    python3 werkzeuge/blog.py         baut alle Seiten, Bilder nur bei Bedarf
    python3 werkzeuge/blog.py --neu   rechnet auch alle Bilder neu

Quelle ist je Beitrag ein Ordner in _blog/:

    _blog/2026-10-20-wiredframe/
        beitrag.md
        bilder/…

Der Ordnername trägt Erscheinungsdatum und Adresse, aus diesem wird
/blog/wiredframe/. Titel und Teaser kommen aus dem Markdown selbst: die
erste #-Überschrift und die Zeile ganz in *Kursiv* direkt darunter. Fehlt
die kursive Zeile, wird der erste Absatz gekürzt. Ein Kopf ist nicht nötig,
darf aber ganz oben stehen, für das, was das Markdown nicht hergibt:

    ---
    aktualisiert: 2026-11-02
    entwurf: ja
    ---

„aktualisiert“ setzt du bewusst nach einer inhaltlichen Änderung, nicht
nach jedem Tippfehler. Es erscheint auf der Seite, in den strukturierten
Daten und in der Sitemap. Ein Entwurf wird nicht gebaut.

Ein Bild auf eigener Zeile wird zur Abbildung. Steht direkt darunter eine
Zeile ganz in Kursiv, ist sie die Bildunterschrift. Bilder erscheinen in
ihrer natürlichen Größe, gerechnet als Retina-Aufnahme (halbe Pixelzahl),
höchstens so breit wie das Blatt und höchstens 640 Pixel hoch. Eine Fensteraufnahme mit eigenem Schatten
und eigenen runden Ecken bekommt den Titel "freigestellt", dann zeichnet die
Seite keinen Radius und keinen Schatten darum:

    ![DropMe mit drei Dateien](bilder/ablage.png "freigestellt") Die Bilder gehen als
WebP in 1200 und 2400 Pixel Breite raus, das erste zusätzlich als JPG für
die Vorschau beim Teilen. Gerechnet wird nur neu, was jünger ist als seine
Ausgabe, oder alles mit --neu.

Der Ordner blog/ gehört ganz diesem Skript: jeder Lauf schreibt alle Seiten
neu und löscht dort, was keine Quelle mehr hat. Von Hand gehört dort nichts
hinein. Dazu kommen die Einträge in sitemap.xml und llms.txt, jeweils
zwischen <!-- blog:… --> und <!-- /blog:… -->.

Der Unterstrich vor _blog ist Absicht, wie bei _archiv: GitHub Pages lässt
Jekyll laufen, und Jekyll veröffentlicht solche Ordner nicht. Die Originale
bleiben so im Repository, aber nicht auf dem Server.

Braucht cwebp (Homebrew: webp), sips bringt macOS mit.
"""

import datetime
import hashlib
import html
import json
import math
import re
import shutil
import subprocess
import sys

from seite import MONATE, WURZEL, einsetzen

QUELLEN = WURZEL / '_blog'
ZIEL = WURZEL / 'blog'
CSS = WURZEL / 'css' / 'blog.css'
SITEMAP = WURZEL / 'sitemap.xml'
LLMS = WURZEL / 'llms.txt'
BASIS = 'https://www.wiredframe.de'

NAME = 'Mitschrift'
INTRO = ('Abgehörte Notizen aus der Werkstatt: woran ich gerade arbeite, was dabei schiefging '
	'und was ich daraus gelernt habe. Ganz ohne Codewort.')
BESCHREIBUNG = ('Die Mitschrift von wiredframe: Notizen von Ulf Schuster, UI/UX Designer, '
	'über eigene Projekte, Werkzeuge und Agentic Coding.')

BREITEN = (1200, 2400)
# Höchste Anzeigehöhe einer Abbildung in CSS-Pixeln
HOEHE = 640
# Wörter pro Minute. Eher langsam angesetzt, die Texte sind technisch.
TEMPO = 200

ORDNER = re.compile(r'(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)')
BILD = re.compile(r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$')
PUNKT = re.compile(r'\s*[-*]\s+(.*)')
NUMMER = re.compile(r'\s*(\d+)\.\s+(.*)')


# ========================================
# Markdown
# ----------------------------------------
# Nur das, was die Beiträge brauchen: Überschriften, Absätze, Listen,
# Zitate, Codeblöcke, Abbildungen und im Text Code, Links, fett und
# kursiv. Was darüber hinausgeht, kommt als Text durch und fällt auf.
# ========================================
def inline(text):
	codes = []

	def merken(m):
		codes.append(f'<code>{html.escape(m[1])}</code>')
		return f'\x00{len(codes) - 1}\x00'

	text = re.sub(r'`([^`]+)`', merken, text)
	text = html.escape(text, quote=False)
	text = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)',
		lambda m: f'<a href="{m[2].replace(chr(34), "&quot;")}">{m[1]}</a>', text)
	text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
	text = re.sub(r'(?<![\w*])\*(?![\s*])(.+?)(?<![\s*])\*(?![\w*])', r'<em>\1</em>', text)
	return re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m[1])], text)


def schlicht(text):
	"""Markdown einer Zeile ohne Auszeichnung, für Teaser und Metadaten."""
	text = re.sub(r'\[([^\]]+)\]\([^)]*\)', r'\1', text)
	return re.sub(r'[*`]', '', text).strip()


def ganz_kursiv(zeile):
	z = zeile.strip()
	return len(z) > 2 and z[0] == '*' and z[-1] == '*' and z[1] != '*' and z[-2] != '*'


def anker(text, vergeben):
	a = schlicht(text).lower()
	for alt, neu in (('ä', 'ae'), ('ö', 'oe'), ('ü', 'ue'), ('ß', 'ss')):
		a = a.replace(alt, neu)
	a = re.sub(r'[^a-z0-9]+', '-', a).strip('-') or 'abschnitt'
	basis, n = a, 2
	while a in vergeben:
		a, n = f'{basis}-{n}', n + 1
	vergeben.add(a)
	return a


def markdown(text, abbildung):
	"""Gibt Titel, Teaser, die HTML-Zeilen des Textes und die Wortzahl zurück.
	abbildung(alt, pfad, titel, unterschrift, erste) liefert das Markup eines Bildes."""
	zeilen = text.splitlines()
	raus, absatz, anker_vergeben = [], [], set()
	titel = teaser = None
	bilder = 0
	i = 0

	def absatz_schliessen():
		nonlocal teaser
		if not absatz:
			return
		roh = ' '.join(z.strip() for z in absatz)
		absatz.clear()
		# Die kursive Zeile direkt unter dem Titel ist der Teaser
		if titel and teaser is None and not raus and ganz_kursiv(roh):
			teaser = schlicht(roh)
			return
		raus.append(f'<p>{inline(roh)}</p>')

	while i < len(zeilen):
		zeile = zeilen[i]
		roh = zeile.strip()

		if not roh:
			absatz_schliessen()
			i += 1
			continue

		if m := re.match(r'(#{1,6})\s+(.*)', roh):
			absatz_schliessen()
			stufe, inhalt = len(m[1]), m[2].strip()
			if stufe == 1 and titel is None:
				titel = schlicht(inhalt)
			else:
				stufe = max(stufe, 2)
				raus.append(f'<h{stufe} id="{anker(inhalt, anker_vergeben)}">{inline(inhalt)}</h{stufe}>')
			i += 1
			continue

		if m := BILD.match(roh):
			absatz_schliessen()
			i += 1
			# Bildunterschrift: die nächste Zeile ganz in Kursiv, Leerzeilen dazwischen erlaubt
			j = i
			while j < len(zeilen) and not zeilen[j].strip():
				j += 1
			unterschrift = None
			if j < len(zeilen) and ganz_kursiv(zeilen[j]) and not BILD.match(zeilen[j].strip()):
				unterschrift = inline(zeilen[j].strip()[1:-1])
				i = j + 1
			raus.extend(abbildung(m[1], m[2], m[3], unterschrift, bilder == 0))
			bilder += 1
			continue

		if roh.startswith('```'):
			absatz_schliessen()
			code = []
			i += 1
			while i < len(zeilen) and not zeilen[i].strip().startswith('```'):
				code.append(zeilen[i])
				i += 1
			i += 1
			raus.append('<pre><code>' + html.escape('\n'.join(code)) + '</code></pre>')
			continue

		if re.fullmatch(r'(\*\s*){3,}|(-\s*){3,}', roh):
			absatz_schliessen()
			raus.append('<hr>')
			i += 1
			continue

		if roh.startswith('>'):
			absatz_schliessen()
			zitat = []
			while i < len(zeilen) and zeilen[i].strip().startswith('>'):
				zitat.append(zeilen[i].strip()[1:].strip())
				i += 1
			absaetze = [' '.join(t.split('\n')) for t in '\n'.join(zitat).split('\n\n') if t.strip()]
			raus.append('<blockquote>' + ''.join(f'<p>{inline(a)}</p>' for a in absaetze) + '</blockquote>')
			continue

		if PUNKT.match(zeile) or NUMMER.match(zeile):
			absatz_schliessen()
			nummeriert = bool(NUMMER.match(zeile))
			muster = NUMMER if nummeriert else PUNKT
			start = int(NUMMER.match(zeile)[1]) if nummeriert else 1
			punkte = []
			while i < len(zeilen) and zeilen[i].strip():
				if m := muster.match(zeilen[i]):
					punkte.append(m[m.lastindex])
				elif punkte:
					punkte[-1] += ' ' + zeilen[i].strip()
				i += 1
			tag = 'ol' if nummeriert else 'ul'
			auf = f'<ol start="{start}">' if nummeriert and start != 1 else f'<{tag}>'
			raus.append(auf)
			raus.extend(f'\t<li>{inline(p)}</li>' for p in punkte)
			raus.append(f'</{tag}>')
			continue

		absatz.append(zeile)
		i += 1

	absatz_schliessen()

	if not titel:
		raise ValueError('keine #-Überschrift als Titel')
	if teaser is None:
		erster = next((re.sub(r'<[^>]+>', '', z) for z in raus if z.startswith('<p>')), '')
		erster = html.unescape(erster)
		teaser = erster if len(erster) <= 200 else erster[:200].rsplit(' ', 1)[0] + ' …'
	if not teaser:
		raise ValueError('kein Teaser: unter den Titel eine Zeile ganz in *Kursiv* setzen')

	ohne_bilder = re.sub(r'!\[[^\]]*\]\([^)]*\)', '', text)
	woerter = len(re.findall(r'\w+', schlicht(ohne_bilder)))
	return titel, teaser, raus, woerter


# ========================================
# Bilder
# ========================================
def masse(pfad):
	aus = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(pfad)],
		capture_output=True, text=True, check=True).stdout
	return int(re.search(r'pixelWidth: (\d+)', aus)[1]), int(re.search(r'pixelHeight: (\d+)', aus)[1])


def veraltet(ausgabe, quelle, neu):
	return neu or not ausgabe.exists() or ausgabe.stat().st_mtime < quelle.stat().st_mtime


def webp(quelle, ausgabe, breite, original):
	befehl = ['cwebp', '-quiet', '-q', '85', '-sharp_yuv', '-metadata', 'none']
	if breite < original:
		befehl += ['-resize', str(breite), '0']
	subprocess.run(befehl + [str(quelle), '-o', str(ausgabe)], check=True)


def vorschau(quelle, ausgabe):
	subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '--resampleWidth', '1200',
		str(quelle), '--out', str(ausgabe)], capture_output=True, check=True)


def name_von(pfad):
	n = pfad.stem.lower()
	return re.sub(r'[^a-z0-9]+', '-', n).strip('-')


# ========================================
# Beiträge lesen
# ========================================
def kopf_lesen(text):
	m = re.match(r'---\n(.*?)\n---\n', text, re.S)
	if not m:
		return {}, text
	felder = {}
	for zeile in m[1].splitlines():
		if ':' in zeile:
			k, v = zeile.split(':', 1)
			felder[k.strip().lower()] = v.strip()
	return felder, text[m.end():]


def datum_aus(wert, wo):
	try:
		return datetime.date.fromisoformat(wert)
	except ValueError:
		sys.exit(f'{wo}: „{wert}“ ist kein Datum, erwartet wird JJJJ-MM-TT.')


def lang(d):
	return f'{d.day}. {MONATE[d.month - 1]} {d.year}'


def lesezeit(woerter):
	minuten = max(1, math.ceil(woerter / TEMPO))
	return '1 Minute Lesezeit' if minuten == 1 else f'{minuten} Minuten Lesezeit'


def beitrag_bauen(ordner, neu, erwartet, stand):
	m = ORDNER.fullmatch(ordner.name)
	if not m:
		sys.exit(f'_blog/{ordner.name}: der Ordner muss JJJJ-MM-TT-adresse heißen, '
			'die Adresse klein, mit Ziffern und Bindestrichen.')
	quelle = ordner / 'beitrag.md'
	if not quelle.exists():
		sys.exit(f'_blog/{ordner.name}: beitrag.md fehlt.')

	roh = quelle.read_text(encoding='utf-8').lstrip('\ufeff').replace('\r\n', '\n')
	felder, text = kopf_lesen(roh)
	if felder.get('entwurf', '').lower() in ('ja', 'true', '1'):
		return None

	slug = m[2]
	datum = datum_aus(m[1], f'_blog/{ordner.name}')
	aktualisiert = datum_aus(felder['aktualisiert'], f'{quelle.relative_to(WURZEL)}') if felder.get('aktualisiert') else None
	if aktualisiert and aktualisiert <= datum:
		aktualisiert = None
	ausgabe = ZIEL / slug
	ausgabe.mkdir(parents=True, exist_ok=True)
	url = f'/blog/{slug}/'
	b = {'slug': slug, 'datum': datum, 'aktualisiert': aktualisiert, 'url': url,
		'cover': None, 'og': None, 'og_alt': '', 'ausgabe': ausgabe}
	namen = {}

	def abbildung(alt, pfad, titel, unterschrift, erste):
		bild = (ordner / pfad).resolve()
		if not bild.is_file():
			sys.exit(f'{quelle.relative_to(WURZEL)}: Bild nicht gefunden: {pfad}')
		breite, hoehe = masse(bild)
		name = name_von(bild) or 'bild'
		# a.png und a.jpg, oder bilder/a.png und alt/a.png, ergäben dieselbe Ausgabe
		if namen.setdefault(name, bild) != bild:
			sys.exit(f'{quelle.relative_to(WURZEL)}: {pfad} und {namen[name].relative_to(ordner.resolve())} '
				f'ergeben beide „{name}“, eins bitte umbenennen.')
		varianten = sorted({min(w, breite) for w in BREITEN})
		for w in varianten:
			datei = ausgabe / f'{name}-{w}.webp'
			erwartet.add(datei)
			if veraltet(datei, bild, neu):
				webp(bild, datei, w, breite)
				stand['neu'] += 1
			else:
				stand['da'] += 1
		frei = titel == 'freigestellt'
		if erste:
			b['cover'] = {'name': name, 'varianten': varianten, 'breite': breite, 'hoehe': hoehe, 'alt': alt, 'frei': frei}
		# Vorschau beim Teilen aus dem ersten gerahmten Bild. Ein freigestelltes
		# hätte als JPG schwarze Ecken, ohne gerahmtes bleibt das og-image.
		if not frei and not b['og']:
			# Nach der Quelle benannt: wird ein anderes Bild das erste, entsteht
			# eine neue Datei, statt dass die alte als aktuell durchgeht
			og = ausgabe / f'vorschau-{name}.jpg'
			erwartet.add(og)
			if veraltet(og, bild, neu):
				vorschau(bild, og)
			b['og'] = f'{url}{og.name}'
			b['og_alt'] = alt
		srcset = ', '.join(f'{url}{name}-{w}.webp {w}w' for w in varianten)
		# Angezeigt in halber Pixelgröße (Retina), aber nie höher als HOEHE:
		# ein Handy-Screenshot im Hochformat stünde sonst über zwei Bildschirme
		b_css, h_css = breite // 2, hoehe // 2
		if h_css > HOEHE:
			b_css, h_css = round(b_css * HOEHE / h_css), HOEHE
		groesse = f'(max-width: {b_css + 80}px) 92vw, {b_css}px'
		laden = '' if erste else ' loading="lazy"'
		klasse = ' class="freigestellt"' if frei else ''
		zeilen = ['<figure>',
			f'\t<img{klasse} src="{url}{name}-{varianten[0]}.webp" srcset="{srcset}" sizes="{groesse}"',
			f'\t\twidth="{b_css}" height="{h_css}" alt="{html.escape(alt)}"{laden} decoding="async">']
		if unterschrift:
			zeilen.append(f'\t<figcaption>{unterschrift}</figcaption>')
		return zeilen + ['</figure>']

	try:
		titel, teaser, text_html, woerter = markdown(text, abbildung)
	except ValueError as e:
		sys.exit(f'{quelle.relative_to(WURZEL)}: {e}')
	b.update(titel=titel, teaser=teaser, html=text_html, woerter=woerter)
	return b


# ========================================
# Seiten
# ========================================
def css_version():
	return hashlib.sha1(CSS.read_bytes()).hexdigest()[:8]


def json_ld(daten):
	roh = json.dumps(daten, ensure_ascii=False, indent='\t').replace('</', '<\\/')
	return ['<script type="application/ld+json">', *roh.splitlines(), '</script>']


def seite(titel, beschreibung, url, typ, bild, extra, daten, inhalt, zurueck):
	"""zurueck ist (Ziel, Beschriftung) des Pfeils oben links."""
	e = html.escape
	bild_meta = []
	if bild:
		bild_meta = [f'<meta property="og:image" content="{BASIS}{bild}">',
			f'<meta name="twitter:image" content="{BASIS}{bild}">']
	kopf = [
		'<!DOCTYPE html>',
		'<!-- Erzeugt von werkzeuge/blog.py aus _blog/. Nicht von Hand bearbeiten, der nächste Lauf überschreibt es. -->',
		'<html lang="de">',
		'',
		'<head>',
		'\t<meta charset="utf-8">',
		f'\t<title>{e(titel)}</title>',
		f'\t<meta name="description" content="{e(beschreibung)}">',
		'\t<meta name="author" content="Ulf Schuster / wiredframe">',
		f'\t<link rel="canonical" href="{BASIS}{url}">',
		f'\t<meta property="og:type" content="{typ}">',
		f'\t<meta property="og:url" content="{BASIS}{url}">',
		f'\t<meta property="og:title" content="{e(titel)}">',
		f'\t<meta property="og:description" content="{e(beschreibung)}">',
		'\t<meta property="og:site_name" content="wiredframe">',
		'\t<meta property="og:locale" content="de_DE">',
		'\t<meta name="twitter:card" content="summary_large_image">',
		*[f'\t{z}' for z in bild_meta + extra],
		'\t<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
		'\t<meta name="theme-color" content="#e2ebe6">',
		'\t<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">',
		*[f'\t{z}' for z in json_ld(daten)],
		f'\t<link rel="stylesheet" href="/css/blog.css?v={css_version()}">',
		'\t<link rel="shortcut icon" href="/images/shortcut-icon.svg" type="image/x-icon">',
		'\t<link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">',
		'</head>',
		'',
		'<body>',
	]
	# Der Pfeil sitzt oben links im Blatt, direkt nach <main>
	pfeil = [
		f'\t<a class="zurueck" href="{zurueck[0]}" aria-label="{zurueck[1]}">',
		'\t\t<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"',
		'\t\t\tstroke-linejoin="round" aria-hidden="true">',
		'\t\t\t<polyline points="15 18 9 12 15 6"></polyline>',
		'\t\t</svg>',
		'\t</a>',
	]
	inhalt = inhalt[:1] + pfeil + inhalt[1:]
	fuss = [
		'\t<footer class="fuss">',
		'\t\t<a href="/">wiredframe.de</a>',
		'\t\t<a href="/#impressum">Impressum &amp; Datenschutz</a>',
		'\t</footer>',
		'</body>',
		'',
		'</html>',
	]
	return '\n'.join(kopf + [f'\t{z}' if z else '' for z in inhalt] + fuss) + '\n'


def meta(b):
	teile = [f'<time datetime="{b["datum"].isoformat()}">{lang(b["datum"])}</time>']
	if b['aktualisiert']:
		a = b['aktualisiert']
		teile.append(f'<span>aktualisiert am <time datetime="{a.isoformat()}">{lang(a)}</time></span>')
	teile.append(f'<span>{lesezeit(b["woerter"])}</span>')
	return f'<p class="meta">{"".join(teile)}</p>'


def beitragsseite(b, neuer, aelter):
	e = html.escape
	geaendert = b['aktualisiert'] or b['datum']
	extra = [f'<meta property="article:published_time" content="{b["datum"].isoformat()}">',
		f'<meta property="article:modified_time" content="{geaendert.isoformat()}">']
	if b['og_alt']:
		extra.insert(0, f'<meta property="og:image:alt" content="{e(b["og_alt"])}">')
	daten = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': f'{BASIS}{b["url"]}#beitrag',
		'headline': b['titel'],
		'description': b['teaser'],
		'url': f'{BASIS}{b["url"]}',
		'datePublished': b['datum'].isoformat(),
		'dateModified': geaendert.isoformat(),
		'inLanguage': 'de-DE',
		'wordCount': b['woerter'],
		'author': {'@id': f'{BASIS}/#ulf'},
		'publisher': {'@id': f'{BASIS}/#studio'},
		'isPartOf': {'@id': f'{BASIS}/blog/#blog'},
	}
	if b['og']:
		daten['image'] = f'{BASIS}{b["og"]}'

	weiter = []
	for richtung, ziel in (('Neuer', neuer), ('Älter', aelter)):
		if ziel:
			weiter += [f'\t\t<a class="weiter__link weiter__link--{"neuer" if richtung == "Neuer" else "aelter"}" href="{ziel["url"]}">',
				f'\t\t\t<span class="weiter__richtung">{richtung}</span>',
				f'\t\t\t<span class="weiter__titel">{e(ziel["titel"])}</span>',
				'\t\t</a>']

	inhalt = [
		'<main class="blatt">',
		'\t<article class="beitrag">',
		'\t\t<header class="beitrag__kopf">',
		f'\t\t\t{meta(b)}',
		f'\t\t\t<h1 class="beitrag__titel">{e(b["titel"])}</h1>',
		f'\t\t\t<p class="beitrag__lead">{e(b["teaser"])}</p>',
		'\t\t</header>',
		'\t\t<div class="beitrag__text">',
		*[f'\t\t\t{z}' for z in b['html']],
		'\t\t</div>',
		'\t</article>',
		f'\t<nav class="weiter" aria-label="Weitere Beiträge">',
		*weiter,
		f'\t\t<a class="weiter__alle" href="/blog/">Alle Beiträge der {NAME}</a>',
		'\t</nav>',
		'</main>',
	]
	return seite(f'{b["titel"]} | {NAME} | wiredframe', b['teaser'], b['url'], 'article', b['og'] or '/images/og-image.png', extra, daten, inhalt,
		('/blog/', f'Zur {NAME}'))


def bento_art(b):
	"""Die Größe einer Karte in der Übersicht folgt dem Titelbild:
	gross    ein gerahmtes Bild im Querformat, mindestens 1400 Pixel breit
	klein    jedes andere Bild, auch freigestellte Fenster und Symbole
	ohne     kein Bild, eine breite, niedrige Textkarte"""
	c = b['cover']
	if not c:
		return 'ohne'
	if not c['frei'] and c['breite'] >= c['hoehe'] and c['breite'] >= 1400:
		return 'gross'
	return 'klein'


def packen(beitraege):
	"""Ordnet die Karten in Bänder aus zwei Zeilen und sechs Spalten, die
	jeweils aufgehen: groß + klein, klein + zwei niedrige, drei kleine.
	Gefüllt wird in Datumsfolge, ein passender Partner darf von weiter
	hinten nachrücken. Die Seiten wechseln von Band zu Band. Was nicht mehr
	aufgeht, bekommt eine Ausweichform: breit (ganze Zeile), hoch (niedrige
	Karte über zwei Zeilen) oder halb (zwei niedrige nebeneinander).
	Gibt (Beitrag, Klassen) in Reihenfolge des Markups zurück."""
	rest = [(b, bento_art(b)) for b in beitraege]
	raus, band = [], 0

	def nimm(art):
		for i, (_, a) in enumerate(rest):
			if a == art:
				return rest.pop(i)[0]
		return None

	def zahl(art):
		return sum(1 for _, a in rest if a == art)

	while rest:
		b, art = rest.pop(0)
		links = band % 2 == 0
		if art == 'gross':
			k = nimm('klein')
			teile = [(b, 'gross'), (k, 'klein')] if k else [(b, 'gross breit')]
			if k and not links:
				teile.reverse()
		elif art == 'klein':
			# der erste Partner, der das Band füllt, in Reihenfolge des Rests
			nach = next((a for _, a in rest if a == 'gross' or zahl(a) >= 2), None)
			if nach == 'gross':
				teile = [(b, 'klein'), (nimm('gross'), 'gross')]
			elif nach == 'ohne':
				o1, o2 = nimm('ohne'), nimm('ohne')
				teile = [(b, 'klein'), (o1, 'ohne'), (o2, 'ohne')] if links else [(o1, 'ohne'), (b, 'klein'), (o2, 'ohne')]
			elif nach == 'klein':
				teile = [(b, 'klein'), (nimm('klein'), 'klein'), (nimm('klein'), 'klein')]
			elif zahl('ohne'):
				teile = [(b, 'klein'), (nimm('ohne'), 'ohne hoch')]
			elif zahl('klein'):
				teile = [(b, 'klein halb'), (nimm('klein'), 'klein halb')]
			else:
				teile = [(b, 'klein breit')]
			if nach in ('gross', None) and len(teile) == 2 and not links:
				teile.reverse()
		else:
			k, o2 = nimm('klein'), nimm('ohne')
			if k and o2:
				teile = [(b, 'ohne'), (k, 'klein'), (o2, 'ohne')] if links else [(k, 'klein'), (b, 'ohne'), (o2, 'ohne')]
			elif k:
				teile = [(b, 'ohne hoch'), (k, 'klein')] if links else [(k, 'klein'), (b, 'ohne hoch')]
			elif o2:
				teile = [(b, 'ohne halb'), (o2, 'ohne halb')]
			else:
				teile = [(b, 'ohne breit')]
		raus += teile
		band += 1
	return raus


def uebersicht(beitraege):
	e = html.escape
	eintraege = []
	for b, klassen in packen(beitraege):
		art = klassen.split()[0]
		mods = ''.join(f' bento--{k}' for k in klassen.split())
		eintraege += [f'\t\t<li class="bento{mods}">', f'\t\t\t<a class="bento__link" href="{b["url"]}">']
		c = b['cover']
		if c:
			srcset = ', '.join(f'{b["url"]}{c["name"]}-{w}.webp {w}w' for w in c['varianten'])
			klasse = 'bento__bild freigestellt' if c['frei'] else 'bento__bild'
			groesse = '(max-width: 60rem) 92vw, 48rem' if art == 'gross' else '(max-width: 36rem) 92vw, 24rem'
			eintraege += ['\t\t\t\t<span class="bento__flaeche">',
				f'\t\t\t\t\t<img class="{klasse}" src="{b["url"]}{c["name"]}-{c["varianten"][0]}.webp" srcset="{srcset}"',
				f'\t\t\t\t\t\tsizes="{groesse}" width="{c["breite"] // 2}" height="{c["hoehe"] // 2}" alt="" decoding="async">',
				'\t\t\t\t</span>']
		eintraege += ['\t\t\t\t<span class="bento__text">',
			f'\t\t\t\t\t{meta(b)}',
			f'\t\t\t\t\t<h2 class="bento__titel">{e(b["titel"])}</h2>',
			f'\t\t\t\t\t<p class="bento__teaser">{e(b["teaser"])}</p>',
			'\t\t\t\t</span>',
			'\t\t\t</a>', '\t\t</li>']
	if not eintraege:
		eintraege = ['\t\t<li class="bento bento--ohne"><p>Noch ist nichts mitgeschrieben. Bald.</p></li>']

	daten = {
		'@context': 'https://schema.org',
		'@type': 'Blog',
		'@id': f'{BASIS}/blog/#blog',
		'name': NAME,
		'description': BESCHREIBUNG,
		'url': f'{BASIS}/blog/',
		'inLanguage': 'de-DE',
		'author': {'@id': f'{BASIS}/#ulf'},
		'publisher': {'@id': f'{BASIS}/#studio'},
		'isPartOf': {'@id': f'{BASIS}/#website'},
		'blogPost': [{'@id': f'{BASIS}{b["url"]}#beitrag'} for b in beitraege],
	}
	inhalt = [
		'<main class="mitschrift">',
		'\t<header class="mitschrift__kopf">',
		f'\t\t<h1 class="mitschrift__titel">{NAME}</h1>',
		f'\t\t<p class="mitschrift__intro">{e(INTRO)}</p>',
		'\t</header>',
		'\t<ul class="bento-raster">',
		*eintraege,
		'\t</ul>',
		'</main>',
	]
	bild = next((b['og'] for b in beitraege if b['og']), '/images/og-image.png')
	return seite(f'{NAME} | wiredframe', BESCHREIBUNG, '/blog/', 'website', bild, [], daten, inhalt, ('/', 'Zur Startseite'))


# ========================================
# Sitemap und llms.txt
# ========================================
def sitemap(beitraege):
	def url(pfad, wann, prio):
		return ['<url>', f'\t<loc>{BASIS}{pfad}</loc>', f'\t<lastmod>{wann.isoformat()}</lastmod>',
			f'\t<priority>{prio}</priority>', '</url>']
	markup = []
	if beitraege:
		markup += url('/blog/', max(b['aktualisiert'] or b['datum'] for b in beitraege), '0.6')
	for b in beitraege:
		markup += url(b['url'], b['aktualisiert'] or b['datum'], '0.5')
	SITEMAP.write_text(einsetzen(SITEMAP.read_text(encoding='utf-8'), 'blog:urls', markup, SITEMAP), encoding='utf-8')


def llms(beitraege):
	markup = [f'- [{b["titel"]}]({BASIS}{b["url"]}) ({lang(b["datum"])}): {b["teaser"]}' for b in beitraege]
	LLMS.write_text(einsetzen(LLMS.read_text(encoding='utf-8'), 'blog:liste', markup or ['- noch keine Beiträge'], LLMS),
		encoding='utf-8')


def schreiben(pfad, text, erwartet):
	erwartet.add(pfad)
	if not pfad.exists() or pfad.read_text(encoding='utf-8') != text:
		pfad.write_text(text, encoding='utf-8')


def aufraeumen(erwartet):
	weg = []
	for p in sorted(ZIEL.rglob('*'), key=lambda p: len(p.parts), reverse=True):
		if p.is_file() and p not in erwartet:
			p.unlink()
			weg.append(p)
		elif p.is_dir() and not any(p.iterdir()):
			p.rmdir()
	return weg


def main():
	neu = '--neu' in sys.argv[1:]
	if not shutil.which('cwebp'):
		sys.exit('cwebp fehlt, es rechnet die Bilder. Installieren mit: brew install webp')
	if not QUELLEN.is_dir():
		sys.exit(f'Kein Ordner {QUELLEN.name}/ mit Beiträgen gefunden.')

	ZIEL.mkdir(exist_ok=True)
	erwartet, stand = set(), {'neu': 0, 'da': 0}
	beitraege = []
	for ordner in sorted(p for p in QUELLEN.iterdir() if p.is_dir()):
		b = beitrag_bauen(ordner, neu, erwartet, stand)
		if b:
			beitraege.append(b)
		else:
			print(f'  Entwurf, übersprungen: {ordner.name}')

	slugs = [b['slug'] for b in beitraege]
	if doppelt := {s for s in slugs if slugs.count(s) > 1}:
		sys.exit(f'Zwei Beiträge wollen dieselbe Adresse: {", ".join(sorted(doppelt))}')
	beitraege.sort(key=lambda b: (b['datum'], b['slug']), reverse=True)

	for i, b in enumerate(beitraege):
		neuer = beitraege[i - 1] if i > 0 else None
		aelter = beitraege[i + 1] if i + 1 < len(beitraege) else None
		schreiben(b['ausgabe'] / 'index.html', beitragsseite(b, neuer, aelter), erwartet)
	schreiben(ZIEL / 'index.html', uebersicht(beitraege), erwartet)
	weg = aufraeumen(erwartet)
	sitemap(beitraege)
	llms(beitraege)

	print(f'{len(beitraege)} Beiträge -> blog/, Bilder: {stand["neu"]} neu, {stand["da"]} unverändert')
	for b in beitraege:
		extra = f', aktualisiert {b["aktualisiert"]}' if b['aktualisiert'] else ''
		print(f'  {b["datum"]}  {b["url"]:28} {lesezeit(b["woerter"])}{extra}')
	for p in weg:
		print(f'  entfernt: {p.relative_to(WURZEL)}')


if __name__ == '__main__':
	main()
