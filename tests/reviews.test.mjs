import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'products', 'catalogue.json'), 'utf8'));
const cache = JSON.parse(fs.readFileSync(path.join(root, 'marketing', 'review-cache.json'), 'utf8'));
const css = fs.readFileSync(path.join(root, 'assets', 'css', 'main.css'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'assets', 'js', 'main.js'), 'utf8');
const approved = new Set(['apify', 'mcpize', 'apple-app-store', 'google-play', 'g2', 'capterra', 'trustpilot']);

assert.equal(catalogue.schema_version, '1.1');
assert.equal(cache.lastVerified, '2026-07-26');
assert.equal(catalogue.products.length, 9);

for (const product of catalogue.products) {
  const html = fs.readFileSync(path.join(root, 'products', `${product.id}.html`), 'utf8');
  const cached = cache.products[product.id];
  assert.ok(Array.isArray(product.reviews) && product.reviews.length > 0, `${product.id}: missing reviews array`);
  assert.deepEqual(product.reviews, cached, `${product.id}: catalogue/cache mismatch`);
  assert.equal((html.match(/aria-labelledby=["']reviews-heading["']/g) || []).length, 0, `${product.id}: hidden empty section`);
  assert.doesNotMatch(html, /No reviews yet|Leave a review|Be the first to review/i, `${product.id}: legacy empty state`);
  assert.doesNotMatch(html, /"@type"\s*:\s*"(?:AggregateRating|Review)"|itemprop=["'](?:aggregateRating|review)["']/i, `${product.id}: prohibited review markup`);

  for (const review of product.reviews) {
    assert.ok(approved.has(review.source), `${product.id}: unapproved source`);
    assert.equal(new URL(review.sourceUrl).protocol, 'https:');
    assert.equal(review.lastVerified, '2026-07-26');
    assert.equal(review.verificationStatus, 'verified_no_reviews');
    assert.equal(review.reviewCount, 0);
    assert.ok(!('rating' in review), `${product.id}: zero sentinel must not become a rating`);
    assert.ok(!('ratingScale' in review), `${product.id}: unknown scale must be omitted`);
  }

  const sourceIds = product.reviews.map((review) => review.source);
  assert.ok(sourceIds.includes('apify'), `${product.id}: Apify Actor source missing`);
  assert.equal(sourceIds.includes('mcpize'), product.shopfronts.some((shop) => shop.id === 'mcpize'), `${product.id}: MCPize applicability mismatch`);
}

assert.match(css, /\.independent-reviews-grid[\s\S]*grid-template-columns/);
assert.match(css, /@media \(max-width: 40rem\)[\s\S]*\.independent-reviews-grid[\s\S]*grid-template-columns:\s*1fr/);
assert.match(css, /\.independent-review-link:focus-visible/);
assert.match(runtime, /review_source_click/);
assert.match(runtime, /destination_url:\s*link\.href/);
assert.doesNotMatch(JSON.stringify(cache), /excerpt|reviewerName|overallRating|aggregateRating/i);

console.log('independent review tests passed');
