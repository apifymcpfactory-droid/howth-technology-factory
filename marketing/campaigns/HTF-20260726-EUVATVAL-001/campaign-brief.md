# EU VAT Validator campaign brief

Campaign ID: `HTF-20260726-EUVATVAL-001`

Product: EU VAT Validator

Canonical page: https://howthtechnologyfactory.pro/products/eu-vat-validator.html

Exact shopfronts:

- Apify: https://apify.com/apifmcpfactory/eu-vat-validator
- MCPize: https://mcpize.com/mcp/eu-vat-validator-mcp

## Objective and audience

Help finance-operations teams, accountants, SaaS operators, developers and automation builders design reliable EU VAT validation workflows. The campaign teaches that VIES validation has three operational states—valid, invalid and temporarily unavailable—and that each requires a different action.

## Evidence-backed product facts

- The Actor accepts a required `vatNumbers` array and an optional `requesterVat`.
- Input values are normalized before validation.
- It returns one dataset item per input, including the normalized VAT number, country code, validity, optional business name/address, optional consultation number, check time and error.
- Name and address depend on what the relevant national source supplies.
- A consultation number requires `requesterVat`.
- Temporary VIES failures are retried and can be returned as errors rather than being represented as invalid VAT numbers.
- The Apify listing charges $0.005 per validated number plus the platform's low per-run start fee.
- The MCPize listing currently offers a free 50-request plan and a Pro plan; readers must verify current terms on the listing.

## Boundaries

- VIES is a search engine over national databases, not a central EU VAT database.
- A valid response confirms cross-border EU VAT registration status at the time of the check; it does not determine the full tax treatment.
- An invalid response may reflect non-activation or unfinished registration as well as a nonexistent number.
- Name/address fields may be absent.
- Data is stored in the Apify run dataset and is governed by the user's Apify storage and retention settings.
- No invented adoption, conversion, review, performance or compliance claims.

## Competitive alternatives

- Direct manual use of the free official VIES interface.
- A direct integration with the official service.
- General VAT-validation APIs such as vatlayer, VAT Sense and Avatcado.

The campaign does not claim universal superiority. The relevant trade-offs are batch handling, per-row error contracts, MCP access, pricing model and operational effort.

## Channel decision

- Website Insight: publish first; owned educational source.
- Medium: eligible for a finance-operations essay with canonical attribution.
- DEV: eligible for a developer-focused response-contract tutorial with AI-assistance disclosure.
- X: eligible for a compact finance-ops checklist.
- Bluesky: eligible for a concise state-machine lesson.
- Apify: exact listing verified; propose narrow factual corrections to conditional consultation-number, comparison, certainty and retention language.
- MCPize: exact listing verified and left unchanged because its description, website/GitHub links, tool contracts and current pricing are clear and accurate.
- Reddit: use the authenticated `u/ApifyMCPFactory` profile fallback. No VAT/accounting community with established account participation and a verified promotional-content fit was found.
- Hacker News: skip this campaign. The technical topic is relevant, but the new account's current use is self-submission, a second campaign link would make the account primarily promotional, and the product is not a natural Show HN because trying it requires a marketplace access path.
- Product Hunt: defer to 28 January 2027 at 12:01 AM PST (08:01 Europe/Dublin), more than six months after the PDF Toolkit launch on the shared root domain.
- LinkedIn: paused and excluded until the company page is ready.
- YouTube and all video generation: removed from the active marketing system. No video may be created, prepared or published.
- daily.dev and Indie Hackers: not approved campaign platforms.

## Primary sources

- https://europa.eu/youreurope/business/finance-and-tax/vat/check-vat-number-vies/index_en.htm
- https://taxation-customs.ec.europa.eu/taxation/vat/vat-directive/vat-identification-numbers_en
- https://ec.europa.eu/taxation_customs/vies/faq.html?locale=en
- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02011R0282-20220701
