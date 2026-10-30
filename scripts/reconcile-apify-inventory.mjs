import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspace = path.resolve(root, '..');
const inventory = JSON.parse(fs.readFileSync(path.join(workspace, 'research', 'apify-canonical-existing-build-inventory-2026-10-30.json'), 'utf8'));
const cataloguePath = path.join(root, 'products', 'catalogue.json');
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8'));
const byName = new Map(inventory.actors.map((actor) => [actor.name, actor]));

const publicMissing = [
    'jobs-api-all-sources', 'accenture-jobs-api', 'walmart-jobs-api', 'ups-jobs-api',
    'wellsfargo-jobs-api', 'teleperformancebenelux-jobs-api', 'twilio-jobs-api',
    'wise-jobs-api', 'tripadvisor-jobs-api', 'taketwo-jobs-api', 'dropbox-jobs-api',
];
const existingPublic = inventory.actors.filter((actor) => actor.status === 'public').map((actor) => actor.name);
const prototypes = inventory.actors.filter((actor) => actor.status === 'private' && actor.classification === 'prototype_unverified');
const colors = ['#1D4ED8', '#0F766E', '#7C3AED', '#B45309', '#BE123C', '#0369A1', '#4F46E5', '#047857', '#9F1239', '#6D28D9', '#A16207', '#334155', '#0E7490'];

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cleanName = (value) => String(value).replace(/\s*—\s*/g, ': ');
const compactPurpose = (actor) => String(actor.purpose || actor.title)
    .replace(/^##[^\n]*\n+/, '').replace(/\n+## Use cases[\s\S]*$/, '').replace(/\s+/g, ' ').replace(/\s*—\s*/g, ': ').trim();
const summaryFor = (actor) => {
    const text = compactPurpose(actor);
    return text.length <= 210 ? text : `${text.slice(0, 207).replace(/\s+\S*$/, '')}...`;
};
const customerSummary = (actor) => {
    if (actor.name === 'jobs-api-all-sources') return 'Bring public vacancies from seven hiring platforms into one clean feed, so you can search, compare and monitor roles without maintaining a separate integration for each source.';
    const employer = cleanName(actor.title).replace(/\s+Jobs API(?:\s*\+\s*Report)?$/i, '').trim();
    return `Track ${employer} openings in one clean feed. Get useful job details and direct application links in a consistent format, so recruiting research and monitoring take less manual work.`;
};
const developmentSummary = (actor) => {
    const label = cleanName(actor.title).replace(/\s+Jobs API(?:\s*\+\s*Report)?$/i, '').trim();
    return `A private build intended to turn ${label} public vacancies into a clearer feed for search and monitoring. Current output quality has not been reverified.`;
};
const humanPrice = (actor) => {
    const primary = Object.values(actor.pricing?.events || {}).find((event) => event.primary);
    const unit = primary?.priceUsd;
    return unit === 0.0015 ? '$1.50 per 1,000 jobs returned' : unit ? `$${unit} per primary result` : 'See the current Apify listing';
};
const reviewRow = (actor) => actor.activityEvidence.actorReviewCount > 0
    ? { source: 'apify', sourceUrl: actor.publicUrl, rating: actor.activityEvidence.actorReviewRating, ratingCount: actor.activityEvidence.actorReviewCount, reviewCount: actor.activityEvidence.actorReviewCount, lastVerified: '2026-10-30', verificationStatus: 'verified_with_reviews' }
    : { source: 'apify', sourceUrl: actor.publicUrl, ratingCount: 0, reviewCount: 0, lastVerified: '2026-10-30', verificationStatus: 'verified_no_reviews' };
const glyph = (color) => `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><rect width="512" height="512" rx="120" fill="${color}"/><rect x="8" y="8" width="496" height="496" rx="112" fill="none" stroke="#FCD34D" stroke-width="16"/><rect x="30" y="30" width="452" height="452" rx="90" fill="none" stroke="#FCD34D" stroke-width="9"/><path d="M212 192V170c0-13 11-24 24-24h40c13 0 24 11 24 24v22" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round"/><rect x="140" y="192" width="232" height="180" rx="26" fill="#fff"/><rect x="184" y="248" width="144" height="18" rx="9" fill="${color}"/><rect x="184" y="288" width="96" height="18" rx="9" fill="${color}"/></svg>`;

function pageShell({ id, name, description, color, live, actor, body, schemaFeatures = [] }) {
    const url = `https://howthtechnologyfactory.pro/products/${id}.html`;
    const actorUrl = live ? actor.publicUrl : null;
    const pricing = live ? humanPrice(actor) : null;
    const cta = live
        ? `<a data-shopfront="apify" href="${actorUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-gold text-[#14140f] font-medium px-6 py-3.5 rounded-full hover:brightness-105 transition-all">Try it on Apify <i data-lucide="arrow-up-right" class="w-4 h-4"></i></a>`
        : `<span class="inline-flex items-center gap-2 border border-gold/30 text-gold font-medium px-6 py-3.5 rounded-full">In development</span>`;
    const offer = live ? `,"offers":{"@type":"Offer","price":${Object.values(actor.pricing.events).find((event) => event.primary)?.priceUsd ?? 0},"priceCurrency":"USD","url":"${actorUrl}","availability":"https://schema.org/InStock"}` : '';
    return `<!doctype html>
<html lang="en" class="scroll-smooth"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} | Howth Technology Factory</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}"><meta name="robots" content="index, follow">
<meta property="og:type" content="website"><meta property="og:site_name" content="Agentic Systems Studio | HTF"><meta property="og:title" content="${esc(name)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://howthtechnologyfactory.pro/assets/og/default.png">
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg"><link rel="alternate" type="text/plain" title="llms.txt" href="../llms.txt"><link rel="stylesheet" href="/assets/css/utilities.css"><link rel="stylesheet" href="../assets/css/main.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://howthtechnologyfactory.pro/' }, { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://howthtechnologyfactory.pro/products/' }, { '@type': 'ListItem', position: 3, name, item: url }] })}</script>
</head><body class="bg-bg text-text font-sans antialiased"><a href="#main" class="skip-link">Skip to content</a><div class="grain"></div>
<header data-site-header class="sticky top-0 z-50 header-blur border-b border-borderc"><div class="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between"><a href="/" class="font-display font-semibold text-text">Agentic Systems Studio <span class="text-muted font-normal">| HTF</span></a><nav class="hidden md:flex items-center gap-8"><a href="/products/" class="text-sm text-muted hover:text-text">Products</a><a href="../about.html" class="text-sm text-muted hover:text-text">About</a><a href="../contact.html" class="text-sm font-medium bg-gold text-[#14140f] px-4 py-2 rounded-full">Get in touch</a></nav><button data-nav-toggle aria-expanded="false" aria-label="Toggle menu" class="md:hidden p-2"><i data-lucide="menu"></i></button></div><div data-mobile-nav class="hidden md:hidden border-t border-borderc bg-bg/95"><a href="/products/" class="block px-6 py-3 text-muted">Products</a><a href="../about.html" class="block px-6 py-3 text-muted">About</a></div></header>
<main id="main"><div class="max-w-8xl mx-auto px-6 pt-5"><nav aria-label="Breadcrumb" class="text-sm text-muted"><a href="/">Home</a> / <a href="/products/">Products</a> / <span aria-current="page">${esc(name)}</span></nav></div>
<section class="relative overflow-hidden border-b border-borderc"><div class="mesh opacity-60"><span class="b1"></span><span class="b2"></span><span class="b3"></span></div><div class="relative z-10 max-w-8xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-14 items-center"><div><div class="w-16 h-16 rounded-[16px] overflow-hidden mb-6">${glyph(color)}</div><p class="text-xs font-semibold tracking-wide text-gold uppercase mb-3">${live ? 'Public Apify Actor' : 'Development inventory'}</p><h1 class="font-display font-medium tracking-tight text-3xl sm:text-4xl md:text-5xl leading-[1.12] mb-5">${esc(name)}</h1><p class="text-lg text-muted leading-relaxed mb-8 max-w-xl">${esc(description)}</p>${cta}${live ? `<p class="text-sm text-faint mt-5">${pricing}. Public listing verified 30 October 2026. No review rating is claimed.</p>` : ''}</div><div class="rounded-2xl border border-borderc bg-surface p-8"><p class="text-xs text-gold uppercase tracking-wider mb-4">Evidence status</p><h2 class="font-display text-2xl mb-4">${live ? 'Published, with validation still due' : 'Implemented source, not publicly released'}</h2><p class="text-muted leading-relaxed">${live ? 'A public Actor page and tagged build exist. This inventory pass did not start a new run or independently certify current output quality.' : 'Cloud source and a tagged build exist, but no current native test report or public listing was matched. It is shown here as development work, not as a finished product.'}</p></div></div></section>
${body}
</main><footer class="border-t border-borderc mt-24"><div class="max-w-8xl mx-auto px-6 py-10 text-sm text-faint flex flex-wrap justify-between gap-4"><span>© 2026 Howth Technology Factory.</span><a href="/products/" class="hover:text-text">View all products</a></div></footer><script src="https://unpkg.com/lucide@latest"></script><script src="../assets/js/main.js"></script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"${esc(name)}","description":"${esc(description)}","applicationCategory":"BusinessApplication","operatingSystem":"Web","url":"${url}","featureList":${JSON.stringify(schemaFeatures)},"provider":{"@id":"https://howthtechnologyfactory.pro/#organization"}${actorUrl ? `,"sameAs":["${actorUrl}"]` : ''}${offer}}</script>
</body></html>\n`;
}

function liveBody(actor) {
    return `<section class="max-w-8xl mx-auto px-6 py-20 grid lg:grid-cols-3 gap-12"><div><p class="text-xs text-gold uppercase tracking-wider mb-3">What it does</p><h2 class="font-display text-3xl">Spend less time checking careers pages.</h2></div><div class="lg:col-span-2 space-y-5 text-muted leading-relaxed"><p>${esc(customerSummary(actor))}</p><p>Each role is shaped into practical fields such as title, location, posting date and application link when the source publishes them. The consistent output is easier to filter, compare or pass into an automated workflow.</p><p>The Actor listing also describes change tracking, duplicate handling and report output. Those capabilities remain subject to current source availability and were not rerun during this website update.</p></div></section><section class="border-t border-borderc bg-surface/40"><div class="max-w-8xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12"><div><h2 class="font-display text-2xl mb-4">Affordable, flexible access</h2><p class="text-muted">Pay only for returned jobs at ${esc(humanPrice(actor))}. Open the Apify listing to check the current terms and start with the amount of data you need.</p></div><div><h2 class="font-display text-2xl mb-4">Honest limits</h2><p class="text-muted">Public job feeds change. Coverage depends on what the employer publishes, and missing fields stay empty. This is an unofficial tool and is not affiliated with the named employer.</p></div></div></section>`;
}

for (const [index, id] of publicMissing.entries()) {
    const actor = byName.get(id);
    if (!actor || actor.status !== 'public') throw new Error(`${id}: public Actor evidence missing`);
    const description = customerSummary(actor);
    const color = colors[index % colors.length];
    fs.writeFileSync(path.join(root, 'products', `${id}.html`), pageShell({ id, name: cleanName(actor.title), description, color, live: true, actor, body: liveBody(actor), schemaFeatures: ['Structured public job records', 'Deduplication and change tracking', 'API and MCP access through Apify'] }));
    fs.writeFileSync(path.join(root, 'assets', 'previews', 'tools', `${id}.svg`), glyph(color));
}

const sec = byName.get('sec-edgar-api');
const secDescription = 'Find US public-company filings, financial statements and important 8-K events in one structured result, so research starts with the regulator record instead of a manual filing search.';
const secBody = `<section class="max-w-8xl mx-auto px-6 py-20 grid lg:grid-cols-3 gap-12"><div><p class="text-xs text-gold uppercase tracking-wider mb-3">Implemented scope</p><h2 class="font-display text-3xl">Make SEC research easier to search and reuse.</h2></div><div class="lg:col-span-2 space-y-5 text-muted leading-relaxed"><p>${esc(secDescription)}</p><p>The private build is intended to accept a ticker, company name or CIK and return filings, normalized financial statements and plain-language 8-K event labels from public SEC data, with no separate API key.</p><p><strong class="text-text">Release blocker:</strong> the Actor remains private, its latest tagged build is from 1 August 2026, and no current native test report was matched. There is no Buy or listing link until publication is verified.</p></div></section>`;
fs.writeFileSync(path.join(root, 'products', 'sec-edgar-api.html'), pageShell({ id: 'sec-edgar-api', name: sec.title, description: secDescription, color: '#334155', live: false, actor: sec, body: secBody, schemaFeatures: ['SEC filing lookup', 'Normalized financial statements', '8-K event summaries'] }));
fs.writeFileSync(path.join(root, 'assets', 'previews', 'tools', 'sec-edgar-api.svg'), glyph('#334155'));

const prototypeRows = prototypes.map((actor) => `<article class="rounded-xl border border-borderc bg-surface p-5" data-development-item data-search="${esc(`${actor.name} ${cleanName(actor.title)} ${developmentSummary(actor)}`.toLowerCase())}"><div class="flex flex-wrap items-start justify-between gap-3"><div><h3 class="font-display text-lg">${esc(cleanName(actor.title))}</h3><p class="text-xs text-faint mt-1">${esc(actor.name)}</p></div><span class="text-xs text-gold border border-gold/30 rounded-full px-2.5 py-1">In development</span></div><p class="text-sm text-muted mt-4 leading-relaxed">${esc(developmentSummary(actor))}</p><p class="text-xs text-faint mt-4">Private Actor · tagged build ${esc(actor.buildEvidence.latestBuildNumber)} · no current native test report · no public listing</p></article>`).join('\n');
const familyBody = `<section class="max-w-8xl mx-auto px-6 py-20"><div class="max-w-3xl"><p class="text-xs text-gold uppercase tracking-wider mb-3">Development family</p><h2 class="font-display text-3xl mb-5">Named builds, grouped without pretending they are finished products.</h2><p class="text-muted leading-relaxed">These ${prototypes.length} private source-specific Actors have cloud source and tagged builds. Most have only one or two historical runs, no matched local source path and no current native acceptance report. They are recorded individually below for progress visibility, but intentionally share one page to avoid a catalogue full of near-identical thin landing pages.</p></div><div class="mt-10 max-w-xl"><label for="development-search" class="block text-sm font-medium mb-2">Filter development builds</label><input id="development-search" data-development-search type="search" placeholder="Search employer, platform or Actor name" class="w-full rounded-xl border border-borderc bg-surface px-4 py-3 text-text"><p class="text-sm text-faint mt-3" aria-live="polite" data-development-count>${prototypes.length} builds shown</p></div><div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10" data-development-list>${prototypeRows}</div></section><script>(function(){const input=document.querySelector('[data-development-search]');const rows=[...document.querySelectorAll('[data-development-item]')];const count=document.querySelector('[data-development-count]');input?.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();let shown=0;for(const row of rows){row.hidden=q&&!row.dataset.search.includes(q);if(!row.hidden)shown++;}count.textContent=shown+' builds shown';});})();</script>`;
fs.writeFileSync(path.join(root, 'products', 'apify-jobs-development.html'), pageShell({ id: 'apify-jobs-development', name: 'Jobs API Development Inventory | HTF', description: `${prototypes.length} evidenced private jobs-feed builds, individually named and honestly labelled In development.`, color: '#0E7490', live: false, actor: null, body: familyBody, schemaFeatures: ['Searchable development inventory', 'Individual build-status evidence', 'No public listing claims'] }));
fs.writeFileSync(path.join(root, 'assets', 'previews', 'tools', 'apify-jobs-development.svg'), glyph('#0E7490'));
fs.writeFileSync(path.join(root, 'products', 'apify-development-inventory.json'), JSON.stringify({ schemaVersion: '1.0', verifiedAt: '2026-10-30', status: 'in_development', count: prototypes.length, actors: prototypes.map((actor) => ({ id: actor.id, name: actor.name, title: cleanName(actor.title), summary: developmentSummary(actor), latestBuild: actor.buildEvidence.latestBuildNumber, latestBuildFinishedAt: actor.buildEvidence.latestBuildFinishedAt, blockers: ['Private/unpublished on Apify', 'No current native test report matched', 'No public listing or Buy link'] })) }, null, 2) + '\n');

const additions = publicMissing.map((id) => {
    const actor = byName.get(id);
    return { id, name: cleanName(actor.title), summary: customerSummary(actor), url: `https://howthtechnologyfactory.pro/products/${id}.html`, problems: ['hiring-market-intelligence'], buyers: ['developers-ai', 'recruiting-talent', 'operations-automation'], types: ['api', 'mcp', 'apify-actor'], access: ['web', 'api', 'mcp'], ai_agent_compatible: true, release_status: 'live', release_label: 'Live', reviews: [reviewRow(actor)], shopfronts: [{ id: 'apify', name: 'Apify', url: actor.publicUrl }], searchTerms: `${cleanName(actor.title)} jobs careers feed API MCP Apify structured data monitoring` };
});
additions.push({ id: 'sec-edgar-api', name: sec.title, summary: `In development. ${secDescription}`, url: 'https://howthtechnologyfactory.pro/products/sec-edgar-api.html', problems: ['financial-validation'], buyers: ['developers-ai', 'accountants-finance'], types: ['api', 'mcp', 'apify-actor'], access: ['future'], ai_agent_compatible: true, release_status: 'in_development', release_label: 'In development · Private', reviews: [], shopfronts: [], searchTerms: 'SEC EDGAR filings financial statements 8-K Form D API AI agent private development' });
additions.push({ id: 'apify-jobs-development', name: 'Jobs API Development Inventory | HTF', summary: `${prototypes.length} evidenced private source-specific jobs-feed builds, individually named and labelled In development with blockers.`, url: 'https://howthtechnologyfactory.pro/products/apify-jobs-development.html', problems: ['hiring-market-intelligence'], buyers: ['developers-ai', 'recruiting-talent'], types: ['api', 'apify-actor'], access: ['future'], ai_agent_compatible: false, release_status: 'in_development', release_label: 'In development · Private builds', reviews: [], shopfronts: [], searchTerms: `Apify jobs API development inventory private prototypes ${prototypes.map((actor) => actor.title).join(' ')}` });
const additionIds = new Set(additions.map((item) => item.id));
catalogue.products = catalogue.products.filter((product) => !additionIds.has(product.id));
catalogue.products.push(...additions);
catalogue.last_verified = '2026-10-30';

const publicSet = new Set(existingPublic);
for (const product of catalogue.products) {
    if (!publicSet.has(product.id)) continue;
    const actor = byName.get(product.id);
    product.reviews = [reviewRow(actor)];
}
fs.writeFileSync(cataloguePath, JSON.stringify(catalogue, null, 4) + '\n');

const cache = { schemaVersion: '1.1', lastVerified: '2026-10-30', displayRule: 'Only display a source when current authentic evidence reports one or more reviews. Missing sources are not represented as zero-review claims.', evidence: 'Authenticated read-only Apify Actor metadata fetched 2026-10-30. MCPize rows from July were removed because no current review evidence was available.', products: {} };
for (const id of existingPublic) {
    const actor = byName.get(id);
    cache.products[id] = [reviewRow(actor)];
}
fs.writeFileSync(path.join(root, 'marketing', 'review-cache.json'), JSON.stringify(cache, null, 4) + '\n');

const runtimeCounts = inventory.actors.reduce((acc, actor) => { const main = actor.buildEvidence.versions.flatMap((version) => version.mainSourceFiles || [])[0] || 'unknown'; acc[main.endsWith('.js') ? 'javascript' : main.endsWith('.ts') ? 'typescript' : main.endsWith('.py') ? 'python' : 'unknown']++; return acc; }, { javascript: 0, typescript: 0, python: 0, unknown: 0 });
fs.writeFileSync(path.join(root, 'marketing', 'apify-security-maintenance-plan.json'), JSON.stringify({ schemaVersion: '1.0', recordedAt: '2026-10-30', sourceNotice: 'Apify account email: Rebuild your Node.js Actors to apply security fixes', cutoff: '2026-10-21T19:00:00+02:00', inventoryEvidence: { actorCount: inventory.counts.total, latestBuildsBeforeCutoff: inventory.actors.filter((actor) => new Date(actor.buildEvidence.latestBuildFinishedAt) < new Date('2026-10-21T17:00:00Z')).length, mainEntrypoints: runtimeCounts }, conclusion: 'JavaScript entrypoints make the notice potentially relevant, but entrypoint language alone does not prove the affected base image or dependency state. No Actor is labelled unsafe from age alone.', followUp: ['Inspect Dockerfile/base image and package lock for each distinct source family.', 'Prioritize public Actors and deduplicate shared job-source implementations before any rebuild.', 'Run local tests and a no-charge validation where available before publishing a rebuilt tag.', 'Record build ID, runtime evidence, test result and rollback tag.'], actionsTaken: ['No Actor build or run was started.', 'No security status claim was added to public product copy.'] }, null, 2) + '\n');

const addedProducts = additions.map((product) => ({ id: product.id, name: product.name, url: product.url }));
let sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
for (const product of addedProducts) {
    if (!sitemap.includes(`<loc>${product.url}</loc>`)) sitemap = sitemap.replace('</urlset>', `  <url><loc>${product.url}</loc></url>\n</urlset>`);
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

let llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const marker = '\n## Apify inventory reconciliation\n';
llms = llms.includes(marker) ? llms.slice(0, llms.indexOf(marker)) : llms;
llms += `${marker}${addedProducts.map((product) => `- [${product.name}](${product.url})`).join('\n')}\n`;
fs.writeFileSync(path.join(root, 'llms.txt'), llms);

console.log(JSON.stringify({ catalogueProducts: catalogue.products.length, publicPagesAdded: publicMissing.length, developmentPagesAdded: 2, privatePrototypesGrouped: prototypes.length, currentApifyReviewRows: existingPublic.length }, null, 2));
