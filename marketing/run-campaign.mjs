#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER_PATH = path.join(ROOT, 'marketing', 'campaign-ledger.json');
const ANGLES_PATH = path.join(ROOT, 'marketing', 'angle-catalog.json');
const SITE_ORIGIN = 'https://howthtechnologyfactory.pro';

function fail(message) {
  console.error(`Campaign stopped: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const positional = argv.filter((value) => !value.startsWith('--'));
  return { productUrl: positional[0], offline: argv.includes('--offline'), dryRun: argv.includes('--dry-run') };
}

function assertProductUrl(value) {
  if (!value) fail('provide exactly one Howth Technology Factory product-page URL.');
  let url;
  try { url = new URL(value); } catch { fail('the input is not a valid URL.'); }
  if (url.origin !== SITE_ORIGIN || !/^\/products\/[a-z0-9-]+\.html$/.test(url.pathname)) {
    fail(`input must be a product page on ${SITE_ORIGIN}.`);
  }
  url.search = '';
  url.hash = '';
  return url;
}

function productFileFor(url) {
  const local = path.join(ROOT, url.pathname.replace(/^\//, ''));
  if (!fs.existsSync(local)) fail(`the product page is not present in this website checkout: ${url.pathname}`);
  return local;
}

function readMarketplaceLinks(html) {
  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
  const apify = [...new Set(hrefs.filter((href) => /^https:\/\/apify\.com\/apifmcpfactory\/[a-z0-9-]+\/?(?:\?|$)/.test(href)))];
  const mcpize = [...new Set(hrefs.filter((href) => /^https:\/\/mcpize\.com\/mcp\/[a-z0-9-]+\/?(?:\?|$)/.test(href)))];
  if (apify.length !== 1) fail(`expected one exact Apify listing; found ${apify.length}.`);
  if (mcpize.length !== 1) fail(`expected one exact MCPize listing; found ${mcpize.length}.`);
  return { apify: stripTracking(apify[0]), mcpize: stripTracking(mcpize[0]) };
}

function stripTracking(value) {
  const url = new URL(value);
  url.search = '';
  url.hash = '';
  return url.href.replace(/\/$/, '');
}

async function verifyLink(url, offline) {
  if (offline) return { url, verified: false, reason: 'offline_test_only' };
  let response;
  try {
    response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { Range: 'bytes=0-1024' } });
    }
  } catch (error) {
    fail(`could not verify ${url}: ${error.message}`);
  }
  if (!response.ok) fail(`${url} returned HTTP ${response.status}.`);
  const final = new URL(response.url);
  const expected = new URL(url);
  if (final.hostname !== expected.hostname) fail(`${url} redirected to an unexpected host: ${final.hostname}.`);
  return { url, verified: true, status: response.status, final_url: response.url, verified_at: new Date().toISOString() };
}

function pageFacts(html) {
  const title = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1];
  if (!title || !description) fail('the product page is missing a verifiable H1 or meta description.');
  return { title, description };
}

function slugFrom(url) { return path.basename(url.pathname, '.html'); }
function pad(value) { return String(value).padStart(2, '0'); }
function dateKey(date) { return `${date.getUTCFullYear()}${pad(date.getUTCMonth()+1)}${pad(date.getUTCDate())}`; }
function safeCampaignToken(value) { return value.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase(); }

function chooseUnusedAngle(ledger, slug, catalog) {
  const used = new Set(ledger.campaigns.filter((c) => c.product_slug === slug).map((c) => c.angle_key || c.angle_fingerprint?.split('|').at(-1)));
  const angle = catalog.find((candidate) => !used.has(candidate.key));
  if (!angle) fail(`no sufficiently distinct catalogued angle remains for ${slug}; review evidence and add a defensible angle before publishing.`);
  return angle;
}

function linksFor(base, campaignToken, platform, contentId) {
  const destinations = { website: base.product, apify: base.apify, mcpize: base.mcpize };
  return Object.fromEntries(Object.entries(destinations).map(([name, value]) => {
    const url = new URL(value);
    url.searchParams.set('utm_source', platform);
    url.searchParams.set('utm_medium', platform === 'website' ? 'insight' : 'organic');
    url.searchParams.set('utm_campaign', campaignToken);
    url.searchParams.set('utm_content', `${contentId.toLowerCase()}_${name}`);
    return [name, url.href];
  }));
}

function campaignPackage({ campaignId, campaignToken, product, facts, angle, links, createdAt }) {
  return `# Campaign ${campaignId}

Status: research and editorial review required before publication

## Verified product facts

- Product page: ${product.product}
- Apify: ${product.apify}
- MCPize: ${product.mcpize}
- Page title: ${facts.title}
- Page description: ${facts.description}

## Distinct campaign choice

- Persona: ${angle.persona}
- Problem: ${angle.problem}
- Search intent: ${angle.search_intent}
- Angle: ${angle.angle}
- Angle key: ${angle.key}

This key was checked against the complete local campaign ledger at ${createdAt}.

## Platform briefs

- Website Insight: search-focused explanation that teaches the decision framework; this is the canonical original.
- Medium: an accessible decision story centred on organisational trade-offs, not a rewrite of the Insight.
- Dev.to: a practical implementation note with inputs, outputs, failure examples and test cases.
- X: one concise observation plus a short checklist thread only if every item earns its place.
- Bluesky: developer discussion prompt focused on the technical lesson.
- Reddit: use only in a community where the question already fits; disclose the product connection.
- YouTube: demonstrate the problem, a failed contract and a corrected workflow; no promotional montage.
- LinkedIn: draft only; publication remains paused.
- Product Hunt / Hacker News: skip unless launch novelty and community fit are independently established.

## Tracked destinations

${Object.entries(links).map(([platform, destinations]) => `### ${platform}\n\n${Object.entries(destinations).map(([name, url]) => `- ${name}: ${url}`).join('\n')}`).join('\n\n')}

## Quality gate

Do not publish until research verifies claims, purchasers, alternatives and current discussion; every platform draft is independently written; all three destinations are present; imagery teaches; and the result passes the Marketing Constitution.
`;
}

async function main() {
  const { productUrl: input, offline, dryRun } = parseArgs(process.argv.slice(2));
  const productUrl = assertProductUrl(input);
  const html = fs.readFileSync(productFileFor(productUrl), 'utf8');
  const marketplace = readMarketplaceLinks(html);
  const facts = pageFacts(html);
  const verifications = await Promise.all([verifyLink(marketplace.apify, offline), verifyLink(marketplace.mcpize, offline)]);
  const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
  const catalog = JSON.parse(fs.readFileSync(ANGLES_PATH, 'utf8'));
  const slug = slugFrom(productUrl);
  const angle = chooseUnusedAngle(ledger, slug, catalog);
  const now = new Date();
  const sequence = ledger.campaigns.filter((c) => c.product_slug === slug).length + 1;
  const campaignId = `HTF-${dateKey(now)}-${slug.toUpperCase().replace(/-/g, '').slice(0, 8)}-${String(sequence).padStart(3, '0')}`;
  const campaignToken = `${dateKey(now)}_${safeCampaignToken(slug)}_${safeCampaignToken(angle.key)}`;
  const platforms = ['website','medium','devto','x','bluesky','reddit','youtube','linkedin'];
  const base = { product: productUrl.href, ...marketplace };
  const tracked = Object.fromEntries(platforms.map((platform, index) => {
    const contentId = `${platform.toUpperCase().slice(0,4)}-${dateKey(now)}-${String(index+1).padStart(3,'0')}`;
    return [platform, { content_id: contentId, links: linksFor(base, campaignToken, platform, contentId) }];
  }));
  const entry = {
    campaign_id: campaignId, product_slug: slug, product_url: productUrl.href, created_at: now.toISOString(),
    persona: angle.persona, problem: angle.problem, search_intent: angle.search_intent,
    angle: angle.angle, angle_key: angle.key, angle_fingerprint: `${angle.persona}|${angle.problem}|${angle.key}`,
    status: 'research_required', marketplace_verification: verifications,
    baseline: { captured_at: now.toISOString(), status: 'capture_connectors_before_publication', directly_attributed: {}, correlated: {}, unknown: [] },
    publications: Object.entries(tracked).map(([platform, item]) => ({ platform, content_id: item.content_id, status: platform === 'linkedin' ? 'paused_company_page_not_ready' : 'draft_required', tracked_links: item.links })),
    review_due: {
      '24h': new Date(now.getTime()+86400000).toISOString(), '48h': new Date(now.getTime()+172800000).toISOString(),
      '7d': new Date(now.getTime()+604800000).toISOString(), '30d': new Date(now.getTime()+2592000000).toISOString()
    }
  };
  console.log(JSON.stringify({ campaign_id: campaignId, angle: angle.angle, marketplace_verification: verifications }, null, 2));
  if (dryRun) return;
  const outputDir = path.join(ROOT, 'marketing', 'campaigns', campaignId);
  fs.mkdirSync(outputDir, { recursive: false });
  const trackedLinks = Object.fromEntries(Object.entries(tracked).map(([platform, item]) => [platform, item.links]));
  fs.writeFileSync(path.join(outputDir, 'campaign.md'), campaignPackage({ campaignId, campaignToken, product: base, facts, angle, links: trackedLinks, createdAt: now.toISOString() }));
  fs.writeFileSync(path.join(outputDir, 'manifest.json'), `${JSON.stringify(entry, null, 2)}\n`);
  ledger.campaigns.push(entry);
  fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`);
  console.log(`Created ${path.relative(ROOT, outputDir)} and recorded the angle in the ledger.`);
}

main().catch((error) => fail(error.stack || error.message));
