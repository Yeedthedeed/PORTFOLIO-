# Repository layout and publishing workflow

## Remote

- Repository of record: <https://github.com/Yeedthedeed/PORTFOLIO->
- Default branch: `main`
- The remote also stores the untouched master assets:
  - `Phtotgraphy sphere assets/`
  - `Film Stills/`
  - `Films Posters/`
  - `Landing page profile pictuer - Copy/`

Those folders are the **source of truth for photography**. The website references them through
raw/CDN URLs; it does not copy or rewrite them.

## What belongs in the repository

```text
README.md                  project overview
HANDOFF.md                 master handoff (read first)
CONTRIBUTING.md            working agreements
MANIFEST.md                generated file inventory
index.html                 entry document (metadata + device bootstrap)
src/                       application source
  data/previewAssets.ts        baked gallery previews  ← generated, committed
  data/birthPermitPreviews.ts  baked Birth Permit previews ← generated, committed
scripts/                   preview generation and baking
docs/                      engineering documentation
portfolio-current/         self-contained snapshot of the whole project
.github/workflows/ci.yml   type-check + build + artefact verification
netlify.toml / vercel.json static-host configuration
```

## What must not be committed

- `node_modules/`
- `dist/` (produced by CI or the host)
- `.env*`, credentials, tokens, private keys
- OS/editor noise (see `.gitignore`)

## Snapshot folder

`portfolio-current/` is a complete, independently buildable copy of the project at the same
commit — source, configs, docs, scripts and the generated preview modules. It contains no
dependencies or build output, so it can be handed to another host or AI directly.

Regenerate it after significant changes:

```bash
rm -rf portfolio-current
mkdir -p portfolio-current
for item in README.md HANDOFF.md MANIFEST.md CONTRIBUTING.md index.html \
  package.json package-lock.json tsconfig.json vite.config.ts \
  netlify.toml vercel.json .gitignore src scripts docs; do
  cp -R "$item" portfolio-current/
done
node -e "/* or run your manifest generator */"
```

Then prove it still builds:

```bash
cd portfolio-current
ln -s ../node_modules node_modules
npx tsc --noEmit && npm run build
rm -rf node_modules dist
```

## Branch strategy

| Branch | Purpose |
| --- | --- |
| `main` | production-ready code and documentation |
| `portfolio-current` | optional mirror of the snapshot for review |
| feature branches | one concern each; open a PR into `main` |

CI (`.github/workflows/ci.yml`) runs on pushes to `main`/`portfolio-current`, on pull requests
and manually. It type-checks, builds, asserts the single-file artefact and a minimum baked
preview count, then uploads `dist/` as an artefact.

## Tagging a release

```bash
git tag -a v1.0.0 -m "Salim Bakhouch Portfolio Website v1.0.0"
git push origin main --tags
```

## Publishing checklist

1. Merge to `main`; CI green.
2. Download the `portfolio-dist` artefact or run `npm run build`.
3. Deploy `dist/` (see [DEPLOYMENT.md](DEPLOYMENT.md)).
4. Verify the live URL in a private window.
5. Record the deployment URL and date in [CHANGELOG.md](CHANGELOG.md).
