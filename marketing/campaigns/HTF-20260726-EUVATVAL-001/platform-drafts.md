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

## daily.dev

Post ID: `HTF-20260726-EUVATVAL-001-DAILYDEV-09`

Title: A VAT validator needs an “unavailable” state

Angle: developer discussion on why upstream failure cannot be represented as `valid: false`.

## Indie Hackers

Post ID: `HTF-20260726-EUVATVAL-001-INDIEHACKERS-10`

Title: The VAT-validation edge case that can reject a legitimate EU customer

Angle: SaaS billing and finance operations; distinguish customer data problems from upstream VIES downtime.
