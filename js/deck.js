/**
 * Wiredframe, wiredframe.de
 *
 * Die Bewegung macht der Browser: Anker-Links und scroll-behavior für die
 * Sections, Scroll-Snap quer in den Grid-Reihen, deren Pfeile als native
 * Scroll-Buttons, natives Popover für Menü und Impressum. JavaScript
 * kümmert sich nur noch um drei Dinge:
 *
 *   1. welche Section gerade aktiv ist (Indikator, Linktext, Zählerlauf)
 *   2. eine Notbremse gegen Überlauf auf sehr kleinen Screens
 *   3. Inhalte: Jahre, Mail-Schutz, GitHub, Projekte hinter dem Codewort
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
	// Eine verborgene Section (die Mitwisser ohne Daten) hat einen
	// verborgenen Punkt und wird vom Weiter-Knopf übersprungen.
	let current = -1;

	const weiterZeigen = () => {
		const jetzt = screens[current];
		if (!jetzt) return;
		const next = screens.slice(current + 1).find((s) => !s.hidden)
			|| screens[0]; // am Ende zurück zum Start
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

	// ========================================
	// 2 · Notbremse: Inhalt größer als der Screen wird herunterskaliert.
	//     Greift nur in Ausnahmefällen, etwa im Querformat auf dem Handy.
	// ========================================
	const MIN_FIT = 0.7;

	const fit = (screen) => {
		const panel = screen.querySelector('.panel');
		const box = panel?.querySelector('.stage, .rail');
		if (!box) return;
		const need = box.scrollHeight;
		const avail = panel.clientHeight;
		if (!need || !avail) return;
		box.style.setProperty('--fit', (need > avail ? Math.max(MIN_FIT, avail / need) : 1).toFixed(4));
	};

	// Das Band der Bedienzeile hängt an der Fensterhöhe, deshalb wird der
	// Beobachter bei jeder echten Größenänderung neu aufgespannt.
	const relayout = () => {
		screens.forEach(fit);
		dockBeobachten();
	};

	// Am Fenster zu horchen wäre zu grob: resize feuert auf dem Handy auch,
	// wenn nur die URL-Leiste ein- oder ausfährt, und rechnet dann mitten im
	// Scrollen neu. Die Panelhöhe bleibt dabei konstant, weil .screen mit lvh
	// misst. Ein Observer auf den Panels sieht deshalb nur echte Änderungen.
	const panelSize = new ResizeObserver(relayout);
	screens.forEach((s) => {
		const panel = s.querySelector('.panel');
		if (panel) panelSize.observe(panel);
	});

	// ========================================
	// 3 · Inhalte
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

	// ========================================
	// 4 · Pfeile der Schienen
	// ----------------------------------------
	// Zwei Dinge, die ::scroll-button() allein nicht leistet.
	//
	// Erstens kennen es Stand August 2026 nur Chromium-Browser. Wo es fehlt,
	// legt der Zweig unten echte Knöpfe an, die genauso aussehen und
	// genauso weit rücken. Sie sind Ersatz, kein Ersatzteil auf Dauer:
	// sobald Safari und Firefox nachziehen, kann NATIVE_PFEILE true bleiben
	// und dieser ganze Abschnitt fällt weg.
	//
	// Zweitens schaltet das Pseudoelement am Ende der Reihe von selbst auf
	// :disabled, und das lässt sich nicht überstimmen. Der Rücksprung an den
	// Anfang braucht deshalb in jedem Browser einen eigenen Knopf. Er sitzt
	// genau dort, wo der native gerade auf opacity: 0 gegangen ist, und
	// übernimmt dessen Platz, sobald die Reihe am Ende steht.
	// ========================================
	const NATIVE_PFEILE = CSS.supports('selector(::scroll-button(*))');

	const knopf = (art, text) => {
		const b = document.createElement('button');
		b.type = 'button';
		b.className = `rail-btn rail-btn--${art}`;
		b.setAttribute('aria-label', text);
		b.hidden = true;
		return b;
	};

	document.querySelectorAll('.rail').forEach((rail) => {
		// Ins Panel und nicht in die Section: das Pseudoelement rechnet
		// gegen dasselbe Panel, nachgemessen in deck.css bei .rail-btn.
		const buehne = rail.closest('.panel');
		if (!buehne) return;

		// Ohne native Pfeile braucht die Schiene beide Richtungen, mit ihnen
		// nur den Rücksprung. Der trägt bewusst dieselbe Klasse wie der
		// Vorwärtsknopf: gleiche Stelle, gleiches Aussehen, anderes Ziel.
		const zurueck = NATIVE_PFEILE ? null : knopf('prev', 'Vorheriges Element');
		const weiter = knopf('next', NATIVE_PFEILE ? 'Zurück zum Anfang' : 'Nächstes Element');
		if (zurueck) buehne.append(zurueck);
		buehne.append(weiter);

		// Eine Snap-Position entspricht einer Spalte samt Abstand. Beides
		// hängt an Container-Queries, wird also bei jedem Klick neu gemessen
		// statt einmal beim Laden.
		const schritt = () => {
			const zelle = rail.querySelector('.cell');
			if (!zelle) return rail.clientWidth;
			const abstand = parseFloat(getComputedStyle(rail).columnGap) || 0;
			return zelle.getBoundingClientRect().width + abstand;
		};

		const amAnfang = () => rail.scrollLeft <= 2;
		const amEnde = () => rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2;

		const gleiten = (ziel) => {
			rail.scrollTo({ left: ziel, behavior: 'smooth' });
		};

		zurueck?.addEventListener('click', () => gleiten(rail.scrollLeft - schritt()));

		weiter.addEventListener('click', () => {
			// Am Ende zurück auf Null, sonst eine Position weiter. Der native
			// Knopf deckt den Normalfall bereits ab, dort bleibt nur der
			// Rücksprung übrig.
			if (amEnde()) gleiten(0);
			else gleiten(rail.scrollLeft + schritt());
		});

		// Direkt im Handler und nicht über requestAnimationFrame gesammelt:
		// Scroll-Ereignisse stellt der Browser ohnehin nur beim Aktualisieren
		// der Darstellung zu, also höchstens einmal pro Bild. Die Sammelstelle
		// sparte damit nichts und war nur eine Indirektion mehr.
		const zeigen = () => {
			// Steht alles nebeneinander, gibt es nichts zu blättern.
			const scrollbar = rail.scrollWidth > rail.clientWidth + 2;
			if (zurueck) zurueck.hidden = !scrollbar || amAnfang();
			weiter.hidden = !scrollbar || (NATIVE_PFEILE && !amEnde());
		};

		rail.addEventListener('scroll', zeigen, { passive: true });
		addEventListener('resize', zeigen);
		// Die Reihen der Projekte und Repos werden erst nachträglich gefüllt.
		// Ein ResizeObserver hilft dabei nicht: neue Karten verändern die
		// Scrollbreite, nicht die Größe der Schiene selbst.
		new MutationObserver(zeigen).observe(rail, { childList: true });
		zeigen();
	});

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

	// Beide Reihen unten setzen Markup aus Daten zusammen, deshalb steht
	// das Maskieren hier oben und nicht zweimal darunter.
	const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

	// ----------------------------------------
	// Referenzen
	// ----------------------------------------
	// Die Datei data/referenzen.json ist bereits anonym: sie kennt weder
	// Kundennamen noch Agenturen, weil werkzeuge/referenzen.py nur Jahr,
	// Art und Branche übernimmt und daraus einen Satz baut. Hier wird also
	// nichts mehr verschwiegen, sondern nur noch gezeichnet.
	//
	// Wer das Codewort kennt, bekommt statt dieser zehn Karten die echten
	// Projekte, siehe weiter unten. Ist die Reihe in dieser Sitzung schon
	// offen, wird die anonyme Fassung gar nicht erst geholt.
	const projekteRail = document.getElementById('projekte-rail');
	const einladung = document.getElementById('projekte-einladung');
	const MERKER = 'wf-projekte';
	const gemerkt = () => { try { return sessionStorage.getItem(MERKER) === '1'; } catch { return false; } };

	const initReferenzen = () => {
		if (!projekteRail || gemerkt()) return;

		const karte = (r) => `
			<article class="cell cell--referenz">
				<span class="cell__icon icon--${esc(r.icon)}" aria-hidden="true"></span>
				<p class="text">${esc(r.satz)}</p>
				<span class="repo__meta">
					<span>${esc(r.jahr)}</span>
					${r.technik ? `<span class="referenz__technik">${esc(r.technik)}</span>` : ''}
				</span>
			</article>`;

		// Die Einladung steht schon im Markup und soll die letzte Spalte
		// bleiben, deshalb wird davor eingefügt und nicht ans Ende.
		fetch('data/referenzen.json')
			.then((r) => { if (!r.ok) throw 0; return r.json(); })
			.then((liste) => {
				// Kam das Codewort schneller als die Antwort, ist die Reihe
				// schon umgebaut und die anonymen Karten haben dort nichts
				// mehr verloren.
				if (projekteRail.dataset.offen) return;
				(einladung || projekteRail).insertAdjacentHTML(
					einladung ? 'beforebegin' : 'beforeend', liste.map(karte).join(''));
			})
			.catch(() => { })
			.finally(relayout);
	};

	// ========================================
	// 5 · Projekte hinter dem Codewort
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
		relayout();
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
				relayout();
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

	// GitHub-Repos als weitere Spalten der Code-Reihe
	const initRepos = () => {
		const rail = document.getElementById('repos-rail');
		if (!rail) return;

		const USER = 'Wiredframe';
		const LANG = {
			Swift: '#F05138', HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c', TypeScript: '#3178c6',
			JavaScript: '#f1e05a', Ruby: '#701516', Python: '#3572A5', Shell: '#89e051', Go: '#00ADD8',
			Rust: '#dea584', Java: '#b07219', Kotlin: '#A97BFF', PHP: '#4F5D95', 'C++': '#f34b7d', 'C#': '#178600'
		};
		const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' });
		const timeAgo = (iso) => {
			const diff = (Date.now() - new Date(iso).getTime()) / 1000;
			for (const [unit, secs] of [['year', 31536e3], ['month', 2592e3], ['week', 6048e2], ['day', 864e2], ['hour', 3600], ['minute', 60]]) {
				if (Math.abs(diff) >= secs) return rtf.format(-Math.round(diff / secs), unit);
			}
			return 'gerade eben';
		};

		const card = (r) => `
			<a class="cell cell--repo" href="${esc(r.html_url)}" target="_blank" rel="noopener">
				<span class="repo__icon"><span class="repo__glyph icon--repo"></span></span>
				<h3 class="subtitle">${esc(r.name)}</h3>
				<p class="text repo__desc">${esc(r.description || 'Noch ohne Beschreibung, aber öffentlich einsehbar.')}</p>
				<span class="repo__meta">
					${r.language ? `<span class="repo__lang"><span class="repo__dot" style="--dot:${LANG[r.language] || '#7d8b88'}"></span>${esc(r.language)}</span>` : ''}
					<span>${timeAgo(r.pushed_at || r.updated_at)}</span>
				</span>
			</a>`;

		// ----------------------------------------
		// Einmal am Tag holen, sonst aus dem Vorrat
		// ----------------------------------------
		// GitHub lässt ohne Anmeldung 60 Anfragen pro Stunde und IP zu. Das
		// klingt viel, ist es aber nicht: die Grenze zählt pro IP, nicht pro
		// Besucher, und hinter einem Mobilfunknetz oder einem Firmenanschluss
		// teilen sich viele dieselbe. Ist sie erreicht, antwortet die API mit
		// 403, und die Section stand dann leer da.
		//
		// Deshalb liegt die letzte Antwort im Browser des Besuchers. Geholt
		// wird nur, wenn sie älter als einen Tag ist, und immer nur beim
		// Aufruf der Seite: kein Timer, kein Nachladen im Hintergrund.
		// Schlägt das Holen fehl, wird der alte Vorrat gezeigt, auch ein
		// abgelaufener. Eine Woche alte Zeitangaben sind allemal besser als
		// eine Karte, die sich entschuldigt.
		const VORRAT = 'wf-repos';
		const TAG = 24 * 60 * 60 * 1000;

		const lesen = () => {
			try {
				const roh = localStorage.getItem(VORRAT);
				if (!roh) return null;
				const v = JSON.parse(roh);
				return Array.isArray(v.liste) ? v : null;
			} catch { return null; }
		};

		const schreiben = (liste) => {
			try {
				localStorage.setItem(VORRAT, JSON.stringify({ zeit: Date.now(), liste }));
			} catch { /* privater Modus oder voll: dann eben ohne Vorrat */ }
		};

		const zeigen = (liste) => {
			if (liste?.length) {
				rail.insertAdjacentHTML('beforeend', liste.map(card).join(''));
			} else {
				rail.insertAdjacentHTML('beforeend', card({
					html_url: `https://github.com/${USER}?tab=repositories`,
					name: 'Ab zu GitHub',
					description: 'Die Live-Vorschau lädt gerade nicht. Schau dir die Repositories direkt auf GitHub an.'
				}));
			}
			relayout();
		};

		// Aus der Antwort wird nur behalten, was die Karte braucht. Sonst
		// lägen hundert Repositories mit je vier Dutzend Feldern im Speicher
		// des Besuchers, und die Fünf-Megabyte-Grenze ist schneller erreicht,
		// als man denkt.
		const knapp = (r) => ({
			html_url: r.html_url, name: r.name, description: r.description,
			language: r.language, pushed_at: r.pushed_at || r.updated_at
		});

		const vorrat = lesen();
		if (vorrat && Date.now() - vorrat.zeit < TAG) {
			zeigen(vorrat.liste);
			return;
		}

		fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed&direction=desc`, { headers: { Accept: 'application/vnd.github+json' } })
			.then((r) => { if (!r.ok) throw 0; return r.json(); })
			.then((repos) => {
				const liste = (repos || []).filter((r) => !r.archived).map(knapp);
				schreiben(liste);
				zeigen(liste);
			})
			.catch(() => zeigen(vorrat?.liste));
	};

	// ----------------------------------------
	// Die Mitwisser
	// ----------------------------------------
	// Kennzahlen aus Claude Code als Statistik-Karten wie in Profil. Die
	// Datei erzeugt werkzeuge/claude-stats.py, sie enthält nur Summen.
	// Auf der Karte stehen wie dort höchstens drei Ziffern, sonst sprengt
	// die Schaugröße die Karte. Die Größenordnung wandert deshalb in die
	// Beschriftung, und wo abgerundet wird, steht „mehr als“ davor.
	const initMitwisser = () => {
		const section = document.getElementById('mitwisser');
		const rail = document.getElementById('mitwisser-rail');
		if (!section || !rail) return;

		const STUFEN = [[1e9, 'Milliarden'], [1e6, 'Millionen'], [1e3, 'Tausend']];
		const karte = (n, name) => {
			const [teiler, wort] = n >= 1000 ? STUFEN.find(([t]) => n >= t) : [1, ''];
			const wert = Math.floor(n / teiler);
			const gerundet = wert * teiler !== n;
			return `
				<article class="cell cell--stat">
					${gerundet ? '<p class="text">mehr als</p>' : ''}
					<p class="stat__value">${wert}</p>
					<p class="text">${wort ? `${wort} ` : ''}${name}</p>
				</article>`;
		};
		const datum = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

		const ZAHLEN = [
			['sitzungen', 'konspirative Sitzungen'],
			['nachrichten', 'geflüsterte Nachrichten'],
			['handgriffe', 'Handgriffe meiner Helfer'],
			['tage', 'Tage im Untergrund'],
			['geschrieben', 'Tokens zu Papier gebracht'],
			['erinnert', 'Tokens aus dem Gedächtnis gekramt']
		];

		fetch('data/claude-stats.json')
			.then((r) => { if (!r.ok) throw 0; return r.json(); })
			.then((d) => {
				rail.insertAdjacentHTML('beforeend', ZAHLEN.filter(([k]) => Number.isFinite(d[k]))
					.map(([k, name]) => karte(d[k], name)).join(''));

				const [erster] = d.mitwisser || [];
				document.getElementById('mitwisser-fuss').textContent =
					`${erster ? `Die meisten Worte stammen von ${erster.name}. ` : ''}Stand: ${datum(d.stand)}, gezählt von Claude Code.`;

				section.hidden = false;
				document.querySelectorAll(`a[href="#${section.id}"]`).forEach((a) => { a.hidden = false; });
				// Erst jetzt gibt es die Section, also erst jetzt die Überleitung
				const code = document.getElementById('repos');
				if (code) code.dataset.next = 'Kollaborateure';
				weiterZeigen();
				relayout();
			})
			.catch(() => { });
	};

	// ========================================
	// Start
	// ========================================
	setCurrent(0);
	relayout();
	initReferenzen();
	if (gemerkt()) freischalten(false);
	initRepos();
	initMitwisser();
	document.fonts?.ready.then(relayout);
})();
