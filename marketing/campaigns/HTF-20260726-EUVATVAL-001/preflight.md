# Constitution preflight

Campaign: `HTF-20260726-EUVATVAL-001`

Status: pass for owned-site deployment; platform publication remains conditional on live authentication and final format checks.

## Authority and identity

- Google Drive authority reviewed in full: Control Centre, Constitution, Workflow, Campaign Ledger, Platform Register and Analytics Reports.
- GitHub source-of-truth and marketing automation documentation reviewed.
- Repository remote is `apifymcpfactory-droid/howth-technology-factory`.
- No AppForge100 account, folder, document, remote, code path or destination is used.

## Product and link verification

- Canonical product page verified.
- Exact Apify listing verified: `apifmcpfactory/eu-vat-validator`.
- Exact MCPize listing verified: `eu-vat-validator-mcp`.
- Claims checked against the live Apify Actor/build metadata, live MCPize listing and official European Commission guidance.
- Pricing is qualified by shopfront and readers are directed to verify live terms.
- No adoption, review, outcome, testimonial or compliance claims were added.

## Editorial quality

- Owned Insight leads with a practical workflow problem rather than promotion.
- The core angle is distinct from the PDF Toolkit campaign.
- Medium, DEV, X, Bluesky, daily.dev and Indie Hackers drafts use platform-specific personas and formats.
- DEV includes an AI-assistance disclosure.
- Primary sources are named and linked.
- Legal/tax boundary is explicit: VIES validity does not determine the complete VAT treatment.
- The visual is deterministic, accessible and contains no invented data.

## Attribution

- Campaign ID is unique.
- Every candidate platform has a unique post ID.
- Links identify source/platform, product, campaign and post through UTM and/or equivalent `htf_*` parameters.
- Website, Apify and MCPize links are distinct and exact.
- Social drafts that cannot fit the full expanded parameter set use exact campaign/post values in `utm_campaign` and `utm_content`, with product retained in `htf_product`.

## Channel eligibility

- Website, Medium, DEV, X and Bluesky: eligible subject to live account verification.
- daily.dev and Indie Hackers: conditional on authenticated usable composer and community/format fit.
- Reddit: skipped because established relevant-community participation was not verified.
- Hacker News: skipped because the timing and self-submission pattern would risk a promotional submission.
- Product Hunt: skipped because the PDF Toolkit launch on 27 July 2026 must not be disrupted and shared-domain spacing applies.
- LinkedIn remains paused.
- YouTube and every video-dependent channel remain excluded.

## Pre-publication tests

- All repository Node tests pass.
- Campaign JSON parses.
- `git diff --check` passes apart from informational Windows line-ending notices.
- Local Insight renders correctly at desktop width.
- Local navigation carries the EU VAT campaign parameters.
- Tracked Insight, product, Apify and MCPize destinations resolve to the intended URLs.
