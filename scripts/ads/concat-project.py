#!/usr/bin/env python3
"""Concat-projecten uit een sjabloon, en kapotte projecten repareren.

Zie README.md in deze map. Kort:

    concat-project.py lijst
    concat-project.py nieuw <sjabloon> <projectnaam> <slot>=<pad> [...]
    concat-project.py sjabloon <projectnaam> <sjabloonnaam>
    concat-project.py hernoem <sjabloon> <oudslot> <nieuwslot>
    concat-project.py repareer <projectnaam>

@ai-why Een Concat-project bewaart absolute paden plus de technische gegevens van
elk bestand (duur, framerate, afmeting, codec). Kopieer je een projectmap met de
hand en wijs je hem naar ander beeld, dan klopt die metadata niet meer en gaat
Concat stil de fout in: hij rekent met de oude duur. Daarom lezen we bij elke
koppeling de nieuwe media opnieuw uit met ffprobe.
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.environ.get("CARVE_ADS_ROOT") or os.path.expanduser(
    "~/Developer/celiker-studio/carve"
)
PROJECTS = os.path.join(ROOT, "projecten")
HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = os.path.join(HERE, "concat-templates")

# @ai-context Concat kent deze sleutel niet en negeert hem. We hangen de
# slotnamen daarom in het sjabloon zelf in plaats van in een los bestand; twee
# bestanden die bij elkaar horen lopen uit elkaar, één bestand niet.
SLOTS_KEY = "_slots"
PLACEHOLDER = "<slot:%s>"


def fail(msg):
    print("fout: " + msg, file=sys.stderr)
    sys.exit(1)


def slug(text):
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "clip"


def probe(path):
    """Leest de velden uit die Concat per mediabestand bewaart."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_streams", "-show_format",
         "-of", "json", path],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        fail("ffprobe kon %s niet lezen" % path)
    data = json.loads(out.stdout)
    video = next((s for s in data["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in data["streams"] if s["codec_type"] == "audio"), None)
    if video is None:
        fail("geen videospoor in %s" % path)

    fraction = video.get("avg_frame_rate") or "0/1"
    num, _, den = fraction.partition("/")
    rate = float(num) / float(den) if float(den or 0) else 0.0
    # @ai-gotcha Concat schrijft de breuk als "30/1", niet als "30000/1001".
    # ffprobe levert bij variabele framerate wel dat tweede. Laat staan zoals
    # ffprobe het geeft; Concat rekent met frameRate en gebruikt de breuk alleen
    # om exact te kunnen exporteren.
    return {
        "audioCodec": audio["codec_name"] if audio else "",
        "duration": round(float(data["format"]["duration"]), 3),
        "frameRate": round(rate, 3),
        "frameRateFraction": fraction,
        "hasAudio": audio is not None,
        "height": int(video["height"]),
        "kind": "video",
        "name": os.path.basename(path),
        "path": os.path.abspath(path),
        "videoCodec": video["codec_name"],
        "width": int(video["width"]),
    }


def load(path):
    if not os.path.isfile(path):
        fail("niet gevonden: %s" % path)
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def save(path, data):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False, sort_keys=True)
        fh.write("\n")


def timeline_use(project, media_id):
    """De laatste seconde van de bron die de tijdlijn van deze media gebruikt."""
    latest = 0.0
    for clip in project.get("clips", []):
        if clip.get("mediaId") == media_id:
            end = float(clip.get("sourceStart", 0)) + float(clip.get("duration", 0))
            latest = max(latest, end)
    return latest


def cmd_lijst():
    if not os.path.isdir(TEMPLATES):
        print("nog geen sjablonen. Maak er een met: concat-project.py sjabloon <project> <naam>")
        return
    names = sorted(f[:-5] for f in os.listdir(TEMPLATES) if f.endswith(".json"))
    if not names:
        print("nog geen sjablonen.")
        return
    for name in names:
        tpl = load(os.path.join(TEMPLATES, name + ".json"))
        slots = tpl.get(SLOTS_KEY, {})
        print("%-24s %s" % (name, "  ".join(sorted(slots))))
        for slot in sorted(slots):
            print("%-24s   %s: %s" % ("", slot, slots[slot]))


def cmd_sjabloon(project_name, template_name):
    """Maakt van een werkend project een sjabloon: paden eruit, slots erin."""
    src = os.path.join(PROJECTS, project_name, "concat.json")
    project = load(src)
    os.makedirs(TEMPLATES, exist_ok=True)
    dst = os.path.join(TEMPLATES, template_name + ".json")
    if os.path.exists(dst):
        fail("sjabloon %s bestaat al" % template_name)

    slots, used = {}, set()
    for entry in project.get("media", []):
        # @ai-why De clipnaam uit de tijdlijn ("Scherm: foto kiezen") zegt welke
        # rol het beeld speelt; de bestandsnaam zegt alleen welk bestand het
        # toevallig was. Een sjabloon gaat over de rol, dus die wint.
        clip_name = next((c.get("name") for c in project.get("clips", [])
                          if c.get("mediaId") == entry["id"] and c.get("name")), None)
        base = slug(clip_name or os.path.splitext(entry.get("name", ""))[0])
        name, n = base, 2
        while name in used:
            name, n = "%s-%d" % (base, n), n + 1
        used.add(name)
        slots[name] = "%s, %.1fs tot %.1fs gebruikt" % (
            entry.get("name", "?"), 0.0, timeline_use(project, entry["id"]))
        entry["path"] = PLACEHOLDER % name
    project[SLOTS_KEY] = {k: v for k, v in slots.items()}
    project["name"] = template_name

    # @ai-why De cache-map hoort bij één project (peaks en audio per pad) en is
    # bij een sjabloon altijd fout. Hij hoort niet in het sjabloon en wordt door
    # Concat opnieuw opgebouwd.
    save(dst, project)
    print("sjabloon %s gemaakt uit %s" % (template_name, project_name))
    print("slots: %s" % ", ".join(sorted(slots)))


def cmd_hernoem(template_name, old, new):
    """Een slotnaam staat op twee plekken in het sjabloon. Hier allebei tegelijk."""
    path = os.path.join(TEMPLATES, template_name + ".json")
    tpl = load(path)
    slots = tpl.get(SLOTS_KEY, {})
    if old not in slots:
        fail("onbekend slot %s (kies uit: %s)" % (old, ", ".join(sorted(slots))))
    if new in slots:
        fail("slot %s bestaat al" % new)
    slots[new] = slots.pop(old)
    for entry in tpl.get("media", []):
        if entry.get("path") == PLACEHOLDER % old:
            entry["path"] = PLACEHOLDER % new
    save(path, tpl)
    print("%s: %s heet nu %s" % (template_name, old, new))


def cmd_nieuw(template_name, project_name, pairs):
    tpl = load(os.path.join(TEMPLATES, template_name + ".json"))
    slots = tpl.get(SLOTS_KEY, {})
    given = {}
    for pair in pairs:
        if "=" not in pair:
            fail("verwacht slot=pad, kreeg: %s" % pair)
        slot, path = pair.split("=", 1)
        path = os.path.abspath(os.path.expanduser(path))
        if slot not in slots:
            fail("onbekend slot %s (kies uit: %s)" % (slot, ", ".join(sorted(slots))))
        if not os.path.isfile(path):
            fail("bestand niet gevonden: %s" % path)
        given[slot] = path

    missing = sorted(set(slots) - set(given))
    if missing:
        fail("nog geen bestand voor: %s" % ", ".join(missing))

    dest_dir = os.path.join(PROJECTS, project_name)
    if os.path.exists(dest_dir):
        fail("project %s bestaat al" % project_name)

    warnings = []
    for entry in tpl.get("media", []):
        slot = entry["path"][len("<slot:"):-1] if entry["path"].startswith("<slot:") else None
        if slot is None:
            fail("sjabloon %s heeft een media zonder slot: %s" % (template_name, entry["path"]))
        needed = timeline_use(tpl, entry["id"])
        entry.update(probe(given[slot]))
        if entry["duration"] + 0.05 < needed:
            warnings.append(
                "%s: de tijdlijn gebruikt tot %.1fs, maar %s duurt %.1fs"
                % (slot, needed, entry["name"], entry["duration"]))

    tpl.pop(SLOTS_KEY, None)
    tpl["name"] = project_name
    os.makedirs(dest_dir)
    save(os.path.join(dest_dir, "concat.json"), tpl)

    print("project %s gemaakt uit sjabloon %s" % (project_name, template_name))
    for line in warnings:
        # @ai-why Waarschuwen en niet afbreken: korter materiaal is soms precies
        # de bedoeling, je trekt de clip daarna in Concat goed. Stil doorgaan is
        # het probleem, want dan zie je in de export een bevroren laatste frame.
        print("  ! " + line)
    print("  open: %s" % os.path.join(dest_dir, "concat.json"))


def cmd_repareer(project_name):
    """Zet paden van verplaatst materiaal recht en leest de metadata opnieuw."""
    path = os.path.join(PROJECTS, project_name, "concat.json")
    project = load(path)
    changed, broken = [], []
    for entry in project.get("media", []):
        if os.path.isfile(entry["path"]):
            continue
        hits = []
        for base, _dirs, files in os.walk(ROOT):
            if entry["name"] in files:
                hits.append(os.path.join(base, entry["name"]))
        if len(hits) == 1:
            needed = timeline_use(project, entry["id"])
            entry.update(probe(hits[0]))
            changed.append("%s -> %s" % (entry["name"], hits[0]))
            if entry["duration"] + 0.05 < needed:
                changed.append("  ! tijdlijn gebruikt tot %.1fs, bestand duurt %.1fs"
                               % (needed, entry["duration"]))
        else:
            broken.append("%s (%d keer gevonden)" % (entry["name"], len(hits)))

    if changed:
        shutil.copy2(path, path + ".bak")
        save(path, project)
    for line in changed:
        print(line)
    for line in broken:
        print("niet opgelost: " + line)
    if not changed and not broken:
        print("alle paden kloppen al")


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__.strip())
        sys.exit(1)
    cmd, rest = args[0], args[1:]
    if cmd == "lijst":
        cmd_lijst()
    elif cmd == "sjabloon" and len(rest) == 2:
        cmd_sjabloon(*rest)
    elif cmd == "hernoem" and len(rest) == 3:
        cmd_hernoem(*rest)
    elif cmd == "nieuw" and len(rest) >= 2:
        cmd_nieuw(rest[0], rest[1], rest[2:])
    elif cmd == "repareer" and len(rest) == 1:
        cmd_repareer(*rest)
    else:
        print(__doc__.strip())
        sys.exit(1)


if __name__ == "__main__":
    main()
