#!/usr/bin/env bash
# Copia los archivos estáticos del Symfony (web/) a public/: CSS, JS, imágenes,
# fuentes, íconos, documentos y el chat. Son los mismos archivos que sirve
# ford.cr hoy; no se tocan para que el sitio se vea igual.
# Uso: scripts/sync-legacy-assets.sh <ruta-a-web-del-symfony>
set -euo pipefail
SRC="${1:-../web}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/public"
mkdir -p "$DEST"
for d in img fonts icomoon icons chat documents preaprobador specs sucursales testDrive renting show_calculate galleries; do
  if [ -d "$SRC/$d" ]; then rm -rf "${DEST:?}/$d"; cp -R "$SRC/$d" "$DEST/$d"; fi
done
# Visor de fichas técnicas (/view-pdf) usa el flipbook de micrositios/purdyRsc.
mkdir -p "$DEST/micrositios"
if [ -d "$SRC/micrositios/purdyRsc" ]; then rm -rf "$DEST/micrositios/purdyRsc"; cp -R "$SRC/micrositios/purdyRsc" "$DEST/micrositios/purdyRsc"; fi
for f in favicon.ico favicon-16x16.png favicon-32x32.png apple-touch-icon.png android-chrome-96x96.png android-chrome-192x192.png android-chrome-384x384.png mstile-150x150.png safari-pinned-tab.svg manifest.json site.webmanifest browserconfig.xml robots.txt sitemap.xml a6m9txx8az0708yq13yrhyolmqip38.html; do
  [ -f "$SRC/$f" ] && cp "$SRC/$f" "$DEST/$f"
done
# El chat trae su backend en PHP (Avaya). Aquí no se ejecuta, así que no se
# publica: servirlo sería exponer su código fuente.
find "$DEST" -name '*.php' -type f -delete
echo "Archivos estáticos sincronizados en $DEST"
