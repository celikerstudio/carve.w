#!/usr/bin/env python3
"""Vult frames/outro-anim.html met de teksten van één taal en de beelden.

gebruik: render-outro-html.py <taal> <breedte> <hoogte> [lang|kort] > pagina.html

@ai-why De beelden gaan als data-URI mee in plaats van als pad. Chrome weigert
een CSS-mask die van file:// komt (CORS, origin "null"), en juist de spiertint
hangt aan zo'n mask. Ingesloten data-URI's mogen wel, en het scheelt meteen het
gedoe met relatieve paden vanuit de werkmap.
@ai-sync scripts/ads/outro.json bevat de teksten; scripts/ads/build-outro.sh roept dit aan.
"""

import base64
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parent.parent


def data_uri(path):
    raw = pathlib.Path(path).read_bytes()
    kind = "image/jpeg" if str(path).lower().endswith((".jpg", ".jpeg")) else "image/png"
    return "data:%s;base64,%s" % (kind, base64.b64encode(raw).decode())


def main():
    lang, W, H = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    variant = sys.argv[4] if len(sys.argv) > 4 else "lang"
    texts = json.loads((HERE / "outro.json").read_text())
    if lang not in texts:
        sys.exit("taal %s staat niet in outro.json" % lang)

    html = (HERE / "frames" / "outro-anim.html").read_text()
    vals = {
        "__W__": W,
        "__H__": H,
        "__U__": W / 100,
        "__LOGO__": data_uri(HERE / "brand" / "carve-logo.png"),
        "__FIGURE__": data_uri(ROOT / "public" / "muscle-front.png"),
        "__SCREEN1__": data_uri(ROOT / "public" / "screenshots" / "health.png"),
        "__SCREEN2__": data_uri(ROOT / "public" / "screenshots" / "scan.jpg"),
        "__TEXTS__": json.dumps(texts[lang], ensure_ascii=False),
        "__VARIANT__": variant,
    }
    for key, value in vals.items():
        html = html.replace(key, str(value))
    sys.stdout.write(html)


if __name__ == "__main__":
    main()
