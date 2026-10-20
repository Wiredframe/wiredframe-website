// Bedienung nach dem Vorbild von webtui.ironclad.sh: utils/vim.ts,
// Filter.astro, Sidebar.astro und die Skripte in Doc.astro. Dazu kommt,
// was eine Anwendung in einem Stück braucht: Seiten umschalten statt laden,
// Kataloge mit Detailseiten, Daten aus daten.js (werkzeuge/tui.py).

(() => {
	const WF = window.WF;
	const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	const datum = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' }) : '');

	// ========================================
	// Vim-Navigation, wie utils/vim.ts
	// ========================================
	const isUserTyping = () =>
		document.activeElement &&
		(/input|textarea|select/i.test(document.activeElement.tagName) ||
			document.activeElement.hasAttribute('contenteditable'));

	const getFirstTextNode = (element) => {
		if (!element) return null;
		if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) return element;
		for (const child of element.childNodes) {
			const found = getFirstTextNode(child);
			if (found) return found;
		}
		return null;
	};

	const applyVimCursorHighlight = (element) => {
		if (!window.CSS?.highlights) return;
		const textNode = getFirstTextNode(element);
		if (!textNode) {
			CSS.highlights.delete('vim');
			return;
		}
		const first = textNode.textContent.split('').findIndex((c) => !/\s/.test(c));
		const range = new Range();
		range.setStart(textNode, first);
		range.setEnd(textNode, first + 1);
		CSS.highlights.set('vim', new Highlight(range));
	};

	const vimFocusElement = (element) => {
		element.focus();
		element.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		applyVimCursorHighlight(element);
	};

	const paginateElements = (element, elements) => {
		const list = Array.from(elements);
		const i = list.indexOf(element);
		return {
			first: list[0],
			next: list[Math.min(i + 1, list.length - 1)],
			prev: list[Math.max(i - 1, 0)],
			last: list[list.length - 1],
		};
	};

	const applyVimNavigation = (element, queryString, onElementFocus) => {
		const reattach = () => {
			const els = element.querySelectorAll(queryString);
			for (const el of els) {
				el.onfocus = () => {
					vimFocusElement(el);
					onElementFocus?.(el, els);
				};
			}
			return els;
		};
		reattach();
		element.addEventListener('keydown', (e) => {
			if (isUserTyping() || e.ctrlKey || e.metaKey || e.altKey) return;
			const els = reattach();
			if (Array.from(els).indexOf(document.activeElement) === -1) return;
			const { next, prev, first, last } = paginateElements(document.activeElement, els);
			let target = null;
			if (e.key === 'j' || e.key === 'ArrowDown') target = next;
			if (e.key === 'k' || e.key === 'ArrowUp') target = prev;
			if (e.key === 'g') target = first;
			if (e.key === 'G') target = last;
			if (target) {
				e.preventDefault();
				target.focus();
			}
		});
		return reattach;
	};

	// ========================================
	// Daten
	// ========================================
	const SPRACHFARBE = { Swift: 'peach', TypeScript: 'blue', HTML: 'red', Shell: 'mint', Ruby: 'rose', C: 'lavender', 'Objective-C': 'sky', JavaScript: 'sand', CSS: 'teal' };
	const ARTFARBE = { Neu: 'lime', Release: 'peach', Code: 'sky', Stand: 'lavender' };
	const sprache = (s) => (s ? `<span is-="badge" variant-="${SPRACHFARBE[s] ?? 'background2'}">${esc(s)}</span>` : '');
	const repos = WF.repos;
	const repoByName = Object.fromEntries(repos.map((r) => [r.name.toLowerCase(), r]));

	// Projekte: erst die anonymen, nach dem Codewort die echten
	let projekte = WF.projekte.map((p) => ({
		titel: p.satz,
		jahr: p.jahr,
		typ: p.gattung,
		branche: p.branche,
		technik: p.technik,
		suche: `${p.jahr} ${p.satz} ${p.technik}`.toLowerCase(),
	}));
	let offen = false;

	// ========================================
	// Seiten
	// ========================================
	const main = document.getElementById('main-content');
	const sections = Array.from(main.querySelectorAll('section[data-route]'));
	const detail = document.getElementById('detail');
	const sidebar = document.getElementById('sidebar');
	const sidebarLinks = Array.from(sidebar.querySelectorAll('ul > a[data-slug]'));
	const titleEl = document.getElementById('page-title');
	const posEl = document.getElementById('page-pos');
	const pathEl = document.getElementById('path');
	const cursorEl = document.getElementById('cursor');
	const prevLink = main.querySelector('#doc-pagination .prev');
	const nextLink = main.querySelector('#doc-pagination .next');
	const article = document.querySelector('article');
	const sidebarContainer = document.getElementById('sidebar-container');
	const menuButton = document.getElementById('menu-button');
	const docsButton = document.getElementById('docs-button');

	// Reihenfolge der Seiten wie in der Navigation
	const ORDER = sidebarLinks.map((a) => a.dataset.slug);
	const sectionFor = (route) => sections.find((s) => s.dataset.route === route);

	const CONTENT_QUERY = [
		'section:not([hidden]) > :is(h2, h3, p, ol > li)',
		'section:not([hidden]) li:not([hidden])',
		'section:not([hidden]) tbody > tr:not([hidden])',
		'section:not([hidden]) .widget',
		'#doc-pagination > a:not([hidden])',
	].join(', ');
	const SIDEBAR_QUERY = 'details[open] ul > a, details summary';

	const tabbable = (root = main) => {
		root.querySelectorAll('section > :is(h2, h3, p), section li, section tbody > tr, .widget').forEach((el) => {
			if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
		});
	};

	let route = 'start';
	let contentElement = null;
	let sidebarElement = null;

	// Was eine Route ist: Titel, Pfad, Eltern, Nachbarn
	const describe = (r) => {
		const [kopf, rest] = r.split(/\/(.*)/s);
		if (kopf === 'projekte' && rest) {
			const i = Number(rest) - 1;
			const p = projekte[i];
			if (!p) return null;
			return { kind: 'projekt', item: p, index: i, list: projekte.map((_, j) => `projekte/${j + 1}`), title: p.titel, path: 'katalog/projekte', parent: 'projekte' };
		}
		if (kopf === 'code' && rest) {
			const repo = repoByName[rest.toLowerCase()];
			if (!repo) return null;
			return { kind: 'repo', item: repo, index: repos.indexOf(repo), list: repos.map((x) => `code/${x.name}`), title: repo.name, path: 'katalog/code', parent: 'code' };
		}
		const s = sectionFor(r);
		if (!s || s === detail) return null;
		const parent = r.includes('/') ? r.split('/')[0] : 'start';
		return { kind: 'seite', section: s, index: ORDER.indexOf(r), list: ORDER, title: s.dataset.title, path: s.dataset.path, parent };
	};

	const labelFor = (r) => {
		const d = describe(r);
		return d ? `${d.path}/ ${d.title}` : r;
	};

	const show = (r, { focus = false } = {}) => {
		let d = describe(r);
		if (!d) {
			r = 'start';
			d = describe(r);
		}
		route = r;

		if (d.kind === 'projekt') renderProjekt(d.item, d.index);
		if (d.kind === 'repo') renderRepo(d.item);
		const visible = d.section ?? detail;
		if (d.kind !== 'seite') {
			detail.dataset.title = d.title;
			detail.dataset.path = d.path;
		}
		sections.forEach((s) => (s.hidden = s !== visible));

		titleEl.textContent = d.kind === 'seite' ? d.title : `${d.parent === 'code' ? 'Code' : 'Projekte'} / ${d.title}`;
		posEl.textContent = d.index >= 0 ? `${d.index + 1}/${d.list.length}` : '';
		pathEl.textContent = `~/wiredframe/${r}`;
		document.title = `${d.title} | wiredframe im Terminal`;
		const aktiv = ORDER.includes(r) ? r : d.parent;
		sidebarLinks.forEach((a) => a.classList.toggle('active', a.dataset.slug === aktiv));

		const prev = d.index > 0 ? d.list[d.index - 1] : null;
		const next = d.index >= 0 && d.index < d.list.length - 1 ? d.list[d.index + 1] : null;
		prevLink.hidden = !prev;
		nextLink.hidden = !next;
		if (prev) {
			prevLink.href = `#${prev}`;
			prevLink.querySelector('[data-label]').textContent = labelFor(prev);
		}
		if (next) {
			nextLink.href = `#${next}`;
			nextLink.querySelector('[data-label]').textContent = labelFor(next);
		}

		tabbable();
		main.scrollTop = 0;
		contentElement = null;
		cursorEl.textContent = '1:1';
		zaehlerLaufen(r === 'start');
		if (focus) {
			const first = main.querySelector(CONTENT_QUERY);
			if (first) vimFocusElement(first);
		}
	};

	const go = (r, opts) => {
		if (location.hash !== `#${r}`) history.pushState(null, '', `#${r}`);
		show(r, opts);
		showDocs();
	};
	const up = () => {
		const d = describe(route);
		if (d && route !== 'start') go(d.parent, { focus: true });
	};

	window.addEventListener('popstate', () => show(decodeURIComponent(location.hash.slice(1))));

	// Klicks auf Seitenlinks und Katalogzeilen bleiben in der Anwendung
	document.addEventListener('click', (e) => {
		const a = e.target.closest('a[href^="#"]');
		const tr = !a && e.target.closest('tr[data-href]');
		const ziel = a?.getAttribute('href') ?? tr?.dataset.href;
		if (!ziel) return;
		const r = decodeURIComponent(ziel.slice(1));
		if (!describe(r)) return;
		e.preventDefault();
		go(r, { focus: !!a?.closest('#doc-pagination') });
	});

	// ========================================
	// Darstellung
	// ========================================
	const neuesZeile = (n) =>
		`<tr data-href="#${esc(n.ziel)}"><td>${datum(n.datum)}</td><td><span is-="badge" variant-="${ARTFARBE[n.art] ?? 'background2'}">${esc(n.art)}</span></td><td><a href="#${esc(n.ziel)}">${esc(n.titel)}</a><br>${esc(n.text)}</td></tr>`;

	const balken = (rows, max, farbe) =>
		rows
			.map(
				([name, n], i) =>
					`<row gap-="1" align-="center" class="balken"><span class="balken__name">${esc(name)}</span><div is-="progress" self-="grow" style="--progress-value:${n};--progress-max:${max};--progress-value-background:var(--${farbe[i % farbe.length]})"></div><span class="balken__zahl">${n}</span></row>`,
			)
			.join('');

	const repoZeile = (r) => `<tr data-href="#code/${esc(r.name)}"><td><a href="#code/${esc(r.name)}">${esc(r.name)}</a><br>${esc(r.beschreibung)}</td><td>${sprache(r.sprache)}</td></tr>`;

	const renderStatic = () => {
		const k = WF.kennzahlen;
		document.querySelectorAll('[data-kennzahl="dokumentiert"]').forEach((el) => (el.textContent = k.dokumentiert));
		document.querySelectorAll('[data-stand]').forEach((el) => (el.textContent = datum(WF.stand)));
		document.getElementById('widget-neues').innerHTML = WF.neues.slice(0, 6).map((n) => `<li><a href="#${esc(n.ziel)}" title="${datum(n.datum)}">${esc(n.titel)}</a></li>`).join('');
		document.getElementById('neues-liste').innerHTML = WF.neues.map(neuesZeile).join('');
		document.getElementById('widget-arten').innerHTML = balken(k.gattungen, k.dokumentiert, ['lime', 'peach', 'sky']);
		document.getElementById('projekte-statistik').innerHTML =
			`<p>${k.dokumentiert} dokumentierte Projekte von ${k.von} bis ${k.bis}, nach Feldern:</p>` +
			balken(k.felder, k.felder[0][1], ['lime', 'mint', 'teal', 'sky', 'blue', 'lavender', 'rose', 'peach', 'sand']) +
			`<p>Technik der Onlineshops: ${k.techniken.map(([t, n]) => `<span is-="badge" variant-="background2">${esc(t)} ${n}</span>`).join(' ')}</p>`;
		document.getElementById('mitwisser-zahlen').innerHTML = WF.mitwisser.zahlen.map((z) => `<tr><td><strong>${z.wert}</strong></td><td>${esc(z.text)}</td></tr>`).join('');
		document.querySelectorAll('[data-mitwisser="schriftfuehrer"]').forEach((el) => (el.textContent = WF.mitwisser.schriftfuehrer));
		document.querySelectorAll('[data-mitwisser="stand"]').forEach((el) => (el.textContent = WF.mitwisser.stand));
		document.getElementById('code-liste').innerHTML = repos
			.map((r) => `<tr data-href="#code/${esc(r.name)}"><td><a href="#code/${esc(r.name)}">${esc(r.name)}</a><br>${esc(r.beschreibung)}</td><td>${sprache(r.sprache)}</td><td>${esc(r.monat)}</td></tr>`)
			.join('');
		document.querySelectorAll('[data-repos]').forEach((tbody) => {
			tbody.innerHTML = tbody.dataset.repos
				.split(' ')
				.map((n) => repoByName[n.toLowerCase()])
				.filter(Boolean)
				.map(repoZeile)
				.join('');
		});
		document.querySelectorAll('[data-years]').forEach((el) => (el.textContent = new Date().getFullYear() - 2005));
		renderProjektListe();
	};

	const projektListe = document.getElementById('projekte-liste');
	const renderProjektListe = () => {
		projektListe.innerHTML = projekte
			.map(
				(p, i) =>
					`<tr data-href="#projekte/${i + 1}" data-value="${esc(p.suche)}"><td><a href="#projekte/${i + 1}">${esc(p.titel)}</a>${p.technik ? ` <span is-="badge" variant-="lavender">${esc(p.technik)}</span>` : ''}</td><td>${esc(p.jahr)}</td></tr>`,
			)
			.join('');
	};

	// Lange Adressen wie Figma-Prototypen sprengen die Zeile, gezeigt wird
	// deshalb nur der Host, der Link führt trotzdem ans volle Ziel
	const kurz = (url) => {
		try {
			const u = new URL(url);
			return u.hostname.endsWith('figma.com') ? 'Figma-Prototyp' : u.hostname.replace(/^www\./, '');
		} catch {
			return url;
		}
	};

	const zeile = (k, v) => (v ? `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>` : '');

	const renderProjekt = (p) => {
		const bild = p.bild
			? `<img src="../images/referenzen/thumbs/${esc(p.bild)}-800.webp" alt="Screenshot: ${esc(p.titel)}" class="screenshot">`
			: '';
		detail.innerHTML = `
			<h2>${esc(p.titel)}</h2>
			<table divide-="horizontal" class="kv" is-="typography-block"><tbody>
				${zeile('Jahr', esc(p.jahr))}
				${zeile('Art', esc(p.typ))}
				${zeile('Branche', esc(p.branche))}
				${zeile('Technik', esc(p.technik))}
				${zeile('Über', esc(p.agentur))}
				${zeile('Adresse', p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(kurz(p.url))}</a>` : '')}
			</tbody></table>
			${p.beschreibung ? `<p>${esc(p.beschreibung)}</p>` : ''}
			${bild}
			${offen ? '' : '<p>Name und Auftraggeber nenne ich gern, im Gespräch oder mit dem Codewort. <a href="#kontakt">Kontakt</a></p>'}`;
	};

	const notizen = (text) => {
		const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
		const punkte = text
			.split('\n')
			.map((z) => z.trim())
			.filter((z) => z && !z.startsWith('#'));
		return punkte.map((z) => `<li>${inline(z.replace(/^[-*]\s+/, ''))}</li>`).join('');
	};

	const renderRepo = (r) => {
		const rel = r.releases;
		detail.innerHTML = `
			<h2>${esc(r.name)}</h2>
			<p>${esc(r.beschreibung)}</p>
			<table divide-="horizontal" class="kv" is-="typography-block"><tbody>
				${zeile('Sprache', sprache(r.sprache))}
				${zeile('Geändert', datum(r.geaendert))}
				${zeile('Angelegt', datum(r.erstellt))}
				${zeile('Version', rel.length ? `${esc(rel[0].tag)} vom ${datum(rel[0].datum)}` : '')}
				${zeile('Installieren', r.brew ? `<code>${esc(r.brew)}</code>` : '')}
			</tbody></table>
			<row gap-="1"><a is-="button" box-="square" variant-="lime" href="${esc(r.url)}" target="_blank" rel="noopener">Auf GitHub öffnen</a></row>
			${
				rel.length
					? `<h3>Versionen</h3>${rel
							.map(
								(v) =>
									`<p><span is-="badge" variant-="peach">${esc(v.tag)}</span> ${datum(v.datum)} <strong>${esc(v.name)}</strong></p>${v.notizen ? `<ul marker-="tree">${notizen(v.notizen)}</ul>` : ''}`,
							)
							.join('')}`
					: ''
			}`;
	};

	// ========================================
	// Mobilnavigation, wie in Doc.astro
	// ========================================
	const showMenu = () => {
		sidebarContainer.classList.remove('mobile-hidden');
		article.classList.add('mobile-hidden');
		menuButton.setAttribute('variant-', '');
		docsButton.setAttribute('variant-', 'background1');
	};
	const showDocs = () => {
		sidebarContainer.classList.add('mobile-hidden');
		article.classList.remove('mobile-hidden');
		menuButton.setAttribute('variant-', 'background1');
		docsButton.setAttribute('variant-', '');
	};
	menuButton.addEventListener('click', showMenu);
	docsButton.addEventListener('click', showDocs);

	// ========================================
	// Tastatur
	// ========================================
	const reattachContent = applyVimNavigation(main, CONTENT_QUERY, (el, els) => {
		contentElement = el;
		cursorEl.textContent = `${Array.from(els).indexOf(el) + 1}:${els.length}`;
	});
	applyVimNavigation(sidebar, SIDEBAR_QUERY, (el) => (sidebarElement = el));

	const findFirstVisible = () =>
		Array.from(reattachContent()).find((el) => {
			const r = el.getBoundingClientRect();
			return r.top >= 0 && r.bottom <= window.innerHeight;
		});

	const focusSidebar = () => {
		const el = sidebarElement ?? sidebar.querySelector('ul > a.active');
		if (!el) return;
		if (getComputedStyle(sidebarContainer).display === 'none') showMenu();
		vimFocusElement(el);
	};
	const focusContent = () => {
		showDocs();
		const el = (contentElement?.isConnected && !contentElement.closest('[hidden]') && contentElement) || findFirstVisible();
		if (el) vimFocusElement(el);
	};
	const nachbar = (schritt) => {
		const d = describe(route);
		const ziel = d && d.index >= 0 ? d.list[d.index + schritt] : null;
		if (ziel) go(ziel, { focus: true });
	};

	window.addEventListener('keydown', (e) => {
		const mod = e.ctrlKey || e.metaKey;

		if (mod && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			openPalette();
			return;
		}
		if (isUserTyping()) {
			if (e.key === 'Escape') document.activeElement.blur();
			return;
		}
		if (e.ctrlKey && (e.key === 'n' || e.key === 'p')) {
			e.preventDefault();
			nachbar(e.key === 'n' ? 1 : -1);
			return;
		}
		if (e.ctrlKey && (e.key === 'o' || e.key === 'i')) {
			e.preventDefault();
			e.key === 'o' ? history.back() : history.forward();
			return;
		}
		if (mod || e.altKey) return;

		const inMain = main.contains(document.activeElement);
		const inSidebar = sidebar.contains(document.activeElement);

		if (e.key === '/') {
			e.preventDefault();
			openPalette();
		} else if (e.key === '?') {
			e.preventDefault();
			go('tastatur', { focus: true });
		} else if (e.key === 'Backspace') {
			e.preventDefault();
			up();
		} else if (e.key === 'h' || e.key === 'ArrowLeft') {
			focusSidebar();
		} else if (e.key === 'l' || e.key === 'ArrowRight') {
			focusContent();
		} else if ((e.key === 'j' || e.key === 'ArrowDown') && !inMain && !inSidebar) {
			e.preventDefault();
			focusContent();
		} else if (e.key === 'Enter' && inMain && !document.activeElement.matches('a, button')) {
			const el = document.activeElement;
			if (el.dataset.href) el.click();
			else el.querySelector('a[href]')?.click();
		}
		codewortPuffer(e);
	});

	// Die Tastenleiste unter der Navigation, wie VimNavigation.astro
	const keyMap = { ArrowLeft: 'h', ArrowDown: 'j', ArrowUp: 'k', ArrowRight: 'l' };
	const keyButton = (key) => document.querySelector(`#vim-navigation [data-key="${CSS.escape(keyMap[key] ?? key)}"]`);
	window.addEventListener('keydown', (e) => {
		if (isUserTyping() || e.ctrlKey || e.metaKey) return;
		keyButton(e.key)?.setAttribute('variant-', 'foreground1');
	});
	window.addEventListener('keyup', (e) => keyButton(e.key)?.setAttribute('variant-', 'background2'));
	document.querySelectorAll('#vim-navigation [data-key]').forEach((b) =>
		b.addEventListener('click', () => {
			const k = b.dataset.key;
			if (k === 'h') return focusSidebar();
			if (k === 'l') return focusContent();
			if (k === '/') return openPalette();
			if (k === '?') return go('tastatur', { focus: true });
			const im = sidebar.contains(document.activeElement) ? sidebar : main;
			const els = im.querySelectorAll(im === sidebar ? SIDEBAR_QUERY : CONTENT_QUERY);
			if (!Array.from(els).includes(document.activeElement)) return focusContent();
			const { next, prev } = paginateElements(document.activeElement, els);
			(k === 'j' ? next : prev).focus();
		}),
	);

	// ========================================
	// Befehlspalette, wie Filter.astro
	// ========================================
	const dialog = document.getElementById('search-dialog');
	const input = document.getElementById('search-input');
	const resultsBox = document.getElementById('search-results-container');
	let activeLink = null;

	const commands = () => [
		...sidebarLinks.map((a) => ({ group: describe(a.dataset.slug)?.path ?? '', label: a.textContent, run: () => go(a.dataset.slug, { focus: true }) })),
		...projekte.map((p, i) => ({ group: 'projekt', label: `${p.titel} (${p.jahr})`, run: () => go(`projekte/${i + 1}`, { focus: true }) })),
		...repos.map((r) => ({ group: 'code', label: `${r.name}: ${r.beschreibung}`, run: () => go(`code/${r.name}`, { focus: true }) })),
		{ group: 'aktion', label: 'Telegramm hinterlassen (E-Mail)', run: () => (go('kontakt'), document.getElementById('telegramm-betreff').focus()) },
		{ group: 'aktion', label: 'Konspiratives Treffen (Termin buchen)', run: () => document.getElementById('termin-link').click() },
		{ group: 'aktion', label: 'Codewort eingeben', run: () => (go('projekte'), document.getElementById(offen ? 'filter-input' : 'codewort-input').focus()) },
		{ group: 'aktion', label: 'Grafische Fassung öffnen', run: () => (location.href = '../') },
		{ group: 'aktion', label: 'Impressum', run: () => (location.href = '../impressum.html') },
	];

	const renderCommands = () => {
		resultsBox.replaceChildren(
			...commands().map((c) => {
				const a = document.createElement('a');
				a.className = 'search-result';
				a.tabIndex = 0;
				a.href = '#';
				a.dataset.value = `${c.group}: ${c.label}`;
				a.textContent = `${c.group}: ${c.label}`;
				a.addEventListener('click', (e) => {
					e.preventDefault();
					dialog.close();
					c.run();
				});
				return a;
			}),
		);
	};

	const setActive = (link) => {
		resultsBox.querySelectorAll('.search-result.active').forEach((l) => l.classList.remove('active'));
		activeLink = link;
		if (link) {
			link.classList.add('active');
			link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
		}
	};

	const filterCommands = () => {
		const value = input.value.trim().toLowerCase();
		resultsBox.querySelectorAll('.search-result').forEach((el) => el.classList.toggle('hidden', !el.dataset.value.toLowerCase().includes(value)));
		setActive(resultsBox.querySelector('.search-result:not(.hidden)'));

		if (!window.CSS?.highlights) return;
		CSS.highlights.delete('search');
		if (!value) return;
		const ranges = [];
		resultsBox.querySelectorAll('.search-result:not(.hidden)').forEach((el) => {
			const node = el.firstChild;
			const text = node.textContent.toLowerCase();
			for (let pos = text.indexOf(value); pos !== -1; pos = text.indexOf(value, pos + value.length)) {
				const r = new Range();
				r.setStart(node, pos);
				r.setEnd(node, pos + value.length);
				ranges.push(r);
			}
		});
		CSS.highlights.set('search', new Highlight(...ranges));
	};

	function openPalette() {
		renderCommands();
		input.value = '';
		filterCommands();
		dialog.showModal();
		input.focus();
	}

	input.addEventListener('input', () => {
		if (input.value.trim().toLowerCase() === CODEWORT) {
			dialog.close();
			freischalten();
			return;
		}
		filterCommands();
	});

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' || (e.key === 'c' && e.ctrlKey)) {
			e.preventDefault();
			dialog.close();
			return;
		}
		if (!activeLink) return;
		const visible = resultsBox.querySelectorAll('.search-result:not(.hidden)');
		const { prev, next } = paginateElements(activeLink, visible);
		if ((e.key === 'n' && e.ctrlKey) || e.key === 'ArrowDown') {
			e.preventDefault();
			setActive(next);
		}
		if ((e.key === 'p' && e.ctrlKey) || e.key === 'ArrowUp') {
			e.preventDefault();
			setActive(prev);
		}
		if (e.key === 'Enter') {
			e.preventDefault();
			activeLink.click();
		}
	});

	document.getElementById('search-button').addEventListener('click', openPalette);
	document.getElementById('close-btn').addEventListener('click', () => dialog.close());
	dialog.addEventListener('click', (e) => {
		if (e.target === dialog) dialog.close();
	});
	dialog.addEventListener('close', () => window.CSS?.highlights?.delete('search'));

	// ========================================
	// Projekte hinter dem Codewort
	// ----------------------------------------
	// Wie auf der grafischen Seite: eine Inszenierung, kein Schloss.
	// data/references.json liegt offen auf dem Server.
	// ========================================
	const CODEWORT = 'herbstlaub';
	const MERKER = 'wf-projekte';
	const codewortFeld = document.getElementById('codewort-feld');
	const codewortInput = document.getElementById('codewort-input');
	const filterFeld = document.getElementById('filter-feld');
	const filterInput = document.getElementById('filter-input');
	const filterZahl = document.getElementById('filter-zahl');
	const modeEl = document.getElementById('mode');
	let puffer = '';

	function codewortPuffer(e) {
		if (e.key.length !== 1) return;
		puffer = (puffer + e.key.toLowerCase()).slice(-CODEWORT.length);
		if (puffer === CODEWORT) freischalten();
	}

	codewortInput.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		if (codewortInput.value.trim().toLowerCase() === CODEWORT) freischalten();
		else {
			codewortInput.value = '';
			codewortInput.placeholder = 'Falsches Codewort. Die Eiche schweigt.';
		}
	});

	const filtern = () => {
		const v = filterInput.value.trim().toLowerCase();
		let n = 0;
		projektListe.querySelectorAll('tr').forEach((tr) => {
			const hit = !v || tr.dataset.value.includes(v);
			tr.hidden = !hit;
			if (hit) n++;
		});
		filterZahl.textContent = `${n} Akten`;
	};
	filterInput.addEventListener('input', filtern);
	filterInput.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === 'ArrowDown') {
			e.preventDefault();
			const first = projektListe.querySelector('tr:not([hidden])');
			if (first) vimFocusElement(first);
		}
	});

	async function freischalten({ zeigen = true } = {}) {
		if (offen) return;
		offen = true;
		let daten;
		try {
			daten = await (await fetch('../data/references.json')).json();
		} catch {
			offen = false;
			return;
		}
		try {
			sessionStorage.setItem(MERKER, '1');
		} catch {
			/* dann eben nur bis zum Neuladen */
		}
		projekte = daten.map((p) => ({
			titel: p.Projekttitel,
			jahr: p.Jahr,
			typ: p.Typ,
			branche: p.Branche,
			agentur: p.Agentur,
			beschreibung: p.Beschreibung,
			url: p.URL,
			bild: (p.Image || '').replace(/\.[a-z]+$/i, ''),
			suche: [p.Jahr, p.Typ, p.Branche, p.Agentur, p.Projekttitel].join(' ').toLowerCase(),
		}));
		renderProjektListe();
		document.getElementById('projekte-text').textContent = `„${CODEWORT}“, ganz richtig. Die Akten liegen offen auf dem Tisch, mit allen Namen: ${projekte.length} Projekte. Enter öffnet ein Projekt.`;
		codewortFeld.hidden = true;
		filterFeld.hidden = false;
		modeEl.textContent = 'AKTEN OFFEN';
		modeEl.setAttribute('variant-', 'rose');
		filtern();
		if (route.startsWith('projekte')) show(route);
		if (!zeigen) return;
		go('projekte');
		filterInput.focus();
	}

	// ========================================
	// Kontakt
	// ========================================
	const rev = (s) => s.split('').reverse().join('');
	const adresse = () => `${rev('ofni')}@${rev('emarfderiw')}.${rev('ed')}`;
	document.getElementById('telegramm').addEventListener('submit', (e) => {
		e.preventDefault();
		const betreff = document.getElementById('telegramm-betreff').value.trim() || 'Telegramm von der Terminal-Seite';
		const text = document.getElementById('telegramm-text').value.trim();
		location.href = `mailto:${adresse()}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(text)}`;
	});

	// ========================================
	// Der Zähler von der grafischen Seite
	// ========================================
	const zaehlerEl = document.getElementById('zaehler');
	let zaehlerWert = 100000 + Math.floor((Date.now() - Date.parse('2024-01-01')) / 864e5) * 50;
	let zaehlerTimer = 0;
	function zaehlerLaufen(an) {
		zaehlerEl.textContent = zaehlerWert;
		if (an && !zaehlerTimer) {
			zaehlerTimer = setInterval(() => (zaehlerEl.textContent = zaehlerWert += 50), 100);
		} else if (!an) {
			clearInterval(zaehlerTimer);
			zaehlerTimer = 0;
		}
	}

	// ========================================
	// Start
	// ========================================
	renderStatic();
	show(decodeURIComponent(location.hash.slice(1)) || 'start');
	try {
		if (sessionStorage.getItem(MERKER) === '1') freischalten({ zeigen: false });
	} catch {
		/* ohne Speicher eben verschlossen */
	}
})();
