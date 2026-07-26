# Platform drafts

Every final publication must retain its assigned post ID and tracked links. Text may be shortened only to satisfy a verified platform limit without changing claims.

## Medium

Post ID: `HTF-20260726-EUVATVAL-001-MEDIUM-02`

Title: Stop treating EU VAT validation as a boolean

Subtitle: Valid, invalid and temporarily unavailable are three different operational decisions.

Body:

A customer enters a VAT number. The system checks VIES. The response says `false`.

What should happen next?

That question is harder than it looks, because `false` is often doing too much work. It may mean the number is invalid. It may also mean the national service did not answer, a retry timed out, or an integration translated an upstream error into the same shape as a genuine negative result.

For finance operations, those are not equivalent outcomes. One asks the customer for a correction. The other asks the system to try again later.

The safer model has three states.

### 1. Valid

A valid VIES response confirms that the VAT number is registered for cross-border EU trade at the time of the check. Keep the normalized number, timestamp, response and any consultation number returned.

That record is useful evidence of the check performed. It does not decide the whole VAT treatment of the transaction. Place of supply, the type of supply and the parties’ roles still matter.

### 2. Invalid

An invalid result can mean the number does not exist, is not activated for intra-EU transactions, or has not completed registration.

The operational response should be explicit: pause the affected transaction, show the exact normalized number that was checked, and ask for a correction or other evidence. Do not silently keep changing the input until something passes.

### 3. Temporarily unavailable

VIES retrieves information from national VAT databases, and those national systems are sometimes unavailable. A timeout or exhausted retry is not evidence that the VAT number is invalid.

Keep this state separate. Retry with a bounded delay, preserve the error, and give the finance team a way to resume the check.

This becomes especially important in a batch. A problem with one national service should not erase valid results for other rows or turn every item into a misleading failure.

### Conditional fields are normal

Business name and address are not guaranteed. Some national sources do not provide them through VIES; in other cases, data-protection rules limit what can be returned. A good schema allows those fields to be empty without treating the check itself as broken.

I use this compact checklist when reviewing a VAT-validation workflow:

1. Preserve valid, invalid and unavailable as distinct states.
2. Record the value and time actually checked.
3. Allow name and address to be absent.
4. Make normalization deterministic and visible.
5. Keep per-row results in mixed batches.
6. Treat a consultation number as part of the check record, not a tax conclusion.

The full workflow, response contract and European Commission sources are in the [Howth Technology Factory Insight](https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=medium&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-medium-02&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=medium&htf_post=HTF-20260726-EUVATVAL-001-MEDIUM-02).

For a concrete implementation, review the [EU VAT Validator product contract](https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=medium&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-medium-02&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=medium&htf_post=HTF-20260726-EUVATVAL-001-MEDIUM-02), the current [Apify listing](https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=medium&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-medium-02&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=medium&htf_post=HTF-20260726-EUVATVAL-001-MEDIUM-02) and the [MCPize listing](https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=medium&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-medium-02&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=medium&htf_post=HTF-20260726-EUVATVAL-001-MEDIUM-02). Check the live listings for current pricing and limits.

Canonical source: https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html

## DEV

Post ID: `HTF-20260726-EUVATVAL-001-DEVTO-03`

Title: Model VIES VAT validation with three states, not true/false

Scheduling proposal: 28 July 2026 at 10:00 Europe/Dublin. This follows the existing scheduled DEV post on 26 July 2026 at 17:23 Europe/Dublin and avoids the PDF Toolkit Product Hunt launch day on 27 July.

Body:

If your VAT-validation interface returns only `true` or `false`, where does an upstream VIES outage go?

Too often it becomes `false`. That turns a temporary service failure into a customer-data failure.

VIES is a European Commission search service over national VAT databases. Those national systems can be unavailable, and the information they return is not uniform. Model that reality in the contract:

```ts
type VatValidation =
  | {
      status: "valid";
      vatNumber: string;
      checkedAt: string;
      businessName: string | null;
      address: string | null;
      consultationNumber: string | null;
    }
  | {
      status: "invalid";
      vatNumber: string;
      checkedAt: string;
    }
  | {
      status: "unavailable";
      vatNumber: string;
      checkedAt: string;
      error: string;
      retryable: true;
    };
```

The discriminated union forces callers to choose an action.

- `valid`: continue and retain the check record.
- `invalid`: pause and ask for correction or other evidence.
- `unavailable`: retry later; never reinterpret the outage as an invalid VAT number.

It also makes optional national data explicit. Business name and address may be absent even when a number is valid. A consultation number is available only when the requester VAT number is included in the check.

Five tests catch most integration mistakes:

1. A valid number with name and address.
2. A valid number without one or both optional identity fields.
3. An invalid number after deterministic normalization.
4. A national-service failure represented as `unavailable`.
5. A mixed batch that keeps the outcome and timestamp for every input.

A valid VIES response is still not a complete tax decision. It confirms registration status for cross-border EU trade at that moment; transaction context remains separate.

The [worked state-machine guide and primary sources](https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03) cover the operational reasoning. You can compare a concrete implementation through the [Howth product page](https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03), [Apify](https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03), or [MCPize](https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03). Verify live pricing and limits before use.

Disclosure: This article was prepared with AI assistance and checked against the cited European Commission sources and the live product contracts.

## X

Post ID: `HTF-20260726-EUVATVAL-001-X-04`

Thread draft:

1/3 An EU VAT check has 3 operational outcomes:

1. valid → continue + retain the record
2. invalid → pause and request correction/evidence
3. VIES unavailable → retry later, never convert it to “invalid”

2/3 A valid VIES response confirms cross-border registration status at that moment. It does not decide the full VAT treatment. Name/address may also be absent because national sources differ.

Workflow + official sources:
https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=x&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-x-04&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=x&htf_post=HTF-20260726-EUVATVAL-001-X-04

3/3 Implementation details:
https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=x&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-x-04&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=x&htf_post=HTF-20260726-EUVATVAL-001-X-04

Apify: https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=x&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-x-04&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=x&htf_post=HTF-20260726-EUVATVAL-001-X-04

MCPize: https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=x&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-x-04&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=x&htf_post=HTF-20260726-EUVATVAL-001-X-04

## Bluesky

Post ID: `HTF-20260726-EUVATVAL-001-BLUESKY-05`

Thread draft:

1/6 VIES validation is a state machine, not a boolean:

valid → continue + keep the record
invalid → request correction/evidence
unavailable → retry later

An upstream outage must never become a false rejection.

2/6 A valid response confirms cross-border registration status at that moment. It does not decide the whole VAT treatment, and national sources may omit name/address.

3/6 Guide + official sources:
https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=bluesky&utm_medium=organic&utm_campaign=HTF-20260726-EUVATVAL-001&utm_content=HTF-20260726-EUVATVAL-001-BLUESKY-05&htf_product=eu-vat-validator

4/6 Product contract:
https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=bluesky&utm_medium=organic&utm_campaign=HTF-20260726-EUVATVAL-001&utm_content=HTF-20260726-EUVATVAL-001-BLUESKY-05&htf_product=eu-vat-validator

5/6 Apify Actor:
https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=bluesky&utm_medium=organic&utm_campaign=HTF-20260726-EUVATVAL-001&utm_content=HTF-20260726-EUVATVAL-001-BLUESKY-05&htf_product=eu-vat-validator

6/6 MCPize server:
https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=bluesky&utm_medium=organic&utm_campaign=HTF-20260726-EUVATVAL-001&utm_content=HTF-20260726-EUVATVAL-001-BLUESKY-05&htf_product=eu-vat-validator

## Reddit

Post ID: `HTF-20260726-EUVATVAL-001-REDDIT-06`

Destination: authenticated company profile `u/ApifyMCPFactory`

Title: A VAT number check needs a third result: unavailable

Body:

When a VAT-validation service cannot reach a member state's register, that is not evidence that the customer's VAT number is invalid.

The distinction matters in billing and onboarding workflows:

- `valid`: continue, and retain what was checked and when;
- `invalid`: pause the affected transaction and ask for correction or other evidence;
- `unavailable`: keep the error, retry later, and do not turn an upstream outage into a customer-data failure.

A few implementation details make this safer:

1. Keep one result per input in a batch, including failures.
2. Show the normalized value that was actually checked.
3. Allow business name and address to be absent; national sources do not always return them.
4. Keep a consultation number conditional on supplying the requester VAT number.
5. Treat VIES status as one input to a tax decision, not the whole decision.

The longer state-machine explanation and European Commission sources are here:

https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=reddit&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-reddit-06&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=reddit&htf_post=HTF-20260726-EUVATVAL-001-REDDIT-06

Concrete implementation references:

- Product contract: https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=reddit&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-reddit-06&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=reddit&htf_post=HTF-20260726-EUVATVAL-001-REDDIT-06
- Apify: https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=reddit&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-reddit-06&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=reddit&htf_post=HTF-20260726-EUVATVAL-001-REDDIT-06
- MCPize: https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=reddit&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-reddit-06&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=reddit&htf_post=HTF-20260726-EUVATVAL-001-REDDIT-06

Disclosure: EU VAT Validator is a Howth Technology Factory product. This is posted on the company profile instead of being dropped into a community where the account has not earned participation.

## Product Hunt

Post ID: `HTF-20260726-EUVATVAL-001-PRODUCTHUNT-07`

Decision: defer. Proposed launch: 28 January 2027 at 12:01 AM PST (08:01 Europe/Dublin), more than six months after the PDF Toolkit launch on the same root domain.

Name: EU VAT Validator

Tagline: Reliable EU VAT checks for finance workflows and agents

Description:

Validate one or many EU and Northern Ireland VAT numbers through VIES while keeping invalid and temporarily unavailable results distinct. Available as an Apify Actor and MCP tools for finance operations and automation.

First comment:

EU VAT checks look binary until the upstream service is unavailable. Then a `false` result can reject a legitimate customer for the wrong reason.

We built EU VAT Validator around an explicit operational distinction: valid, invalid, or temporarily unavailable. Batch runs retain one result per input; business name and address remain optional because national sources differ; consultation numbers are conditional on supplying the requester VAT number.

The product is available through Apify for Actor-style batch workflows and through MCPize for agent/tool calls. VIES status is evidence from a check, not a complete tax decision, so transaction context and local advice remain separate.

I would value feedback on the result contract, particularly whether `unavailable` should remain a terminal result for the caller or be accompanied by a suggested retry window.

## Hacker News

Post ID: `HTF-20260726-EUVATVAL-001-HACKERNEWS-08`

Decision: skip for this campaign. The three-state validation model is technically relevant, but the account's current use is self-submission and another campaign link would make it primarily promotional. The product also requires a marketplace access path, so it is not a natural Show HN. No submission draft is being forced.

## Apify listing assessment

Post ID: `HTF-20260726-EUVATVAL-001-APIFY-09`

Decision: factual improvements proposed; do not edit before final confirmation.

Proposed changes:

- Make consultation numbers explicitly conditional on supplying `requesterVat`; remove “on every check” wording.
- Replace “official audit evidence” and “exactly what tax authorities ask for” with a narrower description: a VIES request record whose evidential requirements should be confirmed for the relevant transaction and jurisdiction.
- Remove the unsupported “Comparable tools charge $40+ per 1,000” comparison.
- Replace categorical speed and “no IP-blocking risk” claims with the verified behavior: bounded concurrency, retries and one output item per input.
- Clarify that the Actor writes results to the Apify run dataset and that storage/retention follow the user's Apify settings.
- Add the verified Howth product page and owned Insight as documentation links.

Proposed summary:

Validate EU and Northern Ireland VAT numbers through VIES in single or bulk runs. Returns validity and optional business name/address; a consultation number is returned only when `requesterVat` is supplied. Temporary member-state failures remain per-number errors instead of being converted to invalid results.

## MCPize listing assessment

Post ID: `HTF-20260726-EUVATVAL-001-MCPIZE-10`

Decision: verified and left unchanged. The exact listing has the correct Howth website and GitHub links, current Free/Pro and pay-per-call presentation, clear single/bulk/status tool descriptions, and an explicit unavailable-versus-invalid distinction. Adding campaign language would not improve the functional documentation.
