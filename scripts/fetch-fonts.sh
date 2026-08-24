#!/usr/bin/env bash
# Refetch the self-hosted webfonts into public/fonts/.
#
# Fonts are self-hosted rather than linked from Google: it drops two extra
# DNS+TLS handshakes on the critical path, and the site still renders correctly
# on networks that cannot reach fonts.googleapis.com.
#
# Amiri is subset to the four approved Arabic phrases — ~500 KB down to ~15 KB —
# keeping init/medi/fina/rlig/ccmp so contextual shaping still works. If a new
# phrase is ever approved, add it to PHRASES here AND to APPROVED in
# src/components/Arabic.tsx, then rerun.
#
#   pip install fonttools brotli && bash scripts/fetch-fonts.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p public/fonts

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
PHRASES="بسم الله الحمد لله رحمة زهراء"

fetch_latin() { # family-spec  outfile
  local css url
  css=$(curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=$1")
  # last woff2 before the latin unicode-range block
  url=$(printf '%s' "$css" | grep -B3 "unicode-range: U+0000" | grep -o 'https://[^)]*\.woff2' | tail -1)
  [ -n "$url" ] || { echo "could not resolve $1" >&2; exit 1; }
  curl -sS -o "public/fonts/$2" "$url"
  echo "  $2  $(du -h "public/fonts/$2" | cut -f1)"
}

echo "fetching latin faces:"
fetch_latin "Playfair+Display:wght@400..900" playfair-display.woff2
fetch_latin "Jost:wght@300..700" jost.woff2

echo "subsetting Amiri:"
curl -sS -A "$UA" "https://fonts.googleapis.com/css2?family=Amiri:wght@400" \
  | grep -o 'https://[^)]*\.woff2' | head -1 \
  | xargs curl -sS -o /tmp/amiri-full.woff2

PHRASES="$PHRASES" python3 - <<'PY'
import os
from fontTools import subset
from fontTools.ttLib import TTFont
f = TTFont("/tmp/amiri-full.woff2")
opts = subset.Options()
opts.layout_features = ["*"]     # keep the shaping features Arabic needs
opts.flavor = "woff2"
opts.notdef_outline = True
s = subset.Subsetter(options=opts)
s.populate(text=os.environ["PHRASES"])
s.subset(f)
f.flavor = "woff2"
f.save("public/fonts/amiri-subset.woff2")
t = TTFont("public/fonts/amiri-subset.woff2")
feats = sorted({r.FeatureTag for r in t["GSUB"].table.FeatureList.FeatureRecord})
print(f"  amiri-subset.woff2  {len(t.getGlyphOrder())} glyphs, features: {', '.join(feats)}")
PY
