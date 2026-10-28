import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const catalogue = JSON.parse(read('products', 'catalogue.json'));
const html = read('products', 'index.html');
const script = read('assets', 'js', 'catalogue.js');
const sitemap = read('sitemap.xml');
const llms = read('llms.txt');

assert.equal(catalogue.schema_version, '1.1');
assert.equal(catalogue.publisher.name, 'Howth Technology Factory');
// Deliberately no hard-coded count: a test that needs editing every time a
// product ships is a chore, not a test.
assert.ok(catalogue.products.length > 0, 'catalogue must not be empty');
assert.equal(new Set(catalogue.products.map(({ id }) => id)).size, catalogue.products.length);

const taxonomy = Object.fromEntries(
    Object.entries(catalogue.taxonomy).map(([facet, values]) => [facet, new Set(values.map(({ id }) => id))])
);
for (const facet of ['problems', 'buyers', 'types', 'access']) {
    assert.ok(taxonomy[facet].size > 0, `${facet} taxonomy is empty`);
}

const productFiles = fs.readdirSync(path.join(root, 'products'))
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .sort();
assert.deepEqual(
    catalogue.products.map(({ id }) => `${id}.html`).sort(),
    productFiles,
    'Every product page must have one catalogue record'
);

for (const product of catalogue.products) {
    assert.match(product.id, /^[a-z0-9-]+$/);
    assert.equal(product.url, `https://howthtechnologyfactory.pro/products/${product.id}.html`);
    assert.equal(typeof product.ai_agent_compatible, 'boolean');
    for (const facet of ['problems', 'buyers', 'types', 'access']) {
        assert.ok(product[facet].length, `${product.id} has no ${facet}`);
        for (const value of product[facet]) assert.ok(taxonomy[facet].has(value), `${product.id} uses unknown ${facet}: ${value}`);
    }
    assert.ok(Array.isArray(product.shopfronts));
    if (product.release_status === 'in_development') {
        assert.equal(product.shopfronts.length, 0, `${product.id}: development product must not claim a live shopfront`);
    } else {
        assert.ok(product.shopfronts.length >= 1);
    }
    for (const shopfront of product.shopfronts) {
        assert.ok(shopfront.id && shopfront.name);
        assert.doesNotThrow(() => new URL(shopfront.url));
    }
    assert.match(html, new RegExp(`href="/products/${product.id}\\.html"`));
    const productHtml = read('products', `${product.id}.html`);
    assert.match(productHtml, /aria-label="Breadcrumb"/);
    assert.match(productHtml, /"@type":"BreadcrumbList"/);
    assert.match(productHtml, /<link rel="canonical"/);
    if (product.release_status === 'in_development') {
        assert.match(productHtml, /In development/);
        assert.doesNotMatch(productHtml, /"@type"\s*:\s*"Offer"|data-shopfront=/);
    }
}

const itemLists = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(([, json]) => JSON.parse(json)).filter((value) => value['@type'] === 'ItemList');
assert.equal(itemLists.length, 1);
assert.equal(itemLists[0].numberOfItems, catalogue.products.length);
assert.deepEqual(itemLists[0].itemListElement.map((item) => item.url), catalogue.products.map((product) => product.url));

// Shopfronts are data, not a fixed pair: an arbitrary future destination remains valid.
const futureProduct = structuredClone(catalogue.products[0]);
futureProduct.shopfronts.push({ id: 'future-market', name: 'Future Market', url: 'https://example.com/tool' });
assert.equal(futureProduct.shopfronts.length, catalogue.products[0].shopfronts.length + 1);

for (const control of ['data-catalogue-search', 'data-facet', 'data-reset-filters', 'data-empty-state', 'aria-live="polite"']) {
    assert.match(html, new RegExp(control));
}
assert.equal((html.match(/data-product-card/g) || []).length, catalogue.products.length,
    'every catalogue product needs a card on the products index');
assert.match(html, /<a[^>]+href="\/products\/pdf-toolkit\.html"/);
assert.match(html, /application\/ld\+json/);
assert.match(html, /"@type":"ItemList"/);
assert.doesNotMatch(html, /href="[^"]*[?&](?:problem|buyer|type|access)=/);
assert.match(script, /Object\.entries\(selected\)\.every/);
assert.match(script, /values\.some/);
assert.match(script, /card\.hidden/);

const curated = [
    'solutions/financial-validation/',
    'solutions/ai-visibility/',
    'for/developers-ai-builders/',
    'for/accountants-finance/',
    'products/apis/',
    'products/mcp-tools/'
];
for (const route of curated) {
    const routeHtml = read(...route.split('/').filter(Boolean), 'index.html');
    assert.match(routeHtml, new RegExp(`rel="canonical" href="https://howthtechnologyfactory\\.pro/${route.replaceAll('/', '\\/')}"`));
    assert.match(routeHtml, /aria-label="Breadcrumb"/);
    assert.match(routeHtml, /"@type":"BreadcrumbList"/);
    assert.match(sitemap, new RegExp(`https://howthtechnologyfactory\\.pro/${route.replaceAll('/', '\\/')}`));
    assert.match(llms, new RegExp(`https://howthtechnologyfactory\\.pro/${route.replaceAll('/', '\\/')}`));
}
assert.match(sitemap, /https:\/\/howthtechnologyfactory\.pro\/products\//);
assert.doesNotMatch(sitemap, /catalogue\.json/);
assert.match(llms, /products\/catalogue\.json/);

const allHtml = [
    'index.html', 'about.html', 'contact.html', 'privacy.html',
    'insights/index.html', 'insights/pdf-automation-boundaries.html',
    ...productFiles.map((file) => `products/${file}`)
].map((file) => read(...file.split('/')));
for (const page of allHtml) assert.doesNotMatch(page, /href="\/#products"/);

console.log('catalogue tests passed');
