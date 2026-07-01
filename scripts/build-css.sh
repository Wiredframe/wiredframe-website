#!/usr/bin/env bash
#
# Kompiliert das statische Tailwind-CSS für projekte.html und ersetzt damit den
# Runtime-Compiler (früher js/tailwind.js, 407 KB + MutationObserver).
#
# Nach dem Ändern von Tailwind-Klassen in projekte.html erneut ausführen:
#   bash scripts/build-css.sh
#
# Voraussetzung: Node/npm (npx lädt Tailwind 3.4.17 bei Bedarf).
set -euo pipefail

npx --yes tailwindcss@3.4.17 \
	-c tailwind.config.js \
	-i css/tailwind.src.css \
	-o css/projekte.css \
	--minify

echo "Fertig: css/projekte.css"
