#!/usr/bin/env bash
# Bouwt een Carve-ad uit een recept-JSON. Zie README.md in deze map.
#
# @ai-why Vervangt handmatig monteren in een video-editor. Het recept is de bron
# van waarheid; de mp4 is wegwerpbaar en staat daarom buiten git.
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEDIA_ROOT="${CARVE_ADS_ROOT:-$HOME/Developer/celiker-studio/carve}"
MODEL="${WHISPER_MODEL:-$HOME/.cache/whisper-cpp/ggml-small.bin}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

usage() {
  echo "gebruik: build-ad.sh <recept.json> [--ratio 9:16|1:1|16:9] [--style naam] [--no-captions]" >&2
  echo "stijlen: $(ls "$HERE/styles" | sed 's/\.css$//' | tr '\n' ' ')" >&2
  exit 1
}

RECIPE="${1:-}"; [ -n "$RECIPE" ] || usage; shift
[ -f "$RECIPE" ] || { echo "recept niet gevonden: $RECIPE" >&2; exit 1; }
# @ai-gotcha We cd'en verderop naar de werkmap, dus het recept-pad moet absoluut zijn.
RECIPE="$(cd "$(dirname "$RECIPE")" && pwd)/$(basename "$RECIPE")"

RATIO="9:16"; NO_CAPS=""; STYLE_ARG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --ratio) RATIO="${2:-}"; shift 2;;
    --style) STYLE_ARG="${2:-}"; shift 2;;
    --no-captions) NO_CAPS="yes"; shift;;
    *) usage;;
  esac
done
case "$RATIO" in
  9:16) W=1080; H=1920;; 1:1) W=1080; H=1080;; 16:9) W=1920; H=1080;;
  *) echo "onbekende ratio: $RATIO" >&2; exit 1;;
esac

j() { jq -r "$1" "$RECIPE"; }
NAME="$(j '.name')"; FPS="$(j '.fps // 30')"; LANG="$(j '.language // "nl"')"
# @ai-gotcha `.captions // true` geeft true bij "captions": false, want jq's //
# springt niet alleen bij null maar ook bij false naar de rechterkant. Daarmee
# werd ondertiteling uitzetten in een recept stil genegeerd.
CAPTIONS="$(jq -r 'if has("captions") then .captions else true end' "$RECIPE")"
[ -n "$NO_CAPS" ] && CAPTIONS=false
STYLE="${STYLE_ARG:-$(j '.style // "bold"')}"
STYLE_CSS="$HERE/styles/$STYLE.css"
[ -f "$STYLE_CSS" ] || { echo "onbekende stijl: $STYLE" >&2; usage; }
# @ai-why De bronmap is standaard de mediamap zelf, niet één submap. Een ad trekt
# uit meerdere submappen tegelijk (schermopname als bewijs, gefilmd of gegenereerd
# beeld als context), dus clips dragen hun submap: "1-schermopnames/scan.mov".
FOOTAGE="$(j '.footage_dir // ""')"; FOOTAGE="${FOOTAGE/#\~/$HOME}"
[ -n "$FOOTAGE" ] || FOOTAGE="$MEDIA_ROOT/materiaal"

SLUG="${RATIO//:/x}"
# @ai-sync ~/Developer/celiker-studio/carve/LEESMIJ.txt beschrijft dezelfde mapindeling.
CHANNEL="$(j '.channel // "ads"')"
case "$CHANNEL" in
  ads) OUTDIR="$MEDIA_ROOT/export/ads";;
  social) OUTDIR="$MEDIA_ROOT/export/socials";;
  *) echo "onbekend kanaal: $CHANNEL (kies ads of social)" >&2; exit 1;;
esac
WORK="$MEDIA_ROOT/_werk/$NAME-$STYLE-$SLUG"
OUT="$OUTDIR/$(date +%Y-%m-%d)-$NAME-$STYLE-$SLUG.mp4"
rm -rf "$WORK"; mkdir -p "$WORK" "$OUTDIR"
cd "$WORK"
echo "▸ $NAME  ${W}x${H} @ ${FPS}fps  stijl=$STYLE  kanaal=$CHANNEL  captions=$CAPTIONS"

render_html() { # <html-pad> <png-pad> [--opaque]
  # @ai-gotcha macOS levert bash 3.2, en daar breekt "${arr[@]}" op een lege array
  # onder set -u. Vandaar de +-expansie in plaats van een kale expansie.
  local bg=(--default-background-color=00000000)
  [ "${3:-}" = "--opaque" ] && bg=()
  "$CHROME" --headless --disable-gpu --hide-scrollbars --no-sandbox ${bg[@]+"${bg[@]}"} \
    --screenshot="$2" --window-size="${W},${H}" "file://$1" >/dev/null 2>&1
  [ -s "$2" ] || { echo "render mislukt: $1" >&2; exit 1; }
}

# ---- 1. elke clip los normaliseren -----------------------------------------
# @ai-why De concat-demuxer eist identieke codec, resolutie en framerate. Wijkt
# één clip af, dan plakt hij 'm stil verkeerd in plaats van te falen. Daarom
# eerst per clip normaliseren, dan pas plakken.
N="$(jq '.clips | length' "$RECIPE")"
: > concat.txt
for i in $(seq 0 $((N-1))); do
  SRC="$(jq -r ".clips[$i].src" "$RECIPE")"; SRC="${SRC/#\~/$HOME}"
  case "$SRC" in /*) ;; *) SRC="$FOOTAGE/$SRC";; esac
  [ -f "$SRC" ] || { echo "clip niet gevonden: $SRC" >&2; exit 1; }
  START="$(jq -r ".clips[$i].start // 0" "$RECIPE")"
  END="$(jq -r ".clips[$i].end // empty" "$RECIPE")"
  TRIM=(-ss "$START"); [ -n "$END" ] && TRIM+=(-to "$END")
  # @ai-why Schermopnames van een telefoon zijn smaller dan 9:16 (512x1110 tegen
  # 1080x1920). Bijsnijden hakt dan de statusbalk en de onderste knoppenrij eraf,
  # precies het deel dat bewijst dat het een echte app is. Met fit=contain past de
  # hele opname erin, tegen een vervaagde achtergrond van zichzelf.
  FIT="$(jq -r ".clips[$i].fit // \"cover\"" "$RECIPE")"
  case "$FIT" in
    cover)
      VF="[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1,format=yuv420p[v]";;
    contain)
      VF="[0:v]split=2[bg][fg];[bg]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},gblur=sigma=40[bgb];[fg]scale=${W}:${H}:force_original_aspect_ratio=decrease[fgs];[bgb][fgs]overlay=(W-w)/2:(H-h)/2,fps=${FPS},setsar=1,format=yuv420p[v]";;
    *) echo "onbekende fit: $FIT (kies cover of contain)" >&2; exit 1;;
  esac
  printf '%s\n' "file 'clip_$i.mp4'" >> concat.txt

  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$SRC" | grep -q .; then
    ffmpeg -nostdin -v error -y "${TRIM[@]}" -i "$SRC" \
      -filter_complex "${VF};[0:a]aresample=48000,aformat=channel_layouts=stereo[a]" \
      -map '[v]' -map '[a]' -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k "clip_$i.mp4"
  else
    ffmpeg -nostdin -v error -y "${TRIM[@]}" -i "$SRC" -f lavfi -i anullsrc=r=48000:cl=stereo \
      -filter_complex "$VF" -map '[v]' -map 1:a -shortest \
      -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k "clip_$i.mp4"
  fi
  printf '  clip %d/%d  %s\n' "$((i+1))" "$N" "$(basename "$SRC")"
done

# ---- 1b. outro ------------------------------------------------------------
# @ai-why Een recept kan met `"outro": "nl"` het vaste slotstuk achter de montage
# plakken in plaats van een eigen eindkaart te tekenen. Het bestand is al 9:16 en
# 30fps, maar het gaat toch door dezelfde normalisatie: de concat-demuxer eist
# identieke stromen en plakt ze anders stil verkeerd aan elkaar.
# @ai-sync scripts/ads/build-outro.sh maakt die bestanden.
OUTRO="$(j '.outro // ""')"
if [ -n "$OUTRO" ]; then
  OUTRO_FILE="$MEDIA_ROOT/export/outro/carve-outro-$OUTRO-${SLUG}.mp4"
  [ -f "$OUTRO_FILE" ] || { echo "outro niet gevonden: $OUTRO_FILE (bouw hem met build-outro.sh)" >&2; exit 1; }
  ffmpeg -nostdin -v error -y -i "$OUTRO_FILE" \
    -filter_complex "[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},setsar=1,format=yuv420p[v];[0:a]aresample=48000,aformat=channel_layouts=stereo[a]" \
    -map '[v]' -map '[a]' -c:v libx264 -preset medium -crf 18 -c:a aac -b:a 192k "clip_outro.mp4"
  printf '%s\n' "file 'clip_outro.mp4'" >> concat.txt
  echo "  outro $OUTRO"
fi

# ---- 2. eindkaart uit HTML -------------------------------------------------
# @ai-why Deze ffmpeg-build heeft geen drawtext (zonder libfreetype gebouwd), en
# HTML geeft sowieso betere typografie: dezelfde tokens als de app, echte
# font-weights, afgeronde hoeken. Chrome rendert naar PNG, ffmpeg maakt er een clip van.
# @ai-sync scripts/ads/render-screen.py
if [ "$(jq 'has("endcard")' "$RECIPE")" = "true" ] && [ -z "$OUTRO" ]; then
  DUR="$(j '.endcard.duration // 2.5')"
  LOGO="$(j '.endcard.logo // ""')"
  case "$LOGO" in ""|/*) ;; *) LOGO="$HERE/$LOGO";; esac
  python3 "$HERE/render-screen.py" endcard "$RECIPE" "$STYLE_CSS" "$W" "$H" "$LOGO" > endcard.html
  render_html "$WORK/endcard.html" "$WORK/endcard.png" --opaque
  ffmpeg -nostdin -v error -y -loop 1 -t "$DUR" -i endcard.png \
    -f lavfi -t "$DUR" -i "anullsrc=r=48000:cl=stereo" \
    -vf "fps=${FPS},format=yuv420p" -c:v libx264 -preset medium -crf 18 \
    -c:a aac -b:a 192k -t "$DUR" endcard.mp4
  printf '%s\n' "file 'endcard.mp4'" >> concat.txt
  echo "  eindkaart ${DUR}s"
fi

# ---- 3. aan elkaar plakken -------------------------------------------------
ffmpeg -nostdin -v error -y -f concat -safe 0 -i concat.txt -c copy joined.mp4
echo "  geplakt: $(ffprobe -v error -show_entries format=duration -of csv=p=0 joined.mp4)s"

# ---- 4. ondertiteling ------------------------------------------------------
# @ai-why Twee bronnen, in deze volgorde. Staat er een `subtitles`-blok in het
# recept, dan is dat de waarheid: de meeste ads hebben geen voice-over en de tekst
# ís de vertelling. Alleen als er echt iemand praat in beeld laten we whisper
# transcriberen, op de gemonteerde audio zodat timestamps niet verschuiven.
# @ai-sync scripts/ads/subtitles-to-srt.py
SRT=""
if [ "$CAPTIONS" = "true" ]; then
  if [ "$(jq 'has("subtitles")' "$RECIPE")" = "true" ]; then
    python3 "$HERE/subtitles-to-srt.py" "$RECIPE" > subs.srt
    SRT="subs.srt"
    echo "  ondertitels uit het recept"
  elif [ ! -f "$MODEL" ]; then
    echo "  ! whisper-model ontbreekt ($MODEL), ondertiteling overgeslagen" >&2
  else
    ffmpeg -nostdin -v error -y -i joined.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le audio.wav
    # @ai-why -ml/-sow hakken de tekst in korte regels op woordgrenzen. Zonder dat
    # geeft whisper één cue per zin, en een zin van zes seconden in beeld leest
    # niemand op TikTok. Korte brokken is het caption-ritme dat daar werkt.
    whisper-cli -m "$MODEL" -f audio.wav -l "$LANG" -ml "${CAPTION_CHARS:-24}" -sow \
      -osrt -of subs >/dev/null 2>&1 || true
    [ -s subs.srt ] && SRT="subs.srt"
  fi
fi

# ---- 5. hook -----------------------------------------------------------------
# @ai-why De hook ligt als transparante laag over de eerste seconden van de
# montage, niet als eigen clip. Zo zie je meteen beweging in plaats van een
# statische kaart, en dat is precies wat de eerste 1,5 seconde moet doen.
HOOK_PNG=""; HOOK_DUR=0
if [ "$(jq 'has("hook")' "$RECIPE")" = "true" ]; then
  HOOK_DUR="$(j '.hook.duration // 1.8')"
  python3 "$HERE/render-screen.py" hook "$RECIPE" "$STYLE_CSS" "$W" "$H" > hook.html
  render_html "$WORK/hook.html" "$WORK/hook.png"
  HOOK_PNG="hook.png"
  echo "  hook ${HOOK_DUR}s"
fi

# ---- 6. alle overlays in één encode ------------------------------------------
# @ai-sync scripts/ads/render-overlays.py
FINAL_IN="joined.mp4"
RO=(); while IFS= read -r line; do RO+=("$line"); done < <(
  python3 "$HERE/render-overlays.py" caps "$W" "$H" "$STYLE_CSS" "$SRT" "$HOOK_PNG" "$HOOK_DUR")
if [ -n "${RO[2]}" ]; then
  read -r -a OV_INPUTS <<< "${RO[1]}"
  ffmpeg -nostdin -v error -y -i joined.mp4 "${OV_INPUTS[@]}" \
    -filter_complex "${RO[2]}" -map "[${RO[3]}]" -map 0:a -shortest \
    -c:v libx264 -preset medium -crf 18 -c:a copy overlaid.mp4
  FINAL_IN="overlaid.mp4"
fi
echo "  ondertiteling: ${RO[0]} regels"

# ---- 7. export -------------------------------------------------------------
ffmpeg -nostdin -v error -y -i "$FINAL_IN" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -level 4.1 \
  -c:a aac -b:a 192k -movflags +faststart "$OUT"
echo "✓ $OUT"
