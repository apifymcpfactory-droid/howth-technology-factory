// Emits the product grids on the homepage and the products index as STATIC HTML,
// generated from products/catalogue.json.
//
// Why a generator and not client-side rendering: the site is static with no build
// step, and the brand sells AI-search readiness. Cards injected by JavaScript may
// never be indexed, which would be self-defeating. So this writes real markup into
// the files and the markup is committed.
//
// Why a generator at all: the tenth product shipped with a card on the products index
// and none on the homepage, because the two grids were hand-edited separately.
// Adding a product is now one catalogue entry plus one run of this script.
//
// Run:  node scripts/build-product-grids.mjs [--check]
//       --check exits non-zero if the committed HTML is out of date.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderFeatured } from './featured-products.mjs';
import { prepareSearch } from './prepare-search.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const write = (p, s) => fs.writeFileSync(path.join(root, p), s);

const CHECK = process.argv.includes('--check');
const catalogue = JSON.parse(read('products/catalogue.json'));
const featured = JSON.parse(read('products/featured.json'));
const featuredBlock = /<!-- BEGIN featured products -->[\s\S]*?<!-- END featured products -->/;
function replaceFeatured(html,compact=false){
    const rendered=renderFeatured(featured,catalogue,compact);
    if(featuredBlock.test(html))return html.replace(featuredBlock,()=>rendered);
    const initial=compact?/<section class="catalogue-feature"[\s\S]*?<\/section>/:/<section class="product-spotlight"[\s\S]*?<\/section>/;
    if(!initial.test(html))throw Error('Featured product block not found.');
    return html.replace(initial,()=>rendered);
}

const problemLabel = Object.fromEntries(catalogue.taxonomy.problems.map((p) => [p.id, p.name]));
const accessLabel = Object.fromEntries(catalogue.taxonomy.access.map((p) => [p.id, p.name]));
const releaseLabels = { in_development: 'In development', preview: 'Preview' };
const releaseLabel = p => p.release_label ?? releaseLabels[p.release_status];

const esc = (s) => String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Each product's glyph is taken from its own page's hero, which is the one place it
 * is authored. Nothing is generated or invented here.
 */
function heroGlyph(id) {
    const html = read(`products/${id}.html`);
    const m = /<div class="w-16 h-16 rounded-\[16px\] overflow-hidden mb-6">([\s\S]*?)<\/div>/.exec(html);
    if (!m) throw new Error(`${id}: could not find the hero glyph on its product page`);
    return m[1].trim();
}

/** Search keywords are curated per product and live in the catalogue. */
function searchTerms(p) {
    if (p.searchTerms) return p.searchTerms;
    return [p.name, p.summary, ...p.problems, ...p.buyers, ...p.types].join(' ');
}
function productArtwork(p){
    const feature=featured.products.find(f=>f.id===p.id);
    const src=feature?.image||`/assets/previews/tools/${p.id}.svg`;
    const alt=feature?.imageAlt||`${p.name}: workflow illustration, not an application screenshot`;
    if(!fs.existsSync(path.join(root,src)))throw new Error(`${p.id}: product artwork missing`);
    return `<img class="tool-card-image" src="${esc(src)}" alt="${esc(alt)}" width="1200" height="675" loading="lazy" decoding="async">`;
}

// ---------------------------------------------------------------- homepage cards
function homepageCards() {
    return catalogue.products.map((p, i) => {
        const delay = (i % 3) * 80;
        return `<a href="products/${p.id}.html" data-aos="fade-up" data-aos-delay="${delay}"
   class="frame-hover group relative flex flex-col gap-5 rounded-2xl border border-borderc bg-surface p-7 hover:bg-surface2">
    <div class="tool-card-art">${productArtwork(p)}</div>
    <div class="flex-1">
        <h3 class="font-display font-semibold text-lg text-text mb-1.5">${esc(p.name)}</h3>
        <p class="text-sm text-muted leading-relaxed">${esc(p.summary)}</p>${releaseLabel(p) ? `\n        <p class="text-xs text-gold mt-3">${esc(releaseLabel(p))}</p>` : ''}
    </div>
    <div class="flex items-center gap-1.5 text-sm font-medium text-gold opacity-0 group-hover:opacity-100 transition-opacity">
        Learn more <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
    </div>
</a>`;
    }).join('\n');
}

// ---------------------------------------------------------------- index cards
function indexCards() {
    return catalogue.products.map((p) => {
        const eyebrow = problemLabel[p.problems[0]] ?? 'Tools';
        return `                        <article class="catalogue-card frame-hover bg-surface border border-borderc rounded-2xl p-6" data-product-card data-problems="${esc(p.problems.join(' '))}" data-buyers="${esc(p.buyers.join(' '))}" data-types="${esc(p.types.join(' '))}" data-access="${esc(p.access.join(' '))}" data-ai="${p.ai_agent_compatible ? 'yes' : 'no'}" data-search="${esc(searchTerms(p))}">
                            <a class="tool-card-art" href="/products/${p.id}.html" aria-label="Explore ${esc(p.name)}">${productArtwork(p)}</a><p class="text-xs text-gold uppercase tracking-wider">${esc(eyebrow)}</p><h3 class="font-display text-xl mt-2"><a class="hover:text-gold" href="/products/${p.id}.html">${esc(p.name)}</a></h3><p class="text-muted text-sm mt-3">${esc(p.summary)}</p><p class="text-xs text-faint mt-5">${esc(p.access.map((id) => accessLabel[id]).join(' · '))}${releaseLabel(p) ? ` · <span class="text-gold">${esc(releaseLabel(p))}</span>` : ''}</p>
                        </article>`;
    }).join('\n');
}

const BEGIN = '<!-- BEGIN generated by scripts/build-product-grids.mjs — edit products/catalogue.json, not this block -->';
const END = '<!-- END generated -->';

function replaceGrid(html, gridOpenRe, closeTag, cards, label) {
    // Idempotent: after the first run the markers exist and only their contents move.
    const marked = new RegExp(`(${BEGIN.replace(/[.*+?^${}()|[\]\\—]/g, '\\$&')})[\\s\\S]*?(${END})`);
    if (marked.test(html)) {
        return html.replace(marked, (_match, begin, end) => `${begin}\n${cards}\n${end}`);
    }
    const m = gridOpenRe.exec(html);
    if (!m) throw new Error(`${label}: grid container not found`);

    // Find the grid's OWN closing </div> by tracking depth. A naive lastIndexOf of
    // the card tag reaches into the footer's product links and swallows half the
    // page; cards contain nested divs, so depth counting is the only safe way.
    const contentStart = m.index + m[0].length;
    const tagRe = /<div\b[^>]*>|<\/div>/g;
    tagRe.lastIndex = contentStart;
    let depth = 1;
    let contentEnd = -1;
    let tag;
    while ((tag = tagRe.exec(html))) {
        depth += tag[0] === '</div>' ? -1 : 1;
        if (depth === 0) { contentEnd = tag.index; break; }
    }
    if (contentEnd < 0) throw new Error(`${label}: grid container is not closed`);

    const inner = html.slice(contentStart, contentEnd);
    if (!inner.includes(closeTag)) throw new Error(`${label}: no ${closeTag} cards inside the grid`);

    return html.slice(0, contentStart) + `\n${BEGIN}\n${cards}\n${END}\n            ` + html.slice(contentEnd);
}

const outputs = [];

// --- homepage ---
{
    let html = read('index.html');
    html = replaceGrid(html, /<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">/, '</a>', homepageCards(), 'index.html');
    html = replaceFeatured(html);
    outputs.push(['index.html', html]);
}

// --- products index ---
{
    let html = read('products/index.html');
    html = replaceGrid(html, /<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">/, '</article>', indexCards(), 'products/index.html');
    html = replaceFeatured(html,true);
    // The result counter is a LIVE filter readout, not a claim about the catalogue.
    // Generated so its initial value can never go stale.
    const n = catalogue.products.length;
    html = html.replace(/(<p data-result-count[^>]*>)[^<]*(<\/p>)/, `$1${n} tools$2`);
    html = html.replace(/(<script type="application\/ld\+json">)\s*({[\s\S]*?})(\s*<\/script>)/g, (block, open, json, close) => {
        const value = JSON.parse(json);
        if (value['@type'] !== 'ItemList') return block;
        return `${open}\n${JSON.stringify({ ...value, numberOfItems: n, itemListElement: catalogue.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: p.url, name: p.name })) })}\n    </script>`;
    });
    outputs.push(['products/index.html', html]);
}

// Keep Figma purchase wording tied to the recorded live release status.
for (const product of catalogue.products.filter(p => p.access?.includes('figma'))) {
    const file = new URL(product.url).pathname.slice(1);
    const html = read(file);
    const label = product.release_status === 'live' ? 'Buy on Figma' : 'View on Figma';
    outputs.push([file, html.replace(/(<a\b[^>]*href="https:\/\/www\.figma\.com\/community\/plugin\/[^"<>]+"[^>]*>)(?:View on Figma|Buy on Figma)(<\/a>)/g,
        (_, open, close) => open + label + close)]);
}

let stale = 0;
for (const [file, html] of outputs) {
    if (read(file) === html) { console.log(`  unchanged  ${file}`); continue; }
    stale++;
    if (CHECK) { console.log(`  STALE      ${file}`); continue; }
    write(file, html);
    console.log(`  written    ${file}`);
}

console.log(`${catalogue.products.length} products -> homepage grid + products index grid`);
if (CHECK && stale) {
    console.error(`\n${stale} file(s) out of date. Run: node scripts/build-product-grids.mjs`);
    process.exit(1);
}
if (!CHECK) prepareSearch();
