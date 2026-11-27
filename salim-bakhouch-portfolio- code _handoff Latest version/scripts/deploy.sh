#!/usr/bin/env bash
# Publish dist/index.html to a public HTTPS URL on deed.page.
#   ./scripts/deploy.sh                # new permanent site, random slug
#   ./scripts/deploy.sh my-slug        # explicit slug (must be free)
#   DEED_TOKEN=... ./scripts/deploy.sh my-slug   # update in place
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
npm run build
[ -f dist/index.html ] || { echo "build failed: dist/index.html missing" >&2; exit 1; }
SLUG="${1:-salim-bakhouch-etherealism}"
CONFIG_DIR="${HOME}/.config/deed-page"; mkdir -p "$CONFIG_DIR"
HEADERS=(-H "X-Client: portfolio-deploy" -H "Content-Type: text/html")
if [ -n "${DEED_TOKEN:-}" ]; then HEADERS+=(-H "Authorization: Bearer ${DEED_TOKEN}")
elif [ -f "$CONFIG_DIR/token" ]; then HEADERS+=(-H "Authorization: Bearer $(cat "$CONFIG_DIR/token")"); fi
echo "publishing $SLUG …"
curl -sS --fail-with-body -X PUT \
  "https://deed.page/v1/sites?slug=${SLUG}&ref=repo-script" \
  "${HEADERS[@]}" --data-binary @dist/index.html -o /tmp/deed-deploy.json
cat /tmp/deed-deploy.json
python3 - <<'PY'
import json, pathlib
data = json.load(open('/tmp/deed-deploy.json'))
print('\nlive:', data.get('url'), '\npermanent:', data.get('permanent'), '| expires:', data.get('expires_at'))
token = data.get('token')
if token:
    p = pathlib.Path.home() / '.config' / 'deed-page'
    p.mkdir(parents=True, exist_ok=True)
    (p / 'token').write_text(token + '\n')
    (p / 'url').write_text(str(data.get('url')) + '\n')
    print('update token stored at', p / 'token', '(outside the repository)')
PY
