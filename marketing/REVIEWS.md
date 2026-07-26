# Independent review evidence

`marketing/review-cache.json` is a controlled, non-authoritative website data cache. Google Drive remains authoritative for marketing records. This file contains only independently verified marketplace evidence used by the website.

## Sources and verification

- Apify applies to every current product. On 2026-07-26, each exact Actor was checked through Apify's public Store API and its live listing. `actorReviewCount` and `actorReviewRating` were zero for all nine.
- MCPize applies to the seven products with exact MCPize listings. On 2026-07-26, each live listing and its permitted public embedded marketplace state were checked manually. Every listing reported `reviewsCount: 0` and `rating: 0`.
- Apple App Store and Google Play do not apply because no current product is a mobile app.
- G2 and Capterra do not apply because these products are marketplace-delivered APIs, MCP tools and Apify Actors, not qualifying established SaaS listings.
- No Howth Technology Factory Trustpilot profile was verified. Trustpilot is company-level evidence only and must never be repeated as a product rating.
- Google Business reviews are excluded because the company is not verified as eligible for a Google Business Profile.

Zero marketplace rating values are treated as “no rating”, not a zero-star score. Accordingly, `rating` and `ratingScale` are omitted. No review excerpts were copied because no qualifying public reviews exist.

## Display and structured-data rules

The entire **Independent reviews** section is absent when every applicable source has zero reviews. A future source card may be rendered only from cache data with `verificationStatus: "verified_with_reviews"` and a positive `reviewCount` or `ratingCount`. Sources are shown separately; ratings must never be combined. The accessible source link must use `data-review-source` and `data-product-id`, retain the exact verified destination, and be keyboard operable.

Third-party marketplace evidence must not be emitted as Howth Technology Factory `AggregateRating` or `Review` structured data.

## Safe refresh

1. Recheck the exact listing and current official source policy.
2. Prefer an official API or marketplace-provided embedded data. If unavailable, use a documented manual check; do not scrape against source terms.
3. Record only fields the source exposes. Omit unknown fields.
4. Update both this cache and the matching `products/catalogue.json` `reviews` array.
5. Add an excerpt only when reuse is permitted and the exact text, public reviewer name, date and direct review URL are all verifiable.
6. Run the complete test suite and verify rendered values against the source before deployment.

If a source becomes unavailable or cannot be verified, set an unavailable verification status, retain the last-check date and limitation in the cache, and hide it from the website. No schedule or refresh automation is created in Part 1.2.
