#!/usr/bin/env bash
# Bouwt de outro: het slotstuk dat je achter elke montage plakt (Concat, CapCut,
# of de ad-pijplijn). Kop die meewisselt, spieren die oplichten, en het figuur
# dat in een echte schermopname landt.
#
# gebruik: build-outro.sh [nl|en|beide] [--ratio 9:16] [--fps 30]
#
# @ai-why Chrome rendert elk frame, ffmpeg plakt ze aan elkaar. De beweging zit
# dus in de pagina (frames/outro-anim.html) en niet in ffmpeg-expressies: de
# landing is een transform met een eigen easing, en de spiertint hangt aan een
# mask met mix-blend-mode. Dat is in een filtergraph niet na te bouwen, in CSS
# is het tien regels.
# @ai-sync scripts/ads/render-frames.js drukt de frames af; scripts/ads/outro.json bevat de teksten.
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEDIA_ROOT="${CARVE_ADS_ROOT:-$HOME/Developer/celiker-studio/carve}"

LANGS="beide"; RATIO="9:16"; FPS=30
[ $# -gt 0 ] && case "$1" in nl|en|beide) LANGS="$1"; shift;; esac
while [ $# -gt 0 ]; do
  case "$1" in
    --ratio) RATIO="${2:-}"; shift 2;;
    --fps)   FPS="${2:-}"; shift 2;;
    *) echo "onbekende optie: $1" >&2; exit 1;;
  esac
done
# @ai-gotcha De opmaak is op 9:16 ontworpen: de telefoon staat rechtop en de kop
# is op die breedte uitgemeten. Een vierkant kader vraagt een eigen indeling.
case "$RATIO" in
  9:16) W=1080; H=1920;;
  *) echo "alleen 9:16 heeft een indeling; zie frames/outro-anim.html" >&2; exit 1;;
esac
[ "$LANGS" = "beide" ] && LANGS="nl en"

for LANG in $LANGS; do
  WORK="$MEDIA_ROOT/_werk/outro-$LANG"
  rm -rf "$WORK"; mkdir -p "$WORK/frames"
  OUTDIR="$MEDIA_ROOT/export/outro"; mkdir -p "$OUTDIR"
  OUT="$OUTDIR/carve-outro-$LANG-${RATIO//:/x}.mp4"

  echo "▸ outro $LANG  ${W}x${H} @ ${FPS}fps"
  python3 "$HERE/render-outro-html.py" "$LANG" "$W" "$H" > "$WORK/outro.html"
  node "$HERE/render-frames.js" "$WORK/outro.html" "$WORK/frames" "$W" "$H" "$FPS"

  # @ai-gotcha Een stil audiospoor is geen opsmuk: zonder audio verspringt het
  # geluid van de montage waar je dit achter plakt.
  ffmpeg -nostdin -v error -y -framerate "$FPS" -i "$WORK/frames/f_%04d.png" \
    -f lavfi -i "anullsrc=r=48000:cl=stereo" -shortest \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -level 4.1 \
    -c:a aac -b:a 192k -movflags +faststart "$OUT"
  echo "✓ $OUT  ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")s)"
done
