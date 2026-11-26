#!/usr/bin/env bash
# Publish the current production build to a public HTTPS URL.
#
# Uses deed.page, which requires no account. A permanent site is returned at
# {slug}.deed.page, and an update token is issued once — store it outside the
# repository (the script writes it to ~/.config/deed-page/token).
#
#   ./scripts/deploy.sh                 # new random slug
#   ./scripts/deploy.sh my-slug         # explicit slug (must be free)
#   DEED_TOKEN=... ./scripts/deploy.sh my-slug   # update an existing slug
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

npm run build

if [ ! -f dist/index.html ]; then
  echo "build failed: dist/index.html missing" >&2
  exit 1
fi
if [ "$(find dist -maxdepth 1 -type f | wc -l)" -ne 1 ]; then
  echo "warning: dist contains more than one file; only index.html is published" >&2
fi

SLUG="${1:-portfolio-$(date +%s)-$RANDOM}"
CONFIG_DIR="${HOME}/.config/deed-page"
mkdir -p "$CONFIG_DIR"

HEADERS=(-H "X-Client: portfolio-deploy" -H "Content-Type: text/html")
if [ -n "${DEED_TOKEN:-}" ]; then
  HEADERS+=(-H "Authorization: Bearer ${DEED_TOKEN}")
elif [ -f "$CONFIG_DIR/token" ]; then
  HEADERS+=(-H "Authorization: Bearer $(cat "$CONFIG_DIR/token")")
fi

echo "publishing $SLUG …"
curl -sS --fail-with-body -X PUT \
  "https://deed.page/v1/sites?slug=${SLUG}&ref=repo-script" \
  "${HEADERS[@]}" \
  --data-binary @dist/index.html \
  -o /tmp/deed-deploy.json

python3 - <<'PY'
import json, os, pathlib
data = json.load(open('/tmp/deed-deploy.json'))
url = data.get('url')
print('live:', url)
print('permanent:', data.get('permanent'), '| expires:', data.get('expires_at'))
token = data.get('token')
if token:
    p = pathlib.Path.home() / '.config' / 'deed-page'
    p.mkdir(parents=True, exist_ok=True)
    (p / 'token').write_text(token + '\n')
    (p / 'url').write_text(url + '\n')
    print('update token stored at', p / 'token', '(keep it out of the repo)')
PY

echo
echo "verify the deployment:"
echo "  curl -sI \"$URL\" | head -5"
