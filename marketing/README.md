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

The controlling campaign set is Website Insights, every shopfront discovered from the product page, X, Bluesky, Reddit, Medium, Dev.to, Product Hunt and Hacker News. LinkedIn is excluded until its company page is ready. YouTube and all video generation are removed from the active marketing system; historical account records do not authorise video preparation or publication. No additional platform may be introduced without explicit CEO approval.

## Publication quality rules

- Tracking is mandatory, but tracking parameters must never be printed as visible copy. Long-form platforms use concise descriptive anchor text with the tracked destination underneath.
- X and Bluesky normally use one primary first-party campaign link. Reddit normally uses one primary clean link. None of these platforms is required to list every shopfront.
- Clean links are registered in `campaign-links.json` and generated under `/go/<slug>/` by `build-campaign-links.mjs`. Redirect pages are `noindex`, preserve unique campaign and post identity, and apply attribution only when the visitor follows the link.
- Substantive website Insights, Medium articles and DEV articles must contain 1,000–2,000 meaningful editorial words. Platform-native short-form content uses its natural current limits; the long-form range must not be applied universally.
- A campaign visual must explain the specific subject: a decision diagram, workflow, annotated screenshot, architecture, input/output example, process, evidence record or relevant data visualisation. Company-name banners, logo-led graphics, promotional heroes, generic artwork and artwork containing calls to action are prohibited.
- Visual suitability requires a recorded human-visible preflight decision with the asset preview and explanation. Automated checks enforce the configuration and presence of that decision; they do not claim to judge visual quality.

Do not add passwords or tokens. Do not mark a publication live without a read-back URL and verification timestamp.
