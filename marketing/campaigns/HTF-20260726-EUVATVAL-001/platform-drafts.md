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

![Evidence record for a VIES check, from normalized input through a timestamped result to an operational action](https://howthtechnologyfactory.pro/assets/insights/vies-evidence-record.png)

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

### Put the lookup before the business decision

The technical check and the operational decision are related, but they are not the same event. The check should record what was sent to VIES and what came back. The workflow should then apply the organisation’s rules to that result.

This boundary stops infrastructure failures from becoming customer judgements. A timeout should not produce the same customer message as a confirmed invalid response. In the other direction, a valid response should not automatically approve a transaction when place of supply, customer status or the nature of the supply still needs review.

I find it useful to make the transition visible:

- `pending` means no dependable result has been recorded yet;
- `valid` and `invalid` are completed lookup outcomes;
- `unavailable` is a completed attempt with no dependable business answer.

An unavailable item can carry a next-attempt time without changing the original evidence. Finance teams can see that work remains open, while engineering teams can inspect the technical cause.

### Retries need a budget

“We retry” is not a complete reliability policy. A retry should have a small attempt limit, increasing delays and enough random variation to avoid many workers calling the same national service together.

The final result must still be explicit. When the retry budget is exhausted, return unavailable with the last error category. Do not keep a background task alive indefinitely, and do not convert the missing answer into invalid because the calling system expects a boolean.

Some failures should not be retried at all. A malformed country prefix, an impossible identifier shape or a configuration error needs operator attention. Temporary transport and upstream failures belong in the retry path. Keeping those categories separate prevents needless traffic and makes alerts more useful.

### Retain the evidence, not just the answer

A durable check record should show the normalized identifier, request time, outcome, optional fields returned and any consultation number associated with the request. If the customer later corrects the number, keep the earlier attempt rather than overwriting it. The history explains why the transaction paused and what changed.

That does not mean retaining everything forever. Names and addresses may be sensitive. Use the same access and deletion rules that govern the transaction record, and store only the fields the workflow can justify.

The same principle applies in bulk. Every input should produce one correlated result, including failures. Aggregate counts are useful for monitoring, but they should never replace the individual rows. A retry job can then select only unavailable items while preserving the successful evidence.

There is also a useful separation between evidence and observability. The evidence record belongs with the transaction and answers what was checked, when, and with what result. Operational logs answer why a request was slow or unavailable. They usually need a request identifier, attempt number and error category, not another permanent copy of the customer’s full details.

That separation keeps monitoring practical. Teams can watch the share of valid, invalid and unavailable outcomes, retry counts and latency without putting VAT numbers, names or addresses into metric labels. When an incident occurs, the request identifier links the restricted diagnostic record to the relevant transaction without exposing the whole response in every system.

Retention should be deliberate too. Keep the check evidence for as long as the transaction and applicable record-keeping policy require, then remove it through the same governed process. A validator should not quietly become an indefinite identity database merely because storing every response was convenient during implementation.

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

![State-machine diagram for valid, invalid and temporarily unavailable VIES results](https://howthtechnologyfactory.pro/assets/insights/vies-validation-state-machine.svg)

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

### Normalize once, and show what was checked

Normalization belongs at the boundary of the validation service. Remove formatting that the contract explicitly permits, normalize the country prefix consistently, and reject impossible shapes before making a network request. Do not scatter slightly different cleanup rules across a checkout form, an invoicing job and a support tool.

The result should contain the normalized VAT number sent upstream. That makes the record reproducible and gives a user something concrete to correct. It also prevents a subtle debugging failure: logging the raw input while the service checks a transformed value. When those values differ, an operator can otherwise spend time investigating a request that VIES never received.

Normalization must not become guesswork. A validator should not silently invent a country prefix or keep stripping characters until an input happens to pass. If an application wants to infer a country from customer data, make that a separate, visible business rule and preserve both the original and derived values.

### Separate input failures from upstream unavailability

The three result states describe completed checks, but an API also needs a clear failure taxonomy around them. Malformed input and missing credentials are caller problems. Timeouts, connection failures and an unavailable national service are operational problems. A successful response saying that the number is not valid is a business result.

These categories should drive different behaviour. Caller problems return immediately and should not be retried. Temporary operational failures can enter a bounded retry policy. An invalid result should not be retried automatically in the hope that it changes. That distinction reduces unnecessary VIES traffic and stops a retry queue from hiding genuine data-quality work.

When a retry budget is exhausted, return `unavailable` with a stable error category and the last attempt time. Avoid exposing raw stack traces or transport details to end users. Keep those details in restricted logs, correlated through a request identifier.

### Make retries observable and idempotent

A reliable retry policy has an attempt limit, increasing delays and jitter. Without jitter, a group of workers that fail together can call the same recovering service together again. Without a limit, a supposedly temporary workflow can stay open indefinitely.

Retries must not create duplicate business effects. The validation call itself is a lookup, but the surrounding workflow may reserve an order, send a message or advance an invoice. Keep those side effects outside the retry loop. Persist the validation outcome first, then let the business process consume it idempotently.

Useful operational measurements include attempt count, latency, result state and a coarse upstream-error category. Segment them by country prefix when that is permitted and useful, because VIES depends on national services. Do not put full VAT numbers, business names or addresses into metric labels; high-cardinality personal data is both expensive and difficult to govern.

### Preserve one result for every batch input

Batch validation should behave like a map operation, not an all-or-nothing transaction. A temporary failure for one country must not erase successful answers for the other rows. Return one correlated output per input, in a documented order or with a stable item identifier.

That contract makes partial retry straightforward. A follow-up job can select only `unavailable` items while leaving `valid` and `invalid` evidence untouched. It also makes reconciliation possible: the caller can prove that every submitted row reached a terminal result for that attempt.

Be explicit about concurrency. More parallel requests are not automatically better when the dependency is a federation of national systems. Use a bounded worker pool, respect timeouts, and lower concurrency during widespread failures. If the upstream service provides no formal retry-after signal, your own backoff policy should still avoid tight loops.

### Store evidence with a retention boundary

For each attempt, retain the normalized value, check time, outcome and optional response fields that the workflow can justify. If a requester VAT number produced a consultation number, keep that relationship with the record. Do not describe the record as a complete tax determination: it proves what the lookup returned at a particular time.

Names, addresses and VAT identifiers may be sensitive business or personal data. Apply access controls and deletion rules from the transaction system instead of retaining validator responses forever. Logs used for engineering diagnosis can often keep a request ID and result category without copying the full response.

These boundaries also improve testing. The pure normalization and mapping functions can be tested without the network; the VIES adapter can be tested against fixtures for valid, invalid and unavailable responses; and the retry coordinator can use a fake clock to prove attempt limits and backoff without slow test suites.

Five tests catch most integration mistakes:

1. A valid number with name and address.
2. A valid number without one or both optional identity fields.
3. An invalid number after deterministic normalization.
4. A national-service failure represented as `unavailable`.
5. A mixed batch that keeps the outcome and timestamp for every input.

Add contract tests for the less obvious edges: a retryable timeout must never map to `invalid`; omitted identity fields must remain `null` rather than failing decoding; a second processing attempt must not repeat downstream side effects; and logs or metric labels must not contain the full VAT number. Those tests protect the operational meaning of the states, not just their TypeScript shape.

A valid VIES response is still not a complete tax decision. It confirms registration status for cross-border EU trade at that moment; transaction context remains separate.

The [worked state-machine guide and primary sources](https://howthtechnologyfactory.pro/insights/vies-validation-state-machine.html?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03) cover the operational reasoning. You can compare a concrete implementation through the [Howth product page](https://howthtechnologyfactory.pro/products/eu-vat-validator.html?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03), [Apify](https://apify.com/apifmcpfactory/eu-vat-validator?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03), or [MCPize](https://mcpize.com/mcp/eu-vat-validator-mcp?utm_source=devto&utm_medium=organic&utm_campaign=htf-20260726-euvatval-001&utm_content=htf-20260726-euvatval-001-devto-03&htf_product=eu-vat-validator&htf_campaign=HTF-20260726-EUVATVAL-001&htf_platform=devto&htf_post=HTF-20260726-EUVATVAL-001-DEVTO-03). Verify live pricing and limits before use.

Disclosure: This article was prepared with AI assistance and checked against the cited European Commission sources and the live product contracts.

## X

Post ID: `HTF-20260726-EUVATVAL-001-X-04`

Corrected replacement proposal. Not published. The existing live thread is immutable without deletion; deletion and reposting require explicit confirmation.

Thread:

1/3 An EU VAT check has 3 operational outcomes:

1. valid → continue + retain the record
2. invalid → pause and request correction/evidence
3. VIES unavailable → retry later, never convert it to “invalid”

2/3 A valid VIES response confirms cross-border registration status at that moment. It does not decide the full VAT treatment. Name/address may also be absent because national sources differ.

Workflow + official sources:
https://howthtechnologyfactory.pro/go/euvat-x-04/

3/3 Keep the checked value, timestamp and result state. Let product and marketplace choices live on the first-party page instead of turning the thread into a link list.

## Bluesky

Post ID: `HTF-20260726-EUVATVAL-001-BLUESKY-05`

Corrected replacement proposal. Not published. The existing live thread is immutable without deletion; deletion and reposting require explicit confirmation.

Thread:

1/3 VIES validation is a state machine, not a boolean:

valid → continue + keep the record
invalid → request correction/evidence
unavailable → retry later

An upstream outage must never become a false rejection.

2/3 A valid response confirms cross-border registration status at that moment. It does not decide the whole VAT treatment, and national sources may omit name/address.

3/3 The practical workflow and primary sources:
https://howthtechnologyfactory.pro/go/euvat-bluesky-05/

## Reddit

Post ID: `HTF-20260726-EUVATVAL-001-REDDIT-06`

Destination: authenticated company profile `u/ApifyMCPFactory`

Title: A VAT number check needs a third result: unavailable

Body:

When a VAT-validation service cannot reach a member state's register, that is not evidence that the customer's VAT number is invalid.

The distinction matters in billing and onboarding workflows:

- valid: continue, and retain what was checked and when;
- invalid: pause the affected transaction and ask for correction or other evidence;
- unavailable: keep the error, retry later, and do not turn an upstream outage into a customer-data failure.

A few implementation details make this safer:

1. Keep one result per input in a batch, including failures.
2. Show the normalized value that was actually checked.
3. Allow business name and address to be absent; national sources do not always return them.
4. Keep a consultation number conditional on supplying the requester VAT number.
5. Treat VIES status as one input to a tax decision, not the whole decision.

The longer state-machine explanation, European Commission sources and verified implementation choices are here:

https://howthtechnologyfactory.pro/go/euvat-reddit-06/

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
