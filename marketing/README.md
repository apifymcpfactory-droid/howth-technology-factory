# Marketing workflow

The binding Constitution is stored one directory above this repository. This folder implements its URL-only campaign entrypoint and authoritative campaign ledger.

## Start a campaign

```powershell
node marketing/run-campaign.mjs https://howthtechnologyfactory.pro/products/<product>.html
```

The command accepts no campaign brief. It reads the local canonical product page, requires exactly one Apify listing and one MCPize listing, verifies both live destinations, checks the ledger, selects the first unused defensible angle, creates unique campaign/content identifiers and UTM links, writes a campaign package, and records the angle immediately.

It deliberately stops before publication. Research, platform-specific editorial work, authenticated publishing and live read-back require capabilities that a static repository cannot safely supply. A generated package is marked `research_required`; it is not publishable content.

For a local structural test without network requests:

```powershell
node marketing/run-campaign.mjs https://howthtechnologyfactory.pro/products/pdf-toolkit.html --offline --dry-run
```

## Records

- `campaign-ledger.json` is authoritative for used angles, publications, baselines and review dates.
- `analytics-sources.json` distinguishes connected, manual and authorization-blocked sources and defines attribution language.
- `campaigns/<campaign-id>/manifest.json` is the immutable campaign snapshot.
- `campaigns/<campaign-id>/campaign.md` is the editorial/research brief.

Do not add passwords or tokens. Do not mark a publication live without a read-back URL and verification timestamp.
