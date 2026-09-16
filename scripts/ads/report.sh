#!/usr/bin/env bash
# Zet alle gemaakte creatives met hun resultaten in één tabel.
#
# @ai-why Het resultaat woont in het recept zelf, niet in een apart logboek. Eén
# bestand per creative, met zowel wat het was als wat het deed. Twee plekken voor
# dezelfde informatie lopen gegarandeerd uit de pas.
# @ai-sync docs/marketing/video/README.md beschrijft deze werkwijze.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIR="${1:-$HERE/recipes/creatives}"

shopt -s nullglob
FILES=("$DIR"/*.json)
if [ ${#FILES[@]} -eq 0 ]; then
  echo "Nog geen creatives in $DIR."
  echo "Kopieer een template uit $HERE/recipes/templates/ om te beginnen."
  exit 0
fi

{
  printf 'naam\tstijl\tgepubliceerd\tplatform\tbesteed\tvertoningen\t3s\tctr\tinstalls\toordeel\n'
  for f in "${FILES[@]}"; do
    jq -r '[
      .name,
      (.style // "bold"),
      (.results.published // "-"),
      (.results.platform // "-"),
      (if .results.spend then "€" + (.results.spend|tostring) else "-" end),
      (.results.impressions // "-" | tostring),
      (if .results.hold_3s then (.results.hold_3s|tostring) + "%" else "-" end),
      (if .results.ctr then (.results.ctr|tostring) + "%" else "-" end),
      (.results.installs // "-" | tostring),
      (.results.verdict // "nog niet beoordeeld")
    ] | @tsv' "$f"
  done
} | column -t -s $'\t'

echo
UNRATED=$(for f in "${FILES[@]}"; do jq -r 'select(.results.verdict == null) | .name' "$f"; done | wc -l | tr -d ' ')
echo "${#FILES[@]} creatives, $UNRATED nog zonder oordeel."
# @ai-why Onder de vijf beoordeelde ads is elk patroon toeval. Deze grens staat er
# zodat niemand na twee ads een conclusie opschrijft en daarop gaat sturen.
RATED=$(( ${#FILES[@]} - UNRATED ))
if [ "$RATED" -lt 5 ]; then
  echo "Nog te weinig om patronen uit te lezen: $RATED van de 5 beoordeeld."
fi
