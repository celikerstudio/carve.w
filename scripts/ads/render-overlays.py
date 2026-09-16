#!/usr/bin/env python3
"""Rendert ondertitel-PNG's en stelt de ffmpeg-filtergraph samen voor alle
overlays (hook en ondertitels) in één keer.

gebruik: render-overlays.py <outdir> <W> <H> <stijl.css|""> [srt] [hook.png] [hook-duur]

stdout, vier regels:
  1. aantal ondertitelregels
  2. de extra ffmpeg-inputs
  3. de filtergraph
  4. het label van de laatste videostream

@ai-why Deze ffmpeg-build is zonder libfreetype en libass gebouwd, dus drawtext
en subtitles bestaan niet. HTML renderen geeft bovendien echte huisstijl-
typografie. Alles in één graph zodat er maar één keer geëncodeerd wordt.
@ai-sync scripts/ads/build-ad.sh roept dit aan; scripts/ads/frames/caption.html is de template.
"""
import html, pathlib, re, subprocess, sys

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HERE = pathlib.Path(__file__).parent
REL, W, H, style_path = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
srt = sys.argv[5] if len(sys.argv) > 5 else ""
hook_png = sys.argv[6] if len(sys.argv) > 6 else ""
hook_dur = float(sys.argv[7]) if len(sys.argv) > 7 else 0.0

OUTDIR = pathlib.Path(REL).resolve()
OUTDIR.mkdir(parents=True, exist_ok=True)
style = pathlib.Path(style_path).read_text() if style_path and pathlib.Path(style_path).exists() else ""

def secs(t):
    hh, mm, rest = t.split(":")
    ss, ms = rest.split(",")
    return int(hh) * 3600 + int(mm) * 60 + int(ss) + int(ms) / 1000

cues = []
if srt and pathlib.Path(srt).exists():
    for blk in re.split(r"\n\s*\n", pathlib.Path(srt).read_text().strip()):
        lines = [l for l in blk.splitlines() if l.strip()]
        m = re.search(r"([\d:,]+)\s*-->\s*([\d:,]+)", blk)
        if len(lines) < 2 or not m:
            continue
        text = " ".join(lines[2:] if lines[0].strip().isdigit() else lines[1:]).strip()
        # @ai-why whisper markeert geluid als *Muziek*, [Music], (applause). Dat zijn
        # transcriptie-notities, geen ondertitels; ze horen niet in beeld.
        if text and not re.fullmatch(r"[\*\[\(].*[\*\]\)]", text):
            cues.append((secs(m.group(1)), secs(m.group(2)), text))

TPL = (HERE / "frames" / "caption.html").read_text()
size, padx, pady, stroke = H // 18, W // 10, H // 5, max(2, H // 400)
for i, (_, _, text) in enumerate(cues):
    page = (TPL.replace("__W__", str(W)).replace("__H__", str(H))
               .replace("__SIZE__", str(size)).replace("__PADX__", str(padx))
               .replace("__PADY__", str(pady)).replace("__STROKE__", str(stroke))
               .replace("__TEXT__", html.escape(text)).replace("__STYLE__", style))
    src = OUTDIR / f"cap_{i:03d}.html"
    src.write_text(page)
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
                    "--default-background-color=00000000",
                    f"--screenshot={OUTDIR / f'cap_{i:03d}.png'}",
                    f"--window-size={W},{H}", f"file://{src}"], check=True, capture_output=True)

# @ai-gotcha Elke PNG gaat met -loop 1 de graph in. Zonder dat levert het beeld
# maar één frame en is de overlay meteen daarna weg: je ziet de tekst dan alleen
# in het allereerste frame van de video. Het afkappen doet -shortest in build-ad.sh.
# @ai-gotcha De paden gaan relatief terug: build-ad.sh leest regel 2 in een bash-array
# via woordsplitsing, en de werkmap zit onder "~/Developer/celiker-studio/carve", met spaties.
inputs, graph, prev, n = [], [], "0:v", 0
if hook_png and hook_dur > 0:
    inputs += ["-loop", "1", "-i", hook_png]
    n += 1
    fade = min(0.4, hook_dur / 3)
    graph.append(f"[{n}:v]format=rgba,fade=t=out:st={hook_dur - fade:.3f}:d={fade:.3f}:alpha=1[hk]")
    graph.append(f"[{prev}][hk]overlay=0:0:enable='between(t,0,{hook_dur:.3f})'[vh]")
    prev = "vh"
for i, (a, b, _) in enumerate(cues):
    inputs += ["-loop", "1", "-i", f"{REL}/cap_{i:03d}.png"]
    n += 1
    graph.append(f"[{prev}][{n}:v]overlay=0:0:enable='between(t,{a:.3f},{b:.3f})'[v{i}]")
    prev = f"v{i}"

print(len(cues))
print(" ".join(inputs))
print(";".join(graph))
print(prev)
