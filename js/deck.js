/**
 * Wiredframe, wiredframe.de
 *
 * Die Bewegung macht der Browser: Anker-Links und scroll-behavior für die
 * Sections, Scroll-Snap quer in den Grid-Reihen, deren Pfeile als native
 * Scroll-Buttons, natives Popover für Menü und Impressum. JavaScript
 * kümmert sich nur noch um drei Dinge:
 *
 *   1. welche Section gerade aktiv ist (Indikator, Linktext, Zählerlauf)
 *   2. Kleinkram: Jahre, Mail-Schutz, Impressum per Link
 *   3. die Projekte hinter dem Codewort
 *
 * Alle anderen Inhalte stehen fertig im Markup. Die Karten für Referenzen
 * und Repos schreiben die Skripte in werkzeuge/ vorab hinein.
 *
 * Die Farben stehen fest in css/deck.css. Sie stammen aus theme.js, das
 * sie eine Zeit lang bei jedem Aufruf neu gewürfelt hat; die Datei liegt
 * unter _archiv/js/, wird aber nicht mehr geladen.
 */
(() => {
	'use strict';

	const screens = [...document.querySelectorAll('.screen')];
	const chips = [...document.querySelectorAll('.chip')];
	const nextLink = document.getElementById('nav-next');
	const nextLabel = document.querySelector('[data-next-label]');
	const menu = document.getElementById('menu');
	const counterEl = document.querySelector('.counter');

	// ========================================
	// 0 · Sprünge macht der Browser
	// ----------------------------------------
	// Die Anker-Links im Markup genügen, scroll-behavior bewegt. Von hier
	// wird nichts gescrollt und nichts am Scrollen nachgeholfen.
	//
	// Hier stand zweimal eine Umgehung für vertikales Scroll-Snap, erst ein
	// eigener Scroller, dann ein Stummschalten während der Sprünge. Beide
	// sind weg, weil das vertikale Einrasten selbst weg ist: es zog auf dem
	// Handy nach jedem Sprung zurück auf die Ausgangs-Section, sobald die
	// URL-Leiste einklappte. Die Begründung steht in deck.css.
	//
	// Bleibt eine Kleinigkeit: popovertarget ist auf <a> nicht erlaubt, das
	// Menü muss also von Hand zugehen, wenn einer seiner Links springt.
	// ========================================
	document.addEventListener('click', (e) => {
		if (e.target.closest('a[href^="#"]') && menu?.matches(':popover-open')) menu.hidePopover();
	});

	// ========================================
	// 1 · Aktive Section
	// ========================================
	let current = -1;

	const weiterZeigen = () => {
		const jetzt = screens[current];
		if (!jetzt) return;
		const next = screens[current + 1] || screens[0]; // am Ende zurück zum Start
		nextLink.href = `#${next.id}`;
		nextLabel.textContent = jetzt.dataset.next || 'Weiter';
		nextLink.setAttribute('aria-label', nextLabel.textContent);
	};

	const setCurrent = (i) => {
		if (i === current || i < 0) return;
		current = i;

		chips.forEach((chip, n) => {
			if (n === i) chip.setAttribute('aria-current', 'true');
			else chip.removeAttribute('aria-current');
		});

		weiterZeigen();

		// Was in den Blick kommt, blendet ein. Auf der Startsection ist das
		// der ganze Auftritt aus Signet, Schlagzeile und Untertitel, sonst
		// die Inhalte der Section. Beides steht im CSS, hier wird es nur
		// zurückgespult.
		//
		// Das ersetzt das weiche Scrollen der Seite: statt die Fläche an
		// den Leser vorbeifahren zu lassen, steht sie sofort still und der
		// Inhalt kommt kurz nach.
		einblenden(screens[i]);
		zaehlerLaufen(screens[i].id === 'wahrheit');
	};

	// Aktiv ist, was die Bildschirmmitte kreuzt
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) setCurrent(screens.indexOf(entry.target));
		});
	}, { rootMargin: '-45% 0px -45% 0px' });
	screens.forEach((s) => observer.observe(s));

	// ----------------------------------------
	// Worauf die Bedienzeile liegt
	// ----------------------------------------
	// Bewusst eine zweite Messung. Der Indikator oben fragt nach der Section
	// in der Bildschirmmitte, das ist für ihn richtig. Die Bedienzeile liegt
	// aber ganz unten auf dem Panel und braucht die Farbe genau unter sich,
	// sonst schaltet sie beim Scrollen von Hand eine halbe Seite zu spät um.
	//
	// Die Wurzel wird deshalb auf ein schmales Band zusammengeschnitten, das
	// auf der Mitte der Zeile liegt. So gibt es immer genau eine Section, die
	// es kreuzt, und die Umschaltung kann nicht zwischen zweien flackern.
	const dock = document.querySelector('.dock');
	let dockBeobachter;

	const dockBeobachten = () => {
		if (!dock) return;
		dockBeobachter?.disconnect();
		const mitte = Math.round(dock.offsetHeight / 2);
		dockBeobachter = new IntersectionObserver((eintraege) => {
			eintraege.forEach((e) => {
				if (e.isIntersecting) {
					document.body.classList.toggle('dock-invers', e.target.classList.contains('screen--dark'));
				}
			});
		}, { rootMargin: `-${Math.max(0, innerHeight - mitte - 1)}px 0px -${Math.max(0, mitte - 1)}px 0px` });
		screens.forEach((s) => dockBeobachter.observe(s));
	};

	// Das Band hängt an der Fensterhöhe, deshalb wird der Beobachter bei
	// jeder echten Größenänderung neu aufgespannt. Am Fenster zu horchen wäre
	// zu grob: resize feuert auf dem Handy auch, wenn nur die URL-Leiste ein-
	// oder ausfährt. Die Panelhöhe bleibt dabei konstant, weil .screen mit lvh
	// misst. Ein Observer auf den Panels sieht deshalb nur echte Änderungen.
	const panelSize = new ResizeObserver(dockBeobachten);
	screens.forEach((s) => {
		const panel = s.querySelector('.panel');
		if (panel) panelSize.observe(panel);
	});

	// ========================================
	// 2 · Kleinkram
	// ========================================
	const logo = document.querySelector('.logo-anim');

	// Die Animationen selbst stehen im CSS, hier werden sie nur
	// zurückgespult. Nicht über das Entfernen und Neusetzen einer Klasse:
	// das bräuchte ein erzwungenes Reflow dazwischen, und das mitten in
	// einem Sprung.
	//
	// Übergänge bleiben dabei unangetastet. getAnimations liefert sie mit,
	// und ein zurückgespulter Hover sähe albern aus. Nur echte Keyframe-
	// Animationen tragen einen animationName.
	const wiederholen = (wurzel) => wurzel?.getAnimations({ subtree: true }).forEach((a) => {
		if (!a.animationName) return;
		a.currentTime = 0;
		a.play();
	});

	// Zwei Reichweiten, mit Absicht. Wer das Signet antippt, meint das
	// Signet. Wer eine Section betritt, bekommt deren ganzen Inhalt.
	const replayLogo = () => wiederholen(logo);
	const einblenden = (screen) => wiederholen(screen);

	logo?.addEventListener('click', replayLogo);

	document.querySelectorAll('[data-years]').forEach((el) => {
		el.textContent = new Date().getFullYear() - 2005;
	});

	// ----------------------------------------
	// Der laufende Zähler
	// ----------------------------------------
	// Bewusst hier und nicht als CSS-Animation: der Umweg über eine
	// animierte registrierte Eigenschaft und counter() scheitert an WebKit,
	// dort fällt die Zahl auf 0, sobald die Animation läuft.
	//
	// Dass diese Schleife das Layout nicht mehr stört, liegt nicht an ihr,
	// sondern an der abgedichteten Box in deck.css. Der Antrieb ist dafür
	// ohne Belang, deshalb darf er ruhig wieder hier stehen.
	let zaehlerRaf = 0, zaehlerZeit = 0, zaehlerRest = 0;
	let zaehlerWert = 100000 + Math.floor((Date.now() - Date.parse('2024-01-01')) / 864e5) * 50;

	// Ohne Tausenderpunkt: die Zahl wirkt hier als Bild, nicht als Betrag
	const zaehlerZeigen = () => {
		if (counterEl) counterEl.textContent = zaehlerWert;
	};

	const zaehlerSchritt = (t) => {
		zaehlerRest += (t - (zaehlerZeit || t)) * 0.5;
		zaehlerZeit = t;
		const plus = zaehlerRest | 0;
		if (plus) {
			zaehlerWert += plus;
			zaehlerRest -= plus;
			zaehlerZeigen();
		}
		zaehlerRaf = requestAnimationFrame(zaehlerSchritt);
	};

	// Läuft nur, solange die Section zu sehen ist
	const zaehlerLaufen = (an) => {
		if (!counterEl) return;
		if (an && !zaehlerRaf) {
			zaehlerZeit = 0;
			zaehlerRaf = requestAnimationFrame(zaehlerSchritt);
		} else if (!an) {
			cancelAnimationFrame(zaehlerRaf);
			zaehlerRaf = 0;
		}
	};

	zaehlerZeigen();

	// ----------------------------------------
	// Direktlink auf das Impressum
	// ----------------------------------------
	// Solange die Fläche zu ist, steht sie auf display:none. Ein Anker-Link
	// auf #impressum findet sein Ziel deshalb nicht und springt nirgendwohin.
	// Diese Zeilen machen aus wiredframe.de/#impressum einen Link, der die
	// Fläche wirklich öffnet, egal ob beim Aufruf der Seite oder später.
	//
	// Der Knopf im Menü bleibt daneben bestehen: er öffnet nativ über
	// popovertarget und funktioniert damit auch ohne Skript.
	const impressum = document.getElementById('impressum');

	const impressumAusHash = () => {
		if (!impressum || location.hash !== '#impressum') return;
		if (!impressum.matches(':popover-open')) impressum.showPopover();
		if (menu?.matches(':popover-open')) menu.hidePopover();
	};

	// Beim Öffnen zieht die Adresse mit, damit sie sich kopieren und teilen
	// lässt. replaceState und nicht pushState: das Impressum soll keinen
	// eigenen Eintrag im Verlauf anlegen, der Zurück-Knopf gehört den Sections.
	impressum?.addEventListener('toggle', (e) => {
		if (e.newState === 'open') history.replaceState(null, '', '#impressum');
		else if (location.hash === '#impressum') history.replaceState(null, '', location.pathname);
	});

	addEventListener('hashchange', impressumAusHash);
	impressumAusHash();

	// Mail-Schutz: die Adresse steht nur verdreht im Markup und wird erst
	// beim Klick zusammengesetzt. Im Impressum kommt sie ganz ohne Skript
	// aus, dort dreht die Schriftrichtung sie wieder herum (.mail-rueckwaerts).
	document.getElementById('email-link')?.addEventListener('click', function () {
		if (this.dataset.ready) return;
		const rev = (s) => s.split('').reverse().join('');
		this.href = `mailto:${rev('ofni')}@${rev('emarfderiw')}.${rev('ed')}`;
		this.dataset.ready = '1';
	});

	const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

	// ========================================
	// 3 · Projekte hinter dem Codewort
	// ----------------------------------------
	// Herbstlaub. Das Wort steht im Kontakt-Text, wer es irgendwo auf der
	// Seite eintippt, bekommt die echten Projekte samt Namen. Ein Schloss
	// ist das nicht: data/references.json liegt offen auf dem Server und
	// ist nur per robots.txt gesperrt. Es ist eine Inszenierung, und mehr
	// soll es auch nicht sein.
	//
	// Auf dem Telefon gibt es keine Tastatur ohne Eingabefeld. Dort genügt
	// ein Tipp auf das Wort selbst, das dafür bewusst nicht wie ein Link
	// aussieht.
	// ========================================
	const CODEWORT = 'herbstlaub';
	const projekteRail = document.getElementById('projekte-rail');
	const MERKER = 'wf-projekte';
	const gemerkt = () => { try { return sessionStorage.getItem(MERKER) === '1'; } catch { return false; } };
	const freigabe = document.getElementById('freigabe');
	const konfettiEl = document.getElementById('konfetti');
	const titelZelle = document.getElementById('projekte-titel');
	const filterBox = document.getElementById('projekte-filter');
	const detail = document.getElementById('projekt');

	let puffer = '';

	document.addEventListener('keydown', (e) => {
		if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
		if (e.target.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
		puffer = (puffer + e.key.toLowerCase()).slice(-CODEWORT.length);
		if (puffer === CODEWORT) freischalten(true);
	});

	// Direkt am Wort und nicht delegiert: iOS liefert Klicks auf ein
	// schlichtes span nur, wenn der Handler an ihm selbst hängt.
	const grob = matchMedia('(pointer: coarse)');
	document.querySelectorAll('[data-codewort]').forEach((wort) => {
		wort.addEventListener('click', () => { if (grob.matches) freischalten(true); });
	});

	freigabe?.querySelector('[data-zeigen]')?.addEventListener('click', () => {
		freigabe.hidePopover();
		document.getElementById('projekte')?.scrollIntoView();
		history.replaceState(null, '', '#projekte');
		// Wer mit der Tastatur kam, steht jetzt in der Reihe und kann mit
		// Tab direkt in Filter und Karten weiter.
		projekteRail.focus({ preventScroll: true });
	});

	const freischalten = (feiern) => {
		if (!projekteRail || projekteRail.dataset.offen) return;
		projekteRail.dataset.offen = '1';
		try { sessionStorage.setItem(MERKER, '1'); } catch { /* dann eben nur bis zum Neuladen */ }
		projekteLaden();
		if (!feiern) return;
		freigabe?.showPopover();
		konfetti();
	};

	// ----------------------------------------
	// Konfetti in den Hausfarben
	// ----------------------------------------
	// Zwei Kanonen in den unteren Ecken, die schräg nach innen schießen.
	// Die Farben kommen aus den Tokens in deck.css, nicht von hier: ändert
	// sich die Palette, regnet es automatisch in den neuen Tönen.
	const konfetti = () => {
		if (!konfettiEl?.getContext) return;
		const css = getComputedStyle(document.documentElement);
		const farben = ['--color-primary', '--color-accent', '--color-accent-strong', '--color-ink', '--color-white']
			.map((t) => css.getPropertyValue(t).trim()).filter(Boolean);
		const dpr = Math.min(devicePixelRatio || 1, 2);
		const b = innerWidth, h = innerHeight;
		konfettiEl.width = b * dpr;
		konfettiEl.height = h * dpr;
		const ctx = konfettiEl.getContext('2d');
		ctx.scale(dpr, dpr);
		konfettiEl.showPopover();

		const kraft = Math.max(h, 500) * 0.032;
		const teile = Array.from({ length: 140 }, (_, i) => {
			const links = i % 2 === 0;
			const winkel = (links ? -60 : -120) + (Math.random() - 0.5) * 40;
			const tempo = kraft * (0.6 + Math.random() * 0.6);
			return {
				x: links ? 0 : b, y: h,
				vx: Math.cos(winkel * Math.PI / 180) * tempo,
				vy: Math.sin(winkel * Math.PI / 180) * tempo,
				w: 7 + Math.random() * 7, l: 10 + Math.random() * 10,
				dreh: Math.random() * Math.PI, drall: (Math.random() - 0.5) * 0.35,
				kipp: Math.random() * Math.PI, farbe: farben[i % farben.length]
			};
		});

		const schritt = () => {
			ctx.clearRect(0, 0, b, h);
			let unterwegs = 0;
			teile.forEach((t) => {
				t.vx *= 0.985;
				t.vy = t.vy * 0.985 + 0.32;
				t.x += t.vx;
				t.y += t.vy;
				t.dreh += t.drall;
				t.kipp += 0.12;
				if (t.y < h + 40) unterwegs++;
				ctx.save();
				ctx.translate(t.x, t.y);
				ctx.rotate(t.dreh);
				ctx.scale(1, Math.cos(t.kipp));
				ctx.fillStyle = t.farbe;
				ctx.fillRect(-t.w / 2, -t.l / 2, t.w, t.l);
				ctx.restore();
			});
			if (unterwegs) requestAnimationFrame(schritt);
			else konfettiEl.hidePopover();
		};
		requestAnimationFrame(schritt);
	};

	// ----------------------------------------
	// Die echte Reihe
	// ----------------------------------------
	// Die Branchen der Quelle sind zu fein für einen Filter, fast jede gibt
	// es nur einmal. Auf der Karte bleibt die genaue Angabe stehen, gefiltert
	// wird nach diesen Gruppen. Übernommen aus der früheren projekte.html.
	const BRANCHEN = [
		['Öffentlicher Sektor', /öffentliche einrichtung|kommune|freizeitbad/i],
		['Bildung & Karriere', /bildung|ausbildung|karriere/i],
		['Gesundheit & Soziales', /gesundheit|sozial|pflege|senior|pharma|medizin|biotech|inklusion|tierschutz|kindergarten/i],
		['Energie & Umwelt', /energie|photovoltaik|solar|umwelt|nachhaltigkeit/i],
		['Bauen, Wohnen & Immobilien', /architektur|\bbau|immobil|innenarchitektur|innenausbau|handwerk|sanitär|küchen|möbel/i],
		['Finanzen, Recht & Beratung', /finanz|investment|steuer|wirtschaftsprüfung|rechtsanw|kanzlei|beratung|coaching/i],
		['Hotellerie & Gastronomie', /hotel|gastronomie|café/i],
		['IT & Software', /\bit\b|software|webentwicklung|netzwerktechnik|systemintegration|community/i],
		['Industrie & Technik', /industrie|technik|elektronik|maschinenbau|messtechnik|metall|ingenieurwesen|automotive|beleuchtung|anlagenbau|hydraulik|laborautomation/i],
		['Kultur, Medien & Gesellschaft', /kultur|kunst|film|verlag|medien|kommunikation|\bpr\b|airbrush|verband|verein|kirche|gemeinde|ngo|netzwerk|zertifizierung|werkstätten/i],
		['Sport, Freizeit & Tourismus', /sport|freizeit|tourismus|event/i],
		['Handel & E-Commerce', /handel|einzelhandel|e-commerce|shop|bürobedarf|ersatzteile|mode|fashion|schmuck|deko|geschenk|spielwaren|spirituosen|lebensmittel|tiernahrung|zigarren|aquaristik|feuerwerk|lifestyle|klebemittel|agrar/i]
	];
	const branchenGruppe = (b) => BRANCHEN.find(([, muster]) => muster.test(String(b || '')))?.[0] || 'Weitere Branchen';

	// Bildname aus dem Titel, wenn die Quelle keinen nennt. Dieselbe Regel
	// wie bisher, sonst fänden ältere Einträge ihre Bilder nicht mehr.
	const slug = (t) => String(t || '').trim().toLowerCase()
		.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
		.replace(/&/g, 'and').replace(/[\s/\\]+/g, '-').replace(/[^a-z0-9-]/g, '')
		.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
	const bildDatei = (p) => p.Image || `${slug(p.Projekttitel)}.jpg`;

	// Ersatz, wenn ein Bild fehlt: die Initialen auf dem Grundton
	const ersatzBild = (titel) => {
		const kuerzel = String(titel || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '?';
		return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#e2ebe6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#193239' fill-opacity='.35' font-family='Georgia,serif' font-size='120'>${esc(kuerzel)}</text></svg>`)}`;
	};

	const linkZiel = (roh) => {
		const t = String(roh || '').trim();
		if (!t) return null;
		const href = /^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`;
		if (/figma\.com/i.test(href)) return { href, text: 'Figma-Prototyp ansehen' };
		try { return { href, text: new URL(href).host.replace(/^www\./, '') }; } catch { return { href, text: 'Website ansehen' }; }
	};

	let alle = [];
	let liste = [];
	let stelle = -1;
	let zuletzt = null;

	const TITEL_OFFEN = 'Projekte';
	const TEXT_OFFEN = 'Ab hier mit Namen. Websites, Shops und Apps, für Agenturen und direkt für Auftraggeber, die neuesten zuerst.';

	const projektKarte = (p, i) => {
		const datei = bildDatei(p);
		const vorschau = esc(`images/referenzen/thumbs/${datei.replace(/\.[^.]+$/, '')}`);
		const groessen = '(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 85vw';
		return `
			<button class="cell cell--projekt" type="button" data-i="${i}">
				<span class="projekt__vorschau">
					<picture>
						<source type="image/webp" srcset="${vorschau}-480.webp 480w, ${vorschau}-800.webp 800w" sizes="${groessen}">
						<img src="${vorschau}-800.jpg" srcset="${vorschau}-480.jpg 480w, ${vorschau}-800.jpg 800w" sizes="${groessen}"
							alt="" loading="lazy" decoding="async" data-titel="${esc(p.Projekttitel)}">
					</picture>
				</span>
				<span class="subtitle">${esc(p.Projekttitel || 'Ohne Titel')}</span>
				<span class="repo__meta">
					<span>${esc(p.Jahr)}</span>
					${p.Typ ? `<span class="referenz__technik">${esc(p.Typ)}</span>` : ''}
					${p.Agentur ? `<span>${esc(p.Agentur)}</span>` : ''}
				</span>
			</button>`;
	};

	const wahlen = [...(filterBox?.querySelectorAll('[data-filter]') || [])];
	const zurueck = filterBox?.querySelector('.filter__zurueck');
	const zahl = filterBox?.querySelector('.filter__zahl');
	const merkmal = {
		jahr: (p) => p.Jahr,
		typ: (p) => p.Typ,
		branche: (p) => branchenGruppe(p.Branche)
	};

	const zeichnen = () => {
		const aktiv = wahlen.filter((w) => w.value);
		liste = alle.filter((p) => aktiv.every((w) => merkmal[w.dataset.filter](p) === w.value));
		wahlen.forEach((w) => w.closest('.filter__feld')?.classList.toggle('ist-gesetzt', !!w.value));
		if (zurueck) zurueck.hidden = !aktiv.length;
		if (zahl) zahl.textContent = `${liste.length} von ${alle.length} Projekten`;

		projekteRail.querySelectorAll('.cell:not(.cell--title)').forEach((c) => c.remove());
		projekteRail.insertAdjacentHTML('beforeend', liste.length
			? liste.map(projektKarte).join('')
			: '<article class="cell cell--leer"><p class="text">Für diese Auswahl gibt es kein Projekt. Vielleicht ein Filter weniger?</p></article>');
		projekteRail.scrollLeft = 0;
	};

	const projekteLaden = () => {
		const h2 = titelZelle?.querySelector('.title');
		const p = titelZelle?.querySelector('.text');
		if (h2) h2.textContent = TITEL_OFFEN;
		if (p) p.textContent = TEXT_OFFEN;

		// Der Weiter-Knopf der Section davor nennt die Reihe beim Namen
		const profil = document.getElementById('profil');
		if (profil) {
			profil.dataset.next = TITEL_OFFEN;
			weiterZeigen();
		}

		fetch('data/references.json')
			.then((r) => { if (!r.ok) throw 0; return r.json(); })
			.then((daten) => {
				alle = (daten || []).filter((d) => d.Projekttitel)
					.sort((a, b) => (parseInt(b.Jahr, 10) || 0) - (parseInt(a.Jahr, 10) || 0));
				const optionen = (f) => [...new Set(alle.map(merkmal[f]).filter(Boolean))].sort((a, b) => b.localeCompare(a, 'de'));
				wahlen.forEach((w) => {
					const f = w.dataset.filter;
					// Jahre absteigend, alles andere alphabetisch
					const werte = f === 'jahr' ? optionen(f) : optionen(f).reverse();
					w.insertAdjacentHTML('beforeend', werte.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join(''));
				});
				if (filterBox) filterBox.hidden = false;
				zeichnen();
			})
			.catch(() => {
				projekteRail.querySelectorAll('.cell:not(.cell--title)').forEach((c) => c.remove());
				projekteRail.insertAdjacentHTML('beforeend', '<article class="cell cell--leer"><p class="text">Die Akten klemmen gerade. Später noch einmal versuchen, oder direkt nachfragen.</p></article>');
			});
	};

	wahlen.forEach((w) => w.addEventListener('change', zeichnen));
	zurueck?.addEventListener('click', () => {
		wahlen.forEach((w) => { w.value = ''; });
		zeichnen();
		wahlen[0]?.focus();
	});

	// Fehlt ein Vorschaubild, springt der Ersatz ein, in zwei Stufen. Ein
	// Fehler beim WebP fällt nicht von selbst auf das JPG zurück, die
	// Quelle gilt als gewählt. Also erst ohne Quelle das JPG versuchen,
	// und erst wenn auch das fehlt, die Initialen. error steigt nicht auf,
	// deshalb in der Einfangphase.
	projekteRail?.addEventListener('error', (e) => {
		const img = e.target;
		if (img.tagName !== 'IMG' || img.dataset.ersatz === '2') return;
		const quelle = img.closest('picture')?.querySelector('source');
		if (quelle) {
			quelle.remove();
			img.dataset.ersatz = '1';
			return;
		}
		img.dataset.ersatz = '2';
		img.removeAttribute('srcset');
		img.src = ersatzBild(img.dataset.titel);
	}, true);

	// ----------------------------------------
	// Detailansicht
	// ----------------------------------------
	const detailBild = document.getElementById('projekt-bild');
	const detailTitel = document.getElementById('projekt-titel');
	const detailDaten = document.getElementById('projekt-daten');
	const detailText = document.getElementById('projekt-text');
	const detailLink = document.getElementById('projekt-link');
	const detailStelle = document.getElementById('projekt-stelle');

	detailBild?.addEventListener('error', () => {
		if (detailBild.dataset.ersatz || !detailBild.getAttribute('src')) return;
		detailBild.dataset.ersatz = '1';
		detailBild.src = ersatzBild(detailTitel?.textContent);
	});

	const zeigeProjekt = (i) => {
		if (!liste.length || !detail) return;
		stelle = (i + liste.length) % liste.length;
		const p = liste[stelle];

		detailTitel.textContent = p.Projekttitel;
		delete detailBild.dataset.ersatz;
		detailBild.alt = `Screenshot: ${p.Projekttitel}`;
		detailBild.src = `images/referenzen/${bildDatei(p)}`;
		detailBild.parentElement.scrollTop = 0;

		detailDaten.innerHTML = [['Jahr', p.Jahr], ['Agentur', p.Agentur], ['Typ', p.Typ], ['Branche', p.Branche]]
			.filter(([, v]) => v)
			.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');

		const text = String(p.Beschreibung || '').trim();
		detailText.textContent = text;
		detailText.hidden = !text;

		const ziel = linkZiel(p.URL || p.url);
		detailLink.hidden = !ziel;
		if (ziel) {
			detailLink.href = ziel.href;
			detailLink.textContent = ziel.text;
		}

		detailStelle.textContent = `${stelle + 1} von ${liste.length}`;
		if (!detail.matches(':popover-open')) detail.showPopover();
	};

	projekteRail?.addEventListener('click', (e) => {
		const karte = e.target.closest('.cell--projekt');
		if (!karte) return;
		zuletzt = karte;
		zeigeProjekt(Number(karte.dataset.i));
	});

	detail?.querySelectorAll('[data-schritt]').forEach((k) => {
		k.addEventListener('click', () => zeigeProjekt(stelle + Number(k.dataset.schritt)));
	});

	document.addEventListener('keydown', (e) => {
		if (!detail?.matches(':popover-open')) return;
		if (e.key === 'ArrowLeft') { e.preventDefault(); zeigeProjekt(stelle - 1); }
		if (e.key === 'ArrowRight') { e.preventDefault(); zeigeProjekt(stelle + 1); }
	});

	// Ein per Skript geöffnetes Popover gibt den Fokus beim Schließen
	// nicht von selbst zurück. Er landet auf der Karte des Projekts, das
	// zuletzt offen war, und die Reihe rückt sie in den Blick.
	detail?.addEventListener('toggle', (e) => {
		if (e.newState === 'open') {
			detail.querySelector('.sheet__close')?.focus({ preventScroll: true });
			return;
		}
		const karte = projekteRail?.querySelector(`.cell--projekt[data-i="${stelle}"]`) || zuletzt;
		karte?.focus({ preventScroll: true });
		karte?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});

	// ========================================
	// Start
	// ========================================
	setCurrent(0);
	dockBeobachten();
	if (gemerkt()) freischalten(false);
})();
