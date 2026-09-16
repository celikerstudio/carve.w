#!/usr/bin/env python3
"""Zet het `subtitles`-blok uit een recept om naar een SRT-bestand.

gebruik: subtitles-to-srt.py <recept.json> > subs.srt

Elke regel heeft `text` en een `end`. Laat je `start` weg, dan begint de regel waar
de vorige ophield, zodat je alleen de momenten hoeft te tikken waar je iets ziet
veranderen.

@ai-why Ondertitels hoeven niet uit spraak te komen. De meeste ads hebben helemaal
geen voice-over: de tekst ís de vertelling. whisper blijft er voor het geval er wél
echt iemand praat in beeld.
@ai-sync scripts/ads/build-ad.sh roept dit aan.
"""
import json, pathlib, sys

def stamp(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

lines = json.loads(pathlib.Path(sys.argv[1]).read_text()).get("subtitles", [])
cursor = 0.0
for i, line in enumerate(lines, 1):
    start = float(line.get("start", cursor))
    end = float(line["end"]) if "end" in line else start + float(line.get("duration", 2.0))
    if end <= start:
        sys.exit(f"ondertitel {i} eindigt niet na zijn begin: {start} -> {end}")
    print(f"{i}\n{stamp(start)} --> {stamp(end)}\n{line['text']}\n")
    cursor = end
