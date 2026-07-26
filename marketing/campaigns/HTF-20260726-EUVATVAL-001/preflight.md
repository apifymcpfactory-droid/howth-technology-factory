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
- Medium, DEV, X, Bluesky and Reddit drafts use platform-specific personas and formats.
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

- Website: live and verified.
- Apify: exact listing verified; narrow factual corrections are proposed and require final confirmation before editing.
- MCPize: exact listing verified and left unchanged.
- Medium, X and Bluesky: authenticated drafts are eligible subject to final confirmation.
- DEV: authenticated and ready to schedule for 28 July 2026 at 10:00 Europe/Dublin, after the existing 26 July 17:23 post and the 27 July Product Hunt launch day.
- Reddit: authenticated company-profile fallback selected because no suitable community has established account participation and verified promotional-content fit.
- Hacker News: skipped because the account's current self-submission pattern would make another campaign link primarily promotional; the marketplace access path also makes this a poor Show HN.
- Product Hunt: deferred to 28 January 2027 at 12:01 AM PST (08:01 Europe/Dublin), beyond the six-month shared-domain gap after PDF Toolkit.
- LinkedIn is paused and excluded.
- YouTube and all video generation are removed; no video was created or prepared.
- daily.dev and Indie Hackers are not approved campaign platforms.

## Pre-publication tests

- All repository Node tests pass.
- Campaign JSON parses.
- `git diff --check` passes apart from informational Windows line-ending notices.
- Local Insight renders correctly at desktop width.
- Local navigation carries the EU VAT campaign parameters.
- Tracked Insight, product, Apify and MCPize destinations resolve to the intended URLs.
