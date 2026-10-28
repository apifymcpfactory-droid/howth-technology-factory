# Featured product carousel

The homepage retains its large copy/artwork layout. The catalogue uses the existing compact card. Both are generated from `products/featured.json`, in the order listed there.

To add a new product, first create its real page, catalogue record, working demo and artwork. Add its promotion metadata to `featured.json`, newest first. Run `node scripts/build-product-grids.mjs` and the catalogue/featured-product checks. Up to **50** products can be featured; the full catalogue can contain more. Remove the oldest featured entry when rotating a 51st product into this shelf.

Metadata includes the short navigation label, platform, headline lines, first emphasized line, introduction, pricing/availability wording, demo, optional marketplace link, artwork/alt text, caption and facts. There is no fabricated product placeholder or duplicated slide used to fill the shelf. Do not claim an unavailable checkout or omit a product's development status when that changes the buying decision.

Navigation uses Previous/Next, a horizontally scrolling product-name selector and keyboard Left/Right/Home/End. On touchscreens, a horizontal swipe over the card can change products. Rotation is manual. No new service, analytics, framework, storage or hosting is involved. Without JavaScript, the first feature and the complete existing product grid remain available.
