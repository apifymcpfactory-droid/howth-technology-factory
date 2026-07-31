import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Catalogue <-> page parity, in BOTH directions.
//
// The tenth product shipped with a card on the products index and none on the
// homepage, because the two grids were hand-maintained separately and nothing
// checked that they agreed. A product that ships but never appears on the site is
// invisible to buyers and to crawlers, so it fails the build here.
//
// Everything is derived from products/catalogue.json. No count is written down: a
// test that has to be edited every time a product ships is a chore, not a test.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...p) => fs.readFileSync(path.join(root, ...p), 'utf8');

const catalogue = JSON.parse(read('products', 'catalogue.json'));
const home = read('index.html');
const index = read('products', 'index.html');
const llms = read('llms.txt');
const sitemap = read('sitemap.xml');

const ids = catalogue.products.map((p) => p.id);
assert.ok(ids.length > 0, 'catalogue must not be empty');
assert.equal(new Set(ids).size, ids.length, 'catalogue ids must be unique');

// ---------------------------------------------------------------- forward
// Every catalogue entry must be visible everywhere a buyer or crawler looks.
for (const p of catalogue.products) {
    assert.match(home, new RegExp(`href="products/${p.id}\\.html"`),
        `${p.id}: missing a card on the homepage`);
    assert.match(index, new RegExp(`href="/products/${p.id}\\.html"`),
        `${p.id}: missing a card on the products index`);
    assert.ok(fs.existsSync(path.join(root, 'products', `${p.id}.html`)),
        `${p.id}: has no product page`);
    assert.ok(llms.includes(`/products/${p.id}.html`), `${p.id}: missing from llms.txt`);
    assert.ok(sitemap.includes(`/products/${p.id}.html`), `${p.id}: missing from sitemap.xml`);
}

// ---------------------------------------------------------------- reverse
// Every card must map back to a catalogue entry — no orphans left behind by a
// rename or a removal.
const known = new Set(ids);

for (const m of home.matchAll(/href="products\/([a-z0-9-]+)\.html"/g)) {
    assert.ok(known.has(m[1]), `homepage links to "${m[1]}", which is not in the catalogue`);
}
for (const m of index.matchAll(/href="\/products\/([a-z0-9-]+)\.html"/g)) {
    assert.ok(known.has(m[1]), `products index links to "${m[1]}", which is not in the catalogue`);
}
for (const file of fs.readdirSync(path.join(root, 'products'))) {
    if (!file.endsWith('.html') || file === 'index.html') continue;
    assert.ok(known.has(file.replace(/\.html$/, '')),
        `products/${file} exists but has no catalogue entry`);
}

// Card counts must match exactly, derived — never asserted against a literal.
assert.equal((home.match(/href="products\/[a-z0-9-]+\.html" data-aos/g) ?? []).length, ids.length,
    'homepage card count must equal the catalogue');
assert.equal((index.match(/data-product-card/g) ?? []).length, ids.length,
    'products index card count must equal the catalogue');

// ---------------------------------------------------------------- no written counts
// A number in visible copy is wrong the moment the catalogue changes, and it changes
// often. `data-result-count` is exempt: it is a live filter readout, it is generated
// from the catalogue, and the JS rewrites it as soon as a filter is touched.
const NUMBER_WORD = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d{1,3})[ -]+(focused\s+)?(tools|products)\b/i;

for (const file of ['index.html', 'products/index.html', 'about.html', 'llms.txt']) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    const text = read(file)
        .replace(/<script[\s\S]*?<\/script>/g, ' ')
        .replace(/<p data-result-count[^>]*>[^<]*<\/p>/g, ' ')
        .replace(/<[^>]+>/g, ' ');
    const hit = NUMBER_WORD.exec(text);
    assert.equal(hit, null, `${file}: visible copy states a product count ("${hit?.[0]}") — use number-free phrasing`);
}

// ---------------------------------------------------------------- generator is current
// The committed HTML must match what the generator would produce, so nobody can
// hand-edit a grid back out of sync.
execFileSync(process.execPath, [path.join(root, 'scripts', 'build-product-grids.mjs'), '--check'], { stdio: 'pipe' });

console.log(`catalogue parity: ${ids.length} products, both directions, generator current`);
