# Marketing workflow

The binding Constitution, Campaign Ledger and all permanent marketing records are in the private Google Drive folder named `Howth Technology Factory Marketing`. This repository is authoritative only for website and marketing-automation code.

## Start a campaign

```powershell
node marketing/run-campaign.mjs https://howthtechnologyfactory.pro/products/<product>.html
```

The command accepts no campaign brief. It reads the local canonical product page, discovers every external listing declared with `data-shopfront`, verifies those live destinations, checks the local automation history, selects the first unused defensible angle, creates unique campaign/post identifiers and complete attribution links, and writes a campaign package.

It deliberately stops before publication. Research, platform-specific editorial work, authenticated publishing and live read-back require capabilities that a static repository cannot safely supply. A generated package is marked `research_required`; it is not publishable content.

For a local structural test without network requests:

```powershell
node marketing/run-campaign.mjs https://howthtechnologyfactory.pro/products/pdf-toolkit.html --offline --dry-run
```

## Records

- `campaign-ledger.json` is non-authoritative automation data used to prevent repeated local angle selection and preserve generated-package context. Google Drive’s `03 Campaign Ledger` remains authoritative for campaign IDs, posts, publication status and results.
- `analytics-sources.json` distinguishes connected, manual and authorization-blocked sources and defines attribution language.
- `campaigns/<campaign-id>/manifest.json` is the immutable campaign snapshot.
- `campaigns/<campaign-id>/campaign.md` is the editorial/research brief.

Product-page shopfront links must declare a stable platform-independent identifier beginning with a letter, for example `data-shopfront="apify"`. Any number of present or future shopfronts is supported; the automation and website tracking do not use a fixed hostname list.

Active generation is limited to non-video platforms. YouTube and every other video-dependent platform remain historical or paused records only until the authoritative Drive records explicitly reactivate them.

Do not add passwords or tokens. Do not mark a publication live without a read-back URL and verification timestamp.
