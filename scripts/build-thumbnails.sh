#!/usr/bin/env bash
#
# Erzeugt quadratische, oben beschnittene Vorschaubilder für die Referenz-Galerie.
# Pro Original werden 4 Dateien in images/referenzen/thumbs/ abgelegt:
#   <name>-480.webp  <name>-800.webp   (moderne Browser)
#   <name>-480.jpg   <name>-800.jpg    (Fallback)
#
# Aufruf (aus dem Projekt-Root):   bash scripts/build-thumbnails.sh
# Neue Projekte hinzufügen:        einfach erneut ausführen – bereits erzeugte
#                                  Thumbnails werden übersprungen (--force zum Neubau).
#
# Voraussetzung: ImageMagick (`magick`).
set -euo pipefail

SRC="images/referenzen"
OUT="$SRC/thumbs"
FORCE="${1:-}"

if ! command -v magick >/dev/null 2>&1; then
	echo "Fehler: ImageMagick (magick) nicht gefunden." >&2
	exit 1
fi

mkdir -p "$OUT"

count=0
skipped=0
for f in "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.png; do
	[ -e "$f" ] || continue
	base="$(basename "$f")"
	base="${base%.*}"

	if [ "$FORCE" != "--force" ] \
		&& [ -f "$OUT/$base-800.webp" ] && [ -f "$OUT/$base-480.webp" ] \
		&& [ -f "$OUT/$base-800.jpg" ]  && [ -f "$OUT/$base-480.jpg" ]; then
		skipped=$((skipped + 1))
		continue
	fi

	# Ein (teurer) Decode des Originals -> quadratischer 800er-Crop von oben.
	magick "$f" -resize '800x800^' -gravity North -extent 800x800 \
		-strip -quality 82 "$OUT/$base-800.jpg"

	# Restliche Varianten aus dem kleinen 800er-JPG ableiten (schnell).
	magick "$OUT/$base-800.jpg" -quality 80 -define webp:method=6 "$OUT/$base-800.webp"
	magick "$OUT/$base-800.jpg" -resize '480x480' -strip -quality 82 "$OUT/$base-480.jpg"
	magick "$OUT/$base-480.jpg" -quality 80 -define webp:method=6 "$OUT/$base-480.webp"

	count=$((count + 1))
	printf '[%3d] %s\n' "$count" "$base"
done

echo "Fertig: $count neu erzeugt, $skipped übersprungen. Ziel: $OUT"
