#!/usr/bin/env python3
"""Vult een schermtemplate (hook of endcard) met de waarden uit het recept en de
gekozen stijl, en schrijft de HTML naar stdout.

gebruik: render-screen.py <hook|endcard> <recept.json> <stijl.css|""> <W> <H> [logo]

@ai-why Eén renderer voor beide schermen. De stijl wordt als CSS-blok ná de
basisopmaak ingespoten, zodat een stijl alles kan overschrijven zonder dat de
templates iets van stijlen hoeven te weten.
@ai-sync scripts/ads/build-ad.sh roept dit aan; scripts/ads/frames/ bevat de templates.
"""
import html, json, pathlib, sys

kind, recipe_path, style_path, W, H = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
logo = sys.argv[6] if len(sys.argv) > 6 else ""
block = json.loads(pathlib.Path(recipe_path).read_text()).get(kind, {})
style = pathlib.Path(style_path).read_text() if style_path and pathlib.Path(style_path).exists() else ""

def esc(key, default=""):
    return html.escape(str(block.get(key, default))).replace("\n", "<br>")

vals = {
    "__W__": W, "__H__": H, "__PADX__": W // 10, "__GAP__": H // 40,
    # hook
    "__PADTOP__": H // 7, "__KICKER_SIZE__": H // 54, "__TITLE_SIZE__": H // 15,
    "__KICKER__": esc("kicker"),
    # endcard
    "__LOGOW__": W // 3 if logo else 0, "__RADIUS__": W // 17,
    "__SUB_SIZE__": H // 44, "__CTA_SIZE__": H // 46,
    "__CTA_PADY__": H // 60, "__CTA_PADX__": W // 17,
    "__LOGO__": logo, "__SUB__": esc("sub"), "__CTA__": esc("cta"),
    "__TEXT__": esc("text"),
}
if kind == "endcard":
    vals["__TITLE_SIZE__"] = H // 18
    vals["__PADX__"] = W // 11

out = (pathlib.Path(__file__).parent / "frames" / f"{kind}.html").read_text()
for k, v in vals.items():
    out = out.replace(k, str(v))
sys.stdout.write(out.replace("__STYLE__", style))
