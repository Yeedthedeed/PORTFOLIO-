# DEPLOYMENT

## Review deployment (current, exact match)

**https://etherealism-final.deed.page/** — HTTP/2 200, HTTPS, permanent
deed.page site, published from this workspace at the owner's request.

| | |
|---|---|
| Live bytes | 2,429,280 |
| Local build | 2,428,266 bytes · sha `77870260eb00b37bc6169519647c64ec2925638120a1061a331b360379343f9c` |
| Identity | prefix match 2,428,251 of 2,428,266 — the 1,033-byte difference is the host badge only |

`https://etherealism-approved.deed.page/` is an earlier deployment that diverges
from the current build at ~97.7 % (published from an intermediate state). It is
**not** the reference.

## Superseded slugs

`salim-bakhouch-etherealism`, `etherealism-preview`, `etherealism-bluehour*`,
`etherealism-thebirthpermit`, `etherealism-seamless`, `etherealism-aperture*`,
`etherealism-approved`. Deed issues an update token only once; none of those
tokens exist here, so they cannot be updated in place. Do not use them as
references.

## Publish

```bash
npx tsc --noEmit
npm run build                    # dist/index.html only
DEED_TOKEN=<token> ./scripts/deploy.sh <slug>
```

Never commit a token. Do not create a new slug or repoint the canonical URL
without explicit owner approval.

## Known deployment defect

`index.html` still declares `<link rel="canonical">` and `og:url` as
`https://salim-bakhouch-portfolio-e0d2e5c9.deed.page/`. Correcting it needs a
build edit and an authorised deploy.
