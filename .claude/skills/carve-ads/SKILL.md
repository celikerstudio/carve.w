---
name: carve-ads
description: Use when making, editing, or exporting a Carve video ad or social clip - vertical 9:16 video, captions/subtitles, hooks, endcards, TikTok/Reels/Meta creatives, screen recordings of the app, AI-generated footage, or the Concat editor. Also use when asked where video material or ad projects are stored.
---

# Carve ads

An ad is a **recipe JSON**, not a timeline. `scripts/ads/build-ad.sh <recept>` turns it
into an MP4: clips trimmed and normalised, hook and captions burned in, endcard,
export. Change the recipe and run again. The MP4 is disposable; the recipe is not.

Why this exists and what was rejected: `docs/tdr/0013-ads-bouwen-we-zelf.md`.

## Quick reference

| Task | Where |
|---|---|
| Recipe schema, styles, `channel`, `fit` | `scripts/ads/README.md` |
| The five beats, the hard rules, Concat | `docs/marketing/video/README.md` |
| The twelve formats + their templates | `docs/marketing/video/formats.md` |
| Prompting and limits for AI footage | `docs/marketing/video/ai-generatie.md` |
| A working example | `scripts/ads/recipes/creatives/2026-09-15-hamburger-v1.json` |
| Results of published ads | `scripts/ads/report.sh` |

Material lives outside git in `~/Developer/celiker-studio/carve/` (numbered folders,
`LEESMIJ.txt` explains each). The recipe is committed; the MP4 never is.

**Look before you plan.** What is actually lying there decides the whole plan, and
the folders are often emptier than the docs imply:

```bash
ls -R ~/Developer/celiker-studio/carve/materiaal/
grep -l "<clipnaam>" scripts/ads/recipes/creatives/*.json   # al gebruikt?
```

Only footage from `3-ai-gegenereerd/02-goedgekeurd/` may go into an ad. No
voice-over in `4-audio/` means whisper will produce nothing, so the captions have
to come from the recipe.

Before your first ad, read `docs/marketing/video/README.md` end to end: it holds the
five beats and the six steps from idea to published creative. This skill does not
repeat them, so that they cannot drift apart.

## Three rules that are not negotiable

1. **The proof is real.** Context may be filmed or generated; the app screen is
   always a real screen recording from `1-schermopnames/`. Never a mockup, never
   generated UI, never a number Carve did not produce.
2. **Generated footage gets labelled** on TikTok and Meta. That is why it sits in
   its own folder.
3. **No health claims.** No weight loss, muscle gain, or medical outcomes.

## Always Furkan's call, never yours

Build the mechanics, but stop and ask before deciding:

- Which footage becomes the proof, and which format the ad uses
- The hook line and the caption copy (this is customer-facing copy)
- Publishing, paying for, or labelling anything

One variant per recipe. `--style clean` on an existing recipe is for previewing a
look, not for publishing: a published variant gets its own file in `creatives/`, so
it can carry its own `results`. Furkan fills `results` in after publishing; you do
not invent numbers. `report.sh` reads them back.

Write the recipe, show the frames, ask. Do not invent copy and ship it.

## Traps that cost hours

| Trap | What happens | Do this |
|---|---|---|
| Phone screen recording is narrower than 9:16 | `cover` crops away the status bar and nav bar, the parts that prove it is a real app | `"fit": "contain"` on that clip |
| Ad has no voice-over | whisper transcribes nothing and you get no captions | Put a `subtitles` block in the recipe; it wins over whisper |
| Captions drift from what is on screen | Text says "470 kcal" while the app still says "Analyzing" | Sample frames with ffmpeg, time the cues to the real beats |
| Subtitle times look like source times | They are not: cues run on the finished timeline, after trimming. A clip `start: 0.5` shifts every beat by half a second | Time the cues against the built MP4, not the raw clip |
| Moving media after importing into Concat | Concat stores absolute paths; the project silently breaks | Put material in place first; repair via `path` in `concat.json` |
| Homebrew ffmpeg has no libfreetype or libass | `drawtext` and `subtitles` filters do not exist | All text renders from `frames/*.html` through headless Chrome |
| Still PNGs in a filtergraph | Overlay shows in the first frame only | `-loop 1` per PNG input, `-shortest` on the output |

## Verify before claiming it works

Building without errors is not the same as a usable ad. Extract frames at the hook,
a caption, and the endcard, and look at them. Timing and readability only show up
in the picture.
